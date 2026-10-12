// US-019 against PostgreSQL through the real module registry: slots, booking in the clinic, species and pet
// rules, clinic vs independent availability, races. AC-046 to AC-051, AC-108, AC-109; BR-005, BR-010 to
// BR-014, BR-024; EDGE-004 to EDGE-007, EDGE-009, EDGE-016, EDGE-030.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/app.js';
import { migrate } from '../src/db/migrator.js';
import { modules } from '../src/modules/index.js';
import { generateSessionToken, hashSessionToken } from '../src/modules/identity/sessions.js';
import { bookSlot } from '../src/modules/scheduling/booking.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_booking_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
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
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 5 });
  app = await startApp(createApp({ config: testConfig(), db: pool, clock: fixedClock(NOW), modules }));

  world.clinic = await signUpProvider('clinic', 'Calle 1 # 2-3');
  await setHours(world.clinic, { 1: [8, 12], 2: [9, 17] });
  world.dogClinic = await publish(world.clinic, { name: 'Consulta perro', priceCop: 60000, species: 'dog', modality: 'clinic' });
  world.catBoth = await publish(world.clinic, { name: 'Consulta gato', priceCop: 55000, species: 'cat', modality: 'both' });
  world.dogHome = await publish(world.clinic, { name: 'Baño a domicilio', priceCop: 30000, species: 'dog', modality: 'home' });

  world.vet = await signUpProvider('independent');
  await setHours(world.vet, { 1: [8, 12] });
  world.vetCat = await publish(world.vet, { name: 'Visita felina', priceCop: 40000, species: 'cat' });

  world.noHours = await signUpProvider('clinic', 'Calle 9');
  world.noHoursService = await publish(world.noHours, { name: 'Sin horario', priceCop: 1000, species: 'dog', modality: 'clinic' });

  world.ownerDog = await signUpOwner('dog');
  world.ownerCat = await signUpOwner('cat');
  world.ownerBoth = await signUpOwner('dog');
  await admin.query(`INSERT INTO pet (owner_id, name, species, breed, age_years) VALUES ($1, 'Mia', 'cat', 'Mix', 1)`, [world.ownerBoth.id]);
  world.ownerNone = await signUpOwner('dog');
  await admin.query('DELETE FROM pet WHERE owner_id = $1', [world.ownerNone.id]); // pet removal (US-007) is not delivered
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
    body: JSON.stringify({ name: `Prov ${providerType}`, email, password: 'a-long-password', providerType, ...(address ? { address } : {}) }),
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
  const id = (await admin.query(`SELECT id FROM account WHERE email = $1 AND account_type = 'owner'`, [email])).rows[0].id;
  const pets = await (await app.request('/api/owner/pets', { headers: { cookie: response.headers.get('set-cookie').split(';')[0] } })).json();
  return { id, cookie: response.headers.get('set-cookie').split(';')[0], petId: pets.pets[0]?.id };
}

async function setHours(provider, ranges) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const range = ranges[index + 1];
    return range ? { weekday: index + 1, works: true, startHour: range[0], endHour: range[1] } : { weekday: index + 1, works: false };
  });
  const response = await app.request('/api/provider/working-hours', { method: 'PUT', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify({ days }) });
  assert.equal(response.status, 200);
}

async function publish(provider, body) {
  const response = await app.request('/api/provider/services', { method: 'POST', headers: { cookie: provider.cookie, ...J }, body: JSON.stringify(body) });
  assert.equal(response.status, 201);
  return { ...(await response.json()), providerId: provider.id, providerType: provider.type };
}

const context = async (owner, service, week) => {
  const response = await app.request(`/api/services/${service.id}/booking-context${week ? `?weekStart=${week}` : ''}`, { headers: { cookie: owner.cookie } });
  return { status: response.status, body: await response.json() };
};
const book = async (owner, body) => {
  const response = await app.request('/api/owner/appointments', { method: 'POST', headers: { cookie: owner.cookie, ...J }, body: JSON.stringify(body) });
  return { status: response.status, body: await response.json() };
};
const rows = async (providerId) => (await admin.query('SELECT * FROM appointment WHERE provider_id = $1 ORDER BY created_at', [providerId])).rows;
const slotsOf = (ctx, date) => ctx.body.days.find((day) => day.date === date).slots;

