// Catalog card actions (COMP-UX-007): the tertiary "Eliminar" link-button must be as tall as the other controls
// (size-control-height, 44 px), not just one line of text (24 px, measured at 375 px in the US-015 validation).
// Source-level guard; the client has no browser test runner and the height was measured in a real browser.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read } from './helpers.js';

const css = read('client/src/design-system/global.css').replace(/\r\n/g, '\n');

test('the link-buttons in the catalog card actions keep the control height', () => {
  const match = css.match(/\.catalog-item-actions \.link-button\s*\{([^}]*)\}/);
  assert.ok(match, 'missing rule .catalog-item-actions .link-button');
  assert.match(match[1], /min-height:\s*var\(--size-control-height\)/);
});

test('the "Eliminar" action uses the error color token', () => {
  const match = css.match(/\.danger-link\s*\{([^}]*)\}/);
  assert.ok(match, 'missing rule .danger-link');
  assert.match(match[1], /color:\s*var\(--color-error\)/);
});
