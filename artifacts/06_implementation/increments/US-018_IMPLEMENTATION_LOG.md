# US-018 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-12 (local system date of the execution environment) |
| HU | US-018 — View a provider's profile |
| Epic | EPIC-005 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Backlog status | PLANNED; scope MVP_SUPPORTING; P0 / SPRINT-001; 2 story points |
| Requirement | FR-020 |
| Acceptance criteria | AC-044, AC-045 |
| Business rules | BR-026, BR-027, BR-038 |
| Edge cases | none defined for this HU |
| Backlog dependencies | DEP-001, DEP-005 |
| Architecture / contracts | `ARCHITECTURE_V2.md` (COMP-008, IF-008, IF-019, IF-021, DATA-004, CR-002, CR-006); `ARCHITECTURE_VALIDATION_V2.md`; `API_SPEC_V1.yaml` (`GET /api/providers/{providerId}`, `PublicProviderProfile`, `CatalogService`, `CatalogProduct`); `DATA_MODEL_V1.md` |
| UX | `UX_SPEC_V2.md` (SCR-UX-005, SCR-UX-014, COMP-UX-007, FLOW-UX-009); `UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Related stories | US-008 (profile data, PASS_WITH_WARNINGS) = DEP-005 producer; US-010 / US-013 (offerings, validated FAIL only for lack of this profile and search); US-016 / US-017 (search, PASS_WITH_WARNINGS), which now link to this profile |
| Implementation status | **READY_WITH_LIMITATIONS** |

## 2. Story Summary and Scope

**In scope.** A signed-in pet owner opens a provider's public profile and sees its name, provider type, address (when it has
one), phone (once saved), email, and all its services and products with their prices. Delivered as `GET /api/providers/{providerId}`
(IF-008), the SCR-UX-005 screen at `/owner/providers/:providerId`, and the entry point: the provider name on each search result
now links to it. Unknown or malformed identifiers end on the existing "No puedes ver esta página" screen (SCR-UX-014).

**Excluded.** "Agendar cita" (US-019) and "Pedir" (US-027 onward) actions; working hours (the UX specification says they are not shown);
keeping the search state on return (see section 11); any change to what providers or offerings store.

**Applicable criteria and rules.** AC-044, AC-045; BR-026 (clinic always has an address, independent optional), BR-027 (prices shown,
no payment), BR-038 (contact is phone and email).

## 3. Readiness Assessment

Implementation could proceed. The backlog entry is PLANNED, with no open questions. DEP-001 (owner session and guard) is satisfied by
US-003. DEP-005 ("the profile shows information the provider has entered") is satisfied by US-008, which stores the contact data and
address, and by the publishing slices of US-010 and US-013. API_SPEC and the UX specification define the operation, the response, the
screen and its states, so no contract, schema or migration change was needed.

**Observed state of related stories.** US-010 and US-013 are recorded as FAIL solely because a public profile and search did not
exist; search now exists (US-016/US-017) and this story adds the profile. Their reports and statuses were not edited and need their
own re-validation (section 11). No blocker.

## 4. Technical Implementation Plan

Initial plan, all steps completed:

1. Follow the architecture's read rule (COMP-008 owns no table): add a COMP-006 read `getProviderFacts` (IF-019) and a COMP-007 read `listProviderOfferings` (IF-021), and make the existing own-catalog route reuse the latter so there is one query.
2. Add the COMP-008 route `GET /providers/:providerId`: owner-only, canonical-UUID check, uniform `NOT_FOUND`, response with `address` and `contactPhone` omitted when absent.
3. Add SCR-UX-005 and its states, link it from the search results, and register the route for owners.
4. Add token-only styles.
5. Add API/validator tests with a fake database and PostgreSQL tests built through the real sign-up, profile-save (US-008) and publishing (US-010 / US-013) endpoints.
6. Run focused and full tests, the build and a browser check on the local database; clean up the test data.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/search/provider-profile.js` | New. `GET /providers/:providerId` for owners; non-canonical ids → `NOT_FOUND` without touching the database; composes `getProviderFacts` and `listProviderOfferings`; omits `address` / `contactPhone` when absent. | US-018; AC-044, AC-045; BR-026, BR-038; IF-008; CR-006 |
| `src/modules/provider/profile.js` | Added `getProviderFacts(db, providerId)`: read-only IF-019 query returning the stored facts or null. | COMP-006; IF-019; DEP-005 |
| `src/modules/catalog/offerings.js` | Extracted the own-catalog query into exported `listProviderOfferings` (IF-021). `GET /provider/offerings` now calls it; query, ordering and response are unchanged. | COMP-007; IF-021; AC-044 |
| `src/modules/index.js` | Registered the new router. | IF-008 |
| `client/src/pages/ProviderPublicProfile.jsx` | New SCR-UX-005: back link, provider name, type badge, contact card (address / phone as `tel:` link / email as `mailto:` link), "Servicios (n)" and "Productos (n)" lists with species, price and modality, empty-section texts, loading and MSG-NET error with "Reintentar", `NOT_FOUND` → existing not-found screen, "No disponible" shown for unavailable products. | AC-044, AC-045; SCR-UX-005; BR-027 |
| `client/src/pages/OwnerSearch.jsx` | The provider name in each search result is now a link to the profile. | SCR-UX-004 "provider link"; entry to AC-044 |
| `client/src/App.jsx` | Owner-only route `/owner/providers/:providerId`. | SCR-UX-005 |
| `client/src/design-system/global.css` | Added `.provider-type-badge`, `.contact-card` and link styles using tokens only. | CR-012 |
| `src/modules/README.md` | Documented the three new reads and the route. | COMP-006/007/008 |
| `tests/provider-public-profile.test.js` | 9 API/validator tests (new). | AC-044, AC-045; BR-026, BR-038; DEP-001 |
| `tests/provider-public-profile.database.test.js` | 4 PostgreSQL tests (new). | AC-044, AC-045; DEP-005 |

