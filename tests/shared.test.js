import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../src/shared/config.js';
import { parseFeatures } from '../src/shared/features.js';
import { OUTCOME_CODES, OUTCOME_HTTP_STATUS, Outcome } from '../src/shared/outcomes.js';
import { bogotaParts, toBogotaIso, createClock } from '../src/shared/clock.js';
import { isValidPriceCop } from '../src/shared/money.js';
import { createLogger } from '../src/shared/logger.js';

test('config: defaults, origin normalization and frozen result', () => {
  const config = loadConfig({ APP_ORIGIN: 'https://vetcare.example/some/path?x=1' });
  assert.equal(config.appOrigin, 'https://vetcare.example');
  assert.equal(config.sessionIdleMinutes, 60);
  assert.equal(config.sessionAbsoluteHours, 12);
  assert.deepEqual(config.features, []);
  assert.equal(config.databaseUrl, undefined);
  assert.equal(config.isProduction, false);
  assert.ok(Object.isFrozen(config));
});

test('config: rejects missing or invalid values (fail fast)', () => {
  assert.throws(() => loadConfig({}), /APP_ORIGIN is required/);
  assert.throws(() => loadConfig({ APP_ORIGIN: 'not a url' }), /APP_ORIGIN must be an absolute URL/);
  assert.throws(() => loadConfig({ APP_ORIGIN: 'ftp://x.test' }), /http or https/);
  assert.throws(() => loadConfig({ APP_ORIGIN: 'https://x.test', NODE_ENV: 'staging' }), /NODE_ENV/);
  assert.throws(() => loadConfig({ APP_ORIGIN: 'https://x.test', SESSION_IDLE_MINUTES: '0' }), /SESSION_IDLE_MINUTES/);
  assert.throws(() => loadConfig({ APP_ORIGIN: 'https://x.test', SESSION_ABSOLUTE_HOURS: 'abc' }), /SESSION_ABSOLUTE_HOURS/);
});

test('config: error messages never echo the connection string', () => {
  const secret = 'postgresql://user:SuperSecret@host/db';
  const config = loadConfig({ APP_ORIGIN: 'https://x.test', DATABASE_URL: secret });
  assert.equal(config.databaseUrl, secret); // kept for the database handle only
  assert.throws(() => loadConfig({ APP_ORIGIN: 'bad', DATABASE_URL: secret }), (error) => !error.message.includes('SuperSecret'));
});

test('features: parses a comma list, trims, deduplicates and rejects unknown names', () => {
  assert.deepEqual(parseFeatures(undefined), []);
  assert.deepEqual(parseFeatures(''), []);
  assert.deepEqual(parseFeatures(' stock , orders,stock '), ['stock', 'orders']);
  assert.throws(() => parseFeatures('stock,oders'), /unknown switch.*oders/);
});

test('outcomes: closed list with the HTTP statuses of API_SPEC', () => {
  assert.equal(OUTCOME_CODES.length, 13);
  assert.equal(new Outcome('NOT_FOUND').status, 404);
  assert.equal(new Outcome('SESSION_EXPIRED').status, 401);
  assert.throws(() => new Outcome('MADE_UP'), TypeError);
  assert.deepEqual(new Outcome('NOT_FOUND', { fields: [{ field: 'x', reason: 'REQUIRED' }] }).toBody(), { code: 'NOT_FOUND' });
  assert.deepEqual(
    new Outcome('VALIDATION_FAILED', { fields: [{ field: 'password', reason: 'TOO_SHORT' }] }).toBody(),
    { code: 'VALIDATION_FAILED', fields: [{ field: 'password', reason: 'TOO_SHORT' }] },
  );
  for (const code of OUTCOME_CODES) assert.ok(OUTCOME_HTTP_STATUS[code] >= 400);
});

test('clock: Bogota calendar parts and ISO output (UTC-5, no DST)', () => {
  // 2026-10-12 is a Monday. 13:00Z is 08:00 in Bogota.
  const parts = bogotaParts(new Date('2026-10-12T13:00:00Z'));
  assert.deepEqual(parts, { date: '2026-10-12', hour: 8, minute: 0, weekday: 1 });
  // 03:30Z on Monday is still Sunday evening in Bogota (22:30).
  assert.deepEqual(bogotaParts(new Date('2026-10-12T03:30:00Z')), { date: '2026-10-11', hour: 22, minute: 30, weekday: 7 });
  assert.equal(toBogotaIso(new Date('2026-10-12T13:00:00Z')), '2026-10-12T08:00:00-05:00');
  // The result must not depend on the process time zone: the same instant, two calls.
  assert.equal(toBogotaIso(new Date('2026-01-01T04:59:59Z')), '2025-12-31T23:59:59-05:00');
});

test('clock: injectable', () => {
  const clock = createClock(() => new Date('2026-10-12T13:00:00Z'));
  assert.equal(clock.now().toISOString(), '2026-10-12T13:00:00.000Z');
});

test('money: whole pesos greater than 0 that fit the integer column', () => {
  for (const ok of [1, 52_000, 2_147_483_647]) assert.equal(isValidPriceCop(ok), true);
  for (const bad of [0, -1, 1.5, 2_147_483_648, NaN, '100', null]) assert.equal(isValidPriceCop(bad), false);
});

test('logger: drops sensitive field names and writes one JSON line', () => {
  const lines = [];
  const logger = createLogger({ write: (line) => lines.push(line) });
  logger.info('request', { status: 200, password: 'x', Email: 'a@b.co', sessionToken: 't', databaseUrl: 'u', path: '/api/x' });
  assert.equal(lines.length, 1);
  const entry = JSON.parse(lines[0]);
  assert.equal(entry.event, 'request');
  assert.equal(entry.status, 200);
  assert.equal(entry.path, '/api/x');
  for (const key of ['password', 'Email', 'sessionToken', 'databaseUrl']) assert.equal(key in entry, false);
});

test('logger: level filtering', () => {
  const lines = [];
  const logger = createLogger({ write: (line) => lines.push(line), level: 'error' });
  logger.info('ignored');
  logger.error('kept');
  assert.equal(lines.length, 1);
});
