# US-010 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Incremental User Story Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-12 |
| HU | US-010 — Publish a service |
| Epic / priority | EPIC-004; P0 / SPRINT-001; 3 story points |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Requirements | FR-011 |
| Acceptance criteria | AC-027, AC-028, AC-029, AC-082, AC-107 |
| Business rules | BR-006, BR-007, BR-025, BR-027, BR-032 |
| Edge cases | EDGE-017 |
| Dependency | DEP-001 |
| Architecture / API / data model | `artifacts/05_architecture/ARCHITECTURE_V2.md` (COMP-007); `artifacts/05_architecture/API_SPEC_V1.yaml` (IF-006 / CTR-005); `artifacts/05_architecture/DATA_MODEL_V1.md` |
| UX | `artifacts/04_ux/UX_SPEC_V2.md` (SCR-UX-011, SCR-UX-012); `artifacts/04_ux/UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`); no carried condition blocks local implementation |
| Implementation status | **READY_WITH_LIMITATIONS** |

## 2. Story Summary and Scope

Implement the provider flow to publish a service with its name, COP price, one species, and an allowed modality, and to view the provider's own service catalog. The provider type comes from the authenticated provider profile; an independent veterinarian is limited to home service.

In scope: authenticated API and persistence, validation and authorization, provider publication form, private catalog view, tests, and the documentation needed to register the module. AC-027 additionally requires that a clinic's service appear on its public profile and in search results. Those views belong to the separately planned US-018 and US-016 respectively and are not implemented here; this criterion is therefore only partially implemented. This increment does not implement either story or claim that the service is publicly discoverable.

## 3. Readiness Assessment

- The canonical US-010 and its IDs were confirmed in the current prioritized backlog and requirements v3.
- The approved architecture assigns publication and the provider's own catalog to COMP-007 / IF-006. The existing `offering` table and provider-profile relation are present.
- DEP-001 is satisfied locally by the existing authenticated session and provider-role guard.
- The clinic address and independent-veterinarian modality rules are resolved by TD-08/TD-09; EDGE-017 cannot occur under those decisions.
- Local implementation could proceed. Public-profile and search integrations remain outside this HU's code scope and prevent claiming complete satisfaction of AC-027.

## 4. Technical Implementation Plan

1. Add COMP-007 routes for publishing a service and listing the authenticated provider's own offerings.
2. Validate the service name, integer COP price, exactly one supported species, and provider-specific modality; derive provider type from the database.
3. Add the provider publication form and private catalog page, connected to the existing session and API client.
4. Add unit/API and real-PostgreSQL integration tests for validation, authorization, isolation, and persistence; run focused checks, regression suite, production build, and browser flows.
5. Record the public-profile/search limitation without implementing US-016 or US-018.

## 5. Implemented Changes

| Component / file | Change | Purpose | Traceability |
|---|---|---|---|
| `src/modules/catalog/offerings.js` | Added `POST /api/provider/services`, `GET /api/provider/offerings`, service validation, provider-type lookup, and provider-scoped catalog read. | Implements IF-006 using authenticated identity and existing `offering` storage. | FR-011; AC-027–AC-029, AC-082, AC-107; BR-006, BR-007, BR-025, BR-027, BR-032; EDGE-017 |
| `src/modules/index.js` | Registered the catalog router. | Integrates COMP-007 into the modular monolith. | IF-006; DEP-001 |
| `client/src/pages/PublishService.jsx` | Added the provider publication form, validation feedback, and provider-type-specific modality behavior. | Implements SCR-UX-012. | AC-028, AC-029, AC-082, AC-107 |
| `client/src/pages/ProviderCatalog.jsx` | Added the authenticated provider's services/products catalog, loading, empty, error, and retry states. | Implements SCR-UX-011 without asserting public visibility. | AC-027 (catalog portion); BR-025 |
| `client/src/App.jsx` | Added provider catalog navigation and protected catalog/publication routes. | Makes the flow reachable to providers. | DEP-001; SCR-UX-011/012 |
| `client/src/design-system/global.css` | Added catalog layout and card styles using existing design tokens. | Styles the new screens consistently with the client. | SCR-UX-011/012 |
| `tests/catalog-services.test.js` | Added validator, HTTP authorization, ownership/isolation, and API behavior tests. | Covers error and access-control behavior. | AC-028, AC-029, AC-082, AC-107; BR-025 |
| `tests/catalog-services.database.test.js` | Added isolated PostgreSQL schema tests for clinic/independent publication, persistence, catalog ownership, and no-write rejection. | Verifies persistence against the project database model. | AC-027 catalog portion, AC-107; BR-006/007/025/027/032 |
| `src/modules/README.md` | Registered the implemented catalog module and ownership boundaries. | Documents the module extension. | COMP-007 |

No schema migration or new dependency was needed. No public search or public-profile route was added.

## 6. Acceptance Criteria Coverage

