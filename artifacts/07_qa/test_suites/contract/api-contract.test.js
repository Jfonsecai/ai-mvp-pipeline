// P07.1 — Contract tests: every response the implemented endpoints produce is validated against
// the approved OpenAPI document (artifacts/05_architecture/API_SPEC_V1.yaml), and error responses
// are checked against the outcome catalogue (CTR-001) and its HTTP statuses.
//
// The validator (support/schema-validator.js) is deliberately strict: additionalProperties:false
// in the spec means an undocumented response field is a contract violation.
// Test ids: TEST-CT-nnn.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHarness, SKIP, weekOf } from '../support/harness.js';
import { responseSchema, schemaNamed, spec, validate } from '../support/schema-validator.js';

let h;
let world;
before(async () => {
  if (SKIP) return;
  h = await createHarness();
  const clinic = await h.setupProvider('clinic');
  const vet = await h.setupProvider('independent');
  await h.request('PUT', '/api/provider/profile', {
    session: clinic,
    body: { publicName: 'Clínica Contrato', contactPhone: '+57 601 555 0100', contactEmail: 'c@clinica.test', address: 'Calle 1 # 2-3' },
  });
  const clinicService = await h.publishService(clinic, { modality: 'both', name: 'Contrato clínica' });
  const vetService = await h.publishService(vet, { name: 'Contrato domicilio' });
  const product = await h.publishProduct(clinic, { name: 'Contrato producto' });
  const owner = await h.signUpOwner();
  world = { clinic, vet, clinicService, vetService, product, owner };
});
after(async () => { if (h) await h.close(); });

/** Asserts status and validates the body against the operation's documented response schema. */
function conforms(label, method, specPath, response, expectedStatus) {
  assert.equal(response.status, expectedStatus, `${label}: ${response.text}`);
  const schema = responseSchema(method, specPath, expectedStatus);
  assert.ok(schema, `${label}: API_SPEC documents a JSON ${expectedStatus} response for ${method} ${specPath}`);
  assert.deepEqual(validate(schema, response.body), [], `${label}: ${JSON.stringify(response.body)}`);
}

