# US-019 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Report version | 1.0 (first validation of US-019; no earlier report exists) |
| Validation date | 2026-10-12 |
| HU | US-019 — Book an appointment for my pet (EPIC-006, P0 / SPRINT-001, 8 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` (backlog status PLANNED) |
| Implementation log | `artifacts/06_implementation/increments/US-019_IMPLEMENTATION_LOG.md` |
| Requirements / criteria | FR-021, FR-022, FR-024, FR-025; AC-046, AC-047, AC-048, AC-049, AC-050, AC-051, AC-108, AC-109 |
| Business rules / edge cases | BR-005, BR-010 to BR-014, BR-024; EDGE-004, 005, 006, 007, 009, 016, 030 |
| Dependencies | DEP-001, DEP-002, DEP-005, DEP-006 |
| Foundation validation | PASS_WITH_WARNINGS |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **FAIL** |

**Independence limitation (stated, not removed).** The implementation and this validation were produced by the same AI assistant in the same
session; no separate reviewer or human has reviewed either. To reduce the effect, this validation re-read the code from disk, compared the log with
the working tree, re-ran every check from the command line, wrote an independent oracle for the slot rules that shares no code with the
implementation (plain UTC arithmetic, 5,200 random configurations), ran a 38-probe script on the real stack that includes a booking-versus-hours
storm, mutation-tested the tests with 24 deliberate breaks (which exposed two weak spots, fixed here), and repeated the browser verification with
different data, the real sign-in form, a forced network failure, the keyboard and a phone-width layout. It does not replace human review (F-06).

## 2. Executive Summary

- **Validated:** `GET /api/owner/pets` (IF-009), `GET /api/services/{serviceId}/booking-context` (IF-010), `POST /api/owner/appointments` (IF-011) for
  in-clinic appointments, the pure slot rules, the neighbouring reads they use, the SCR-UX-006 screen and its entry links, and the tests.
- **What works:** seven of the eight criteria are supported by direct evidence. The offered slots equal an independent oracle in 5,200 random
  configurations; booking succeeds exactly when the slot was offered and writes nothing otherwise; clinics accept any number of appointments per slot and
  keep offering it; an independent veterinarian's booked slot is hidden, and 16 concurrent bookings of one such slot leave exactly one; bookings and
  working-hours changes raced against each other leave no appointment outside the final hours and no 5xx; pet, species and ownership rules hold; the
  screen works with the keyboard, after a network failure and at 375 px.
- **What does not:** AC-047 requires the appointment to appear in the owner's and the provider's appointments. Those lists (US-021, US-024) do not exist, so
  this part of the criterion cannot be observed anywhere in the product; the only evidence is the stored row and the booking response. This is the same
  situation as AC-027 (US-010) and AC-033 (US-013), and it is decided the same way: a required criterion whose stated outcome cannot occur is not
  satisfied. The booking code itself has no defect found.
- **Decision:** **FAIL**, with the single cause F-01 (HIGH). Booking at the clinic is sound; re-run this validation once US-021 and US-024 exist.

## 3. Validation Scope and Limitations

**This is HU-level validation of US-019, not product-wide testing.** P07, CI/CD and release readiness are not covered.

**Examined:** `src/modules/scheduling/slots.js`, `src/modules/scheduling/booking.js`, the added exports of `src/modules/pets/owner-pet.js`,
`provider/profile.js` (`lockProvider`), `provider/working-hours.js` (`listWorkingHours`), `catalog/offerings.js` (`getServiceFacts`), `src/shared/clock.js`,
`src/shared/ids.js`, `src/modules/index.js`, `client/src/pages/BookAppointment.jsx`, the entry links in `OwnerSearch.jsx` and `ProviderPublicProfile.jsx`,
`client/src/App.jsx`, `client/src/design-system/global.css`, the three booking test files, `migrations/001_initial_schema.sql` (`appointment`),
`API_SPEC_V1.yaml`, `DATA_MODEL_V1.md` §6.2 and §7.1, and UX SCR-UX-006 and COMP-UX-010.

**Criteria included:** all eight in the backlog. **Scope boundaries accepted as designed in the log** (not counted against the story): the visit address and
the modality choice (US-020: AC-052 to AC-054) and the appointment lists (US-021, US-024).

**Could not be verified:** the lists of appointments (do not exist); the product-level path that books an independent veterinarian (home-only, US-020), so
AC-050's "already has an appointment" state was produced by inserting rows and by calling the booking core; visual appearance (screenshots unavailable;
layout was checked through the DOM and computed sizes); screen-reader speech; the "Elige una mascota." message for an owner with several eligible pets
(code inspection only; the single-pet case is pre-selected); hosted Vercel/Neon behavior (COND-001).

## 4. Acceptance Criteria Validation Matrix

| Criterion ID | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-046 | A signed-in owner with at least one pet viewing a service who starts a booking is shown available one-hour slots only within the provider's working days and hours. | `computeWeekSlots`, `getBookingContext`; `BookAppointment.jsx` | Independent oracle (5,200 configurations, 36,400 days), PostgreSQL tests, browser, mutations S2, S3, S6, S7 | **PASS** | Slots start on whole Bogotá hours from opening to one hour before closing; days off, other weekdays and out-of-range hours offer nothing; boundaries (opening 0, closing 24, 23:00 vs UTC midnight, leap day, year change) match the oracle with 0 mismatches. In the browser: day chips with "Sin horarios", hourly chips with full accessible names, week navigation. | — |
| AC-047 | An owner who has chosen a pet and an available slot and books: the appointment is scheduled immediately, with no confirmation by the provider, and appears in the owner's and the provider's appointments. | `bookSlot`, the `POST` route; the in-place confirmation | PostgreSQL tests, 70-instant agreement probe, browser, row inspection | **FAIL** | **Scheduled immediately, no confirmation: verified.** `201`, `status: "scheduled"`, one transaction; the stored row has owner, pet, service, provider, capacity, UTC start, modality `clinic`, no visit address; six notations of one instant store the same instant. **"Appears in the owner's and the provider's appointments": not verifiable.** No route or page lists appointments (US-021, US-024); the success screen is in place and SCR-UX-007 does not exist. | F-01 |
| AC-048 | An owner with no registered pets who tries to book is not allowed and is told to register a pet first. | `NO_PETS`; `ownerHasPets`; the info alert | PostgreSQL test, browser, mutations B3, B9 | **PASS** | Context `ownerHasPets: false`; `POST` → `422 NO_PETS` with nothing written; the screen replaces the form with "Para agendar necesitas tener al menos una mascota registrada." (the state exists only for data created by hand, as the UX notes). | — |
| AC-049 | A clinic that already has an appointment in a slot within its hours still offers that slot to another owner. | `isSlotOffered` (clinic branch) | Oracle, PostgreSQL tests, probes, browser, mutation S4 | **PASS** | After 70 random bookings the same slots were all still offered; three owners booked one clinic slot (all `201`); 6 concurrent bookings of one slot all succeeded. Browser: the slot booked by one owner was offered to the next, who booked it too. | — |
| AC-050 | An independent veterinarian that already has an appointment in a slot does not offer it to another owner. | `isSlotOffered` (independent branch), `listScheduledStarts` | Oracle (random booked sets), PostgreSQL tests, probes, browser, mutation S5 | **PASS** (with a stated limit) | A scheduled appointment hides exactly its slot and no other; a cancelled one does not; 16 concurrent calls of the booking core on one slot leave exactly one appointment and 15 `SLOT_UNAVAILABLE`; the database index also rejects a duplicate. **Limit:** because an independent veterinarian's appointments are home visits (US-020), the "already has an appointment" state could be created only by inserting rows and by `bookSlot`, not through the public booking API. The criterion describes slot listing, which is fully verified. | F-02 |
| AC-051 | Slots whose start time has already passed are not offered. | `start > now` in `isSlotOffered`; re-check in `bookSlot` | Oracle (clock before, inside and after the week, arbitrary minutes and milliseconds), PostgreSQL tests, mutations S1, B11 | **PASS** | A slot starting exactly now is not offered; one millisecond earlier it is; past slots are refused at booking with `409`; a past week offers nothing. | — |
| AC-108 | An owner with pets of different species booking a service for one species can choose only their pets of that species. | `eligiblePetIds`; `PET_NOT_ELIGIBLE`; disabled pet cards | PostgreSQL tests, probes, browser, mutations B2, B8 | **PASS** | Eligible ids equal the owner's pets of the service species; another species → `422 PET_NOT_ELIGIBLE`; someone else's pet or an unknown pet → the same `404` body; ineligible pets are disabled with "Este servicio es solo para …". | — |
| AC-109 | An owner with no pet of the service's species who tries to book that service is not allowed and is told it is only for the other species. | same | PostgreSQL test, browser | **PASS** | `eligiblePetIds: []`; `POST` → `422 PET_NOT_ELIGIBLE`, nothing written; the screen shows the warning and the disabled pet, and hides the place, time and button sections. | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Notes |
|---|---|---|---|---|
| BR-005 | A booking needs a pet of the owner. | `NO_PETS`; ownership check (mutation B4 killed). | PASS | |
| BR-010 | An appointment lasts one hour. | `endsAt = startsAt + 1 h` (mutation B7 killed); slots fit before closing (S2 killed). | PASS | |
| BR-011 | Only within working days and hours. | Oracle; re-check under the provider lock; the storm leaves no appointment outside the final hours. | PASS | |
| BR-012 | A clinic accepts any number per slot. | See AC-049. | PASS | |
| BR-013 | An independent veterinarian accepts one per slot. | See AC-050; lock-protected check plus the unique index. | PASS | |
| BR-014 | Scheduled at once, no confirmation. | `status: "scheduled"` on creation; no other status is ever written by the story (B15 killed). | PASS | |
| BR-024 | Same species only. | See AC-108. | PASS | |
| EDGE-004, 030 | No pets / no pet of the species. | See AC-048, AC-109. | PASS | |
| EDGE-005, 009 | Outside hours / past: not offered. | Oracle; refused at booking. | PASS | |
| EDGE-006 | Booked independent slot: not offered. | See AC-050. | PASS | |
| EDGE-007 | Two owners, same independent slot at almost the same time. | 16 concurrent core bookings: exactly one wins, the others get `SLOT_UNAVAILABLE`, and the UI message is "Ese horario ya no está disponible. Elige otro." | PASS (at core level) | Not reachable through the public API until US-020. |
| EDGE-016 | A pet of another species cannot be chosen. | See AC-108. | PASS | |
| DEP-001, 002, 005, 006 | Owner-only; pets; provider data; working hours. | Anonymous → `401`, provider → `404`, foreign Origin → `403`; hours saved by US-009 change the slots on the next read and cancel affected appointments. | PASS locally | Hosted auth under COND-001. |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Full regression suite | `npm test` (`TEST_DATABASE_URL` set from `.env`) | PASSED | 192 tests, 192 pass, 0 fail, 0 skipped; database tests executed. The log reports 190: this validation added 2 tests (section 9, F-03). |
| Booking tests | `node --env-file-if-exists=.env --test tests/booking-slots.test.js tests/booking.test.js tests/booking.database.test.js` | PASSED | 37 of 37 (13 + 5 + 19). |
| Production build | `npm run build` | PASSED | 38 modules transformed. |
| Patch hygiene | `git diff --check` | PASSED | No whitespace errors. |
| Independent oracle | Throwaway script outside the repository; UTC-arithmetic reimplementation of the slot rules | PASSED | 5,200 random configurations (random hours per weekday, clinic/independent, random booked sets, random "now" including before, inside and after the week and arbitrary minutes/milliseconds, 208 start weeks including year ends, leap day and month ends): 0 mismatches across 36,400 days and 104,000 single-slot probes. |
| Adversarial probe script | Throwaway script; real module registry; temporary PostgreSQL schema; all data created through the public endpoints | PASSED | 38 probes, 0 failed (a first run showed 2 failures caused by my script choosing a Wednesday that has only a 09:00 slot; the script was corrected and rerun): booking succeeds iff offered for 70 random instants over 3 weeks, refusals are `409` and write nothing; six notations of one instant; nine malformed bodies with no 5xx and no rows; impossible dates and odd formats → `422`; modality matrix; species and ownership; independent hiding, double-booking and a 16-way race; a storm of 24 bookings and 6 hours changes on one clinic with no 5xx, no appointment left outside the final hours, and consistent cancellations. Schema dropped (0 left). |
| Mutation check of the tests | 24 single-line breaks across `slots.js`, `booking.js`, `owner-pet.js`, `clock.js`; booking tests re-run; files restored and hashes compared | PASSED (after two fixes) | 21 killed at once (S1–S7, B2–B4, B7–B11, B13–B17, C1). Three survived: **B12** (default week not the Monday) because every test used a clock that was already a Monday; **B1** (provider lock removed) because the unique index masks the independent race and no deterministic test held the lock; **B5** (unique-index fallback removed), an equivalent mutant because the lock and the check make it unreachable (defense in depth). B12 and B1 are now killed by two added tests; B5 remains as documented. |
| Browser flow (repeated independently) | Local servers on the local dev database; owner signed in through the real sign-in form; clinic with a cat service offered both ways and a dog clinic service; second owner | PASSED (manual) | Deep-link reload on the booking URL keeps the session; forced network failure shows the error with "Reintentar", retry loads; next week selects the first day with slots; ArrowRight moves Monday → Tuesday, shows 10 slots and clears the slot; booking the "both" service sends `modality: "clinic"` and stores `clinic`, no address; the confirmation is read without a double period and focus is on its heading (a cosmetic defect found in P06.3 and fixed); another owner still sees and books the same clinic slot; at 375 px there is no horizontal overflow, the button is full width and chips are 44 px high. Test data deleted afterwards (0 left; viewport reset). |
| Visual appearance, screen-reader speech, "Elige una mascota." with several eligible pets | — | NOT_RUN | Screenshots unavailable; speech not exercised; message verified by code inspection only. |
| Hosted Vercel / Neon runtime | — | NOT_RUN | COND-001. |
| Clean reinstall (`npm ci`) | — | NOT_RUN | No manifest or lockfile changed. |

A passing suite is not treated as proof of coverage. The new tests were read for their assertions (exact slot lists, stored columns, row counts after
refusals, concurrent outcomes) and the mutation check, which found the two weak spots, shows they now fail when each rule is broken.

## 7. Architecture, UX, and Integration Conformance

- **Architecture:** conforms. COMP-009 writes only `appointment` and reads other modules only through their exported reads (IF-017, IF-019, IF-021) and the
  provider lock (IF-024); the transaction follows DATA_MODEL 7.1 (lock → read hours → check → insert → commit) on one connection with row locks only
  (CR-024); dates are Bogotá wall-clock with a fixed offset (CR-007); the responses equal the API_SPEC schemas (tests read the spec); the server
  re-validates everything; all errors are CTR-001 outcomes. No migration, dependency or contract change. The race with the hours save is protected by
  the shared lock (CR-009), now covered by a deterministic test.
- **UX (SCR-UX-006, COMP-UX-010):** matches the title, summary card, pet radio cards with disabled-with-reason, the place line, day chips with "Sin horarios",
  hourly chips, week buttons ("Semana anterior" disabled on the current week), the help lines, the three special states, MSG-SLOT-GONE with slot reload,
  and focus on the confirmation heading. **Deviations (documented in the log):** section 2 shows only the clinic case (US-020 owns the modality choice and
  the visit address); the confirmation is in place instead of navigating to SCR-UX-007 with a toast (that screen is US-021); home-only services show their
  slots but have a disabled button and a "coming" notice. These are scope boundaries, not defects of this story, except that they are the direct cause of F-01 and F-02.
- **Integration:** the "Agendar cita" links work from the search results and from a provider profile; the hours routes of US-009 are unchanged (the new
  `listWorkingHours` is a separate export) and a working-hours change cancels or hides slots exactly as the storm showed; all 155 earlier tests pass.
- **Scope:** limited to US-019 and the neighbouring reads it needs. No home-visit, appointment-list, cancellation or rescheduling behavior was implemented.

## 8. Security, Data Integrity, and Regression Findings

No defect found. Observed: owner-only access with authentication and role before any lookup; ids checked as canonical UUIDs and never built into SQL;
identity and provider type from the session and the database; ownership of the pet enforced and answered with the same `404` as an unknown pet; the
request is rejected when it carries unknown fields (`ownerId`, `status`, `providerId`, `visitAddress`) or impossible dates; the provider lock serializes
bookings and hours saves (storm: no deadlock, no 5xx, no appointment outside the final hours, `status`/`cancelled_at` always consistent); the database
constraints and the partial unique index remain a second layer. One defect was found by the story's own first test run and fixed before delivery: an
impossible date such as `2026-02-30` was silently rolled over to 2 March by the JavaScript `Date`; it is now refused, and this validation re-confirmed it
with six additional malformed forms. Not verifiable here: hosted behavior.

## 9. Findings Register

**Mandatory corrections:** F-01.

| ID | Severity | Title | Criterion | Evidence | Why it matters | Corrective action | Closure criteria |
|---|---|---|---|---|---|---|---|
| F-01 | HIGH | The booked appointment cannot be seen in the owner's or the provider's appointments | AC-047 | No route in `src/modules` lists appointments and no client page shows them; US-021 (owner) and US-024 (provider) are PLANNED. The success screen is in place; SCR-UX-007 does not exist. The only evidence that the appointment "appears" is the stored row and the response. | A required part of AC-047 cannot occur, so neither party can see what was booked. | Implement the planned US-021 and US-024 in their own authorized increments, reading the stored appointments (IF-012, IF-013); then navigate from the confirmation to SCR-UX-007 as specified. Do not widen US-019 to build them and do not change AC-047. | As an owner book a clinic slot, see it in "Mis citas"; sign in as the provider and see it in its appointments; keep the evidence; re-run P06.4 for US-019. |
| F-02 | LOW | Independent veterinarians and home services cannot be booked until US-020 | AC-050 (evidence) | Every independent veterinarian's service is home-only (TD-09); the endpoint refuses `home` with `NOT_ALLOWED`. AC-050's "already has an appointment" state was therefore produced with inserted rows and the booking core. | Slot hiding for independents cannot yet be demonstrated end to end through the public API. | Implement US-020 (address and modality choice) reusing `bookSlot`; add API-level tests for the independent race and slot hiding then. | An independent veterinarian is booked through the API and its slot disappears for the next owner. |
| F-03 | INFO | Two weak spots in the original tests were found and fixed during validation | BR-011, CR-009 | Mutations B12 (default week) and B1 (provider lock) survived. Added: a test of the default week on Wednesday and near Sunday midnight (UTC already Monday), and a deterministic test where another transaction holds the provider lock, the booking waits, and then sees the hours saved meanwhile. Production code was not edited. | The suite now genuinely protects both behaviors. | None. | Done: B1 and B12 are killed. |
| F-04 | INFO | The same pet can hold several appointments in the same slot | BR-005 | Probe: one pet booked twice at the same clinic and slot (`201`/`201`); no requirement or constraint forbids it. | May be unintended, e.g. an accidental double click. | Optional: ask the team whether to prevent overlapping appointments of one pet. | Team decision. |
| F-05 | LOW | Layout and assistive technology not visually verified; no automated client tests; one message checked by inspection only | SCR-UX-006 | Screenshots unavailable; no client test runner; "Elige una mascota." for several eligible pets not exercised in the browser. | Visual defects or UI regressions would go unnoticed. | Optional follow-up for P07: browser-level tests of search → book → confirmation and a visual and screen-reader pass at about 375 px and 1280 px. | Recorded evidence. |
| F-06 | INFO | Same assistant implemented and validated; no human review | All | Section 1. | Shared blind spots are possible. | Team review of the diff. | Reviewer sign-off. |

## 10. Implementation Log Consistency

The log matches the repository: the created, modified and untouched files agree with `git status`; at the end of P06.3 the suite had 190 tests (35 new) and
it still does for that state; the statements that no migration, manifest, lockfile, `.env`, API contract or earlier report changed hold; the scope boundaries,
the interim UI for home services, the in-place confirmation and the date-rollover defect are all disclosed accurately. This validation added two tests
(booking database tests 17 → 19, total 190 → 192), so the log's counts describe the state before validation; the log was not edited to avoid rewriting
history. The status READY_WITH_LIMITATIONS is consistent with the evidence.

## 11. Readiness Decision

US-019 is **not** ready to be considered validated. The slot rules, the atomic booking, the pet and species rules, the concurrency behavior and the screen
are sound, and seven of eight criteria pass on direct evidence, but AC-047 requires the appointment to appear in the owner's and the provider's
appointments, which cannot occur until the lists exist. A required criterion that is materially unsatisfied cannot be accepted as a warning. This report
does not authorize implementing US-020, US-021 or US-024 inside this increment, and does not imply product-wide testing or release readiness.

## 12. Final Status

**FAIL**

AC-046, AC-048, AC-049, AC-050, AC-051, AC-108 and AC-109 passed. AC-047 failed on "appears in the owner's and the provider's appointments" (F-01).

## 13. Corrective Actions and Retest Guidance

For F-01: (1) implement the owner's and the provider's appointment lists (US-021, US-024) as separate, approved increments; (2) make the booking confirmation
lead to SCR-UX-007 as the UX specifies; (3) as an owner, book a clinic slot and find it under "Mis citas"; as the clinic, find it in the provider's
appointments with the pet, owner name, service, time and modality; (4) keep automated and manual evidence; (5) re-run P06.4 for US-019 and evaluate AC-047
against its original text. The other seven criteria need no retest unless the booking or slot code changes. For F-02, implement US-020 and then verify the
independent veterinarian flow through the API. For F-05, open `/owner/services/<id>/book` at about 375 px and 1280 px, tab through every group and listen to
the pet, place and time groups with a screen reader, and book with two eligible pets leaving the pet unchosen to see "Elige una mascota.".
