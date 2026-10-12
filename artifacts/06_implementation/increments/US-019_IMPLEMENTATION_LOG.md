# US-019 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-12 (local system date of the execution environment) |
| HU | US-019 — Book an appointment for my pet |
| Epic | EPIC-006 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Backlog status | PLANNED; scope MVP_CORE; P0 / SPRINT-001; 8 story points |
| Requirements | FR-021, FR-022, FR-024, FR-025 |
| Acceptance criteria | AC-046, AC-047, AC-048, AC-049, AC-050, AC-051, AC-108, AC-109 |
| Business rules | BR-005, BR-010, BR-011, BR-012, BR-013, BR-014, BR-024 |
| Edge cases | EDGE-004, EDGE-005, EDGE-006, EDGE-007, EDGE-009, EDGE-016, EDGE-030 |
| Backlog dependencies | DEP-001, DEP-002, DEP-005, DEP-006 |
| Architecture / contracts | `ARCHITECTURE_V2.md` (COMP-005/006/007/009, IF-009, IF-010, IF-011, IF-017, IF-019, IF-021, IF-024, CR-007, CR-008, CR-009); `ARCHITECTURE_VALIDATION_V2.md`; `API_SPEC_V1.yaml` (`/api/owner/pets`, `/api/services/{serviceId}/booking-context`, `/api/owner/appointments` POST, `BookingContext`, `BookAppointmentRequest`, `OwnerAppointment`); `DATA_MODEL_V1.md` (`appointment`, §6.2, §7.1) |
| UX | `UX_SPEC_V2.md` (SCR-UX-006, COMP-UX-010 slot picker, COMP-UX-004, MSG-SLOT-GONE, MSG-SPECIES-ONLY); `UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Related stories | US-009 working hours (the source of slots; validation BLOCKED only for lack of this story); US-010 services (FAIL, unrelated to booking); US-018 profile and US-016 search (entry points; PASS_WITH_WARNINGS); US-020 home visits, US-021 / US-024 appointment lists (planned, not implemented) |
| Implementation status | **READY_WITH_LIMITATIONS** |

## 2. Story Summary and Scope

**In scope.** A signed-in pet owner opens a service, sees the one-hour slots the provider offers, chooses one of their pets
of the service's species and books at the clinic; the appointment is scheduled at once with no confirmation. Delivered as the vertical slice:
`GET /api/owner/pets` (IF-009), `GET /api/services/{serviceId}/booking-context` (IF-010: service summary, eligible pets, flags,
seven days of offered slots), `POST /api/owner/appointments` (IF-011), the SCR-UX-006 screen at `/owner/services/:serviceId/book`, and its
entry points ("Agendar cita" on search results and on the provider profile).

**Boundary with US-020 (a judgment call, flagged for the team).** SCR-UX-006 and `POST /api/owner/appointments` serve both US-019 and
US-020. The backlog gives the home-visit address and the choice of modality (AC-052, AC-053, AC-054, EDGE-008, BR-015) to US-020, so this
increment books **at the clinic only**: a service offered only at the clinic is bookable; a service offered both ways is booked at the clinic
(the home option is announced as coming); a service offered only at home, which includes every service of an independent veterinarian
(TD-09), shows its slots but cannot be booked, and a request that would create a home appointment (`modality: "home"`, a home-only
service, or any `visitAddress`) is refused with `VALIDATION_FAILED` / `NOT_ALLOWED`. The booking transaction itself (`bookSlot`) takes the modality and the
address as data, so US-020 reuses it unchanged.

**Boundary with US-021 / US-024.** The appointment lists belong to those stories. After booking, the screen confirms the appointment in place
(it does not navigate to SCR-UX-007, which does not exist).

**Applicable criteria and rules.** All eight criteria, with the consequences of the two boundaries recorded in section 6.

## 3. Readiness Assessment

Implementation could proceed. The backlog entry is PLANNED, with no open questions. DEP-001 (owner session and guard, US-003), DEP-002
(pets: created at sign-up by US-001), DEP-005 (profile data from US-008 and offerings from US-010) and DEP-006 (working hours from US-009)
are all satisfied by implemented code. API_SPEC, DATA_MODEL and the UX specification define the operations, the data shapes, the lock and the
screen, and the `appointment` table with its partial unique index (CR-008) already exists, so no contract, schema or migration change was needed.

The two boundaries above leave three outcomes that cannot be fully demonstrated: AC-047's "appears in the owner's and the provider's
appointments" (needs US-021 / US-024), and the exercise of AC-050 / EDGE-007 for an independent veterinarian through the public API (every independent booking is a
home visit, US-020). Both are discussed in section 6. No blocker prevents the increment from existing and being validated.

## 4. Technical Implementation Plan

Initial plan, all steps completed:

1. Shared kernel: Bogotá calendar helpers (instant of a wall-clock hour, day arithmetic, Monday of a week, real-date check) and a canonical-UUID check.
2. Pure slot rules (`slots.js`): whole-hour slots from opening to one hour before closing, future starts only, clinic unlimited, independent excluding scheduled starts.
3. Neighbouring reads, exported by their owners (architecture rule: no direct access to another module's tables): `listOwnerPets` / `getOwnerPet` (COMP-005), `listWorkingHours` and `lockProvider` (COMP-006), `getServiceFacts` (COMP-007).
4. COMP-009 `booking.js`: request validation, `getBookingContext`, `bookSlot` (provider lock → re-check the slot → insert, with the unique index as the last line of defense), the modality gate for this increment, and the two routes; plus `GET /owner/pets`.
5. The SCR-UX-006 screen with the pet cards, the place line, the day/hour picker, the states of the UX specification and the in-place confirmation; entry links; styles with tokens only.
6. Tests: pure rules, request handling without a database, and PostgreSQL tests through the real module registry that create all data through the public endpoints.
7. Focused and full test runs, the build, a browser check on the local database, and cleanup.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/shared/clock.js` | Added `bogotaInstant`, `addDays`, `isoWeekday`, `mondayOf`, `isLocalDate` (calendar arithmetic on `YYYY-MM-DD`, no time zone, no DST). | CR-007; P02-ASM-007 |
| `src/shared/ids.js` | New `isUuid`, a canonical-UUID check. | CR-006 |
| `src/modules/scheduling/slots.js` | New. `isSlotOffered` and `computeWeekSlots`: slots on whole Bogotá hours, `start ≥ opening`, `start + 1 h ≤ closing`, `start > now`, independent veterinarians exclude scheduled starts, clinics never do. | AC-046, AC-049, AC-050, AC-051; BR-010 to BR-013; EDGE-005, EDGE-006, EDGE-009 |
| `src/modules/scheduling/booking.js` | New. `validateWeekStart`, `validateBookingRequest`, `resolveClinicModality`, `getBookingContext`, `bookSlot`, and `createBookingRouter` (`GET /services/:serviceId/booking-context`, `POST /owner/appointments`). | AC-046 to AC-051, AC-108, AC-109; IF-010, IF-011; BR-005, BR-014, BR-024 |
| `src/modules/pets/owner-pet.js` | Added `listOwnerPets`, `getOwnerPet` (IF-017 reads) and `createPetsRouter` (`GET /owner/pets`, IF-009); `createOwnerPet` unchanged. | AC-047, AC-048, AC-108, AC-109; BR-005 |
| `src/modules/provider/profile.js` | Added `lockProvider` (IF-024, `SELECT … FOR UPDATE` in the caller's transaction). | CR-009; DATA_MODEL 7.1 |
| `src/modules/provider/working-hours.js` | Added the exported read `listWorkingHours`; the hours routes are unchanged. | DEP-006; IF-019 |
| `src/modules/catalog/offerings.js` | Added the exported read `getServiceFacts`. | IF-021 |
| `src/modules/search/provider-profile.js` | Uses the shared `isUuid` instead of its own regular expression (US-018 file; behavior unchanged). | duplication removal |
| `src/modules/index.js` | Registered the pets and booking routers. | IF-009, IF-010, IF-011 |
| `client/src/pages/BookAppointment.jsx` | New SCR-UX-006: summary card, pet radio cards (ineligible pets disabled with their reason), place line, day chips with "Sin horarios", slot chips, week navigation (previous disabled on the current week), the no-pets, no-eligible-pet and no-hours states, home-service notice, validation messages, "Ese horario ya no está disponible" with reload of the slots, in-place confirmation with focus on its heading. | AC-046 to AC-051, AC-108, AC-109; FLOW-UX-010; COMP-UX-010 |
| `client/src/pages/OwnerSearch.jsx`, `client/src/pages/ProviderPublicProfile.jsx` | "Agendar cita" link (accessible name "Agendar cita: [name]") on service results and on the services of a profile. | SCR-UX-004 / SCR-UX-005 |
| `client/src/App.jsx` | Owner-only route `/owner/services/:serviceId/book`. | SCR-UX-006 |
| `client/src/design-system/global.css` | Booking layout, disabled choice cards, week navigation and chips (with a check by border and background, not color alone); tokens only. | CR-012 |
| `src/modules/README.md` | Documented the new reads, the lock and the booking module. | COMP-005/006/007/009 |
| `tests/booking-slots.test.js` | 13 tests of the calendar helpers, the slot rules, and the request validators. | AC-046, AC-049 to AC-051; EDGE-005, 006, 009 |
| `tests/booking.test.js` | 5 tests of request handling without a database. | IF-009, IF-010, IF-011; CR-006 |
| `tests/booking.database.test.js` | 17 PostgreSQL tests through the real registry. | AC-046 to AC-051, AC-108, AC-109; EDGE-004 to 007, 016, 030 |

Shared-code note: every change to code of earlier stories is an addition (exports, one route registration, two links, one route, CSS) or the
`isUuid` substitution; their tests pass unchanged (the 155 earlier tests are all part of the 190).

**Defect found by my own tests and fixed before delivery.** `new Date('2026-02-30T10:00:00-05:00')` is accepted by the JavaScript engine and rolls
over to 2 March, so an impossible date would have been booked as another day. The request validator now requires a real calendar date and valid hour,
minute and offset ranges.

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Files / evidence |
|---|---|---|---|
| AC-046 | A signed-in owner with at least one pet viewing a service who starts a booking is shown available one-hour slots only within the provider's working days and hours. | IMPLEMENTED | `computeWeekSlots` via IF-010. PostgreSQL test: a provider with Monday 8–12 and Tuesday 9–17 offers exactly the matching slots (last start one hour before closing) and nothing on other days; pure tests cover opening 0, closing 24 and the UTC-midnight crossing. Browser: day chips with "Sin horarios", slot grid, week navigation. |
| AC-047 | A pet owner who has chosen a pet and an available slot and books: the appointment is scheduled immediately, with no confirmation by the provider, and appears in the owner's and the provider's appointments. | PARTIALLY_IMPLEMENTED | Scheduled immediately with no confirmation: `201` with `status: "scheduled"`, the row stored with owner, pet, service, provider, provider capacity, start instant, modality `clinic`; the screen confirms it. **Not implemented:** the owner's and the provider's appointment lists (US-021 / US-024); the only evidence that it "appears" is the stored row and the booking response. |
| AC-048 | An owner with no registered pets who tries to book is not allowed and is told to register a pet first. | IMPLEMENTED | Context `ownerHasPets: false`; `POST` → `422 NO_PETS`; the screen replaces the form with "Para agendar necesitas tener al menos una mascota registrada." (state reachable in tests only by deleting the pet in SQL, as the UX notes: pet removal is not delivered). |
| AC-049 | A clinic that already has an appointment in a slot within its working hours still offers that slot to another owner. | IMPLEMENTED | Three owners booked the same clinic slot (all `201`); the slot is still offered; concurrent bookings of one clinic slot (6) all succeed. Browser: the booked 10:00 slot was still offered. |
| AC-050 | An independent veterinarian that already has an appointment in a slot does not offer it to another owner. | IMPLEMENTED (with a limit) | A scheduled appointment hides exactly its slot; a cancelled one does not. **Limit:** an independent veterinarian's appointments are home visits (US-020), so that state could be created only by inserting the row directly and by calling the booking core `bookSlot`; 8 concurrent calls of the core on one slot leave exactly one appointment and 7 `SLOT_UNAVAILABLE` (EDGE-007). Not reachable through the public booking API in this increment. |
| AC-051 | Slots whose start time has already passed are not offered. | IMPLEMENTED | `start > now` (a slot starting exactly now is not offered; one millisecond earlier it is). The booking re-checks it: past starts return `409 SLOT_UNAVAILABLE`. |
| AC-108 | An owner with pets of different species booking a service for one species can choose only their pets of that species. | IMPLEMENTED | `eligiblePetIds` equals the owner's pets of the service species; ineligible pets are shown disabled with "Este servicio es solo para …"; the server returns `422 PET_NOT_ELIGIBLE` for another species and `404` for someone else's pet. |
| AC-109 | An owner with no pet of the service's species who tries to book that service is not allowed and is told it is only for the other species. | IMPLEMENTED | `eligiblePetIds: []`; `POST` → `422 PET_NOT_ELIGIBLE`, nothing written; the screen shows the warning, the disabled pets, and hides sections 2, 3 and the button. |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-005 | Booking needs at least one pet and the pet must belong to the owner (`NO_PETS`; someone else's pet → `NOT_FOUND`). |
| BR-010 | An appointment lasts one hour: `endsAt = startsAt + 1 h`; a slot must fit before closing. |
| BR-011 | Slots only within working days and hours, re-checked under the provider lock at booking (hours changed after the owner saw them → `409`). |
| BR-012 | Clinics accept any number of appointments per slot (no uniqueness, concurrent bookings succeed). |
| BR-013 | Independent veterinarians: one scheduled appointment per start, enforced twice: the offered-slot check under the provider lock and the partial unique index `appointment_independent_slot_uq`. |
| BR-014 | Created as `scheduled` immediately; no confirmation step exists. |
| BR-024 | Pet species must equal the service species. |
| EDGE-004 / EDGE-030 | `NO_PETS` / no eligible pet (AC-048 / AC-109). |
| EDGE-005 / EDGE-009 | Slots outside hours or in the past are not offered and are refused at booking. |
| EDGE-006 | A scheduled independent slot is not offered. |
| EDGE-007 | The provider lock serializes bookings; the loser gets `SLOT_UNAVAILABLE` ("Ese horario ya no está disponible. Elige otro."). Verified at the `bookSlot` level (see AC-050). |
| EDGE-016 | An ineligible pet cannot be chosen and is refused by the server. |
| DEP-001 / DEP-002 / DEP-005 / DEP-006 | Owner-only access; pets from sign-up; provider and service data as stored; hours from US-009 (changes take effect on the next read). |

