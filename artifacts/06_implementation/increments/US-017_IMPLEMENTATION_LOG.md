# US-017 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-12 (local system date of the execution environment) |
| HU | US-017 — Filter by species |
| Epic | EPIC-005 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Backlog status | PLANNED; scope MVP_CORE; P0 / SPRINT-001; 2 story points |
| Requirement | FR-018 |
| Acceptance criteria | AC-041, AC-042, AC-043, AC-086 |
| Business rules | BR-006, BR-008, BR-032 |
| Edge cases | none defined for this HU |
| Backlog dependencies | DEP-001, DEP-003, DEP-004 |
| Architecture / contracts | `ARCHITECTURE_V2.md` (COMP-008, IF-007); `ARCHITECTURE_VALIDATION_V2.md`; `API_SPEC_V1.yaml` (`GET /api/search`, `species` parameter, `SpeciesFilter`); `DATA_MODEL_V1.md` (`offering.species`) |
| UX | `UX_SPEC_V2.md` (SCR-UX-004, COMP-UX-004 segmented choice group, FLOW-UX-008); `UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Related stories | US-016 search (implemented, validated PASS_WITH_WARNINGS) — direct predecessor and host of this change; US-010 / US-013 publishing (validated FAIL, only on public-profile and search visibility) |
| Implementation status | **READY_WITH_LIMITATIONS** |

## 2. Story Summary and Scope

**In scope.** An owner narrows a text search to services and products of one species. The search endpoint accepts the optional
`species` query parameter (`all`, `dog`, `cat`; absent means `all`) and, when it is `dog` or `cat`, returns only offerings of that
species together with the text match. The "Especie" segmented control (Todas / Perro / Gato) on the search screen re-applies the
current search at once, is remembered before the first search, and the no-results state offers "Quitar filtro".

**Excluded.** Text search itself (US-016, unchanged), the public provider profile (US-018), booking and ordering actions on results,
keeping search state when leaving and returning to the screen (see section 11), and any change to the species of offerings.

**Applicable criteria and rules.** AC-041, AC-042, AC-043, AC-086; BR-006 (one species per offering), BR-008 (the filter uses the
species of the offering, not of the owner's pets), BR-032 (species are dog and cat).

## 3. Readiness Assessment

Implementation could proceed. The backlog entry is PLANNED, with no open questions. Its dependencies are all satisfied or available:
DEP-001 (owner session and guard, from US-003), DEP-003 and DEP-004 (published services and products, from US-010 and US-013, whose
publishing slices work), and the search endpoint and screen of US-016, which the story extends. API_SPEC already defines the `species`
parameter and `SpeciesFilter`, and the UX specification defines the control, its behavior and the empty state, so no contract, schema
or migration change was needed.

US-016 deliberately left the filter out and recorded it as deferred to this story ("the API does not apply the optional species query
parameter yet"). Before this change, a `species` parameter was silently ignored. No blocker. The FAIL statuses of US-010 and US-013 concern
only the public-profile and search visibility of AC-027 / AC-033; the filter does not depend on that gap.

## 4. Technical Implementation Plan

Initial plan, all steps completed:

1. Add `validateSpeciesFilter` and apply the filter in the search query without changing the query or parameters of an unfiltered search, so every US-016 test keeps its exact expectations.
2. Report `q` and `species` errors together as CTR-001 field errors (`NOT_ALLOWED`, `INVALID_FORMAT`).
3. Add the "Especie" control to `OwnerSearch.jsx`: re-apply the last submitted search on change, remember the choice before the first search, keep unsubmitted text untouched, and add the filter-aware empty state.
4. Add token-only styles for a segmented control with a non-color selected indicator.
5. Add API/validator tests with a fake database and PostgreSQL tests on real rows.
6. Run the focused and full test suites, the build, and a browser check against the local database; clean up the test data.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/search/offerings.js` | Added `validateSpeciesFilter` (`undefined` → `all`; `all`/`dog`/`cat` accepted; other strings → `NOT_ALLOWED`; repeated parameter → `INVALID_FORMAT`). The route now reports `q` and `species` errors together. For `dog`/`cat` it appends `AND o.species = $2` and a second bound parameter; for `all` the SQL and parameters are exactly those of US-016. | US-017; AC-041, AC-042, AC-043, AC-086; BR-006, BR-008, BR-032; IF-007 |
| `client/src/pages/OwnerSearch.jsx` | Added the "Especie" radio group (Todas default, Perro, Gato). Search requests send `species`. Changing the filter re-runs the last submitted search; before any search it is only stored. The search logic was split into `search` (validates and normalizes the field) and `runSearch` (executes) so a filter change never overwrites unsubmitted text. Retry reuses the last text and species. No-results text adds "o quita el filtro de especie" and a "Quitar filtro" button when a filter was active. | AC-041, AC-043, AC-086; SCR-UX-004; COMP-UX-004 |
| `client/src/design-system/global.css` | Added `.species-filter`, `.species-option` (equal segments, selected state by thicker border, tinted background and a check mark, focus ring, equal thirds on mobile, left-aligned from the md breakpoint) and a spacing rule for the empty-state button. Tokens only. | SCR-UX-004; COMP-UX-004; CR-012 |
| `src/modules/README.md` | Documented the species filter in the search row. | COMP-008 |
| `tests/search.test.js` | Renamed one US-016 test whose title ("…without implementing the species filter") would now be false. Its assertions are unchanged. | US-016 traceability |
| `tests/search-species.test.js` | 8 new API/validator tests. | AC-041, AC-042, AC-043, AC-086; BR-008 |
| `tests/search-species.database.test.js` | 5 new PostgreSQL tests on real rows. | AC-041, AC-042, AC-043, AC-086 |

