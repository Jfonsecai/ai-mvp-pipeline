# US-012 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-11-10 |
| HU | US-012 — Remove a service |
| Epic | EPIC-004 |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` (item `US-012`, `iteration_2_status: COMMITTED`) |
| Backlog status | PLANNED; scope MVP_CORE; P2 / SPRINT-002 / RELEASE-002; 3 story points; developers Casanova, Sebas |
| Requirements | FR-013 |
| Acceptance criteria | AC-032, AC-083 |
| Business rules | BR-034, BR-035 |
| Edge cases | EDGE-012 |
| Backlog dependencies | DEP-001, DEP-003 |
| Architecture / contracts | `ARCHITECTURE_V4.md` (§6.4 COMP-007 and COMP-009, §7.1 IF-037, IF-044, §8.3 "Remove a service", ADR-020, CR-029); `ARCHITECTURE_VALIDATION_V4.md`; `API_SPEC_V2.yaml` (`DELETE /api/provider/offerings/{offeringId}`, `removeOffering`, `RemovalResult`); `DATA_MODEL_V1.md`; migration `002_iteration2_removal.sql` |
| UX | `UX_SPEC_V3.md` (COMP-UX-007 catalog variant, COMP-UX-022 confirmation dialog and its "Remove service (US-012)" text, SCR-UX-011 remove, FLOW-UX-027); `UX_SPEC_V2.md` for the unchanged parts; `UX_SPEC_VALIDATION_V3.md` |
| Foundation validation | PASS_WITH_WARNINGS (`artifacts/06_implementation/FOUNDATION_VALIDATION.md`) |
| Related stories | US-011 (update a service, committed as `f19dbbe`; its edit route already treats removed services as not found); US-021 and US-024 (appointment views, validated PASS_WITH_WARNINGS: where AC-083 is observed); US-016/US-018/US-019/US-020 (search, public profile, booking: where the removal must show); **US-015 (remove a product) is not part of this increment** |
| Implementation status | **READY_WITH_LIMITATIONS** |

**Input conflicts recorded (not silently reconciled).**

1. `P06.3_US_implementation.md` §2 lists iteration-1 artifacts (`PRIORITIZATION_V2`, `product_backlog_priori_v2.json`, `REQUIREMENTS_v3`, `ARCHITECTURE_V2`, `UX_SPEC_V2`…) and `prompts/system/SYSTEM_PROMPT.md`; the request names `product_backlog_priori_v3.json` and the repository is at iteration 2 (`REQUIREMENTS_V4`, `ARCHITECTURE_V4`, `API_SPEC_V2`, `UX_SPEC_V3`). The repository state takes precedence (SYSTEM_PROMPT §3): the iteration-2 artifacts were used and the earlier ones for unchanged parts. `SYSTEM_PROMPT.md` lives at `prompts/system/SYSTEM_PROMPT.md`, not at the repository root named in the request. US-012 is identical in the V2 and V3 backlog except for the added iteration-2 fields.
2. `API_SPEC_V2.yaml` defines **one** operation, `DELETE /api/provider/offerings/{offeringId}` (IF-037), for services (US-012) and products (US-015). This increment implements the service half only. For a product id the route answers `NOT_FOUND` (the same answer as for any id that cannot be removed) until US-015 extends it. Flagged so the US-015 run does not read the answer as a defect.
3. `ARCHITECTURE_V4` §7.2 draws IF-044 as "COMP-009 → COMP-007" while §6.4 and §8.3 say COMP-007 *calls* it during service removal. The implementation follows §6.4/§8.3: COMP-007 calls a COMP-009 command, and the command lives in COMP-009 (`src/modules/scheduling/cancellation.js`, next to the existing hours command `hours.js`). The arrow direction in the table is inconsistent with the text; nothing in the code depends on it.
4. The ID `CR-027` has two meanings (backlog trace: the change request that promoted the catalog stories; `ARCHITECTURE_V4`: voice transcripts are never logged). Same remark as in the US-011 log; nothing in this story depends on either.
5. The git status shown at the start of the conversation (US-011 files uncommitted) was stale: US-011 is committed (`f19dbbe`). The working tree before this increment was clean, so every change below belongs to US-012.

## 2. Story Summary and Scope

**In scope.** A signed-in provider removes one of its own published services. The service leaves the provider's catalog, the public profile and every search (text, species filter, voice, assistant), and new appointments for it cannot be booked (AC-032). Its upcoming scheduled appointments are cancelled in the same transaction and remain visible to the owners and to the provider, shown as cancelled (AC-083, BR-034, BR-035, EDGE-012).
Delivered as the vertical slice: `DELETE /api/provider/offerings/:offeringId` (IF-037, services), the cancellation command (IF-044), an "Eliminar" action on each service card of the catalog (SCR-UX-011) and the confirmation dialog (COMP-UX-022) with the texts of UX_SPEC_V3 §5, then the card disappears and "Servicio eliminado." is shown.

**Excluded.** Removing a product (US-015, with its own dialog text); updating products (US-014); cancelling or rescheduling an individual appointment (US-022, US-023, US-025, US-026); the pet-removal dialog of the owner (US-007 uses its own `window.confirm`; not touched); any change to the schema or the API contract.

**Applicable criteria and rules.** AC-032, AC-083; BR-034 (upcoming appointments of a removed service are cancelled automatically; scope limited to the affected appointments), BR-035 (cancelled appointments remain visible, shown as cancelled); EDGE-012; NFR-002 (a provider changes only its own catalog; CR-006 uniform `NOT_FOUND`); CR-029 (user-facing reads exclude removed rows, history does not).

## 3. Readiness Assessment

Implementation could proceed. The backlog entry is PLANNED with no open questions. DEP-001 (provider session and guard, US-003) and DEP-003 (published services, US-010) are satisfied by implemented code. Step 0 of iteration 2 had already delivered what this story depends on: migration 002 (`offering.removed_at`), the `removed_at IS NULL` filters on the catalog, public profile, search and booking reads, the history reads that keep removed services visible on appointment lists (`getServiceFacts(..., { includeRemoved: true })`), and the booking re-read of the service under the provider lock. `ARCHITECTURE_V4` §6.4, §7.1 and §8.3 specify the operation and API_SPEC_V2 its request and response; no contract or schema change was needed. The appointment lists (US-021, US-024) exist, so AC-083 can be observed end to end (unlike US-010/US-013/US-019, which waited for those screens). Foundation validation is PASS_WITH_WARNINGS. No blocker.

**Environment.** The project's test database (Docker `vetcare-postgres`, PostgreSQL 16.15, `TEST_DATABASE_URL` in `.env`) was running. The development database `vetcare_dev` still lacks migration 002 (see the index); it was **not** used and not modified. The browser check used a disposable schema inside the test database (created and dropped by this execution).

## 4. Technical Implementation Plan

Initial plan, all steps completed:

1. Add the IF-044 command in COMP-009: cancel the `scheduled` appointments of one service that start after `now`, in the caller's transaction.
2. Add `removeService` and `DELETE /provider/offerings/:offeringId` in COMP-007: provider-only guard, canonical-UUID check, one transaction: provider lock (IF-024) → own active service `SELECT … FOR UPDATE` → `removed_at = now` → IF-044 → `{ removed, cancelledAppointments }`; anything else is `NOT_FOUND`.
3. Check, without changing code, that every read named by AC-032 already excludes removed rows and that booking rejects a removed service even when it was waiting for the lock (confirmed by tests below).
4. Client: "Eliminar" on service cards, confirmation dialog (COMP-UX-022), success notice, failure and already-removed handling, focus handling.
5. Tests: request handling without a database; PostgreSQL tests through the real registry covering visibility everywhere, cancellation and its display, ownership, races, atomicity.
6. Run the focused and full suites, the build and a browser check; document.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/scheduling/cancellation.js` (new) | `cancelUpcomingServiceAppointments(client, { serviceId, now })`: one `UPDATE appointment SET status = 'cancelled', cancelled_at = $2 WHERE service_id = $1 AND status = 'scheduled' AND starts_at > $2`; returns the row count. Never deletes. | US-012; AC-083; BR-034, BR-035; EDGE-012; IF-044 |
| `src/modules/catalog/offerings.js` | New exported `removeService(db, { providerId, serviceId, now })` and route `DELETE /provider/offerings/:offeringId` (provider-only, UUID check, `clock.now()`); `createCatalogRouter` now also receives `clock`. Publishing, listing and the US-011 update are unchanged. | US-012; AC-032, AC-083; NFR-002; IF-037, IF-024, IF-044; CR-006, CR-029 |
| `client/src/pages/ProviderCatalog.jsx` | "Eliminar" button on each service card (accessible name "Eliminar: [name]"); `ConfirmRemoveDialog` (native modal `<dialog>`, texts of UX_SPEC_V3 §5, "No, volver" first, "Sí, eliminar", busy state, in-dialog error); success: card removed, "Servicio eliminado." (role=status); 404: dialog closed, list reloaded, message "Ese servicio ya no existe. Actualizamos tu catálogo."; other failure: "No pudimos eliminar el servicio. Inténtalo de nuevo." inside the dialog; focus returns to the opener, or to the services heading when the card is gone. Products get no action (US-015). | SCR-UX-011; COMP-UX-007, COMP-UX-022; FLOW-UX-027; AC-032 |
| `client/src/design-system/global.css` | Classes for the card action row, the destructive link/button (`color-error` token) and the dialog (existing tokens only; no new token). | COMP-UX-022, COMP-UX-007 |
| `docs/API.md`, `docs/USER_GUIDE.md` | One endpoint row and one sentence for «Eliminar». | documentation |
| `tests/catalog-services-remove.test.js` (new) | 9 tests without a database. | AC-032; NFR-002; IF-037, IF-044 |
| `tests/catalog-services-remove.database.test.js` (new) | 8 PostgreSQL tests through the real registry. | AC-032, AC-083; BR-034, BR-035; EDGE-012 |

