// P07.1 — Provider profile, working hours, catalog and owner discovery
// (US-008, US-009, US-010, US-013, US-016, US-017, US-018), black-box over HTTP with the real
// application and PostgreSQL. Expected behavior comes from REQUIREMENTS_V3.md.
//
// Test ids: TEST-PC-nnn. Each test names the acceptance criteria it verifies.
import { after, before, describe, test } from 'node:test';
import assert from 'node:assert/strict';
import { createHarness, SKIP, weekOf } from '../support/harness.js';

let h;
let owner;
before(async () => {
  if (SKIP) return;
  h = await createHarness();
  owner = await h.signUpOwner();
});
after(async () => { if (h) await h.close(); });

const hasField = (response, field, reason) =>
  (response.body.fields ?? []).some((entry) => entry.field === field && (reason === undefined || entry.reason === reason));
const profileUpdate = (overrides = {}) => ({
  publicName: 'Clínica Central', contactPhone: '+57 300 123 4567', contactEmail: 'contacto@clinica.test',
  address: 'Carrera 7 # 10-20', ...overrides,
});

describe('US-008 provider public profile', { skip: SKIP }, () => {
  test('TEST-PC-001 AC-023 AC-044: saved name, phone, email and address appear on the public profile the owner sees', async () => {
    const clinic = await h.signUpProvider('clinic');
    const saved = await h.request('PUT', '/api/provider/profile', { session: clinic, body: profileUpdate() });
    assert.equal(saved.status, 200);

    const view = await h.request('GET', `/api/providers/${clinic.id}`, { session: owner });
    assert.equal(view.status, 200);
    assert.equal(view.body.name, 'Clínica Central');
    assert.equal(view.body.type, 'clinic');
    assert.equal(view.body.contactPhone, '+57 300 123 4567');
    assert.equal(view.body.contactEmail, 'contacto@clinica.test');
    assert.equal(view.body.address, 'Carrera 7 # 10-20');
  });

  test('TEST-PC-002 AC-024 AC-045: an independent veterinarian without address saves and is shown without one; adding it later shows it', async () => {
    const vet = await h.signUpProvider('independent');
    const saved = await h.request('PUT', '/api/provider/profile', { session: vet, body: profileUpdate({ publicName: 'Dr. Norte', address: undefined }) });
    assert.equal(saved.status, 200);
    assert.equal(saved.body.address, null);

    const without = await h.request('GET', `/api/providers/${vet.id}`, { session: owner });
    assert.equal(without.status, 200);
    assert.equal('address' in without.body, false, 'no address key, no empty placeholder');

    await h.request('PUT', '/api/provider/profile', { session: vet, body: profileUpdate({ publicName: 'Dr. Norte', address: 'Avenida 6N # 20-10' }) });
    const withAddress = await h.request('GET', `/api/providers/${vet.id}`, { session: owner });
    assert.equal(withAddress.body.address, 'Avenida 6N # 20-10');
  });

  test('TEST-PC-003 AC-106: a clinic can change its address but cannot remove it; the failed save changes nothing', async () => {
    const clinic = await h.signUpProvider('clinic');
    await h.request('PUT', '/api/provider/profile', { session: clinic, body: profileUpdate({ address: 'Calle 1 # 1-1' }) });

    for (const address of [undefined, null, '', '   ']) {
      const response = await h.request('PUT', '/api/provider/profile', { session: clinic, body: profileUpdate({ publicName: 'Changed', address }) });
      assert.equal(response.status, 422, JSON.stringify(address));
      assert.ok(hasField(response, 'address', 'REQUIRED'));
    }
    const kept = await h.request('GET', '/api/provider/profile', { session: clinic });
    assert.equal(kept.body.address, 'Calle 1 # 1-1');
    assert.equal(kept.body.publicName, 'Clínica Central', 'name unchanged by the rejected saves');

    const changed = await h.request('PUT', '/api/provider/profile', { session: clinic, body: profileUpdate({ address: 'Calle 2 # 2-2' }) });
    assert.equal(changed.status, 200);
    assert.equal(changed.body.address, 'Calle 2 # 2-2');
  });

  test('TEST-PC-004 AC-023: required name, phone and email are enforced and phone characters are validated', async () => {
    const clinic = await h.signUpProvider('clinic');
    for (const field of ['publicName', 'contactPhone', 'contactEmail']) {
      const response = await h.request('PUT', '/api/provider/profile', { session: clinic, body: profileUpdate({ [field]: '' }) });
      assert.equal(response.status, 422, field);
      assert.ok(hasField(response, field, 'REQUIRED'), field);
    }
    const letters = await h.request('PUT', '/api/provider/profile', { session: clinic, body: profileUpdate({ contactPhone: '300-ABC' }) });
    assert.equal(letters.status, 422);
    assert.ok(hasField(letters, 'contactPhone'));
    const badEmail = await h.request('PUT', '/api/provider/profile', { session: clinic, body: profileUpdate({ contactEmail: 'not-an-email' }) });
    assert.equal(badEmail.status, 422);
  });

  test('TEST-PC-005 AC-023: a provider edits only its own profile (other providers are unaffected)', async () => {
    const first = await h.signUpProvider('clinic');
    const second = await h.signUpProvider('clinic');
    await h.request('PUT', '/api/provider/profile', { session: first, body: profileUpdate({ publicName: 'Solo Primera' }) });
    const other = await h.request('GET', '/api/provider/profile', { session: second });
    assert.notEqual(other.body.publicName, 'Solo Primera');
    // a body that tries to address another account is rejected as unknown input
    const smuggle = await h.request('PUT', '/api/provider/profile', { session: first, body: { ...profileUpdate(), providerId: second.id } });
    assert.equal(smuggle.status, 422);
    assert.ok(hasField(smuggle, 'providerId', 'NOT_ALLOWED'));
  });
});

