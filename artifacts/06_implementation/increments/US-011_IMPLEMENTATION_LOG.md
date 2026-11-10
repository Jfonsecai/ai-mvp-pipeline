# US-011 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-11-09 |
| HU | US-011 — Update a service |
| Epic | EPIC-004 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` (item `US-011`, `iteration_2_status: COMMITTED`) |
| Backlog status | PLANNED; scope MVP_CORE; P2 / SPRINT-002 / RELEASE-002; 2 story points |
| Requirements | FR-012, NFR-002 |
| Acceptance criteria | AC-030, AC-031 |
| Business rules | BR-006, BR-007 |
| Edge cases | none defined for this HU |
| Backlog dependencies | DEP-001, DEP-003 |
| Architecture / contracts | `ARCHITECTURE_V4.md` (§6.4 COMP-007, §7.1 IF-036, CR-029); `ARCHITECTURE_VALIDATION_V4.md`; `API_SPEC_V2.yaml` (`PUT /api/provider/services/{offeringId}`, `updateService`, `PublishServiceRequest`, `CatalogService`); `DATA_MODEL_V1.md`; migration `002_iteration2_removal.sql` |
| UX | `UX_SPEC_V3.md` (SCR-UX-011 modified, SCR-UX-012 edit mode, COMP-UX-007 catalog variant, P04-ASM-036); `UX_SPEC_V2.md` for the unchanged parts; `UX_SPEC_VALIDATION_V3.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Related stories | US-010 (publishing, the form and endpoint this story extends); US-016/US-018/US-019/US-020 (search, public profile, booking: the places where the edit must show up); US-012 and US-014/US-015 (remove a service; update/remove a product) are **not** part of this increment |
| Implementation status | **READY_WITH_LIMITATIONS** |

**Input conflicts recorded (not silently reconciled).**

1. `P06.3_US_implementation.md` §2 lists the iteration-1 artifacts (`PRIORITIZATION_V2`, `product_backlog_priori_v2.json`, `REQUIREMENTS_v3`, `ARCHITECTURE_V2`, `DATA_MODEL_V1`, `UX_SPEC_V2`…), but the request names `product_backlog_priori_v3.json` and the repository is at iteration 2 (V3 plan, `REQUIREMENTS_V4`, `ARCHITECTURE_V4`, `API_SPEC_V2`, `UX_SPEC_V3`). The repository state takes precedence (SYSTEM_PROMPT §3): the V4/V3 artifacts were used, the earlier ones for unchanged parts. US-011 is identical in the V2 and V3 backlog except for the added iteration-2 fields.
2. The ID `CR-027` is used twice: in the backlog trace of US-011 it refers to the change request that promoted the catalog stories ("promoted from CONDITIONAL (CR-027, P01-MVP-013, TD-30)"), while `ARCHITECTURE_V4` defines a constraint `CR-027` (voice transcripts are never logged). The two are unrelated; nothing in this story depends on either meaning. Flagged for the artifact owners.
3. `docs/API.md` and `docs/USER_GUIDE.md` (P09 outputs) do not list several iteration-2 endpoints; only the lines for this story were added.

## 2. Story Summary and Scope

**In scope.** A signed-in provider changes the details of one of its own published services (name, price, species and, for a clinic, the modality) and saves.
Delivered as the vertical slice: `PUT /api/provider/services/:offeringId` (IF-036), an "Editar" action on each service card of the catalog (SCR-UX-011), and the edit mode of
the publish form (SCR-UX-012: "Editar servicio", pre-filled, "Guardar cambios", "Cambios guardados." on return to the catalog). Because the public profile, search and
booking read the offering table live, the new details appear there without further code (AC-030).

**Excluded.** Updating products (US-014), removing services or products (US-012, US-015: `removed_at` is only *read* here so that removed offerings are not editable),
the product availability switch, any change to appointments (P04-ASM-036), and the home-visit or reschedule flows.

**Applicable criteria and rules.** AC-030, AC-031; BR-006 (exactly one species), BR-007 (a clinic chooses clinic, home or both; an independent veterinarian is home only);
NFR-002 (a provider changes only its own catalog).

## 3. Readiness Assessment

