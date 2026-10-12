# P07.2 — Test Execution Analysis & Coverage Audit

**Date:** 2026-10-12
**Analysis round:** 2 (reassessment after the P07.3 correction of DEF-001). Round 1 (after P07.1) is kept unchanged in sections 1 to 10, which describe the evidence of that round; section 11 holds the round 2 reassessment and the current verdict.

## 1. Executive summary and verdict

**Current verdict (round 2): `PASS_WITH_WARNINGS`**. Round 1 verdict was also `PASS_WITH_WARNINGS`, with DEF-001 open; see section 11.

*The rest of this section is the round 1 summary.*

The planned scope (the 15 P0 stories committed to SPRINT-001) was exercised end to end against the real application and PostgreSQL. Every acceptance criterion that can be verified at API level has passing evidence, including the four criteria that P06 had marked as failing for missing integration (AC-027, AC-033, AC-047, AC-052). The independent re-run, a coverage measurement and a mutation check all support the P07.1 results.

One implementation defect is confirmed (**DEF-001**, MINOR): a NUL character in free-text input produces HTTP 500 instead of a validation error. There are no unresolved BLOCKER or CRITICAL defects.

The verdict is a *warning*, not a clean pass, because of documented gaps that this stage cannot close: the browser UI has no automated tests, the hosted Vercel/Neon runtime is unverified (COND-001), and a few criteria depend on stories that do not exist yet. See sections 7 and 8.

This is a verdict on the current evidence only. It is **not** a release approval; the pipeline's release criteria and human sign-off still apply.

## 2. Scope reviewed and evidence sources

| Source | How it was used |
|---|---|
| `prompts/system/SYSTEM_PROMPT.md`, `prompts/07_testing/*` | Rules. Note the prompts name unversioned artifacts; the latest versioned files were used (see TEST_EXECUTION_REPORT section 1). |
| `artifacts/02_requirements/REQUIREMENTS_V3.md` | All acceptance criteria. The 65 criteria attached to the 15 implemented stories were extracted mechanically and compared with the traceability table. |
| `artifacts/03_planning/product_backlog_priori_v2.json`, `PRIORITIZATION_v2.md` | Planned scope: the 15 stories marked `P0 / SPRINT-001`. All 19 other stories are `CONDITIONAL` and deferred by team decision TD-16 if unfinished. |
| `artifacts/05_architecture/API_SPEC_V1.yaml`, `ARCHITECTURE_V2.md`, `ARCHITECTURE_VALIDATION_V2.md` | Contract and constraints. |
| `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`, P06 logs and validation reports, `RUNTIME_VALIDATION_REPORT_2026-10-12.md` | Implementation status and prior claims. |
| `artifacts/07_qa/TEST_EXECUTION_REPORT.md` and `artifacts/07_qa/test_suites/**` | P07.1 output, read in full and re-executed. |
| The actual source (`src/`), the existing 175 tests (`tests/`) and `migrations/001_initial_schema.sql` | Read to classify causes. **No production code was modified**; `git status` shows only the new untracked `artifacts/07_qa/`. |

Missing inputs: none that block the analysis. Absent by nature: client-side tests, a hosted environment, performance data.

## 3. Test execution results (independently re-executed)

Every number below comes from a command run during this analysis, not copied from the P07.1 report. Logs are in `artifacts/07_qa/evidence/`.

| Run | Command | Total | Pass | Fail | Skipped |
|---|---|---:|---:|---:|---:|
| New P07 suite | `node --env-file=.env --test --test-reporter=tap "artifacts/07_qa/test_suites/**/*.test.js"` | 140 | 139 | 1 | 0 |
| Existing project suite | `npm test` | 175 | 175 | 0 | 0 |
| Both together (coverage run) | `node --env-file=.env --experimental-test-coverage --test-coverage-include="src/**" --test "artifacts/07_qa/test_suites/**/*.test.js" tests/*.test.js` | 315 | 314 | 1 | 0 |
| Client build | `npm run build` | build OK, 40 modules, exit 0 | | | |

Failure classification: the single failing test is `TEST-SEC-035`. It was investigated before classification (section 6): the **test is correct** and the failure is an **implementation defect**. It is not a flaky test (reproduced on every run) and not an environment problem.

Two environment problems were found and resolved during P07.1 and are **not** product defects: the configured test database was not running (50 existing tests failed with `ECONNREFUSED`), and a C-locale database made two search tests fail. Both are documented in TEST_EXECUTION_REPORT section 4.

Without `TEST_DATABASE_URL`, only the 25 unit tests run and the 115 database-backed tests are skipped at suite level; a green run in that condition proves much less (see W-4).

## 4. Coverage results

