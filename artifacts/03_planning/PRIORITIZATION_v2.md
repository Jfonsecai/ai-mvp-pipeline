# Prioritization and Single-Sprint Plan

> **Classification legend:** **CONFIRMED** = stated by the team or validated upstream · **ASSUMPTION** · **PROPOSAL** = suggestion awaiting team approval · **UNKNOWN** · **REQUIRES DECISION** · **BLOCKED**.
> **Identifiers:** upstream IDs (EPIC, FR, NFR, US, AC, BR, EDGE, DEP-001 to DEP-010, P02-Q, P02-ASM, P01-*, TD-01 to TD-20) are reused unchanged. P03 IDs from v1.0 keep their meaning; new P03 IDs continue the sequences:
>
> - `DEP-011` and up continue the P02 dependency sequence.
> - `ASSUM-`, `PRIOR-` (planning decisions), `SPRINT-001` and `RELEASE-001`.
> - `P03-RISK-` is used instead of `RISK-`, because `RISK-001` to `RISK-011` already exist in P00.

## 1. Document Metadata

- **Version:** 2.0
- **Stage:** P03 — Planning
- **Status:** READY
- **Project:** VetCare (TD-02)
- **Source artifacts:**
  - `REQUIREMENTS.md` v3.0 and `product_backlog.json` v3.0 (P02, generated in this cascade).
  - `REQUIREMENTS_VALIDATION.md` v3.0 (PASS_WITH_WARNINGS: 1 medium, 5 low).
  - `PRIORITIZATION_V1.md` and `product_backlog_priori_v1.json` (= P03 v1.0, verified by diff), as the previous plan.
  - Team decisions TD-01 to TD-20 (2026-10-10); TD-16 to TD-19 are the planning decisions.
  - `SYSTEM_PROMPT.md`.
- **Upstream validation statuses:**
  - P00 `CONTEXT_VALIDATION.md` v2.0: PASS_WITH_WARNINGS.
  - P01 `PRODUCT_VISION_VALIDATION.md` v4.0: PASS_WITH_WARNINGS.
  - P02 `REQUIREMENTS_VALIDATION.md` v3.0: PASS_WITH_WARNINGS (1 medium, 5 low).
- **Formal delivery window:** two weeks per the P03 prompt; one week for the MVP (P00 ANS-Q011). The team confirmed the plan uses the three days for P06–P10 (ASSUM-001, ASSUM-007 confirmed; TD-18).
- **Actual remaining time and capacity:**
  - The team stated three days for stages P06 to P10: implementation, testing, CI/CD, documentation and evaluation (A-P01Q-020), and accepted all risks.
  - Exact dates and hours per person are not recorded, by team decision (TD-18). Team velocity is UNKNOWN (no history).
- **Generation Date:** 2026-10-10
- **Previous Version:** `history/PRIORITIZATION_v1.0.md`, `history/product_backlog_v3.0-P03.json`

### Changes from v1.0

| Change | Source |
|---|---|
| Committed scope: the 14 P0 stories plus US-034 (sign-out); PRIOR-001 approved. | TD-16 |
| Ordering (US-027 to US-033) unblocked and placed first among conditional work (P1), with UX designed in P04. | TD-12, TD-13, TD-16 |
| Former Group A becomes P2 and former non-ordering Group B becomes P3. | TD-16 |
| Unfinished work is deferred to a future iteration (PRIOR-002 decided). | TD-16 |
| Assignments approved, including new stories (PRIOR-003). | TD-17 |
| Sprint = the 3 confirmed days; dates and hours not recorded (PRIOR-004). | TD-18 |
| Re-estimates: US-002 2 → 3; US-034 new (1); US-027 3, US-033 2 (were unestimated). | P02 v3.0 criteria; TD-19 |
| Open decisions P02-Q-004, -009, -001, -017, -018 resolved; DEP-011 resolved; ASSUM-001 to ASSUM-008 confirmed. | TD-06, TD-08, TD-09, TD-12, TD-13; team 2026-10-09 |

## 2. Executive Summary

**Strategy.** Deliver the core journey in one sprint (`SPRINT-001`): a pet owner goes from "my pet needs a service" to a scheduled appointment that the provider can see, without outside channels (P01-SUCCESS-007). Product ordering follows if time remains.

**Committed scope (TD-16):** 15 P0 stories (44 points): the 14 core-journey stories of v1.0 plus sign-out (US-034).

**Conditional scope** (enters the sprint only if capacity permits, in this order):

- **Ordering package (P1):** 7 stories, 15 points. Stock indicator, ordering, order views, status updates and cancellation. Its UX is designed in P04 so it can start without improvisation (TD-16).
- **Group A (P2):** 7 stories, 14 points. Appointment cancel and reschedule, extra pets, service updates. No UX design (TD-16).
- **Group B (P3):** 5 stories, 10 points. Pet and catalog maintenance, product maintenance. No UX design (TD-16).

**Nothing is blocked.** The team decided every open question (TD-06, TD-08, TD-09, TD-12, TD-13).

**Unfinished work** at the end of the sprint is deferred to a future iteration (PRIOR-002, decided by TD-16).

**Single sprint.** Exactly one sprint is planned. The work sequence in §6 is an order within `SPRINT-001`, not separate sprints.

**Feasibility: CONDITIONALLY_FEASIBLE** for the committed scope only. The full MVP (34 stories, 83 points) is not committed. Three days must also cover testing, CI/CD, documentation and evaluation, and velocity is unknown.

## 3. Planning Constraints

