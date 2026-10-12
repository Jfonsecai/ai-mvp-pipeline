// P07.1 — Identity and sessions (US-001, US-002, US-003, US-034), black-box over HTTP with the real
// application, real PostgreSQL and real Argon2id. Expected behavior comes from REQUIREMENTS_V3.md.
//
// Test ids: TEST-ID-nnn. Each test names the acceptance criteria it verifies.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHarness, ownerBody, providerBody, PASSWORD, SKIP, uniqueEmail } from '../support/harness.js';

let h;
before(async () => { if (!SKIP) h = await createHarness(); });
after(async () => { if (h) await h.close(); });

const fieldsOf = (response) => response.body.fields ?? [];
const hasField = (response, field, reason) =>
  fieldsOf(response).some((entry) => entry.field === field && (reason === undefined || entry.reason === reason));

describe('US-001 owner sign-up', { skip: SKIP }, () => {
  test('TEST-ID-001 AC-001: a valid sign-up creates the owner, registers the pet and signs the owner in', async () => {
    const owner = await h.signUpOwner();
    assert.equal(owner.response.status, 201);
    assert.equal(owner.response.body.accountType, 'owner');
    assert.ok(owner.cookie?.startsWith('vetcare_session='), 'a session cookie is issued');

    const pets = await h.request('GET', '/api/owner/pets', { session: owner });
    assert.equal(pets.status, 200);
    assert.deepEqual(pets.body.pets.map(({ name, species, breed }) => ({ name, species, breed })), [
      { name: 'Firulais', species: 'dog', breed: 'Criollo' },
    ]);
  });

  test('TEST-ID-002 AC-002: sign-up without a pet creates no account and says a pet is required', async () => {
    const body = ownerBody();
    delete body.pet;
    const response = await h.request('POST', '/api/auth/sign-up/owner', { body });
    assert.equal(response.status, 422);
    assert.equal(response.body.code, 'VALIDATION_FAILED');
    assert.ok(hasField(response, 'pet', 'REQUIRED'));
    const rows = await h.admin.query('SELECT 1 FROM account WHERE email = $1', [body.email]);
    assert.equal(rows.rowCount, 0, 'no account row exists');
  });

  for (const [label, mutate, field] of [
    ['name', (b) => { delete b.name; }, 'name'],
    ['email', (b) => { delete b.email; }, 'email'],
    ['password', (b) => { delete b.password; }, 'password'],
    ['pet name', (b) => { delete b.pet.name; }, 'pet.name'],
    ['pet species', (b) => { delete b.pet.species; }, 'pet.species'],
    ['pet age', (b) => { delete b.pet.ageYears; }, 'pet.ageYears'],
    ['pet breed', (b) => { delete b.pet.breed; }, 'pet.breed'],
  ]) {
    test(`TEST-ID-003 AC-003: a missing ${label} is rejected and indicated as ${field}`, async () => {
      const body = ownerBody();
      mutate(body);
      const response = await h.request('POST', '/api/auth/sign-up/owner', { body });
      assert.equal(response.status, 422);
      assert.ok(hasField(response, field, 'REQUIRED'), JSON.stringify(response.body));
      assert.equal((await h.admin.query('SELECT 1 FROM account WHERE email = $1', [body.email])).rowCount, 0);
    });
  }

  test('TEST-ID-004 AC-004: a second owner account with the same email is rejected and the first stays usable', async () => {
    const first = await h.signUpOwner();
    for (const variant of [first.email, first.email.toUpperCase(), `  ${first.email}  `]) {
      const response = await h.request('POST', '/api/auth/sign-up/owner', {
        body: ownerBody({ email: variant, password: 'another-password-1' }),
      });
      assert.equal(response.status, 409, `variant ${JSON.stringify(variant)}`);
      assert.equal(response.body.code, 'DUPLICATE_ACCOUNT_FOR_TYPE');
    }
    const count = await h.admin.query(`SELECT count(*)::int AS n FROM account WHERE email = $1 AND account_type = 'owner'`, [first.email.toLowerCase()]);
    assert.equal(count.rows[0].n, 1);
    const signIn = await h.signIn(first.email, first.password, 'owner');
    assert.equal(signIn.response.status, 200, 'the original password still works');
  });

  test('TEST-ID-005 AC-005: the stored credential is an Argon2id hash, never the password', async () => {
    const owner = await h.signUpOwner({ password: 'plain-text-probe-123' });
    const row = (await h.admin.query('SELECT password_hash FROM account WHERE id = $1', [owner.id])).rows[0];
    assert.match(row.password_hash, /^\$argon2id\$/);
    assert.ok(!row.password_hash.includes('plain-text-probe-123'));
    const whole = JSON.stringify((await h.admin.query('SELECT * FROM account WHERE id = $1', [owner.id])).rows[0]);
    assert.ok(!whole.includes('plain-text-probe-123'), 'no column holds the password');
  });

  test('TEST-ID-006 AC-074: an email that belongs to a provider can still sign up as an owner', async () => {
    const provider = await h.signUpProvider('independent');
    const owner = await h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ email: provider.email }) });
    assert.equal(owner.status, 201);
  });

  test('TEST-ID-007 AC-075: only dog or cat can be chosen as the pet species', async () => {
    for (const species of ['dog', 'cat']) {
      const response = await h.request('POST', '/api/auth/sign-up/owner', {
        body: ownerBody({ pet: { name: 'X', species, breed: 'Mix', ageYears: 1 } }),
      });
      assert.equal(response.status, 201, species);
    }
    for (const species of ['bird', 'Dog', 'DOG', 'rabbit', 7]) {
      const response = await h.request('POST', '/api/auth/sign-up/owner', {
        body: ownerBody({ pet: { name: 'X', species, breed: 'Mix', ageYears: 1 } }),
      });
      assert.equal(response.status, 422, String(species));
      assert.ok(hasField(response, 'pet.species'));
    }
  });

  test('TEST-ID-008 AC-102: the password minimum is 8 characters (7 rejected, 8 accepted, counted as characters)', async () => {
    const short = await h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ password: '1234567' }) });
    assert.equal(short.status, 422);
    assert.ok(hasField(short, 'password', 'TOO_SHORT'));

    const accentedSeven = await h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ password: 'ñññññññ' }) });
    assert.equal(accentedSeven.status, 422, 'seven characters (fourteen bytes) are still too short');

    const eight = await h.request('POST', '/api/auth/sign-up/owner', { body: ownerBody({ password: '12345678' }) });
    assert.equal(eight.status, 201);
  });
});

