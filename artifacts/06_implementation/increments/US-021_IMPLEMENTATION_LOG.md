# US-021 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-12 |
| HU | US-021 — View my appointments |
| Epic | EPIC-007 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Backlog status | PLANNED; MVP_SUPPORTING; P0 / SPRINT-001; 2 story points |
| Requirements | FR-026, NFR-002 |
| Acceptance criteria | AC-055, AC-056, AC-087 |
| Business rules | BR-017, BR-035 |
| Edge cases | None listed for US-021 |
| Dependencies | DEP-001, DEP-007 |
| Architecture / API / data | `artifacts/05_architecture/API_SPEC_V1.yaml` (IF-012, CTR-007, `OwnerAppointment`); `artifacts/05_architecture/DATA_MODEL_V1.md` (`appointment`) |
| UX | `artifacts/04_ux/UX_SPEC_V2.md` (SCR-UX-007); `artifacts/04_ux/UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Implementation status | **READY_FOR_VALIDATION** |

## 2. Story Summary and Scope

Implemented the US-021 owner-facing appointment list. An authenticated owner can open “Mis citas” and see appointments split into upcoming and previous groups, with current service, provider, pet, date/time, modality, status, and place. The view includes empty, loading, and retryable error states. A successful booking returns to this list with a confirmation toast and focus on the new appointment.

The scope is limited to owner appointment retrieval and display. Provider appointment views (US-024), appointment cancellation/rescheduling actions, and provider-side workflows are not implemented by this increment.

## 3. Readiness Assessment

Implementation proceeded because both functional dependencies are available locally: DEP-001 (the signed-in owner session) and DEP-007 (the existing appointment booking/persistence path). The existing appointment schema and `GET /api/owner/appointments` contract support the read operation; no migration or dependency change was required.

The local integration and browser environments were available. The architecture's hosted Vercel/Neon condition COND-001 remains unverified, but does not block local story implementation. Provider rescheduling/cancellation producer workflows are outside this HU; the list reads the persisted appointment row on each screen load and includes rows with cancelled status.

## 4. Technical Implementation Plan

1. Add owner-scoped retrieval to the scheduling module, using existing module interfaces for current service, provider, and pet facts.
2. Return the IF-012 `OwnerAppointment` response, including current start time, derived end time, modality, place, and cancellation status; sort upcoming and previous appointments per SCR-UX-007.
3. Add the owner “Mis citas” route/navigation and implement loading, empty, error/retry, appointment groups/cards, and cancelled status presentation.
4. Connect successful booking to the list with the new appointment ID for the specified toast and focus behavior.
5. Add PostgreSQL-backed coverage and run regression, build, and browser checks.

All planned in-scope steps were completed.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/scheduling/booking.js` | Adds `listOwnerAppointments` and the authenticated `GET /api/owner/appointments` route. Queries only the session owner's appointments, gets current facts through module APIs, preserves cancelled rows, computes one-hour end times and upcoming state, and orders each group as specified. | AC-055, AC-056, AC-087; FR-026; NFR-002; BR-035; IF-012 |
| `client/src/pages/OwnerAppointments.jsx` | Adds the owner appointments screen, including accessible appointment cards, upcoming/previous groups, empty/loading/error/retry states, cancelled badge, and post-booking toast/focus behavior. | AC-055, AC-056, AC-087; SCR-UX-007 |
| `client/src/App.jsx` | Registers the `/owner/appointments` route and owner navigation link. | SCR-UX-007 |
| `client/src/pages/BookAppointment.jsx` | Navigates to “Mis citas” after a successful booking and passes the new appointment ID for feedback/focus. | SCR-UX-006, SCR-UX-007 |
| `client/src/design-system/global.css` | Adds responsive styling for appointment groups, cards, status badges, empty state, and toast. | SCR-UX-007 |
| `tests/booking.database.test.js` | Adds a PostgreSQL integration scenario for owner isolation, auth/role restrictions, response fields and place, current rescheduled time, ordering, cancellation, and empty owner results. | AC-055, AC-056, AC-087; IF-012; NFR-002 |

No schema migration, API dependency, or unrelated user story was added. The temporary browser server used a disposable PostgreSQL schema and was deleted after the schema was removed.

## 6. Acceptance Criteria Coverage

