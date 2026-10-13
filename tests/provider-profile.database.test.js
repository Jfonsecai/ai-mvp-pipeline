// US-008 against PostgreSQL: profile read/save through the real sign-up flow, persistence and constraints.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { createApp } from '../src/application.js';
import { migrate } from '../src/db/migrator.js';
import { createIdentityRouter } from '../src/modules/identity/sign-up.js';
import { createProviderProfileRouter } from '../src/modules/provider/profile.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_profile_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-12T12:00:00Z');
let admin;
let pool;
let app;

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url, options: `-c search_path=${schema}` });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });
  app = await startApp(createApp({
    config: testConfig(),
    db: pool,
    clock: fixedClock(NOW),
    modules: [{ createRouter: createIdentityRouter }, { createRouter: createProviderProfileRouter }],
  }));
});

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

async function signUp(providerType, address) {
  const email = `${providerType}-${randomUUID()}@example.test`;
  const response = await app.request('/api/auth/sign-up/provider', {
    method: 'POST',
    headers: { origin: 'https://vetcare.test', 'content-type': 'application/json' },
    body: JSON.stringify({ name: `Test ${providerType}`, email, password: 'a-long-password', providerType, ...(address ? { address } : {}) }),
  });
  assert.equal(response.status, 201);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  return { email, headers: { cookie, origin: 'https://vetcare.test', 'content-type': 'application/json' } };
}
const save = (headers, body) => app.request('/api/provider/profile', { method: 'PUT', headers, body: JSON.stringify(body) });
const read = (headers) => app.request('/api/provider/profile', { headers });
const row = async (email) => (await admin.query(
  `SELECT p.* FROM provider_profile p JOIN account a ON a.id = p.provider_id WHERE a.email = $1 AND a.account_type = 'provider'`,
  [email],
)).rows[0];

test('a new clinic reads its sign-up profile, saves new data (AC-023) and cannot remove its address (AC-106, EDGE-027)', { skip }, async () => {
  const { email, headers } = await signUp('clinic', 'Calle 1 # 2-3');
  const initial = await (await read(headers)).json();
  assert.deepEqual(initial, {
    providerType: 'clinic', publicName: 'Test clinic', contactPhone: null, contactEmail: email, address: 'Calle 1 # 2-3', profileCompleted: false,
  });

  const data = { publicName: 'Clínica Central', contactPhone: '+57 601 555 0100', contactEmail: 'Contacto@Example.test', address: 'Avenida 80 # 5-5' };
  const saved = await save(headers, data);
  assert.equal(saved.status, 200);
  const expected = { providerType: 'clinic', ...data, profileCompleted: true };
  assert.deepEqual(await saved.json(), expected);
  assert.deepEqual(await (await read(headers)).json(), expected);
  const stored = await row(email);
  assert.equal(stored.public_name, 'Clínica Central');
  assert.equal(stored.contact_phone, '+57 601 555 0100');
  assert.equal(stored.address, 'Avenida 80 # 5-5');
  assert.equal(stored.updated_at.toISOString(), NOW.toISOString());

  for (const address of [undefined, null, '   ']) {
    const { address: _omit, ...rest } = data;
    const rejected = await save(headers, address === undefined ? rest : { ...rest, address });
    assert.equal(rejected.status, 422);
    assert.deepEqual((await rejected.json()).fields, [{ field: 'address', reason: 'REQUIRED' }]);
  }
  assert.equal((await row(email)).address, 'Avenida 80 # 5-5');

  const accountName = await admin.query(`SELECT name, email FROM account WHERE email = $1 AND account_type = 'provider'`, [email]);
  assert.equal(accountName.rows[0].name, 'Test clinic', 'COMP-004 account data is not changed by a profile save');
});

test('an independent veterinarian saves with and without an address (AC-024)', { skip }, async () => {
  const { email, headers } = await signUp('independent');
  const data = { publicName: 'Dra. Ruiz', contactPhone: '3001234567', contactEmail: email };
  const saved = await save(headers, data);
  assert.equal(saved.status, 200);
  assert.deepEqual(await saved.json(), { providerType: 'independent', ...data, address: null, profileCompleted: true });
  assert.equal((await row(email)).address, null);

  const withAddress = await save(headers, { ...data, address: 'Carrera 7 # 10-20' });
  assert.equal((await withAddress.json()).address, 'Carrera 7 # 10-20');
  const cleared = await save(headers, { ...data, address: '' });
  assert.equal(cleared.status, 200);
  assert.equal((await cleared.json()).address, null);
  assert.equal((await row(email)).address, null);
});

test('providers only reach their own profile and a failed validation changes nothing', { skip }, async () => {
  const first = await signUp('independent');
  const second = await signUp('independent');
  const data = { publicName: 'First Vet', contactPhone: '3001112233', contactEmail: first.email };
  assert.equal((await save(first.headers, data)).status, 200);

  const secondProfile = await (await read(second.headers)).json();
  assert.equal(secondProfile.publicName, 'Test independent');
  assert.equal(secondProfile.contactPhone, null);

  const invalid = await save(first.headers, { ...data, publicName: 'Changed', contactPhone: 'not a phone' });
  assert.equal(invalid.status, 422);
  assert.equal((await row(first.email)).public_name, 'First Vet');
  assert.equal((await app.request('/api/provider/profile')).status, 401);
});

test('database constraints back the profile rules (clinic address, phone characters)', { skip }, async () => {
  const { email } = await signUp('clinic', 'Calle 9');
  const id = (await row(email)).provider_id;
  await assert.rejects(admin.query('UPDATE provider_profile SET address = NULL WHERE provider_id = $1', [id]), { constraint: 'clinic_address_required' });
  await assert.rejects(admin.query(`UPDATE provider_profile SET contact_phone = 'abc' WHERE provider_id = $1`, [id]), { code: '23514' });
});
