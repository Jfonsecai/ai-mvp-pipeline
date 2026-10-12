# US-013 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Report version | 1.0 (first validation of US-013; no earlier report exists) |
| Validation date | 2026-10-12 |
| HU | US-013 — Publish a product (EPIC-004, P0 / SPRINT-001, 2 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` (backlog status PLANNED) |
| Implementation log | `artifacts/06_implementation/increments/US-013_IMPLEMENTATION_LOG.md` |
| Requirement / criteria | FR-014; AC-033, AC-034, AC-084 |
| Business rules / edge cases | BR-006, BR-025, BR-027, BR-032; no edge cases defined |
| Dependencies | DEP-001 (US-003 session and provider guard: PASS_WITH_WARNINGS) |
| Foundation validation | PASS_WITH_WARNINGS |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **FAIL** |

**Independence limitation (stated, not removed).** The implementation and this validation were produced by the same AI assistant
in the same session; no separate reviewer or human has reviewed either. To reduce the effect, this validation re-read the code from
disk, compared the log with the working tree, re-ran every check from the command line, ran a 78-probe adversarial script the
implementation phase did not have, and mutation-tested the new tests. It does not replace human review (finding F-04).

## 2. Executive Summary

- **Validated:** the product publication slice — `POST /api/provider/products` (IF-006), the SCR-UX-013 screen, the catalog entry
  button, the refactor of the shared offering validator, and the tests.
- **What works:** AC-034 and AC-084 pass on direct evidence. A published product is stored as an available product under the right
  provider, appears in that provider's own catalog, and invalid or missing species and price are refused with the right reasons and
  nothing written. Role, session, Origin and unknown-field boundaries hold. The full suite (119 tests) and the build pass; the US-010
  service behavior is intact.
- **What does not:** AC-033 requires the product to appear **in the provider's catalog, on their profile and in search results**.
  Only the catalog outcome exists. No public provider profile (US-018) or search (US-016/017) exists anywhere in the application, so
  two of the three required outcomes cannot occur and cannot be shown.
- **Decision:** **FAIL**, on the same grounds and with the same standard used for AC-027 in the US-010 validation. The publishing
  code itself has no defect found. The failure is a required acceptance criterion that is materially unsatisfied until the profile
  and search stories exist.

## 3. Validation Scope and Limitations

**This is HU-level validation of US-013, not product-wide testing.** P07, CI/CD and release readiness are not covered.

**Examined:** `src/modules/catalog/offerings.js` (whole file, including the helper refactor), `src/modules/index.js`,
`src/modules/README.md`, `client/src/pages/PublishProduct.jsx`, `client/src/pages/ProviderCatalog.jsx`, `client/src/App.jsx`,
`client/src/design-system/global.css`, `tests/catalog-products.test.js`, `tests/catalog-products.database.test.js`, the unchanged
`tests/catalog-services*.test.js`, `migrations/001_initial_schema.sql` (`offering`), `API_SPEC_V1.yaml` (`/api/provider/products`,
`PublishProductRequest`, `CatalogProduct`), UX SCR-UX-011 and SCR-UX-013, and the US-010 validation report for the shared code.

**Criteria included:** AC-033, AC-034, AC-084 (all three in the backlog). AC-111 ("published as available") belongs to US-033 in the
backlog; it was observed (`available = true`) but is not counted for this HU.

**Could not be verified:** the public profile and search outcomes of AC-033 (surfaces absent); hosted Vercel/Neon behavior
(COND-001); visual layout and accessibility (the browser pane could not render screenshots).

## 4. Acceptance Criteria Validation Matrix

| Criterion ID | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-033 | A signed-in provider publishes a product with a name, a price and one species; the product appears in their catalog, on their profile and in search results. | `offerings.js` `POST /provider/products` and `GET /provider/offerings`; `PublishProduct.jsx`; `ProviderCatalog.jsx`. No public-profile or search code exists. | Unit/API tests, PostgreSQL tests, 78 probes, browser flow, route and component inventory (`grep` of all routes and client pages) | **FAIL** | **Catalog: satisfied.** Publishing returns `201`, the row is `kind='product'`, `available=true`, `modality` NULL, correct provider and type; it is listed in that provider's catalog and in no other provider's; the browser flow showed the redirect, the "Producto publicado." notice and the listed product. **Profile and search: not implemented.** The only product-related routes are the two provider routes above; no owner-facing route or page lists offerings by provider or by text. | F-01 |
| AC-034 | Publishing without exactly one species is not published and species is indicated as required. | `checkSpecies`, `validatePublishProduct`; `PublishProduct.jsx` | Unit/API tests, PostgreSQL no-write test, probes (12 species values), browser empty-form flow, mutation M2 | **PASS** | Missing, `null` and `''` → `422` `species`/`REQUIRED`; `bird`, `both`, `['dog']`, `['dog','cat']`, `'Dog'`, `' dog'`, `1`, `true`, `{}` → `NOT_ALLOWED`; each returned exactly one field error and no row was written. UI showed "Elige una especie." Disabling the check fails 2 tests. | — |
| AC-084 | Publishing without a price is not published and price is indicated as required. | `checkPrice`, `validatePublishProduct`; `PublishProduct.jsx` | Unit/API tests, PostgreSQL no-write test, probes (11 price values + both boundaries), browser empty-form flow, mutation M3 | **PASS** | Missing, `null` and `''` → `422` `priceCop`/`REQUIRED`; `0`, `-1`, `2147483648` → `OUT_OF_RANGE`; `1.5`, `"9000"`, `true`, arrays, objects → `INVALID_FORMAT`; `1` and `2147483647` accepted; nothing written on refusal. UI showed "Este campo es obligatorio." Removing the required check fails 4 tests. | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Notes |
|---|---|---|---|---|
| BR-006 | Each offering applies to exactly one species. | One string `species` in the request, limited to `dog`/`cat`; arrays refused; DB `CHECK` agrees. | PASS | |
| BR-025 | A provider manages only its own catalog. | `providerId`, `provider_id`, `providerType`, `id` in the body are refused; identity and type come from the session and `provider_profile`; catalog read is provider-scoped (mutation M5 fails 1 test); owner → `404` with no row; anonymous → `401`. | PASS | The profile/search visibility part of BR-025's public side belongs to US-018. |
| BR-027 | Price displayed; payment outside the platform. | Required positive whole-COP price shown in the catalog (`$ 45.000`); no payment code. | PASS | |
| BR-032 | MVP species are dog and cat. | Validator, UI and DB. | PASS | |
| Edge cases | None defined. | Backlog `edge_case_ids` is empty. | n/a | |
| DEP-001 | Right account type, signed in. | `guard({ role: 'provider' })`; no-session, owner and provider cases executed. | PASS locally | Hosted auth under COND-001. |
| US-016 / US-017 / US-018 surfaces | Search results and public profile show published offerings. | Route and page inventory. | NOT_IMPLEMENTED | Required to close F-01. |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Full regression suite | `npm test` (`TEST_DATABASE_URL` set from `.env`) | PASSED | 119 tests, 119 pass, 0 fail, 0 skipped; database tests executed. Matches the log (106 + 13 new). |
| Focused tests | `node --env-file-if-exists=.env --test tests/catalog-products.test.js tests/catalog-products.database.test.js` | PASSED | 13 of 13 (9 + 4). With the 7 US-010 catalog tests: 20 of 20. |
| Production build | `npm run build` | PASSED | 36 modules transformed. |
| Patch hygiene | `git diff --check` | PASSED | No whitespace errors. |
| Adversarial probe script | Throwaway script outside the repository running the real Express stack against a temporary PostgreSQL schema | PASSED | 78 probes, 0 failed: malformed/oversized/non-JSON bodies, missing and foreign Origin, 10 injected fields, 12 species, 11 price and 9 name variants, Unicode length limits, SQL and markup strings, response shape, `no-store`, stored row, scoping, anonymous and owner access, 8 concurrent publishes, US-010 service regression. Schema dropped (0 left). |
| Mutation check of the tests | Six temporary single-line breaks of `offerings.js`; tests re-run; file restored and hash compared | PASSED | Product inserted unavailable (M1): 2 fail. Species check removed (M2): 2 fail. Price required removed (M3): 4 fail. Unknown fields allowed (M4): 2 fail. Catalog not provider-scoped (M5): 1 fails. Product inserted as `service` (M6): 4 fail. All killed. (My first attempt at M1 and M5 did not apply because of a quoting error in my own script; they were redone and are the results listed.) |
| Browser flow | Local API + Vite against the local dev database: clinic sign-in, "Publicar producto" from the catalog, empty submit, valid submit | PASSED (manual) | Performed during implementation (log §8). Three required-field messages on the empty form; success redirected to the catalog with the notice and the listed product. Test data removed. Not repeated here because the probes and tests cover the same server paths; relied on only for the UI texts and navigation. |
| Public profile / search check | Inventory of all routes in `src/modules` and of client pages | FAILED | No such surface (F-01). |
| Visual / responsive / accessibility pass | — | NOT_RUN | Screenshots unavailable in the pane. |
| Hosted Vercel / Neon runtime | — | NOT_RUN | COND-001. |
| Clean reinstall (`npm ci`) | — | NOT_RUN | No manifest or lockfile changed. |

A passing suite is not treated as proof of coverage: the new tests were read for their assertions (stored columns, response
bodies, row counts after refusal) and the mutation check shows they fail when the main rules break.

## 7. Architecture, UX, and Integration Conformance

- **Architecture:** conforms. COMP-007 / IF-006 writes only `offering`; the response keys equal `CatalogProduct` and the request
  equals `PublishProductRequest` (a test compares them with `API_SPEC_V1.yaml`); a product is a single-row insert so no transaction
  or provider lock is needed; the DB constraints (`offering_kind_fields`, price and species checks) are a second layer and agree
  with the application. No contract, migration or dependency change.
- **UX:** SCR-UX-013 matches the specified fields, labels, placeholder, message texts, "no stock field" rule and success toast.
  SCR-UX-011 has the two publish buttons (primary services, secondary products, side by side from the md breakpoint). **One
  deviation:** the catalog subtitle reads "Administra los servicios y productos que has publicado." instead of the specified
  "Lo que publiques aquí aparece en tu perfil y en las búsquedas." The change is deliberate, because that sentence is false while
  the profile and search do not exist (F-01); restore the specified text when they do. Visual conformance not assessed.
- **Integration with shared code:** the refactor moved the name, price and species checks of `validatePublishService` into shared
  helpers. The seven US-010 tests pass unchanged and the probes confirm service publish, the independent home-only rule, the
  clinic-modality `REQUIRED`, and the services/products separation in the catalog response. One behavior of the US-010 validator
  changed and is documented: a `null` or blank species or price is now `REQUIRED` (previously `NOT_ALLOWED` / `INVALID_FORMAT`);
  this fits the "required" wording of AC-028 and AC-082. The US-010 report was not edited and its result (FAIL on AC-027) is unaffected.
- **Scope:** limited to US-013 plus the justified shared-helper extraction and catalog entry changes. No unrelated story implemented.

## 8. Security, Data Integrity, and Regression Findings

No defect found. Observed: server-side validation of every field and refusal of unknown fields (so `available`, `modality`, `kind`
and ownership fields cannot be injected); identity and provider type taken from the session and database; parameterized SQL (an
injection string was stored literally and the table survived); Origin and JSON checks apply; responses carry `Cache-Control:
no-store`; concurrent publishes created distinct rows; code-point length limits agree between JavaScript and PostgreSQL at 120.
Regressions: none in the 119 tests. Not verifiable here: hosted behavior.

## 9. Findings Register

**Mandatory corrections:** F-01.

| ID | Severity | Title | Criterion | Evidence | Why it matters | Corrective action | Closure criteria |
|---|---|---|---|---|---|---|---|
| F-01 | HIGH | Product does not appear on a public profile or in search results | AC-033 | Inventory of `src/modules`: only the provider routes `/provider/offerings`, `/provider/services`, `/provider/products` list or create offerings; no owner-facing profile or search route; no such page in `client/src`. US-018 and US-016/US-017 are PLANNED. | Pet owners cannot find the product, which is the purpose stated in the story ("so that pet owners can find it and order it"). Two of AC-033's three required outcomes are unmet. | Implement the planned US-018 (public provider profile) and US-016/US-017 (search) in their own authorized increments and make them read the persisted offerings. Do not widen US-013 to build them. Do not edit AC-033 to fit the current code. | As an owner, with a product published here, verify it appears on the provider's public profile and in search results (including the species filter); keep automated evidence; re-run P06.4 for US-013 (and US-010). |
| F-02 | INFO | Documented change to US-010 validator for `null`/blank values | AC-028, AC-082 (US-010) | Section 7. | Small behavior change in code owned by a story that is currently FAIL. | None required; reviewers should know. | n/a |
| F-03 | LOW | Layout and accessibility not visually verified; catalog subtitle departs from the UX text | SCR-UX-011, SCR-UX-013 | Screenshots unavailable; subtitle reasoning in section 7. | Visual defects would go unnoticed; the specified subtitle must return when profile and search exist. | Optional follow-up: manual pass at about 375 px and 1280 px with keyboard and screen reader; restore the specified subtitle after F-01 is closed. | Recorded manual pass; subtitle matches UX when F-01 closes. |
| F-04 | INFO | Same assistant implemented and validated; no human review | All | Section 1. | Shared blind spots are possible. | Team review of the diff. | Reviewer sign-off. |
| F-05 | INFO | Duplicate product names are allowed | AC-033 | No uniqueness rule in the sources; the schema has none. | Providers could publish identical products by accident. | Optional: confirm with the team; no change made. | n/a |

Consistency note on the earlier US-008 report: its AC-023 ("their public profile shows that information") was accepted because the
UX specification states that SCR-UX-009 itself "shows the saved data (AC-023)". For AC-033 the UX specification states the opposite
(SCR-UX-013: the product appears "in the catalog, on the profile and in search results"), so no equivalent reading exists here.

## 10. Implementation Log Consistency

The log matches the repository: files created and modified agree with `git status` (no deletions, as stated); the test counts reproduced
(13 new, 119 total, 0 skipped); the claims of untouched migrations, manifests, lockfile, `.env`, API contract and earlier reports hold;
the dependency on the FAIL status of US-010 and the AC-033 limitation are disclosed up front; the shared-code change and the
subtitle deviation are listed. The status READY_WITH_LIMITATIONS is consistent with the evidence. One wording slip found and already
corrected in the log (an unclear test-count sentence). No further correction needed.

## 11. Readiness Decision

US-013 is **not** ready to be considered validated. The publishing slice is sound and could be accepted on its own, but the backlog
criterion AC-033 requires outcomes that depend on stories not yet built, and a required criterion that is materially unsatisfied
cannot be waved through as a warning. This report does not authorize implementing US-016, US-017 or US-018 inside this increment, and
does not imply product-wide testing or release readiness.

## 12. Final Status

**FAIL**

AC-034 and AC-084 passed. AC-033 failed on the profile and search outcomes (F-01).

## 13. Corrective Actions and Retest Guidance

For F-01: (1) implement the owner-facing public provider profile (US-018) and search (US-016/US-017) as separate, approved increments,
each reading the persisted `offering` rows with the product's name, price, species and availability as their contracts define;
(2) as an owner, publish a product from a provider account, then confirm it on that provider's public profile and in a search that
matches its name, with and without the species filter; (3) keep automated and manual evidence; (4) re-run P06.4 for US-013, evaluating
AC-033 against its original backlog text. No retest is needed for AC-034 and AC-084 unless the shared validator changes again.
For F-03, open `/provider/catalog` and `/provider/products/new` at about 375 px and 1280 px, tab through every control and read the
error states with a screen reader.
