# US-024 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-12 |
| HU | US-024 — See my scheduled appointments |
| Epic | EPIC-007 |
| Backlog source / status | `artifacts/03_planning/product_backlog_priori_v2.json`; PLANNED, MVP_SUPPORTING, P0 / SPRINT-001 |
| Requirements | FR-029, NFR-002 |
| Acceptance criteria | AC-063, AC-064, AC-088 |
| Business rules | BR-035 |
| Edge cases | None listed |
| Dependencies | DEP-001, DEP-007 |
| Architecture / API / data | `artifacts/05_architecture/ARCHITECTURE_V2.md`; `API_SPEC_V1.yaml` (IF-013, CTR-007, `ProviderAppointment`); `DATA_MODEL_V1.md` (`appointment`, `account`) |
| UX | `artifacts/04_ux/UX_SPEC_V2.md` (SCR-UX-008, FLOW-UX-013, COMP-UX-008); `UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS |
| Implementation status | **READY_FOR_VALIDATION** |

The repository's source filenames are versioned (for example, `REQUIREMENTS_V2.md` and
`ARCHITECTURE_V2.md`); those current artifacts and the canonical backlog entry were used.
Architecture validation is PASS_WITH_CONDITIONS; hosted Vercel/Neon condition COND-001 remains
open and does not prevent local implementation or validation.

## 2. Story Summary and Scope

Implemented the provider-facing “Citas” screen and its read-only appointment API. The signed-in
provider sees their appointments split into “Próximas” and “Anteriores”, with service, date/time,
pet, owner's name, modality and status; home appointments additionally show the visit address.
Cancelled rows remain visible as cancelled. The screen has loading, retryable error and empty states.

The work is limited to US-024 and the minimum provider landing/navigation integration for SCR-UX-008.
Appointment cancellation and rescheduling actions (US-025/US-026), notifications, owner contact
information, and unrelated provider profile/catalog behavior are excluded.

## 3. Readiness Assessment

Implementation proceeded because DEP-001 is available through the existing session and role guard,
and DEP-007 is available through the existing appointment schema and booking flow. The required
API contract, schema, screen, and flow already exist. The current codebase includes the owner-side
appointment list from US-021, whose data formatting and card patterns can be reused without changing
its behavior.

The provider owner's display name is held by COMP-004. Scheduling now reads only that name through
a small Identity-owned query, `getOwnerName`; this preserves CR-002 and NFR-002. No material product
decision or schema change was needed.

## 4. Technical Implementation Plan

1. Add a PostgreSQL-backed IF-013 test for provider isolation, response fields, home address,
   cancellation, empty results, authentication, and role authorization.
2. Implement provider-scoped retrieval using the authenticated provider ID, existing Catalog and
   Pets read interfaces, and the Identity owner-name query.
3. Register the provider appointments page, navigation entry and post-sign-in provider home; render
   the specified groups, cards, address, empty state, loading state, and MSG-NET retry.
4. Run the focused database test, full test suite, production build, browser UI checks and diff checks.

All implementation steps above were completed.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/identity/accounts.js` | Adds `getOwnerName`, an Identity-owned read returning only the owner's name or `null`. | IF-013; CR-002; NFR-002 |
| `src/modules/scheduling/booking.js` | Adds `listProviderAppointments` and provider-only `GET /api/provider/appointments`. Filters using the authenticated provider ID, includes cancelled records, derives one-hour end times and upcoming state, sorts each time group, uses module-owned reads for service/pet/name, and returns home address only for home visits. | AC-063, AC-064, AC-088; FR-029; IF-013; BR-035 |
| `client/src/pages/ProviderAppointments.jsx` | Adds the accessible “Citas” view, upcoming/previous groups, appointment details, cancellation and modality badges, home address, and loading/empty/error-retry states with catalog and schedule links. | AC-063, AC-088; SCR-UX-008; FLOW-UX-013 |
| `client/src/App.jsx` | Registers the provider-only appointments route, adds the “Citas” tab, orders provider tabs per the UX specification, and routes the provider home to appointments. | AC-063; SCR-UX-008 |
| `client/src/pages/SignIn.jsx` | Routes provider sign-in to the now-implemented provider appointments home; provider sign-up still enters profile onboarding. | SCR-UX-008; FLOW-UX-013 |
| `client/src/design-system/global.css` | Styles the two empty-state actions using existing button classes and design tokens. | SCR-UX-008 |
| `tests/booking-provider.database.test.js` | Adds isolated-schema PostgreSQL coverage for provider-only data, required response fields, date/time, clinic/home data, cancellation, empty results, and authorization. | AC-063, AC-064, AC-088; IF-013 |
| `src/modules/README.md` | Records IF-012/IF-013 and the Identity-owned display-name read boundary. | CR-002; architecture traceability |

No migration, dependency, secret, or unrelated story was added.

## 6. Acceptance Criteria Coverage