| Constraint | Value | Classification |
|---|---|---|
| Formal delivery window | Two weeks (P03 prompt) | CONFIRMED by the prompt; the plan uses the three days (ASSUM-007 confirmed) |
| Time to develop the MVP | One week (P00 ANS-Q011, repeated in later answers) | CONFIRMED |
| Time for P06–P10 | Three days; "it must be so and all risks are accepted" (A-P01Q-020) | CONFIRMED |
| Sprint dates | Not recorded, by team decision (TD-18) | DECISION |
| Hours per day, individual availability | Not recorded, by team decision (TD-18); all five members work on the sprint (ASSUM-003 confirmed) | DECISION |
| Team velocity | No history | UNKNOWN |
| Team | 5 members: David (Backend / Database), Jhonier (Frontend), Casanova (Backend), Fonseca (DevOps), Sebas (Fullstack) | CONFIRMED roles (P00 [TEAM]); skills beyond roles UNKNOWN |
| Budget, infrastructure | No budget; stack and free-tier hosting decided by the team (TD-14; details in ARCHITECTURE v2.0) | CONFIRMED |
| Prior stages | P04 (UX/UI) and P05 (Architecture) are done before the sprint, outside the three days; they are regenerated in this cascade | CONFIRMED (ASSUM-002) |

**Missing information affecting feasibility:** team velocity and hours per person. The team chose not to record them (TD-18), so capacity cannot be computed; feasibility stays conditional.

## 4. Product Priorities at a Glance

Priority describes value and delivery order; scope classification is inherited from P02. **Definition status** is the P02 status, preserved here because the JSON `status` field now holds the planning status.

| Priority | Item ID | Capability | Rationale | Source Requirement | Scope Classification | Definition status (P02) |
|---|---|---|---|---|---|---|
| P0 | US-002 | Sign up as a provider | Without providers there is nothing to find or book (P01-RISK-003). Re-estimated 2 → 3: clinic address and password rules add three criteria (AC-103 to AC-105). | FR-002, NFR-001 | MVP_SUPPORTING | DEFINED |
| P0 | US-001 | Sign up as a pet owner with my first pet | Entry point for every pet owner; registers the first pet needed to book (BR-003). Species now mandatory and password length added (TD-04, TD-07): no estimate change. | FR-001, FR-005, NFR-001 | MVP_SUPPORTING | DEFINED |
| P0 | US-003 | Sign in to my interface | Every other story needs a signed-in user of the right type (DEP-001). Session expiry (AC-114) is configuration: no estimate change. | FR-003, FR-004, NFR-002, NFR-005 | MVP_SUPPORTING | DEFINED |
| P0 | US-034 | Sign out | Sign-out in both interfaces (TD-03); committed by team decision (TD-16). Small: ends the session and returns to sign-in. | FR-039, NFR-002 | MVP_SUPPORTING | DEFINED |
| P0 | US-008 | Maintain my public profile | Owners need the provider's contact and address; clinic address rule added (AC-106): no estimate change. | FR-009 | MVP_SUPPORTING | DEFINED |
| P0 | US-009 | Set my working days and hours | No working hours means no bookable slots (EDGE-014). Higher estimate: per-day hours, on-the-hour validation and automatic cancellation (AC-081). | FR-010 | MVP_SUPPORTING | DEFINED |
| P0 | US-010 | Publish a service | Services are what owners search and book (P01-MVP-003, Core). Independent veterinarians limited to home (AC-107): no estimate change. | FR-011 | MVP_CORE | DEFINED |
| P0 | US-013 | Publish a product | Products are part of the Core catalog and search, shown by committed criteria AC-039 and AC-044; prerequisite of ordering. | FR-014 | MVP_CORE | DEFINED |
| P0 | US-016 | Search services and products | "Find in one place" is the core value (P01-MVP-001, Core; P01-SUCCESS-007). | FR-017, FR-019 | MVP_CORE | DEFINED |
| P0 | US-017 | Filter by species | Part of P01-MVP-001 (Core); the adopted success criterion refers to the pet's species (P01-SUCCESS-007). | FR-018 | MVP_CORE | DEFINED |
| P0 | US-018 | View a provider's profile | Step of the core journey: owners see who offers the service and how to reach them (P01-JOURNEY-001). | FR-020 | MVP_SUPPORTING | DEFINED |
| P0 | US-019 | Book an appointment for my pet | Outcome of the core journey (P01-SUCCESS-007). Largest estimate: slot calculation, clinic and independent-vet rules, concurrency (EDGE-007), same-species rule (TD-06, now decided). | FR-021, FR-022, FR-024, FR-025 | MVP_CORE | DEFINED |
| P0 | US-020 | Book a home visit | Home services are offered in the catalog; without the address they cannot be booked (P01-SUCCESS-004). | FR-022, FR-023 | MVP_CORE | DEFINED |
| P0 | US-024 | See my scheduled appointments | Without notifications, the provider's appointments space is the only way providers learn of bookings (P01-RISK-012). | FR-029, NFR-002 | MVP_SUPPORTING | DEFINED |
| P0 | US-021 | View my appointments | Owners must see their booked appointment; notifications are excluded (P01-OOS-004). | FR-026, NFR-002 | MVP_SUPPORTING | DEFINED |
| P1 | US-033 | Indicate whether a product is in stock | Ordering package, first if capacity remains (TD-16). Prerequisite of ordering (DEP-010): products are available by default (AC-111). | FR-038 | MVP_SUPPORTING | DEFINED |
| P1 | US-027 | Order a product to my address | Ordering package (TD-16). One product per order with a quantity (TD-12); no payment. Estimate 3 now that contents are decided. | FR-032 | MVP_SUPPORTING | DEFINED |
| P1 | US-029 | See my orders | Ordering package (TD-16); owners need to see their orders (DEP-015). | FR-034, NFR-002 | MVP_SUPPORTING | DEFINED |
| P1 | US-028 | See the product orders placed with me | Ordering package (TD-16); providers need to see what to deliver (DEP-015). | FR-033, NFR-002 | MVP_SUPPORTING | DEFINED |
| P1 | US-030 | Update the status of an order | Ordering package (TD-16); status flow Confirmed → Dispatched/In delivery → Closed (DEP-015). | FR-035 | MVP_SUPPORTING | DEFINED |
| P1 | US-031 | Cancel my order | Ordering package (TD-16); owner cancels before dispatch (DEP-015). | FR-036 | MVP_SUPPORTING | DEFINED |
| P1 | US-032 | Cancel an order as a provider | Ordering package (TD-16); provider cancels before dispatch (DEP-015). | FR-037 | MVP_SUPPORTING | DEFINED |
| P2 | US-022 | Cancel my appointment | High value (P01-SUCCESS-006); the core journey works without it. Moved after ordering by TD-16. | FR-027 | MVP_SUPPORTING | DEFINED |
| P2 | US-025 | Cancel an appointment as a provider | High value (P01-SUCCESS-006); the core journey works without it. Moved after ordering by TD-16. | FR-030 | MVP_SUPPORTING | DEFINED |
| P2 | US-023 | Reschedule my appointment | High value (P01-SUCCESS-006); the core journey works without it. Moved after ordering by TD-16. | FR-028 | MVP_SUPPORTING | DEFINED |
| P2 | US-026 | Reschedule an appointment as a provider | High value (P01-SUCCESS-006); the core journey works without it. Moved after ordering by TD-16. | FR-031 | MVP_SUPPORTING | DEFINED |
| P2 | US-004 | Add a pet | Owners with more than one pet; the first pet is already registered at sign-up (US-001). | FR-005 | MVP_SUPPORTING | DEFINED |
| P2 | US-005 | View my pets | List of pets; pet selection at booking is already covered by US-019. | FR-006, NFR-002 | MVP_SUPPORTING | DEFINED |
| P2 | US-011 | Update a service | Keeps the catalog accurate (P01-NEED-007); not required for the first demonstration. | FR-012, NFR-002 | MVP_CORE | DEFINED |
| P3 | US-006 | Edit a pet | Supporting; pet data can be entered correctly at registration. | FR-007, NFR-002 | MVP_SUPPORTING | DEFINED |
| P3 | US-007 | Remove a pet | Supporting; includes automatic cancellation (AC-079), verifiable only after US-019 (DEP-012). Should not be delivered without US-004, or an owner who removes all pets cannot book again. | FR-008 | MVP_SUPPORTING | DEFINED |
| P3 | US-012 | Remove a service | Supporting; includes automatic cancellation (AC-083), verifiable only after US-019 (DEP-012). | FR-013 | MVP_CORE | DEFINED |
| P3 | US-014 | Update a product | Supporting product maintenance. | FR-015, NFR-002 | MVP_CORE | DEFINED |
| P3 | US-015 | Remove a product | Supporting product maintenance; existing orders keep their status (P02-ASM-012, confirmed). | FR-016 | MVP_CORE | DEFINED |

