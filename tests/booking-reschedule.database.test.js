// US-023 against PostgreSQL: offered slots, owner rescheduling, appointment views and edge cases.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createApp } from '../src/application.js';
import { migrate } from '../src/db/migrator.js';
import { hashSessionToken } from '../src/modules/identity/sessions.js';
import { createBookingRouter } from '../src/modules/scheduling/booking.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_reschedule_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-12T12:00:00Z');
const J = { origin: 'https://vetcare.test', 'content-type': 'application/json' };
const tokens = {
  owner: 'reschedule-test-owner',
  otherOwner: 'reschedule-test-other-owner',
  provider: 'reschedule-test-provider',
};
let admin;
let pool;
let app;
let schemaCreated = false;
let ownerId;
let otherOwnerId;
let providerId;
let serviceId;
let petId;
let appointments;

async function addSession(accountId, token) {
  await admin.query(
    `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at)
     VALUES ($1, $2, $3, $3, $4)`,
    [hashSessionToken(token), accountId, new Date('2026-10-12T11:55:00Z'), new Date('2026-10-12T20:00:00Z')],
  );
}

async function addOwner(name, token) {
  const account = await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash)
     VALUES ('owner', $1, $2, 'test-hash') RETURNING id`,
    [name, `${randomUUID()}@example.test`],
  );
  const id = account.rows[0].id;
  const pet = await admin.query(
    `INSERT INTO pet (owner_id, name, species, breed, age_years)
     VALUES ($1, 'Nala', 'dog', 'Mixed', 2) RETURNING id`,
    [id],
  );
  await addSession(id, token);
  return { id, petId: pet.rows[0].id };
}

async function addAppointment(accountId, appointmentPetId, startsAt, status = 'scheduled') {
  const result = await admin.query(
    `INSERT INTO appointment
       (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, visit_address, status, cancelled_at)
     VALUES ($1, $2, $3, $4, 'independent', $5, 'home', 'Carrera 7 # 10-20', $6, CASE WHEN $6 = 'cancelled' THEN $7::timestamptz ELSE NULL END)
     RETURNING id`,
    [accountId, appointmentPetId, serviceId, providerId, startsAt, status, NOW],
  );
  return result.rows[0].id;
}

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  schemaCreated = true;
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });

  const owner = await addOwner('Reschedule Test Owner', tokens.owner);
  ownerId = owner.id;
  petId = owner.petId;
  const otherOwner = await addOwner('Other Reschedule Owner', tokens.otherOwner);
  otherOwnerId = otherOwner.id;

  const provider = await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash)
     VALUES ('provider', 'Independent Vet', $1, 'test-hash') RETURNING id`,
    [`${randomUUID()}@example.test`],
  );
  providerId = provider.rows[0].id;
  await admin.query(
    `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email)
     VALUES ($1, 'independent', 'Independent Vet', $2)`,
    [providerId, `${randomUUID()}@example.test`],
  );
  await addSession(providerId, tokens.provider);
  const service = await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
     VALUES ($1, 'independent', 'service', 'Consulta general', 50000, 'dog', 'home') RETURNING id`,
    [providerId],
  );
  serviceId = service.rows[0].id;
  await admin.query(
    'INSERT INTO working_hours (provider_id, weekday, start_hour, end_hour) VALUES ($1, 2, 9, 12)',
    [providerId],
  );

  appointments = {
    moving: await addAppointment(ownerId, petId, '2026-10-13T14:00:00Z'),
    occupying: await addAppointment(otherOwnerId, otherOwner.petId, '2026-10-13T15:00:00Z'),
    past: await addAppointment(ownerId, petId, '2026-10-12T10:00:00Z'),
    cancelled: await addAppointment(ownerId, petId, '2026-10-13T17:00:00Z', 'cancelled'),
  };
  app = await startApp(createApp({
    config: testConfig(),
    db: pool,
    clock: fixedClock(NOW),
    modules: [{ createRouter: createBookingRouter }],
  }));
});

after(async () => {
  if (skip) return;
  if (app) await app.close();
  if (pool) await pool.end();
  if (admin) {
    if (schemaCreated) {
      await admin.query('SET search_path TO public');
      await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    }
    await admin.end();
  }
});

const headers = (token) => ({ cookie: `vetcare_session=${token}`, ...J });
const getContext = (token, id, query = '?weekStart=2026-10-12') => app.request(
  `/api/owner/appointments/${id}/reschedule-context${query}`,
  { headers: headers(token) },
);
const getProviderContext = (token, id, query = '?weekStart=2026-10-12') => app.request(
  `/api/provider/appointments/${id}/reschedule-context${query}`,
  { headers: headers(token) },
);
const reschedule = (token, id, startsAt) => app.request(
  `/api/owner/appointments/${id}/reschedule`,
  { method: 'POST', headers: headers(token), body: JSON.stringify({ startsAt }) },
);
const rescheduleAsProvider = (token, id, startsAt) => app.request(
  `/api/provider/appointments/${id}/reschedule`,
  { method: 'POST', headers: headers(token), body: JSON.stringify({ startsAt }) },
);

test('AC-061: context offers only available future slots and excludes the appointment current slot', { skip }, async () => {
  const response = await getContext(tokens.owner, appointments.moving);
  assert.equal(response.status, 200);
  const context = await response.json();
  assert.deepEqual(Object.keys(context).sort(), [
    'appointmentId', 'currentStartsAt', 'days', 'now', 'providerHasHours', 'weekStart',
  ]);
  assert.equal(context.appointmentId, appointments.moving);
  assert.equal(context.currentStartsAt, '2026-10-13T09:00:00-05:00');
  assert.equal(context.providerHasHours, true);
  const tuesday = context.days.find(({ date }) => date === '2026-10-13');
  assert.deepEqual(tuesday.slots, ['2026-10-13T11:00:00-05:00']);
});

test('AC-060 / AC-061: owner moves appointment and both appointment views show the persisted new time', { skip }, async () => {
  const response = await reschedule(tokens.owner, appointments.moving, '2026-10-13T11:00:00-05:00');
  assert.equal(response.status, 200);
  const saved = await response.json();
  assert.equal(saved.id, appointments.moving);
  assert.equal(saved.startsAt, '2026-10-13T11:00:00-05:00');
  assert.equal(saved.status, 'scheduled');

  const ownerList = await app.request('/api/owner/appointments', { headers: headers(tokens.owner) });
  const ownerAppointment = (await ownerList.json()).appointments.find(({ id }) => id === appointments.moving);
  assert.equal(ownerAppointment.startsAt, '2026-10-13T11:00:00-05:00');

  const providerList = await app.request('/api/provider/appointments', { headers: headers(tokens.provider) });
  const providerAppointment = (await providerList.json()).appointments.find(({ id }) => id === appointments.moving);
  assert.equal(providerAppointment.startsAt, '2026-10-13T11:00:00-05:00');

  const stored = await admin.query('SELECT starts_at FROM appointment WHERE id = $1', [appointments.moving]);
  assert.equal(new Date(stored.rows[0].starts_at).toISOString(), '2026-10-13T16:00:00.000Z');

  const refreshed = await getContext(tokens.owner, appointments.moving);
  const updatedContext = await refreshed.json();
  assert.deepEqual(
    updatedContext.days.find(({ date }) => date === '2026-10-13').slots,
    ['2026-10-13T09:00:00-05:00'],
  );

  const providerContext = await getProviderContext(tokens.provider, appointments.moving);
  assert.equal(providerContext.status, 200);
  const providerSlots = await providerContext.json();
  assert.equal(providerSlots.appointmentId, appointments.moving);
  assert.equal(providerSlots.currentStartsAt, '2026-10-13T11:00:00-05:00');
  assert.deepEqual(providerSlots.days.find(({ date }) => date === '2026-10-13').slots, ['2026-10-13T09:00:00-05:00']);

  const providerSavedResponse = await rescheduleAsProvider(tokens.provider, appointments.moving, '2026-10-13T09:00:00-05:00');
  assert.equal(providerSavedResponse.status, 200);
  const providerSaved = await providerSavedResponse.json();
  assert.equal(providerSaved.id, appointments.moving);
  assert.equal(providerSaved.startsAt, '2026-10-13T09:00:00-05:00');
  assert.equal(providerSaved.status, 'scheduled');

  const providerListAfter = await app.request('/api/provider/appointments', { headers: headers(tokens.provider) });
  assert.equal((await providerListAfter.json()).appointments.find(({ id }) => id === appointments.moving).startsAt, '2026-10-13T09:00:00-05:00');
  const ownerListAfter = await app.request('/api/owner/appointments', { headers: headers(tokens.owner) });
  assert.equal((await ownerListAfter.json()).appointments.find(({ id }) => id === appointments.moving).startsAt, '2026-10-13T09:00:00-05:00');

  const storedAfterProviderMove = await admin.query('SELECT starts_at FROM appointment WHERE id = $1', [appointments.moving]);
  assert.equal(new Date(storedAfterProviderMove.rows[0].starts_at).toISOString(), '2026-10-13T14:00:00.000Z');
});

test('EDGE-009 / EDGE-010: unavailable target slots and started or cancelled appointments are refused', { skip }, async () => {
  const occupied = await reschedule(tokens.owner, appointments.moving, '2026-10-13T10:00:00-05:00');
  assert.equal(occupied.status, 409);
  assert.deepEqual(await occupied.json(), { code: 'SLOT_UNAVAILABLE' });

  const pastTarget = await reschedule(tokens.owner, appointments.moving, '2026-10-12T09:00:00-05:00');
  assert.equal(pastTarget.status, 409);
  assert.deepEqual(await pastTarget.json(), { code: 'SLOT_UNAVAILABLE' });

  for (const id of [appointments.past, appointments.cancelled]) {
    const context = await getContext(tokens.owner, id);
    assert.equal(context.status, 409);
    assert.deepEqual(await context.json(), { code: 'APPOINTMENT_NOT_CHANGEABLE' });
    const changed = await reschedule(tokens.owner, id, '2026-10-13T11:00:00-05:00');
    assert.equal(changed.status, 409);
    assert.deepEqual(await changed.json(), { code: 'APPOINTMENT_NOT_CHANGEABLE' });
  }
});

test('owner can only retrieve or reschedule their own appointment', { skip }, async () => {
  const context = await getContext(tokens.otherOwner, appointments.moving);
  assert.equal(context.status, 404);
  assert.deepEqual(await context.json(), { code: 'NOT_FOUND' });
  const changed = await reschedule(tokens.otherOwner, appointments.moving, '2026-10-13T11:00:00-05:00');
  assert.equal(changed.status, 404);
  assert.deepEqual(await changed.json(), { code: 'NOT_FOUND' });
});

test('US-026 / EDGE-010: provider cannot reschedule an appointment that has started or was cancelled', { skip }, async () => {
  for (const id of [appointments.past, appointments.cancelled]) {
    const context = await getProviderContext(tokens.provider, id);
    assert.equal(context.status, 409);
    assert.deepEqual(await context.json(), { code: 'APPOINTMENT_NOT_CHANGEABLE' });
    const changed = await rescheduleAsProvider(tokens.provider, id, '2026-10-13T11:00:00-05:00');
    assert.equal(changed.status, 409);
    assert.deepEqual(await changed.json(), { code: 'APPOINTMENT_NOT_CHANGEABLE' });
  }

  const owner = await getProviderContext(tokens.owner, appointments.moving);
  assert.equal(owner.status, 404);
  assert.deepEqual(await owner.json(), { code: 'NOT_FOUND' });
});
