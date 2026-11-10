// US-012 (IF-037 removeOffering for a service, IF-044) request handling without a real database:
// authentication and role first, malformed ids refused before any query, own-service-only (AC-032),
// the whole removal in one transaction under the provider lock, and the response is a RemovalResult.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { createApp } from '../src/application.js';
import { createCatalogRouter, removeOffering } from '../src/modules/catalog/offerings.js';
import { cancelUpcomingServiceAppointments } from '../src/modules/scheduling/cancellation.js';
import { API_SPEC_PATH, fakeSessionDb, fixedClock, read, startApp, testConfig } from './helpers.js';

const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
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

/** Stateful stand-in for the removal queries; the ownership/kind/active rules are applied the way the SQL states them. */
function makeDb({ upcoming = 2 } = {}) {
  const sessions = fakeSessionDb({
    clinic: session(CLINIC_ID, 'provider'),
    owner: session(OWNER_ID, 'owner'),
  });
  const offerings = new Map([
    [OWN_SERVICE, { id: OWN_SERVICE, provider_id: CLINIC_ID, kind: 'service', removed_at: null }],
    [OTHER_SERVICE, { id: OTHER_SERVICE, provider_id: OTHER_CLINIC_ID, kind: 'service', removed_at: null }],
    [OWN_PRODUCT, { id: OWN_PRODUCT, provider_id: CLINIC_ID, kind: 'product', removed_at: null }],
  ]);
  const state = { log: [], cancellations: [] };
  const run = async (text, params = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (/^SELECT provider_id FROM provider_profile WHERE provider_id = \$1 FOR UPDATE$/.test(sql)) {
      state.log.push('lock');
      return { rows: params[0] === CLINIC_ID || params[0] === OTHER_CLINIC_ID ? [{ provider_id: params[0] }] : [] };
    }
    if (/^SELECT id, kind FROM offering WHERE id = \$1 AND provider_id = \$2 AND removed_at IS NULL FOR UPDATE$/.test(sql)) {
      state.log.push('select-service');
      const row = offerings.get(params[0]);
      return { rows: row && row.provider_id === params[1] && !row.removed_at ? [{ id: row.id, kind: row.kind }] : [] };
    }
    if (/^UPDATE offering SET removed_at = \$2 WHERE id = \$1$/.test(sql)) {
      state.log.push('mark-removed');
      offerings.get(params[0]).removed_at = params[1];
      return { rows: [], rowCount: 1 };
    }
    if (/^UPDATE appointment SET status = 'cancelled', cancelled_at = \$2 WHERE service_id = \$1 AND status = 'scheduled' AND starts_at > \$2$/.test(sql)) {
      state.log.push('cancel');
      state.cancellations.push(params);
      return { rows: [], rowCount: upcoming };
    }
    throw new Error(`Unexpected query: ${sql}`);
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
          if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') { state.log.push(sql); return { rows: [] }; }
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

const headers = (cookie) => ({ cookie: `vetcare_session=${cookie}`, origin: 'https://vetcare.test' });
const del = (request, cookie, id) => request(`/api/provider/offerings/${id}`, { method: 'DELETE', headers: headers(cookie) });

test('AC-032: the provider removes its own service; the answer is a RemovalResult with the number of cancelled appointments', async () => {
  const { request, db } = await openApp();
  const response = await del(request, 'clinic', OWN_SERVICE);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { removed: true, cancelledAppointments: 2 });
  assert.deepEqual(db.state.log, ['BEGIN', 'lock', 'select-service', 'mark-removed', 'cancel', 'COMMIT'], 'one transaction: provider lock, then the service, then removal, then the cancellation');
  assert.deepEqual(db.state.cancellations[0], [OWN_SERVICE, NOW], 'only this service, from the server clock');
  assert.deepEqual(db.offerings.get(OWN_SERVICE).removed_at, NOW);
  const spec = parse(read(API_SPEC_PATH)).components.schemas.RemovalResult;
  const fresh = await openApp();
  assert.deepEqual(Object.keys(await (await del(fresh.request, 'clinic', OWN_SERVICE)).json()).sort(), Object.keys(spec.properties).sort());
});

test('a service without upcoming appointments is removed with cancelledAppointments 0', async () => {
  const { request } = await openApp(makeDb({ upcoming: 0 }));
  const response = await del(request, 'clinic', OWN_SERVICE);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { removed: true, cancelledAppointments: 0 });
});

test('the id is lower-cased and the provider of the session, never the request, decides whose service is removed', async () => {
  const { request, db } = await openApp();
  assert.equal((await del(request, 'clinic', OWN_SERVICE.toUpperCase())).status, 200);
  assert.equal(db.state.cancellations[0][0], OWN_SERVICE);
});

