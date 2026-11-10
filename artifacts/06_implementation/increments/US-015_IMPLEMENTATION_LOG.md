# US-015 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-11-10 |
| HU | US-015 — Remove a product |
| Epic | EPIC-004 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` (item `US-015`, `iteration_2_status: COMMITTED`) |
| Backlog status | PLANNED; scope MVP_CORE; P2 / SPRINT-002 / RELEASE-002; 2 story points; developers Casanova, Sebas |
| Requirements | FR-016 |
| Acceptance criteria | AC-037, AC-085 |
| Business rules | BR-030 |
| Edge cases | EDGE-019 |
| Backlog dependencies | DEP-001, DEP-004 |
| Architecture / contracts | `ARCHITECTURE_V4.md` (§6.4 COMP-007, §7.1 IF-037, §8.3, ADR-020, CR-029); `ARCHITECTURE_VALIDATION_V4.md`; `API_SPEC_V2.yaml` (`DELETE /api/provider/offerings/{offeringId}`, `removeOffering`, `RemovalResult`); `DATA_MODEL_V1.md` (`product_order` and its foreign key to `offering`); migrations `001` and `002` (only read) |
| UX | `UX_SPEC_V3.md` (COMP-UX-007 catalog variant, COMP-UX-022 and its "Remove product (US-015)" text, SCR-UX-011, FLOW-UX-027, §"Acceptance criteria not cited by ID", which classes AC-085 as a data result); `UX_SPEC_V2.md`; `UX_SPEC_VALIDATION_V3.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Related stories | US-012 (same route and dialog for services; its code and tests were adjusted, see §5); US-014 (product edit; already refuses removed products); US-016/US-018 (search and profile: where the removal shows); **US-027 to US-033 (product ordering, order views, stock) are DEFERRED by the team (TD-29)** and are not part of this increment |
| Implementation status | **READY_WITH_LIMITATIONS** |

**Input conflicts and gaps recorded (not silently reconciled).**

