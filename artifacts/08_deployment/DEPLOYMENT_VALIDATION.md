# P08 Deployment Validation Report

## 1. Validation Metadata

- Validator: P08 Deployment Validator
- Project: VetCare (ai-mvp-pipeline), MVP, SPRINT-001 scope
- Deployment Version: `artifacts/08_deployment/DEPLOYMENT.md` v1.0
- Validation Date: 2026-10-12
- Architecture Version / Source: `artifacts/05_architecture/ARCHITECTURE_V2.md` (§4.2, §5.5, §15.1) and `ARCHITECTURE_VALIDATION_V2.md`
- Code Revision: `5b6e18d` ("P07 executed", `main`) plus the uncommitted P08 files (`.github/workflows/ci.yml`, `.github/workflows/post-deploy-smoke.yml`, `scripts/smoke-test.js`, `artifacts/08_deployment/**`)
- Test Source: `artifacts/07_qa/TEST_EXECUTION_REPORT.md`, `TEST_ANALYSIS_REPORT.md` (round 2), plus the re-execution in this validation
- Overall Result: **BLOCKED**
- Advance Condition: Build + Tests + Deployment, all functioning and verified. **Not satisfied**: build and tests are verified locally, deployment is not verified.

## 2. Executive Summary

The P08 artifacts are well formed and consistent with the approved architecture. On a fresh clean copy of the working tree, `npm ci`, the database guard, the client build, the 175 project tests and the 143 QA tests all pass, a broken build stops the job before the tests run, a lockfile mismatch fails the install, and the deployment smoke test passes against the real API and fails correctly when the database is unreachable, the server is down or the client is missing.

The overall result is **BLOCKED**, not PASS. No deployment was made or inspected: no Vercel or Neon project is available, the workflows have never run on GitHub Actions, and the platform assumptions of the architecture (P05-ASM-012, P05-ASM-019, ADR-006) remain unverified. Under the decision rules, a deployment that cannot be verified because access is unavailable is `BLOCKED` and must not be converted into a pass. `DEPLOYMENT.md` reports the same status, so there is no overclaim.

There are no critical findings. Two HIGH findings (VAL-001, VAL-002), three MEDIUM and three LOW/INFO findings are recorded. VAL-001 and VAL-003 are weaknesses in the generated design that can be corrected without touching the architecture.

**Independence limitation.** The same assistant produced both the P08 artifacts and this validation within one session. To reduce the bias, the validation re-executed everything on a newly created copy (nothing from the generation run was reused), added negative tests that generation had not run, and judged the files against the prompt's criteria. It is not a substitute for a review by a person who did not write the artifacts; that review is recommended before P09.

## 3. Structural Validation

| Artifact / Area | Present | Valid | Executed / Verified | Notes |
|---|---|---|---|---|
| Workflow `ci.yml` | Yes | Yes (YAML parses; triggers, permissions, services and 7 steps as documented) | Steps executed locally on a clean copy; **not executed on GitHub Actions** | Locally the `run:` commands were taken from the file itself, not retyped |
| Workflow `post-deploy-smoke.yml` | Yes | Yes (parses) | **Never executed** (needs a Vercel `deployment_status` event) | Script it calls was executed locally |
| Docker | No | N/A | N/A | Not applicable by architecture (section 7) |
| `DEPLOYMENT.md` | Yes | Yes: all 15 required sections in the required order | Content cross-checked against the repository (section 13) | Status BLOCKED, consistent with evidence |
| Environment Configuration | Yes | Yes: matches `.env.example` and `src/shared/config.js` | Local only | Types and owners documented, no values |
| Deployment Verification (`scripts/smoke-test.js`) | Yes | Yes | Executed locally: 6/6 against the API; 9/9 through an emulated router (not Vercel); negative cases fail as intended | Never run against a real deployment |
| Deployment | n/a | n/a | **Not executed** | Blocker, section 9 |

## 4. Findings

| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| VAL-001 | HIGH | Deployment Configuration Defect | Deployment does not depend on CI in the repository. Vercel deploys each push through its own Git integration, independently of the `build-and-test` job. The gate exists only if someone enables branch protection requiring that check, a manual GitHub setting that no file enforces and that cannot be verified from the repository. This is the rubric's "tests run but deployment does not depend on them". It is documented (P08-RISK-002), which limits the damage but does not remove it. | `ci.yml` has no deploy step; `DEPLOYMENT.md` §8.1 step 4, §14 P08-RISK-002 | Enable branch protection on `main` with the required check `build-and-test`, and record evidence (settings screenshot or `gh api repos/<owner>/<repo>/branches/main/protection`). If the team prefers an enforced mechanism, decide it in a controlled change; do not assume one |
| VAL-002 | HIGH (blocking) | Credential / External Dependency Problem | Deployment target not reachable for verification: no Vercel project, no Neon project, no credentials; the workflows have never run on GitHub; P05-ASM-012, P05-ASM-019 and ADR-006 unverified; `src/index.js` still says "UNVERIFIED on Vercel" | `DEPLOYMENT.md` §9, §14 P08-RISK-001, §15; no `.vercel/` link in the repository | Perform the one-time setup (§8.1), commit and push, inspect the first CI run, the Vercel deployment and the smoke workflow, then re-validate. This is the blocker for the verdict |
| VAL-003 | MEDIUM | Deployment Configuration Defect | The smoke check that exercises Argon2 and the database path (SMOKE-06, the ADR-006 step-0 check) is skipped with exit code 0 when the repository variable `APP_ORIGIN` is not set, so the post-deploy workflow can finish green without having verified it. The skip is printed but not enforced | `evidence/local_migration_and_smoke.txt`: "5 passed, 0 failed, 1 skipped ... smoke_exit=0"; `post-deploy-smoke.yml` passes `vars.APP_ORIGIN` unconditionally | Make the workflow fail on a skipped check (for example a `SMOKE_REQUIRE_ALL=1` option) or require the variable. The P08 prompt warns against treating unexecuted steps as success |
| VAL-004 | MEDIUM | Unsupported Assumption | The smoke workflow depends on unverified assumptions about Vercel's `deployment_status` events (environment name "Production", `environment_url`). If they are wrong the job never starts, which looks the same as "nothing to verify": there is no alarm and no manual fallback | `DEPLOYMENT.md` §14 P08-ASSUMPTION-002 | Confirm on the first production deployment; consider adding a `workflow_dispatch` trigger with a `BASE_URL` input as a manual fallback |
| VAL-005 | MEDIUM | Environment Problem | `package.json` `engines.node` is `>=22`, open-ended: CI and local runs use Node 22 but the version Vercel runs is unknown. Reproducibility between CI and production is not guaranteed | `package.json`, `.nvmrc`, `DEPLOYMENT.md` P08-RISK-005 | Team decision to pin the major version in a controlled change (the file belongs to P06); at least verify the Node version in the Vercel build log on the first deployment |
| VAL-006 | LOW | Deployment Configuration Defect | `concurrency` with `cancel-in-progress` also cancels the run of an earlier commit when a newer push to `main` arrives, leaving that commit with a cancelled (not successful) check | `ci.yml` lines 17-19 | Cancel superseded runs only for pull requests |
| VAL-007 | LOW | Documentation Defect | `DEPLOYMENT.md` names a source revision that is followed by uncommitted files, and actions are pinned to major tags rather than commit SHAs | `DEPLOYMENT.md` §1, §12; P08-LIMIT-004, P08-RISK-003 | Refresh the revision after the commit; pin SHAs if the team wants stricter supply-chain control |
| VAL-008 | INFO | Unsupported Assumption (documented) | The rollback capability of Vercel and Neon is cited but was not exercised; the repository-level recovery (revert the commit through a pull request) is the only procedure fully under project control | `DEPLOYMENT.md` §10 | Test a rollback once on the real project |
| VAL-009 | INFO | Environment Problem (documented) | Local evidence ran on Windows with PostgreSQL 18 and an ICU locale; the workflow uses Ubuntu with `postgres:16`. The guard step checks accent folding on every real run, which covers the main difference | `evidence/ci_local_emulation.txt`, P08-ASSUMPTION-003 | None; the first GitHub run settles it |

## 5. Build Validation

### Build Definition
`npm run build` (root script, runs `vite build` in the client workspace, output to `public/`), referenced by `vercel.json` as `buildCommand` and by `ci.yml`. Runtime from `.nvmrc` (22); dependencies from `npm ci` with the lockfile. Matches the repository (checked against `package.json`, `vercel.json`, `client/vite.config.js`). A failing build fails the step.

### Execution Evidence
Executed by this validator on a fresh clean copy: `npm ci` (116 packages), `npm run build`: ✓ built, exit 0. Negative: syntax error injected into the client: step failed with exit 1 and the tests did not run. Lockfile/`package.json` mismatch: `npm ci` failed with `EUSAGE`. Not executed on a GitHub runner.

### Result
**PASS** (locally; runner not exercised)

## 6. Test Validation

