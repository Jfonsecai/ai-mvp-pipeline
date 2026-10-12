# Deployment Guide

## 1. Document Metadata

- Version: 1.0
- Stage: P08 CI/CD Deployment
- Status: BLOCKED (see section 15)
- Source Revision: `5b6e18d` ("P07 executed", branch `main`) plus the P08 files listed below, which were **not committed** when this document was written
- Architecture Source: `artifacts/05_architecture/ARCHITECTURE_V2.md` (§5.5 Deployment View, §15.1 Step 0), `ARCHITECTURE_VALIDATION_V2.md`
- Test Source: `artifacts/07_qa/TEST_EXECUTION_REPORT.md`, `TEST_ANALYSIS_REPORT.md` (round 2, `PASS_WITH_WARNINGS`), `BUG_FIX_REPORT.md`
- Workflow: `.github/workflows/ci.yml` (P08-WF-001), `.github/workflows/post-deploy-smoke.yml` (P08-WF-002); deployment script `scripts/smoke-test.js` (P08-CHECK-001)
- Containerization: **none, by design** (P08-DOCKER-001: not applicable, see section 6)

P08 files added: `.github/workflows/ci.yml`, `.github/workflows/post-deploy-smoke.yml`, `scripts/smoke-test.js`, `artifacts/08_deployment/DEPLOYMENT.md`, `artifacts/08_deployment/evidence/*`. No application code, test, `package.json`, `vercel.json` or architecture file was changed.

Classification used below: FACT (supported by an artifact or by execution evidence), ASSUMPTION, DECISION, PROPOSAL, UNKNOWN.

## 2. Deployment Overview

**What is deployed.** The VetCare modular monolith: a React single-page client (built by Vite into `public/`) and one Express application (`src/index.js`, all routes under `/api`), backed by one PostgreSQL database. FACT (ARCHITECTURE §5.5, ADR-014).

**Where.** Vercel (Hobby plan, region `iad1`) for the client (CDN) and the API (one Vercel Function), and Neon (Free plan, AWS US East) for PostgreSQL, with branches `main` (demonstration) and `dev` (development and Preview). The accounts are managed by Fonseca. FACT (TD-14, ARCHITECTURE §5.5).

**How it is packaged.** There is no image or container. Vercel builds the commit itself with `npm run build` (configured in `vercel.json`), serves `public/**` from its CDN and runs `src/index.js` as the function. FACT (`vercel.json`, `src/index.js`).

**How the pipeline moves from source to deployment.**

```text
git push / pull request
   │
   ├─► GitHub Actions "CI" (P08-WF-001): npm ci → database guard → build → project tests → QA tests
   │        └─ required status check on main (branch protection, a manual repository setting)
   │
   └─► Vercel Git integration (the deployment mechanism of the architecture): builds the same commit
            and deploys it (Production for main, Preview for other branches)
                 │
                 └─► GitHub "deployment_status" event ─► "Post-deploy smoke test" (P08-WF-002):
                        scripts/smoke-test.js against the deployed application (read-only)
```

Database migrations are **not** part of this pipeline; they are applied manually before the deployment that needs them (section 8).

## 3. Prerequisites

| Need | Detail | Status |
|---|---|---|
| Runtime | Node.js 22 (`.nvmrc` = 22; `package.json` `engines.node` = `>=22`), npm 10+ | FACT |
| Repository | GitHub repository `Jfonsecai/ai-mvp-pipeline` (`origin`). The architecture recommends a public repository because of the Vercel Hobby rules (P05-ASM-011) | FACT (remote), the visibility is UNKNOWN |
| CI | GitHub Actions enabled on the repository | ASSUMPTION (the repository is on GitHub; the architecture does not name a CI product, see P08-ASSUMPTION-001) |
| Hosting | A Vercel project connected to the repository, and a Neon project with branches `main` and `dev` connected through the Vercel Marketplace | FACT (required by the architecture), **not verified to exist** |
| Permissions | Owner of the Vercel and Neon accounts (Fonseca); GitHub admin rights to enable branch protection and to set repository variables; DevOps role with the direct Neon connection string to run migrations | FACT (TD-14, P05-ASM-015) |
| Secrets | None are needed by the workflows. The Vercel/Neon credentials stay inside Vercel and Neon | FACT (this design) |

## 4. Architecture and Runtime Requirements

