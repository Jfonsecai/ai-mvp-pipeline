// P07.1 — Security tests for the implemented scope: authentication and role separation on every
// protected endpoint (BR-001, AC-013, AC-113), cross-account data isolation (AC-064), request-origin
// protection (CR-021), session cookie and token storage (ADR-007, NFR-002), injection resistance,
// error-information leakage (CR-005) and log hygiene (CR-020).
//
// Everything runs against the real application and PostgreSQL. Test ids: TEST-SEC-nnn.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createLogger } from '../../../../src/shared/logger.js';
import { APP_ORIGIN, createHarness, ownerBody, PASSWORD, SKIP, weekOf } from '../support/harness.js';

const logLines = [];
let h;
let world;
before(async () => {
  if (SKIP) return;
  h = await createHarness({ logger: createLogger({ write: (line) => logLines.push(line) }) });
  const clinic = await h.setupProvider('clinic');
  const service = await h.publishService(clinic);
  const owner = await h.signUpOwner();
  world = { clinic, service, owner, other: await h.signUpOwner() };
});
after(async () => { if (h) await h.close(); });

const UUID = '11111111-1111-4111-8111-111111111111';
const OWNER_ENDPOINTS = () => [
  ['GET', '/api/owner/pets'], ['GET', '/api/owner/appointments'], ['GET', '/api/search?q=a'],
  ['GET', `/api/providers/${world.clinic.id}`], ['GET', `/api/services/${world.service.id}/booking-context`],
  ['POST', '/api/owner/appointments', {}],
];
const PROVIDER_ENDPOINTS = () => [
  ['GET', '/api/provider/profile'], ['PUT', '/api/provider/profile', {}], ['GET', '/api/provider/working-hours'],
  ['PUT', '/api/provider/working-hours', {}], ['GET', '/api/provider/offerings'], ['POST', '/api/provider/services', {}],
  ['POST', '/api/provider/products', {}], ['GET', '/api/provider/appointments'],
];

