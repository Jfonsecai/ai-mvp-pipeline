// P07.1 shared test harness (not a test file).
//
// Boots the REAL composed application (every registered module of src/modules/index.js), a real
// PostgreSQL schema created from migrations/, and a controllable clock. Nothing in the business
// path is mocked: sign-up really hashes with Argon2id and bookings really hit the database.
//
// The database is taken from TEST_DATABASE_URL (a throwaway database, see .env.example). Every
// harness works in its own schema and drops it afterwards, so test files are independent.
// Without TEST_DATABASE_URL the suites are reported as skipped, which is NOT_EXECUTED, not passed.
import { randomUUID } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { createApp } from '../../../../src/application.js';
import { migrate } from '../../../../src/db/migrator.js';
import { loadConfig } from '../../../../src/shared/config.js';
import { createLogger } from '../../../../src/shared/logger.js';
import { modules } from '../../../../src/modules/index.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..', '..');
export const APP_ORIGIN = 'https://vetcare.test';
export const DATABASE_URL = process.env.TEST_DATABASE_URL;
export const SKIP = DATABASE_URL ? false : 'TEST_DATABASE_URL is not set (database-backed suite NOT_EXECUTED)';

/** 2026-10-12 is a Monday; 15:00Z is 10:00 in Bogota (UTC-5, no daylight saving). */
export const DEFAULT_NOW = '2026-10-12T15:00:00Z';
export const PASSWORD = 'correct-horse-battery';

export function mutableClock(iso) {
  let current = new Date(iso);
  return { now: () => current, set: (value) => { current = new Date(value); } };
}

let counter = 0;
export const uniqueEmail = (label = 'user') => `${label}-${randomUUID().slice(0, 8)}-${++counter}@example.test`;

export const ownerBody = (overrides = {}) => ({
  name: 'Ana Dueña',
  email: uniqueEmail('owner'),
  password: PASSWORD,
  pet: { name: 'Firulais', species: 'dog', breed: 'Criollo', ageYears: 4 },
  ...overrides,
});

export const providerBody = (providerType = 'clinic', overrides = {}) => ({
  name: providerType === 'clinic' ? 'Clínica Central' : 'Dr. Independiente',
  email: uniqueEmail('provider'),
  password: PASSWORD,
  providerType,
  ...(providerType === 'clinic' ? { address: 'Calle 10 # 5-20, Cali' } : {}),
  ...overrides,
});

/** All seven days; `open` maps ISO weekday (1 = Monday) to [startHour, endHour]. */
export function weekOf(open) {
  return {
    days: [1, 2, 3, 4, 5, 6, 7].map((weekday) => (open[weekday]
      ? { weekday, works: true, startHour: open[weekday][0], endHour: open[weekday][1] }
      : { weekday, works: false })),
  };
}

export const OFFICE_HOURS = { 1: [8, 17], 2: [8, 17], 3: [8, 17], 4: [8, 17], 5: [8, 17] };

/**
 * @param {{ now?: string, logger?: object, config?: object }} [options]
 */
