# Prioritization and Single-Sprint Plan — Iteration 2

> **Classification legend:** **CONFIRMED** = stated by the team or validated upstream · **ASSUMPTION** · **PROPOSAL** = suggestion awaiting team approval · **UNKNOWN** · **REQUIRES DECISION** · **BLOCKED** · **DONE** = delivered in iteration 1.
> **Identifiers:** upstream IDs (EPIC, FR, NFR, US, AC, BR, EDGE, DEP-001 to DEP-010 and DEP-018 to DEP-022, P02-ASM, P01-*, CR-027, TD-01 to TD-33) are reused unchanged. P03 v2.0 IDs keep their meaning. New P03 IDs continue the sequences: `DEP-023` and up (DEP-018 to DEP-022 are P02 v4.1), `ASSUM-010` and up, `PRIOR-005` and up, `P03-RISK-009` and up. `SPRINT-002` and `RELEASE-002` identify the iteration 2 delivery (PRIOR-005).

## 1. Document Metadata

- **Version:** 3.1 (3.0 + team decision TD-34 on the deadline and the committed scope)
- **Stage:** P03 — Planning
- **Status:** READY_WITH_ASSUMPTIONS
- **Project:** VetCare (TD-02) — iteration 2 (VetCare v2, CR-027)
- **Source artifacts:**
  - `REQUIREMENTS_V4.md` v4.1 and `product_backlog_requirements_v4.json` v4.1 (P02).
  - `REQUIREMENTS_VALIDATION_V4.md` (PASS_WITH_WARNINGS; re-validation of v4.1: 0 medium, 6 low).
  - `PRIORITIZATION_v2.md` and `product_backlog_priori_v2.json` (P03 v2.0, iteration 1) — previous plan, estimates and approved assignments.
  - `PRODUCT_VISION_V5_ITERATION2.md` (CR-027; planning decisions TD-29, TD-30).
  - Iteration 1 outcome: `artifacts/10_evaluation/MVP_EVALUATION.md` (NEEDS_ITERATION; EVAL-002 to EVAL-005), `docs/REQUIREMENTS_COVERAGE.md`, `artifacts/06_implementation/increments/` (dates of the implementation logs).
  - `SYSTEM_PROMPT.md`.
- **Upstream validation statuses:**
  - P01 `PRODUCT_VISION_VALIDATION.md` v4.0: PASS_WITH_WARNINGS. The iteration 2 addendum has **no P01 validation**; accepted by delegation (TD-33; P02 VAL-R01).
  - P02 `REQUIREMENTS_VALIDATION_V4.md`: PASS_WITH_WARNINGS (v4.1: 0 critical, 0 high, 0 medium, 6 low).
- **Formal delivery window:** two weeks per the P03 prompt (academic window). Iteration 2 has its own deadline, which is not recorded.
- **Actual remaining time and capacity:** **deadline 2026-11-10** (team, 2026-11-09, TD-34): what remains of 2026-11-09 plus 2026-11-10, about one working day, for P04 to P10. Hours per person are not recorded.
- **Generation Date:** 2026-11-09
- **Previous Version:** `PRIORITIZATION_v2.md` (v2.0, iteration 1)

### Changes from v2.0

| Change | Source |
|---|---|
| New sprint `SPRINT-002` / release `RELEASE-002` for iteration 2; iteration 1 stories keep `SPRINT-001` / `RELEASE-001` and are marked DONE. | TD-30; PRIOR-005 |
| New stories US-035 to US-042 (EPIC-009) prioritized and estimated. | P02 v4.1; CR-027 |
| Former conditional stories US-004 to US-007, US-011, US-012, US-014, US-015, US-022, US-023, US-025, US-026 committed; estimates of v2.0 kept. | TD-30; P01-MVP-013 |
| Ordering stories US-027 to US-033 deferred (priority removed, estimates kept). | TD-29 |
| New proposed assignments for iteration 2 work. | PRIOR-007 |
| **v3.1:** deadline 2026-11-10 recorded; option (a) chosen (keep 19 committed, cut order); feasibility re-assessed; ASSUM-010 resolved, ASSUM-013 no longer holds; P03-RISK-009 raised. | TD-34; P03V-001 |

## 2. Executive Summary

**Strategy.** Iteration 2 delivers the two voice capabilities required for VetCare v2 first — **speech-to-text** (search by voice) and **text-to-speech** (assistant that reads its answers) — and then closes the scope gaps reported by P10, in the order decided by the team (TD-30): voice search → assistant → pets → appointment management → catalog maintenance.

**Single sprint.** Exactly one sprint is planned for this delivery: `SPRINT-002`. `SPRINT-001` is the already delivered iteration 1 and is not replanned.

**Committed scope (TD-30):** 19 stories, **45 points**:

