# US-009 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-11 |
| HU | US-009 — Set my working days and hours |
| Epic | EPIC-003 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Backlog status | PLANNED; P0 / SPRINT-001; 5 story points |
| Requirement | FR-010 |
| Acceptance criteria | AC-025, AC-026, AC-080, AC-081 |
| Business rules | BR-011, BR-025, BR-033, BR-034, BR-035 |
| Edge cases | EDGE-013, EDGE-014, EDGE-025 |
| Backlog dependencies | DEP-001 |
| Architecture / contracts | `artifacts/05_architecture/ARCHITECTURE_V2.md`; `ARCHITECTURE_VALIDATION_V2.md`; `API_SPEC_V1.yaml`; `DATA_MODEL_V1.md` |
| UX | `artifacts/04_ux/UX_SPEC_V2.md`; `UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Related dependency | US-003 sign-in and provider session/role guard are implemented and validated PASS_WITH_WARNINGS. |
| Implementation status | **READY_WITH_LIMITATIONS** |

## 2. Story Summary and Scope

Implemented the provider's weekly working-hours read/save flow: seven ISO weekdays, an optional single whole-hour range per working day, authenticated provider-only API operations, and the provider-facing working-hours screen. Saving a schedule replaces the provider's stored ranges and, in the same transaction, asks COMP-009 through IF-018 to cancel that provider's upcoming scheduled appointments that no longer fit.

The increment does not implement booking-slot generation or owner/provider appointment-list screens. Those operations belong to the planned scheduling stories US-019 and US-021; their absence limits end-to-end verification of AC-025, AC-026 and the display portion of AC-081. No API contract, database migration, dependency manifest, or `.env` change was needed.

## 3. Readiness Assessment

The authoritative backlog entry is US-009, PLANNED, P0, with no open questions and dependency DEP-001. The approved architecture defines COMP-006/IF-005 for working-hours read/replace, COMP-009/IF-018 for appointment cancellation, DATA-005/DATA-007 storage, and the provider lock IF-024. Foundation validation is PASS_WITH_WARNINGS and permits local incremental work. US-003's session resolver and provider guard were available.

US-019 slot offering/booking and US-021 appointment views remain PLANNED and are not present in the repository. They are not listed as direct backlog dependencies of US-009, so the provider configuration and IF-018 cancellation command could be implemented and tested independently; however, those missing consumers prevent a complete runtime demonstration of owner slot availability and cancelled-appointment display.

## 4. Technical Implementation Plan

1. Add strict API validation for the seven-day `WeeklyHours` contract, including whole-hour and end-after-start checks.
2. Implement provider-only GET and PUT operations for `/api/provider/working-hours`, preserving the provider row lock and atomic save/cancel transaction.
3. Implement IF-018 within COMP-009 without letting COMP-006 write the appointment table directly.
4. Add the provider's responsive SCR-UX-010 page and an entry point from the existing provider landing page.
5. Add API/validation and temporary-PostgreSQL integration tests for authorization, persistence, rollback, time-zone-aware cancellations, and appointment preservation.
6. Run focused tests, full regression tests, production build, and diff checks; document unimplemented consumer flows for independent validation.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/provider/working-hours.js` | Added `validateWeeklyHours`, seven-day read shape, provider-only GET/PUT, strict field validation, provider `FOR UPDATE` lock, replace-and-cancel transaction. | US-009; AC-025, AC-026, AC-080, AC-081; FR-010; IF-005, IF-018, IF-024; DATA-005 |
| `src/modules/scheduling/hours.js` | Added IF-018 command to cancel only future scheduled appointments outside the replacement schedule using Bogotá weekday/hour and one-hour appointment-fit rules. | US-009; AC-081; BR-034, BR-035; DATA-007 |
| `src/modules/index.js` | Registered the provider working-hours router. | IF-005 |
| `client/src/pages/ProviderWorkingHours.jsx` | Added SCR-UX-010: Monday–Sunday controls, required hour selections, row-level server/client errors, no-hours notice, automatic-cancellation warning, save state and success/error feedback. | US-009; AC-025, AC-026, AC-080, AC-081; FLOW-UX-005; COMP-UX-018 |
| `client/src/App.jsx` | Added the provider-only working-hours route and active navigation link. | SCR-UX-010; provider role boundary |
| `client/src/pages/ProviderWelcome.jsx` | Added a direct entry link to configure working hours. | US-009; FLOW-UX-005 |
| `client/src/design-system/global.css` | Added token-based responsive provider navigation, day rows, selects, alerts and page layout. | SCR-UX-010; COMP-UX-018; CR-012 |
| `src/modules/README.md` | Documented the IF-005 and IF-018 implementations and table ownership. | COMP-006, COMP-009; CR-002, CR-015 |
| `tests/provider-working-hours.test.js` | Added API/validator coverage including role rejection, seven-day read, invalid-hour rejection, transactional replacement, and missing-profile rollback. | AC-025, AC-080; IF-005; IF-024 |
| `tests/provider-working-hours.database.test.js` | Added real PostgreSQL integration verifying persisted hours, same-provider future cancellations, Bogotá weekday/time boundaries, and preservation of in-hours, past, other-provider and already-cancelled appointments. | AC-081; BR-034, BR-035; IF-018 |
| `tests/design-tokens.test.js` | Adjusted the raw-length check to exclude only media-query breakpoint expressions, which the token-file contract explicitly permits. | CR-012; SCR-UX-010 responsive layout |

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Implementation / verification evidence |
|---|---|---|---|
| AC-025 | Providers set different ranges by day; owners are offered appointment slots only within those days and hours. | PARTIALLY_IMPLEMENTED | Seven-day per-provider schedules persist and are returned by GET. Slot-offering/booking endpoints in US-019 are not implemented; owner-facing availability cannot yet be observed. |
| AC-026 | If no working days/hours are defined, an owner booking attempt offers no slots. | PARTIALLY_IMPLEMENTED | Empty schedules are returned as seven non-working days and the provider screen displays the defined no-hours message. The owner booking flow is not implemented, so the no-slot result cannot be exercised. |
| AC-080 | A start or end time not on the hour is not saved and the time is indicated. | IMPLEMENTED | The API returns `422 VALIDATION_FAILED` with `NOT_ON_THE_HOUR` before opening a transaction; the provider form maps it to the specified row-level message. Automated validator/API test passed. |
| AC-081 | Changing hours cancels upcoming appointments outside the new hours, and both parties see them as cancelled. | PARTIALLY_IMPLEMENTED | IF-018 transaction changes matching `appointment` rows to `cancelled` and sets `cancelled_at`; integration test confirms scope and persistence. Appointment views in US-021 are not implemented, so the display to both parties is not yet verified. |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-011 | New hours are persisted by provider and structured for future availability consumers. Booking enforcement cannot be exercised until US-019 exists. |
| BR-025 | All reads/writes are scoped to `req.session.accountId`; the API requires the provider role. Owner access returns `NOT_FOUND`; integration uses distinct provider profiles. |
| BR-033 | One weekly range per weekday; strict whole-hour values; start 0–23, end 1–24; end must be later than start. API and unit tests cover invalid cases. |
| BR-034 | Save and cancellation share one transaction and provider row lock. Only this provider's future `scheduled` appointments outside the new hours are changed. |
| BR-035 | Appointments are not deleted; their status and cancellation timestamp persist. Showing those rows in appointment lists awaits US-021. |
| EDGE-013 | Integration test changes schedule and confirms only upcoming out-of-range appointments are cancelled. |
| EDGE-014 | GET represents an empty schedule as seven `works: false` days; the provider UI shows the no-hours notice. Owner slot behavior awaits US-019. |
| EDGE-025 | Fractional hours return `NOT_ON_THE_HOUR`; the form displays the approved row-level message. |
| DEP-001 | Existing sign-in/session integration and provider-role guard were reused. |

