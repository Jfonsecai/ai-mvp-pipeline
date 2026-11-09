# Product Vision — Iteration 2 Addendum (VetCare v2)

## 1. Document Metadata

- **Version:** 5.0 (delta addendum to `PRODUCT_VISION_V4.md`)
- **Stage:** P01 — Product Discovery (team-authored addendum; replaces a full P00/P01 re-run)
- **Status:** READY_WITH_ASSUMPTIONS
- **Generated:** 2026-11-09
- **Base artifacts:** `artifacts/01_discovery/PRODUCT_VISION_V4.md`, `artifacts/02_requirements/REQUIREMENTS_V3.md`, `artifacts/03_planning/product_backlog_priori_v2.json`, `artifacts/10_evaluation/MVP_EVALUATION.md`
- **Change Request:** CR-027 (this document)
- **Consumed by:** P02 — Requirements Engineering (delta mode), see §11

### How to read this document

`PRODUCT_VISION_V4.md` remains in force. This addendum only **adds** product elements or **changes their status**. Nothing in V4 is removed or reworded unless §9 says so. All new IDs continue the existing numbering:

| Series | Last ID in V4 / V3 | New IDs start at |
|---|---|---|
| P01-NEED | P01-NEED-012 | P01-NEED-013 |
| P01-MVP | P01-MVP-010 | P01-MVP-011 |
| P01-OOS | P01-OOS-010 | P01-OOS-011 |
| P01-SUCCESS | P01-SUCCESS-008 | P01-SUCCESS-009 |
| P01-RISK | P01-RISK-013 | P01-RISK-014 |
| P01-ASSUMPTION | P01-ASSUMPTION-026 | P01-ASSUMPTION-027 |
| Team decisions | TD-20 | TD-21 |
| Change requests | CR-026 | CR-027 |

---

## 2. Change Request CR-027 — VetCare v2

**Reason:**
1. The P10 evaluation (`MVP_EVALUATION.md`, verdict `NEEDS_ITERATION`) reports incomplete scope: pet management partial (EVAL-003), appointment management partial (EVAL-004), catalog maintenance partial (EVAL-005), product ordering not implemented (EVAL-002).
2. The course requires the second version of the MVP to include at least one **speech-to-text** and one **text-to-speech** capability.

**Affected Artifacts:** P01 (this addendum), P02 (`REQUIREMENTS_V4.md`, backlog v4), P03 (new sprint), P04 (delta screens), P05 (delta components and API contract), P06 increments, P07 tests, P09 docs, P10 evaluation.

**Affected Requirements:**
- New: voice search, voice assistant (new epic, FRs, NFRs and user stories to be produced by P02).
- Promoted from `CONDITIONAL` to committed (requirements already specified in `REQUIREMENTS_V3.md`, text unchanged):
  - Pet management: US-004, US-005, US-006, US-007 (FR-005 to FR-008).
  - Catalog maintenance: US-011, US-012, US-014, US-015 (FR-012, FR-013, FR-015, FR-016).
  - Appointment management: US-022, US-023, US-025, US-026 (FR-027, FR-028, FR-030, FR-031).
- Explicitly deferred: product ordering US-027 to US-033 (FR-032 to FR-038) → next iteration.

**Impact:** One new epic; ~4–6 new user stories; 12 already-specified stories enter the sprint. No change to existing implemented behavior. No new paid service, no API keys, no expected database migration for the voice features (to be confirmed by P05).

**Proposed Change:** §3 to §8 of this document.

**Required Revalidation:** P02 (+validation), P03 (+validation), P04 delta (+validation), P05 delta (+validation), P06.3/P06.4 per story, P07, P09, P10. **Not** required: P00, P01 full re-run, P06.1/P06.2 (foundation), P08 stage re-run (only a CI run + production smoke test as evidence).

---

## 3. Problem Refinement

V4 solves "finding and booking veterinary services in one place". Iteration 2 addresses two remaining frictions observed in the core journey:

- **Typing on a phone while handling a pet is inconvenient.** Owners often search from a mobile phone (NFR-003) in situations where typing is slow or impractical.
- **Answering simple questions requires navigating several screens.** To know which veterinarians exist, who offers a service, its price, a provider's working hours or "when is my next appointment", the owner must combine search, provider profile and appointment screens.

And it closes the scope gaps reported by P10 for pets, catalog and appointments.

---

## 4. New User Needs

| ID | Need | User | Source |
|---|---|---|---|
| P01-NEED-013 | Find services and products **without typing**, by saying what they need. | Pet owner | CR-027; course requirement (STT) |
| P01-NEED-014 | Get quick answers about the platform (available veterinarians, who offers a service, prices, provider hours, my next appointments) in one place, **and hear the answer** without reading the screen. | Pet owner | CR-027; course requirement (TTS) |

