// US-013 (IF-006 publishProduct): AC-033, AC-034, AC-084; AC-111 (published as available);
// BR-006, BR-025, BR-027, BR-032.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { createApp } from '../src/application.js';
import { createCatalogRouter, validatePublishProduct, validatePublishService } from '../src/modules/catalog/offerings.js';
import { API_SPEC_PATH, fakeSessionDb, fixedClock, read, startApp, testConfig } from './helpers.js';

const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
const INDEPENDENT_ID = '22222222-2222-4222-8222-222222222222';
const OWNER_ID = '33333333-3333-4333-8333-333333333333';
const NOW = new Date('2026-10-12T12:00:00Z');
const session = (accountId, accountType) => ({
  account_id: accountId,
  account_type: accountType,
  last_seen_at: new Date('2026-10-12T11:55:00Z'),
  absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
  ended_at: null,
});
const product = { name: ' Concentrado para gato 2 kg ', priceCop: 45000, species: 'cat' };

function makeDb() {
  const sessions = fakeSessionDb({
    clinic: session(CLINIC_ID, 'provider'),
    independent: session(INDEPENDENT_ID, 'provider'),
    owner: session(OWNER_ID, 'owner'),
  });
  const state = { inserts: [] };
  return {
    state,
    async query(text, params = []) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) {
        return sessions.query(text, params);
      }
      if (/FROM provider_profile/.test(text)) {
        const type = params[0] === CLINIC_ID ? 'clinic' : params[0] === INDEPENDENT_ID ? 'independent' : null;
        return { rows: type ? [{ provider_type: type }] : [] };
      }
      if (/INSERT INTO offering/.test(text)) {
        assert.match(text, /'product'/);
        assert.match(text, /available\)\s*VALUES/);
        const [providerId, providerType, name, priceCop, species] = params;
        const row = { id: `aaaaaaaa-aaaa-4aaa-8aaa-${String(state.inserts.length).padStart(12, '0')}`, provider_id: providerId, provider_type: providerType, kind: 'product', name, price_cop: priceCop, species, modality: null, available: true };
        state.inserts.push(row);
        return { rows: [row] };
      }
      if (/FROM offering/.test(text)) return { rows: state.inserts.filter((row) => row.provider_id === params[0]) };
      throw new Error(`Unexpected query: ${text}`);
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
const post = (request, cookie, body) => request('/api/provider/products', { method: 'POST', headers: headers(cookie), body: typeof body === 'string' ? body : JSON.stringify(body) });

test('product validator trims the name and accepts a name, a positive COP price and one species', () => {
  assert.deepEqual(validatePublishProduct(product), { value: { name: 'Concentrado para gato 2 kg', priceCop: 45000, species: 'cat' } });
  assert.equal(validatePublishProduct({ ...product, species: 'dog' }).value.species, 'dog');
});

test('AC-034: a missing, null, blank or unsupported species is rejected and species is flagged', () => {
  const reasons = (input) => validatePublishProduct(input).fields.map(({ field, reason }) => `${field}:${reason}`);
  for (const species of [undefined, null, '']) {
    assert.deepEqual(reasons({ ...product, species }), ['species:REQUIRED'], JSON.stringify(species));
  }
  for (const species of ['bird', 'both', ['dog', 'cat'], 1, 'DOG']) {
    assert.deepEqual(reasons({ ...product, species }), ['species:NOT_ALLOWED'], JSON.stringify(species));
  }
});

test('AC-084: a missing, null or blank price is rejected and price is flagged; invalid prices are refused', () => {
  const reasons = (input) => validatePublishProduct(input).fields.map(({ field, reason }) => `${field}:${reason}`);
  for (const priceCop of [undefined, null, '']) assert.deepEqual(reasons({ ...product, priceCop }), ['priceCop:REQUIRED'], JSON.stringify(priceCop));
  assert.deepEqual(reasons({ ...product, priceCop: 0 }), ['priceCop:OUT_OF_RANGE']);
  assert.deepEqual(reasons({ ...product, priceCop: -5 }), ['priceCop:OUT_OF_RANGE']);
  assert.deepEqual(reasons({ ...product, priceCop: 2_147_483_648 }), ['priceCop:OUT_OF_RANGE']);
  assert.deepEqual(reasons({ ...product, priceCop: 10.5 }), ['priceCop:INVALID_FORMAT']);
  assert.deepEqual(reasons({ ...product, priceCop: '5000' }), ['priceCop:INVALID_FORMAT']);
});