| Aspect | Requirement | Source |
|---|---|---|
| Components | Static client (COMP-001/002) on the Vercel CDN; Express API (COMP-003 to COMP-010, COMP-012) as one Vercel Function; PostgreSQL (COMP-011) on Neon | ARCHITECTURE §5.5, §6.1 |
| Entry point | `src/index.js` exports the Express app; there is no `listen()` on Vercel. `scripts/dev-server.js` is for local development only | `src/index.js` |
| Ports | None to configure on Vercel (HTTPS terminated by the platform). Local development: API 3000, Vite 5173 | `.env.example`, `vite.config.js` |
| Network | Browser to Vercel over HTTPS only; function to Neon through the **pooled** endpoint (`DATABASE_URL`); migrations through the **direct** endpoint (`DATABASE_URL_UNPOOLED`). No CORS: client and API share one origin | ADR-014, CR-021, CR-024 |
| Persistence | Neon PostgreSQL only. The function and the CDN hold no state. Sessions live in the database | ARCHITECTURE §5.5 |
| External services | Vercel, Neon, GitHub. No other third-party service | ARCHITECTURE §4.2 |
| Database locale | A **non-C** UTF-8 locale. Accent-insensitive search uses `lower()`, which does not fold non-ASCII capitals in the C locale | P07 finding F-06; reproduced locally |
| Database behavior | Neon compute scales to zero after 5 idle minutes; the first request can take several seconds. The pool waits up to 15 s to connect | P05-RISK-014, `src/db/database.js` |

## 5. Environment Configuration

Never put values in this document, in git or in a workflow file.

| Variable / Secret | Type | Required | Purpose | Source / Owner |
|---|---|---|---|---|
| `APP_ORIGIN` | PUBLIC CONFIGURATION, environment-specific | **Yes** (the app refuses to start without it) | The only origin allowed to make state-changing requests (CR-021). It must equal the public URL users open | Vercel project variable, per environment; Fonseca |
| `DATABASE_URL` | SECRET | Yes for any data access | Pooled Neon connection string used by the function | Injected by the Neon integration; Fonseca |
| `DATABASE_URL_UNPOOLED` | SECRET | Only to run migrations | Direct connection string used by `npm run migrate` | Neon integration; held by the DevOps role; **never** put in GitHub or Vercel build settings for CI |
| `FEATURES` | PUBLIC CONFIGURATION | No (empty = production default) | Ordering release switches (ADR-017). Must be empty in production (ARCHITECTURE §15.1 item 5) | Vercel project variable |
| `SESSION_IDLE_MINUTES` | PUBLIC CONFIGURATION | No (default 60) | Idle session limit (AC-114) | Vercel project variable |
| `SESSION_ABSOLUTE_HOURS` | PUBLIC CONFIGURATION | No (default 12) | Absolute session limit (AC-114) | Vercel project variable |
| `NODE_ENV` | PUBLIC CONFIGURATION | No (default `development`) | When `production`, error logs omit driver messages. Whether Vercel sets it to `production` for the function is UNKNOWN | Vercel (platform) |
| `PORT` | PUBLIC CONFIGURATION | No | Local API server only; ignored on Vercel | `.env.example` |
| `TEST_DATABASE_URL` | environment-specific | **Yes in CI** | Throwaway database for the database tests. Set by `ci.yml` to the service container. Locally: your own throwaway database | `ci.yml` / developer |
| GitHub repository variable `SMOKE_BASE_URL` | PUBLIC CONFIGURATION | Recommended | Public production domain for the smoke test (the unique deployment URL can be behind Vercel Deployment Protection) | GitHub, Settings > Variables; Fonseca |
| GitHub repository variable `APP_ORIGIN` | PUBLIC CONFIGURATION | **Yes** for the post-deploy smoke workflow | Same value as the Vercel `APP_ORIGIN`; enables the sign-in smoke check SMOKE-06. Without it the workflow fails on purpose | GitHub, Settings > Variables |
| `VERCEL` (set by the platform) | n/a | n/a | `npm run migrate` refuses to run when it is set (migrations never run inside Vercel) | Vercel |

Not used and not created: Vercel or Neon API tokens, registry credentials, SSH keys.

## 6. Docker Configuration

