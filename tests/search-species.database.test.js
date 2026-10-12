// US-017 against PostgreSQL: the species filter on real rows (AC-041, AC-042, AC-043, AC-086).
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
const schema = `vetcare_species_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
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

  const noPets = await createAccount('owner', 'Owner without pets');
  const dogOwner = await createAccount('owner', 'Owner with a dog');
  await admin.query(
    `INSERT INTO pet (owner_id, name, species, breed, age_years) VALUES ($1, 'Rex', 'dog', 'Mixed', 3)`,
    [dogOwner],
  );
  const clinic = await createProvider('clinic', 'Clínica Central', 'Calle 1');
  const independent = await createProvider('independent', 'Veterinario Norte', null);
  await createSession(noPets, 'species-no-pets');
  await createSession(dogOwner, 'species-dog-owner');
  await createSession(clinic, 'species-provider');

  await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
     VALUES ($1, 'clinic', 'service', 'Vacuna anual', 60000, 'dog', 'clinic'),
            ($1, 'clinic', 'service', 'Vacuna anual', 55000, 'cat', 'both'),
            ($1, 'clinic', 'service', 'Baño y corte', 30000, 'dog', 'home')`,
    [clinic],
  );
  await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, available)
     VALUES ($1, 'independent', 'product', 'Vacuna felina de refuerzo', 42000, 'cat', true),
            ($1, 'independent', 'product', 'Alimento para perro', 89000, 'dog', false),
            ($1, 'independent', 'product', 'Alimento para gato', 79000, 'cat', true),
            ($1, 'independent', 'product', 'Descuento 50%_', 10000, 'cat', true)`,
    [independent],
  );
  app = await startApp(createApp({
    config: testConfig(),
    db: pool,
    clock: fixedClock(new Date('2026-10-12T03:00:00Z')),
    modules: [{ createRouter: createSearchRouter }],
  }));
});

async function createAccount(type, name) {
  const result = await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash) VALUES ($1, $2, $3, 'test-hash') RETURNING id`,
    [type, name, `${type}-${randomUUID()}@example.test`],
  );
  return result.rows[0].id;
}

async function createProvider(type, name, address) {
  const id = await createAccount('provider', name);
  await admin.query(
    `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email, address) VALUES ($1, $2, $3, $4, $5)`,
    [id, type, name, `${randomUUID()}@example.test`, address],
  );
  return id;
}

async function createSession(accountId, token) {
  await admin.query(
    `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at) VALUES ($1, $2, $3, $3, $4)`,
    [hashSessionToken(token), accountId, new Date('2026-10-12T02:55:00Z'), new Date('2026-10-12T08:00:00Z')],
  );
}

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

const search = async (query, cookie = 'species-no-pets') => {
  const response = await app.request(`/api/search?${query}`, { headers: { cookie: `vetcare_session=${cookie}` } });
  return { status: response.status, body: await response.json() };
};
const names = ({ body }) => body.results.map((r) => `${r.name}|${r.species}`).sort();

test('AC-041: a dog or cat filter returns only offerings of that species (services and products)', { skip }, async () => {
  const dog = await search('q=alimento&species=dog');
  assert.deepEqual(names(dog), ['Alimento para perro|dog']);
  const cat = await search('q=alimento&species=cat');
  assert.deepEqual(names(cat), ['Alimento para gato|cat']);
  const vaccineDog = await search('q=vacuna&species=dog');
  assert.deepEqual(names(vaccineDog), ['Vacuna anual|dog']);
  assert.ok(vaccineDog.body.results.every((r) => r.species === 'dog'));
  const vaccineCat = await search('q=vacuna&species=cat');
  assert.deepEqual(names(vaccineCat), ['Vacuna anual|cat', 'Vacuna felina de refuerzo|cat']);
});

test('AC-043: "all" and no filter show both species again, with identical results', { skip }, async () => {
  const none = await search('q=vacuna');
  const all = await search('q=vacuna&species=all');
  assert.deepEqual(names(none), ['Vacuna anual|cat', 'Vacuna anual|dog', 'Vacuna felina de refuerzo|cat']);
  assert.deepEqual(names(all), names(none));
  const dogs = await search('q=vacuna&species=dog');
  const removed = await search('q=vacuna&species=all');
  assert.ok(names(dogs).length < names(removed).length);
});

test('AC-086: text and species must both match', { skip }, async () => {
  assert.deepEqual(names(await search('q=ba%C3%B1o&species=dog')), ['Baño y corte|dog']);
  assert.deepEqual(names(await search('q=ba%C3%B1o&species=cat')), []);
  assert.deepEqual(names(await search('q=perro&species=cat')), []);
  assert.deepEqual(names(await search('q=VACUNA%20FELINA&species=cat')), ['Vacuna felina de refuerzo|cat']);
  assert.deepEqual(names(await search('q=vacuna%20felina&species=dog')), []);
  assert.deepEqual(names(await search('q=%25_&species=cat')), ['Descuento 50%_|cat'], 'LIKE metacharacters stay literal with the filter');
  assert.deepEqual(names(await search('q=%25_&species=dog')), []);
});

test('AC-042 / BR-008: results follow the offering species, not the owner pets', { skip }, async () => {
  const withoutPets = await search('q=vacuna&species=cat', 'species-no-pets');
  const dogOwner = await search('q=vacuna&species=cat', 'species-dog-owner');
  assert.deepEqual(names(withoutPets), ['Vacuna anual|cat', 'Vacuna felina de refuerzo|cat']);
  assert.deepEqual(names(dogOwner), names(withoutPets));
  const ownerOfDogSeesDogs = await search('q=vacuna&species=dog', 'species-dog-owner');
  assert.deepEqual(names(ownerOfDogSeesDogs), ['Vacuna anual|dog']);
});

test('filtered results keep the CTR-005 shapes, and the filter is validated and owner-only', { skip }, async () => {
  const service = (await search('q=ba%C3%B1o&species=dog')).body.results[0];
  assert.deepEqual(Object.keys(service).sort(), ['id', 'kind', 'modality', 'name', 'priceCop', 'provider', 'species']);
  const product = (await search('q=perro&species=dog')).body.results[0];
  assert.deepEqual(Object.keys(product).sort(), ['available', 'id', 'kind', 'name', 'priceCop', 'provider', 'species']);
  assert.equal(product.available, false);

  const invalid = await search('q=vacuna&species=bird');
  assert.equal(invalid.status, 422);
  assert.deepEqual(invalid.body.fields, [{ field: 'species', reason: 'NOT_ALLOWED' }]);
  assert.equal((await search('q=vacuna&species=dog', 'species-provider')).status, 404);
  assert.equal((await app.request('/api/search?q=vacuna&species=dog')).status, 401);
});