## 5. MVP Scope

### 5.1 Committed for SPRINT-001

| Story ID | Capability | User Value | Priority | Estimate | Dependencies |
|---|---|---|---|---|---|
| US-002 | Sign up as a provider | I can publish my services and products to pet owners | P0 | 3 | — |
| US-001 | Sign up as a pet owner with my first pet | I can use the platform to find services and book appointments for my pet | P0 | 3 | — |
| US-003 | Sign in to my interface | I can use the interface that corresponds to that account type | P0 | 3 | — |
| US-034 | Sign out | Nobody else can use my account on this device, and I can sign in again with another account type | P0 | 1 | DEP-001 |
| US-008 | Maintain my public profile | Pet owners can identify and reach me | P0 | 2 | DEP-001 |
| US-009 | Set my working days and hours | Owners can only book me when I work | P0 | 5 | DEP-001 |
| US-010 | Publish a service | Pet owners can find it and book appointments | P0 | 3 | DEP-001 |
| US-013 | Publish a product | Pet owners can find it and order it | P0 | 2 | DEP-001 |
| US-016 | Search services and products | I can find what my pet needs in one place without using other channels | P0 | 3 | DEP-001, DEP-003, DEP-004 |
| US-017 | Filter by species | I only see offerings that apply to the animal I am looking for | P0 | 2 | DEP-001, DEP-003, DEP-004 |
| US-018 | View a provider's profile | I can decide whether to book or order and know how to reach it | P0 | 2 | DEP-001, DEP-005 |
| US-019 | Book an appointment for my pet | My pet receives the service | P0 | 8 | DEP-001, DEP-002, DEP-005, DEP-006 |
| US-020 | Book a home visit | The provider knows where to attend my pet | P0 | 2 | DEP-001, DEP-006 |
| US-024 | See my scheduled appointments | I know what I have to attend and where | P0 | 3 | DEP-001, DEP-007 |
| US-021 | View my appointments | I know when and where each one takes place, including changes made by the provider | P0 | 2 | DEP-001, DEP-007 |

**Total committed: 15 stories, 44 points (preliminary relative estimate).**

### 5.2 Conditional on Capacity

