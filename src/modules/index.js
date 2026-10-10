// Registration point for backend business modules (ARCHITECTURE 6.1, ADR-002).
//
// Each module exports `createRouter(deps)` returning an Express Router whose paths are written
// relative to `/api` and are listed in API_SPEC.yaml (for example `/auth/sign-in`). `deps` is
// { config, db, clock, logger, guard } (see src/app.js). Add the module to the array below.
//
// Empty on purpose: the foundation implements no user story (P06.1 section 4.2). See
// src/modules/README.md for the planned modules, the tables each one owns and the allowed
// dependencies (ARCHITECTURE 7.3, CR-002, CR-015).
export const modules = [];