test('AC-046 / BR-010 / BR-011 / EDGE-005: the context offers one-hour slots only inside the provider working days and hours', { skip }, async () => {
  const { status, body } = await context(world.ownerDog, world.dogClinic);
  assert.equal(status, 200);
  assert.equal(body.now, '2026-10-12T09:30:00-05:00');
  assert.equal(body.weekStart, MONDAY);
  assert.equal(body.providerHasHours, true);
  assert.equal(body.days.length, 7);
  assert.deepEqual(body.days.map((d) => d.date), ['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']);
  assert.deepEqual(slotsOf({ body }, MONDAY), [at(MONDAY, 10), at(MONDAY, 11)], 'Monday 8-12, now 09:30 (AC-051)');
  assert.deepEqual(slotsOf({ body }, '2026-10-13'), [9, 10, 11, 12, 13, 14, 15, 16].map((h) => at('2026-10-13', h)), 'Tuesday 9-17, last slot 16:00');
  for (const date of ['2026-10-14', '2026-10-15', '2026-10-16', '2026-10-17', '2026-10-18']) assert.deepEqual(slotsOf({ body }, date), [], date);
  assert.deepEqual(body.service, {
    id: world.dogClinic.id, name: 'Consulta perro', species: 'dog', priceCop: 60000, modality: 'clinic',
    provider: { id: world.clinic.id, name: 'Prov clinic', type: 'clinic', address: 'Calle 1 # 2-3' },
  });
  assert.equal(body.ownerHasPets, true);
  assert.deepEqual(body.eligiblePetIds, [world.ownerDog.petId]);
});

test('AC-051 / EDGE-009: slots that already started are not offered; future weeks are, past weeks are empty', { skip }, async () => {
  const current = await context(world.ownerDog, world.dogClinic);
  assert.equal(slotsOf(current, MONDAY).includes(at(MONDAY, 9)), false);
  const next = await context(world.ownerDog, world.dogClinic, '2026-10-19');
  assert.deepEqual(slotsOf(next, '2026-10-19'), [8, 9, 10, 11].map((h) => at('2026-10-19', h)));
  const far = await context(world.ownerDog, world.dogClinic, '2030-01-07');
  assert.equal(far.body.days.every((d) => Array.isArray(d.slots)), true);
  assert.deepEqual(slotsOf(far, '2030-01-07'), [8, 9, 10, 11].map((h) => at('2030-01-07', h)), 'no upper horizon');
  const past = await context(world.ownerDog, world.dogClinic, '2026-10-05');
  assert.equal(past.body.days.every((d) => d.slots.length === 0), true);
});

test('AC-026 / EDGE-014: a provider without hours offers nothing and says so', { skip }, async () => {
  const { body } = await context(world.ownerDog, world.noHoursService);
  assert.equal(body.providerHasHours, false);
  assert.equal(body.days.every((d) => d.slots.length === 0), true);
  const refused = await book(world.ownerDog, { serviceId: world.noHoursService.id, petId: world.ownerDog.petId, startsAt: at(MONDAY, 11) });
  assert.equal(refused.status, 409);
  assert.deepEqual(refused.body, { code: 'SLOT_UNAVAILABLE' });
});

test('AC-047 / BR-014: booking schedules immediately with no confirmation and stores everything', { skip }, async () => {
  const { status, body } = await book(world.ownerDog, { serviceId: world.dogClinic.id, petId: world.ownerDog.petId, startsAt: at(MONDAY, 11) });
  assert.equal(status, 201);
  assert.deepEqual(Object.keys(body).sort(), ['endsAt', 'id', 'modality', 'pet', 'place', 'provider', 'service', 'startsAt', 'status', 'upcoming']);
  assert.equal(body.status, 'scheduled');
  assert.equal(body.upcoming, true);
  assert.equal(body.startsAt, at(MONDAY, 11));
  assert.equal(body.endsAt, at(MONDAY, 12));
  assert.equal(body.modality, 'clinic');
  assert.deepEqual(body.place, { kind: 'clinic', address: 'Calle 1 # 2-3' });
  assert.deepEqual(body.service, { id: world.dogClinic.id, name: 'Consulta perro' });
  assert.deepEqual(body.pet, { id: world.ownerDog.petId, name: 'Pet dog' });
  assert.deepEqual(body.provider, { id: world.clinic.id, name: 'Prov clinic', type: 'clinic' });

  const stored = (await admin.query('SELECT * FROM appointment WHERE id = $1', [body.id])).rows[0];
  assert.equal(stored.status, 'scheduled');
  assert.equal(stored.cancelled_at, null);
  assert.equal(stored.owner_id, world.ownerDog.id);
  assert.equal(stored.provider_id, world.clinic.id);
  assert.equal(stored.provider_capacity, 'clinic');
  assert.equal(stored.service_id, world.dogClinic.id);
  assert.equal(stored.pet_id, world.ownerDog.petId);
  assert.equal(stored.modality, 'clinic');
  assert.equal(stored.visit_address, null);
  assert.equal(stored.starts_at.toISOString(), '2026-10-12T16:00:00.000Z');
});