## 8. Tests and Verification Results

Tests added: `tests/booking-slots.test.js` (13), `tests/booking.test.js` (5) and `tests/booking.database.test.js` (17): 35 new tests. Executed:

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Baseline | Not run before editing; the US-018 validation report records 155 tests | NOT_RUN | After registering the new modules and before adding tests, `npm test` gave 155 of 155. |
| Focused tests | `node --env-file-if-exists=.env --test tests/booking-slots.test.js tests/booking.test.js tests/booking.database.test.js` | PASSED | 35 of 35, 0 skipped; PostgreSQL ran against `TEST_DATABASE_URL`. (The date-rollover defect above was found by the first run of the pure tests and fixed.) |
| Full regression | `npm test` | PASSED | 190 tests, 190 passed, 0 failed, 0 skipped (155 + 35). |
| Production build | `npm run build` | PASSED | 38 modules transformed. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Browser check | Local API and Vite servers on the local dev database: a clinic with hours 0–24 every day and a dog service, a cat service offered both ways, a home service; an independent veterinarian with a cat home service; an owner with one dog; an owner without pets | PASSED (manual) | From the search result "Agendar cita": summary, pet pre-selected, "Semana anterior" disabled, next week auto-selects the first day with slots, accessible slot names ("lunes, 12 de octubre, 10:00 a. m. a 11:00 a. m."); submitting without a slot shows "Elige un horario."; booking shows the confirmation and moves focus to its heading, and the stored row is `scheduled`, `clinic`, no visit address, 15:00 UTC = 10:00 Bogotá; the cat service shows the species warning with the disabled pet and no form; the home service shows slots, the notice and a disabled button; the independent veterinarian's slot with an appointment is missing while the clinic's booked slot is still offered; after the provider removed Mondays, submitting a Monday slot shows "Ese horario ya no está disponible. Elige otro.", reloads the slots, clears the selection and keeps the pet; the owner without pets sees the info alert. A cosmetic double period ("a. m..") in the confirmation was found here and fixed. Test data deleted afterwards (0 left). Visual appearance was not assessed (screenshots unavailable). |
| Navigation to SCR-UX-007 and the owner's / provider's lists | — | NOT_RUN | The screens and endpoints do not exist (US-021, US-024). |
| Hosted Vercel / Neon behavior | — | NOT_RUN | COND-001 remains open. |

