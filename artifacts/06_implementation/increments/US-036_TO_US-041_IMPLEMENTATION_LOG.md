# US-036 to US-041 Implementation Log — VetCare Assistant

> One log for six stories because they share one engine (COMP-013) and one screen (SCR-UX-018); acceptance criteria are reported per story in §6.

## 1. Metadata and Traceability

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.3_US_implementation.md` v1.0 |
| Execution date | 2026-11-09 |
| HUs | US-036 Talk to the assistant (P0, 5 pts) · US-038 Offerings and prices (P0, 2) · US-040 Help (P0, 1) · US-041 Hear the answers (P0, 3) · US-037 Providers (P1, 3) · US-039 My appointments (P1, 2) |
| Epic | EPIC-009 — Voice Search and Assistant |
| Backlog | `product_backlog_priori_v3.json` v3.1 (SPRINT-002 / RELEASE-002; proposed assignees Sebas, David, Jhonier, Casanova) |
| Requirements | FR-043 to FR-049; NFR-002, NFR-006 to NFR-008 |
| Acceptance criteria | AC-124 to AC-154, AC-160 |
| Business rules | BR-041, BR-045 to BR-049, BR-050 to BR-052, BR-054 |
| Edge cases | EDGE-033, EDGE-034, EDGE-039 to EDGE-046 |
| Architecture | `ARCHITECTURE_V4.md` v4.1 §6.2 (COMP-013), §6.3 (COMP-014), IF-042, IF-045 to IF-047, ADR-019, CR-028, CR-030, CR-031 |
| UX | `UX_SPEC_V3.md` v3.1 SCR-UX-018, COMP-UX-024 to -026 |
| Implementation status | **READY_FOR_VALIDATION** |

**Order note.** US-037 and US-039 (P1) were implemented together with the P0 stories because they are two more rules and templates in the same engine; this does not change the P03 priorities.

## 2. Scope

Included: the assistant engine on the server (classification, data reads, Spanish answers), the endpoint, the *Asistente* screen and tab, voice questions (reusing COMP-UX-023), spoken answers with mute/stop, and a fix of a history defect introduced in step 0 (§5.3). Not included: US-042 (conditional).

## 3. Readiness

All upstream artifacts validated; US-035 validated (PASS_WITH_WARNINGS) — its COMP-014 and phrase interpreter are reused. No blocking decision.

## 4. Plan

Pure classification and composition functions (tested on text) → read functions in the owning modules → stateless owner-only endpoint → screen → database and browser checks.

## 5. Implemented Changes

### 5.1 Server

| Change | Files |
|---|---|
| Classification rules in the ARCHITECTURE_V4 v4.1 order (action, help, my appointments, provider detail, providers list, offerings, fallback); provider matching by name tokens with the most specific match winning (BR-052) | `src/modules/assistant/intents.js` (new) |
| Answer templates of UX_SPEC_V3 v3.1 (texts, rows, order by BR-047, max 5 items, totals, search link, links); es-CO prices; Bogotá dates and 12-hour times | `src/modules/assistant/answers.js` (new) |
| `POST /api/assistant/messages` (owner only, 1–200 characters, stateless, read-only); offerings answered with the shared voice interpretation and search (CR-031, BR-053) | `src/modules/assistant/assistant.js` (new); `src/modules/index.js` |
| Read functions: `listProviderFacts` (COMP-006), `listProvidersWithHomeService` (COMP-007, IF-047) | `src/modules/provider/profile.js`, `src/modules/catalog/offerings.js` |

### 5.2 Client

| Change | Files |
|---|---|
| SCR-UX-018: greeting, conversation (`role="log"`), owner/assistant messages, item links, *"Ver todos en Buscar"* (`?q=&species=`), *"Ir a Buscar"* / *"Ir a Mis citas"*, network error with *"Reintentar"*, voice errors, composer (200 characters, transcripts cut to 200 — A5-VAL-004) | `client/src/pages/OwnerAssistant.jsx` (new) |
| Spoken answers: sentence + row labels, prices as "pesos", es-CO; on by default and remembered on the device; *"Detener lectura"*; a new question or leaving the screen stops the reading; controls hidden without speech synthesis | same file; `client/src/voice/speech.js` (from US-035) |
| Tab *"Asistente"* and route `/owner/assistant` | `client/src/App.jsx` |
| Styles with existing tokens; `visually-hidden` helper | `client/src/design-system/global.css` |

### 5.3 Defect fixed in step 0 code (found during this increment)

`listOwnerAppointments` / `listProviderAppointments` read the pet and the service with the step 0 functions that exclude removed rows. Once removal exists (US-007, US-012), an appointment of a removed pet or service would make the whole list fail with NOT_FOUND, contradicting CR-029 ("history views do not filter"). `getOwnerPet` and `getServiceFacts` now accept `{ includeRemoved: true }`, used by both appointment lists. A regression test is due with US-007/US-012 (no removal operation exists yet).

### 5.4 Defects found by the new tests and fixed before commit

- Hours/contact sentences ended in "p. m.." (double period) — fixed with a sentence helper.
- "horario de patitas norte" matched both "Clínica Patitas" and "Clínica Patitas Norte" → most specific match now wins.
- Spoken text read "Te muestro 1:. …" — the reading joins the rows after a colon without an extra period.

## 6. Acceptance Criteria Coverage

| Story | AC | Evidence | Result |
|---|---|---|---|
| US-036 | AC-124 | Browser: greeting, microphone and voice-reply control present | PASS |
| | AC-125 | Browser: typed question → answer appended | PASS |
| | AC-126 | Browser: simulated voice question shown with *"Por voz"* and answered | PASS |
| | AC-127 | Browser: leaving and returning shows only the greeting; server stateless (no table, no log of bodies) | PASS |
| | AC-128 | DB: provider session → 404; tab only in the owner navigation | PASS |
| | AC-129 | Unit; DB; browser (*"Ir a Mis citas"*) | PASS |
| US-037 | AC-130, AC-131, AC-160 | Unit; DB (all / clinics / home incl. a clinic with a "both" service and excluding an in-clinic-only clinic) | PASS |
| | AC-132, AC-133, AC-134, AC-135 | Unit; DB; browser (hours) | PASS |
| US-038 | AC-136, AC-137, AC-138, AC-139, AC-140 | Unit (order by price, labels with species, link when > 5); DB (6 results → 5 items + `searchLink`; no match); browser | PASS |
| US-039 | AC-141 | DB (exact sentence); browser | PASS |
| | AC-142 | Unit | PASS |
| | AC-143, AC-144 | DB: cancelled, past and other owner's appointments excluded (total 1) | PASS |
| US-040 | AC-145 | Unit; DB; browser | PASS |
| | AC-146, AC-147 | Unit; DB; browser (medical question → fallback that suggests booking) | PASS |
| | AC-148 | Browser: greeting with examples | PASS |
| US-041 | AC-149 | Browser: spoken text captured (`es-CO`, prices in pesos) and *"Leyendo…"* | PASS |
| | AC-150 | Browser: *"Detener lectura"* stops; text stays | PASS |
| | AC-151 | Browser: muted → 0 utterances | PASS |
| | AC-152 | Code: default on (`getVoiceReplies`); browser shows *"Voz activada"* on first open | PASS |
| | AC-153 | Code: `ask()` calls `stopSpeaking()` before sending | PASS (inspection) |
| | AC-154 | Browser: no voice support → no microphone and no voice controls | PASS |

## 7. Business Rules and Edge Cases

BR-041 (owner only), BR-045 (DB: appointment count unchanged after an action request), BR-046 (fallback), BR-047 (order and limit), BR-048 (own upcoming only), BR-049 (remembered preference, stop on new question), BR-050 (stateless), BR-051 (typed input always), BR-052 (name matching), BR-054 (home providers). EDGE-039 to EDGE-046 covered by the rows above; EDGE-033/-034 by the shared voice button.

## 8. Tests and Verification

| Check | Result | Evidence |
|---|---|---|
| `npm test` (PostgreSQL 16) | 205 / 205 (was 189) | `evidence/us036-041-test-run.txt` |
| QA suite | 143 / 143 | same |
| New tests | 16 / 16 (10 unit, 6 database) | `tests/assistant.test.js`, `tests/assistant.database.test.js` |
| Design-token rule (CR-012) | Pass (one raw value fixed) | `tests/design-tokens.test.js` |
| Browser walk-through (simulated recognition **and** synthesis) | 12 / 12 | `evidence/us036-041-e2e-assistant.mjs`, `us036-041-e2e-assistant-output.txt`, `us036-assistant.png` |

**Not verified here:** real speech synthesis voices on Chrome desktop/Android (which Spanish voice is chosen), and real voice questions — to record after deployment.

## 9. Repository Changes

Branch `dev`, this increment's commit. New: `src/modules/assistant/{intents,answers,assistant}.js`, `client/src/pages/OwnerAssistant.jsx`, two test files, evidence. Modified: `src/modules/index.js`, `provider/profile.js`, `catalog/offerings.js`, `pets/owner-pet.js`, `scheduling/booking.js`, `client/src/App.jsx`, `global.css`.

## 10. Conformance and Deviations

Conforms to ARCHITECTURE_V4 v4.1 and UX_SPEC_V3 v3.1. Implementation choices within the allowed freedoms (§15.4): keyword lists slightly extended (e.g. *"mover"*, *"conoces"*, *"hace"*); provider-list rule skipped when the question is about a kind of offering (*"servicios de baño en la clínica"*); a providers-list answer with zero matches says *"No encontré veterinarias con esas características."* (not in the UX table — DEV-I2-003, to record in P09).

## 11. Assumptions, Risks, Outstanding Work

- Keyword rules cover the UX example phrasings and close variants (P02-ASM-021); unusual phrasings fall back with examples.
- Real-device voice checks pending (P08).
- Regression test for appointment history with removed pet/service due with US-007/US-012 (§5.3).

## 12. Final Status

**READY_FOR_VALIDATION** for US-036, US-037, US-038, US-039, US-040, US-041.

## 13. Handoff to P06.4

Validate per story with §6; re-run `npm test` with `TEST_DATABASE_URL` and the browser script; after deployment, record one voice question and one spoken answer on Chrome desktop and Android.
