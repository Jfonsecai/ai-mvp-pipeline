// US-008 (IF-004): AC-023, AC-024, AC-106; BR-025, BR-026, BR-038; EDGE-017, EDGE-027.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { createApp } from '../src/application.js';
import {
  createProviderProfileRouter,
  requireAddressForClinic,
  validateProviderProfileUpdate,
} from '../src/modules/provider/profile.js';
import { API_SPEC_PATH, fakeSessionDb, fixedClock, read, startApp, testConfig } from './helpers.js';

const CLINIC_ID = '33333333-3333-4333-8333-333333333333';
const INDEPENDENT_ID = '55555555-5555-4555-8555-555555555555';
const OWNER_ID = '44444444-4444-4444-8444-444444444444';
const NOW = new Date('2026-10-12T12:00:00Z');
const session = (accountId, accountType) => ({
  account_id: accountId,
  account_type: accountType,
  last_seen_at: new Date('2026-10-12T11:55:00Z'),
  absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
  ended_at: null,
});

/** Stateful stand-in for the provider_profile queries of the module. */
function makeDb() {
  const sessions = fakeSessionDb({
    clinic: session(CLINIC_ID, 'provider'),
    independent: session(INDEPENDENT_ID, 'provider'),
    owner: session(OWNER_ID, 'owner'),
  });
  const profiles = new Map([
    [CLINIC_ID, { provider_type: 'clinic', public_name: 'Clínica Norte', contact_phone: null, contact_email: 'norte@example.test', address: 'Calle 1 # 2-3' }],
    [INDEPENDENT_ID, { provider_type: 'independent', public_name: 'Dra. Ruiz', contact_phone: null, contact_email: 'ruiz@example.test', address: null }],
  ]);
  const state = { updates: [], profiles };
  return {
    state,
    async query(text, params = []) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) {
        return sessions.query(text, params);
      }
      const row = profiles.get(params[0]);
      if (/^\s*SELECT provider_type, public_name/.test(text)) return { rows: row ? [row] : [] };
      if (/^\s*SELECT provider_type FROM provider_profile/.test(text)) return { rows: row ? [{ provider_type: row.provider_type }] : [] };
      if (/^\s*UPDATE provider_profile/.test(text)) {
        if (!row) return { rows: [] };
        const [, publicName, phone, email, address, updatedAt] = params;
        state.updates.push(params);
        Object.assign(row, { public_name: publicName, contact_phone: phone, contact_email: email, address, updatedAt });
        return { rows: [{ ...row }] };
      }
      throw new Error(`Unexpected query in test: ${text}`);
    },
    async ping() {},
  };
}

const running = [];
async function openApp(db = makeDb()) {
  const server = await startApp(createApp({
    config: testConfig(),
    db,
    clock: fixedClock(NOW),
    modules: [{ createRouter: createProviderProfileRouter }],
  }));
  running.push(server);
  return { db, request: server.request };
}
after(async () => Promise.all(running.map((server) => server.close())));

const headers = (cookie) => ({ cookie: `vetcare_session=${cookie}`, origin: 'https://vetcare.test', 'content-type': 'application/json' });
const put = (request, cookie, body) => request('/api/provider/profile', { method: 'PUT', headers: headers(cookie), body: JSON.stringify(body) });
const full = { publicName: 'Clínica Norte', contactPhone: '+57 300 123 4567', contactEmail: 'contacto@example.test', address: 'Carrera 7 # 10-20' };

test('validator trims text, accepts a complete profile and maps a blank address to null', () => {
  assert.deepEqual(validateProviderProfileUpdate({ ...full, publicName: '  Clínica Norte  ', contactPhone: ' 3001234567 ' }), {
    value: { publicName: 'Clínica Norte', contactPhone: '3001234567', contactEmail: 'contacto@example.test', address: 'Carrera 7 # 10-20' },
  });
  for (const address of [undefined, null, '', '   ']) {
    const { address: _omit, ...rest } = full;
    const result = validateProviderProfileUpdate(address === undefined ? rest : { ...rest, address });
    assert.equal(result.value.address, null, `address ${JSON.stringify(address)}`);
  }
});

test('validator reports required, format, length and unknown-field reasons per field (BR-038)', () => {
  const reasons = (input) => validateProviderProfileUpdate(input).fields.map(({ field, reason }) => `${field}:${reason}`);
  assert.deepEqual(reasons({}), ['publicName:REQUIRED', 'contactPhone:REQUIRED', 'contactEmail:REQUIRED']);
  assert.deepEqual(reasons({ ...full, publicName: '   ' }), ['publicName:REQUIRED']);
  assert.deepEqual(reasons({ ...full, publicName: 'x'.repeat(121) }), ['publicName:TOO_LONG']);
  assert.deepEqual(reasons({ ...full, contactPhone: '300-123' }), ['contactPhone:INVALID_FORMAT']);
  assert.deepEqual(reasons({ ...full, contactPhone: '+ +' }), ['contactPhone:INVALID_FORMAT']);
  assert.deepEqual(reasons({ ...full, contactPhone: '1'.repeat(31) }), ['contactPhone:TOO_LONG']);
  assert.deepEqual(reasons({ ...full, contactPhone: 3001234567 }), ['contactPhone:INVALID_FORMAT']);
  assert.deepEqual(reasons({ ...full, contactEmail: 'not-an-email' }), ['contactEmail:INVALID_FORMAT']);
  assert.deepEqual(reasons({ ...full, address: 'x'.repeat(301) }), ['address:TOO_LONG']);
  assert.deepEqual(reasons({ ...full, address: 12 }), ['address:INVALID_FORMAT']);
  assert.deepEqual(reasons({ ...full, providerType: 'independent' }), ['providerType:NOT_ALLOWED']);
  assert.deepEqual(reasons([]), ['form:REQUIRED']);
});

