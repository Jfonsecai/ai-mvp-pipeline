import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { createIdentityRouter } from '../src/modules/identity/sign-up.js';
import { hashSessionToken } from '../src/modules/identity/sessions.js';
import { fixedClock, startApp, testConfig } from './helpers.js';

const NOW = new Date('2026-10-11T15:00:00Z');

function sessionDb(token) {
  const sessions = new Map([[hashSessionToken(token).toString('hex'), {
    account_id: 'owner-1', account_type: 'owner',
    last_seen_at: NOW, absolute_expires_at: new Date(NOW.getTime() + 60_000), ended_at: null,
  }]]);
  const ended = [];
  return {
    ended,
    async query(sql, params = []) {
      const key = params[0]?.toString('hex');
      if (/^\s*SELECT s\.account_id/.test(sql)) {
        const row = sessions.get(key);
        return { rows: row ? [{ ...row }] : [] };
      }
      if (/^\s*UPDATE session SET last_seen_at/.test(sql)) {
        const row = sessions.get(key);
        if (row) row.last_seen_at = params[1];
        return { rows: [] };
      }
      if (/^\s*UPDATE session SET ended_at/.test(sql)) {
        const row = sessions.get(key);
        if (row && !row.ended_at) {
          row.ended_at = params[1];
          ended.push(key);
        }
        return { rows: [] };
      }
      throw new Error(`Unexpected query in test: ${sql}`);
    },
    async ping() {},
  };
}

test('sign-out ends the current session and always clears the cookie', async () => {
  const token = 'opaque-test-session-token';
  const db = sessionDb(token);
  const app = createApp({ config: testConfig(), db, clock: fixedClock(NOW), modules: [{ createRouter: createIdentityRouter }] });
  const server = await startApp(app);
  try {
    const response = await server.request('/api/auth/sign-out', {
      method: 'POST',
      headers: { Origin: 'https://vetcare.test', Cookie: `vetcare_session=${token}` },
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('set-cookie'), 'vetcare_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    assert.equal(db.ended.length, 1);

    const session = await server.request('/api/session', { headers: { Cookie: `vetcare_session=${token}` } });
    assert.deepEqual(await session.json(), { state: 'none', features: [] });

    const repeated = await server.request('/api/auth/sign-out', {
      method: 'POST', headers: { Origin: 'https://vetcare.test', Cookie: `vetcare_session=${token}` },
    });
    assert.equal(repeated.status, 204);
    assert.equal(db.ended.length, 1, 'ending an already-ended session is idempotent');
  } finally {
    await server.close();
  }
});

test('sign-out without a session succeeds and clears any stale cookie', async () => {
  const db = sessionDb('unused');
  const app = createApp({ config: testConfig(), db, clock: fixedClock(NOW), modules: [{ createRouter: createIdentityRouter }] });
  const server = await startApp(app);
  try {
    const response = await server.request('/api/auth/sign-out', {
      method: 'POST', headers: { Origin: 'https://vetcare.test' },
    });
    assert.equal(response.status, 204);
    assert.equal(response.headers.get('set-cookie'), 'vetcare_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0');
    assert.equal(db.ended.length, 0);
  } finally {
    await server.close();
  }
});