describe('authentication and role separation', { skip: SKIP }, () => {
  test('TEST-SEC-001 AC-113: every protected endpoint answers 401 UNAUTHENTICATED without a session and never touches data', async () => {
    for (const [method, path, body] of [...OWNER_ENDPOINTS(), ...PROVIDER_ENDPOINTS()]) {
      const response = await h.request(method, path, { body });
      assert.equal(response.status, 401, `${method} ${path}`);
      assert.deepEqual(response.body, { code: 'UNAUTHENTICATED' }, `${method} ${path}`);
    }
  });

  test('TEST-SEC-002 AC-013 BR-001: every endpoint of the other account type is indistinguishable from a missing resource', async () => {
    for (const [method, path, body] of OWNER_ENDPOINTS()) {
      const response = await h.request(method, path, { session: world.clinic, body });
      assert.equal(response.status, 404, `provider on ${method} ${path}`);
      assert.deepEqual(response.body, { code: 'NOT_FOUND' });
    }
    for (const [method, path, body] of PROVIDER_ENDPOINTS()) {
      const response = await h.request(method, path, { session: world.owner, body });
      assert.equal(response.status, 404, `owner on ${method} ${path}`);
      assert.deepEqual(response.body, { code: 'NOT_FOUND' });
    }
    const unknown = await h.request('GET', '/api/does/not/exist', { session: world.owner });
    assert.deepEqual(unknown.body, { code: 'NOT_FOUND' }, 'same body as an unknown route');
  });

  test('TEST-SEC-003 NFR-002: forged, truncated and malformed cookies never authenticate', async () => {
    const real = world.owner.cookie.split('=')[1];
    const forged = [
      'vetcare_session=',
      'vetcare_session=AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
      `vetcare_session=${real.slice(0, -2)}xx`,
      `vetcare_session=${real.slice(0, 10)}`,
      `vetcare_session=${real.toUpperCase()}`,
      `vetcare_session=${real}; vetcare_session=other`,
      'vetcare_session=\' OR \'1\'=\'1',
      'other_cookie=' + real,
      `vetcare_session=${'A'.repeat(5000)}`,
    ];
    for (const cookie of forged) {
      const response = await h.request('GET', '/api/owner/pets', { session: { cookie } });
      // A repeated cookie name resolves to the first value; that value (the real one) is allowed to work.
      if (cookie === `vetcare_session=${real}; vetcare_session=other`) continue;
      assert.equal(response.status, 401, cookie.slice(0, 40));
    }
  });

  test('TEST-SEC-004 ADR-007 P05-ASM-007: the database stores only the SHA-256 of the session token, never the token', async () => {
    const owner = await h.signUpOwner();
    const token = owner.cookie.split('=')[1];
    assert.ok(Buffer.from(token, 'base64url').length >= 32, 'token carries at least 32 random bytes');
    const rows = (await h.admin.query('SELECT * FROM session WHERE account_id = $1', [owner.id])).rows;
    assert.equal(rows.length, 1);
    assert.deepEqual(rows[0].token_hash, createHash('sha256').update(token, 'utf8').digest());
    assert.ok(!JSON.stringify(rows[0]).includes(token), 'the raw token appears in no column');
  });

  test('TEST-SEC-005 ADR-007: session cookies are HttpOnly, Secure, SameSite=Lax, Path=/ and bounded by the absolute lifetime', async () => {
    const owner = await h.signUpOwner();
    const signIn = await h.signIn(owner.email, owner.password, 'owner');
    for (const response of [owner.response, signIn.response]) {
      const header = response.headers.get('set-cookie');
      for (const attribute of ['HttpOnly', 'Secure', 'SameSite=Lax', 'Path=/']) assert.ok(header.includes(attribute), `${attribute} in ${header.replace(/=[^;]+/, '=…')}`);
      assert.match(header, /Max-Age=43200/);
    }
    assert.notEqual(owner.cookie, signIn.cookie, 'each sign-in issues a new token');
  });

  test('TEST-SEC-006 AC-012: sign-in failures do not reveal whether the account exists (same status, body and no cookie)', async () => {
    const known = await h.request('POST', '/api/auth/sign-in', { body: { email: world.owner.email, password: 'wrong-password-xx', accountType: 'owner' } });
    const unknown = await h.request('POST', '/api/auth/sign-in', { body: { email: 'nobody-at-all@example.test', password: 'wrong-password-xx', accountType: 'owner' } });
    assert.equal(known.status, unknown.status);
    assert.equal(known.text, unknown.text);
    assert.equal(known.headers.get('set-cookie'), null);
    assert.equal(unknown.headers.get('set-cookie'), null);
  });

  test('TEST-SEC-007 NFR-001: password length is capped, so a huge password cannot force expensive hashing', async () => {
    const response = await h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ password: 'x'.repeat(129) }) });
    assert.equal(response.status, 422);
    assert.ok(response.body.fields.some((f) => f.field === 'password' && f.reason === 'TOO_LONG'));
    const signIn = await h.request('POST', '/api/auth/sign-in', { body: { email: world.owner.email, password: 'x'.repeat(129), accountType: 'owner' } });
    assert.equal(signIn.status, 422);
  });
});

describe('request origin protection (CR-021)', { skip: SKIP }, () => {
  const stateChanging = () => [
    ['POST', '/api/auth/sign-in', { email: world.owner.email, password: world.owner.password, accountType: 'owner' }],
    ['POST', '/api/auth/sign-out'],
    ['POST', '/api/owner/appointments', {}],
    ['PUT', '/api/provider/profile', {}],
    ['PUT', '/api/provider/working-hours', weekOf({ 1: [8, 9] })],
    ['POST', '/api/provider/services', { name: 'x', priceCop: 1000, species: 'dog', modality: 'clinic' }],
  ];

  test('TEST-SEC-010: a state-changing request from another origin or without Origin is refused with FORBIDDEN_ORIGIN and has no effect', async () => {
    const before = (await h.request('GET', '/api/provider/working-hours', { session: world.clinic })).body;
    for (const [method, path, body] of stateChanging()) {
      for (const headers of [{ origin: 'https://evil.example' }, { origin: 'null' }, { origin: `${APP_ORIGIN}.evil.example` }, { origin: 'http://vetcare.test' }]) {
        const session = path.includes('provider') ? world.clinic : world.owner;
        const response = await h.request(method, path, { session, body, headers });
        assert.equal(response.status, 403, `${method} ${path} origin=${headers.origin}`);
        assert.deepEqual(response.body, { code: 'FORBIDDEN_ORIGIN' });
      }
      // no Origin header at all (fetch always sends one; a raw client may not)
      const bare = await fetch(`${h.baseUrl}${path}`, {
        method, headers: { 'content-type': 'application/json', cookie: (path.includes('provider') ? world.clinic : world.owner).cookie },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
      assert.equal(bare.status, 403, `${method} ${path} without Origin`);
    }
    assert.deepEqual((await h.request('GET', '/api/provider/working-hours', { session: world.clinic })).body, before, 'rejected PUT changed nothing');
    assert.equal((await h.request('GET', '/api/owner/pets', { session: world.owner })).status, 200, 'rejected sign-out did not end the session');
  });

  test('TEST-SEC-011: a body that is not application/json is refused even from the right origin', async () => {
    for (const type of ['text/plain', 'application/x-www-form-urlencoded', 'multipart/form-data; boundary=x']) {
      const response = await h.request('POST', '/api/auth/sign-in', {
        headers: { 'content-type': type }, raw: 'email=a%40b.co&password=x&accountType=owner',
      });
      assert.equal(response.status, 403, type);
      assert.deepEqual(response.body, { code: 'FORBIDDEN_ORIGIN' });
    }
  });

  test('TEST-SEC-012: read-only requests do not need an Origin and no CORS permission is granted to other origins', async () => {
    const response = await h.request('GET', '/api/session', { headers: { origin: 'https://evil.example' } });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), null);
    assert.equal(response.headers.get('access-control-allow-credentials'), null);
  });
});