The needs of V4 for pets (P01-NEED-002), catalog maintenance (P01-NEED-007) and appointment management (P01-NEED-004, -008) are unchanged; they now become committed scope (§5.3).

---

## 5. MVP Capabilities — Iteration 2

### 5.1 P01-MVP-011 — Voice search (speech-to-text) — MVP_CORE

The pet owner can start a search by speaking instead of typing.

- A microphone button is available next to the search box of the owner's search screen.
- While listening, the interface shows a visible "listening" state and lets the owner stop.
- The spoken phrase is transcribed (Spanish) and **shown in the search box, editable**, before/while the existing search runs.
- The search uses the **existing text search and species filter** (P01-MVP-001; FR-017, FR-018) — results, result details and provider links are exactly those of a typed search.
- Simple interpretation of the phrase:
  - If it mentions a species ("perro", "perros", "perrito", "gato", "gatos", "gatito"), the species filter is set to that species and the word is removed from the text query.
  - Common filler words are removed from the query ("busco", "quiero", "necesito", "para mi", "un", "una", "por favor", etc.).
  - If nothing remains after cleaning, no search is run and the owner is asked to try again.
- If the transcription is empty or not recognized, the owner sees a message and can retry or type.

**Examples:** "busco vacunación para mi perro" → query `vacunación`, species `dog`. "Necesito un baño para gatos" → query `baño`, species `cat`.

### 5.2 P01-MVP-012 — VetCare Assistant (speech-to-text + text-to-speech) — MVP_SUPPORTING

A conversational assistant for signed-in pet owners that answers questions about the platform using **its own data**, and reads the answer aloud.

- Opened from the owner's interface (e.g. a button/menu entry "Asistente").
- The owner asks **by voice (STT) or by typing**; both are always available.
- The assistant replies with a **short text answer** in a conversation view **and reads it aloud (TTS)**. A control lets the owner mute/unmute voice replies and stop the current reading.
- Answers are built from **fixed rules / intents** over existing platform data. No generative AI.
- Answers list at most **5 items**; each item links to the corresponding screen (provider profile, search results, my appointments).
- The assistant is **read-only**: it never books, cancels, reschedules or modifies data.

**Supported intents (iteration 2):**

| Intent | Example questions | Answer based on (existing data) |
|---|---|---|
| INT-01 List providers | "¿Qué veterinarias hay?", "¿Qué veterinarios a domicilio hay?" | Provider profiles; clinic vs. independent veterinarian (FR-020) |
| INT-02 Who offers X | "¿Quién ofrece vacunación?", "¿Qué servicios hay para gatos?" | Existing search + species filter (FR-017, FR-018, FR-019) |
| INT-03 Price | "¿Cuánto cuesta una consulta?" | Offering prices from search results (FR-019) |
| INT-04 Provider info and hours | "¿Cuál es el horario de Clínica Patitas?", "¿Dónde queda …?" | Public profile + working days and hours (FR-009, FR-010, FR-020) |
| INT-05 My next appointments | "¿Cuándo es mi próxima cita?", "¿Qué citas tengo?" | The owner's own appointments (FR-026) |
| INT-06 Help | "Ayuda", "¿Qué puedo preguntarte?" | Static list of example questions |
| Fallback | Anything not recognized | "No entendí la pregunta" + example questions; suggests using the search |

When a question matches an intent but returns no data (e.g. no provider with that name), the assistant says so explicitly instead of guessing.

### 5.3 P01-MVP-013 — Completion of V1 management workflows — scope status change

The following stories, already specified in `REQUIREMENTS_V3.md`, move from `CONDITIONAL` to **committed** for iteration 2. Their requirements, business rules and acceptance criteria are **unchanged**:

| Area | Stories | Requirements | P10 finding |
|---|---|---|---|
| Pet management | US-004 Add a pet, US-005 View my pets, US-006 Edit a pet, US-007 Remove a pet | FR-005 to FR-008 | EVAL-003 |
| Catalog maintenance | US-011 Update a service, US-012 Remove a service, US-014 Update a product, US-015 Remove a product | FR-012, FR-013, FR-015, FR-016 | EVAL-005 |
| Appointment management | US-022 Cancel my appointment, US-023 Reschedule my appointment, US-025 Cancel as provider, US-026 Reschedule as provider | FR-027, FR-028, FR-030, FR-031 | EVAL-004 |

Note: US-005 is partially available today (pets are listed); P02/P06 must verify its acceptance criteria rather than re-implement it.

### 5.4 Optional (only if capacity remains — `CONDITIONAL`)

- **P01-MVP-014 — "Escuchar" (read aloud) on detail screens (TTS):** a button that reads a provider profile summary or an appointment's details aloud. Reuses the same voice output as the assistant. Low effort; first to drop.

---

## 6. Out of Scope for Iteration 2