Implementation could proceed. The backlog entry is PLANNED, with no open questions and the dependencies DEP-001 (provider session and guard, US-003) and DEP-003 (published
services, US-010) satisfied by implemented code. `ARCHITECTURE_V4` §6.4 and §7.1 specify the operation ("reuse the publish validators … update own active offerings of that
kind"), API_SPEC_V2 defines request and responses, and migration 002 already added `offering.removed_at`; no contract or schema change was needed. Foundation validation is
PASS_WITH_WARNINGS. US-010's recorded status in the index is FAIL (public profile and search were missing at the time); both exist now and this story's criteria depend on them.
No blocker.

**Environment note.** The project's test database (port 5434, Docker) was not running (Docker Desktop stopped), which made 65 tests fail with `ECONNREFUSED` at the start. The two local
PostgreSQL services need passwords that are not available to this session, so a disposable PostgreSQL 18 instance was created in the scratchpad (trust authentication on 127.0.0.1:5440,
ICU `es-CO` collation so `lower()` handles accents) and the tests were run against it through `TEST_DATABASE_URL`; `.env` was not modified. A first attempt with the `C` locale made two
accent-insensitive search tests fail; this was the instance, not the code, and disappeared with the ICU database.

## 4. Technical Implementation Plan

Initial plan, all steps completed:

1. Reuse the publish validator (`validatePublishService`) unchanged for the update, so the rules cannot drift.
2. Add `PUT /provider/services/:offeringId` in COMP-007: owner-only role guard, canonical-UUID check, validation, then one transaction that takes the provider lock (IF-024) and runs a single
   `UPDATE … WHERE id AND provider_id AND kind = 'service' AND removed_at IS NULL`; no row means `NOT_FOUND` (AC-031, CR-006).
3. Close the race "edit while someone books": `bookSlot` already re-reads the service under the same lock; make it fail with `SLOT_UNAVAILABLE` when the species or the offered modality differ from
   the facts the request was validated against (BR-024, BR-007).
4. Client: "Editar" on service cards; edit mode of `PublishService` (pre-filled from the provider's catalog, `PUT`, "Cambios guardados.", not-found handling); route `/provider/services/:offeringId/edit`.
5. Tests: request handling without a database, and PostgreSQL tests through the real module registry covering visibility everywhere, ownership, validation, appointments untouched, races.
6. Run the focused and full suites, the build and a browser check; document.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/catalog/offerings.js` | New route `PUT /provider/services/:offeringId` (provider-only; UUID check; `validatePublishService`; transaction with `lockProvider`; ownership, kind and active state enforced in the `UPDATE`; response `CatalogService`). Imports `isUuid`, `withTransaction`, `lockProvider`. Publishing code unchanged. | US-011; AC-030, AC-031; BR-006, BR-007; NFR-002; IF-036, IF-024 |
| `src/modules/scheduling/booking.js` | In `bookSlot`, the existing "service still active" re-read now also compares species and offered modality with the facts used by the request; a difference gives `SLOT_UNAVAILABLE`. | BR-024, BR-007; CR-009 (shared change, justified in §10) |
| `client/src/pages/PublishService.jsx` | Edit mode when the route has `:offeringId`: loads the provider profile and the catalog in parallel, pre-fills the form, title "Editar servicio", button "Guardar cambios", `PUT`, notice "Cambios guardados." (MSG-SAVED), unknown or foreign service → the existing not-found screen, save-failure message. Publishing behavior unchanged. | SCR-UX-012 edit mode; AC-030, AC-031 |
| `client/src/pages/ProviderCatalog.jsx` | "Editar" action on each service card (accessible name "Editar: [name]"). Products get no action (US-014). | COMP-UX-007 catalog variant; SCR-UX-011 |
| `client/src/App.jsx` | Provider-only route `/provider/services/:offeringId/edit`. | SCR-UX-012 |
| `docs/API.md`, `docs/USER_GUIDE.md` | One endpoint row and one sentence for the edit action. | documentation |
| `tests/catalog-services-update.test.js` | 8 tests without a database. | AC-030, AC-031; BR-006, BR-007 |
| `tests/catalog-services-update.database.test.js` | 9 PostgreSQL tests through the real registry. | AC-030, AC-031; BR-006, BR-007; P04-ASM-036 |

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Files / evidence |
|---|---|---|---|
| AC-030 | A signed-in provider with a published service who changes its details and saves: the updated details appear in their catalog, on their profile and in search results. | IMPLEMENTED | `PUT` returns the saved `CatalogService`; PostgreSQL test: the new name, price, species and modality appear in `GET /provider/offerings`, in the owner's view of the public profile, in search (the old name no longer matches; the species filter follows the new species) and in the booking context. Browser: the edit form pre-fills, validates, saves with "Cambios guardados." and the card, the search result, the public profile and the booking summary all show the new values. |
| AC-031 | A signed-in provider who tries to change a service of another provider is not allowed to. | IMPLEMENTED | `NOT_FOUND` (the same answer as for any missing resource, CR-006) for another provider's service, a product, a removed offering, an unknown id, an owner or provider account id and malformed ids; all columns of the targeted rows are unchanged (snapshot comparison); owners get `404`, anonymous `401`, foreign Origin `403`. Browser: a second clinic's direct request returned `404 NOT_FOUND` and its visit to the edit URL ended on "No puedes ver esta página". |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-006 | The update uses the publish validator: exactly one species, `dog` or `cat`; missing, blank or other values give `422` (`REQUIRED` / `NOT_ALLOWED`) and write nothing. |
| BR-007 | A clinic can move a service among clinic, home and both; an independent veterinarian's modality stays `home` whether the field is omitted or `home`, and `clinic` / `both` are `NOT_ALLOWED`. |
| NFR-002 | The provider id comes only from the session; the `UPDATE` is scoped by `provider_id`; the request cannot carry `providerId`, `id`, `kind` or `available` (all `NOT_ALLOWED`). |
| P04-ASM-036 | No statement of the update touches `appointment`; the appointment row is byte-identical before and after an edit that changes name, price, species and modality (test). See the interpretation in §11. |
| Edge cases | None defined in the backlog for US-011. |
| DEP-001 / DEP-003 | Provider-only guard reused; the service must be an active service of the provider. |

## 8. Tests and Verification Results

Tests added: `tests/catalog-services-update.test.js` (8) and `tests/catalog-services-update.database.test.js` (9): 17 new tests. Executed:

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Baseline | `npm test` with `TEST_DATABASE_URL` pointing to the disposable instance | PASSED | 209 tests, 209 passed, 0 skipped, before any change. (Against the stopped Docker database on port 5434: 65 failures, all `ECONNREFUSED`; environment, not code.) |
| Focused tests | `node --env-file-if-exists=.env --test tests/catalog-services-update.test.js tests/catalog-services-update.database.test.js` | PASSED | 17 of 17, 0 skipped. One assertion of mine first failed because it assumed the pet rule is checked before the visit-address rule on a home service; the test was corrected, the code was right. |
| Full regression | `npm test` | PASSED | 226 tests, 226 passed, 0 failed, 0 skipped (209 + 17). |
| Production build | `npm run build` | PASSED | 45 modules transformed. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Browser check | Local API and Vite servers on the disposable database (migrations 001–002 applied): a clinic and an independent veterinarian with one service each, another clinic, an owner with one dog; sign-in through the real form for the clinic | PASSED (manual) | Catalog card shows "Editar"; the form opens in edit mode pre-filled; an empty name shows "Este campo es obligatorio." and nothing is sent; changing name, price, species and modality saves and returns to the catalog with "Cambios guardados." and the new card; a direct request and the edit URL by another clinic are refused; the owner sees the new details in search, in the public profile and on the booking screen (the dog's pet is disabled for the now-cat service); the independent veterinarian's form has no modality control and saves keeping `home`. Visual appearance not assessed (the browser pane could not draw; behavior was checked through the DOM). |
| Hosted Vercel / Neon behavior | — | NOT_RUN | Migration 002 still has to be applied to Neon before the iteration-2 deployment (see the index); COND-001 history unchanged. |

## 9. Repository Changes

Created: `tests/catalog-services-update.test.js`, `tests/catalog-services-update.database.test.js`, and this log. Modified: `src/modules/catalog/offerings.js`,
`src/modules/scheduling/booking.js`, `client/src/pages/PublishService.jsx`, `client/src/pages/ProviderCatalog.jsx`, `client/src/App.jsx`, `docs/API.md`, `docs/USER_GUIDE.md`,
`artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. Deleted: none. No migration, dependency manifest, lockfile, `.env`, API contract or earlier validation report was changed. No commit was made.

## 10. Architecture Conformance and Deviations

Conforms to `ARCHITECTURE_V4` §6.4 (COMP-007 update reuses the publish validators and updates own active offerings of that kind) and IF-036 (outcomes `VALIDATION_FAILED` incl. `NOT_ALLOWED`, `NOT_FOUND`). The change is taken
under the provider lock (IF-024), the same lock used by booking, removal and hours saves, so these operations serialize. CR-006 holds (uniform `NOT_FOUND`); CR-029 holds (removed offerings are not editable and the
update never writes `removed_at`). The route answers with the `CatalogService` schema of API_SPEC_V2.

**Shared-code change (documented, not a deviation).** The architecture does not say what a booking must do if the service was edited between the owner's checks and the insert. Without a guard, a species change could let a
dog be booked on what is now a cat service (BR-024) in a millisecond window. The guard in `bookSlot` (compare species and offered modality under the lock) is six lines, only fires when an edit happened in that window, and
returns the existing `SLOT_UNAVAILABLE`, after which the booking screen reloads the service and shows the current details. The accompanying message ("Ese horario ya no está disponible") is slightly imprecise in that rare case.
No formal architectural review is required.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Type | Impact / next action |
|---|---|---|
| **P04-ASM-036 interpretation.** "Editing a service does not change appointments already booked" is implemented as: the appointment records (time, pet, modality, address, status) are never modified. Appointment lists display the service's *current* name (the appointment stores a reference, not a copy of the name), so a renamed service shows its new name on old appointments. | Product assumption (UX marks it as open to objection, TD-19) | If the team wants the booked name frozen, a snapshot column would be needed (schema change). Confirm. |
| Upcoming appointments can now refer to a service whose species or modality has changed (for example booked at the clinic, service now home only). They stay valid and unchanged. | Consequence of P04-ASM-036 | None required. |
| Concurrent edits of one service by the same provider are last-write-wins (no version check). The final row is always one complete submitted version. | Technical decision | Acceptable for a single-owner catalog. |
| `bookSlot`'s new guard answers `SLOT_UNAVAILABLE` for an edit that happened mid-booking. | Technical decision | See §10. |
| No client tests exist; visual layout and screen-reader behavior of the new button and form were not verified. | Unverified behavior | P06.4 and P07. |
| Hosted runtime: migration 002 on Neon pending; tests ran on a disposable PostgreSQL 18, not on PostgreSQL 16/Neon. | External limitation | Required before deploying iteration 2. |
| US-014 (update a product) shares the endpoint family and the form pattern and is the natural next step. | Follow-up outside this HU | Implement separately. |

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** Both acceptance criteria are implemented and pass automated and manual evidence. The limitations (open interpretation of P04-ASM-036, no visual pass, no hosted run, a disposable
database instead of the project's) are documented and non-blocking. This status is not a validation result.

## 13. Handoff to P06.4

Validate **US-011** from `artifacts/03_planning/product_backlog_priori_v3.json`. Inspect the new route in `src/modules/catalog/offerings.js`, the guard in `bookSlot` (`src/modules/scheduling/booking.js`),
`client/src/pages/PublishService.jsx`, `client/src/pages/ProviderCatalog.jsx`, `client/src/App.jsx` and the two new test files. Independently run `npm test` with a database in `TEST_DATABASE_URL`, `npm run build` and
`git diff --check`. Specifically verify:
(1) every place the edit must show up (catalog, public profile, search with its species filter, booking context, assistant answers) reads the new values and none shows the old ones;
(2) ownership: no way to change a service of another provider, a product, a removed offering or an arbitrary id, and no write on refusal (full-row comparison);
(3) validation parity with publishing for every field, including the independent veterinarian's modality, and that read-only columns cannot be changed through the body;
(4) the transaction: the provider lock is taken, an edit waits for a competing transaction, concurrent edits never mix fields;
(5) the booking race and the guard added to `bookSlot`, and that normal bookings are unaffected;
(6) that appointments are never modified by an edit (P04-ASM-036) and how the displayed name behaves;
(7) the edit screen: pre-fill, validation, success notice, not-found handling and the independent veterinarian's form;
(8) that the earlier stories are unaffected, with the environment note in §3 in mind.

## 14. Update (2026-11-09, after P06.4): database tests repeated on the standard PostgreSQL 16

Sections 3, 8 and 11 describe the run as it happened, on a disposable PostgreSQL 18 because the Docker database was down. Once Docker was running, the full suite was repeated on the project's own test
database (`vetcare-postgres`, PostgreSQL 16.15, `en_US.utf8`, through the unchanged `TEST_DATABASE_URL` of `.env`): **231 tests, 231 passed, 0 skipped**. The count is higher than the 226 of section 8 because
P06.4 added one US-011 test (modality-only race) and a separate header-layout change added 4 CSS tests. The environment limitation recorded in section 11 is therefore resolved for tests; the migration on a hosted
database is still pending, and the development database `vetcare_dev` still lacks migration 002 (see the validation report, section 15).