Shared-code note: the `catalog` change is a pure extraction (same SQL, same order, same mapping); the 20 catalog tests (7 services, 13 products) and the rest of the
suite pass unchanged. The `OwnerSearch.jsx` change is one element of one result card.

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Files / evidence |
|---|---|---|---|
| AC-044 | For a provider that has completed its profile, an owner who opens it sees its name, address, phone, email, provider type, and its services and products with their prices. | IMPLEMENTED | API and PostgreSQL tests: data saved through the US-008 endpoint and offerings published through the US-010 / US-013 endpoints appear in the owner view, with prices, species, modality and availability; the response keys equal `PublicProviderProfile` / `CatalogService` / `CatalogProduct`. Browser: the profile reached from a search result showed every item, with `tel:` and `mailto:` links. |
| AC-045 | For a provider without an address, the profile is shown without an address. | IMPLEMENTED | `address` is omitted from the response (not `null`) and the "Dirección" row is not rendered; no placeholder. PostgreSQL test: an independent veterinarian shows no address, then one after it is saved, then none again after it is cleared. Browser: only the "Correo" row appeared for an independent with neither address nor phone. |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-026 | A clinic's address is always present (guaranteed by US-002/US-008 and the DB constraint) and is shown; an independent veterinarian's is shown only if it exists. |
| BR-027 | Every service and product row shows its price in COP; no payment behavior. |
| BR-038 | Contact is phone (when saved) and email only; a provider that has not saved a phone is shown without a phone row, never with an empty value. |
| Edge cases | None defined in the backlog for US-018. |
| DEP-001 | Owner-only (`guard({ role: 'owner' })`): anonymous → `401`, provider → `404` (even for its own id). |
| DEP-005 | The view reads what US-008 and the publishing stories stored; the PostgreSQL tests exercise that path end to end. |

## 8. Tests and Verification Results

Tests added: `tests/provider-public-profile.test.js` (9) and `tests/provider-public-profile.database.test.js` (4): 13 new tests. Executed:

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Baseline | Not run before editing; the US-017 validation report records 142 tests | NOT_RUN | After the backend and client edits and before adding tests, `npm test` gave 142 of 142, so the catalog extraction changed nothing observable. |
| Focused tests | `node --env-file-if-exists=.env --test tests/provider-public-profile.test.js tests/provider-public-profile.database.test.js` | PASSED | 13 of 13, 0 skipped; PostgreSQL ran against `TEST_DATABASE_URL`. |
| Full regression | `npm test` | PASSED | 155 tests, 155 passed, 0 failed, 0 skipped (142 + 13). |
| Production build | `npm run build` | PASSED | 37 modules transformed. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Browser check | Local API and Vite servers on the local dev database: a clinic with its profile saved (US-008 endpoint), a service and a product; an independent veterinarian with only a service; an owner | PASSED (manual) | Search → provider link → profile showing type, address, phone, email, service and product with prices; the independent profile with only an email row and "Este proveedor aún no ha publicado productos."; `tel:+576015550118` and `mailto:` links; "not-a-uuid" and an unknown UUID ended on "No puedes ver esta página"; a provider opening the owner URL ended there too. Test data deleted afterwards (0 left). Visual appearance not assessed (screenshots unavailable). |
| Hosted Vercel / Neon behavior | — | NOT_RUN | COND-001 remains open. |

