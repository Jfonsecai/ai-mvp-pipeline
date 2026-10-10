// COMP-010 Shared Kernel - transaction helper (CR-024).
// Runs a function on ONE checked-out pooled connection inside BEGIN/COMMIT. Row locks
// (FOR UPDATE / FOR SHARE) live as long as the transaction, which works through Neon's pooler.
// Do not use session-level SET, LISTEN, SQL PREPARE or session advisory locks (CR-024).

/**
 * @template T
 * @param {import('pg').Pool} pool
 * @param {(client: import('pg').PoolClient) => Promise<T>} work
 * @returns {Promise<T>}
 */
export async function withTransaction(pool, work) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // The original error is the one that matters.
    }
    throw error;
  } finally {
    client.release();
  }
}
