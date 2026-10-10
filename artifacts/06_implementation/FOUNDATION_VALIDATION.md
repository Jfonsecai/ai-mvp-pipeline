# Foundation Validation Report

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.2_foundation_validation.md` v1.0 |
| Report version | 1.0 |
| Validation date | 2026-10-10 |
| Project / repository | VetCare, `ai-mvp-pipeline`, branch `main`, uncommitted working tree |
| Inputs | `SYSTEM_PROMPT.md`; `ARCHITECTURE_V2.md` (READY); `ARCHITECTURE_VALIDATION_V2.md` (PASS_WITH_CONDITIONS); `PRIORITIZATION_v2.md`; `product_backlog_priori_v2.json`; `UX_SPEC_V2.md`; `UX_SPEC_VALIDATION_V2.md`; `API_SPEC_V1.yaml` and `DATA_MODEL_V1.md` (companion outputs, TD-20); `artifacts/06_implementation/IMPLEMENTATION_LOG.md`; the repository itself. Folder spelling and versioned names differ from the prompt text (`05_arquitecture`, `_V2`): a naming difference only. |
| Status reported by P06.1 | READY_WITH_ASSUMPTIONS |
| **Final validation status** | **PASS_WITH_WARNINGS** |

**Independence limitation (stated, not removed).** The implementation and this validation were produced
by the same AI assistant in the same session, and no separate reviewer agent or human has reviewed either.
To reduce that, this validation re-ran checks from a clean state, compared the log with the files on disk,
and ran failure-mode probes that the implementation phase had not run. It does not replace human review
(finding F-08).

## 2. Executive Summary

- **Architecture conformance.** The foundation conforms to the approved architecture for everything
  P06.1 is expected to establish: the stack (React, Express, PostgreSQL, `pg` with plain SQL, Vite, React
  Router), the same-origin SPA + `/api` topology, COMP-003, COMP-010, COMP-011 access, the migration
  from DATA_MODEL Appendix A, the 68 design tokens, and the security and configuration constraints
  CR-001/005/006/019/020/021/023/024/025. Three small deviations are declared and none changes a
  component, interface, data concept or ADR.
- **Readiness.** Ready for incremental story implementation **locally**. Hosted use (Vercel, Neon) is
  not yet verified, because the architecture's own condition COND-001 is open.
- **No scope violation.** No story is implemented. The only routes are two health checks, the module
  registry is empty, and the only business-table write in `src/` is the session last-use update.
- **Most important findings.** F-01 COND-001 not executed (MEDIUM); F-02 no request-shape validation
  mechanism in COMP-003 (MEDIUM); F-03 `APP_ORIGIN` for Preview deployments undecided (MEDIUM). Four
  LOW findings follow. No CRITICAL or HIGH finding.
- **Conditions** (section 10): none blocks starting story work on a local machine. W-1 to W-3 must be
  satisfied before the dependent work they name.

## 3. Validation Scope

**Examined:** root manifest, lockfile, scripts, `.env.example`, `.gitignore`, `.gitattributes`,
`vercel.json`; every file under `src/`, `scripts/`, `migrations/`, `client/`, `tests/`; `README.md` and
`src/modules/README.md`; the implementation log.

**User-story functionality was not required** and its absence is not reported as a defect. Missing
sign-up/sign-in/sign-out endpoints, screens SCR-UX-001 to -017, password hashing, search, booking, ordering,
COMP-UX components and CTR-008 are all out of foundation scope (P06.1 §4.2; ARCHITECTURE §15.1, TD-15).

**Could not be assessed:** behavior on Vercel (function packaging, `public/`, rewrite, `export default`
detection); behavior on Neon (pooled connections, cold start); PostgreSQL 16; Linux/CI; Argon2 on Vercel;
visual quality beyond the base styles (no components exist).

## 4. Verification Results

All commands were executed by this validation unless marked otherwise. Environment: Windows 10, Node 22.19.0,
npm 10.9.3; database checks against a throwaway local PostgreSQL 18.4 started for this session (trust
auth, 127.0.0.1) and stopped afterwards.

| ID | Criterion | Method / command | Result | Evidence and observations |
|---|---|---|---|---|
| R1 | Dependencies resolve from the lockfile | Deleted `node_modules` and `public`; `npm ci` | **PASSED** | Installed; "found 0 vulnerabilities" |
| R2 | Manifest coherence | `npm ls --depth=0` | **PASSED** | express 5.3.0, pg 8.23.1, yaml 2.9.1; client: react/react-dom 19.3.0, react-router-dom 7.18.4, vite 8.3.4, @vitejs/plugin-react 6.1.2; no missing or extraneous entries |
| R3 | Build | `npm run build` from the clean install | **PASSED** | 27 modules transformed; output in `public/` |
| R4 | Ignore rules | `git check-ignore -v` | **PASSED** | `.env`, `public/`, `node_modules/` ignored; `.env.example` not ignored |
| R5 | Tests with a database | `npm test` with `TEST_DATABASE_URL` set (final run after all edits) | **PASSED** | 60 tests, 60 pass, 0 fail, 0 skipped |
| R6 | Tests without a database | `npm test`; and via POSIX `sh` glob expansion | **PASSED** (53) / **NOT_RUN** (7) | 7 database tests skipped and reported as skipped. The `sh` run is not a Linux run. |
| R7 | Startup with minimal valid environment | import `src/index.js` with only `APP_ORIGIN` | **PASSED** | Loads without a database |
| R8 | Fail-fast configuration | import `src/index.js` with: no `APP_ORIGIN`; `FEATURES=oders`; `SESSION_IDLE_MINUTES=-5`; invalid `APP_ORIGIN` next to a connection string containing a password | **PASSED** | Each exits 1 with a specific message; the password never appears |
| R9 | Error and log hygiene with the database down | Production mode, `DATABASE_URL` with password pointing to a closed port; `curl` `/api/health/db` and a request with a cookie | **PASSED** | 500 `{"code":"UNEXPECTED"}`; logs carry `errorName` and `errorCode` (ECONNREFUSED) only; password absent from stdout, stderr and responses; `/api/health` still 200 |
| R10 | Scope boundary | `grep` for routes, registered modules, SQL writes, hashing/validation dependencies, Spanish copy | **PASSED** | Routes: only `/health` and `/health/db`; `modules = []`; the only write is `UPDATE session SET last_seen_at`; no argon2/bcrypt/ajv/cors/etc. in manifests; Spanish text only on the technical status page |
| R11 | Log reconciliation | File inventory and test counts compared with the log | **FAILED, then corrected** | The log said 43 new files and 21 HTTP tests; actual 44 (+ lockfile + log) and 22. Corrected in the log during this validation (F-04). All other counted claims matched: 60 tests = 5 + 7 + 7 + 2 + 22 + 7 + 10 |
| R12 | Migration CLI and runner | Evidence from the P06.1 run (V06, V07) and the database test suite, re-run in R5 | **PASSED** | Apply, idempotence, edited file rejected, failed file rolled back, CRLF tolerant |
| R13 | Client in a browser, proxy and Origin | Run by P06.1 (V09, V10); not repeated after the clean reinstall except the build (R3) | **PASSED** (observed in P06.1) | Treated as evidence from the implementation run, not independently repeated |
| R14 | Vercel deployment topology, deep-link rewrite, `export default` detection | — | **NOT_RUN** | No Vercel project available (COND-001 a, b) |
| R15 | Neon pooled/unpooled behavior | — | **NOT_RUN** | COND-001 d |
| R16 | Argon2id on Vercel | — | **NOT_RUN** | No hashing library yet; COND-001 c |
| R17 | PostgreSQL 16 / Linux | — | **NOT_RUN** | 18.4 on Windows only |
| R18 | Static analysis / lint | — | **NOT_RUN** | None configured; not required by the architecture |

## 5. Findings

No CRITICAL or HIGH findings were identified within the scope and evidence available. This does not imply
every risk is eliminated.

### F-01 — MEDIUM — Runtime/Startup (5.3), Architecture (5.1) — COND-001 is open

| Field | Content |
|---|---|
| Evidence | `ARCHITECTURE_VALIDATION_V2.md` §8 COND-001. `vercel.json`, `src/index.js` (default-exported app), the `public/` output and the SPA rewrite have only been exercised locally (R14–R16 NOT_RUN). Log U1 states this. |
| Why it matters | If Vercel does not combine the Express function, `public/` and the rewrite as assumed, deep links and `/api` routing fail. The architecture defines fallbacks (hash routing, bcrypt), so the cost is limited. |
| Corrective action | The DevOps role runs `README.md` "Deployment notes" on the real Vercel/Neon setup and records the outcome in ARCHITECTURE P05-ASM-012. |
| Verification to close | `/api/health` and `/api/health/db` answer on the deployed URL; static files come from `public/`; reloading `/estado-tecnico` works (or `HashRouter` is adopted); migration applies through `DATABASE_URL_UNPOOLED`; a transaction runs through `DATABASE_URL`; one Argon2id hash on the runtime (or bcrypt chosen). |
| Blocks | Hosted deployment and client-routing/Neon-dependent stories; not local story development |

### F-02 — MEDIUM — Application-layer foundation (5.5) — COMP-003 request-shape validation has no mechanism

| Field | Content |
|---|---|
| Evidence | ARCHITECTURE §6.2 COMP-003 lists "Validate the request shape: types, required fields, enumerations, lengths, as in API_SPEC.yaml". `src/app.js` only parses JSON; there is no validation helper or library (R10). Log U2 discloses it. |
| Why it matters | Five developers will implement the committed stories in parallel (PRIORITIZATION §7). Without one shared convention, each module validates differently, which risks the contract drift CR-026 and P05-RISK-003 exist to prevent. CR-003 still requires server-side validation. |
| Corrective action | Before the first story that accepts a request body, record the convention: either one shared helper (the choice of library is open, ARCHITECTURE §15.5) or an explicit per-module rule, and add it to `src/modules/README.md`. Not required to be done inside P06.1: introducing a library there would have been an unapproved dependency choice. |
| Verification to close | The convention is written in `src/modules/README.md` and the first story uses it, with a test for a rejected body. |
| Blocks | No (must be settled before the first body-accepting story merges; see W-2) |

### F-03 — MEDIUM — Security and configuration (5.6) — `APP_ORIGIN` on Vercel Preview deployments

| Field | Content |
|---|---|
| Evidence | `src/http/middleware.js` `originGuard` requires `Origin === APP_ORIGIN`; ARCHITECTURE §5.5 defines a single variable and P05-ASM-016 says Preview deployments use the `dev` database branch. Preview URLs differ per deployment. Log U3 discloses it. |
| Why it matters | On a Preview deployment whose URL differs from the configured `APP_ORIGIN`, every state-changing request returns `FORBIDDEN_ORIGIN`, which would make sign-up and every write fail during the three-day sprint. The guard itself is correct and must not be loosened. |
| Corrective action | Team decision before Previews are used to test writes: a stable per-environment value, or deriving the allowed origin from the deployment URL. Record it in ARCHITECTURE §5.5. |
| Verification to close | A POST on a Preview deployment succeeds with the chosen setting and still fails from a foreign origin. |
| Blocks | Preview-based testing of write flows only |

### F-04 — LOW — Log accuracy (5.10) — stale counts in the log (corrected)

| Field | Content |
|---|---|
| Evidence | R11: "43 new files" and "21 HTTP tests" versus 44 and 22. |
| Why it matters | Small, but the log must match the repository. |
| Corrective action | Done in `IMPLEMENTATION_LOG.md` during this validation, together with the V17 note about the POSIX-shell run. |
| Verification to close | Counts in the log equal R11. **Closed.** |

### F-05 — LOW — Architecture conformance (5.1) — deviations DEV-001 to DEV-003 need acknowledgement

| Field | Content |
|---|---|
| Evidence | DEV-001 `/api/health*` not in API_SPEC (`src/http/health.js`); DEV-002 `schema_migration` table not in DATA_MODEL (`src/db/migrator.js`); DEV-003 `/estado-tecnico` and the fallback redirect conflict with UX_SPEC §6.1 rule 1 (`client/src/App.jsx`). All three are declared in the log and none is presented as approved. |
| Why it matters | CR-026 says the implementation matches the contract; the team should know about three deliberate exceptions, and DEV-003 must not reach the demonstration. |
| Corrective action | Team acknowledges them (or adds the health endpoints to API_SPEC v1.1). US-003 replaces the fallback route; remove or guard `/estado-tecnico` then. |
| Verification to close | Acknowledgement recorded; after US-003, no route redirects unauthenticated users to the technical page. |
| Blocks | No |

### F-06 — LOW — Security (5.6) — public database health check

| Field | Content |
|---|---|
| Evidence | `src/http/health.js`: `GET /api/health/db` is unauthenticated and runs `SELECT 1`. It returns no detail (R9). Log U8. |
| Why it matters | Repeated calls resume Neon compute and use free-tier hours (P05-RISK-014/015). Information exposure is nil. |
| Corrective action | Optional: remove or protect before the demonstration. This is a recommendation, not an architectural requirement. |
| Verification to close | n/a if kept. |
| Blocks | No |

### F-07 — LOW — Runtime verification (5.3) — verification limits

| Field | Content |
|---|---|
| Evidence | R17, R18: PostgreSQL 18.4 on Windows only; no linter. DATA_MODEL Appendix B was verified on PostgreSQL 16.15 and the DDL uses only core features. |
| Why it matters | Differences between versions are unlikely to matter, but they are unverified. |
| Corrective action | Optional: CI in P08 runs the suite on Linux, including `TEST_DATABASE_URL`; add a linter if the team wants one. |
| Verification to close | A CI run. |
| Blocks | No |

### F-08 — INFO — Independence

Implementation and validation share one author (see section 1). A human review of ADR-014, ADR-016,
ADR-017 and P05-ASM-011 was already recommended by ARCHITECTURE_VALIDATION AV-008 and is still pending.

## 6. Architecture Conformance

**Conforming (verified in the repository):** modular monolith with module-owned data and an empty module
registry plus rules (ADR-002); stack as approved with no ORM and no extra framework (ADR-003); same-origin
SPA and JSON API with no CORS (ADR-004); DDL from Appendix A verbatim, checked by test (ADR-005, ADR-018);
session resolution per DATA_MODEL 5.2 (ADR-007); Bogotá time without database `SET`, integer pesos
(ADR-008); the 13-code outcome list and statuses equal API_SPEC, with only CTR-001 bodies leaving the
backend (ADR-011, CR-005); the 68 tokens equal UX_SPEC §4 in a single file (ADR-013, CR-012); Vercel entry,
no `express.static`, `public/` output, JSON error handler (ADR-014, CR-025); feature switches validated and
enforced as NOT_FOUND (ADR-017, CR-023); Origin/JSON guard (CR-021); identity only from the session
context and NOT_FOUND for the other account type (CR-001, CR-006, TB-3); no secrets and no sensitive log
fields (CR-019, CR-020); pooled URL for the app, unpooled only for migrations (CR-024).

**Deviations and approval status:** DEV-001, DEV-002, DEV-003 — declared, not architectural, **not yet
acknowledged by the team** (F-05). No unapproved material architectural decision was introduced.
JavaScript instead of TypeScript is within the stated implementation freedom (§15.5).

**Unresolved architectural conditions:** COND-001 (F-01), carried from the architecture validation.
Impact: hosted work only.

## 7. Security and Configuration Review

| Area | Result |
|---|---|
| Secrets in source and examples | None. Scan found only placeholders in `.env.example` and fake values inside leak-detection tests. |
| Configuration handling | Environment variables only; validation at start-up; `.env` ignored; defaults safe (no secret defaults; `NODE_ENV` defaults to development, and Vercel sets production). |
| Error exposure | Verified: JSON `UNEXPECTED` only; no stack, message or host in responses (tests, R9). |
| Logging | Verified: no query string, headers, body or sensitive field names; production omits error messages (tests, R9). |
| CSRF / cross-site | Origin equality and JSON body rule verified by tests and a live proxy request; the cookie flags belong to the sign-in stories (not yet present). |
| Authorization foundation | Feature → session → role order verified by tests; NOT_FOUND for wrong type or disabled feature. |
| Dependencies | `npm audit` 0 vulnerabilities (P06.1 V02 and again after `npm ci`). |
| Unverified | Secure/HttpOnly cookie behavior on HTTPS (no cookie is issued yet); security headers (a PROPOSAL in ARCHITECTURE §9.2, not required); production hosting settings. |

## 8. Implementation Log Accuracy

- Accurate: component table, deviations, verification table (every PASSED item was reproduced or is
  covered by a test that passed in R5), assumptions, unresolved items, scope-boundary statements.
- Corrected: file count and HTTP test count (F-04); V17 note.
- Unsupported claims: none found. V09 and V10 (browser) were observed in P06.1 and not repeated here (R13).
- Status `READY_WITH_ASSUMPTIONS` is consistent with the observed repository.

## 9. Readiness Assessment

**Technical foundation readiness:** ready. A developer can install, configure, migrate, run the API and the
client, run tests, and find where a story goes (`src/modules/README.md`, ARCHITECTURE §14.1). Module
boundaries, guards, error handling, transactions, time, configuration and the schema exist and are tested.

**Outstanding warnings and conditions:** F-01 (COND-001), F-02, F-03, F-05 to F-07; section 10.

**Intentionally unimplemented product functionality:** all 34 backlog items — in particular the 15
committed stories (US-001, -002, -003, -034, -008, -009, -010, -013, -016, -017, -018, -019, -020, -021,
-024) — the ordering package, sign-in/sign-out/session endpoints, COMP-UX components, CTR-008, hashing,
request validation helper and CI/CD. This is expected and is not a defect.

## 10. Required Corrective Actions

| ID | Action | Reason | Verification | Mandatory before proceeding? |
|---|---|---|---|---|
| W-1 | Execute COND-001 on Vercel + Neon and record it in ARCHITECTURE P05-ASM-012 (F-01) | Hosted assumptions unverified | See F-01 | **Before** deploying, or before stories rely on deep links, hosted DB, or Argon2 on Vercel. **Not** required to start local story development. |
| W-2 | Record the request-validation convention (F-02) | Parallel work, CR-026 | See F-02 | **Before the first story that accepts a request body is merged** (do it at P06.3 kickoff) |
| W-3 | Decide `APP_ORIGIN` handling for Preview deployments (F-03) | Writes fail otherwise | See F-03 | **Before Preview deployments are used to test writes** |
| W-4 | Acknowledge DEV-001 to DEV-003; remove/guard the technical page when US-003 lands (F-05) | CR-026, UX §6.1 | See F-05 | No; track |
| W-5 | Human review of ADR-014, ADR-016, ADR-017, P05-ASM-011 (F-08, AV-008) | Same-AI limitation | Review recorded | No; recommended |
| O-1 | Optional: remove or protect `/api/health/db` before the demonstration (F-06) | Neon compute use | — | No |
| O-2 | Optional: CI on Linux with PostgreSQL; linter (F-07) | Verification breadth | CI run | No |
| — | Commit the foundation (nothing is committed yet) | Work is only in the working tree | `git log` shows it | Practical prerequisite for the team to share it; not a validation criterion |

## 11. Final Decision

**PASS_WITH_WARNINGS**

The foundation conforms to the approved architecture, has no scope violation, passed every check that
could be executed locally (including a clean reinstall and failure-mode probes), and is ready for
incremental, local user-story implementation (P06.3). The warnings above require tracking. Conditions that
must be satisfied before specific work are W-1 (hosted work), W-2 (first body-accepting story) and W-3
(Preview write testing); none must be satisfied before P06.3 can begin. `PASS_WITH_WARNINGS` is not used to
bypass a blocker: no CRITICAL or HIGH finding exists.

## 12. Final Self-Check

- [x] The actual repository was inspected (clean reinstall, file inventory, greps, live probes).
- [x] The implementation log was checked against files and results (section 8).
- [x] Architecture approval and unresolved conditions were reviewed (section 6, F-01).
- [x] The foundation was evaluated against applicable decisions (section 6).
- [x] Missing user stories were not treated as defects (sections 3, 9).
- [x] Security, configuration, maintainability and readiness were evaluated (sections 7, 9).
- [x] Executed and unexecuted checks are distinguished (section 4).
- [x] Material findings carry evidence and corrective actions (section 5).
- [x] Optional recommendations are separated from mandatory corrections (section 10).
- [x] The final status follows the decision rules (section 11).
