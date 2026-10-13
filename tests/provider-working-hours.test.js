import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/application.js';
import { createProviderWorkingHoursRouter, validateWeeklyHours } from '../src/modules/provider/working-hours.js';
import { fixedClock, fakeSessionDb, startApp, testConfig } from './helpers.js';

const PROVIDER_ID = '33333333-3333-4333-8333-333333333333';
const NOW = new Date('2026-10-12T12:00:00Z');
const daysOff = Array.from({ length: 7 }, (_, index) => ({ weekday: index + 1, works: false }));
const workingWeek = {
  days: daysOff.map((day) => day.weekday === 1
    ? { weekday: 1, works: true, startHour: 8, endHour: 12 }
    : day.weekday === 2
      ? { weekday: 2, works: true, startHour: 9, endHour: 17 }
      : day),
};

function makeDb({ rows = [], providerExists = true } = {}) {
  const sessions = fakeSessionDb({
    provider: {
      account_id: PROVIDER_ID,
      account_type: 'provider',
      last_seen_at: new Date('2026-10-12T11:55:00Z'),
      absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
      ended_at: null,
    },
    owner: {
      account_id: '44444444-4444-4444-8444-444444444444',
      account_type: 'owner',
      last_seen_at: new Date('2026-10-12T11:55:00Z'),
      absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
      ended_at: null,
    },
  });
  const state = { statements: [], commits: 0, rollbacks: 0, inserts: [] };
  return {
    state,
    async query(text, params) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) {
        return sessions.query(text, params);
      }
      if (/FROM working_hours/.test(text)) return { rows };
      throw new Error(`Unexpected pool query: ${text}`);
    },
    async connect() {
      return {
        async query(text, params = []) {
          const sql = text.trim();
          state.statements.push(sql);
          if (sql === 'BEGIN') return { rows: [] };
          if (sql === 'COMMIT') { state.commits += 1; return { rows: [] }; }
          if (sql === 'ROLLBACK') { state.rollbacks += 1; return { rows: [] }; }
          if (/SELECT provider_id FROM provider_profile/.test(sql)) {
            return { rows: providerExists ? [{ provider_id: PROVIDER_ID }] : [] };
          }
          if (/DELETE FROM working_hours/.test(sql)) return { rows: [] };
          if (/INSERT INTO working_hours/.test(sql)) {
            state.inserts.push(params);
            return { rows: [] };
          }
          if (/UPDATE appointment AS a/.test(sql)) return { rowCount: 0, rows: [] };
          throw new Error(`Unexpected transaction query: ${sql}`);
        },
        release() {},
      };
    },
  };
}

const running = [];
async function openApp(db) {
  const server = await startApp(createApp({
    config: testConfig(),
    db,
    clock: fixedClock(NOW),
    modules: [{ createRouter: createProviderWorkingHoursRouter }],
  }));
  running.push(server);
  return server;
}

after(async () => Promise.all(running.map((server) => server.close())));

test('working-hours validator requires exactly one valid entry for every weekday', () => {
  assert.deepEqual(validateWeeklyHours(workingWeek), {
    value: {
      days: [
        { weekday: 1, works: true, startHour: 8, endHour: 12 },
        { weekday: 2, works: true, startHour: 9, endHour: 17 },
        ...daysOff.slice(2),
      ],
    },
  });

  const duplicate = structuredClone(workingWeek);
  duplicate.days[6].weekday = 6;
  assert.ok(validateWeeklyHours(duplicate).fields.some(({ field, reason }) => field === 'days.6.weekday' && reason === 'NOT_ALLOWED'));
  assert.ok(validateWeeklyHours({ days: daysOff.slice(0, 6) }).fields.some(({ field, reason }) => field === 'days' && reason === 'OUT_OF_RANGE'));
});

test('working-hours validator rejects non-hour values and closing times not after opening', () => {
  const fractional = structuredClone(workingWeek);
  fractional.days[0].startHour = 8.5;
  assert.ok(validateWeeklyHours(fractional).fields.some(({ field, reason }) => field === 'days.0.startHour' && reason === 'NOT_ON_THE_HOUR'));

  const offDayFraction = structuredClone(workingWeek);
  offDayFraction.days[2].startHour = 8.5;
  assert.ok(validateWeeklyHours(offDayFraction).fields.some(({ field, reason }) => field === 'days.2.startHour' && reason === 'NOT_ON_THE_HOUR'));

  const reversed = structuredClone(workingWeek);
  reversed.days[0].endHour = 8;
  assert.ok(validateWeeklyHours(reversed).fields.some(({ field, reason }) => field === 'days.0.endHour' && reason === 'END_NOT_AFTER_START'));
});

test('GET returns all seven days and provider routes enforce role authorization', async () => {
  const db = makeDb({ rows: [{ weekday: 1, start_hour: 8, end_hour: 12 }] });
  const app = await openApp(db);
  const response = await app.request('/api/provider/working-hours', { headers: { cookie: 'vetcare_session=provider' } });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.days.length, 7);
  assert.deepEqual(body.days[0], { weekday: 1, works: true, startHour: 8, endHour: 12 });
  assert.deepEqual(body.days[6], { weekday: 7, works: false });

  const owner = await app.request('/api/provider/working-hours', { headers: { cookie: 'vetcare_session=owner' } });
  assert.equal(owner.status, 404);
  assert.deepEqual(await owner.json(), { code: 'NOT_FOUND' });
});

test('PUT rejects invalid hours before writes and replaces the complete week transactionally', async () => {
  const db = makeDb();
  const app = await openApp(db);
  const invalid = structuredClone(workingWeek);
  invalid.days[0].startHour = 8.5;
  const rejected = await app.request('/api/provider/working-hours', {
    method: 'PUT',
    headers: { cookie: 'vetcare_session=provider', origin: 'https://vetcare.test', 'content-type': 'application/json' },
    body: JSON.stringify(invalid),
  });
  assert.equal(rejected.status, 422);
  assert.deepEqual((await rejected.json()).fields, [{ field: 'days.0.startHour', reason: 'NOT_ON_THE_HOUR' }]);
  assert.deepEqual(db.state.statements, []);

  const saved = await app.request('/api/provider/working-hours', {
    method: 'PUT',
    headers: { cookie: 'vetcare_session=provider', origin: 'https://vetcare.test', 'content-type': 'application/json' },
    body: JSON.stringify(workingWeek),
  });
  assert.equal(saved.status, 200);
  assert.deepEqual((await saved.json()).days, validateWeeklyHours(workingWeek).value.days);
  assert.deepEqual(db.state.inserts, [
    [PROVIDER_ID, 1, 8, 12],
    [PROVIDER_ID, 2, 9, 17],
  ]);
  assert.equal(db.state.commits, 1);
  assert.equal(db.state.rollbacks, 0);
  assert.match(db.state.statements.at(-2), /UPDATE appointment AS a/);
});

test('PUT rolls back when the provider profile does not exist', async () => {
  const db = makeDb({ providerExists: false });
  const app = await openApp(db);
  const response = await app.request('/api/provider/working-hours', {
    method: 'PUT',
    headers: { cookie: 'vetcare_session=provider', origin: 'https://vetcare.test', 'content-type': 'application/json' },
    body: JSON.stringify(workingWeek),
  });
  assert.equal(response.status, 404);
  assert.deepEqual(await response.json(), { code: 'NOT_FOUND' });
  assert.equal(db.state.commits, 0);
  assert.equal(db.state.rollbacks, 1);
});
