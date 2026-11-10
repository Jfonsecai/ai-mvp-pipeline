// US-014 (IF-036 updateProduct) request handling without a real database: authentication and role first,
// malformed ids refused before any query, invalid bodies refused before any write, own-product-only
// (AC-035, AC-036), availability never part of the update (API_SPEC_V2).
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
const OWN_PRODUCT = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1';
const OTHER_PRODUCT = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2';
const OWN_SERVICE = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa3';
const NOW = new Date('2026-10-12T12:00:00Z');
const session = (accountId, accountType) => ({
  account_id: accountId,
  account_type: accountType,
  last_seen_at: new Date('2026-10-12T11:55:00Z'),
  absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
  ended_at: null,
});

/** Stateful stand-in for the queries of the update route; the ownership/kind/active rule is the SQL's own. */
function makeDb() {
  const sessions = fakeSessionDb({
    clinic: session(CLINIC_ID, 'provider'),
    independent: session(INDEPENDENT_ID, 'provider'),
    owner: session(OWNER_ID, 'owner'),
  });
  const offerings = new Map([
    [OWN_PRODUCT, { id: OWN_PRODUCT, provider_id: CLINIC_ID, kind: 'product', name: 'Alimento', price_cop: 9000, species: 'cat', available: false, removed_at: null }],
    [OTHER_PRODUCT, { id: OTHER_PRODUCT, provider_id: OTHER_CLINIC_ID, kind: 'product', name: 'Ajeno', price_cop: 1000, species: 'dog', available: true, removed_at: null }],
    [OWN_SERVICE, { id: OWN_SERVICE, provider_id: CLINIC_ID, kind: 'service', name: 'Consulta', price_cop: 50000, species: 'dog', available: null, removed_at: null }],
  ]);
  const state = { queries: [], updates: [], transactions: [] };
  return {
    state,
    offerings,
    async query(text, params = []) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) return sessions.query(text, params);
      state.queries.push(text.trim().split('\n')[0]);
      if (/^\s*SELECT provider_type FROM provider_profile/.test(text)) {
        const type = params[0] === CLINIC_ID ? 'clinic' : params[0] === INDEPENDENT_ID ? 'independent' : null;
        return { rows: type ? [{ provider_type: type }] : [] };
      }
      if (/^\s*UPDATE offering/.test(text)) {
        const [id, providerId, name, price, species] = params;
        state.updates.push(params);
        const row = offerings.get(id);
        if (!row || row.provider_id !== providerId || row.kind !== 'product' || row.removed_at) return { rows: [] };
        Object.assign(row, { name, price_cop: price, species });
        return { rows: [{ ...row }] };
      }
      throw new Error(`Unexpected query: ${text}`);
    },
    async connect() {
      state.transactions.push('connect');
      throw new Error('The product update must not need a transaction');
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
const put = (request, cookie, id, body) => request(`/api/provider/products/${id}`, { method: 'PUT', headers: headers(cookie), body: typeof body === 'string' ? body : JSON.stringify(body) });
const valid = { name: ' Concentrado nuevo ', priceCop: 65000, species: 'dog' };

test('AC-035: the provider replaces the details of its own product; values are trimmed, the response is a CatalogProduct and availability is untouched', async () => {
  const { request, db } = await openApp();
  const response = await put(request, 'clinic', OWN_PRODUCT, valid);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { id: OWN_PRODUCT, kind: 'product', name: 'Concentrado nuevo', priceCop: 65000, species: 'dog', available: false });
  assert.deepEqual(db.state.updates[0], [OWN_PRODUCT, CLINIC_ID, 'Concentrado nuevo', 65000, 'dog']);
  assert.equal(db.offerings.get(OWN_PRODUCT).available, false, 'availability is not changed');
  const spec = parse(read(API_SPEC_PATH)).components.schemas.CatalogProduct;
  assert.deepEqual(Object.keys(await (await put(request, 'clinic', OWN_PRODUCT, valid)).json()).sort(), Object.keys(spec.properties).sort());
});

test('an independent veterinarian updates its own product the same way (products have no modality)', async () => {
  const { request, db } = await openApp();
  db.offerings.set(OWN_PRODUCT, { ...db.offerings.get(OWN_PRODUCT), provider_id: INDEPENDENT_ID });
  const response = await put(request, 'independent', OWN_PRODUCT, valid);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).priceCop, 65000);
});

test('the id is lower-cased and the owner of the session, never a body field, decides whose product is changed', async () => {
  const { request, db } = await openApp();
  assert.equal((await put(request, 'clinic', OWN_PRODUCT.toUpperCase(), valid)).status, 200);
  assert.deepEqual([db.state.updates[0][0], db.state.updates[0][1]], [OWN_PRODUCT, CLINIC_ID]);
});