No change was needed in `booking.js`: its existing re-read of the service under the provider lock (written in Step 0) is what makes a booking fail with `NOT_FOUND` after a removal.

## 6. Acceptance Criteria Coverage

| ID | Authoritative expected behavior | State | Files / evidence |
|---|---|---|---|
| AC-032 | A signed-in provider with a published service who removes it: the service no longer appears in their catalog, on their profile or in search results, and new appointments for it cannot be booked. | IMPLEMENTED | `removeService` / `DELETE /provider/offerings/:offeringId`; "Eliminar" + dialog on the catalog. PostgreSQL test: after the removal the service is absent from `GET /provider/offerings`, from the public profile, from `GET /search` (with and without the species filter), from the voice search and from the assistant's answer, the booking context and `POST /owner/appointments` answer `404 NOT_FOUND`, no appointment row is written, the row stays (`removed_at` set, no other column changed) and the provider's other service is untouched and still bookable. Browser: the card disappears with "Servicio eliminado.", the owner's search lists only the remaining service and the public profile shows only it. |
| AC-083 | A removed service that had upcoming appointments: the owners and the provider open their appointments and those appointments are shown as cancelled. | IMPLEMENTED | `cancelUpcomingServiceAppointments` inside the removal transaction. PostgreSQL test: three upcoming appointments (two owners, two weeks) become `cancelled` with `cancelled_at = now`; a started appointment, an already-cancelled one and an appointment of another service are byte-identical; nothing is deleted; `GET /owner/appointments` (both owners) and `GET /provider/appointments` list them with `status: cancelled` and the removed service's name; the assistant no longer offers them. Browser: the provider's and the owner's appointment lists show "Cancelada" with the removed service's name next to a still "Programada" appointment of the other service. |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment / evidence |
|---|---|
| BR-034 | Only `scheduled` appointments of the removed service that start after `now` are cancelled, in the removal's own transaction (no window in which the service is removed but its appointments are still scheduled; a forced failure of the cancellation rolls the removal back — test). Other services, started and already-cancelled appointments are unchanged (full-row comparison). |
| BR-035 | Cancelled appointments are updated, never deleted, and the lists read the service with `includeRemoved`, so they stay visible as "Cancelada" (tests and browser). |
| EDGE-012 | The provider removes a service with upcoming appointments: those appointments are cancelled and shown as cancelled (see AC-083). The `RemovalResult.cancelledAppointments` count equals the number of rows cancelled (including under a concurrent booking storm). |
| NFR-002 / CR-006 | The provider id comes only from the session; the `SELECT … FOR UPDATE` and the guard are scoped by `provider_id`. Another provider's service, a product, an unknown id, an account id, a malformed id and an already removed service all answer the same `404 NOT_FOUND`; owners get `404`, anonymous `401`, foreign Origin `403`; nothing is written. |
| CR-029 | No new filter was needed (Step 0); the new tests are the evidence that no user-facing read was missed for services (P05-RISK-024). |
| IF-024 | The removal takes the provider lock first, the same lock used by booking, hours saves and US-011 edits; a removal waits for a transaction holding it, and a booking that waited sees the service as removed (tests). |
| Independent veterinarian's slot (BR-013) | Cancelling frees the slot (the unique index covers only `scheduled`): a second service of the same veterinarian can take it (test). |
| DEP-001 / DEP-003 | Provider-only guard reused; the target must be an active service of the provider. |

