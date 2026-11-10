// US-012 against PostgreSQL through the real module registry: a removed service disappears from the catalog,
// the public profile, search, the assistant and booking (AC-032); its upcoming appointments are cancelled and
// shown as cancelled to the owners and the provider (AC-083, BR-034, BR-035, EDGE-012); other providers cannot
// remove it (NFR-002); the removal is atomic and serialized with bookings under the provider lock.
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
const schema = `vetcare_svcrem_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const J = { origin: 'https://vetcare.test', 'content-type': 'application/json' };
const NOW = new Date('2026-10-12T14:30:00Z'); // Monday 09:30 in Bogota
const MONDAY = '2026-10-12';
const NEXT_MONDAY = '2026-10-19';
const at = (date, hour) => `${date}T${String(hour).padStart(2, '0')}:00:00-05:00`;
let admin;
let pool;
let app;
const clock = fixedClock(NOW);
const world = {};

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 10 });
  app = await startApp(createApp({ config: testConfig(), db: pool, clock, modules }));

  world.clinic = await signUpProvider('clinic', 'Calle 1');
  world.otherClinic = await signUpProvider('clinic', 'Calle 2');
  world.vet = await signUpProvider('independent');
  for (const provider of [world.clinic, world.otherClinic, world.vet]) await setHours(provider, { 1: [8, 18] });
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
const remove = (provider, id) => app.request(`/api/provider/offerings/${id}`, { method: 'DELETE', headers: { cookie: provider.cookie, origin: J.origin } });
const book = (owner, serviceId, startsAt, extra = {}) => app.request('/api/owner/appointments', { method: 'POST', headers: { cookie: owner.cookie, ...J }, body: JSON.stringify({ serviceId, petId: owner.petId, startsAt, ...extra }) });
const bookOk = async (owner, serviceId, startsAt, extra) => {
  const response = await book(owner, serviceId, startsAt, extra);
  assert.equal(response.status, 201, await response.clone().text());
  return (await response.json()).id;
};
const get = (who, path) => app.request(path, { headers: { cookie: who.cookie } });
const search = async (owner, query) => (await (await get(owner, `/api/search?${query}`)).json()).results;
const ownerList = async (owner) => (await (await get(owner, '/api/owner/appointments')).json()).appointments;
const providerList = async (provider) => (await (await get(provider, '/api/provider/appointments')).json()).appointments;
const offering = async (id) => (await admin.query('SELECT * FROM offering WHERE id = $1', [id])).rows[0];
const appointment = async (id) => (await admin.query('SELECT * FROM appointment WHERE id = $1', [id])).rows[0];
const dogClinic = (name) => ({ name, priceCop: 60000, species: 'dog', modality: 'clinic' });
const ask = async (owner, text) => (await app.request('/api/assistant/messages', { method: 'POST', headers: { cookie: owner.cookie, ...J }, body: JSON.stringify({ text }) })).json();

test('AC-032: a removed service is gone from the catalog, the public profile, search, the assistant and booking; the rest of the catalog stays', { skip }, async () => {
  const doomed = await publish(world.clinic, dogClinic('Peluquería zeta'));
  const kept = await publish(world.clinic, dogClinic('Peluquería zeta premium'));
  assert.equal((await search(world.owner, 'q=zeta')).length, 2);
  assert.equal((await ask(world.owner, '¿Cuánto cuesta una peluquería zeta?')).total, 2);

  const response = await remove(world.clinic, doomed.id);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { removed: true, cancelledAppointments: 0 });

  const catalog = await (await get(world.clinic, '/api/provider/offerings')).json();
  assert.equal(catalog.services.some((s) => s.id === doomed.id), false);
  assert.equal(catalog.services.some((s) => s.id === kept.id), true);
  const profile = await (await get(world.owner, `/api/providers/${world.clinic.id}`)).json();
  assert.equal(profile.services.some((s) => s.id === doomed.id), false, 'the public profile');
  assert.equal(profile.services.some((s) => s.id === kept.id), true);

  assert.deepEqual((await search(world.owner, 'q=zeta')).map((r) => r.id), [kept.id], 'search by name');
  assert.equal((await search(world.owner, 'q=zeta&species=dog')).some((r) => r.id === doomed.id), false, 'search with the species filter');
  const voice = await (await app.request('/api/search/voice', { method: 'POST', headers: { cookie: world.owner.cookie, ...J }, body: JSON.stringify({ transcript: 'peluquería zeta para perros' }) })).json();
  assert.equal(JSON.stringify(voice).includes(doomed.id), false, 'voice search');
  const answer = await ask(world.owner, '¿Cuánto cuesta una peluquería zeta?');
  assert.equal(answer.total, 1, 'the assistant');
  assert.equal(JSON.stringify(answer).includes(doomed.id), false);

  const context = await get(world.owner, `/api/services/${doomed.id}/booking-context?weekStart=${MONDAY}`);
  assert.equal(context.status, 404, 'no booking context for a removed service');
  const attempt = await book(world.owner, doomed.id, at(MONDAY, 12));
  assert.equal(attempt.status, 404, 'new appointments cannot be booked');
  assert.deepEqual(await attempt.json(), { code: 'NOT_FOUND' });
  assert.equal((await admin.query('SELECT count(*)::int n FROM appointment WHERE service_id = $1', [doomed.id])).rows[0].n, 0);

  const row = await offering(doomed.id);
  assert.ok(row, 'the row stays (logical removal, ADR-020)');
  assert.equal(new Date(row.removed_at).toISOString(), NOW.toISOString());
  assert.equal(row.name, 'Peluquería zeta', 'no other column changes');
  assert.equal((await book(world.owner, kept.id, at(MONDAY, 12))).status, 201, 'the other service of the same provider is still bookable');
});

test('AC-083 / BR-034 / BR-035 / EDGE-012: upcoming appointments of the removed service are cancelled and shown as cancelled to every owner and to the provider', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Consulta con citas'));
  const other = await publish(world.clinic, dogClinic('Consulta ajena a la baja'));
  const a1 = await bookOk(world.owner, service.id, at(MONDAY, 11));
  const a2 = await bookOk(world.owner2, service.id, at(MONDAY, 11)); // clinics have no slot limit (BR-012)
  const a3 = await bookOk(world.owner, service.id, at(NEXT_MONDAY, 9));
  const keep = await bookOk(world.owner, other.id, at(MONDAY, 13));

  // Not "upcoming": already started, and already cancelled earlier; both keep their data.
  const pet = world.owner.petId;
  const past = (await admin.query(
    `INSERT INTO appointment (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality)
     VALUES ($1, $2, $3, $4, 'clinic', '2026-10-05T15:00:00Z', 'clinic') RETURNING id`, [world.owner.id, pet, service.id, world.clinic.id])).rows[0].id;
  const cancelledBefore = (await admin.query(
    `INSERT INTO appointment (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, status, cancelled_at)
     VALUES ($1, $2, $3, $4, 'clinic', '2026-10-26T15:00:00Z', 'clinic', 'cancelled', '2026-10-10T10:00:00Z') RETURNING id`, [world.owner.id, pet, service.id, world.clinic.id])).rows[0].id;
  const untouched = JSON.stringify([await appointment(keep), await appointment(past), await appointment(cancelledBefore)]);

  const response = await remove(world.clinic, service.id);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { removed: true, cancelledAppointments: 3 }, 'exactly the three upcoming scheduled ones');

  for (const id of [a1, a2, a3]) {
    const row = await appointment(id);
    assert.equal(row.status, 'cancelled');
    assert.equal(new Date(row.cancelled_at).toISOString(), NOW.toISOString());
  }
  assert.equal(JSON.stringify([await appointment(keep), await appointment(past), await appointment(cancelledBefore)]), untouched, 'other services, started and already cancelled appointments are byte-identical');
  assert.equal((await admin.query('SELECT count(*)::int n FROM appointment WHERE service_id = $1', [service.id])).rows[0].n, 5, 'nothing was deleted (BR-035)');

  // Owners and the provider open their appointments (AC-083): still listed, as cancelled, with the removed service's name.
  const mine = await ownerList(world.owner);
  for (const id of [a1, a3]) {
    const card = mine.find((a) => a.id === id);
    assert.equal(card.status, 'cancelled', id);
    assert.equal(card.service.name, 'Consulta con citas');
    assert.equal(card.pet.id, pet);
  }
  assert.equal(mine.find((a) => a.id === keep).status, 'scheduled');
  assert.equal(mine.find((a) => a.id === past).status, 'scheduled', 'a started appointment is not cancelled');
  assert.equal((await ownerList(world.owner2)).find((a) => a.id === a2).status, 'cancelled', 'the other owner sees it cancelled too');
  const provider = await providerList(world.clinic);
  for (const id of [a1, a2, a3]) assert.equal(provider.find((a) => a.id === id).status, 'cancelled', id);
  assert.equal(provider.find((a) => a.id === keep).status, 'scheduled');

  // The assistant offers only upcoming scheduled appointments (BR-048): the cancelled ones are not mentioned.
  const next = await ask(world.owner, '¿Cuándo es mi próxima cita?');
  assert.equal(JSON.stringify(next).includes('Consulta con citas'), false);
});

test('cancelling frees the slot of an independent veterinarian (BR-013): another service of the same vet can take it', { skip }, async () => {
  const first = await publish(world.vet, { name: 'Visita uno', priceCop: 30000, species: 'dog' });
  const second = await publish(world.vet, { name: 'Visita dos', priceCop: 30000, species: 'dog' });
  const id = await bookOk(world.owner, first.id, at(MONDAY, 15), { visitAddress: 'Calle 5 # 4-3' });
  const taken = await book(world.owner2, second.id, at(MONDAY, 15), { visitAddress: 'Calle 9 # 8-7' });
  assert.equal(taken.status, 409, 'the slot is taken while the appointment is scheduled');

  assert.deepEqual(await (await remove(world.vet, first.id)).json(), { removed: true, cancelledAppointments: 1 });
  assert.equal((await appointment(id)).status, 'cancelled');
  const free = await book(world.owner2, second.id, at(MONDAY, 15), { visitAddress: 'Calle 9 # 8-7' });
  assert.equal(free.status, 201, 'the cancelled appointment no longer holds the slot');
});

test('ownership (NFR-002, CR-006): another provider, an owner, anonymous, a product, an unknown, a malformed or an already removed id never remove or cancel anything', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Solo mía'));
  const product = await (await app.request('/api/provider/products', { method: 'POST', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify({ name: 'Alimento', priceCop: 9000, species: 'dog' }) })).json();
  const id = await bookOk(world.owner, service.id, at(MONDAY, 16));
  const snapshot = async () => JSON.stringify([await offering(service.id), await offering(product.id), await appointment(id)]);
  const before = await snapshot();

  for (const response of [
    await remove(world.otherClinic, service.id),
    await remove(world.vet, service.id),
    await remove(world.clinic, product.id),
    await remove(world.clinic, randomUUID()),
    await remove(world.clinic, world.owner.id),
    await remove(world.clinic, world.clinic.id),
    await remove(world.owner, service.id),
  ]) {
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  for (const bad of ['nope', "1' OR '1'='1", service.id.replaceAll('-', '')]) {
    assert.equal((await remove(world.clinic, encodeURIComponent(bad))).status, 404, bad);
  }
  assert.equal((await app.request(`/api/provider/offerings/${service.id}`, { method: 'DELETE', headers: { origin: J.origin } })).status, 401);
  assert.equal((await app.request(`/api/provider/offerings/${service.id}`, { method: 'DELETE', headers: { cookie: world.clinic.cookie, origin: 'https://evil.test' } })).status, 403);
  assert.equal(await snapshot(), before, 'no column of the service, the product or the appointment changed');

  assert.equal((await remove(world.clinic, service.id)).status, 200);
  const again = await remove(world.clinic, service.id);
  assert.equal(again.status, 404, 'removing twice');
  assert.equal((await appointment(id)).status, 'cancelled');
  assert.equal(new Date((await appointment(id)).cancelled_at).toISOString(), NOW.toISOString());
  const put = await app.request(`/api/provider/services/${service.id}`, { method: 'PUT', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify(dogClinic('Revivida')) });
  assert.equal(put.status, 404, 'a removed service cannot be edited back to life');
});

test('race: a booking that waits for the provider lock while the service is removed fails with NOT_FOUND and writes nothing', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Carrera de baja'));
  const holder = await pool.connect();
  try {
    await holder.query('BEGIN');
    await holder.query('SELECT provider_id FROM provider_profile WHERE provider_id = $1 FOR UPDATE', [world.clinic.id]);
    let settled = false;
    const pending = book(world.owner, service.id, at(NEXT_MONDAY, 10)).then((response) => { settled = true; return response; });
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(settled, false, 'the booking waits for the provider lock');
    await holder.query('UPDATE offering SET removed_at = now() WHERE id = $1', [service.id]); // the removal, still uncommitted
    await holder.query('COMMIT');
    const response = await pending;
    assert.equal(response.status, 404);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
    assert.equal((await admin.query('SELECT count(*)::int n FROM appointment WHERE service_id = $1', [service.id])).rows[0].n, 0);
  } finally {
    holder.release();
  }
});

test('the removal takes the provider lock (IF-024): it waits for a transaction that holds it and then applies', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Baja que espera'));
  const id = await bookOk(world.owner, service.id, at(NEXT_MONDAY, 11));
  const holder = await pool.connect();
  try {
    await holder.query('BEGIN');
    await holder.query('SELECT provider_id FROM provider_profile WHERE provider_id = $1 FOR UPDATE', [world.clinic.id]);
    let settled = false;
    const pending = remove(world.clinic, service.id).then((response) => { settled = true; return response; });
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(settled, false, 'the removal waits while the provider lock is held');
    assert.equal((await offering(service.id)).removed_at, null);
    assert.equal((await appointment(id)).status, 'scheduled');
    await holder.query('COMMIT');
    assert.deepEqual(await (await pending).json(), { removed: true, cancelledAppointments: 1 });
  } finally {
    holder.release();
  }
});

test('storm: bookings racing with the removal end consistent — every appointment that got in is cancelled, none stays scheduled on the removed service', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Tormenta'));
  const calls = [9, 10, 11, 12, 13, 14, 15, 16].map((hour, i) => book(i % 2 ? world.owner2 : world.owner, service.id, at(NEXT_MONDAY, hour)));
  calls.splice(4, 0, remove(world.clinic, service.id)); // the removal lands in the middle of the batch
  const responses = await Promise.all(calls);
  const removal = responses[4];
  const bookings = responses.filter((_, index) => index !== 4);
  assert.equal(removal.status, 200);
  const created = bookings.filter((response) => response.status === 201).length;
  for (const response of bookings) assert.ok([201, 404].includes(response.status), `unexpected ${response.status}`);
  assert.equal((await removal.json()).cancelledAppointments, created, 'the removal cancelled exactly the bookings that were in before it');
  const rows = (await admin.query('SELECT status FROM appointment WHERE service_id = $1', [service.id])).rows;
  assert.equal(rows.length, created);
  assert.equal(rows.every((row) => row.status === 'cancelled'), true);
});

test('atomicity: if the cancellation fails the service is not removed and no appointment changes', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Todo o nada'));
  const id = await bookOk(world.owner, service.id, at(NEXT_MONDAY, 12));
  await admin.query(`CREATE FUNCTION fail_cancel() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'cancel blocked'; END $$`);
  await admin.query('CREATE TRIGGER fail_cancel_trg BEFORE UPDATE ON appointment FOR EACH ROW EXECUTE FUNCTION fail_cancel()');
  try {
    assert.equal((await remove(world.clinic, service.id)).status, 500);
  } finally {
    await admin.query('DROP TRIGGER fail_cancel_trg ON appointment');
    await admin.query('DROP FUNCTION fail_cancel()');
  }
  assert.equal((await offering(service.id)).removed_at, null, 'the removal was rolled back');
  assert.equal((await appointment(id)).status, 'scheduled');
  assert.equal((await search(world.owner, 'q=todo%20o%20nada')).length, 1, 'still visible');
});

test('boundary (BR-034): an appointment that starts exactly now is already started and is not cancelled; one starting an hour later is', { skip }, async () => {
  const service = await publish(world.clinic, dogClinic('Frontera'));
  clock.set('2026-10-12T16:00:00Z'); // 11:00 in Bogota, exactly on the hour
  // The clinic's session would be idle for 90 minutes at the new time; refresh it so the request is authenticated.
  await admin.query('UPDATE session SET last_seen_at = $1 WHERE account_id = $2', [new Date('2026-10-12T16:00:00Z'), world.clinic.id]);
  try {
    const insert = async (startsAt) => (await admin.query(
      `INSERT INTO appointment (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality)
       VALUES ($1, $2, $3, $4, 'clinic', $5, 'clinic') RETURNING id`, [world.owner.id, world.owner.petId, service.id, world.clinic.id, startsAt])).rows[0].id;
    const starting = await insert('2026-10-12T16:00:00Z');
    const later = await insert('2026-10-12T17:00:00Z');
    assert.deepEqual(await (await remove(world.clinic, service.id)).json(), { removed: true, cancelledAppointments: 1 });
    assert.equal((await appointment(starting)).status, 'scheduled', 'starts at exactly now: not upcoming');
    assert.equal((await appointment(later)).status, 'cancelled');
    assert.equal(new Date((await appointment(later)).cancelled_at).toISOString(), '2026-10-12T16:00:00.000Z');
  } finally {
    clock.set(NOW);
  }
});