- **P0 — minimum voice delivery (5 stories, 16 points):** US-035 search by voice, US-036 assistant conversation, US-038 assistant answers about offerings and prices, US-040 help and fallback, US-041 spoken answers. With these alone, both required voice capabilities can be demonstrated.
- **P1 (6 stories, 12 points):** US-037 and US-039 (assistant answers about providers and about my appointments); US-004 to US-007 pet management (P10 EVAL-003, HIGH).
- **P2 (8 stories, 17 points):** US-022, US-023, US-025, US-026 appointment cancel/reschedule (EVAL-004); US-011, US-012, US-014, US-015 catalog update/remove (EVAL-005).

**Conditional:** US-042 read aloud (P3, 2 points). **Deferred:** product ordering US-027 to US-033 (15 points, TD-29). **Done:** the 15 iteration 1 stories (44 points).

**Cut order if time runs short** (PRIOR-008): US-042, then catalog (US-015, US-014, US-012, US-011), then provider and owner appointment actions (US-026, US-025, US-023, US-022). P0 and P1 are never cut to fit more P2.

**Feasibility (v3.1): NOT_FEASIBLE for the full committed scope; CONDITIONALLY_FEASIBLE for P0.** The deadline is 2026-11-10 (TD-34), about one working day that also holds P04, P05 and P07 to P10. Iteration 1 needed about four days to take 44 points to production. The team chose to keep the 19 stories committed (TD-34, option a) and to rely on the cut order: P0 (16 points) is the realistic target, P1 is at risk and P2 is expected to be cut.

## 3. Planning Constraints

| Constraint | Value | Classification |
|---|---|---|
| Formal delivery window | Two weeks (P03 prompt) | CONFIRMED by the prompt; not used as available time |
| Time available for iteration 2 | Deadline 2026-11-10; about one working day from 2026-11-09, shared with P04, P05 and P07 to P10 | CONFIRMED (TD-34) |
| Iteration 1 reference | 15 stories, 44 points committed and delivered; implementation logs 2026-10-11 to 2026-10-12; production verified 2026-10-14; no conditional story reached | CONFIRMED (artifacts); used as reference only, not as velocity (ASSUM-012) |
| Team | 5 members: David (Backend / Database), Jhonier (Frontend), Casanova (Backend), Fonseca (DevOps), Sebas (Fullstack) | CONFIRMED roles (P00 [TEAM]); availability for iteration 2 ASSUMPTION (ASSUM-011) |
| Existing foundation | Modular monolith, client, CI and deployment already working and validated (P06.1/P06.2, P08) | CONFIRMED; reduces effort compared with iteration 1 |
| Budget, voice services | No budget; voice uses browser capabilities, no paid service (TD-21, TD-22) | CONFIRMED |
| Prior stages | P04 and P05 deltas must be done before the sprint (DEP-023) | ASSUMPTION (ASSUM-013) |

**Missing information affecting feasibility:** the iteration 2 deadline and the days each member can give. Without them, feasibility stays conditional and the cut order of §2 is the safeguard.

## 4. Product Priorities at a Glance

Priority describes value and delivery order within `SPRINT-002`; scope classification is inherited from P02. All items are `DEFINED` in P02 v4.1 (definition status), while the JSON `status` field holds the planning status.