**None. P08-DOCKER-001: NOT APPLICABLE.** The approved architecture deploys to Vercel, which builds and runs the application itself and does not run user containers; no document in the project requires one. Creating a `Dockerfile` would introduce infrastructure the architecture does not contain (the P08 prompt allows this when containerization is not part of the approved approach). Consequently there is no base image, exposed port, volume or `.dockerignore`, and no Docker build or container run was performed. If the team later chooses a container target, that is a controlled architecture change (a new ADR), not a P08 detail.

## 7. CI/CD Workflow

### 7.1 `ci.yml` (P08-WF-001), name "CI"

Triggers: `push` to `main` and every `pull_request`. Permissions: `contents: read`. One job, `build-and-test`, 15-minute limit. Concurrency: a newer run of the same pull request cancels the older one; every push gets a group of its own (its commit SHA), so a push to `main` is never cancelled or replaced by a later push and each commit keeps its own finished check result.

1. **Checkout**: `actions/checkout@v4`.
2. **Environment setup**: `actions/setup-node@v4` with `node-version-file: .nvmrc` and npm cache. A `postgres:16` service container (default `en_US.utf8` locale, `trust` authentication, reachable only from the runner) provides `TEST_DATABASE_URL`.
3. **Install**: `npm ci` (uses `package-lock.json` only).
4. **Database guard**: fails the job if `TEST_DATABASE_URL` is unset or unreachable, or if the database locale does not fold `Ú` to `ú`. This prevents a green run in which the database tests were silently skipped (P07 finding W-4).
5. **Build**: `npm run build` (client bundle into `public/`).
6. **Tests, project suite**: `npm test` (175 tests, `tests/*.test.js`).
7. **Tests, QA suite**: `node --test "artifacts/07_qa/test_suites/**/*.test.js"` (143 tests).

Steps run in order and the first failure stops the job. **There is no deploy step in this workflow**, on purpose: deployment is performed by the Vercel Git integration (ARCHITECTURE §5.5). The gate between the two is a repository setting, see section 8.

### 7.2 `post-deploy-smoke.yml` (P08-WF-002), name "Post-deploy smoke test"

Triggers: GitHub `deployment_status` events, and `workflow_dispatch` as a manual fallback. An automatic run happens only when the state is `success` and the environment is `Production`; a manual run (Actions > Post-deploy smoke test > Run workflow) always runs and takes the URL to check as a required input, which is how to verify a deployment if the automatic event does not arrive or to re-check one. It checks out the deployed commit (`github.event.deployment.sha`; for a manual run, the revision the workflow was started from), installs Node from `.nvmrc` and runs `node scripts/smoke-test.js` with `BASE_URL` = the manual input, else `vars.SMOKE_BASE_URL`, else the deployment's `environment_url`. It sets `SMOKE_REQUIRE_ALL=1`, so **the job fails if any check is skipped**: in particular, the repository variable `APP_ORIGIN` must be defined and equal to the origin of the URL checked, otherwise SMOKE-06 (Argon2 and the database path) cannot run and the deployment is reported as not verified. It needs no secret and writes no data.

### 7.3 `scripts/smoke-test.js` (P08-CHECK-001)

Nine read-only checks: API health, database reachability, session endpoint and `no-store`, authentication guard, foreign-origin refusal, optional unknown-credentials sign-in (needs `APP_ORIGIN`; reported as SKIP when absent), client entry page, deep-link rewrite and `/api` NOT_FOUND staying JSON. `SMOKE_CHECKS=api|static|all`. Exit code 0 only if nothing failed; with `SMOKE_REQUIRE_ALL=1` a skipped check also gives a non-zero exit code (without the flag, as in a local run, a skipped check is only reported as SKIP).

## 8. Deployment Procedure

### 8.1 One-time setup (ARCHITECTURE §15.1 item 1; requires the account owner)

1. In Vercel, import the GitHub repository as one project. Leave the framework preset as detected and use `vercel.json` (`npm run build`).
2. In Neon, create the project in AWS US East with branches `main` and `dev`, and connect it to the Vercel project (this injects `DATABASE_URL` and `DATABASE_URL_UNPOOLED`). Scope the `main` branch to Production and `dev` to Preview.
3. Set in Vercel, per environment: `APP_ORIGIN` (the public URL), `FEATURES` (empty), and optionally the two session variables.
4. In GitHub, enable branch protection on `main` that **requires the status check `build-and-test`** and requires the branch to be up to date. Without this the CI result does **not** gate the Vercel production deployment.
5. In GitHub, set the repository variable `APP_ORIGIN` (required: the post-deploy workflow fails without it) and, recommended, `SMOKE_BASE_URL` (section 5).

