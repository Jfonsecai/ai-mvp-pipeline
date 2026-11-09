# UX Specification Validation Report — Iteration 2 Delta

## 7.1 Metadata

| Field | Value |
|---|---|
| Validator | P04 UX Validator (prompt v2.0), report 3.0 — **quick validation** requested by the team because of the 2026-11-10 deadline (TD-34) |
| Artifact validated | `UX_SPEC_V3.md` v3.0 (delta over `UX_SPEC_V2.md` v2.0) |
| Validation date | 2026-11-09 |
| Inputs inspected | `REQUIREMENTS_V4.md` v4.1 and backlog v4.1 (acceptance criteria text of the in-scope stories); `PRIORITIZATION_V3.md` v3.1 and `product_backlog_priori_v3.json` v3.1; `PRIORITIZATION_VALIDATION_V3.md`; `UX_SPEC_V2.md` (tokens, components, screen IDs); `UX_SPEC_V3.md` |
| **Decision on v3.0** | **FAIL** (1 high, 4 medium, 2 low) |
| **Decision after correction (v3.1)** | **PASS_WITH_WARNINGS** — see §7.10 |

**Method (quick).** Scripted: every token referenced in V3 exists in V2 §4; every COMP-UX and SCR-UX ID referenced exists; raw values in V3; every acceptance-criterion ID cited belongs to the story it is cited for; acceptance criteria of the in-scope stories not cited in V3. Manual: the text of every acceptance criterion of US-035 to US-042 compared with the P0/P1 screen specifications and answer templates; the P2 criteria compared with the compact specifications; scope (deferred ordering), sprint identifier and handoff. Not done in this quick pass: a full re-review of V2 content (validated in `UX_SPEC_VALIDATION_V2.md`) and a visual review of the implemented client.

**Independence notice.** The same AI produced and validated the specification.

## 7.2 Executive Summary

The delta is structurally complete for a delta document, consistent with the V2 design system (no undefined token, component or screen; no new token) and covers every committed and conditional user-facing story of iteration 2 with traceable screens, flows and components. Scope control is correct: ordering screens stay unrendered, providers get no voice features, and the sprint identifier is handled as P03 requires.

The comparison of the answer templates with the acceptance criteria found one **contradiction** and four omissions:

- **P04-VAL-001 (HIGH):** P04-ASM-033 keeps the assistant conversation when the owner navigates away, but AC-127 requires that leaving the assistant does not keep it.
- **P04-VAL-002 (MEDIUM):** a separate "medical advice" answer contradicts AC-147, BR-046 and P02-ASM-021, which require answering such questions as unrecognized.
- **P04-VAL-003, -004, -005 (MEDIUM):** the appointment rows lack the provider (AC-141), the offering rows lack the species (AC-136), and the help answer lacks an example for each kind of question (AC-145).

These are small text corrections but they change what the tests of P07 will check, so v3.0 is **FAIL**. The corrections were applied in v3.1 and re-validated (§7.10): **PASS_WITH_WARNINGS**, P05 can proceed.

## 7.3 Criterion Results (v3.0)

| Criterion | Result | Severity | Evidence / notes |
|---|---|---|---|
| Input integrity and upstream consistency | WARN | HIGH | All inputs available. Contradictions with AC-127 and AC-147 (P04-VAL-001, -002). |
| Structural completeness | PASS | — | All sections of the P04 structure present as a delta (§1–§13); V2 explicitly kept in force. |
| Scope control | PASS | — | Ordering screens and COMP-UX-020 not rendered; no provider voice features; only extra is P04-PROP-009, labeled PROPOSAL. |
| UX objectives and principles | PASS | — | Derived from FR-040 to FR-050 and NFR-006. |
| Visual direction | PASS | — | Unchanged; voice states mapped to existing tokens. |
| Design tokens | PASS | — | No undefined token (scripted); no new token. |
| Shared component library | WARN | LOW | COMP-UX-023 to -027 complete with states and accessibility. One raw value ("85 %") in COMP-UX-024 (P04-VAL-006). |
| Information architecture and navigation | PASS | — | Four owner tabs; provider tabs unchanged; boundaries (BR-041, NFR-002) stated. |
| Screen inventory | PASS | — | SCR-UX-018 to -021 new; modified screens listed. |
| Screen-level specifications | WARN | MEDIUM | P0 detailed; templates miss fields (P04-VAL-003, -004, -005). |
| User flows | WARN | MEDIUM | FLOW-UX-021 to -028 complete; FLOW-UX-023 step 4 follows the wrong medical-advice answer. |
| UX coverage and traceability | PASS | — | All committed stories COVERED; cited AC IDs belong to the right stories (scripted); non-cited criteria explained in §11. |
| Assumptions and open decisions | WARN | HIGH | P04-ASM-033 contradicts AC-127. Others are reasonable; P04-ASM-035/-036 fill P02 gaps and are visible. |
| Handoff to P05 | PASS | — | Assistant answer contract, shared voice pieces, voice behaviors listed. |
| Parallel-development consistency | PASS | — | Shared voice input/output identified; texts fixed. |
| Separation from technical architecture | PASS | — | No API, schema or code; interpretation location left to P05 (P04-ASM-030). |

## 7.4 Findings