describe('US-002 provider sign-up', { skip: SKIP }, () => {
  test('TEST-ID-010 AC-006 AC-105: clinic with address and independent veterinarian without address are created', async () => {
    const clinic = await h.signUpProvider('clinic');
    const independent = await h.signUpProvider('independent');
    assert.equal(clinic.response.body.accountType, 'provider');
    assert.equal(independent.response.body.accountType, 'provider');

    const profile = await h.request('GET', '/api/provider/profile', { session: independent });
    assert.equal(profile.status, 200);
    assert.equal(profile.body.providerType, 'independent');
    assert.equal(profile.body.address, null);
    const clinicProfile = await h.request('GET', '/api/provider/profile', { session: clinic });
    assert.equal(clinicProfile.body.address, 'Calle 10 # 5-20, Cali');
  });

  test('TEST-ID-011 AC-007: a missing or unknown provider type is rejected and indicated', async () => {
    const missing = providerBody('clinic');
    delete missing.providerType;
    const response = await h.request('POST', '/api/auth/sign-up/provider', { body: missing });
    assert.equal(response.status, 422);
    assert.ok(hasField(response, 'providerType', 'REQUIRED'));

    const unknown = await h.request('POST', '/api/auth/sign-up/provider', { body: providerBody('clinic', { providerType: 'hospital' }) });
    assert.equal(unknown.status, 422);
    assert.ok(hasField(unknown, 'providerType'));
  });

  test('TEST-ID-012 AC-008: a second provider account with the same email is rejected', async () => {
    const first = await h.signUpProvider('independent');
    const response = await h.request('POST', '/api/auth/sign-up/provider', {
      body: providerBody('independent', { email: first.email.toUpperCase() }),
    });
    assert.equal(response.status, 409);
    assert.equal(response.body.code, 'DUPLICATE_ACCOUNT_FOR_TYPE');
  });

  test('TEST-ID-013 AC-009: the stored provider credential is an Argon2id hash', async () => {
    const provider = await h.signUpProvider('clinic', { password: 'provider-probe-998' });
    const row = (await h.admin.query('SELECT password_hash FROM account WHERE id = $1', [provider.id])).rows[0];
    assert.match(row.password_hash, /^\$argon2id\$/);
    assert.ok(!row.password_hash.includes('provider-probe-998'));
  });

  test('TEST-ID-014 AC-076: an email that belongs to an owner can sign up as a provider', async () => {
    const owner = await h.signUpOwner();
    const response = await h.request('POST', '/api/auth/sign-up/provider', { body: providerBody('clinic', { email: owner.email }) });
    assert.equal(response.status, 201);
  });

  test('TEST-ID-015 AC-103: provider password shorter than 8 characters is rejected', async () => {
    const response = await h.request('POST', '/api/auth/sign-up/provider', { body: providerBody('independent', { password: 'short7!' }) });
    assert.equal(response.status, 422);
    assert.ok(hasField(response, 'password', 'TOO_SHORT'));
  });

  test('TEST-ID-016 AC-104: a clinic without an address (absent, empty or blank) is rejected', async () => {
    for (const address of [undefined, '', '   ']) {
      const body = providerBody('clinic');
      if (address === undefined) delete body.address; else body.address = address;
      const response = await h.request('POST', '/api/auth/sign-up/provider', { body });
      assert.equal(response.status, 422, JSON.stringify(address));
      assert.ok(hasField(response, 'address', 'REQUIRED'));
      assert.equal((await h.admin.query('SELECT 1 FROM account WHERE email = $1', [body.email])).rowCount, 0);
    }
  });
});

