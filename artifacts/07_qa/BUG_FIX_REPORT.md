# P07.3 — Bug Fix Report

**Date:** 2026-10-12
**Defects handled:** DEF-001 (the only confirmed defect in `TEST_ANALYSIS_REPORT.md` round 1)

Informational findings F-02 to F-08 are not code defects and were not touched (F-07 was already corrected in P07.2).

---

## DEF-001 — A NUL character in free text returns HTTP 500 instead of 422

### Defect Information

| Item | Value |
|---|---|
| Defect ID | DEF-001 (from P07.2, round 1) |
| Summary | `U+0000` in any text the client sends reaches PostgreSQL, which rejects it, and the API answers `500 UNEXPECTED` instead of `422 VALIDATION_FAILED`. |
| Severity | MINOR |
| Related stories / criteria | No acceptance criterion states it. It affects the inputs of US-001, 002, 003, 008, 010, 013, 016, 020 and the contract rules CTR-001 / CR-005. |
| Affected components | COMP-003 API Boundary (`src/http/middleware.js`, `src/application.js`) and, through it, every module that stores or searches text. |

### Root Cause Analysis

- **Observed:** 14 inputs returned `500 {"code":"UNEXPECTED"}` for a value such as `"a\u0000b"`: search text; owner sign-up name, pet name, pet breed; provider sign-up name, e-mail, address; sign-in e-mail; service name; product name; profile public name, contact e-mail, address; home-visit address.
- **Expected:** `422 {"code":"VALIDATION_FAILED","fields":[{"field":"...","reason":"INVALID_FORMAT"}]}` (CTR-001; `INVALID_FORMAT` is already in `ReasonCode`).
- **Evidence:**
  - `TEST-SEC-035` failed on every run before the change, listing all 14 inputs (`artifacts/07_qa/evidence/p07_1_qa_suite_run.tap`, 140 tests, 139 pass, 1 fail).
  - A bare `pg` client with no application code, run during P07.2, returns error `22021 invalid byte sequence for encoding "UTF8": 0x00` for `SELECT $1::text` with `'a\u0000b'`.
- **Five whys:** the response is 500 because the error handler received an unrecognized error; the error came from the database driver; the driver failed because PostgreSQL text cannot contain `U+0000`; the value reached the query because no validator rejects it (they check type, length and format, and `[^\s@]` e-mail patterns accept it); there was no boundary-level rule for characters the storage cannot represent, and each validator was written for business rules only.
- **Confirmed root cause:** a missing input rule for a character that PostgreSQL cannot store, combined with the final error handler classifying the resulting driver error as `UNEXPECTED`. The error handler itself is correct (it must not leak driver errors).

### Correction

Smallest change that closes the whole class of inputs at once: one boundary middleware, instead of editing eight validators.

| File | Change |
|---|---|
| `src/http/middleware.js` | New `rejectNulCharacters(req, res, next)`: walks the parsed JSON body (nested objects and arrays) and the query string, and throws `Outcome('VALIDATION_FAILED', { fields })` naming each field as `INVALID_FORMAT`. The top-level `password` field is skipped. |
| `src/application.js` | Imports it and registers it right after `express.json(...)` and before the session context. |

2 production files, +27 / -1 lines (`git diff --stat`). No dependency, configuration, schema, API contract or business-rule change.

Design and contract considerations:

- **Contract:** the response uses the existing `VALIDATION_FAILED` outcome, status 422 and the existing reason `INVALID_FORMAT`. `API_SPEC_V1.yaml` needs no change.
- **Passwords are deliberately excluded.** A password is only hashed with Argon2id and never stored as text, so it never caused the error. Rejecting NUL there would have changed existing behavior without need. This keeps the fix within the defect.
- **Precedence:** a request with NUL now gets 422 before the authentication check, like a request with malformed JSON already did (the body parser also runs before the session guard). An unauthenticated request with NUL therefore answers 422, not 401. This is a side effect of the boundary placement, not a security issue (no data is read), and is recorded here for the team.
- **Not affected, verified:** path identifiers with `%00` (already 404 via UUID validation, `TEST-SEC-032`) and lone UTF-16 surrogates in JSON text (accepted with 201, no error; probed manually during this step, not covered by an automated test).

### Regression and Verification

**Regression tests**

| Test | Level | What it verifies |
|---|---|---|
| `TEST-SEC-035` (existing, written in P07.1) | integration/security | All 14 inputs answer 422 `VALIDATION_FAILED`, never 5xx. |
| `TEST-SEC-037` (new) | integration/security | A NUL inside a password is still accepted at sign-up and sign-in works, so password handling is unchanged. |
| `TEST-UT-060` (new) | unit | Clean input and empty/no body pass; NUL in nested body fields, arrays and repeated query values becomes `VALIDATION_FAILED` with the exact field paths. |
| `TEST-UT-061` (new) | unit | Only the top-level `password` field is exempt. |

**Original failure reproduced before the correction:** yes. `TEST-SEC-035` failed against the unmodified code in every run, and the saved log `p07_1_qa_suite_run.tap` shows 140 tests, 139 pass, 1 fail, with 14 `-> 500` entries. The regression test was written before the fix, so it is shown to detect the defect.

**Commands executed after the correction and actual results** (logs in `artifacts/07_qa/evidence/`):

| Command | Result |
|---|---|
| `node --env-file=.env --test --test-reporter=tap "artifacts/07_qa/test_suites/**/*.test.js"` | **143 tests, 143 pass, 0 fail, 0 skipped** (`p07_3_after_fix_qa_suite_run.tap`) |
| `npm test` (existing 175 tests) | **175 pass, 0 fail, 0 skipped** (`p07_3_after_fix_existing_suite_run.txt`) |
| same coverage command as P07.2, both suites together | **318 tests, 318 pass, 0 fail**; `src/**` coverage 98.76 % line, 95.05 % branch, 96.49 % function (`p07_3_after_fix_coverage_combined.txt`); `middleware.js` 100 % line, 98 % branch |
| `npm run build` | exit 0 (`p07_3_after_fix_client_build.txt`) |

The relevant existing tests (HTTP boundary, sign-up, sign-in, search, booking, catalog, profile, hours, sessions, database) all pass unchanged: no existing test was edited.

**Remaining limitations and unverified behavior**

- The fix was verified against local PostgreSQL 18 only; hosted Vercel/Neon (COND-001) is still unverified.
- The 14 inputs are the ones probed. Any text field added later is protected by the boundary rule, but no test enumerates future fields.
- Lone-surrogate handling has no automated test.
- The change is in the working tree and has **not been committed**; nothing was pushed.
- Browser/UI behavior of the new 422 (how the client shows an `INVALID_FORMAT` error for a field that contains an invisible character) was not checked.

### Final Status

| Defect | Status |
|---|---|
| DEF-001 | `FIXED_AND_VERIFIED` |

## Handoff

P07.3 does not grant permission to advance to P08. The quality gate verdict is set by P07.2; its round 2 update, based on the re-execution above, is in `TEST_ANALYSIS_REPORT.md`.
