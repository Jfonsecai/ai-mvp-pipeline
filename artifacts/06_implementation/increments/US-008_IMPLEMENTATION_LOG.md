# US-008 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-11 (system date of the execution environment) |
| HU | US-008 — Maintain my public profile |
| Epic | EPIC-003 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Backlog status | PLANNED; scope MVP_SUPPORTING; P0 / SPRINT-001; 2 story points |
| Requirement | FR-009 |
| Acceptance criteria | AC-023, AC-024, AC-106 |
| Business rules | BR-025, BR-026, BR-038 |
| Edge cases | EDGE-017, EDGE-027 |
| Backlog dependencies | DEP-001 |
| Architecture / contracts | `artifacts/05_architecture/ARCHITECTURE_V2.md` (COMP-006, IF-004, DATA-004, CR-016); `ARCHITECTURE_VALIDATION_V2.md`; `API_SPEC_V1.yaml` (`/api/provider/profile`, CTR-004); `DATA_MODEL_V1.md` |
| UX | `artifacts/04_ux/UX_SPEC_V2.md` (SCR-UX-009, FLOW-UX-004, MSG-REQ/EMAIL/PHONE/FORM/NET/SAVED); `UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Related dependencies | US-002 (profile created at sign-up, PASS_WITH_WARNINGS) and US-003 (session/role guard, PASS_WITH_WARNINGS) |
| Implementation status | **READY_WITH_LIMITATIONS** |

**Request note (HU identification).** The execution request named `US-008` in its first line but wrote
"user story US-002" in step 1. US-002 was already implemented and validated (`US-002_IMPLEMENTATION_VALIDATION_V2.md`,
PASS_WITH_WARNINGS) and its backlog entry is a different story ("Sign up as a provider"), so the request was read as
US-008 throughout. The HU was taken from the authoritative backlog, not from any copied description.

## 2. Story Summary and Scope

**In scope.** A signed-in provider reads and saves its public profile: name, contact phone, contact email and
address. The address is mandatory for a clinic (it can be replaced but never removed) and optional for an
independent veterinarian. The provider type is shown read-only. Delivered as the vertical slice IF-004
(`GET`/`PUT /api/provider/profile`) plus the SCR-UX-009 "Mi perfil" screen, which replaces the interim
post-sign-up landing page.

**Excluded.** The owner-facing public profile view and its offerings (US-018, SCR-UX-005/IF-008); booking and
catalog consumption of the profile (IF-019 consumers); changing the provider type (BR-002, no requirement);
changing the sign-in email or account name (CR-016, COMP-004); working hours (US-009); any other story.

**Applicable criteria and rules.** AC-023, AC-024, AC-106; BR-025 (own profile only), BR-026 (address rule by type),
BR-038 (contact is phone and email); EDGE-017, EDGE-027.

## 3. Readiness Assessment

Implementation could proceed. The backlog entry is PLANNED with no open questions and a single dependency (DEP-001).
Foundation validation is PASS_WITH_WARNINGS and permits local incremental work. The session resolver and the provider
role guard (US-003) and the `provider_profile` table with its `clinic_address_required` constraint (US-002 / initial
migration) were available and reused. API_SPEC already defines the operation, so no contract or schema change was needed.

No blocker. Known limitations are listed in section 11. The most important one: the *owner-facing* public profile
(US-018) does not exist yet, so AC-023's phrase "their public profile shows that information" is satisfied through the
provider's own SCR-UX-009 view (which the UX specification defines as "the profile shows the saved data (AC-023)") and
through the persisted data that IF-019/IF-008 will read, not through an owner screen.

## 4. Technical Implementation Plan

Initial plan, all steps completed:

1. Add strict request validation for `ProviderProfileUpdate` (trim, required name/phone/email, phone characters, lengths, unknown fields).
2. Enforce the provider-type address rule on the server (clinic address required, never cleared; independent address optional, blank stored as NULL).
3. Add provider-only `GET`/`PUT /api/provider/profile` returning `OwnProviderProfile` (with `profileCompleted`), register the router.
4. Build SCR-UX-009 (read-only type row, one address field per type, onboarding alert until a phone is saved, MSG-* messages) and route it at `/provider/profile`, the existing post-sign-in/sign-up destination; add a "Perfil" navigation link.
5. Add API/validator tests with a stateful fake database, and a PostgreSQL integration suite driven through the real sign-up endpoint.
6. Run focused and full tests, the production build, a browser check against a local database, and cleanup of the test accounts created for it.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/provider/profile.js` | Kept `createProviderProfile` (IF-016, unchanged). Added `validateProviderProfileUpdate`, `requireAddressForClinic`, the `OwnProviderProfile` mapper (`profileCompleted` = phone saved) and `createProviderProfileRouter` with provider-only `GET` and `PUT /provider/profile`. `PUT` validates shape, reads the immutable provider type, applies the clinic-address rule, then updates the row and `updated_at`. | US-008; AC-023, AC-024, AC-106; BR-025, BR-026, BR-038; EDGE-017, EDGE-027; IF-004; DATA-004 |
| `src/modules/index.js` | Registered `createProviderProfileRouter`. | IF-004 |
| `client/src/pages/ProviderProfile.jsx` | New SCR-UX-009: loads the profile, pre-filled form, read-only provider-type row, clinic vs independent address field/label/helper, client usability validation (MSG-REQ, MSG-PHONE, MSG-EMAIL), server field-error mapping, onboarding alert while `profileCompleted` is false, MSG-SAVED / MSG-FORM / MSG-NET feedback, load-failure retry. | AC-023, AC-024, AC-106; FLOW-UX-004; SCR-UX-009; P04-PROP-006 |
| `client/src/pages/ProviderWelcome.jsx` | **Deleted.** It was the interim landing page created by US-002 for the same route; its own text deferred profile editing to this story, and nothing else imported it. | US-002 log §11 ("complete profile management under US-008"); US-003 finding F-002 |
| `client/src/App.jsx` | `/provider/profile` now renders `ProviderProfile`; added the "Perfil" link to the provider navigation. | SCR-UX-009; COMP-UX-011 |
| `client/src/design-system/global.css` | Added `.profile-page` and `.link-button` using tokens only. | CR-012 |
| `src/modules/README.md` | Documented IF-004 in the provider module row. | COMP-006 |
| `tests/provider-profile.test.js` | 10 API/validator tests (validator, address rule, CTR-004 shape, AC-023, AC-024, AC-106, invalid input, role/ownership/type, missing profile row). | AC-023, AC-024, AC-106; BR-025, BR-026, BR-038; EDGE-017, EDGE-027 |
| `tests/provider-profile.database.test.js` | 4 PostgreSQL integration tests through real sign-up. | same, plus persistence and constraints |

