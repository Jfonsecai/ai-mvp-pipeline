// P07.1 helper (not a test file): a small OpenAPI 3.1 schema validator, enough for API_SPEC_V1.yaml.
// It supports the keywords the specification actually uses: $ref, type, enum, const, required,
// properties, additionalProperties:false, items, minItems/maxItems, minimum/maximum,
// exclusiveMinimum, minLength/maxLength, pattern, format (uuid, date, date-time, email), oneOf, allOf.
// Keywords it does not implement (for example if/then) are ignored and are not claimed as verified.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { ROOT } from './harness.js';

export const API_SPEC_PATH = 'artifacts/05_architecture/API_SPEC_V1.yaml';
export const spec = parse(readFileSync(join(ROOT, API_SPEC_PATH), 'utf8'));

const FORMATS = {
  uuid: (v) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v),
  date: (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(`${v}T00:00:00Z`)),
  'date-time': (v) => /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(v) && !Number.isNaN(Date.parse(v)),
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
};

function resolve(ref) {
  if (!ref.startsWith('#/')) throw new Error(`Unsupported $ref ${ref}`);
  return ref.slice(2).split('/').reduce((node, key) => node?.[key], spec);
}

const typeOf = (value) => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  if (Number.isInteger(value)) return 'integer';
  return typeof value;
};

/** @returns {string[]} violations; an empty array means the value conforms. */
export function validate(schema, value, path = '$') {
  if (schema.$ref) return validate(resolve(schema.$ref), value, path);
  const errors = [];

  if (schema.allOf) for (const part of schema.allOf) errors.push(...validate(part, value, path));
  if (schema.oneOf) {
    const matches = schema.oneOf.filter((part) => validate(part, value, path).length === 0);
    if (matches.length !== 1) errors.push(`${path}: matches ${matches.length} of ${schema.oneOf.length} oneOf alternatives`);
  }

  if (schema.type) {
    const actual = typeOf(value);
    const ok = schema.type === actual || (schema.type === 'number' && actual === 'integer');
    if (!ok) { errors.push(`${path}: expected ${schema.type}, got ${actual}`); return errors; }
  }
  if (schema.const !== undefined && value !== schema.const) errors.push(`${path}: expected constant ${schema.const}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: ${JSON.stringify(value)} not in enum [${schema.enum}]`);

  if (typeof value === 'string') {
    if (schema.minLength !== undefined && [...value].length < schema.minLength) errors.push(`${path}: shorter than ${schema.minLength}`);
    if (schema.maxLength !== undefined && [...value].length > schema.maxLength) errors.push(`${path}: longer than ${schema.maxLength}`);
    if (schema.pattern && !new RegExp(schema.pattern, 'u').test(value)) errors.push(`${path}: does not match ${schema.pattern}`);
    if (schema.format && FORMATS[schema.format] && !FORMATS[schema.format](value)) errors.push(`${path}: not a valid ${schema.format}`);
  }
  if (typeof value === 'number') {
    if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: below minimum ${schema.minimum}`);
    if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: above maximum ${schema.maximum}`);
    if (schema.exclusiveMinimum !== undefined && value <= schema.exclusiveMinimum) errors.push(`${path}: not above ${schema.exclusiveMinimum}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: fewer than ${schema.minItems} items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: more than ${schema.maxItems} items`);
    if (schema.items) value.forEach((item, index) => errors.push(...validate(schema.items, item, `${path}[${index}]`)));
  }
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${path}: missing required property "${key}"`);
    for (const [key, child] of Object.entries(schema.properties ?? {})) {
      if (key in value) errors.push(...validate(child, value[key], `${path}.${key}`));
    }
    if (schema.additionalProperties === false) {
      const known = new Set(Object.keys(schema.properties ?? {}));
      for (const key of Object.keys(value)) if (!known.has(key)) errors.push(`${path}: unexpected property "${key}"`);
    }
  }
  return errors;
}

/** Schema of an operation's JSON response, or undefined when the operation declares none. */
export function responseSchema(method, path, status) {
  const response = spec.paths[path]?.[method.toLowerCase()]?.responses?.[String(status)];
  if (!response) return undefined;
  const resolved = response.$ref ? resolve(response.$ref) : response;
  return resolved.content?.['application/json']?.schema;
}

export const schemaNamed = (name) => spec.components.schemas[name];