| Priority | Item ID | Capability | Rationale | Source Requirement | Scope Classification | Definition status (P02) |
|---|---|---|---|---|---|---|
| P0 | US-035 | Search by voice | Speech-to-text capability required for v2 (CR-027); first in TD-30 order. 5 points: new browser voice capability, interpretation rules (BR-043, BR-044) and retry (BR-053); uncertainty P03-RISK-010. | FR-040, FR-041, FR-042, FR-017, FR-018, NFR-006, NFR-007, NFR-008 | MVP_CORE | DEFINED |
| P0 | US-036 | Talk to the VetCare Assistant | Entry point of the assistant; every assistant story depends on it (DEP-021). 5 points: new conversation screen, owner-only access, reuse of the voice input of US-035, new read-only answer module. | FR-043, NFR-002, NFR-006, NFR-007, NFR-008 | MVP_SUPPORTING | DEFINED |
| P0 | US-038 | Ask the assistant about services, products and prices | First assistant question type: reuses the existing search and species filter (BR-042), so it is the cheapest way to make the assistant useful. | FR-045, FR-048 | MVP_SUPPORTING | DEFINED |
| P0 | US-040 | Get help from the assistant | Help and fallback are needed by any assistant answer (EDGE-039, EDGE-046); fixed texts. | FR-047 | MVP_SUPPORTING | DEFINED |
| P0 | US-041 | Hear the assistant's answers | Text-to-speech capability required for v2 (CR-027). 3 points: browser speech output, mute remembered on device, stop, fallback (NFR-006); uncertainty P03-RISK-010. | FR-049, NFR-006, NFR-008 | MVP_SUPPORTING | DEFINED |
| P1 | US-037 | Ask the assistant about providers | Second assistant question type (INT-01, INT-04): providers by type, home visits (BR-054), hours and contact; more matching rules (BR-052). | FR-044, FR-048 | MVP_SUPPORTING | DEFINED |
| P1 | US-039 | Ask the assistant about my next appointments | Third assistant question type (INT-05): reuses the owner appointments data (FR-026); own data only (BR-048). | FR-046, FR-048, NFR-002 | MVP_SUPPORTING | DEFINED |
| P1 | US-004 | Add a pet | Pet management closes P10 EVAL-003 (HIGH); third in TD-30 order. Unchanged estimate. | FR-005 | MVP_SUPPORTING | DEFINED |
| P1 | US-005 | View my pets | Partially available after iteration 1 (pets are listed); verify AC-016, AC-017 and finish the screen. Unchanged estimate. | FR-006, NFR-002 | MVP_SUPPORTING | DEFINED |
| P1 | US-006 | Edit a pet | Pet management (EVAL-003). Unchanged estimate. | FR-007, NFR-002 | MVP_SUPPORTING | DEFINED |
| P1 | US-007 | Remove a pet | Pet management (EVAL-003); includes automatic cancellation (AC-079). Delivered only together with US-004 (P03-RISK-008). | FR-008 | MVP_SUPPORTING | DEFINED |
| P2 | US-022 | Cancel my appointment | Appointment management closes P10 EVAL-004 (MEDIUM); fourth in TD-30 order. | FR-027 | MVP_SUPPORTING | DEFINED |
| P2 | US-023 | Reschedule my appointment | Appointment management (EVAL-004); reuses slot rules (BR-018). | FR-028 | MVP_SUPPORTING | DEFINED |
| P2 | US-025 | Cancel an appointment as a provider | Appointment management (EVAL-004), provider side. | FR-030 | MVP_SUPPORTING | DEFINED |
| P2 | US-026 | Reschedule an appointment as a provider | Appointment management (EVAL-004), provider side; reuses slot rules. | FR-031 | MVP_SUPPORTING | DEFINED |
| P2 | US-011 | Update a service | Catalog maintenance closes P10 EVAL-005 (MEDIUM); fifth in TD-30 order. | FR-012, NFR-002 | MVP_CORE | DEFINED |
| P2 | US-012 | Remove a service | Catalog maintenance (EVAL-005); includes automatic cancellation (AC-083). | FR-013 | MVP_CORE | DEFINED |
| P2 | US-014 | Update a product | Catalog maintenance (EVAL-005). | FR-015, NFR-002 | MVP_CORE | DEFINED |
| P2 | US-015 | Remove a product | Catalog maintenance (EVAL-005). | FR-016 | MVP_CORE | DEFINED |
| P3 | US-042 | Listen to a provider's profile or an appointment | Optional read aloud (P01-MVP-014, CONDITIONAL in TD-30); reuses the speech output of US-041; first to drop. | FR-050, NFR-006, NFR-008 | MVP_SUPPORTING | DEFINED |
| — | US-027 to US-033 | Product ordering (7 stories) | Deferred by the team (TD-29); P10 EVAL-002 closed as explicitly deferred. Estimates of v2.0 kept (15 points). | FR-032 to FR-038 | MVP_SUPPORTING | DEFINED |
| DONE | US-001, US-002, US-003, US-008, US-009, US-010, US-013, US-016 to US-021, US-024, US-034 | Iteration 1 scope | Delivered in SPRINT-001 (P10; coverage). Not replanned; planning data of v2.0 kept. | FR-001 to FR-004, FR-009 to FR-011, FR-014, FR-017 to FR-026, FR-029, FR-039 | As in P02 | DEFINED |

**Why the voice stories come first.** They are the reason for iteration 2 (course requirement, CR-027) and carry the most uncertainty (P03-RISK-010). Doing them first exposes problems while there is still time to react. The pet, appointment and catalog stories are already specified, have v2.0 estimates and reuse existing modules, so their risk is lower.

**Why only part of the assistant is P0.** One question type (US-038), help (US-040) and spoken answers (US-041) on top of the conversation (US-036) are enough to show speech-to-text and text-to-speech working end to end. US-038 is chosen as the first question type because it reuses the existing search (BR-042).

## 5. MVP Scope

### 5.1 Committed for SPRINT-002

