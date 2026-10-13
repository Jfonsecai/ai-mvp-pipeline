import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import argon2 from 'argon2';
import pg from 'pg';
import { createApp } from '../src/application.js';
import { migrate } from '../src/db/migrator.js';
import { createIdentityRouter } from '../src/modules/identity/sign-up.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_signin_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-11T15:00:00Z');
let admin;
let pool;

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url, options: `-c search_path=${schema}` });
  await admin.connect(); await admin.query(`CREATE SCHEMA ${schema}`); await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });
});

after(async () => {
  if (skip) return;
  await pool.end(); await admin.query('SET search_path TO public'); await admin.query(`DROP SCHEMA ${schema} CASCADE`); await admin.end();
});

test('sign-in selects the requested account type, hides credential failures, guards roles and reports expiry', { skip }, async () => {
  const email = `both-${randomUUID()}@example.test`;
  const ownerId = randomUUID();
  const providerId = randomUUID();
  const ownerHash = await argon2.hash('owner-pass-123', { type: argon2.argon2id });
  const providerHash = await argon2.hash('provider-pass-123', { type: argon2.argon2id });
  await admin.query('INSERT INTO account (id, account_type, name, email, password_hash) VALUES ($1, $2, $3, $4, $5), ($6, $7, $8, $4, $9)',
    [ownerId, 'owner', 'Owner', email, ownerHash, providerId, 'provider', 'Provider', providerHash]);

  const roleProbe = { createRouter({ guard }) {
    const router = Router();
    router.get('/_test/provider-only', guard({ role: 'provider' }), (_req, res) => res.json({ ok: true }));
    return router;
  } };
  const app = createApp({ config: testConfig(), db: pool, clock: fixedClock(NOW), modules: [{ createRouter: createIdentityRouter }, roleProbe] });
  const server = await startApp(app);
  const signIn = (accountType, password) => server.request('/api/auth/sign-in', {
    method: 'POST', headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ` ${email.toUpperCase()} `, password, accountType }),
  });
  const requestWith = (path, cookie) => server.request(path, { headers: { Cookie: cookie } });
  try {
    assert.deepEqual(await (await requestWith('/api/session', '')).json(), { state: 'none', features: [] });
    const owner = await signIn('owner', 'owner-pass-123');
    assert.equal(owner.status, 200);
    assert.deepEqual(await owner.json(), { accountType: 'owner', features: [] });
    const ownerCookie = owner.headers.get('set-cookie');
    assert.match(ownerCookie, /^vetcare_session=[A-Za-z0-9_-]+; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=43200$/);
    const ownerSession = await requestWith('/api/session', ownerCookie.split(';')[0]);
    assert.deepEqual(await ownerSession.json(), { state: 'active', accountType: 'owner', features: [] });
    assert.equal((await requestWith('/api/_test/provider-only', ownerCookie.split(';')[0])).status, 404);

    const provider = await signIn('provider', 'provider-pass-123');
    assert.equal(provider.status, 200);
    assert.deepEqual(await provider.json(), { accountType: 'provider', features: [] });
    const providerCookie = provider.headers.get('set-cookie').split(';')[0];
    assert.deepEqual(await (await requestWith('/api/session', providerCookie)).json(), { state: 'active', accountType: 'provider', features: [] });
    assert.deepEqual(await (await requestWith('/api/_test/provider-only', providerCookie)).json(), { ok: true });

    const wrongPassword = await signIn('owner', 'wrong-pass-123');
    const wrongEmail = await server.request('/api/auth/sign-in', {
      method: 'POST', headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: `missing-${email}`, password: 'owner-pass-123', accountType: 'owner' }),
    });
    const unregisteredType = await signIn('provider', 'owner-pass-123');
    assert.equal(wrongPassword.status, 401);
    assert.equal(wrongEmail.status, 401);
    assert.equal(unregisteredType.status, 401);
    assert.deepEqual(await wrongPassword.json(), { code: 'INVALID_CREDENTIALS' });
    assert.deepEqual(await wrongEmail.json(), { code: 'INVALID_CREDENTIALS' });
    assert.deepEqual(await unregisteredType.json(), { code: 'INVALID_CREDENTIALS' });
    assert.equal(wrongPassword.headers.get('set-cookie'), null);

    await admin.query('UPDATE session SET last_seen_at = $2 WHERE token_hash = $1', [
      (await import('../src/modules/identity/sessions.js')).hashSessionToken(providerCookie.split('=')[1]),
      new Date(NOW.getTime() - 61 * 60 * 1000),
    ]);
    const expired = await requestWith('/api/session', providerCookie);
    assert.deepEqual(await expired.json(), { state: 'expired', features: [] });
    const expiredGuard = await requestWith('/api/_test/provider-only', providerCookie);
    assert.equal(expiredGuard.status, 401);
    assert.deepEqual(await expiredGuard.json(), { code: 'SESSION_EXPIRED' });
  } finally { await server.close(); }
});
