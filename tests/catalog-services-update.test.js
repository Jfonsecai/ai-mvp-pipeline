// US-011 (IF-036 updateService) request handling without a real database: authentication and role
// first, malformed ids and invalid bodies refused before any write, own-service-only (AC-030, AC-031).
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { createApp } from '../src/application.js';
import { createCatalogRouter } from '../src/modules/catalog/offerings.js';
import { API_SPEC_PATH, fakeSessionDb, fixedClock, read, startApp, testConfig } from './helpers.js';

const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
const INDEPENDENT_ID = '22222222-2222-4222-8222-222222222222';
const OWNER_ID = '33333333-3333-4333-8333-333333333333';
const OTHER_CLINIC_ID = '44444444-4444-4444-8444-444444444444';
const OWN_SERVICE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const OTHER_SERVICE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
const OWN_PRODUCT = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
const NOW = new Date('2026-10-12T12:00:00Z');
const session = (accountId, accountType) => ({
  account_id: accountId,
  account_type: accountType,
  last_seen_at: new Date('2026-10-12T11:55:00Z'),
  absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
  ended_at: null,
});

/** Stateful stand-in for the queries of the update route; it applies the ownership rule of the SQL itself. */
function makeDb() {
  const sessions = fakeSessionDb({
    clinic: session(CLINIC_ID, 'provider'),
    independent: session(INDEPENDENT_ID, 'provider'),
    owner: session(OWNER_ID, 'owner'),
  });
  const offerings = new Map([
    [OWN_SERVICE, { id: OWN_SERVICE, provider_id: CLINIC_ID, kind: 'service', name: 'Consulta', price_cop: 50000, species: 'dog', modality: 'clinic', removed_at: null }],
    [OTHER_SERVICE, { id: OTHER_SERVICE, provider_id: OTHER_CLINIC_ID, kind: 'service', name: 'Ajena', price_cop: 1000, species: 'cat', modality: 'home', removed_at: null }],
    [OWN_PRODUCT, { id: OWN_PRODUCT, provider_id: CLINIC_ID, kind: 'product', name: 'Alimento', price_cop: 9000, species: 'cat', modality: null, removed_at: null }],
  ]);
  const state = { queries: [], updates: [], transactions: [] };
  const run = async (text, params = []) => {
    state.queries.push(text.trim().split('\n')[0]);
    if (/FROM provider_profile WHERE provider_id = \$1$/.test(text.trim()) || /^\s*SELECT provider_type FROM provider_profile/.test(text)) {
      const type = params[0] === CLINIC_ID ? 'clinic' : params[0] === INDEPENDENT_ID ? 'independent' : null;
      return { rows: type ? [{ provider_type: type }] : [] };
    }
    if (/FOR UPDATE/.test(text)) return { rows: [{ provider_id: params[0] }] };
    if (/^\s*UPDATE offering/.test(text)) {
      const [id, providerId, name, price, species, modality] = params;
      const row = offerings.get(id);
      state.updates.push(params);
      if (!row || row.provider_id !== providerId || row.kind !== 'service' || row.removed_at) return { rows: [] };
      Object.assign(row, { name, price_cop: price, species, modality });
      return { rows: [{ ...row }] };
    }
    throw new Error(`Unexpected query: ${text}`);
  };
  return {
    state,
    offerings,
    async query(text, params) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) return sessions.query(text, params);
      return run(text, params);
    },
    async connect() {
      return {
        async query(text, params) {
          const sql = text.trim();
          if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') { state.transactions.push(sql); return { rows: [] }; }
          return run(text, params);
        },
        release() {},
      };
    },
  };
}

const running = [];
async function openApp(db = makeDb()) {
  const server = await startApp(createApp({ config: testConfig(), db, clock: fixedClock(NOW), modules: [{ createRouter: createCatalogRouter }] }));
  running.push(server);
  return { db, request: server.request };
}
after(async () => Promise.all(running.map((server) => server.close())));

