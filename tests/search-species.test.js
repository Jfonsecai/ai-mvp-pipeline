// US-017 (IF-007 `species` parameter): AC-041, AC-042, AC-043, AC-086; BR-006, BR-008, BR-032.
import { after, test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { createApp } from '../src/app.js';
import { createSearchRouter, validateSpeciesFilter } from '../src/modules/search/offerings.js';
import { API_SPEC_PATH, fakeSessionDb, fixedClock, read, startApp, testConfig } from './helpers.js';

const OWNER_ID = '33333333-3333-4333-8333-333333333333';
const PROVIDER_ID = '11111111-1111-4111-8111-111111111111';
const NOW = new Date('2026-10-12T03:00:00Z');
const session = (accountId, accountType) => ({
  account_id: accountId,
  account_type: accountType,
  last_seen_at: new Date('2026-10-12T02:55:00Z'),
  absolute_expires_at: new Date('2026-10-12T08:00:00Z'),
  ended_at: null,
});
const offering = (id, name, species) => ({
  id, kind: 'service', name, price_cop: 1000, species, modality: 'home', available: null,
  provider_id: PROVIDER_ID, public_name: 'Clínica', provider_type: 'clinic',
});
const allRows = [
  offering('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1', 'Vacuna canina', 'dog'),
  offering('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa2', 'Vacuna felina', 'cat'),
];

/** Fake database that applies the species condition the router adds, so the HTTP result reflects it. */
function makeDb() {
  const sessions = fakeSessionDb({ owner: session(OWNER_ID, 'owner'), provider: session(PROVIDER_ID, 'provider') });
  const queries = [];
  return {
    queries,
    async query(text, params = []) {
      if (/^\s*SELECT s\.account_id/.test(text) || /^\s*UPDATE session SET last_seen_at/.test(text)) {
        return sessions.query(text, params);
      }
      queries.push({ text, params });
      const speciesCondition = /o\.species = \$2/.test(text);
      return { rows: allRows.filter((row) => !speciesCondition || row.species === params[1]) };
    },
  };
}

const running = [];
async function openApp(db = makeDb()) {
  const server = await startApp(createApp({ config: testConfig(), db, clock: fixedClock(NOW), modules: [{ createRouter: createSearchRouter }] }));
  running.push(server);
  return { db, get: (path, cookie = 'owner') => server.request(path, { headers: { cookie: `vetcare_session=${cookie}` } }) };
}
after(async () => Promise.all(running.map((server) => server.close())));

test('species filter validation: absent means all; all, dog and cat are accepted; anything else is refused', () => {
  assert.deepEqual(validateSpeciesFilter(undefined), { value: 'all' });
  for (const value of ['all', 'dog', 'cat']) assert.deepEqual(validateSpeciesFilter(value), { value });
  for (const value of ['', 'bird', 'DOG', 'Dog', ' dog', 'dog ', 'both', 'null']) {
    assert.deepEqual(validateSpeciesFilter(value), { fields: [{ field: 'species', reason: 'NOT_ALLOWED' }] }, JSON.stringify(value));
  }
  for (const value of [['dog'], ['dog', 'cat'], { a: 1 }]) {
    assert.deepEqual(validateSpeciesFilter(value), { fields: [{ field: 'species', reason: 'INVALID_FORMAT' }] }, JSON.stringify(value));
  }
});

test('AC-041: a dog or cat filter adds exactly one species condition and returns only that species', async () => {
  const { get, db } = await openApp();
  const dog = await (await get('/api/search?q=vacuna&species=dog')).json();
  assert.deepEqual(dog.results.map((r) => r.species), ['dog']);
  assert.deepEqual(db.queries[0].params, ['vacuna', 'dog']);
  assert.match(db.queries[0].text, /AND o\.species = \$2/);

  const cat = await (await get('/api/search?q=vacuna&species=cat')).json();
  assert.deepEqual(cat.results.map((r) => r.species), ['cat']);
  assert.deepEqual(db.queries[1].params, ['vacuna', 'cat']);
});

test('AC-043: "all" and an absent filter apply no species condition and show both species', async () => {
  const { get, db } = await openApp();
  for (const path of ['/api/search?q=vacuna', '/api/search?q=vacuna&species=all']) {
    const body = await (await get(path)).json();
    assert.deepEqual(body.results.map((r) => r.species).sort(), ['cat', 'dog'], path);
  }
  for (const query of db.queries) {
    assert.deepEqual(query.params, ['vacuna']);
    assert.doesNotMatch(query.text, /AND o\.species/); // the column is selected, but not filtered on
  }
});

test('AC-086: the text condition is kept together with the species condition', async () => {
  const { get, db } = await openApp();
  await get('/api/search?q=vac%C3%BAna%20canina&species=dog');
  assert.deepEqual(db.queries[0].params, ['vacúna canina', 'dog']);
  assert.match(db.queries[0].text, /LIKE '%' \|\| translate\(lower\(\$1\)/);
  assert.match(db.queries[0].text, /AND o\.species = \$2/);
});

test('AC-042 / BR-008: the filter depends only on the request, never on the owner or their pets', async () => {
  const { get, db } = await openApp();
  await get('/api/search?q=vacuna&species=cat');
  assert.doesNotMatch(db.queries[0].text, /\bpet\b/i);
  assert.doesNotMatch(db.queries[0].text, /owner/i);
  assert.equal(db.queries[0].params.length, 2);
});

test('an invalid species is refused with 422 before any query; q and species errors are reported together', async () => {
  const { get, db } = await openApp();
  const invalid = await get('/api/search?q=vacuna&species=bird');
  assert.equal(invalid.status, 422);
  assert.deepEqual(await invalid.json(), { code: 'VALIDATION_FAILED', fields: [{ field: 'species', reason: 'NOT_ALLOWED' }] });
  const repeated = await get('/api/search?q=vacuna&species=dog&species=cat');
  assert.deepEqual((await repeated.json()).fields, [{ field: 'species', reason: 'INVALID_FORMAT' }]);
  const empty = await get('/api/search?q=vacuna&species=');
  assert.deepEqual((await empty.json()).fields, [{ field: 'species', reason: 'NOT_ALLOWED' }]);
  const both = await get('/api/search?q=%20&species=bird');
  assert.deepEqual((await both.json()).fields, [{ field: 'q', reason: 'REQUIRED' }, { field: 'species', reason: 'NOT_ALLOWED' }]);
  assert.equal(db.queries.length, 0);
});

test('the filter does not weaken the owner-only boundary', async () => {
  const { get } = await openApp();
  assert.equal((await get('/api/search?q=vacuna&species=dog', 'provider')).status, 404);
  const server = await startApp(createApp({ config: testConfig(), db: makeDb(), clock: fixedClock(NOW), modules: [{ createRouter: createSearchRouter }] }));
  running.push(server);
  assert.equal((await server.request('/api/search?q=vacuna&species=dog')).status, 401);
});

test('the species parameter matches API_SPEC (optional, SpeciesFilter all|dog|cat, default all)', () => {
  const spec = parse(read(API_SPEC_PATH));
  const parameter = spec.paths['/api/search'].get.parameters.find(({ name }) => name === 'species');
  assert.equal(parameter.required, false);
  assert.deepEqual(spec.components.schemas.SpeciesFilter.enum, ['all', 'dog', 'cat']);
  assert.equal(spec.components.schemas.SpeciesFilter.default, 'all');
});