| Story ID | Capability | Value | Condition for Inclusion |
|---|---|---|---|
| US-033 | Indicate whether a product is in stock | Ordering package, first if capacity remains (TD-16). Prerequisite of ordering (DEP-010): products are available by default (AC-111). | **Ordering package (P1, 2 pts):** all committed stories done and verified; enter in the §6 order (US-033 and US-027 first). |
| US-027 | Order a product to my address | Ordering package (TD-16). One product per order with a quantity (TD-12); no payment. Estimate 3 now that contents are decided. | **Ordering package (P1, 3 pts):** all committed stories done and verified; enter in the §6 order (US-033 and US-027 first). |
| US-029 | See my orders | Ordering package (TD-16); owners need to see their orders (DEP-015). | **Ordering package (P1, 2 pts):** all committed stories done and verified; enter in the §6 order (US-033 and US-027 first). |
| US-028 | See the product orders placed with me | Ordering package (TD-16); providers need to see what to deliver (DEP-015). | **Ordering package (P1, 2 pts):** all committed stories done and verified; enter in the §6 order (US-033 and US-027 first). |
| US-030 | Update the status of an order | Ordering package (TD-16); status flow Confirmed → Dispatched/In delivery → Closed (DEP-015). | **Ordering package (P1, 3 pts):** all committed stories done and verified; enter in the §6 order (US-033 and US-027 first). |
| US-031 | Cancel my order | Ordering package (TD-16); owner cancels before dispatch (DEP-015). | **Ordering package (P1, 2 pts):** all committed stories done and verified; enter in the §6 order (US-033 and US-027 first). |
| US-032 | Cancel an order as a provider | Ordering package (TD-16); provider cancels before dispatch (DEP-015). | **Ordering package (P1, 1 pts):** all committed stories done and verified; enter in the §6 order (US-033 and US-027 first). |
| US-022 | Cancel my appointment | High value (P01-SUCCESS-006); the core journey works without it. Moved after ordering by TD-16. | **Group A (P2, 2 pts):** ordering package done or stopped; no UX design exists (TD-16), so a short UX note is needed first. |
| US-025 | Cancel an appointment as a provider | High value (P01-SUCCESS-006); the core journey works without it. Moved after ordering by TD-16. | **Group A (P2, 2 pts):** ordering package done or stopped; no UX design exists (TD-16), so a short UX note is needed first. |
| US-023 | Reschedule my appointment | High value (P01-SUCCESS-006); the core journey works without it. Moved after ordering by TD-16. | **Group A (P2, 3 pts):** ordering package done or stopped; no UX design exists (TD-16), so a short UX note is needed first. |
| US-026 | Reschedule an appointment as a provider | High value (P01-SUCCESS-006); the core journey works without it. Moved after ordering by TD-16. | **Group A (P2, 2 pts):** ordering package done or stopped; no UX design exists (TD-16), so a short UX note is needed first. |
| US-004 | Add a pet | Owners with more than one pet; the first pet is already registered at sign-up (US-001). | **Group A (P2, 2 pts):** ordering package done or stopped; no UX design exists (TD-16), so a short UX note is needed first. |
| US-005 | View my pets | List of pets; pet selection at booking is already covered by US-019. | **Group A (P2, 1 pts):** ordering package done or stopped; no UX design exists (TD-16), so a short UX note is needed first. |
| US-011 | Update a service | Keeps the catalog accurate (P01-NEED-007); not required for the first demonstration. | **Group A (P2, 2 pts):** ordering package done or stopped; no UX design exists (TD-16), so a short UX note is needed first. |
| US-006 | Edit a pet | Supporting; pet data can be entered correctly at registration. | **Group B (P3, 1 pts):** Group A done; no UX design exists (TD-16). |
| US-007 | Remove a pet | Supporting; includes automatic cancellation (AC-079), verifiable only after US-019 (DEP-012). Should not be delivered without US-004, or an owner who removes all pets cannot book again. | **Group B (P3, 3 pts):** Group A done; no UX design exists (TD-16). |
| US-012 | Remove a service | Supporting; includes automatic cancellation (AC-083), verifiable only after US-019 (DEP-012). | **Group B (P3, 3 pts):** Group A done; no UX design exists (TD-16). |
| US-014 | Update a product | Supporting product maintenance. | **Group B (P3, 1 pts):** Group A done; no UX design exists (TD-16). |
| US-015 | Remove a product | Supporting product maintenance; existing orders keep their status (P02-ASM-012, confirmed). | **Group B (P3, 2 pts):** Group A done; no UX design exists (TD-16). |

Ordering package: 15 points. Group A: 14 points. Group B: 10 points. A conditional story not finished in the sprint is deferred to a future iteration (TD-16).

### 5.3 Deferred

| Story ID | Capability | Reason for Deferral | Future Consideration |
|---|---|---|---|
| — | None up front | No story is deferred before the sprint. By team decision (TD-16, PRIOR-002), any conditional story not finished in `SPRINT-001` is deferred to a future iteration and listed at sprint end. | Next iteration |

### 5.4 Out of Scope

| Item ID | Excluded Capability | Reason |
|---|---|---|
| P01-OOS-001 | Verification of provider credentials | Team decision (P00 ANS-Q007) |
| P01-OOS-002 | Determining the user's area | Team decision (P00 ANS-Q003) |
| P01-OOS-003 | Cities other than Bogotá | Team decision (P00 ANS-Q010) |
| P01-OOS-004 | Payments, notifications, real-time tracking | Team decision (A-P01Q-002, -024) |
| P01-OOS-005 | Different clinic/home scheduling rules | Team decision (P00 ANS-Q004) |
| P01-OOS-006 | Ratings and reviews | Team decision (A-P01Q-018) |
| P01-OOS-007 | Appointment confirmation step | Team decision (A-P01Q-019) |
| P01-OOS-008 | Administrator role | Team decision (A-P01Q-006) |
| P01-OOS-009 | Clinic staff or capacity management | Team decision (A-P01Q-025) |
| P01-OOS-010 | Product requests or reservations | Team decision (A-P01Q-024) |

### 5.5 Requires Decision

