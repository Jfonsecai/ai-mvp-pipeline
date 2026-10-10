# Backend modules

Where business functionality goes. The foundation (P06.1) implements **no user story**; this guide
shows where each future story belongs. Source: ARCHITECTURE v2.0 sections 6, 7 and 14, ADR-002,
CR-002, CR-015.

## How to add a module or story

1. Check the story's row in ARCHITECTURE section 14.1 and its operations in `API_SPEC.yaml`
   (`artifacts/05_arquitecture/API_SPEC_V1.yaml`, `x-vetcare-interface`).
2. Create `src/modules/<module>/` with `createRouter(deps)` returning an Express `Router`.
   Paths are relative to `/api` and exactly as in API_SPEC (for example `/auth/sign-in`).
   `deps` is `{ config, db, clock, logger, guard }`.
3. Register the module in [`index.js`](index.js).
4. Protect each route with `guard(...)` (see below). Put business rules and ownership checks in the
   module, not in the route handler or the client (CR-001, CR-003).
5. Report failures by throwing `new Outcome('CODE')` (`src/shared/outcomes.js`); never build error
   bodies by hand (CR-005).
6. Use `withTransaction(db, ...)` (`src/shared/transaction.js`) for multi-row writes and take the
   locks listed in DATA_MODEL section 7. Read time only from `clock.now()`.
7. Add tests; validate responses against the API_SPEC schemas (CR-026).

```js
import { Router } from 'express';

export function createRouter({ db, clock, guard }) {
  const router = Router();
  router.get('/example', guard({ role: 'owner', feature: 'orders' }), async (req, res) => {
    // req.session = { state: 'active', accountId, accountType } - the only source of "who" (TB-3)
    res.json({});
  });
  return router;
}
```

`guard(options)`:

| Option | Effect when it fails |
|---|---|
| `feature` (a name in `FEATURES`) | `NOT_FOUND` (the operation does not exist, CR-023). Checked first. |
| `role: 'owner' \| 'provider'` (implies authenticated) | no session `UNAUTHENTICATED`; expired `SESSION_EXPIRED`; other account type `NOT_FOUND` (CR-006) |
| `authenticated: true` without `role` | session required, any account type |
| (no options) | public route |

## Planned modules and the tables they own

Only COMP-004's session *resolution* exists. Everything else is created by the stories listed.

| Module | Component | Tables (DATA_MODEL) | Stories (committed) | Exists now |
|---|---|---|---|---|
| `identity/` | COMP-004 Identity and Access | `account`, `session` | US-001, US-002, US-003, US-034 | `sessions.js`: session resolution only (IF-014) |
| `pets/` | COMP-005 Pets | `pet` | US-001 (first pet) | no |
| `provider/` | COMP-006 Provider Profile and Working Hours | `provider_profile`, `working_hours` | US-002, US-008, US-009 | no |
| `catalog/` | COMP-007 Catalog | `offering` | US-010, US-013 (+ US-033) | no |
| `search/` | COMP-008 Search and Discovery | none (read-only) | US-016, US-017, US-018 | no |
| `scheduling/` | COMP-009 Scheduling | `appointment` | US-019, US-020, US-021, US-024 | no |
| `ordering/` | COMP-012 Ordering | `product_order` | US-027 to US-032 (behind feature switches) | no |

## Dependency rules (CR-002, CR-015, ARCHITECTURE 7.3)

- A module writes **only its own tables**. It reads another module's data only through that
  module's exported functions or read queries (IF-017, IF-019, IF-021, IF-022).
- Exactly three cross-module **commands** exist: COMP-004 to COMP-005 (IF-015) and COMP-004 to
  COMP-006 (IF-016) inside sign-up, and COMP-006 to COMP-009 (IF-018) inside the hours save. Plus
  the provider lock IF-024 (COMP-009 calls COMP-006, changes no data).
- No operation chains more than one command. Any new cross-module command needs an architecture change.
- `src/shared/` (COMP-010) depends on no module. No business rules go there.
- No business rule lives only in `src/http/` (COMP-003) or in the client.

## Database rules (CR-024)

The application uses the pooled `DATABASE_URL`. No session-level `SET` (the time zone is handled by
`src/shared/clock.js`), `LISTEN`/`NOTIFY`, SQL `PREPARE` or session advisory locks. Row locks
(`FOR UPDATE`, `FOR SHARE`) inside a transaction are fine. Never DELETE rows of pets, offerings,
appointments or orders (CR-018, CR-010).
