import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/application.js';
import { createCatalogRouter, validatePublishService } from '../src/modules/catalog/offerings.js';
import { fixedClock, fakeSessionDb, startApp, testConfig } from './helpers.js';

const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
const INDEPENDENT_ID = '22222222-2222-4222-8222-222222222222';
const OWNER_ID = '33333333-3333-4333-8333-333333333333';
const NOW = new Date('2026-10-12T12:00:00Z');

const clinicInput = {
  name: ' Consulta general ',
  priceCop: 50000,
  species: 'dog',
  modality: 'both',
};

function makeDb({ providerType = 'clinic', offerings = [] } = {}) {
  const sessions = fakeSessionDb({
    clinic: {
      account_id: CLINIC_ID,
      account_type: 'provider',
      last_seen_at: new Date('2026-10-12T11:55:00Z'),
      absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
      ended_at: null,
    },
    independent: {
      account_id: INDEPENDENT_ID,
      account_type: 'provider',
      last_seen_at: new Date('2026-10-12T11:55:00Z'),
      absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
      ended_at: null,
    },
    owner: {
      account_id: OWNER_ID,
      account_type: 'owner',
      last_seen_at: new Date('2026-10-12T11:55:00Z'),
      absolute_expires_at: new Date('2026-10-12T20:00:00Z'),
      ended_at: null,
    },
  });
  const state = { inserts: [], queries: [] };

  return {
    state,
    async query(text, params = []) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) {
        return sessions.query(text, params);
      }
      state.queries.push({ text, params });
      if (/FROM provider_profile/.test(text)) {
        const found = params[0] === CLINIC_ID || params[0] === INDEPENDENT_ID;
        return { rows: found ? [{ provider_type: params[0] === INDEPENDENT_ID ? 'independent' : providerType }] : [] };
      }
      if (/FROM offering/.test(text)) {
        return { rows: [...offerings, ...state.inserts].filter((row) => row.provider_id === params[0]) };
      }
      if (/INSERT INTO offering/.test(text)) {
        const row = {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          provider_id: params[0],
          provider_type: params[1],
          kind: 'service',
          name: params[2],
          price_cop: params[3],
          species: params[4],
          modality: params[5],
          available: null,
        };
        state.inserts.push(row);
        return { rows: [row] };
      }
      throw new Error(`Unexpected query: ${text}`);
    },
  };
}

const running = [];
async function openApp(db) {
  const server = await startApp(createApp({
    config: testConfig(),
    db,
    clock: fixedClock(NOW),
    modules: [{ createRouter: createCatalogRouter }],
  }));
  running.push(server);
  return server;
}

after(async () => Promise.all(running.map((server) => server.close())));

test('service validator requires a name, positive COP price, one species, and clinic modality', () => {
  assert.deepEqual(validatePublishService(clinicInput, 'clinic'), {
    value: { name: 'Consulta general', priceCop: 50000, species: 'dog', modality: 'both' },
  });
  for (const [input, expected] of [
    [{ ...clinicInput, species: undefined }, { field: 'species', reason: 'REQUIRED' }],
    [{ ...clinicInput, modality: undefined }, { field: 'modality', reason: 'REQUIRED' }],
    [{ ...clinicInput, priceCop: undefined }, { field: 'priceCop', reason: 'REQUIRED' }],
    [{ ...clinicInput, priceCop: 0 }, { field: 'priceCop', reason: 'OUT_OF_RANGE' }],
    [{ ...clinicInput, species: 'bird' }, { field: 'species', reason: 'NOT_ALLOWED' }],
    [{ ...clinicInput, modality: 'remote' }, { field: 'modality', reason: 'NOT_ALLOWED' }],
    [{ ...clinicInput, unexpected: true }, { field: 'unexpected', reason: 'NOT_ALLOWED' }],
  ]) {
    assert.ok(validatePublishService(input, 'clinic').fields.some((field) => field.field === expected.field && field.reason === expected.reason));
  }
});

test('independent veterinarians can publish home services only', () => {
  assert.deepEqual(validatePublishService({ name: 'Consulta', priceCop: 50000, species: 'cat' }, 'independent'), {
    value: { name: 'Consulta', priceCop: 50000, species: 'cat', modality: 'home' },
  });
  assert.deepEqual(validatePublishService({ ...clinicInput, modality: 'home' }, 'independent').value.modality, 'home');
  for (const modality of ['clinic', 'both']) {
    assert.ok(validatePublishService({ ...clinicInput, modality }, 'independent').fields.some(
      ({ field, reason }) => field === 'modality' && reason === 'NOT_ALLOWED',
    ));
  }
});

test('provider can publish a service and read only its own catalog', async () => {
  const otherService = {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    provider_id: INDEPENDENT_ID,
    kind: 'service',
    name: 'Other service',
    price_cop: 30000,
    species: 'cat',
    modality: 'home',
    available: null,
  };
  const db = makeDb({ offerings: [otherService] });
  const app = await openApp(db);
  const headers = {
    cookie: 'vetcare_session=clinic',
    origin: 'https://vetcare.test',
    'content-type': 'application/json',
  };

  const created = await app.request('/api/provider/services', {
    method: 'POST',
    headers,
    body: JSON.stringify(clinicInput),
  });
  assert.equal(created.status, 201);
  const createdBody = await created.json();
  assert.deepEqual(createdBody, {
    id: createdBody.id,
    kind: 'service',
    name: 'Consulta general',
    priceCop: 50000,
    species: 'dog',
    modality: 'both',
  });
  assert.equal(db.state.inserts.length, 1);
  assert.equal(db.state.inserts[0].provider_id, CLINIC_ID);

  const catalog = await app.request('/api/provider/offerings', { headers });
  assert.equal(catalog.status, 200);
  assert.deepEqual(await catalog.json(), {
    services: [{
      id: createdBody.id,
      kind: 'service',
      name: 'Consulta general',
      priceCop: 50000,
      species: 'dog',
      modality: 'both',
    }],
    products: [],
  });
  assert.match(db.state.queries.at(-1).text, /provider_id = \$1/);
  assert.deepEqual(db.state.queries.at(-1).params, [CLINIC_ID]);
});

test('service routes require a provider session and reject owner accounts', async () => {
  const app = await openApp(makeDb());
  const anonymous = await app.request('/api/provider/offerings');
  assert.equal(anonymous.status, 401);

  const owner = await app.request('/api/provider/offerings', {
    headers: { cookie: 'vetcare_session=owner' },
  });
  assert.equal(owner.status, 404);

  const invalid = await app.request('/api/provider/services', {
    method: 'POST',
    headers: {
      cookie: 'vetcare_session=clinic',
      origin: 'https://vetcare.test',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ ...clinicInput, modality: undefined }),
  });
  assert.equal(invalid.status, 422);
  assert.deepEqual((await invalid.json()).fields, [{ field: 'modality', reason: 'REQUIRED' }]);
});
