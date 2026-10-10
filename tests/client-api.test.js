import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, apiFetch } from '../client/src/api/client.js';

const reply = (status, body, { json = true } = {}) => async () => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => {
    if (!json) throw new SyntaxError('not json');
    return body;
  },
});

test('apiFetch: returns the JSON body of a successful response', async () => {
  assert.deepEqual(await apiFetch('/api/health', { fetchImpl: reply(200, { status: 'ok' }) }), { status: 'ok' });
});

test('apiFetch: sends JSON with same-origin credentials and no extra headers', async () => {
  let seen;
  await apiFetch('/api/x', {
    method: 'POST',
    body: { a: 1 },
    fetchImpl: async (path, init) => {
      seen = { path, init };
      return { ok: true, status: 201, json: async () => ({}) };
    },
  });
  assert.equal(seen.path, '/api/x');
  assert.equal(seen.init.method, 'POST');
  assert.equal(seen.init.credentials, 'same-origin');
  assert.equal(seen.init.headers['Content-Type'], 'application/json');
  assert.equal(seen.init.body, '{"a":1}');
});

test('apiFetch: 204 resolves to null', async () => {
  assert.equal(await apiFetch('/api/auth/sign-out', { method: 'POST', fetchImpl: async () => ({ ok: true, status: 204 }) }), null);
});

test('apiFetch: a CTR-001 error body becomes an ApiError with code, status and fields', async () => {
  const fields = [{ field: 'password', reason: 'TOO_SHORT' }];
  await assert.rejects(
    apiFetch('/api/x', { fetchImpl: reply(422, { code: 'VALIDATION_FAILED', fields }) }),
    (error) => error instanceof ApiError && error.code === 'VALIDATION_FAILED' && error.status === 422 && error.fields === fields,
  );
});

test('apiFetch: non-JSON or foreign error bodies and network failures are UNEXPECTED', async () => {
  await assert.rejects(apiFetch('/x', { fetchImpl: reply(502, null, { json: false }) }), (e) => e.code === 'UNEXPECTED' && e.status === 502);
  await assert.rejects(apiFetch('/x', { fetchImpl: reply(500, { message: 'oops' }) }), (e) => e.code === 'UNEXPECTED');
  await assert.rejects(apiFetch('/x', { fetchImpl: reply(200, null, { json: false }) }), (e) => e.code === 'UNEXPECTED');
  await assert.rejects(
    apiFetch('/x', { fetchImpl: async () => { throw new TypeError('Failed to fetch'); } }),
    (e) => e.code === 'UNEXPECTED' && e.status === 0,
  );
});
