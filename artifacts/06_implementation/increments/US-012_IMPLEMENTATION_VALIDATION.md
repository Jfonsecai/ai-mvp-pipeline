# US-012 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Validation date | 2026-11-10 |
| HU | US-012 — Remove a service (EPIC-004; P2 / SPRINT-002 / RELEASE-002; 3 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` (item `US-012`, PLANNED, `iteration_2_status: COMMITTED`) |
| Implementation log | `artifacts/06_implementation/increments/US-012_IMPLEMENTATION_LOG.md` (sections 1–13 as handed over; section 14 is the post-validation addendum) |
| Requirements | FR-013 |
| Acceptance criteria | AC-032, AC-083 |
| Business rules | BR-034, BR-035 |
| Edge cases | EDGE-012 |
| Dependencies | DEP-001, DEP-003 (backlog); DEP-012 (planning dependency in `PRIORITIZATION_V3.md`, see F-02) |
| Foundation validation | PASS_WITH_WARNINGS (`FOUNDATION_VALIDATION.md`); `ARCHITECTURE_VALIDATION_V4.md` PASS (v4.1) |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **PASS_WITH_WARNINGS** |

This report is the first validation of US-012; there is no earlier report to preserve.

## 2. Executive Summary

Validated the removal of a service by its provider: `DELETE /api/provider/offerings/:offeringId` for services (IF-037) with the cancellation command (IF-044) in one transaction under the provider lock, the "Eliminar" action and the confirmation dialog on the catalog (SCR-UX-011, COMP-UX-022), and the way a removed service and its cancelled appointments show up everywhere the acceptance criteria name.

Both acceptance criteria are satisfied with independent evidence: the removed service disappears from the provider's catalog, the public profile, text/species/voice search, the assistant and booking, and new appointments cannot be booked (AC-032); its upcoming scheduled appointments are cancelled and appear as cancelled to every owner and to the provider (AC-083, EDGE-012, BR-034, BR-035), while started, already-cancelled and other services' appointments are untouched. I re-ran the whole suite (249 of 249 on PostgreSQL 16), the build and the patch check; ran an adversarial randomized probe against an in-memory oracle (8 seeds, 4,482 checks, 0 differences); mutation-tested the new tests (23 mutants, all detected); and repeated the browser check with different data (an independent veterinarian, a service without appointments, the 404 and 500 paths, a stale booking link).

Validation found no defect in the behavior. It corrected two minor items in the increment (a stale comment, F-01; a boundary of BR-034 pinned only by SQL text, F-03: a behavioral test was added) and recorded one traceability omission (F-02). Open warnings: the confirmation dialog was checked through the DOM and at 375 px but not with a real keyboard, screen reader or visual pass (F-04), and the hosted run (migration 002 on Neon) is still pending. No mandatory correction is open.

## 3. Validation Scope and Limitations

**Examined.** The new route and `removeService` (`src/modules/catalog/offerings.js`), the IF-044 command (`src/modules/scheduling/cancellation.js`), the catalog page and styles (`client/src/pages/ProviderCatalog.jsx`, `client/src/design-system/global.css`), the two new test files, the documentation lines, and — as the places AC-032/AC-083 are observed — the unchanged readers: `getServiceFacts` (booking, history), `listProviderOfferings` (catalog, public profile), `searchOfferings` (search, voice, assistant), the booking context and `bookSlot`, and the owner/provider appointment lists. Criteria: AC-032, AC-083.

**Not verified.** Hosted Vercel/Neon behavior (migration 002 is not applied to Neon or to the development database `vetcare_dev`); a real-keyboard, screen-reader and visual pass of the dialog (the browser pane could not draw, so layout was measured and behavior driven through the DOM); the pets' `window.confirm` flow (US-007, out of scope).

**Environment.** The project's PostgreSQL 16.15 test database (Docker `vetcare-postgres`, `TEST_DATABASE_URL`); every database run used a throwaway schema that was dropped afterwards (checked: no `vetcare_*`, `us012*` or `probe_*` schema remains). `vetcare_dev` was not touched. The API and Vite processes started for browser checks were stopped.

**This is HU-level validation, not final product-wide testing (P07).**

## 4. Acceptance Criteria Validation Matrix

| Criterion | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-032 | A signed-in provider with a published service who removes it: the service no longer appears in their catalog, on their profile or in search results, and new appointments for it cannot be booked. | `removeService` + `DELETE /provider/offerings/:offeringId`; reads filtered with `removed_at IS NULL` (Step 0); `bookSlot` re-reads the service under the provider lock; "Eliminar" + dialog in `ProviderCatalog.jsx`. | Code inspection; no-database tests (9); PostgreSQL tests through the real registry (9); randomized oracle probe; 23 mutants; two browser passes. | **PASS** | After the removal: absent from `GET /provider/offerings`, from `GET /providers/:id` (owner view), from `/search` with and without the species filter, from `/search/voice` and from the assistant's answer; `GET /services/:id/booking-context` → 404; `POST /owner/appointments` → 404 and no row written; the row stays with `removed_at = now` and no other column changed; the provider's other service stays listed and bookable; removing twice, a product, another provider's, an unknown or malformed id → one `NOT_FOUND` with every column unchanged. Browser (clinic and independent veterinarian): the card disappears with "Servicio eliminado."; the owner's search and the profile list only the remaining service; the stale booking URL ends on the not-found screen. Probe: catalog, profile and search matched the oracle after every 10 random steps in 8 seeds. | — |
| AC-083 | A removed service that had upcoming appointments: the owners and the provider open their appointments and those appointments are shown as cancelled. | `cancelUpcomingServiceAppointments` called by `removeService` in the same transaction; lists read the service with `includeRemoved`. | Same as above, plus full-row comparisons of the untouched appointments. | **PASS** | Three upcoming scheduled appointments of two owners over two weeks → `cancelled`, `cancelled_at = now`, response `cancelledAppointments: 3`; a started appointment, an already-cancelled one and another service's appointment are byte-identical; none deleted (5 rows remain for the service); `GET /owner/appointments` for both owners and `GET /provider/appointments` list them with `status: cancelled` and the removed service's name; the assistant no longer offers them. Browser: provider and owner lists show "Cancelada" (clinic, and home visit of an independent veterinarian) beside a still "Programada" appointment of another service. Boundary: an appointment starting exactly at `now` is not cancelled, one an hour later is. | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Findings / limitations |
|---|---|---|---|---|
| BR-034 | Upcoming appointments are cancelled automatically when their service is removed; scope limited to the affected appointments. | Command SQL; database tests (other services', past and cancelled rows untouched; boundary at `now`); mutants M01–M05 (status, start, service scope, timestamp) all detected; oracle probe over 8 seeds including past and cancelled rows. | PASS | — |
| BR-035 | Cancelled appointments remain visible, shown as cancelled. | Rows are updated, never deleted; both lists use `includeRemoved`; mutants M22a/M22b (history hiding removed services) detected; browser lists. | PASS | — |
| EDGE-012 | A provider removes a service that has upcoming appointments: they are cancelled and shown as cancelled. | See AC-083. | PASS | — |
| NFR-002 / CR-006 | A provider changes only its own catalog; uniform `NOT_FOUND`. | Ownership test (7 refusal paths, malformed ids, 401/403, full-row snapshot); mutants M07, M08, M09, M14, M15. | PASS | — |
| CR-029 | Every user-facing read excludes removed rows; history does not. | Tests for catalog, profile, search, voice, assistant, booking context, booking; mutants M18–M21 detected. | PASS | — |
| IF-024 / ARCHITECTURE_V4 §8.3 | Removal is serialized with bookings, edits and hours saves by the provider lock. | Tests: removal waits for a held lock; a booking that waited fails `NOT_FOUND` with nothing written; 8 bookings racing with the removal end consistent (every appointment that got in is cancelled; the count equals `cancelledAppointments`); mutants M06 and M18. | PASS | — |
| Atomicity | No half-removed service. | A trigger that makes the cancellation fail → 500, `removed_at` still null, appointment still scheduled; no-database test confirms ROLLBACK. | PASS | — |
| BR-013 (related) | A cancelled appointment frees an independent veterinarian's slot. | Test: another service of the same veterinarian takes the slot after the removal. | PASS | — |
| DEP-001 | Signed-in provider of the right account type. | Provider-only guard; anonymous 401, owner 404; mutant M15 detected. US-003 validated PASS_WITH_WARNINGS. | PASS | — |
| DEP-003 | Depends on published services. | Services are published by US-010 (code present and exercised by every test). US-010's own index status is still FAIL for AC-027 (public profile/search), which now exist (US-016, US-018 validated); its re-validation is outside this HU. | PASS | F-09 (INFO) |
| DEP-012 (planning) | Automatic-cancellation criteria need existing appointments. | Booking exists; both test files and the browser checks create real appointments. | PASS | F-02 |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Full suite | `npm test` (with `TEST_DATABASE_URL`) | PASSED | 249 tests, 249 passed, 0 failed, 0 skipped (the log reported 248 before F-03 added one test; US-011 baseline 231). |
| New tests, no database | `node --env-file-if-exists=.env --test tests/catalog-services-remove.test.js` | PASSED | 9 of 9. White-box: some assertions pin SQL text (see F-07). |
| New tests, PostgreSQL | `node --env-file-if-exists=.env --test tests/catalog-services-remove.database.test.js` | PASSED | 9 of 9, 0 skipped. |
| Production build | `npm run build` | PASSED | Vite build succeeded (run three times, last after the final edit). |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Adversarial probe | Randomized script against the real app on a throwaway schema, compared with an in-memory oracle (4 providers, 3 owners, 12 services; 60 random bookings, direct inserts of past/cancelled rows, removals by the right and wrong provider; state, catalog, profile, search and both appointment lists compared every 10 steps), seeds 1–8 | PASSED | 4,482 checks, 0 differences; 21–36 appointments and 7–9 of 12 services removed per seed. It does not cover races or malformed ids (the suite does). |
| Mutation testing of the new tests | 23 single-line mutants of `cancellation.js`, `offerings.js`, `booking.js`, `search/offerings.js` (status/start/service scope, `>=`, `cancelled_at`, no lock, ownership, kind, active filter, no mark, no cancellation, wrong count, wall clock, no UUID check, wrong role, no row lock, `removed_at = now()`, booking and booking-context including removed, search and catalog filters, history hiding removed); each run against both new test files | PASSED | **23 of 23 detected by the suite**; the oracle probe alone detected 14. Two mutants are detected only by SQL-text assertions: `FOR UPDATE` on the offering row (behaviorally equivalent, the provider lock already serializes; F-07) and `>=`, which F-03 then made detectable by behavior (re-run: still detected, now by the boundary test). Source files were restored and compared byte for byte. |
| Browser check 1 (from the log) | Performed during the P06.3 run in this same session (clinic with two services, two owners, three appointments; sign-in through the real forms); not repeated by P06.4, which did check 2 with different data | PASSED (manual, reported) | Dialog texts, cancel, Escape, focus return, removal, provider and owner views, 375 px geometry. A defect found in that run (focus not returned after cancelling) was fixed before this validation. |
| Browser check 2 (other data) | Independent veterinarian with a home appointment and a service without appointments; an owner with a cat | PASSED (manual) | Removal of the service without appointments; a one-shot HTTP 500 → message inside the open dialog, buttons re-enabled, retry succeeds; the stale card (service removed elsewhere) → dialog closes, "Ese servicio ya no existe. Actualizamos tu catálogo.", list reloaded; the owner sees the home appointment as "Cancelada"; the stale booking URL → not-found screen; search empty. Interaction was driven through the DOM; the pane could not draw. |
| Real keyboard, screen reader, visual pass | — | NOT_RUN | See F-04. |
| Hosted Vercel / Neon | — | NOT_RUN | Migration 002 pending on Neon and `vetcare_dev`; COND-001 history unchanged. |

Execution is not coverage: the criteria are covered by the matrix in section 4, not by the pass count.

## 7. Architecture, UX, and Integration Conformance

**Architecture — conforms.** `ARCHITECTURE_V4` §8.3 sequence (provider lock → own active service `FOR UPDATE` → `removed_at` → IF-044 → commit), ADR-020 (logical removal; one command per operation), CR-029, CR-006 and the `RemovalResult` of `API_SPEC_V2` (a test compares the keys to the spec; the contract-consistency tests pass). No schema, dependency or contract change. The command lives in COMP-009 (`scheduling/cancellation.js`, beside `hours.js`) and is called by COMP-007; a catalog → booking import would have been circular, which is why it is not in `booking.js`. The table in §7.2 draws IF-044's arrow the other way, but §6.4/§8.3 call for COMP-007 to call it; documented in the log (conflict 3), no code impact. The contract's single route for services and products is implemented for services only (F-05).

**UX — conforms, with the limits of F-04.** Texts match `UX_SPEC_V3` §5 ("¿Eliminar este servicio?", "Dejará de aparecer en las búsquedas. Sus citas próximas se cancelarán.", "Sí, eliminar", "No, volver"); the service's name is added in bold at the start of the body (INFO, harmless). "Eliminar" is tertiary with `color-error` text; "Servicio eliminado." replaces the card; appointments appear "Cancelada" in both lists (BR-035). Reuses existing tokens; no new token. The success message is the catalog's existing inline status notice rather than a toast (same as US-011).

**Integration.** No change to `booking.js`, `search/offerings.js`, the appointment lists or any other story's code; their Step 0 behavior is what the tests exercise (and the mutants M18–M22 confirm the tests would notice a regression there).

## 8. Security, Data Integrity, and Regression Findings

- **Authorization:** role guard, session-derived provider id, scoping by `provider_id` and `kind` in the locking `SELECT`; the Origin guard applies (403 for a foreign or a missing Origin). No information leak: every non-removable id answers the same `404 NOT_FOUND`.
- **Injection / input:** the id is checked as a canonical UUID before any query and passed as a parameter; malformed ids (including `1' OR '1'='1`, dashless UUIDs, NUL) never reach the database (asserted).
- **Data integrity:** removal is logical; appointments are never deleted and keep their foreign keys; cancellation and removal are one transaction (forced failure rolls both back); a concurrent booking cannot slip in (lock plus re-read) and a double removal cannot double-cancel. No observed defect.
- **Regression:** the 231 earlier tests still pass; no earlier story's file changed. Not verified: hosted behavior.

## 9. Findings Register

No `CRITICAL`, `HIGH` or `MEDIUM` finding. **No mandatory correction is open.**

| ID | Severity | Title | Evidence | Impact | Action / closure | State |
|---|---|---|---|---|---|---|
| F-01 | LOW | Stale comment in `ProviderCatalog.jsx` (`{ service, opener }`) after the opener moved to a ref | `client/src/pages/ProviderCatalog.jsx` | Misleading comment only | Comment corrected during validation; no behavior change. | **Fixed** |
| F-02 | INFO | The log's dependency list omitted DEP-012 (`PRIORITIZATION_V3.md`) | Backlog `dependency_ids` and `REQUIREMENTS_V4` list DEP-001/DEP-003 only; `PRIORITIZATION_V3.md` §6 step 6 and the dependency table add DEP-012 (needs existing appointments) | Traceability gap; the dependency itself is satisfied | Addendum added to the log (section 14), history not rewritten. | **Fixed** |
| F-03 | LOW | The BR-034 boundary (`starts_at > now`) was pinned only by SQL text | Mutant `>=` was detected only by the no-database test; the database tests' clock (14:30Z) cannot coincide with an hourly start | A future edit of the SQL string could regress the boundary unnoticed by behavior tests | Ninth PostgreSQL test added (appointment at exactly `now` stays scheduled, one an hour later is cancelled); mutant re-run: detected by behavior. | **Fixed** |
| F-04 | LOW (warning) | Dialog not verified with a real keyboard, screen reader or visual pass; no automated client tests | Browser pane could not draw; behavior driven through the DOM, geometry measured at 375 px (dialog 19–356 px, 44 px buttons, no horizontal overflow); the repository has no client test runner | Possible visual or assistive-technology defects in the new dialog | Manual pass in P07 (open with the keyboard, Tab/Shift+Tab inside, Escape, focus return; screen reader announces title and text; contrast of `color-error` on the surface). | **Open (non-blocking)** |
| F-05 | INFO | Products cannot be removed; the shared `DELETE` answers `NOT_FOUND` for a product id | `removeService` filters `kind = 'service'`; log conflict 2 | Intended boundary of this HU | US-015 extends the route and the product card. | Open (follow-up) |
| F-06 | INFO | Owners are not notified; they see "Cancelada" when they open "Mis citas" | No notification channel exists in the approved scope; AC-083 only requires the state to be shown | Product observation | None required; the team may want a notice in a future iteration. | Open (observation) |
| F-07 | INFO | One mutant is detected only by SQL-text assertions | `FOR UPDATE` on the offering row is redundant under the provider lock (equivalent behavior) | None | None. | Closed (informational) |
| F-08 | INFO (warning) | Hosted run pending | Migration 002 not applied to Neon or to `vetcare_dev`; tests ran on the project's PostgreSQL 16 | The deployed app needs migration 002 first | Apply 002 before the iteration-2 deployment (P08), then smoke-test a removal. | Open (carried from the index) |
| F-09 | INFO | The index still shows US-010 as FAIL (AC-027) although US-016 and US-018 now exist | `IMPLEMENTATION_INDEX.md` | Stale status of another HU | Re-validate US-010 in its own P06.4 run; not changed here. | Open (outside this HU) |

Optional recommendation: extract the confirmation dialog into a shared component when US-015 or US-022 needs it (today it is local to the catalog; the pets' `window.confirm` has different wording).

## 10. Implementation Log Consistency

The log matches the repository: the files, the route, the SQL, the 17 tests and their intent, the 248/248 result (reproduced, then 249/249 after F-03), the build, the browser observations and the documented conflicts were all confirmed. The log is honest about what was not run (baseline, hosted, real keyboard) and flagged the CRLF/working-tree situation correctly (US-011 was committed). Differences: (1) DEP-012 omitted (F-02); (2) statements that the 404/500 dialog paths and the stale booking screen were unverified are superseded by this validation (addendum); (3) the status READY_WITH_LIMITATIONS is consistent with the evidence. The index row for US-012 was added by P06.3 with `NOT_VALIDATED`; it is updated below.

## 11. Readiness Decision

US-012 can be considered validated with warnings: both required criteria pass with independent evidence, the business rules and the dependencies are satisfied, no material defect, security or data-integrity problem was found, and no unapproved architectural deviation exists. Conditions to carry: F-04 (manual keyboard/screen-reader/visual pass in P07), F-08 (migration 002 on Neon before deploying), F-05 (US-015 completes the shared route). Nothing here says the product is ready for release. The next story must be chosen from the backlog and planning artifacts with its own dependency check (remaining catalog stories: US-014, US-015; US-015 shares this route and dialog).

## 12. Final Status

**PASS_WITH_WARNINGS**

## 13. Corrective Actions and Retest Guidance

No failed or blocking finding. Follow-ups: F-04 — manual pass of the dialog (evidence: a short written record of the keyboard sequence and the screen-reader announcement, plus a screenshot at 375 px and 1280 px); F-08 — after applying migration 002 on Neon, remove a test service with an upcoming appointment through the deployed UI and confirm the cancelled state in both appointment lists.
