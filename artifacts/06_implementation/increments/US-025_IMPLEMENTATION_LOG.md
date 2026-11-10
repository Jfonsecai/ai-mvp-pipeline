# US-025 Implementation Log

## Metadata

| Field | Value |
|---|---|
| HU | US-025 — Cancel an appointment as a provider |
| Sprint | P2 / SPRINT-002 |
| Requirements | FR-030; AC-065, AC-066; BR-017, BR-035; EDGE-010 |
| Dependencies | DEP-001, DEP-007 |
| Architecture / API | `artifacts/05_architecture/ARCHITECTURE_V4.md`; `artifacts/05_architecture/API_SPEC_V2.yaml` |
| UX | `artifacts/04_ux/UX_SPEC_V3.md` |
| Implementation status | READY_WITH_LIMITATIONS |

## Scope and implementation

Implemented provider cancellation for the provider's own scheduled appointments that have not started. The command locks the appointment row, checks ownership and changeability, and records the cancellation timestamp without deleting history. The provider API returns the refreshed provider-view appointment. Existing owner and provider appointment queries expose the persisted cancelled status.

The provider appointments page now offers cancellation only for future scheduled appointments, with the specified confirmation text, success/error feedback, and focus restoration. No schema or unrelated story changes were needed.

## Changed surfaces

- `src/modules/scheduling/cancellation.js` — provider-scoped transactional cancellation.
- `src/modules/scheduling/booking.js` — provider-only cancellation route and refreshed response.
- `client/src/pages/ProviderAppointments.jsx` — accessible cancellation action and feedback.
- `docs/API.md` — documented provider cancellation route.
- `tests/cancellation.test.js`, `tests/booking.test.js`, `tests/booking-cancellation.database.test.js` — command, API, and PostgreSQL coverage.

## Acceptance criteria

| Criterion | Implementation |
|---|---|
| AC-065 | Cancelled appointments remain stored and are returned as cancelled in provider and owner appointment views. A PostgreSQL integration test covers both views. |
| AC-066 | Started or already-cancelled appointments return `APPOINTMENT_NOT_CHANGEABLE`; command tests cover equal, past, and cancelled states. |

## Limitations

The PostgreSQL integration cases require `TEST_DATABASE_URL`; that variable was unavailable during this run. Browser/assistive-technology review and hosted Vercel/Neon validation remain follow-ups.