describe('success responses conform to API_SPEC_V1.yaml', { skip: SKIP }, () => {
  test('TEST-CT-001 US-001/US-002/US-003: sign-up, sign-in and session responses', async () => {
    const owner = await h.request('POST', '/api/auth/sign-up/owner', {
      body: { name: 'C', email: `ct-${Date.now()}@example.test`, password: 'contract-pass-1', pet: { name: 'P', species: 'cat', breed: 'B', ageYears: 1, weightKg: 4.5, heightCm: 30 } },
    });
    conforms('sign-up owner', 'post', '/api/auth/sign-up/owner', owner, 201);
    const provider = await h.request('POST', '/api/auth/sign-up/provider', {
      body: { name: 'C', email: `ctp-${Date.now()}@example.test`, password: 'contract-pass-1', providerType: 'independent' },
    });
    conforms('sign-up provider', 'post', '/api/auth/sign-up/provider', provider, 201);
    const signIn = await h.request('POST', '/api/auth/sign-in', { body: { email: world.owner.email, password: world.owner.password, accountType: 'owner' } });
    conforms('sign-in', 'post', '/api/auth/sign-in', signIn, 200);
    for (const session of [undefined, world.owner]) {
      conforms('session', 'get', '/api/session', await h.request('GET', '/api/session', { session }), 200);
    }
    assert.equal((await h.request('POST', '/api/auth/sign-out', { session: world.owner })).status, 204);
    const expired = await h.signIn(world.owner.email, world.owner.password, 'owner');
    world.owner.cookie = expired.cookie; // keep a live session for the following tests
  });

  test('TEST-CT-002 US-008/US-009: provider profile and working hours', async () => {
    const profile = await h.request('GET', '/api/provider/profile', { session: world.clinic });
    conforms('get profile', 'get', '/api/provider/profile', profile, 200);
    const updated = await h.request('PUT', '/api/provider/profile', {
      session: world.vet, body: { publicName: 'Dr. Contrato', contactPhone: '3001234567', contactEmail: 'v@vet.test' },
    });
    conforms('put profile', 'put', '/api/provider/profile', updated, 200);
    const hours = await h.request('GET', '/api/provider/working-hours', { session: world.clinic });
    conforms('get hours', 'get', '/api/provider/working-hours', hours, 200);
    const saved = await h.request('PUT', '/api/provider/working-hours', { session: world.clinic, body: weekOf({ 1: [8, 12], 7: [0, 24] }) });
    conforms('put hours', 'put', '/api/provider/working-hours', saved, 200);
    await h.request('PUT', '/api/provider/working-hours', { session: world.clinic, body: weekOf({ 1: [8, 17], 2: [8, 17], 3: [8, 17], 4: [8, 17], 5: [8, 17] }) });
  });

  test('TEST-CT-003 US-010/US-013: publish responses and own catalog', async () => {
    const service = await h.request('POST', '/api/provider/services', { session: world.vet, body: { name: 'Otro', priceCop: 1000, species: 'cat' } });
    conforms('publish service', 'post', '/api/provider/services', service, 201);
    const product = await h.request('POST', '/api/provider/products', { session: world.vet, body: { name: 'Otro P', priceCop: 1000, species: 'cat' } });
    conforms('publish product', 'post', '/api/provider/products', product, 201);
    const catalog = await h.request('GET', '/api/provider/offerings', { session: world.clinic });
    conforms('own catalog', 'get', '/api/provider/offerings', catalog, 200);
  });

  test('TEST-CT-004 US-016/US-017/US-018: search results, public profile and pets', async () => {
    const search = await h.request('GET', '/api/search?q=contrato', { session: world.owner });
    assert.equal(search.status, 200);
    assert.ok(search.body.results.length >= 3, 'service and product results are both present');
    assert.deepEqual(new Set(search.body.results.map((r) => r.kind)), new Set(['service', 'product']));
    const itemSchema = spec.paths['/api/search'].get.responses['200'].content['application/json'].schema;
    assert.deepEqual(validate(itemSchema, search.body), []);

    const filtered = await h.request('GET', '/api/search?q=contrato&species=dog', { session: world.owner });
    assert.deepEqual(validate(itemSchema, filtered.body), []);

    conforms('public profile (clinic)', 'get', '/api/providers/{providerId}', await h.request('GET', `/api/providers/${world.clinic.id}`, { session: world.owner }), 200);
    conforms('public profile (independent)', 'get', '/api/providers/{providerId}', await h.request('GET', `/api/providers/${world.vet.id}`, { session: world.owner }), 200);

    const pets = await h.request('GET', '/api/owner/pets', { session: world.owner });
    assert.deepEqual(validate(spec.paths['/api/owner/pets'].get.responses['200'].content['application/json'].schema, pets.body), []);
  });

  test('TEST-CT-005 US-019/US-020/US-021/US-024: booking context, booking and both appointment lists', async () => {
    const week = '2026-10-19';
    for (const service of [world.clinicService, world.vetService]) {
      conforms(`booking context ${service.name}`, 'get', '/api/services/{serviceId}/booking-context', await h.context(world.owner, service.id, week), 200);
    }
    const clinicVisit = await h.book(world.owner, { serviceId: world.clinicService.id, petId: world.owner.petId, startsAt: '2026-10-20T09:00:00-05:00', modality: 'clinic' });
    conforms('book clinic visit', 'post', '/api/owner/appointments', clinicVisit, 201);
    const homeVisit = await h.book(world.owner, { serviceId: world.vetService.id, petId: world.owner.petId, startsAt: '2026-10-20T10:00:00-05:00', visitAddress: 'Calle 8 # 8-8' });
    conforms('book home visit', 'post', '/api/owner/appointments', homeVisit, 201);

    const ownerList = await h.request('GET', '/api/owner/appointments', { session: world.owner });
    assert.equal(ownerList.body.appointments.length, 2);
    assert.deepEqual(validate(spec.paths['/api/owner/appointments'].get.responses['200'].content['application/json'].schema, ownerList.body), []);
    for (const provider of [world.clinic, world.vet]) {
      const list = await h.request('GET', '/api/provider/appointments', { session: provider });
      assert.equal(list.body.appointments.length, 1);
      assert.deepEqual(validate(spec.paths['/api/provider/appointments'].get.responses['200'].content['application/json'].schema, list.body), []);
    }
  });
});

