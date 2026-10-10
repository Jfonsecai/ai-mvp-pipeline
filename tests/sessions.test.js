import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateSessionToken,
  hashSessionToken,
  readCookie,
  resolveSession,
} from '../src/modules/identity/sessions.js';
import { fakeSessionDb } from './helpers.js';

const NOW = new Date('2026-10-12T15:00:00Z');
const limits = { idleMinutes: 60 };
const minutes = (n) => new Date(NOW.getTime() + n * 60_000);

const row = (overrides = {}) => ({
  account_id: '11111111-1111-4111-8111-111111111111',
  account_type: 'owner',
  last_seen_at: minutes(-5),
  absolute_expires_at: minutes(600),
  ended_at: null,
  ...overrides,
});

test('token: 32 random bytes encoded, and a 32-byte SHA-256 hash', () => {
  const a = generateSessionToken();
  const b = generateSessionToken();
  assert.notEqual(a, b);
  assert.equal(Buffer.from(a, 'base64url').length, 32);
  assert.equal(hashSessionToken(a).length, 32);
  assert.deepEqual(hashSessionToken(a), hashSessionToken(a));
});

test('cookie: reads one named cookie from the header', () => {
  assert.equal(readCookie('a=1; vetcare_session=tok; b=2', 'vetcare_session'), 'tok');
  assert.equal(readCookie('vetcare_session=', 'vetcare_session'), undefined);
  assert.equal(readCookie('other=1', 'vetcare_session'), undefined);
  assert.equal(readCookie(undefined, 'vetcare_session'), undefined);
});

test('resolve: no token or unknown token -> none', async () => {
  const db = fakeSessionDb({});
  assert.deepEqual(await resolveSession(db, undefined, NOW, limits), { state: 'none' });
  assert.deepEqual(await resolveSession(db, 'unknown', NOW, limits), { state: 'none' });
  assert.equal(db.updates.length, 0);
});

test('resolve: an ended session (sign-out) -> none, even if it would also be expired', async () => {
  const db = fakeSessionDb({ t1: row({ ended_at: minutes(-1) }), t2: row({ ended_at: minutes(-1), last_seen_at: minutes(-500) }) });
  assert.deepEqual(await resolveSession(db, 't1', NOW, limits), { state: 'none' });
  assert.deepEqual(await resolveSession(db, 't2', NOW, limits), { state: 'none' });
});

test('resolve: idle for 60 minutes -> expired; 59 minutes -> active', async () => {
  const db = fakeSessionDb({ idle: row({ last_seen_at: minutes(-60) }), ok: row({ last_seen_at: minutes(-59) }) });
  assert.deepEqual(await resolveSession(db, 'idle', NOW, limits), { state: 'expired' });
  assert.equal((await resolveSession(db, 'ok', NOW, limits)).state, 'active');
});

test('resolve: past the 12-hour absolute expiry -> expired even if recently used', async () => {
  const db = fakeSessionDb({ old: row({ last_seen_at: minutes(-1), absolute_expires_at: minutes(-1) }) });
  assert.deepEqual(await resolveSession(db, 'old', NOW, limits), { state: 'expired' });
  assert.equal(db.updates.length, 0, 'an expired session is not extended');
});

test('resolve: active returns account and type, and records the last use', async () => {
  const db = fakeSessionDb({ good: row({ account_type: 'provider' }) });
  const result = await resolveSession(db, 'good', NOW, limits);
  assert.deepEqual(result, {
    state: 'active',
    accountId: '11111111-1111-4111-8111-111111111111',
    accountType: 'provider',
  });
  assert.equal(db.updates.length, 1);
  assert.equal(db.updates[0].at, NOW);
  assert.equal(db.updates[0].hash, hashSessionToken('good').toString('hex'));
});