Shared-functionality note: the only change to code created by another story is deleting `ProviderWelcome.jsx` and
repointing the `/provider/profile` route. The route path, the sign-up navigation (`ProviderSignUp.jsx`, untouched) and the
sign-in destination (`SignIn.jsx`, untouched) keep working. `ProviderSignUp.jsx` still passes a router `state` object that
the new page ignores; this is harmless and was left to avoid touching US-002.

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Files / evidence |
|---|---|---|---|
| AC-023 | A signed-in provider saves a name, phone, email and address; their public profile shows that information. | IMPLEMENTED | `profile.js`, `ProviderProfile.jsx`. Unit test "AC-023" and DB test 1 save all four fields and read them back through `GET`; browser check showed "Cambios guardados." and the saved values. **Limitation:** the owner-facing view (US-018) does not exist; the "profile" shown is SCR-UX-009. |
| AC-024 | A signed-in independent veterinarian saves without an address; the profile is saved and shown without an address. | IMPLEMENTED | `profile.js` maps a missing, null or blank address to NULL for an independent provider. Unit test "AC-024", DB test 2 (stored `address IS NULL`), browser check (profile saved, `address: null`). |
| AC-106 | A clinic that saves without an address is not saved and the address is indicated as required; the clinic can change its address but not remove it. | IMPLEMENTED | `requireAddressForClinic` returns `VALIDATION_FAILED` / `address` / `REQUIRED` before any write; client also blocks and shows MSG-REQ. Unit test "AC-106 / EDGE-027", DB test 1 (three removal forms rejected, stored address unchanged, replacement accepted), browser check (UI error, then direct `PUT` with null / blank / missing address returned 422). The database `clinic_address_required` constraint is a second layer (DB test 4). |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-025 | Every read and write uses `req.session.accountId` and the `provider` role guard; there is no ID in the path or body. Owner and anonymous access return `NOT_FOUND` / `UNAUTHENTICATED`. A second provider's profile is untouched (DB test 3, unit test BR-025). |
| BR-026 | Clinic: address required and never cleared. Independent: optional, blank stored as NULL. Provider type read from the stored row, not from the request; `providerType` in the body is rejected as `NOT_ALLOWED`. |
| BR-038 | Contact information is phone and email only. Phone accepts digits, spaces and `+` with at least one digit and at most 30 characters (API_SPEC `Phone`, DB check); email has the basic format check (P04-ASM-005). Both are required on save (UX SCR-UX-009). |
| EDGE-017 | Cannot occur: a clinic always has an address (server rule + DB constraint) and an independent veterinarian cannot offer in-clinic services (US-010 scope). Nothing was needed here beyond the address guarantee. |
| EDGE-027 | A clinic removing its address is rejected, not saved, and the address is flagged required (see AC-106). |
| DEP-001 | Existing sign-in session and provider guard reused; protected routes verified for no session, owner session and provider session. |

