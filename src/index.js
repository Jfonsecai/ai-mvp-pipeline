// Vercel entry point (ARCHITECTURE v3.0 5.5, ADR-014): vercel.json declares this file as a @vercel/node
// build, which turns the default-exported Express app into ONE Vercel Function serving /api/*. The client
// is static and comes from public/ (built by `npm run build`). Local development uses scripts/dev-server.js.
//
// Verified on Vercel: deployed on 2026-10-13, smoke-tested on 2026-10-14 (artifacts/08_deployment/DEPLOYMENT_VALIDATION_V2.md).
// The `express` import below is not used. It was added (commit 599ead6) so that Vercel recognizes this file
// as an Express entry point, and the app module is named application.js, not app.js, for the same reason
// (commit b308d6a). Whether the import is still needed with the current vercel.json was not tested: keep
// both until it is (change P05-CHG-001).
import express from 'express';
import { createApp } from './application.js';
import { createDatabase } from './db/database.js';
import { loadConfig } from './shared/config.js';
import { createLogger } from './shared/logger.js';

const config = loadConfig(process.env); // fails fast on a missing or invalid variable
const logger = createLogger();
const db = createDatabase({ databaseUrl: config.databaseUrl, logger });

export default createApp({ config, db, logger });
