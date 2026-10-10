// ADR-013 / CR-012: tokens.css is the single source of visual values and must equal UX_SPEC section 4.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { UX_SPEC_PATH, read } from './helpers.js';

function specTokens() {
  const section = read(UX_SPEC_PATH).replace(/\r\n/g, '\n');
  const body = section.slice(section.indexOf('## 4. Design Tokens'), section.indexOf('## 5. Shared Component Library'));
  const tokens = new Map();
  for (const match of body.matchAll(/^\| `([a-z0-9-]+)` \| (.+?) \| .+ \|$/gm)) {
    tokens.set(match[1], match[2].replace(/\s*\(\d+px\)$/, ''));
  }
  return tokens;
}

function cssTokens() {
  const css = read('client/src/design-system/tokens.css');
  return new Map([...css.matchAll(/^\s+--([a-z0-9-]+): (.+);$/gm)].map((m) => [m[1], m[2]]));
}

test('tokens.css defines exactly the 68 tokens of UX_SPEC section 4, with the same values', () => {
  const spec = specTokens();
  const css = cssTokens();
  assert.equal(spec.size, 68);
  assert.deepEqual([...css.keys()].sort(), [...spec.keys()].sort());
  for (const [name, value] of spec) assert.equal(css.get(name), value, `token ${name}`);
});

test('base styles use only tokens (no raw colors or sizes) - CR-012', () => {
  const global = read('client/src/design-system/global.css');
  assert.ok(!/#[0-9a-fA-F]{3,8}\b/.test(global), 'no hex colors');
  assert.ok(!/\b\d+(\.\d+)?(px|rem|em)\b/.test(global.replace(/\/\*[\s\S]*?\*\//g, '')), 'no raw lengths');
});