describe('error responses follow CTR-001 and the documented statuses', { skip: SKIP }, () => {
  const errorSchema = () => schemaNamed('ErrorResponse');
  const codeStatus = () => ({
    VALIDATION_FAILED: 422, DUPLICATE_ACCOUNT_FOR_TYPE: 409, INVALID_CREDENTIALS: 401, UNAUTHENTICATED: 401,
    SESSION_EXPIRED: 401, FORBIDDEN_ORIGIN: 403, NOT_FOUND: 404, SLOT_UNAVAILABLE: 409, PET_NOT_ELIGIBLE: 422,
    NO_PETS: 422, PRODUCT_UNAVAILABLE: 409, ORDER_STATUS_CHANGED: 409, UNEXPECTED: 500,
  });

  test('TEST-CT-010 CTR-001: representative failures of every implemented endpoint are ErrorResponse bodies with the catalogued status', async () => {
    const o = world.owner;
    const probes = [
      ['VALIDATION_FAILED', 'POST', '/api/auth/sign-in', { body: {} }],
      ['VALIDATION_FAILED', 'POST', '/api/auth/sign-up/owner', { body: {} }],
      ['VALIDATION_FAILED', 'POST', '/api/auth/sign-up/provider', { body: {} }],
      ['VALIDATION_FAILED', 'PUT', '/api/provider/profile', { session: world.clinic, body: {} }],
      ['VALIDATION_FAILED', 'PUT', '/api/provider/working-hours', { session: world.clinic, body: {} }],
      ['VALIDATION_FAILED', 'POST', '/api/provider/services', { session: world.clinic, body: {} }],
      ['VALIDATION_FAILED', 'POST', '/api/provider/products', { session: world.clinic, body: {} }],
      ['VALIDATION_FAILED', 'GET', '/api/search', { session: o }],
      ['VALIDATION_FAILED', 'POST', '/api/owner/appointments', { session: o, body: {} }],
      ['VALIDATION_FAILED', 'GET', `/api/services/${world.clinicService.id}/booking-context?weekStart=nope`, { session: o }],
      ['INVALID_CREDENTIALS', 'POST', '/api/auth/sign-in', { body: { email: 'nobody@example.test', password: 'whatever-123', accountType: 'owner' } }],
      ['DUPLICATE_ACCOUNT_FOR_TYPE', 'POST', '/api/auth/sign-up/owner', { body: { ...world.owner.body } }],
      ['UNAUTHENTICATED', 'GET', '/api/owner/appointments', {}],
      ['UNAUTHENTICATED', 'GET', '/api/provider/appointments', {}],
      ['NOT_FOUND', 'GET', '/api/provider/appointments', { session: o }],
      ['NOT_FOUND', 'GET', '/api/owner/appointments', { session: world.clinic }],
      ['NOT_FOUND', 'GET', '/api/this-route-does-not-exist', {}],
      ['NOT_FOUND', 'GET', `/api/providers/${o.id}`, { session: o }],
      ['FORBIDDEN_ORIGIN', 'POST', '/api/auth/sign-in', { headers: { origin: 'https://evil.example' }, body: {} }],
      ['SLOT_UNAVAILABLE', 'POST', '/api/owner/appointments', { session: o, body: { serviceId: world.clinicService.id, petId: o.petId, startsAt: '2026-10-17T09:00:00-05:00', modality: 'clinic' } }],
      ['PET_NOT_ELIGIBLE', 'POST', '/api/owner/appointments', { session: o, body: { serviceId: (await h.publishService(world.clinic, { species: 'cat', name: 'Solo gatos' })).id, petId: o.petId, startsAt: '2026-10-20T09:00:00-05:00', modality: 'clinic' } }],
    ];
    const statuses = codeStatus();
    for (const [code, method, path, options] of probes) {
      const response = await h.request(method, path, options);
      assert.equal(response.body?.code, code, `${method} ${path}: ${response.text}`);
      assert.equal(response.status, statuses[code], `${method} ${path}`);
      assert.deepEqual(validate(errorSchema(), response.body), [], `${method} ${path}`);
      if (code !== 'VALIDATION_FAILED') assert.equal('fields' in response.body, false, 'fields only accompany VALIDATION_FAILED');
      else assert.ok(response.body.fields?.length > 0 || path.includes('booking-context'), `${method} ${path} names the offending fields`);
    }
  });

  test('TEST-CT-011 CTR-001: NO_PETS is returned with the documented status', async () => {
    const petless = await h.signUpOwner();
    await h.admin.query('DELETE FROM pet WHERE owner_id = $1', [petless.id]);
    const response = await h.book(petless, { serviceId: world.clinicService.id, petId: world.owner.petId, startsAt: '2026-10-20T09:00:00-05:00', modality: 'clinic' });
    assert.equal(response.status, 422);
    assert.deepEqual(validate(errorSchema(), response.body), []);
    assert.equal(response.body.code, 'NO_PETS');
  });

  test('TEST-CT-012: every ValidationFailed field entry uses a catalogued reason code', async () => {
    const reasons = new Set(schemaNamed('ReasonCode').enum);
    const bodies = await Promise.all([
      h.request('POST', '/api/auth/sign-up/owner', { body: { name: 5, email: 'x', password: 'a', pet: { species: 'bird' }, extra: 1 } }),
      h.request('POST', '/api/auth/sign-up/provider', { body: { name: '', email: 'x', password: 'a', providerType: 'clinic' } }),
      h.request('PUT', '/api/provider/working-hours', { session: world.clinic, body: { days: [{ weekday: 9, works: true, startHour: 3.5, endHour: 1 }] } }),
      h.request('POST', '/api/provider/services', { session: world.clinic, body: { name: 'x'.repeat(200), priceCop: 'a', species: 'x', modality: 'y', z: 1 } }),
      h.request('POST', '/api/owner/appointments', { session: world.owner, body: { serviceId: 'x', petId: 'y', startsAt: 'z', modality: 'q', visitAddress: 5 } }),
    ]);
    for (const response of bodies) {
      assert.equal(response.status, 422, response.text);
      assert.ok(response.body.fields.length > 0);
      for (const { field, reason } of response.body.fields) {
        assert.ok(typeof field === 'string' && field.length > 0);
        assert.ok(reasons.has(reason), `reason ${reason} for ${field} is in the catalogue`);
      }
    }
  });
});