export async function createHarness({ now = DEFAULT_NOW, logger, config } = {}) {
  const schema = `p07_${randomUUID().replaceAll('-', '').slice(0, 14)}`;
  const admin = new pg.Client({ connectionString: DATABASE_URL });
  await admin.connect();
  await admin.query(`CREATE SCHEMA ${schema}`);
  await admin.query(`SET search_path TO ${schema}`);
  await migrate(admin, join(ROOT, 'migrations'));
  const pool = new pg.Pool({ connectionString: DATABASE_URL, options: `-c search_path=${schema}`, max: 10 });

  const clock = mutableClock(now);
  const appConfig = loadConfig({ NODE_ENV: 'test', APP_ORIGIN, ...config });
  const app = createApp({
    config: appConfig,
    db: pool,
    clock,
    logger: logger ?? createLogger({ write: () => {} }),
    modules,
  });
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  /** Low-level request. `session` is an object returned by signUp*, or { cookie }, or undefined. */
  async function request(method, path, { session, body, headers = {}, raw } = {}) {
    const init = { method, headers: { ...headers } };
    if (session?.cookie) init.headers.cookie = session.cookie;
    if (method !== 'GET' && method !== 'HEAD') {
      init.headers.origin ??= APP_ORIGIN;
      if (body !== undefined || raw !== undefined) init.headers['content-type'] ??= 'application/json';
    }
    if (raw !== undefined) init.body = raw;
    else if (body !== undefined) init.body = JSON.stringify(body);
    const response = await fetch(`${baseUrl}${path}`, init);
    const text = await response.text();
    let json;
    try { json = text ? JSON.parse(text) : undefined; } catch { json = undefined; }
    return { status: response.status, headers: response.headers, text, body: json };
  }

  const cookieFrom = (response) => {
    const header = response.headers.get('set-cookie');
    return header ? header.split(';')[0] : undefined;
  };

  async function signUpOwner(overrides = {}) {
    const body = ownerBody(overrides);
    const response = await request('POST', '/api/auth/sign-up/owner', { body });
    if (response.status !== 201) throw new Error(`owner sign-up failed: ${response.status} ${response.text}`);
    const row = (await admin.query(
      `SELECT a.id, p.id AS pet_id FROM account a JOIN pet p ON p.owner_id = a.id
        WHERE a.email = $1 AND a.account_type = 'owner'`,
      [body.email.trim().toLowerCase()],
    )).rows[0];
    return {
      kind: 'owner', id: row.id, petId: row.pet_id, email: body.email, password: body.password,
      body, cookie: cookieFrom(response), response,
    };
  }

  async function signUpProvider(providerType = 'clinic', overrides = {}) {
    const body = providerBody(providerType, overrides);
    const response = await request('POST', '/api/auth/sign-up/provider', { body });
    if (response.status !== 201) throw new Error(`provider sign-up failed: ${response.status} ${response.text}`);
    const row = (await admin.query(
      `SELECT id FROM account WHERE email = $1 AND account_type = 'provider'`,
      [body.email.trim().toLowerCase()],
    )).rows[0];
    return {
      kind: 'provider', id: row.id, email: body.email, password: body.password,
      body, cookie: cookieFrom(response), response,
    };
  }

  async function signIn(email, password, accountType) {
    const response = await request('POST', '/api/auth/sign-in', { body: { email, password, accountType } });
    return { response, cookie: cookieFrom(response) };
  }

  /** Provider with the given weekly hours (default Monday-Friday 08-17; pass hours: null for none). */
  async function setupProvider(providerType, { hours = weekOf(OFFICE_HOURS), ...overrides } = {}) {
    const provider = await signUpProvider(providerType, overrides);
    if (hours) {
      const saved = await request('PUT', '/api/provider/working-hours', { session: provider, body: hours });
      if (saved.status !== 200) throw new Error(`working hours failed: ${saved.status} ${saved.text}`);
    }
    return provider;
  }

  async function publishService(provider, overrides = {}) {
    const body = {
      name: 'Consulta general', priceCop: 60000, species: 'dog',
      ...(provider.body.providerType === 'clinic' ? { modality: 'clinic' } : {}),
      ...overrides,
    };
    const response = await request('POST', '/api/provider/services', { session: provider, body });
    if (response.status !== 201) throw new Error(`publish service failed: ${response.status} ${response.text}`);
    return response.body;
  }

  async function publishProduct(provider, overrides = {}) {
    const body = { name: 'Alimento premium', priceCop: 90000, species: 'dog', ...overrides };
    const response = await request('POST', '/api/provider/products', { session: provider, body });
    if (response.status !== 201) throw new Error(`publish product failed: ${response.status} ${response.text}`);
    return response.body;
  }

  /** Inserts an extra pet directly: pet management (US-004) is outside the implemented scope. */
  async function addPetDirectly(ownerId, { name = 'Michi', species = 'cat', breed = 'Siamés', ageYears = 2 } = {}) {
    return (await admin.query(
      'INSERT INTO pet (owner_id, name, species, breed, age_years) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [ownerId, name, species, breed, ageYears],
    )).rows[0].id;
  }

  const book = (owner, body) => request('POST', '/api/owner/appointments', { session: owner, body });
  const context = (owner, serviceId, week) => request(
    'GET',
    `/api/services/${serviceId}/booking-context${week ? `?weekStart=${week}` : ''}`,
    { session: owner },
  );
  const allSlots = (ctx) => ctx.body.days.flatMap((day) => day.slots);

  async function close() {
    await new Promise((resolve) => server.close(resolve));
    await pool.end();
    await admin.query('SET search_path TO public');
    await admin.query(`DROP SCHEMA ${schema} CASCADE`);
    await admin.end();
  }

  return {
    schema, admin, pool, clock, config: appConfig, request, cookieFrom, signUpOwner, signUpProvider, signIn,
    setupProvider, publishService, publishProduct, addPetDirectly, book, context, allSlots, close, baseUrl,
  };
}
