// COMP-010 Shared Kernel - configuration read from environment variables (CR-019).
// Nothing secret has a default. Validation happens once, at start-up, so a bad value fails loudly.
import { parseFeatures } from './features.js';

function positiveInteger(name, raw, fallback) {
  if (raw === undefined || raw === '') return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer, got "${raw}".`);
  }
  return value;
}

function normalizeOrigin(raw) {
  let url;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`APP_ORIGIN must be an absolute URL such as https://example.com, got "${raw}".`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`APP_ORIGIN must use http or https, got "${url.protocol}".`);
  }
  return url.origin;
}

/**
 * @param {Record<string, string | undefined>} env usually process.env
 */
export function loadConfig(env) {
  const nodeEnv = env.NODE_ENV || 'development';
  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    throw new Error(`NODE_ENV must be development, test or production, got "${nodeEnv}".`);
  }

  if (!env.APP_ORIGIN) {
    throw new Error('APP_ORIGIN is required (state-changing requests are accepted only from it, CR-021).');
  }

  return Object.freeze({
    nodeEnv,
    isProduction: nodeEnv === 'production',
    appOrigin: normalizeOrigin(env.APP_ORIGIN),
    // Optional so the app (and /api/health) can start without a database. Database access then
    // fails with UNEXPECTED, never with a connection string in the message.
    databaseUrl: env.DATABASE_URL || undefined,
    features: parseFeatures(env.FEATURES),
    sessionIdleMinutes: positiveInteger('SESSION_IDLE_MINUTES', env.SESSION_IDLE_MINUTES, 60),
    sessionAbsoluteHours: positiveInteger('SESSION_ABSOLUTE_HOURS', env.SESSION_ABSOLUTE_HOURS, 12),
  });
}