## 9. Repository Changes

Created: `src/modules/search/provider-profile.js`, `client/src/pages/ProviderPublicProfile.jsx`, `tests/provider-public-profile.test.js`,
`tests/provider-public-profile.database.test.js`, and this log. Modified: `src/modules/provider/profile.js`, `src/modules/catalog/offerings.js`,
`src/modules/index.js`, `src/modules/README.md`, `client/src/pages/OwnerSearch.jsx`, `client/src/App.jsx`,
`client/src/design-system/global.css`, `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. Deleted: none. No migration, dependency manifest,
lockfile, `.env`, API contract or earlier validation report was changed. No commit was made.

## 10. Architecture Conformance and Deviations

Conforms to COMP-008 / IF-008 and CTR-005, and applies the architecture's rule that COMP-008 reads through COMP-006 (IF-019) and
COMP-007 (IF-021) instead of querying their tables: the new route issues no SQL of its own. The response keys equal the API_SPEC schemas (a test
reads the spec), the operation is owner-only, and unknown, malformed and non-provider ids all return the same `NOT_FOUND` (CR-006).
Working hours are not exposed, as the UX specification requires. No formal architectural review is needed.

Pre-existing, not changed by this story: US-016's search route queries `offering` and `provider_profile` directly rather than through
IF-019 / IF-021. It is read-only and works, but it is the one place that departs from the read rule; it could later be moved onto the two reads added here.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Type | Impact / next action |
|---|---|---|
| US-010 (AC-027) and US-013 (AC-033) were failed because the public profile and search were missing. Both exist now, but those reports and statuses were deliberately not edited. | Follow-up outside this HU | Re-run P06.4 for US-010 and US-013; AC-027 / AC-033 can now be assessed end to end. |
| SCR-UX-005 says "Back returns to SCR-UX-004 with its state kept". The back link goes to `/owner/home`, and the search screen starts empty. This is the open follow-up F-01 of the US-017 report, now with a destination screen. | Unimplemented UX behavior | Implement state retention for the search screen (not an AC of US-018). |
| The owner header tab "Buscar" is not highlighted on the profile page (SCR-UX-005 asks for it to stay active). | Minor UX deviation | Cosmetic; address with the state-retention work. |
| "Agendar cita" and "Pedir" are not rendered; they belong to US-019 and US-027. | Planned stories | Add when those stories land. |
| Unavailable products show a "No disponible" row instead of the warning badge component. | Technical detail | Replace if COMP-UX-009 badges are introduced. |
| Visual layout and accessibility not verified; hosted runtime (COND-001) not verified. | Unverified behavior | P06.4 and P07. |

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** Both acceptance criteria have implementing code and passing automated and manual evidence. The limitations
(return-to-search state, tab highlight, booking/order actions that belong to other stories, no visual pass, hosted runtime) are documented
and non-blocking. This status is not a validation result.

## 13. Handoff to P06.4

Validate **US-018** from `artifacts/03_planning/product_backlog_priori_v2.json`. Inspect `src/modules/search/provider-profile.js`,
`src/modules/provider/profile.js` (`getProviderFacts`), `src/modules/catalog/offerings.js` (`listProviderOfferings` and the unchanged own-catalog route),
`client/src/pages/ProviderPublicProfile.jsx`, `client/src/pages/OwnerSearch.jsx`, `client/src/App.jsx`, `client/src/design-system/global.css` and the two new
test files. Independently run `npm test` (with `TEST_DATABASE_URL` set), `npm run build` and `git diff --check`. Specifically verify:
(1) every AC-044 field appears with correct values and prices, built from data saved through the real endpoints;
(2) `address` and `contactPhone` are omitted, not null, when absent, and the UI shows no placeholder row;
(3) provider scoping: no other provider's offerings or data appear, and nothing outside the public fields leaks (no hours, no account data);
(4) unknown, malformed and non-provider ids, including injection strings and odd UUID forms, give a uniform `404` and do not reach the database;
(5) owner-only access with and without a valid id;
(6) the own-catalog route behaves exactly as before the extraction;
(7) `tel:` / `mailto:` links cannot be abused by stored values;
(8) the UI states (loading, error and retry, empty sections, not found) and the entry from the search result.