| Story ID | Capability | User Value | Priority | Estimate | Dependencies |
|---|---|---|---|---|---|
| US-035 | Search by voice | Search without typing (P01-NEED-013) | P0 | 5 | DEP-001, DEP-018; DEP-025 |
| US-036 | Talk to the VetCare Assistant | Ask in one place, by voice or text (P01-NEED-014) | P0 | 5 | DEP-001; DEP-025 |
| US-038 | Ask about services, products and prices | Compare offers without searching | P0 | 2 | DEP-018, DEP-019, DEP-021 |
| US-040 | Get help from the assistant | Know what to ask; no dead ends | P0 | 1 | DEP-021 |
| US-041 | Hear the assistant's answers | Information without reading the screen | P0 | 3 | DEP-021; DEP-026 |
| US-037 | Ask about providers | Choose a provider quickly | P1 | 3 | DEP-019, DEP-021 |
| US-039 | Ask about my next appointments | Remember appointments | P1 | 2 | DEP-020, DEP-021 |
| US-004 | Add a pet | Book for more pets (EVAL-003) | P1 | 2 | DEP-001 |
| US-005 | View my pets | See registered pets | P1 | 1 | DEP-001 |
| US-006 | Edit a pet | Keep pet data correct | P1 | 1 | DEP-002 |
| US-007 | Remove a pet | Remove pets no longer cared for | P1 | 3 | DEP-002; DEP-012; P03-RISK-008 |
| US-022 | Cancel my appointment | Free a slot (EVAL-004) | P2 | 2 | DEP-007 |
| US-023 | Reschedule my appointment | Change time without rebooking | P2 | 3 | DEP-007 |
| US-025 | Cancel an appointment as a provider | Provider schedule accuracy | P2 | 2 | DEP-007 |
| US-026 | Reschedule an appointment as a provider | Provider schedule accuracy | P2 | 2 | DEP-007 |
| US-011 | Update a service | Keep the catalog current (EVAL-005) | P2 | 2 | DEP-003 |
| US-012 | Remove a service | Keep the catalog current | P2 | 3 | DEP-003; DEP-012 |
| US-014 | Update a product | Keep the catalog current | P2 | 1 | DEP-004 |
| US-015 | Remove a product | Keep the catalog current | P2 | 2 | DEP-004 |

**Total committed: 19 stories, 45 points** (P0 16, P1 12, P2 17).

### 5.2 Conditional on Capacity

| Story ID | Capability | Value | Condition for Inclusion |
|---|---|---|---|
| US-042 | Listen to a provider's profile or an appointment | Optional extra text-to-speech use (P01-MVP-014) | All committed stories done and verified; reuses US-041 speech output (DEP-026). First item to drop. |

### 5.3 Deferred

| Story ID | Capability | Reason for Deferral | Future Consideration |
|---|---|---|---|
| US-033, US-027, US-029, US-028, US-030, US-031, US-032 | Product ordering: stock indicator, order, order views, status, cancellation | Team decision TD-29 (P01-OOS-016): iteration 2 focuses on voice and on finishing pets, appointments and catalog. 15 points. | Requirements unchanged and ready; UX for ordering existed in P04 v2.0. Candidate for a future iteration; the `product_order` table already exists. |

### 5.4 Out of Scope

| Item ID | Excluded Capability | Reason |
|---|---|---|
| P01-OOS-011 | Booking, cancelling, rescheduling, ordering or changing data by voice or through the assistant | Team decision TD-23 |
| P01-OOS-012 | Generative AI answers, external AI or paid speech services | TD-21, TD-22 |
| P01-OOS-013 | Voice and assistant for providers | TD-24 |
| P01-OOS-014 | Storing audio, transcriptions or conversations | TD-27 |
| P01-OOS-015 | Other languages, wake words, continuous listening | TD-25 |
| P01-OOS-001 to -010 | Provider verification, area detection, other cities, payments, notifications, tracking, different clinic/home rules, ratings, appointment confirmation, admin role, clinic staff, product requests | Unchanged from iteration 1 (P01 v4.0) |

### 5.5 Requires Decision

| Item ID | Decision Needed | Impact | Proposed Resolution |
|---|---|---|---|
| PRIOR-005 | Identifier of the iteration 2 sprint. The prompt names the sprint `SPRINT-001`; reusing it would overwrite the record of iteration 1. | Traceability of both iterations. | **DECIDED** by TD-30: `SPRINT-002` / `RELEASE-002`; exactly one sprint is planned for this delivery. |
| PRIOR-006 | Iteration 2 deadline and committed scope (P03 validation P03V-001). | Feasibility (§11). | **DECIDED** (TD-34, 2026-11-09): deadline 2026-11-10; option (a): keep all 19 stories committed and apply the cut order PRIOR-008 as soon as P2 does not fit. |
| PRIOR-007 | Approval of the proposed iteration 2 assignments (§7). | Who builds what. | **PROPOSAL**, approved under the standing rule TD-19 unless the team objects. |
| PRIOR-008 | Cut order if time runs short. | Protects P0/P1. | **PROPOSAL** following the TD-30 order: US-042 → catalog (US-015, US-014, US-012, US-011) → appointments (US-026, US-025, US-023, US-022). Approved under TD-19 unless the team objects. |