Measured with Node's built-in `--experimental-test-coverage`, restricted to `src/**`, on the local machine against PostgreSQL 18. No threshold was applied because no approved artifact defines one.

| Scope | Line % | Branch % | Function % | Evidence |
|---|---:|---:|---:|---|
| New P07 suite alone | 96.36 | 91.30 | 93.63 | `evidence/p07_2_coverage_new_suite.txt` |
| New suite + existing suite | 98.74 | 95.01 | 96.43 | `evidence/p07_2_coverage_combined.txt` |

The coverage run executed 315 tests and 1 failed (DEF-001), so the percentages describe a run that included that failure. Lines not exercised by the new suite are mostly the migration runner (covered by the existing `tests/database.test.js`), configuration error branches (covered by `tests/shared.test.js`) and `/api/health/db`. Client code (`client/src`) is **not** measured: it has no tests.

Coverage shows which lines ran, not whether the assertions are strong. That is why a mutation check was added (next section).

## 5. Independent validation of the P07.1 artifacts

| Check | Result |
|---|---|
| Re-ran the P07.1 suite | Reproduced exactly: 140 total, 139 pass, 1 fail. |
| Test count claims | Static count 134 `test()` declarations + 6 generated by one loop (7 variants of `TEST-ID-003` counted as one declaration) = 140. Matches. |
| Test ids | 134 declared ids, all unique; all 71 ids cited in the report exist. |
| Traceability (65 criteria of the 15 stories, extracted from REQUIREMENTS_V3.md) | 64 appear in the P07.1 traceability table with at least one test. **AC-056 was missing from the table** (feature missing, US-026). |
| Other report accuracy | **AC-111** was attributed to US-013; REQUIREMENTS_V3.md places it under US-033. The report also named US-023 for provider rescheduling (it is US-026). All three were corrected in `TEST_EXECUTION_REPORT.md` during this review (F-07). |
| Defect scope in the report | The report originally listed 9 affected inputs; an independent probe found **14** (added `pet breed`, `provider name`, `provider e-mail`, `profile contact e-mail`, `home-visit address`). The report and `TEST-SEC-035` were updated. |
| Do the tests detect faults? (mutation check on a scratch copy, real repository untouched) | **9 of 9 injected faults were caught** by tests other than TEST-SEC-035 (below). |
| Production code unchanged | `git status`: only `?? artifacts/07_qa/`. |

Mutation check (`evidence/p07_2_mutation_check.txt`). Baseline of the copy: only `TEST-SEC-035` fails.

| Fault injected | Caught by |
|---|---|
| M1 slot may extend past closing time | TEST-BK-001, 002, 004, 005, 018, TEST-UT-001, 006, 007 |
| M2 a slot starting exactly now is offered | TEST-BK-002, 018, TEST-UT-003 |
| M3 independent veterinarian slot can be double booked | TEST-BK-012, TEST-UT-004 |
| M4 changing hours also cancels past appointments | TEST-BK-043 |
| M5 origin guard removed | TEST-SEC-010, TEST-CT-010 |
| M6 idle limit off by one (exactly 60 min still valid) | TEST-ID-030 |
| M7 pet species not checked when booking | TEST-BK-015, TEST-CT-010 |
| M8 species filter ignored in search | TEST-PC-033, 034, 035, TEST-CT-004 |
| M9 wrong outcome for a wrong-role request | TEST-ID-022, TEST-SEC-002, TEST-CT-010 |

Limit of this evidence: nine hand-chosen mutations are a sanity check on assertion strength, not a systematic mutation score.

## 6. Findings

| ID | Severity | Type | Status |
|---|---|---|---|
| DEF-001 | MINOR | Implementation defect | OPEN, confirmed; goes to P07.3 |
| F-02 | INFO | Documentation inconsistency | Open |
| F-03 | INFO | Unverifiable criteria | Open |
| F-04 | INFO | Coverage gap (UI) | Open |
| F-05 | INFO | Unverified environment (COND-001) | Open |
| F-06 | INFO | Environment/deployment note | Open |
| F-07 | INFO | Test-report accuracy | Resolved during this review |
| F-08 | INFO | Documentation inconsistency | Open |

### DEF-001 — A NUL character in free text returns HTTP 500 instead of a validation error (MINOR)

