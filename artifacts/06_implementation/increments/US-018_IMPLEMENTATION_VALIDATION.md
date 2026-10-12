# US-018 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Report version | 1.0 (first validation of US-018; no earlier report exists) |
| Validation date | 2026-10-12 |
| HU | US-018 — View a provider's profile (EPIC-005, P0 / SPRINT-001, 2 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` (backlog status PLANNED) |
| Implementation log | `artifacts/06_implementation/increments/US-018_IMPLEMENTATION_LOG.md` |
| Requirement / criteria | FR-020; AC-044, AC-045 |
| Business rules / edge cases | BR-026, BR-027, BR-038; no edge cases defined |
| Dependencies | DEP-001, DEP-005 |
| Foundation validation | PASS_WITH_WARNINGS |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **PASS_WITH_WARNINGS** |

**Independence limitation (stated, not removed).** The implementation and this validation were produced by the same AI assistant in
the same session; no separate reviewer or human has reviewed either. To reduce the effect, this validation re-read the code from
disk, compared the log with the working tree, re-ran every check from the command line, ran a 39-probe adversarial script that uses the
real module registry and compares the public view with the provider's own catalog and with the database, mutation-tested the new tests
with ten deliberate breaks (which exposed one weak test, fixed here), and repeated the browser verification with different data, the
real sign-in form, a deliberately hostile contact email, a direct-link reload and a forced network failure. It does not replace human
review (finding F-05).

## 2. Executive Summary

- **Validated:** `GET /api/providers/{providerId}` (IF-008), the two read functions it composes (`getProviderFacts` for COMP-006 and
  `listProviderOfferings` for COMP-007), the SCR-UX-005 screen, its entry link from the search results, and the tests.
- **Result:** both acceptance criteria are supported by executed evidence. An owner sees the provider's name, type, address, phone, email
  and every service and product with its price, built from data saved through the real endpoints of US-008, US-010 and US-013; a
  provider without an address (or phone) is shown without that row, with the key absent from the response rather than null. The view
  equals the provider's own catalog and the database content, exposes nothing outside the public fields, and malformed or unknown
  identifiers all give the same `404` without touching the database. The full suite (155 tests) and the build pass; the related search,
  species-filter, catalog and profile tests pass unchanged.
- **Most important finding:** F-01 (MEDIUM): going back from the profile returns to an empty search, while SCR-UX-005 asks for the
  search state to be kept. It is a specified behavior but not an acceptance criterion, it was already open for US-016 / US-017, and it is
  visible now that a destination screen exists. It does not prevent accepting the HU but must be tracked.
- **Decision:** **PASS_WITH_WARNINGS.**

## 3. Validation Scope and Limitations

**This is HU-level validation of US-018, not product-wide testing.** P07, CI/CD and release readiness are not covered.

**Examined:** `src/modules/search/provider-profile.js`, `src/modules/provider/profile.js` (`getProviderFacts`),
`src/modules/catalog/offerings.js` (`listProviderOfferings` and the own-catalog route that now calls it), `src/modules/index.js`,
`src/modules/README.md`, `client/src/pages/ProviderPublicProfile.jsx`, `client/src/pages/OwnerSearch.jsx`, `client/src/App.jsx`,
`client/src/design-system/global.css`, `tests/provider-public-profile.test.js`, `tests/provider-public-profile.database.test.js`,
`API_SPEC_V1.yaml` (`/api/providers/{providerId}`, `PublicProviderProfile`, `CatalogService`, `CatalogProduct`), UX SCR-UX-005,
COMP-UX-007 and SCR-UX-014.

**Criteria included:** AC-044, AC-045 (both in the backlog).

**Could not be verified:** visual appearance (the browser pane could not render screenshots; layout was checked through the DOM and
computed sizes, including the absence of horizontal overflow with a very long address); screen-reader speech; hosted Vercel/Neon
behavior (COND-001).

## 4. Acceptance Criteria Validation Matrix

