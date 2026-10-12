// Post-deployment smoke test (P08-CHECK-001). Read-only: it creates no accounts and writes no data,
// so it is safe against the deployed demonstration database.
//
//   BASE_URL=https://example.vercel.app node scripts/smoke-test.js
//
// Environment:
//   BASE_URL      required. The deployed origin (no trailing path).
//   APP_ORIGIN    optional. When it equals the origin of BASE_URL, one more check runs: a sign-in with
//                 unknown credentials must answer INVALID_CREDENTIALS (exercises Argon2 and the database).
//   SMOKE_REQUIRE_ALL  optional. "1" makes a SKIPPED check a failure. The post-deploy workflow sets it, so a
//                 deployment is never reported verified while a check (for example SMOKE-06) did not run.
//   SMOKE_CHECKS  optional. "api", "static" or "all" (default). Local runs against the API server alone
//                 use "api"; the static client and the deep-link rewrite exist only on the deployment.
//
// Exit code 0 only when every selected check passes. Never prints headers, cookies or bodies beyond
// the short failure reason.
const baseUrl = (process.env.BASE_URL ?? '').replace(/\/+$/, '');
const selection = process.env.SMOKE_CHECKS ?? 'all';
if (!baseUrl) {
  console.error('BASE_URL is required, for example BASE_URL=https://example.vercel.app');
  process.exit(2);
}
if (!['api', 'static', 'all'].includes(selection)) {
  console.error('SMOKE_CHECKS must be api, static or all');
  process.exit(2);
}

const TIMEOUT_MS = 30_000; // Neon compute may need seconds to resume after idling (P05-RISK-014)
const results = [];

async function call(path, init = {}) {
  const response = await fetch(`${baseUrl}${path}`, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS), redirect: 'manual' });
  const text = await response.text();
  let json;
  try { json = JSON.parse(text); } catch { json = undefined; }
  return { status: response.status, headers: response.headers, text, json };
}

async function check(id, group, description, run) {
  if (selection !== 'all' && selection !== group) return;
  try {
    const outcome = await run();
    results.push({ id, description, ok: true, skipped: outcome === 'SKIP' });
  } catch (error) {
    results.push({ id, description, ok: false, reason: error.message });
  }
}

function expect(condition, message) {
  if (!condition) throw new Error(message);
}

await check('SMOKE-01', 'api', 'GET /api/health answers {"status":"ok"} (the function runs and /api is routed)', async () => {
  const r = await call('/api/health');
  expect(r.status === 200 && r.json?.status === 'ok', `status ${r.status}, expected 200 with {"status":"ok"} (is the URL protected by a login wall?)`);
});

await check('SMOKE-02', 'api', 'GET /api/health/db reaches PostgreSQL through DATABASE_URL', async () => {
  const r = await call('/api/health/db');
  expect(r.status === 200 && r.json?.database === 'ok', `status ${r.status}, code ${r.json?.code ?? 'n/a'}`);
});

await check('SMOKE-03', 'api', 'GET /api/session answers state "none" without a cookie and is not cacheable', async () => {
  const r = await call('/api/session');
  expect(r.status === 200 && r.json?.state === 'none', `status ${r.status}, state ${r.json?.state}`);
  expect(r.headers.get('cache-control') === 'no-store', 'Cache-Control is not no-store');
});

await check('SMOKE-04', 'api', 'a protected route without a session answers UNAUTHENTICATED (guards are live)', async () => {
  const r = await call('/api/provider/profile');
  expect(r.status === 401 && r.json?.code === 'UNAUTHENTICATED', `status ${r.status}, code ${r.json?.code}`);
});

await check('SMOKE-05', 'api', 'a state-changing request from a foreign origin is refused (CR-021)', async () => {
  const r = await call('/api/auth/sign-in', {
    method: 'POST',
    headers: { origin: 'https://smoke-test.invalid', 'content-type': 'application/json' },
    body: '{}',
  });
  expect(r.status === 403 && r.json?.code === 'FORBIDDEN_ORIGIN', `status ${r.status}, code ${r.json?.code}`);
});

await check('SMOKE-06', 'api', 'sign-in with unknown credentials answers INVALID_CREDENTIALS (Argon2 and database path; needs APP_ORIGIN)', async () => {
  if (process.env.APP_ORIGIN !== new URL(baseUrl).origin) return 'SKIP'; // not the configured application origin
  const r = await call('/api/auth/sign-in', {
    method: 'POST',
    headers: { origin: process.env.APP_ORIGIN, 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'smoke-test@example.invalid', password: 'not-a-real-password', accountType: 'owner' }),
  });
  expect(r.status === 401 && r.json?.code === 'INVALID_CREDENTIALS', `status ${r.status}, code ${r.json?.code}`);
});

await check('SMOKE-07', 'static', 'GET / serves the client entry page from public/', async () => {
  const r = await call('/');
  expect(r.status === 200 && /text\/html/.test(r.headers.get('content-type') ?? ''), `status ${r.status}`);
  expect(r.text.includes('id="root"'), 'the page does not contain the client root element');
});

await check('SMOKE-08', 'static', 'a client deep link returns the entry page (SPA rewrite, P05-ASM-012)', async () => {
  const r = await call('/estado-tecnico');
  expect(r.status === 200 && r.text.includes('id="root"'), `status ${r.status}; fallback is hash routing (P05-ASM-012)`);
});

await check('SMOKE-09', 'static', 'an unknown /api path stays a JSON NOT_FOUND and is not rewritten to the client', async () => {
  const r = await call('/api/smoke-test-does-not-exist');
  expect(r.status === 404 && r.json?.code === 'NOT_FOUND', `status ${r.status}`);
});

const failed = results.filter((r) => !r.ok);
const skipped = results.filter((r) => r.skipped);
for (const r of results) {
  const label = !r.ok ? 'FAIL' : r.skipped ? 'SKIP' : 'PASS';
  console.log(`${label} ${r.id} ${r.description}${r.ok ? '' : `
     reason: ${r.reason}`}`);
}
const passed = results.length - failed.length - skipped.length;
console.log(`${passed} passed, ${failed.length} failed, ${skipped.length} skipped (not verified) against ${new URL(baseUrl).origin}`);
const requireAll = process.env.SMOKE_REQUIRE_ALL === '1';
if (requireAll && skipped.length) {
  console.error(`SMOKE_REQUIRE_ALL=1: ${skipped.map((r) => r.id).join(', ')} did not run (set APP_ORIGIN to the origin of BASE_URL); the deployment is NOT verified`);
}
process.exit(failed.length || results.length === 0 || (requireAll && skipped.length) ? 1 : 0);
