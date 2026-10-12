# P07.1 — Test Execution Report

**Stage:** P07.1 Automated Test Suite Generation
**Date:** 2026-10-12
**Completion status:** `READY_WITH_LIMITATIONS` (see section 8; tests were created and executed, one test fails and documents a suspected defect, and some scope cannot be tested yet)

> **Snapshot note:** this report records the state at the end of P07.1 (140 tests, `TEST-SEC-035` failing). DEF-001 was analysed in `TEST_ANALYSIS_REPORT.md` and fixed in P07.3 (`BUG_FIX_REPORT.md`); after the fix the suite has 143 tests and all pass. Sections below are intentionally left as they were at P07.1, apart from corrections found in P07.2 (F-07).

> This status describes completion of P07.1 only. It is **not** a quality-gate verdict; P07.2 decides that.

## 1. Inputs and how they were resolved

The prompt names unversioned artifacts. The repository only holds versioned files, so the latest version of each was used.

| Prompt input | File actually used | Notes |
|---|---|---|
| `prompts/system/SYSTEM_PROMPT.md` | same | `SYSTEM_PROMPT.md` does not exist at the repository root; it is under `prompts/system/`. |
| `REQUIREMENTS.md` | `artifacts/02_requirements/REQUIREMENTS_V3.md` | Source of every acceptance criterion (AC) used below. |
| `PRIORITIZATION.md` | `artifacts/03_planning/PRIORITIZATION_v2.md` | Read for scope. |
| `product_backlog.json` | `artifacts/03_planning/product_backlog_priori_v2.json` | Read for scope. |
| `ARCHITECTURE.md` / `ARCHITECTURE_VALIDATION.md` | `ARCHITECTURE_V2.md` / `ARCHITECTURE_VALIDATION_V2.md` | Component, contract and CR ids. |
| API contract | `artifacts/05_architecture/API_SPEC_V1.yaml` | Used by the contract suite. |
| `UX_SPEC.md` | `artifacts/04_ux/UX_SPEC_V2.md` | Not used to derive tests: no UI test tooling exists (section 8). |
| `IMPLEMENTATION_INDEX.md` and P06 logs | `artifacts/06_implementation/...` | Implemented scope. |

## 2. Scope tested

The implemented stories per `IMPLEMENTATION_INDEX.md` (15 of the 35 stories): **US-001, US-002, US-003, US-008, US-009, US-010, US-013, US-016, US-017, US-018, US-019, US-020, US-021, US-024, US-034.**

Not in scope because they are not implemented: US-004..US-007, US-011, US-012, US-014, US-015, US-022, US-023, US-025 onward (orders, cancellation, rescheduling, ...).

Approach: black-box tests over HTTP against the **real composed application** (every module registered in `src/modules/index.js`), a **real PostgreSQL schema** created from `migrations/`, real Argon2id hashing and a controllable clock. Expected values come from REQUIREMENTS_V3.md and API_SPEC_V1.yaml, not from reading the implementation's output. These tests complement, and do not replace, the 175 existing tests in `tests/`, which stay untouched.

## 3. Test files created

All under `artifacts/07_qa/test_suites/`. No existing file was modified and no production code was changed.

| File | Type | Tests | Stories |
|---|---|---:|---|
| `unit/scheduling-and-validation.unit.test.js` | unit | 25 | US-001/002/009/010/013/016/017/019/020 (pure functions) |
| `integration/identity-and-sessions.integration.test.js` | integration | 34 | US-001, 002, 003, 034, AC-114 |
| `integration/provider-catalog-and-discovery.integration.test.js` | integration | 23 | US-008, 009, 010, 013, 016, 017, 018 |
| `integration/booking-and-appointments.integration.test.js` | integration | 25 | US-019, 020, 021, 024, AC-081 |
| `contract/api-contract.test.js` | contract | 10 | all implemented endpoints vs `API_SPEC_V1.yaml` |
| `security/access-control-and-hardening.test.js` | security | 23 | BR-001, AC-013, AC-113, AC-064, CR-005, CR-020, CR-021 |
| `support/harness.js`, `support/schema-validator.js` | helpers | n/a | not test files |

Execution evidence kept in `artifacts/07_qa/evidence/`: `p07_1_qa_suite_run.tap` (this suite) and `p07_1_existing_suite_run.txt` (existing suite).

