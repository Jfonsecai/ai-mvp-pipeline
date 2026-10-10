// CR-026: the implementation must match API_SPEC.yaml and DATA_MODEL.md. These tests compare the
// shared-kernel constants (COMP-010) with the written contract and with the first migration.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parse } from 'yaml';
import { API_SPEC_PATH, read } from './helpers.js';
import {
  ACCOUNT_TYPES, APPOINTMENT_STATUSES, CHOSEN_MODALITIES, FEATURES, OFFERED_MODALITIES,
  ORDER_STATUSES, PROVIDER_TYPES, SPECIES,
} from '../src/shared/enums.js';
import { OUTCOME_CODES, OUTCOME_HTTP_STATUS, REASON_CODES } from '../src/shared/outcomes.js';

const spec = parse(read(API_SPEC_PATH));
const schemas = spec.components.schemas;
const migration = read('migrations/001_initial_schema.sql');
const flat = migration.replace(/\s+/g, ' '); // whitespace-insensitive comparison

test('API_SPEC.yaml is the OpenAPI 3.1 document the foundation was built from', () => {
  assert.equal(spec.openapi, '3.1.0');
  assert.equal(spec.info.version, '1.0.0');
});

test('enumerations equal API_SPEC.yaml components.schemas', () => {
  assert.deepEqual([...ACCOUNT_TYPES], schemas.AccountType.enum);
  assert.deepEqual([...PROVIDER_TYPES], schemas.ProviderType.enum);
  assert.deepEqual([...SPECIES], schemas.Species.enum);
  assert.deepEqual([...OFFERED_MODALITIES], schemas.OfferedModality.enum);
  assert.deepEqual([...CHOSEN_MODALITIES], schemas.ChosenModality.enum);
  assert.deepEqual([...APPOINTMENT_STATUSES], schemas.AppointmentStatus.enum);
  assert.deepEqual([...ORDER_STATUSES], schemas.OrderStatus.enum);
  assert.deepEqual([...FEATURES], schemas.Feature.enum);
});

test('outcome codes and reason codes equal API_SPEC.yaml', () => {
  assert.deepEqual([...OUTCOME_CODES].sort(), [...schemas.OutcomeCode.enum].sort());
  assert.deepEqual([...REASON_CODES], schemas.ReasonCode.enum);
});

test('HTTP status per outcome code equals the mapping in API_SPEC.yaml', () => {
  // The spec states the mapping in the OutcomeCode description: "A, B → 422; C → 409; ..."
  const documented = {};
  for (const clause of schemas.OutcomeCode.description.replace(/\n/g, ' ').split(';')) {
    const match = clause.match(/([A-Z_, ]+)→\s*(\d{3})/);
    assert.ok(match, `unparseable clause: ${clause}`);
    for (const name of match[1].split(',')) documented[name.trim().replace(/^HTTP status:\s*/, '')] = Number(match[2]);
  }
  assert.deepEqual(documented, { ...OUTCOME_HTTP_STATUS });
});

test('enumerations equal the CHECK constraints of the first migration (DATA_MODEL Appendix A)', () => {
  const inList = (values) => `IN (${values.map((v) => `'${v}'`).join(', ')})`;
  for (const fragment of [
    `CHECK (account_type ${inList(ACCOUNT_TYPES)})`,
    `CHECK (provider_type ${inList(PROVIDER_TYPES)})`,
    `CHECK (species ${inList(SPECIES)})`,
    `CHECK (modality ${inList(OFFERED_MODALITIES)})`,
    `CHECK (modality ${inList(CHOSEN_MODALITIES)})`,
    `CHECK (status ${inList(APPOINTMENT_STATUSES)})`,
    `CHECK (status ${inList(ORDER_STATUSES)})`,
  ]) {
    assert.ok(flat.includes(fragment), `migration lacks ${fragment}`);
  }
});

test('first migration is DATA_MODEL Appendix A verbatim (ADR-018)', () => {
  const model = read('artifacts/05_arquitecture/DATA_MODEL_V1.md').replace(/\r\n/g, '\n');
  const appendix = model.slice(model.indexOf('## Appendix A'), model.indexOf('## Appendix B'));
  const ddl = appendix.match(/```sql\n([\s\S]*?)\n```/)[1];
  assert.ok(migration.replace(/\r\n/g, '\n').trimEnd().endsWith(ddl.trimEnd()), 'migrations/001_initial_schema.sql must end with the Appendix A DDL');
});

test('the eight DATA_MODEL tables are created', () => {
  const tables = [...migration.matchAll(/^CREATE TABLE (\w+)/gm)].map((m) => m[1]);
  assert.deepEqual(tables, ['account', 'session', 'pet', 'provider_profile', 'working_hours', 'offering', 'appointment', 'product_order']);
});
