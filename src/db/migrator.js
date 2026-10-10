// Minimal SQL migration runner (P05-ASM-015: plain SQL files, applied with the DIRECT connection,
// by the DevOps role, never during the build). No ORM, no extra dependency.
//
// It keeps its own bookkeeping table `schema_migration`. That table is tooling, not a business
// table, so it has no owning module (CR-002 does not apply; recorded as DEV-002 in IMPLEMENTATION_LOG).
//
// Rules: files are `NNN_name.sql`, applied in name order, each in one transaction. An applied
// file must never change (its checksum is stored); fix forward with a new file.
import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const FILE_PATTERN = /^\d{3,}_[a-z0-9_]+\.sql$/;
// Transaction-level advisory lock: serializes concurrent runs. Safe here because migrations use a
// direct connection, and it is released at commit (CR-024 only restricts the pooled app connection).
const LOCK_KEY = 7_265_001;

export async function listMigrationFiles(directory) {
  const names = await readdir(directory);
  return names.filter((name) => FILE_PATTERN.test(name)).sort();
}

async function ensureBookkeeping(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migration (
      name       text        PRIMARY KEY,
      checksum   text        NOT NULL,
      applied_at timestamptz NOT NULL DEFAULT now()
    )`);
}

// Line endings are normalized first, so a checkout with CRLF (Git autocrlf on Windows) does not
// look like an edited migration.
const checksumOf = (sql) => createHash('sha256').update(sql.replace(/\r\n/g, '\n'), 'utf8').digest('hex');

/**
 * Reports each migration file as applied or pending, and detects edited applied files.
 * @param {import('pg').ClientBase} client a direct (unpooled) connection
 * @param {string} directory
 */
export async function migrationStatus(client, directory) {
  await ensureBookkeeping(client);
  const { rows } = await client.query('SELECT name, checksum FROM schema_migration');
  const applied = new Map(rows.map((row) => [row.name, row.checksum]));
  const result = [];
  for (const name of await listMigrationFiles(directory)) {
    const sql = await readFile(join(directory, name), 'utf8');
    const stored = applied.get(name);
    if (stored === undefined) result.push({ name, state: 'pending' });
    else if (stored !== checksumOf(sql)) result.push({ name, state: 'modified' });
    else result.push({ name, state: 'applied' });
  }
  return result;
}

/**
 * Applies every pending migration. Throws if an applied migration was modified.
 * @param {import('pg').ClientBase} client a direct (unpooled) connection
 * @param {string} directory
 * @param {(message: string) => void} [log]
 * @returns {Promise<string[]>} names applied in this run
 */
export async function migrate(client, directory, log = () => {}) {
  await ensureBookkeeping(client);
  const appliedNow = [];
  for (const name of await listMigrationFiles(directory)) {
    const sql = await readFile(join(directory, name), 'utf8');
    const checksum = checksumOf(sql);
    await client.query('BEGIN');
    try {
      await client.query('SELECT pg_advisory_xact_lock($1)', [LOCK_KEY]);
      const { rows } = await client.query('SELECT checksum FROM schema_migration WHERE name = $1', [name]);
      if (rows.length > 0) {
        if (rows[0].checksum !== checksum) {
          throw new Error(`Migration ${name} was already applied but its file has changed. Add a new migration instead.`);
        }
        await client.query('ROLLBACK');
        log(`skip    ${name} (already applied)`);
        continue;
      }
      await client.query(sql);
      await client.query('INSERT INTO schema_migration (name, checksum) VALUES ($1, $2)', [name, checksum]);
      await client.query('COMMIT');
      appliedNow.push(name);
      log(`applied ${name}`);
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    }
  }
  return appliedNow;
}
