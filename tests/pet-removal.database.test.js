import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { removeOwnPet } from '../src/modules/pets/owner-pet.js';

const databaseUrl = process.env.TEST_DATABASE_URL;
const skip = databaseUrl ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_pet_remove_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
let pool;

before(async () => {
  if (skip) return;
  const admin = new pg.Client({ connectionString: databaseUrl });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await admin.query(`CREATE TABLE pet (id uuid PRIMARY KEY, owner_id uuid NOT NULL, name text NOT NULL, species text NOT NULL, breed text NOT NULL, age_years smallint NOT NULL, weight_kg numeric, height_cm smallint, removed_at timestamptz, created_at timestamptz DEFAULT now())`);
  await admin.query(`CREATE TABLE appointment (id uuid PRIMARY KEY, owner_id uuid NOT NULL, pet_id uuid NOT NULL, starts_at timestamptz NOT NULL, status text NOT NULL, cancelled_at timestamptz)`);
  pool = new pg.Pool({ connectionString: databaseUrl, options: `-c search_path=${schema}` });
  await admin.end();
});

after(async () => {
  if (skip) return;
  await pool.end();
  const admin = new pg.Client({ connectionString: databaseUrl });
  await admin.connect();
  await admin.query(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

test('removing a pet cancels its future appointments without deleting their history', { skip }, async () => {
  const ownerId = randomUUID();
  const petId = randomUUID();
  const appointmentId = randomUUID();
  const now = new Date('2026-11-09T12:00:00Z');
  await pool.query('INSERT INTO pet (id, owner_id, name, species, breed, age_years) VALUES ($1, $2, $3, $4, $5, $6)', [petId, ownerId, 'Rex', 'dog', 'Criollo', 3]);
  await pool.query('INSERT INTO appointment (id, owner_id, pet_id, starts_at, status) VALUES ($1, $2, $3, $4, $5)', [appointmentId, ownerId, petId, new Date('2026-11-10T12:00:00Z'), 'scheduled']);

  const result = await removeOwnPet(pool, { ownerId, petId, now });
  assert.deepEqual(result, { removed: true, cancelledAppointments: 1 });

  const appointment = await pool.query('SELECT status, cancelled_at FROM appointment WHERE id = $1', [appointmentId]);
  assert.equal(appointment.rows[0].status, 'cancelled');
  assert.equal(new Date(appointment.rows[0].cancelled_at).toISOString(), now.toISOString());
});
