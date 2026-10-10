// Applies SQL migrations from ./migrations using DATABASE_URL_UNPOOLED (direct connection).
//   npm run migrate           apply pending migrations
//   npm run migrate:status    list applied / pending / modified files (no changes)
// Run by the DevOps role before the deployment that needs the schema; never during the Vercel build.
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { migrate, migrationStatus } from '../src/db/migrator.js';

const directory = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
const statusOnly = process.argv.includes('--status');

if (process.env.VERCEL) {
  console.error('Refusing to run migrations inside a Vercel build or function (ARCHITECTURE 5.5).');
  process.exit(2);
}
if (!process.env.DATABASE_URL_UNPOOLED) {
  console.error('DATABASE_URL_UNPOOLED is required (direct connection; see .env.example).');
  process.exit(2);
}

const client = new pg.Client({ connectionString: process.env.DATABASE_URL_UNPOOLED });
try {
  await client.connect();
  if (statusOnly) {
    for (const { name, state } of await migrationStatus(client, directory)) console.log(`${state.padEnd(8)} ${name}`);
  } else {
    const applied = await migrate(client, directory, console.log);
    console.log(applied.length === 0 ? 'Nothing to apply.' : `Applied ${applied.length} migration(s).`);
  }
} catch (error) {
  // Print the error without the connection string.
  console.error(`Migration failed: ${error.code ? `[${error.code}] ` : ''}${error.message}`);
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