## 9. Repository Changes

Created: `src/modules/scheduling/slots.js`, `src/modules/scheduling/booking.js`, `src/shared/ids.js`, `client/src/pages/BookAppointment.jsx`,
`tests/booking-slots.test.js`, `tests/booking.test.js`, `tests/booking.database.test.js`, and this log. Modified: `src/shared/clock.js`,
`src/modules/pets/owner-pet.js`, `src/modules/provider/profile.js`, `src/modules/provider/working-hours.js`, `src/modules/catalog/offerings.js`,
`src/modules/search/provider-profile.js`, `src/modules/index.js`, `src/modules/README.md`, `client/src/pages/OwnerSearch.jsx`,
`client/src/pages/ProviderPublicProfile.jsx`, `client/src/App.jsx`, `client/src/design-system/global.css`,
`artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. Deleted: none. No migration, dependency manifest, lockfile, `.env`, API contract or earlier
validation report was changed. No commit was made.

## 10. Architecture Conformance and Deviations

Conforms to COMP-009 / IF-010 / IF-011 and to the transaction in DATA_MODEL 7.1: provider lock → read hours → check the slot → insert → commit, on one
pooled connection, with row locks only (CR-024). COMP-009 writes only `appointment`; everything else is read through exported reads of the owning
modules (IF-017, IF-019, IF-021) and the lock IF-024, as the architecture's dependency diagram shows. Dates are Bogotá wall-clock with a fixed offset
(CR-007), the response keys equal the API_SPEC schemas (tests read the spec), the server re-validates everything, and errors are CTR-001 outcomes.

Documented deviations (no formal architectural review needed, but visible to the team):

- **Scope split with US-020** (section 2): the endpoint refuses home appointments until that story.
- **UX SCR-UX-006**: section 2 shows only the clinic case; after booking the screen confirms in place instead of navigating to SCR-UX-007 with a toast; the slot help line and the labels follow the specification.
- A service offered both ways is booked at the clinic with `modality: "clinic"` sent explicitly by the client, because the choice (AC-054) is US-020.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Type | Impact / next action |
|---|---|---|
| AC-047's "appears in the owner's and the provider's appointments" cannot be demonstrated until US-021 / US-024. | Dependency on planned stories | P06.4 will weigh it as it did AC-027 / AC-033; re-validate after those stories. |
| Independent veterinarians (home-only) cannot be booked until US-020; AC-050 and EDGE-007 are verified with seeded rows and at `bookSlot` level. | Boundary decision | Implement US-020 next; add API-level tests of the independent race then. |
| Home-only services show slots but have a disabled button and a "coming" notice; a service offered both ways is fixed to the clinic. | Interim UX, not in the UX specification | Replace with the SCR-UX-006 section 2 controls in US-020. |
| The wording of the in-place confirmation and the placement of the "Agendar cita" links on result and profile cards are implementation choices within the UX specification. | Minor | None. |
| Pet removal (US-007) is not delivered, so the "no pets" state exists only for data created by hand. | UX note | None. |
| Slot generation scans 24 hours × 7 days in memory per request and queries a week of one provider's appointments; fine for the MVP volumes. | Performance note | Revisit if profiling shows a need. |
| Visual layout, keyboard and screen-reader behavior not verified; hosted runtime (COND-001) not verified. | Unverified behavior | P06.4 and P07. |

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** The slot rules, the pet and species rules, the atomic booking with its race protection, the three endpoints and the
screen are implemented and pass every executed check. The limitations are the boundaries with US-020 and US-021 / US-024, no visual pass and the hosted
runtime. This status is not a validation result.

## 13. Handoff to P06.4

Validate **US-019** from `artifacts/03_planning/product_backlog_priori_v2.json`. Inspect `src/modules/scheduling/slots.js`, `src/modules/scheduling/booking.js`,
the added exports in `src/modules/pets/owner-pet.js`, `provider/profile.js`, `provider/working-hours.js` and `catalog/offerings.js`, `src/shared/clock.js`,
`src/shared/ids.js`, `client/src/pages/BookAppointment.jsx` and the two entry links, plus the three new test files. Independently run `npm test` (with
`TEST_DATABASE_URL` set), `npm run build` and `git diff --check`. Specifically verify:
(1) the slot rules at every boundary (opening, closing, 00:00, 23:00, UTC midnight, now exactly at a slot, week edges, past and far-future weeks);
(2) the booking transaction: provider lock, re-check, insert, the unique-index fallback, and atomicity (nothing stored on any refusal);
(3) clinic vs independent availability, including the race, and that clinics are never limited;
(4) pet rules: no pets, ineligible species, someone else's pet, malformed ids, NOT_FOUND uniformity, authorization and Origin;
(5) request validation, especially impossible dates and offsets, and the refusal of home appointments in this increment;
(6) that the earlier stories are unaffected (all earlier tests, plus the unchanged hours and profile routes);
(7) the screen in the browser: states, week navigation, accessibility names, error recovery after a slot disappears;
(8) how AC-047 (lists of appointments) and AC-050 (independent bookings) must be decided given the two boundaries, applying the same standard used for AC-027 and AC-033.