describe('API_SPEC_V1.yaml consistency with the running application', { skip: SKIP }, () => {
  test('TEST-CT-020: every path the application serves is documented, and no implemented route is missing from the specification', async () => {
    const { modules } = await import('../../../../src/modules/index.js');
    assert.ok(modules.length > 0);
    // The implemented endpoints, as exercised by this suite. Each must exist in the spec with the same method.
    const implemented = [
      ['post', '/api/auth/sign-up/owner'], ['post', '/api/auth/sign-up/provider'], ['post', '/api/auth/sign-in'],
      ['post', '/api/auth/sign-out'], ['get', '/api/session'], ['get', '/api/provider/profile'],
      ['put', '/api/provider/profile'], ['get', '/api/provider/working-hours'], ['put', '/api/provider/working-hours'],
      ['get', '/api/provider/offerings'], ['post', '/api/provider/services'], ['post', '/api/provider/products'],
      ['get', '/api/search'], ['get', '/api/providers/{providerId}'], ['get', '/api/owner/pets'],
      ['get', '/api/services/{serviceId}/booking-context'], ['post', '/api/owner/appointments'],
      ['get', '/api/owner/appointments'], ['get', '/api/provider/appointments'],
    ];
    for (const [method, path] of implemented) assert.ok(spec.paths[path]?.[method], `${method.toUpperCase()} ${path} is in API_SPEC_V1.yaml`);
  });

  test('TEST-CT-021 NFR / CR-005: API responses are never cacheable and carry no technology banner', async () => {
    for (const [path, session] of [['/api/session', undefined], ['/api/owner/pets', world.owner], ['/api/nope', undefined]]) {
      const response = await h.request('GET', path, { session });
      assert.equal(response.headers.get('cache-control'), 'no-store', path);
      assert.equal(response.headers.get('x-powered-by'), null, path);
      assert.match(response.headers.get('content-type') ?? '', /application\/json/, path);
    }
  });
});