- **Expected:** invalid input is rejected with `422 VALIDATION_FAILED` and the field named (CTR-001 / `ErrorResponse`, CR-005 in `ARCHITECTURE_V2.md`; SYSTEM_PROMPT section 13 "validate external input").
- **Observed:** `HTTP 500 {"code":"UNEXPECTED"}` for a value such as `"a\u0000b"` in 14 inputs: search text; owner sign-up name, pet name and pet breed; provider sign-up name, e-mail and address; sign-in e-mail; service name; product name; profile public name, contact e-mail and address; home-visit address. `TEST-SEC-035` reproduces all 14. The profile phone (422) and the password (accepted, never stored as text) are not affected.
- **Cause (CONFIRMED):** PostgreSQL rejects `U+0000` in text parameters. A direct driver call without any application code returns error `22021 invalid byte sequence for encoding "UTF8": 0x00`. The request validators do not reject the character, and `src/http/errors.js` maps the unknown driver error to `UNEXPECTED`. The affected validators are `validateOwnerSignUp`, `validateProviderSignUp`, `validateSignIn`, `validatePublishService/Product`, `validateProviderProfileUpdate`, `validateSearchQuery` and `validateBookingRequest`.
- **Impact:** any client, including an unauthenticated one on sign-up and sign-in, can trigger server errors at will and add noise to the error log. No data corruption, no authentication or authorization bypass and no information leak were observed (the response body is only the code). Hence MINOR, not MAJOR.
- **Affected requirements:** none of the 65 acceptance criteria states this; it violates the contract-level rule that rejected input is reported through validation.
- **Not claimed:** the exact set of affected inputs may differ if new text fields are added; the 14 listed are the ones probed.
- **Handoff:** P07.3. The correction must not change the API contract (reason `INVALID_FORMAT` already exists in `ReasonCode`) or the schema.

### Informational findings

- **F-02 (INFO)** `IMPLEMENTATION_INDEX.md` is stale. It still shows validation `FAIL` for US-010 (AC-027), US-013 (AC-033), US-019 (AC-047) and US-020 (AC-052), `BLOCKED` for US-009 and test counts of 192/193. The cause of those failures (missing integration with search, public profile and appointment lists) is gone, and P07 now has passing evidence for all of those criteria. The index is a P06 artifact and was not edited; its owner should re-validate (P06.4) or record the P07 evidence. The verified test count is 175 existing tests, as `RUNTIME_VALIDATION_REPORT_2026-10-12.md` also states.
- **F-03 (INFO)** Not verifiable yet because the story does not exist: AC-056 (provider reschedules; US-026) and the owner-cancelled and provider-cancelled forms of AC-087 and AC-088 (US-022, US-025). Only automatic cancellation by a working-hours change is verified. These stories are `CONDITIONAL` (deferred), not part of the committed scope.
- **F-04 (INFO)** Browser behavior has no automated tests: AC-112 "taken to the sign-in screen", AC-040 "told there are no results", AC-048 and AC-109 messages, the species filter widget and search-state retention (a known P06 warning), and visual/accessibility review. The API halves are verified. A build succeeds, which only shows that the client compiles.
- **F-05 (INFO)** Hosted runtime (COND-001) is unverified: Vercel, Neon, serverless Argon2id and cookies over real HTTPS. All evidence is local.
- **F-06 (INFO)** The database must use a non-C locale: accent-insensitive search relies on `lower()`, which does not fold non-ASCII capitals in the C locale (2 existing tests failed until the test cluster was recreated with an ICU locale). Record this as a deployment prerequisite.
- **F-07 (INFO, resolved)** P07.1 report inaccuracies found by this review: AC-111 attribution, a missing AC-056 row, a wrong story number and an incomplete defect scope. Fixed in `TEST_EXECUTION_REPORT.md`.
- **F-08 (INFO)** The P07 prompts name `REQUIREMENTS.md`, `ARCHITECTURE.md`, `PRIORITIZATION.md`, `product_backlog.json` and `SYSTEM_PROMPT.md` at the repository root; the repository holds versioned files and `SYSTEM_PROMPT.md` under `prompts/system/`.

## 7. Traceability and untested criteria

The full criterion-to-test table is in `TEST_EXECUTION_REPORT.md` section 6 (corrected). Summary after this independent review:

| Status | Criteria | Count |
|---|---|---:|
| Fully verified at the level the implementation exposes | all others | 58 |
| Verified for the API only; the screen behavior (message, redirect, widget) is untested | AC-040, AC-048, AC-109, AC-112 | 4 |
| Partly verified: only the automatic-cancellation path exists | AC-087, AC-088 | 2 |
| Not verifiable: the feature does not exist (US-026) | AC-056 | 1 |
| **Total criteria of the 15 stories** | | **65** (64 with passing evidence, 1 without) |

Untested or partly tested criteria therefore are: AC-040, AC-048, AC-109 and AC-112 (UI half), AC-087 and AC-088 (owner/provider cancel forms) and AC-056. No criterion was assumed to pass.

Acceptance criteria outside the 15 committed stories (for example AC-111, under US-033) were exercised only where the implemented behavior overlaps.

## 8. Limitations and risks

