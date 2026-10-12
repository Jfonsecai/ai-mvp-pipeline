# US-021 Implementation Validation

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 |
| Report version | 1.0 (first validation of US-021) |
| Validation date | 2026-10-12 |
| HU | US-021 — View my appointments (EPIC-007, P0 / SPRINT-001, 2 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` (status PLANNED) |
| Implementation log | `artifacts/06_implementation/increments/US-021_IMPLEMENTATION_LOG.md` |
| Requirements / criteria | FR-026, NFR-002; AC-055, AC-056, AC-087 |
| Business rules / edge cases | BR-017, BR-035; no edge case IDs |
| Dependencies | DEP-001, DEP-007 |
| Foundation validation | PASS_WITH_WARNINGS |
| Implementation status (P06.3) | READY_FOR_VALIDATION |
| **Final validation status** | **PASS_WITH_WARNINGS** |

**Independence limitation.** P06.3 and P06.4 were performed by the same assistant in this session. P06.4 re-read the backlog and implementation, inspected the actual code and tests, reran the PostgreSQL-focused test, and compared the implementation log with observed behavior. This does not replace a separate human review.

## 2. Executive Summary

The owner appointment list satisfies AC-055, AC-056, and AC-087 based on PostgreSQL integration evidence, source inspection, and a real browser booking-to-list flow. The endpoint returns only the signed-in owner's appointments with current service, provider, pet, date/time, modality, place, and status data. It includes cancelled appointments and reads the stored start time on each request. The UI groups upcoming and previous appointments, shows the status and place, and provides the specified empty/error/loading states and post-booking toast/focus feedback.

The full test suite, focused PostgreSQL integration test, client build, and browser flow passed. No in-scope defect or material architecture deviation was found. The result is **PASS_WITH_WARNINGS** because hosted Vercel/Neon behavior remains subject to foundation condition COND-001, provider-side mutation workflows are outside US-021, and a separate human review/P07 have not occurred.

## 3. Validation Scope and Limitations

This is HU-level validation of US-021, not product-wide testing, P07, deployment validation, or release approval.

Inspected the authoritative backlog, requirements and dependency definitions, API contract, data model, UX screen specification, implementation log, API route and mapping logic, owner page, navigation and booking handoff, and the PostgreSQL integration test.

The browser flow used an isolated disposable PostgreSQL schema, an owner account, a test provider/service, and two bookings. It verified navigation from search through booking to “Mis citas”, rendered appointment data, the success toast, and focus on the new appointment heading. The schema was confirmed removed when the temporary server shut down.

Provider reschedule and cancellation actions are separate producer behaviors and were not added or tested as UI workflows. The integration test simulated a changed stored start time and a cancelled status, then verified the owner's read API. The owner list's canceled badge was verified by code inspection; a canceled card was not separately rendered in the browser. Hosted Vercel/Neon runtime behavior was not exercised.

## 4. Acceptance Criteria Validation Matrix

| Criterion ID | Expected behavior | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-055 | A signed-in owner sees each appointment's service, provider, pet, date/time, modality, and status. | `src/modules/scheduling/booking.js`; `client/src/pages/OwnerAppointments.jsx`; `tests/booking.database.test.js` | PostgreSQL route integration, source inspection, browser flow | **PASS** | The database test asserts owner scoping, 200 response shape, service/provider/pet, time, modality, status, clinic/home place, unauthenticated rejection and provider-role rejection. Browser UI showed a scheduled appointment with its service, provider, pet, date/time, modality, status, and address. | — |
| AC-056 | An appointment rescheduled by the provider is displayed with its new date/time; no notification is sent. | `src/modules/scheduling/booking.js`; `client/src/pages/OwnerAppointments.jsx`; `tests/booking.database.test.js` | PostgreSQL integration and source inspection | **PASS** | The integration test changes the appointment's persisted `starts_at`, then asserts the owner GET returns the new value. The screen fetches current data on open; no notification behavior was added. Provider-side rescheduling UI/action is outside this HU. | — |
| AC-087 | An appointment cancelled by the owner, provider, or automatically is shown as cancelled. | `src/modules/scheduling/booking.js`; `client/src/pages/OwnerAppointments.jsx`; `tests/booking.database.test.js` | PostgreSQL integration and source inspection | **PASS** | The query does not filter by status; the integration test confirms a cancelled row remains in the response as `status: 'cancelled'`. The card maps that status to “Cancelada”. All cancellation sources use the same persisted status; actor-specific cancellation flows are not part of this increment. | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior / dependency condition | Evidence reviewed | Result | Findings / limitations |
|---|---|---|---|---|
| BR-017 | Provider appointments can be cancelled/rescheduled before they take place. For US-021, the owner view must read the current appointment state; producer actions remain separate stories. | Current-row read, current date assertion after a simulated update, owner view reload behavior. | PASS for this HU's display scope | Provider action flows are outside US-021. |
| BR-035 | Cancelled appointments remain visible and are shown as cancelled. | Query has no status filter; database test verifies cancelled row and status; component renders the “Cancelada” badge. | PASS | Browser did not separately render a cancelled card. |
| DEP-001 | Correctly authenticated account is available. | Owner role guard uses session account ID; database test verifies no-session 401 and provider-role denial; browser session was an owner. | PASS locally | Hosted authentication remains under COND-001. |
| DEP-007 | Appointment viewing depends on booking. | Integration scenario creates appointments through the booking route and reads them via IF-012; browser booking persists and appears in list. | PASS locally | — |
| Edge cases | None are assigned to US-021. | Empty owner, another owner's booking, clinic/home places, past/upcoming dates, cancellation, and role restrictions in the database test; empty state observed during browser setup. | PASS for exercised cases | Exact-boundary “start equals now” was not separately tested. |

## 6. Test and Verification Results

| Check | Result | Evidence / limitation |
|---|---|---|
| `node --env-file-if-exists=.env --test tests/booking.database.test.js` | **PASSED** | Exit code 0; 20 passed, 0 failed, 0 cancelled, 0 skipped. The US-021 / IF-012 case passed. |
| `npm test` | **PASSED** | Exit code 0; 194 passed, 0 failed, 0 cancelled, 0 skipped. |
| `npm run build` | **PASSED** | Exit code 0; Vite production build completed. |
| Browser flow | **PASSED** | Playwright-driven browser flow searched the test service, booked through the UI, reached “Mis citas”, rendered the appointment and success toast, and focused the newly created appointment heading. A prior empty state was also observed. The temporary schema was removed at shutdown. |
| `git diff --check` | **PASSED** | Exit code 0 after source and artifact changes. |
| Environment / startup | **PASSED** | Docker available; Node.js v22.14.0; Chromium browser execution succeeded. Temporary API on port 3000 reported DB health 200; Vite 8.3.4 became ready on 127.0.0.1:5174. Temporary processes were stopped after validation. |

Runtime verdict:

```yaml
environment:
  docker: AVAILABLE
  node: AVAILABLE — v22.14.0
  playwright: AVAILABLE — browser flow executed successfully
  infra-tier: PRIMARY(Docker-backed PostgreSQL) — database-backed tests and disposable browser schema passed
  browser-tier: PRIMARY(Playwright) — owner booking-to-list flow exercised
startup: PASS — isolated API and Vite started; database health returned 200
integration: PASS — exit_code: 0; npm test: 194 passed, 0 failed, 0 skipped; focused PostgreSQL file: 20 passed, 0 failed, 0 skipped
e2e: PASS — exit_code: 0 (browser tool call succeeded); booking, list, toast, and focus verified; canceled-card rendering not separately exercised
overall: PASS_WITH_WARNINGS — all US-021 criteria are supported by local evidence; hosted runtime and separate human/P07 reviews remain
```

## 7. Architecture, UX, and Integration Conformance

The endpoint follows API_SPEC IF-012 / CTR-007 and the `OwnerAppointment` shape. It is owner-role guarded, scopes the query by the authenticated account ID, uses the existing module read interfaces for related facts, includes the current persisted appointment time and cancellation status, and omits owner/provider email. No migration or dependency change was introduced.

The page follows SCR-UX-007: owner navigation, “Próximas” and “Anteriores” groups, current place and appointment details, empty/loading/error/retry states, and booking success toast/focus. The read-only view does not add cancellation or rescheduling actions. No material deviation was found.

## 8. Security, Data Integrity, and Regression Findings

No in-scope security or data-integrity defect was found. The route uses the authenticated owner ID rather than a caller-supplied owner ID; the integration test verifies owner isolation, rejects unauthenticated and wrong-role access, and asserts the response does not expose owner data or provider contact email. The full test suite and production build passed.

## 9. Findings Register

No material implementation findings. The following non-blocking limitations remain:

| ID | Severity | Evidence | Impact | Follow-up / closure |
|---|---|---|---|---|
| W-01 | LOW — external validation limitation | Foundation validation records COND-001 as open; this execution tested local PostgreSQL only. | Hosted Vercel/Neon routing, connection behavior, and migration execution remain unverified. | Perform the approved platform checks and record their outcome in the architecture artifacts. |
| W-02 | INFO — scope boundary | Provider reschedule/cancel producer workflows are separate from US-021; tests simulate persisted changes. | No claim is made that the provider mutation interfaces work. The owner view reads changed data when reopened. | Validate the producer stories in their own increments. |
| W-03 | INFO — review boundary | P06.3/P06.4 were completed by the same assistant; P07 and separate human review are pending. | This is not independent human approval or product-wide sign-off. | Complete review and P07 at their pipeline stages. |

These warnings do not leave an applicable US-021 acceptance criterion unsatisfied.

## 10. Implementation Log Consistency

The P06.3 log uses the canonical US-021 ID and lists the three backlog criteria, dependencies, source changes, and test results. Independent evidence confirms the reported `READY_FOR_VALIDATION` status and the local 194/194 test and build results. The browser test adds direct UI evidence for booking, listing, toast, and focus. The log does not claim hosted deployment or provider-side mutation behavior.

## 11. Readiness Decision

US-021 is validated at the HU level based on the acceptance-criteria matrix and local checks. Continue only according to the current backlog and dependencies; this decision does not approve US-024, P07, hosted deployment, or overall release readiness.

## 12. Final Status

**PASS_WITH_WARNINGS** — AC-055, AC-056, and AC-087 are supported by local database integration, code inspection, and browser evidence where applicable. Remaining warnings are non-blocking and concern hosted runtime, separate provider-side actions, and human/P07 review.

## 13. Corrective Actions and Retest Guidance

No corrective action is required for US-021. To close the warnings, verify COND-001 on the hosted platform and complete separate human/P07 review. If provider reschedule or cancellation behavior changes, rerun the focused database test and the owner-facing list flow to confirm updated times and cancelled status remain visible.
