// US-019 request handling without a database: authentication and role come first, malformed input is
// refused before any query runs (IF-009, IF-010, IF-011).
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { createApp } from '../src/app.js';
import { createBookingRouter, validateBookingRequest } from '../src/modules/scheduling/booking.js';
import { createPetsRouter } from '../src/modules/pets/owner-pet.js';
import { API_SPEC_PATH, fakeSessionDb, fixedClock, read, startApp, testConfig } from './helpers.js';

const OWNER_ID = '33333333-3333-4333-8333-333333333333';
const PROVIDER_ID = '11111111-1111-4111-8111-111111111111';
const SERVICE_ID = '22222222-2222-4222-8222-222222222222';
const session = (accountId, accountType) => ({
  account_id: accountId,
  account_type: accountType,
  last_seen_at: new Date('2026-10-12T14:25:00Z'),
  absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
  ended_at: null,
});

function makeDb() {
  const sessions = fakeSessionDb({ owner: session(OWNER_ID, 'owner'), provider: session(PROVIDER_ID, 'provider') });
  const queries = [];
  return {
    queries,
    async query(text, params = []) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) return sessions.query(text, params);
      queries.push(text);
      return { rows: [] }; // every business lookup finds nothing
    },
    async connect() { throw new Error('no transaction expected in these tests'); },
  };
}

const running = [];
async function openApp() {
  const db = makeDb();
  const server = await startApp(createApp({
    config: testConfig(),
    db,
    clock: fixedClock(new Date('2026-10-12T14:30:00Z')),
    modules: [{ createRouter: createBookingRouter }, { createRouter: createPetsRouter }],
  }));
  running.push(server);
  return { db, request: server.request };
}
after(async () => Promise.all(running.map((server) => server.close())));

const headers = (cookie) => ({ cookie: `vetcare_session=${cookie}`, origin: 'https://vetcare.test', 'content-type': 'application/json' });
const valid = { serviceId: SERVICE_ID, petId: PROVIDER_ID, startsAt: '2026-10-12T11:00:00-05:00' };
const post = (request, cookie, body) => request('/api/owner/appointments', { method: 'POST', headers: headers(cookie), body: typeof body === 'string' ? body : JSON.stringify(body) });

test('the three booking operations need a session and the owner role (401 / 404), before anything else', async () => {
  const { request, db } = await openApp();
  for (const [method, path] of [['GET', '/api/owner/pets'], ['GET', `/api/services/${SERVICE_ID}/booking-context`], ['POST', '/api/owner/appointments']]) {
    const anonymous = await request(path, { method, headers: { origin: 'https://vetcare.test', 'content-type': 'application/json' }, ...(method === 'POST' ? { body: JSON.stringify(valid) } : {}) });
    assert.equal(anonymous.status, 401, `${method} ${path}`);
    const provider = await request(path, { method, headers: headers('provider'), ...(method === 'POST' ? { body: JSON.stringify(valid) } : {}) });
    assert.equal(provider.status, 404, `${method} ${path}`);
    assert.deepEqual(await provider.json(), { code: 'NOT_FOUND' });
  }
  assert.deepEqual(db.queries, []);
});

