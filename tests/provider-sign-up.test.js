import { test } from 'node:test';
import assert from 'node:assert/strict';
import argon2 from 'argon2';
import { createApp } from '../src/application.js';
import { createIdentityRouter, validateProviderSignUp } from '../src/modules/identity/sign-up.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const NOW = new Date('2026-10-11T15:00:00Z');

test('provider sign-up validator normalizes text and email and allows an independent vet without address', () => {
  assert.deepEqual(
    validateProviderSignUp({ name: ' Vet ', email: ' VET@Example.com ', password: 'password1', providerType: 'independent' }),
    { value: { name: 'Vet', email: 'vet@example.com', password: 'password1', providerType: 'independent', address: undefined } },
  );
});

test('provider sign-up validator reports missing type, short password and clinic address', () => {
  const result = validateProviderSignUp({ name: 'Clinic', email: 'clinic@example.com', password: 'short', providerType: 'clinic' });
  assert.deepEqual(result.fields, [
    { field: 'password', reason: 'TOO_SHORT' },
    { field: 'address', reason: 'REQUIRED' },
  ]);
  assert.ok(validateProviderSignUp({ name: 'Vet', email: 'vet@example.com', password: 'password1' }).fields.some((f) => f.field === 'providerType'));
});

test('provider sign-up validator enforces types and counts Unicode password characters', () => {
  const wrongType = validateProviderSignUp({
    name: 'Vet', email: 'vet@example.com', password: 'password1', providerType: 'independent', address: 42,
  });
  assert.deepEqual(wrongType.fields, [{ field: 'address', reason: 'INVALID_FORMAT' }]);
  const unicode = validateProviderSignUp({
    name: 'Vet', email: 'vet@example.com', password: '😀😀😀😀', providerType: 'independent',
  });
  assert.deepEqual(unicode.fields, [{ field: 'password', reason: 'TOO_SHORT' }]);
});

function fakeDb({ duplicate = false } = {}) {
  const state = { statements: [], accountValues: null, profileValues: null, sessionValues: null, rollbacks: 0 };
  return {
    state,
    async query() { return { rows: [] }; },
    async connect() {
      return {
        async query(sql, params = []) {
          const statement = sql.trim();
          state.statements.push(statement);
          if (statement === 'BEGIN' || statement === 'COMMIT' || statement === 'ROLLBACK') {
            if (statement === 'ROLLBACK') state.rollbacks += 1;
            return { rows: [] };
          }
          if (/INSERT INTO account/.test(statement)) {
            if (duplicate) {
              const error = new Error('duplicate');
              error.code = '23505';
              error.constraint = 'account_email_type_uq';
              throw error;
            }
            state.accountValues = params;
            return { rows: [{ id: '11111111-1111-4111-8111-111111111111' }] };
          }
          if (/INSERT INTO provider_profile/.test(statement)) state.profileValues = params;
          if (/INSERT INTO session/.test(statement)) state.sessionValues = params;
          return { rows: [] };
        },
        release() {},
      };
    },
    async ping() {},
  };
}

async function withServer(db, callback) {
  const config = testConfig();
  const app = createApp({ config, db, clock: fixedClock(NOW), modules: [{ createRouter: createIdentityRouter }] });
  const server = await startApp(app);
  try { await callback(server); } finally { await server.close(); }
}

test('provider sign-up creates account, profile and hashed-token session atomically and returns cookie', async () => {
  const db = fakeDb();
  await withServer(db, async ({ request }) => {
    const response = await request('/api/auth/sign-up/provider', {
      method: 'POST',
      headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '  Centro Vet ', email: ' DOCTOR@Example.com ', password: 'password1', providerType: 'clinic', address: ' Calle 1 ' }),
    });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { accountType: 'provider', features: [] });
    const cookie = response.headers.get('set-cookie');
    assert.match(cookie, /^vetcare_session=[A-Za-z0-9_-]+; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=43200$/);
    assert.deepEqual(db.state.statements.filter((sql) => ['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql)), ['BEGIN', 'COMMIT']);
    assert.deepEqual(db.state.accountValues.slice(0, 2), ['Centro Vet', 'doctor@example.com']);
    assert.match(db.state.accountValues[2], /^\$argon2id\$/);
    assert.equal(await argon2.verify(db.state.accountValues[2], 'password1'), true);
    assert.deepEqual(db.state.profileValues.slice(1), ['clinic', 'Centro Vet', 'doctor@example.com', 'Calle 1']);
    assert.equal(Buffer.isBuffer(db.state.sessionValues[0]), true);
    assert.notEqual(db.state.sessionValues[0].toString('base64url'), cookie.match(/^vetcare_session=([^;]+)/)[1]);
  });
});

test('provider sign-up rejects invalid fields before database writes', async () => {
  const db = fakeDb();
  await withServer(db, async ({ request }) => {
    const response = await request('/api/auth/sign-up/provider', {
      method: 'POST',
      headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Vet', email: 'vet@example.com', password: 'short', providerType: 'clinic' }),
    });
    assert.equal(response.status, 422);
    assert.deepEqual(await response.json(), {
      code: 'VALIDATION_FAILED',
      fields: [{ field: 'password', reason: 'TOO_SHORT' }, { field: 'address', reason: 'REQUIRED' }],
    });
    assert.deepEqual(db.state.statements, []);
  });
});

test('provider sign-up indicates a missing provider type and creates nothing', async () => {
  const db = fakeDb();
  await withServer(db, async ({ request }) => {
    const response = await request('/api/auth/sign-up/provider', {
      method: 'POST',
      headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Vet', email: 'vet@example.com', password: 'password1' }),
    });
    assert.equal(response.status, 422);
    assert.deepEqual(await response.json(), {
      code: 'VALIDATION_FAILED',
      fields: [{ field: 'providerType', reason: 'REQUIRED' }],
    });
    assert.deepEqual(db.state.statements, []);
  });
});

test('provider sign-up maps duplicate provider email and rolls back', async () => {
  const db = fakeDb({ duplicate: true });
  await withServer(db, async ({ request }) => {
    const response = await request('/api/auth/sign-up/provider', {
      method: 'POST',
      headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Vet', email: 'vet@example.com', password: 'password1', providerType: 'independent' }),
    });
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { code: 'DUPLICATE_ACCOUNT_FOR_TYPE' });
    assert.equal(db.state.rollbacks, 1);
    assert.equal(response.headers.get('set-cookie'), null);
  });
});