describe('US-009 working days and hours', { skip: SKIP }, () => {
  test('TEST-PC-010 AC-025: hours can differ per day and are returned exactly as saved', async () => {
    const vet = await h.signUpProvider('independent');
    const initial = await h.request('GET', '/api/provider/working-hours', { session: vet });
    assert.equal(initial.status, 200);
    assert.ok(initial.body.days.every((day) => day.works === false), 'a new provider has no working days');

    const week = weekOf({ 1: [8, 12], 3: [14, 20], 6: [9, 11] });
    const saved = await h.request('PUT', '/api/provider/working-hours', { session: vet, body: week });
    assert.equal(saved.status, 200);
    assert.deepEqual(saved.body, week);
    assert.deepEqual((await h.request('GET', '/api/provider/working-hours', { session: vet })).body, week);
  });

  test('TEST-PC-011 AC-080: a start or end that is not on the hour is rejected and the time is indicated', async () => {
    const vet = await h.signUpProvider('independent');
    const good = weekOf({ 1: [8, 12] });
    await h.request('PUT', '/api/provider/working-hours', { session: vet, body: good });

    for (const [startHour, endHour, field] of [[8.5, 12, 'days.0.startHour'], [8, 12.25, 'days.0.endHour']]) {
      const body = weekOf({ 1: [startHour, endHour] });
      const response = await h.request('PUT', '/api/provider/working-hours', { session: vet, body });
      assert.equal(response.status, 422);
      assert.ok(hasField(response, field, 'NOT_ON_THE_HOUR'), JSON.stringify(response.body));
    }
    assert.deepEqual((await h.request('GET', '/api/provider/working-hours', { session: vet })).body, good, 'nothing was saved');
  });

  test('TEST-PC-012 AC-025: invalid ranges are rejected (end not after start, outside 0-24, wrong number of days)', async () => {
    const vet = await h.signUpProvider('independent');
    for (const [label, body] of [
      ['end equals start', weekOf({ 1: [9, 9] })],
      ['end before start', weekOf({ 1: [10, 9] })],
      ['start 24', weekOf({ 1: [24, 24] })],
      ['negative start', weekOf({ 1: [-1, 5] })],
      ['end 25', weekOf({ 1: [8, 25] })],
      ['only six days', { days: weekOf({}).days.slice(0, 6) }],
    ]) {
      const response = await h.request('PUT', '/api/provider/working-hours', { session: vet, body });
      assert.equal(response.status, 422, label);
    }
    const midnight = await h.request('PUT', '/api/provider/working-hours', { session: vet, body: weekOf({ 1: [0, 24] }) });
    assert.equal(midnight.status, 200, 'the whole day 0-24 is valid');
  });
});

