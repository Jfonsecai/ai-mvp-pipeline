# US-014 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Validation date | 2026-11-10 |
| HU | US-014 — Update a product (EPIC-004; P2 / SPRINT-002 / RELEASE-002; 1 point) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` (item `US-014`, PLANNED, `iteration_2_status: COMMITTED`) |
| Implementation log | `artifacts/06_implementation/increments/US-014_IMPLEMENTATION_LOG.md` (sections 1–13 as handed over; section 14 is the post-validation addendum) |
| Requirements | FR-015, NFR-002 |
| Acceptance criteria | AC-035, AC-036 |
| Business rules | BR-006 (BR-032 for the species values) |
| Edge cases | none defined |
| Dependencies | DEP-001, DEP-004 |
| Foundation validation | PASS_WITH_WARNINGS (`FOUNDATION_VALIDATION.md`); `ARCHITECTURE_VALIDATION_V4.md` PASS (v4.1) |
| Implementation status (P06.3) | READY_FOR_VALIDATION |
| **Final validation status** | **PASS_WITH_WARNINGS** |

This is the first validation of US-014; there is no earlier report to preserve.

## 2. Executive Summary

Validated the update of a product by its provider: `PUT /api/provider/products/:offeringId` (IF-036), the "Editar" action on the catalog's product cards (SCR-UX-011) and the edit mode of the product form (SCR-UX-013), and the way the new details show up in the places the criteria name.

Both acceptance criteria are satisfied with independent evidence: the updated name, price and species appear in the provider's catalog, the public profile, text/species search and the assistant, and the old name no longer matches (AC-035); a provider cannot change a product of another provider — nor a service, a removed offering or an arbitrary id — and every refusal is the same `404 NOT_FOUND` with no column changed (AC-036, NFR-002). Availability (`available`), modality, identity, owner, kind, order and removal state are never touched. I re-ran the whole suite (264 of 264 on PostgreSQL 16), the build and the patch check; ran an adversarial randomized probe against an in-memory oracle (8 seeds, 3,105 checks, 0 differences); mutation-tested the new tests (15 mutants, 14 detected, 1 equivalent); and repeated the browser check with different data (an independent veterinarian, narrow 375 px width, the 500 / 404 / load-failure paths of the form).

No defect was found and no change to the increment was needed. Open warnings: the form and the new button were checked through the DOM and at 375 px but not with a real keyboard, screen reader or visual pass (F-01), and the hosted run (migration 002 on Neon) is still pending (F-04). No mandatory correction is open.

## 3. Validation Scope and Limitations

**Examined.** The new route (`src/modules/catalog/offerings.js`), the edit mode of `client/src/pages/PublishProduct.jsx`, the product action in `client/src/pages/ProviderCatalog.jsx`, the new route in `client/src/App.jsx`, the two new test files, the documentation lines, and — as the places AC-035 is observed — the unchanged readers: `listProviderOfferings` (catalog, public profile), `searchOfferings` (search, voice, assistant). Criteria: AC-035, AC-036.

**Not verified.** Hosted Vercel/Neon behavior (migration 002 is not applied to Neon or to the development database `vetcare_dev`); a real-keyboard, screen-reader and visual pass (the browser pane could not draw, so layout was measured and behavior driven through the DOM); ordering flows (not implemented; they will consume the product price).

**Environment.** The project's PostgreSQL 16.15 test database (Docker `vetcare-postgres`, `TEST_DATABASE_URL`); every database run used a throwaway schema that was dropped afterwards (checked: no `vetcare_*`, `us01*` or `probe_*` schema remains). `vetcare_dev` was not touched. The API and Vite processes started for the browser checks were stopped; the source file mutated during mutation testing was restored and compared byte for byte.

**This is HU-level validation, not final product-wide testing (P07).**

## 4. Acceptance Criteria Validation Matrix

| Criterion | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-035 | A signed-in provider with a published product who changes its details and saves: the updated details appear in their catalog, on their profile and in search results. | `PUT /provider/products/:offeringId` with one conditional `UPDATE … RETURNING`; unchanged live readers; edit mode in `PublishProduct.jsx`; "Editar" on the product card. | Code inspection; no-database tests (8); PostgreSQL tests through the real registry (7); randomized oracle probe; 15 mutants; two browser passes. | **PASS** | Response is the saved `CatalogProduct` (keys match the spec). After the update: `GET /provider/offerings`, `GET /providers/:id`, `/search` (new name found, old name not, species filter follows the new species) and the assistant (new name and price, old name absent) all show the new values. Name is trimmed; boundaries 1 / 2,147,483,647 and 120 characters accepted, one more refused (nothing written); concurrent edits end as exactly one submitted version. Browser (clinic, owner, independent veterinarian): the form opens pre-filled without a modality control, validates before sending, saves with "Cambios guardados.", and the card, the owner's search and the public profile show the new values (also after a retry following a simulated 500). Probe: catalog, public profile and search matched the oracle after every 15 random steps in 8 seeds. | — |
| AC-036 | A signed-in provider who tries to change a product of another provider is not allowed to. | Role guard; `provider_id`, `kind = 'product'` and `removed_at IS NULL` in the `UPDATE`; UUID check before any query. | Same as above, with full-row snapshot comparisons. | **PASS** | Another clinic or another veterinarian, a service id, a removed product, an unknown id, an owner's and a provider's account id, malformed ids (including `1' OR '1'='1` and dashless UUIDs, which never reach the database) → one `404 { code: NOT_FOUND }`; owner caller → 404, anonymous → 401, foreign Origin → 403; all columns of the target product, a service and a removed product are byte-identical afterwards; the US-011 service endpoint also refuses a product id. Browser: a second clinic's direct `PUT` → `404`, and its visit to the edit URL ends on the not-found screen. Probe: 90 random calls per seed over 16 offerings with own/foreign/owner/anonymous callers, wrong kinds and removed rows matched the oracle. | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Findings / limitations |
|---|---|---|---|---|
| BR-006 / BR-032 | Exactly one species per product, dog or cat. | Shared publish validator; tests refuse empty, missing, list-valued and unknown species (`REQUIRED` / `NOT_ALLOWED`) with the row unchanged; both switches dog ↔ cat persist; mutants M06 (species not written), M09 (no validation) and M15 (wrong validator) detected. | PASS | — |
| NFR-002 / CR-006 | A provider changes only its own catalog; uniform `NOT_FOUND`. | See AC-036; mutants M01, M02, M07, M08, M11 detected. | PASS | — |
| API_SPEC_V2 "availability is not changed here" | The update never touches `available`. | A product set to not available stays not available after an edit (full-row comparison); `available`, `modality`, `kind`, `id`, `providerId` in the body → `422 NOT_ALLOWED`; mutant M04 (reset availability) detected; the probe toggles availability between edits. | PASS | — |
| CR-029 | Removed offerings are not editable. | Removed product → 404; an edit that waits on an uncommitted removal finds it removed and changes nothing; mutants M03 and M11 detected. | PASS | — |
| Edge cases | None defined for US-014. | Backlog. | n/a | — |
| DEP-001 | Signed-in provider of the right account type. | Role guard; owner → 404, anonymous → 401; mutant M08 detected. US-003 validated PASS_WITH_WARNINGS. | PASS | — |
| DEP-004 | Depends on published products. | Products are published by US-013 (code present and exercised by every test). The index still shows US-013 as FAIL for AC-033 (display on a profile and in search), which now exist (US-016, US-018 validated); its re-validation is outside this HU. | PASS | F-05 |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Full suite | `npm test` (with `TEST_DATABASE_URL`) | PASSED | 264 tests, 264 passed, 0 failed, 0 skipped (US-012 baseline 249 + 15 new). |
| New tests, no database | `node --env-file-if-exists=.env --test tests/catalog-products-update.test.js` | PASSED | 8 of 8. |
| New tests, PostgreSQL | `node --env-file-if-exists=.env --test tests/catalog-products-update.database.test.js` | PASSED | 7 of 7, 0 skipped. |
| Production build | `npm run build` | PASSED | Vite build succeeded. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Adversarial probe | Randomized script against the real app on a throwaway schema, compared with an in-memory oracle of the offering table (4 providers, 16 offerings; 90 steps of valid and invalid updates by the owner, other providers, an owner account and anonymous callers on products, services, removed rows and malformed ids, interleaved with direct availability toggles and removals; rows, catalog, public profile and search compared every 15 steps), seeds 1–8 | PASSED | 3,105 checks, 0 differences. It does not cover races (the suite does). |
| Mutation testing of the new tests | 15 single-line mutants of the product route (ownership scope, kind scope, active filter, availability reset, price not written, species not written, no UUID check, wrong role, no validation, wrong serializer, no not-found on empty, id not lower-cased, availability not returned, no provider-profile check, wrong validator); each run against both new test files | PASSED | **14 of 15 detected by the suite**; the oracle probe alone detected 12. The survivor, M14 (removing the redundant `providerTypeFor` query), is behaviorally equivalent: the `UPDATE` is already scoped by `provider_id` and a provider cannot exist without a profile (F-02). The source file was restored and compared byte for byte. |
| Browser check 1 (from the log) | Performed during the P06.3 run in this same session (two clinics, an owner; sign-in through the real forms); not repeated by P06.4, which did check 2 with different data | PASSED (manual, reported) | Product card with "Editar" only; pre-filled edit form; client validation; save, notice, owner's search and profile; the other clinic's direct `PUT` 404 and not-found screen. |
| Browser check 2 (other data, 375 px) | Independent veterinarian with two products (dog, cat); viewport 375 × 812; DOM-driven | PASSED (manual) | Catalog and edit form without horizontal overflow (card right edge 359 px, form 334 px); "Editar" button 50 px high, submit 48 px; the form opens for the cat product pre-filled (species cat); a one-shot HTTP 500 on save → "No pudimos guardar los cambios…" in an alert, entered value kept, button re-enabled, retry saves ("Cambios guardados.", $ 95.000 on the card); a failed catalog load → "No pudimos cargar el producto…" with "Reintentar", retry pre-fills; a `404` on save → not-found screen. Interaction was driven through the DOM; the pane could not draw. |
| Real keyboard, screen reader, visual pass | — | NOT_RUN | See F-01. |
| Hosted Vercel / Neon | — | NOT_RUN | Migration 002 pending on Neon and `vetcare_dev`. |

Execution is not coverage: the criteria are covered by the matrix in section 4, not by the pass count.

## 7. Architecture, UX, and Integration Conformance

**Architecture — conforms.** `ARCHITECTURE_V4` §6.4 (the update reuses the publish validators and updates own active offerings of that kind), IF-036's outcomes, CR-006, CR-029; the response is the `CatalogProduct` of `API_SPEC_V2` (a test compares the keys; the contract-consistency tests pass). No schema, dependency or contract change. The product update is a single atomic conditional statement with no transaction or provider lock, unlike the service update; the architecture requires that lock only to serialize with bookings, and no booking-like operation reads a product today. The log documents this; ordering (US-027+) must revisit it if it needs a stable price (F-03).

**UX — conforms, with the limits of F-01.** SCR-UX-013 edit mode: title "Editar producto", fields pre-filled, same fields and validation as publishing, primary "Guardar cambios" → catalog with MSG-SAVED ("Cambios guardados."); the product card gets "Editar" (secondary) and, correctly for this HU, no "Eliminar" (US-015); no stock/availability control (ordering deferred). Reuses existing classes and tokens; no new token. The success message is the catalog's inline status notice (same as US-011).

**Integration.** No change to `booking.js`, `search/*`, the appointment lists or any other story's code. The US-011 service edit and the US-012 removal still behave as before (suite green; the product route does not touch their code).

## 8. Security, Data Integrity, and Regression Findings

- **Authorization:** role guard, session-derived provider id, scoping by `provider_id` and `kind` in the `UPDATE`; Origin guard applies (403 for a foreign or missing Origin and for a non-JSON content type). Every non-editable id answers the same `404 NOT_FOUND`. Validation (422) runs before ownership (404), as in US-011: a foreign id with an invalid body gets 422, which reveals nothing about the id.
- **Injection / input:** the id is checked as a canonical UUID before any query and passed as a parameter; malformed ids never reach the database (asserted); the body is validated with closed field sets, so `available`, `modality`, `kind`, `id` and `providerId` cannot be written.
- **Data integrity:** one statement, atomic; concurrent edits never mix fields; a concurrent removal wins (the edit re-checks `removed_at` after the row lock). No observed defect.
- **Regression:** the 249 earlier tests still pass; no earlier story's file changed apart from the shared catalog page/route additions.

## 9. Findings Register

No `CRITICAL`, `HIGH` or `MEDIUM` finding. **No mandatory correction is open.**

| ID | Severity | Title | Evidence | Impact | Action / closure | State |
|---|---|---|---|---|---|---|
| F-01 | LOW (warning) | Edit form and "Editar" button not verified with a real keyboard, screen reader or visual pass; no automated client tests | Browser pane could not draw; behavior driven through the DOM, geometry measured at 375 px (no overflow, 48–50 px targets); the repository has no client test runner | Possible visual or assistive-technology defects | Manual pass in P07 (reach "Editar" and the form with the keyboard, labels and errors announced, contrast), shared with the other catalog screens. | **Open (non-blocking)** |
| F-02 | INFO | One mutant survives: the extra `providerTypeFor` query is redundant | The `UPDATE` is scoped by `provider_id`; sign-up creates account and profile together | One avoidable query per edit (mirrors the publish route) | Optional simplification; not changed. | Closed (informational) |
| F-03 | INFO | The product update takes no provider lock | Documented in the log §4 and §10 | None today; ordering could need a stable price | The ordering stories (US-027+) decide whether to serialize price changes with order placement. | Open (follow-up) |
| F-04 | INFO (warning) | Hosted run pending | Migration 002 not applied to Neon or `vetcare_dev`; tests ran on the project's PostgreSQL 16 | The deployed app needs migration 002 first | Apply 002 before the iteration-2 deployment (P08), then smoke-test a product edit. | Open (carried from the index) |
| F-05 | INFO | The index still shows US-013 as FAIL (AC-033) although US-016 and US-018 now exist | `IMPLEMENTATION_INDEX.md` | Stale status of another HU | Re-validate US-013 (and US-010) in their own P06.4 runs; not changed here. | Open (outside this HU) |
| F-06 | INFO | Removing a product (US-015) is not available; the shared `DELETE` answers `NOT_FOUND` for products | US-012 log | Intended boundary | US-015 adds the product card's "Eliminar", reusing the US-012 dialog. | Open (follow-up) |

Optional recommendation: when US-015 arrives, extract the confirmation dialog of the catalog into a shared component.

## 10. Implementation Log Consistency

The log matches the repository: the files, the route and its SQL, the 15 tests and their intent, the 264/264 result (reproduced), the build, the browser observations, the decision about locking and the documented conflicts were all confirmed. The log is honest about what was not run (baseline, hosted, narrow widths, assistive technology). Differences: the statement that narrow widths were not assessed is superseded by this validation (375 px measured; addendum in the log); the status READY_FOR_VALIDATION is consistent with the evidence. The index row for US-014 was added by P06.3 with `NOT_VALIDATED`; it is updated below.

## 11. Readiness Decision

US-014 can be considered validated with warnings: both required criteria pass with independent evidence, the business rules and dependencies are satisfied, no material defect, security or data-integrity problem was found, and no unapproved architectural deviation exists. Conditions to carry: F-01 (manual keyboard/screen-reader/visual pass in P07), F-04 (migration 002 on Neon before deploying), F-06 (US-015 completes the catalog). Nothing here says the product is ready for release. The next story must be chosen from the backlog and planning artifacts with its own dependency check (US-015 shares this catalog card and the US-012 route and dialog).

## 12. Final Status

**PASS_WITH_WARNINGS**

## 13. Corrective Actions and Retest Guidance

No failed or blocking finding. Follow-ups: F-01 — manual pass of the edit form (evidence: a short written record of the keyboard sequence and the screen-reader announcement, plus screenshots at 375 px and 1280 px); F-04 — after applying migration 002 on Neon, edit a test product through the deployed UI and confirm the new values in the catalog, the public profile and search.
