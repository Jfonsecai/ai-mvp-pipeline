// US-024 against PostgreSQL: IF-013 returns only the signed-in provider's appointments.
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createApp } from '../src/app.js';
import { migrate } from '../src/db/migrator.js';
import { createIdentityRouter } from '../src/modules/identity/sign-up.js';
import { createBookingRouter } from '../src/modules/scheduling/booking.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_provider_appts_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-12T12:00:00Z');
const J = { origin: 'https://vetcare.test', 'content-type': 'application/json' };
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
  app = await startApp(createApp({
    config: testConfig(),
    db: pool,
    clock: fixedClock(NOW),
    modules: [{ createRouter: createIdentityRouter }, { createRouter: createBookingRouter }],
  }));
});

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

async function signUpProvider(name) {
  const email = `${randomUUID()}@example.test`;
  const response = await app.request('/api/auth/sign-up/provider', {
    method: 'POST',
    headers: J,
    body: JSON.stringify({ name, email, password: 'a-long-password', providerType: 'clinic', address: 'Calle 10' }),
  });
  assert.equal(response.status, 201);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  const id = (await admin.query(`SELECT id FROM account WHERE email = $1 AND account_type = 'provider'`, [email])).rows[0].id;
  return { id, headers: { cookie, ...J } };
}

async function signUpOwner(name) {
  const email = `${randomUUID()}@example.test`;
  const response = await app.request('/api/auth/sign-up/owner', {
    method: 'POST',
    headers: J,
    body: JSON.stringify({
      name, email, password: 'a-long-password',
      pet: { name: `${name}'s pet`, species: 'dog', breed: 'Mix', ageYears: 3 },
    }),
  });
  assert.equal(response.status, 201);
  const cookie = response.headers.get('set-cookie').split(';')[0];
  const result = await admin.query(
    `SELECT a.id AS owner_id, p.id AS pet_id
       FROM account a JOIN pet p ON p.owner_id = a.id
      WHERE a.email = $1 AND a.account_type = 'owner'`,
    [email],
  );
  return { ...result.rows[0], headers: { cookie, ...J } };
}

async function addService(providerId) {
  const result = await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
     VALUES ($1, 'clinic', 'service', 'Consulta general', 50000, 'dog', 'both')
     RETURNING id`,
    [providerId],
  );
  return result.rows[0].id;
}

async function addAppointment({ providerId, ownerId, petId, serviceId, startsAt, modality, status = 'scheduled', visitAddress }) {
  await admin.query(
    `INSERT INTO appointment
       (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, visit_address, status, cancelled_at)
     VALUES ($1, $2, $3, $4, 'clinic', $5, $6, $7, $8, CASE WHEN $8 = 'cancelled' THEN $9::timestamptz ELSE NULL END)`,
    [ownerId, petId, serviceId, providerId, startsAt, modality, visitAddress ?? null, status, NOW],
  );
}

const getAppointments = (headers) => app.request('/api/provider/appointments', { headers });

test('US-024 / IF-013: providers see their appointments, home address and cancelled state without owner contact data', { skip }, async () => {
  const firstProvider = await signUpProvider('Dra. Primero');
  const secondProvider = await signUpProvider('Dr. Segundo');
  const emptyProvider = await signUpProvider('Dr. Sin citas');
  const firstOwner = await signUpOwner('Ana Dueña');
  const secondOwner = await signUpOwner('Luis Dueño');
  const firstService = await addService(firstProvider.id);
  const secondService = await addService(secondProvider.id);

  await addAppointment({
    providerId: firstProvider.id, ownerId: firstOwner.owner_id, petId: firstOwner.pet_id,
    serviceId: firstService, startsAt: '2026-10-13T15:00:00Z', modality: 'clinic',
  });
  await addAppointment({
    providerId: firstProvider.id, ownerId: secondOwner.owner_id, petId: secondOwner.pet_id,
    serviceId: firstService, startsAt: '2026-10-11T15:00:00Z', modality: 'home',
    visitAddress: 'Carrera 7 # 10-20', status: 'cancelled',
  });
  await addAppointment({
    providerId: secondProvider.id, ownerId: firstOwner.owner_id, petId: firstOwner.pet_id,
    serviceId: secondService, startsAt: '2026-10-14T15:00:00Z', modality: 'clinic',
  });

  const response = await getAppointments(firstProvider.headers);
  assert.equal(response.status, 200);
  const { appointments } = await response.json();
  assert.equal(appointments.length, 2, 'another provider appointment is not returned');
  assert.deepEqual(Object.keys(appointments[0]).sort(), [
    'endsAt', 'id', 'modality', 'ownerName', 'pet', 'service', 'startsAt', 'status', 'upcoming',
  ]);
  assert.deepEqual(appointments.map((appointment) => [appointment.ownerName, appointment.pet.name, appointment.service.name]), [
    ['Ana Dueña', "Ana Dueña's pet", 'Consulta general'],
    ['Luis Dueño', "Luis Dueño's pet", 'Consulta general'],
  ]);
  assert.equal(appointments[0].startsAt, '2026-10-13T10:00:00-05:00');
  assert.equal(appointments[0].endsAt, '2026-10-13T11:00:00-05:00');
  assert.equal(appointments[0].upcoming, true);
  assert.equal(appointments[0].modality, 'clinic');
  assert.equal('visitAddress' in appointments[0], false);
  assert.equal(appointments[1].upcoming, false);
  assert.equal(appointments[1].modality, 'home');
  assert.equal(appointments[1].visitAddress, 'Carrera 7 # 10-20');
  assert.equal(appointments[1].status, 'cancelled');
  assert.ok(appointments.every((appointment) => !('ownerEmail' in appointment) && !('ownerPhone' in appointment)));
  assert.ok(appointments.every((appointment) => !JSON.stringify(appointment).includes('@example.test')));

  assert.equal((await app.request('/api/provider/appointments')).status, 401);
  const ownerResponse = await getAppointments(firstOwner.headers);
  assert.equal(ownerResponse.status, 404);
  assert.deepEqual(await ownerResponse.json(), { code: 'NOT_FOUND' });
  assert.deepEqual(await (await getAppointments(emptyProvider.headers)).json(), { appointments: [] });
});