test('name, shape and unknown-field rules (modality and available cannot be supplied for a product)', () => {
  const reasons = (input) => validatePublishProduct(input).fields.map(({ field, reason }) => `${field}:${reason}`);
  assert.deepEqual(reasons({ ...product, name: undefined }), ['name:REQUIRED']);
  assert.deepEqual(reasons({ ...product, name: null }), ['name:REQUIRED']);
  assert.deepEqual(reasons({ ...product, name: '   ' }), ['name:REQUIRED']);
  assert.deepEqual(reasons({ ...product, name: 7 }), ['name:INVALID_FORMAT']);
  assert.deepEqual(reasons({ ...product, name: 'x'.repeat(121) }), ['name:TOO_LONG']);
  assert.equal(validatePublishProduct({ ...product, name: '🐶'.repeat(120) }).value.name.length > 0, true);
  assert.deepEqual(reasons({ ...product, modality: 'home' }), ['modality:NOT_ALLOWED']);
  assert.deepEqual(reasons({ ...product, available: false }), ['available:NOT_ALLOWED']);
  assert.deepEqual(reasons({ ...product, providerId: CLINIC_ID }), ['providerId:NOT_ALLOWED']);
  assert.deepEqual(reasons({}), ['name:REQUIRED', 'priceCop:REQUIRED', 'species:REQUIRED']);
  assert.deepEqual(validatePublishProduct([]), { fields: [{ field: 'form', reason: 'REQUIRED' }] });
});

test('the shared checks keep the US-010 service validator behavior', () => {
  const service = { name: 'Consulta', priceCop: 50000, species: 'dog', modality: 'clinic' };
  assert.deepEqual(validatePublishService(service, 'clinic').value, service);
  assert.deepEqual(validatePublishService({ ...service, species: undefined }, 'clinic').fields, [{ field: 'species', reason: 'REQUIRED' }]);
  assert.deepEqual(validatePublishService({ ...service, modality: undefined }, 'clinic').fields, [{ field: 'modality', reason: 'REQUIRED' }]);
});

test('AC-033 / AC-111: a clinic publishes a product that is available and listed in its catalog', async () => {
  const { request, db } = await openApp();
  const created = await post(request, 'clinic', product);
  assert.equal(created.status, 201);
  const body = await created.json();
  assert.deepEqual(body, { id: body.id, kind: 'product', name: 'Concentrado para gato 2 kg', priceCop: 45000, species: 'cat', available: true });
  assert.equal(db.state.inserts[0].provider_id, CLINIC_ID);
  assert.equal(db.state.inserts[0].provider_type, 'clinic');

  const catalog = await (await request('/api/provider/offerings', { headers: { cookie: 'vetcare_session=clinic' } })).json();
  assert.deepEqual(catalog, { services: [], products: [body] });

  const schema = parse(read(API_SPEC_PATH)).components.schemas.CatalogProduct;
  assert.deepEqual(Object.keys(body).sort(), Object.keys(schema.properties).sort());
});

test('AC-033: an independent veterinarian can also publish a product (no modality rule applies)', async () => {
  const { request, db } = await openApp();
  const created = await post(request, 'independent', { name: 'Shampoo', priceCop: 12000, species: 'dog' });
  assert.equal(created.status, 201);
  assert.equal((await created.json()).available, true);
  assert.equal(db.state.inserts[0].provider_type, 'independent');
});

test('AC-034 / AC-084: invalid products are refused with 422 field reasons and nothing is written', async () => {
  const { request, db } = await openApp();
  const noSpecies = await post(request, 'clinic', { name: 'Arena', priceCop: 9000 });
  assert.equal(noSpecies.status, 422);
  assert.deepEqual(await noSpecies.json(), { code: 'VALIDATION_FAILED', fields: [{ field: 'species', reason: 'REQUIRED' }] });
  const noPrice = await post(request, 'clinic', { name: 'Arena', species: 'cat' });
  assert.deepEqual((await noPrice.json()).fields, [{ field: 'priceCop', reason: 'REQUIRED' }]);
  const malformed = await post(request, 'clinic', '{nope');
  assert.equal(malformed.status, 422);
  assert.equal(db.state.inserts.length, 0);
});

test('BR-025: product publication is provider-only, needs a session and a same-origin JSON request', async () => {
  const { request, db } = await openApp();
  const anonymous = await request('/api/provider/products', { method: 'POST', headers: { origin: 'https://vetcare.test', 'content-type': 'application/json' }, body: JSON.stringify(product) });
  assert.equal(anonymous.status, 401);
  const owner = await post(request, 'owner', product);
  assert.equal(owner.status, 404);
  assert.deepEqual(await owner.json(), { code: 'NOT_FOUND' });
  const foreign = await request('/api/provider/products', { method: 'POST', headers: { ...headers('clinic'), origin: 'https://evil.test' }, body: JSON.stringify(product) });
  assert.equal(foreign.status, 403);
  assert.equal(db.state.inserts.length, 0);
});
