import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { createApp } from '../src/app.js';
import { migrate } from '../src/db/migrator.js';
import { createProviderWorkingHoursRouter } from '../src/modules/provider/working-hours.js';
import { hashSessionToken } from '../src/modules/identity/sessions.js';
import { fixedClock, startApp, testConfig } from './helpers.js';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_hours_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-12T12:00:00Z');
let admin;
let pool;
let app;
let ownerId;
let providerId;
let otherProviderId;
const appointmentIds = {};

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url, options: `-c search_path=${schema}` });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });

  const owner = await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash)
     VALUES ('owner', 'Hours Test Owner', $1, 'test-hash') RETURNING id`,
    [`owner-${randomUUID()}@example.test`],
  );
  ownerId = owner.rows[0].id;
  const provider = await createProvider('Hours Test Clinic');
  providerId = provider.id;
  const otherProvider = await createProvider('Other Test Clinic');
  otherProviderId = otherProvider.id;
  const pet = await admin.query(
    `INSERT INTO pet (owner_id, name, species, breed, age_years)
     VALUES ($1, 'Nala', 'dog', 'Mixed', 2) RETURNING id`,
    [ownerId],
  );
  const service = await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
     VALUES ($1, 'clinic', 'service', 'Consultation', 50000, 'dog', 'clinic') RETURNING id`,
    [providerId],
  );
  const otherService = await admin.query(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
     VALUES ($1, 'clinic', 'service', 'Other consultation', 50000, 'dog', 'clinic') RETURNING id`,
    [otherProviderId],
  );

  for (const { key, startsAt, provider = providerId, offeringId = service.rows[0].id, status = 'scheduled' } of [
    { key: 'withinMonday', startsAt: '2026-10-12T14:00:00Z' },
    { key: 'outsideMonday', startsAt: '2026-10-12T18:00:00Z' },
    { key: 'withinTuesday', startsAt: '2026-10-13T15:00:00Z' },
    { key: 'outsideTuesday', startsAt: '2026-10-13T22:00:00Z' },
    { key: 'past', startsAt: '2026-10-12T11:00:00Z' },
    { key: 'otherProvider', startsAt: '2026-10-12T23:00:00Z', provider: otherProviderId, offeringId: otherService.rows[0].id },
    { key: 'alreadyCancelled', startsAt: '2026-10-12T23:00:00Z', status: 'cancelled' },
  ]) {
    const appointment = await admin.query(
      `INSERT INTO appointment
         (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, status, cancelled_at)
       VALUES ($1, $2, $3, $4, 'clinic', $5, 'clinic', $6, $7)
       RETURNING id`,
      [ownerId, pet.rows[0].id, offeringId, provider, startsAt, status, status === 'cancelled' ? new Date('2026-10-10T12:00:00Z') : null],
    );
    appointmentIds[key] = appointment.rows[0].id;
  }

  const token = 'working-hours-database-test';
  await admin.query(
    `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at)
     VALUES ($1, $2, $3, $3, $4)`,
    [hashSessionToken(token), providerId, new Date('2026-10-12T11:55:00Z'), new Date('2026-10-12T20:00:00Z')],
  );

  app = await startApp(createApp({
    config: testConfig(),
    db: pool,
    clock: fixedClock(NOW),
    modules: [{ createRouter: createProviderWorkingHoursRouter }],
  }));
});

async function createProvider(name) {
  const account = await admin.query(
    `INSERT INTO account (account_type, name, email, password_hash)
     VALUES ('provider', $1, $2, 'test-hash') RETURNING id`,
    [name, `provider-${randomUUID()}@example.test`],
  );
  const id = account.rows[0].id;
  await admin.query(
    `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email, address)
     VALUES ($1, 'clinic', $2, $3, 'Calle 1')`,
    [id, name, `contact-${randomUUID()}@example.test`],
  );
  return { id };
}

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await admin.query('SET search_path TO public');
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

test('working hours persist and cancel only upcoming appointments outside the new Bogotá schedule', { skip }, async () => {
  const headers = {
    cookie: 'vetcare_session=working-hours-database-test',
    origin: 'https://vetcare.test',
    'content-type': 'application/json',
  };
  const initial = await app.request('/api/provider/working-hours', { headers });
  assert.equal(initial.status, 200);
  assert.equal((await initial.json()).days.every((day) => !day.works), true);

  const days = Array.from({ length: 7 }, (_, index) => ({ weekday: index + 1, works: false }));
  days[0] = { weekday: 1, works: true, startHour: 8, endHour: 12 };
  days[1] = { weekday: 2, works: true, startHour: 9, endHour: 17 };
  const saved = await app.request('/api/provider/working-hours', {
    method: 'PUT',
    headers,
    body: JSON.stringify({ days }),
  });
  assert.equal(saved.status, 200);
  assert.deepEqual((await saved.json()).days, days);

  const rows = await admin.query(
    `SELECT weekday, start_hour, end_hour
       FROM working_hours
      WHERE provider_id = $1
      ORDER BY weekday`,
    [providerId],
  );
  assert.deepEqual(rows.rows.map(({ weekday, start_hour, end_hour }) => [weekday, start_hour, end_hour]), [
    [1, 8, 12],
    [2, 9, 17],
  ]);

  const appointments = await admin.query(
    `SELECT id, status, cancelled_at
       FROM appointment
      WHERE id = ANY($1::uuid[])`,
    [Object.values(appointmentIds)],
  );
  const byId = new Map(appointments.rows.map((row) => [row.id, row]));
  for (const key of ['withinMonday', 'withinTuesday', 'past', 'otherProvider']) {
    assert.equal(byId.get(appointmentIds[key]).status, 'scheduled', key);
  }
  for (const key of ['outsideMonday', 'outsideTuesday']) {
    assert.equal(byId.get(appointmentIds[key]).status, 'cancelled', key);
    assert.equal(new Date(byId.get(appointmentIds[key]).cancelled_at).toISOString(), NOW.toISOString(), key);
  }
  assert.equal(byId.get(appointmentIds.alreadyCancelled).status, 'cancelled');
  assert.equal(new Date(byId.get(appointmentIds.alreadyCancelled).cancelled_at).toISOString(), '2026-10-10T12:00:00.000Z');
});
