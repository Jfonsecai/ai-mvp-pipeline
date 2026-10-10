// Vercel entry point (ARCHITECTURE 5.5, P05-ASM-019): Vercel detects src/index.js and runs the
// default-exported Express app as ONE Vercel Function that serves /api/*. The client is static
// and comes from public/ (built by `npm run build`). Local development uses scripts/dev-server.js.
//
// UNVERIFIED on Vercel until the step-0 deployment (COND-001 / P05-ASM-012).
import { createApp } from './app.js';
import { createDatabase } from './db/database.js';
import { loadConfig } from './shared/config.js';
import { createLogger } from './shared/logger.js';

const config = loadConfig(process.env); // fails fast on a missing or invalid variable
const logger = createLogger();
const db = createDatabase({ databaseUrl: config.databaseUrl, logger });

export default createApp({ config, db, logger });