| Criterion | Implementation state | Evidence / remaining gap |
|---|---|---|
| AC-027 | PARTIALLY_IMPLEMENTED | A clinic publishes a service that appears in its private catalog; API/PostgreSQL and clinic browser flow verified. Its public profile and search results are not implemented in this increment; US-018 and US-016 remain planned. |
| AC-028 | IMPLEMENTED | Species is required and restricted to exactly `dog` or `cat`; validation tests and blank-form interaction cover missing species. |
| AC-029 | IMPLEMENTED for clinics | Clinic modality is required and restricted to `clinic`, `home`, or `both`; API test and browser blank-form interaction cover missing modality. Independent modality is fixed to `home` under AC-107/TD-09. |
| AC-082 | IMPLEMENTED | Price is required, a positive integer COP amount, and bounded by the database integer type; unit, PostgreSQL no-write, and browser blank-form checks cover required price. |
| AC-107 | IMPLEMENTED | Independent provider UI fixes modality to home; API derives provider type from `provider_profile`, stores `home`, and rejects clinic/both. Unit, PostgreSQL integration, and browser publication were checked. |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment |
|---|---|
| BR-006 | Each published service has one supported species; API and database tests cover valid and invalid values. |
| BR-007 | Clinics may choose clinic, home, or both; independent veterinarians can only offer home service. |
| BR-025 | Catalog queries are scoped to the authenticated provider ID; ownership isolation is tested. |
| BR-027 | Price is a positive whole-peso COP amount; no payment processing is introduced. |
| BR-032 | Species is limited to dog or cat. |
| EDGE-017 | The resolved address/provider-type rules make this case impossible: clinics have an address and independent veterinarians cannot offer clinic modality. |
| DEP-001 | Authenticated provider session and role guard are reused; unauthenticated and owner access are rejected. |
| US-016 / US-018 | Search and owner-facing public profile are not prerequisites to implement the private publication flow, but remain necessary to complete AC-027's end-to-end public-discovery outcome. No code for these stories was added. |

## 8. Tests and Verification Results

| Check | Command / procedure | Result | Evidence |
|---|---|---|---|
| Focused US-010 API and PostgreSQL tests | `node --env-file-if-exists=.env --test tests/catalog-services.test.js tests/catalog-services.database.test.js` | PASSED | Exit code 0; 7 tests passed, 0 failed, 0 skipped. |
| Full regression suite | `npm test` | PASSED | Exit code 0; 106 tests passed, 0 failed, 0 skipped. |
| Production client build | `npm run build` | PASSED | Exit code 0; Vite transformed 35 modules and emitted production assets. |
| Change whitespace check | `git diff --check` | PASSED | Exit code 0; no whitespace errors. |
| Browser: independent provider | Sign in, publish home service, inspect catalog. | PASSED | “Control veterinario a domicilio” appeared with COP 42,000, cat, home modality. |
| Browser: clinic provider | Sign in, submit blank form, then publish dog service at clinic. | PASSED | Blank form displayed required-field errors; “Consulta clínica VetCare” appeared at COP 55,000 with clinic modality. |
| Browser persistence | Reload clinic catalog after publication. | PASSED | Published service remained visible after page reload. |
| Browser startup/runtime | Existing local client/API session; complete authenticated flows. | PASSED locally | Browser reached the Vite app and exercised API-backed publication. Hosted Vercel/Neon remains unverified under COND-001. |

Tests in the project are API/unit-style and real-PostgreSQL integration tests; browser verification used the available integrated browser. The browser run is manual runtime evidence, not a committed Playwright suite.

## 9. Repository Changes

Created:

- `src/modules/catalog/offerings.js`
- `client/src/pages/ProviderCatalog.jsx`
- `client/src/pages/PublishService.jsx`
- `tests/catalog-services.test.js`
- `tests/catalog-services.database.test.js`

Modified:

- `src/modules/index.js`
- `src/modules/README.md`
- `client/src/App.jsx`
- `client/src/design-system/global.css`

No files were deleted. No database migration, dependency change, or commit was created. The local test accounts and published test services reside only in the local database.

## 10. Architecture Conformance and Deviations

The increment follows COMP-007, IF-006, CTR-005, existing session/role guards, the existing provider profile and `offering` schema, and established client/API patterns. It uses parameterized SQL and does not trust a client-supplied provider ID or provider type.

The scope deliberately stops at the authenticated provider catalog. The public profile and search interfaces are assigned to COMP-008 / US-018 and US-016. This is an incomplete required outcome of AC-027, not a change to the criterion or an accepted deviation.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Impact | Evidence | Required next action |
|---|---|---|---|
| AC-027 public discovery incomplete | Owners cannot yet discover this service through the public profile or search, so the full criterion is not met. | Current implementation has private catalog/publication routes only; backlog assigns the public surfaces to US-018 and US-016. | Implement those planned stories, integrate offering facts, and retest this criterion across the owner-facing profile and search. |
| Hosted environment not verified | Local checks do not establish Vercel/Neon behavior. | Foundation condition COND-001 remains open. | Complete the foundation's deployment verification before hosted-release claims. |
| Browser tests are not automated | Browser evidence is not replayable from a committed browser-test command. | No Playwright test harness or dependency is present in the project manifest. | Consider adding an automated browser suite in the project's broader testing phase, without weakening existing database integration coverage. |

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** The provider publication and private-catalog increment is implemented and locally verified. It is ready for independent P06.4 review, but AC-027 is explicitly partial because public profile and search display are absent. This status is not approval of the full HU.

## 13. Handoff to P06.4

- Validate US-010 against `artifacts/03_planning/product_backlog_priori_v2.json`, especially all five acceptance criteria.
- Independently inspect the routes, data ownership, database persistence, and provider UI.
- Re-run the full or focused test suite and client build; confirm browser persistence if feasible.
- Specifically verify whether public profile and search display exist. If still absent, report AC-027 as failed and do not mark US-010 passed.
- Keep US-016/US-018 out of scope; record the required correction and retest evidence.