## 6. Single-Sprint Plan

**Sprint:** `SPRINT-002` · **Release:** `RELEASE-002` (VetCare v2, the iteration 2 academic delivery)

**Sprint objective:** a pet owner can find offerings by speaking, ask the VetCare Assistant about the platform by voice or text and hear its answers; and pet owners and providers can manage pets, appointments and catalog offerings after creation, closing the gaps reported by P10.

**Proposed dates:** not known (PRIOR-006). Not invented.

**Selected stories:** US-035, US-036, US-038, US-040, US-041, US-037, US-039, US-004, US-005, US-006, US-007, US-022, US-023, US-025, US-026, US-011, US-012, US-014, US-015.

**Total estimate:** 45 committed points; 2 conditional. Iteration 1 delivered 44 committed points, but with different work (foundation instead of an uncertain voice capability); the total does not guarantee completion.

**Work sequence within SPRINT-002.** These are steps inside the same sprint, not separate sprints. Steps 3 to 6 can run in parallel between pairs once step 1 has shown that voice works (§7).

| Step | Work | Stories / activities | Prerequisites |
|---|---|---|---|
| 0 | Prerequisites | P04 and P05 deltas validated (DEP-023); test accounts and demonstration data with providers, offerings for both species, working hours and appointments (TD-11: no real data); CI green on `dev` before starting. | P02 v4.1 (done) |
| 1 | Voice foundation (early spike) | US-035, including the shared voice input used later by US-036 (DEP-025). First check on Chrome desktop and phone against the deployed HTTPS site (P03-RISK-010). | Step 0 |
| 2 | Minimum assistant | US-036 → US-038, US-040 → US-041 (shared speech output, DEP-026) | Step 1 (voice input); DEP-021 |
| 3 | More assistant questions | US-037, US-039 | Step 2 |
| 4 | Pet management | US-004, US-005, US-006, US-007 (US-007 only with US-004, P03-RISK-008; AC-079 needs an appointment, DEP-012) | Step 0; independent of steps 1 to 3 |
| 5 | Appointment management | US-022, US-023, US-025, US-026 | Step 0; existing booking (DEP-007) |
| 6 | Catalog maintenance | US-011, US-012, US-014, US-015 (AC-083 automatic cancellation, DEP-012) | Step 0 |
| 7 | Conditional | US-042 | All committed stories done; DEP-026 |
| 8 | Integration, verification, delivery | Run every acceptance criterion of the delivered stories; automated tests for the phrase interpretation and the assistant rules on text input and for the new backend operations (P07); manual evidence of the voice paths on Chrome desktop and phone (P03-RISK-011); regression: the existing 318 tests stay green; deploy; smoke test (P08 evidence); P09 documentation; P10 evaluation. | All delivered stories |

**Definition of Done for the current delivery:**

- Every acceptance criterion of each delivered story has been checked and passes; for the voice criteria, with recorded manual evidence on Chrome (computer and phone).
- NFR-001 to NFR-005 still hold for all stories; NFR-006 to NFR-008 hold for the voice stories (typed alternative, nothing stored, Spanish).
- The applicable business rules and edge cases of each story are respected.
- Existing automated tests still pass and new tests cover the new backend behavior and the text-level voice rules.
- The work is integrated on `dev`, deployed, and reviewed by at least one other member.

**Conditions for a successful sprint:**

1. All P0 stories meet the Definition of Done, so speech-to-text (US-035) and text-to-speech (US-041) can be demonstrated in production.
2. All P1 stories meet the Definition of Done (pet management and the other assistant questions).
3. P2 stories delivered, or the undelivered ones listed and deferred following the cut order (PRIOR-008).
4. No regression of the iteration 1 journeys.

## 7. Team Responsibilities

Iteration 1 assignments were approved by the team (TD-17) and are kept for the DONE stories. Iteration 2 assignments are **PROPOSED** from the roles in P00 [TEAM] and from who built the related iteration 1 modules; they are approved under the standing rule TD-19 unless the team objects (PRIOR-007).