describe('US-010 / US-013 publishing', { skip: SKIP }, () => {
  test('TEST-PC-020 AC-027 AC-033: a published service and product appear in the provider catalog, on its profile and in search', async () => {
    const clinic = await h.setupProvider('clinic', { name: 'Clínica Publica' });
    const service = await h.publishService(clinic, { name: 'Vacunación antirrábica', priceCop: 45000, species: 'cat', modality: 'both' });
    const product = await h.publishProduct(clinic, { name: 'Collar antipulgas', priceCop: 32000, species: 'cat' });

    const catalog = await h.request('GET', '/api/provider/offerings', { session: clinic });
    assert.deepEqual(catalog.body.services.map((s) => s.id), [service.id]);
    assert.deepEqual(catalog.body.products.map((p) => p.id), [product.id]);

    const profile = await h.request('GET', `/api/providers/${clinic.id}`, { session: owner });
    assert.deepEqual(profile.body.services.map((s) => [s.name, s.priceCop]), [['Vacunación antirrábica', 45000]]);
    assert.deepEqual(profile.body.products.map((p) => [p.name, p.priceCop]), [['Collar antipulgas', 32000]]);

    const found = await h.request('GET', '/api/search?q=antirr%C3%A1bica', { session: owner });
    assert.deepEqual(found.body.results.map((r) => r.id), [service.id]);
    const foundProduct = await h.request('GET', '/api/search?q=collar', { session: owner });
    assert.deepEqual(foundProduct.body.results.map((r) => r.id), [product.id]);
  });

  test('TEST-PC-021 AC-028 AC-034: a service or product without exactly one species is not published and the species is indicated', async () => {
    const clinic = await h.setupProvider('clinic');
    for (const [path, base] of [
      ['/api/provider/services', { name: 'S', priceCop: 1000, modality: 'clinic' }],
      ['/api/provider/products', { name: 'P', priceCop: 1000 }],
    ]) {
      for (const species of [undefined, '', ['dog', 'cat'], 'both', 'dog,cat']) {
        const response = await h.request('POST', path, { session: clinic, body: { ...base, ...(species === undefined ? {} : { species }) } });
        assert.equal(response.status, 422, `${path} ${JSON.stringify(species)}`);
        assert.ok(hasField(response, 'species'), `${path} ${JSON.stringify(species)}`);
      }
    }
    const catalog = await h.request('GET', '/api/provider/offerings', { session: clinic });
    assert.deepEqual(catalog.body, { services: [], products: [] }, 'nothing was published');
  });

  test('TEST-PC-022 AC-029: a service without modality (or with an unknown one) is not published', async () => {
    const clinic = await h.setupProvider('clinic');
    const missing = await h.request('POST', '/api/provider/services', { session: clinic, body: { name: 'S', priceCop: 1000, species: 'dog' } });
    assert.equal(missing.status, 422);
    assert.ok(hasField(missing, 'modality', 'REQUIRED'));
    const unknown = await h.request('POST', '/api/provider/services', { session: clinic, body: { name: 'S', priceCop: 1000, species: 'dog', modality: 'teleconsulta' } });
    assert.equal(unknown.status, 422);
    for (const modality of ['clinic', 'home', 'both']) {
      const ok = await h.request('POST', '/api/provider/services', { session: clinic, body: { name: `S ${modality}`, priceCop: 1000, species: 'dog', modality } });
      assert.equal(ok.status, 201, modality);
      assert.equal(ok.body.modality, modality);
    }
  });

  test('TEST-PC-023 AC-082 AC-084: a service or product without a price is not published and the price is indicated', async () => {
    const clinic = await h.setupProvider('clinic');
    for (const [path, base] of [
      ['/api/provider/services', { name: 'S', species: 'dog', modality: 'clinic' }],
      ['/api/provider/products', { name: 'P', species: 'dog' }],
    ]) {
      for (const priceCop of [undefined, null, '', 0, -5, 12.5, '5000']) {
        const body = { ...base };
        if (priceCop !== undefined) body.priceCop = priceCop;
        const response = await h.request('POST', path, { session: clinic, body });
        assert.equal(response.status, 422, `${path} ${JSON.stringify(priceCop)}`);
        assert.ok(hasField(response, 'priceCop'), `${path} ${JSON.stringify(priceCop)}`);
      }
      const missing = await h.request('POST', path, { session: clinic, body: base });
      assert.ok(hasField(missing, 'priceCop', 'REQUIRED'));
    }
  });

  test('TEST-PC-024 AC-107: an independent veterinarian offers services only at the owner\'s home', async () => {
    const vet = await h.setupProvider('independent');
    for (const modality of ['clinic', 'both']) {
      const response = await h.request('POST', '/api/provider/services', { session: vet, body: { name: 'S', priceCop: 1000, species: 'dog', modality } });
      assert.equal(response.status, 422, modality);
      assert.ok(hasField(response, 'modality', 'NOT_ALLOWED'));
    }
    const implicit = await h.request('POST', '/api/provider/services', { session: vet, body: { name: 'Sin modalidad', priceCop: 1000, species: 'dog' } });
    assert.equal(implicit.status, 201);
    assert.equal(implicit.body.modality, 'home');
    const explicit = await h.request('POST', '/api/provider/services', { session: vet, body: { name: 'Domicilio', priceCop: 1000, species: 'dog', modality: 'home' } });
    assert.equal(explicit.status, 201);
  });

  test('TEST-PC-025 AC-111: a new product is published as available', async () => {
    const clinic = await h.setupProvider('clinic');
    const product = await h.publishProduct(clinic);
    assert.equal(product.available, true);
  });
});