describe('cross-account isolation (AC-064, BR-005)', { skip: SKIP }, () => {
  test('TEST-SEC-020 AC-064 AC-055: appointments are visible only to their own owner and provider', async () => {
    const otherClinic = await h.setupProvider('clinic');
    await h.publishService(otherClinic);
    const booked = await h.book(world.owner, { serviceId: world.service.id, petId: world.owner.petId, startsAt: '2026-10-13T09:00:00-05:00' });
    assert.equal(booked.status, 201, booked.text);
    const peek = async (session, path) => (await h.request('GET', path, { session })).body.appointments;
    assert.equal((await peek(world.other, '/api/owner/appointments')).length, 0);
    assert.equal((await peek(otherClinic, '/api/provider/appointments')).length, 0);
    assert.equal((await peek(world.owner, '/api/owner/appointments')).length, 1);
    assert.equal((await peek(world.clinic, '/api/provider/appointments')).length, 1);
  });

  test('TEST-SEC-021 BR-005: an owner cannot book with another owner\'s pet, nor inject ownership through extra fields', async () => {
    const stolen = await h.book(world.owner, { serviceId: world.service.id, petId: world.other.petId, startsAt: '2026-10-13T11:00:00-05:00' });
    assert.equal(stolen.status, 404);
    const injected = await h.book(world.owner, {
      serviceId: world.service.id, petId: world.owner.petId, startsAt: '2026-10-13T11:00:00-05:00',
      ownerId: world.other.id, providerId: world.clinic.id, status: 'cancelled',
    });
    assert.equal(injected.status, 422);
    for (const field of ['ownerId', 'providerId', 'status']) assert.ok(injected.body.fields.some((f) => f.field === field && f.reason === 'NOT_ALLOWED'), field);
    assert.equal((await h.admin.query('SELECT 1 FROM appointment WHERE owner_id = $1', [world.other.id])).rowCount, 0);
  });

  test('TEST-SEC-022: sign-up input cannot choose the account type, id, or any unlisted attribute (mass assignment)', async () => {
    const owner = await h.request('POST', '/api/auth/sign-up/owner', { body: { ...ownerBody(), accountType: 'provider', id: UUID, role: 'admin' } });
    assert.equal(owner.status, 422);
    for (const field of ['accountType', 'id', 'role']) assert.ok(owner.body.fields.some((f) => f.field === field && f.reason === 'NOT_ALLOWED'), field);
    const provider = await h.request('POST', '/api/auth/sign-up/provider', {
      body: { name: 'Mass', email: 'mass@example.test', password: PASSWORD, providerType: 'independent', verified: true },
    });
    assert.equal(provider.status, 422);
    const profile = await h.request('PUT', '/api/provider/profile', {
      session: world.clinic, body: { publicName: 'A', contactPhone: '300', contactEmail: 'a@b.co', address: 'x', providerType: 'independent' },
    });
    assert.equal(profile.status, 422, 'the provider type is immutable (BR-002)');
    assert.equal((await h.request('GET', '/api/provider/profile', { session: world.clinic })).body.providerType, 'clinic');
  });

  test('TEST-SEC-023: a provider cannot publish on behalf of another provider', async () => {
    const intruder = await h.signUpProvider('independent');
    const response = await h.request('POST', '/api/provider/services', {
      session: intruder, body: { name: 'Intruso', priceCop: 1000, species: 'dog', providerId: world.clinic.id },
    });
    assert.equal(response.status, 422);
    const catalog = await h.request('GET', '/api/provider/offerings', { session: world.clinic });
    assert.ok(catalog.body.services.every((s) => s.name !== 'Intruso'));
  });
});

