# US-023 Implementation Log

## 8.1 Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `prompts/06_implementation/P06.3_US_implementation.md` v1.0, invoked through P06.5 |
| Log version | 1.0 |
| Execution date | 2026-11-10 |
| HU | US-023 — Reschedule my appointment |
| Epic | EPIC-007 |
| Backlog | `artifacts/02_requirements/product_backlog_requirements_v4.json` |
| Requirements | FR-028 |
| Acceptance criteria | AC-060, AC-061, AC-062 |
| Business rules / edge cases | BR-016, BR-018; EDGE-009, EDGE-010 |
| Dependencies | DEP-001, DEP-007 |
| Planning | `artifacts/03_planning/PRIORITIZATION_V3.md` |
| Architecture / API | `artifacts/05_architecture/ARCHITECTURE_V4.md`; `artifacts/05_architecture/API_SPEC_V2.yaml` |
| UX | `artifacts/04_ux/UX_SPEC_V3.md` |
| Foundation status | PASS_WITH_WARNINGS |
| Implementation status | READY_WITH_LIMITATIONS |

The approved backlog defines US-023 in `artifacts/02_requirements/REQUIREMENTS_V4.md`. It is committed for Iteration 2 and planned as P2 / SPRINT-002, 3 points. The backlog and requirements are version 4.2.

## 8.2 Story Summary and Scope

Let a signed-in pet owner move their own scheduled appointment to another currently available time. The pet, service, provider, modality, and visit address remain unchanged. Available slots follow the same future, working-hours, appointment-duration, and independent-veterinarian occupancy rules as a new booking.

In scope: the owner's reschedule-context and reschedule API operations, transactional slot validation and update, owner rescheduling screen and appointment-list action, and tests. Provider-side rescheduling (US-026), notifications, schema changes, deployment, and other stories are excluded.

## 8.3 Readiness Assessment

Implementation proceeded. Foundation validation permits local incremental implementation; its hosted Vercel/Neon conditions do not block this work. The owner session/role guard (DEP-001), appointment persistence and booking slot rules (DEP-007), provider lock, working-hours query, and appointment views exist. US-021 and US-024 validation records support the appointment list dependencies; US-022 was implemented and validated immediately before this HU. The approved architecture specifies IF-039 / IF-040 and the API contract, and UX_SPEC_V3 defines SCR-UX-021. No open product questions or material contract conflicts were found.

## 8.4 Technical Implementation Plan

1. Validate the strict `RescheduleRequest` shape and `startsAt` timestamp.
2. Provide an owner-scoped context containing only future slots offered under booking rules, excluding the appointment's current slot.
3. In a transaction, acquire the same provider lock used by booking and hours changes, re-read and lock the appointment, reject started/cancelled appointments, re-check slot availability, and conditionally update `starts_at`.
4. Add the owner appointment-list action and SCR-UX-021 slot picker, including conflict and no-longer-changeable feedback.
5. Add route/contract and PostgreSQL integration tests; run focused tests, the complete suite against PostgreSQL 16, client build, and diff checks.

## 8.5 Implemented Changes

| Component | Change and purpose | Traceability |
|---|---|---|
| `src/modules/scheduling/booking.js` | Added strict reschedule request validation, owner reschedule context, transactional reschedule command, context and POST routes. The command locks the provider and appointment, rechecks status/time and availability, and translates independent-slot uniqueness conflicts to `SLOT_UNAVAILABLE`. | AC-060–062; IF-039/040; BR-016, BR-018; EDGE-009/010 |
| `client/src/pages/OwnerAppointments.jsx` | Added “Reprogramar” for upcoming, non-cancelled appointments, success toast, and focus on the updated appointment when returning. | AC-060; SCR-UX-007, SCR-UX-021 |
| `client/src/pages/RescheduleAppointment.jsx` | Added owner summary, week/day/time picker, current-slot exclusion, submit state, and slot-gone/change-not-allowed/error handling. | AC-060–062; SCR-UX-021 |
| `client/src/App.jsx` | Added the owner-only rescheduling route. | DEP-001; SCR-UX-021 |
| `client/src/design-system/global.css` | Added wrapping and spacing for appointment actions. | SCR-UX-007 |
| `tests/booking.test.js` | Added owner-role/session checks, malformed ID/week validation, timestamp request validation, and API contract checks. | IF-039/040; DEP-001 |
| `tests/booking-reschedule.database.test.js` | Added PostgreSQL coverage for context slot filtering, persisted move and both appointment views, refreshed availability, invalid/past/cancelled cases, slot conflicts, and owner scoping. | AC-060–062; BR-016/018; EDGE-009/010 |

No schema migration was needed. Existing booking helpers, provider lock, working-hours query, status, and appointment views are reused. The owner and provider list APIs read the persisted `starts_at`, so both show the new time after the transaction commits.

## 8.6 Acceptance Criteria Coverage

| Criterion | Implementation state | Evidence / verification |
|---|---|---|
| AC-060 — Choosing another available slot moves the appointment to the new date/time in both parties' appointment views. | IMPLEMENTED | PostgreSQL integration reschedules the appointment and verifies the stored start time plus owner and provider appointment responses. |
| AC-061 — Only slots available under the same rules as a new booking are offered. | IMPLEMENTED | Context reuses `computeWeekSlots`/`isSlotOffered`, queries scheduled independent-vet slots, and excludes the current slot. PostgreSQL test confirms an occupied slot and current slot are absent and an available slot is offered. |
| AC-062 — An appointment whose start time has passed cannot be rescheduled. | IMPLEMENTED | PostgreSQL tests verify context and POST reject past and cancelled appointments with `APPOINTMENT_NOT_CHANGEABLE`; unit request validation covers malformed timestamps. |

