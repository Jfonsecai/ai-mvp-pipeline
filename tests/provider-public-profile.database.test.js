// US-018 against PostgreSQL: the owner's view of a provider profile built from real rows, including
// data saved through US-008 and offerings published through US-010 / US-013.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { migrate } from '../src/db/migrator.js';
import { createIdentityRouter } from '../src/modules/identity/sign-up.js';
import { createProviderProfileRouter } from '../src/modules/provider/profile.js';
import { createCatalogRouter } from '../src/modules/catalog/offerings.js';
import { createPublicProviderProfileRouter } from '../src/modules/search/provider-profile.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_pubprofile_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const J = { origin: 'https://vetcare.test', 'content-type': 'application/json' };
let admin;
let pool;
let app;
let ownerCookie;

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });
  app = await startApp(createApp({
    config: testConfig(),
    db: pool,
    clock: fixedClock(new Date('2026-10-12T12:00:00Z')),
    modules: [
      { createRouter: createIdentityRouter },
      { createRouter: createProviderProfileRouter },
      { createRouter: createCatalogRouter },
      { createRouter: createPublicProviderProfileRouter },
    ],
  }));
  const owner = await app.request('/api/auth/sign-up/owner', {
    method: 'POST',
    headers: J,
    body: JSON.stringify({ name: 'Dueño', email: `${randomUUID()}@example.test`, password: 'a-long-password', pet: { name: 'Rex', species: 'dog', breed: 'Mix', ageYears: 2 } }),
  });
  ownerCookie = owner.headers.get('set-cookie').split(';')[0];
});

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

async function signUpProvider(providerType, address) {
  const email = `${randomUUID()}@example.test`;
  const response = await app.request('/api/auth/sign-up/provider', {
    method: 'POST',
    headers: J,
    body: JSON.stringify({ name: `Sign-up ${providerType}`, email, password: 'a-long-password', providerType, ...(address ? { address } : {}) }),
  });
  assert.equal(response.status, 201);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  const profile = await (await app.request('/api/provider/profile', { headers: { cookie } })).json();
  const id = (await admin.query(`SELECT id FROM account WHERE email = $1 AND account_type = 'provider'`, [email])).rows[0].id;
  return { cookie, id, email, profile };
}
const send = (cookie, path, body) => app.request(path, { method: 'POST', headers: { cookie, ...J }, body: JSON.stringify(body) });
const view = (id, cookie = ownerCookie) => app.request(`/api/providers/${id}`, { headers: { cookie } });

test('AC-044: data saved by the provider (US-008) and its published offerings appear on the owner view', { skip }, async () => {
  const clinic = await signUpProvider('clinic', 'Calle 10 # 5-20');
  const saved = await app.request('/api/provider/profile', {
    method: 'PUT',
    headers: { cookie: clinic.cookie, ...J },
    body: JSON.stringify({ publicName: 'Clínica Norte', contactPhone: '+57 601 555 0199', contactEmail: 'Contacto@Norte.test', address: 'Avenida 80 # 12-34' }),
  });
  assert.equal(saved.status, 200);
  assert.equal((await send(clinic.cookie, '/api/provider/services', { name: 'Consulta general', priceCop: 65000, species: 'dog', modality: 'both' })).status, 201);
  assert.equal((await send(clinic.cookie, '/api/provider/services', { name: 'Vacuna felina', priceCop: 40000, species: 'cat', modality: 'clinic' })).status, 201);
  assert.equal((await send(clinic.cookie, '/api/provider/products', { name: 'Alimento premium', priceCop: 89000, species: 'dog' })).status, 201);

  const response = await view(clinic.id);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.id, clinic.id);
  assert.equal(body.name, 'Clínica Norte');
  assert.equal(body.type, 'clinic');
  assert.equal(body.address, 'Avenida 80 # 12-34');
  assert.equal(body.contactPhone, '+57 601 555 0199');
  assert.equal(body.contactEmail, 'Contacto@Norte.test');
  assert.deepEqual(body.services.map((s) => [s.name, s.priceCop, s.species, s.modality]), [
    ['Consulta general', 65000, 'dog', 'both'],
    ['Vacuna felina', 40000, 'cat', 'clinic'],
  ]);
  assert.deepEqual(body.products.map((p) => [p.name, p.priceCop, p.species, p.available]), [['Alimento premium', 89000, 'dog', true]]);
});

test('AC-045: an independent veterinarian without an address is shown without one; an address added later appears', { skip }, async () => {
  const vet = await signUpProvider('independent');
  const withoutAddress = await (await view(vet.id)).json();
  assert.equal('address' in withoutAddress, false);
  assert.equal('contactPhone' in withoutAddress, false, 'no phone until it is saved');
  assert.equal(withoutAddress.contactEmail, vet.email);
  assert.equal(withoutAddress.name, 'Sign-up independent');

  const put = (body) => app.request('/api/provider/profile', { method: 'PUT', headers: { cookie: vet.cookie, ...J }, body: JSON.stringify(body) });
  const data = { publicName: 'Dra. Ruiz', contactPhone: '3001234567', contactEmail: vet.email };
  await put(data);
  const phoneOnly = await (await view(vet.id)).json();
  assert.equal(phoneOnly.contactPhone, '3001234567');
  assert.equal('address' in phoneOnly, false);
  await put({ ...data, address: 'Carrera 7 # 10-20' });
  assert.equal((await (await view(vet.id)).json()).address, 'Carrera 7 # 10-20');
  await put({ ...data, address: '' });
  assert.equal('address' in (await (await view(vet.id)).json()), false);
});

test('each profile lists only its own provider offerings and keeps unavailable products visible', { skip }, async () => {
  const first = await signUpProvider('independent');
  const second = await signUpProvider('independent');
  await send(first.cookie, '/api/provider/services', { name: 'Servicio de uno', priceCop: 1000, species: 'dog' });
  await send(second.cookie, '/api/provider/services', { name: 'Servicio de dos', priceCop: 2000, species: 'cat' });
  await send(second.cookie, '/api/provider/products', { name: 'Producto agotado', priceCop: 3000, species: 'cat' });
  await admin.query(`UPDATE offering SET available = false WHERE name = 'Producto agotado'`);

  const one = await (await view(first.id)).json();
  const two = await (await view(second.id)).json();
  assert.deepEqual(one.services.map((s) => s.name), ['Servicio de uno']);
  assert.deepEqual(one.products, []);
  assert.deepEqual(two.services.map((s) => s.name), ['Servicio de dos']);
  assert.deepEqual(two.products.map((p) => [p.name, p.available]), [['Producto agotado', false]]);
});

test('unknown, non-provider and malformed identifiers are NOT_FOUND; access is owner-only', { skip }, async () => {
  const vet = await signUpProvider('independent');
  const ownerId = (await admin.query(`SELECT id FROM account WHERE account_type = 'owner' LIMIT 1`)).rows[0].id;
  for (const id of [randomUUID(), ownerId, 'nope', "1' OR '1'='1"]) {
    const response = await view(encodeURIComponent(id));
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  const upper = await view(vet.id.toUpperCase());
  assert.equal(upper.status, 200, 'an upper-case UUID is the same provider');
  assert.equal((await upper.json()).id, vet.id);
  assert.equal((await app.request(`/api/providers/${vet.id}`)).status, 401);
  assert.equal((await view(vet.id, vet.cookie)).status, 404, 'a provider cannot use the owner view');
});
