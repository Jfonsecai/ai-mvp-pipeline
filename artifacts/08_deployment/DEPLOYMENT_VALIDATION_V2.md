# P08 Deployment Validation Report

## 1. Validation Metadata

- Validator: P08 Deployment Validator
- Project: VetCare (ai-mvp-pipeline), MVP, SPRINT-001 scope
- Deployment Version: `artifacts/08_deployment/DEPLOYMENT.md` v2.0
- Validation Date: 2026-10-14 (round 2). Round 1 is `DEPLOYMENT_VALIDATION.md` (2026-10-12, `BLOCKED`), kept unchanged as the record of that round
- Architecture Version / Source: `artifacts/05_architecture/ARCHITECTURE_V2.md` (§4.2, §5.5, §15.1) and `ARCHITECTURE_VALIDATION_V2.md`
- Code Revision: `8c439b7` (`main`; deployed to Production on 2026-10-13T22:20:50Z) plus the uncommitted files of this round (`DEPLOYMENT.md` v2.0, this report, `evidence/p08_rerun_*`, a comment-only change in `post-deploy-smoke.yml`)
- Test Source: `artifacts/07_qa/TEST_EXECUTION_REPORT.md`, `TEST_ANALYSIS_REPORT.md` (round 2), plus the executions of this round
- Overall Result: **PASS_WITH_WARNINGS**
- Advance Condition: Build + Tests + Deployment, all functioning and verified. **Satisfied.**

## 2. Executive Summary

Round 1 ended `BLOCKED` because nothing had been deployed and the workflows had never run. The application has since been deployed to Vercel and Neon, so this round checked the real thing instead of an emulation. On the deployed commit `8c439b7`: the CI run on GitHub Actions executed every step successfully (install, database guard, build, 175 project tests, 143 QA tests); Vercel reported the Production deployment `success`; the post-deploy smoke workflow ran by itself on that deployment and passed; and the validator ran the same nine smoke checks by hand against `https://vetcare-mvp.vercel.app` with no check allowed to be skipped: 9 passed, 0 failed, 0 skipped. The client served by Production carries the same content-hashed asset names as a clean local build of `8c439b7`. The three assumptions that only a real platform could settle (deep links with the SPA rewrite, Argon2id on Vercel, the `deployment_status` event) are now settled by execution. One of them, P05-ASM-019 (Vercel detecting `src/index.js`), turned out false as assumed: the team needed explicit `builds`/`routes` in `vercel.json` and a file rename, after five failed smoke runs and three failed Vercel deployments on 2026-10-13.

The result is `PASS_WITH_WARNINGS`, not `PASS`, because of issues that do not invalidate the verified path: CI is not an enforced gate in front of the Vercel Production deployment (VAL-001, an owner-only repository setting), the runner image and the actions will change on 2026-10-19 (VAL-002), the architecture and a code comment drifted from the working configuration (VAL-003), and some production behaviors remain unobserved (VAL-006, VAL-007). There is no critical finding.

**Independence limitation.** The same assistant produced `DEPLOYMENT.md` v2.0 and this validation in one session. To reduce the bias, the evidence that decides the result was produced by systems other than the assistant (the GitHub REST API, the live HTTP service, the Vercel-created deployment records), the validator re-ran the build, tests and smoke test instead of reusing the generation's results, and one defect found during validation (VAL-004) is reported as found, not silently fixed. A review by a person who did not write the artifacts is still recommended.

## 3. Structural Validation

