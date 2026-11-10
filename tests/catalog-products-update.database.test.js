// US-014 against PostgreSQL through the real module registry: an updated product shows its new details in the
// catalog, the public profile, search and the assistant (AC-035); other providers cannot change it (AC-036,
// NFR-002); BR-006 (exactly one species); availability and every other column stay untouched; races.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/application.js';
import { migrate } from '../src/db/migrator.js';
import { modules } from '../src/modules/index.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_produpd_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const J = { origin: 'https://vetcare.test', 'content-type': 'application/json' };
const NOW = new Date('2026-10-12T14:30:00Z');
let admin;
let pool;
let app;
const world = {};

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 8 });
  app = await startApp(createApp({ config: testConfig(), db: pool, clock: fixedClock(NOW), modules }));

  world.clinic = await signUpProvider('clinic', 'Calle 1');
  world.otherClinic = await signUpProvider('clinic', 'Calle 2');
  world.vet = await signUpProvider('independent');
  world.owner = await signUpOwner('dog');
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
    body: JSON.stringify({ name: `Prov ${providerType} ${email.slice(0, 4)}`, email, password: 'a-long-password', providerType, ...(address ? { address } : {}) }),
  });
  assert.equal(response.status, 201);
  const id = (await admin.query(`SELECT id FROM account WHERE email = $1 AND account_type = 'provider'`, [email])).rows[0].id;
  return { id, cookie: response.headers.get('set-cookie').split(';')[0], type: providerType };
}

async function signUpOwner(species) {
  const email = `${randomUUID()}@example.test`;
  const response = await app.request('/api/auth/sign-up/owner', {
    method: 'POST',
    headers: J,
    body: JSON.stringify({ name: 'Dueño', email, password: 'a-long-password', pet: { name: `Pet ${species}`, species, breed: 'Mix', ageYears: 2 } }),
  });
  assert.equal(response.status, 201);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  const id = (await admin.query(`SELECT id FROM account WHERE email = $1 AND account_type = 'owner'`, [email])).rows[0].id;
  return { id, cookie };
}

const publish = async (provider, body) => {
  const response = await app.request('/api/provider/products', { method: 'POST', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify(body) });
  assert.equal(response.status, 201);
  return response.json();
};
const publishService = async (provider, body) => (await app.request('/api/provider/services', { method: 'POST', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify(body) })).json();
const update = (provider, id, body) => app.request(`/api/provider/products/${id}`, { method: 'PUT', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify(body) });
const row = async (id) => (await admin.query('SELECT * FROM offering WHERE id = $1', [id])).rows[0];
const get = (who, path) => app.request(path, { headers: { cookie: who.cookie } });
const search = async (query) => (await (await get(world.owner, `/api/search?${query}`)).json()).results;
const ask = async (text) => (await app.request('/api/assistant/messages', { method: 'POST', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify({ text }) })).json();
const dogFood = (name) => ({ name, priceCop: 45000, species: 'dog' });

test('AC-035: an updated product shows its new details in the catalog, the public profile, search and the assistant', { skip }, async () => {
  const product = await publish(world.clinic, dogFood('Croqueta zorbo original'));
  const response = await update(world.clinic, product.id, { name: '  Arena felina zorbo nueva  ', priceCop: 72500, species: 'cat' });
  assert.equal(response.status, 200);
  const expected = { id: product.id, kind: 'product', name: 'Arena felina zorbo nueva', priceCop: 72500, species: 'cat', available: true };
  assert.deepEqual(await response.json(), expected);

  const catalog = await (await get(world.clinic, '/api/provider/offerings')).json();
  assert.deepEqual(catalog.products.find((p) => p.id === product.id), expected);
  assert.equal(catalog.products.some((p) => p.name === 'Croqueta zorbo original'), false);

  const profile = await (await get(world.owner, `/api/providers/${world.clinic.id}`)).json();
  assert.deepEqual(profile.products.find((p) => p.id === product.id), expected);

  const byNew = (await search('q=arena%20felina%20zorbo')).find((r) => r.id === product.id);
  assert.equal(byNew.name, 'Arena felina zorbo nueva');
  assert.equal(byNew.priceCop, 72500);
  assert.equal(byNew.species, 'cat');
  assert.equal(byNew.kind, 'product');
  assert.equal((await search('q=original%20zorbo')).some((r) => r.id === product.id), false, 'the old name no longer matches');
  assert.equal((await search('q=zorbo&species=dog')).some((r) => r.id === product.id), false, 'the species filter follows the new species');
  assert.equal((await search('q=zorbo&species=cat')).some((r) => r.id === product.id), true);

  const answer = JSON.stringify(await ask('¿Cuánto cuesta arena felina zorbo?'));
  assert.ok(answer.includes('Arena felina zorbo nueva') && answer.includes('72.500'), `the assistant answers with the new name and price: ${answer}`);
  assert.equal(answer.includes('Croqueta'), false);
});

