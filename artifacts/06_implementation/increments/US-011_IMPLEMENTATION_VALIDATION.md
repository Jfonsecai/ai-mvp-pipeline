# US-011 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Report version | 1.0 (first validation of US-011; no earlier report exists) |
| Validation date | 2026-11-09 |
| HU | US-011 — Update a service (EPIC-004, P2 / SPRINT-002, 2 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` (backlog status PLANNED, `iteration_2_status: COMMITTED`) |
| Implementation log | `artifacts/06_implementation/increments/US-011_IMPLEMENTATION_LOG.md` |
| Requirements / criteria | FR-012, NFR-002; AC-030, AC-031 |
| Business rules / edge cases | BR-006, BR-007; no edge cases defined |
| Dependencies | DEP-001, DEP-003 |
| Foundation validation | PASS_WITH_WARNINGS |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **PASS_WITH_WARNINGS** |

**Independence limitation (stated, not removed).** The implementation and this validation were produced by the same AI assistant in the same session; no separate reviewer or human has
reviewed either. To reduce the effect, this validation re-read the code from disk, compared the log with the working tree, re-ran every check from the command line, ran a model-based probe
(700 random operations compared with an in-memory model written separately from the implementation, then every surface compared with that model), a 17-check targeted probe with a concurrent
storm, mutation-tested the new tests with 15 deliberate breaks (which exposed one gap, fixed here), and repeated the browser verification with different data, a different sign-in path
(the real sign-in form), a forced save failure, a retired service and a phone-width layout. It does not replace human review (F-07).

## 2. Executive Summary

- **Validated:** `PUT /api/provider/services/{offeringId}` (IF-036), the "Editar" action on the catalog cards, the edit mode of the publish form, the guard added to `bookSlot`, and the tests.
- **Result:** both acceptance criteria are supported by executed evidence. An edit shows up in the provider's catalog, in the public profile, in search (old name gone, species filter following the new
  species) and in booking, in every one of 700 random operations. Another provider, a product, a retired or unknown offering and malformed ids all get the same `404` and change nothing. Validation
  equals publishing, the independent veterinarian stays at home, and booked appointments are byte-identical after 60 species/modality flips. Under a storm of 40 edits, 40 bookings and 5 hours saves
  there was no 5xx and no half-applied edit. The full suite (227 tests) and the build pass.
- **Most important findings:** none above LOW. F-01 (LOW): after an edit, existing appointments keep their time/modality/place but show the service's *new* name, so a dog's appointment can sit under a
  service that is now for cats (an interpretation of P04-ASM-036 awaiting a team decision). F-02 (LOW): the new booking guard answers "ese horario ya no está disponible" for an edit made mid-booking.
  F-03 (INFO): the project's test database was down and a disposable PostgreSQL was used. F-04 (LOW): a pre-existing 36 px horizontal overflow of the provider header at 375 px, not caused by this story.
- **Decision:** **PASS_WITH_WARNINGS.**

## 3. Validation Scope and Limitations

**This is HU-level validation of US-011, not product-wide testing.** P07, CI/CD and release readiness are not covered.

**Examined:** the new route and imports in `src/modules/catalog/offerings.js`, the guard in `src/modules/scheduling/booking.js`, `client/src/pages/PublishService.jsx`,
`client/src/pages/ProviderCatalog.jsx`, `client/src/App.jsx`, `docs/API.md`, `docs/USER_GUIDE.md`, `tests/catalog-services-update.test.js`, `tests/catalog-services-update.database.test.js`,
`migrations/002_iteration2_removal.sql`, `API_SPEC_V2.yaml`, `ARCHITECTURE_V4.md` §6.4/§7.1, `UX_SPEC_V3.md` (SCR-UX-011/012, COMP-UX-007), `REQUIREMENTS_V4.md` (US-011), `PRIORITIZATION_V3.md`.

**Criteria included:** AC-030 and AC-031 (both in the backlog).

**Could not be verified:** real keyboard navigation in the edit form (the browser pane stopped drawing and refused key presses; the radios are the unchanged ones of US-010); visual appearance
(screenshots unavailable; layout was checked through the DOM and computed sizes); screen-reader speech; PostgreSQL 16, Neon and Vercel behavior (migration 002 is still pending on Neon per the index).

**Environment.** The Docker database at port 5434 named in `.env` was not running (Docker Desktop stopped): the first `npm test` gave 65 `ECONNREFUSED` failures. The two local PostgreSQL services
need credentials this session does not have, so a disposable PostgreSQL 18 (trust authentication on 127.0.0.1:5440, ICU `es-CO` collation) was created in the scratchpad and used through
`TEST_DATABASE_URL`; `.env` was not changed. A first attempt with the `C` locale made two accent-insensitive search tests fail, which is a property of that instance (its `lower()` does not fold `Ú`),
not of the code.

## 4. Acceptance Criteria Validation Matrix

| Criterion ID | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-030 | A signed-in provider with a published service who changes its details and saves: the updated details appear in their catalog, on their profile and in search results. | `PUT /provider/services/:offeringId`; `PublishService.jsx` edit mode; `ProviderCatalog.jsx` | PostgreSQL tests, model probe (700 operations, all surfaces), targeted probe, browser, mutations R1–R12 | **PASS** | After each applied edit (108 in the model probe) the database row, the provider's catalog, the owner's view of the public profile, search by the current name (fields equal the model; the old name never matches; removed services never appear) and the booking context (name, price, species, modality; pet eligibility follows the species) all equal the model. Name is trimmed; price, species and modality replace the old values; id, owner, kind, availability, creation time and catalog order are untouched; repeating the same `PUT` gives the same body. Browser: the form opens pre-filled (also after a full reload on its URL), saving returns to the catalog with "Cambios guardados." and the new card, and the owner then sees the new values in search, the profile and booking. | F-01 |
| AC-031 | A signed-in provider who tries to change a service of another provider: the change is not allowed. | `UPDATE … WHERE id AND provider_id AND kind='service' AND removed_at IS NULL`; session-only identity | Model probe, targeted probe, PostgreSQL tests, browser, mutations R1, R2, R3 | **PASS** | Of 351 operations that were not the actor's own active service (another provider's service, a product, a retired service, unknown, malformed or account ids) all returned `404 NOT_FOUND`, and the table was byte-identical after each; nine different kinds of target return the identical body, content type and `no-store`. Owner → `404`, anonymous → `401`, foreign Origin → `403`. The request cannot carry `providerId`, `id`, `kind` or `available` (`NOT_ALLOWED`). Browser: a second clinic's direct `PUT` got `404 {"code":"NOT_FOUND"}` and its visit to the edit URL ended on "No puedes ver esta página"; the same for a retired service. | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Notes |
|---|---|---|---|---|
| BR-006 | Exactly one species per service. | The publish validator is reused; 241 invalid bodies in the model probe (missing/blank/oversized name, price 0, fractional or string price, `bird`, missing species, arrays …) all gave `422` and no change. | PASS | |
| BR-007 | A clinic: clinic, home or both; an independent veterinarian: home only. | Clinics moved among the three modalities; an independent's service stays `home` with the field omitted or `home`, and `clinic` / `both` are `NOT_ALLOWED`; the edit form hides the modality for independents. A mutation that validated every provider as a clinic was killed (R10). | PASS | |
| NFR-002 | A provider changes only its own data. | See AC-031. | PASS | |
| P04-ASM-036 | Editing does not change appointments already booked. | The appointment table was byte-identical after 60 species/modality flips and after the storm; no cancellation was caused. See F-01 for what the lists display. | PASS (with F-01) | The assumption itself is flagged by the UX specification as open to objection. |
| Edge cases | None defined. | Backlog `edge_case_ids` is empty. | n/a | |
| DEP-001 / DEP-003 | Provider session; a published service. | Provider-only guard; only active services of the provider are editable. | PASS locally | Hosted behavior not verified. |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Full regression suite | `npm test` with `TEST_DATABASE_URL` set (disposable PostgreSQL 18, ICU) | PASSED | 226 tests, 226 pass, 0 fail, 0 skipped at the start of this validation (matches the log: 209 + 17); 227 of 227 after the test added here. |
| Focused tests | `node --env-file-if-exists=.env --test tests/catalog-services-update.test.js tests/catalog-services-update.database.test.js` plus booking and publishing suites | PASSED | 31 of 31 together (8 + 10 + the 13 booking/publishing files run for the guard), before and after the added test. |
| Production build | `npm run build` | PASSED | 45 modules transformed. |
| Patch hygiene | `git diff --check` | PASSED | No whitespace errors. |
| Model-based probe | Throwaway script outside the repository; real module registry; temporary schema; 21 offerings; 700 random operations | PASSED | 8 of 8 checks: for every operation the HTTP status equals the model's (108 × `200`, 351 × `404`, 241 × `422`); no 5xx; every refused operation left the offering table byte-identical; afterwards the database, the provider catalog, the public profile, search and the booking context all equal the model. Schema dropped. |
| Targeted probe | Throwaway script; 6 booked appointments; hostile bodies; concurrency | PASSED | 17 of 17: appointments untouched by 60 flipping edits and visible unchanged to both parties; nine "not yours" targets give one identical answer; 14 hostile bodies (invalid JSON, `__proto__`, objects/arrays as fields, duplicate keys, `1e400`, empty) no 5xx; >100 kB → 4xx; idempotent repeats; request log contains no body values; a storm of 40 edits + 40 bookings + 5 hours saves ends with no 5xx, only `201` / `409 SLOT_UNAVAILABLE` / `422 PET_NOT_ELIGIBLE` for bookings, all edits `200`, and a final row equal to exactly one submitted version. Informational: a NUL character in a name gives `422` for both `PUT` and `POST`; a lone surrogate is accepted. |
| Mutation check of the tests | 15 single-line breaks of the route and of the `bookSlot` guard; the six related test files re-run; files restored and hashes compared | PASSED (after one fix) | Killed at once (14): ownership clause removed (R1), kind removed (R2), retired rows editable (R3), lock removed (R4), validation skipped (R5), parameters swapped (R6), id check removed (R7), wrong role (R8), empty answer on missing row (R9), provider type forced (R10), non-editable column touched (R11), wrong status code (R12), species compare removed (G1), whole guard removed (G3). **Survived: G2** (the modality part of the guard): the race test only changed the species. A test for a modality-only edit was added; G1, G2 and G3 are now killed. |
| Browser flow (repeated independently) | Local servers on the disposable database; clinic signed in through the real sign-in form; one service with a booked appointment; a second service | PASSED (manual) | Deep link on the edit URL pre-fills; a forced network failure on save shows "No pudimos guardar los cambios…", keeps what was typed, leaves the button usable and changes nothing in the database; retry saves with "Cambios guardados." and the card shows the new values; the existing appointment stays scheduled, at the clinic, with its time and place, and both the owner's "Mis citas" and the provider's "Citas" still list it under the service's new name; a service retired in the database is absent from the catalog, its edit URL shows the not-found screen and a direct `PUT` returns `404`. |
| Real keyboard navigation of the edit form | — | NOT_RUN | The pane stopped drawing and refused key presses; native radios, unchanged since US-010. |
| Phone-width layout (375 px) | DOM measurements in the emulated viewport | PASSED for the new content, FAILED for a pre-existing header element | The edit form (293 px) and the "Editar" link (76 × 50 px) fit and meet the 44 px target, but every provider page overflows by 36 px because of the header's account menu (F-04), also on pages this story did not touch. |
| Visual appearance, screen-reader speech | — | NOT_RUN | Screenshots unavailable; speech not exercised. |
| Hosted Vercel / Neon runtime; PostgreSQL 16 | — | NOT_RUN | Migration 002 still pending on Neon; the tests ran on PostgreSQL 18. |
| Clean reinstall (`npm ci`) | — | NOT_RUN | No manifest or lockfile changed. |

A passing suite is not treated as proof of coverage: the new tests were read for their assertions (full-row snapshots, exact response bodies, outcomes after refusals) and the mutation check, which
found the one gap, shows they now fail when each part of the route and of the guard is broken.

## 7. Architecture, UX, and Integration Conformance

- **Architecture:** conforms to `ARCHITECTURE_V4` §6.4 and IF-036. The update reuses the publish validator, so publishing and editing cannot drift; it runs under the provider lock (IF-024) in one
  transaction; ownership, kind and active state live in the single `UPDATE`; uniform `NOT_FOUND` (CR-006); the update never writes `removed_at` (CR-029) and leaves the retired and the other tables alone.
  The response equals the API_SPEC_V2 `CatalogService`. The shared `bookSlot` guard is an addition inside the existing lock section; it only fires when an edit changed species or offered modality.
  New dependency of COMP-007 on the COMP-006 lock (`lockProvider`) is the one the architecture prescribes for catalog changes.
- **UX (SCR-UX-011/012, COMP-UX-007):** "Editar" appears on service cards; the edit mode has the title "Editar servicio", pre-filled fields, the same fields and validation as publishing, the primary
  "Guardar cambios", MSG-SAVED on return, and an independent veterinarian cannot choose in-clinic modality. "Eliminar" and product editing are correctly absent (US-012, US-014, US-015). Not verified: visual
  appearance and real key presses.
- **Integration:** publishing is unchanged; the public profile, search, assistant data sources and booking read the same table and show the edit at once; the retired-offering filter (CR-029) is respected;
  all 209 earlier tests pass.
- **Scope:** limited to US-011 plus the booking guard it makes necessary. No removal, product editing or appointment behavior was implemented.

## 8. Security, Data Integrity, and Regression Findings

No defect found in the increment. Observed: provider identity only from the session; the SQL is parameterized and scoped by owner, kind and active state; malformed ids never reach the database; every
refusal is one indistinguishable `404` (no enumeration of other providers' services or products); unknown fields are refused so no non-editable column can be written; one transaction under the provider
lock, with concurrent edits never mixing fields; the request logger records no body (CR-027 of the architecture holds); booked appointments are never touched. The one integrity risk the story creates
(a booking built on pre-edit facts) is closed by the guard and proven by two deterministic tests (species-only and modality-only). Not verifiable here: hosted behavior.

## 9. Findings Register

**Mandatory corrections:** none.

| ID | Severity | Title | Criterion | Evidence | Why it matters | Corrective action | Closure criteria |
|---|---|---|---|---|---|---|---|
| F-01 | LOW | Existing appointments display the service's new name, and can end up under a service of another species or modality | P04-ASM-036 (AC-030 context) | Browser: after editing a clinic dog service to a home cat service, the owner's and the provider's lists still show the appointment (10:00, "En la clínica", the clinic address) under the new name; the pet is a dog. The appointment stores a reference to the service, not a copy of its name. | Looks inconsistent to users; the UX specification itself marks this assumption as open to objection (TD-19). | Team decision: keep (current behavior) or freeze the booked service name/species/modality on the appointment (schema change and a migration). No code change is required if kept. | Decision recorded in the UX/architecture artifacts. |
| F-02 | LOW | The mid-booking edit guard reuses the "slot no longer available" message | BR-024, BR-007 | `bookSlot` answers `SLOT_UNAVAILABLE` when species or offered modality changed under the lock; the screen shows MSG-SLOT-GONE and reloads, which then shows the current service. | A rare, slightly imprecise message; no data risk. | Optional: a dedicated outcome or message ("el servicio cambió") if the team wants it. | Not required. |
| F-03 | INFO (test-database part RESOLVED 2026-11-09, see §15) | Validated on a disposable PostgreSQL 18, not on the project's Docker database, PostgreSQL 16 or Neon | all | Section 3; `docker` daemon down; 65 `ECONNREFUSED` failures at the start. | Provider-specific behavior is unverified. | Run the suite on the project's usual test database (and Neon staging) before release; start Docker Desktop to restore the usual setup. | Green run on the standard database. |
| F-04 | LOW | Pre-existing: the provider header overflows 36 px horizontally at 375 px on every provider page | none of this story | DOM measurement on `/provider/catalog`, `/profile`, `/appointments`, `/working-hours`: `scrollWidth 411` vs `clientWidth 375`; offenders `div.account-menu` and its button. The edit form itself (293 px) fits. | Phone users get a sideways scroll. | Fix the header layout in its own change (task proposed to the user). | No overflow on any provider page at 375 px. |
| F-05 | INFO | A gap in the original tests was found and fixed during validation | BR-007 | Mutation G2 survived: the race test only flipped the species. Added one test (modality-only edit while a booking waits for the lock); production code was not edited. | The modality half of the guard is now protected. | None. | Done: G1, G2, G3 killed. |
| F-06 | INFO | Real keyboard use, visual appearance and screen-reader behavior were not verified; the client has no automated tests | SCR-UX-012 | Browser pane stopped drawing; no client test runner. | UI regressions would go unnoticed. | Optional follow-up for P07: browser-level tests of publish → edit → search, and a manual keyboard/screen-reader pass. | Recorded evidence. |
| F-07 | INFO | Same assistant implemented and validated; no human review. Also: concurrent edits by the same provider are last-write-wins; two artifact inconsistencies noted in the log (prompt lists V2 inputs; `CR-027` names two different things) | all | Sections 1 and the log §1. | Shared blind spots are possible; the traceability ID collision can confuse readers. | Team review of the diff; artifact owners to rename one `CR-027`. | Reviewer sign-off. |

## 10. Implementation Log Consistency

The log matches the repository: files created and modified agree with `git status`; the baseline (209), the new tests (17) and the total (226) reproduced exactly; the claims that no migration, manifest,
lockfile, `.env`, contract or earlier report changed hold; the shared-code note about `bookSlot`, the P04-ASM-036 interpretation, the environment note and the input conflicts are all accurate. This validation
added one test (database file 9 → 10, total 226 → 227), so the log's counts describe the state before validation; the log was not edited to avoid rewriting history. One small point of precision:
the log says the owner "sees the new details in the booking screen"; true, and the dog's pet is disabled there. The status READY_WITH_LIMITATIONS is consistent with the evidence.

## 11. Readiness Decision

US-011 is ready to be considered **validated with warnings**: both acceptance criteria pass on direct evidence, the business rules and dependencies hold, no defect or unapproved deviation exists, and the
remaining items are non-blocking. Follow-up conditions: (1) a team decision on F-01 (what an old appointment shows after its service is edited); (2) the standard-database run and the Neon migration before
any hosted use (F-03); (3) a manual keyboard, screen-reader and visual pass, ideally with browser-level tests (F-06); (4) a human review of the change (F-07). F-04 is independent of this story. This does not
imply the product is ready for release.

## 12. Final Status

**PASS_WITH_WARNINGS**

## 13. Corrective Actions and Retest Guidance

No failed or blocking findings, so no corrective action is required for acceptance. Retest guidance: F-01, after the team decides, book an appointment, change the service's name, species and modality, and
check both appointment lists against the decision; F-03, run `npm test` with `TEST_DATABASE_URL` set to the project's standard test database and apply migration 002 to the staging database first;
F-06, open `/provider/services/<id>/edit` in a real browser at about 375 px and 1280 px, move between the species and modality options with the arrow keys, tab through every control and listen to the
form with a screen reader; F-04, check `document.documentElement.scrollWidth <= clientWidth` on each provider page at 375 px after the header is fixed.

## 14. Addendum after validation (2026-11-09): finding F-04 resolved in a separate change

The validation result above (**PASS_WITH_WARNINGS**) was reached before this change and is not altered by it. At the user's request, finding F-04 (the provider header overflowing 36 px at 375 px) was fixed
as its own change, not as part of US-011; the US-011 code (route, guard, edit screen) was not touched.

- **Change:** `client/src/design-system/global.css` only. Below `breakpoint-md` (767 px and under) the account navigation becomes the fixed bottom tab bar that COMP-UX-011 specifies
  (`size-bottom-nav-height`, labels in `font-size-sm`, active tab marked by a `border-width-strong` primary bar), the page gets the same bottom padding, the header keeps only the wordmark
  (`font-size-lg`) and the account menu with `spacing-4` side padding, and the sticky assistant composer sits above the bar. From 768 px the tabs stay in the header unchanged. Tokens only.
  Icons above the labels (also in the specification) were not added: the application has no icon set.
- **Verification (real browser, DOM measurements):** no horizontal overflow on 7 provider pages and 6 owner pages at 375 px, nor on the owner pages at 320 px; bar fixed at the bottom, 64 px high,
  each tab 94 × 63 px (a first version made the tabs only 20 px high; found and fixed before this note); the last content stays above the bar when scrolled to the end; the account menu opens inside the
  viewport; the assistant composer is 48 px above the bar's top; at 767 px the bar applies and at 768 px the tabs are back in the header (static, no bottom padding, wordmark 20 px).
- **Tests:** `tests/app-shell-css.test.js` (4 source-level tests of the contract; the client has no browser test runner) — four deliberate breaks of the CSS are all detected. Full suite: 231 of 231; build passes.
- **Not verified:** real taps on the bar and screen-reader reading of the tabs (the pane could not deliver key or pointer input reliably), and the visual look (no screenshots).

## 15. Addendum (2026-11-09): database tests repeated on the project's standard PostgreSQL 16 — finding F-03 resolved for the test database

Docker Desktop was started afterwards and the container `vetcare-postgres` (`postgres:16`, port 5434) became available. Everything that had run on the disposable instance was repeated against it,
using the `TEST_DATABASE_URL` already in `.env` (no override, no environment variable set by hand). The validation status (**PASS_WITH_WARNINGS**) is unchanged; no code or test needed to change.

| Check | Result | Evidence |
|---|---|---|
| Server | PostgreSQL **16.15** (Debian), database `vetcare_test`, UTF-8, collation `en_US.utf8` | `lower('VACÚNA')` returns `vacúna`, so the accent-insensitive search tests that failed on the `C`-locale instance pass here, which confirms that earlier failure belonged to that instance |
| Full suite `npm test` | **PASSED**: 231 tests, 231 pass, 0 fail, 0 skipped, no `ECONNREFUSED` (about 22 s) | includes the 18 US-011 tests, the 4 app-shell CSS tests and the 209 earlier ones |
| Model-based probe (700 random operations, all surfaces compared with the model) | **PASSED** 8 of 8 | same counts as before: edits, 404s and 422s match the model |
| Targeted probe (appointments untouched, uniform 404, hostile bodies, storm of edits + bookings + hours saves) | **PASSED** 17 of 17 | same informational results (NUL character → 422, lone surrogate accepted) |
| Leftover temporary schemas in `vetcare_test` | 0 | |

Not repeated: the browser checks (they exercise the same code against the same SQL; they ran on the disposable instance) and the mutation run (the tests did not change).

**State of the findings after this run.** F-03 is closed for the test database. What remains of it: the iteration-2 migration on a hosted database. In addition, `npm run migrate:status` shows that
the project's **development** database (`vetcare_dev`, port 5434) still has `002_iteration2_removal.sql` **pending**; the application code of iteration 2 reads `offering.removed_at`, so running the app
against that database before `npm run migrate` would fail on catalog, search and booking reads. It was not applied here because it changes the user's development data and was not requested.