| Criterion ID | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-044 | For a provider that has completed its profile, an owner who opens it sees its name, address, phone, email, provider type, and its services and products with their prices. | `provider-profile.js` route; `getProviderFacts`; `listProviderOfferings`; `ProviderPublicProfile.jsx` | Unit/API and PostgreSQL tests; 39 probes on the real registry; browser from a search result and by direct reload; mutations M1–M10 | **PASS** | Data saved through the US-008 endpoint and 30 services and 30 products published through the US-010 / US-013 endpoints all appear, in publication order, with name, species, price and modality (services) or availability (products); the response keys equal `PublicProviderProfile`, `CatalogService` and `CatalogProduct`; the contact email is the profile's contact email, not the sign-in email; the public list equals the provider's own catalog and the database rows. In the browser the profile showed type badge, address, phone (`tel:` link), email (`mailto:` link), "Servicios (1)" and "Productos (1)" with prices. Unavailable products stay listed with `available: false`. | F-01 (navigation only) |
| AC-045 | For a provider without an address, the profile is shown without an address. | `publicProfile()` omits `address`; UI renders the row only when present | PostgreSQL test (address absent, added, cleared), probes, browser, mutation M1 | **PASS** | An independent veterinarian with no address returns no `address` key (not `null`) and the screen shows only the rows that exist ("Correo" alone for a provider with neither address nor phone); adding an address shows it immediately, clearing it removes the key again; no placeholder text. Forcing `address: null` into the response (M1) fails 3 tests. | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Notes |
|---|---|---|---|---|
| BR-026 | A clinic always has an address; an independent veterinarian's is optional. | Clinic profile shows its address (including an apostrophe, a very long value); independent shows one only when stored. | PASS | |
| BR-027 | Services and products show a price; payment is not made in the platform. | Every row shows COP; no payment code. | PASS | |
| BR-038 | Contact is a phone number and an email. | Phone shown only once saved (key omitted otherwise, never null); email always; no other contact fields. | PASS | |
| Edge cases | None defined. | Backlog `edge_case_ids` is empty. | n/a | |
| DEP-001 | Right account type, signed in. | Anonymous → `401` (also with a malformed id: authentication first); another provider and the provider itself → `404`; mutation M4 (wrong role) fails 10 tests. | PASS locally | Hosted auth under COND-001. |
| DEP-005 | The profile shows information the provider entered. | Values saved through US-008 and the publishing endpoints appear unchanged and immediately after each change (`no-store`). | PASS | |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Full regression suite | `npm test` (`TEST_DATABASE_URL` set from `.env`) | PASSED | 155 tests, 155 pass, 0 fail, 0 skipped; database tests executed. Matches the log (142 + 13). |
| Focused US-018 tests | `node --env-file-if-exists=.env --test tests/provider-public-profile.test.js tests/provider-public-profile.database.test.js` | PASSED | 13 of 13 (9 + 4), before and after the test fix below. |
| Related stories regression | catalog, search, species-filter and own-profile test files | PASSED | 57 of 57, 0 skipped; the own-catalog route behaves as before the extraction. |
| Production build | `npm run build` | PASSED | 37 modules transformed. |
| Patch hygiene | `git diff --check` | PASSED | No whitespace errors. |
| Adversarial probe script | Throwaway script outside the repository; the real `src/modules/index.js` registry; temporary PostgreSQL schema; all data created through the public endpoints | PASSED | 39 probes, 0 failed: contract keys, markup and quote characters in names, 30+30 offerings in order, cross-check against the own-catalog endpoint and the database, absent keys, freshness after each profile edit, 26 malformed identifier forms (empty, SQL strings, NUL, traversal, braces, no hyphens, URN, emoji, 5,000 characters …) all with the identical `404` body as an unknown id and zero queries to `provider_profile`, owner-account id indistinguishable from unknown, upper-case id, query string ignored, extra path segment, non-GET methods and the listing route not existing, authentication order, no sensitive fields, 25 concurrent views, no writes, bound parameters. A first run showed one failure caused by my own script (it counted two valid-id requests as malformed ones); the script was corrected and rerun. Schema dropped (0 left). |
| Mutation check of the tests | Ten single-line breaks across the three changed backend files; tests re-run; files restored and hashes compared | PASSED (after one fix) | Address always present (M1): 3 fail. Phone always present (M2): 2. Identifier check removed (M3): 2. Wrong role guard (M4): 10. Wrong provider's offerings (M5): 4. Services/products swapped (M7): 4. Facts drop the address (M8): 4. Offerings re-ordered (M9): 1. Missing provider returns an empty body (M10): 2. **M6 (remove the lower-casing of the id) survived**: the upper-case test used an id made only of digits, so upper-casing changed nothing. This was a test defect; the test now uses an id with letters and the database test also requests an upper-case id; M6 is now killed (1 fails). |
| Browser flow (repeated independently) | Local servers on the local dev database; owner signed in through the real sign-in form; a clinic with a 100-character address, a phone with irregular spacing, a contact email `x@y.co?bcc=evil.co`, one service and one unavailable product | PASSED (manual) | Both search results link to the profile; the page shows type badge, three contact rows, both sections and the "Disponibilidad" row on the unavailable product; links are `tel:+576015550000` and `mailto:x@y.co%3Fbcc=evil.co` (the injected field is neutralized); no horizontal overflow; a full reload on the profile URL keeps the session and reloads the profile; with the network forced to fail the page shows the error with "Reintentar", and retry loads the profile; "Volver a la búsqueda" goes to `/owner/home` with an empty search (F-01). Test data deleted afterwards (0 left); pre-existing development rows untouched. |
| Visual appearance, screen-reader speech | — | NOT_RUN | Screenshots unavailable; speech not exercised. |
| Hosted Vercel / Neon runtime | — | NOT_RUN | COND-001. |
| Clean reinstall (`npm ci`) | — | NOT_RUN | No manifest or lockfile changed. |

