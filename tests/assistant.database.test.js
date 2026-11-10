// US-036 to US-040 (IF-042) against PostgreSQL: POST /api/assistant/messages answers from live data,
// only for owners, with the owner's own upcoming appointments only (BR-048), and writes nothing (BR-045).
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import pg from 'pg';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createApp } from '../src/application.js';
import { migrate } from '../src/db/migrator.js';
import { createAssistantRouter } from '../src/modules/assistant/assistant.js';
import { hashSessionToken } from '../src/modules/identity/sessions.js';
import { APP_ORIGIN, fixedClock, startApp, testConfig } from './helpers.js';

const url = process.env.TEST_DATABASE_URL;
const skip = url ? false : 'TEST_DATABASE_URL is not set (database test NOT_RUN)';
const schema = `vetcare_ast_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const NOW = new Date('2026-10-12T03:00:00Z'); // Sunday 2026-10-11 22:00 in Bogotá
let admin;
let pool;
let app;
const ids = {};

const q = (sql, params) => admin.query(sql, params);

async function account(type, name) {
  const { rows } = await q(
    `INSERT INTO account (account_type, name, email, password_hash) VALUES ($1, $2, $3, 'h') RETURNING id`,
    [type, name, `${type}-${randomUUID()}@example.test`],
  );
  return rows[0].id;
}

async function provider(type, name, address, phone) {
  const id = await account('provider', name);
  await q(
    `INSERT INTO provider_profile (provider_id, provider_type, public_name, contact_email, address, contact_phone)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [id, type, name, `${name.length}@example.test`, address, phone],
  );
  return id;
}

async function session(accountId, token) {
  await q(
    `INSERT INTO session (token_hash, account_id, created_at, last_seen_at, absolute_expires_at) VALUES ($1, $2, $3, $3, $4)`,
    [hashSessionToken(token), accountId, new Date('2026-10-12T02:55:00Z'), new Date('2026-10-12T08:00:00Z')],
  );
}

async function service(providerId, type, name, price, species, modality) {
  const { rows } = await q(
    `INSERT INTO offering (provider_id, provider_type, kind, name, price_cop, species, modality)
     VALUES ($1, $2, 'service', $3, $4, $5, $6) RETURNING id`,
    [providerId, type, name, price, species, modality],
  );
  return rows[0].id;
}

async function appointment(ownerId, petId, serviceId, providerId, startsAt, status = 'scheduled') {
  await q(
    `INSERT INTO appointment (owner_id, pet_id, service_id, provider_id, provider_capacity, starts_at, modality, status, cancelled_at)
     VALUES ($1, $2, $3, $4, 'clinic', $5, 'clinic', $6, CASE WHEN $6 = 'cancelled' THEN $7::timestamptz ELSE NULL END)`,
    [ownerId, petId, serviceId, providerId, startsAt, status, NOW],
  );
}

before(async () => {
  if (skip) return;
  admin = new pg.Client({ connectionString: url });
  await admin.connect();
  await q(`CREATE SCHEMA ${schema}`);
  await q(`SET search_path TO ${schema}`);
  await migrate(admin, migrationsDir);
  pool = new pg.Pool({ connectionString: url, options: `-c search_path=${schema}`, max: 3 });

  ids.owner = await account('owner', 'Luis');
  ids.other = await account('owner', 'Otra');
  ids.pet = (await q(`INSERT INTO pet (owner_id, name, species, breed, age_years) VALUES ($1, 'Toby', 'dog', 'Criollo', 3) RETURNING id`, [ids.owner])).rows[0].id;
  ids.otherPet = (await q(`INSERT INTO pet (owner_id, name, species, breed, age_years) VALUES ($1, 'Mia', 'dog', 'Criollo', 1) RETURNING id`, [ids.other])).rows[0].id;
  ids.clinic = await provider('clinic', 'Clínica Patitas', 'Calle 1 # 2-3', '300 111 2222');
  ids.inClinicOnly = await provider('clinic', 'Clínica Centro', 'Carrera 7', null);
  ids.independent = await provider('independent', 'Dr. Huesos', null, null);
  await q(`INSERT INTO working_hours (provider_id, weekday, start_hour, end_hour) VALUES ($1, 1, 8, 12), ($1, 2, 14, 18)`, [ids.clinic]);
  ids.vaccine = await service(ids.clinic, 'clinic', 'Vacunación', 50000, 'dog', 'both');
  await service(ids.inClinicOnly, 'clinic', 'Consulta general', 45000, 'dog', 'clinic');
  await service(ids.independent, 'independent', 'Consulta a domicilio', 70000, 'cat', 'home');
  for (let i = 0; i < 6; i += 1) await service(ids.inClinicOnly, 'clinic', `Baño ${i + 1}`, 30000 + i * 1000, 'cat', 'clinic');
  await appointment(ids.owner, ids.pet, ids.vaccine, ids.clinic, new Date('2026-10-13T14:00:00Z')); // Tue 09:00
  await appointment(ids.owner, ids.pet, ids.vaccine, ids.clinic, new Date('2026-10-12T19:00:00Z'), 'cancelled');
  await appointment(ids.owner, ids.pet, ids.vaccine, ids.clinic, new Date('2026-10-05T14:00:00Z')); // past
  await appointment(ids.other, ids.otherPet, ids.vaccine, ids.clinic, new Date('2026-10-12T13:00:00Z'));
  await session(ids.owner, 'ast-owner');
  await session(ids.clinic, 'ast-provider');
  app = await startApp(createApp({ config: testConfig(), db: pool, clock: fixedClock(NOW), modules: [{ createRouter: createAssistantRouter }] }));
});

