// COMP-011 access point: the only place the backend creates database connections (TB-2, CR-024).
// The application uses DATABASE_URL (pooled). Migrations use DATABASE_URL_UNPOOLED (scripts/migrate.js).
//
// Rules inherited from Neon's transaction-mode pooler (CR-024): never SET session parameters
// (the time zone is handled in COMP-010), never LISTEN/NOTIFY, SQL PREPARE or session advisory locks.
import pg from 'pg';

/**
 * Creates the database handle. The pool is created on first use, so the application (and
 * /api/health) starts without a database; a missing DATABASE_URL then fails on use.
 *
 * @param {{ databaseUrl?: string, logger?: { error: Function } }} options
 */
export function createDatabase({ databaseUrl, logger } = {}) {
  /** @type {import('pg').Pool | undefined} */
  let pool;

  function getPool() {
    if (!databaseUrl) {
      // The message never includes connection details (CR-005, CR-020).
      throw new Error('DATABASE_URL is not configured');
    }
    if (!pool) {
      pool = new pg.Pool({
        connectionString: databaseUrl,
        // Small on purpose: each serverless instance keeps its own pool in front of the pooler.
        max: 5,
        idleTimeoutMillis: 10_000,
        // Neon's compute may need a few seconds to resume after 5 idle minutes (P05-RISK-014).
        connectionTimeoutMillis: 15_000,
      });
      // An idle client can fail (for example when compute scales to zero); do not crash the process.
      pool.on('error', () => logger?.error('database.idle_client_error'));
    }
    return pool;
  }

  return Object.freeze({
    /** @returns {Promise<import('pg').PoolClient>} for withTransaction (COMP-010). */
    connect: () => getPool().connect(),
    query: (text, params) => getPool().query(text, params),
    /** Round trip used by /api/health/db. Rejects if the database is unreachable or unconfigured. */
    async ping() {
      await getPool().query('SELECT 1');
    },
    async end() {
      if (pool) {
        const closing = pool;
        pool = undefined;
        await closing.end();
      }
    },
  });
}