Shared-code note: the changes to US-016's files are additive. The unfiltered query text and bound parameters are byte-for-byte what
US-016 produced, and its 10 tests pass without modification other than the title above.

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Files / evidence |
|---|---|---|---|
| AC-041 | With results for dogs and cats, selecting a species filter shows only offerings for that species. | IMPLEMENTED | `species=dog|cat` adds the condition (services and products). PostgreSQL test: dog returns only dog rows, cat only cat rows. Browser: Gato → one cat service; Perro → dog service and dog product. |
| AC-042 | An owner with no pet of a species who filters by it still sees offerings for it. | IMPLEMENTED | The query and request carry no owner or pet data (test asserts this). PostgreSQL test: an owner with no pets and an owner with only a dog both get cat results for `cat`. Browser: the test owner had only a dog and saw cat results. |
| AC-043 | Removing the filter shows both species again. | IMPLEMENTED | `all` and an absent parameter add no condition; results are identical to the unfiltered search (database test). Browser: Todas and "Quitar filtro" both restored all results. |
| AC-086 | With a text search, an applied species filter shows only results matching both. | IMPLEMENTED | Both conditions run in one query. Database tests combine accents, case, partial words and `%`/`_` literals with each species, including combinations that must return nothing. Browser: "vacuna" + Gato → 1, + Perro → 2, + Todas → 3. |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-006 | The filter compares the single `offering.species` value. |
| BR-008 | The species filter uses the offering's species only; neither the SQL nor the request involves the owner's pets (AC-042 tests). |
| BR-032 | Only `all`, `dog` and `cat` are accepted; any other value is refused with `422` `species`/`NOT_ALLOWED`. |
| Edge cases | None defined in the backlog for US-017. |
| DEP-001 | Search remains owner-only (`guard({ role: 'owner' })`): anonymous → `401`, provider → `404`, with and without the filter. |
| DEP-003 / DEP-004 | Database tests filter real service and product rows. |

## 8. Tests and Verification Results