| Criterion | Authoritative behavior | Implementation state | Evidence |
|---|---|---|---|
| AC-063 | The provider sees each appointment's service, date/time, pet, owner's name, modality, status and, for home visits, address. | IMPLEMENTED | IF-013 maps those fields; the PostgreSQL test verifies clinic and home appointments, Bogotá date/time, owner and pet names, cancellation state, and home-only address. Browser UI fixture verified the provider page renders groups, status, owner, pet, service, modality, and visit address. |
| AC-064 | Appointments of other providers are not shown. | IMPLEMENTED | SQL filters `appointment.provider_id` by the authenticated session account; PostgreSQL test seeds a second provider's appointment and verifies it is excluded. The provider guard and wrong-role response are also tested. |
| AC-088 | Cancelled appointments are shown as cancelled. | IMPLEMENTED | Retrieval does not filter cancelled rows; PostgreSQL verifies `status: cancelled`; the page maps it to the visible “Cancelada” badge. |

`IMPLEMENTED` records that the intended code is present. The independent P06.4 report determines
acceptance based on its own evidence review.

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment and evidence |
|---|---|
| BR-035 | Retains cancelled records and presents “Cancelada” in text; exercised by the database route test and browser fixture. |
| DEP-001 | Session and provider-role guard provide caller identity; integration test confirms anonymous `401` and owner-role `404`. |
| DEP-007 | Existing appointment persistence supplies the rows; the PostgreSQL test inserts valid appointments into the isolated migrated schema and reads them through IF-013. |
| Edge cases | No edge case IDs are assigned. Empty-provider results, other-provider isolation, clinic versus home fields, past/upcoming grouping, cancelled status, and wrong-role access are covered. |

## 8. Tests and Verification Results

| Check | Result | Evidence / limitation |
|---|---|---|
| Red-phase IF-013 test | FAILED as expected before route implementation | `GET /api/provider/appointments` returned `404` instead of `200` after fixture setup; this confirmed the missing endpoint. |
| Focused PostgreSQL test | PASSED | `node --env-file-if-exists=.env --test --test-name-pattern="US-024 / IF-013" tests/booking-provider.database.test.js`; 1 passed, 0 failed, 0 skipped. |
| `npm test` | PASSED | 175 passed, 0 failed, 0 skipped; includes the US-024 PostgreSQL test. |
| `npm run build` | PASSED | Vite production build completed. |
| Browser UI fixture checks | PASSED | Vite served the provider page with mocked session/API data; checked active “Citas” tab, upcoming/previous content, cancelled badge, home address, empty-state links, MSG-NET, retry recovery, and provider-home redirect. This is UI evidence, not a live UI-to-PostgreSQL browser flow. |
| `git diff --check` | PASSED | No whitespace errors. |
| Hosted Vercel/Neon checks | NOT_RUN | COND-001 requires project/hosting access not available in this local run. |

## 9. Repository Changes

Created `src/modules/identity/accounts.js`, `client/src/pages/ProviderAppointments.jsx`,
`tests/booking-provider.database.test.js`, and this implementation log. Modified the scheduling
module, provider navigation/sign-in destination, shared appointment styling, module-boundary
documentation, and implementation index. No files were deleted; no database migration or
configuration change was made. No commit was created.

## 10. Architecture Conformance and Deviations

IF-013 is implemented at COMP-009 and uses the existing session/role boundary. Scheduling obtains
service, pet and owner-name facts through the owning modules' read functions; only the provider's
own appointment rows are queried. The response omits owner email and phone, and the home address is
present only for home visits. This conforms to IF-013/CTR-007, CR-001, CR-002, CR-015 and NFR-002.

`getOwnerName` is a minimal Identity-owned read interface needed by the approved provider response
contract; it changes no data and is documented in `src/modules/README.md`. Routing signed-in
providers to Citas completes the already-specified provider home (SCR-UX-008); sign-up onboarding
still routes to profile. Neither change introduces a material architecture deviation.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Impact | Evidence / next action |
|---|---|---|
| Hosted condition COND-001 | Vercel routing and Neon behavior are not established by local checks. | No hosted access was available; verify at deployment as required by architecture validation. |
| No live browser-to-database flow | UI interactions were verified with API fixtures and backend behavior was verified independently against PostgreSQL. | Browser-to-PostgreSQL integration remains for broader P07 coverage; no AC is left without local evidence. |
| Human review / P07 | This increment is not a product-wide release approval. | Perform human review and broader workflow/accessibility checks in the project testing phase. |
| US-025 / US-026 actions | Providers cannot cancel or reschedule from this read-only screen. | These are separate stories and remain intentionally out of scope. |

## 12. Final Implementation Status

**READY_FOR_VALIDATION** — all three criteria have corresponding implementation and local
verification evidence. Hosted deployment condition COND-001 remains external and non-blocking for
P06.4.

## 13. Handoff to P06.4

Validate only US-024 from `artifacts/03_planning/product_backlog_priori_v2.json` (AC-063, AC-064,
AC-088; BR-035; DEP-001 and DEP-007). Independently inspect IF-013 and `ProviderAppointments.jsx`,
rerun the PostgreSQL-focused test and build/regression checks, verify home-only address exposure,
provider isolation, cancellation display and the empty/error states, and record any limitations
around the hosted condition or absence of a live UI-to-database browser run.