const headers = (cookie) => ({ cookie: `vetcare_session=${cookie}`, origin: 'https://vetcare.test', 'content-type': 'application/json' });
const put = (request, cookie, id, body) => request(`/api/provider/services/${id}`, { method: 'PUT', headers: headers(cookie), body: typeof body === 'string' ? body : JSON.stringify(body) });
const valid = { name: ' Consulta nueva ', priceCop: 65000, species: 'cat', modality: 'both' };

test('AC-030: the provider replaces the details of its own service; values are trimmed and the response is a CatalogService', async () => {
  const { request, db } = await openApp();
  const response = await put(request, 'clinic', OWN_SERVICE, valid);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: OWN_SERVICE, kind: 'service', name: 'Consulta nueva', priceCop: 65000, species: 'cat', modality: 'both' });
  assert.deepEqual(db.state.updates[0], [OWN_SERVICE, CLINIC_ID, 'Consulta nueva', 65000, 'cat', 'both']);
  assert.deepEqual(db.state.transactions, ['BEGIN', 'COMMIT'], 'one transaction');
  const spec = parse(read(API_SPEC_PATH)).components.schemas.CatalogService;
  assert.deepEqual(Object.keys(await (await put(request, 'clinic', OWN_SERVICE, valid)).json()).sort(), Object.keys(spec.properties).sort());
});

test('the id is lower-cased and the owner of the session, never a body field, decides whose service is changed', async () => {
  const { request, db } = await openApp();
  const response = await put(request, 'clinic', OWN_SERVICE.toUpperCase(), valid);
  assert.equal(response.status, 200);
  assert.equal(db.state.updates[0][0], OWN_SERVICE);
  assert.equal(db.state.updates[0][1], CLINIC_ID);
});