### 8.2 Each release

1. Open a pull request. CI must pass; Vercel creates a Preview deployment.
2. If the release contains a new SQL file in `migrations/`, apply it **before** merging, by the DevOps role, to the target branch of Neon:
   ```bash
   DATABASE_URL_UNPOOLED=<direct connection string> npm run migrate:status   # lists applied / pending
   DATABASE_URL_UNPOOLED=<direct connection string> npm run migrate          # applies pending files, idempotent
   ```
   A file that was applied must never be edited (checksum check); fix forward with a new file. `npm run migrate` refuses to run on Vercel.
3. Merge to `main`. CI runs again on `main`; Vercel builds and deploys the production deployment of that commit.
4. The post-deploy smoke workflow runs by itself. Check it is green (section 9). If it did not start at all, run it by hand with the production URL (Actions > Post-deploy smoke test > Run workflow); a missing automatic run is not a successful verification.

No step of this procedure deletes data. The smoke test does not write.

## 9. Deployment Verification

| Check | How | Evidence status |
|---|---|---|
| Build | CI step "Build", exit code 0 | Executed locally on a clean copy (section 13); **not executed on GitHub Actions** |
| Tests | CI steps "Tests"; the guard proves the database tests ran | Executed locally on a clean copy; **not executed on GitHub Actions** |
| Deployment succeeded | Vercel deployment status "Ready" for the commit; the `deployment_status` event | **Not verified**: no Vercel project was reachable |
| Application usable | `scripts/smoke-test.js` against the deployed URL: `/api/health`, `/api/health/db` (a query through the pooled `DATABASE_URL`), the session and guard behavior, the foreign-origin refusal, the client page and the deep-link reload (P05-ASM-012) | Script executed locally against the real API (6/6 checks) and, through an emulated router standing in for Vercel's routing, 9/9; **never executed against a real deployment** |
| Argon2 on the platform | SMOKE-06 (needs the repository variable `APP_ORIGIN`; the workflow fails if it cannot run) | Not verified on Vercel |
| Deployed revision | The deployment event carries the commit SHA, which the smoke workflow checks out; the application itself does not expose its revision | Limited: no in-app version check exists |

Pending architecture assumptions that only a real deployment can settle: P05-ASM-012 (deep links with the SPA rewrite and the Express function), P05-ASM-019 (Vercel detecting `src/index.js`), ADR-006 (Argon2id native module on Vercel). `src/index.js` itself states "UNVERIFIED on Vercel".

## 10. Rollback / Recovery