test('AC-049 / BR-012: a clinic still offers a slot that already has appointments, and accepts more', { skip }, async () => {
  const other = await signUpOwner('dog');
  const first = await book(other, { serviceId: world.dogClinic.id, petId: other.petId, startsAt: at('2026-10-13', 10) });
  const second = await book(world.ownerDog, { serviceId: world.dogClinic.id, petId: world.ownerDog.petId, startsAt: at('2026-10-13', 10) });
  const third = await book(world.ownerBoth, { serviceId: world.dogClinic.id, petId: (await admin.query(`SELECT id FROM pet WHERE owner_id = $1 AND species = 'dog'`, [world.ownerBoth.id])).rows[0].id, startsAt: at('2026-10-13', 10) });
  assert.deepEqual([first.status, second.status, third.status], [201, 201, 201]);
  const after = await context(world.ownerCat, world.dogClinic);
  assert.equal(slotsOf(after, '2026-10-13').includes(at('2026-10-13', 10)), true);
  assert.equal((await admin.query(`SELECT count(*)::int n FROM appointment WHERE provider_id = $1 AND starts_at = '2026-10-13T15:00:00Z' AND status = 'scheduled'`, [world.clinic.id])).rows[0].n, 3);
});

test('AC-050 / EDGE-006 / BR-013: an independent veterinarian does not offer a slot that has a scheduled appointment', { skip }, async () => {
  const before = await context(world.ownerCat, world.vetCat);
  assert.deepEqual(slotsOf(before, MONDAY), [at(MONDAY, 10), at(MONDAY, 11)]);
  assert.equal(before.body.service.provider.address, undefined, 'no address key for an independent without one');
  const insert = (hour, status) => admin.query(
    `INSERT INTO appointment (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, visit_address, status, cancelled_at)
     VALUES ($1, $2, $3, $4, 'independent', $5, 'home', 'Calle 5 # 6-7', $6, $7)`,
    [world.ownerCat.id, world.ownerCat.petId, world.vetCat.id, world.vet.id, new Date(`${MONDAY}T${String(hour + 5).padStart(2, '0')}:00:00Z`), status, status === 'cancelled' ? NOW : null],
  );
  await insert(11, 'scheduled');
  await insert(10, 'cancelled');
  const afterBooking = await context(world.ownerDog, world.vetCat);
  assert.deepEqual(slotsOf(afterBooking, MONDAY), [at(MONDAY, 10)], '11:00 is taken; the cancelled 10:00 is free again');
});

test('EDGE-007 / BR-013: concurrent bookings of one independent slot leave exactly one appointment', { skip }, async () => {
  const startsAt = new Date('2026-10-19T14:00:00Z'); // next Monday 09:00
  const service = { id: world.vetCat.id, providerId: world.vet.id, providerType: 'independent' };
  const attempt = () => bookSlot(pool, { ownerId: world.ownerCat.id, service, petId: world.ownerCat.petId, startsAt, modality: 'home', visitAddress: 'Calle 8', now: NOW });
  const settled = await Promise.allSettled(Array.from({ length: 8 }, attempt));
  assert.equal(settled.filter((r) => r.status === 'fulfilled').length, 1);
  const rejected = settled.filter((r) => r.status === 'rejected');
  assert.equal(rejected.length, 7);
  assert.ok(rejected.every((r) => r.reason.code === 'SLOT_UNAVAILABLE'), rejected.map((r) => r.reason.code ?? r.reason.message).join());
  assert.equal((await admin.query(`SELECT count(*)::int n FROM appointment WHERE provider_id = $1 AND starts_at = $2`, [world.vet.id, startsAt])).rows[0].n, 1);
});

