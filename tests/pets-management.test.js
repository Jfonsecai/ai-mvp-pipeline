import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validatePetInput } from '../src/modules/pets/owner-pet.js';

test('pet input accepts mandatory fields and optional measurements', () => {
  assert.deepEqual(validatePetInput({ name: ' Nala ', species: 'dog', breed: ' Mestiza ', ageYears: 3, weightKg: 12.3, heightCm: 42 }), {
    value: { name: 'Nala', species: 'dog', breed: 'Mestiza', ageYears: 3, weightKg: 12.3, heightCm: 42 },
  });
});

test('pet input rejects missing mandatory fields and unsupported species', () => {
  const result = validatePetInput({ name: '', species: 'bird', breed: '', ageYears: undefined });
  assert.deepEqual(result.fields, [
    { field: 'name', reason: 'REQUIRED' },
    { field: 'breed', reason: 'REQUIRED' },
    { field: 'species', reason: 'NOT_ALLOWED' },
    { field: 'ageYears', reason: 'REQUIRED' },
  ]);
});

test('pet input rejects measurements outside MVP units', () => {
  const result = validatePetInput({ name: 'Nala', species: 'cat', breed: 'Criollo', ageYears: 2, weightKg: 2.22, heightCm: 0 });
  assert.deepEqual(result.fields, [
    { field: 'weightKg', reason: 'INVALID_FORMAT' },
    { field: 'heightCm', reason: 'INVALID_FORMAT' },
  ]);
});