## 8. Tests and Verification Results

Tests added: `tests/catalog-services-remove.test.js` (9) and `tests/catalog-services-remove.database.test.js` (8): 17 new tests. Executed:

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Baseline | Not re-run before the change in this execution | NOT_RUN | The US-011 log records 231/231 on the same PostgreSQL 16 test database; the working tree was clean at the start (US-011 committed as `f19dbbe`). The final count below equals 231 + 17, which is consistent with no existing test having been lost. |
| Focused, no database | `node --env-file-if-exists=.env --test tests/catalog-services-remove.test.js` | PASSED | 9 of 9. |
| Focused, PostgreSQL | `node --env-file-if-exists=.env --test tests/catalog-services-remove.database.test.js` | PASSED | 8 of 8, 0 skipped, against `vetcare-postgres` (PostgreSQL 16.15) in a throwaway schema. They passed on the first run; P06.4 should mutation-test them (they cover the lock, the filters and the cancellation window). |
| Full regression | `npm test` | PASSED | 248 tests, 248 passed, 0 failed, 0 skipped (231 + 17). |
| Production build | `npm run build` | PASSED | Vite build succeeded. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Browser check | API (on a disposable schema of the test database, migrations 001–002) and Vite dev server started for this check and stopped afterwards; a clinic with two services, two owners, three upcoming appointments; sign-in through the real forms; DOM-driven interaction (the browser pane could not draw) | PASSED (manual) | "Eliminar" on both cards; the dialog opens modal with the UX text and focus on "No, volver"; "No, volver" and Escape close it, keep the card and return focus to the button; "Sí, eliminar" removes the card, shows "Servicio eliminado.", moves focus to the services heading; the provider's appointments show the two removed-service appointments as "Cancelada" and the other as "Programada"; the owner sees the same, and search and public profile list only the remaining service; at 375 px the dialog fits (19–356 px) with 44 px buttons and no horizontal page overflow. Visual appearance was not assessed (pane could not draw); the 404 and server-failure paths of the dialog were not exercised in the browser. |
| Hosted Vercel / Neon behavior | — | NOT_RUN | Migration 002 still has to be applied to Neon before the iteration-2 deployment; COND-001 history unchanged. |