test('BR-012: concurrent bookings of one clinic slot all succeed', { skip }, async () => {
  const startsAt = new Date('2026-10-19T14:00:00Z');
  const service = { id: world.dogClinic.id, providerId: world.clinic.id, providerType: 'clinic' };
  const settled = await Promise.allSettled(Array.from({ length: 6 }, () => bookSlot(pool, { ownerId: world.ownerDog.id, service, petId: world.ownerDog.petId, startsAt, modality: 'clinic', now: NOW })));
  assert.equal(settled.every((r) => r.status === 'fulfilled'), true);
});

test('BR-011: a slot that stopped being offered (hours changed after the owner saw it) is refused with SLOT_UNAVAILABLE', { skip }, async () => {
  const provider = await signUpProvider('clinic', 'Calle 3');
  await setHours(provider, { 1: [8, 12] });
  const service = await publish(provider, { name: 'Cambia', priceCop: 5000, species: 'dog', modality: 'clinic' });
  const seen = await context(world.ownerDog, service);
  assert.equal(slotsOf(seen, MONDAY).includes(at(MONDAY, 11)), true);
  await setHours(provider, { 3: [8, 12] });
  const refused = await book(world.ownerDog, { serviceId: service.id, petId: world.ownerDog.petId, startsAt: at(MONDAY, 11) });
  assert.equal(refused.status, 409);
  assert.deepEqual(refused.body, { code: 'SLOT_UNAVAILABLE' });
  assert.equal((await rows(provider.id)).length, 0);
});

test('slot rules at booking time: past, closing hour, non-working day and off-hour starts are refused and write nothing', { skip }, async () => {
  const count = async () => (await rows(world.clinic.id)).length;
  const before = await count();
  const body = (startsAt) => ({ serviceId: world.dogClinic.id, petId: world.ownerDog.petId, startsAt });
  for (const startsAt of [at(MONDAY, 8), at(MONDAY, 9), at(MONDAY, 12), at('2026-10-14', 10), at('2026-10-11', 10), at('2026-10-05', 10)]) {
    const result = await book(world.ownerDog, body(startsAt));
    assert.equal(result.status, 409, startsAt);
    assert.deepEqual(result.body, { code: 'SLOT_UNAVAILABLE' }, startsAt);
  }
  const half = await book(world.ownerDog, body('2026-10-12T10:30:00-05:00'));
  assert.equal(half.status, 422);
  assert.deepEqual(half.body.fields, [{ field: 'startsAt', reason: 'NOT_ON_THE_HOUR' }]);
  assert.equal(await count(), before);
  const utc = await book(world.ownerDog, body('2026-10-13T15:00:00Z')); // 10:00 Bogota on Tuesday, written in UTC
  assert.equal(utc.status, 201);
  assert.equal(utc.body.startsAt, at('2026-10-13', 10));
});

test('AC-048 / EDGE-004 / BR-005: an owner without pets cannot book and is told so', { skip }, async () => {
  const { body } = await context(world.ownerNone, world.dogClinic);
  assert.equal(body.ownerHasPets, false);
  assert.deepEqual(body.eligiblePetIds, []);
  const result = await book(world.ownerNone, { serviceId: world.dogClinic.id, petId: world.ownerDog.petId, startsAt: at('2026-10-13', 12) });
  assert.equal(result.status, 422);
  assert.deepEqual(result.body, { code: 'NO_PETS' });
  const pets = await (await app.request('/api/owner/pets', { headers: { cookie: world.ownerNone.cookie } })).json();
  assert.deepEqual(pets, { pets: [] });
});

test('AC-108 / BR-024 / EDGE-016: only pets of the service species are eligible and bookable', { skip }, async () => {
  const dogService = await context(world.ownerBoth, world.dogClinic);
  const catService = await context(world.ownerBoth, world.catBoth);
  const pets = (await (await app.request('/api/owner/pets', { headers: { cookie: world.ownerBoth.cookie } })).json()).pets;
  const dog = pets.find((p) => p.species === 'dog');
  const cat = pets.find((p) => p.species === 'cat');
  assert.deepEqual(dogService.body.eligiblePetIds, [dog.id]);
  assert.deepEqual(catService.body.eligiblePetIds, [cat.id]);
  const wrong = await book(world.ownerBoth, { serviceId: world.dogClinic.id, petId: cat.id, startsAt: at('2026-10-13', 11) });
  assert.equal(wrong.status, 422);
  assert.deepEqual(wrong.body, { code: 'PET_NOT_ELIGIBLE' });
  const right = await book(world.ownerBoth, { serviceId: world.dogClinic.id, petId: dog.id, startsAt: at('2026-10-13', 11) });
  assert.equal(right.status, 201);
  assert.equal(right.body.pet.id, dog.id);
});