| Item ID | Decision Needed | Impact | Proposed Resolution |
|---|---|---|---|
| — | None | Every planning decision is made (TD-16 to TD-18) and every requirements question is resolved (P02 v3.0). | — |

**Decisions recorded in this version:**

| Item ID | Decision | Source |
|---|---|---|
| PRIOR-001 | Committed scope approved: the 14 P0 stories plus US-034. | TD-16 |
| PRIOR-002 | Unfinished conditional work is deferred to a future iteration. | TD-16 |
| PRIOR-003 | Proposed assignments approved, including those of new stories. | TD-17 |
| PRIOR-004 | The sprint is the 3 confirmed days; dates and hours per person are not recorded. | TD-18 |
| P04-RD-005 | Only the ordering package gets UX design; the rest of Groups A and B do not. | TD-16 |

## 6. Single-Sprint Plan

**Sprint:** `SPRINT-001` · **Release:** `RELEASE-001` (the academic MVP delivery)

**Sprint objective:** a pet owner can sign up with a pet, find a service by text and species, see the provider, and book a one-hour appointment (at the clinic or at home) that both the owner and the provider can see, without using any outside channel (P01-SUCCESS-007).

**Duration:** the three days the team gave to P06–P10 (ASSUM-001, TD-18). Exact dates are not recorded.

**Selected stories:** US-002, US-001, US-003, US-034, US-008, US-009, US-010, US-013, US-016, US-017, US-018, US-019, US-020, US-024, US-021.

**Total estimate:** 44 points committed; 15 conditional (ordering); 14 conditional (Group A); 10 conditional (Group B). The total estimate does not guarantee completion: there is no velocity to compare it with.

**Work sequence within SPRINT-001.** These are steps inside the same sprint, not separate sprints.

| Step | Work | Stories / activities | Prerequisites |
|---|---|---|---|
| 0 | Prerequisites | Environment ready: GitHub repository, Vercel and Neon accounts and the first deployment (Fonseca, TD-14); CTR-008 written (TD-15). No product decision is pending. | P04 v2.0 and P05 v2.0 validated (DEP-016) |
| 1 | Foundations | US-002, US-001, US-003, US-034, US-008, US-009, US-010, US-013 | DEP-001; for US-009, the AC-081 check waits until step 2 (DEP-012) |
| 2 | Core journey | US-016, US-017, US-018, US-019, US-020 | Step 1; DEP-013 |
| 3 | Closing the loop | US-024, US-021 | US-019 (DEP-014) |
| 4 | Ordering package (if capacity) | US-033, US-027, US-029, US-028, US-030, US-031, US-032 | Steps 1–3 done and verified; US-013 done (DEP-015) |
| 5 | Conditional Group A (if capacity) | US-022, US-025, US-023, US-026, US-004, US-005, US-011 | Step 4 done or stopped; short UX note first |
| 6 | Conditional Group B (if capacity) | US-006, US-007, US-012, US-014, US-015 | Group A done; US-007 needs US-004; automatic-cancellation checks need US-019 (DEP-012) |
| 7 | Integration, verification, delivery | Run every AC of the stories delivered; check NFR-001 to NFR-005 (Chrome on computer and phone; Spanish UI; session expiry); deploy; prepare the demonstration with test data only (TD-11); list deferred stories; P07–P10 activities. | All delivered stories |

**Definition of Done for the current delivery:**

- Every acceptance criterion of each delivered story has been checked and passes.
- NFR-001 (hashed passwords), NFR-002 (users see only their own data), NFR-003 (Chrome on computers and phones), NFR-004 (Spanish interface) and NFR-005 (session expiry) hold for the delivered stories.
- The applicable business rules and edge cases listed in the story are respected.
- The work is integrated, deployed in an environment the team can demonstrate, and reviewed by at least one other team member.

**Conditions for a successful sprint:**

1. All 15 committed stories meet the Definition of Done.
2. P01-SUCCESS-007 can be demonstrated end to end, and the provider sees the resulting appointment (US-024).
3. The undelivered conditional stories, if any, are listed and deferred to a future iteration (TD-16).

## 7. Team Responsibilities

Assignments were proposed from the role labels in P00 [TEAM] and **APPROVED** by the team, including those of new stories (TD-17). Assignments of the ordering package were proposed in this version and are approved under TD-17 and the standing rule (TD-19); they apply when a story enters the sprint.