- **Application:** Vercel keeps previous deployments, and a previous successful deployment can be promoted again from the Vercel dashboard ("Instant Rollback" in Vercel's product). ASSUMPTION: this capability was not exercised or verified here, and the plan limits for Hobby were not checked. Alternative, fully under git control: revert the commit on `main` through a pull request; the pipeline then rebuilds and redeploys the previous code.
- **Database:** migrations are forward-only and have no down scripts. Recovery from a bad migration is a new corrective migration. Neon's point-in-time/branch restore may help; it is not part of this repository and was not verified (ASSUMPTION).
- **Order matters:** if a release needed a migration, rolling the code back does not roll the schema back. Only one migration exists today (`001_initial_schema.sql`), so whether future migrations will stay compatible with older code is UNKNOWN and must be checked per release.
- **No automatic rollback exists** in the workflows.

## 11. Troubleshooting

| Symptom | Likely Cause | Verification | Action |
|---|---|---|---|
| CI fails at "Require the test database" | Service container not healthy, or database in the C locale | The job log prints the reason | Use the default `postgres` image locale; do not add `--locale=C` |
| CI green but few tests ran | `TEST_DATABASE_URL` removed from the workflow | Check the test count in the logs (175 + 143 expected) | Restore the variable; the guard step should already have failed |
| `/api/*` answers HTML or a Vercel login page in the smoke test | The unique deployment URL is protected by Vercel Deployment Protection | The response is not JSON | Set `SMOKE_BASE_URL` to the public production domain |
| `/api/health/db` answers 500 `UNEXPECTED` | `DATABASE_URL` missing or wrong, or Neon compute still resuming | Vercel function logs; retry after 15 s | Fix the variable in Vercel; the smoke test allows 30 s |
| Sign-in or sign-up answers `FORBIDDEN_ORIGIN` from the real site | `APP_ORIGIN` differs from the URL in the browser (scheme, host, port or a trailing path) | Compare both values | Set `APP_ORIGIN` exactly to the public origin for that environment |
| Every request fails at start-up | `APP_ORIGIN` unset for that Vercel environment (Preview needs its own value) | Function logs show "APP_ORIGIN is required" | Set the variable for Production and Preview |
| Reloading a client route such as `/estado-tecnico` shows an error | The SPA rewrite and the Express function do not combine as assumed (P05-RISK-013) | SMOKE-08 fails | Use the documented fallback: hash-based routing in the client (needs a controlled change) |
| Search ignores accents or capitals wrongly on a database | Database created in the C locale | `SELECT lower('Ú')` returns `Ú` | Create the database with a UTF-8 non-C locale |
| `npm run migrate` stops with "Refusing to run migrations inside a Vercel build" | The command was run where `VERCEL` is set | Environment | Run it from a developer or DevOps machine |
| First request after idle is slow | Neon scale-to-zero (P05-RISK-014) | Second request is fast | Open the application shortly before a demonstration |

## 12. Security Notes

- **No secret appears in the repository, workflows or this document.** The workflows use no repository secret. Connection strings live only in Vercel (injected by Neon) and in the DevOps role's environment.
- **`DATABASE_URL_UNPOOLED` is the most powerful credential** (direct database access). Do not store it as a GitHub secret or a Vercel build variable; run migrations from a controlled machine.
- **CI database:** `POSTGRES_HOST_AUTH_METHOD: trust` is acceptable only because the container is created per run, reachable from the runner alone, and holds no real data. Never use that setting for Neon or any shared database.
- **Permissions:** both workflows request `contents: read` only. Third-party actions are pinned to a major version tag (`@v4`), not to a commit SHA (Medium risk accepted for the MVP, P08-RISK-003).
- **Exposed interfaces:** HTTPS from Vercel. `/api/health` and `/api/health/db` are public technical endpoints that return only `ok` (DEV-001); the smoke test uses them.
- **The smoke test is read-only** and never sends real credentials; its sign-in check uses a fixed non-existent identity.
- **Repository visibility:** if the repository is public, `.env` must never be committed (it is ignored); logs must not contain connection strings (the application does not log them, verified in P07 TEST-SEC-041).
- Cookie `Secure` over real HTTPS and the Origin guard behind Vercel's proxy are verified only locally.

## 13. Traceability

| Deployment Element | Source |
|---|---|
| Target Vercel + Neon, GitHub as source | TD-14, ADR-003, ADR-014, ARCHITECTURE §4.2, §5.5 (FACT) |
| Single function from `src/index.js`, client in `public/` | P05-ASM-012, P05-ASM-019, `src/index.js`, `vercel.json`, `client/vite.config.js` |
| Build command `npm run build` | `package.json`, `vercel.json` |
| Test commands `npm test` and the QA suite command | `package.json`; `TEST_EXECUTION_REPORT.md` section 10 |
| Test database service and the guard step (P08-WF-001) | P07 findings W-4 and F-06; `tests/database.test.js` (skip behavior) |
| No Docker (P08-DOCKER-001) | ARCHITECTURE §5.5 (no container in the deployment view) |
| Migrations manual, never in build or CI | P05-ASM-015, `scripts/migrate.js`, `src/db/migrator.js` |
| Environment variables | `.env.example`, `src/shared/config.js`, ARCHITECTURE §5.5 table, CR-021, CR-024, ADR-017 |
| Smoke checks SMOKE-01..09 | `src/http/health.js` (DEV-001), API_SPEC_V1.yaml (`/session`), CR-006, CR-021, P05-ASM-012, P07 TEST-SEC-010 |
| Deployment gated by branch protection | P08 prompt rule "deployment depends on successful verification" (REFINED; a manual GitHub setting) |
| CI on GitHub Actions | P08-ASSUMPTION-001 |

Local execution evidence is in `artifacts/08_deployment/evidence/`:
`ci_local_emulation.txt` (clean copy, `npm ci`, guard, build, 175 + 143 tests against a trust-authenticated database), `ci_guard_negative_tests.txt` (guard fails when the variable is unset, the database is in the C locale or unreachable, and a failing test stops the job), `local_migration_and_smoke.txt` (migration status/apply/idempotency, API start, smoke test positive and negative cases).

## 14. Known Limitations and Assumptions

| ID | Type | Statement |
|---|---|---|
| P08-ASSUMPTION-001 | ASSUMPTION | GitHub Actions is the CI platform. The architecture names GitHub (repository) and Vercel (deployment) but no CI product |
| P08-ASSUMPTION-002 | ASSUMPTION | Vercel publishes `deployment_status` events with `environment` equal to "Production" and a usable `environment_url`. Not verified. Mitigated: the manual `workflow_dispatch` trigger lets anyone run the same check against a URL if the event does not arrive |
| P08-ASSUMPTION-003 | ASSUMPTION | The `postgres:16` image behaves like the local PostgreSQL 18 ICU cluster used for the local runs (both fold accents with `lower()`); the guard step checks this on every run |
| P08-RISK-001 | RISK | **The workflows have never run on GitHub Actions**, and no real Vercel or Neon deployment was made or inspected. All executed evidence is local |
| P08-RISK-002 | RISK | The CI result gates production only if branch protection with the required check is enabled, which is a manual GitHub setting. Otherwise Vercel deploys every push regardless of CI |
| P08-RISK-003 | RISK | Actions are pinned to major tags, not SHAs |
| P08-RISK-004 | RISK | "Build once, deploy the verified artifact" is not possible here: CI builds the commit to verify it, and Vercel builds the same commit again. The link between both is the commit SHA |
| P08-RISK-005 | RISK | `package.json` `engines.node` is `>=22`, open-ended; the Node version Vercel selects is UNKNOWN (CI uses 22) |
| P08-RISK-006 | RISK | The smoke test cannot confirm which revision the application is running; the app exposes no version |
| P08-RISK-007 | RISK | Client, hosted cookies (`Secure`), Argon2id on Vercel and the SPA rewrite remain unverified on the real platform (P05-ASM-012, ADR-006, COND-001) |
| P08-LIMIT-001 | LIMITATION | The static smoke checks were exercised against a local router that imitates `vercel.json`; that is an emulation of the routing rule, not Vercel |
| P08-LIMIT-002 | LIMITATION | Preview deployments are not smoke-tested (the workflow targets Production; previews may be behind Deployment Protection) |
| P08-LIMIT-003 | LIMITATION | The UI and non-functional requirements are untested (P07 findings F-04, W-3) |
| P08-LIMIT-004 | LIMITATION | The files of this stage were uncommitted when this guide was written |
| P08-CHANGE-001 | CHANGE LOG | After the first P08 validation (`DEPLOYMENT_VALIDATION.md`, which is kept unchanged as the record of that round): VAL-003 (a skipped smoke check no longer yields a green job: `SMOKE_REQUIRE_ALL`), VAL-004 (manual `workflow_dispatch` fallback) and VAL-006 (cancellation only for pull requests, per-commit group for pushes) were corrected in the workflows and `scripts/smoke-test.js`. Evidence: `evidence/val003_004_006_fix_verification.txt`. A validation re-run is required to close them; the workflow expressions themselves have not been evaluated by GitHub |

## 15. Deployment Status

**BLOCKED**

Exact blocker: the deployment itself cannot be executed or verified from this environment.

- No Vercel project or Neon project is available to this stage, and the account credentials belong to the account owner (Fonseca, TD-14). Entering them, creating the projects or pushing a commit that triggers a production deployment was not done.
- Consequently "Deployment succeeds" and "Deployment verification succeeds" (the P08 advance condition) have **no execution evidence**, and the workflows have not run on GitHub.

What is verified: build, the full test suites (175 + 143, all passing), the database guard, the migration procedure, the API start-up and the smoke test, all locally on a clean copy of the repository, with the negative cases failing as intended (section 13).

To unblock: someone with access performs section 8.1, merges these files, and the first CI and smoke-test runs on GitHub (plus the dashboard checks) are inspected. Then P08 validation can be re-run and the status moved to READY or READY_WITH_ASSUMPTIONS.