A passing suite is not treated as proof of coverage: the new tests were read for their assertions (exact response bodies, absent keys,
query counts for malformed ids, exact row sets) and the mutation check, which found the one weak assertion, shows they now fail when
each part of the behavior is broken.

## 7. Architecture, UX, and Integration Conformance

- **Architecture:** conforms, and applies the read rule better than the story it builds on. COMP-008 issues no SQL of its own: it
  composes IF-019 (`getProviderFacts`, COMP-006) and IF-021 (`listProviderOfferings`, COMP-007), exactly as the dependency diagram
  shows. The response and the item shapes equal the API_SPEC schemas; unknown, malformed and non-provider ids are one uniform `404`
  (CR-006); the operation is owner-only; nothing is written; no contract, migration or dependency change. Pre-existing and unchanged:
  US-016's search route queries the tables directly; it could later use the two reads added here.
- **UX (SCR-UX-005):** matches title (provider name), type label, contact card with "Dirección" omitted when absent and no placeholder,
  phone as a call link, email as a mail link, the two sections with counts and the per-section empty texts, loading and error states with
  "Reintentar", and the not-found screen. Working hours are not shown, as specified. Deviations: the back link does not keep the search
  state (F-01); the owner tab "Buscar" is not highlighted on this page (by code inspection: the nav link is to `/owner/home`; not
  observed in the browser) (F-02); the unavailable-product marker is a text row, not the warning badge component; "Agendar cita" and
  "Pedir" are absent, as they belong to US-019 and US-027.
- **Integration:** the provider name in each search result is now a link to the profile; the own-catalog route returns exactly what it
  did before the extraction (tests plus the cross-check probe); all earlier stories' tests pass.
- **Scope:** limited to US-018, the extraction of two reads, and the entry link. No unrelated story implemented.

## 8. Security, Data Integrity, and Regression Findings

No defect found. Observed: owner-only access with authentication and role checked before the identifier (so malformed ids disclose
nothing to anonymous or provider callers); canonical-UUID check before any query, bound parameters only; a single, identical `404` for
unknown, malformed and non-provider ids, so account ids cannot be enumerated; responses limited to the public fields (no hash, account
data, timestamps or hours) with `Cache-Control: no-store`; React-rendered text (markup in a provider name was returned as data and
displayed as text); `tel:` and `mailto:` values built so that stored contact data cannot add `mailto:` fields (demonstrated with a
`?bcc=` email). Regressions: none in the 155 tests. Not verifiable here: hosted behavior.

