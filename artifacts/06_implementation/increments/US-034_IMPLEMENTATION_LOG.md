# US-034 Implementation Log

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-10-11 |
| HU | US-034 — Sign out |
| Epic | EPIC-001 — Accounts and Access |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v2.json` |
| Story | As a signed-in user (pet owner or provider), I want to sign out from the menu of my interface, so that nobody else can use my account on this device, and I can sign in again with another account type. |
| Requirements | FR-039, NFR-002 |
| Acceptance criteria | AC-112, AC-113 |
| Business rules | BR-040 |
| Edge cases | EDGE-031 |
| Dependencies | DEP-001 — authenticated features require a signed-in user of the correct type; US-003 supplies validated session resolution and protected routes. |
| Planning | P0 / SPRINT-001 / 1 point / RELEASE-001 / PLANNED |
| Architecture / contracts | `artifacts/05_architecture/ARCHITECTURE_V2.md`; `ARCHITECTURE_VALIDATION_V2.md`; `API_SPEC_V1.yaml`; `DATA_MODEL_V1.md` |
| UX | `artifacts/04_ux/UX_SPEC_V2.md`; `UX_SPEC_VALIDATION_V2.md` |
| Foundation validation | PASS_WITH_WARNINGS; no outstanding foundation condition prevents local sign-out work. Hosted Vercel/Neon condition COND-001 remains open. |
| Related implementations | US-001, US-002 and US-003 are validated PASS_WITH_WARNINGS. |
| Implementation status | **READY_FOR_VALIDATION** |

## 2. Story Summary and Scope

Implement immediate sign-out from the account menu for owner and provider interfaces. End the current server-side session, clear the session cookie, return to sign-in without a confirmation dialog, and ensure a signed-out session cannot reopen protected screens. If the sign-out request cannot reach the server, remove access in the current browser session and leave server-side expiry as the fallback per approved UX assumption P04-ASM-026.

No account switching UI, new session policy, or unrelated authenticated feature is included.

## 3. Readiness Assessment

Implementation proceeded. The story is canonical and marked PLANNED, with no open questions. Foundation validation is PASS_WITH_WARNINGS. US-003's validated session resolver, cookie contract and protected route guard satisfy DEP-001 and provide the integration point. Architecture IF-025 explicitly defines a public, idempotent sign-out operation that always clears the cookie. UX COMP-UX-021 and FLOW-UX-019 define the account menu and no-confirmation interaction.

The hosted Vercel/Neon condition COND-001 remains unverified, but does not block local implementation or validation.

## 4. Technical Implementation Plan

1. Add IF-025 `POST /api/auth/sign-out`: hash the cookie token, mark its session ended, and always clear the secure session cookie with 204.
2. Add the COMP-UX-021 account menu to both current protected route surfaces, with account type, immediate sign-out, Escape and outside-click dismissal, and focus behavior.
3. On sign-out, immediately clear local session state and route to sign-in. Persist a browser-session marker so a failed network request does not restore local access after reload; clear it after successful authentication.
4. Test active, repeated and absent-session API behavior, cookie attributes, persisted session end, and regression/build behavior.

## 5. Implemented Changes

| File | Change | Traceability |
|---|---|---|
| `src/modules/identity/sign-up.js` | Added public, idempotent `POST /auth/sign-out`; sets `session.ended_at` using the cookie token hash and always clears `vetcare_session` with HttpOnly, Secure, SameSite=Lax, Path=/, Max-Age=0; returns 204. | US-034; AC-112; FR-039; BR-040; IF-025 / COMP-004 |
| `client/src/App.jsx` | Added a shared signed-in header/account disclosure for owner and provider routes; displays account type and “Cerrar sesión”; closes on Escape/outside click; sign-out clears local routing state immediately and navigates to sign-in. Session storage marker prevents session bootstrap from restoring access after a network failure; successful authentication clears it. | US-034; AC-112, AC-113; EDGE-031; COMP-UX-011, COMP-UX-021; FLOW-UX-019; P04-ASM-026 |
| `client/src/design-system/global.css` | Added token-based header and account-menu styling. | US-034; COMP-UX-021; CR-012 |
| `tests/sign-out.test.js` | API tests for active-session termination, cookie clearing, repeated sign-out, ended-session resolution and absent-session behavior. | AC-112; IF-025; BR-040 |
| `tests/sign-out.database.test.js` | PostgreSQL temporary-schema integration verifies persisted `ended_at`, cleared cookie and session state `none` after sign-out. | AC-112; AC-113; IF-025; EDGE-031 |

No migration or dependency was required. No API schema changes were needed because IF-025 already exists in API_SPEC_V1.

## 6. Acceptance Criteria Coverage

| ID | Expected behavior | State | Implementation / P06.3 evidence |
|---|---|---|---|
| AC-112 | Given a signed-in owner or provider, selecting sign-out ends the session without confirmation and takes the user to sign-in. | IMPLEMENTED | Endpoint ends the matching server session and clears cookie; shared menu signs out immediately. API and PostgreSQL tests pass; UI build succeeds. |
| AC-113 | Given a user who signed out, opening a screen of their interface asks them to sign in again. | IMPLEMENTED | Server resolver returns `none` for ended sessions; existing protected route guard redirects non-active sessions to `/sign-in`. PostgreSQL test confirms ended session state; prior US-003 route tests cover protected paths. |

## 7. Business Rules, Edge Cases, and Dependencies

| ID | Treatment and evidence |
|---|---|
| BR-040 | Sign-out is offered from the account menu of either interface, ends the session and routes to sign-in without a confirmation. API and UI implementation; P06.3 checks passed. |
| EDGE-031 | Server returns session state `none` for an ended session; existing protected routes direct the user to sign-in. PostgreSQL API integration verifies ended state; US-003 independently validates session routes. |
| DEP-001 | Reuses validated US-003 session resolution, sign-in state, and role-protected routes. No dependency blocker. |
| P04-ASM-024 | Menu shows “Cuenta”, account type, and “Cerrar sesión”; implemented for owner and provider protected surfaces. |
| P04-ASM-026 | Local access is removed immediately and across reloads in the browser session even if the sign-out request fails; server-side session then expires under NFR-005. Network failure path is implemented by optimistic local transition but was not exercised in a browser. |

## 8. Tests and Verification Results

| Check | Command | Result | Evidence / limitation |
|---|---|---|---|
| Focused sign-out API/database tests | `node --env-file-if-exists=.env --test tests/sign-out.test.js tests/sign-out.database.test.js` | PASSED | 3 passed, 0 failed, 0 skipped; PostgreSQL-backed test executed. |
| Full regression suite (before the PostgreSQL sign-out test was added) | `npm.cmd test` | PASSED | 78 passed, 0 failed, 0 skipped. |
| Final full regression rerun after adding PostgreSQL sign-out coverage | `npm.cmd test` | PASSED | 79 passed, 0 failed, 0 skipped. |
| Client production build | `npm.cmd run build` | PASSED | Vite 8.3.4; 32 modules transformed. |
| Diff whitespace check | `git diff --check` | PASSED | No whitespace errors; Git reported standard LF-to-CRLF notices. |
| Browser interaction | — | NOT_RUN | Account-menu focus, outside-click, Escape and offline behavior were source-reviewed; no graphical browser run was made. |
| Hosted runtime | — | NOT_RUN | Vercel/Neon condition COND-001 remains open from the foundation. |

## 9. Repository Changes

Created `tests/sign-out.test.js`, `tests/sign-out.database.test.js`, and this implementation log. Modified `src/modules/identity/sign-up.js`, `client/src/App.jsx`, `client/src/design-system/global.css`, and `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`. No files were deleted, no migration/dependency was added, and no commit was created.

## 10. Architecture Conformance and Deviations

The API implements existing IF-025 exactly: public/idempotent POST, 204, session end, cookie clearing, and the existing Origin guard. The client menu follows COMP-UX-021; route guards and session-state lookup from US-003 are reused. Token-only styles preserve CR-012. No material architectural or contract deviation was introduced.

## 11. Assumptions, Risks, and Outstanding Work

| Item | Impact / evidence | Next action |
|---|---|---|
| Hosted COND-001 | Deployment, pooled Neon behavior and runtime cookie handling are not verified. This predates US-034 and does not block local acceptance. | Complete architecture foundation verification before hosted deployment. |
| Browser interaction | Menu focus behavior, screen-reader interaction, and offline UI behavior were not manually exercised in a browser. | Verify during P06.4/P07 browser checks; local build and source review are available now. |

## 12. Final Implementation Status

**READY_FOR_VALIDATION** — the API, account menu, local sign-out transition, route protection integration, and tests are implemented. P06.3 checks passed. P06.4 should independently inspect the endpoint and client transitions, verify every criterion, and assess the noted browser/hosted limitations.

## 13. Handoff to P06.4

- **HU:** US-034, `artifacts/03_planning/product_backlog_priori_v2.json` (`items[id=US-034]`).
- **Criteria:** AC-112 and AC-113 implemented.
- **Files:** identity router, client app shell, token-based global styles, and two sign-out test files listed above.
- **Checks:** focused sign-out tests passed (3/3); full suite passed (78/78); client build and `git diff --check` passed.
- **Review focus:** verify menu on both account types, immediate local session removal and reload behavior, network-failure fallback, cookie clearing, idempotence, DB ended state, and protected-route denial after sign-out.
- **Known limitations:** no browser-driven menu/offline check; hosted Vercel/Neon COND-001 remains open.
