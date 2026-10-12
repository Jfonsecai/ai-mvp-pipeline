# US-020 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Report version | 1.0 (first validation of US-020) |
| Validation date | 2026-10-12 |
| HU | US-020 — Book a home visit (EPIC-006, P0 / SPRINT-001, 2 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` (status PLANNED) |
| Implementation log | `artifacts/06_implementation/increments/US-020_IMPLEMENTATION_LOG.md` |
| Requirements / criteria | FR-022, FR-023; AC-052, AC-053, AC-054 |
| Business rules / edge cases | BR-007, BR-015; EDGE-008 |
| Dependencies | DEP-001, DEP-006 |
| Foundation validation | PASS_WITH_WARNINGS |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **FAIL** |

**Independence limitation.** P06.3 and P06.4 were performed in the same assistant session. To make the validation evidence-based, this phase re-read the authoritative backlog, inspected the actual implementation and tests, and independently reran the focused and full test suites and client build. This is not a substitute for human review.

## 2. Executive Summary

The booking path supports home visits: it validates and trims the address, persists it with the selected modality, returns it in the booking response, rejects a missing address without writing a booking, and supports a clinic/home choice for services offered both ways. The full regression suite and production client build pass.

**AC-052 is not fully satisfied:** the criterion explicitly requires that the provider can see the address. The current increment stores the address and returns it in the owner's booking response, but the provider appointment view/API (US-024) is absent. The US-019 validation report independently records that provider appointment lists do not exist. This is an unmet required outcome, not a reason to expand US-020 to implement US-024.

AC-053 and AC-054 are supported by PostgreSQL integration assertions plus inspection of the client validation and conditional controls. Browser interaction was not verified: the local browser did not render the React root, and Vite reported a refused `/api/session` proxy connection because no API server was listening. This limitation is recorded, not presented as a passing browser test.

**Decision: FAIL**, solely for F-01 (HIGH), the unimplemented provider-visible appointment outcome in AC-052.

## 3. Validation Scope and Limitations

This is validation of US-020 only, not product-wide testing or P07.

Inspected:

* `src/modules/scheduling/booking.js` — request validation, modality resolution, booking route, persistence handoff, and response.
* `client/src/pages/BookAppointment.jsx` — choice controls, required-address feedback, conditional address rendering, and request payload.
* `migrations/001_initial_schema.sql` — existing appointment modality/address constraints.
* `tests/booking.test.js`, `tests/booking.database.test.js`, and `tests/booking-slots.test.js`.
* `artifacts/05_architecture/API_SPEC_V1.yaml`, `artifacts/05_architecture/DATA_MODEL_V1.md`, `artifacts/04_ux/UX_SPEC_V2.md`, and the US-019 validation report.

All three acceptance criteria were assessed. PostgreSQL route-level tests verify storage and rejection behavior. The provider-visible appointment list is unavailable because US-024 is not implemented. The browser-level interaction flow was attempted but not completed due the local frontend/API runtime condition noted above; therefore no browser result is claimed.

## 4. Acceptance Criteria Validation Matrix

| Criterion ID | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-052 | An owner books a home service with an address; the appointment is scheduled with that address and the provider can see it. | `booking.js` POST route and `bookSlot`; existing `appointment.visit_address`; no provider appointments view is implemented. | PostgreSQL integration test; response and database-row assertions; repository/dependency records inspected. | **FAIL** | Successful independent-vet and clinic home bookings return `201`, `place: { kind: 'home', address: ... }`, and persist the trimmed address. The provider's view of that appointment cannot occur because US-024 is absent. | F-01 |
| AC-053 | A home booking without an address is not booked and the address is indicated as required. | Backend request/booking validation; `BookAppointment.jsx` required-field validation and message. | PostgreSQL integration assertions for absent/blank address and unchanged row count; code inspection. | **PASS** | Missing and whitespace-only addresses return a `visitAddress` `REQUIRED` validation error, and the test confirms no appointment row was added. The client marks the address required and renders the required-field message. | — |
| AC-054 | For a clinic service offered both ways, the owner chooses modality; an address is required only for home. | `resolveAppointmentModality`; conditional controls and payload in `BookAppointment.jsx`. | PostgreSQL integration assertions for missing choice, home without address, home with address, clinic without address, and clinic with address; code inspection. | **PASS** | A both-way booking without modality is rejected; home requires and persists an address; clinic succeeds without an address and rejects an address. Client displays both choices and only sends `visitAddress` for home. | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior / condition | Evidence reviewed | Result | Findings / limitations |
|---|---|---|---|---|
| BR-007 | Booking uses a modality offered by the service; a both-way service requires a choice. | Modality resolver, unit tests, and PostgreSQL assertions for both-way selection. | PASS | — |
| BR-015 | A home visit requires an address entered by the owner. | Request validation, home booking route, database integration test, and UI code. | PASS | Provider visibility is separately part of AC-052 and remains unmet (F-01). |
| EDGE-008 | Booking without an address is rejected and the address is indicated as required. | Integration test for absent/blank address and no row written; client validation/message inspection. | PASS | Browser interaction was not verified. |
| DEP-001 | Owner session/authentication is available. | Integration test creates owners through the auth route and posts through the owner-guarded route; neighboring US-019 validation. | PASS locally | Hosted deployment condition COND-001 remains outside this HU validation. |
| DEP-006 | Provider working hours support offered booking slots. | Integration test creates working hours through the provider endpoint and books a valid offered slot; existing US-009 implementation. | PASS locally | Provider appointment listing is not DEP-006; it remains US-024 and is missing. |

## 6. Test and Verification Results

| Check | Result | Evidence / limitation |
|---|---|---|
| `node --env-file-if-exists=.env --test tests/booking.test.js tests/booking.database.test.js tests/booking-slots.test.js` | **PASSED** | 38 passed, 0 failed, 0 skipped. PostgreSQL integration ran. |
| `npm test` | **PASSED** | 193 passed, 0 failed, 0 skipped, 0 cancelled. |
| `npm run build` | **PASSED** | Vite production build completed successfully. |
| `git diff --check` | **PASSED** | No whitespace errors. |
| Browser interaction attempt | **NOT_RUN** | Vite was reachable, but the browser remained with an empty React root; Vite logged `/api/session` proxy `ECONNREFUSED` because port 3000 had no API listener. No UI interaction assertions are claimed. |

Passing tests establish local API and persistence behavior, not provider visibility in a missing provider appointments screen.

## 7. Architecture, UX, and Integration Conformance

The implementation reuses COMP-009 and the existing transactional booking operation, reads/writes through module-owned functions, and uses the existing `appointment.visit_address` field and constraints. The API request accepts the address for home bookings, and the owner booking response includes the selected place. No schema change, new dependency, or unapproved architectural change was found.

The screen follows SCR-UX-006 by presenting clinic/home choices only for both-way services and requiring/rendering the address only for home. This was inspected in code; the interaction was not observed in a working browser during this validation. Provider-side display is absent and is not treated as an acceptable UX deviation.

## 8. Security, Data Integrity, and Regression Findings

Address input is type-checked, trimmed, limited to 300 Unicode code points, required for home, and disallowed for clinic. The integration test verifies invalid requests do not insert appointments and that successful home addresses match the persisted value. Existing owner authorization and provider/owner role boundaries remain in place. No additional security or data-integrity finding was observed within this scope.

The 193-test suite and build passed; no regression was observed by those checks.

## 9. Findings Register

| ID | Severity | Affected criterion | Finding and evidence | Impact | Corrective action | Closure evidence |
|---|---|---|---|---|---|---|
| F-01 | HIGH | AC-052 | The home address is stored and included in the owner response, but no provider appointments route/page exists; US-024 is not implemented, as also recorded by the US-019 validation. | The provider cannot see where to attend, so an explicit part of AC-052 is unsatisfied. | Implement provider appointment visibility in its own approved US-024 increment; do not widen US-020 to include that story. | With the provider signed in, retrieve/display this booked home appointment and its address; then rerun P06.4 for US-020. |

## 10. Implementation Log Consistency

The log accurately describes the changed files, test results, and the limitation that US-024 is not implemented. Its `READY_WITH_LIMITATIONS` status is consistent with the implementation being testable while AC-052 remains incomplete. The independent validation decision is therefore FAIL, not a pass with warnings.

## 11. Readiness Decision

The home-booking API and persistence behavior are locally functional, and AC-053/AC-054 pass. US-020 cannot be accepted as complete while AC-052's provider-visible address outcome remains unavailable. This decision does not authorize implementing US-024 within this increment and says nothing about product-wide release readiness.

## 12. Final Status

**FAIL**

## 13. Corrective Actions and Retest Guidance

1. Implement US-024 in its own approved increment so a provider can retrieve and view booked appointment details, including a home-visit address.
2. Verify an owner-created home appointment appears for the corresponding signed-in provider with the correct address.
3. Re-run the focused booking tests, the relevant US-024 checks, and P06.4 for US-020. Preserve this report as the first validation record and version a subsequent report if needed.
