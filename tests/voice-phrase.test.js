// US-035 (FR-041; BR-043, BR-044, BR-053): voice phrase interpretation on text, no database.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { interpretPhrase, voiceSearch } from '../src/modules/search/voice-phrase.js';

test('AC-115: "busco vacunación para mi perro" → text "vacunación", species dog', () => {
  assert.deepEqual(interpretPhrase('busco vacunación para mi perro'), {
    query: 'vacunación',
    querySpeciesKept: 'vacunación para mi perro',
    species: 'dog',
  });
});

test('BR-043 / BR-044: species words, connectors and leading fillers, case- and accent-insensitive', () => {
  assert.equal(interpretPhrase('Necesito un baño para gatos').query, 'baño');
  assert.equal(interpretPhrase('Necesito un baño para gatos').species, 'cat');
  assert.equal(interpretPhrase('¿Estoy buscando la Vacuna de gatito?').query, 'vacuna');
  assert.equal(interpretPhrase('ME GUSTARÍA una consulta para mis perritos').query, 'consulta');
  assert.equal(interpretPhrase('ME GUSTARÍA una consulta para mis perritos').species, 'dog');
});

test('AC-119: no species named → species null (the current filter stays)', () => {
  assert.deepEqual(interpretPhrase('necesito un baño'), { query: 'baño', querySpeciesKept: 'baño', species: null });
});

test('AC-120 / EDGE-036: only fillers and species → empty query', () => {
  assert.equal(interpretPhrase('para mi gato').query, '');
  assert.equal(interpretPhrase('busco por favor').query, '');
});

test('EDGE-037: both species named → filter all, both words and their conjunction removed', () => {
  assert.deepEqual(interpretPhrase('Quiero un baño para perros y gatos'), {
    query: 'baño',
    querySpeciesKept: 'baño para perros y gatos',
    species: 'all',
  });
});

test('BR-044: fillers are removed only at the start and at the end, never in the middle', () => {
  assert.equal(interpretPhrase('corte de uñas por favor').query, 'corte de uñas');
  assert.equal(interpretPhrase('quiero la vacuna que necesito').query, 'vacuna que necesito');
});

test('the interpreted text is cut to the 120-character search limit (P05-ASM-023)', () => {
  assert.equal(interpretPhrase(`busco ${'a'.repeat(200)}`).query.length, 120);
});

test('BR-053 / AC-159: retry with the species words kept when the cleaned text finds nothing', async () => {
  const calls = [];
  const search = async ({ q, species }) => {
    calls.push([q, species]);
    return q === 'alimento para gato adulto' ? [{ id: 'x' }] : [];
  };
  const result = await voiceSearch(search, 'alimento para gato adulto', 'all');
  assert.deepEqual(calls, [['alimento adulto', 'cat'], ['alimento para gato adulto', 'cat']]);
  assert.deepEqual(result, { outcome: 'searched', query: 'alimento para gato adulto', species: 'cat', retried: true, results: [{ id: 'x' }] });
});

test('voiceSearch: no retry when results exist, no species was spoken, or the query is empty', async () => {
  const calls = [];
  const search = async ({ q, species }) => { calls.push([q, species]); return q === 'vacunación' ? [{ id: 'v' }] : []; };
  assert.equal((await voiceSearch(search, 'busco vacunación para mi perro')).retried, false);
  assert.deepEqual((await voiceSearch(search, 'necesito un baño', 'cat')).species, 'cat'); // AC-119
  assert.deepEqual(await voiceSearch(search, 'para mi gato', 'dog'), { outcome: 'empty_query', species: 'cat', retried: false, results: [] });
  assert.deepEqual(calls, [['vacunación', 'dog'], ['baño', 'cat']]);
});
