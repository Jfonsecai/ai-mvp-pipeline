// COMP-003 API Boundary - builds the Express application (ARCHITECTURE 6.2, 5.5).
// Pure construction with injected dependencies, so tests and the Vercel entry (src/index.js)
// share one code path. No listening, no environment access.
import express from 'express';
import { createClock } from './shared/clock.js';
import { createLogger } from './shared/logger.js';
import { resolveSession } from './modules/identity/sessions.js';
import { modules as registeredModules } from './modules/index.js';
import { healthRouter } from './http/health.js';
import { createGuard, noStore, originGuard, requestLogger, sessionContext } from './http/middleware.js';
import { createErrorHandler, notFound } from './http/errors.js';

/**
 * @param {object} options
 * @param {ReturnType<import('./shared/config.js').loadConfig>} options.config
 * @param {ReturnType<import('./db/database.js').createDatabase>} options.db
 * @param {ReturnType<typeof createClock>} [options.clock]
 * @param {ReturnType<typeof createLogger>} [options.logger]
 * @param {Array<{ createRouter: (deps: object) => import('express').Router }>} [options.modules]
 */
export function createApp({
  config,
  db,
  clock = createClock(),
  logger = createLogger(),
  modules = registeredModules,
}) {
  const app = express();
  app.disable('x-powered-by');
  // Same-origin deployment (ADR-014): no CORS middleware by design. express.static() is not used
  // because Vercel ignores it; the client is served from public/ by the CDN (CR-025).

  app.use(requestLogger(logger));

  const api = express.Router();
  api.use(noStore);
  api.use(healthRouter(db));

  // Everything below runs for module routes only.
  api.use(originGuard(config));
  api.use(express.json({ limit: '100kb' }));
  api.use(
    sessionContext((token) =>
      resolveSession(db, token, clock.now(), { idleMinutes: config.sessionIdleMinutes }),
    ),
  );

  const deps = { config, db, clock, logger, guard: createGuard(config) };
  for (const module of modules) api.use(module.createRouter(deps));

  api.use(notFound);
  app.use('/api', api);
  app.use(notFound);
  app.use(createErrorHandler({ logger, logDetails: !config.isProduction }));

  return app;
}