describe('US-003 sign-in and account types', { skip: SKIP }, () => {
  test('TEST-ID-020 AC-010 AC-011: owners and providers sign in with the correct credentials and reach their own interface', async () => {
    const owner = await h.signUpOwner();
    const provider = await h.signUpProvider('clinic');

    const ownerIn = await h.signIn(owner.email, owner.password, 'owner');
    assert.equal(ownerIn.response.status, 200);
    assert.equal(ownerIn.response.body.accountType, 'owner');
    assert.equal((await h.request('GET', '/api/owner/pets', { session: ownerIn })).status, 200);

    const providerIn = await h.signIn(provider.email, provider.password, 'provider');
    assert.equal(providerIn.response.status, 200);
    assert.equal(providerIn.response.body.accountType, 'provider');
    assert.equal((await h.request('GET', '/api/provider/profile', { session: providerIn })).status, 200);
  });

  test('TEST-ID-021 AC-012: wrong password, unknown email and unregistered account type give the same refusal', async () => {
    const owner = await h.signUpOwner();
    const attempts = await Promise.all([
      h.signIn(owner.email, 'wrong-password-123', 'owner'),
      h.signIn(uniqueEmail('ghost'), PASSWORD, 'owner'),
      h.signIn(owner.email, owner.password, 'provider'),
    ]);
    for (const { response, cookie } of attempts) {
      assert.equal(response.status, 401);
      assert.deepEqual(response.body, { code: 'INVALID_CREDENTIALS' });
      assert.equal(cookie, undefined, 'no session is issued');
    }
  });

  test('TEST-ID-022 AC-013: a session of one account type cannot use functions of the other type', async () => {
    const owner = await h.signUpOwner();
    const provider = await h.signUpProvider('clinic');
    const providerOnly = [
      ['GET', '/api/provider/profile'], ['GET', '/api/provider/working-hours'], ['GET', '/api/provider/offerings'],
      ['GET', '/api/provider/appointments'],
    ];
    const ownerOnly = [
      ['GET', '/api/owner/pets'], ['GET', '/api/owner/appointments'], ['GET', '/api/search?q=a'],
      ['GET', `/api/providers/${provider.id}`],
    ];
    for (const [method, path] of providerOnly) {
      const response = await h.request(method, path, { session: owner });
      assert.notEqual(response.status, 200, `${method} ${path} must not work for an owner`);
      assert.deepEqual(response.body, { code: 'NOT_FOUND' }, path);
    }
    for (const [method, path] of ownerOnly) {
      const response = await h.request(method, path, { session: provider });
      assert.notEqual(response.status, 200, `${method} ${path} must not work for a provider`);
      assert.deepEqual(response.body, { code: 'NOT_FOUND' }, path);
    }
    const publish = await h.request('POST', '/api/provider/services', { session: owner, body: { name: 'x', priceCop: 1000, species: 'dog', modality: 'clinic' } });
    assert.equal(publish.status, 404);
    const book = await h.request('POST', '/api/owner/appointments', { session: provider, body: {} });
    assert.equal(book.status, 404);
  });

  test('TEST-ID-023 AC-077: the same email as owner and provider reaches the interface of the chosen type', async () => {
    const email = uniqueEmail('both');
    const owner = await h.signUpOwner({ email, password: 'owner-password-1' });
    const provider = await h.signUpProvider('independent', { email, password: 'provider-password-1' });
    assert.notEqual(owner.id, provider.id);

    const asOwner = await h.signIn(email, 'owner-password-1', 'owner');
    const asProvider = await h.signIn(email, 'provider-password-1', 'provider');
    assert.equal((await h.request('GET', '/api/session', { session: asOwner })).body.accountType, 'owner');
    assert.equal((await h.request('GET', '/api/session', { session: asProvider })).body.accountType, 'provider');
    // each password only opens its own account
    assert.equal((await h.signIn(email, 'provider-password-1', 'owner')).response.status, 401);
    assert.equal((await h.signIn(email, 'owner-password-1', 'provider')).response.status, 401);
  });

  test('TEST-ID-025 AC-010: e-mail addresses are matched case-insensitively and ignoring surrounding spaces at sign-in', async () => {
    const owner = await h.signUpOwner({ email: uniqueEmail('MixedCase').toUpperCase() });
    for (const variant of [owner.email, owner.email.toLowerCase(), `  ${owner.email.toLowerCase()} `]) {
      const attempt = await h.signIn(variant, owner.password, 'owner');
      assert.equal(attempt.response.status, 200, JSON.stringify(variant));
    }
  });

  test('TEST-ID-024 AC-012: sign-in validates its input (missing and malformed fields are VALIDATION_FAILED)', async () => {
    const empty = await h.request('POST', '/api/auth/sign-in', { body: {} });
    assert.equal(empty.status, 422);
    for (const field of ['email', 'password', 'accountType']) assert.ok(hasField(empty, field, 'REQUIRED'), field);
    const bad = await h.request('POST', '/api/auth/sign-in', { body: { email: 'x@y.co', password: PASSWORD, accountType: 'admin' } });
    assert.equal(bad.status, 422);
    assert.ok(hasField(bad, 'accountType', 'NOT_ALLOWED'));
  });
});