test('malformed service ids and weekStart values are refused without touching the database', async () => {
  const { request, db } = await openApp();
  for (const id of ['abc', '1', "x'--", '%00', SERVICE_ID.replaceAll('-', ''), `${SERVICE_ID}x`]) {
    const response = await request(`/api/services/${encodeURIComponent(id)}/booking-context`, { headers: headers('owner') });
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  for (const [query, reason] of [['weekStart=bad', 'INVALID_FORMAT'], ['weekStart=2026-10-14', 'NOT_ALLOWED'], ['weekStart=2026-10-12&weekStart=2026-10-19', 'INVALID_FORMAT'], ['weekStart=', 'INVALID_FORMAT']]) {
    const response = await request(`/api/services/${SERVICE_ID}/booking-context?${query}`, { headers: headers('owner') });
    assert.equal(response.status, 422, query);
    assert.deepEqual((await response.json()).fields, [{ field: 'weekStart', reason }], query);
  }
  assert.deepEqual(db.queries, []);
});

test('invalid booking requests are refused with field reasons before any query; Origin and JSON are enforced', async () => {
  const { request, db } = await openApp();
  const cases = [
    [{}, ['serviceId:REQUIRED', 'petId:REQUIRED', 'startsAt:REQUIRED']],
    [{ ...valid, startsAt: '2026-10-12T11:30:00-05:00' }, ['startsAt:NOT_ON_THE_HOUR']],
    [{ ...valid, startsAt: '2026-02-30T11:00:00-05:00' }, ['startsAt:INVALID_FORMAT']],
    [{ ...valid, petId: 'x' }, ['petId:INVALID_FORMAT']],
    [{ ...valid, ownerId: OWNER_ID }, ['ownerId:NOT_ALLOWED']],
  ];
  for (const [body, expected] of cases) {
    const response = await post(request, 'owner', body);
    assert.equal(response.status, 422, JSON.stringify(body));
    assert.deepEqual((await response.json()).fields.map(({ field, reason }) => `${field}:${reason}`), expected);
  }
  assert.equal((await post(request, 'owner', '{bad')).status, 422);
  assert.equal((await post(request, 'owner', 'null')).status, 422);
  const foreign = await request('/api/owner/appointments', { method: 'POST', headers: { ...headers('owner'), origin: 'https://evil.test' }, body: JSON.stringify(valid) });
  assert.equal(foreign.status, 403);
  const text = await request('/api/owner/appointments', { method: 'POST', headers: { ...headers('owner'), 'content-type': 'text/plain' }, body: JSON.stringify(valid) });
  assert.equal(text.status, 403);
  assert.deepEqual(db.queries, []);
});

test('home visit address input is trimmed and validated against the Address contract', () => {
  assert.equal(validateBookingRequest({ ...valid, visitAddress: '  Calle 1 # 2-3  ' }).value.visitAddress, 'Calle 1 # 2-3');
  assert.deepEqual(validateBookingRequest({ ...valid, visitAddress: '   ' }).fields, [
    { field: 'visitAddress', reason: 'REQUIRED' },
  ]);
  assert.deepEqual(validateBookingRequest({ ...valid, visitAddress: 123 }).fields, [
    { field: 'visitAddress', reason: 'INVALID_FORMAT' },
  ]);
  assert.deepEqual(validateBookingRequest({ ...valid, visitAddress: 'a'.repeat(301) }).fields, [
    { field: 'visitAddress', reason: 'TOO_LONG' },
  ]);
});

test('a well-formed request for an unknown service is NOT_FOUND', async () => {
  const { request } = await openApp();
  const response = await post(request, 'owner', valid);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
});

test('contract: the operations, parameters and request fields match API_SPEC', () => {
  const spec = parse(read(API_SPEC_PATH));
  assert.ok(spec.paths['/api/owner/pets'].get);
  const context = spec.paths['/api/services/{serviceId}/booking-context'].get;
  assert.deepEqual(context.parameters.map(({ name }) => name), ['serviceId', 'weekStart']);
  assert.ok(spec.paths['/api/owner/appointments'].post);
  const request = spec.components.schemas.BookAppointmentRequest;
  assert.deepEqual(Object.keys(request.properties).sort(), ['modality', 'petId', 'serviceId', 'startsAt', 'visitAddress']);
  assert.deepEqual(request.required, ['serviceId', 'petId', 'startsAt']);
  assert.deepEqual(Object.keys(spec.components.schemas.OwnerAppointment.properties).sort(),
    ['endsAt', 'id', 'modality', 'pet', 'place', 'provider', 'service', 'startsAt', 'status', 'upcoming']);
  assert.deepEqual(Object.keys(spec.components.schemas.BookingContext.properties).sort(),
    ['days', 'eligiblePetIds', 'now', 'ownerHasPets', 'providerHasHours', 'service', 'weekStart']);
});
