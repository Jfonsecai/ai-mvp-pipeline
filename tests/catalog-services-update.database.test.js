// US-011 against PostgreSQL through the real module registry: an updated service appears in the catalog,
// the public profile, search and booking (AC-030); other providers cannot change it (AC-031); booked
// appointments are not touched (P04-ASM-036); BR-006, BR-007; races with booking and concurrent edits.
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
const schema = `vetcare_svcupd_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const J = { origin: 'https://vetcare.test', 'content-type': 'application/json' };
const NOW = new Date('2026-10-12T14:30:00Z'); // Monday 09:30 in Bogota
const MONDAY = '2026-10-12';
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
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 6 });
  app = await startApp(createApp({ config: testConfig(), db: pool, clock: fixedClock(NOW), modules }));

  world.clinic = await signUpProvider('clinic', 'Calle 1');
  world.otherClinic = await signUpProvider('clinic', 'Calle 2');
  world.vet = await signUpProvider('independent');
  for (const provider of [world.clinic, world.otherClinic]) await setHours(provider, { 1: [8, 18] });
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
  const pets = (await (await app.request('/api/owner/pets', { headers: { cookie } })).json()).pets;
  return { id, cookie, petId: pets[0].id };
}

async function setHours(provider, ranges) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const range = ranges[index + 1];
    return range ? { weekday: index + 1, works: true, startHour: range[0], endHour: range[1] } : { weekday: index + 1, works: false };
  });
  const response = await app.request('/api/provider/working-hours', { method: 'PUT', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify({ days }) });
  assert.equal(response.status, 200);
}

const publish = async (provider, body) => {
  const response = await app.request('/api/provider/services', { method: 'POST', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify(body) });
  assert.equal(response.status, 201);
  return response.json();
};
const update = (provider, id, body) => app.request(`/api/provider/services/${id}`, { method: 'PUT', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify(body) });
const row = async (id) => (await admin.query('SELECT * FROM offering WHERE id = $1', [id])).rows[0];
const search = async (owner, query) => (await (await app.request(`/api/search?${query}`, { headers: { cookie: owner.cookie } })).json()).results;
const dogClinic = (name) => ({ name, priceCop: 60000, species: 'dog', modality: 'clinic' });

test('AC-030: an updated service shows its new details in the catalog, the public profile, search and booking', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Consulta original'));
  const response = await update(world.clinic, service.id, { name: '  Control felino anual  ', priceCop: 72500, species: 'cat', modality: 'both' });
  assert.equal(response.status, 200);
  const expected = { id: service.id, kind: 'service', name: 'Control felino anual', priceCop: 72500, species: 'cat', modality: 'both' };
  assert.deepEqual(await response.json(), expected);

  const catalog = await (await app.request('/api/provider/offerings', { headers: { cookie: world.clinic.cookie } })).json();
  assert.deepEqual(catalog.services.find((s) => s.id === service.id), expected);
  assert.equal(catalog.services.some((s) => s.name === 'Consulta original'), false);

  const profile = await (await app.request(`/api/providers/${world.clinic.id}`, { headers: { cookie: world.owner.cookie } })).json();
  assert.deepEqual(profile.services.find((s) => s.id === service.id), expected);

  const byNew = (await search(world.owner, 'q=felino%20anual')).find((r) => r.id === service.id);
  assert.equal(byNew.name, 'Control felino anual');
  assert.equal(byNew.priceCop, 72500);
  assert.equal(byNew.species, 'cat');
  assert.equal(byNew.modality, 'both');
  assert.equal((await search(world.owner, 'q=original')).some((r) => r.id === service.id), false, 'the old name no longer matches');
  assert.equal((await search(world.owner, 'q=felino%20anual&species=dog')).some((r) => r.id === service.id), false, 'the species filter follows the new species');
  assert.equal((await search(world.owner, 'q=felino%20anual&species=cat')).some((r) => r.id === service.id), true);

  const context = await (await app.request(`/api/services/${service.id}/booking-context?weekStart=${MONDAY}`, { headers: { cookie: world.owner.cookie } })).json();
  assert.equal(context.service.name, 'Control felino anual');
  assert.equal(context.service.priceCop, 72500);
  assert.equal(context.service.species, 'cat');
  assert.deepEqual(context.eligiblePetIds, [], 'the owner has only a dog, so the cat service is no longer bookable by this pet');
});

test('only the editable columns change; identity, ownership, kind and publication order are untouched', { skip }, async () => {
  const first = await publish(world.clinic, dogClinic('Primero'));
  const second = await publish(world.clinic, dogClinic('Segundo'));
  const before = await row(first.id);
  assert.equal((await update(world.clinic, first.id, { name: 'Primero editado', priceCop: 61000, species: 'dog', modality: 'home' })).status, 200);
  const after = await row(first.id);
  for (const column of ['id', 'provider_id', 'provider_type', 'kind', 'available', 'created_at', 'removed_at']) assert.deepEqual(after[column], before[column], column);
  assert.deepEqual([after.name, after.price_cop, after.species, after.modality], ['Primero editado', 61000, 'dog', 'home']);
  const order = (await (await app.request('/api/provider/offerings', { headers: { cookie: world.clinic.cookie } })).json()).services.map((s) => s.id);
  assert.ok(order.indexOf(first.id) < order.indexOf(second.id), 'an edit does not reorder the catalog');
  assert.equal((await update(world.clinic, first.id, { name: 'Primero editado', priceCop: 61000, species: 'dog', modality: 'home' })).status, 200, 'saving the same values is fine');
});

test('AC-031: another provider cannot change the service; products, removed and unknown ids are the same NOT_FOUND; nothing changes', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Solo mío'));
  const product = await (await app.request('/api/provider/products', { method: 'POST', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify({ name: 'Alimento', priceCop: 9000, species: 'dog' }) })).json();
  const removed = await publish(world.clinic, dogClinic('Retirado'));
  await admin.query('UPDATE offering SET removed_at = now() WHERE id = $1', [removed.id]);
  const snapshot = async () => JSON.stringify([await row(service.id), await row(product.id), await row(removed.id)]);
  const before = await snapshot();

  const body = dogClinic('Secuestrado');
  const results = [
    await update(world.otherClinic, service.id, body),
    await update(world.vet, service.id, { name: 'Secuestrado', priceCop: 60000, species: 'dog' }),
    await update(world.clinic, product.id, body),
    await update(world.clinic, removed.id, body),
    await update(world.clinic, randomUUID(), body),
    await update(world.clinic, world.owner.id, body),
    await update(world.clinic, world.clinic.id, body),
  ];
  for (const response of results) {
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  assert.equal(await snapshot(), before, 'no column of any of the three rows changed');

  for (const id of ['nope', "1' OR '1'='1", service.id.replaceAll('-', '')]) {
    const response = await app.request(`/api/provider/services/${encodeURIComponent(id)}`, { method: 'PUT', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify(body) });
    assert.equal(response.status, 404, id);
  }
  const owner = await app.request(`/api/provider/services/${service.id}`, { method: 'PUT', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify(body) });
  assert.equal(owner.status, 404);
  const anonymous = await app.request(`/api/provider/services/${service.id}`, { method: 'PUT', headers: J, body: JSON.stringify(body) });
  assert.equal(anonymous.status, 401);
  const foreign = await app.request(`/api/provider/services/${service.id}`, { method: 'PUT', headers: { cookie: world.clinic.cookie, ...J, origin: 'https://evil.test' }, body: JSON.stringify(body) });
  assert.equal(foreign.status, 403);
  assert.equal(await snapshot(), before);
});

test('BR-006 / BR-007: invalid updates are refused and the row is unchanged; a clinic may move among the three modalities; an independent stays at home', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Reglas'));
  const before = JSON.stringify(await row(service.id));
  for (const body of [
    {}, { name: '', priceCop: 1, species: 'dog', modality: 'clinic' }, { name: 'x', priceCop: 0, species: 'dog', modality: 'clinic' },
    { name: 'x', priceCop: 5, species: 'bird', modality: 'clinic' }, { name: 'x', priceCop: 5, species: 'dog' },
    { name: 'x', priceCop: 5, species: 'dog', modality: 'remote' }, { name: 'x', priceCop: 5, species: 'dog', modality: 'clinic', available: true },
  ]) {
    const response = await update(world.clinic, service.id, body);
    assert.equal(response.status, 422, JSON.stringify(body));
  }
  assert.equal(JSON.stringify(await row(service.id)), before);
  for (const modality of ['home', 'both', 'clinic']) {
    const response = await update(world.clinic, service.id, { name: 'Reglas', priceCop: 60000, species: 'dog', modality });
    assert.equal((await response.json()).modality, modality);
    assert.equal((await row(service.id)).modality, modality);
  }

  const vetService = await publish(world.vet, { name: 'Visita', priceCop: 40000, species: 'cat' });
  for (const modality of ['clinic', 'both']) {
    const refused = await update(world.vet, vetService.id, { name: 'Visita', priceCop: 40000, species: 'cat', modality });
    assert.equal(refused.status, 422);
    assert.deepEqual((await refused.json()).fields, [{ field: 'modality', reason: 'NOT_ALLOWED' }]);
  }
  const kept = await update(world.vet, vetService.id, { name: 'Visita editada', priceCop: 41000, species: 'dog' });
  assert.equal(kept.status, 200);
  assert.equal((await kept.json()).modality, 'home');
  assert.equal((await row(vetService.id)).modality, 'home');
});

test('P04-ASM-036: editing a service does not change appointments that are already booked; later bookings follow the new details', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Con cita'));
  const booked = await app.request('/api/owner/appointments', { method: 'POST', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify({ serviceId: service.id, petId: world.owner.petId, startsAt: at(MONDAY, 11) }) });
  assert.equal(booked.status, 201);
  const appointmentId = (await booked.json()).id;
  const before = JSON.stringify((await admin.query('SELECT * FROM appointment WHERE id = $1', [appointmentId])).rows[0]);

  assert.equal((await update(world.clinic, service.id, { name: 'Con cita (nueva)', priceCop: 99000, species: 'cat', modality: 'home' })).status, 200);

  assert.equal(JSON.stringify((await admin.query('SELECT * FROM appointment WHERE id = $1', [appointmentId])).rows[0]), before, 'the appointment row is byte-identical');
  const list = (await (await app.request('/api/owner/appointments', { headers: { cookie: world.owner.cookie } })).json()).appointments;
  const mine = list.find((a) => a.id === appointmentId);
  assert.equal(mine.status, 'scheduled');
  assert.equal(mine.modality, 'clinic', 'the appointment keeps the modality it was booked with');
  assert.equal(mine.startsAt, at(MONDAY, 11));
  const providerList = (await (await app.request('/api/provider/appointments', { headers: { cookie: world.clinic.cookie } })).json()).appointments;
  assert.equal(providerList.find((a) => a.id === appointmentId).status, 'scheduled');

  const again = await app.request('/api/owner/appointments', { method: 'POST', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify({ serviceId: service.id, petId: world.owner.petId, startsAt: at(MONDAY, 12), visitAddress: 'Calle 9 # 8-7' }) });
  assert.equal(again.status, 422, 'the dog can no longer book what is now a cat service (now at home, so the address is sent)');
  assert.deepEqual(await again.json(), { code: 'PET_NOT_ELIGIBLE' });
});

test('race with a booking: a species or modality change made while a booking waits for the provider lock makes that booking fail cleanly', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Carrera'));
  const holder = await pool.connect();
  try {
    await holder.query('BEGIN');
    await holder.query('SELECT provider_id FROM provider_profile WHERE provider_id = $1 FOR UPDATE', [world.clinic.id]);
    let settled = false;
    const pending = app.request('/api/owner/appointments', { method: 'POST', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify({ serviceId: service.id, petId: world.owner.petId, startsAt: at('2026-10-19', 9) }) })
      .then((response) => { settled = true; return response; });
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(settled, false, 'the booking waits for the lock held by the edit');
    await holder.query(`UPDATE offering SET species = 'cat' WHERE id = $1`, [service.id]); // the edit, still uncommitted
    await holder.query('COMMIT');
    const response = await pending;
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { code: 'SLOT_UNAVAILABLE' });
    assert.equal((await admin.query('SELECT count(*)::int n FROM appointment WHERE service_id = $1', [service.id])).rows[0].n, 0, 'no appointment was written');
  } finally {
    holder.release();
  }
});

test('the edit takes the provider lock: it waits for a transaction that holds it and then applies', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Espera'));
  const holder = await pool.connect();
  try {
    await holder.query('BEGIN');
    await holder.query('SELECT provider_id FROM provider_profile WHERE provider_id = $1 FOR UPDATE', [world.clinic.id]);
    let settled = false;
    const pending = update(world.clinic, service.id, { name: 'Espera editada', priceCop: 1000, species: 'dog', modality: 'clinic' }).then((response) => { settled = true; return response; });
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(settled, false, 'the edit waits while the provider lock is held (IF-024)');
    assert.equal((await row(service.id)).name, 'Espera');
    await holder.query('COMMIT');
    assert.equal((await pending).status, 200);
    assert.equal((await row(service.id)).name, 'Espera editada');
  } finally {
    holder.release();
  }
});

test('concurrent edits of one service never mix fields: the final row equals exactly one of the submitted versions', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Concurrente'));
  const versions = Array.from({ length: 10 }, (_, i) => ({ name: `Versión ${i}`, priceCop: 1000 + i, species: i % 2 ? 'dog' : 'cat', modality: ['clinic', 'home', 'both'][i % 3] }));
  const responses = await Promise.all(versions.map((body) => update(world.clinic, service.id, body)));
  assert.ok(responses.every((response) => response.status === 200), responses.map((r) => r.status).join());
  const final = await row(service.id);
  assert.ok(versions.some((v) => v.name === final.name && v.priceCop === final.price_cop && v.species === final.species && v.modality === final.modality), JSON.stringify(final));
});

test('a service edited to fit the constraints of the database never reaches them: boundaries 1 and 2147483647 for the price, 120 characters for the name', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Límites'));
  assert.equal((await update(world.clinic, service.id, { name: '🐶'.repeat(120), priceCop: 1, species: 'dog', modality: 'clinic' })).status, 200);
  assert.equal((await update(world.clinic, service.id, { name: 'é'.repeat(120), priceCop: 2147483647, species: 'cat', modality: 'home' })).status, 200);
  assert.equal((await update(world.clinic, service.id, { name: 'x'.repeat(121), priceCop: 5, species: 'dog', modality: 'clinic' })).status, 422);
  assert.equal((await update(world.clinic, service.id, { name: 'x', priceCop: 2147483648, species: 'dog', modality: 'clinic' })).status, 422);
  assert.equal((await row(service.id)).price_cop, 2147483647);
});

test('race with a booking: an edit that only changes the offered modality also makes the waiting booking fail cleanly (BR-007)', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Carrera de modalidad'));
  const holder = await pool.connect();
  try {
    await holder.query('BEGIN');
    await holder.query('SELECT provider_id FROM provider_profile WHERE provider_id = $1 FOR UPDATE', [world.clinic.id]);
    let settled = false;
    const pending = app.request('/api/owner/appointments', { method: 'POST', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify({ serviceId: service.id, petId: world.owner.petId, startsAt: at('2026-10-19', 10) }) })
      .then((response) => { settled = true; return response; });
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(settled, false, 'the booking waits for the lock held by the edit');
    await holder.query(`UPDATE offering SET modality = 'home' WHERE id = $1`, [service.id]); // clinic-only service becomes home-only
    await holder.query('COMMIT');
    const response = await pending;
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { code: 'SLOT_UNAVAILABLE' });
    assert.equal((await admin.query('SELECT count(*)::int n FROM appointment WHERE service_id = $1', [service.id])).rows[0].n, 0, 'no clinic appointment was created on a home-only service');
  } finally {
    holder.release();
  }
});
