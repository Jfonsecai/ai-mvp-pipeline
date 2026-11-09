# US-035 Implementation Log (includes SPRINT-002 step 0)

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-11-09 |
| HU | US-035 — Search by voice |
| Epic | EPIC-009 — Voice Search and Assistant |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` v3.1 |
| Story | As a pet owner, I want to say what service or product I need instead of typing it, so that I can search quickly from my phone even when my hands are busy. |
| Requirements | FR-040, FR-041, FR-042, FR-017, FR-018; NFR-006, NFR-007, NFR-008 |
| Acceptance criteria | AC-115 to AC-123, AC-159 |
| Business rules | BR-041, BR-042, BR-043, BR-044, BR-050, BR-051, BR-053 |
| Edge cases | EDGE-033 to EDGE-038, EDGE-047 |
| Dependencies | DEP-001, DEP-018 (text search and species filter, delivered in SPRINT-001); P03 DEP-025 (shared voice input, built here) |
| Planning | P0 / SPRINT-002 / 5 points / RELEASE-002 / PLANNED; proposed assignees David, Jhonier |
| Architecture / contracts | `ARCHITECTURE_V4.md` v4.1 (§6.3, §6.4 COMP-008, §15.1); `ARCHITECTURE_VALIDATION_V4.md` (PASS); `API_SPEC_V2.yaml` (`voiceSearch`, IF-041); migration `002_iteration2_removal.sql` |
| UX | `UX_SPEC_V3.md` v3.1 (SCR-UX-004 modified, COMP-UX-023, MSG-VOICE-*); `UX_SPEC_VALIDATION_V3.md` |
| Implementation status | **READY_FOR_VALIDATION** |

## 2. Story Summary and Scope

The owner taps a microphone on *Buscar*, speaks, and the platform searches with the interpreted text and species, showing what was heard. Included: the SPRINT-002 step 0 prerequisites (ARCHITECTURE_V4 §15.1), the server-side phrase interpreter and voice-search operation, the shared client voice module (COMP-014) and voice button (COMP-UX-023), and the `?q=&species=` hand-off used later by the assistant's *"Ver todos en Buscar"*. Not included: the assistant (US-036+), spoken answers (US-041).

## 3. Readiness Assessment

Ready: requirements v4.1, plan v3.1, UX v3.1 and architecture v4.1 validated (PASS_WITH_WARNINGS / PASS). Condition from P05 validation: step 0 first — done in this increment (§5.1). No blocking decision.

## 4. Technical Implementation Plan

1. Step 0: migration 002; contract tests and QA suite on `API_SPEC_V2.yaml`; outcome APPOINTMENT_NOT_CHANGEABLE; `removed_at` filters; extract `searchOfferings`.
2. Server: `voice-phrase.js` (pure interpretation + retry) and `POST /api/search/voice`.
3. Client: `voice/speech.js` (COMP-014), `voice/VoiceInputButton.jsx` (COMP-UX-023), SCR-UX-004 changes and styles with existing tokens.
4. Tests: unit (text) and PostgreSQL; browser walk-through with a simulated recognizer.

## 5. Implemented Changes

### 5.1 Step 0 (commit `700e63f`)

| Change | Files |
|---|---|
| Logical removal columns and partial indexes (ADR-020) | `migrations/002_iteration2_removal.sql` |
| Contract tests on V2; migration list test includes 002 and checks `removed_at` | `tests/helpers.js`, `tests/contract-consistency.test.js`, `tests/database.test.js`, `tests/shared.test.js`, QA `contract/api-contract.test.js`, `support/schema-validator.js` |
| APPOINTMENT_NOT_CHANGEABLE → 409 | `src/shared/outcomes.js` |
| Reads exclude removed pets and offerings (CR-029): owner pets, provider catalog, service facts, search | `src/modules/pets/owner-pet.js`, `src/modules/catalog/offerings.js`, `src/modules/search/offerings.js` |
| Booking re-checks the service and reads the pet `FOR SHARE` under the provider lock (§8.3) | `src/modules/scheduling/booking.js` |
| `searchOfferings(db, { q, species })` extracted, no behavior change | `src/modules/search/offerings.js` |
| `GET /owner/pets` returns `OwnPet` (all fields), required by the V2 contract test | `src/modules/pets/owner-pet.js` |
| Contract adjustment: optional `weightKg`/`heightCm` and voice `query` are **omitted** instead of `null` (CTR-003 convention; the QA validator does not support `null` types) | `artifacts/05_architecture/API_SPEC_V2.yaml` |

### 5.2 US-035

| Change | Files |
|---|---|
| Phrase interpreter (BR-043 species words with connectors and conjunctions; BR-044 leading/trailing fillers; 120-character cut) and `voiceSearch` with the BR-053 retry | `src/modules/search/voice-phrase.js` (new) |
| `POST /api/search/voice` (owner only; validates `transcript` 1–300 and `species`; nothing stored or logged) | `src/modules/search/offerings.js` |
| COMP-014: `listenOnce` (es-CO), error kinds `not_allowed` / `no_speech`, `speak`/`stopSpeaking`, voice-reply preference, price-to-speech helper (for US-041) | `client/src/voice/speech.js` (new) |
| COMP-UX-023 (hidden without support; listening state; stop) | `client/src/voice/VoiceInputButton.jsx` (new) |
| SCR-UX-004: microphone, heard line with *"Ocultar"*, MSG-VOICE-EMPTY/-NOHEAR/-DENIED, voice-filled text and filter, `?q=&species=` hand-off | `client/src/pages/OwnerSearch.jsx` |
| Styles with existing tokens only (no new token) | `client/src/design-system/global.css` |

## 6. Acceptance Criteria Coverage

| AC | Evidence | Result |
|---|---|---|
| AC-115 | Unit test 1; DB test 10; browser row "AC-115/117" (text *vacunación*, *Perro* checked, 1 result) | PASS |
| AC-116 | Listening state rendered (*"Escuchando… toca para detener"*, `aria-pressed`), observed in the browser debug run; tapping again calls `stop()` | PASS (manual) |
| AC-117 | Heard line *"Escuché: «busco vacunación para mi perro»"* and filled controls (browser) | PASS |
| AC-118 | Browser row "AC-118": edited text *baño* searched as typed | PASS |
| AC-119 | Unit test 3, `voiceSearch` test; DB test 11 | PASS |
| AC-120 | Unit test 4; DB test 12; browser row "AC-120" (MSG-VOICE-EMPTY, no search) | PASS |
| AC-121 | Browser row "AC-121" (simulated `no-speech` → MSG-VOICE-NOHEAR) | PASS |
| AC-122 | Browser row "AC-122": 0 microphone buttons without voice support | PASS |
| AC-123 | Browser row "AC-123" (simulated `not-allowed` → MSG-VOICE-DENIED); screenshot `us035-voice-denied.png` | PASS |
| AC-159 | Unit test 8; DB test 13; browser row "AC-159" (box shows *alimento para gato adulto*, *Gato*) | PASS |

## 7. Business Rules, Edge Cases, and Dependencies

BR-041 (provider → 404, DB test 14); BR-042 (voice results equal typed results, DB test 10); BR-043/BR-044 (unit tests 2, 5, 6); BR-050/CR-027 (no storage; request logger records no body — `src/http/middleware.js`); BR-051 (typed search unchanged); BR-053 (unit 8, DB 13). EDGE-033 (AC-122), EDGE-034 (AC-123), EDGE-035 (AC-121), EDGE-036 (AC-120), EDGE-037 (unit 5), EDGE-038 (AC-118), EDGE-047 (AC-159).

## 8. Tests and Verification Results

| Check | Result | Evidence |
|---|---|---|
| `npm test` with PostgreSQL 16 (`TEST_DATABASE_URL`) | 189 / 189 pass, 0 skipped (was 175 before SPRINT-002) | `increments/evidence/us035-test-run.txt` |
| QA suite `artifacts/07_qa/test_suites` | 143 / 143 pass | same file |
| New US-035 tests | 14 / 14 (9 unit, 5 database) | `tests/voice-phrase.test.js`, `tests/voice-search.database.test.js` |
| Client build (`npm run build`) | Success | — |
| Browser walk-through (Chromium, local API + Vite + PostgreSQL, demo data; speech recognition **simulated**) | 8 / 8 checks as expected | `increments/evidence/us035-e2e-voice.mjs`, `us035-e2e-voice-output.txt`, `us035-voice-search.png`, `us035-voice-denied.png` |

**Not verified here:** real microphone recognition in Chrome desktop and Android on the HTTPS production domain (P05-ASM-020). The sandbox has no microphone; the browser test replaces the recognizer. This is the P03 step-1 check and must be recorded manually after deployment (P03-RISK-010, -011).

## 9. Repository Changes

Branch `dev`. Step 0: commit `700e63f`. US-035: this increment's commit. New files: `migrations/002_iteration2_removal.sql`, `src/modules/search/voice-phrase.js`, `client/src/voice/speech.js`, `client/src/voice/VoiceInputButton.jsx`, `tests/voice-phrase.test.js`, `tests/voice-search.database.test.js`, evidence files.

## 10. Architecture Conformance and Deviations

Conforms to ARCHITECTURE_V4 v4.1 (CR-027, CR-029, CR-031; ADR-020, ADR-022). Deviation **DEV-I2-001**: `API_SPEC_V2.yaml` changed two `null`-typed fields to optional omitted fields (§5.1) — a contract clarification consistent with CTR-003; recorded here and to be noted in P09. Chromium exposes unprefixed `SpeechRecognition`; COMP-014 prefers it and falls back to `webkitSpeechRecognition` (as designed).

## 11. Assumptions, Risks, and Outstanding Work

- Migration 002 must be applied to Neon (`npm run migrate` with `DATABASE_URL_UNPOOLED`) **before** this code is deployed, because the new queries filter `removed_at` (Fonseca, P08).
- Real-device voice check pending (above).
- The `?q=&species=` hand-off is implemented now; US-038 uses it.

## 12. Final Implementation Status

**READY_FOR_VALIDATION** — all US-035 acceptance criteria pass in automated or simulated-browser checks; real-microphone evidence is pending deployment.

## 13. Handoff to P06.4

Validate AC-115 to AC-123 and AC-159 with the evidence above; re-run `npm test` with `TEST_DATABASE_URL`; after deployment, record one real voice search on Chrome desktop and one on Android (values and screenshots).
