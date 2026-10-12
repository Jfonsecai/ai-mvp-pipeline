# US-013 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-12 (local system date of the execution environment) |
| HU | US-013 — Publish a product |
| Epic | EPIC-004 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Backlog status | PLANNED; scope MVP_CORE; P0 / SPRINT-001; 2 story points |
| Requirement | FR-014 |
| Acceptance criteria | AC-033, AC-034, AC-084 (AC-111, "published as available", is covered by the contract and implemented; it belongs to US-033 in the backlog) |
| Business rules | BR-006, BR-025, BR-027, BR-032 (BR-031 applied for the default availability) |
| Edge cases | none defined for this HU |
| Backlog dependencies | DEP-001 |
| Architecture / contracts | `ARCHITECTURE_V2.md` (COMP-007, IF-006, DATA-006); `ARCHITECTURE_VALIDATION_V2.md`; `API_SPEC_V1.yaml` (`POST /api/provider/products`, `PublishProductRequest`, `CatalogProduct`); `DATA_MODEL_V1.md` (`offering`) |
| UX | `UX_SPEC_V2.md` (SCR-UX-011, SCR-UX-013, FLOW-UX-007, MSG-REQ/PRICE); `UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS |
| Related dependencies | US-003 session and provider guard (PASS_WITH_WARNINGS); US-010 catalog module and screens (implemented, validation **FAIL** on AC-027, see section 3) |
| Implementation status | **READY_WITH_LIMITATIONS** |

## 2. Story Summary and Scope

**In scope.** A signed-in provider (clinic or independent veterinarian) publishes a product with a name, a price in whole COP
and exactly one species (dog or cat). The product is stored as an `offering` of kind `product`, **published as available**, and
appears in the provider's own catalog (SCR-UX-011). Delivered as `POST /api/provider/products` (IF-006) plus the SCR-UX-013
"Publicar producto" screen and its entry button in the catalog.

**Excluded.** The public provider profile (US-018, SCR-UX-005/IF-008) and search (US-016/US-017, COMP-008): AC-033 names both as
places where the product must appear. The availability switch and ordering (US-033, US-027 onward, behind feature flags).
Editing and removing products (US-014, US-015). Any change to services (US-010).

**Applicable criteria and rules.** AC-033, AC-034, AC-084; BR-006 (one species), BR-025 (own catalog only), BR-027 (price shown,
payment outside the platform), BR-032 (species are dog and cat).

## 3. Readiness Assessment

Implementation could proceed. The backlog entry is PLANNED with no open questions and the single dependency DEP-001, which is
satisfied by the existing session and provider guard. The API operation, request/response schemas and the `offering` table with
its `offering_kind_fields` constraint already exist in the approved artifacts, so no contract or migration change was needed.

**Observed state of related stories.**

- US-010 (publish a service) shares the COMP-007 module and screens. Its P06.4 result is **FAIL** (HIGH finding F-01 on AC-027)
  only because the public profile and search surfaces do not exist. Its service flow itself passed, and its 7 tests pass. This does
  not block US-013's publishing slice, which only extends the module; the same limitation applies here (next point).
- US-016 / US-017 (search) and US-018 (public profile) are PLANNED and not present. **AC-033 requires the product to appear in
  the catalog, on the profile and in search results.** Implementing those stories is outside this HU (P06.3 section 5.2) and the US-010
  validation explicitly advised against expanding scope to close the same gap. AC-033 is therefore recorded as partially implemented
  (catalog only), and the P06.4 decision must weigh it as it did for AC-027.

No blocker prevents the increment from existing and being validated.

## 4. Technical Implementation Plan

Initial plan, all steps completed:

1. Extract the name, price and species checks of US-010's service validator into small shared helpers so both offerings use identical rules.
2. Add `validatePublishProduct` (name, price, species only; unknown fields such as `modality`, `available` or `providerId` refused).
3. Add provider-only `POST /api/provider/products`: provider type read from the profile row, insert as `kind = 'product'`, `available = true`, no modality.
4. Add SCR-UX-013 at `/provider/products/new`, with the UX texts and "Producto publicado." toast, and a "Publicar producto" button in the catalog next to "Publicar servicio".
5. Add API tests with a fake database and PostgreSQL integration tests.
6. Run focused and full tests, the build, a browser check against the local dev database, and clean up the test data.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/catalog/offerings.js` | Added shared helpers `checkName`, `checkPrice`, `checkSpecies`, `checkShape`; added `validatePublishProduct` and provider-only `POST /provider/products` (inserts a product with `available = true`, `modality` NULL). `validatePublishService` now calls the shared helpers. | US-013; AC-033, AC-034, AC-084; BR-006, BR-025, BR-027, BR-032; IF-006; DATA-006 |
| `client/src/pages/PublishProduct.jsx` | New SCR-UX-013: name, price (whole pesos) and exactly-one species; client usability validation with MSG-REQ / MSG-PRICE / "Elige una especie."; server field-error mapping; on success goes to the catalog with the "Producto publicado." notice; no stock field. | AC-033, AC-034, AC-084; FLOW-UX-007; SCR-UX-013 |
| `client/src/pages/ProviderCatalog.jsx` | Added the secondary "Publicar producto" button; subtitle changed from "…los servicios que has publicado." to "…los servicios y productos que has publicado." (US-010 code). | SCR-UX-011 |
| `client/src/App.jsx` | Added the provider-only route `/provider/products/new`. | SCR-UX-013 |
| `client/src/design-system/global.css` | Added `.catalog-actions` and `.button-link-secondary` using tokens only; two columns from the md breakpoint. | CR-012; SCR-UX-011 |
| `src/modules/README.md` | Documented product publication in the catalog row. | COMP-007 |
| `tests/catalog-products.test.js` | 9 API/validator tests (new). | AC-033, AC-034, AC-084, AC-111; BR-006, BR-025 |
| `tests/catalog-products.database.test.js` | 4 PostgreSQL tests (new). | same, plus persistence and constraints |

