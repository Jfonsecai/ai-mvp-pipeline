import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import argon2 from 'argon2';
import pg from 'pg';
import { migrate } from '../../src/db/migrator.js';
import { stateFile } from './state.js';

const databaseUrl = process.env.TEST_DATABASE_URL;
const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

function bogotaDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function nextCalendarDate(date) {
  const tomorrow = new Date(`${date}T12:00:00Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

export default async function globalSetup() {
  if (!databaseUrl) throw new Error('TEST_DATABASE_URL is required for browser E2E tests.');

  const schema = process.env.VETCARE_E2E_SCHEMA;
  if (!schema || !/^vetcare_e2e_[a-f0-9]{12}$/.test(schema)) {
    throw new Error('Playwright did not provide an isolated E2E schema name.');
  }
  const admin = new pg.Client({ connectionString: databaseUrl });
  await admin.connect();
  try {
    await admin.query(`CREATE SCHEMA ${schema}`);
    const database = new pg.Client({ connectionString: databaseUrl, options: `-c search_path=${schema}` });
    try {
      await database.connect();
      await migrate(database, join(root, 'migrations'));

      const email = `owner-${randomUUID()}@example.test`;
      const password = 'vetcare-e2e-owner-password';
      const owner = await database.query(
        `INSERT INTO account (account_type, name, email, password_hash)
         VALUES ('owner', 'Dueña E2E', $1, $2) RETURNING id`,
        [email, await argon2.hash(password, { type: argon2.argon2id })],
      );
      const pet = await database.query(
        `INSERT INTO pet (owner_id, name, species, breed, age_years)
         VALUES ($1, 'Nala E2E', 'dog', 'Criolla', 3) RETURNING id`,
        [owner.rows[0].id],
      );
      const otherOwner = await database.query(
        `INSERT INTO account (account_type, name, email, password_hash)
         VALUES ('owner', 'Otro dueño E2E', $1, 'unused') RETURNING id`,
        [`other-${randomUUID()}@example.test`],
      );
      const otherPet = await database.query(
        `INSERT INTO pet (owner_id, name, species, breed, age_years)
         VALUES ($1, 'Luna E2E', 'cat', 'Criolla', 2) RETURNING id`,
        [otherOwner.rows[0].id],
      );
      const provider = await database.query(
        `INSERT INTO account (account_type, name, email, password_hash)
         VALUES ('provider', 'Veterinaria E2E', $1, 'unused') RETURNING id`,
        [`provider-${randomUUID()}@example.test`],
      );
      const providerId = provider.rows[0].id;
      await database.query(
        `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email)
         VALUES ($1, 'independent', 'Veterinaria E2E', $2)`,
        [providerId, `contact-${randomUUID()}@example.test`],
      );
      const service = await database.query(
        `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
         VALUES ($1, 'independent', 'service', 'Consulta E2E', 50000, 'dog', 'home') RETURNING id`,
        [providerId],
      );

      const date = nextCalendarDate(bogotaDate());
      const weekday = new Date(`${date}T12:00:00Z`).getUTCDay() || 7;
      await database.query(
        'INSERT INTO working_hours (provider_id, weekday, start_hour, end_hour) VALUES ($1, $2, 9, 13)',
        [providerId, weekday],
      );
      const movingStartsAt = `${date}T10:00:00-05:00`;
      const occupiedStartsAt = `${date}T11:00:00-05:00`;
      const targetStartsAt = `${date}T12:00:00-05:00`;
      const availableStartsAt = `${date}T09:00:00-05:00`;
      const insertAppointment = async (ownerId, petId, startsAt) => {
        const result = await database.query(
          `INSERT INTO appointment
             (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, visit_address)
           VALUES ($1, $2, $3, $4, 'independent', $5, 'home', 'Carrera 7 # 10-20')
           RETURNING id`,
          [ownerId, petId, service.rows[0].id, providerId, startsAt],
        );
        return result.rows[0].id;
      };
      const movingAppointmentId = await insertAppointment(owner.rows[0].id, pet.rows[0].id, movingStartsAt);
      const occupiedAppointmentId = await insertAppointment(otherOwner.rows[0].id, otherPet.rows[0].id, occupiedStartsAt);

      const state = {
        schema,
        email,
        password,
        movingAppointmentId,
        occupiedAppointmentId,
        movingStartsAt,
        occupiedStartsAt,
        targetStartsAt,
        availableStartsAt,
      };
      await mkdir(dirname(stateFile), { recursive: true });
      await writeFile(stateFile, JSON.stringify(state), { mode: 0o600 });
    } finally {
      await database.end();
    }
  } catch (error) {
    await admin.query('DROP SCHEMA IF EXISTS ' + schema + ' CASCADE');
    throw error;
  } finally {
    await admin.end();
  }
}
