import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { Router } from 'express';
import { createApp } from '../src/app.js';
import { Outcome } from '../src/shared/outcomes.js';
import { APP_ORIGIN, fakeSessionDb, fixedClock, memoryLogger, startApp, testConfig } from './helpers.js';

const NOW = '2026-10-12T15:00:00Z';
const minutes = (n) => new Date(new Date(NOW).getTime() + n * 60_000);
const sessionRow = (accountType, overrides = {}) => ({
  account_id: '22222222-2222-4222-8222-222222222222',
  account_type: accountType,
  last_seen_at: minutes(-1),
  absolute_expires_at: minutes(600),
  ended_at: null,
  ...overrides,
});

// A throwaway module that exercises the guards exactly as a story module would use them.
const probeModule = {
  createRouter({ guard }) {
    const router = Router();
    router.get('/probe/public', guard(), (_req, res) => res.json({ ok: true }));
    router.get('/probe/owner', guard({ role: 'owner' }), (req, res) => res.json({ who: req.session.accountId }));
    router.get('/probe/provider', guard({ role: 'provider' }), (_req, res) => res.json({ ok: true }));
    router.get('/probe/orders', guard({ feature: 'orders', role: 'owner' }), (_req, res) => res.json({ ok: true }));
    router.post('/probe/echo', guard({ role: 'owner' }), (req, res) => res.status(201).json({ received: req.body }));
    router.get('/probe/boom', () => {
      throw new Error('boom with secret postgresql://u:SuperSecret@h/db');
    });
    router.get('/probe/async-boom', async () => {
      throw Object.assign(new Error('driver exploded at db.internal'), { code: '57P01' });
    });
    router.get('/probe/outcome', () => {
      throw new Outcome('SLOT_UNAVAILABLE');
    });
    return router;
  },
};

const db = fakeSessionDb({
  owner: sessionRow('owner'),
  provider: sessionRow('provider'),
  stale: sessionRow('owner', { last_seen_at: minutes(-61) }),
  signedout: sessionRow('owner', { ended_at: minutes(-2) }),
});
const failingDb = { ...db, ping: async () => { throw Object.assign(new Error('connect to db.secret-host failed'), { code: 'ECONNREFUSED' }); } };

let app;
let appWithOrders;
let broken;
let log;

before(async () => {
  log = memoryLogger();
  app = await startApp(createApp({ config: testConfig(), db, clock: fixedClock(NOW), logger: log.logger, modules: [probeModule] }));
  appWithOrders = await startApp(
    createApp({ config: testConfig({ FEATURES: 'orders' }), db, clock: fixedClock(NOW), logger: memoryLogger().logger, modules: [probeModule] }),
  );
  broken = await startApp(
    createApp({ config: testConfig(), db: failingDb, clock: fixedClock(NOW), logger: memoryLogger().logger, modules: [] }),
  );
});
after(async () => {
  await Promise.all([app.close(), appWithOrders.close(), broken.close()]);
});

const cookie = (token) => ({ headers: { cookie: `vetcare_session=${token}` } });
const post = (token, body, headers = {}) => ({
  method: 'POST',
  headers: { origin: APP_ORIGIN, 'content-type': 'application/json', cookie: `vetcare_session=${token}`, ...headers },
  body,
});

test('health: liveness needs no database and exposes nothing else', async () => {
  const res = await broken.request('/api/health');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok' });
});

test('health/db: ok when the database answers', async () => {
  const res = await app.request('/api/health/db');
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { status: 'ok', database: 'ok' });
});

test('health/db: a database failure is UNEXPECTED (500) with no internal detail', async () => {
  const res = await broken.request('/api/health/db');
  const text = await res.text();
  assert.equal(res.status, 500);
  assert.deepEqual(JSON.parse(text), { code: 'UNEXPECTED' });
  assert.ok(!text.includes('secret-host'));
});

