// COMP-003 API Boundary - cross-cutting middleware.
// Business rules and ownership checks stay in the modules (ARCHITECTURE 6.2, CR-001); this file
// only enforces the boundary rules: origin, JSON, session context, feature switch, role.
import { Outcome } from '../shared/outcomes.js';
import { SESSION_COOKIE_NAME, readCookie } from '../modules/identity/sessions.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

/** API responses are per-user or per-moment; never let a browser or CDN reuse them. */
export function noStore(_req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}

/**
 * One log line per request: method, path without query string, status, outcome code, duration.
 * No headers, body or query string, so no personal data reaches the logs (CR-020).
 */
export function requestLogger(logger) {
  return (req, res, next) => {
    const started = process.hrtime.bigint();
    res.on('finish', () => {
      logger.info('request', {
        method: req.method,
        path: req.originalUrl.split('?')[0],
        status: res.statusCode,
        outcome: res.locals.outcome,
        durationMs: Number((process.hrtime.bigint() - started) / 1_000_000n),
      });
    });
    next();
  };
}

/**
 * CR-021 / P05-ASM-017: a state-changing request is accepted only with an Origin equal to
 * APP_ORIGIN and, if it has a body, a JSON content type. Combined with the SameSite=Lax cookie
 * this replaces CSRF tokens.
 */
export function originGuard(config) {
  return (req, _res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    if (req.get('origin') !== config.appOrigin) throw new Outcome('FORBIDDEN_ORIGIN');
    const hasBody =
      req.headers['transfer-encoding'] !== undefined || Number(req.headers['content-length'] ?? 0) > 0;
    if (hasBody && !req.is('application/json')) throw new Outcome('FORBIDDEN_ORIGIN');
    next();
  };
}

/**
 * TB-3: every request is resolved to a session context before any module runs.
 * `req.session` is { state: 'none' } | { state: 'expired' } | { state: 'active', accountId, accountType }.
 * @param {(token: string | undefined) => Promise<object>} resolve IF-014
 */
export function sessionContext(resolve) {
  return async (req, _res, next) => {
    req.session = await resolve(readCookie(req.headers.cookie, SESSION_COOKIE_NAME));
    next();
  };
}

/**
 * Route guard factory for modules, passed to them as `guard`. Checks run in this order:
 *   1. feature switch off -> NOT_FOUND (CR-023, the operation does not exist);
 *   2. no session -> UNAUTHENTICATED; expired session -> SESSION_EXPIRED;
 *   3. wrong account type -> NOT_FOUND, like a nonexistent resource (CR-006).
 * A route with neither `feature` nor `role` is public.
 *
 * @param {{ features: readonly string[] }} config
 */
export function createGuard(config) {
  /** @param {{ role?: 'owner' | 'provider', feature?: string, authenticated?: boolean }} [options] */
  return function guard({ role, feature, authenticated = role !== undefined } = {}) {
    return (req, _res, next) => {
      if (feature && !config.features.includes(feature)) throw new Outcome('NOT_FOUND');
      if (authenticated) {
        if (req.session.state === 'expired') throw new Outcome('SESSION_EXPIRED');
        if (req.session.state !== 'active') throw new Outcome('UNAUTHENTICATED');
        if (role && req.session.accountType !== role) throw new Outcome('NOT_FOUND');
      }
      next();
    };
  };
}