## 9. Findings Register

**Mandatory corrections:** none for acceptance. F-01 is a required follow-up condition (below), not an optional recommendation.

| ID | Severity | Title | Criterion | Evidence | Why it matters | Corrective action | Closure criteria |
|---|---|---|---|---|---|---|---|
| F-01 | MEDIUM | Going back from the profile loses the search | none (SCR-UX-005 "Back returns to SCR-UX-004 with its state kept"; not part of AC-044 / AC-045) | Browser: after opening a profile from the results for "validacioncheck", "Volver a la búsqueda" led to `/owner/home` with an empty field and the initial prompt. Search state lives only in the component. Open since US-017 F-01 and US-016. | An owner comparing providers has to search again after every profile. | Keep text, species filter, results and scroll position of the search screen while the session lasts (a small shared store or session storage). Outside this HU's criteria and shared with US-016 / US-017, so a separate, authorized change. | Search, open a profile, go back: field, filter, results and scroll are as left. |
| F-02 | LOW | Owner tab "Buscar" not highlighted on the profile page; layout and accessibility not visually verified | SCR-UX-005 | Code: the nav link targets `/owner/home`; screenshots unavailable. | Cosmetic and orientation only. | Optional follow-up with F-01 and a manual visual pass at about 375 px and 1280 px with keyboard and screen reader. | Recorded manual pass. |
| F-03 | LOW | No automated client tests | AC-044, AC-045 (UI part) | The repository has no client test runner; UI behavior was checked by two manual runs. | A later UI change could break the profile screen unnoticed. | Optional follow-up for P07: browser-level tests of search → profile → back. | Automated evidence of the flow. |
| F-04 | INFO | Weak test found and fixed during validation | AC-044 | M6 survived because the id used in the upper-case test had no letters. Two test files were edited by this validation (one fixture id with letters; one added database assertion). Production code was not edited. | The suite now genuinely covers upper-case identifiers. | None. | Done: M6 is killed. |
| F-05 | INFO | Same assistant implemented and validated; no human review | All | Section 1. | Shared blind spots are possible. | Team review of the diff. | Reviewer sign-off. |

## 10. Implementation Log Consistency

The log matches the repository: files created, modified and not deleted agree with `git status`; the test counts reproduced exactly (13
new, 155 total, 0 skipped); the extraction is described accurately (same query, order and mapping), as shown by the cross-check probe; the statements
that no migration, manifest, lockfile, `.env`, API contract or earlier report changed are correct; the limitations it lists (back
link, tab highlight, absent actions, no visual pass) are all confirmed or consistent with the code. A wrong figure in an earlier draft
of the log (11 catalog tests instead of 20) had already been corrected before validation. The status READY_WITH_LIMITATIONS is
consistent with the evidence. The log's test counts remain correct after this validation's test edits (assertions added, no tests added or removed).

## 11. Readiness Decision

US-018 is ready to be considered **validated with warnings**: both acceptance criteria pass on direct evidence, the business rules and
dependencies hold, no defect or unapproved deviation exists, and the remaining items are non-blocking. Follow-up conditions:
(1) implement the return-to-search state (F-01), shared with US-016 / US-017; (2) a visual and assistive-technology pass and, ideally,
browser-level tests before release (F-02, F-03); (3) COND-001 before any hosted use; (4) a human review of the change (F-05). **Related
stories:** the public profile and search that were missing when US-010 (AC-027) and US-013 (AC-033) failed now exist, so those two
stories can be re-validated; their reports and statuses were not changed by this validation. This does not imply the product is ready
for release.

## 12. Final Status

**PASS_WITH_WARNINGS**

## 13. Corrective Actions and Retest Guidance

No failed or blocking findings, so no corrective action is required for acceptance. Retest guidance: F-01, search, open a profile from
a result, go back, and confirm the field, filter, results and scroll position; F-02, open `/owner/providers/<id>` at about 375 px and
1280 px, tab through the links, and read the contact card and section counts with a screen reader. For the related stories, re-run P06.4
for US-010 and US-013 and assess AC-027 and AC-033 end to end through the search results and this profile.