| Work Item | Responsible Member(s) | Assignment Status | Rationale / Notes |
|---|---|---|---|
| US-035 Search by voice | David, Jhonier | PROPOSED | Jhonier: owner search screen and voice input (Frontend); David: search module he built (US-016, US-017) and phrase interpretation. |
| US-036 Talk to the assistant | Sebas, Jhonier | PROPOSED | Sebas (Fullstack): assistant screen and answer service; Jhonier: reuse of the voice input from US-035. |
| US-038 Assistant: offerings and prices | David, Sebas | PROPOSED | Reuses the search (David); answer formatting (Sebas). |
| US-040 Assistant: help and fallback | David, Sebas | PROPOSED | Same answer service as US-038. |
| US-041 Spoken answers | Jhonier | PROPOSED | Client-side speech output; also reused by US-042. |
| US-037 Assistant: providers | David, Sebas | PROPOSED | Provider profiles and working hours data (David); answer service (Sebas). |
| US-039 Assistant: my appointments | Casanova, Sebas | PROPOSED | Casanova built the owner appointments (US-019 to US-021). |
| US-004 to US-007 Pet management | David, Jhonier | PROPOSED | David built pets at sign-up (US-001); Jhonier built the owner screens. |
| US-022, US-023 Owner cancel/reschedule | Casanova, Jhonier | PROPOSED | Casanova built booking and slots; Jhonier the owner appointments screen. |
| US-025, US-026 Provider cancel/reschedule | Casanova, Sebas | PROPOSED | Same pair as the provider appointments view (US-024). |
| US-011, US-012, US-014, US-015 Catalog maintenance | Casanova, Sebas | PROPOSED | Same pair as publishing (US-010, US-013). |
| US-042 Read aloud (conditional) | Jhonier | PROPOSED; applies if it enters | Reuses US-041. |
| CI, deployment, smoke test, production checks of the voice features (HTTPS, microphone permission), P08 evidence; branch integration on `dev` | Fonseca | PROPOSED (continuation of TD-14, TD-17) | DevOps role. |
| Verification of acceptance criteria and manual voice evidence | Each story's assignees, plus one other member as reviewer | PROPOSED (TD-19) | Verify each story when it is finished (P03-RISK-006). |

**Load (committed stories / points per member, shared stories counted for each assignee):** Jhonier 9 / 25, Sebas 11 / 25, Casanova 9 / 19, David 8 / 18, Fonseca: integration and delivery. The voice front end concentrates on Jhonier (P03-RISK-012); Sebas is the backup for owner-facing screens. Equal load is not a goal.

## 8. Dependencies, Risks and Decisions

Upstream dependencies DEP-001 to DEP-010 and DEP-018 to DEP-022 (P02) remain valid and are referenced by the stories. P03 v2.0 items DEP-011 to DEP-017 and P03-RISK-001 to P03-RISK-008 refer to SPRINT-001 and are closed with it, except where carried below.

| ID | Related Items | Dependency / Risk / Decision | Impact | Required Action | Status |
|---|---|---|---|---|---|
| DEP-012 | US-007 (AC-079), US-012 (AC-083) | Dependency (carried): automatic-cancellation criteria need existing appointments. | Booking already exists, so only test data is needed. | Prepare appointments in the demonstration data (step 0). | PLANNED |
| DEP-023 | All committed stories | Dependency: P04 delta (voice search control, assistant screen, pet management, appointment actions, catalog edit/remove) and P05 delta (assistant component, missing operations for pets, appointments and offerings) validated before the sprint. | Without them the sprint starts with design work. | Run P04 and P05 next. | PLANNED |
| DEP-024 | US-037 to US-041; US-036 | Dependency: assistant questions and spoken answers need the assistant conversation (P02 DEP-021). | Ordering of work. | Steps 2 → 3. | PLANNED |
| DEP-025 | US-035, US-036 | Dependency: one shared voice input, built in US-035 and reused by US-036. | Avoids building voice input twice. | US-035 first (step 1). | PLANNED |
| DEP-026 | US-041, US-042 | Dependency: one shared speech output, built in US-041 and reused by US-042. | US-042 cannot start before US-041. | US-041 in step 2. | PLANNED |
| P03-RISK-008 | US-007, US-004 | Risk (carried): US-007 without US-004 leaves an owner who removes all pets unable to book. | Medium. | Deliver US-007 only with US-004 (step 4). | OPEN (mitigated by sequence) |
| P03-RISK-009 | SPRINT-002 | Risk: capacity. 45 committed points in about one working day (TD-34), which also holds P04, P05 and P07 to P10; iteration 1 needed about four days for 44 points (implementation 2026-10-11 to -12, production 2026-10-14). | **High: the full committed scope is very unlikely to be completed; P2 and part of P1 are expected to be cut.** | Accepted by the team (TD-34, option a). Apply PRIOR-008 early: at mid-day of 2026-11-10 at the latest, cut whatever has not started. Keep P0 first. | OPEN (accepted) |
| P03-RISK-010 | US-035, US-036, US-041 | Risk: new voice capability. Recognition quality with names and accents, behavior on phone Chrome, microphone permission and HTTPS. | Medium-high: estimates of 5, 5 and 3 points are uncertain. | Early spike in step 1 on the deployed site; editable text and typed fallback are part of the requirements (NFR-006). | OPEN |
| P03-RISK-011 | Voice stories; step 8 | Risk: voice cannot be fully tested automatically. | Medium: evidence would be manual only. | Automate tests on text input (interpretation, retry, assistant rules); record manual voice evidence with values. | OPEN |
| P03-RISK-012 | US-035, US-036, US-041, US-004 to US-007, US-022, US-023 | Risk: frontend bottleneck on Jhonier. | Medium. | Sebas backs up owner-facing screens; steps 4 to 6 in parallel with steps 1 to 3. | OPEN |
| P03-RISK-013 | Iteration 1 journeys | Risk: regression of deployed features; CI is not a required check on `main` (P10 EVAL-007). | Medium. | Keep the 318 existing tests green on every merge; ask the repository admin to make CI required. | OPEN |
| P03-RISK-014 | EPIC-009 | Risk: requirements and addendum accepted by delegation, not reviewed item by item (P02 VAL-R01). | Low: misunderstanding of the voice word lists could surface in the demonstration. | Team skims BR-043, BR-044, BR-053, BR-054 before P07. | OPEN |
| P03-RISK-007 | All | Risk (carried): upstream drift; P00/P01 not consolidated. | Low. | Consolidate when possible. | OPEN |
| PRIOR-005 to PRIOR-008 | See §5.5 | Sprint identifier, deadline, assignments, cut order. | See §5.5. | See §5.5. | PRIOR-005, PRIOR-006 DECIDED; PRIOR-007, -008 PROPOSAL (TD-19) |