test('AC-031: another provider\'s service, a product, a removed or unknown offering are one NOT_FOUND and nothing changes', async () => {
  const { request, db } = await openApp();
  db.offerings.get(OWN_PRODUCT).name = 'Alimento';
  const removed = db.offerings.get(OWN_SERVICE); // the own service, but removed
  for (const [cookie, id] of [['clinic', OTHER_SERVICE], ['clinic', OWN_PRODUCT], ['clinic', 'ffffffff-ffff-4fff-8fff-ffffffffffff'], ['independent', OWN_SERVICE]]) {
    const response = await put(request, cookie, id, { ...valid, ...(cookie === 'independent' ? { modality: undefined } : {}) });
    assert.equal(response.status, 404, `${cookie} ${id}`);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  removed.removed_at = NOW;
  assert.equal((await put(request, 'clinic', OWN_SERVICE, valid)).status, 404, 'a removed service is not editable');
  assert.equal(db.offerings.get(OTHER_SERVICE).name, 'Ajena');
  assert.equal(db.offerings.get(OWN_PRODUCT).name, 'Alimento');
  assert.equal(removed.name, 'Consulta');
});

test('role and session: anonymous 401, owner 404; malformed ids 404 without any query', async () => {
  const { request, db } = await openApp();
  const anonymous = await request(`/api/provider/services/${OWN_SERVICE}`, { method: 'PUT', headers: { origin: 'https://vetcare.test', 'content-type': 'application/json' }, body: JSON.stringify(valid) });
  assert.equal(anonymous.status, 401);
  assert.equal((await put(request, 'owner', OWN_SERVICE, valid)).status, 404);
  assert.deepEqual(db.state.queries, []);
  for (const id of ['abc', '1', "x'; DROP TABLE offering;--", '%00', OWN_SERVICE.replaceAll('-', ''), `${OWN_SERVICE}x`]) {
    const response = await put(request, 'clinic', encodeURIComponent(id), valid);
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  assert.deepEqual(db.state.queries, [], 'no query for a malformed id');
});

test('BR-006 / BR-007: invalid bodies are 422 with field reasons and write nothing', async () => {
  const { request, db } = await openApp();
  const reasons = async (cookie, body) => {
    const response = await put(request, cookie, OWN_SERVICE, body);
    assert.equal(response.status, 422, JSON.stringify(body));
    return (await response.json()).fields.map(({ field, reason }) => `${field}:${reason}`);
  };
  assert.deepEqual(await reasons('clinic', {}), ['name:REQUIRED', 'priceCop:REQUIRED', 'species:REQUIRED', 'modality:REQUIRED']);
  assert.deepEqual(await reasons('clinic', { ...valid, name: '   ' }), ['name:REQUIRED']);
  assert.deepEqual(await reasons('clinic', { ...valid, name: 'x'.repeat(121) }), ['name:TOO_LONG']);
  assert.deepEqual(await reasons('clinic', { ...valid, priceCop: 0 }), ['priceCop:OUT_OF_RANGE']);
  assert.deepEqual(await reasons('clinic', { ...valid, priceCop: 10.5 }), ['priceCop:INVALID_FORMAT']);
  assert.deepEqual(await reasons('clinic', { ...valid, species: 'bird' }), ['species:NOT_ALLOWED']);
  assert.deepEqual(await reasons('clinic', { ...valid, species: ['dog', 'cat'] }), ['species:NOT_ALLOWED']);
  assert.deepEqual(await reasons('clinic', { ...valid, modality: 'remote' }), ['modality:NOT_ALLOWED']);
  assert.deepEqual(await reasons('independent', { ...valid, modality: 'clinic' }), ['modality:NOT_ALLOWED']);
  assert.deepEqual(await reasons('independent', { ...valid, modality: 'both' }), ['modality:NOT_ALLOWED']);
  assert.deepEqual(await reasons('clinic', { ...valid, available: true, kind: 'product', providerId: CLINIC_ID, id: OWN_SERVICE }), ['available:NOT_ALLOWED', 'kind:NOT_ALLOWED', 'providerId:NOT_ALLOWED', 'id:NOT_ALLOWED']);
  assert.deepEqual(await reasons('clinic', []), ['form:REQUIRED']);
  assert.equal((await put(request, 'clinic', OWN_SERVICE, '{bad')).status, 422);
  assert.deepEqual(db.state.updates, [], 'nothing was written');
});

test('BR-007: an independent veterinarian\'s service stays at home, with or without the modality field', async () => {
  const { request, db } = await openApp();
  db.offerings.set(OWN_SERVICE, { ...db.offerings.get(OWN_SERVICE), provider_id: INDEPENDENT_ID, modality: 'home' });
  const omitted = await put(request, 'independent', OWN_SERVICE, { name: 'Visita', priceCop: 40000, species: 'cat' });
  assert.equal(omitted.status, 200);
  assert.equal((await omitted.json()).modality, 'home');
  const explicit = await put(request, 'independent', OWN_SERVICE, { name: 'Visita', priceCop: 40000, species: 'cat', modality: 'home' });
  assert.equal(explicit.status, 200);
});

test('Origin and JSON are enforced like every state-changing request', async () => {
  const { request, db } = await openApp();
  const foreign = await request(`/api/provider/services/${OWN_SERVICE}`, { method: 'PUT', headers: { ...headers('clinic'), origin: 'https://evil.test' }, body: JSON.stringify(valid) });
  assert.equal(foreign.status, 403);
  const text = await request(`/api/provider/services/${OWN_SERVICE}`, { method: 'PUT', headers: { ...headers('clinic'), 'content-type': 'text/plain' }, body: JSON.stringify(valid) });
  assert.equal(text.status, 403);
  assert.deepEqual(db.state.updates, []);
});

test('contract: the operation, its schemas and the NOT_FOUND / VALIDATION_FAILED responses match API_SPEC V2', () => {
  const spec = parse(read(API_SPEC_PATH));
  const operation = spec.paths['/api/provider/services/{offeringId}'].put;
  assert.equal(operation.operationId, 'updateService');
  assert.equal(operation['x-vetcare-interface'], 'IF-036');
  assert.equal(operation.requestBody.content['application/json'].schema.$ref, '#/components/schemas/PublishServiceRequest');
  for (const status of ['200', '401', '403', '404', '422']) assert.ok(operation.responses[status], status);
});