| Work Item | Responsible Member(s) | Assignment Status | Rationale / Notes |
|---|---|---|---|
| US-002 Sign up as a provider | David, Sebas | APPROVED (TD-17) | Backend + provider interface. Roles: David (Backend / Database), Sebas (Fullstack) |
| US-001 Sign up as a pet owner with my first pet | David, Jhonier | APPROVED (TD-17) | Backend + pet owner interface. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-003 Sign in to my interface | David, Jhonier | APPROVED (TD-17) | Backend + sign-in screen shared by both interfaces. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-034 Sign out | David, Jhonier | APPROVED (TD-17) | Backend + menu action in both interfaces. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-008 Maintain my public profile | Casanova, Sebas | APPROVED (TD-17) | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-009 Set my working days and hours | Casanova, Sebas | APPROVED (TD-17) | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-010 Publish a service | Casanova, Sebas | APPROVED (TD-17) | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-013 Publish a product | Casanova, Sebas | APPROVED (TD-17) | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-016 Search services and products | David, Jhonier | APPROVED (TD-17) | Backend + pet owner interface. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-017 Filter by species | David, Jhonier | APPROVED (TD-17) | Backend + pet owner interface. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-018 View a provider's profile | David, Jhonier | APPROVED (TD-17) | Backend + pet owner interface. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-019 Book an appointment for my pet | Casanova, Jhonier | APPROVED (TD-17) | Backend + pet owner interface. Roles: Casanova (Backend), Jhonier (Frontend) |
| US-020 Book a home visit | Casanova, Jhonier | APPROVED (TD-17) | Backend + pet owner interface. Roles: Casanova (Backend), Jhonier (Frontend) |
| US-024 See my scheduled appointments | Casanova, Sebas | APPROVED (TD-17) | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-021 View my appointments | Casanova, Jhonier | APPROVED (TD-17) | Backend + pet owner interface. Roles: Casanova (Backend), Jhonier (Frontend) |
| US-033 Indicate whether a product is in stock | Casanova, Sebas | APPROVED (TD-17, TD-19); applies if it enters | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-027 Order a product to my address | David, Sebas | APPROVED (TD-17, TD-19); applies if it enters | Backend + pet owner interface. Roles: David (Backend / Database), Sebas (Fullstack) |
| US-029 See my orders | David, Sebas | APPROVED (TD-17, TD-19); applies if it enters | Backend + pet owner interface. Roles: David (Backend / Database), Sebas (Fullstack) |
| US-028 See the product orders placed with me | Casanova, Sebas | APPROVED (TD-17, TD-19); applies if it enters | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-030 Update the status of an order | Casanova, Sebas | APPROVED (TD-17, TD-19); applies if it enters | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-031 Cancel my order | David, Sebas | APPROVED (TD-17, TD-19); applies if it enters | Backend + pet owner interface. Roles: David (Backend / Database), Sebas (Fullstack) |
| US-032 Cancel an order as a provider | Casanova, Sebas | APPROVED (TD-17, TD-19); applies if it enters | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| Environment, CI/CD, deployment, integration support; Vercel and Neon accounts; GitHub repository | Fonseca | APPROVED (TD-14, TD-17) | DevOps role; P08 activities happen inside the same three days |
| Verification of acceptance criteria (step 7) | Each story's assignees, plus one other member as reviewer | APPROVED (TD-19) | Verify each story as it finishes (P03-RISK-006) |
| Conditional Groups A and B | — | UNASSIGNED | Assigned if they enter the sprint |

**Load (committed stories per member):** Casanova 8, David 7, Jhonier 9, Sebas 6. Jhonier carries most owner-facing work (P03-RISK-004); Sebas (Fullstack) is the backup and takes the frontend of the ordering package. Equal load is not a goal.

## 8. Dependencies, Risks and Decisions

Upstream dependencies DEP-001 to DEP-010 (P02) remain valid and are referenced by the stories. New P03 items:

| ID | Related Items | Dependency / Risk / Decision | Impact | Required Action | Status |
|---|---|---|---|---|---|
| DEP-011 | US-019, US-010, US-008; P02-Q-004, P02-Q-009 | Dependency (decision): booking and service-publishing validations depended on two open rules. | None now. | Decided by TD-06, TD-08, TD-09. | RESOLVED |
| DEP-012 | US-009 (AC-081), US-007 (AC-079), US-012 (AC-083); US-019 | Dependency: automatic-cancellation criteria need existing appointments. | These criteria can only be verified after US-019. | Verify them in step 7, or after step 2. | PLANNED |
| DEP-013 | US-019, US-020; US-001, US-009, US-010 | Dependency: booking needs a pet, working hours and a published service. | Ordering of work. | Steps 1 → 2. | PLANNED |
| DEP-014 | US-021, US-024; US-019 | Dependency: appointment views need booking. | Ordering of work. | Step 2 → 3. | PLANNED |
| DEP-015 | US-027 to US-033; US-013 | Dependency: order views, status and cancellation need ordering; ordering needs products (US-013, committed) and the stock indicator (US-033, DEP-010). | Ordering order within step 4. | US-033 and US-027 first in step 4. | PLANNED |
| DEP-016 | All committed stories and the ordering package | Dependency: P04 (UX/UI) and P05 (Architecture) must be completed before the sprint. | If not, the three days shrink further. | P04 v2.0 and P05 v2.0 are produced in this cascade. | IN PROGRESS (this cascade) |
| DEP-017 | Step 7 | Dependency: deployment environment (Vercel and Neon, TD-14). | No demonstration without it. | Fonseca prepares it in step 0. | PLANNED |
| P03-RISK-001 | SPRINT-001 | Risk: capacity. 44 committed points plus testing, CI/CD, documentation and evaluation in three days, with unknown velocity. | High: the committed scope may not be completed. | Keep the sprint to P0 until it is done; accepted by the team (A-P01Q-020). | OPEN (accepted by team) |
| P03-RISK-002 | US-019 | Risk: complexity. The largest story (8 points), on the critical path; concurrency for independent vets (EDGE-007). | High: delays block US-020, US-021, US-024. | Start it as early as possible in step 2; P03 may split it (P02 VAL-007). | OPEN |
| P03-RISK-003 | US-019, US-010 | Risk: open rules (DEP-011) not decided before the sprint. | None now. | Decided (TD-06, TD-08, TD-09). | CLOSED |
| P03-RISK-004 | Owner-facing stories | Risk: frontend bottleneck; one Frontend role plus one Fullstack. | Medium. | Sebas backs up Jhonier and takes the ordering frontend (TD-17). | OPEN |
| P03-RISK-005 | US-027 to US-033 | Risk: product ordering not reached in the sprint. | Medium: an MVP capability chosen by the team may be missing at delivery. | Ordering is first among conditional work and its UX is designed; if unfinished it is deferred (TD-16). | OPEN (mitigated) |
| P03-RISK-006 | Step 7 | Risk: verification squeezed into the end of the three days. | Medium: quality and Definition of Done at risk. | Verify each story when it is finished, not only in step 7. | OPEN |
| P03-RISK-007 | All | Risk: upstream drift. P00 and P01 do not include the latest answers and decisions (P02 v3.0 VAL-001). | Low for planning: P02 v3.0 is the requirements source. | Regenerate P01/P00 when possible. | OPEN |
| P03-RISK-008 | US-007, US-004 | Risk: if US-007 (remove a pet) is delivered without US-004 (add a pet), an owner who removes all pets can never book again. | Medium for those owners. | Do not deliver US-007 without US-004 (§6 step 6). | OPEN (mitigated by sequence) |
| PRIOR-001 to PRIOR-004 | See §5.5 | Decisions on scope approval, the fate of unfinished conditional work, assignments and capacity data. | Resolved. | TD-16 to TD-18. | DECIDED |

