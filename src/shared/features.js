// COMP-010 Shared Kernel - feature switches (ADR-017, CR-023).
import { FEATURES } from './enums.js';

/**
 * Parses the FEATURES variable: comma separated, subset of FEATURES. Empty means none.
 * An unknown name is a configuration error, so a typo cannot silently leave a slice off.
 * @param {string | undefined} raw
 * @returns {readonly string[]}
 */
export function parseFeatures(raw) {
  const names = (raw ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter((name) => name !== '');
  const unknown = names.filter((name) => !FEATURES.includes(name));
  if (unknown.length > 0) {
    throw new Error(
      `FEATURES contains unknown switch(es): ${unknown.join(', ')}. Allowed: ${FEATURES.join(', ')}.`,
    );
  }
  return Object.freeze([...new Set(names)]);
}
