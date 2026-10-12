// US-016 (IF-007) against PostgreSQL: cross-provider substring search and empty results.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { migrate } from '../src/db/migrator.js';
import { createSearchRouter } from '../src/modules/search/offerings.js';
import { hashSessionToken } from '../src/modules/identity/sessions.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_search_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-12T03:00:00Z');
let admin;
let pool;
let app;
let clinicId;
let independentId;

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });

  const ownerId = await createAccount('owner', 'Search Test Owner');
  clinicId = await createProvider('clinic', 'Clínica Central', 'Calle 1');
  independentId = await createProvider('independent', 'Veterinario Norte', null);
  await createSession(ownerId, 'search-owner');
  await createSession(clinicId, 'search-provider');
  await seedOfferings();
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

async function createProvider(type, name, address) {
  const id = await createAccount('provider', name);
  await admin.query(
    `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email, address)
     VALUES ($1, $2, $3, $4, $5)`,
    [id, type, name, `${randomUUID()}@example.test`, address],
  );
  return id;
}

async function createSession(accountId, token) {
  await admin.query(
    `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at)
     VALUES ($1, $2, $3, $3, $4)`,
    [hashSessionToken(token), accountId, new Date('2026-10-12T02:55:00Z'), new Date('2026-10-12T08:00:00Z')],
  );
}

async function seedOfferings() {
  await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
     VALUES ($1, 'clinic', 'service', 'Consulta VACÚNA', 65000, 'dog', 'clinic'),
            ($1, 'clinic', 'service', 'Piñata veterinaria', 30000, 'cat', 'both')`,
    [clinicId],
  );
  await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, available)
     VALUES ($1, 'independent', 'product', 'Vacuna felina', 42000, 'cat', false),
            ($1, 'independent', 'product', 'Alimento premium', 89000, 'dog', true),
            ($1, 'independent', 'product', 'Producto 50%_descuento', 10000, 'dog', true)`,
    [independentId],
  );
}

const ownerHeaders = { cookie: 'vetcare_session=search-owner' };

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

test('AC-038 / AC-039: matching offerings span clinic and independent providers and include details', { skip }, async () => {
  const response = await app.request('/api/search?q=vacuna', { headers: ownerHeaders });
  assert.equal(response.status, 200);
  const { results } = await response.json();
  assert.equal(results.length, 2);
  assert.deepEqual(results.map(({ kind, provider }) => [kind, provider.type]), [
    ['service', 'clinic'],
    ['product', 'independent'],
  ]);
  assert.deepEqual(results[0], {
    id: results[0].id,
    kind: 'service',
    name: 'Consulta VACÚNA',
    priceCop: 65000,
    species: 'dog',
    modality: 'clinic',
    provider: { id: clinicId, name: 'Clínica Central', type: 'clinic' },
  });
  assert.deepEqual(results[1], {
    id: results[1].id,
    kind: 'product',
    name: 'Vacuna felina',
    priceCop: 42000,
    species: 'cat',
    available: false,
    provider: { id: independentId, name: 'Veterinario Norte', type: 'independent' },
  });
});

test('search matches case and accents but keeps ñ distinct', { skip }, async () => {
  const accent = await app.request('/api/search?q=CONSULTA%20vacuna', { headers: ownerHeaders });
  assert.equal((await accent.json()).results.length, 1);

  const ñIsDistinct = await app.request('/api/search?q=pinata', { headers: ownerHeaders });
  assert.deepEqual(await ñIsDistinct.json(), { results: [] });
});

test('LIKE metacharacters are searched literally and no matches return an empty list', { skip }, async () => {
  const literal = await app.request('/api/search?q=%25_', { headers: ownerHeaders });
  assert.equal(literal.status, 200);
  const { results } = await literal.json();
  assert.equal(results.length, 1);
  assert.equal(results[0].name, 'Producto 50%_descuento');

  const noMatch = await app.request('/api/search?q=ninguno', { headers: ownerHeaders });
  assert.equal(noMatch.status, 200);
  assert.deepEqual(await noMatch.json(), { results: [] });
});

test('search is owner-only and validates required query text', { skip }, async () => {
  assert.equal((await app.request('/api/search?q=vacuna')).status, 401);
  assert.equal((await app.request('/api/search?q=vacuna', {
    headers: { cookie: 'vetcare_session=search-provider' },
  })).status, 404);

  const blank = await app.request('/api/search?q=%20%20', { headers: ownerHeaders });
  assert.equal(blank.status, 422);
  assert.deepEqual((await blank.json()).fields, [{ field: 'q', reason: 'REQUIRED' }]);
});