## 9. Requirements-to-Priority Traceability

NFR-003, NFR-004 and NFR-005 apply to every story (global requirements) and are not repeated.

| Requirement ID | User Story ID | Priority | Sprint / Deferred | Decision Basis |
|---|---|---|---|---|
| FR-001 | US-001 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-002 | US-002 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-003 | US-003 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-004 | US-003 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-005 | US-001, US-004 | P0, P1 | SPRINT-001 (done); SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-006 | US-005 | P1 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-007 | US-006 | P1 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-008 | US-007 | P1 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-009 | US-008 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-010 | US-009 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-011 | US-010 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-012 | US-011 | P2 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-013 | US-012 | P2 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-014 | US-013 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-015 | US-014 | P2 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-016 | US-015 | P2 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-017 | US-016, US-035 | P0 | SPRINT-001 (done); SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-018 | US-017, US-035 | P0 | SPRINT-001 (done); SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-019 | US-016 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-020 | US-018 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-021 | US-019 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-022 | US-019, US-020 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-023 | US-020 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-024 | US-019 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-025 | US-019 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-026 | US-021 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-027 | US-022 | P2 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-028 | US-023 | P2 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-029 | US-024 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-030 | US-025 | P2 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-031 | US-026 | P2 | SPRINT-002 | CR-027 (P01-MVP-013); TD-30; P10 EVAL |
| FR-032 | US-027 | — | Deferred | TD-29 (ordering deferred) |
| FR-033 | US-028 | — | Deferred | TD-29 (ordering deferred) |
| FR-034 | US-029 | — | Deferred | TD-29 (ordering deferred) |
| FR-035 | US-030 | — | Deferred | TD-29 (ordering deferred) |
| FR-036 | US-031 | — | Deferred | TD-29 (ordering deferred) |
| FR-037 | US-032 | — | Deferred | TD-29 (ordering deferred) |
| FR-038 | US-033 | — | Deferred | TD-29 (ordering deferred) |
| FR-039 | US-034 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| FR-040 | US-035 | P0 | SPRINT-002 | CR-027; TD-30 |
| FR-041 | US-035 | P0 | SPRINT-002 | CR-027; TD-30 |
| FR-042 | US-035 | P0 | SPRINT-002 | CR-027; TD-30 |
| FR-043 | US-036 | P0 | SPRINT-002 | CR-027; TD-30 |
| FR-044 | US-037 | P1 | SPRINT-002 | CR-027; TD-30 |
| FR-045 | US-038 | P0 | SPRINT-002 | CR-027; TD-30 |
| FR-046 | US-039 | P1 | SPRINT-002 | CR-027; TD-30 |
| FR-047 | US-040 | P0 | SPRINT-002 | CR-027; TD-30 |
| FR-048 | US-037, US-038, US-039 | P0, P1 | SPRINT-002 | CR-027; TD-30 |
| FR-049 | US-041 | P0 | SPRINT-002 | CR-027; TD-30 |
| FR-050 | US-042 | P3 | Conditional (RELEASE-002) | CR-027; TD-30 |
| NFR-001 | US-001, US-002 | P0 | SPRINT-001 (done) | Delivered in iteration 1 (P10) |
| NFR-002 | US-003, US-005, US-006, US-011, US-014, US-021, US-024, US-028, US-029, US-034, US-036, US-039 | P0, P1, P2, — | Deferred; SPRINT-001 (done); SPRINT-002 | Applies to each story with its own decision (authorization) |
| NFR-006 | US-035, US-036, US-041, US-042 | P0, P3 | Conditional (RELEASE-002); SPRINT-002 | CR-027; TD-30 |
| NFR-007 | US-035, US-036 | P0 | SPRINT-002 | CR-027; TD-30 |
| NFR-008 | US-035, US-036, US-041, US-042 | P0, P3 | Conditional (RELEASE-002); SPRINT-002 | CR-027; TD-30 |