Not invented: the contact email is stored as typed after trimming (not lower-cased); CR-016 only requires that it be
separate from the sign-in email, and no source asks for normalization of it.

## 8. Tests and Verification Results

Tests added: `tests/provider-profile.test.js` (10) and `tests/provider-profile.database.test.js` (4). Executed:

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Baseline before changes | `npm test` | PASSED | 85 tests, 85 passed, 0 skipped (database tests executed). |
| Focused US-008 tests | `node --env-file-if-exists=.env --test tests/provider-profile.test.js tests/provider-profile.database.test.js` | PASSED | 14 tests, 14 passed, 0 failed, 0 skipped; PostgreSQL integration ran against `TEST_DATABASE_URL` (temporary schema). |
| Full regression suite | `npm test` | PASSED | 99 tests, 99 passed, 0 failed, 0 skipped (85 existing + 14 new). |
| Production client build | `npm run build` | PASSED | Vite transformed 33 modules; assets emitted. |
| Whitespace / patch check | `git diff --check` | PASSED | No whitespace errors (only CRLF conversion notices from Git). |
| Browser check of SCR-UX-009 | Local API + Vite dev servers against the local dev database; in-app browser: clinic sign-up through the UI, empty address and bad phone, valid save with changed address, direct `PUT` without the address, independent sign-up and save without an address | PASSED (manual) | Observed: onboarding alert on first visit and gone after save; MSG-REQ on the address and MSG-PHONE on the phone; "Cambios guardados."; values persisted; server returned 422 `address`/`REQUIRED` for null, blank and missing address; independent form labelled "Dirección (opcional)" and saved with `address: null`. Visual layout was **not** assessed (the pane could not render screenshots); behavior was verified through the accessibility tree, page text and DOM. |
| Cleanup of the browser-check data | Deleted the two test accounts (sessions, profiles, accounts) that the check created in the local dev database | DONE | 2 accounts removed; servers stopped. |
| Hosted Vercel / Neon behavior | — | NOT_RUN | COND-001 remains open from the foundation. |
| Mobile viewport / keyboard / screen-reader pass | — | NOT_RUN | Left to P07. |

