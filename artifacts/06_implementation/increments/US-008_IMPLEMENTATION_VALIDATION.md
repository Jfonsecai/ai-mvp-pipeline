# US-008 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Report version | 1.0 (first validation of US-008; no earlier report exists) |
| Validation date | 2026-10-11 |
| HU | US-008 — Maintain my public profile (EPIC-003, P0 / SPRINT-001, 2 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` (backlog status PLANNED) |
| Implementation log | `artifacts/06_implementation/increments/US-008_IMPLEMENTATION_LOG.md` |
| Requirement / criteria | FR-009; AC-023, AC-024, AC-106 |
| Business rules / edge cases | BR-025, BR-026, BR-038; EDGE-017, EDGE-027 |
| Dependencies | DEP-001 (US-003 session and provider guard: PASS_WITH_WARNINGS) |
| Foundation validation | PASS_WITH_WARNINGS |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **PASS_WITH_WARNINGS** |

**Independence limitation (stated, not removed).** The implementation and this validation were produced by the
same AI assistant in the same session; no separate reviewer or human has reviewed either. To reduce the effect, this
validation re-read the code from disk, compared the log to the working tree, re-ran every check from the command line,
ran a 54-probe adversarial script the implementation phase did not have, and ran a mutation check on the tests. It does not
replace human review (finding F-04).

## 2. Executive Summary

- **Validated:** the provider profile read/save slice: `GET`/`PUT /api/provider/profile` (IF-004), the SCR-UX-009
  screen, and the tests that cover them, against the authoritative US-008 definition.
- **Result:** all three acceptance criteria are supported by executed evidence (automated, PostgreSQL-backed, adversarial
  and browser-observed). The clinic-address rule is enforced on the server, on the client and by the database constraint. The
  provider type, role and ownership boundaries hold. The full regression suite (99 tests) and the build pass.
- **Most important findings:** none above LOW. F-01 (LOW): the owner-facing public profile is US-018, so AC-023 was assessed
  on the provider's own profile screen and persisted data. F-02 (LOW): layout, responsive and accessibility behavior were
  not visually verified. F-03 (INFO): for a clinic, the API reports a missing address only after other field errors are
  fixed. F-04 (INFO): same-assistant independence limitation.
- **Decision:** **PASS_WITH_WARNINGS.** Conditions to carry forward are in section 11.

## 3. Validation Scope and Limitations

**This is HU-level validation of US-008, not product-wide testing.** P07, CI/CD and release readiness are not covered.

**Examined:** `src/modules/provider/profile.js`, `src/modules/index.js`, `src/modules/README.md`,
`client/src/pages/ProviderProfile.jsx`, `client/src/App.jsx`, `client/src/design-system/global.css`, the deletion of
`client/src/pages/ProviderWelcome.jsx`, `tests/provider-profile.test.js`, `tests/provider-profile.database.test.js`,
`migrations/001_initial_schema.sql` (`provider_profile`), `API_SPEC_V1.yaml` (`/api/provider/profile`, CTR-004), UX SCR-UX-009.

**Criteria included:** AC-023, AC-024, AC-106 (all three in the backlog).

**Could not be verified:** hosted Vercel/Neon behavior (COND-001 still open); visual layout, mobile width and screen-reader
behavior (the browser pane could not render screenshots; behavior was checked through the accessibility tree, page text
and DOM); the owner-facing display of the profile (US-018, not implemented).

## 4. Acceptance Criteria Validation Matrix

| Criterion ID | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-023 | A signed-in provider saves a name, phone, email and address; their public profile shows that information. | `profile.js` `PUT`/`GET`; `ProviderProfile.jsx` (reloads the saved values after save) | Unit test, PostgreSQL test 1, probe set 6, browser flow, code inspection | **PASS** | `PUT` returns the saved values and a later `GET` returns the same; the database row holds them (`updated_at` = clock time). In the browser the toast "Cambios guardados." appeared and the form showed the saved values. The UX spec defines the display for this criterion as SCR-UX-009 ("the profile shows the saved data (AC-023)"). The owner-facing view is US-018's AC-044/AC-045 and was not available to test. | F-01 |
| AC-024 | A signed-in independent veterinarian saves without an address; the profile is saved and shown without an address. | `profile.js` (missing, null, blank → NULL); `ProviderProfile.jsx` "Dirección (opcional)" | Unit test, PostgreSQL test 2, probes (tab/NBSP blank → null), browser flow | **PASS** | Missing, `null`, `''`, whitespace-only and tab/NBSP-only addresses all save with `200` and `address: null`; stored value is `NULL`; the form labels the field optional and shows it empty. A non-blank address also saves, and clearing it later saves as `NULL`. | — |
| AC-106 | A clinic that saves without an address is not saved and the address is indicated as required; it can change but not remove it. | `requireAddressForClinic`; client `localErrors`; DB `clinic_address_required` | Unit tests, PostgreSQL tests 1 and 4, probes (null / blank / missing / tab-NBSP, concurrent mixed saves), browser flow, mutation M1 | **PASS** | All removal forms return `422 VALIDATION_FAILED` with `{field: "address", reason: "REQUIRED"}`; the stored address is unchanged afterwards (checked in the database); replacing the address succeeds. Under 6 concurrent mixed saves the clinic address was never NULL. In the UI the field shows "Este campo es obligatorio." and nothing is sent. Disabling the rule (M1) makes three tests fail, so the tests do check it. | F-03 |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Notes |
|---|---|---|---|---|
| BR-025 | A provider maintains only its own profile. | No ID in path/body; every query uses `req.session.accountId`; `provider_id` in the body is refused; owner `GET`/`PUT` → `404`; anonymous → `401`; owner `PUT` created no row; concurrent saves of two providers stayed separate. | PASS | |
| BR-026 | Clinic address mandatory and not removable; independent optional. | See AC-024 / AC-106. Type comes from the stored row (immutable); `providerType` in the body → `NOT_ALLOWED`. | PASS | |
| BR-038 | Contact information is a phone and an email. | Phone: digits, spaces, `+`, at least one digit, ≤ 30 (boundary probes incl. `+`, newline inside, Arabic-Indic digits, 30/31 digits). Email: basic format, ≤ 254. Both required. | PASS | Matches API_SPEC `Phone`/`Email` and the DB check. |
| EDGE-017 | A provider without an address offering a clinic service cannot occur. | The server rule plus the DB constraint guarantee a clinic always has an address; the offering rule belongs to US-010. | PASS | Nothing further testable in this HU. |
| EDGE-027 | A clinic removing its address: not saved, address required. | See AC-106. | PASS | |
| DEP-001 | A signed-in user of the right account type. | `guard({ role: 'provider' })`; no-session, owner-session and provider-session cases executed; US-003 report is PASS_WITH_WARNINGS. | PASS | |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Full regression suite | `npm test` (`TEST_DATABASE_URL` set from `.env`) | PASSED | 99 tests, 99 pass, 0 fail, 0 skipped. Same count as the log (85 existing + 14 new). Database tests executed, not skipped. |
| Focused US-008 tests | `node --env-file-if-exists=.env --test tests/provider-profile.test.js tests/provider-profile.database.test.js` | PASSED | 14 of 14 (10 + 4). |
| Production build | `npm run build` | PASSED | 33 modules transformed; no errors. |
| Patch hygiene | `git diff --check` | PASSED | No whitespace errors; only line-ending notices. |
| Adversarial probe script | Throwaway script (kept outside the repository) running the real Express stack against a temporary PostgreSQL schema | PASSED | 54 probes, 0 failed: malformed/oversized/non-JSON bodies, missing and foreign Origin, writable-field attempts, null and wrong types, phone and email boundaries, code-point length limits (emoji, accents), whitespace variants, SQL/markup strings, response shape, `no-store`, anonymous/owner access, concurrent saves. One probe ("no provider changed type") is vacuous and is not counted as evidence. Schema dropped afterwards (0 leftovers). |
| Mutation check of the tests | Temporarily broke `profile.js` four ways and re-ran the 14 tests; restored and confirmed identical file hash | PASSED | M1 clinic rule off: 3 tests fail. M3 phone pattern off: 3 fail. M4 update not scoped to the provider: 3 fail. M2 (non-blank values returned untrimmed): 1 fails (a partial mutation; the blank path was not changed). All killed. |
| Browser flow | Local API + Vite dev servers; clinic sign-up in the UI; invalid save; valid save; direct `PUT` without address; independent sign-up and save | PASSED (manual) | Performed during implementation (log §8) and relied on here only for what the probes cannot show: pre-fill from sign-up, onboarding alert shown then removed after the first save, client messages, labels per type. Test accounts were removed afterwards (0 left in the dev database). |
| Clean reinstall (`npm ci`) | — | NOT_RUN | No manifest or lockfile changed (`git status` shows neither), so not repeated. |
| Visual / responsive / accessibility pass | — | NOT_RUN | Pane could not render screenshots. |
| Hosted Vercel / Neon runtime | — | NOT_RUN | COND-001. |
| Static analysis / lint | — | NOT_RUN | None configured in the repository. |

A passing suite is not treated as proof of coverage: the tests were read for assertions (stored values, response bodies,
database state after rejection, no-write checks) and the mutation check above shows they fail when the main rules break.

## 7. Architecture, UX, and Integration Conformance

- **Architecture:** conforms. The profile lives in COMP-006 and writes only `provider_profile`; `account` (COMP-004) is not
  touched (CR-002, CR-016); rules are server-side with the client as a usability layer (CR-001, CR-003); errors are CTR-001
  outcomes only (CR-005); the response keys equal the `OwnProviderProfile` properties and the request follows
  `ProviderProfileUpdate` (a test compares them with `API_SPEC_V1.yaml`). No migration, dependency or contract change.
  The decision not to take the provider lock (IF-024) in the profile update is reasoned in log §10 and does not conflict
  with ARCHITECTURE: the lock exists for booking and the hours save, and the update is a single-row write.
- **UX (SCR-UX-009):** conforms on structure and behavior: title and subtitle, read-only provider-type row, four fields with
  the specified labels and helpers, one address field per type, "Guardar cambios", onboarding alert until the first save,
  MSG-REQ / MSG-PHONE / MSG-EMAIL / MSG-SAVED / MSG-FORM / MSG-NET texts. Visual conformance not assessed (F-02).
- **Integration:** `/provider/profile` remains the post-sign-up and post-sign-in destination; `SignIn.jsx` and
  `ProviderSignUp.jsx` are unchanged; no dangling reference to the deleted `ProviderWelcome.jsx` (grep over `client`,
  `src`, `tests`, `scripts`); US-002, US-003, US-009 and US-034 tests still pass inside the 99. The change makes the
  provider's post-sign-in screen a real profile page, which narrows part of US-003's finding F-002 for providers (that
  report was not edited).
- **Scope:** limited to US-008 plus the justified removal of the interim page. No unrelated story was implemented.

## 8. Security, Data Integrity, and Regression Findings

No defect found. Observed and verified: input validated and trimmed on the server; unknown fields refused; parameterized SQL
(a SQL-injection string was stored literally and the table survived); Origin and JSON checks apply to `PUT`; responses carry
`Cache-Control: no-store` and expose no account ID, password hash or sign-in email beyond the stored contact email; the type
is read from the database; database constraints (`clinic_address_required`, phone check) are a second layer and agree with the
application rules; code-point lengths in JavaScript and PostgreSQL agree at the 120/300 boundaries. Not verifiable here: behavior
on the hosted platform.

## 9. Findings Register

**Mandatory corrections:** none.

| ID | Severity | Title | Affected | Evidence | Why it matters | Action | Closure |
|---|---|---|---|---|---|---|---|
| F-01 | LOW | Owner-facing public profile not available to verify AC-023 end to end | AC-023 | US-018 (AC-044/AC-045, SCR-UX-005, IF-008) is PLANNED and absent; the UX spec defines the AC-023 display as SCR-UX-009. | The owner's view of the saved data is untested until US-018 exists. | Optional follow-up: when US-018 is implemented, confirm it shows the values saved here. | US-018 validation shows name, phone, email, address (or none) as saved. |
| F-02 | LOW | Layout, responsiveness and accessibility not visually verified | SCR-UX-009 | Browser pane screenshot failed; only DOM/accessibility-tree evidence. | Visual defects or poor small-screen layout would go unnoticed. | Optional follow-up for P07: manual pass at mobile and desktop widths with keyboard and screen reader. | Recorded manual pass or screenshots. |
| F-03 | INFO | Address-required error appears after other field errors are fixed (API only) | AC-106 | `PUT` validates shape first and applies the provider-type rule after; a clinic request with a bad phone and no address returns only the phone error. The UI validates everything at once, so users do not see this. | A direct API client needs two round trips. | Optional recommendation: none required by the spec. | n/a |
| F-04 | INFO | Same assistant implemented and validated; no human review | All | Section 1. | Shared blind spots are possible. | Team review of the diff before acceptance. | Reviewer sign-off. |
| F-05 | INFO | `ProviderSignUp.jsx` still passes an unused router state | US-002 | `navigate('/provider/profile', { state: … })`; the new page ignores it. | Harmless dead data. | Optional tidy-up in a US-002 change; deliberately left untouched here. | n/a |

## 10. Implementation Log Consistency

The log matches the repository: the created, modified and deleted files agree with `git status`; the test counts (14 new, 99
total, 0 skipped) reproduced exactly; the claims about untouched files (manifests, lockfile, migrations, `.env`, API contract,
prior validation reports) hold; the deleted file has no remaining references; limitations and the HU-identification note
(request named US-002 in step 1) are stated. The execution date is the local date; the logs' own timestamps are UTC, so the
UTC clock shows 2026-10-12. The status READY_WITH_LIMITATIONS is consistent with the evidence. No correction to the log was needed.

## 11. Readiness Decision

US-008 is ready to be treated as **validated with warnings**: every required acceptance criterion passes on direct evidence,
the business rules and dependency hold, no material defect or unapproved deviation exists, and the remaining items are
non-blocking. Follow-up conditions: (1) when US-018 is implemented, confirm the owner-facing profile reflects the saved
values (F-01); (2) a manual visual/accessibility pass before release (F-02, P07); (3) the architecture's COND-001 must still
be satisfied before any hosted use; (4) a human review of the change (F-04). This does not imply the product is ready for release.

## 12. Final Status

**PASS_WITH_WARNINGS**

## 13. Corrective Actions and Retest Guidance

No failed or blocking findings, so no corrective action is required. Retest guidance for the optional items: F-01, view a
provider profile as an owner after US-018 and compare with the values saved in SCR-UX-009 (including an independent
veterinarian with no address); F-02, open `/provider/profile` at about 375 px and 1280 px wide, tab through every control and
read the error states with a screen reader.