after(async () => {
  if (skip) return;
  await app.close();
  await pool.end();
  await q('SET search_path TO public');
  await q(`DROP SCHEMA ${schema} CASCADE`);
  await admin.end();
});

async function ask(text, token = 'ast-owner') {
  const response = await app.request('/api/assistant/messages', {
    method: 'POST',
    headers: { cookie: `vetcare_session=${token}`, origin: APP_ORIGIN, 'content-type': 'application/json' },
    body: JSON.stringify({ text }),
  });
  return { status: response.status, body: await response.json() };
}

test('AC-130 / AC-131 / AC-160: providers, clinics, home visits (clinic with a "both" service included)', { skip }, async () => {
  const all = await ask('¿Qué veterinarias hay?');
  assert.equal(all.status, 200);
  assert.equal(all.body.text, 'Hay 3 veterinarias y veterinarios en VetCare. Te muestro 3:');
  assert.deepEqual(all.body.items.map((i) => i.label), ['Clínica Centro — Clínica', 'Clínica Patitas — Clínica', 'Dr. Huesos — Veterinario independiente']);
  assert.equal((await ask('¿Qué clínicas hay?')).body.total, 2);
  const home = await ask('¿Qué veterinarios a domicilio hay?');
  assert.deepEqual(home.body.items.map((i) => i.label), ['Clínica Patitas — Clínica', 'Dr. Huesos — Veterinario independiente']);
});

test('AC-132 / AC-133 / EDGE-045: hours, contact, provider without hours', { skip }, async () => {
  const hours = await ask('¿Cuál es el horario de Clínica Patitas?');
  assert.equal(hours.body.text, 'Clínica Patitas atiende: lunes de 8:00 a. m. a 12:00 p. m.; martes de 2:00 p. m. a 6:00 p. m.');
  assert.deepEqual(hours.body.items[0].target, { screen: 'provider_profile', providerId: ids.clinic });
  assert.equal((await ask('¿Dónde queda Dr. Huesos?')).body.text, 'Dr. Huesos: correo 10@example.test.');
  assert.equal((await ask('horario de Dr. Huesos')).body.text, 'Dr. Huesos aún no ha definido su horario de atención.');
  assert.equal((await ask('¿Dónde queda la clínica Luna?')).body.text, 'No encontré esa veterinaria.');
});

test('AC-136 / AC-137 / AC-139: offerings with species filter, more than 5 → search link', { skip }, async () => {
  const vaccine = await ask('¿Quién ofrece vacunación para perros?');
  assert.equal(vaccine.body.text, 'Encontré 1 resultado para «vacunación» para perros. Te muestro 1:');
  assert.equal(vaccine.body.items[0].label, 'Vacunación — Perro — $ 50.000 — Clínica Patitas');
  const baths = await ask('¿Qué servicios de baño hay para gatos?');
  assert.equal(baths.body.total, 6);
  assert.equal(baths.body.items.length, 5);
  assert.deepEqual(baths.body.searchLink, { q: 'baño', species: 'cat' });
  assert.equal((await ask('¿Cuánto cuesta una peluquería?')).body.text, 'No encontré servicios ni productos para «peluquería».');
});

test('AC-141 / AC-143 / AC-144: only the owner\'s upcoming scheduled appointments', { skip }, async () => {
  const mine = await ask('¿Cuándo es mi próxima cita?');
  assert.equal(mine.body.text, 'Tu próxima cita es el martes 13 de octubre a las 9:00 a. m.: Vacunación con Clínica Patitas para Toby.');
  assert.equal(mine.body.total, 1);
});

test('AC-129 / AC-145 / AC-146: action, help, fallback; nothing is written (BR-045)', { skip }, async () => {
  const before = (await q('SELECT count(*)::int AS n FROM appointment')).rows[0].n;
  assert.equal((await ask('cancela mi cita')).body.linkTo, 'owner_appointments');
  assert.equal((await ask('ayuda')).body.intent, 'help');
  assert.equal((await ask('mi perro vomita')).body.intent, 'fallback');
  assert.equal((await q('SELECT count(*)::int AS n FROM appointment')).rows[0].n, before);
});

test('AC-128 / BR-041: providers cannot use the assistant; validation errors', { skip }, async () => {
  assert.equal((await ask('ayuda', 'ast-provider')).status, 404);
  const empty = await ask('   ');
  assert.equal(empty.status, 422);
  assert.deepEqual(empty.body, { code: 'VALIDATION_FAILED', fields: [{ field: 'text', reason: 'REQUIRED' }] });
});