## 9. Requirements-to-Priority Traceability

| Requirement ID | User Story ID | Priority | Sprint / Deferred | Decision Basis |
|---|---|---|---|---|
| FR-001 | US-001 | P0 | SPRINT-001 | Entry point for every pet owner; registers the first pet needed to book (BR-003) |
| FR-002 | US-002 | P0 | SPRINT-001 | Without providers there is nothing to find or book (P01-RISK-003) |
| FR-003 | US-003 | P0 | SPRINT-001 | Every other story needs a signed-in user of the right type (DEP-001) |
| FR-004 | US-003 | P0 | SPRINT-001 | Every other story needs a signed-in user of the right type (DEP-001) |
| FR-005 | US-001, US-004 | P0, P2 | SPRINT-001, Conditional (Group A) | Highest-priority story determines delivery |
| FR-006 | US-005 | P2 | Conditional (Group A) | List of pets; pet selection at booking is already covered by US-019 |
| FR-007 | US-006 | P3 | Conditional (Group B) | Supporting; pet data can be entered correctly at registration |
| FR-008 | US-007 | P3 | Conditional (Group B) | Supporting; includes automatic cancellation (AC-079), verifiable only after US-019 (DEP-012) |
| FR-009 | US-008 | P0 | SPRINT-001 | Owners need the provider's contact and address; clinic address rule added (AC-106): no estimate change |
| FR-010 | US-009 | P0 | SPRINT-001 | No working hours means no bookable slots (EDGE-014) |
| FR-011 | US-010 | P0 | SPRINT-001 | Services are what owners search and book (P01-MVP-003, Core) |
| FR-012 | US-011 | P2 | Conditional (Group A) | Keeps the catalog accurate (P01-NEED-007); not required for the first demonstration |
| FR-013 | US-012 | P3 | Conditional (Group B) | Supporting; includes automatic cancellation (AC-083), verifiable only after US-019 (DEP-012) |
| FR-014 | US-013 | P0 | SPRINT-001 | Products are part of the Core catalog and search, shown by committed criteria AC-039 and AC-044; prerequisite of ordering |
| FR-015 | US-014 | P3 | Conditional (Group B) | Supporting product maintenance |
| FR-016 | US-015 | P3 | Conditional (Group B) | Supporting product maintenance; existing orders keep their status (P02-ASM-012, confirmed) |
| FR-017 | US-016 | P0 | SPRINT-001 | "Find in one place" is the core value (P01-MVP-001, Core; P01-SUCCESS-007) |
| FR-018 | US-017 | P0 | SPRINT-001 | Part of P01-MVP-001 (Core); the adopted success criterion refers to the pet's species (P01-SUCCESS-007) |
| FR-019 | US-016 | P0 | SPRINT-001 | "Find in one place" is the core value (P01-MVP-001, Core; P01-SUCCESS-007) |
| FR-020 | US-018 | P0 | SPRINT-001 | Step of the core journey: owners see who offers the service and how to reach them (P01-JOURNEY-001) |
| FR-021 | US-019 | P0 | SPRINT-001 | Outcome of the core journey (P01-SUCCESS-007) |
| FR-022 | US-019, US-020 | P0, P0 | SPRINT-001, SPRINT-001 | Highest-priority story determines delivery |
| FR-023 | US-020 | P0 | SPRINT-001 | Home services are offered in the catalog; without the address they cannot be booked (P01-SUCCESS-004) |
| FR-024 | US-019 | P0 | SPRINT-001 | Outcome of the core journey (P01-SUCCESS-007) |
| FR-025 | US-019 | P0 | SPRINT-001 | Outcome of the core journey (P01-SUCCESS-007) |
| FR-026 | US-021 | P0 | SPRINT-001 | Owners must see their booked appointment; notifications are excluded (P01-OOS-004) |
| FR-027 | US-022 | P2 | Conditional (Group A) | High value (P01-SUCCESS-006); the core journey works without it |
| FR-028 | US-023 | P2 | Conditional (Group A) | High value (P01-SUCCESS-006); the core journey works without it |
| FR-029 | US-024 | P0 | SPRINT-001 | Without notifications, the provider's appointments space is the only way providers learn of bookings (P01-RISK-012) |
| FR-030 | US-025 | P2 | Conditional (Group A) | High value (P01-SUCCESS-006); the core journey works without it |
| FR-031 | US-026 | P2 | Conditional (Group A) | High value (P01-SUCCESS-006); the core journey works without it |
| FR-032 | US-027 | P1 | Conditional (ordering) | Ordering package (TD-16) |
| FR-033 | US-028 | P1 | Conditional (ordering) | Ordering package (TD-16); providers need to see what to deliver (DEP-015) |
| FR-034 | US-029 | P1 | Conditional (ordering) | Ordering package (TD-16); owners need to see their orders (DEP-015) |
| FR-035 | US-030 | P1 | Conditional (ordering) | Ordering package (TD-16); status flow Confirmed → Dispatched/In delivery → Closed (DEP-015) |
| FR-036 | US-031 | P1 | Conditional (ordering) | Ordering package (TD-16); owner cancels before dispatch (DEP-015) |
| FR-037 | US-032 | P1 | Conditional (ordering) | Ordering package (TD-16); provider cancels before dispatch (DEP-015) |
| FR-038 | US-033 | P1 | Conditional (ordering) | Ordering package, first if capacity remains (TD-16) |
| FR-039 | US-034 | P0 | SPRINT-001 | Sign-out in both interfaces (TD-03); committed by team decision (TD-16) |
| NFR-001 | US-001, US-002 | P0, P0 | SPRINT-001, SPRINT-001 | Highest-priority story determines delivery |
| NFR-002 | US-003, US-005, US-006, US-011, US-014, US-021, US-024, US-028, US-029, US-034 | P0, P2, P3, P2, P3, P0, P0, P1, P1, P0 | SPRINT-001, Conditional (Group A), Conditional (Group B), Conditional (Group A), Conditional (Group B), SPRINT-001, SPRINT-001, Conditional (ordering), Conditional (ordering), SPRINT-001 | Highest-priority story determines delivery |
| NFR-003 | All stories | Follows each story | Follows each story | Global constraint (P02 §5) |
| NFR-004 | All stories | Follows each story | Follows each story | Global constraint (P02 §5) |
| NFR-005 | All stories | Follows each story | Follows each story | Global constraint (P02 §5) |

