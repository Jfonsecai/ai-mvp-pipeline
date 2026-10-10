// Database tests. They need a PostgreSQL server and run only when TEST_DATABASE_URL is set
// (a throwaway database; see .env.example). Without it they are reported as skipped, which is
// NOT_RUN, not passed. Every run works in its own schema and drops it afterwards.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { migrate, migrationStatus } from '../src/db/migrator.js';
import { withTransaction } from '../src/shared/transaction.js';
import { createDatabase } from '../src/db/database.js';
import { generateSessionToken, hashSessionToken, resolveSession } from '../src/modules/identity/sessions.js';
import { ROOT } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database tests NOT_RUN)';
const schema = `vetcare_test_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(ROOT, 'migrations');

let admin; // single connection that creates and drops the schema and runs the migrations
let pool; // application-style pool pinned to the test schema

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url, options: `-c search_path=${schema}` });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });
});

after(async () => {
  if (skip) return;
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

test('migrate: applies the initial schema once and is idempotent', { skip }, async () => {
  assert.deepEqual(await migrationStatus(admin, migrationsDir), [{ name: '001_initial_schema.sql', state: 'pending' }]);
  assert.deepEqual(await migrate(admin, migrationsDir), ['001_initial_schema.sql']);
  assert.deepEqual(await migrate(admin, migrationsDir), [], 'second run applies nothing');
  assert.deepEqual(await migrationStatus(admin, migrationsDir), [{ name: '001_initial_schema.sql', state: 'applied' }]);

  const { rows } = await admin.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = $1 AND table_type = 'BASE TABLE' ORDER BY 1`,
    [schema],
  );
  assert.deepEqual(
    rows.map((r) => r.table_name),
    ['account', 'appointment', 'offering', 'pet', 'product_order', 'provider_profile', 'schema_migration', 'session', 'working_hours'],
  );
});

test('migrate: an applied file that was edited is rejected; a failing file rolls back', { skip }, async () => {
  const dir = await mkdtemp(join(tmpdir(), 'vetcare-mig-'));
  try {
    await writeFile(join(dir, '001_a.sql'), 'CREATE TABLE mig_a (\n  id int\n);\n');
    await migrate(admin, dir);
    await writeFile(join(dir, '001_a.sql'), 'CREATE TABLE mig_a (\r\n  id int\r\n);\r\n'); // same file, CRLF checkout
    assert.equal((await migrationStatus(admin, dir))[0].state, 'applied', 'line endings alone are not a change');
    await writeFile(join(dir, '001_a.sql'), 'CREATE TABLE mig_a (id bigint);');
    await assert.rejects(migrate(admin, dir), /already applied but its file has changed/);
    assert.equal((await migrationStatus(admin, dir))[0].state, 'modified');

    await writeFile(join(dir, '001_a.sql'), 'CREATE TABLE mig_a (\n  id int\n);\n');
    await writeFile(join(dir, '002_bad.sql'), 'CREATE TABLE mig_b (id int); SELECT * FROM table_that_does_not_exist;');
    await assert.rejects(migrate(admin, dir), /table_that_does_not_exist/);
    const { rows } = await admin.query(`SELECT to_regclass('mig_b') AS t`);
    assert.equal(rows[0].t, null, 'the failed migration left nothing behind');
    assert.deepEqual((await migrationStatus(admin, dir)).map((m) => m.state), ['applied', 'pending']);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

async function insertIndependentVetWithService() {
  const owner = (await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash) VALUES ('owner', 'Ana', $1, 'x') RETURNING id`,
    [`ana-${randomUUID()}@test.co`],
  )).rows[0].id;
  const provider = (await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash) VALUES ('provider', 'Vet', $1, 'x') RETURNING id`,
    [`vet-${randomUUID()}@test.co`],
  )).rows[0].id;
  await admin.query(
    `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email) VALUES ($1, 'independent', 'Vet', 'vet@test.co')`,
    [provider],
  );
  const service = (await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
     VALUES ($1, 'independent', 'service', 'Consulta', 50000, 'dog', 'home') RETURNING id`,
    [provider],
  )).rows[0].id;
  const pet = (await admin.query(
    `INSERT INTO pet (owner_id, name, species, breed, age_years) VALUES ($1, 'Rex', 'dog', 'Criollo', 3) RETURNING id`,
    [owner],
  )).rows[0].id;
  return { owner, provider, service, pet };
}

const bookingSql = `INSERT INTO appointment (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, visit_address)
                    VALUES ($1, $2, $3, $4, 'independent', '2026-10-12T14:00:00Z', 'home', 'Calle 1')`;

test('schema: a second booking of an independent veterinarian slot is rejected (BR-013, 23505)', { skip }, async () => {
  const { owner, provider, service, pet } = await insertIndependentVetWithService();
  await admin.query(bookingSql, [owner, pet, service, provider]);
  await assert.rejects(admin.query(bookingSql, [owner, pet, service, provider]), (error) => error.code === '23505');
});

test('schema: a clinic profile without an address is rejected (TD-08, 23514)', { skip }, async () => {
  const provider = (await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash) VALUES ('provider', 'C', $1, 'x') RETURNING id`,
    [`c-${randomUUID()}@test.co`],
  )).rows[0].id;
  await assert.rejects(
    admin.query(`INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email) VALUES ($1, 'clinic', 'C', 'c@test.co')`, [provider]),
    (error) => error.code === '23514',
  );
});

