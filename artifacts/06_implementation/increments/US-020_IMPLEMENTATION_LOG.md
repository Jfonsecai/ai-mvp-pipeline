# US-020 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-12 |
| HU | US-020 — Book a home visit |
| Epic | EPIC-006 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Backlog status | PLANNED; MVP_CORE; P0 / SPRINT-001; 2 story points |
| Requirements | FR-022, FR-023 |
| Acceptance criteria | AC-052, AC-053, AC-054 |
| Business rules | BR-007, BR-015 |
| Edge cases | EDGE-008 |
| Dependencies | DEP-001, DEP-006 |
| Architecture / contracts | `ARCHITECTURE_V2.md` (COMP-009, IF-011); `API_SPEC_V1.yaml` (`BookAppointmentRequest`, `OwnerAppointment`); `DATA_MODEL_V1.md` (`appointment.visit_address`) |
| UX | `UX_SPEC_V2.md` (SCR-UX-006) and `UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Implementation status | **READY_WITH_LIMITATIONS** |

## 2. Story Summary and Scope

Implement the US-020 vertical slice that lets an owner book an offered home service with a visit address, including choosing clinic or home for a service offered both ways. The authoritative criteria are AC-052 through AC-054. The increment reuses the existing US-019 booking flow, scheduling transaction, and `appointment.visit_address` column.

In scope: address validation and persistence, modality selection/validation, conditional address entry, booking response details, focused tests, and relevant module documentation. Out of scope: implementing the provider's appointment list or another user story. The provider-visible appointment list belongs to US-024; its absence means the provider-visibility portion of AC-052 remains incomplete.

## 3. Readiness Assessment

Implementation proceeded. DEP-001 (owner authentication/session) and DEP-006 (provider working hours) are available through the existing modules and are exercised through the real module registry in PostgreSQL integration tests. The existing schema already stores `visit_address` and enforces the home/address relationship, so no migration was necessary.

The existing US-019 validation reports that the owner/provider appointment lists (US-021/US-024) are not implemented. This does not block implementing address capture and booking, but it prevents claiming the full provider-visibility outcome in AC-052. That limitation was preserved rather than expanding this increment.

## 4. Technical Implementation Plan

1. Extend COMP-009 booking request validation for a trimmed address with a 300-character maximum.
2. Resolve clinic, home, and both-way service modalities; require a choice for both-way offerings, require an address only for home, and reject addresses for clinic bookings.
3. Pass the selected modality/address through the existing transactional booking path and return the place details.
4. Update SCR-UX-006 with modality choices and an address field that is required only for home bookings.
5. Add focused unit and PostgreSQL integration coverage; run the build and regression suite.

All in-scope implementation steps were completed. Provider appointment-list visibility is explicitly outside US-020.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/scheduling/booking.js` | Validates and trims `visitAddress`, enforces the 300-character limit, resolves clinic/home/both modality, passes home address through the existing transaction, and returns the selected place in the booking response. | AC-052–054; BR-007, BR-015; EDGE-008; IF-011 |
| `client/src/pages/BookAppointment.jsx` | Adds the clinic/home choice for both-way services; shows the address field only for home, retains the value when switching modality, validates the required address, and sends the address only for home bookings. | AC-053, AC-054; SCR-UX-006 |
| `client/src/design-system/global.css` | Styles the modality choice and visit-address field using existing UI patterns. | SCR-UX-006 |
| `tests/booking.test.js` | Covers address trimming, missing/blank/wrong-type inputs, and the maximum length. | AC-053; EDGE-008 |
| `tests/booking.database.test.js` | Exercises home bookings for independent and clinic providers; verifies `201`, normalized address in response and database, missing/blank/too-long address rejection with no write, both-way modality choice, and clinic address rejection. | AC-052–054; BR-015; EDGE-008 |
| `tests/booking-slots.test.js` | Updates unit coverage for clinic, home, and both-way modality resolution. | BR-007 |
| `src/modules/README.md` | Documents clinic and home bookings and identifies appointment-list work as pending. | Module documentation |

No schema migration, API contract change, dependency change, or unrelated user story was added.

## 6. Verification Results

| Check | Result | Evidence |
|---|---|---|
| Focused booking tests: `node --env-file-if-exists=.env --test tests/booking.test.js tests/booking.database.test.js tests/booking-slots.test.js` | **PASSED** | 38 tests passed; 0 failed; 0 skipped. PostgreSQL integration tests ran. |
| Full regression: `npm test` | **PASSED** | 193 tests passed; 0 failed; 0 skipped; 0 cancelled. |
| Client production build: `npm run build` | **PASSED** | Vite production build completed successfully. |
| `git diff --check` | **PASSED** | No whitespace errors. |
| Browser interaction check | **NOT_RUN** | Attempted local browser verification could not render the app root; Vite logged `/api/session` proxy connection refusal because no API server was listening on port 3000. No manual UI result is claimed. |

The PostgreSQL integration test executes the API routes through the application and real module registry, including successful home bookings and rejection paths. It verifies persistence and response data; it does not verify that a provider can view the appointment in a provider appointments screen.

## 7. Assumptions, Risks, and Outstanding Work

* Existing API/data-model contracts and the schema's `visit_address` column are sufficient; no migration is needed.
* Home addresses are normalized by trimming and must contain 1–300 Unicode code points.
* **Outstanding:** the provider cannot yet see a booked address because US-024's appointment view is not implemented. AC-052 is therefore only partially delivered.
* Browser-level interaction evidence remains unverified; automated client interaction tests are not present in the repository.

## 8. Repository Changes

Modified the seven source/test/documentation files listed in section 5 and the US-020 row in `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`; created this implementation log. No files were deleted, no migrations were added, and no commit was created.

## 9. Handoff to P06.4

Validate exactly US-020 against `artifacts/03_planning/product_backlog_priori_v2.json`. Independently inspect the address/modality logic, PostgreSQL persistence and rejection tests, response contract, and UI conditional rendering. Specifically determine whether AC-052 can pass while US-024's provider appointment view is absent. Re-run the focused tests and build if needed; do not implement US-024 as part of this validation.