describe('US-016 / US-017 / US-018 owner discovery', { skip: SKIP }, () => {
  let clinic;
  let vet;
  let otherClinic;
  before(async () => {
    if (SKIP) return;
    clinic = await h.setupProvider('clinic', { name: 'Clínica Búsqueda' });
    vet = await h.setupProvider('independent', { name: 'Vet Búsqueda' });
    otherClinic = await h.setupProvider('clinic', { name: 'Otra Clínica' });
    await h.publishService(clinic, { name: 'Baño medicado perro', species: 'dog', modality: 'clinic', priceCop: 50000 });
    await h.publishService(clinic, { name: 'Baño medicado gato', species: 'cat', modality: 'both', priceCop: 55000 });
    await h.publishService(vet, { name: 'Baño a domicilio perro', species: 'dog', priceCop: 70000 });
    await h.publishProduct(otherClinic, { name: 'Shampoo medicado perro', species: 'dog', priceCop: 25000 });
    await h.publishProduct(otherClinic, { name: 'Shampoo medicado gato', species: 'cat', priceCop: 26000 });
    await h.publishService(otherClinic, { name: 'Radiografía', species: 'dog', modality: 'clinic', priceCop: 120000 });
  });

  test('TEST-PC-030 AC-038 AC-039: search returns matching offerings of all providers with price, provider type and modality', async () => {
    const response = await h.request('GET', '/api/search?q=medicado', { session: owner });
    assert.equal(response.status, 200);
    const names = response.body.results.map((r) => r.name).sort();
    assert.deepEqual(names, ['Baño medicado gato', 'Baño medicado perro', 'Shampoo medicado gato', 'Shampoo medicado perro']);
    for (const result of response.body.results) {
      assert.equal(typeof result.priceCop, 'number');
      assert.ok(['clinic', 'independent'].includes(result.provider.type));
      if (result.kind === 'service') assert.ok(['clinic', 'home', 'both'].includes(result.modality));
      else assert.equal(typeof result.available, 'boolean');
    }
    const bath = await h.request('GET', '/api/search?q=ba%C3%B1o', { session: owner });
    assert.deepEqual(new Set(bath.body.results.map((r) => r.provider.type)), new Set(['clinic', 'independent']));
  });

  test('TEST-PC-031 AC-040: a search without matches returns an empty list (not an error)', async () => {
    const response = await h.request('GET', '/api/search?q=zzzz-nada', { session: owner });
    assert.equal(response.status, 200);
    assert.deepEqual(response.body, { results: [] });
  });

  test('TEST-PC-032 FR-017 (US-016): search text is required, trimmed and bounded', async () => {
    for (const query of ['', '%20%20', undefined]) {
      const response = await h.request('GET', `/api/search${query === undefined ? '' : `?q=${query}`}`, { session: owner });
      assert.equal(response.status, 422, String(query));
      assert.ok(hasField(response, 'q', 'REQUIRED'));
    }
    const long = await h.request('GET', `/api/search?q=${'a'.repeat(121)}`, { session: owner });
    assert.equal(long.status, 422);
    assert.ok(hasField(long, 'q', 'TOO_LONG'));
    const edge = await h.request('GET', `/api/search?q=${'a'.repeat(120)}`, { session: owner });
    assert.equal(edge.status, 200);
  });

  test('TEST-PC-033 AC-041 AC-043: the species filter keeps only that species and removing it brings both back', async () => {
    const dog = await h.request('GET', '/api/search?q=medicado&species=dog', { session: owner });
    assert.ok(dog.body.results.length > 0 && dog.body.results.every((r) => r.species === 'dog'));
    const cat = await h.request('GET', '/api/search?q=medicado&species=cat', { session: owner });
    assert.ok(cat.body.results.length > 0 && cat.body.results.every((r) => r.species === 'cat'));

    const all = await h.request('GET', '/api/search?q=medicado', { session: owner });
    const explicitAll = await h.request('GET', '/api/search?q=medicado&species=all', { session: owner });
    assert.equal(all.body.results.length, dog.body.results.length + cat.body.results.length);
    assert.deepEqual(explicitAll.body, all.body);
  });

  test('TEST-PC-034 AC-042 BR-008: filtering by a species the owner has no pet of still shows those offerings', async () => {
    const dogOwner = await h.signUpOwner(); // owns only a dog
    const cat = await h.request('GET', '/api/search?q=medicado&species=cat', { session: dogOwner });
    assert.equal(cat.status, 200);
    assert.ok(cat.body.results.length >= 2, 'cat offerings are shown to an owner with no cat');
  });

  test('TEST-PC-035 AC-086: text and species must both match', async () => {
    const response = await h.request('GET', '/api/search?q=shampoo&species=cat', { session: owner });
    assert.deepEqual(response.body.results.map((r) => r.name), ['Shampoo medicado gato']);
    const none = await h.request('GET', '/api/search?q=radiograf%C3%ADa&species=cat', { session: owner });
    assert.deepEqual(none.body.results, []);
    const invalid = await h.request('GET', '/api/search?q=baño&species=bird', { session: owner });
    assert.equal(invalid.status, 422);
    assert.ok(hasField(invalid, 'species', 'NOT_ALLOWED'));
  });

  test('TEST-PC-036 AC-038: search is case- and accent-insensitive and treats LIKE wildcards literally', async () => {
    const upper = await h.request('GET', '/api/search?q=RADIOGRAFIA', { session: owner });
    assert.deepEqual(upper.body.results.map((r) => r.name), ['Radiografía']);
    const wildcard = await h.request('GET', '/api/search?q=%25', { session: owner });
    assert.deepEqual(wildcard.body.results, [], '% is searched literally, not as "match everything"');
    const underscore = await h.request('GET', '/api/search?q=_', { session: owner });
    assert.deepEqual(underscore.body.results, []);
  });

  test('TEST-PC-037 AC-044: each public profile lists only its own offerings, with provider type and contact data', async () => {
    const view = await h.request('GET', `/api/providers/${clinic.id}`, { session: owner });
    assert.equal(view.status, 200);
    assert.equal(view.body.type, 'clinic');
    assert.deepEqual(view.body.services.map((s) => s.name).sort(), ['Baño medicado gato', 'Baño medicado perro']);
    assert.deepEqual(view.body.products, []);
    assert.ok(view.body.address);
    assert.ok(view.body.contactEmail);
  });

  test('TEST-PC-038 AC-044: unknown, malformed and non-provider identifiers are NOT_FOUND', async () => {
    for (const id of ['00000000-0000-4000-8000-000000000000', 'not-a-uuid', owner.id]) {
      const response = await h.request('GET', `/api/providers/${id}`, { session: owner });
      assert.equal(response.status, 404, id);
      assert.deepEqual(response.body, { code: 'NOT_FOUND' });
    }
  });
});