| Criterion | Authoritative behavior | Implementation state | Files / verification |
|---|---|---|---|
| AC-055 | A signed-in owner sees each appointment's service, provider, pet, date/time, modality, and status. | IMPLEMENTED | Owner-scoped route and list screen; PostgreSQL assertions for fields/authorization; browser showed a scheduled appointment with its service, provider, pet, time, modality, status, and place. |
| AC-056 | The owner sees a provider-rescheduled appointment's new date/time; no notification is sent. | IMPLEMENTED | The list fetches the current persisted row each time it opens. PostgreSQL test updates an appointment's stored start time, then verifies the GET response returns that time. Provider rescheduling action itself is outside this HU. |
| AC-087 | An appointment cancelled by any actor/system is shown as cancelled. | IMPLEMENTED | Retrieval does not filter cancelled rows; PostgreSQL test verifies a cancelled appointment remains in the response with `status: 'cancelled'`; card renders the cancelled badge. |

`IMPLEMENTED` records that the code intended to satisfy the criterion is present; P06.4 makes the acceptance decision.

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment and evidence |
|---|---|
| BR-017 | This story displays current appointment details; it does not add provider cancel/reschedule actions. The integration test simulates a changed persisted start time and verifies the current value is returned. Producer actions remain outside US-021. |
| BR-035 | Cancelled rows remain in the owner result and are rendered with “Cancelada”; exercised by the PostgreSQL integration scenario and component inspection. |
| DEP-001 | Owner session is read from the authenticated request; the integration test verifies unauthenticated access is rejected and provider-role access is denied. |
| DEP-007 | Existing booking persistence supplies appointments; the integration test creates bookings through the application and reads them back through IF-012. |
| Edge cases | No edge case IDs are listed for US-021. Empty owner data, other-owner isolation, clinic/home place details, past/upcoming sorting, and cancelled status are covered by the integration scenario. |

## 8. Tests and Verification Results

| Check | Result | Evidence |
|---|---|---|
| `npm test` | PASSED | Exit code 0; 194 passed, 0 failed, 0 cancelled, 0 skipped. The US-021 PostgreSQL integration test passed. |
| `npm run build` | PASSED | Exit code 0; Vite production build completed. |
| Browser flow | PASSED | Signed in as an owner, searched for the test service, booked from the UI, and observed navigation to “Mis citas”, a persisted appointment card and confirmation toast. A second booking verified the toast and focus immediately after submission; the new card's heading was the active element. |
| `git diff --check` | PASSED | Exit code 0 before artifact creation. |
| Temporary environment cleanup | PASSED | Shutdown log: `US-021 isolated database schema removed`; only the Vite process started for this check was stopped. |

The browser run used a disposable schema and test accounts/data; it did not modify the project's persistent database.

## 9. Repository Changes

Modified the five product source/test files in section 5; created this implementation log and the new owner appointments page; updated the US-021 row in `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. The temporary browser server was removed. No migration, manifest, lockfile, or commit was created.

## 10. Architecture Conformance and Deviations

The endpoint follows IF-012 / CTR-007 and the `OwnerAppointment` response shape. It is guarded by the owner role, filters by the authenticated owner's ID, uses module-owned read interfaces for related facts, and does not expose owner or provider email. The UI follows SCR-UX-007 and the existing React Router/API client patterns. No material architecture deviation was identified.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Impact / evidence | Next action |
|---|---|---|
| Hosted runtime condition COND-001 | Foundation validation records Vercel/Neon behavior as unverified. Local PostgreSQL-backed tests and browser run passed; hosted deployment is not part of this HU check. | Verify during the approved deployment/platform step. |
| Provider reschedule/cancel workflows | US-021 consumes current appointment state but does not implement its producer actions. The integration test simulates an updated row; no notification is sent. | Validate the corresponding provider/owner action stories separately. |
| Product-wide and human review | P06.4 is HU-level and is not P07 or a substitute for a separate human review. | Complete broader validation and review at their pipeline stages. |

No known in-scope blocker remains.

## 12. Final Implementation Status

**READY_FOR_VALIDATION** — the US-021 vertical slice is implemented and the local test suite, production build, and browser happy path passed. This status is not a validation approval.

## 13. Handoff to P06.4

Validate only US-021 against `artifacts/03_planning/product_backlog_priori_v2.json`. Independently inspect `GET /api/owner/appointments`, its authorization and data enrichment, the owner list and post-booking interaction, and the PostgreSQL integration assertions. Assess AC-055, AC-056, and AC-087 individually. Note that provider-side mutation workflows and hosted Vercel/Neon behavior are outside this increment and remain unverified.
