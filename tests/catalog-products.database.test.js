// US-013 against PostgreSQL: product publication persists as available, stays provider-scoped
// and is blocked by the offering constraints when bypassed.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { migrate } from '../src/db/migrator.js';
import { createCatalogRouter } from '../src/modules/catalog/offerings.js';
import { hashSessionToken } from '../src/modules/identity/sessions.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_products_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
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

  const owner = await createAccount('owner', 'Product Test Owner');
  clinicId = await createProvider('clinic', 'Product Test Clinic', 'Calle 1');
  independentId = await createProvider('independent', 'Product Test Vet', null);
  await createSession(clinicId, 'product-clinic');
  await createSession(independentId, 'product-independent');
  await createSession(owner, 'product-owner');

  app = await startApp(createApp({
    config: testConfig(),
    db: pool,
    clock: fixedClock(new Date('2026-10-12T12:00:00Z')),
    modules: [{ createRouter: createCatalogRouter }],
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
    [hashSessionToken(token), accountId, new Date('2026-10-12T11:55:00Z'), new Date('2026-10-12T20:00:00Z')],
  );
}

const headers = (token) => ({ cookie: `vetcare_session=${token}`, origin: 'https://vetcare.test', 'content-type': 'application/json' });
const publish = (token, body) => app.request('/api/provider/products', { method: 'POST', headers: headers(token), body: JSON.stringify(body) });
const count = async (providerId) => (await admin.query('SELECT count(*)::int AS n FROM offering WHERE provider_id = $1', [providerId])).rows[0].n;

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

test('a clinic product is stored as an available product and listed only in that provider catalog (AC-033, AC-111)', { skip }, async () => {
  const response = await publish('product-clinic', { name: '  Concentrado adulto  ', priceCop: 89000, species: 'dog' });
  assert.equal(response.status, 201);
  const created = await response.json();
  assert.deepEqual(created, { id: created.id, kind: 'product', name: 'Concentrado adulto', priceCop: 89000, species: 'dog', available: true });

  const stored = (await admin.query(
    'SELECT provider_id, provider_type, kind, name, price_cop, species, modality, available FROM offering WHERE id = $1',
    [created.id],
  )).rows[0];
  assert.deepEqual(stored, {
    provider_id: clinicId, provider_type: 'clinic', kind: 'product', name: 'Concentrado adulto',
    price_cop: 89000, species: 'dog', modality: null, available: true,
  });

  const own = await (await app.request('/api/provider/offerings', { headers: headers('product-clinic') })).json();
  assert.deepEqual(own.products, [created]);
  assert.deepEqual(own.services, []);
  const other = await (await app.request('/api/provider/offerings', { headers: headers('product-independent') })).json();
  assert.deepEqual(other.products, []);
});

test('an independent veterinarian product is stored under its own provider (AC-033)', { skip }, async () => {
  const response = await publish('product-independent', { name: 'Collar antipulgas', priceCop: 25000, species: 'cat' });
  assert.equal(response.status, 201);
  const created = await response.json();
  const stored = (await admin.query('SELECT provider_id, provider_type, kind, available FROM offering WHERE id = $1', [created.id])).rows[0];
  assert.deepEqual(stored, { provider_id: independentId, provider_type: 'independent', kind: 'product', available: true });
});

test('rejected products write nothing: missing species (AC-034), missing price (AC-084), bad values, wrong role', { skip }, async () => {
  const before = await count(clinicId);
  const noSpecies = await publish('product-clinic', { name: 'Arena', priceCop: 9000 });
  assert.equal(noSpecies.status, 422);
  assert.deepEqual((await noSpecies.json()).fields, [{ field: 'species', reason: 'REQUIRED' }]);
  const noPrice = await publish('product-clinic', { name: 'Arena', species: 'cat' });
  assert.deepEqual((await noPrice.json()).fields, [{ field: 'priceCop', reason: 'REQUIRED' }]);
  for (const body of [
    { name: 'Arena', priceCop: 0, species: 'cat' },
    { name: 'Arena', priceCop: 9000, species: 'bird' },
    { name: '   ', priceCop: 9000, species: 'cat' },
    { name: 'Arena', priceCop: 9000, species: 'cat', available: false },
    { name: 'Arena', priceCop: 9000, species: 'cat', modality: 'home' },
  ]) assert.equal((await publish('product-clinic', body)).status, 422, JSON.stringify(body));
  assert.equal((await publish('product-owner', { name: 'Arena', priceCop: 9000, species: 'cat' })).status, 404);
  assert.equal(await count(clinicId), before);
});

test('the offering constraints stay a second layer behind the API (product shape)', { skip }, async () => {
  const insert = (fields) => admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality, available)
     VALUES ($1, 'clinic', 'product', $2, $3, $4, $5, $6)`,
    [clinicId, ...fields],
  );
  await assert.rejects(insert(['X', 1000, 'dog', 'clinic', true]), { constraint: 'offering_kind_fields' });
  await assert.rejects(insert(['X', 1000, 'dog', null, null]), { constraint: 'offering_kind_fields' });
  await assert.rejects(insert(['X', 0, 'dog', null, true]), { code: '23514' });
  await assert.rejects(insert(['X', 1000, 'bird', null, true]), { code: '23514' });
});
