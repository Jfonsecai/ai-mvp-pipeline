# US-014 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-11-10 |
| HU | US-014 — Update a product |
| Epic | EPIC-004 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` (item `US-014`, `iteration_2_status: COMMITTED`) |
| Backlog status | PLANNED; scope MVP_CORE; P2 / SPRINT-002 / RELEASE-002; 1 story point; developers Casanova, Sebas |
| Requirements | FR-015, NFR-002 |
| Acceptance criteria | AC-035, AC-036 |
| Business rules | BR-006 (also BR-032 for the species values) |
| Edge cases | none defined for this HU |
| Backlog dependencies | DEP-001, DEP-004 |
| Architecture / contracts | `ARCHITECTURE_V4.md` (§6.4 COMP-007, §7.1 IF-036, CR-029); `ARCHITECTURE_VALIDATION_V4.md`; `API_SPEC_V2.yaml` (`PUT /api/provider/products/{offeringId}`, `updateProduct`, `PublishProductRequest`, `CatalogProduct`); `DATA_MODEL_V1.md`; migration `002_iteration2_removal.sql` (only read: `removed_at`) |
| UX | `UX_SPEC_V3.md` (SCR-UX-013 edit mode, SCR-UX-011 catalog, COMP-UX-007 catalog variant, FLOW-UX-027, MSG-SAVED); `UX_SPEC_V2.md` for the unchanged parts; `UX_SPEC_VALIDATION_V3.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Related stories | US-013 (publishing a product: the form and validators this story reuses); US-011 (the same operation for services, `IF-036`); US-016/US-018 (search and public profile: where the edit must show up); US-033 (availability switch: not changed here); **US-015 (remove a product) is not part of this increment** |
| Implementation status | **READY_FOR_VALIDATION** |

**Input conflicts recorded (not silently reconciled).**