## 4. Commands executed and actual results

Environment: Node v22.19.0, Windows 10. The database tests need `TEST_DATABASE_URL` (already set in the local `.env` to `localhost:5434/vetcare_test`).

**Environment finding (not a product defect).** Nothing was listening on port 5434, so the *existing* suite initially ran **138 pass / 50 fail** (`ECONNREFUSED` in every database test). I created a throwaway local PostgreSQL 18 cluster on port 5434 (user and password taken from `TEST_DATABASE_URL`, data directory in the session scratchpad, nothing committed). My first cluster used the `C` locale; that made 2 existing search tests fail (`lower()` does not fold non-ASCII capitals such as `Ú` in the C locale). I recreated the cluster with an ICU `es-CO` locale and both passed. The accent-insensitive search relies on `lower()`, so **a production or CI database must not use the C locale**; that is a deployment note, not a code defect.

| # | Command | Result |
|---|---|---|
| 1 | `npm test` (existing suite, database unavailable) | 188 tests: 138 pass, 50 fail (all `ECONNREFUSED`: environment) |
| 2 | `npm test` (database up, C locale) | 175 tests: 173 pass, 2 fail (locale: environment) |
| 3 | `npm test` (database up, ICU es-CO) | **175 tests: 175 pass, 0 fail, 0 skipped** (`evidence/p07_1_existing_suite_run.txt`) |
| 4 | `node --env-file=.env --test --test-reporter=tap "artifacts/07_qa/test_suites/**/*.test.js"` | **140 tests: 139 pass, 1 fail, 0 skipped, 28 suites, 14.3 s** (`evidence/p07_1_qa_suite_run.tap`) |
| 5 | same command without `TEST_DATABASE_URL` and without `--env-file` | 25 tests run and pass (unit); the database-backed suites are skipped at suite level, so they do **not** appear as passed tests (they are `NOT_EXECUTED`) |

During authoring, five of my own tests failed on first run and were corrected because the test was wrong, not the product: session expiry caused by moving the fake clock hours ahead (twice), a probe that omitted a required modality, an expectation about an ignored unknown query key, and a mis-pasted label. None of these were production defects.

**Not executed:** `npm run build` (the client build, it rewrites `public/`), any browser or UI interaction, and any hosted Vercel/Neon check.

## 5. Failing test: the defect that needs P07.2 analysis

| Test | Result |
|---|---|
| `TEST-SEC-035` (security) | **FAIL**, reproducible, 14 of 14 probes |

A NUL character (`U+0000`) in any of these free-text inputs returns **HTTP 500 `UNEXPECTED`** instead of **422 `VALIDATION_FAILED`**:

```
search text                       owner sign-up: name, pet name, pet breed
sign-in e-mail                    provider sign-up: name, e-mail, address
publish service name              publish product name
profile: public name, contact e-mail, address        booking: home-visit address
```

Fields that already reject it correctly: the profile phone (422 `INVALID_FORMAT`). A NUL inside a password is accepted (201) and is not stored as text, so it is not affected.

Suspected cause (hypothesis, confirmed independently in P07.2 with the bare driver): PostgreSQL text parameters cannot contain `U+0000` (error `22021 invalid byte sequence for encoding "UTF8": 0x00`), and the final error handler maps any unknown error to `UNEXPECTED`. The request validators accept the character.

Why it matters: the API contract (CTR-001, `ErrorResponse`) and CR-005 expect rejected input to be reported by validation; a client can trigger server errors at will and pollute the error log. Suggested severity for P07.2 to decide: MINOR to MAJOR (no data corruption or access-control impact observed).

The test is intentionally left failing as the regression evidence for P07.3.

## 6. Traceability: acceptance criteria to tests

`✔` = verified by a passing test. `✘` = covered by a failing test. All test ids appear in the test titles.