| ID | Item | Status |
|---|---|---|
| P01-OOS-011 | Booking, cancelling, rescheduling or ordering **through voice or the assistant** (the assistant is read-only; actions stay in the existing screens). | CONFIRMED (TD-23) |
| P01-OOS-012 | Generative AI / LLM answers, external AI services or paid speech services. | CONFIRMED (TD-21, TD-22) |
| P01-OOS-013 | Voice features and assistant for **providers**. | CONFIRMED (TD-24) |
| P01-OOS-014 | Persisting audio, transcriptions or conversation history (the conversation lives only in the open screen). | CONFIRMED (TD-27) |
| P01-OOS-015 | Languages other than Spanish; wake words ("Oye VetCare"); continuous listening. | CONFIRMED (TD-25) |
| P01-OOS-016 | **Product ordering (US-027 to US-033)** in iteration 2 — deferred to a future iteration, not cancelled. | CONFIRMED (TD-29) |

All V4 out-of-scope items (P01-OOS-001 to -010) remain in force.

---

## 7. Team Decisions (pre-approved for iteration 2)

The standing rule **TD-19** remains in force: every new assumption or proposal generated by any stage of this cascade is approved unless the team says otherwise; no new questions should block the cascade.

| ID | Decision |
|---|---|
| TD-21 | The assistant answers with **rules/intents** over the platform's own data. No LLM, no API keys, no cost. |
| TD-22 | Speech-to-text and text-to-speech use the **browser's built-in speech capabilities** (Web Speech API: speech recognition and speech synthesis). No server-side speech processing. *(Technology choice recorded for P05; P02 must keep requirements technology-neutral.)* |
| TD-23 | The assistant is read-only (P01-OOS-011). |
| TD-24 | Voice search and the assistant are available only to **signed-in pet owners**. |
| TD-25 | Recognition and synthesis language: Spanish (Colombia, `es-CO`), consistent with NFR-004. |
| TD-26 | If the browser does not support speech recognition, the microphone controls are **hidden** and typed input is used; if it does not support speech synthesis, answers are shown as text only. If microphone permission is denied, a message explains it and typed input remains available. Typing is **always** available. |
| TD-27 | No audio, transcription or conversation is stored by the platform (P01-OOS-014). |
| TD-28 | Voice replies are **on by default**; the owner can mute them and stop a reading in progress. The mute choice may be remembered on the device only. |
| TD-29 | Product ordering is deferred (P01-OOS-016); EVAL-002 is closed as "explicitly deferred" in P10. |
| TD-30 | Sprint for iteration 2: SPRINT-002 / RELEASE-002. Priority order: (1) voice search, (2) assistant with TTS, (3) pet management, (4) appointment cancel/reschedule, (5) catalog update/remove, (6) optional P01-MVP-014. Team roles and assignment approach of TD-17 are reused. |

---

## 8. Assumptions, Risks and Success Criteria

### Assumptions

| ID | Assumption | Impact |
|---|---|---|
| P01-ASSUMPTION-027 | Owners use Google Chrome (desktop or mobile), per NFR-003, which supports speech recognition and synthesis. | Medium — other browsers fall back to text (TD-26). |
| P01-ASSUMPTION-028 | The browser's recognition service may process audio outside the platform (e.g. the browser vendor's service). This is accepted for an academic project with no real personal data (TD-11). | Low — documented in KNOWN_LIMITATIONS. |
| P01-ASSUMPTION-029 | The deployed site is served over HTTPS, which browsers require for microphone access (true for the current production domain). | Low |
| P01-ASSUMPTION-030 | The intents of §5.2 cover the most frequent owner questions for the demonstration. | Medium — fallback mitigates. |

### Risks

| ID | Risk | Mitigation |
|---|---|---|
| P01-RISK-014 | Recognition errors with proper names (provider names) or accents. | Transcript is shown and editable; search ignores accents (existing behavior); fallback answer. |
| P01-RISK-015 | Voice features cannot be fully tested automatically. | Unit-test the phrase interpretation and intent rules on text input; record manual evidence of the voice path in P07/P08. |
| P01-RISK-016 | Limited time for 12 promoted stories plus voice. | Priority order of TD-30; P01-MVP-014 optional; stories already specified in V3. |

### Success Criteria

| ID | Criterion |
|---|---|
| P01-SUCCESS-009 | A signed-in pet owner can find a service or product **using only their voice**, with the species filter applied when the species is spoken. |
| P01-SUCCESS-010 | The assistant correctly answers each supported intent (INT-01 to INT-06) with current platform data, shows the answer as text and **reads it aloud**, and gives a helpful fallback for unrecognized questions. |
| P01-SUCCESS-011 | Without speech support or microphone permission, the owner can still complete search and use the assistant by typing. |
| P01-SUCCESS-001, -002, -006 | (From V4) now expected to be fully met: pets can be added/edited/removed; services and products can be updated/removed; appointments can be cancelled/rescheduled by both parties. |