## 10. Assumptions and Unknowns

| ID | Item | Classification | Impact on Plan | Action Needed |
|---|---|---|---|---|
| ASSUM-001 | SPRINT-001 corresponds to the three days the team gave to P06–P10. | CONFIRMED (team 2026-10-09; TD-18) | Defines the sprint length. | None. |
| ASSUM-002 | P04 and P05 are completed before SPRINT-001 and are not part of the three days. | CONFIRMED | If late, there is less implementation time. | Finish this cascade before the sprint. |
| ASSUM-003 | All five members work on SPRINT-001; hours per day are not recorded. | CONFIRMED / not recorded (TD-18) | Capacity cannot be computed. | None. |
| ASSUM-004 | Story points are preliminary relative estimates by the AI assistant, not converted to hours. | CONFIRMED | Estimates may still change after use. | Re-estimate after the first day if needed. |
| ASSUM-005 | Role labels describe responsibilities; skills beyond them are unknown. | CONFIRMED | Assignments rest on roles. | None. |
| ASSUM-006 | Product ordering remains MVP scope; it comes after the committed scope. | CONFIRMED (now P1 conditional, TD-16) | Ordering may be deferred if unfinished. | None. |
| ASSUM-007 | The two-week formal window and the one week for the MVP are not reconciled; the plan uses the three days. | CONFIRMED | The stricter limit applies. | None. |
| ASSUM-008 | The P02 assumptions hold for planning. | CONFIRMED | None. | None. |
| ASSUM-009 | The new and changed estimates (US-002 → 3, US-034 = 1, US-027 = 3, US-033 = 2) and the ordering-package assignments are the AI assistant's proposals. | APPROVED under TD-19 | Same as ASSUM-004. | Re-estimate if needed. |

## 11. Feasibility Assessment

**Result: CONDITIONALLY_FEASIBLE** (committed scope only).

**Evidence:**

- The committed scope is the smallest coherent set that delivers P01-SUCCESS-007: 15 stories, 44 points.
- Five members with complementary roles are available.
- The team explicitly accepted the time risk (A-P01Q-020).

**Limitations:**

- Three days must cover implementation, testing, CI/CD, documentation and evaluation.
- Hours per person are not recorded and velocity is unknown, so the points cannot be compared with capacity.
- The committed scope grew by 2 points (US-002 re-estimate, US-034).
- P04 and P05 must be finished before the sprint (DEP-016).

**Conditions for feasibility:**

1. P04 v2.0 and P05 v2.0 validated before the sprint (DEP-016).
2. The environment (Vercel, Neon, GitHub) is ready at the start (DEP-017).
3. No conditional work starts before the P0 stories are done.
4. Each story is verified as soon as it is finished (P03-RISK-006).

**The full MVP** (34 stories, 83 points) is **not** assessed as feasible in the sprint with the available evidence. It is not committed; unfinished work is deferred (TD-16).

## 12. Final Recommendation

**Commit** to the 15 P0 stories: the core journey plus sign-out (TD-16). They are the smallest set that demonstrates the adopted success criterion (P01-SUCCESS-007): an owner books a service for their pet without outside channels, and the provider sees the appointment.

**Trade-offs made:**

- **Conditional, first:** the ordering package (P1), now unblocked and designed (TD-16).
- **Conditional, later:** appointment cancel and reschedule, extra pets and service updates (P2); pet, catalog and product maintenance (P3). They add value but are not needed for the core value.
- **Deferred:** any conditional story not finished in the sprint (TD-16).
- **Quality kept:** no acceptance criterion was removed to fit more scope.

## 13. Status and Next Actions

**Status: READY.** Every planning decision is made (TD-16 to TD-18), every requirement question is resolved, and the assumptions are confirmed. The estimates remain relative and velocity is unknown, which is why feasibility stays conditional; that is a property of the plan, not an open decision.

**P04 can proceed:** design or update the screens of the 15 committed stories (adding sign-out, the clinic address, the same-species rule and the other v3.0 changes) and design the ordering package (US-033, US-027, US-029, US-028, US-030, US-031, US-032). Do not design Groups A and B (TD-16).

**Before implementation:**

- Finish P04 v2.0 and P05 v2.0 (DEP-016).
- Prepare the environment (DEP-017).