test('only a clinic requires an address (BR-026, EDGE-017)', () => {
  assert.throws(() => requireAddressForClinic('clinic', null), (error) => error.code === 'VALIDATION_FAILED'
    && error.fields[0].field === 'address' && error.fields[0].reason === 'REQUIRED');
  assert.doesNotThrow(() => requireAddressForClinic('clinic', 'Calle 1'));
  assert.doesNotThrow(() => requireAddressForClinic('independent', null));
});

test('GET returns the signed-in provider profile shape of CTR-004 with profileCompleted false until a phone is saved', async () => {
  const { request } = await openApp();
  const response = await request('/api/provider/profile', { headers: { cookie: 'vetcare_session=clinic' } });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body, {
    providerType: 'clinic',
    publicName: 'Clínica Norte',
    contactPhone: null,
    contactEmail: 'norte@example.test',
    address: 'Calle 1 # 2-3',
    profileCompleted: false,
  });
  const schema = parse(read(API_SPEC_PATH)).components.schemas.OwnProviderProfile;
  assert.deepEqual(Object.keys(body).sort(), Object.keys(schema.properties).sort());
  assert.deepEqual([...schema.required].sort(), Object.keys(schema.properties).sort());
});

test('AC-023: a provider saves name, phone, email and address and the profile shows them', async () => {
  const { request, db } = await openApp();
  const saved = await put(request, 'clinic', full);
  assert.equal(saved.status, 200);
  const expected = { providerType: 'clinic', ...full, profileCompleted: true };
  assert.deepEqual(await saved.json(), expected);
  assert.equal(db.state.updates.length, 1);
  assert.equal(db.state.updates[0][5].toISOString(), NOW.toISOString());

  const reread = await request('/api/provider/profile', { headers: { cookie: 'vetcare_session=clinic' } });
  assert.deepEqual(await reread.json(), expected);
});

test('AC-024: an independent veterinarian saves without an address and the profile has none', async () => {
  const { request } = await openApp();
  const { address: _omit, ...withoutAddress } = full;
  for (const body of [withoutAddress, { ...withoutAddress, address: null }, { ...withoutAddress, address: '  ' }]) {
    const saved = await put(request, 'independent', body);
    assert.equal(saved.status, 200);
    assert.deepEqual(await saved.json(), { providerType: 'independent', ...withoutAddress, address: null, profileCompleted: true });
  }
  const withAddress = await put(request, 'independent', full);
  assert.equal((await withAddress.json()).address, 'Carrera 7 # 10-20');
});

test('AC-106 / EDGE-027: a clinic cannot remove its address; nothing is saved; it can change it', async () => {
  const { request, db } = await openApp();
  const { address: _omit, ...withoutAddress } = full;
  for (const body of [withoutAddress, { ...withoutAddress, address: null }, { ...withoutAddress, address: '   ' }]) {
    const rejected = await put(request, 'clinic', body);
    assert.equal(rejected.status, 422);
    assert.deepEqual(await rejected.json(), { code: 'VALIDATION_FAILED', fields: [{ field: 'address', reason: 'REQUIRED' }] });
  }
  assert.equal(db.state.updates.length, 0);
  assert.equal(db.state.profiles.get(CLINIC_ID).address, 'Calle 1 # 2-3');

  const changed = await put(request, 'clinic', { ...full, address: 'Avenida 80 # 5-5' });
  assert.equal(changed.status, 200);
  assert.equal((await changed.json()).address, 'Avenida 80 # 5-5');
});

test('invalid input is rejected with field reasons before any write', async () => {
  const { request, db } = await openApp();
  const rejected = await put(request, 'clinic', { ...full, contactPhone: 'abc', contactEmail: 'x' });
  assert.equal(rejected.status, 422);
  assert.deepEqual((await rejected.json()).fields, [
    { field: 'contactPhone', reason: 'INVALID_FORMAT' },
    { field: 'contactEmail', reason: 'INVALID_FORMAT' },
  ]);
  assert.equal(db.state.updates.length, 0);
});

test('BR-025: access is own-profile and provider-only; the provider type cannot be changed', async () => {
  const { request, db } = await openApp();
  const anonymous = await request('/api/provider/profile');
  assert.equal(anonymous.status, 401);
  assert.deepEqual(await anonymous.json(), { code: 'UNAUTHENTICATED' });

  const owner = await request('/api/provider/profile', { headers: { cookie: 'vetcare_session=owner' } });
  assert.equal(owner.status, 404);
  const ownerPut = await put(request, 'owner', full);
  assert.equal(ownerPut.status, 404);

  const typeChange = await put(request, 'independent', { ...full, providerType: 'clinic' });
  assert.equal(typeChange.status, 422);
  assert.deepEqual((await typeChange.json()).fields, [{ field: 'providerType', reason: 'NOT_ALLOWED' }]);
  assert.equal(db.state.updates.length, 0);

  const foreignOrigin = await request('/api/provider/profile', {
    method: 'PUT',
    headers: { ...headers('clinic'), origin: 'https://evil.test' },
    body: JSON.stringify(full),
  });
  assert.equal(foreignOrigin.status, 403);
});

test('a provider without a profile row gets NOT_FOUND', async () => {
  const db = makeDb();
  db.state.profiles.delete(CLINIC_ID);
  const { request } = await openApp(db);
  const response = await request('/api/provider/profile', { headers: { cookie: 'vetcare_session=clinic' } });
  assert.equal(response.status, 404);
  assert.equal((await put(request, 'clinic', full)).status, 404);
});
