import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createApp } from '../src/application.js';
import { migrate } from '../src/db/migrator.js';
import { createIdentityRouter } from '../src/modules/identity/sign-up.js';
import { generateSessionToken, hashSessionToken } from '../src/modules/identity/sessions.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_signout_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-11T15:00:00Z');
let admin;
let pool;

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url, options: `-c search_path=${schema}` });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });
});

after(async () => {
  if (skip) return;
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

test('sign-out ends only the cookie session in PostgreSQL and blocks it on protected routes', { skip }, async () => {
  const accountId = randomUUID();
  const token = generateSessionToken();
  await admin.query("INSERT INTO account (id, account_type, name, email, password_hash) VALUES ($1, 'owner', 'Owner', $2, 'unused')", [accountId, `${accountId}@example.test`]);
  await admin.query(
    'INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at) VALUES ($1, $2, $3, $3, $4)',
    [hashSessionToken(token), accountId, NOW, new Date(NOW.getTime() + 60_000)],
  );
  const app = createApp({ config: testConfig(), db: pool, clock: fixedClock(NOW), modules: [{ createRouter: createIdentityRouter }] });
  const server = await startApp(app);
  try {
    const response = await server.request('/api/auth/sign-out', {
      method: 'POST',
      headers: { Origin: 'https://vetcare.test', Cookie: `vetcare_session=${token}` },
    });
    assert.equal(response.status, 204);
    assert.match(response.headers.get('set-cookie'), /^vetcare_session=; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=0$/);

    const result = await admin.query('SELECT ended_at FROM session WHERE token_hash = $1', [hashSessionToken(token)]);
    assert.equal(result.rows[0].ended_at.toISOString(), NOW.toISOString());
    const current = await server.request('/api/session', { headers: { Cookie: `vetcare_session=${token}` } });
    assert.deepEqual(await current.json(), { state: 'none', features: [] });
  } finally {
    await server.close();
  }
});
