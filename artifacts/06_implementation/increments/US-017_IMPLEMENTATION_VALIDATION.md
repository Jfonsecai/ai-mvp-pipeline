# US-017 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Report version | 1.0 (first validation of US-017; no earlier report exists) |
| Validation date | 2026-10-12 |
| HU | US-017 — Filter by species (EPIC-005, P0 / SPRINT-001, 2 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` (backlog status PLANNED) |
| Implementation log | `artifacts/06_implementation/increments/US-017_IMPLEMENTATION_LOG.md` |
| Requirement / criteria | FR-018; AC-041, AC-042, AC-043, AC-086 |
| Business rules / edge cases | BR-006, BR-008, BR-032; no edge cases defined |
| Dependencies | DEP-001, DEP-003, DEP-004 |
| Foundation validation | PASS_WITH_WARNINGS |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **PASS_WITH_WARNINGS** |

**Independence limitation (stated, not removed).** The implementation and this validation were produced by the same AI assistant in
the same session; no separate reviewer or human has reviewed either. To reduce the effect, this validation re-read the code from
disk, compared the log with the working tree, re-ran every check from the command line, ran a 42-probe adversarial script the
implementation phase did not have (including a property check of the filter against the unfiltered results), mutation-tested the
new tests with eight deliberate breaks, and repeated the browser verification with different data, a different sign-in path
(the real sign-in form) and new cases (unsubmitted text, forced network failure and retry, keyboard use). It does not replace
human review (finding F-04).

## 2. Executive Summary

- **Validated:** the optional `species` parameter of `GET /api/search` (IF-007), the "Especie" control on the owner search screen
  (SCR-UX-004), the filter-aware empty state, and the tests that cover them.
- **Result:** all four acceptance criteria are supported by executed evidence. A dog or cat filter returns exactly the offerings of that
  species (services and products); the filter is independent of the owner's pets; "Todas" and no filter are indistinguishable from the
  existing text search; and text and species are applied together. Invalid values are refused before any query. The full suite
  (142 tests) and the build pass, and the 10 US-016 search tests pass unchanged.
- **Most important findings:** none above LOW. F-01 (LOW): the search state is not kept when the owner leaves and returns to the screen
  (specified for SCR-UX-004, not an acceptance criterion, shared with US-016, and there is no destination screen yet). F-02 (LOW): the
  client has no automated tests, so the UI evidence is manual, and visual appearance was not assessed. F-03 and F-04 are INFO.
- **Decision:** **PASS_WITH_WARNINGS.**

## 3. Validation Scope and Limitations

**This is HU-level validation of US-017, not product-wide testing.** P07, CI/CD and release readiness are not covered.

**Examined:** `src/modules/search/offerings.js` (whole file), `src/modules/index.js`, `src/modules/README.md`,
`client/src/pages/OwnerSearch.jsx` (whole file), `client/src/design-system/global.css` (species and search rules),
`tests/search-species.test.js`, `tests/search-species.database.test.js`, the changed title in `tests/search.test.js`, the unchanged
US-016 tests, `API_SPEC_V1.yaml` (`/api/search`, `SpeciesFilter`, result schemas), UX SCR-UX-004 and COMP-UX-004, and the US-016
validation report for the shared code.

**Criteria included:** AC-041, AC-042, AC-043, AC-086 (all four in the backlog).

**Could not be verified:** visual appearance (the browser pane could not render screenshots; layout was checked through computed sizes
and the DOM); behavior on older browsers without CSS `:has()`; screen-reader announcements (names and groups were checked, speech
output was not); hosted Vercel/Neon behavior (COND-001).

## 4. Acceptance Criteria Validation Matrix

| Criterion ID | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-041 | With results for dogs and cats, selecting a species filter shows only offerings for that species. | `validateSpeciesFilter`; `AND o.species = $2` in the search route; `OwnerSearch.jsx` control | PostgreSQL tests, 24-query property probe, browser, mutations M1–M3, M8 | **PASS** | For 24 different texts, `species=dog` and `species=cat` each equal the corresponding subset of `species=all`, and the two together equal `all` with no overlap. Services and products are both filtered. In the browser, with 4 results for "consulta", Perro showed 2 (both "Perro") and Gato showed 2 (both "Gato"). | — |
| AC-042 | An owner who has no registered pet of a species who filters by it still sees offerings for it. | The query has no owner or pet input; parameters are the text and the species only | PostgreSQL test (owner without pets, owner with a dog), probe (dog owner vs cat owner), SQL parameter inspection, browser | **PASS** | Owner with only a dog and owner with only a cat get identical `cat` results; an owner with no pets gets the same. The statement contains no `pet` or `owner` reference and carries two bound parameters. Browser: the test owner had only a cat and saw the dog results under Perro. | — |
| AC-043 | With a filter applied, removing it shows both species again. | `all` and absent add no condition; "Todas" and "Quitar filtro" in the UI | PostgreSQL test, probe (absent = all for 24 queries; identical SQL and parameters), browser | **PASS** | Results with `species=all` and with no parameter are identical to each other and to the unfiltered US-016 search; the SQL text and the single bound parameter are identical. In the browser, "Todas" and the "Quitar filtro" button each restored all results. | — |
| AC-086 | With a text search that has results, also applying a species filter shows only results that match both. | One query with both conditions | PostgreSQL tests, probes, browser, mutations M1, M2, M8 | **PASS** | Combinations with accents (`baño`, `dúo`), upper case, partial words, `%` and `_` literals and quotes return exactly the rows that match both; combinations that cannot match return an empty list, never a text-only or species-only list. Two offerings with the same name and different species are separated correctly. An unavailable product still appears under its species. | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Notes |
|---|---|---|---|---|
| BR-006 | Each offering applies to exactly one species. | Filter compares the single `offering.species`; no offering appears under both filters (dog ∩ cat = ∅ in the property probe). | PASS | |
| BR-008 | The filter uses the offering's species, not the owner's pets. | See AC-042. | PASS | |
| BR-032 | MVP species are dog and cat. | Only `all`, `dog`, `cat` accepted; 16 other values (case variants, spaces, `bird`, `both`, injection strings, NUL byte, emoji, `dog,cat`) → `422` `species`/`NOT_ALLOWED`. | PASS | |
| Edge cases | None defined. | Backlog `edge_case_ids` is empty. | n/a | |
| DEP-001 | Search requires a signed-in owner. | Anonymous → `401`, provider → `404`, with valid and invalid `species` (authentication and role are checked before the parameter). | PASS locally | Hosted auth under COND-001. |
| DEP-003 / DEP-004 | Search depends on published services and products. | Services and products created through the real publishing endpoints, then filtered. | PASS locally | The FAIL statuses of US-010 and US-013 concern profile/search visibility of their own criteria and do not affect this story. |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Full regression suite | `npm test` (`TEST_DATABASE_URL` set from `.env`) | PASSED | 142 tests, 142 pass, 0 fail, 0 skipped; database tests executed. Matches the log (129 + 13). |
| Focused US-017 tests | `node --env-file-if-exists=.env --test tests/search-species.test.js tests/search-species.database.test.js` | PASSED | 13 of 13 (8 + 5). |
| US-016 regression | `node --env-file-if-exists=.env --test tests/search.test.js tests/search.database.test.js` | PASSED | 10 of 10, with the unfiltered SQL and parameters unchanged. |
| Production build | `npm run build` | PASSED | 36 modules transformed. |
| Patch hygiene | `git diff --check` | PASSED | No whitespace errors. |
| Adversarial probe script | Throwaway script outside the repository; real Express stack, temporary PostgreSQL schema, offerings created through the publishing endpoints | PASSED | 42 probes, 0 failed: the property check over 24 texts, 16 invalid values, 3 repeated-parameter forms, `species[]`/`species[a]` forms (no 5xx), parameter-name case, auth ordering, `no-store`, SQL parameterization (value never in statement text), no writes. Schema dropped (0 left). |
| Mutation check of the tests | Eight single-line breaks of `search/offerings.js`; tests re-run; file restored and hash compared | PASSED | Filter ignored (M1): 7 fail. Condition inverted (M2): 6. Wrong species bound (M3): 6. Validation removed (M4): 3. Condition always added (M5): 2. Wrong default (M6): 3. Species errors dropped (M7): 2. `OR` instead of `AND` (M8): 7. All killed. |
| Browser flow (repeated independently) | Local servers on the local dev database; owner (one cat) signed in through the real sign-in form; provider with 2 services and 1 product created through the API | PASSED (manual) | Verified: filter present with "Todas" selected and group label "Especie"; "Perro" with 4 results → 2 dog results; unsubmitted text in the field ("collar") is left untouched while the last submitted search ("consulta") is re-applied; a forced network failure shows the error with "Reintentar", and retry repeats `q=consulta&species=cat` and shows the cat results; arrow-right moves Todas → Perro and applies the filter; each option's accessible name is Todas / Perro / Gato and each target is 44 px high. Test accounts, pet and offerings deleted (0 left); pre-existing rows in the development database were not touched. |
| Visual appearance, screen-reader speech, older browsers | — | NOT_RUN | Screenshots unavailable; speech not exercised; `:has()` support not tested on old engines. |
| Hosted Vercel / Neon runtime | — | NOT_RUN | COND-001. |
| Clean reinstall (`npm ci`) | — | NOT_RUN | No manifest or lockfile changed. |

A passing suite is not treated as proof of coverage: the new tests were read for their assertions (exact row sets, bound parameters,
absence of owner data in the statement) and the mutation check shows they fail when each part of the rule is broken.

## 7. Architecture, UX, and Integration Conformance

- **Architecture:** conforms. COMP-008 / IF-007 stays read-only; the parameter name, optionality, enumeration and default equal
  `API_SPEC_V1.yaml` (a test reads the spec); the species value is a bound parameter; no contract, migration or dependency change.
  No owner data enters the query (BR-008).
- **UX (SCR-UX-004, COMP-UX-004):** matches the specified label "Especie", options "Todas" (default) / "Perro" / "Gato", position below
  the search bar, immediate re-application on change, filter remembered before the first search, three equal segments on mobile and
  left-aligned from the md breakpoint, the no-results text "…o quita el filtro de especie" with the "Quitar filtro" action, and
  the error state with "Reintentar". The selected state uses border, background and a check mark, not color alone. Arrow keys work
  (native radios). Not implemented: keeping the state when leaving and returning (F-01).
- **Integration with US-016:** the unfiltered query and parameters are unchanged; the 10 US-016 tests pass; the only edit to a US-016 file
  besides additive code is one test title that would otherwise have become false.
- **Scope:** limited to US-017 and the required extension of US-016's route and screen. No unrelated story implemented.

## 8. Security, Data Integrity, and Regression Findings

No defect found. The species value is validated against a closed list and bound as a parameter (confirmed by inspecting the issued
SQL, and by injection strings that were refused before any query ran); no endpoint behavior reveals more data than the unfiltered search;
responses keep `Cache-Control: no-store`; authentication and role checks run before parameter validation, so invalid parameters do not
disclose anything to anonymous or provider callers; searching writes nothing. Regressions: none in the 142 tests.

## 9. Findings Register

**Mandatory corrections:** none.

| ID | Severity | Title | Criterion | Evidence | Why it matters | Corrective action | Closure criteria |
|---|---|---|---|---|---|---|---|
| F-01 | LOW | Search text, filter and results are not kept when leaving and returning to the screen | none (SCR-UX-004 behavior; not in AC-041, AC-042, AC-043, AC-086) | `OwnerSearch.jsx` keeps state in component memory; nothing in the app navigates away from the screen yet (provider profile US-018, booking US-019 do not exist). Same limitation was recorded for US-016. | An owner returning from a provider page would find the search cleared. | Optional follow-up: implement for the whole screen when a destination screen exists. | Navigate to a result's destination and back; text, filter, results and scroll are kept. |
| F-02 | LOW | No automated client tests; visual appearance not assessed | AC-041, AC-043, AC-086 (UI part) | The repository has no client test runner; UI behavior was verified by two manual runs with the steps above; screenshots were unavailable. | A later UI change could break the filter unnoticed; visual defects would go unnoticed. | Optional follow-up for P07: browser-level tests of the filter flow, and a visual pass at about 375 px and 1280 px. | Recorded automated or manual visual evidence. |
| F-03 | INFO | The selected segment relies on CSS `:has()`; unknown parameter forms are ignored | AC-041 | `global.css` styles the checked state with `:has(input:checked)` while the radios are visually hidden; `species[]=dog` and `Species=dog` are different keys and are ignored (no filter, no 5xx), as the text parameter is. | On an engine without `:has()` the selection would not be visible; the ignored forms never occur from the UI. | Optional: add a fallback style if old browsers must be supported. | n/a |
| F-04 | INFO | Same assistant implemented and validated; no human review | All | Section 1. | Shared blind spots are possible. | Team review of the diff. | Reviewer sign-off. |

## 10. Implementation Log Consistency

The log matches the repository: files created, modified and not deleted agree with `git status`; the test counts reproduced exactly
(13 new, 142 total, 0 skipped; 10 unchanged US-016 tests); the statements that no migration, manifest, lockfile, `.env`, API contract or
earlier report changed are correct; the shared-code note (additive change, unchanged unfiltered SQL) is borne out by the SQL
comparison probe. The log's baseline row was corrected during P06.3 and now matches what was actually run. One item moves from
"not run" to verified by this validation: keyboard arrow navigation and the accessible names. The status READY_WITH_LIMITATIONS is
consistent with the evidence. No further correction needed.

## 11. Readiness Decision

US-017 is ready to be considered **validated with warnings**: every acceptance criterion passes on direct evidence, the business rules
and dependencies hold, no defect or unapproved deviation exists, and the remaining items are non-blocking. Follow-up conditions:
(1) implement the return-to-search state (F-01) when the destination screens exist; (2) a visual and assistive-technology pass and,
ideally, browser-level tests before release (F-02); (3) COND-001 must still be satisfied before any hosted use; (4) a human review of
the change (F-04). This does not imply the product is ready for release.

## 12. Final Status

**PASS_WITH_WARNINGS**

## 13. Corrective Actions and Retest Guidance

No failed or blocking findings, so no corrective action is required. Retest guidance for the optional items: F-01, search, open a
result's destination (after US-018 or US-019), return, and confirm the text, filter, results and scroll position; F-02, open
`/owner/home` at about 375 px and 1280 px, tab to the group and use the arrow keys, and listen to the group label, the selected state
and the changing summary with a screen reader.
