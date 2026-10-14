# Deployment Guide

## 1. Document Metadata

- Version: 2.0 (re-run of P08 on 2026-10-14, after the application was deployed; version 1.0 of 2026-10-12 was `BLOCKED` and is superseded by this file)
- Stage: P08 CI/CD Deployment
- Status: READY_WITH_ASSUMPTIONS (see section 15)
- Source Revision: `8c439b7` (`main`, "Merge pull request #7 from Jfonsecai/docs"). This is the commit that Vercel deployed to Production on 2026-10-13T22:20:50Z and that the CI and smoke runs of section 9 verified. Changes made after the CI and smoke evidence of that commit, none of them committed when this was written: both workflows (runner pinned to `ubuntu-24.04`, `actions/checkout` and `actions/setup-node` moved from `v4` to `v7`, section 7), a comment in `src/index.js`, and the documents of this re-run. **The changed workflows have not run on GitHub yet**; the executed evidence of sections 7 and 9 was produced with the previous workflow versions.
- Architecture Source: `artifacts/05_architecture/ARCHITECTURE_V3.md` (v3.0, 2026-10-14: §1.4 change P05-CHG-001, §5.5 Deployment View, §15.1 Step 0), which corrects the deployment view of `ARCHITECTURE_V2.md`; `ARCHITECTURE_VALIDATION_V2.md` for everything that did not change
- Test Source: `artifacts/07_qa/TEST_EXECUTION_REPORT.md`, `TEST_ANALYSIS_REPORT.md` (round 2, `PASS_WITH_WARNINGS`), `BUG_FIX_REPORT.md`, plus the executions of this re-run (section 9)
- Workflow: `.github/workflows/ci.yml` (P08-WF-001), `.github/workflows/post-deploy-smoke.yml` (P08-WF-002); deployment verification script `scripts/smoke-test.js` (P08-CHECK-001); deployment configuration `vercel.json` (P08-DEPLOY-001)
- Containerization: **none, by design** (P08-DOCKER-001: not applicable, see section 6)

Classification used below: FACT (supported by an artifact or by execution evidence), ASSUMPTION, DECISION, PROPOSAL, UNKNOWN.

**What changed since version 1.0.** Version 1.0 could not verify any deployment: no Vercel or Neon project existed for this stage and the workflows had never run. Since then the account owner connected the repository to Vercel and Neon and the team fixed the deployment until it worked (commits `b308d6a`, `599ead6`, `87bad3c`, `9efd49e`, `0d232d1`). This version documents the state that actually exists and the evidence for it. Four things in version 1.0 were wrong or unknown and are corrected here:

1. `vercel.json` no longer uses `buildCommand` + `rewrites`. It uses explicit `builds` and `routes` (section 4, P08-DEPLOY-001). Vercel did **not** auto-detect `src/index.js` as the architecture assumed (P05-ASM-019); the architecture was corrected in `ARCHITECTURE_V3.md` (P05-CHG-001).
2. `src/app.js` was renamed `src/application.js` and `src/index.js` imports `express` (unused) so that Vercel stops mis-detecting the entry point. These are application files changed only for deployment reasons; no behavior changed (the 175 + 143 tests still pass).
3. The workflows have now run on GitHub Actions (CI: green on the deployed commit; smoke test: green on Production after five failed attempts).
4. The assumptions P05-ASM-012 (deep links), ADR-006 (Argon2id on Vercel) and P08-ASSUMPTION-002 (`deployment_status` events) are now settled by execution (section 9).

## 2. Deployment Overview

**What is deployed.** The VetCare modular monolith: a React single-page client (built by Vite into `public/`) and one Express application (`src/index.js` exporting the app built in `src/application.js`, all routes under `/api`), backed by one PostgreSQL database. FACT (ARCHITECTURE §5.5, ADR-014).