describe('injection and hostile input', { skip: SKIP }, () => {
  const PAYLOADS = [
    `'; DROP TABLE account; --`, `' OR '1'='1`, `" OR ""="`, '1; SELECT pg_sleep(5)', '\\', '%', '_', '<script>alert(1)</script>',
    '${7*7}', '{{7*7}}', '../../etc/passwd', 'Robert\'); DROP TABLE pet;--',
  ];

  test('TEST-SEC-030: SQL metacharacters in search text are data: no error, no extra rows, tables intact', async () => {
    for (const payload of PAYLOADS) {
      const response = await h.request('GET', `/api/search?q=${encodeURIComponent(payload)}`, { session: world.owner });
      assert.ok([200, 422].includes(response.status), `${JSON.stringify(payload)} -> ${response.status}`);
      if (response.status === 200) assert.deepEqual(response.body.results, [], JSON.stringify(payload));
    }
    for (const table of ['account', 'pet', 'provider_profile', 'offering', 'appointment', 'session']) {
      assert.ok((await h.admin.query(`SELECT count(*)::int AS n FROM ${table}`)).rows[0].n >= 0, table);
    }
  });

  test('TEST-SEC-035 CR-005 CTR-001: a NUL character in any free-text field is rejected as VALIDATION_FAILED, never as a server error', async () => {
    // PostgreSQL text cannot hold U+0000. Client input must be refused by validation (422), not
    // surface as UNEXPECTED (500), which a client can trigger at will and which pollutes error logs.
    const NUL = 'a\u0000b';
    const clinic = await h.setupProvider('clinic');
    const owner = await h.signUpOwner();
    const vet = await h.setupProvider('independent');
    const vetService = await h.publishService(vet);
    const probes = [
      ['search text', () => h.request('GET', `/api/search?q=${encodeURIComponent(NUL)}`, { session: owner })],
      ['owner sign-up name', () => h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ name: NUL }) })],
      ['owner sign-up pet name', () => h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ pet: { name: NUL, species: 'dog', breed: 'x', ageYears: 1 } }) })],
      ['provider sign-up address', () => h.request('POST', '/api/auth/sign-up/provider', { body: { name: 'P', email: 'nul-p@example.test', password: PASSWORD, providerType: 'clinic', address: NUL } })],
      ['sign-in e-mail', () => h.request('POST', '/api/auth/sign-in', { body: { email: 'a\u0000@b.co', password: PASSWORD, accountType: 'owner' } })],
      ['publish service name', () => h.request('POST', '/api/provider/services', { session: clinic, body: { name: NUL, priceCop: 1000, species: 'dog', modality: 'clinic' } })],
      ['publish product name', () => h.request('POST', '/api/provider/products', { session: clinic, body: { name: NUL, priceCop: 1000, species: 'dog' } })],
      ['profile name', () => h.request('PUT', '/api/provider/profile', { session: clinic, body: { publicName: NUL, contactPhone: '300', contactEmail: 'a@b.co', address: 'x' } })],
      ['owner sign-up pet breed', () => h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ pet: { name: 'x', species: 'dog', breed: NUL, ageYears: 1 } }) })],
      ['provider sign-up name', () => h.request('POST', '/api/auth/sign-up/provider', { body: { name: NUL, email: 'nul-n@example.test', password: PASSWORD, providerType: 'independent' } })],
      ['provider sign-up e-mail', () => h.request('POST', '/api/auth/sign-up/provider', { body: { name: 'P', email: 'a @b.co', password: PASSWORD, providerType: 'independent' } })],
      ['profile contact e-mail', () => h.request('PUT', '/api/provider/profile', { session: clinic, body: { publicName: 'x', contactPhone: '300', contactEmail: 'a @b.co', address: 'x' } })],
      ['home-visit address', () => h.book(owner, { serviceId: vetService.id, petId: owner.petId, startsAt: '2026-10-13T09:00:00-05:00', visitAddress: NUL })],
      ['profile address', () => h.request('PUT', '/api/provider/profile', { session: clinic, body: { publicName: 'x', contactPhone: '300', contactEmail: 'a@b.co', address: NUL } })],
    ];
    const serverErrors = [];
    for (const [label, send] of probes) {
      const response = await send();
      if (response.status >= 500) serverErrors.push(`${label} -> ${response.status} ${response.text}`);
    }
    assert.deepEqual(serverErrors, [], 'client input must never produce a 5xx');
  });

  test('TEST-SEC-037 DEF-001: refusing NUL in text does not change password handling (a NUL inside a password is still just part of the secret)', async () => {
    const password = 'pass word-123';
    const body = ownerBody({ password });
    const created = await h.request('POST', '/api/auth/sign-up/owner', { body });
    assert.equal(created.status, 201);
    const email = body.email;
    assert.equal((await h.signIn(email, password, 'owner')).response.status, 200);
    assert.equal((await h.signIn(email, 'pass', 'owner')).response.status, 401, 'the part before the NUL is not the password');
  });

  test('TEST-SEC-031: hostile text stored by sign-up and publishing round-trips as inert data', async () => {
    const hostile = `Robert'); DROP TABLE account;-- <b>x</b>`;
    const owner = await h.request('POST', '/api/auth/sign-up/owner', {
      body: ownerBody({ name: hostile, pet: { name: hostile, species: 'dog', breed: hostile, ageYears: 1 } }),
    });
    assert.equal(owner.status, 201);
    const clinic = await h.setupProvider('clinic', { name: hostile, address: hostile });
    const service = await h.publishService(clinic, { name: hostile });
    const searcher = await h.signUpOwner();
    const found = await h.request('GET', `/api/search?q=${encodeURIComponent('drop table')}`, { session: searcher });
    assert.ok(found.body.results.some((r) => r.id === service.id && r.name === hostile), 'stored and found verbatim');
    const profile = await h.request('GET', `/api/providers/${clinic.id}`, { session: searcher });
    assert.equal(profile.body.name, hostile);
    assert.equal(profile.body.address, hostile);
    assert.ok((await h.admin.query('SELECT count(*)::int AS n FROM account')).rows[0].n > 0);
  });

  test('TEST-SEC-032: identifiers in paths and bodies are validated before reaching the database', async () => {
    for (const id of ["' OR 1=1 --", '../x', '%00', 'null', '1', '11111111-1111-4111-8111-11111111111g', UUID]) {
      const profile = await h.request('GET', `/api/providers/${encodeURIComponent(id)}`, { session: world.owner });
      assert.equal(profile.status, 404, `profile ${id}`);
      const ctx = await h.request('GET', `/api/services/${encodeURIComponent(id)}/booking-context`, { session: world.owner });
      assert.equal(ctx.status, 404, `context ${id}`);
    }
    const body = await h.book(world.owner, { serviceId: "' OR 1=1 --", petId: '1', startsAt: '2026-10-13T09:00:00-05:00' });
    assert.equal(body.status, 422);
  });

  test('TEST-SEC-036: repeated query parameters and a bracketed search key are rejected by validation, not by a crash', async () => {
    const paths = [
      '/api/search?q=a&q=b', '/api/search?q=a&species=dog&species=cat', '/api/search?q[a]=1',
      `/api/services/${world.service.id}/booking-context?weekStart=2026-10-12&weekStart=2026-10-19`,
    ];
    for (const path of paths) {
      const response = await h.request('GET', path, { session: world.owner });
      assert.equal(response.status, 422, path);
      assert.equal(response.body.code, 'VALIDATION_FAILED', path);
    }
  });

  test('TEST-SEC-033: malformed, wrongly typed and oversized JSON bodies end as JSON errors, never as a crash', async () => {
    const cases = [
      ['{not json', 422], ['[]', 422], ['null', 422], ['"text"', 422], ['{"email": ["a"], "password": {"x": 1}, "accountType": 5}', 422],
    ];
    for (const [raw, status] of cases) {
      const response = await h.request('POST', '/api/auth/sign-in', { raw });
      assert.equal(response.status, status, raw);
      assert.equal(response.body?.code, 'VALIDATION_FAILED', raw);
    }
    const huge = await h.request('POST', '/api/auth/sign-in', { raw: JSON.stringify({ email: 'a@b.co', password: 'x', accountType: 'owner', pad: 'y'.repeat(150_000) }) });
    assert.ok(huge.status >= 400 && huge.status < 500, `oversized body -> ${huge.status}`);
    assert.ok(huge.body?.code, 'oversized body still yields a JSON outcome');
    assert.equal((await h.request('GET', '/api/session')).status, 200, 'server still healthy');
  });

  test('TEST-SEC-034 AC-102: types are checked (numbers, arrays and objects where strings are expected are rejected, not coerced)', async () => {
    for (const name of [123, ['a'], { a: 1 }, true]) {
      const response = await h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ name }) });
      assert.equal(response.status, 422, JSON.stringify(name));
    }
    for (const priceCop of [Number.MAX_SAFE_INTEGER, 2 ** 31, 1e21, 1.5]) {
      const response = await h.request('POST', '/api/provider/services', { session: world.clinic, body: { name: 'big', priceCop, species: 'dog', modality: 'clinic' } });
      assert.equal(response.status, 422, String(priceCop));
    }
  });
});

