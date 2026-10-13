// Registration point for backend business modules (ARCHITECTURE 6.1, ADR-002).
//
// Each module exports `createRouter(deps)` returning an Express Router whose paths are written
// relative to `/api` and are listed in API_SPEC.yaml (for example `/auth/sign-in`). `deps` is
// { config, db, clock, logger, guard } (see src/application.js). Add the module to the array below.
//
// Register implemented business modules here; keep table ownership and cross-module rules in
// src/modules/README.md (ARCHITECTURE 7.3, CR-002, CR-015).
import { createIdentityRouter } from './identity/sign-up.js';
import { createProviderProfileRouter } from './provider/profile.js';
import { createProviderWorkingHoursRouter } from './provider/working-hours.js';
import { createCatalogRouter } from './catalog/offerings.js';
import { createSearchRouter } from './search/offerings.js';
import { createPublicProviderProfileRouter } from './search/provider-profile.js';
import { createPetsRouter } from './pets/owner-pet.js';
import { createBookingRouter } from './scheduling/booking.js';

export const modules = [
  { createRouter: createIdentityRouter },
  { createRouter: createProviderProfileRouter },
  { createRouter: createProviderWorkingHoursRouter },
  { createRouter: createCatalogRouter },
  { createRouter: createSearchRouter },
  { createRouter: createPublicProviderProfileRouter },
  { createRouter: createPetsRouter },
  { createRouter: createBookingRouter },
];
