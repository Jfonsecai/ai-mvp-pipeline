// US-022 against PostgreSQL: owner cancellation, appointment visibility and released independent-vet slots.
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
const schema = `vetcare_cancel_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-12T12:00:00Z');
const J = { origin: 'https://vetcare.test', 'content-type': 'application/json' };
const tokens = {
  owner: 'cancel-test-owner',
  otherOwner: 'cancel-test-other-owner',
  provider: 'cancel-test-provider',
  otherProvider: 'cancel-test-other-provider',
};
let admin;
let pool;
let app;
let schemaCreated = false;
let ownerId;
let otherOwnerId;
let providerId;
let otherProviderId;
let serviceId;
let petId;
let appointmentIds;

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

async function addSession(accountId, token) {
  await admin.query(
    `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at)
     VALUES ($1, $2, $3, $3, $4)`,
    [hashSessionToken(token), accountId, new Date('2026-10-12T11:55:00Z'), new Date('2026-10-12T20:00:00Z')],
  );
}

async function addAppointment(startsAt, status = 'scheduled') {
  const result = await admin.query(
    `INSERT INTO appointment
       (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, visit_address, status, cancelled_at)
     VALUES ($1, $2, $3, $4, 'independent', $5, 'home', 'Carrera 7 # 10-20', $6, CASE WHEN $6 = 'cancelled' THEN $7::timestamptz ELSE NULL END)
     RETURNING id`,
    [ownerId, petId, serviceId, providerId, startsAt, status, NOW],
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

  const owner = await addOwner('Cancel Test Owner', tokens.owner);
  ownerId = owner.id;
  petId = owner.petId;
  const otherOwner = await addOwner('Other Cancel Test Owner', tokens.otherOwner);
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
  const otherProvider = await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash)
     VALUES ('provider', 'Other Independent Vet', $1, 'test-hash') RETURNING id`,
    [`${randomUUID()}@example.test`],
  );
  otherProviderId = otherProvider.rows[0].id;
  await admin.query(
    `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email)
     VALUES ($1, 'independent', 'Other Independent Vet', $2)`,
    [otherProviderId, `${randomUUID()}@example.test`],
  );
  await addSession(otherProviderId, tokens.otherProvider);
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

  appointmentIds = {
    future: await addAppointment('2026-10-13T15:00:00Z'),
    providerFuture: await addAppointment('2026-10-13T16:00:00Z'),
    past: await addAppointment('2026-10-12T11:00:00Z'),
    cancelled: await addAppointment('2026-10-13T17:00:00Z', 'cancelled'),
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
const cancel = (token, appointmentId) => app.request(
  `/api/owner/appointments/${appointmentId}/cancel`,
  { method: 'POST', headers: headers(token) },
);
const cancelAsProvider = (token, appointmentId) => app.request(
  `/api/provider/appointments/${appointmentId}/cancel`,
  { method: 'POST', headers: headers(token) },
);

test('AC-057 / AC-058: cancellation is visible to both parties and frees an independent veterinarian slot', { skip }, async () => {
  const response = await cancel(tokens.owner, appointmentIds.future);
  assert.equal(response.status, 200);
  const cancelled = await response.json();
  assert.equal(cancelled.id, appointmentIds.future);
  assert.equal(cancelled.status, 'cancelled');
  assert.deepEqual(Object.keys(cancelled).sort(), [
    'endsAt', 'id', 'modality', 'pet', 'place', 'provider', 'service', 'startsAt', 'status', 'upcoming',
  ]);

  const ownerList = await app.request('/api/owner/appointments', { headers: headers(tokens.owner) });
  const ownerAppointment = (await ownerList.json()).appointments.find(({ id }) => id === appointmentIds.future);
  assert.equal(ownerAppointment.status, 'cancelled');

  const providerList = await app.request('/api/provider/appointments', { headers: headers(tokens.provider) });
  const providerAppointment = (await providerList.json()).appointments.find(({ id }) => id === appointmentIds.future);
  assert.equal(providerAppointment.status, 'cancelled');

  const context = await app.request(
    `/api/services/${serviceId}/booking-context?weekStart=2026-10-12`,
    { headers: headers(tokens.otherOwner) },
  );
  assert.equal(context.status, 200);
  const { days } = await context.json();
  assert.ok(days.find(({ date }) => date === '2026-10-13').slots.includes('2026-10-13T10:00:00-05:00'));

  const stored = await admin.query('SELECT status, cancelled_at FROM appointment WHERE id = $1', [appointmentIds.future]);
  assert.equal(stored.rows[0].status, 'cancelled');
  assert.equal(new Date(stored.rows[0].cancelled_at).toISOString(), NOW.toISOString());
});

test('AC-059 / EDGE-010: started and already-cancelled appointments cannot be cancelled again', { skip }, async () => {
  for (const id of [appointmentIds.past, appointmentIds.cancelled, appointmentIds.future]) {
    const response = await cancel(tokens.owner, id);
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { code: 'APPOINTMENT_NOT_CHANGEABLE' });
  }
});

test('appointment cancellation is restricted to the signed-in owner', { skip }, async () => {
  const response = await cancel(tokens.otherOwner, appointmentIds.past);
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
});

test('AC-065: provider cancellation is visible as cancelled to both appointment parties', { skip }, async () => {
  const response = await cancelAsProvider(tokens.provider, appointmentIds.providerFuture);
  assert.equal(response.status, 200);
  const cancelled = await response.json();
  assert.equal(cancelled.id, appointmentIds.providerFuture);
  assert.equal(cancelled.status, 'cancelled');
  assert.deepEqual(Object.keys(cancelled).sort(), [
    'endsAt', 'id', 'modality', 'ownerName', 'pet', 'service', 'startsAt', 'status', 'upcoming',
  ]);

  const providerList = await app.request('/api/provider/appointments', { headers: headers(tokens.provider) });
  const providerAppointment = (await providerList.json()).appointments.find(({ id }) => id === appointmentIds.providerFuture);
  assert.equal(providerAppointment.status, 'cancelled');

  const ownerList = await app.request('/api/owner/appointments', { headers: headers(tokens.owner) });
  const ownerAppointment = (await ownerList.json()).appointments.find(({ id }) => id === appointmentIds.providerFuture);
  assert.equal(ownerAppointment.status, 'cancelled');

  const stored = await admin.query('SELECT status, cancelled_at FROM appointment WHERE id = $1', [appointmentIds.providerFuture]);
  assert.equal(stored.rows[0].status, 'cancelled');
  assert.equal(new Date(stored.rows[0].cancelled_at).toISOString(), NOW.toISOString());
});

test('AC-066 / EDGE-010: providers cannot cancel started, cancelled, or another provider appointment', { skip }, async () => {
  for (const id of [appointmentIds.past, appointmentIds.cancelled, appointmentIds.providerFuture]) {
    const response = await cancelAsProvider(tokens.provider, id);
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { code: 'APPOINTMENT_NOT_CHANGEABLE' });
  }

  const anotherProvider = await cancelAsProvider(tokens.otherProvider, appointmentIds.providerFuture);
  assert.equal(anotherProvider.status, 404);
  assert.deepEqual(await anotherProvider.json(), { code: 'NOT_FOUND' });
});
