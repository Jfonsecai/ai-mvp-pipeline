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
const schema = `vetcare_catalog_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-12T12:00:00Z');
let admin;
let pool;
let app;
let clinicId;
let independentId;
let ownerId;

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });

  ownerId = await createAccount('owner', 'Catalog Test Owner');
  clinicId = await createProvider('clinic', 'Catalog Test Clinic', 'Calle 1');
  independentId = await createProvider('independent', 'Catalog Test Vet', null);
  await createSession(clinicId, 'catalog-clinic');
  await createSession(independentId, 'catalog-independent');
  await createSession(ownerId, 'catalog-owner');

  app = await startApp(createApp({
    config: testConfig(),
    db: pool,
    clock: fixedClock(NOW),
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

function headers(token) {
  return {
    cookie: `vetcare_session=${token}`,
    origin: 'https://vetcare.test',
    'content-type': 'application/json',
  };
}

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

test('clinic service publication persists and appears only in the provider catalog', { skip }, async () => {
  const published = await app.request('/api/provider/services', {
    method: 'POST',
    headers: headers('catalog-clinic'),
    body: JSON.stringify({ name: 'Consulta primaria', priceCop: 65000, species: 'dog', modality: 'clinic' }),
  });
  assert.equal(published.status, 201);
  const created = await published.json();
  assert.match(created.id, /^[0-9a-f-]{36}$/i);
  assert.deepEqual(created, {
    id: created.id,
    kind: 'service',
    name: 'Consulta primaria',
    priceCop: 65000,
    species: 'dog',
    modality: 'clinic',
  });

  const saved = await admin.query(
    `SELECT provider_id, provider_type, kind, name, price_cop, species, modality
       FROM offering WHERE id = $1`,
    [created.id],
  );
  assert.deepEqual(saved.rows[0], {
    provider_id: clinicId,
    provider_type: 'clinic',
    kind: 'service',
    name: 'Consulta primaria',
    price_cop: 65000,
    species: 'dog',
    modality: 'clinic',
  });

  const clinicCatalog = await app.request('/api/provider/offerings', { headers: headers('catalog-clinic') });
  assert.deepEqual((await clinicCatalog.json()).services, [created]);
  const independentCatalog = await app.request('/api/provider/offerings', { headers: headers('catalog-independent') });
  assert.deepEqual((await independentCatalog.json()).services, []);
});

test('independent veterinarian publication always stores home modality', { skip }, async () => {
  const published = await app.request('/api/provider/services', {
    method: 'POST',
    headers: headers('catalog-independent'),
    body: JSON.stringify({ name: 'Visita veterinaria', priceCop: 45000, species: 'cat' }),
  });
  assert.equal(published.status, 201);
  const created = await published.json();
  assert.match(created.id, /^[0-9a-f-]{36}$/i);
  assert.deepEqual(created, {
    id: created.id,
    kind: 'service',
    name: 'Visita veterinaria',
    priceCop: 45000,
    species: 'cat',
    modality: 'home',
  });
  const catalog = await app.request('/api/provider/offerings', { headers: headers('catalog-independent') });
  assert.equal((await catalog.json()).services[0].modality, 'home');
  const row = await admin.query('SELECT provider_type, modality FROM offering WHERE provider_id = $1', [independentId]);
  assert.deepEqual(row.rows, [{ provider_type: 'independent', modality: 'home' }]);
});

test('invalid publication and non-provider access are rejected without writes', { skip }, async () => {
  const beforeCount = await admin.query('SELECT count(*)::integer AS count FROM offering');
  for (const body of [
    { name: 'Missing species', priceCop: 50000, modality: 'clinic' },
    { name: 'Missing modality', priceCop: 50000, species: 'dog' },
    { name: 'Missing price', species: 'dog', modality: 'clinic' },
    { name: 'Invalid species', priceCop: 50000, species: 'bird', modality: 'clinic' },
  ]) {
    const response = await app.request('/api/provider/services', {
      method: 'POST',
      headers: headers('catalog-clinic'),
      body: JSON.stringify(body),
    });
    assert.equal(response.status, 422);
    assert.equal((await response.json()).code, 'VALIDATION_FAILED');
  }

  const forbiddenModality = await app.request('/api/provider/services', {
    method: 'POST',
    headers: headers('catalog-independent'),
    body: JSON.stringify({ name: 'Clinic only', priceCop: 45000, species: 'cat', modality: 'clinic' }),
  });
  assert.equal(forbiddenModality.status, 422);

  const anonymous = await app.request('/api/provider/offerings');
  assert.equal(anonymous.status, 401);
  const owner = await app.request('/api/provider/offerings', { headers: headers('catalog-owner') });
  assert.equal(owner.status, 404);

  const afterCount = await admin.query('SELECT count(*)::integer AS count FROM offering');
  assert.equal(afterCount.rows[0].count, beforeCount.rows[0].count);
});