describe('AC-114 session lifetime', { skip: SKIP }, () => {
  test('TEST-ID-030 AC-114: 60 minutes without activity requires a new sign-in, activity renews the idle window', async () => {
    h.clock.set('2026-10-12T15:00:00Z');
    const owner = await h.signUpOwner();
    const probe = () => h.request('GET', '/api/owner/pets', { session: owner });

    h.clock.set('2026-10-12T15:59:00Z'); // 59 minutes idle
    assert.equal((await probe()).status, 200);
    h.clock.set('2026-10-12T16:58:00Z'); // 59 minutes after the previous activity
    assert.equal((await probe()).status, 200, 'activity at 15:59 renewed the idle window');
    h.clock.set('2026-10-12T17:58:00Z'); // exactly 60 minutes after the last activity
    const expired = await probe();
    assert.equal(expired.status, 401);
    assert.deepEqual(expired.body, { code: 'SESSION_EXPIRED' });
    assert.equal((await h.request('GET', '/api/session', { session: owner })).body.state, 'expired');
  });

  test('TEST-ID-031 AC-114: 12 hours after sign-in the next action requires signing in again, however active the user was', async () => {
    h.clock.set('2026-10-12T15:00:00Z');
    const owner = await h.signUpOwner();
    const signedInAt = Date.parse('2026-10-12T15:00:00Z');
    for (let step = 1; step <= 14; step += 1) { // activity every 50 minutes, up to 11 h 40 min
      h.clock.set(new Date(signedInAt + step * 50 * 60_000));
      const response = await h.request('GET', '/api/owner/pets', { session: owner });
      assert.equal(response.status, 200, `activity ${step}`);
    }
    h.clock.set(new Date(signedInAt + 12 * 60 * 60_000 - 1_000)); // 1 s before 12 h, still within the idle window
    assert.equal((await h.request('GET', '/api/owner/pets', { session: owner })).status, 200);
    h.clock.set(new Date(signedInAt + 12 * 60 * 60_000)); // 12 h after sign-in
    const expired = await h.request('GET', '/api/owner/pets', { session: owner });
    assert.equal(expired.status, 401);
    assert.equal(expired.body.code, 'SESSION_EXPIRED');
    h.clock.set('2026-10-12T15:00:00Z');
  });

  test('TEST-ID-032 AC-114: signing in again after expiry yields a working session', async () => {
    h.clock.set('2026-10-12T15:00:00Z');
    const owner = await h.signUpOwner();
    h.clock.set('2026-10-12T17:00:00Z');
    assert.equal((await h.request('GET', '/api/owner/pets', { session: owner })).status, 401);
    const again = await h.signIn(owner.email, owner.password, 'owner');
    assert.equal(again.response.status, 200);
    assert.equal((await h.request('GET', '/api/owner/pets', { session: again })).status, 200);
    h.clock.set('2026-10-12T15:00:00Z');
  });
});

