import { test } from 'node:test';
import assert from 'node:assert/strict';
import argon2 from 'argon2';
import { createApp } from '../src/application.js';
import { createIdentityRouter, validateOwnerSignUp } from '../src/modules/identity/sign-up.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const NOW = new Date('2026-10-11T15:00:00Z');
const good = { name: '  Pet Owner ', email: ' OWNER@Example.com ', password: 'password1', pet: { name: ' Nala ', species: 'dog', breed: ' Mixed ', ageYears: 0, weightKg: 12.3, heightCm: 42 } };

test('owner validator trims text and normalizes the email', () => {
  assert.deepEqual(validateOwnerSignUp(good), { value: { name: 'Pet Owner', email: 'owner@example.com', password: 'password1', pet: { name: 'Nala', species: 'dog', breed: 'Mixed', ageYears: 0, weightKg: 12.3, heightCm: 42 } } });
});

test('owner validator rejects missing fields, unsupported species and invalid pet measurements', () => {
  const missing = validateOwnerSignUp({ name: 'Owner', email: 'owner@example.com', password: 'password1', pet: { name: 'Nala', species: 'bird', ageYears: -1, weightKg: 2.22, heightCm: 1.2 } });
  assert.deepEqual(missing.fields, [
    { field: 'pet.breed', reason: 'REQUIRED' }, { field: 'pet.species', reason: 'NOT_ALLOWED' },
    { field: 'pet.ageYears', reason: 'OUT_OF_RANGE' }, { field: 'pet.weightKg', reason: 'INVALID_FORMAT' },
    { field: 'pet.heightCm', reason: 'INVALID_FORMAT' },
  ]);
  assert.deepEqual(validateOwnerSignUp({ name: 'Owner', email: 'owner@example.com', password: 'short', pet: {} }).fields.slice(0, 4), [
    { field: 'password', reason: 'TOO_SHORT' }, { field: 'pet.name', reason: 'REQUIRED' },
    { field: 'pet.breed', reason: 'REQUIRED' }, { field: 'pet.species', reason: 'REQUIRED' },
  ]);
  assert.deepEqual(validateOwnerSignUp({ name: 'Owner', email: 'owner@example.com', password: 'password1' }).fields, [{ field: 'pet', reason: 'REQUIRED' }]);
});

function fakeDb({ duplicate = false } = {}) {
  const state = { statements: [], accountValues: null, petValues: null, sessionValues: null, rollbacks: 0 };
  return { state, async query() { return { rows: [] }; }, async connect() { return {
    async query(sql, params = []) {
      const statement = sql.trim(); state.statements.push(statement);
      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(statement)) { if (statement === 'ROLLBACK') state.rollbacks += 1; return { rows: [] }; }
      if (/INSERT INTO account/.test(statement)) {
        if (duplicate) { const error = new Error('duplicate'); error.code = '23505'; error.constraint = 'account_email_type_uq'; throw error; }
        state.accountValues = params; return { rows: [{ id: '11111111-1111-4111-8111-111111111111' }] };
      }
      if (/INSERT INTO pet/.test(statement)) state.petValues = params;
      if (/INSERT INTO session/.test(statement)) state.sessionValues = params;
      return { rows: [] };
    }, release() {},
  }; }, async ping() {} };
}

async function withServer(db, callback) {
  const app = createApp({ config: testConfig(), db, clock: fixedClock(NOW), modules: [{ createRouter: createIdentityRouter }] });
  const server = await startApp(app);
  try { await callback(server); } finally { await server.close(); }
}

test('owner sign-up atomically writes account, first pet and session with hashed credentials', async () => {
  const db = fakeDb();
  await withServer(db, async ({ request }) => {
    const response = await request('/api/auth/sign-up/owner', { method: 'POST', headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' }, body: JSON.stringify(good) });
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), { accountType: 'owner', features: [] });
    const cookie = response.headers.get('set-cookie');
    assert.match(cookie, /^vetcare_session=[A-Za-z0-9_-]+; HttpOnly; Secure; SameSite=Lax; Path=\/; Max-Age=43200$/);
    assert.deepEqual(db.state.statements.filter((sql) => ['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql)), ['BEGIN', 'COMMIT']);
    assert.deepEqual(db.state.accountValues.slice(0, 2), ['Pet Owner', 'owner@example.com']);
    assert.match(db.state.accountValues[2], /^\$argon2id\$/);
    assert.equal(await argon2.verify(db.state.accountValues[2], 'password1'), true);
    assert.deepEqual(db.state.petValues.slice(1), ['Nala', 'dog', 'Mixed', 0, 12.3, 42]);
    assert.equal(Buffer.isBuffer(db.state.sessionValues[0]), true);
  });
});

test('owner sign-up rejects invalid data before database writes and maps duplicate owner accounts', async () => {
  const db = fakeDb();
  await withServer(db, async ({ request }) => {
    const invalid = await request('/api/auth/sign-up/owner', { method: 'POST', headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ ...good, password: 'short', pet: { ...good.pet, species: 'bird' } }) });
    assert.equal(invalid.status, 422);
    assert.deepEqual((await invalid.json()).fields, [{ field: 'password', reason: 'TOO_SHORT' }, { field: 'pet.species', reason: 'NOT_ALLOWED' }]);
    assert.deepEqual(db.state.statements, []);
  });
  const duplicateDb = fakeDb({ duplicate: true });
  await withServer(duplicateDb, async ({ request }) => {
    const response = await request('/api/auth/sign-up/owner', { method: 'POST', headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' }, body: JSON.stringify(good) });
    assert.equal(response.status, 409);
    assert.deepEqual(await response.json(), { code: 'DUPLICATE_ACCOUNT_FOR_TYPE' });
    assert.equal(duplicateDb.state.rollbacks, 1);
    assert.equal(response.headers.get('set-cookie'), null);
  });
});

test('owner sign-up without any pet rejects the request and creates no account', async () => {
  const db = fakeDb();
  await withServer(db, async ({ request }) => {
    const response = await request('/api/auth/sign-up/owner', { method: 'POST', headers: { Origin: 'https://vetcare.test', 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Owner', email: 'owner@example.com', password: 'password1' }) });
    assert.equal(response.status, 422);
    assert.deepEqual(await response.json(), { code: 'VALIDATION_FAILED', fields: [{ field: 'pet', reason: 'REQUIRED' }] });
    assert.deepEqual(db.state.statements, []);
  });
});