## 8. Tests and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Focused US-009 tests | `node --env-file-if-exists=.env --test tests/provider-working-hours.test.js tests/provider-working-hours.database.test.js` | PASSED | 6 tests, 6 passed, 0 failed, 0 skipped; PostgreSQL integration executed. |
| Design-token checks after responsive styling | `node --env-file-if-exists=.env --test tests/design-tokens.test.js tests/provider-working-hours.test.js tests/provider-working-hours.database.test.js` | PASSED | 8 tests, 8 passed, 0 failed, 0 skipped. |
| Full regression suite | `npm.cmd test` | PASSED | 85 tests, 85 passed, 0 failed, 0 skipped. |
| Production client build | `npm.cmd run build` | PASSED | Vite transformed 33 modules and emitted production assets. |
| Whitespace / patch check | `git diff --check` | PASSED | No whitespace errors. |
| Owner slot behavior and both-party cancelled appointment display | Runtime flow | NOT_RUN | The relevant US-019 and US-021 API/UI flows are not implemented; do not infer their behavior from database state. |

## 9. Repository Changes

Created `src/modules/provider/working-hours.js`, `src/modules/scheduling/hours.js`, `client/src/pages/ProviderWorkingHours.jsx`, `tests/provider-working-hours.test.js`, `tests/provider-working-hours.database.test.js`, and this log. Modified `src/modules/index.js`, `src/modules/README.md`, `client/src/App.jsx`, `client/src/pages/ProviderWelcome.jsx`, `client/src/design-system/global.css`, and `tests/design-tokens.test.js`. No migration, dependency-manifest, lockfile, `.env`, or prior validation-report changes were made.

## 10. Architecture Conformance and Deviations

The implementation follows COMP-006/IF-005, DATA-005, COMP-009/IF-018 and the shared provider lock IF-024. COMP-006 owns only `provider_profile` and `working_hours`; COMP-009 owns cancellation writes to `appointment`. Both the schedule replacement and appointment cancellation execute on the same checked-out connection and transaction. Bogotá-local weekday/hour comparisons use `America/Bogota`. API payload and responses follow `WeeklyHours` in `API_SPEC_V1.yaml`; no contract/schema change was introduced.

The registered scheduling module contains only the IF-018 command required by US-009; slot generation, booking and appointment-list operations remain outside this increment.

## 11. Assumptions, Risks, and Outstanding Work

* **Blocking end-to-end evidence:** implement US-019 availability/booking before claiming owner-visible slot behavior for AC-025/AC-026.
* **Blocking display evidence:** implement US-021 appointment views for both roles before claiming the cancelled-state display in AC-081.
* **Hosted deployment:** Vercel/Neon condition COND-001 remains open from foundation validation; local implementation/tests do not verify hosted behavior.
* **No schema migration:** `working_hours` and `appointment.status` already exist in the approved initial schema.

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** The provider schedule CRUD, interface and IF-018 cancellation command are implemented, and the full local test suite/build pass. The unimplemented consumer flows are explicit known limitations, not completed acceptance behavior; P06.4 must independently assess whether they block a conclusive HU decision.

## 13. Handoff to P06.4

Validate US-009 from `artifacts/03_planning/product_backlog_priori_v2.json`. Inspect the GET/PUT endpoints and provider screen, verify role protection and whole-hour validation, independently run the PostgreSQL cancellation integration test and regression/build checks, and specifically determine how AC-025/AC-026 can be assessed without US-019 and how AC-081's “shown as cancelled to both parties” can be assessed without US-021.
