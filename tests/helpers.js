// Shared test helpers (not a test file).
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadConfig } from '../src/shared/config.js';
import { createLogger } from '../src/shared/logger.js';
import { hashSessionToken } from '../src/modules/identity/sessions.js';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
export const read = (relativePath) => readFileSync(join(ROOT, relativePath), 'utf8');

// Authoritative architecture inputs, as named in the repository today. If a newer version is
// added, update these two paths in the same change (the consistency tests then run against it).
export const API_SPEC_PATH = 'artifacts/05_arquitecture/API_SPEC_V1.yaml';
export const UX_SPEC_PATH = 'artifacts/04_ux/UX_SPEC_V2.md';

export const APP_ORIGIN = 'https://vetcare.test';

export function testConfig(overrides = {}) {
  return loadConfig({ NODE_ENV: 'test', APP_ORIGIN, ...overrides });
}

/** A logger that collects lines, so tests can assert what is (not) logged. */
export function memoryLogger() {
  const lines = [];
  return { logger: createLogger({ write: (line) => lines.push(line) }), lines };
}

export function fixedClock(iso) {
  let current = new Date(iso);
  return { now: () => current, set: (value) => (current = new Date(value)) };
}

/**
 * In-memory stand-in for the `session` / `account` queries used by resolveSession.
 * Keys are cookie tokens; the fake looks rows up by the SHA-256 hash like the real query.
 */
export function fakeSessionDb(sessions = {}) {
  const byHash = new Map();
  for (const [token, row] of Object.entries(sessions)) byHash.set(hashSessionToken(token).toString('hex'), row);
  const updates = [];
  return {
    updates,
    async query(text, params = []) {
      if (/^\s*SELECT s\.account_id/.test(text)) {
        const row = byHash.get(params[0].toString('hex'));
        return { rows: row ? [row] : [] };
      }
      if (/^\s*UPDATE session SET last_seen_at/.test(text)) {
        updates.push({ hash: params[0].toString('hex'), at: params[1] });
        return { rows: [] };
      }
      throw new Error(`Unexpected query in test: ${text}`);
    },
    async ping() {},
  };
}

/** Starts an Express app on an ephemeral port. Returns a fetch-based client and a close function. */
export async function startApp(app) {
  const server = await new Promise((resolve) => {
    const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
  });
  const baseUrl = `http://127.0.0.1:${server.address().port}`;
  return {
    baseUrl,
    request: (path, init) => fetch(`${baseUrl}${path}`, init),
    close: () => new Promise((resolve) => server.close(resolve)),
  };
}
