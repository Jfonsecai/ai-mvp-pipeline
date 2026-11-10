import { readFile, rm } from 'node:fs/promises';
import pg from 'pg';
import { stateFile } from './state.js';

export default async function globalTeardown() {
  const databaseUrl = process.env.TEST_DATABASE_URL;
  if (!databaseUrl) return;

  let contents;
  try {
    contents = await readFile(stateFile, 'utf8');
  } catch (error) {
    if (error.code === 'ENOENT') return;
    throw error;
  }
  const state = JSON.parse(contents);
  const admin = new pg.Client({ connectionString: databaseUrl });
  try {
    await admin.connect();
    await admin.query(`DROP SCHEMA IF EXISTS ${state.schema} CASCADE`);
  } finally {
    await admin.end();
    await rm(stateFile, { force: true });
  }
}