| Finding ID | Severity | Criterion | Section | Evidence | Why it matters | Recommended correction |
|---|---|---|---|---|---|---|
| P04-VAL-001 | HIGH | Upstream consistency; assumptions | §8 SCR-UX-018 C; §10 P04-ASM-033 | V3.0: "Returning within the visit keeps the conversation". AC-127: "When the owner leaves the assistant or reloads the page, Then the conversation is not kept". | Contradicts an approved acceptance criterion; the implementation would fail AC-127. | The conversation ends when the owner leaves the assistant, reloads or signs out; reopening starts with the greeting. |
| P04-VAL-002 | MEDIUM | Upstream consistency | §8 answer table; FLOW-UX-023 | V3.0 had a separate *"No puedo dar consejos médicos…"* answer. AC-147: "answers as an unrecognized question, suggesting to book a service"; BR-046 and P02-ASM-021: medical questions are treated as unrecognized. | Would require a medical-question detector that P02 excluded and would produce a different answer than the tests expect. | Remove the separate answer; make the fallback include the booking suggestion. |
| P04-VAL-003 | MEDIUM | Screen specification | §8 INT-05 rows | Row *"[fecha] [hora] — [servicio] — [mascota]"*; AC-141 requires date, time, service, **provider** and pet. | Missing data the criterion requires. | Add the provider to the row. |
| P04-VAL-004 | MEDIUM | Screen specification | §8 INT-02/03 rows | Row *"[oferta] — $ [precio] — [proveedor]"*; AC-136 requires name, price, **species** and provider. | Missing data the criterion requires. | Add the species to the row. |
| P04-VAL-005 | MEDIUM | Screen specification | §8 Help answer | Help listed the kinds with one example; AC-145 requires example questions **for each kind**. | Partial coverage of AC-145. | Give one example per kind. |
| P04-VAL-006 | LOW | Design tokens | COMP-UX-024 | "max 85 % of the width" is a raw value (V2 §4 rule 1). | Minor divergence risk. | Use an existing size token. |
| P04-VAL-007 | LOW | Assumptions | §10 P04-ASM-035, -036 | Editing a pet's species or an offering does not change booked appointments: rules not defined in P02, approved only under TD-19. | Could surprise the team in the demonstration. | Team skims; no change required. |

## 7.5 Coverage Summary

- In-scope user-facing stories reviewed: 20 (19 committed + 1 conditional); user-facing requirements: FR-005 to FR-008, FR-012, FR-013, FR-015, FR-016, FR-027, FR-028, FR-030, FR-031, FR-040 to FR-050 (23) plus NFR-006 and NFR-008.
- COVERED in v3.0: 23 FRs at screen level; 4 FRs (FR-045, FR-046, FR-047 and, through FR-043, AC-127) with defects in specific texts (P04-VAL-001 to -005); after v3.1 all 23 COVERED.
- NOT_UX_RELEVANT: NFR-007 storage aspect (its visible part is covered).
- Deferred ordering requirements (FR-032 to FR-038) are intentionally not rendered.

## 7.6 Visual-System Assessment

The V2 visual direction and tokens remain actionable and are reused without additions; the new components define states, accessibility and tokens consistently with V2; screens reference components instead of redefining them; responsive rules (bottom tab bar with four tabs, fixed composer) use existing tokens. Parallel implementation is likely to be consistent, especially because voice input and output are specified once and shared. The only raw value is P04-VAL-006.

## 7.7 Required Corrections and Recommendations

- **Required before approval:** P04-VAL-001 to -005 (§8 SCR-UX-018, FLOW-UX-023, §10).
- **Recommended:** P04-VAL-006 (token), P04-VAL-007 (team skim).
- **Upstream decisions requiring human input:** none; P04-ASM-035/-036 may be objected to by the team (TD-19).

## 7.8 Readiness for P05 (v3.0)

**NOT_READY** for v3.0 because of P04-VAL-001. See §7.10 for v3.1.

## 7.9 Final Recommendation (v3.0)

**FAIL** — the specification contradicts AC-127 and AC-147 and omits fields required by AC-136, AC-141 and AC-145. Correct the answer templates and P04-ASM-033, then re-validate.

---

## 7.10 Correction and Re-validation (v3.1)

Because of the deadline, the corrections were applied immediately by the generation process as `UX_SPEC_V3.md` v3.1 and checked again by this validator.

| Finding | v3.1 change | Re-check |
|---|---|---|
| P04-VAL-001 | SCR-UX-018 C: leaving the assistant, reloading or signing out ends the conversation and stops reading; reopening starts with the greeting. P04-ASM-033 rewritten accordingly. | Matches AC-127 and BR-050. **Resolved.** |
| P04-VAL-002 | Separate medical answer removed; the fallback now says *"Si tu mascota necesita atención, busca un servicio y agenda una cita con un veterinario."* and covers AC-146, AC-147, EDGE-039, EDGE-046; FLOW-UX-023 step 4 updated. | Matches AC-147, BR-046, P02-ASM-021. **Resolved.** |
| P04-VAL-003 | INT-05 row: *"[fecha] [hora] — [servicio] con [proveedor] — [mascota]"*. | AC-141 fields complete. **Resolved.** |
| P04-VAL-004 | INT-02/03 row: *"[oferta] — [Perro / Gato] — $ [precio] — [proveedor]"*. | AC-136 fields complete. **Resolved.** |
| P04-VAL-005 | Help answer gives an example for each kind of question. | AC-145 satisfied. **Resolved.** |
| P04-VAL-006 | Owner bubble max width uses `size-form-max`. | No raw value left (scripted). **Resolved.** |
| P04-VAL-007 | No change (team skim). | Open, LOW. |

Remaining findings: P04-VAL-007 (LOW) and the same-AI limitation (LOW). No new defect was introduced by v3.1 (scripted token, component and screen checks re-run).

**Decision for v3.1: PASS_WITH_WARNINGS.**
**Readiness for P05: READY_WITH_CONDITIONS** — P05 must implement the answer templates of SCR-UX-018 as written (they now match the acceptance criteria), place the voice phrase interpretation and the BR-053 retry before results are shown (P04-ASM-030), and treat `SPRINT-002` as the current sprint.
