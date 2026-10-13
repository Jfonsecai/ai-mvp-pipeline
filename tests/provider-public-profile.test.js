// US-018 (IF-008 getPublicProviderProfile): AC-044, AC-045; BR-026, BR-027, BR-038; DEP-001, DEP-005.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { createApp } from '../src/application.js';
import { createPublicProviderProfileRouter } from '../src/modules/search/provider-profile.js';
import { getProviderFacts } from '../src/modules/provider/profile.js';
import { API_SPEC_PATH, fakeSessionDb, fixedClock, read, startApp, testConfig } from './helpers.js';

const OWNER_ID = '33333333-3333-4333-8333-333333333333';
const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
const INDEPENDENT_ID = '22222222-2222-4222-8222-222222222222';
const BARE_ID = '44444444-4444-4444-8444-444444444444';
const LETTERS_ID = 'abcdef12-3456-4789-8abc-def012345678'; // has letters, so upper-casing it changes it
const NOW = new Date('2026-10-12T03:00:00Z');
const session = (accountId, accountType) => ({
  account_id: accountId,
  account_type: accountType,
  last_seen_at: new Date('2026-10-12T02:55:00Z'),
  absolute_expires_at: new Date('2026-10-12T08:00:00Z'),
  ended_at: null,
});

const profiles = new Map([
  [CLINIC_ID, { provider_id: CLINIC_ID, provider_type: 'clinic', public_name: 'Clínica Central', contact_phone: '+57 601 555 0100', contact_email: 'contacto@central.test', address: 'Calle 1 # 2-3' }],
  [INDEPENDENT_ID, { provider_id: INDEPENDENT_ID, provider_type: 'independent', public_name: 'Dra. Ruiz', contact_phone: '3001234567', contact_email: 'ruiz@example.test', address: null }],
  [BARE_ID, { provider_id: BARE_ID, provider_type: 'independent', public_name: 'Sin teléfono', contact_phone: null, contact_email: 'bare@example.test', address: null }],
  [LETTERS_ID, { provider_id: LETTERS_ID, provider_type: 'independent', public_name: 'Con letras', contact_phone: null, contact_email: 'letters@example.test', address: null }],
]);
const offerings = new Map([
  [CLINIC_ID, [
    { id: 'a0000000-0000-4000-8000-000000000001', kind: 'service', name: 'Consulta', price_cop: 65000, species: 'dog', modality: 'both', available: null },
    { id: 'a0000000-0000-4000-8000-000000000002', kind: 'product', name: 'Alimento', price_cop: 89000, species: 'cat', modality: null, available: false },
  ]],
  [INDEPENDENT_ID, []],
]);

function makeDb() {
  const sessions = fakeSessionDb({ owner: session(OWNER_ID, 'owner'), provider: session(CLINIC_ID, 'provider') });
  const queries = [];
  return {
    queries,
    async query(text, params = []) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) {
        return sessions.query(text, params);
      }
      queries.push({ text, params });
      if (/FROM provider_profile/.test(text)) return { rows: profiles.has(params[0]) ? [profiles.get(params[0])] : [] };
      if (/FROM offering/.test(text)) return { rows: offerings.get(params[0]) ?? [] };
      throw new Error(`Unexpected query: ${text}`);
    },
  };
}

const running = [];
async function openApp(db = makeDb()) {
  const server = await startApp(createApp({ config: testConfig(), db, clock: fixedClock(NOW), modules: [{ createRouter: createPublicProviderProfileRouter }] }));
  running.push(server);
  return { db, get: (id, cookie = 'owner') => server.request(`/api/providers/${id}`, { headers: cookie ? { cookie: `vetcare_session=${cookie}` } : {} }) };
}
after(async () => Promise.all(running.map((server) => server.close())));

const spec = parse(read(API_SPEC_PATH)).components.schemas;