1. `P06.3_US_implementation.md` §2 lists iteration-1 artifacts and `prompts/system/SYSTEM_PROMPT.md`; the request names `product_backlog_priori_v3.json` and the repository is at iteration 2. The repository state takes precedence (SYSTEM_PROMPT §3): the iteration-2 artifacts were used. `SYSTEM_PROMPT.md` lives at `prompts/system/`.
2. **Ordering does not exist.** AC-037 ends with "…and it cannot be ordered" and AC-085 speaks of orders placed before the removal and of the owner or the provider "opening their orders". The stories that create orders and the order views (US-027, US-028, US-029) are DEFERRED (`PRIORITIZATION_V3.md`, TD-29). The repository has no order code (only the empty `product_order` table of migration 001 and the status enum). So these parts of the criteria cannot be exercised end to end in this increment. `UX_SPEC_V3.md` lists AC-085 among the criteria that "describe data results or server-side rules", and BR-030 ("a removed or not-available product cannot be ordered") is an ordering-time rule that US-027 must apply. This is a gap between the criteria and the delivered scope, **not a decision made here**: it is reported as PARTIALLY_IMPLEMENTED in §6 and left to P06.4 and the team to classify.
3. `API_SPEC_V2` defines one `DELETE` for services and products. The US-012 increment answered `NOT_FOUND` for products by design; this increment removes that restriction. Two US-012 test files encoded that boundary and were updated (§5).
4. The `PRIORITIZATION_V3` dependency table has no extra planning dependency for US-015 (DEP-012 concerns US-007 and US-012 only).
5. The index still shows US-013 (DEP-004's story) as FAIL on AC-033, whose blockers (US-016, US-018) now exist and are validated; it was not changed here.
6. The working tree was clean at the start (US-014 committed as `e756479`), so every change below belongs to US-015.

**Incident to report (environment, not code).** The developer's own `npm run dev:api` (and `dev:client`) were running on ports 3000 and 5173 while this increment was being checked in the browser. The first attempt of the browser seed script addressed port 3000, so it **created test data in the developer's development database `vetcare_dev`** through the developer's server: three accounts (`clinic@us015.test`, `other@us015.test`, `owner@us015.test`) with their sessions, three products, one service and one appointment. Nothing was deleted or modified there beyond that insertion, and the data was not cleaned up because that database is not mine to modify without permission. The check was then repeated on an isolated stack (API on 3300, Vite on 5180, a throwaway schema of the test database), and the developer's servers were not stopped or modified. **A decision is needed from the developer:** keep the rows or let them be removed (the email domain `@us015.test` identifies them).

## 2. Story Summary and Scope

**In scope.** A signed-in provider removes one of its own published products. The product leaves the provider's catalog, the public profile and every search (text, species filter, voice, assistant) (AC-037). Orders already placed keep their status: the removal is logical (`removed_at`), writes nothing to `product_order`, and the order rows keep resolving their product (AC-085, EDGE-019). Delivered as the vertical slice: `DELETE /api/provider/offerings/:offeringId` now also removes products (IF-037), an "Eliminar" action on each product card (SCR-UX-011) and the confirmation dialog (COMP-UX-022) with the product text of UX_SPEC_V3 §5, then the card disappears and "Producto eliminado." is shown.

**Excluded.** Ordering and anything that creates, lists or changes orders (US-027 to US-033); the rule BR-030 as enforced at ordering time (US-027); the availability switch (US-033); any schema, dependency or contract change.

**Applicable criteria and rules.** AC-037, AC-085; BR-030; EDGE-019; NFR-002 and CR-006 (own catalog only, uniform `NOT_FOUND`); CR-029 (user-facing reads exclude removed rows, history does not); ADR-020 (logical removal).

## 3. Readiness Assessment

Implementation could proceed for the removal itself. The backlog entry is PLANNED with no open questions. DEP-001 (US-003) and DEP-004 (published products, US-013) are satisfied by implemented code; the removal machinery (`removed_at`, the read filters, the provider lock, the confirmation dialog, the route) came with Step 0, US-012 and US-014. `ARCHITECTURE_V4` §6.4 and §8.3 specify the operation ("take the provider lock, set `removed_at`, and for a service call IF-044"), and `API_SPEC_V2` defines the response ("`cancelledAppointments` is 0 for products"). Foundation validation is PASS_WITH_WARNINGS.

The order-related parts of the criteria cannot be delivered or observed because ordering is deferred (conflict 2). Following SYSTEM_PROMPT §7 and §10, no substitute behavior was invented: no order endpoint, no trigger or constraint on `product_order` (that would be a schema change beyond the approved design), no placeholder screen. What can be guaranteed today was implemented and tested: the removal never writes to `product_order`, and logical removal keeps the foreign key from orders to the product satisfied.

**Environment.** The project's test database (Docker `vetcare-postgres`, PostgreSQL 16.15, `TEST_DATABASE_URL`) was running. The development database was touched by mistake (see the incident above).

## 4. Technical Implementation Plan

Initial plan, all steps completed:

1. Generalize the service-only `removeService` of US-012 into `removeOffering`: one transaction, provider lock (IF-024), `SELECT id, kind … FOR UPDATE` of the provider's own active offering, set `removed_at`, and call the appointment cancellation command (IF-044) only when the kind is `service`; products return `cancelledAppointments: 0` and issue no other statement.
2. Keep the route and its guards unchanged; products stop answering `NOT_FOUND`.
3. Client: "Eliminar" on product cards; the dialog and the removal handler take the offering's kind (texts per UX_SPEC_V3 §5: product body "Dejará de aparecer en las búsquedas."); notices "Producto eliminado." / failure and already-removed messages per kind; focus returns to the opener or to the heading of the list the card belonged to.
4. Tests: request handling without a database; PostgreSQL tests through the real registry covering visibility everywhere, orders kept unchanged, appointments untouched, ownership, the lock and concurrency; update the two US-012 test files whose assertions encoded "products are not removable".
5. Run the focused and full suites, the build and a browser check; document.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/catalog/offerings.js` | `removeService` becomes `removeOffering(db, { providerId, offeringId, now })`: the locking `SELECT` no longer filters on `kind = 'service'` and returns the kind; the cancellation command runs only for services. The route `DELETE /provider/offerings/:offeringId` calls it. Publishing, listing and the two update routes are unchanged. | US-015; AC-037, AC-085; BR-030; EDGE-019; NFR-002; IF-037, IF-024; CR-006, CR-029 |
| `client/src/pages/ProviderCatalog.jsx` | "Eliminar" button on product cards (accessible name "Eliminar: [name]"); dialog texts, success notice, failure and already-removed messages and focus fallback chosen by the offering's kind; `openRemoval` shared by both lists; the products heading is focusable like the services one. | SCR-UX-011; COMP-UX-007, COMP-UX-022; FLOW-UX-027; AC-037 |
| `docs/API.md`, `docs/USER_GUIDE.md` | The `DELETE` row and the guide sentence now cover products and state that existing orders do not change. | documentation |
| `tests/catalog-services-remove.test.js`, `tests/catalog-services-remove.database.test.js` (US-012 tests, **modified**) | The fake database follows the new `SELECT id, kind …`; the function was renamed in the import and the rollback test; the two assertions that a product answers `NOT_FOUND` were removed (that was the US-012 boundary; products are now covered by the US-015 tests). No assertion about services was weakened. | shared-test change, justified by the contract change in conflict 3 |
| `tests/catalog-products-remove.test.js` (new) | 5 tests without a database. | AC-037; NFR-002; IF-037 |
| `tests/catalog-products-remove.database.test.js` (new) | 7 PostgreSQL tests through the real registry, including order rows inserted directly into `product_order`. | AC-037, AC-085; EDGE-019 |

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Files / evidence |
|---|---|---|---|
| AC-037 | A signed-in provider with a published product who removes it: the product no longer appears in their catalog, on their profile or in search results, and it cannot be ordered. | **PARTIALLY_IMPLEMENTED** | Implemented: `removeOffering` / `DELETE`; "Eliminar" + dialog. PostgreSQL test: after the removal the product is absent from `GET /provider/offerings`, from the public profile, from `/search` with and without the species filter, from the voice search and from the assistant's answer; the row stays with `removed_at` set and no other column changed; the provider's other products and services are untouched. Browser: the card disappears with "Producto eliminado."; the owner's search and the public profile list no longer show it. **Not delivered: "it cannot be ordered"** — there is no ordering feature to apply the rule to (conflict 2); nothing in the repository can create an order. The rule BR-030 must be applied by US-027, which will have to read `removed_at`. |
| AC-085 | A removed product with orders placed before its removal: when the owner or the provider opens their orders, those orders keep their current status (P02-ASM-012). | **PARTIALLY_IMPLEMENTED** | Data side implemented and tested: order rows in the four statuses (`confirmed`, `in_delivery`, `closed`, `cancelled`) for two owners, plus an order of another product, are byte-identical after the removal (status, timestamps, price, quantity, address); no order is deleted; every order still joins its removed product row (the foreign key holds because removal is logical). **Not delivered: the observation channel** — no screen or endpoint lists orders (US-028, US-029 deferred), so "opens their orders" cannot be exercised. |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-030 | The "removed" half is represented by `removed_at` on the product; the ordering-time check does not exist because ordering does not (US-027, deferred). Not verifiable here. |
| EDGE-019 | A provider removes a product that has already been ordered: removal succeeds (`cancelledAppointments: 0`), the orders are unchanged (test). "New orders are not possible" is the ordering-time part, see BR-030. |
| NFR-002 / CR-006 | The provider id comes only from the session; the locking `SELECT` and the guard are scoped by `provider_id`. Another provider's product, an unknown id, an account id, a malformed id and an already removed product all answer the same `404 NOT_FOUND`; owners get `404`, anonymous `401`, foreign Origin `403`; nothing is written (full-row snapshot of the product and its order). |
| CR-029 | No new filter was needed; the new tests are the evidence that no user-facing read of products was missed. A removed product cannot be edited either (US-014's `UPDATE` re-checks `removed_at`; test). |
| IF-024 | The removal takes the provider lock first (shared with bookings, hours saves, US-011 edits and US-012 removals); it waits for a transaction holding it (test). Two simultaneous removals give one `200` and one `404`; an edit racing with the removal never resurrects the product (test). |
| Appointments | A product removal issues no appointment statement (asserted in the no-database test) and leaves appointments and services of the provider untouched (test). |
| DEP-001 / DEP-004 | Provider-only guard reused; the target must be an active offering of the provider. |

## 8. Tests and Verification Results

Tests added: `tests/catalog-products-remove.test.js` (5) and `tests/catalog-products-remove.database.test.js` (7): 12 new tests; 2 existing files modified (net count unchanged). Executed:

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Baseline | Not re-run before the change in this execution | NOT_RUN | The US-014 validation records 264/264 on the same database and the tree was clean at the start. The final count below equals 264 + 12. |
| Modified US-012 tests | `node --env-file-if-exists=.env --test tests/catalog-services-remove.test.js tests/catalog-services-remove.database.test.js` | PASSED | 18 of 18 after the adjustments. |
| Focused, no database | `node --env-file-if-exists=.env --test tests/catalog-products-remove.test.js` | PASSED | 5 of 5. |
| Focused, PostgreSQL | `node --env-file-if-exists=.env --test tests/catalog-products-remove.database.test.js` | PASSED | 7 of 7, 0 skipped, against `vetcare-postgres` in a throwaway schema. They passed on the first run; P06.4 should mutation-test them. |
| Full regression | `npm test` | PASSED | 276 tests, 276 passed, 0 failed, 0 skipped. |
| Production build | `npm run build` | PASSED | Vite build succeeded. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Browser check | API on port 3300 and Vite on 5180 (a temporary Vite config, deleted afterwards) over a throwaway schema; a clinic with two products (one with three orders inserted directly), a service with an appointment, another clinic, an owner; sign-in through the real forms; DOM-driven interaction (the pane could not draw) | PASSED (manual) | Product cards have "Editar" and "Eliminar"; the dialog opens modal with the product text and focus on "No, volver"; "No, volver" and Escape close it and return focus; "Sí, eliminar" removes the card with "Producto eliminado." and moves focus to the products heading; a stale card (product removed elsewhere) shows "Ese producto ya no existe. Actualizamos tu catálogo." and reloads; a one-shot 500 shows the error inside the dialog and the retry succeeds; afterwards the three orders still have their statuses and the product row is marked removed; the owner's search and the public profile no longer list the products and the owner's appointment is still "Programada". Visual appearance and narrow widths were not assessed. |
| Hosted Vercel / Neon behavior | — | NOT_RUN | Migration 002 still has to be applied to Neon before the iteration-2 deployment. |

## 9. Repository Changes

Created: `tests/catalog-products-remove.test.js`, `tests/catalog-products-remove.database.test.js`, and this log. Modified: `src/modules/catalog/offerings.js`, `client/src/pages/ProviderCatalog.jsx`, `docs/API.md`, `docs/USER_GUIDE.md`, `tests/catalog-services-remove.test.js`, `tests/catalog-services-remove.database.test.js`, `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. Deleted: none (the temporary `client/vite.us015-temp.config.js` was created and removed). No migration, dependency manifest, lockfile, `.env`, API contract or earlier validation report was changed. No commit was made, as requested. The throwaway schema was dropped and the processes started for the check were stopped; the developer's servers were left running. **Rows were inserted into `vetcare_dev` by mistake (see §1).**

## 10. Architecture Conformance and Deviations

Conforms to `ARCHITECTURE_V4` §8.3 (provider lock → own active offering `FOR UPDATE` → `removed_at` → IF-044 only for services → commit), ADR-020 and CR-029, and to the `RemovalResult` of `API_SPEC_V2` ("`cancelledAppointments` is 0 for products"). No schema, dependency or contract change. **Documented implementation detail:** the removal of a product runs under the provider lock although nothing depends on it today; it follows the architecture's single description of the operation and gives the future ordering stories a serialization point. No formal architectural review is required.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Type | Impact / next action |
|---|---|---|
| "It cannot be ordered" (AC-037) and "opens their orders" (AC-085) cannot be delivered or observed while ordering is deferred. | Scope gap (TD-29) | The team must decide how P06.4 should classify these parts, and US-027/US-028/US-029 must re-validate them when built. |
| BR-030 must be enforced when an order is placed (reject a removed product, read under the provider lock). | Follow-up for US-027 | Record in that story's handoff. |
| `product_order` has no database-level guard against ordering a removed product (the foreign key only needs the row to exist). | Technical observation | A guard would be a schema change; left to US-027's design. |
| Test data was inserted into the developer's `vetcare_dev` by mistake (three `@us015.test` accounts and their offerings/appointment). | Incident | Needs the developer's decision (keep or remove). |
| No client tests; keyboard, screen-reader and visual behavior of the product dialog were not verified (same component as US-012). | Unverified behavior | P06.4 and P07. |
| Hosted runtime: migration 002 on Neon pending. | External limitation | Required before deploying iteration 2. |

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** The removal of a product is implemented and verified (catalog, profile, search, assistant; orders untouched), but the order-related parts of both acceptance criteria cannot be delivered while ordering is deferred, so both criteria are PARTIALLY_IMPLEMENTED. The limitations are documented and do not make validation meaningless: they define exactly what P06.4 can and cannot verify. This status is not a validation result.

## 13. Handoff to P06.4

Validate **US-015** from `artifacts/03_planning/product_backlog_priori_v3.json`. Inspect `removeOffering` and the `DELETE` route in `src/modules/catalog/offerings.js`, `client/src/pages/ProviderCatalog.jsx`, the two new test files and the two modified US-012 test files. Independently run `npm test` with `TEST_DATABASE_URL`, `npm run build` and `git diff --check`. Specifically verify:
(1) every place the removal must show up (catalog, public profile, search with and without the species filter, voice search, assistant) excludes the product;
(2) orders: no statement of the removal touches `product_order`, order rows are unchanged and still resolve the product, nothing is deleted;
(3) ownership: no way to remove another provider's offering or an arbitrary id, and no write on refusal; services still work as in US-012 (including the cancellation of appointments) after the generalization;
(4) the transaction, the provider lock, simultaneous removals and the race with an edit;
(5) the dialog for products: texts, "No, volver" default, Escape, busy and error states, focus return, the 404 path;
(6) **how to classify the order-related parts of AC-037 and AC-085** given that ordering and the order views are deferred (conflict 2), without inventing a pass for behavior that cannot be exercised;
(7) that the tests fail when the code is broken (mutation checks on the kind-conditional cancellation, the ownership and active scopes, the lock, the response);
(8) the incident in §1 and the state of the developer's database (read-only, only if the developer agrees).

## 14. Addendum (2026-11-10, after P06.4)

Sections 1–13 describe the increment as handed to validation and are kept unchanged. P06.4 changed two small things in the code and recorded the result (details in `US-015_IMPLEMENTATION_VALIDATION.md`, status **BLOCKED**):

- **Added to section 5.** `client/src/design-system/global.css`: one rule, `.catalog-item-actions .link-button { min-height: var(--size-control-height) }`, because the "Eliminar" action measured 24 px high at 375 px (44 px after the fix; applies to services since US-012). `tests/catalog-actions-css.test.js` (2 source-level tests) guards it. `ProviderCatalog.jsx`: a comment about the focus fallback was updated. The suite is now **278 of 278** (276 + 2).
- **Narrow width verified.** Section 11's statement that narrow widths were not assessed no longer applies: the catalog and the dialog were measured at 375 px with an independent veterinarian's data (a 108-character product name, an order, a service with a home appointment); no horizontal overflow.
- **Evidence beyond the tests.** An oracle probe over offerings, appointments and every order row (8 seeds, 3,424 checks, no differences) and 16 mutants (16 detected by the suite).
- **Status.** Both acceptance criteria keep the parts that cannot be exercised while ordering is deferred (F-01); the validation concluded `BLOCKED` by that dependency, not `FAIL`, and proposes a Change Request or re-validation after US-027 / US-029 as the way out. The incident in section 1 (rows in `vetcare_dev`) is still waiting for the developer's decision (F-05).

## 15. Addendum (2026-11-10): incident resolved

The test rows that section 1 reports as inserted into `vetcare_dev` were deleted at the developer's request, after a read-only inspection and in one transaction scoped to the three `@us015.test` accounts (counts and totals in `US-015_IMPLEMENTATION_VALIDATION.md` section 14). Nothing from that incident remains in the development database.

## 16. Addendum (2026-11-10): criteria amended by CR-P06-001

Sections 1–15 describe the increment as handed to validation and are kept unchanged. After the first validation (BLOCKED) the team chose to move the order-related clauses to the ordering stories through `artifacts/03_planning/CHANGE_REQUEST_CR-P06-001.md`. Against the amended criteria (AC-037 without "and it cannot be ordered"; AC-085 stated as "the provider removes the product → its earlier orders are not changed and keep their status") the two criteria in section 6 are **IMPLEMENTED** as far as this HU is concerned: the code was not changed. The clauses moved to AC-089 (US-027), AC-072 (US-028) and AC-090 (US-029) remain unimplemented there and are not claimed by this log. Section 11's first row ("cannot be delivered while ordering is deferred") is resolved by the change request. The second validation is `US-015_IMPLEMENTATION_VALIDATION_V2.md` (PASS_WITH_WARNINGS). No commit was made.