test('AC-109 / EDGE-030: an owner with no pet of the service species cannot book it', { skip }, async () => {
  const { body } = await context(world.ownerDog, world.catBoth);
  assert.equal(body.ownerHasPets, true);
  assert.deepEqual(body.eligiblePetIds, []);
  const before = (await rows(world.clinic.id)).length;
  const result = await book(world.ownerDog, { serviceId: world.catBoth.id, petId: world.ownerDog.petId, modality: 'clinic', startsAt: at('2026-10-13', 12) });
  assert.equal(result.status, 422);
  assert.deepEqual(result.body, { code: 'PET_NOT_ELIGIBLE' });
  assert.equal((await rows(world.clinic.id)).length, before);
});

test('ownership and existence: another owner\'s pet, unknown or malformed ids and non-service ids are NOT_FOUND', { skip }, async () => {
  const stranger = await book(world.ownerDog, { serviceId: world.dogClinic.id, petId: world.ownerCat.petId, startsAt: at('2026-10-13', 12) });
  assert.equal(stranger.status, 404);
  assert.deepEqual(stranger.body, { code: 'NOT_FOUND' });
  const unknownPet = await book(world.ownerDog, { serviceId: world.dogClinic.id, petId: randomUUID(), startsAt: at('2026-10-13', 12) });
  assert.equal(unknownPet.status, 404);
  const unknownService = await book(world.ownerDog, { serviceId: randomUUID(), petId: world.ownerDog.petId, startsAt: at('2026-10-13', 12) });
  assert.equal(unknownService.status, 404);
  for (const id of [randomUUID(), 'nope', "1' OR '1'='1", world.ownerDog.id, world.clinic.id]) {
    const response = await app.request(`/api/services/${encodeURIComponent(id)}/booking-context`, { headers: { cookie: world.ownerDog.cookie } });
    assert.equal(response.status, 404, id);
    assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  }
  const product = await (await app.request('/api/provider/products', { method: 'POST', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify({ name: 'Alimento', priceCop: 9000, species: 'dog' }) })).json();
  const asService = await app.request(`/api/services/${product.id}/booking-context`, { headers: { cookie: world.ownerDog.cookie } });
  assert.equal(asService.status, 404, 'a product id is not a service');
});

