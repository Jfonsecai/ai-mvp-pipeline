// IF-038 command behavior without PostgreSQL.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cancelOwnerAppointment, cancelProviderAppointment } from '../src/modules/scheduling/cancellation.js';
import { Outcome } from '../src/shared/outcomes.js';

const NOW = new Date('2026-10-12T12:00:00Z');
const OWNER_ID = '33333333-3333-4333-8333-333333333333';
const PROVIDER_ID = '11111111-1111-4111-8111-111111111111';
const APPOINTMENT_ID = '44444444-4444-4444-8444-444444444444';

function fakePool({ appointment, updatedRowCount = 1 }) {
  const queries = [];
  return {
    queries,
    async connect() {
      return {
        async query(text, params = []) {
          queries.push({ text, params });
          if (text === 'BEGIN' || text === 'COMMIT' || text === 'ROLLBACK') return { rowCount: null, rows: [] };
          if (/^\s*SELECT status, starts_at/.test(text)) {
            return appointment ? { rowCount: 1, rows: [appointment] } : { rowCount: 0, rows: [] };
          }
          if (/^\s*UPDATE appointment/.test(text)) {
            return { rowCount: updatedRowCount, rows: updatedRowCount ? [{ id: APPOINTMENT_ID }] : [] };
          }
          throw new Error(`Unexpected query: ${text}`);
        },
        release() {},
      };
    },
  };
}

test('US-022 / IF-038: owner cancellation is a conditional, transactional state change', async () => {
  const db = fakePool({ appointment: { status: 'scheduled', starts_at: new Date('2026-10-13T15:00:00Z') } });
  assert.deepEqual(await cancelOwnerAppointment(db, { ownerId: OWNER_ID, appointmentId: APPOINTMENT_ID, now: NOW }), { id: APPOINTMENT_ID });
  assert.deepEqual(db.queries.map(({ text }) => text.trim().split(/\s+/)[0]), ['BEGIN', 'SELECT', 'UPDATE', 'COMMIT']);
  const [select, update] = db.queries.slice(1, 3);
  assert.deepEqual(select.params, [APPOINTMENT_ID, OWNER_ID]);
  assert.match(select.text, /owner_id = \$2[\s\S]*FOR UPDATE/);
  assert.deepEqual(update.params, [APPOINTMENT_ID, OWNER_ID, NOW]);
  assert.match(update.text, /status = 'scheduled' AND starts_at > \$3/);
});

test('US-022: unknown or non-owned appointments return NOT_FOUND without changing state', async () => {
  const db = fakePool({ appointment: null });
  await assert.rejects(
    cancelOwnerAppointment(db, { ownerId: OWNER_ID, appointmentId: APPOINTMENT_ID, now: NOW }),
    (error) => error instanceof Outcome && error.code === 'NOT_FOUND',
  );
  assert.equal(db.queries.some(({ text }) => /^\s*UPDATE appointment/.test(text)), false);
  assert.equal(db.queries.at(-1).text, 'ROLLBACK');
});

test('AC-059 / EDGE-010: started and already-cancelled appointments are not changeable', async () => {
  for (const appointment of [
    { status: 'scheduled', starts_at: NOW },
    { status: 'scheduled', starts_at: new Date('2026-10-12T11:00:00Z') },
    { status: 'cancelled', starts_at: new Date('2026-10-13T15:00:00Z') },
  ]) {
    const db = fakePool({ appointment });
    await assert.rejects(
      cancelOwnerAppointment(db, { ownerId: OWNER_ID, appointmentId: APPOINTMENT_ID, now: NOW }),
      (error) => error instanceof Outcome && error.code === 'APPOINTMENT_NOT_CHANGEABLE',
    );
    assert.equal(db.queries.some(({ text }) => /^\s*UPDATE appointment/.test(text)), false);
  }
});

test('concurrent state change detected by the conditional update returns APPOINTMENT_NOT_CHANGEABLE', async () => {
  const db = fakePool({
    appointment: { status: 'scheduled', starts_at: new Date('2026-10-13T15:00:00Z') },
    updatedRowCount: 0,
  });
  await assert.rejects(
    cancelOwnerAppointment(db, { ownerId: OWNER_ID, appointmentId: APPOINTMENT_ID, now: NOW }),
    (error) => error instanceof Outcome && error.code === 'APPOINTMENT_NOT_CHANGEABLE',
  );
  assert.equal(db.queries.at(-1).text, 'ROLLBACK');
});

test('US-025 / IF-038: provider cancellation is scoped to their appointment and remains transactional', async () => {
  const db = fakePool({ appointment: { status: 'scheduled', starts_at: new Date('2026-10-13T15:00:00Z') } });
  assert.deepEqual(await cancelProviderAppointment(db, { providerId: PROVIDER_ID, appointmentId: APPOINTMENT_ID, now: NOW }), { id: APPOINTMENT_ID });
  assert.deepEqual(db.queries.map(({ text }) => text.trim().split(/\s+/)[0]), ['BEGIN', 'SELECT', 'UPDATE', 'COMMIT']);
  const [select, update] = db.queries.slice(1, 3);
  assert.deepEqual(select.params, [APPOINTMENT_ID, PROVIDER_ID]);
  assert.match(select.text, /provider_id = \$2[\s\S]*FOR UPDATE/);
  assert.deepEqual(update.params, [APPOINTMENT_ID, PROVIDER_ID, NOW]);
  assert.match(update.text, /provider_id = \$2 AND status = 'scheduled' AND starts_at > \$3/);
});

test('US-025: unknown or another provider appointment returns NOT_FOUND without changing state', async () => {
  const db = fakePool({ appointment: null });
  await assert.rejects(
    cancelProviderAppointment(db, { providerId: PROVIDER_ID, appointmentId: APPOINTMENT_ID, now: NOW }),
    (error) => error instanceof Outcome && error.code === 'NOT_FOUND',
  );
  assert.equal(db.queries.some(({ text }) => /^\s*UPDATE appointment/.test(text)), false);
  assert.equal(db.queries.at(-1).text, 'ROLLBACK');
});

test('AC-066 / EDGE-010: providers cannot cancel started or already-cancelled appointments', async () => {
  for (const appointment of [
    { status: 'scheduled', starts_at: NOW },
    { status: 'scheduled', starts_at: new Date('2026-10-12T11:00:00Z') },
    { status: 'cancelled', starts_at: new Date('2026-10-13T15:00:00Z') },
  ]) {
    const db = fakePool({ appointment });
    await assert.rejects(
      cancelProviderAppointment(db, { providerId: PROVIDER_ID, appointmentId: APPOINTMENT_ID, now: NOW }),
      (error) => error instanceof Outcome && error.code === 'APPOINTMENT_NOT_CHANGEABLE',
    );
    assert.equal(db.queries.some(({ text }) => /^\s*UPDATE appointment/.test(text)), false);
  }
});