## 9. Repository Changes

Created: `src/modules/scheduling/cancellation.js`, `tests/catalog-services-remove.test.js`, `tests/catalog-services-remove.database.test.js`, and this log. Modified: `src/modules/catalog/offerings.js`, `client/src/pages/ProviderCatalog.jsx`, `client/src/design-system/global.css`, `docs/API.md`, `docs/USER_GUIDE.md`, `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. Deleted: none. No migration, dependency manifest, lockfile, `.env`, API contract or earlier validation report was changed. No commit was made. Temporary data: the browser schema was dropped; the API and Vite processes started for the check were stopped.

## 10. Architecture Conformance and Deviations

Conforms to `ARCHITECTURE_V4` §8.3 ("provider lock → own active service `FOR UPDATE` → `removed_at = now()` → IF-044 cancel upcoming → `COMMIT`"), ADR-020 (logical removal with cascaded cancellation through one command, at most one command per operation), CR-029 (history views do not filter), CR-006 (uniform `NOT_FOUND`) and IF-037's outcomes. The response is the `RemovalResult` schema of API_SPEC_V2 (a test compares its keys to the spec).

**Documented implementation details (not deviations).** (a) Services only on a route the contract shares with products (conflict 2 above). (b) The IF-044 command is a new file in COMP-009 beside `hours.js` rather than inside `booking.js`, to avoid a circular import (`booking.js` already imports the catalog). (c) The confirmation is a native `<dialog>`; this is the first implementation of COMP-UX-022, and US-015 and US-022 can reuse the pattern (it is currently local to the catalog page, not a shared component). (d) The success message is the inline status notice already used by the catalog (US-011) rather than a toast. No formal architectural review is required.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Type | Impact / next action |
|---|---|---|
| Products cannot be removed yet; `DELETE` on a product id answers `NOT_FOUND`. | Scope boundary | US-015 extends the same route (and the catalog card) for products. |
| What the owners and the provider see for a removed service's appointments is the service's name (the appointment keeps a reference to the preserved row). | Technical decision | Consistent with CR-029 and with the open F-01 of US-011 (name snapshot); no new decision. |
| Notification of the owners whose appointments were cancelled is not part of the story (no notification channel exists in the approved scope); they see the state when they open "Mis citas". | Product observation | None required; flagged in case the team expected it. |
| The dialog and the focus handling were checked through the DOM and at 375 px, not with a real keyboard/screen reader or a visual pass; there are no automated client tests (the client has no test runner). | Unverified behavior | P06.4 and P07. |
| The booking screen's handling of a removed service (user opens a stale link) was verified at API level (`404`), not in the browser. | Unverified behavior | P06.4 may repeat with the screen. |
| `window.confirm` is still used by the owner's pet removal (US-007), with different wording from COMP-UX-022. | Out of scope | Follow-up for the pets story owners. |
| Hosted runtime: migration 002 on Neon and on the development database `vetcare_dev` is pending; tests ran on the project's PostgreSQL 16 test database, not on Neon. | External limitation | Required before deploying iteration 2. |

## 12. Final Implementation Status

**READY_WITH_LIMITATIONS.** Both acceptance criteria are implemented and pass automated and manual evidence; the limitations (no real keyboard/visual pass, hosted run pending, products deferred to US-015) are documented and non-blocking. This status is not a validation result.

## 13. Handoff to P06.4

Validate **US-012** from `artifacts/03_planning/product_backlog_priori_v3.json`. Inspect `src/modules/catalog/offerings.js` (`removeService` and the `DELETE` route), `src/modules/scheduling/cancellation.js`, `client/src/pages/ProviderCatalog.jsx`, `client/src/design-system/global.css` and the two new test files. Independently run `npm test` with `TEST_DATABASE_URL` set, `npm run build` and `git diff --check`. Specifically verify:
(1) every place the removal must show up (catalog, public profile, search with and without the species filter, voice search, assistant, booking context, booking, edit route of US-011) excludes the service and none still offers it;
(2) the cancellation: only `scheduled` appointments that start after `now`, of that service only, for every owner and for the provider; started and already-cancelled appointments and other services' appointments untouched; rows never deleted; the cancelled ones visible as cancelled in both lists; the count in the response;
(3) ownership: no way to remove a service of another provider, a product, an unknown or removed id; no write on refusal (full-row comparison);
(4) the transaction: the provider lock is taken, the removal waits for a competing transaction, a booking that waited fails with `NOT_FOUND`, a failure while cancelling rolls the removal back, and concurrent bookings plus the removal end consistent;
(5) the free slot of an independent veterinarian after the cancellation;
(6) the dialog: UX text, "No, volver" default, Escape, busy and error states, focus return, the 404 path (already removed elsewhere), mobile width;
(7) that the earlier stories (US-010, US-011, US-016–US-024, US-035–US-041) are unaffected;
(8) that the tests fail when the code is broken (mutation checks on the lock, the `scheduled`/`starts_at` window, the `service_id` scope, the kind/ownership scope and the cancellation call).

## 14. Addendum (2026-11-10, after P06.4)

Sections 1–13 describe the increment as handed to validation and are kept unchanged. What P06.4 added or corrected (details in `US-012_IMPLEMENTATION_VALIDATION.md`):

- **Traceability (F-02).** `PRIORITIZATION_V3.md` lists a planning dependency **DEP-012** for US-012 ("automatic-cancellation criteria need existing appointments": booking already exists, so only test data is needed). It is not in the backlog's `dependency_ids` nor in `REQUIREMENTS_V4`, so section 1 did not list it. It is satisfied: both database test files and the browser checks create real appointments.
- **Test added (F-03).** A ninth PostgreSQL test pins the boundary of BR-034 by behavior: an appointment starting exactly at `now` is not cancelled, one an hour later is. Before it, the `>` operator was fixed only by the SQL text asserted in the no-database test. Tests added by this story are now 18 (9 + 9); the full suite is **249 of 249** (231 + 18).
- **Comment fixed (F-01).** A stale comment in `ProviderCatalog.jsx` (`{ service, opener }`) now says the opener button is kept in `openerRef`.
- **Browser paths verified.** The 404 path ("Ese servicio ya no existe…" and a reloaded list), the server-failure path (error inside the dialog, retry succeeds) and the stale booking link (redirect to the not-found screen) were exercised in the browser; section 11's statement that they were unverified no longer applies.