test('only name, price and species change: identity, owner, kind, availability, modality, order and removal state are untouched', { skip }, async () => {
  const first = await publish(world.clinic, dogFood('Primero p'));
  const second = await publish(world.clinic, dogFood('Segundo p'));
  await admin.query('UPDATE offering SET available = false WHERE id = $1', [first.id]); // the provider turned it off (US-033 later)
  const before = await row(first.id);
  assert.equal((await update(world.clinic, first.id, { name: 'Primero editado', priceCop: 61000, species: 'cat' })).status, 200);
  const after = await row(first.id);
  for (const column of ['id', 'provider_id', 'provider_type', 'kind', 'available', 'modality', 'created_at', 'removed_at']) assert.deepEqual(after[column], before[column], column);
  assert.equal(after.available, false, 'a product that is not available stays not available');
  assert.deepEqual([after.name, after.price_cop, after.species], ['Primero editado', 61000, 'cat']);
  const order = (await (await get(world.clinic, '/api/provider/offerings')).json()).products.map((p) => p.id);
  assert.ok(order.indexOf(first.id) < order.indexOf(second.id), 'an edit does not reorder the catalog');
  assert.equal((await update(world.clinic, first.id, { name: 'Primero editado', priceCop: 61000, species: 'cat' })).status, 200, 'saving the same values is fine');
});