test('AC-044: a clinic profile shows name, address, phone, email, type, services and products with prices', async () => {
  const { get } = await openApp();
  const response = await get(CLINIC_ID);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  const body = await response.json();
  assert.deepEqual(body, {
    id: CLINIC_ID,
    name: 'Clínica Central',
    type: 'clinic',
    address: 'Calle 1 # 2-3',
    contactPhone: '+57 601 555 0100',
    contactEmail: 'contacto@central.test',
    services: [{ id: 'a0000000-0000-4000-8000-000000000001', kind: 'service', name: 'Consulta', priceCop: 65000, species: 'dog', modality: 'both' }],
    products: [{ id: 'a0000000-0000-4000-8000-000000000002', kind: 'product', name: 'Alimento', priceCop: 89000, species: 'cat', available: false }],
  });
});

test('the response keys equal API_SPEC PublicProviderProfile, CatalogService and CatalogProduct', async () => {
  const { get } = await openApp();
  const body = await (await get(CLINIC_ID)).json();
  assert.deepEqual(Object.keys(body).sort(), Object.keys(spec.PublicProviderProfile.properties).sort());
  assert.deepEqual(Object.keys(body.services[0]).sort(), Object.keys(spec.CatalogService.properties).sort());
  assert.deepEqual(Object.keys(body.products[0]).sort(), Object.keys(spec.CatalogProduct.properties).sort());
});

test('AC-045 / BR-026: an independent veterinarian without an address has no address key at all', async () => {
  const { get } = await openApp();
  const body = await (await get(INDEPENDENT_ID)).json();
  assert.equal('address' in body, false);
  assert.equal(body.type, 'independent');
  assert.equal(body.contactPhone, '3001234567');
  assert.deepEqual(body.services, []);
  assert.deepEqual(body.products, []);
});

test('BR-038: a provider that has not saved a phone is shown without one, never as null', async () => {
  const { get } = await openApp();
  const body = await (await get(BARE_ID)).json();
  assert.equal('contactPhone' in body, false);
  assert.equal('address' in body, false);
  assert.equal(body.contactEmail, 'bare@example.test');
});

test('nothing beyond the public fields is exposed (no hours, no account data, no timestamps)', async () => {
  const { get } = await openApp();
  const text = JSON.stringify(await (await get(CLINIC_ID)).json());
  for (const forbidden of ['password', 'provider_id', 'updated_at', 'created_at', 'workingHours', 'weekday', 'account']) {
    assert.equal(text.includes(forbidden), false, forbidden);
  }
});

test('unknown, malformed and non-provider identifiers are a uniform NOT_FOUND; malformed ones never reach the database', async () => {
  const { get, db } = await openApp();
  const unknown = await get('99999999-9999-4999-8999-999999999999');
  assert.equal(unknown.status, 404);
  assert.deepEqual(await unknown.json(), { code: 'NOT_FOUND' });
  const ownerAccount = await get(OWNER_ID); // an owner account has no provider profile
  assert.equal(ownerAccount.status, 404);
  const before = db.queries.length;
  for (const id of ['abc', '1', "x'; DROP TABLE offering;--", '%00', '99999999-9999-4999-8999-99999999999', 'not-a-uuid-at-all-not-a-uuid-at-all', '{11111111-1111-4111-8111-111111111111}']) {
    const response = await get(encodeURIComponent(id));
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' }, id);
  }
  assert.equal(db.queries.length, before, 'no query for malformed identifiers');
});

test('an upper-case UUID resolves to the same provider', async () => {
  const { get } = await openApp();
  assert.notEqual(LETTERS_ID.toUpperCase(), LETTERS_ID);
  const response = await get(LETTERS_ID.toUpperCase());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).id, LETTERS_ID);
});

test('DEP-001: the profile is owner-only (anonymous 401, provider 404 even for its own id)', async () => {
  const { get } = await openApp();
  assert.equal((await get(CLINIC_ID, null)).status, 401);
  const provider = await get(CLINIC_ID, 'provider');
  assert.equal(provider.status, 404);
  assert.deepEqual(await provider.json(), { code: 'NOT_FOUND' });
});

test('IF-019 provider facts: returns the stored facts or null', async () => {
  const db = makeDb();
  assert.deepEqual(await getProviderFacts(db, INDEPENDENT_ID), {
    id: INDEPENDENT_ID, type: 'independent', name: 'Dra. Ruiz', contactPhone: '3001234567', contactEmail: 'ruiz@example.test', address: null,
  });
  assert.equal(await getProviderFacts(db, '99999999-9999-4999-8999-999999999999'), null);
});