test('responses: JSON, no-store, no X-Powered-By', async () => {
  const res = await app.request('/api/health');
  assert.match(res.headers.get('content-type'), /application\/json/);
  assert.equal(res.headers.get('cache-control'), 'no-store');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('unknown routes: NOT_FOUND as JSON (never Express HTML), under /api and outside it', async () => {
  for (const path of ['/api/nope', '/api', '/something-else']) {
    const res = await app.request(path);
    assert.equal(res.status, 404, path);
    assert.deepEqual(await res.json(), { code: 'NOT_FOUND' }, path);
  }
});

test('origin guard: state-changing requests need the application Origin (CR-021)', async () => {
  const noOrigin = await app.request('/api/probe/echo', { method: 'POST', headers: { 'content-type': 'application/json', cookie: 'vetcare_session=owner' }, body: '{}' });
  assert.equal(noOrigin.status, 403);
  assert.deepEqual(await noOrigin.json(), { code: 'FORBIDDEN_ORIGIN' });

  const foreign = await app.request('/api/probe/echo', post('owner', '{}', { origin: 'https://evil.test' }));
  assert.equal(foreign.status, 403);

  const ok = await app.request('/api/probe/echo', post('owner', '{"a":1}'));
  assert.equal(ok.status, 201);
  assert.deepEqual(await ok.json(), { received: { a: 1 } });
});

test('origin guard: a body must be JSON', async () => {
  const res = await app.request('/api/probe/echo', post('owner', 'a=1', { 'content-type': 'application/x-www-form-urlencoded' }));
  assert.equal(res.status, 403);
  assert.deepEqual(await res.json(), { code: 'FORBIDDEN_ORIGIN' });
});

test('origin guard: GET requests do not need an Origin', async () => {
  assert.equal((await app.request('/api/probe/public')).status, 200);
});

test('malformed JSON body: VALIDATION_FAILED, not an HTML error page', async () => {
  const res = await app.request('/api/probe/echo', post('owner', '{not json'));
  assert.equal(res.status, 422);
  assert.deepEqual(await res.json(), { code: 'VALIDATION_FAILED' });
});

test('oversized JSON body: VALIDATION_FAILED', async () => {
  const res = await app.request('/api/probe/echo', post('owner', JSON.stringify({ pad: 'x'.repeat(200_000) })));
  assert.equal(res.status, 422);
});

test('guard: public route works without a session', async () => {
  assert.equal((await app.request('/api/probe/public')).status, 200);
});

test('guard: no session -> UNAUTHENTICATED; unknown or signed-out token too', async () => {
  for (const init of [undefined, cookie('unknown'), cookie('signedout')]) {
    const res = await app.request('/api/probe/owner', init);
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { code: 'UNAUTHENTICATED' });
  }
});

test('guard: idle-expired session -> SESSION_EXPIRED', async () => {
  const res = await app.request('/api/probe/owner', cookie('stale'));
  assert.equal(res.status, 401);
  assert.deepEqual(await res.json(), { code: 'SESSION_EXPIRED' });
});

test('guard: the other account type gets NOT_FOUND, like a nonexistent resource (CR-006)', async () => {
  const res = await app.request('/api/probe/provider', cookie('owner'));
  assert.equal(res.status, 404);
  assert.deepEqual(await res.json(), { code: 'NOT_FOUND' });
  assert.equal((await app.request('/api/probe/provider', cookie('provider'))).status, 200);
});

test('guard: identity comes from the session context (TB-3)', async () => {
  const res = await app.request('/api/probe/owner', cookie('owner'));
  assert.deepEqual(await res.json(), { who: '22222222-2222-4222-8222-222222222222' });
});

test('feature switch: a disabled slice is NOT_FOUND even with a valid session (CR-023)', async () => {
  const off = await app.request('/api/probe/orders', cookie('owner'));
  assert.equal(off.status, 404);
  const on = await appWithOrders.request('/api/probe/orders', cookie('owner'));
  assert.equal(on.status, 200);
});

test('feature switch: checked before the session, so the operation does not exist at all', async () => {
  const res = await app.request('/api/probe/orders'); // no session, feature off
  assert.equal(res.status, 404);
});

test('errors: a business Outcome keeps its code and status', async () => {
  const res = await app.request('/api/probe/outcome');
  assert.equal(res.status, 409);
  assert.deepEqual(await res.json(), { code: 'SLOT_UNAVAILABLE' });
});

test('errors: unexpected sync and async failures are UNEXPECTED JSON with no leak', async () => {
  for (const path of ['/api/probe/boom', '/api/probe/async-boom']) {
    const res = await app.request(path);
    const text = await res.text();
    assert.equal(res.status, 500, path);
    assert.deepEqual(JSON.parse(text), { code: 'UNEXPECTED' }, path);
    assert.ok(!/SuperSecret|db\.internal|at .*\.js|stack/i.test(text), 'no secret or stack in the body');
  }
});

test('logging: request lines carry method, path, status and outcome only', async () => {
  const before = log.lines.length;
  await app.request('/api/probe/owner?email=ana@x.co', cookie('owner'));
  const entry = JSON.parse(log.lines.at(-1));
  assert.equal(log.lines.length, before + 1);
  assert.equal(entry.event, 'request');
  assert.equal(entry.path, '/api/probe/owner'); // query string dropped
  assert.equal(entry.status, 200);
  const joined = log.lines.join('\n');
  assert.ok(!joined.includes('ana@x.co'));
  assert.ok(!joined.includes('vetcare_session'));
});

test('logging: unexpected errors log name/code (and message outside production) but never reach the response', async () => {
  const lines = log.lines.filter((line) => line.includes('request.unexpected_error'));
  assert.ok(lines.length >= 2);
  const asyncEntry = JSON.parse(lines.find((line) => line.includes('57P01')));
  assert.equal(asyncEntry.errorCode, '57P01');
});

test('logging: production logs omit the error message', async () => {
  const { logger, lines } = memoryLogger();
  const prod = await startApp(
    createApp({ config: testConfig({ NODE_ENV: 'production' }), db, clock: fixedClock(NOW), logger, modules: [probeModule] }),
  );
  try {
    await prod.request('/api/probe/boom');
  } finally {
    await prod.close();
  }
  const entry = JSON.parse(lines.find((line) => line.includes('request.unexpected_error')));
  assert.equal(entry.errorName, 'Error');
  assert.equal('errorMessage' in entry, false);
  assert.ok(!lines.join('').includes('SuperSecret'));
});