### Test Definition
`npm test` (`tests/*.test.js`) and `node --test "artifacts/07_qa/test_suites/**/*.test.js"`. A guard step requires `TEST_DATABASE_URL` (a skipped database test counts as success in Node's runner, which is what P07 warned about), verifies reachability and checks accent folding. No test file was changed by P08 (`git status` shows only the P08 files as new).

### Execution Evidence
Re-executed on the fresh copy against a trust-authenticated passwordless PostgreSQL (as the workflow service container is): project suite 175/175, QA suite 143/143, 0 skipped. The guard failed correctly when the variable was unset, when the database used the C locale, and when nothing listened on the port; an injected failing test made the step exit 1 (`evidence/ci_guard_negative_tests.txt`, `evidence/p08_validation_rerun.txt`). Tests are not skipped without justification and failures propagate.

### Result
**PASS** (locally; runner not exercised)

## 7. Docker Validation

### Configuration Review
No Dockerfile, `.dockerignore` or compose file exists. The architecture's deployment view (§5.5) contains no container: Vercel builds the client and runs `src/index.js` as a function. Not creating one is consistent with the P08 prompt ("only as required by the current architecture"). Classification: **SUPPORTED** (absence justified by ARCHITECTURE §5.5 and documented as P08-DOCKER-001).

### Image Build Result
Not applicable. (Docker was also not running on this machine, so nothing could have been built.)

### Container Runtime Result
Not applicable.

### Findings
None. A container target would be a controlled architecture change, not a P08 correction.

## 8. Workflow Validation

### Trigger and Execution Flow
`ci.yml`: `push` to `main` and `pull_request`; `post-deploy-smoke.yml`: `deployment_status`. Syntactically valid, least privilege (`contents: read`), no secrets referenced, Node from `.nvmrc`.

### Build Stage
Present, runs after the install and the guard. Verified by execution to stop the job on failure.

### Test Stage
Two steps, both after the build, the first failure stops the job. Verified by execution.

### Packaging / Container Stage
Not applicable (no container, no separate artifact). Vercel rebuilds the same commit, so "build once, deploy the verified artifact" is not literally achievable here; the tie between CI and deployment is the commit SHA (documented, P08-RISK-004).

### Deployment Stage
Intentionally absent from the workflows; Vercel's Git integration deploys. This is faithful to ARCHITECTURE §5.5, but see **VAL-001**: nothing in the repository makes that deployment wait for CI.

### Verification Stage
`post-deploy-smoke.yml` runs the smoke script after a successful Production deployment event. Syntactically valid and its script is tested; the trigger is unverified (VAL-004) and a skipped check does not fail it (VAL-003).

The distinction required by the prompt: the workflows are **syntactically valid**; neither has **successfully executed the required path on the CI platform**.

## 9. Deployment Validation

### Target
Vercel (Hobby, `iad1`) plus Neon (Free), source on GitHub: supported by project evidence (TD-14, ADR-003, ADR-014, ARCHITECTURE §4.2, §5.5). Not invented by P08.

### Deployment Procedure
Documented in `DEPLOYMENT.md` §8: one-time setup by the account owner, pull request, manual migrations (`npm run migrate:status` / `migrate`) before the release, merge, smoke check. It contains no destructive step. The migration procedure was executed locally against a fresh database: pending, applied, idempotent on repeat, applied status.

### Execution Evidence
None on the target. No push was made, no Vercel/Neon credential or project was available, and the account is managed by the account owner (TD-14).

### Result
**BLOCKED** (not FAILED: nothing indicates the deployment would fail, but nothing proves it works)

## 10. Deployment Verification

No application-level check could be performed on a deployed system. What exists and was exercised locally:

- 6 of 6 API checks against the real application and a real PostgreSQL (health, database reachability through a pooled-style `DATABASE_URL`, session, auth guard, foreign-origin refusal, unknown-credentials sign-in that exercises Argon2 and the database).
- 9 of 9 checks, including the static client page, the deep-link rewrite and `/api` NOT_FOUND staying JSON, through a small router written to imitate the `vercel.json` routing. This is an emulation of a rule, **not** Vercel; it cannot settle P05-ASM-012.
- Negative cases fail with a non-zero exit code: database unreachable (SMOKE-02), server down, static checks against a server without the client, missing `BASE_URL` (exit 2).
- The script is read-only (no accounts, no writes).

Limits: the deployed revision cannot be read from the application (no version endpoint, P08-RISK-006); the strongest available link is the SHA of the deployment event.

## 11. Security Validation

- **Secrets:** none in the workflows, the script, the deployment guide or the evidence files (pattern scan for passwords, tokens, keys, private-key headers, `secrets.` and `VERCEL_TOKEN`; the only hits are comments and a fixed fake identity in the smoke test). No finding.
- **Permissions:** `contents: read` in both workflows. Good. No deployment token exists, so there is nothing to over-permit.
- **Credentials in CI:** the test database uses `trust` authentication on a per-run container reachable only from the runner; documented as acceptable only for that case. `DATABASE_URL_UNPOOLED` is explicitly kept out of GitHub.
- **Logs:** the application logs no connection string; verified here again: the log of the instance started with an unreachable database contained no connection data (P07 TEST-SEC-041 covers the rest).
- **Exposed interfaces:** the health endpoints are public and return only `ok`; no extra port is opened.
- **Security controls:** none disabled. The smoke test checks that the Origin guard (CR-021) and the authentication guard are active on the deployment.
- **Third-party actions:** two official actions pinned to major tags (VAL-007, LOW).
- No exposed secret was found, so there is no critical security finding.

## 12. Environment and Configuration Audit

| Configuration Item | Expected | Present | Classification | Result |
|---|---|---|---|---|
| `APP_ORIGIN` | Required per environment | Documented (`.env.example`, config, guide §5) | CONFIRMED (code); value for the real site UNKNOWN | OK; needs the owner at setup |
| `DATABASE_URL` / `DATABASE_URL_UNPOOLED` | Injected by Neon | Documented, never valued | CONFIRMED (architecture); not verified to exist | OK, blocked by access |
| `FEATURES` | Empty in production | Documented | CONFIRMED (ARCHITECTURE §15.1 item 5) | OK |
| `SESSION_IDLE_MINUTES`, `SESSION_ABSOLUTE_HOURS` | Defaults 60 / 12 | Documented | CONFIRMED | OK |
| `NODE_ENV` on Vercel | production | Documented as UNKNOWN | UNKNOWN | Acceptable, only affects log detail |
| `TEST_DATABASE_URL` | Required in CI | Set by `ci.yml`, guarded | CONFIRMED | OK |
| `SMOKE_BASE_URL`, repository `APP_ORIGIN` | Optional/recommended | Documented | ASSUMED | See VAL-003 |
| Node runtime | Same in CI and on Vercel | CI 22; Vercel UNKNOWN | UNKNOWN | VAL-005 |
| Database locale | Non-C | Guarded in CI; Neon unverified | CONFIRMED (CI) / UNKNOWN (Neon) | Verify on Neon |
| Branch protection (required check) | Enabled | Not in the repository | UNKNOWN | VAL-001 |
| Vercel project, Neon project, GitHub variables | Exist | Not verifiable | UNKNOWN | VAL-002 |
| Docker settings | none | none | NOT_REQUIRED | OK |

## 13. Documentation Validation

`DEPLOYMENT.md` was compared with the repository and with the execution evidence:

- All 15 required sections are present in the required order, and no secret value is written.
- Commands, file names, test counts (175 + 143), step order, variable names, the `VERCEL` refusal in `scripts/migrate.js`, the smoke check count, `.nvmrc` and `engines` match the repository.
- It does not claim a successful deployment, a green GitHub run or a verified rollback; those are labelled BLOCKED, not verified or ASSUMPTION. Its own limitations list matches this report's findings VAL-001, 002, 004, 005, 007 and 008.
- One omission: it does not mention the possibility that the smoke check SMOKE-06 is skipped silently (VAL-003); the script's output does.
- Corrections made while checking it before this report: a wrong architecture section reference and an unsupported claim about migrations being additive were fixed during generation, before validation.

Result: accurate for the current state; revision metadata will need refreshing after the commit (VAL-007).

## 14. Architecture Consistency Audit

| Deployment Element | Architecture Source | Classification | Result |
|---|---|---|---|
| Vercel + Neon target, GitHub source | §4.2, §5.5, TD-14 | SUPPORTED | Consistent |
| One function from `src/index.js`, client in `public/` | §5.5, P05-ASM-012/019 | SUPPORTED (to verify at step 0) | Consistent |
| No Docker | §5.5 (no container) | SUPPORTED | Consistent |
| Migrations manual, direct connection, outside build | §5.5, P05-ASM-015 | SUPPORTED | Consistent |
| Environment variables | §5.5 table | SUPPORTED | Consistent |
| GitHub Actions as CI | Not named by the architecture | ASSUMPTION (documented) | Acceptable, flagged |
| Branch protection as the CI-to-deploy gate | Not in the architecture | ASSUMPTION / JUSTIFIED_CHANGE (refinement) | See VAL-001 |
| Smoke workflow on `deployment_status` | Not in the architecture; supports §15.1 item 3 | ASSUMPTION | See VAL-004 |
| Ephemeral PostgreSQL service container for tests | Not a runtime component; test fixture only | JUSTIFIED_CHANGE | Consistent; no production impact |

No element is UNSUPPORTED or CONTRADICTORY.

## 15. Traceability Summary

Architecture decisions (TD-14, ADR-014, §5.5, P05-ASM-012/015/019) lead to the code (`src/index.js`, `vercel.json`, `scripts/migrate.js`), to the tests (175 + 143, with the P07 findings W-4 and F-06 turned into the guard step), to the workflow and script (P08-WF-001/002, P08-CHECK-001), and to the deployment guide. Classification of the main elements: build and test commands DIRECT; Vercel/Neon target DIRECT; migrations procedure DIRECT; the database guard REFINED (from P07 findings); smoke checks REFINED (from the health endpoints, DEV-001, and CR-021/CR-006); GitHub Actions, branch protection and the `deployment_status` trigger ASSUMED; no element UNSUPPORTED or CONTRADICTORY. The last link, "verification on the deployed system", is missing for lack of a deployment.

## 16. Scope / Change Audit

No unsupported scope or deployment expansion detected. P08 added CI configuration, one read-only verification script and documentation; it did not change application code, tests, `package.json`, `vercel.json` or the architecture, and it introduced no service, database, external API, registry or secret. The two ASSUMED elements (GitHub Actions; the test-only PostgreSQL container) are labelled and need no architectural change.

## 17. Recommended Corrections

Necessary before the verdict can change:

1. (VAL-002) Do the one-time setup with the account owner, push, and inspect the first real CI, deployment and smoke runs. Keep the evidence.
2. (VAL-001) Enable and evidence branch protection with the required `build-and-test` check.
3. (VAL-003) Make a skipped smoke check fail the post-deploy workflow (or require the variable).

Strongly recommended:

4. (VAL-004) Confirm the `deployment_status` payload on the first deployment and add a manual `workflow_dispatch` fallback.
5. (VAL-005) Decide on pinning the Node major version (a P06 file; controlled change).
6. (VAL-006, VAL-007) Restrict cancellation to pull requests; refresh the revision in the guide after the commit.
7. Have a person who did not write the artifacts review them (independence limitation).

## 18. Advance Readiness

- Build functioning: **YES** (verified locally on a clean copy)
- Tests functioning: **YES** (175 + 143, locally; guard and negative cases verified)
- Deployment functioning: **NO** (not executed)
- Deployment verified: **NO** (no deployed system was verified)

Result:

- **BLOCKED**

## 19. Final Decision

**Result:** BLOCKED

### Conditions to Proceed

- The deployment is executed on the real target (Vercel + Neon) by or with the account owner, including the migrations, and the smoke workflow (or the script by hand) passes against it.
- VAL-001 is resolved with evidence; VAL-003 is corrected or accepted by the team.
- Then re-run the P08 validation. If those pass, the expected outcome is `PASS_WITH_WARNINGS` (remaining LOW/MEDIUM items and P07's open UI/NFR gaps), and the project may proceed to P09. The pipeline is not advanced automatically.

### Conditions to Revalidate

- Any change to `ci.yml`, `post-deploy-smoke.yml`, `scripts/smoke-test.js`, `vercel.json`, `package.json` (engines, scripts) or the environment variables.
- The first real GitHub Actions run and the first real deployment.
- A change of target (for example a container platform), which would be a controlled architecture change.

## 20. Validator Integrity Statement

- No source artifact was modified during this validation: the workflows, script, `DEPLOYMENT.md`, application code and tests were read and executed, not edited. The only files written by the validation are this report and the evidence file `evidence/p08_validation_rerun.txt`; fault injection was done on a scratch copy. (The generation step, earlier in the same session, did edit `DEPLOYMENT.md` before this validation began; see the independence limitation in section 2.)
- No deployment decision was invented. GitHub Actions, branch protection and the `deployment_status` trigger are reported as assumptions, not as project decisions.
- No unsupported infrastructure was approved without being identified (section 14, section 16).
- No secrets were reproduced.
- No tests were accepted merely because a workflow step existed: the steps were executed and their failure paths were exercised.
- No deployment was marked successful without evidence; the deployment is marked BLOCKED.
- Findings are evidence-based; each cites a file or a log.