Tests added: `tests/search-species.test.js` (8) and `tests/search-species.database.test.js` (5): 13 new tests. Executed:

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Baseline | Not run before editing; the US-016 validation report records 129 tests, 0 skipped | NOT_RUN | After the backend and style edits (before adding tests) `npm test` gave 129 of 129, so the existing suite, including the 10 US-016 search tests, was unaffected. |
| Focused tests | `node --env-file-if-exists=.env --test tests/search-species.test.js tests/search-species.database.test.js` | PASSED | 13 of 13, 0 skipped. One assertion of mine first failed because its regular expression also matched the selected column `o.species`; this was a test defect and was corrected to match only the added condition. |
| US-016 regression | `node --env-file-if-exists=.env --test tests/search.test.js tests/search.database.test.js` | PASSED | 10 of 10 unchanged. |
| Full regression | `npm test` | PASSED | 142 tests, 142 passed, 0 failed, 0 skipped (129 + 13). |
| Production build | `npm run build` | PASSED | 36 modules transformed. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Browser check | Local API and Vite servers on the local dev database; real owner session (owner with only a dog); one clinic with 2 services and 2 products created through the API | PASSED (manual) | Filter shown with Todas selected; Gato chosen before searching was applied to the first search; Perro re-applied the search at once; Todas restored all; with Perro active and no match the screen showed "No encontramos resultados / Prueba con otra palabra o quita el filtro de especie." and "Quitar filtro", which restored the match. Test accounts, pet and offerings were deleted afterwards (0 left). Visual appearance was not assessed (screenshots unavailable). |
| Keyboard arrow navigation, screen-reader announcement | — | NOT_RUN | Native radio inputs are used, which gives arrow-key movement by default, but it was not exercised. |
| Hosted Vercel / Neon behavior | — | NOT_RUN | COND-001 remains open. |

## 9. Repository Changes

Created: `tests/search-species.test.js`, `tests/search-species.database.test.js`, and this log. Modified: `src/modules/search/offerings.js`,
`client/src/pages/OwnerSearch.jsx`, `client/src/design-system/global.css`, `src/modules/README.md`, `tests/search.test.js` (test title only),
`artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. Deleted: none. No migration, dependency manifest, lockfile, `.env`, API contract
or earlier validation report was changed. No commit was made.

## 10. Architecture Conformance and Deviations

Conforms to COMP-008 / IF-007 and CTR-005: the parameter name, optionality, enumeration and default equal `API_SPEC_V1.yaml` (a test
reads the spec), the search stays read-only, takes no owner data, and uses a bound parameter for the species value. The control follows
COMP-UX-004 (segmented, group label, "Todas" default, native radios so arrow keys work, selected state by border, background and check
mark). No formal architectural review is needed. A species filter without text is not offered: `q` stays required by the contract.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Type | Impact / next action |
|---|---|---|
| SCR-UX-004 says the text, filter, results and scroll position are kept when the owner leaves and returns. The application has no screen to leave to yet (provider profile US-018, booking US-019), and US-016 did not implement it either, so the filter state is held only while the search screen stays mounted. | Unimplemented UX behavior shared with US-016 | Implement for the whole screen when the destination screens exist. Not an AC of US-017. |
| An empty `species=` is refused as `NOT_ALLOWED`; the contract lists only `all`, `dog`, `cat`. | Technical decision | The client never sends it. |
| The check mark uses the character `✓` in CSS content, not an icon component. | Technical detail | Replace if an icon set is introduced. |
| Visual layout, keyboard and screen-reader behavior not verified; hosted runtime (COND-001) not verified. | Unverified behavior | P06.4 manual pass and P07. |

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** All four acceptance criteria have implementing code and passing automated and manual evidence. The
limitations (state kept on return, no visual or assistive-technology pass, hosted runtime) are documented and non-blocking. This status
is not a validation result.

## 13. Handoff to P06.4

Validate **US-017** from `artifacts/03_planning/product_backlog_priori_v2.json`. Inspect `src/modules/search/offerings.js`,
`client/src/pages/OwnerSearch.jsx`, `client/src/design-system/global.css` and the two new test files, plus the unchanged US-016 tests.
Independently run `npm test` (with `TEST_DATABASE_URL` set), `npm run build` and `git diff --check`. Specifically verify:
(1) each combination of text and species returns exactly the matching rows on real data, including the empty ones;
(2) `all` and no parameter are indistinguishable from the US-016 search, in SQL and in results;
(3) the filter never uses the owner or their pets;
(4) invalid, repeated and empty `species` values, and that no query runs when validation fails;
(5) owner-only access, and that the parameter is bound (no SQL built from user text);
(6) the UI re-applies the last submitted search on change, remembers the choice before the first search, keeps unsubmitted text, and shows the filter-aware empty state;
(7) that no US-016 behavior regressed.