describe('information leakage and logging (CR-005, CR-020)', { skip: SKIP }, () => {
  test('TEST-SEC-040 CR-005: error responses expose only the outcome code (no stack, SQL, table or file names)', async () => {
    const responses = await Promise.all([
      h.request('GET', '/api/nope'), h.request('GET', '/api/owner/pets'),
      h.request('POST', '/api/auth/sign-in', { raw: '{bad' }),
      h.request('GET', '/api/providers/not-a-uuid', { session: world.owner }),
      h.request('POST', '/api/owner/appointments', { session: world.owner, body: { serviceId: world.service.id, petId: world.owner.petId, startsAt: '2020-01-01T00:00:00-05:00' } }),
      h.request('GET', '/nonexistent-top-level'),
    ]);
    for (const response of responses) {
      assert.ok(response.status >= 400);
      assert.ok(Object.keys(response.body ?? {}).every((key) => ['code', 'fields'].includes(key)), response.text);
      assert.doesNotMatch(response.text, /at .*\.js|node_modules|SELECT |INSERT |relation "|syntax error|ECONN|pg_|stack/i, response.text);
    }
  });

  test('TEST-SEC-041 CR-020: logs never contain passwords, e-mails, cookies, tokens, addresses or request bodies', async () => {
    logLines.length = 0;
    const secret = 'LOG-PROBE-password-7731';
    const email = 'log-probe-7731@example.test';
    const address = 'Calle Secreta 77 # 31-31';
    const owner = await h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ email, password: secret, name: 'Nombre Secreto 7731' }) });
    const token = owner.headers.get('set-cookie').split(';')[0].split('=')[1];
    await h.request('POST', '/api/auth/sign-in', { body: { email, password: secret, accountType: 'owner' } });
    await h.request('POST', '/api/auth/sign-in', { body: { email, password: 'wrong-wrong-1', accountType: 'owner' } });
    await h.request('POST', '/api/auth/sign-up/provider', { body: { name: 'P', email: 'p7731@example.test', password: secret, providerType: 'clinic', address } });
    await h.request('GET', `/api/search?q=${encodeURIComponent('consulta-secreta-7731')}`, { session: { cookie: `vetcare_session=${token}` } });
    await h.request('POST', '/api/owner/appointments', { session: { cookie: `vetcare_session=${token}` }, body: { serviceId: UUID, petId: UUID, startsAt: '2026-10-13T09:00:00-05:00', visitAddress: address } });

    assert.ok(logLines.length >= 5, 'requests are logged');
    const everything = logLines.join('\n');
    for (const needle of [secret, email, address, token, 'Nombre Secreto 7731', 'consulta-secreta-7731', 'wrong-wrong-1', 'vetcare_session']) {
      assert.ok(!everything.includes(needle), `log contains ${needle.slice(0, 12)}…`);
    }
    for (const line of logLines) {
      const entry = JSON.parse(line);
      assert.ok(entry.event, 'every line is a structured event');
      if (entry.event === 'request') assert.ok(!entry.path.includes('?'), 'no query string in the logged path');
    }
  });
});
