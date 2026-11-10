import { defineConfig, devices } from '@playwright/test';
import { randomUUID } from 'node:crypto';

const appOrigin = 'http://127.0.0.1:5173';
const testSchema = `vetcare_e2e_${randomUUID().replaceAll('-', '').slice(0, 12)}`;
process.env.VETCARE_E2E_SCHEMA = testSchema;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  globalSetup: './tests/e2e/global-setup.js',
  globalTeardown: './tests/e2e/global-teardown.js',
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: appOrigin,
    browserName: 'chromium',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node tests/e2e/start-api.js',
      url: 'http://127.0.0.1:3000/api/health',
      timeout: 30_000,
      reuseExistingServer: false,
      env: {
        APP_ORIGIN: appOrigin,
        NODE_ENV: 'test',
        PORT: '3000',
        VETCARE_E2E_SCHEMA: testSchema,
      },
    },
    {
      command: 'npm run dev --workspace client -- --host 127.0.0.1',
      url: appOrigin,
      timeout: 30_000,
      reuseExistingServer: false,
    },
  ],
});
