import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { createApp } from '../src/application.js';
import { migrate } from '../src/db/migrator.js';
import { createIdentityRouter } from '../src/modules/identity/sign-up.js';
import { startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_signup_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
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

test('provider sign-up integration: other account type is allowed, same provider type is rejected', { skip }, async () => {
  const email = `same-${randomUUID()}@example.test`;
  await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash)
     VALUES ('owner', 'Pet owner', $1, 'owner-test-hash')`,
    [email],
  );
  const app = createApp({ config: testConfig(), db: pool, modules: [{ createRouter: createIdentityRouter }] });
  const server = await startApp(app);
  const send = () => server.request('/api/auth/sign-up/provider', {
    method: 'POST',
    headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Independent Vet', email, password: 'password1', providerType: 'independent' }),
  });
  try {
    const created = await send();
    assert.equal(created.status, 201);
    assert.match(created.headers.get('set-cookie'), /HttpOnly; Secure; SameSite=Lax/);
    const accounts = await admin.query('SELECT account_type, password_hash FROM account WHERE email = $1 ORDER BY account_type', [email]);
    assert.deepEqual(accounts.rows.map((row) => row.account_type), ['owner', 'provider']);
    assert.match(accounts.rows.find((row) => row.account_type === 'provider').password_hash, /^\$argon2id\$/);
    const profile = await admin.query(
      `SELECT provider_type, address FROM provider_profile pp JOIN account a ON a.id = pp.provider_id WHERE a.email = $1`,
      [email],
    );
    assert.deepEqual(profile.rows, [{ provider_type: 'independent', address: null }]);

    const duplicate = await send();
    assert.equal(duplicate.status, 409);
    assert.deepEqual(await duplicate.json(), { code: 'DUPLICATE_ACCOUNT_FOR_TYPE' });
  } finally {
    await server.close();
  }
});
