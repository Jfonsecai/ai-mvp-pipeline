import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateSignIn } from '../src/modules/identity/sign-up.js';

test('sign-in validator normalizes the email and validates the selected account type', () => {
  assert.deepEqual(validateSignIn({ email: ' OWNER@Example.com ', password: 'password1', accountType: 'owner' }), {
    value: { email: 'owner@example.com', password: 'password1', accountType: 'owner' },
  });
  assert.deepEqual(validateSignIn({ email: 'bad', password: '', accountType: 'admin' }).fields, [
    { field: 'email', reason: 'INVALID_FORMAT' },
    { field: 'password', reason: 'REQUIRED' },
    { field: 'accountType', reason: 'NOT_ALLOWED' },
  ]);
  assert.deepEqual(validateSignIn({ email: 'a@example.com', password: 'password1' }).fields, [
    { field: 'accountType', reason: 'REQUIRED' },
  ]);
  assert.deepEqual(validateSignIn({ email: 'a@example.com', password: 'password1', accountType: 'owner', ignored: true }).fields, [
    { field: 'ignored', reason: 'NOT_ALLOWED' },
  ]);
});