| Artifact / Area | Present | Valid | Executed / Verified | Notes |
|---|---|---|---|---|
| Workflow `ci.yml` | Yes | Yes (parses; push + pull_request; `contents: read`; `postgres:16` service; 7 steps in the documented order) | **Executed on GitHub Actions**: 19 runs, 17 green; run 38477141692 (deployed commit) all steps green | The 2 red runs have no jobs (Copilot agent "Initial plan" pull requests) |
| Workflow `post-deploy-smoke.yml` | Yes | Yes (parses; `deployment_status` + `workflow_dispatch`; `contents: read`) | **Executed on GitHub Actions**: 30 runs; 2 green Production runs; `workflow_dispatch` never used | Comment-only edit in this round |
| Deployment configuration `vercel.json` | Yes | Yes (`builds` + `routes`) | **Executed by Vercel**: deployments succeed and SMOKE-01/07/08/09 pass | Differs from what v1.0 and the architecture assumed (VAL-003) |
| Docker | No | N/A | N/A | Not applicable by architecture (section 7) |
| `DEPLOYMENT.md` | Yes | Yes: all 15 required sections in the required order | Cross-checked against the repository, the GitHub API and the live service (section 13) | Status READY_WITH_ASSUMPTIONS, consistent with the evidence |
| Environment Configuration | Yes | Yes (section 12) | Production variables confirmed by behavior (SMOKE-02/05/06) | Types and owners documented, no values |
| Deployment Verification (`scripts/smoke-test.js`) | Yes | Yes | **Executed against Production**: 9/9, exit 0 | Read-only |
| Deployment | Yes | Yes | **Executed**: Production deployment `success` for `8c439b7` | See section 9 |

## 4. Findings

Status of the round 1 findings: VAL-001 open (re-rated, below); VAL-002 closed (deployment executed); VAL-003 closed (`SMOKE_REQUIRE_ALL` is in the green runs, which therefore ran SMOKE-06); VAL-004 closed (the event arrives; the manual fallback exists but was never used); VAL-005 open, now VAL-005 below; VAL-006 closed (one result per pushed commit observed); VAL-007 closed (revision refreshed); VAL-008 open, now VAL-007; VAL-009 closed (the guard step passes on `ubuntu` + `postgres:16`).

| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| VAL-001 | MEDIUM (re-rated from HIGH, see note) | Deployment Configuration Defect | **CI does not gate the Production deployment.** `main` is protected but the check `build-and-test` is not required, and Vercel deploys in parallel with CI: the deployment of `8c439b7` was created at 22:20:50Z, its CI run finished at 22:21:23Z. In practice every Production commit had a green CI run before or while deploying, but nothing enforces it. This is the rubric's "tests run but deployment does not depend on them" | `evidence/p08_rerun_github_history.txt` (branch protection: `required_status_checks.enforcement_level: off`, no contexts; run and deployment timestamps) | The repository admin should require `build-and-test` (and an up-to-date branch) on `main` and record the setting. Not fixable by P08: it is an owner-only GitHub setting and the architecture fixes Vercel's Git integration as the deployment mechanism. **Re-rating note:** round 1 rated this HIGH because it was unobserved. It is lowered because the P08 prompt allows a documented manual gate, branch protection exists, the smoke test and a revert path limit the damage and the status of the gate is now an observed fact, not an unknown. If the team requires technical enforcement for the stage, treat it as HIGH: the result would then be FAIL until the setting is enabled |
| VAL-002 | MEDIUM | Deployment Configuration Defect | **The runner image and the actions are about to change under the evidence.** Both workflows use `runs-on: ubuntu-latest` and `actions/checkout@v4`, `actions/setup-node@v4`. GitHub annotated the runs: `ubuntu-latest` migrates to Ubuntu 26 from 2026-10-19, and the v4 actions target Node.js 20 and are forced onto Node.js 24. Newer majors exist (`checkout` v7, `setup-node` v7). The executed evidence applies to the current combination only | Run annotations of the smoke runs on `check-runs/.../annotations`; releases of `actions/checkout` and `actions/setup-node` | Pin `ubuntu-24.04`, move the actions to a current major and confirm with one green run on a pull request. Not applied here: an edited workflow would not be covered by the evidence of this round |
| VAL-003 | MEDIUM | Documentation Defect / upstream drift | **Architecture and a code comment disagree with the working deployment.** `ARCHITECTURE_V2.md` §5.5 and P05-ASM-019 describe Vercel auto-detecting `src/index.js` with `rewrites`; the working configuration is explicit `builds`/`routes` (legacy), `src/app.js` was renamed `src/application.js`, and `src/index.js` imports `express` without using it only for Vercel's detection. The header of `src/index.js` still says "UNVERIFIED on Vercel". The change keeps the same target, components and boundaries, so it is a justified deployment-file change, but it is not recorded in the architecture | `vercel.json` diff since `4a47423`; commits `b308d6a`, `599ead6`, `87bad3c`, `9efd49e`, `0d232d1`; `src/index.js` | Record it through the project's change control (a CR/ADR note against ARCHITECTURE §5.5 and P05-ASM-012/019) and update the comment in `src/index.js` in a P06 change. P08 does not edit those files |
| VAL-004 | LOW | Documentation Defect | `DEPLOYMENT.md` v2.0 listed `BASE_URL`, `SMOKE_REQUIRE_ALL` and `SMOKE_CHECKS` only in prose, not in the configuration table of section 5 (the validator's variable audit found them read by `scripts/smoke-test.js`). **Corrected in `DEPLOYMENT.md` after the finding** (three rows added) | `evidence/p08_rerun_validation_checks.txt` section 4 | None remaining; listed so the correction is traceable |
| VAL-005 | LOW | Environment Problem | The Node.js version that Vercel runs is unknown: `engines.node` is `>=22`, open-ended, and the Vercel build log was not available. The deployment works, so the risk is drift, not breakage | `package.json`; `DEPLOYMENT.md` P08-RISK-005 | Read the version in the Vercel build log once and, if the team wants, pin the major in a P06 change |
| VAL-006 | LOW | Unsupported Assumption (documented) | Production behaviors still unobserved: the `Secure` attribute of the session cookie over HTTPS and any signed-in flow (the read-only smoke test never signs in), `NODE_ENV` in the function, the Neon database locale for accent-insensitive search (P07 F-06), the value of `FEATURES` in Production (must be empty, ARCHITECTURE §15.1 item 5). The validator did not create an account in Production to test them | `DEPLOYMENT.md` §5, §9, P08-RISK-007 | A manual check by the account owner, or an agreed test account, before a demonstration. Not a P08 blocker |
| VAL-007 | INFO | Unsupported Assumption (documented) | Rollback (Vercel Instant Rollback, Neon restore) was not exercised. The repository-level recovery (revert through a pull request, then the smoke test) is the only procedure fully under project control | `DEPLOYMENT.md` §10, P08-ASSUMPTION-004 | Exercise a rollback once on the real project |
| VAL-008 | INFO | Environment Problem | The causes of the five failed smoke runs and three failed deployments of 2026-10-13 were inferred from the fix commits: job and build logs are not publicly readable. What is certain: two failed smoke runs happened on deployments that Vercel reported as successful, so the verification step does detect an unusable deployment | `evidence/p08_rerun_github_history.txt`; job annotations show only "Process completed with exit code 1" | None. Keep the logs of the next failure with the report |

## 5. Build Validation

### Build Definition
`npm run build` (root script, runs `vite build` in the client workspace, output to the git-ignored `public/`). `ci.yml` runs it after `npm ci` and the database guard; on Vercel `@vercel/static-build` runs the same `build` script and publishes `public/` (`vercel.json` `distDir`). Runtime from `.nvmrc` (22). Matches `package.json` and `vercel.json`.

### Execution Evidence
- GitHub Actions run 38477141692, commit `8c439b7`: "Build (client bundle into public/)" success.
- Executed by this validator on 2026-10-14 after `npm ci` (116 packages, 0 vulnerabilities): `vite build` ✓ built; `index-CoTgvBCE.js`, `index-pgEQph93.css` (`evidence/p08_rerun_ci_local.txt`).
- The Vercel build of the same commit succeeded (deployment `success`), and its output is identical in name to the local one (section 10).

### Result
**PASS**

## 6. Test Validation

### Test Definition
`npm test` (`tests/*.test.js`, loads `.env`) and `node --test "artifacts/07_qa/test_suites/**/*.test.js"` (does not load `.env`). A guard step requires `TEST_DATABASE_URL`, checks reachability and accent folding, because a skipped database test counts as a pass for Node's runner. No test file was changed by P08 or by this round; the only test-side change since round 1 is the import path `src/app.js` → `src/application.js`, made by the team and covered by the green runs.

### Execution Evidence
- GitHub Actions run 38477141692: guard, project suite and QA suite steps all success.
- Executed by this validator on 2026-10-14 (`evidence/p08_rerun_ci_local.txt`), against a throwaway PostgreSQL 18 (ICU) database:
  - Project suite: **175/175**, 0 skipped.
  - QA suite: **143/143**, 0 skipped.
- Two mistakes of the validator's own first local run are recorded in that file, because they illustrate what the guard protects against: (1) `npm test` failed 50 of 188 tests with `ECONNREFUSED` because the `.env` database pointed to a server that was not running (environment problem, not a code defect); (2) after starting it, the QA suite reported only 27 tests because `node --test` does not read `.env` and 116 database-backed tests were reported SKIP with exit code 0. Exporting `TEST_DATABASE_URL`, as `ci.yml` does, gave 143/143. In CI the guard step makes (2) impossible.

### Result
**PASS**

## 7. Docker Validation

### Configuration Review
No Dockerfile, `.dockerignore` or compose file exists. The architecture's deployment view (§5.5) contains no container: Vercel builds the client and runs the function. Classification: **SUPPORTED** (absence justified by ARCHITECTURE §5.5 and documented as P08-DOCKER-001). The real deployment confirms the target works without a container.

### Image Build Result
Not applicable.

### Container Runtime Result
Not applicable.

### Findings
None. A container target would be a controlled architecture change, not a P08 correction.

## 8. Workflow Validation

### Trigger and Execution Flow
`ci.yml`: `push` to `main` and `pull_request`; `post-deploy-smoke.yml`: `deployment_status` and `workflow_dispatch`. Both parse, use `contents: read` and no secrets. **Executed**: the distinction required by the prompt, between "syntactically valid" and "has successfully executed the required path", is now met for CI (green on the deployed commit and on every pull request that was merged) and for the smoke workflow (green on the last two Production deployments).

### Build Stage
Present; runs after install and guard; green on GitHub.

### Test Stage
Two steps after the build, first failure stops the job (round 1 showed this by fault injection; the Copilot pull requests did not execute jobs, so they say nothing here). Green on GitHub.

### Packaging / Container Stage
Not applicable (no container, no separate artifact). Vercel rebuilds the same commit, so "build once, deploy the verified artifact" is not literally achievable; the tie between CI and deployment is the commit SHA (P08-RISK-004).

### Deployment Stage
Intentionally absent from the workflows; Vercel's Git integration deploys, as ARCHITECTURE §5.5 states. Consequently deployment does not depend on CI (VAL-001).

### Verification Stage
`post-deploy-smoke.yml` ran by itself after each successful Production deployment event. Preview deployments are skipped by design (20 runs), failed deployments are skipped (3 runs), and a failing smoke test fails the job (5 runs). Because `SMOKE_REQUIRE_ALL=1`, a green run implies SMOKE-06 ran, so `APP_ORIGIN` is defined and matches the origin checked.

## 9. Deployment Validation

### Target
Vercel (Hobby, `iad1`) plus Neon (Free), source on GitHub: supported by project evidence (TD-14, ADR-003, ADR-014, ARCHITECTURE §4.2, §5.5) and observed (deployments created by `vercel[bot]`; `/api/health/db` reaches PostgreSQL). Not invented by P08.

### Deployment Procedure
Documented in `DEPLOYMENT.md` §8: setup by the account owner (done), pull request, manual migrations before the release, merge, smoke check. No destructive step. The migration procedure was executed against a fresh database in round 1 (pending, applied, idempotent); it was not executed against Neon in this round and nothing in the smoke test writes.

### Execution Evidence
- Deployment `7051516022`, environment Production, commit `8c439b7`, state `success`, 2026-10-13T22:20:50Z.
- Earlier Production deployments `73e009c`, `155ea31`, `ac8c484`, `72059e4`, `4a47423` also reached `success` at least once; three deployments ended in `failure` (2026-10-13 17:28Z, 17:37Z, 18:45Z) and were fixed.
- The public domain answers from the deployment of this commit (section 10).

### Result
**VERIFIED**

## 10. Deployment Verification

Application-level checks performed after deployment:

- **By the pipeline:** GitHub run 38477169616 (commit `8c439b7`) and run 38457951272 (`73e009c`): "Smoke test the deployed application" success, with `SMOKE_REQUIRE_ALL=1`.
- **By the validator, 2026-10-14T05:34Z**, against `https://vetcare-mvp.vercel.app`, `APP_ORIGIN` set to the same origin, `SMOKE_REQUIRE_ALL=1` (`evidence/p08_rerun_smoke_production.txt`):

| Check | Result |
|---|---|
| SMOKE-01 `/api/health` `{"status":"ok"}`: function runs, `/api` routed | PASS |
| SMOKE-02 `/api/health/db`: PostgreSQL reachable through `DATABASE_URL` | PASS |
| SMOKE-03 `/api/session` state `none`, `no-store` | PASS |
| SMOKE-04 protected route answers `UNAUTHENTICATED` | PASS |
| SMOKE-05 foreign origin refused (`FORBIDDEN_ORIGIN`, CR-021) | PASS |
| SMOKE-06 unknown credentials answer `INVALID_CREDENTIALS` (Argon2 verification + database query) | PASS |
| SMOKE-07 `/` serves the client entry page | PASS |
| SMOKE-08 client deep link returns the entry page (P05-ASM-012) | PASS |
| SMOKE-09 unknown `/api` path stays JSON `NOT_FOUND` | PASS |

- **Revision correspondence:** the entry page of the public domain references `assets/index-CoTgvBCE.js` and `assets/index-pgEQph93.css`; a clean local build of `8c439b7` produces files with the same content-hashed names. For the function, the revision rests on the deployment record (the app has no version endpoint).
- **Response headers observed:** `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` on both the API and the page; API `Cache-Control: no-store`.
- **Protection:** the unique deployment URL answers HTTP 302 to `vercel.com/sso-api` (Vercel Authentication), confirming why `SMOKE_BASE_URL` must be the public domain.

At least one meaningful application-level verification exists and passes. Not covered by any check (VAL-006): a signed-in flow, the `Secure` cookie, UI behavior.

## 11. Security Validation

- **Secrets:** none in the workflows, scripts, `vercel.json`, `DEPLOYMENT.md` or the evidence files. Pattern scan for credential-like assignments, connection strings with embedded passwords and `secrets.` references: no hit besides the placeholders `USER:PASSWORD@HOST` in `.env.example` (`evidence/p08_rerun_validation_checks.txt`). `.env` is not tracked by git; the repository is **public**, which raises the importance of that. The validator opened `.env` only to read the hostnames and ports of the database variables, which are local; no value was printed.
- **Permissions:** `contents: read` in both workflows; there is no deployment token to over-permit.
- **CI credentials:** the test database uses `trust` authentication on a per-run container reachable only from the runner; documented as acceptable only there.
- **Logs:** the smoke test prints check IDs and short reasons, never headers, cookies or bodies. The application logs no connection string (P07 TEST-SEC-041).
- **Exposed interfaces:** HTTPS only (HSTS observed); health endpoints return only `ok`; no extra port.
- **Validator conduct:** the smoke test run against Production is read-only and used a non-existent identity; no account or data was created.

No security finding.

## 12. Environment and Configuration Audit

| Configuration Item | Expected | Present | Classification | Result |
|---|---|---|---|---|
| `APP_ORIGIN` (Vercel, per environment) | Public origin | Works in Production (SMOKE-05/06) | CONFIRMED | OK |
| `DATABASE_URL` (Vercel, from Neon) | Pooled connection string | Works in Production (SMOKE-02) | CONFIRMED | OK |
| `DATABASE_URL_UNPOOLED` | Held by DevOps, not in GitHub/Vercel build | Not observable | ASSUMED | OK (documented) |
| `FEATURES` | Empty in Production | Not observable | UNKNOWN | Documented as UNKNOWN (VAL-006) |
| `SESSION_IDLE_MINUTES` / `SESSION_ABSOLUTE_HOURS` | Optional, defaults | Not observable | NOT_REQUIRED | OK |
| `NODE_ENV` | `production` on Vercel | Not observable | UNKNOWN | Documented (VAL-006) |
| `TEST_DATABASE_URL` | Set by `ci.yml` | Present in the workflow | CONFIRMED | OK |
| Repo variable `APP_ORIGIN` | Equal to the Production origin | Implied by green runs with `SMOKE_REQUIRE_ALL=1` | CONFIRMED | OK |
| Repo variable `SMOKE_BASE_URL` | Public domain | Implied by green runs (the unique URL is protected) | CONFIRMED | OK |
| `BASE_URL`, `SMOKE_REQUIRE_ALL`, `SMOKE_CHECKS` | Smoke script inputs | Read by `scripts/smoke-test.js`; documented after VAL-004 | CONFIRMED | OK |
| `VERCEL` | Set by platform; blocks migrations | `scripts/migrate.js` reads it | CONFIRMED | OK |
| Vercel Node.js version | 22 | Not observable | UNKNOWN | VAL-005 |
| Branch protection with required check | `build-and-test` required | Not enabled | CONFIRMED (absent) | VAL-001 |

## 13. Documentation Validation

`DEPLOYMENT.md` v2.0 was compared with the repository, the GitHub API and the live service:

- Structure: 15 sections in the required order.
- Facts that match the execution evidence: commit and deployment identifiers and times; run counts (CI 19/17 green, smoke 30 = 2 green + 5 red + 3 skipped on failed deployments + 20 skipped on Preview; derived from the API and re-counted by the validator); the smoke result 9/9; the asset names; `vercel.json` content; the renamed entry file; the file and script references (all exist).
- Claims that are explicitly marked as not verified: rollback, Node version on Vercel, `NODE_ENV`, `FEATURES`, Neon locale, cookie `Secure`, Neon `main`/`dev` split. None is presented as a fact.
- Corrections made during validation: VAL-004 (three variables added to the table).
- Corrections made to the version 1.0 claims: it said Vercel "detects `src/index.js`" and uses `buildCommand`/`rewrites`; both are replaced by the real `builds`/`routes`.
- Remaining gap: the causes of the 2026-10-13 failures are inferred, and the document says so (P08-LIMIT-005).

No documentation claims a mechanism that does not exist: the document states, in several places, that there is no deploy step in CI, no required check on `main`, and no automatic rollback.

## 14. Architecture Consistency Audit

| Deployment Element | Architecture Source | Classification | Result |
|---|---|---|---|
| Vercel + Neon, GitHub source | ARCHITECTURE §4.2, §5.5, ADR-003, ADR-014, TD-14 | SUPPORTED | Observed |
| Static client on CDN, one Express function, one PostgreSQL | §5.5, §6.1 | SUPPORTED | Same components and boundaries |
| `builds`/`routes` instead of auto-detection + `rewrites` | §5.5, P05-ASM-012, P05-ASM-019 | JUSTIFIED_CHANGE | Deployment-file detail, same target; not yet recorded upstream (VAL-003) |
| `src/app.js` → `src/application.js`, `import express` | §5.5 (entry point `src/index.js`) | JUSTIFIED_CHANGE | Needed by Vercel detection; behavior unchanged, tests green |
| Pooled `DATABASE_URL` for the function, direct URL only for migrations | CR-024, P05-ASM-015 | SUPPORTED | SMOKE-02 passes; migrations never run on Vercel |
| Same-origin client and API (no CORS), Origin guard | CR-021, ADR-014 | SUPPORTED | SMOKE-05/06 on the platform |
| No container | §5.5 | SUPPORTED | Confirmed by the working deployment |
| CI as quality gate in front of deployment | §5.5, §15.1 | ASSUMPTION | Depends on a repository setting that is off (VAL-001) |
| Smoke check as deployment verification | §15.1 Step 0 | SUPPORTED | Executed on the platform |

No `CONTRADICTORY` item.

## 15. Traceability Summary

Requirements and decisions (TD-14, ADR-003, ADR-014, CR-021, CR-024, ADR-006, P05-ASM-012/015/019) lead to the architecture view §5.5; to the code (`src/index.js`, `src/application.js`, `vercel.json`, `scripts/migrate.js`); to the tests (175 + 143, the database guard, SMOKE-01..09); to the workflows (P08-WF-001/002) and the deployment configuration (P08-DEPLOY-001); to the Production deployment of `8c439b7`; and to its verification (workflow run 38477169616 and the validator's own run). Classification of the P08 elements: Vercel + Neon target DIRECT; `ci.yml` and the smoke workflow REFINED (CI platform is P08-ASSUMPTION-001); `vercel.json` `builds`/`routes` REFINED with a documented deviation from P05-ASM-019; required-check gate ASSUMED and currently absent. No UNSUPPORTED or CONTRADICTORY element.

## 16. Scope / Change Audit

No unsupported scope or deployment expansion detected. Since round 1, the application files changed were `src/app.js` renamed to `src/application.js` (import paths updated in `src/`, `tests/` and the QA harness) and one import added to `src/index.js`; `.vscode/` was added to `.gitignore`; the rest are documentation (P09). No service, database, API, product feature or security model was added.

## 17. Recommended Corrections

1. (VAL-001) The repository admin enables the required status check `build-and-test` on `main` and records it.
2. (VAL-002) Before or right after 2026-10-19: pin `ubuntu-24.04`, move the actions to a current major, confirm with a green run.
3. (VAL-003) Record the deployment-file deviation against ARCHITECTURE §5.5 / P05-ASM-012 and P05-ASM-019 and refresh the "UNVERIFIED" comment in `src/index.js` through the owning stages.
4. (VAL-006) The account owner checks, once, `FEATURES` empty, the session cookie `Secure` over HTTPS and an accent-insensitive search on Production before a demonstration.

None of them changes the architecture.

## 18. Advance Readiness

- Build functioning: **YES**
- Tests functioning: **YES**
- Deployment functioning: **YES**
- Deployment verified: **YES**

Result:

- **READY**

## 19. Final Decision

**Result:** PASS_WITH_WARNINGS

### Conditions to Proceed
The project may proceed to P09 while preserving the warnings VAL-001 to VAL-003 and the limitations of `DEPLOYMENT.md` §14. P09 and P10 artifacts produced while P08 was `BLOCKED` describe the deployment as unverified and must be refreshed against this report.

### Conditions to Revalidate
- After the required check is enabled (VAL-001), or if the team decides that enforcement is required for this stage, in which case VAL-001 becomes HIGH and the result FAIL until fixed.
- After the runner image and actions change (VAL-002): one green CI run and one green smoke run on the new combination.
- After any change to `vercel.json`, `src/index.js`, the workflows or the Vercel/Neon configuration.

## 20. Validator Integrity Statement

Confirm:

- No source artifact was modified by the validation, with one disclosed exception: `DEPLOYMENT.md` received three table rows after VAL-004 was found (the same assistant produced both documents; the correction is reported in the finding and in section 13). `DEPLOYMENT_VALIDATION.md` (round 1) was not touched. The comment-only edit of `post-deploy-smoke.yml` belongs to the generation of this round, not to the validation.
- No deployment decision was invented: the target, the domain and the variables come from the repository, the GitHub API and the live service.
- No unsupported infrastructure was approved without being identified (the `builds`/`routes` deviation is identified as VAL-003).
- No secrets were reproduced.
- No tests were accepted merely because a workflow step existed: the suites were re-executed, and the first local run's skipped and refused tests are reported in section 6.
- No deployment was marked successful without adequate evidence: Vercel deployment records, workflow runs and a direct smoke run against Production support it.
- Findings are evidence-based. Where evidence is unavailable (logs, Vercel dashboard, Neon, branch protection details beyond the public API) the finding says so.

## 21. Addendum of 2026-10-14: changes made after this validation

The project team asked for four follow-ups after the report above was written. The findings are not re-rated by rewriting the report above; this addendum records what each change does to them. The overall result stays **PASS_WITH_WARNINGS**.

| Finding | Change | Status after the change |
|---|---|---|
| VAL-001 (CI is not an enforced gate) | None. The required status check on `main` is a GitHub setting that was not changed. Not re-queried after the report | **Open** |
| VAL-002 (runner image and actions) | `ci.yml` and `post-deploy-smoke.yml` now use `runs-on: ubuntu-24.04`, `actions/checkout@v7` and `actions/setup-node@v7`. Checked: both YAML files parse, the `v7` major tags exist in both action repositories, the v7 release notes list no change to the inputs the workflows use | **Mitigated, not confirmed.** The changed workflows have not run on GitHub. Closes after one green CI run on a pull request and one green post-deployment smoke run (a green CI run on a pull request is the first available evidence; it does not need a deployment) |
| VAL-003 (architecture and code comment drift) | `ARCHITECTURE_V3.md` records the deployment configuration as change P05-CHG-001 (§1.4, §5.5, ADR-014, P05-ASM-012/019, P05-RISK-013, §15.1). The header comment of `src/index.js` was rewritten (comment only; `node --check` passes) | **Resolved**, and `ARCHITECTURE_V3.md` has since been validated by the P05 validator (`ARCHITECTURE_VALIDATION_V3.md`, PASS; it added risk P05-RISK-020 for the reliance on legacy `builds` and deprecated `handle: filesystem`). Remaining limit: whether `import express` is still necessary was not tested |
| VAL-006 (unobserved production behaviors, no UI evidence) | The team reported that it ran the manual production check (browser, test account, cookie `Secure`, `FEATURES`, Node.js version). `evidence/manual_production_check_2026-10-14.md` records the attestation | **Closed as human attestation of a passing result** (the team reports that all the manual tests passed). The individual observed values were not provided, so they are not recorded, and the assistant did not reproduce them. `NODE_ENV` and the Neon locale were not named in the report and stay unrecorded |
| VAL-005 (Node.js version on Vercel) | Covered by the same manual check, as reported | Closed as human attestation (reported as passed), value not recorded |
| Independence limitation (section 2) | The team reported that a person who did not write these artifacts has reviewed them | The limitation is reduced by that review, which is also a human statement: no review record was provided to the assistant |
| VAL-004, VAL-007, VAL-008 | None | Unchanged |

Conditions to revalidate (section 19) are updated: VAL-002 needs the first green run of the changed workflows; VAL-001 needs the required check.