Every FR (FR-001 to FR-050) and every non-global NFR is accounted for.

## 10. Assumptions and Unknowns

| ID | Item | Classification | Impact on Plan | Action Needed |
|---|---|---|---|---|
| ASSUM-010 | Time available for iteration 2. | RESOLVED (TD-34): deadline 2026-11-10, about one working day | Full committed scope unlikely (P03-RISK-009). | None. |
| ASSUM-011 | All five members work on iteration 2 with the same roles. | ASSUMPTION | Assignments and parallel steps. | Team confirms or reassigns (PRIOR-007). |
| ASSUM-012 | Iteration 1 (44 points delivered) is a single reference point, not a velocity; the estimates of iteration 2 are relative to the same scale. | ASSUMPTION | Feasibility judgment. | None; re-check after step 1. |
| ASSUM-013 | P04 and P05 deltas are produced and validated before the sprint, outside its time, as in iteration 1. | **NO LONGER HOLDS** (TD-34): they fall inside the same day | Less time for implementation. | Run P04 and P05 as short deltas, limited to the P0 screens first. |
| ASSUM-014 | Browser voice recognition and speech output work on Chrome desktop and phone on the deployed HTTPS domain (P01-ASSUMPTION-027, -029). | ASSUMPTION | If not, the voice stories are blocked. | Verify in step 1 (P03-RISK-010). |
| — | Estimates of v2.0 for the 12 promoted stories are kept; they were made with the same scale and no new information changes them. US-005 stays 1 although part of it exists. | ASSUMPTION | Low. | None. |

## 11. Feasibility Assessment

**v3.1 (TD-34): NOT_FEASIBLE for the full committed scope (45 points); CONDITIONALLY_FEASIBLE for P0 (16 points).**

Evidence: the deadline is 2026-11-10, about one working day from 2026-11-09, and P04, P05 and P07 to P10 must fit in the same window. Iteration 1 needed about four days (implementation logs 2026-10-11 and -12, production verified 2026-10-14) for 44 points, with P04 and P05 done before. Helping factors remain: the foundation, CI, deployment and data model exist; the promoted stories reuse existing modules; voice needs no external service.

**Team decision (TD-34, option a):** the 19 stories stay committed and the cut order PRIOR-008 is applied as soon as work does not fit. This is the team's accepted risk (P03-RISK-009), not a feasibility claim.

**Realistic outcome:** P0 can be delivered if P04 and P05 are run as short deltas focused on P0 screens, the voice spike (step 1) works early, and P07 to P10 are kept to their minimum. P1 depends on how fast P0 goes; P2 is expected to be cut and reported as deferred.

**Recommended working rules for the day:** P0 first and finished end to end (deployed and evidenced) before P1 starts; pairs on steps 4 to 6 start only once P0 is safe; cut decision at mid-day of 2026-11-10 at the latest.

## 12. Final Recommendation

The smallest coherent iteration 2 delivery is the **P0 set (16 points)**: voice search plus an assistant that understands at least one question type and help, and reads its answers aloud. It is the only part required for VetCare v2 to show speech-to-text and text-to-speech. The team committed more (TD-30), so the plan adds P1 (other assistant questions and pet management, the HIGH finding of P10) and P2 (appointment and catalog management), in that order and with an explicit cut order.

Trade-offs: product ordering stays deferred (largest remaining gap, 15 points, but not needed for the voice goal); the read-aloud feature stays conditional; voice criteria rely on manual evidence plus automated tests at text level.

## 13. Status and Next Actions

- **P04 can proceed:** yes. It should design only the delta: microphone control and listening state in the owner search; the assistant screen (conversation, typed and voice input, mute/stop); pet add/edit/remove; cancel and reschedule actions for owners and providers; edit and remove in the provider catalog; and, if time allows, the "Escuchar" control.
- **Decisions before implementation:** none open (PRIOR-006 decided by TD-34). PRIOR-007 and PRIOR-008 apply unless the team objects.
- **Assumptions to confirm:** ASSUM-010, ASSUM-011, ASSUM-014 (the last one in step 1).
- **Human review:** the proposed assignments (§7) and the cut order (§5.5); the voice word lists (P03-RISK-014).