| Story | AC | Verified by | Result |
|---|---|---|---|
| US-001 | AC-001 | TEST-ID-001 | ✔ |
| | AC-002 | TEST-ID-002 | ✔ |
| | AC-003 | TEST-ID-003 (7 variants: name, email, password, pet name/species/age/breed) | ✔ |
| | AC-004 | TEST-ID-004 (exact, upper-case and padded duplicate) | ✔ |
| | AC-005 | TEST-ID-005 | ✔ |
| | AC-074 | TEST-ID-006 | ✔ |
| | AC-075 | TEST-ID-007, TEST-UT-041 | ✔ |
| | AC-102 | TEST-ID-008, TEST-UT-040 | ✔ |
| US-002 | AC-006, AC-105 | TEST-ID-010 | ✔ |
| | AC-007 | TEST-ID-011 | ✔ |
| | AC-008 | TEST-ID-012 | ✔ |
| | AC-009 | TEST-ID-013 | ✔ |
| | AC-076 | TEST-ID-014 | ✔ |
| | AC-103 | TEST-ID-015 | ✔ |
| | AC-104 | TEST-ID-016, TEST-UT-042 | ✔ |
| US-003 | AC-010, AC-011 | TEST-ID-020, TEST-ID-025 | ✔ |
| | AC-012 | TEST-ID-021, TEST-ID-024, TEST-SEC-006 | ✔ |
| | AC-013 | TEST-ID-022, TEST-SEC-002 (every endpoint, both directions) | ✔ |
| | AC-077 | TEST-ID-023 | ✔ |
| | AC-114 | TEST-ID-030, 031, 032 (idle 60 min, absolute 12 h, re-sign-in) | ✔ |
| US-034 | AC-112 | TEST-ID-040, 041, 042 (API level: the redirect to the sign-in screen is UI) | ✔ (API) |
| | AC-113 | TEST-ID-040, 043, TEST-SEC-001 | ✔ |
| US-008 | AC-023 | TEST-PC-001, 004, 005 | ✔ |
| | AC-024 | TEST-PC-002 | ✔ |
| | AC-106 | TEST-PC-003 | ✔ |
| US-009 | AC-025 | TEST-PC-010, 012, TEST-BK-001, 004, TEST-UT-006/007 | ✔ |
| | AC-026 | TEST-BK-003, TEST-UT-005 | ✔ |
| | AC-080 | TEST-PC-011, TEST-UT-021 | ✔ |
| | AC-081 | TEST-BK-042, 043, 050 (incl. boundary hours and a concurrent race) | ✔ |
| US-010 | AC-027 | TEST-PC-020 | ✔ |
| | AC-028, AC-029, AC-082 | TEST-PC-021, 022, 023 | ✔ |
| | AC-107 | TEST-PC-024, TEST-UT-043 | ✔ |
| US-013 | AC-033, AC-034, AC-084 | TEST-PC-020, 021, 023 | ✔ |
| US-033 (not implemented as a story) | AC-111 | TEST-PC-025 (requirements place AC-111 under US-033; P06 implemented "new products are available" inside the US-013 publish path) | ✔ |
| US-016 | AC-038, AC-039 | TEST-PC-030, 036 | ✔ |
| | AC-040 | TEST-PC-031 (API returns an empty list; the "no results" message is UI) | ✔ (API) |
| US-017 | AC-041, AC-043 | TEST-PC-033 | ✔ |
| | AC-042 | TEST-PC-034 | ✔ |
| | AC-086 | TEST-PC-035 | ✔ |
| US-018 | AC-044 | TEST-PC-001, 037, 038 | ✔ |
| | AC-045 | TEST-PC-002 | ✔ |
| US-019 | AC-046 | TEST-BK-001, 005, 018 | ✔ |
| | AC-047 | TEST-BK-010 | ✔ |
| | AC-048 | TEST-BK-016 | ✔ |
| | AC-049 | TEST-BK-011, 014 | ✔ |
| | AC-050 | TEST-BK-012, 013, 019 | ✔ |
| | AC-051 | TEST-BK-002, 018, TEST-UT-003 | ✔ |
| | AC-108, AC-109 | TEST-BK-015 | ✔ |
| US-020 | AC-052 | TEST-BK-030 | ✔ |
| | AC-053 | TEST-BK-031 | ✔ |
| | AC-054 | TEST-BK-032, 033, TEST-UT-033 | ✔ |
| US-021 | AC-055 | TEST-BK-040, 041, 044 | ✔ |
| | AC-056 | none: needs provider rescheduling (US-026, not implemented) | not testable |
| | AC-087 | TEST-BK-042 (automatic cancellation only) | ✔ (partial) |
| US-024 | AC-063 | TEST-BK-040 | ✔ |
| | AC-064 | TEST-BK-041, TEST-SEC-020 | ✔ |
| | AC-088 | TEST-BK-042 (automatic cancellation only) | ✔ (partial) |
| Cross-cutting | CTR-001 / API_SPEC | TEST-CT-001..005, 010..012, 020, 021 | ✔ |
| | CR-021 origin | TEST-SEC-010, 011, 012 | ✔ |
| | ADR-007 session | TEST-SEC-004, 005 | ✔ |
| | CR-005 no leakage | TEST-SEC-040 | ✔ |
| | CR-005 / CTR-001 input robustness | **TEST-SEC-035** | ✘ (NUL, section 5) |
| | CR-020 log hygiene | TEST-SEC-041 | ✔ |
| | injection / mass assignment / IDOR | TEST-SEC-021, 022, 023, 030, 031, 032, 033, 034, 036 | ✔ |