test('AC-032 ownership: another provider\'s service, an unknown or an already removed service are one NOT_FOUND and nothing is written', async () => {
  const { request, db } = await openApp();
  for (const id of [OTHER_SERVICE, 'ffffffff-ffff-4fff-8fff-ffffffffffff']) {
    const response = await del(request, 'clinic', id);
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  assert.equal((await del(request, 'clinic', OWN_SERVICE)).status, 200);
  const again = await del(request, 'clinic', OWN_SERVICE);
  assert.equal(again.status, 404, 'removing twice is NOT_FOUND, never a second cancellation');
  assert.equal(db.offerings.get(OTHER_SERVICE).removed_at, null);
  assert.equal(db.offerings.get(OWN_PRODUCT).removed_at, null, 'a service removal never touches the provider\'s product');
  assert.equal(db.state.log.filter((entry) => entry === 'mark-removed').length, 1);
  assert.equal(db.state.log.filter((entry) => entry === 'cancel').length, 1);
  assert.equal(db.state.log.filter((entry) => entry === 'ROLLBACK').length, 3, 'every refusal rolls its transaction back');
});

test('role and session: anonymous 401, owner 404; malformed ids 404 without any query', async () => {
  const { request, db } = await openApp();
  const anonymous = await request(`/api/provider/offerings/${OWN_SERVICE}`, { method: 'DELETE', headers: { origin: 'https://vetcare.test' } });
  assert.equal(anonymous.status, 401);
  assert.equal((await del(request, 'owner', OWN_SERVICE)).status, 404);
  assert.deepEqual(db.state.log, []);
  for (const id of ['abc', '1', "x'; DROP TABLE offering;--", '%00', OWN_SERVICE.replaceAll('-', ''), `${OWN_SERVICE}x`]) {
    const response = await del(request, 'clinic', encodeURIComponent(id));
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  assert.deepEqual(db.state.log, [], 'no query for a malformed id');
});

test('Origin is enforced like every state-changing request', async () => {
  const { request, db } = await openApp();
  const foreign = await request(`/api/provider/offerings/${OWN_SERVICE}`, { method: 'DELETE', headers: { ...headers('clinic'), origin: 'https://evil.test' } });
  assert.equal(foreign.status, 403);
  const missing = await request(`/api/provider/offerings/${OWN_SERVICE}`, { method: 'DELETE', headers: { cookie: 'vetcare_session=clinic' } });
  assert.equal(missing.status, 403);
  assert.deepEqual(db.state.log, []);
});

test('a failure while cancelling rolls the whole removal back (no half-removed service)', async () => {
  const db = makeDb();
  const original = db.connect.bind(db);
  db.connect = async () => {
    const client = await original();
    const query = client.query.bind(client);
    client.query = async (text, params) => {
      if (/UPDATE appointment/.test(text)) throw new Error('boom');
      return query(text, params);
    };
    return client;
  };
  await assert.rejects(removeOffering(db, { providerId: CLINIC_ID, offeringId: OWN_SERVICE, now: NOW }), /boom/);
  assert.equal(db.state.log.at(-1), 'ROLLBACK');
  assert.equal(db.state.log.includes('COMMIT'), false);
});

test('IF-044: the cancellation command touches only scheduled appointments of one service that start after now', async () => {
  const calls = [];
  const client = { query: async (text, params) => { calls.push({ text: text.replace(/\s+/g, ' ').trim(), params }); return { rowCount: 3 }; } };
  assert.equal(await cancelUpcomingServiceAppointments(client, { serviceId: OWN_SERVICE, now: NOW }), 3);
  assert.equal(calls.length, 1);
  assert.match(calls[0].text, /WHERE service_id = \$1 AND status = 'scheduled' AND starts_at > \$2$/);
  assert.match(calls[0].text, /SET status = 'cancelled', cancelled_at = \$2/);
  assert.doesNotMatch(calls[0].text, /DELETE/i);
  assert.deepEqual(calls[0].params, [OWN_SERVICE, NOW]);
});

test('contract: the operation, RemovalResult and the responses match API_SPEC V2', () => {
  const spec = parse(read(API_SPEC_PATH));
  const operation = spec.paths['/api/provider/offerings/{offeringId}'].delete;
  assert.equal(operation.operationId, 'removeOffering');
  assert.equal(operation['x-vetcare-interface'], 'IF-037');
  assert.equal(operation.responses['200'].content['application/json'].schema.$ref, '#/components/schemas/RemovalResult');
  for (const status of ['200', '401', '403', '404']) assert.ok(operation.responses[status], status);
  assert.deepEqual(spec.components.schemas.RemovalResult.required, ['removed', 'cancelledAppointments']);
});
