// Registration point for backend business modules (ARCHITECTURE 6.1, ADR-002).
//
// Each module exports `createRouter(deps)` returning an Express Router whose paths are written
// relative to `/api` and are listed in API_SPEC.yaml (for example `/auth/sign-in`). `deps` is
// { config, db, clock, logger, guard } (see src/app.js). Add the module to the array below.
//
// Register implemented business modules here; keep table ownership and cross-module rules in
// src/modules/README.md (ARCHITECTURE 7.3, CR-002, CR-015).
import { createIdentityRouter } from './identity/sign-up.js';
import { createProviderWorkingHoursRouter } from './provider/working-hours.js';

export const modules = [
  { createRouter: createIdentityRouter },
  { createRouter: createProviderWorkingHoursRouter },
];