test('AC-036: another provider cannot change the product; services, removed and unknown ids are the same NOT_FOUND; nothing changes', { skip }, async () => {
  const product = await publish(world.clinic, dogFood('Solo mío p'));
  const service = await publishService(world.clinic, { name: 'Servicio', priceCop: 5000, species: 'dog', modality: 'clinic' });
  const removed = await publish(world.clinic, dogFood('Retirado p'));
  await admin.query('UPDATE offering SET removed_at = now() WHERE id = $1', [removed.id]);
  const snapshot = async () => JSON.stringify([await row(product.id), await row(service.id), await row(removed.id)]);
  const before = await snapshot();

  const body = dogFood('Secuestrado');
  for (const response of [
    await update(world.otherClinic, product.id, body),
    await update(world.vet, product.id, body),
    await update(world.clinic, service.id, body),
    await update(world.clinic, removed.id, body),
    await update(world.clinic, randomUUID(), body),
    await update(world.clinic, world.owner.id, body),
    await update(world.clinic, world.clinic.id, body),
  ]) {
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  for (const id of ['nope', "1' OR '1'='1", product.id.replaceAll('-', '')]) {
    const response = await app.request(`/api/provider/products/${encodeURIComponent(id)}`, { method: 'PUT', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify(body) });
    assert.equal(response.status, 404, id);
  }
  assert.equal((await app.request(`/api/provider/products/${product.id}`, { method: 'PUT', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify(body) })).status, 404);
  assert.equal((await app.request(`/api/provider/products/${product.id}`, { method: 'PUT', headers: J, body: JSON.stringify(body) })).status, 401);
  assert.equal((await app.request(`/api/provider/products/${product.id}`, { method: 'PUT', headers: { cookie: world.clinic.cookie, ...J, origin: 'https://evil.test' }, body: JSON.stringify(body) })).status, 403);
  assert.equal(await snapshot(), before, 'no column of the three rows changed');
  // The service endpoint of US-011 refuses a product just as well.
  const viaService = await app.request(`/api/provider/services/${product.id}`, { method: 'PUT', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify({ name: 'x', priceCop: 5, species: 'dog', modality: 'clinic' }) });
  assert.equal(viaService.status, 404);
  assert.equal(await snapshot(), before);
});

test('BR-006: invalid updates are refused and the row is unchanged; exactly one species; availability, modality and ids cannot be sent', { skip }, async () => {
  const product = await publish(world.clinic, dogFood('Reglas p'));
  const before = JSON.stringify(await row(product.id));
  for (const body of [
    {}, { name: '', priceCop: 1, species: 'dog' }, { name: 'x', priceCop: 0, species: 'dog' }, { name: 'x', priceCop: 5, species: 'bird' },
    { name: 'x', priceCop: 5 }, { name: 'x', priceCop: 5, species: ['dog', 'cat'] }, { name: 'x', priceCop: 5, species: 'dog', available: false },
    { name: 'x', priceCop: 5, species: 'dog', modality: 'home' }, { name: 'x', priceCop: 5, species: 'dog', kind: 'service' }, { name: 'x', priceCop: 5, species: 'dog', providerId: world.vet.id },
  ]) {
    assert.equal((await update(world.clinic, product.id, body)).status, 422, JSON.stringify(body));
  }
  assert.equal(JSON.stringify(await row(product.id)), before);
  for (const species of ['cat', 'dog']) {
    const response = await update(world.clinic, product.id, { name: 'Reglas p', priceCop: 45000, species });
    assert.equal((await response.json()).species, species);
    assert.equal((await row(product.id)).species, species);
  }
});

test('boundaries: price 1 and 2147483647, 120 characters of name are accepted; one more is refused', { skip }, async () => {
  const product = await publish(world.clinic, dogFood('Límites p'));
  assert.equal((await update(world.clinic, product.id, { name: '🐶'.repeat(120), priceCop: 1, species: 'dog' })).status, 200);
  assert.equal((await update(world.clinic, product.id, { name: 'é'.repeat(120), priceCop: 2147483647, species: 'cat' })).status, 200);
  assert.equal((await update(world.clinic, product.id, { name: 'x'.repeat(121), priceCop: 5, species: 'dog' })).status, 422);
  assert.equal((await update(world.clinic, product.id, { name: 'x', priceCop: 2147483648, species: 'dog' })).status, 422);
  assert.equal((await row(product.id)).price_cop, 2147483647);
});

test('concurrent edits never mix fields: the final row equals exactly one of the submitted versions', { skip }, async () => {
  const product = await publish(world.clinic, dogFood('Concurrente p'));
  const versions = Array.from({ length: 10 }, (_, i) => ({ name: `Versión ${i}`, priceCop: 1000 + i, species: i % 2 ? 'dog' : 'cat' }));
  const responses = await Promise.all(versions.map((body) => update(world.clinic, product.id, body)));
  assert.ok(responses.every((response) => response.status === 200), responses.map((r) => r.status).join());
  const final = await row(product.id);
  assert.ok(versions.some((v) => v.name === final.name && v.priceCop === final.price_cop && v.species === final.species), JSON.stringify(final));
});

test('race with a removal: an edit that waits for a removal in progress finds the product removed and changes nothing', { skip }, async () => {
  const product = await publish(world.clinic, dogFood('Carrera p'));
  const holder = await pool.connect();
  try {
    await holder.query('BEGIN');
    await holder.query('UPDATE offering SET removed_at = now() WHERE id = $1', [product.id]); // the removal, still uncommitted
    let settled = false;
    const pending = update(world.clinic, product.id, { name: 'Tarde', priceCop: 1, species: 'cat' }).then((response) => { settled = true; return response; });
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(settled, false, 'the edit waits for the row lock');
    await holder.query('COMMIT');
    const response = await pending;
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
    assert.equal((await row(product.id)).name, 'Carrera p', 'the removed product was not edited');
  } finally {
    holder.release();
  }
});
