// COMP-UX-011 (UX_SPEC_V2): below breakpoint-md the account navigation is a fixed bottom tab bar of
// size-bottom-nav-height, and the page gets the same bottom padding; from breakpoint-md the tabs stay in
// the header. Source-level guard for the layout fix that stopped the header overflowing a 375 px phone.
// (The client has no browser test runner; the behavior itself was measured in a real browser.)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { read } from './helpers.js';

const css = read('client/src/design-system/global.css').replace(/\r\n/g, '\n');

// Every `@media (query) { … }` block of the stylesheet, joined (the file has more than one per query).
function mediaBlock(query) {
  const blocks = [];
  for (let start = css.indexOf(`@media (${query}) {`); start !== -1; start = css.indexOf(`@media (${query}) {`, start + 1)) {
    let depth = 0;
    for (let i = css.indexOf('{', start); i < css.length; i += 1) {
      if (css[i] === '{') depth += 1;
      if (css[i] === '}') { depth -= 1; if (depth === 0) { blocks.push(css.slice(start, i + 1)); break; } }
    }
  }
  assert.ok(blocks.length > 0, `missing @media (${query})`);
  return blocks.join('\n');
}

const rule = (block, selector) => {
  const match = block.match(new RegExp(`${selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `missing rule ${selector}`);
  return match[1];
};

test('below breakpoint-md the account navigation is a fixed bottom bar of size-bottom-nav-height', () => {
  const mobile = mediaBlock('max-width: 767px');
  const nav = rule(mobile, '.provider-navigation, .owner-navigation');
  for (const declaration of ['position: fixed', 'bottom: 0', 'left: 0', 'right: 0', 'height: var(--size-bottom-nav-height)', 'align-items: stretch']) {
    assert.ok(nav.includes(declaration), declaration);
  }
  const link = rule(mobile, '.provider-navigation a, .owner-navigation a');
  assert.ok(link.includes('font-size: var(--font-size-sm)'), 'bottom tab labels use font-size-sm');
  assert.match(mobile, /a\[aria-current="page"\][^{]*\{[^}]*border-top-color: var\(--color-primary\)/, 'active tab has the primary indicator');
});

test('the page keeps room for the bar, and the sticky assistant composer sits above it', () => {
  const mobile = mediaBlock('max-width: 767px');
  assert.match(mobile, /body:has\(\.provider-navigation, \.owner-navigation\)\s*\{\s*padding-bottom: var\(--size-bottom-nav-height\);/);
  assert.match(mobile, /\.assistant-composer\s*\{\s*bottom: var\(--size-bottom-nav-height\);/);
});

test('the header on a phone keeps only the wordmark (font-size-lg) and the account menu, with page side padding spacing-4', () => {
  const mobile = mediaBlock('max-width: 767px');
  assert.match(mobile, /\.app-header\s*\{\s*padding: 0 var\(--spacing-4\);/);
  assert.match(mobile, /\.wordmark\s*\{\s*font-size: var\(--font-size-lg\);/);
});

test('from breakpoint-md the navigation is not fixed: no mobile bar rule leaks into the wide layout', () => {
  const wide = mediaBlock('min-width: 768px');
  assert.ok(!/position:\s*fixed/.test(wide.split('.appointment-toast')[0]), 'the wide block does not fix the navigation');
  assert.ok(!wide.includes('size-bottom-nav-height'));
  const base = css.slice(0, css.indexOf('@media (max-width: 767px)')).split('\n').filter((line) => /^\.(provider|owner)-navigation \{/.test(line)).join('\n');
  assert.ok(!base.includes('position: fixed'), 'the base (header) rule is not fixed');
});