describe('US-034 sign-out', { skip: SKIP }, () => {
  test('TEST-ID-040 AC-112 AC-113: sign-out ends the session without confirmation and protected screens then require sign-in', async () => {
    const owner = await h.signUpOwner();
    assert.equal((await h.request('GET', '/api/owner/appointments', { session: owner })).status, 200);

    const out = await h.request('POST', '/api/auth/sign-out', { session: owner });
    assert.equal(out.status, 204);
    assert.match(out.headers.get('set-cookie'), /vetcare_session=;.*Max-Age=0/);

    for (const path of ['/api/owner/appointments', '/api/owner/pets', '/api/search?q=a']) {
      const after = await h.request('GET', path, { session: owner });
      assert.equal(after.status, 401, path);
      assert.deepEqual(after.body, { code: 'UNAUTHENTICATED' });
    }
    assert.equal((await h.request('GET', '/api/session', { session: owner })).body.state, 'none');
  });

  test('TEST-ID-041 AC-112: sign-out only ends the session of that cookie, and signing in again with another type works', async () => {
    const email = uniqueEmail('both');
    const owner = await h.signUpOwner({ email });
    const provider = await h.signUpProvider('independent', { email });
    const ownerSessionA = await h.signIn(email, owner.password, 'owner');
    const ownerSessionB = await h.signIn(email, owner.password, 'owner');

    assert.equal((await h.request('POST', '/api/auth/sign-out', { session: ownerSessionA })).status, 204);
    assert.equal((await h.request('GET', '/api/owner/pets', { session: ownerSessionA })).status, 401);
    assert.equal((await h.request('GET', '/api/owner/pets', { session: ownerSessionB })).status, 200, 'other device unaffected');

    const asProvider = await h.signIn(email, provider.password, 'provider');
    assert.equal((await h.request('GET', '/api/provider/profile', { session: asProvider })).status, 200);
  });

  test('TEST-ID-042 AC-112 EDGE-031: signing out is idempotent and works without or with a stale cookie', async () => {
    assert.equal((await h.request('POST', '/api/auth/sign-out')).status, 204);
    assert.equal((await h.request('POST', '/api/auth/sign-out', { session: { cookie: 'vetcare_session=not-a-real-token' } })).status, 204);
    const owner = await h.signUpOwner();
    assert.equal((await h.request('POST', '/api/auth/sign-out', { session: owner })).status, 204);
    assert.equal((await h.request('POST', '/api/auth/sign-out', { session: owner })).status, 204);
  });

  test('TEST-ID-043 AC-113: a copied cookie of a signed-out session is useless even for provider functions', async () => {
    const provider = await h.signUpProvider('clinic');
    const copy = { cookie: provider.cookie };
    await h.request('POST', '/api/auth/sign-out', { session: provider });
    const response = await h.request('PUT', '/api/provider/profile', {
      session: copy, body: { publicName: 'Hijacked', contactPhone: '300', contactEmail: 'a@b.co', address: 'x' },
    });
    assert.equal(response.status, 401);
    const stored = await h.admin.query('SELECT public_name FROM provider_profile WHERE provider_id = $1', [provider.id]);
    assert.notEqual(stored.rows[0].public_name, 'Hijacked');
  });
});