**Where.** Vercel (Hobby plan, region `iad1`) for the client (CDN) and the API (one Vercel Function), and Neon (Free plan, AWS US East) for PostgreSQL. The accounts are managed by Fonseca. Production serves the public domain `https://vetcare-mvp.vercel.app` (the repository's homepage field on GitHub); every deployment also gets a unique `https://vetcare-<id>-jfonsecais-projects.vercel.app` URL. FACT (TD-14, ARCHITECTURE §5.5; deployments and domain observed through the GitHub API and HTTP).

**How it is packaged.** There is no image or container. Vercel builds the commit itself: `@vercel/static-build` runs `npm run build` and publishes `public/`; `@vercel/node` packages `src/index.js` as the function. FACT (`vercel.json`).

**How the pipeline moves from source to deployment.**

```text
git push / pull request
   │
   ├─► GitHub Actions "CI" (P08-WF-001): npm ci → database guard → build → project tests → QA tests
   │        └─ required-check gate on main: NOT ENFORCED today (section 14, P08-RISK-002)
   │
   └─► Vercel Git integration (the deployment mechanism of the architecture): builds the same commit
            and deploys it (Production for main, Preview for other branches)
                 │
                 └─► GitHub "deployment_status" event ─► "Post-deploy smoke test" (P08-WF-002):
                        scripts/smoke-test.js against https://vetcare-mvp.vercel.app (read-only, Production only)
```

CI and the Vercel deployment start in parallel from the same push; neither waits for the other (observed: the Production deployment of `8c439b7` was created at 22:20:50Z while its CI run finished at 22:21:23Z). Database migrations are **not** part of this pipeline; they are applied manually before the deployment that needs them (section 8).

## 3. Prerequisites

| Need | Detail | Status |
|---|---|---|
| Runtime | Node.js 22 (`.nvmrc` = 22; `package.json` `engines.node` = `>=22`), npm 10+ | FACT |
| Repository | GitHub repository `Jfonsecai/ai-mvp-pipeline` (`origin`), **public** | FACT (observed through the unauthenticated GitHub API) |
| CI | GitHub Actions enabled on the repository | FACT (runs observed; CI platform choice itself remains P08-ASSUMPTION-001) |
| Hosting | A Vercel project connected to the repository, and a Neon project connected through the Vercel Marketplace | FACT (deployments created by `vercel[bot]`; `/api/health/db` answers through `DATABASE_URL`) |
| Permissions | Owner of the Vercel and Neon accounts (Fonseca); GitHub admin rights to change branch protection and repository variables; DevOps role with the direct Neon connection string to run migrations | FACT (TD-14, P05-ASM-015) |
| Secrets | None are needed by the workflows. The Vercel/Neon credentials stay inside Vercel and Neon | FACT (this design) |

## 4. Architecture and Runtime Requirements

| Aspect | Requirement | Source |
|---|---|---|
| Components | Static client (COMP-001/002) on the Vercel CDN; Express API (COMP-003 to COMP-010, COMP-012) as one Vercel Function; PostgreSQL (COMP-011) on Neon | ARCHITECTURE §5.5, §6.1 |
| Entry point | `src/index.js` default-exports the Express app created by `createApp` in `src/application.js`; there is no `listen()` on Vercel. `scripts/dev-server.js` is for local development only. `src/index.js` carries an unused `import express` that exists only so Vercel recognizes the file (commit `599ead6`); the file was `src/app.js` before commit `b308d6a` | `src/index.js`, git history |
| Vercel configuration (P08-DEPLOY-001) | `builds`: `package.json` with `@vercel/static-build` (`distDir: public`; Vercel runs the `build` script) and `src/index.js` with `@vercel/node`. `routes`: `/api/(.*)` → `/src/index.js`; then the filesystem (static files of `public/`); then everything else → `/index.html` (SPA deep links). `builds` is a legacy Vercel property that the Vercel documentation recommends against, and `handle: filesystem` in `routes` is deprecated; both still work (ARCHITECTURE_V3 P05-RISK-020). The documentation does not say whether `builds` overrides the project settings of the build command, so this file is treated as the intended definition of the build | `vercel.json` (FACT), SMOKE-01/07/08/09 on the real platform (FACT) |
| Ports | None to configure on Vercel (HTTPS terminated by the platform). Local development: API 3000, Vite 5173 | `.env.example`, `client/vite.config.js` |
| Network | Browser to Vercel over HTTPS only (HSTS header observed); function to Neon through the **pooled** endpoint (`DATABASE_URL`); migrations through the **direct** endpoint (`DATABASE_URL_UNPOOLED`). No CORS: client and API share one origin | ADR-014, CR-021, CR-024 |
| Persistence | Neon PostgreSQL only. The function and the CDN hold no state. Sessions live in the database | ARCHITECTURE §5.5 |
| External services | Vercel, Neon, GitHub. No other third-party service | ARCHITECTURE §4.2 |
| Database locale | A **non-C** UTF-8 locale. Accent-insensitive search uses `lower()`, which does not fold non-ASCII capitals in the C locale. CI checks this on its own throwaway database; the Neon database locale was not inspected (UNKNOWN) | P07 finding F-06 |
| Database behavior | Neon compute scales to zero after 5 idle minutes; the first request can take several seconds. The pool waits up to 15 s to connect | P05-RISK-014, `src/db/database.js` |
| Deployment Protection | Vercel Authentication protects the **unique** deployment URLs (HTTP 302 to `vercel.com/sso-api`, observed on the Production deployment URL of `8c439b7`). The public domain is not protected. Preview deployments are protected the same way | observed 2026-10-14 |

## 5. Environment Configuration

Never put values in this document, in git or in a workflow file.

| Variable / Secret | Type | Required | Purpose | Source / Owner |
|---|---|---|---|---|
| `APP_ORIGIN` | PUBLIC CONFIGURATION, environment-specific | **Yes** (the app refuses to start without it) | The only origin allowed to make state-changing requests (CR-021). It must equal the public URL users open. Confirmed working in Production: SMOKE-05 and SMOKE-06 pass | Vercel project variable, per environment; Fonseca |
| `DATABASE_URL` | SECRET | Yes for any data access | Pooled Neon connection string used by the function. Confirmed working in Production (SMOKE-02) | Injected by the Neon integration; Fonseca |
| `DATABASE_URL_UNPOOLED` | SECRET | Only to run migrations | Direct connection string used by `npm run migrate` | Neon integration; held by the DevOps role; **never** put in GitHub or Vercel build settings for CI |
| `FEATURES` | PUBLIC CONFIGURATION | No (empty = production default) | Ordering release switches (ADR-017). Must be empty in production (ARCHITECTURE §15.1 item 5). The value set in Vercel was not inspected (UNKNOWN) | Vercel project variable |
| `SESSION_IDLE_MINUTES` | PUBLIC CONFIGURATION | No (default 60) | Idle session limit (AC-114) | Vercel project variable |
| `SESSION_ABSOLUTE_HOURS` | PUBLIC CONFIGURATION | No (default 12) | Absolute session limit (AC-114) | Vercel project variable |
| `NODE_ENV` | PUBLIC CONFIGURATION | No (default `development`) | When `production`, error logs omit driver messages. Whether Vercel sets it to `production` for the function is UNKNOWN | Vercel (platform) |
| `PORT` | PUBLIC CONFIGURATION | No | Local API server only; ignored on Vercel | `.env.example` |
| `TEST_DATABASE_URL` | environment-specific | **Yes in CI and for any complete local test run** | Throwaway database for the database tests. Set by `ci.yml` to the service container. Locally: your own throwaway database. `node --test` does not read `.env`: export it yourself for the QA suite (otherwise 116 of its 143 tests are reported SKIP) | `ci.yml` / developer |
| GitHub repository variable `SMOKE_BASE_URL` | PUBLIC CONFIGURATION | Recommended | Public production domain for the smoke test (the unique deployment URL is behind Vercel Authentication). In use: the smoke runs on Production pass against the public domain | GitHub, Settings > Variables; Fonseca |
| GitHub repository variable `APP_ORIGIN` | PUBLIC CONFIGURATION | **Yes** for the post-deploy smoke workflow | Same value as the Vercel `APP_ORIGIN`; enables SMOKE-06. Without it the workflow fails on purpose (`SMOKE_REQUIRE_ALL`). Confirmed defined: SMOKE-06 passes in the green runs | GitHub, Settings > Variables |
| `BASE_URL` (smoke script / workflow environment) | PUBLIC CONFIGURATION | **Yes** to run `scripts/smoke-test.js` | Deployed origin to check, without a trailing path. The workflow fills it from the manual input, else `SMOKE_BASE_URL`, else the deployment's `environment_url` | Workflow / the person running the script |
| `SMOKE_REQUIRE_ALL` (smoke script / workflow environment) | PUBLIC CONFIGURATION | No (the workflow sets `1`) | `1` turns a skipped check into a failure | `post-deploy-smoke.yml` |
| `SMOKE_CHECKS` (smoke script) | PUBLIC CONFIGURATION | No (default `all`) | `api`, `static` or `all`: which group of checks runs | The person running the script |
| `VERCEL` (set by the platform) | n/a | n/a | `npm run migrate` refuses to run when it is set (migrations never run inside Vercel) | Vercel |

Not used and not created: Vercel or Neon API tokens, registry credentials, SSH keys.

## 6. Docker Configuration

**None. P08-DOCKER-001: NOT APPLICABLE.** The approved architecture deploys to Vercel, which builds and runs the application itself and does not run user containers; no document in the project requires one. Creating a `Dockerfile` would introduce infrastructure the architecture does not contain (the P08 prompt allows this when containerization is not part of the approved approach). Consequently there is no base image, exposed port, volume or `.dockerignore`, and no Docker build or container run was performed. The real deployment (section 9) confirms that this target works without a container. If the team later chooses a container target, that is a controlled architecture change (a new ADR), not a P08 detail.

## 7. CI/CD Workflow

### 7.1 `ci.yml` (P08-WF-001), name "CI"

Triggers: `push` to `main` and every `pull_request`. Permissions: `contents: read`. One job, `build-and-test`, 15-minute limit, `runs-on: ubuntu-24.04` (changed on 2026-10-14 from `ubuntu-latest`). Concurrency: a newer run of the same pull request cancels the older one; every push gets a group of its own (its commit SHA), so a push to `main` is never cancelled or replaced by a later push and each commit keeps its own finished check result.

1. **Checkout**: `actions/checkout@v7` (was `@v4` in the executed runs).
2. **Environment setup**: `actions/setup-node@v7` (was `@v4` in the executed runs) with `node-version-file: .nvmrc` and npm cache. A `postgres:16` service container (default `en_US.utf8` locale, `trust` authentication, reachable only from the runner) provides `TEST_DATABASE_URL`.
3. **Install**: `npm ci` (uses `package-lock.json` only).
4. **Database guard**: fails the job if `TEST_DATABASE_URL` is unset or unreachable, or if the database locale does not fold `Ú` to `ú`. This prevents a green run in which the database tests were silently skipped (P07 finding W-4).
5. **Build**: `npm run build` (client bundle into `public/`).
6. **Tests, project suite**: `npm test` (175 tests, `tests/*.test.js`).
7. **Tests, QA suite**: `node --test "artifacts/07_qa/test_suites/**/*.test.js"` (143 tests).

Steps run in order and the first failure stops the job. **There is no deploy step in this workflow**, on purpose: deployment is performed by the Vercel Git integration (ARCHITECTURE §5.5). The gate between the two is a repository setting, see sections 8 and 14. Executed on GitHub: 19 CI runs, 17 green; the two red runs are pull requests opened by the Copilot agent on its "Initial plan" commits, which ended with no job executed; the next commit of each was green. The run for `8c439b7` executed every step successfully.

### 7.2 `post-deploy-smoke.yml` (P08-WF-002), name "Post-deploy smoke test"

Triggers: GitHub `deployment_status` events, and `workflow_dispatch` as a manual fallback. An automatic run happens only when the state is `success` and the environment is `Production`; a manual run (Actions > Post-deploy smoke test > Run workflow) always runs and takes the URL to check as a required input. It checks out the deployed commit (`github.event.deployment.sha`), installs Node from `.nvmrc` and runs `node scripts/smoke-test.js` with `BASE_URL` = the manual input, else `vars.SMOKE_BASE_URL`, else the deployment's `environment_url`. It sets `SMOKE_REQUIRE_ALL=1`, so **the job fails if any check is skipped**. Because the unique `environment_url` is behind Vercel Authentication, the repository variable `SMOKE_BASE_URL` (public domain) is what makes the check work; with only the fallback the smoke test would hit the login wall and fail (SMOKE-01 reports it).

Executed on GitHub: the event does arrive. Of 30 runs, 20 on Preview deployments were skipped by design, 3 on failed Production deployments were skipped (state `failure`), 5 Production runs failed and the last 2 (`73e009c`, `8c439b7`) succeeded. The manual `workflow_dispatch` path has never been used.

### 7.3 `scripts/smoke-test.js` (P08-CHECK-001)

Nine read-only checks: API health, database reachability, session endpoint and `no-store`, authentication guard, foreign-origin refusal, unknown-credentials sign-in (needs `APP_ORIGIN`; exercises the Argon2 verification and a database query), client entry page, deep-link rewrite and `/api` NOT_FOUND staying JSON. `SMOKE_CHECKS=api|static|all`. Exit code 0 only if nothing failed; with `SMOKE_REQUIRE_ALL=1` a skipped check also gives a non-zero exit code.

## 8. Deployment Procedure

### 8.1 One-time setup (ARCHITECTURE §15.1 item 1; requires the account owner) - already done

State found on 2026-10-14 (observed, not re-performed):

1. The GitHub repository is connected to a Vercel project; the deployments of `main` are Production, every other branch is Preview. `vercel.json` provides the build configuration (section 4).
2. A Neon database is connected (`DATABASE_URL` works). Whether the `main`/`dev` branch split of the architecture is in place was not inspected (UNKNOWN).
3. Repository variables `APP_ORIGIN` and `SMOKE_BASE_URL` are defined (the smoke runs pass with `SMOKE_REQUIRE_ALL=1`).
4. **Not done: the required status check.** The public GitHub API reports `protected: true` for `main` but `required_status_checks` with enforcement `off` and no contexts. To turn the CI result into a real gate, the repository admin must enable, on `main`, branch protection that requires the status check `build-and-test` and that the branch is up to date. Even then, Vercel starts the Production deployment at the push in parallel; the gate then only prevents a failing commit from being **merged**, because merges happen only through pull requests. Document the setting once enabled (a screenshot or `gh api repos/Jfonsecai/ai-mvp-pipeline/branches/main/protection`).

To repeat the setup on a new Vercel/Neon account: import the repository as one project (the `vercel.json` `builds` are used), connect Neon through the Vercel Marketplace scoping its main branch to Production, set `APP_ORIGIN` (the public URL) and an empty `FEATURES` per environment, then set the two repository variables.

### 8.2 Each release

1. Open a pull request. CI must pass (merge only when it is green); Vercel creates a Preview deployment.
2. If the release contains a new SQL file in `migrations/`, apply it **before** merging, by the DevOps role, to the target branch of Neon:
   ```bash
   DATABASE_URL_UNPOOLED=<direct connection string> npm run migrate:status   # lists applied / pending
   DATABASE_URL_UNPOOLED=<direct connection string> npm run migrate          # applies pending files, idempotent
   ```
   A file that was applied must never be edited (checksum check); fix forward with a new file. `npm run migrate` refuses to run on Vercel.
3. Merge to `main`. CI runs again on `main`; Vercel builds and deploys the production deployment of that commit.
4. The post-deploy smoke workflow runs by itself. Check it is green (section 9). If it did not start at all, run it by hand with `https://vetcare-mvp.vercel.app` (Actions > Post-deploy smoke test > Run workflow); a missing automatic run is not a successful verification. A Vercel status "Ready" is not sufficient either: twice the deployment was "Ready" and the smoke test caught that the application was not usable (section 9).

No step of this procedure deletes data. The smoke test does not write.

## 9. Deployment Verification

| Check | How | Evidence |
|---|---|---|
| Build | CI step "Build", exit code 0 | **GitHub Actions run 38477141692** (commit `8c439b7`): step success. Also executed locally on 2026-10-14 after `npm ci`: `✓ built`, assets `index-CoTgvBCE.js`, `index-pgEQph93.css` (`evidence/p08_rerun_ci_local.txt`) |
| Tests | CI steps "Tests"; the guard proves the database tests ran | **Same GitHub run**: guard, project suite and QA suite steps success. Locally on 2026-10-14: project suite 175/175, QA suite 143/143, 0 skipped, against a throwaway PostgreSQL 18 (ICU) database |
| Deployment succeeded | Vercel deployment status for the commit and the `deployment_status` event | Deployment `7051516022` of `8c439b7`, environment Production, state `success` ("Deployment has completed"), 2026-10-13T22:20:50Z |
| Application usable (post-deployment, automated) | `scripts/smoke-test.js` against the public domain | **GitHub run 38477169616** (success) for `8c439b7` and run 38457951272 for `73e009c`; and executed again by hand on 2026-10-14T05:34Z against `https://vetcare-mvp.vercel.app` with `SMOKE_REQUIRE_ALL=1`: **9 passed, 0 failed, 0 skipped**, exit 0 (`evidence/p08_rerun_smoke_production.txt`) |
| Argon2 on the platform (ADR-006) | SMOKE-06 | Passed on the platform: the native module loads (the function would not start otherwise: `src/modules/identity/sign-up.js` hashes at import) and an unknown-credentials sign-in runs the Argon2 verification and a database query |
| SPA deep links (P05-ASM-012) | SMOKE-08 | Passed on the platform |
| Origin guard behind Vercel's proxy (CR-021) | SMOKE-05 | Passed on the platform (a foreign origin gets `FORBIDDEN_ORIGIN`); the happy path with a valid origin is covered by SMOKE-06 |
| Deployed revision | The deployment record carries the commit SHA, which the smoke workflow checks out. In addition, on 2026-10-14 the entry page served by the public domain references `assets/index-CoTgvBCE.js` and `assets/index-pgEQph93.css`, the same content-hashed files that `npm run build` of `8c439b7` produces locally | Verified for the **client**. The API exposes no version, so the function's revision rests on the deployment record (P08-RISK-006) |

**What the failed attempts proved.** Between 2026-10-13T17:11Z and 19:00Z there were five failed smoke runs on Production plus three Vercel deployments in state `failure`. Two of the failed smoke runs (17:11Z and 17:43Z, both for `4a47423`) happened on deployments that Vercel reported as successful, i.e. the smoke test caught an application that was deployed but not usable. The team's fix commits (entry-point detection, static asset location, routing, separate static and Express builds) correspond to those failures. The job logs are not publicly downloadable, so the exact failing check of each run was not read (the cause is inferred from the commits, see P08-LIMIT-005). The last two Production runs are green.

**Manual check by the team (2026-10-14).** The team reported that it ran the manual production check proposed by the validation (browser, test account: sign-up, sign-in, search, booking; session cookie `Secure`; `FEATURES`; Node.js version). The team reports that **all the manual tests passed**. This closes the gap "user interface not exercised on the hosted application" at the level of a human attestation of a passing result: the individual observed values were not given to the assistant and are not recorded (`evidence/manual_production_check_2026-10-14.md`), and the check was not reproduced by the assistant.

Not verified by any recorded evidence: `NODE_ENV` in the function; the Neon database locale; Instant Rollback; the Preview deployments (protected). The values of the manual check (cookie attributes, `FEATURES`, Node.js version) are team-reported only. See section 14.

## 10. Rollback / Recovery

- **Application:** Vercel keeps previous deployments, and a previous successful deployment can be promoted again from the Vercel dashboard ("Instant Rollback" in Vercel's product). ASSUMPTION: this capability was not exercised or verified here, and the plan limits for Hobby were not checked. Alternative, fully under git control: revert the commit on `main` through a pull request; the pipeline then rebuilds and redeploys the previous code, and the smoke test verifies the result.
- **Database:** migrations are forward-only and have no down scripts. Recovery from a bad migration is a new corrective migration. Neon's point-in-time/branch restore may help; it is not part of this repository and was not verified (ASSUMPTION).
- **Order matters:** if a release needed a migration, rolling the code back does not roll the schema back. Only one migration exists today (`001_initial_schema.sql`), so whether future migrations will stay compatible with older code is UNKNOWN and must be checked per release.
- **No automatic rollback exists** in the workflows. A failed smoke test only reports; it does not undo the deployment.

## 11. Troubleshooting

| Symptom | Likely Cause | Verification | Action |
|---|---|---|---|
| Vercel shows the deployment as Ready but the smoke test fails | Entry point or routes not what Vercel built (this happened twice on 2026-10-13) | The failing check ID in the smoke job log; SMOKE-01 fails if `/api` is not routed to the function | Check `vercel.json` `builds`/`routes`, that `src/index.js` still default-exports the app and still imports `express`, and the Vercel function logs |
| Vercel deployment fails (state `failure`) | Build or function packaging error, e.g. entry-point detection (`app.js` vs `index.js`) | `npx vercel inspect <deployment> --logs` (printed in the deployment status description) | Fix on a branch; the smoke job is skipped for failed deployments, so a missing smoke run after a failed deployment is expected |
| CI fails at "Require the test database" | Service container not healthy, or database in the C locale | The job log prints the reason | Use the default `postgres` image locale; do not add `--locale=C` |
| CI green but few tests ran | `TEST_DATABASE_URL` removed from the workflow | Check the test count in the logs (175 + 143 expected) | Restore the variable; the guard step should already have failed |
| Local QA suite reports 27 tests instead of 143 | `TEST_DATABASE_URL` not exported: `node --test` does not read `.env` | The TAP output shows `SKIP TEST_DATABASE_URL is not set` | Export the variable (or run `npm test`, which loads `.env`, for the project suite only) |
| Local `npm test` fails dozens of tests with `ECONNREFUSED` | The `.env` `TEST_DATABASE_URL` points to a PostgreSQL that is not running | `pg_isready` on the host and port of the variable | Start the throwaway database; this is an environment problem, not a code defect |
| `/api/*` answers HTML or a Vercel login page in the smoke test | The URL checked is a unique deployment URL protected by Vercel Authentication | The response is a 302/HTML, not JSON | Use the public domain: set `SMOKE_BASE_URL` |
| `/api/health/db` answers 500 `UNEXPECTED` | `DATABASE_URL` missing or wrong, or Neon compute still resuming | Vercel function logs; retry after 15 s | Fix the variable in Vercel; the smoke test allows 30 s |
| Sign-in or sign-up answers `FORBIDDEN_ORIGIN` from the real site | `APP_ORIGIN` differs from the URL in the browser (scheme, host, port or a trailing path) | Compare both values | Set `APP_ORIGIN` exactly to the public origin for that environment |
| Every request fails at start-up | `APP_ORIGIN` unset for that Vercel environment (Preview needs its own value) | Function logs show "APP_ORIGIN is required" | Set the variable for Production and Preview |
| Reloading a client route such as `/estado-tecnico` shows an error | The `routes` fallback to `/index.html` was changed or removed | SMOKE-08 fails | Restore the last route of `vercel.json` |
| Search ignores accents or capitals wrongly on a database | Database created in the C locale | `SELECT lower('Ú')` returns `Ú` | Create the database with a UTF-8 non-C locale |
| `npm run migrate` stops with "Refusing to run migrations inside a Vercel build" | The command was run where `VERCEL` is set | Environment | Run it from a developer or DevOps machine |
| First request after idle is slow | Neon scale-to-zero (P05-RISK-014) | Second request is fast | Open the application shortly before a demonstration |

## 12. Security Notes

- **No secret appears in the repository, workflows or this document.** The workflows use no repository secret. Connection strings live only in Vercel (injected by Neon) and in the DevOps role's environment. The repository is public, so this matters: `.env` is git-ignored and was not committed.
- **`DATABASE_URL_UNPOOLED` is the most powerful credential** (direct database access). Do not store it as a GitHub secret or a Vercel build variable; run migrations from a controlled machine.
- **CI database:** `POSTGRES_HOST_AUTH_METHOD: trust` is acceptable only because the container is created per run, reachable from the runner alone, and holds no real data. Never use that setting for Neon or any shared database.
- **Permissions:** both workflows request `contents: read` only. Third-party actions are pinned to a major version tag (`@v7` since 2026-10-14), not to a commit SHA (P08-RISK-003). The previous `@v4` versions triggered a GitHub warning (Node.js 20 runtime forced onto Node.js 24); the move to `@v7` addresses it once confirmed by a green run (P08-RISK-008).
- **Exposed interfaces:** HTTPS from Vercel with `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` observed. `/api/health` and `/api/health/db` are public technical endpoints that return only `ok` (DEV-001); the API answers `Cache-Control: no-store`.
- **The smoke test is read-only** and never sends real credentials; its sign-in check uses a fixed non-existent identity. It was run by hand against Production during this re-run; no account or data was created.
- **Deployment Protection:** the unique deployment URLs require Vercel authentication; the public domain does not (it is the application's public entry).
- Cookie `Secure` over real HTTPS: verified locally and reported as checked by hand by the team on 2026-10-14 (no value recorded). The Origin guard behind Vercel's proxy is verified on the platform (SMOKE-05).

## 13. Traceability

| Deployment Element | Source |
|---|---|
| Target Vercel + Neon, GitHub as source | TD-14, ADR-003, ADR-014, ARCHITECTURE §4.2, §5.5 (FACT); deployments by `vercel[bot]` (observed) |
| Single function from `src/index.js`, client in `public/` | P05-ASM-012, `src/index.js`, `vercel.json` (P08-DEPLOY-001), `client/vite.config.js`; settled by SMOKE-01/07/08 on Vercel |
| `builds`/`routes` instead of auto-detection and `rewrites` | P05-ASM-019 did not hold; commits `b308d6a`, `599ead6`, `9efd49e`, `0d232d1` (REFINED, JUSTIFIED_CHANGE: same target and components, deployment-file detail only) |
| `src/app.js` → `src/application.js`, `import express` in `src/index.js` | commits `b308d6a`, `599ead6`; tests and the QA harness import the new path |
| Build command `npm run build` | `package.json`; `ci.yml`; Vercel runs the same script through `@vercel/static-build` |
| Test commands `npm test` and the QA suite command | `package.json`; `TEST_EXECUTION_REPORT.md` section 10 |
| Test database service and the guard step (P08-WF-001) | P07 findings W-4 and F-06; `tests/database.test.js` (skip behavior) |
| No Docker (P08-DOCKER-001) | ARCHITECTURE §5.5 (no container in the deployment view) |
| Migrations manual, never in build or CI | P05-ASM-015, `scripts/migrate.js`, `src/db/migrator.js` |
| Environment variables | `.env.example`, `src/shared/config.js`, ARCHITECTURE §5.5 table, CR-021, CR-024, ADR-017 |
| Smoke checks SMOKE-01..09 (P08-CHECK-001) | `src/http/health.js` (DEV-001), API_SPEC_V1.yaml (`/session`), CR-006, CR-021, P05-ASM-012, ADR-006, P07 TEST-SEC-010 |
| Post-deploy workflow (P08-WF-002) | P08 prompt rule "deployment depends on successful verification"; `deployment_status` events confirmed by 30 runs |
| CI on GitHub Actions | P08-ASSUMPTION-001 |

Evidence of this stage is in `artifacts/08_deployment/evidence/`:
- Round 1 (2026-10-12, local only): `ci_local_emulation.txt`, `ci_guard_negative_tests.txt`, `local_migration_and_smoke.txt`, `p08_validation_rerun.txt`, `val003_004_006_fix_verification.txt`.
- Round 2 (2026-10-14): `p08_rerun_github_history.txt` (workflow runs, deployments and branch protection from the GitHub API), `p08_rerun_smoke_production.txt` (smoke test against Production, 9/9), `p08_rerun_ci_local.txt` (clean install, build, 175 + 143 tests on `8c439b7`; it also records two environment mistakes of the local run and their correction). `p08_rerun_validation_checks.txt` (validator checks: workflow parsing, secret scan, document structure, variable audit).

## 14. Known Limitations and Assumptions

| ID | Type | Statement |
|---|---|---|
| P08-ASSUMPTION-001 | ASSUMPTION | GitHub Actions is the CI platform. The architecture names GitHub (repository) and Vercel (deployment) but no CI product. In practice it is in use and working |
| P08-ASSUMPTION-002 | CLOSED | Vercel publishes `deployment_status` events with environment "Production": confirmed (30 runs triggered). `environment_url` is **not** usable by itself because it is protected; `SMOKE_BASE_URL` is required in practice |
| P08-ASSUMPTION-003 | CLOSED | The `postgres:16` image folds accents like the local cluster: confirmed, the guard step passes on GitHub |
| P08-ASSUMPTION-004 | ASSUMPTION | Vercel Instant Rollback and Neon restore exist and work on the current plans. Not exercised |
| P08-RISK-001 | CLOSED | The workflows had never run on GitHub; they now have (sections 7 and 9) |
| P08-RISK-002 | RISK, OPEN | **CI does not gate production.** The status check `build-and-test` is not a required check on `main` (public API, 2026-10-14) and Vercel deploys in parallel with CI. Every Production commit so far had a green CI run (a green pull-request run before each merge, and a green push run for the first commit, which was pushed directly to `main`), but nothing enforces that. Needs a repository setting by the admin (section 8.1 item 4); not changeable from this stage |
| P08-RISK-003 | RISK | Actions are pinned to major tags, not SHAs |
| P08-RISK-004 | RISK | "Build once, deploy the verified artifact" is not possible here: CI builds the commit to verify it, and Vercel builds the same commit again. The link between both is the commit SHA |
| P08-RISK-005 | RISK | `package.json` `engines.node` is `>=22`, open-ended; the Node version Vercel selects is UNKNOWN (CI uses 22). The deployment works, but the version was not read from a Vercel build log |
| P08-RISK-006 | RISK, reduced | The smoke test cannot confirm which revision the function runs; the app exposes no version. The client is traceable by its content-hashed asset names; the function by the deployment record |
| P08-RISK-007 | RISK, reduced | Argon2id on Vercel, the SPA routing and the Origin guard are verified on the platform. Signed-in flows and the `Secure` cookie were checked by hand by the team on 2026-10-14 (human attestation that all manual tests passed; no individual values recorded; not reproduced by the assistant) |
| P08-RISK-008 | RISK, MITIGATED, PENDING CONFIRMATION | GitHub announced (workflow annotation, 2026-10-14) that `ubuntu-latest` migrates to Ubuntu 26 from 2026-10-19 and that the v4 actions run on Node.js 24 by force. On 2026-10-14 both workflows were changed to `runs-on: ubuntu-24.04`, `actions/checkout@v7` and `actions/setup-node@v7` (YAML parses; major tags exist; the release notes of v7 list no change to the inputs used here). **The changed workflows have not run on GitHub.** Close this risk after one green CI run on a pull request and one green post-deployment smoke run |
| P08-LIMIT-001 | CLOSED | The router that emulated `vercel.json` is no longer needed; the static checks now ran against Vercel itself |
| P08-LIMIT-002 | LIMITATION | Preview deployments are not smoke-tested (the workflow targets Production; previews are behind Vercel Authentication) |
| P08-LIMIT-003 | LIMITATION | The UI and non-functional requirements are untested (P07 findings F-04, W-3). The smoke test checks that the client page is served, not that the UI works |
| P08-LIMIT-004 | CLOSED | The files of round 1 were committed. The files of this round are uncommitted |
| P08-LIMIT-005 | LIMITATION | GitHub job logs and Vercel build logs are not publicly readable; the causes of the five failed smoke runs and three failed deployments of 2026-10-13 are inferred from the fix commits, not read from logs |
| P08-LIMIT-006 | CLOSED | Upstream drift was resolved on 2026-10-14 at the project team's request: `ARCHITECTURE_V3.md` records the deployment configuration as change P05-CHG-001, and the header comment of `src/index.js` was rewritten (comment only; syntax checked). It was done outside P08, and `ARCHITECTURE_V3.md` was validated by the P05 validator on 2026-10-14 (`ARCHITECTURE_VALIDATION_V3.md`, PASS). Whether the unused `import express` is still necessary with the current `vercel.json` was not tested |
| P08-CHANGE-001 | CHANGE LOG | Round 1: after the first validation (`DEPLOYMENT_VALIDATION.md`, kept unchanged as V1), VAL-003 (`SMOKE_REQUIRE_ALL`), VAL-004 (`workflow_dispatch` fallback) and VAL-006 (cancellation only for pull requests) were corrected. Their effect is now observed on GitHub: VAL-003 made no run green with a skipped check; VAL-006 left one result per pushed commit |
| P08-CHANGE-002 | CHANGE LOG | Round 2 (this version): `DEPLOYMENT.md` rewritten from the executed state; `DEPLOYMENT_VALIDATION_V2.md` added; the stale header comment "NOT YET EXECUTED" of `post-deploy-smoke.yml` replaced by the observed status (comment only; no workflow behavior changed) |
| P08-CHANGE-003 | CHANGE LOG | 2026-10-14, after the validation of round 2: both workflows pinned (`ubuntu-24.04`, `actions/checkout@v7`, `actions/setup-node@v7`) with an explanatory comment; `ARCHITECTURE_V3.md` created; comment in `src/index.js` updated; the manual production check reported by the team recorded. No workflow behavior other than the runner image and action versions changed. These changes need one green run on GitHub to be covered by execution evidence |

## 15. Deployment Status

**READY_WITH_ASSUMPTIONS**

Justification (P08 prompt, section 9):

- Build succeeds: GitHub Actions run 38477141692 and a clean local run, on the deployed commit.
- Required tests succeed: 175 + 143 on GitHub and locally, 0 skipped, with the database guard proving the database tests ran.
- Packaging: not applicable (no container); the Vercel build of the commit succeeded (deployment `success`).
- Deployment succeeds: Production deployment of `8c439b7`.
- Deployment verification succeeds: 9/9 smoke checks in the pipeline and by hand against the public domain, with the client served matching the local build of the same commit.
- Configuration is known and reproducible: sections 4, 5 and 8.

It is **not** `READY` because of the assumptions that remain and that do not invalidate the verified path: the required-check gate is not enforced (P08-RISK-002), rollback was not exercised (P08-ASSUMPTION-004), the Node version on Vercel is unknown (P08-RISK-005), the changed runner image and action versions have not yet run on GitHub (P08-RISK-008), and Preview deployments are not verified (P08-LIMIT-002).

The project satisfies the condition to advance to P09 (build, tests and deployment functioning and verified). P09 and P10 were produced when P08 was `BLOCKED` and must be refreshed against this status.