test('AC-052 to AC-054 / BR-015 / EDGE-008: home visits require a visit address and store the selected modality', { skip }, async () => {
  const before = (await rows(world.clinic.id)).length + (await rows(world.vet.id)).length;
  const bothCatPet = (await admin.query(`SELECT id FROM pet WHERE owner_id = $1 AND species = 'cat'`, [world.ownerBoth.id])).rows[0].id;
  const missingIndependentAddress = await book(world.ownerCat, { serviceId: world.vetCat.id, petId: world.ownerCat.petId, startsAt: at('2026-10-19', 10) });
  assert.deepEqual(missingIndependentAddress.body.fields, [{ field: 'visitAddress', reason: 'REQUIRED' }]);
  const blankAddress = await book(world.ownerCat, { serviceId: world.vetCat.id, petId: world.ownerCat.petId, startsAt: at('2026-10-19', 10), visitAddress: '   ' });
  assert.deepEqual(blankAddress.body.fields, [{ field: 'visitAddress', reason: 'REQUIRED' }]);
  const longAddress = await book(world.ownerCat, { serviceId: world.vetCat.id, petId: world.ownerCat.petId, startsAt: at('2026-10-19', 10), visitAddress: 'a'.repeat(301) });
  assert.deepEqual(longAddress.body.fields, [{ field: 'visitAddress', reason: 'TOO_LONG' }]);
  const bothNoChoice = await book(world.ownerBoth, { serviceId: world.catBoth.id, petId: bothCatPet, startsAt: at('2026-10-13', 13) });
  assert.deepEqual(bothNoChoice.body.fields, [{ field: 'modality', reason: 'REQUIRED' }]);
  const bothHomeNoAddress = await book(world.ownerCat, { serviceId: world.catBoth.id, petId: world.ownerCat.petId, modality: 'home', startsAt: at('2026-10-13', 13) });
  assert.deepEqual(bothHomeNoAddress.body.fields, [{ field: 'visitAddress', reason: 'REQUIRED' }]);
  const bothClinicWithAddress = await book(world.ownerCat, { serviceId: world.catBoth.id, petId: world.ownerCat.petId, modality: 'clinic', startsAt: at('2026-10-13', 13), visitAddress: 'Calle 1' });
  assert.deepEqual(bothClinicWithAddress.body.fields, [{ field: 'visitAddress', reason: 'NOT_ALLOWED' }]);
  const clinicWithAddress = await book(world.ownerDog, { serviceId: world.dogClinic.id, petId: world.ownerDog.petId, startsAt: at('2026-10-13', 13), visitAddress: 'Calle 1' });
  assert.deepEqual(clinicWithAddress.body.fields, [{ field: 'visitAddress', reason: 'NOT_ALLOWED' }]);
  assert.equal((await rows(world.clinic.id)).length + (await rows(world.vet.id)).length, before, 'nothing was written');

  const independentHome = await book(world.ownerCat, {
    serviceId: world.vetCat.id, petId: world.ownerCat.petId, startsAt: at('2026-10-19', 10), visitAddress: ' Calle 8 # 9-10 ',
  });
  assert.equal(independentHome.status, 201, 'independent veterinarians offer home visits only');
  assert.equal(independentHome.body.modality, 'home');
  assert.deepEqual(independentHome.body.place, { kind: 'home', address: 'Calle 8 # 9-10' });
  let stored = (await rows(world.vet.id)).at(-1);
  assert.equal(stored.modality, 'home');
  assert.equal(stored.visit_address, 'Calle 8 # 9-10');

  const clinicHome = await book(world.ownerCat, {
    serviceId: world.catBoth.id, petId: world.ownerCat.petId, modality: 'home', startsAt: at('2026-10-13', 13), visitAddress: 'Calle 12 # 3-4',
  });
  assert.equal(clinicHome.status, 201);
  assert.deepEqual(clinicHome.body.place, { kind: 'home', address: 'Calle 12 # 3-4' });
  stored = (await rows(world.clinic.id)).at(-1);
  assert.equal(stored.modality, 'home');
  assert.equal(stored.visit_address, 'Calle 12 # 3-4');

  const clinicChoice = await book(world.ownerCat, {
    serviceId: world.catBoth.id, petId: world.ownerCat.petId, modality: 'clinic', startsAt: at('2026-10-13', 13),
  });
  assert.equal(clinicChoice.status, 201, 'a both-way clinic service can still be booked at the clinic');
  assert.deepEqual(clinicChoice.body.place, { kind: 'clinic', address: 'Calle 1 # 2-3' });
  stored = (await rows(world.clinic.id)).at(-1);
  assert.equal(stored.modality, 'clinic');
  assert.equal(stored.visit_address, null);
});

test('IF-009 own pets, access control and weekStart validation', { skip }, async () => {
  const mine = await (await app.request('/api/owner/pets', { headers: { cookie: world.ownerBoth.cookie } })).json();
  assert.deepEqual(mine.pets.map((p) => p.species).sort(), ['cat', 'dog']);
  assert.ok(mine.pets.every((p) => Object.keys(p).sort().join() === 'breed,id,name,species'));
  assert.equal((await app.request('/api/owner/pets')).status, 401);
  assert.equal((await app.request('/api/owner/pets', { headers: { cookie: world.clinic.cookie } })).status, 404);
  assert.equal((await app.request(`/api/services/${world.dogClinic.id}/booking-context`)).status, 401);
  assert.equal((await app.request(`/api/services/${world.dogClinic.id}/booking-context`, { headers: { cookie: world.clinic.cookie } })).status, 404);
  const post = await app.request('/api/owner/appointments', { method: 'POST', headers: { cookie: world.clinic.cookie, ...J }, body: JSON.stringify({ serviceId: world.dogClinic.id, petId: world.ownerDog.petId, startsAt: at(MONDAY, 11) }) });
  assert.equal(post.status, 404, 'a provider cannot book');
  assert.equal((await app.request('/api/owner/appointments', { method: 'POST', headers: { cookie: world.ownerDog.cookie, ...J, origin: 'https://evil.test' }, body: '{}' })).status, 403);
  for (const [query, reason] of [['weekStart=x', 'INVALID_FORMAT'], ['weekStart=2026-10-13', 'NOT_ALLOWED'], ['weekStart=1969-12-29', 'OUT_OF_RANGE'], ['weekStart=2026-02-30', 'INVALID_FORMAT']]) {
    const response = await app.request(`/api/services/${world.dogClinic.id}/booking-context?${query}`, { headers: { cookie: world.ownerDog.cookie } });
    assert.equal(response.status, 422, query);
    assert.deepEqual((await response.json()).fields, [{ field: 'weekStart', reason }], query);
  }
});

