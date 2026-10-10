// Technical verification endpoints (P06.1 section 4.1: health checks). They are NOT product
// functionality and are not part of API_SPEC.yaml v1.0 (deviation DEV-001 in IMPLEMENTATION_LOG).
// They return no configuration, version or connection detail.
//
//   GET /api/health     the Express function is running (no database access)
//   GET /api/health/db  one round trip to PostgreSQL (SELECT 1) through DATABASE_URL
//
// Used by the step-0 deployment checks (ARCHITECTURE 15.1 item 3, COND-001): /api routing,
// static files and a query through the pooled connection.
import { Router } from 'express';

/** @param {{ ping: () => Promise<void> }} db */
export function healthRouter(db) {
  const router = Router();

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  router.get('/health/db', async (_req, res) => {
    await db.ping(); // a failure becomes UNEXPECTED (500) in the final error handler
    res.json({ status: 'ok', database: 'ok' });
  });

  return router;
}
