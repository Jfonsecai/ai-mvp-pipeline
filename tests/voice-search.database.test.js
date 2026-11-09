// US-035 (IF-041) against PostgreSQL: POST /api/search/voice uses the same search as typing (BR-042),
// applies the spoken species, retries with species words kept (BR-053) and excludes removed offerings.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/application.js';
import { migrate } from '../src/db/migrator.js';
import { createSearchRouter } from '../src/modules/search/offerings.js';
import { hashSessionToken } from '../src/modules/identity/sessions.js';
import { APP_ORIGIN, fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_voice_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-12T03:00:00Z');
let admin;
let pool;
let app;

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });

  const owner = await createAccount('owner', 'Voice Owner');
  const clinic = await createAccount('provider', 'Clínica Voz');
  await admin.query(
    `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email, address)
     VALUES ($1, 'clinic', 'Clínica Voz', 'voz@example.test', 'Calle 2')`,
    [clinic],
  );
  for (const [id, token] of [[owner, 'voice-owner'], [clinic, 'voice-provider']]) {
    await admin.query(
      `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at)
       VALUES ($1, $2, $3, $3, $4)`,
      [hashSessionToken(token), id, new Date('2026-10-12T02:55:00Z'), new Date('2026-10-12T08:00:00Z')],
    );
  }
  await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality, removed_at)
     VALUES ($1, 'clinic', 'service', 'Vacunación', 50000, 'dog', 'clinic', NULL),
            ($1, 'clinic', 'service', 'Vacunación', 52000, 'cat', 'clinic', NULL),
            ($1, 'clinic', 'service', 'Baño', 40000, 'cat', 'both', NULL),
            ($1, 'clinic', 'service', 'Vacunación retirada', 10000, 'dog', 'clinic', now())`,
    [clinic],
  );
  await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, available)
     VALUES ($1, 'clinic', 'product', 'Alimento para gato adulto', 90000, 'cat', true)`,
    [clinic],
  );
  app = await startApp(createApp({
    config: testConfig(),
    db: pool,
    clock: fixedClock(NOW),
    modules: [{ createRouter: createSearchRouter }],
  }));
});

async function createAccount(type, name) {
  const result = await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash)
     VALUES ($1, $2, $3, 'test-hash') RETURNING id`,
    [type, name, `${type}-${randomUUID()}@example.test`],
  );
  return result.rows[0].id;
}

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

function voice(body, token = 'voice-owner') {
  return app.request('/api/search/voice', {
    method: 'POST',
    headers: { cookie: `vetcare_session=${token}`, origin: APP_ORIGIN, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('AC-115 / AC-117 / BR-042: spoken species filters; results equal the typed search; removed offerings excluded', { skip }, async () => {
  const response = await voice({ transcript: 'busco vacunación para mi perro' });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.transcript, 'busco vacunación para mi perro');
  assert.equal(body.outcome, 'searched');
  assert.equal(body.query, 'vacunación');
  assert.equal(body.species, 'dog');
  assert.equal(body.retried, false);
  assert.deepEqual(body.results.map((r) => [r.name, r.species, r.priceCop]), [['Vacunación', 'dog', 50000]]);

  const typed = await app.request('/api/search?q=vacunaci%C3%B3n&species=dog', { headers: { cookie: 'vetcare_session=voice-owner' } });
  assert.deepEqual((await typed.json()).results, body.results);
});

test('AC-119: no spoken species keeps the current filter', { skip }, async () => {
  const body = await (await voice({ transcript: 'necesito un baño', species: 'cat' })).json();
  assert.equal(body.query, 'baño');
  assert.equal(body.species, 'cat');
  assert.equal(body.results.length, 1);
});

test('AC-120: only fillers and species → empty_query, no search', { skip }, async () => {
  const body = await (await voice({ transcript: 'para mi gato' })).json();
  assert.deepEqual(body, { transcript: 'para mi gato', outcome: 'empty_query', species: 'cat', retried: false, results: [] });
});

test('AC-159 / BR-053: an offering name with a species word is found by the retry', { skip }, async () => {
  const body = await (await voice({ transcript: 'alimento para gato adulto' })).json();
  assert.equal(body.retried, true);
  assert.equal(body.query, 'alimento para gato adulto');
  assert.equal(body.species, 'cat');
  assert.deepEqual(body.results.map((r) => r.name), ['Alimento para gato adulto']);
});

test('validation and access: missing transcript, wrong species, provider session', { skip }, async () => {
  const missing = await voice({});
  assert.equal(missing.status, 422);
  assert.deepEqual(await missing.json(), { code: 'VALIDATION_FAILED', fields: [{ field: 'transcript', reason: 'REQUIRED' }] });
  const badSpecies = await voice({ transcript: 'baño', species: 'bird' });
  assert.equal(badSpecies.status, 422);
  const provider = await voice({ transcript: 'baño' }, 'voice-provider');
  assert.equal(provider.status, 404); // BR-041: owner-only, other type → NOT_FOUND (CR-006)
});
