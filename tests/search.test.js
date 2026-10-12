// US-016 (IF-007): AC-038 to AC-040, BR-009, BR-027 and EDGE-015.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { createApp } from '../src/app.js';
import { createSearchRouter, validateSearchQuery } from '../src/modules/search/offerings.js';
import { API_SPEC_PATH, fakeSessionDb, fixedClock, read, startApp, testConfig } from './helpers.js';

const OWNER_ID = '33333333-3333-4333-8333-333333333333';
const CLINIC_ID = '11111111-1111-4111-8111-111111111111';
const INDEPENDENT_ID = '22222222-2222-4222-8222-222222222222';
const NOW = new Date('2026-10-12T03:00:00Z');
const session = (accountId, accountType) => ({
  account_id: accountId,
  account_type: accountType,
  last_seen_at: new Date('2026-10-12T02:55:00Z'),
  absolute_expires_at: new Date('2026-10-12T08:00:00Z'),
  ended_at: null,
});

const rows = [
  {
    id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    kind: 'service',
    name: 'Consulta VACÚNA',
    price_cop: 65000,
    species: 'dog',
    modality: 'clinic',
    available: null,
    provider_id: CLINIC_ID,
    public_name: 'Clínica Central',
    provider_type: 'clinic',
  },
  {
    id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    kind: 'product',
    name: 'Vacuna felina',
    price_cop: 42000,
    species: 'cat',
    modality: null,
    available: false,
    provider_id: INDEPENDENT_ID,
    public_name: 'Veterinario Norte',
    provider_type: 'independent',
  },
];

function makeDb(resultRows = rows) {
  const sessions = fakeSessionDb({
    owner: session(OWNER_ID, 'owner'),
    provider: session(CLINIC_ID, 'provider'),
  });
  const queries = [];
  return {
    queries,
    async query(text, params = []) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) {
        return sessions.query(text, params);
      }
      queries.push({ text, params });
      assert.match(text, /FROM offering o/);
      return { rows: resultRows };
    },
  };
}

const running = [];
async function openApp(db = makeDb()) {
  const server = await startApp(createApp({
    config: testConfig(),
    db,
    clock: fixedClock(NOW),
    modules: [{ createRouter: createSearchRouter }],
  }));
  running.push(server);
  return { request: server.request, db };
}

after(async () => Promise.all(running.map((server) => server.close())));

test('search query requires trimmed text and enforces the 120-character contract', () => {
  assert.deepEqual(validateSearchQuery('  vacuna  '), { value: 'vacuna' });
  assert.deepEqual(validateSearchQuery('  '), { fields: [{ field: 'q', reason: 'REQUIRED' }] });
  assert.deepEqual(validateSearchQuery(undefined), { fields: [{ field: 'q', reason: 'REQUIRED' }] });
  assert.deepEqual(validateSearchQuery(['vacuna']), { fields: [{ field: 'q', reason: 'INVALID_FORMAT' }] });
  assert.deepEqual(validateSearchQuery('á'.repeat(121)), { fields: [{ field: 'q', reason: 'TOO_LONG' }] });
  assert.deepEqual(validateSearchQuery('á'.repeat(120)).value, 'á'.repeat(120));
});

test('AC-038 / AC-039: owners receive services and products from all providers with contract details', async () => {
  const { request, db } = await openApp();
  const response = await request('/api/search?q=%20Vacuna%20', {
    headers: { cookie: 'vetcare_session=owner' },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), {
    results: [
      {
        id: rows[0].id,
        kind: 'service',
        name: 'Consulta VACÚNA',
        priceCop: 65000,
        species: 'dog',
        modality: 'clinic',
        provider: { id: CLINIC_ID, name: 'Clínica Central', type: 'clinic' },
      },
      {
        id: rows[1].id,
        kind: 'product',
        name: 'Vacuna felina',
        priceCop: 42000,
        species: 'cat',
        available: false,
        provider: { id: INDEPENDENT_ID, name: 'Veterinario Norte', type: 'independent' },
      },
    ],
  });
  assert.deepEqual(db.queries[0].params, ['Vacuna']);
  assert.match(db.queries[0].text, /translate\(lower\(o\.name\)/);
  assert.match(db.queries[0].text, /provider_profile/);
  assert.match(db.queries[0].text, /ESCAPE/);
  assert.doesNotMatch(db.queries[0].text, /address|location/i);
});

test('search literal percent and underscore are not treated as LIKE wildcards', async () => {
  const { request, db } = await openApp(makeDb([]));
  const response = await request('/api/search?q=%25_%5C', {
    headers: { cookie: 'vetcare_session=owner' },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { results: [] });
  assert.deepEqual(db.queries[0].params, ['\\%\\_\\\\']);
});

test('AC-040: no matches return a normal empty result list', async () => {
  const { request } = await openApp(makeDb([]));
  const response = await request('/api/search?q=sin%20coincidencias', {
    headers: { cookie: 'vetcare_session=owner' },
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { results: [] });
});

test('search is restricted to owner sessions and rejects invalid query text', async () => {
  const { request } = await openApp();
  assert.equal((await request('/api/search?q=vacuna')).status, 401);
  assert.equal((await request('/api/search?q=vacuna', {
    headers: { cookie: 'vetcare_session=provider' },
  })).status, 404);

  const blank = await request('/api/search?q=%20%20', {
    headers: { cookie: 'vetcare_session=owner' },
  });
  assert.equal(blank.status, 422);
  assert.deepEqual((await blank.json()).fields, [{ field: 'q', reason: 'REQUIRED' }]);

  const tooLong = await request(`/api/search?q=${'a'.repeat(121)}`, {
    headers: { cookie: 'vetcare_session=owner' },
  });
  assert.equal(tooLong.status, 422);
  assert.deepEqual((await tooLong.json()).fields, [{ field: 'q', reason: 'TOO_LONG' }]);
});

test('search parameters and response fields conform to API_SPEC', () => {
  const spec = parse(read(API_SPEC_PATH));
  const operation = spec.paths['/api/search'].get;
  assert.deepEqual(operation.parameters.map(({ name }) => name), ['q', 'species']);
  assert.equal(operation.parameters[0].required, true);
  const result = {
    id: rows[0].id,
    kind: 'service',
    name: rows[0].name,
    priceCop: rows[0].price_cop,
    species: rows[0].species,
    modality: rows[0].modality,
    provider: { id: rows[0].provider_id, name: rows[0].public_name, type: rows[0].provider_type },
  };
  assert.deepEqual(Object.keys(result).sort(), Object.keys(spec.components.schemas.ServiceSearchResult.properties).sort());
});