## 7. Tests passed, failed, skipped, not executed

| Measure | Value | Source |
|---|---:|---|
| New suite: total | 140 | command 4 |
| New suite: passed | 139 | command 4 |
| New suite: failed | 1 (`TEST-SEC-035`) | command 4 |
| New suite: skipped | 0 (with the database available) | command 4 |
| Existing suite (regression) | 175 / 175 pass | command 3 |
| Code coverage | **not measured** | no coverage tooling was run |
| Client UI | **not executed** | no UI test tooling in the repository |

## 8. Known gaps, limitations and risks

1. **Acceptance criteria not verifiable yet (feature missing):** AC-056 (provider reschedules; US-026 is not implemented); the owner-cancelled and provider-cancelled forms of AC-087/AC-088 (US-022/US-025 not implemented) are only verified for the automatic cancellation.
2. **UI behavior untested:** AC-112 "taken to the sign-in screen", AC-040 "told there are no results", AC-048/AC-109 messages, the species filter widget, search-state retention and every UX_SPEC screen. The repository has no browser or component test tooling, and P06 reports already list these as open. Only the API half of these criteria is verified.
3. **Hosted runtime (COND-001) unverified:** Vercel and Neon, serverless Argon2id, the pooled connection and the `Secure` cookie over real HTTPS were not tested. All tests ran against local PostgreSQL 18.
4. **Non-functional requirements not measured:** performance, response times and Argon2id parameters were not measured; no thresholds were invented.
5. **Test database prerequisite:** the database-backed suites are skipped (not failed) when `TEST_DATABASE_URL` is missing, so a green run without a database proves only the 25 unit tests. Run the command in section 4 with the database variable set.
6. **Locale prerequisite:** accent- and case-insensitive search needs a non-C database locale (section 4).
7. **Added pets via SQL:** US-004/US-007 are not implemented, so tests that need a second pet or an owner with no pet insert or delete `pet` rows directly through the admin connection.
8. **Contract validator coverage:** `support/schema-validator.js` implements the keywords used by `API_SPEC_V1.yaml` but not `if/then` (used for the provider-address rule); that rule is covered by behavioral tests instead.
9. **Not covered by design:** timing-based user enumeration, rate limiting and brute-force protection (no requirement states them), and `/api/health/db` (not part of the API contract, and the harness pool has no `ping`).
10. **Stale numbers in P06 logs:** several P06 logs and the index mention 192/193 passing tests, while the runtime validation report and this run show 175. The 175 figure is the verified one.

## 9. Defects and observations for P07.2

| Candidate | Type | Evidence |
|---|---|---|
| NUL character in free text returns 500 instead of 422 (14 inputs) | suspected implementation defect (input validation) | `TEST-SEC-035`, section 5 |
| Existing P06 test counts (192/193) disagree with the executable result (175) | documentation inconsistency (INFO) | section 8, item 10 |
| Database created in the C locale breaks accent-insensitive search | environment/deployment note | section 4 |
| Prompt input names (`REQUIREMENTS.md` ...) do not match the versioned files | documentation inconsistency (INFO) | section 1 |

## 10. How to re-run

```bash
# one-time: a throwaway PostgreSQL (UTF-8, non-C locale) reachable through TEST_DATABASE_URL in .env
npm test                                                         # existing suite
node --env-file=.env --test "artifacts/07_qa/test_suites/**/*.test.js"   # P07 suite
```
