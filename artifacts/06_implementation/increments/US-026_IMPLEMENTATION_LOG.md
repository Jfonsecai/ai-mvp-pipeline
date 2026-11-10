# US-026 Implementation Log

## Metadata

| Field | Value |
|---|---|
| HU | US-026 — Reschedule an appointment as a provider |
| Sprint | P2 / SPRINT-002 |
| Requirements | FR-031; AC-067, AC-068; BR-011, BR-017, BR-018; EDGE-010 |
| Dependencies | DEP-001, DEP-007 |
| Architecture / API | `artifacts/05_architecture/ARCHITECTURE_V4.md`; `artifacts/05_architecture/API_SPEC_V2.yaml` |
| UX | `artifacts/04_ux/UX_SPEC_V3.md` |
| Implementation status | READY_WITH_LIMITATIONS |

## Scope and implementation

Added provider-scoped rescheduling APIs for appointment context and submission, reusing the existing slot computation, working-hours validation, provider lock, and conditional update behavior from owner rescheduling. Requests require the provider role and the appointment must belong to that provider. Only a scheduled appointment that has not started can be moved.

The existing reschedule screen now supports owner and provider modes. Provider appointments link to it; provider mode shows the owner and pet, returns to the provider appointment list, and displays the successful reschedule toast. The shared appointment row preserves pet, service, modality, and address while both parties' list APIs show the new time.

No schema changes were required.

## Changed surfaces

- `src/modules/scheduling/booking.js` — shared account-scoped reschedule logic, provider context/command exports, and provider routes.
- `client/src/App.jsx` — provider reschedule route.
- `client/src/pages/ProviderAppointments.jsx` — reschedule action and return toast.
- `client/src/pages/RescheduleAppointment.jsx` — provider-specific API, summary, and navigation mode.
- `tests/booking.test.js` — provider authorization, malformed ID/week, and API contract checks.
- `tests/booking-reschedule.database.test.js` — provider move, new slot context, owner/provider visibility, and edge cases.
- `docs/API.md` — documented reschedule endpoints.

## Acceptance criteria

| Criterion | Implementation |
|---|---|
| AC-067 | Provider moves their scheduled appointment to an offered slot. The database integration case checks the returned time, persisted time, and updated owner/provider appointment lists. |
| AC-068 | Started appointments return `APPOINTMENT_NOT_CHANGEABLE`; provider context and command integration cases cover started and cancelled appointments. |

## Limitations

PostgreSQL integration tests require `TEST_DATABASE_URL`, unavailable during this run. Browser interaction/accessibility review and hosted Vercel/Neon validation remain follow-ups.
