// US-015 (IF-037 removeOffering for a product) request handling without a real database: authentication and
// role first, malformed ids refused before any query, own-offering-only (AC-037), the removal in one
// transaction under the provider lock, no appointment is cancelled for a product, and the answer is a
// RemovalResult. Orders are never touched (AC-085, EDGE-019).
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/application.js';
import { createCatalogRouter, removeOffering } from '../src/modules/catalog/offerings.js';
import { fakeSessionDb, fixedClock, startApp, testConfig } from './helpers.js';

const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
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

/** Stateful stand-in for the removal queries; the ownership/active rule is applied the way the SQL states it. */
function makeDb() {
  const sessions = fakeSessionDb({ clinic: session(CLINIC_ID, 'provider'), owner: session(OWNER_ID, 'owner') });
  const offerings = new Map([
    [OWN_PRODUCT, { id: OWN_PRODUCT, provider_id: CLINIC_ID, kind: 'product', removed_at: null }],
    [OTHER_PRODUCT, { id: OTHER_PRODUCT, provider_id: OTHER_CLINIC_ID, kind: 'product', removed_at: null }],
    [OWN_SERVICE, { id: OWN_SERVICE, provider_id: CLINIC_ID, kind: 'service', removed_at: null }],
  ]);
  const state = { log: [] };
  const run = async (text, params = []) => {
    const sql = text.replace(/\s+/g, ' ').trim();
    if (/^SELECT provider_id FROM provider_profile WHERE provider_id = \$1 FOR UPDATE$/.test(sql)) {
      state.log.push('lock');
      return { rows: [CLINIC_ID, OTHER_CLINIC_ID].includes(params[0]) ? [{ provider_id: params[0] }] : [] };
    }
    if (/^SELECT id, kind FROM offering WHERE id = \$1 AND provider_id = \$2 AND removed_at IS NULL FOR UPDATE$/.test(sql)) {
      state.log.push('select-offering');
      const row = offerings.get(params[0]);
      return { rows: row && row.provider_id === params[1] && !row.removed_at ? [{ id: row.id, kind: row.kind }] : [] };
    }
    if (/^UPDATE offering SET removed_at = \$2 WHERE id = \$1$/.test(sql)) {
      state.log.push('mark-removed');
      offerings.get(params[0]).removed_at = params[1];
      return { rows: [], rowCount: 1 };
    }
    if (/^UPDATE appointment/.test(sql)) {
      state.log.push('cancel');
      return { rows: [], rowCount: 5 };
    }
    throw new Error(`Unexpected query (a product removal must not touch anything else): ${sql}`);
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

test('AC-037: the provider removes its own product; the answer is a RemovalResult with no cancelled appointments', async () => {
  const { request, db } = await openApp();
  const response = await del(request, 'clinic', OWN_PRODUCT);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { removed: true, cancelledAppointments: 0 });
  assert.deepEqual(db.state.log, ['BEGIN', 'lock', 'select-offering', 'mark-removed', 'COMMIT'], 'one transaction under the provider lock, and no appointment statement at all');
  assert.deepEqual(db.offerings.get(OWN_PRODUCT).removed_at, NOW);
});

test('the id is lower-cased and the provider of the session decides whose product is removed', async () => {
  const { request, db } = await openApp();
  assert.equal((await del(request, 'clinic', OWN_PRODUCT.toUpperCase())).status, 200);
  assert.notEqual(db.offerings.get(OWN_PRODUCT).removed_at, null);
});

test('AC-037 ownership: another provider\'s product, an unknown or an already removed product are one NOT_FOUND and nothing is written', async () => {
  const { request, db } = await openApp();
  for (const id of [OTHER_PRODUCT, 'ffffffff-ffff-4fff-8fff-ffffffffffff']) {
    const response = await del(request, 'clinic', id);
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  assert.equal((await del(request, 'clinic', OWN_PRODUCT)).status, 200);
  assert.equal((await del(request, 'clinic', OWN_PRODUCT)).status, 404, 'removing twice is NOT_FOUND');
  assert.equal(db.offerings.get(OTHER_PRODUCT).removed_at, null);
  assert.equal(db.offerings.get(OWN_SERVICE).removed_at, null, 'the provider\'s service is a different offering and stays');
  assert.equal(db.state.log.filter((entry) => entry === 'mark-removed').length, 1);
  assert.equal(db.state.log.includes('cancel'), false);
});

test('role and session: anonymous 401, owner 404; malformed ids 404 without any query', async () => {
  const { request, db } = await openApp();
  assert.equal((await request(`/api/provider/offerings/${OWN_PRODUCT}`, { method: 'DELETE', headers: { origin: 'https://vetcare.test' } })).status, 401);
  assert.equal((await del(request, 'owner', OWN_PRODUCT)).status, 404);
  for (const id of ['abc', '1', "x'; DROP TABLE offering;--", '%00', OWN_PRODUCT.replaceAll('-', ''), `${OWN_PRODUCT}x`]) {
    const response = await del(request, 'clinic', encodeURIComponent(id));
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  assert.deepEqual(db.state.log, [], 'no query at all');
});

test('a failure while marking the product rolls the removal back', async () => {
  const db = makeDb();
  const original = db.connect.bind(db);
  db.connect = async () => {
    const client = await original();
    const query = client.query.bind(client);
    client.query = async (text, params) => {
      if (/UPDATE offering SET removed_at/.test(text)) throw new Error('boom');
      return query(text, params);
    };
    return client;
  };
  await assert.rejects(removeOffering(db, { providerId: CLINIC_ID, offeringId: OWN_PRODUCT, now: NOW }), /boom/);
  assert.equal(db.state.log.at(-1), 'ROLLBACK');
  assert.equal(db.state.log.includes('COMMIT'), false);
  assert.equal(db.offerings.get(OWN_PRODUCT).removed_at, null);
});