- **W-1** UI untested (F-04).
- **W-2** Hosted runtime unverified (F-05); the Neon pooler behavior, cold starts and Argon2id timing on Vercel are unknown.
- **W-3** Non-functional requirements (performance, availability, accessibility) were not measured and no thresholds were invented.
- **W-4** Database-backed tests are skipped, not failed, when `TEST_DATABASE_URL` is missing; a pipeline that omits it would report a misleadingly green result. P08 should make the database variable mandatory for the test job.
- **W-5** Mutation evidence is small (9 mutations).
- **W-6** Concurrency was exercised with 8 parallel requests per scenario and 3 repeated rounds of a booking-versus-hours race; this is evidence, not a proof of absence of races.
- **W-7** No human review of the test suite has taken place; "tests pass" does not replace the team's acceptance.

## 9. Required next actions

1. **P07.3:** fix DEF-001 with the smallest change in the shared validation path, keep `TEST-SEC-035` as the regression test, and re-run the full suites.
2. Return to P07.2 after P07.3 to update this report and the verdict; keep this round's history.
3. Before P08: make `TEST_DATABASE_URL` mandatory in CI and use a non-C database locale (W-4, F-06).
4. Decide whether browser/E2E tests are in scope for this MVP; if yes, add tooling (F-04). If not, record the UI risk as accepted.
5. Ask the P06 owners to refresh `IMPLEMENTATION_INDEX.md` using the P07 evidence (F-02).
6. Hosted verification of COND-001 remains an external prerequisite before deployment.

## 10. History

| Round | Verdict | Notes |
|---|---|---|
| 1 | `PASS_WITH_WARNINGS` | After P07.1. Open: DEF-001 (MINOR) and the warnings above. |
| 2 | `PASS_WITH_WARNINGS` | After P07.3. DEF-001 resolved and verified; the warnings remain. See section 11. |

## 11. Round 2 — reassessment after P07.3

Basis: the patch was read (`git diff`: `src/app.js` +1 import and +1 registration line, `src/http/middleware.js` +25 lines, nothing else changed in the working tree apart from the new `artifacts/07_qa/`), and the tests were **re-executed**; `BUG_FIX_REPORT.md` was not taken as proof.

| Run (after the fix) | Total | Pass | Fail | Skipped |
|---|---:|---:|---:|---:|
| New P07 suite | 143 | 143 | 0 | 0 |
| Existing project suite (`npm test`) | 175 | 175 | 0 | 0 |
| Both together, with coverage | 318 | 318 | 0 | 0 |
| Client build (`npm run build`) | build OK (exit 0) | | | |

The new suite grew from 140 to 143 tests: `TEST-SEC-037` (password handling unchanged), `TEST-UT-060` and `TEST-UT-061` (boundary middleware). `TEST-SEC-035`, which failed in round 1 for all 14 inputs, now passes. No existing test was edited.

Coverage of `src/**` with both suites, same command as round 1: **98.76 % line, 95.05 % branch, 96.49 % function** (round 1: 98.74 / 95.01 / 96.43). Client code is still not measured.

Reassessment of the findings:

| ID | Round 1 | Round 2 | Reason |
|---|---|---|---|
| DEF-001 | OPEN (MINOR) | **RESOLVED, verified** | Regression test fails before and passes after; manual probe also shows `GET /api/search?q=a%00b` now answers 422 with field `q`. Remaining caveat: verified locally only, not hosted. |
| F-02 | OPEN | OPEN | `IMPLEMENTATION_INDEX.md` still stale; P06 owners' action. |
| F-03 | OPEN | OPEN | AC-056 and the owner/provider cancel forms still depend on unimplemented stories. |
| F-04 | OPEN | OPEN | Still no UI tests. The UI behavior for the new 422 on an invisible character was not checked. |
| F-05 | OPEN | OPEN | Hosted runtime unverified. |
| F-06 | OPEN | OPEN | Deployment prerequisite (non-C locale, mandatory test database). |
| F-07 | RESOLVED | RESOLVED | Unchanged. |
| F-08 | OPEN | OPEN | Unchanged. |

New observation from the review of the patch (INFO, not a defect): a request containing a NUL character now answers 422 before the authentication check, so an unauthenticated request with NUL receives 422 and not 401. This matches the existing precedence of malformed JSON, exposes no data, and was noted in `BUG_FIX_REPORT.md`.

**Verdict: `PASS_WITH_WARNINGS`.** No unresolved BLOCKER or CRITICAL defect remains and no defect of any severity is open. The verdict stays at "with warnings" because the criteria in section 7 (UI halves, AC-056, owner/provider cancel forms) and the hosted runtime (COND-001) are still not verified, and no human review of the suite has happened. These are evidence gaps, not failures.

Required next actions (updated): items 3 to 6 of section 9 remain open; items 1 and 2 are done. In addition, commit the P07.3 change after human review; it is currently uncommitted.