**Shared-code changes (and why).** Editing US-010's validator was the minimum way to avoid duplicating the same three field
checks. Behavior for US-010 changes only for `null` and blank inputs: a `null`/`''` species or price is now `REQUIRED` (previously
`NOT_ALLOWED` / `INVALID_FORMAT`), which matches the "required" wording of AC-028 / AC-082 and the product criteria. The 7 existing
US-010 tests still pass unchanged. The subtitle edit in `ProviderCatalog.jsx` was needed because it no longer described the screen.
Deliberate deviation from the UX text: the subtitle does **not** say "…aparece en tu perfil y en las búsquedas", because neither
exists yet, and a visible claim should be true.

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Files / evidence |
|---|---|---|---|
| AC-033 | A signed-in provider publishes a product with a name, a price and one species; the product appears in their catalog, on their profile and in search results. | PARTIALLY_IMPLEMENTED | Publication and the provider's own catalog work (API tests, PostgreSQL tests, browser: product listed after redirect). The public profile (US-018) and search results (US-016/017) do not exist, so those two outcomes are not implemented. |
| AC-034 | Publishing without exactly one species is not published and species is indicated as required. | IMPLEMENTED | Missing, `null`, `''` → `422` `species`/`REQUIRED`; unsupported values (`bird`, `both`, arrays, `DOG`) → `NOT_ALLOWED`; nothing written (DB test counts rows). UI shows "Elige una especie." |
| AC-084 | Publishing without a price is not published and price is indicated as required. | IMPLEMENTED | Missing, `null`, `''` → `422` `priceCop`/`REQUIRED`; 0, negative, fractional, string and over-range prices refused; nothing written. UI shows "Este campo es obligatorio." |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-006 | Exactly one species per product: the request carries one `species` string limited to `dog` / `cat`; the DB column and `CHECK` allow one value. |
| BR-025 | Provider identity and type come from the session and the profile row; the request cannot carry `providerId`; the own-catalog query is provider-scoped. Owner → `404`, anonymous → `401`. |
| BR-027 | The price is a required positive whole-COP number shown in the catalog; no payment behavior was introduced. |
| BR-032 | Species limited to dog and cat in the validator, UI and database. |
| BR-031 (supporting) | New products are inserted with `available = true`; the request cannot set `available` (refused as `NOT_ALLOWED`). No stock UI was added (US-033). |
| Edge cases | None defined in the backlog for US-013. |
| DEP-001 | Existing session resolution and `guard({ role: 'provider' })` reused. |

## 8. Tests and Verification Results