test('withTransaction: commits on success and rolls back on failure', { skip }, async () => {
  await pool.query('CREATE TABLE IF NOT EXISTS tx_probe (n int)');
  await withTransaction(pool, (client) => client.query('INSERT INTO tx_probe VALUES (1)'));
  await assert.rejects(
    withTransaction(pool, async (client) => {
      await client.query('INSERT INTO tx_probe VALUES (2)');
      throw new Error('abort');
    }),
    /abort/,
  );
  const { rows } = await pool.query('SELECT n FROM tx_probe ORDER BY n');
  assert.deepEqual(rows.map((r) => r.n), [1]);
});

test('resolveSession against the real schema: active, ended, idle-expired', { skip }, async () => {
  const accountId = (await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash) VALUES ('owner', 'S', $1, 'x') RETURNING id`,
    [`s-${randomUUID()}@test.co`],
  )).rows[0].id;
  const now = new Date();
  const insert = async (token, { seenMinutesAgo = 1, ended = false } = {}) =>
    admin.query(
      `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at, ended_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        hashSessionToken(token),
        accountId,
        new Date(now.getTime() - 3_600_000 * 2),
        new Date(now.getTime() - seenMinutesAgo * 60_000),
        new Date(now.getTime() + 3_600_000 * 10),
        ended ? now : null,
      ],
    );
  const [active, idle, ended] = [generateSessionToken(), generateSessionToken(), generateSessionToken()];
  await insert(active);
  await insert(idle, { seenMinutesAgo: 61 });
  await insert(ended, { ended: true });

  const limits = { idleMinutes: 60 };
  assert.deepEqual(await resolveSession(pool, active, now, limits), { state: 'active', accountId, accountType: 'owner' });
  assert.deepEqual(await resolveSession(pool, idle, now, limits), { state: 'expired' });
  assert.deepEqual(await resolveSession(pool, ended, now, limits), { state: 'none' });
  assert.deepEqual(await resolveSession(pool, generateSessionToken(), now, limits), { state: 'none' });

  const { rows } = await admin.query('SELECT last_seen_at FROM session WHERE token_hash = $1', [hashSessionToken(active)]);
  assert.equal(rows[0].last_seen_at.getTime(), now.getTime(), 'the last use of the active session was updated');
});

test('createDatabase: ping works with a URL; without one it fails with a message that has no connection details', { skip }, async () => {
  const configured = createDatabase({ databaseUrl: url });
  await configured.ping();
  await configured.end();

  const unconfigured = createDatabase({});
  await assert.rejects(unconfigured.ping(), (error) => error.message === 'DATABASE_URL is not configured');
});