---

## 9. Changes to V4 Statements (no silent resolution)

- **Scope status:** the stories listed in §5.3 change from `CONDITIONAL` (P03 v2, TD-16) to committed for iteration 2.
- **Product ordering:** remains a valid capability (P01-MVP-009) but is deferred (TD-29); P01-SUCCESS-008 is not evaluated in iteration 2.
- **Accessibility/usability:** V4 had no voice interaction; iteration 2 introduces voice as an **optional** input/output channel, never the only one (TD-26).

---

## 10. Traceability Summary

| New element | Need | Decisions | Expected P02 output |
|---|---|---|---|
| P01-MVP-011 Voice search | P01-NEED-013 | TD-22, TD-24, TD-25, TD-26 | EPIC-009, new FRs (voice capture, transcript display/edit, phrase interpretation, species detection, error handling), new US |
| P01-MVP-012 Assistant + TTS | P01-NEED-014 | TD-21 to TD-28 | EPIC-009, new FRs per intent group + voice reply/mute, new US |
| P01-MVP-013 Completion | P01-NEED-002, -004, -007, -008 | TD-30 | No new FR/US; scope status change only |
| P01-MVP-014 Read aloud (optional) | P01-NEED-014 | TD-28 | One CONDITIONAL US |
| Non-functional | — | TD-25, TD-26, TD-27 | New NFRs: voice fallback/accessibility, no storage of audio/transcripts, language |

---

## 11. Pipeline Execution Guide for Iteration 2 (minimum path)

| Stage | Run? | Notes |
|---|---|---|
| P00 Context | No | Context unchanged. |
| P01 Discovery | No (this addendum) | Optional: run `P01_validation.md` on this file if time allows. |
| **P02 Requirements + validation** | **Yes — delta** | Output `REQUIREMENTS_V4.md` + `product_backlog_requirements_v4.json`. |
| **P03 Planning + validation** | **Yes — light** | SPRINT-002 / RELEASE-002 per TD-30. |
| **P04 UX + validation** | **Yes — delta** | Microphone in owner search; Assistant screen/panel; pets add/edit/remove; cancel/reschedule actions (owner and provider); edit/remove in catalog. These conditional stories never had UX (TD-16). |
| **P05 Architecture + validation** | **Yes — delta** | New assistant module (intent resolution reusing search, provider profile, working hours and appointments queries); client voice component; missing endpoints for pets/offerings/appointments; update `API_SPEC`; confirm no migration. |
| P06.1 / P06.2 Foundation | No | Foundation exists and is validated. |
| **P06.3 / P06.4 per story** | **Yes** | One increment per new or promoted story (may be grouped by epic). |
| **P07 Testing** | **Yes — scoped** | Unit tests for phrase interpretation and intent rules; API/DB tests for new endpoints; manual evidence for real voice. |
| P08 CI/CD | No stage re-run | Only a green CI run and `scripts/smoke-test.js` against production, saved as evidence. |
| **P09 Documentation** | **Yes — light** | README, USER_GUIDE, API, REQUIREMENTS_COVERAGE, KNOWN_LIMITATIONS. |
| **P10 Evaluation** | **Yes** | Re-assess EVAL-002 to EVAL-005 and the new capabilities. |

### Invocation note for P02

When running `prompts/02_requirements/P02_requirements.md`, use as inputs:

```text
artifacts/01_discovery/PRODUCT_VISION_V4.md            (base vision, unchanged)
artifacts/01_discovery/PRODUCT_VISION_V5_ITERATION2.md  (this addendum — takes precedence where it differs)
artifacts/02_requirements/REQUIREMENTS_V3.md            (existing requirements; keep all IDs and texts)
artifacts/02_requirements/REQUIREMENTS_VALIDATION_V3.md
prompts/system/SYSTEM_PROMPT.md
```

Instructions to add to the P02 run:

- Work in **delta mode**: keep EPIC-001..008, FR-001..039, NFR-001..005, US-001..034 and all BR/EDGE/DEP/Q IDs unchanged.
- Add EPIC-009 *Voice Search and Assistant*; continue numbering from FR-040, NFR-006, US-035, AC-115, BR-041, EDGE-033, DEP-018 (DEP-011 to DEP-017 are used by P03), P02-ASM-017, P02-Q-019.
- Mark the stories of §5.3 with scope status committed for iteration 2 and US-027..033 as deferred (TD-29), without changing their content.
- Keep requirements technology-neutral (TD-22 is recorded for P05).
- Apply TD-19: do not raise blocking questions; record new assumptions as CONFIRMED (standing rule).
- Output: `artifacts/02_requirements/REQUIREMENTS_V4.md` and `artifacts/02_requirements/product_backlog_requirements_v4.json`.