Tests added: `tests/catalog-products.test.js` (9) and `tests/catalog-products.database.test.js` (4): 13 new tests, one of which
guards the unchanged US-010 service validator behavior. Executed:

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Baseline | Not re-run before editing; taken from the US-010 validation report | NOT_RUN | That report records 106 tests, 0 skipped. 119 now = 106 + 13 new, consistent with it. |
| Focused tests | `node --env-file-if-exists=.env --test tests/catalog-products.test.js tests/catalog-products.database.test.js tests/catalog-services.test.js tests/catalog-services.database.test.js` | PASSED | 20 tests, 20 passed, 0 failed, 0 skipped (13 new + 7 US-010); PostgreSQL ran against `TEST_DATABASE_URL`. |
| Full regression | `npm test` | PASSED | 119 tests, 119 passed, 0 failed, 0 skipped. |
| Production build | `npm run build` | PASSED | 36 modules transformed. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Browser check | Local API and Vite servers against the local dev database; clinic sign-in; "Publicar producto" from the catalog; empty submit; valid submit | PASSED (manual) | Empty submit showed three errors (name and price required, "Elige una especie."); valid submit redirected to the catalog with "Producto publicado." and listed the product ("Gato", "$ 45.000"); API returned `available: true`. Test account, product and session removed afterwards (0 left). Visual layout not assessed (screenshots unavailable in the pane). |
| Product on public profile and in search | — | NOT_RUN | The surfaces do not exist (US-018, US-016). |
| Hosted Vercel / Neon behavior | — | NOT_RUN | COND-001 remains open. |

## 9. Repository Changes

Created: `client/src/pages/PublishProduct.jsx`, `tests/catalog-products.test.js`, `tests/catalog-products.database.test.js`, and this log.
Modified: `src/modules/catalog/offerings.js`, `client/src/pages/ProviderCatalog.jsx`, `client/src/App.jsx`,
`client/src/design-system/global.css`, `src/modules/README.md`, `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. Deleted: none.
No migration, dependency manifest, lockfile, `.env`, API contract or earlier validation report was changed. No commit was made.

## 10. Architecture Conformance and Deviations

Conforms to COMP-007 / IF-006 and CTR-005: the response keys equal `CatalogProduct` (a test compares them with `API_SPEC_V1.yaml`), the
request equals `PublishProductRequest` (`additionalProperties: false` is mirrored by refusing unknown fields), the module writes only
`offering`, provider data is read from `provider_profile` through a read query, rules are server-side with the client as a usability
layer, and errors are CTR-001 outcomes. Product publication is a single-row insert, so no transaction or provider lock is needed.
No formal architectural review is required.

One documented UX deviation: the catalog subtitle (section 5). It is a text choice, not an architectural change.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Type | Impact / next action |
|---|---|---|
| AC-033's "on their profile and in search results" cannot be satisfied until US-018 and US-016/017 exist. | Dependency on planned stories | P06.4 will likely mirror the US-010 outcome for AC-027. Resolve by implementing those stories, then re-validate US-013 and US-010. |
| The `offering` insert uses the provider's `provider_type` from the profile row; a missing profile returns `NOT_FOUND`. | Technical | None. |
| Price upper bound 2,147,483,647 (PostgreSQL `integer`) is an implementation limit, not a business value; API_SPEC `MoneyCop` has no maximum. | Technical assumption inherited from US-010 | Revisit if a business maximum is defined. |
| No uniqueness rule on product names (none is specified); duplicates are allowed. | Product detail without a source | Confirm with the team if duplicates should be prevented. |
| Layout/accessibility not visually verified; hosted runtime (COND-001) not verified. | Unverified behavior | P07 and deployment readiness. |

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** The product publication slice, the validation rules for AC-034 and AC-084, and the catalog listing
work and pass every executed check. AC-033 is only partly deliverable because the profile and search surfaces belong to other, not yet
implemented, stories. This status is not a validation result.

## 13. Handoff to P06.4

Validate **US-013** from `artifacts/03_planning/product_backlog_priori_v2.json`. Inspect `src/modules/catalog/offerings.js` (including
the shared-helper refactor), `client/src/pages/PublishProduct.jsx`, `client/src/pages/ProviderCatalog.jsx`, `client/src/App.jsx` and the
two new test files. Independently run `npm test` (with `TEST_DATABASE_URL` set), `npm run build` and `git diff --check`. Specifically verify:
(1) a product is stored as `kind = 'product'`, `available = true`, `modality` NULL, under the right provider and type;
(2) null, blank, missing and invalid species and price are refused with the right reasons and write nothing;
(3) the US-010 service behavior is unchanged except for the documented `null`/blank change, and its 7 tests pass;
(4) role, session, Origin and unknown-field handling;
(5) how AC-033 must be decided while the public profile and search do not exist, applying the same standard used for AC-027 in the US-010 report.