test('the database keeps its own guard: one scheduled appointment per independent veterinarian start (CR-008)', { skip }, async () => {
  const insert = () => admin.query(
    `INSERT INTO appointment (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, visit_address)
     VALUES ($1, $2, $3, $4, 'independent', '2026-10-26T14:00:00Z', 'home', 'Calle 1')`,
    [world.ownerCat.id, world.ownerCat.petId, world.vetCat.id, world.vet.id],
  );
  await insert();
  await assert.rejects(insert(), { constraint: 'appointment_independent_slot_uq' });
});

test('the default week is the Monday of the current Bogota week, also near midnight where UTC is already the next day', { skip }, async () => {
  const defaultWeek = async (iso) => {
    const now = new Date(iso);
    // A session that is valid at this clock (the shared ones idle out when the clock moves days ahead).
    const token = generateSessionToken();
    await admin.query(
      `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at) VALUES ($1, $2, $3, $3, $4)`,
      [hashSessionToken(token), world.ownerDog.id, new Date(now.getTime() - 60_000), new Date(now.getTime() + 3_600_000)],
    );
    const server = await startApp(createApp({ config: testConfig(), db: pool, clock: fixedClock(now), modules }));
    try {
      const response = await server.request(`/api/services/${world.dogClinic.id}/booking-context`, { headers: { cookie: `vetcare_session=${token}` } });
      return (await response.json()).weekStart;
    } finally {
      await server.close();
    }
  };
  assert.equal(await defaultWeek('2026-10-14T20:00:00Z'), '2026-10-12', 'Wednesday 15:00 Bogota');
  assert.equal(await defaultWeek('2026-10-18T22:00:00Z'), '2026-10-12', 'Sunday 17:00 Bogota');
  assert.equal(await defaultWeek('2026-10-19T03:00:00Z'), '2026-10-12', 'Sunday 22:00 Bogota, but already Monday in UTC');
  assert.equal(await defaultWeek('2026-10-19T05:00:00Z'), '2026-10-19', 'Monday 00:00 Bogota');
});

test('IF-024 / CR-009: a booking waits for the provider lock and then sees the hours that were saved meanwhile', { skip }, async () => {
  const provider = await signUpProvider('clinic', 'Calle 5');
  await setHours(provider, { 1: [8, 12] });
  const service = await publish(provider, { name: 'Con bloqueo', priceCop: 5000, species: 'dog', modality: 'clinic' });
  const holder = await pool.connect();
  try {
    await holder.query('BEGIN');
    await holder.query('SELECT provider_id FROM provider_profile WHERE provider_id = $1 FOR UPDATE', [provider.id]);
    let settled = false;
    const pending = book(world.ownerDog, { serviceId: service.id, petId: world.ownerDog.petId, startsAt: at(MONDAY, 11) }).then((result) => { settled = true; return result; });
    await new Promise((resolve) => setTimeout(resolve, 400));
    assert.equal(settled, false, 'the booking must wait while another transaction holds the provider lock');
    await holder.query('DELETE FROM working_hours WHERE provider_id = $1', [provider.id]); // the hours save, still uncommitted
    await holder.query('COMMIT');
    const result = await pending;
    assert.equal(result.status, 409);
    assert.deepEqual(result.body, { code: 'SLOT_UNAVAILABLE' });
    assert.equal((await rows(provider.id)).length, 0);
  } finally {
    holder.release();
  }
});
