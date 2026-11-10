if (!process.env.TEST_DATABASE_URL) throw new Error('TEST_DATABASE_URL is required for browser E2E tests.');
const schema = process.env.VETCARE_E2E_SCHEMA;
if (!schema || !/^vetcare_e2e_[a-f0-9]{12}$/.test(schema)) {
  throw new Error('Playwright did not provide an isolated E2E schema name.');
}

const databaseUrl = new URL(process.env.TEST_DATABASE_URL);
databaseUrl.searchParams.set('options', `-c search_path=${schema}`);
process.env.DATABASE_URL = databaseUrl.toString();
process.env.NODE_ENV = 'test';

await import('../../scripts/dev-server.js');
