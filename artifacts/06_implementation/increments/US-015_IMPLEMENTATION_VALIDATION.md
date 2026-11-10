# US-015 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Validation date | 2026-11-10 |
| HU | US-015 — Remove a product (EPIC-004; P2 / SPRINT-002 / RELEASE-002; 2 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` (item `US-015`, PLANNED, `iteration_2_status: COMMITTED`) |
| Implementation log | `artifacts/06_implementation/increments/US-015_IMPLEMENTATION_LOG.md` (sections 1–13 as handed over; section 14 is the post-validation addendum) |
| Requirements | FR-016 |
| Acceptance criteria | AC-037, AC-085 |
| Business rules | BR-030 |
| Edge cases | EDGE-019 |
| Dependencies | DEP-001, DEP-004 |
| Foundation validation | PASS_WITH_WARNINGS (`FOUNDATION_VALIDATION.md`); `ARCHITECTURE_VALIDATION_V4.md` PASS (v4.1) |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **BLOCKED** (no defect found in what exists; the order-related parts of AC-037 and AC-085 cannot be verified because ordering is deferred) |

This is the first validation of US-015; there is no earlier report to preserve.

## 2. Executive Summary

Validated the removal of a product by its provider: the generalization of `removeOffering` (`DELETE /api/provider/offerings/:offeringId`) to products (IF-037), the "Eliminar" action and confirmation dialog on the catalog's product cards, and the way the removal shows up in the places the criteria name.

**What passes, with independent evidence.** The removed product disappears from the provider's catalog, the public profile, text/species/voice search and the assistant; the row stays (logical removal, ADR-020) with no other column changed; the provider's other products, services and appointments are untouched (AC-037, first three clauses). Orders placed before the removal are not touched in any way: in the four statuses, for two owners, they are byte-identical afterwards, none is deleted and each still resolves its removed product (AC-085, data side; EDGE-019). Ownership is airtight (uniform `404`, nothing written). The services path of US-012 still works after the generalization (appointments cancelled, count correct). I re-ran the suite (278 of 278 on PostgreSQL 16), the build and the patch check; ran an adversarial randomized probe against an in-memory oracle of offerings, appointments and orders (8 seeds, 3,424 checks, 0 differences); mutation-tested the new and modified tests (16 mutants, 16 detected); and repeated the browser check with different data (an independent veterinarian, 375 px, a very long product name, a product with an order, the service removal through the same dialog).

**What cannot be verified.** AC-037 ends with "…and it cannot be ordered" and AC-085 is about orders that the owner or the provider "opens". Ordering and the order views (US-027, US-028, US-029) are DEFERRED by the team (TD-29): there is no order code, so no path exists that could accept or reject an order for a removed product (BR-030), and no screen or endpoint through which an order could be opened. Marking these parts as passed would be inferring a pass from absence, which P06.4 forbids; marking the HU `FAIL` would be wrong too, because nothing observable is wrong and there is nothing in this HU to correct. The status is therefore `BLOCKED` by an unavailable dependency, with a documented way out (§11).

**Corrections made during validation:** the "Eliminar" action measured 24 px high at 375 px (below the 44 px control height; carried from US-012) and was fixed with one CSS rule and a guard test (F-02); a stale comment was corrected (F-03). **Environment incident:** test rows were inserted into the developer's `vetcare_dev` by mistake while P06.3 was checking in the browser (F-05); a decision from the developer is pending.

## 3. Validation Scope and Limitations

**Examined.** `removeOffering` and the `DELETE` route (`src/modules/catalog/offerings.js`), the cancellation command it calls for services (`src/modules/scheduling/cancellation.js`, unchanged), `client/src/pages/ProviderCatalog.jsx`, the CSS addition, the two new and the two modified test files, the documentation lines, the unchanged readers (catalog, public profile, search, assistant), and the schema relation between `product_order` and `offering` (`migrations/001`). Criteria: AC-037, AC-085.

**Not verifiable.** The ordering-time rule BR-030 and "it cannot be ordered"; "the owner or the provider opens their orders" (no order screen or endpoint exists); hosted Vercel/Neon behavior (migration 002 pending on Neon and `vetcare_dev`); a real-keyboard, screen-reader and visual pass of the dialog (the browser pane could not draw: behavior driven through the DOM, geometry measured).

**Environment.** The project's PostgreSQL 16.15 test database (Docker `vetcare-postgres`, `TEST_DATABASE_URL`); every database run used a throwaway schema, all dropped (checked: no `vetcare_*`, `us01*` or `probe_*` schema remains). Browser checks ran on an isolated stack (API 3300, Vite 5180, a temporary Vite config that was deleted) so the developer's servers on 3000 and 5173 were not touched; they are still running. The mutated source file was restored and compared byte for byte.

**This is HU-level validation, not final product-wide testing (P07).**

## 4. Acceptance Criteria Validation Matrix

| Criterion | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-037 | A signed-in provider with a published product who removes it: the product no longer appears in their catalog, on their profile or in search results, and it cannot be ordered. | `removeOffering` / `DELETE`; reads filtered with `removed_at IS NULL` (Step 0); "Eliminar" + dialog in `ProviderCatalog.jsx`. | Code inspection; no-database tests (5); PostgreSQL tests through the real registry (7); randomized oracle probe; 16 mutants; two browser passes. | **NOT_VERIFIED** (3 of 4 clauses PASS; the last clause is BLOCKED) | **PASS — "no longer appears in their catalog, profile, search results":** absent from `GET /provider/offerings`, `GET /providers/:id`, `/search` with and without the species filter, `/search/voice` and the assistant's answer; the row stays with `removed_at` set (`= now`) and no other column changed; other products and services stay; probe: catalog, profile and search matched the oracle after every 15 random steps in 8 seeds. Browser (clinic, independent veterinarian): the card disappears with "Producto eliminado."; the owner's search and profile no longer list it. **BLOCKED — "it cannot be ordered":** no ordering code exists; BR-030 has nothing to be applied to; the only thing verifiable is that a removed product is unreachable through every listing an owner could order from. | F-01 |
| AC-085 | A removed product with orders placed before its removal: when the owner or the provider opens their orders, those orders keep their current status (P02-ASM-012). | The removal issues no statement on `product_order`; removal is logical so the order's foreign key stays satisfied. | Same, with order rows inserted directly into `product_order`. | **BLOCKED** (data side PASS) | **PASS — orders keep their status:** orders in `confirmed`, `in_delivery`, `closed` and `cancelled` for two owners plus an order of another product are byte-identical after the removal (status, `status_changed_at`, price, quantity, address); none deleted; each still joins its removed product row; the probe inserted 12–17 orders per seed among random removals and found none changed (full-row comparison); mutants "cancel the product's orders" and "physical delete" are detected. **BLOCKED — "the owner or the provider opens their orders":** US-028 / US-029 are deferred, so there is no screen or endpoint to open orders. | F-01 |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Findings / limitations |
|---|---|---|---|---|
| BR-030 | A removed or not-available product cannot be ordered. | `removed_at` is set on removal; the ordering-time check belongs to US-027 and does not exist; `product_order` has no database-level guard (the foreign key only needs the row to exist). | NOT_VERIFIED | F-01, F-06 |
| EDGE-019 | A provider removes a product that has already been ordered: new orders are not possible; existing orders keep their status. | Removal succeeds with `cancelledAppointments: 0`; existing orders unchanged (see AC-085). "New orders are not possible" is the ordering-time part. | PARTIAL (data side PASS; ordering side NOT_VERIFIED) | F-01 |
| NFR-002 / CR-006 | A provider changes only its own catalog; uniform `NOT_FOUND`. | Another provider (clinic or veterinarian), an owner caller, anonymous, an account id, an unknown id, malformed ids (including `1' OR '1'='1`), an already removed product: one `404 { code: NOT_FOUND }` (401 and 403 for anonymous and foreign Origin); the product and its order are byte-identical after all refusals; mutants M01, M02, M11, M12 detected. | PASS | — |
| CR-029 | User-facing reads exclude removed rows; history does not. | All five reads exclude the product; a removed product cannot be edited either (US-014, test); mutants for the filters were already detected in US-012/US-014. | PASS | — |
| IF-024 / ARCHITECTURE_V4 §8.3 | The removal is serialized by the provider lock. | A removal waits for a held lock (test); two simultaneous removals → one 200, one 404; an edit racing with the removal never resurrects the product; mutants M06 and M16 detected. | PASS | F-04 |
| Services path (US-012) after generalization | Removal still cancels upcoming appointments for services, only. | US-012's 18 tests pass with the two assertions about products removed; the probe cancels appointments for services only (count compared with the oracle); the unit test asserts that a product removal issues no appointment statement; mutants M04/M05/M10 detected; browser: a service with a home appointment removed through the same dialog. | PASS | — |
| DEP-001 | Signed-in provider of the right account type. | Role guard; owner → 404, anonymous → 401; mutant M12 detected. | PASS | — |
| DEP-004 | Depends on published products. | Products are published by US-013 (exercised by every test). | PASS | F-09 |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Full suite | `npm test` (with `TEST_DATABASE_URL`) | PASSED | 278 tests, 278 passed, 0 failed, 0 skipped (US-014 baseline 264 + 12 new US-015 tests + 2 CSS guard tests added by this validation). |
| New tests, no database | `node --env-file-if-exists=.env --test tests/catalog-products-remove.test.js` | PASSED | 5 of 5. |
| New tests, PostgreSQL | `node --env-file-if-exists=.env --test tests/catalog-products-remove.database.test.js` | PASSED | 7 of 7, 0 skipped. |
| Modified US-012 tests | `tests/catalog-services-remove.test.js`, `tests/catalog-services-remove.database.test.js` | PASSED | 18 of 18. The diff was reviewed: only the fake's `SELECT`, the renamed function and the two "products are not removable" assertions changed; no assertion about services was weakened. |
| CSS guard | `node --env-file-if-exists=.env --test tests/catalog-actions-css.test.js` | PASSED | 2 of 2 (source-level; the height itself was measured in the browser). |
| Production build | `npm run build` | PASSED | Vite build succeeded (run three times, last after the final edit). |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Adversarial probe | Randomized script against the real app on a throwaway schema, compared with an in-memory oracle (4 providers, 2 owners, 12 offerings: 8 products and 4 services; 90 steps mixing removals by the owner provider, other providers, an owner account, anonymous callers, malformed and unknown ids, repeated removals, bookings, direct order inserts in random statuses and product edits; offerings, appointments, every order row (full-row snapshot), catalogs, profiles and search compared every 15 steps), seeds 1–8 | PASSED | 3,424 checks, 0 differences; 8–22 appointments and 12–17 orders per seed. It does not cover races (the suite does). |
| Mutation testing | 16 single-line mutants of `removeOffering` and the route (no ownership scope, no active filter, services-only again, always cancelling appointments, never cancelling for services, no provider lock, not marking removed, cancelling the product's orders, physical delete, wrong count, no UUID check, wrong role, wall clock, id not lower-cased, `removed_at = now()`, no row lock); each run against the four removal test files | PASSED | **16 of 16 detected by the suite**; the probe alone detected 9. Two of them are detected only by white-box assertions and are behaviorally equivalent: "always cancel appointments" (a product id matches no appointment) and "no `FOR UPDATE`" (the provider lock already serializes) — F-04. Source restored byte for byte. |
| Browser check 1 (from the log) | Performed during the P06.3 run in this same session on an isolated stack (two clinics, an owner, a product with three orders); not repeated by P06.4, which did check 2 | PASSED (manual, reported) | Dialog (texts, modal, default focus, cancel, Escape, focus return), removal, stale-card 404 message, one-shot 500 with retry, orders and product rows afterwards, owner's search/profile/appointment. |
| Browser check 2 (other data, 375 px) | Independent veterinarian with a service (home appointment), two products (one with a 108-character name, one with an order), an owner with a cat; viewport 375 × 812; DOM-driven | PASSED (manual) | No horizontal overflow; dialog 19–356 px wide with a 44 px-high pair of buttons and the product text, also for the long name; the product is removed with "Producto eliminado." and focus moves to the products heading; the service dialog keeps its own text and removal ("Servicio eliminado.") cancels the appointment and keeps the order untouched (checked in the database). **Found:** "Eliminar" was 24 px high; after the fix it is 44 px (card 290 px, no overflow). |
| Real keyboard, screen reader, visual pass | — | NOT_RUN | F-07. |
| Hosted Vercel / Neon | — | NOT_RUN | F-08. |

Execution is not coverage: the criteria are covered by the matrix in section 4, not by the pass count.

## 7. Architecture, UX, and Integration Conformance

**Architecture — conforms.** `ARCHITECTURE_V4` §8.3 (provider lock → own active offering `FOR UPDATE` → `removed_at` → IF-044 only for services), ADR-020, CR-029, CR-006; `RemovalResult` of `API_SPEC_V2` ("`cancelledAppointments` is 0 for products"). No schema, dependency or contract change. The change in `removeOffering` is a generalization of US-012's function (documented; its tests were adjusted minimally).

**UX — conforms, with the limits of F-07.** Product text per `UX_SPEC_V3` §5 ("¿Eliminar este producto?", "Dejará de aparecer en las búsquedas.", "Sí, eliminar", "No, volver"); "Eliminar" tertiary with `color-error` text; the card is replaced by "Producto eliminado." (inline notice, as in US-011/US-012). The product's name is added in bold in the dialog body (INFO). `UX_SPEC_V3` itself treats AC-085 as "data results or server-side rules", which matches the data-side verification above.

**Integration.** `booking.js`, `search/*`, the appointment lists and the migrations are unchanged; the US-011 / US-012 / US-014 behavior is intact (full suite green).

## 8. Security, Data Integrity, and Regression Findings

- **Authorization:** role guard, session-derived provider id, scoping by `provider_id` in the locking `SELECT`; Origin guard applies. Every non-removable id answers the same `404`.
- **Injection / input:** canonical UUID check before any query; malformed ids never reach the database.
- **Data integrity:** removal is logical, so `product_order`'s foreign key keeps holding and history stays resolvable (the physical-delete mutant fails the tests); one transaction under the provider lock; simultaneous removals cannot double-apply; a concurrent edit cannot resurrect a removed product. No observed defect.
- **Regression:** the 264 earlier tests still pass; no earlier story's behavior changed.
- **Not covered by any mechanism today:** nothing in the database prevents inserting a `product_order` for a removed product (the foreign key only needs the row to exist); the rule has to be applied by the future ordering story (F-06).

## 9. Findings Register

| ID | Severity | Title | Evidence | Impact | Action / closure | State |
|---|---|---|---|---|---|---|
| F-01 | HIGH (dependency blocker, not a defect) | The order-related parts of AC-037 and AC-085 cannot be verified: ordering and the order views are deferred (TD-29) | No order code in `src/`; US-027, US-028, US-029 DEFERRED in the backlog and in `PRIORITIZATION_V3.md`; `UX_SPEC_V3` §"Acceptance criteria not cited by ID" | The HU cannot be called validated; it cannot be called failed either, because nothing observable is wrong | **Mandatory team decision** (see §11): either a Change Request that moves "it cannot be ordered" and the "opens their orders" observation to US-027 / US-029, after which US-015 can be re-validated as PASS_WITH_WARNINGS with the evidence above, or keep the HU open until those stories exist and re-validate then. | **Open (blocking)** |
| F-02 | LOW | "Eliminar" action measured 24 px high at 375 px (below the 44 px control height) | Browser measurement; applies to services since US-012 | Small touch target on phones | One CSS rule (`.catalog-item-actions .link-button { min-height: var(--size-control-height) }`) and a guard test; re-measured 44 px. | **Fixed** |
| F-03 | LOW | Stale comment about "the services heading" after the dialog was generalized | `ProviderCatalog.jsx` | Misleading comment only | Comment corrected. | **Fixed** |
| F-04 | INFO | Two mutants are detected only by white-box assertions | "Always cancel" and "no row `FOR UPDATE`" are behaviorally equivalent | None | None. | Closed (informational) |
| F-05 | MEDIUM (environment, open) | Test rows were inserted into the developer's `vetcare_dev` during P06.3's first browser attempt | The developer's own `dev:api` held port 3000; the seed script addressed it. Rows: accounts `clinic@`, `other@`, `owner@us015.test` with sessions, three products, one service, one appointment. Logged in the implementation log §1 | Pollutes the development database; no production or test database affected | The developer decides whether to keep or remove the rows (identifiable by the `@us015.test` domain). P06.3 and P06.4 did not touch that database again. Lesson applied: later checks used ports 3300/5180 and a throwaway schema. | **Open (needs the developer's decision)** |
| F-06 | INFO | No database-level guard against ordering a removed product | `product_order` foreign key only requires the row | BR-030 depends entirely on US-027 | US-027's handoff must require: reject removed and not-available products under the provider lock, with a test. | Open (follow-up) |
| F-07 | LOW (warning) | Dialog not verified with a real keyboard, screen reader or visual pass; no automated client tests | Browser pane could not draw; behavior driven through the DOM, geometry measured at 375 px | Possible assistive-technology or visual defects | Manual pass in P07, shared with US-011 / US-012 / US-014. | Open (non-blocking) |
| F-08 | INFO (warning) | Hosted run pending | Migration 002 not applied to Neon or `vetcare_dev` | The deployed app needs migration 002 first | Apply 002 before the iteration-2 deployment (P08); smoke-test a product removal. | Open (carried from the index) |
| F-09 | INFO | The index still shows US-013 (and US-010) as FAIL although US-016 and US-018 now exist | `IMPLEMENTATION_INDEX.md` | Stale status of other HUs | Re-validate them in their own P06.4 runs; not changed here. | Open (outside this HU) |

Optional recommendation: extract the confirmation dialog of the catalog into a shared component when US-022 needs it.

## 10. Implementation Log Consistency

The log matches the repository: the files, the generalization of `removeOffering` and its SQL, the 12 new tests and the two modified US-012 test files (reviewed line by line), the 276/276 result (reproduced), the build, the browser observations, the incident and the documented conflicts were all confirmed. The log is candid about what was not delivered (both criteria are `PARTIALLY_IMPLEMENTED`), about what was not run (baseline, hosted, narrow widths, assistive technology) and about the incident. Differences: (1) the statement that narrow widths were not assessed is superseded (375 px measured; the 24 px target found and fixed); (2) section 5 should list the CSS rule, the guard test and the comment fix (addendum added); (3) the status READY_WITH_LIMITATIONS is consistent with the evidence. The index row for US-015 was added by P06.3 with `NOT_VALIDATED`; it is updated below.

## 11. Readiness Decision

US-015 is **not ready to be considered validated** and is **not failed**. Everything that can be exercised today passes with strong evidence (removal and visibility; orders untouched at the data level; ownership; concurrency; the services path; the UI), but two required criteria contain parts that depend on a feature the team deferred, so a reliable pass decision on those parts is impossible (F-01).

**Ways to resolve (a team decision, not an engineering one):**
1. **Re-scope by Change Request** (SYSTEM_PROMPT §11): move "…and it cannot be ordered" (AC-037), BR-030 and "the owner or the provider opens their orders" (AC-085) to US-027 / US-029, whose handoffs must then verify them (F-06). With that approval, US-015 can be re-validated without new code and is expected to be `PASS_WITH_WARNINGS` (open warnings: F-07, F-08, the re-scoped criteria). The criteria in the backlog must not be edited silently.
2. **Keep the criteria and the HU open** until ordering is built, then re-run P06.4 for US-015.

Also pending: the developer's decision on the rows in `vetcare_dev` (F-05). Nothing here says the product is ready for release. The next story must be chosen from the backlog and planning artifacts with its own dependency check.

## 12. Final Status

**BLOCKED**

## 13. Corrective Actions and Retest Guidance

- **F-01 (blocking):** obtain the team's decision (option 1 or 2 above). If option 1: record the Change Request, update the affected backlog/requirements artifacts through the normal process, and repeat P06.4 for US-015 with the evidence of this report (no code change expected). If option 2: re-run P06.4 after US-027 and US-029 exist, verifying that an order for a removed product is rejected (BR-030) and that the owner's and the provider's order lists show the pre-existing orders with their status.
- **F-05:** the developer decides what to do with the `@us015.test` rows in `vetcare_dev`.
- **F-07, F-08:** as in the register (manual pass in P07; apply migration 002 to Neon before deploying).

## 14. Addendum (2026-11-10): F-05 resolved

The developer asked for the test rows in `vetcare_dev` to be deleted. A read-only inspection first confirmed that they were exactly the rows created by the P06.3 seed (accounts `clinic@us015.test`, `other@us015.test`, `owner@us015.test`, created that day; no orders). They were then deleted in one transaction scoped to those three account ids and committed only because every count matched the inspection: 3 accounts, 3 sessions, 2 provider profiles, 7 working-hours rows, 4 offerings (3 products and 1 service), 1 appointment, 1 pet, 0 orders. Totals in the database went from 8 accounts / 8 offerings / 2 appointments to 5 / 4 / 1, and a second read-only query found no `@us015.test` account or dependent row left. No other row was touched. **F-05 is closed.** The final status stays **BLOCKED** because of F-01 only.

## 15. Addendum (2026-11-10): browser check repeated on the standard setup

The two browser passes of sections 6 ran on an isolated stack (ports 3300 and 5180, a temporary Vite config) because the developer's own servers occupied 3000 and 5173. Once those were closed, the check was repeated with the repository's real commands and configuration: `npm run dev:api` (port 3000) and `npm run dev:client` (Vite on 5173, its stock `vite.config.js`), against a throwaway schema of the test database (the API's connections were confirmed to go to `vetcare_test`, not `vetcare_dev`, before seeding). The same scenarios gave the same results:

- **Clinic, desktop:** dialog texts, modal, default focus on "No, volver", cancel and Escape returning focus, removal with "Producto eliminado." and focus on the products heading, a stale card (removed elsewhere) with "Ese producto ya no existe. Actualizamos tu catálogo.", a one-shot 500 with the error inside the dialog and a successful retry, and the service removal through the same dialog (its appointment became "Cancelada").
- **Owner:** search and public profile no longer list the removed products or the removed service; the appointment shows "Cancelada".
- **Database:** the three orders of the removed product kept their statuses (`confirmed`, `in_delivery`, `closed`), the offerings were marked removed, nothing was deleted.
- **Independent veterinarian at 375 px:** no horizontal overflow; "Editar" 50 px and "Eliminar" 44 px high; dialog 19–356 px with 44 px buttons (also for the 108-character name); the product edit form fits (right edge 334 px).
- **Dev API stability:** `npm run dev:api` stayed up for the whole run (the process was not restarted or exited).

The processes were stopped afterwards, the schema dropped, and a read-only query of `vetcare_dev` showed 5 accounts, 4 offerings, 1 appointment and no `@us015` row. The final status is unchanged: **BLOCKED** by F-01 only.

## 16. Addendum (2026-11-10): superseded by the V2 report

The team approved option 1 of §11 (a change request). `artifacts/03_planning/CHANGE_REQUEST_CR-P06-001.md` moved the order-related clauses of AC-037 and AC-085 to the ordering stories, and US-015 was revalidated against the amended criteria in `US-015_IMPLEMENTATION_VALIDATION_V2.md`, which concludes **PASS_WITH_WARNINGS**. This report (V1) is kept unchanged as history: against the **original** criteria the result was, and remains, `BLOCKED` by F-01; the sections above are not edited.