1. `P06.3_US_implementation.md` §2 lists iteration-1 artifacts (`PRIORITIZATION_V2`, `product_backlog_priori_v2.json`, `REQUIREMENTS_v3`, `ARCHITECTURE_V2`, `UX_SPEC_V2`…) and `prompts/system/SYSTEM_PROMPT.md`; the request names `product_backlog_priori_v3.json` and the repository is at iteration 2. The repository state takes precedence (SYSTEM_PROMPT §3): the iteration-2 artifacts were used, the earlier ones for unchanged parts. `SYSTEM_PROMPT.md` lives at `prompts/system/`, not at the repository root named in the request. US-014 is identical in the V2 and V3 backlog except for the added iteration-2 fields.
2. `PRIORITIZATION_V3.md` lists for US-014 the dependency DEP-004 only (same as the backlog); no extra planning dependency this time (unlike US-012 / DEP-012).
3. The index records US-013 (DEP-004's story) as FAIL on AC-033 (the product was not shown on a profile or in search because US-018/US-016/US-017 did not exist). Those stories now exist and are validated, so DEP-004 is satisfied functionally; the index row of US-013 was not changed here (it needs its own P06.4 run).
4. `docs/API.md` / `docs/USER_GUIDE.md` (P09 outputs) do not list every iteration-2 endpoint; only the lines for this story were added.
5. The working tree was clean at the start (US-011 and US-012 are committed: `f19dbbe`, `57b1108`), so every change below belongs to US-014.

## 2. Story Summary and Scope

**In scope.** A signed-in provider changes the details of one of its own published products (name, price, species) and saves. Delivered as the vertical slice: `PUT /api/provider/products/:offeringId` (IF-036), an "Editar" action on each product card of the catalog (SCR-UX-011) and the edit mode of the product form (SCR-UX-013: "Editar producto", pre-filled, "Guardar cambios", "Cambios guardados." on return to the catalog). Because the public profile, search and the assistant read the offering table live, the new details appear there without further code (AC-035).

**Excluded.** Removing a product (US-015: the "Eliminar" action, its dialog text and the `DELETE` of products); the availability switch (US-033; the update never reads or writes `available`); ordering (US-027+); any schema, dependency or contract change.

**Applicable criteria and rules.** AC-035, AC-036; BR-006 (exactly one species) and BR-032 (dog or cat); NFR-002 (a provider changes only its own catalog); CR-006 (uniform `NOT_FOUND`); CR-029 (removed offerings are not editable).

## 3. Readiness Assessment

Implementation could proceed. The backlog entry is PLANNED with no open questions. DEP-001 (provider session and guard, US-003) and DEP-004 (published products, US-013) are satisfied by implemented code. `ARCHITECTURE_V4` §6.4 and §7.1 specify the operation ("`PUT /provider/products/:offeringId` reuses the publish validators and updates own active offerings of that kind"), `API_SPEC_V2` defines request, responses and "availability is not changed here", and migration 002 already added `offering.removed_at`; no contract or schema change was needed. Foundation validation is PASS_WITH_WARNINGS. No blocker.

**Environment.** The project's test database (Docker `vetcare-postgres`, PostgreSQL 16.15, `TEST_DATABASE_URL`) was running. The development database `vetcare_dev` was not used (it still lacks migration 002 — see the index). The browser check used a throwaway schema inside the test database, dropped afterwards.

## 4. Technical Implementation Plan

Initial plan, all steps completed:

1. Reuse `validatePublishProduct` unchanged, so the rules cannot drift from publishing.
2. Add `PUT /provider/products/:offeringId` in COMP-007: owner-only role guard, canonical-UUID check, validation, one conditional `UPDATE … WHERE id AND provider_id AND kind = 'product' AND removed_at IS NULL … RETURNING`; no row means `NOT_FOUND` (AC-036, CR-006).
3. Decide on locking: a single conditional UPDATE is atomic and row-locked, and nothing booking-like depends on a product's details today, so no transaction and no provider lock (unlike the service update of US-011, which serializes with bookings). Ordering (US-027+) will decide whether it needs one.
4. Client: "Editar" on product cards; edit mode of `PublishProduct` (pre-filled from the provider's catalog, `PUT`, "Cambios guardados.", not-found handling); route `/provider/products/:offeringId/edit`.
5. Tests: request handling without a database; PostgreSQL tests through the real registry covering visibility everywhere, ownership, validation, untouched columns (including availability), races.
6. Run the focused and full suites, the build and a browser check; document.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/catalog/offerings.js` | New route `PUT /provider/products/:offeringId` (provider-only; UUID check; `validatePublishProduct`; one conditional `UPDATE` that scopes by provider, kind `product` and `removed_at IS NULL`; response `CatalogProduct`, availability returned as stored). Publishing, listing, the service update and the removal are unchanged. | US-014; AC-035, AC-036; BR-006, BR-032; NFR-002; IF-036; CR-006, CR-029 |
| `client/src/pages/PublishProduct.jsx` | Edit mode when the route has `:offeringId`: loads the provider's catalog, pre-fills the form (name, price, species), title "Editar producto", button "Guardar cambios", `PUT`, notice "Cambios guardados.", unknown or foreign product → the existing not-found screen, load-failure retry and save-failure messages. Publishing behavior unchanged. | SCR-UX-013 edit mode; AC-035, AC-036 |
| `client/src/pages/ProviderCatalog.jsx` | "Editar" action on each product card (accessible name "Editar: [name]"). No "Eliminar" on products (US-015). | COMP-UX-007 catalog variant; SCR-UX-011 |
| `client/src/App.jsx` | Provider-only route `/provider/products/:offeringId/edit`. | SCR-UX-013 |
| `docs/API.md`, `docs/USER_GUIDE.md` | One endpoint row and one sentence for the edit action. | documentation |
| `tests/catalog-products-update.test.js` (new) | 8 tests without a database. | AC-035, AC-036; BR-006 |
| `tests/catalog-products-update.database.test.js` (new) | 7 PostgreSQL tests through the real registry. | AC-035, AC-036; BR-006 |

No shared code outside the catalog and the two client pages was touched (`booking.js`, `search/*`, the migrations and the contract are unchanged).

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Files / evidence |
|---|---|---|---|
| AC-035 | A signed-in provider with a published product who changes its details and saves: the updated details appear in their catalog, on their profile and in search results. | IMPLEMENTED | `PUT` returns the saved `CatalogProduct`; PostgreSQL test: the new name, price and species appear in `GET /provider/offerings`, in the public profile, in search (the old name no longer matches; the species filter follows the new species) and in the assistant's answer (new name and `72.500`). Browser: the edit form pre-fills, validates ("Este campo es obligatorio." / price message), saves with "Cambios guardados." and the card, the owner's search and the public profile show the new values; the old name finds nothing. |
| AC-036 | A signed-in provider who tries to change a product of another provider is not allowed to. | IMPLEMENTED | `NOT_FOUND` (the same answer as for any missing resource, CR-006) for another provider's product, a service, a removed offering, an unknown id, an owner or provider account id and malformed ids; all columns of the targeted rows are unchanged (snapshot comparison); owners get `404`, anonymous `401`, foreign Origin `403`. Browser: a second clinic's direct `PUT` returned `404 NOT_FOUND` and its visit to the edit URL ended on "No puedes ver esta página". |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-006 / BR-032 | The update uses the publish validator: exactly one species, `dog` or `cat`; missing, blank, list or other values give `422` (`REQUIRED` / `NOT_ALLOWED`) and write nothing; the species can be switched dog ↔ cat. |
| NFR-002 | The provider id comes only from the session; the `UPDATE` is scoped by `provider_id`; the request cannot carry `providerId`, `id`, `kind`, `available` or `modality` (all `NOT_ALLOWED`). |
| Availability (API_SPEC_V2) | The statement never reads or writes `available`; a product that was set to not available stays not available after an edit (test). |
| CR-029 | `removed_at IS NULL` is part of the `UPDATE`; an edit that waits on a removal in progress finds the product removed and answers `NOT_FOUND` (test with an uncommitted removal). |
| Edge cases | None defined in the backlog for US-014. |
| DEP-001 / DEP-004 | Provider-only guard reused; the target must be an active product of the provider. |

## 8. Tests and Verification Results

Tests added: `tests/catalog-products-update.test.js` (8) and `tests/catalog-products-update.database.test.js` (7): 15 new tests. Executed:

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Baseline | Not re-run before the change in this execution | NOT_RUN | The US-012 validation records 249/249 on the same PostgreSQL 16 database, and the tree was clean at the start. The final count below equals 249 + 15. |
| Focused, no database | `node --env-file-if-exists=.env --test tests/catalog-products-update.test.js` | PASSED | 8 of 8. |
| Focused, PostgreSQL | `node --env-file-if-exists=.env --test tests/catalog-products-update.database.test.js` | PASSED | 7 of 7, 0 skipped, against `vetcare-postgres` in a throwaway schema. They passed on the first run; P06.4 should mutation-test them. |
| Full regression | `npm test` | PASSED | 264 tests, 264 passed, 0 failed, 0 skipped. |
| Production build | `npm run build` | PASSED | Vite build succeeded. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Browser check | API (throwaway schema of the test database, migrations 001–002) and Vite started for the check and stopped afterwards; two clinics, an owner; sign-in through the real forms; DOM-driven interaction (the pane could not draw) | PASSED (manual) | Product card has "Editar" only; the form opens in edit mode pre-filled, no modality control; empty name and price 0 show the messages and send nothing; changing name, price and species saves and returns to the catalog with "Cambios guardados."; the owner's search, the public profile and the species filter show the new values and not the old name; the other clinic's direct request is `404` and its edit URL ends on the not-found screen. Visual appearance and narrow widths were not assessed. |
| Hosted Vercel / Neon behavior | — | NOT_RUN | Migration 002 still has to be applied to Neon before the iteration-2 deployment. |

## 9. Repository Changes

Created: `tests/catalog-products-update.test.js`, `tests/catalog-products-update.database.test.js`, and this log. Modified: `src/modules/catalog/offerings.js`, `client/src/pages/PublishProduct.jsx`, `client/src/pages/ProviderCatalog.jsx`, `client/src/App.jsx`, `docs/API.md`, `docs/USER_GUIDE.md`, `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. Deleted: none. No migration, dependency manifest, lockfile, `.env`, API contract or earlier validation report was changed. No commit was made. The browser schema was dropped and the processes started for the check were stopped.

## 10. Architecture Conformance and Deviations

Conforms to `ARCHITECTURE_V4` §6.4 (COMP-007 update reuses the publish validators and updates own active offerings of that kind), IF-036 (outcomes `VALIDATION_FAILED` incl. `NOT_ALLOWED`, `NOT_FOUND`), CR-006 and CR-029. The response is the `CatalogProduct` schema of API_SPEC_V2 (a test compares its keys to the spec).

**Documented implementation detail (not a deviation).** The service update (US-011) runs in a transaction under the provider lock because it must serialize with bookings; the product update is one atomic conditional statement without that lock, since no booking-like operation depends on a product's details today. If ordering (US-027+) needs the price to be stable while an order is placed, that story must add the lock then. No formal architectural review is required.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Type | Impact / next action |
|---|---|---|
| Editing a product does not touch availability or existing orders (none can exist yet; `product_order` stores its own `unit_price_cop`). | Technical observation | Ordering stories should keep the price snapshot. |
| Concurrent edits of one product are last-write-wins; the final row is always one complete submitted version (test). | Technical decision | Acceptable for a single-owner catalog. |
| P04-ASM-036 ("editing does not change appointments already booked") has no product counterpart: nothing references a product yet. | Product observation | None. |
| No client tests exist (the client has no runner); layout at narrow widths, keyboard and screen-reader behavior of the new button/form were not verified. | Unverified behavior | P06.4 and P07. |
| Hosted runtime: migration 002 on Neon pending; tests ran on the project's PostgreSQL 16 test database, not Neon. | External limitation | Required before deploying iteration 2. |
| US-015 (remove a product) shares the catalog card and the shared `DELETE /provider/offerings/:id` route and is the natural next step; it must also reuse the confirmation dialog of US-012. | Follow-up outside this HU | Implement separately. |

## 12. Final Implementation Status

**READY_FOR_VALIDATION.** Both acceptance criteria are implemented and pass automated and manual evidence; the remaining limitations (no narrow-width or assistive-technology pass, no hosted run) are documented and non-blocking. This status is not a validation result.

## 13. Handoff to P06.4

Validate **US-014** from `artifacts/03_planning/product_backlog_priori_v3.json`. Inspect the new route in `src/modules/catalog/offerings.js`, `client/src/pages/PublishProduct.jsx`, `client/src/pages/ProviderCatalog.jsx`, `client/src/App.jsx` and the two new test files. Independently run `npm test` with `TEST_DATABASE_URL`, `npm run build` and `git diff --check`. Specifically verify:
(1) every place the edit must show up (catalog, public profile, search with its species filter, voice search, assistant) reads the new values and none shows the old ones;
(2) ownership: no way to change a product of another provider, a service, a removed offering or an arbitrary id, and no write on refusal (full-row comparison);
(3) validation parity with publishing for every field, and that read-only columns (`available`, `modality`, `kind`, `providerId`, `id`) cannot be changed through the body;
(4) availability is never changed (including a product that is not available) and no other column changes;
(5) the race with a removal and concurrent edits;
(6) the edit screen: pre-fill, validation, success notice, not-found handling, load-failure retry, and that publishing a product still works;
(7) that the service update (US-011), the service removal (US-012) and the earlier stories are unaffected;
(8) that the tests fail when the code is broken (mutation checks on the kind/ownership/active scopes, the validator, the availability column and the response).

## 14. Addendum (2026-11-10, after P06.4)

Sections 1–13 describe the increment as handed to validation and are kept unchanged. P06.4 found no defect and changed no code (details in `US-014_IMPLEMENTATION_VALIDATION.md`). What it added:

- **Narrow width verified.** The catalog and the edit form were measured at 375 px with an independent veterinarian's data: no horizontal overflow, 48–50 px action targets. Section 11's statement that narrow widths were not assessed no longer applies; the keyboard, screen-reader and visual passes are still pending (F-01).
- **Form paths verified in the browser.** A one-shot 500 on save (message kept in the form, retry saves), a failed catalog load (message with "Reintentar", retry pre-fills) and a 404 on save (not-found screen).
- **Evidence beyond the tests.** An oracle probe (8 seeds, 3,105 checks, no differences) and 15 mutants (14 detected by the new tests; the survivor, removing the redundant `providerTypeFor` query, is equivalent).
- **Suite.** 264 of 264, as in section 8.