`IMPLEMENTED` records that the intended code and tests were added; it is not an independent acceptance decision. P06.4 evaluates the evidence separately.

## 8.7 Business Rules, Edge Cases, and Dependencies

| ID | Treatment and evidence | Remaining limitation |
|---|---|---|
| BR-016 | Appointment can be moved only before it starts and while scheduled. Route command locks/rechecks the row and uses a conditional update. | Browser interaction was not exercised. |
| BR-018 | Reschedule context and transaction reuse the new-booking slot rules: future, whole-hour slots within working hours; independent-provider scheduled occupancy is excluded. | No unresolved functional limitation from the database tests. |
| EDGE-009 | Past target times are not offered and POST rejects them as `SLOT_UNAVAILABLE`. | Covered by PostgreSQL integration. |
| EDGE-010 | Started or cancelled appointments return `APPOINTMENT_NOT_CHANGEABLE` from context and POST. | Covered by PostgreSQL integration. |
| DEP-001 | Owner session/role guard and UUID validation are applied to both operations. | Hosted authentication remains under foundation condition COND-001. |
| DEP-007 | Existing appointment rows and list APIs supply the current facts and expose the persisted new start time. | Verified locally against PostgreSQL 16. |

## 8.8 Tests and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Booking API and slot rules | `node --test tests/booking.test.js tests/booking-slots.test.js` | PASSED | 23 tests passed, 0 failed, 0 skipped. |
| US-023 PostgreSQL integration | `node --test tests/booking-reschedule.database.test.js` with temporary PostgreSQL 16 and process-scoped `TEST_DATABASE_URL` | PASSED | Exit code 0; 4 passed, 0 failed, 0 skipped. |
| Canonical project suite | `npm test` with the same temporary PostgreSQL 16 URL | PASSED | Exit code 0; 293 passed, 0 failed, 0 skipped. |
| Client build | `npm run build` | PASSED | Vite production build completed successfully. |
| Patch validation | `git diff --check`; `node --check src/modules/scheduling/booking.js` | PASSED | No whitespace errors; backend module syntax valid. |
| Browser/assistive-technology interaction | Not run | NOT_RUN | No automated browser test runner is configured in the project. |

The temporary PostgreSQL container used a random local port; the integration test creates a unique schema and drops it on teardown. The container was stopped and removed. `.env` was not read or modified for database credentials.

## 8.9 Repository Changes

Modified:

- `src/modules/scheduling/booking.js`
- `client/src/pages/OwnerAppointments.jsx`
- `client/src/App.jsx`
- `client/src/design-system/global.css`
- `tests/booking.test.js`
- `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`

Created:

- `client/src/pages/RescheduleAppointment.jsx`
- `tests/booking-reschedule.database.test.js`
- `artifacts/06_implementation/increments/US-023_IMPLEMENTATION_LOG.md`
- `artifacts/06_implementation/increments/US-023_IMPLEMENTATION_VALIDATION.md`

No files were deleted, no schema migration/configuration was changed, and no commit was created. Existing uncommitted US-022 files and the untracked P06.5 prompt were preserved.

## 8.10 Architecture Conformance and Deviations

The implementation conforms to IF-039 / IF-040 and the reschedule API contract. It acquires the provider lock before the appointment row lock, rechecks mutable state inside the transaction, reuses the established slot function and working-hours source, and preserves appointment identity and all non-time fields. No material architectural deviation was introduced.

## 8.11 Assumptions, Risks, and Outstanding Work

| Item | Impact | Evidence | Next action |
|---|---|---|---|
| No browser or assistive-technology review was run. | Screen rendering, keyboard interaction, focus management, and accessibility were not observed in a browser. | Client build passed; implementation follows SCR-UX-021 by source inspection. | Include the reschedule flow in P07/manual browser and keyboard review. |
| Hosted Vercel/Neon behavior remains under COND-001. | Local tests do not establish hosted runtime behavior. | Integration and full suite passed on local PostgreSQL 16. | Retain normal P08 hosted validation; no story-specific code blocker. |

## 8.12 Final Implementation Status

**READY_WITH_LIMITATIONS.** The complete owner-side vertical slice is implemented and all API, PostgreSQL, full-suite, and build checks passed. Browser/assistive-technology and hosted-runtime behavior remain outside this local implementation run.

## 8.13 Handoff to P06.4

- HU: US-023, authoritative definition in `artifacts/02_requirements/REQUIREMENTS_V4.md` and `artifacts/02_requirements/product_backlog_requirements_v4.json`.
- Independently verify context slot filtering, transaction/locking behavior, persisted `starts_at`, and owner/provider list responses against AC-060/061.
- Verify started and cancelled appointment behavior and attempted past/occupied targets against AC-062 and EDGE-009/010.
- Review the owner route, validation, and error mapping.
- Review SCR-UX-021 summary, slot selection, confirmation, success toast, slot-taken feedback, and back navigation.
- Commands and exact counts are in §8.8; browser/manual UX validation remains a warning, not a claim of success.
