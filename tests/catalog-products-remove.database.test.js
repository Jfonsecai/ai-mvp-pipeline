// US-015 against PostgreSQL through the real module registry: a removed product disappears from the catalog, the
// public profile, search and the assistant (AC-037); orders placed before the removal keep their status and
// stay referenced (AC-085, EDGE-019, P02-ASM-012); other providers cannot remove it (NFR-002); the removal is
// logical, serialized by the provider lock, and never touches appointments.
// Ordering itself (US-027 to US-033) is deferred (TD-29): order rows are inserted directly into `product_order`.
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
const schema = `vetcare_prodrem_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const J = { origin: 'https://vetcare.test', 'content-type': 'application/json' };
const NOW = new Date('2026-10-12T14:30:00Z'); // Monday 09:30 in Bogota
const at = (date, hour) => `${date}T${String(hour).padStart(2, '0')}:00:00-05:00`;
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
  await setHours(world.clinic);
  world.owner = await signUpOwner('dog');
  world.owner2 = await signUpOwner('dog');
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
  const pets = (await (await app.request('/api/owner/pets', { headers: { cookie } })).json()).pets;
  return { id, cookie, petId: pets[0].id };
}

async function setHours(provider) {
  const days = Array.from({ length: 7 }, (_, index) => ({ weekday: index + 1, works: true, startHour: 8, endHour: 18 }));
  const response = await app.request('/api/provider/working-hours', { method: 'PUT', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify({ days }) });
  assert.equal(response.status, 200);
}

const publish = async (provider, body) => {
  const response = await app.request('/api/provider/products', { method: 'POST', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify(body) });
  assert.equal(response.status, 201);
  return response.json();
};
const publishService = async (provider, body) => (await app.request('/api/provider/services', { method: 'POST', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify(body) })).json();
const remove = (provider, id) => app.request(`/api/provider/offerings/${id}`, { method: 'DELETE', headers: { cookie: provider.cookie, origin: J.origin } });
const row = async (id) => (await admin.query('SELECT * FROM offering WHERE id = $1', [id])).rows[0];
const get = (who, path) => app.request(path, { headers: { cookie: who.cookie } });
const search = async (query) => (await (await get(world.owner, `/api/search?${query}`)).json()).results;
const ask = async (text) => (await app.request('/api/assistant/messages', { method: 'POST', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify({ text }) })).json();
const food = (name, species = 'dog') => ({ name, priceCop: 45000, species });
const insertOrder = async (owner, product, provider, status, quantity = 2) => (await admin.query(
  `INSERT INTO product_order (owner_id, product_id, provider_id, quantity, unit_price_cop, delivery_address, status)
   VALUES ($1, $2, $3, $4, $5, 'Calle 7 # 8-9', $6) RETURNING id`, [owner.id, product.id, provider.id, quantity, product.priceCop, status])).rows[0].id;
const order = async (id) => (await admin.query('SELECT * FROM product_order WHERE id = $1', [id])).rows[0];

test('AC-037: a removed product is gone from the catalog, the public profile, search, the assistant; the rest of the catalog stays', { skip }, async () => {
  const doomed = await publish(world.clinic, food('Croqueta kappa'));
  const kept = await publish(world.clinic, food('Croqueta kappa premium'));
  const service = await publishService(world.clinic, { name: 'Consulta kappa', priceCop: 30000, species: 'dog', modality: 'clinic' });
  assert.equal((await search('q=kappa')).length, 3);
  assert.equal((await ask('¿Cuánto cuesta una croqueta kappa?')).total, 2);

  const response = await remove(world.clinic, doomed.id);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { removed: true, cancelledAppointments: 0 });

  const catalog = await (await get(world.clinic, '/api/provider/offerings')).json();
  assert.equal(catalog.products.some((p) => p.id === doomed.id), false, 'catalog');
  assert.equal(catalog.products.some((p) => p.id === kept.id), true);
  assert.equal(catalog.services.some((s) => s.id === service.id), true, 'the services are untouched');
  const profile = await (await get(world.owner, `/api/providers/${world.clinic.id}`)).json();
  assert.equal(profile.products.some((p) => p.id === doomed.id), false, 'public profile');
  assert.equal(profile.products.some((p) => p.id === kept.id), true);

  assert.deepEqual((await search('q=kappa')).map((r) => r.id).sort(), [kept.id, service.id].sort(), 'search by name');
  assert.equal((await search('q=kappa&species=dog')).some((r) => r.id === doomed.id), false, 'search with the species filter');
  const voice = await (await app.request('/api/search/voice', { method: 'POST', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify({ transcript: 'croqueta kappa para perros' }) })).json();
  assert.equal(JSON.stringify(voice).includes(doomed.id), false, 'voice search');
  const answer = await ask('¿Cuánto cuesta una croqueta kappa?');
  assert.equal(answer.total, 1, 'the assistant');
  assert.equal(JSON.stringify(answer).includes(doomed.id), false);

  const stored = await row(doomed.id);
  assert.ok(stored, 'the row stays (logical removal, ADR-020)');
  assert.equal(new Date(stored.removed_at).toISOString(), NOW.toISOString());
  assert.equal(stored.name, 'Croqueta kappa', 'no other column changes');
  assert.equal(stored.available, true);
});

test('AC-085 / EDGE-019 / P02-ASM-012: orders placed before the removal keep their status and stay referenced', { skip }, async () => {
  const product = await publish(world.clinic, food('Alimento con pedidos'));
  const other = await publish(world.clinic, food('Alimento sin tocar'));
  const ids = [];
  for (const status of ['confirmed', 'in_delivery', 'closed', 'cancelled']) {
    ids.push(await insertOrder(world.owner, product, world.clinic, status));
  }
  ids.push(await insertOrder(world.owner2, product, world.clinic, 'confirmed', 1));
  const otherOrder = await insertOrder(world.owner, other, world.clinic, 'in_delivery');
  const before = JSON.stringify(await Promise.all([...ids, otherOrder].map(order)));

  const response = await remove(world.clinic, product.id);
  assert.deepEqual(await response.json(), { removed: true, cancelledAppointments: 0 });

  assert.equal(JSON.stringify(await Promise.all([...ids, otherOrder].map(order))), before, 'every order row (status, status_changed_at, price, quantity, address) is byte-identical');
  assert.deepEqual((await Promise.all(ids.map(order))).map((o) => o.status), ['confirmed', 'in_delivery', 'closed', 'cancelled', 'confirmed']);
  const joined = await admin.query(
    `SELECT o.id, p.name, p.removed_at FROM product_order o JOIN offering p ON p.id = o.product_id AND p.provider_id = o.provider_id AND p.kind = o.product_kind WHERE o.id = ANY($1)`, [ids]);
  assert.equal(joined.rows.length, 5, 'every order still resolves its (removed) product row, so history can keep its name');
  assert.ok(joined.rows.every((r) => r.removed_at !== null && r.name === 'Alimento con pedidos'));
  assert.equal((await admin.query('SELECT count(*)::int n FROM product_order')).rows[0].n, 6, 'no order was deleted');
});

test('removing a product never touches appointments', { skip }, async () => {
  const product = await publish(world.clinic, food('Producto y citas'));
  const service = await publishService(world.clinic, { name: 'Servicio y citas', priceCop: 30000, species: 'dog', modality: 'clinic' });
  const booked = await app.request('/api/owner/appointments', { method: 'POST', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify({ serviceId: service.id, petId: world.owner.petId, startsAt: at('2026-10-13', 10) }) });
  assert.equal(booked.status, 201);
  const appointmentId = (await booked.json()).id;
  const before = JSON.stringify((await admin.query('SELECT * FROM appointment WHERE id = $1', [appointmentId])).rows[0]);
  assert.equal((await remove(world.clinic, product.id)).status, 200);
  assert.equal(JSON.stringify((await admin.query('SELECT * FROM appointment WHERE id = $1', [appointmentId])).rows[0]), before);
  assert.equal((await row(service.id)).removed_at, null, 'nor the provider\'s services');
});

test('ownership (NFR-002, CR-006): another provider, an owner, anonymous, an unknown, a malformed or an already removed id never remove anything', { skip }, async () => {
  const product = await publish(world.clinic, food('Solo mío q'));
  const orderId = await insertOrder(world.owner, product, world.clinic, 'confirmed');
  const snapshot = async () => JSON.stringify([await row(product.id), await order(orderId)]);
  const before = await snapshot();

  for (const response of [
    await remove(world.otherClinic, product.id),
    await remove(world.vet, product.id),
    await remove(world.clinic, randomUUID()),
    await remove(world.clinic, world.owner.id),
    await remove(world.clinic, world.clinic.id),
    await remove(world.owner, product.id),
  ]) {
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  for (const bad of ['nope', "1' OR '1'='1", product.id.replaceAll('-', '')]) {
    assert.equal((await remove(world.clinic, encodeURIComponent(bad))).status, 404, bad);
  }
  assert.equal((await app.request(`/api/provider/offerings/${product.id}`, { method: 'DELETE', headers: { origin: J.origin } })).status, 401);
  assert.equal((await app.request(`/api/provider/offerings/${product.id}`, { method: 'DELETE', headers: { cookie: world.clinic.cookie, origin: 'https://evil.test' } })).status, 403);
  assert.equal(await snapshot(), before, 'the product and its order are unchanged');

  assert.equal((await remove(world.clinic, product.id)).status, 200);
  assert.equal((await remove(world.clinic, product.id)).status, 404, 'removing twice');
  const edit = await app.request(`/api/provider/products/${product.id}`, { method: 'PUT', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify(food('Revivido')) });
  assert.equal(edit.status, 404, 'a removed product cannot be edited back to life (US-014 reads removed_at)');
  assert.equal((await order(orderId)).status, 'confirmed');
});

test('the removal takes the provider lock (IF-024): it waits for a transaction that holds it and then applies', { skip }, async () => {
  const product = await publish(world.clinic, food('Baja que espera q'));
  const holder = await pool.connect();
  try {
    await holder.query('BEGIN');
    await holder.query('SELECT provider_id FROM provider_profile WHERE provider_id = $1 FOR UPDATE', [world.clinic.id]);
    let settled = false;
    const pending = remove(world.clinic, product.id).then((response) => { settled = true; return response; });
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(settled, false, 'the removal waits while the provider lock is held');
    assert.equal((await row(product.id)).removed_at, null);
    await holder.query('COMMIT');
    assert.deepEqual(await (await pending).json(), { removed: true, cancelledAppointments: 0 });
  } finally {
    holder.release();
  }
});

test('concurrency: two simultaneous removals give one 200 and one 404; an edit racing with the removal never resurrects it', { skip }, async () => {
  const product = await publish(world.clinic, food('Doble baja'));
  const [a, b] = await Promise.all([remove(world.clinic, product.id), remove(world.clinic, product.id)]);
  assert.deepEqual([a.status, b.status].sort(), [200, 404]);
  const raced = await publish(world.clinic, food('Edición contra baja'));
  const responses = await Promise.all([
    remove(world.clinic, raced.id),
    ...Array.from({ length: 4 }, (_, i) => app.request(`/api/provider/products/${raced.id}`, { method: 'PUT', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify(food(`Edición ${i}`)) })),
  ]);
  assert.equal(responses[0].status, 200);
  for (const response of responses.slice(1)) assert.ok([200, 404].includes(response.status), `edit answered ${response.status}`);
  const final = await row(raced.id);
  assert.notEqual(final.removed_at, null, 'it stays removed');
  assert.equal((await search('q=Edición')).some((r) => r.id === raced.id), false);
});

test('a product that was marked not available is removed like any other', { skip }, async () => {
  const product = await publish(world.clinic, food('Sin stock r'));
  await admin.query('UPDATE offering SET available = false WHERE id = $1', [product.id]);
  assert.equal((await remove(world.clinic, product.id)).status, 200);
  const stored = await row(product.id);
  assert.notEqual(stored.removed_at, null);
  assert.equal(stored.available, false, 'availability is not rewritten by the removal');
});