## 9. Repository Changes

Created: `client/src/pages/ProviderProfile.jsx`, `tests/provider-profile.test.js`, `tests/provider-profile.database.test.js`,
and this log. Modified: `src/modules/provider/profile.js`, `src/modules/index.js`, `src/modules/README.md`,
`client/src/App.jsx`, `client/src/design-system/global.css`, `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`.
Deleted: `client/src/pages/ProviderWelcome.jsx` (superseded, see section 5). No migration, dependency manifest, lockfile,
`.env`, API contract or prior validation-report changes. No commit was made; the work is in the working tree.

## 10. Architecture Conformance and Deviations

Conforms to COMP-006 (profile owned by `provider/`, writes only `provider_profile`), IF-004 and the CTR-004 shapes
(`OwnProviderProfile` keys equal the spec's properties; a test compares them), CR-016 (the account name and sign-in email
in COMP-004's `account` table are not touched; the public name lives in the profile), CR-001/CR-003 (rules enforced
server-side, client validation is usability only), CR-005 (errors only as CTR-001 outcomes) and CR-012 (token-only CSS).

Implementation details (not deviations): `PUT` is two statements (read type, update) and not a transaction because the provider type is immutable
(BR-002) and a single-row update is atomic; the provider-lock IF-024 is therefore not taken, as that lock exists to
serialize with booking and a profile edit changes nothing booking reads in a way that needs serialization. `PUT` also
returns `422` for a request that omits `contactPhone`, matching API_SPEC's `required` list. No formal architectural review is needed.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Type | Impact / next action |
|---|---|---|
| The saved public name is stored only in `provider_profile.public_name`; the `account.name` created at sign-up is not updated. | Technical assumption (CR-002, CR-016: COMP-006 writes only its own table) | Nothing reads `account.name` for providers today. If a later story displays it, confirm which one is authoritative. |
| Owner-facing public profile (SCR-UX-005 / IF-008) is not implemented, so AC-023's "public profile" is observed on the provider's own screen. | Dependency on a planned story (US-018), non-blocking | Re-check AC-023 end to end when US-018 lands. |
| Contact email is stored as typed (trimmed), not normalized. | Product detail with no source | None unless the team decides otherwise. |
| `profileCompleted` is derived from "a phone is stored", as API_SPEC and DATA_MODEL state. | Fact | None. |
| Layout, responsiveness and accessibility were not visually checked. | Unverified behavior | P07 / P06.4 manual pass. |
| Hosted runtime (Vercel/Neon, COND-001) not verified. | External limitation | Required before deployment. |
| `ProviderSignUp.jsx` still passes an unused router `state`. | Follow-up outside this HU | Optional tidy-up in a US-002 change. |

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** All three acceptance criteria have implementing code and passing automated and manual
evidence. The remaining limitations (owner-facing view awaits US-018, no visual/accessibility pass, hosted runtime) are
non-blocking and documented. This status is not a validation result; P06.4 decides acceptance.

## 13. Handoff to P06.4

Validate **US-008** from `artifacts/03_planning/product_backlog_priori_v2.json`. Inspect `src/modules/provider/profile.js`,
`client/src/pages/ProviderProfile.jsx`, `client/src/App.jsx` and the two new test files. Independently run
`npm test` (with `TEST_DATABASE_URL` set so the database tests execute), `npm run build` and `git diff --check`. Specifically verify:
(1) the clinic address cannot be removed by null, blank or missing values and the stored address is unchanged;
(2) an independent veterinarian's blank address is stored as NULL and the screen omits it;
(3) the provider-type, role and ownership boundaries, including that `providerType` in the body is refused;
(4) the response keys equal the API_SPEC `OwnProviderProfile` properties and requests follow `ProviderProfileUpdate`;
(5) that deleting `ProviderWelcome.jsx` left no dangling import and sign-in/sign-up still reach `/provider/profile`;
(6) how AC-023's "public profile" should be assessed while US-018 is not implemented.