test('AC-036: another provider\'s product, a service, a removed or unknown offering are one NOT_FOUND and nothing changes', async () => {
  const { request, db } = await openApp();
  for (const [cookie, id] of [['clinic', OTHER_PRODUCT], ['clinic', OWN_SERVICE], ['clinic', 'ffffffff-ffff-4fff-8fff-ffffffffffff'], ['independent', OWN_PRODUCT]]) {
    const response = await put(request, cookie, id, valid);
    assert.equal(response.status, 404, `${cookie} ${id}`);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  db.offerings.get(OWN_PRODUCT).removed_at = NOW;
  assert.equal((await put(request, 'clinic', OWN_PRODUCT, valid)).status, 404, 'a removed product is not editable');
  assert.equal(db.offerings.get(OTHER_PRODUCT).name, 'Ajeno');
  assert.equal(db.offerings.get(OWN_SERVICE).name, 'Consulta');
  assert.equal(db.offerings.get(OWN_PRODUCT).name, 'Alimento');
});

test('role and session: anonymous 401, owner 404; malformed ids 404 without any query', async () => {
  const { request, db } = await openApp();
  const anonymous = await request(`/api/provider/products/${OWN_PRODUCT}`, { method: 'PUT', headers: { origin: 'https://vetcare.test', 'content-type': 'application/json' }, body: JSON.stringify(valid) });
  assert.equal(anonymous.status, 401);
  assert.equal((await put(request, 'owner', OWN_PRODUCT, valid)).status, 404);
  assert.deepEqual(db.state.queries, []);
  for (const id of ['abc', '1', "x'; DROP TABLE offering;--", '%00', OWN_PRODUCT.replaceAll('-', ''), `${OWN_PRODUCT}x`]) {
    const response = await put(request, 'clinic', encodeURIComponent(id), valid);
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  assert.deepEqual(db.state.queries, [], 'no query for a malformed id');
});

test('BR-006: invalid bodies are 422 with field reasons and write nothing; availability and modality cannot be sent', async () => {
  const { request, db } = await openApp();
  const reasons = async (body) => {
    const response = await put(request, 'clinic', OWN_PRODUCT, body);
    assert.equal(response.status, 422, JSON.stringify(body));
    return (await response.json()).fields.map(({ field, reason }) => `${field}:${reason}`);
  };
  assert.deepEqual(await reasons({}), ['name:REQUIRED', 'priceCop:REQUIRED', 'species:REQUIRED']);
  assert.deepEqual(await reasons({ ...valid, name: '   ' }), ['name:REQUIRED']);
  assert.deepEqual(await reasons({ ...valid, name: 'x'.repeat(121) }), ['name:TOO_LONG']);
  assert.deepEqual(await reasons({ ...valid, priceCop: 0 }), ['priceCop:OUT_OF_RANGE']);
  assert.deepEqual(await reasons({ ...valid, priceCop: 2147483648 }), ['priceCop:OUT_OF_RANGE']);
  assert.deepEqual(await reasons({ ...valid, priceCop: 10.5 }), ['priceCop:INVALID_FORMAT']);
  assert.deepEqual(await reasons({ ...valid, priceCop: '100' }), ['priceCop:INVALID_FORMAT']);
  assert.deepEqual(await reasons({ ...valid, species: 'bird' }), ['species:NOT_ALLOWED']);
  assert.deepEqual(await reasons({ ...valid, species: ['dog', 'cat'] }), ['species:NOT_ALLOWED']);
  assert.deepEqual(await reasons({ ...valid, available: true, modality: 'home', kind: 'service', providerId: CLINIC_ID, id: OWN_PRODUCT }), ['available:NOT_ALLOWED', 'modality:NOT_ALLOWED', 'kind:NOT_ALLOWED', 'providerId:NOT_ALLOWED', 'id:NOT_ALLOWED']);
  assert.deepEqual(await reasons([]), ['form:REQUIRED']);
  assert.equal((await put(request, 'clinic', OWN_PRODUCT, '{bad')).status, 422);
  assert.deepEqual(db.state.updates, [], 'nothing was written');
});

test('Origin and JSON are enforced like every state-changing request', async () => {
  const { request, db } = await openApp();
  const foreign = await request(`/api/provider/products/${OWN_PRODUCT}`, { method: 'PUT', headers: { ...headers('clinic'), origin: 'https://evil.test' }, body: JSON.stringify(valid) });
  assert.equal(foreign.status, 403);
  const text = await request(`/api/provider/products/${OWN_PRODUCT}`, { method: 'PUT', headers: { ...headers('clinic'), 'content-type': 'text/plain' }, body: JSON.stringify(valid) });
  assert.equal(text.status, 403);
  assert.deepEqual(db.state.updates, []);
});

test('contract: the operation, its schemas and the responses match API_SPEC V2', () => {
  const spec = parse(read(API_SPEC_PATH));
  const operation = spec.paths['/api/provider/products/{offeringId}'].put;
  assert.equal(operation.operationId, 'updateProduct');
  assert.equal(operation['x-vetcare-interface'], 'IF-036');
  assert.equal(operation.requestBody.content['application/json'].schema.$ref, '#/components/schemas/PublishProductRequest');
  assert.equal(operation.responses['200'].content['application/json'].schema.$ref, '#/components/schemas/CatalogProduct');
  for (const status of ['200', '401', '403', '404', '422']) assert.ok(operation.responses[status], status);
});
