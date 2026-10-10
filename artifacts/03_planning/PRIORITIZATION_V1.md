# Prioritization and Single-Sprint Plan

> **Classification legend:** **CONFIRMED** = stated by the team or validated upstream · **ASSUMPTION** · **PROPOSAL** = suggestion awaiting team approval · **UNKNOWN** · **REQUIRES DECISION** · **BLOCKED**.
> **Identifiers:** upstream IDs (EPIC, FR, NFR, US, AC, BR, EDGE, DEP-001 to DEP-010, P02-Q, P02-ASM, P01-*) are reused unchanged. New P03 IDs:
>
> - `DEP-011` and up continue the P02 dependency sequence.
> - `ASSUM-`, `PRIOR-` (planning decisions), `SPRINT-001` and `RELEASE-001`.
> - `P03-RISK-` is used instead of `RISK-`, because `RISK-001` to `RISK-011` already exist in P00.

## 1. Document Metadata

- **Version:** 1.0
- **Stage:** P03 — Planning
- **Status:** READY_WITH_ASSUMPTIONS
- **Project:** Veterinary Services Platform MVP (placeholder name)
- **Source artifacts:**
  - `REQUIREMENTS.md` v2.0 and `product_backlog.json` v2.0. Supplied as `REQUIREMENTS_V2.md` and `product_backlog_v2.json`; verified identical to the P02 v2.0 outputs.
  - `REQUIREMENTS_VALIDATION.md` v2.0.
  - `SYSTEM_PROMPT.md`.
- **Upstream validation statuses:**
  - P00 `CONTEXT_VALIDATION.md` v2.0: PASS_WITH_WARNINGS.
  - P01 `PRODUCT_VISION_VALIDATION.md` v4.0: PASS_WITH_WARNINGS.
  - P02 `REQUIREMENTS_VALIDATION.md` v2.0: PASS_WITH_WARNINGS (3 medium, 8 low).
- **Formal delivery window:** two weeks per the P03 prompt. The project input states one week for the MVP (P00 ANS-Q011). How the two relate is UNKNOWN (ASSUM-007).
- **Actual remaining time and capacity:**
  - The team stated three days for stages P06 to P10: implementation, testing, CI/CD, documentation and evaluation (A-P01Q-020), and accepted all risks.
  - UNKNOWN: start and end dates, hours per day, individual availability and team velocity.
- **Generation Date:** 2026-10-09

## 2. Executive Summary

**Strategy.** Deliver the core journey in one sprint (`SPRINT-001`) and nothing more by commitment: a pet owner goes from "my pet needs a service" to a scheduled appointment that the provider can see, without using outside channels (P01-SUCCESS-007).

**Committed scope:** 14 P0 stories (42 points), covering:

- accounts;
- provider profile, working hours, services and products;
- search with species filter and the provider profile;
- booking at the clinic or at home;
- the owner's and the provider's appointment views.

**Conditional scope** (enters the sprint only if capacity permits, in this order):

- **Group A:** 7 P1 stories, 14 points. Appointment cancel and reschedule, extra pets, service updates.
- **Group B:** 10 P2 stories, 20 points. Pet and catalog maintenance, product maintenance, order views, statuses and cancellation.

**Blocked:** 2 stories, US-027 (order a product) and US-033 (stock), until P02-Q-001 and P02-Q-017 are decided. Product ordering stays in MVP scope by team decision. It is placed last, as in the build-order PROPOSAL approved by AVISO-R1, and is **not** deferred: deferring it requires a team decision (PRIOR-002).

**Single sprint.** Exactly one sprint is planned. The work sequence in §6 is an order within `SPRINT-001`, not separate sprints.

**Feasibility: CONDITIONALLY_FEASIBLE** for the committed scope only. The full MVP (76 points plus the two blocked stories) is not committed. Three days must also cover testing, CI/CD, documentation and evaluation, and the dates, hours and velocity are unknown. Feasibility depends on the conditions in §11.

## 3. Planning Constraints

| Constraint | Value | Classification |
|---|---|---|
| Formal delivery window | Two weeks (P03 prompt) | CONFIRMED by the prompt; relation to the project's one week UNKNOWN (ASSUM-007) |
| Time to develop the MVP | One week (P00 ANS-Q011, repeated in later answers) | CONFIRMED |
| Time for P06–P10 | Three days; "it must be so and all risks are accepted" (A-P01Q-020) | CONFIRMED |
| Sprint dates | Not provided | UNKNOWN |
| Hours per day, individual availability | Not provided | UNKNOWN |
| Team velocity | No history | UNKNOWN |
| Team | 5 members: David (Backend / Database), Jhonier (Frontend), Casanova (Backend), Fonseca (DevOps), Sebas (Fullstack) | CONFIRMED roles (P00 [TEAM]); skills beyond roles UNKNOWN |
| Budget, infrastructure | None; no required technologies | CONFIRMED (P00 ANS-Q011, -Q012) |
| Prior stages | P04 (UX/UI) and P05 (Architecture) must be done before the sprint, outside the three days | ASSUMPTION (ASSUM-002) |

**Missing information affecting feasibility:** sprint dates, hours per day, availability of each member, and confirmation that P04 and P05 fit before the three days.

## 4. Product Priorities at a Glance

Priority describes value and delivery order; scope classification is inherited from P02. **Definition status** is the P02 status, preserved here because the JSON `status` field now holds the planning status.

| Priority | Item ID | Capability | Rationale | Source Requirement | Scope Classification | Definition status (P02) |
|---|---|---|---|---|---|---|
| P0 | US-002 | Sign up as a provider | Without providers there is nothing to find or book (P01-RISK-003). | FR-002, NFR-001 | MVP_SUPPORTING | DEFINED_WITH_ASSUMPTIONS |
| P0 | US-001 | Sign up as a pet owner with my first pet | Entry point for every pet owner; registers the first pet needed to book (BR-003). | FR-001, FR-005, NFR-001 | MVP_SUPPORTING | DEFINED_WITH_ASSUMPTIONS |
| P0 | US-003 | Sign in to my interface | Every other story needs a signed-in user of the right type (DEP-001). | FR-003, FR-004, NFR-002 | MVP_SUPPORTING | DEFINED_WITH_ASSUMPTIONS |
| P0 | US-008 | Maintain my public profile | Owners need the provider's contact and address to attend; shown in the core journey (P01-JOURNEY-001). | FR-009 | MVP_SUPPORTING | DEFINED |
| P0 | US-009 | Set my working days and hours | No working hours means no bookable slots (EDGE-014). Higher estimate: per-day hours, on-the-hour validation and automatic cancellation (AC-081). | FR-010 | MVP_SUPPORTING | DEFINED_WITH_ASSUMPTIONS |
| P0 | US-010 | Publish a service | Services are what owners search and book (P01-MVP-003, Core). | FR-011 | MVP_CORE | DEFINED_WITH_ASSUMPTIONS |
| P0 | US-013 | Publish a product | Products are part of the Core catalog and search (P01-MVP-001, -003), and committed criteria AC-039 (US-016) and AC-044 (US-018) show products; low effort; prerequisite of ordering. | FR-014 | MVP_CORE | DEFINED_WITH_ASSUMPTIONS |
| P0 | US-016 | Search services and products | "Find in one place" is the core value (P01-MVP-001, Core; P01-SUCCESS-007). | FR-017, FR-019 | MVP_CORE | DEFINED_WITH_ASSUMPTIONS |
| P0 | US-017 | Filter by species | Part of P01-MVP-001 (Core); the adopted success criterion refers to the pet's species (P01-SUCCESS-007). | FR-018 | MVP_CORE | DEFINED |
| P0 | US-018 | View a provider's profile | Step of the core journey: owners see who offers the service and how to reach them (P01-JOURNEY-001). | FR-020 | MVP_SUPPORTING | DEFINED |
| P0 | US-019 | Book an appointment for my pet | Outcome of the core journey (P01-SUCCESS-007). Largest estimate: slot calculation, clinic and independent-vet rules, concurrency (EDGE-007). Pending rule P02-Q-004 must be decided first (DEP-011). | FR-021, FR-022, FR-024, FR-025 | MVP_CORE | PENDING_DECISION |
| P0 | US-020 | Book a home visit | Home services are offered in the catalog; without the address they cannot be booked (P01-SUCCESS-004). | FR-022, FR-023 | MVP_CORE | DEFINED_WITH_ASSUMPTIONS |
| P0 | US-024 | See my scheduled appointments | Without notifications, the provider's appointments space is the only way providers learn of bookings (P01-RISK-012). | FR-029, NFR-002 | MVP_SUPPORTING | DEFINED_WITH_ASSUMPTIONS |
| P0 | US-021 | View my appointments | Owners must see their booked appointment; notifications are excluded (P01-OOS-004). | FR-026, NFR-002 | MVP_SUPPORTING | DEFINED |
| P1 | US-022 | Cancel my appointment | High value (P01-SUCCESS-006); the core journey works without it. | FR-027 | MVP_SUPPORTING | DEFINED |
| P1 | US-025 | Cancel an appointment as a provider | High value (P01-SUCCESS-006); the core journey works without it. | FR-030 | MVP_SUPPORTING | DEFINED |
| P1 | US-023 | Reschedule my appointment | High value (P01-SUCCESS-006); the core journey works without it. | FR-028 | MVP_SUPPORTING | DEFINED |
| P1 | US-026 | Reschedule an appointment as a provider | High value (P01-SUCCESS-006); the core journey works without it. | FR-031 | MVP_SUPPORTING | DEFINED |
| P1 | US-004 | Add a pet | Owners with more than one pet; the first pet is already registered at sign-up (US-001). | FR-005 | MVP_SUPPORTING | DEFINED |
| P1 | US-005 | View my pets | List of pets; pet selection at booking is already covered by US-019. | FR-006, NFR-002 | MVP_SUPPORTING | DEFINED |
| P1 | US-011 | Update a service | Keeps the catalog accurate (P01-NEED-007); not required for the first demonstration. | FR-012, NFR-002 | MVP_CORE | DEFINED |
| P2 | US-006 | Edit a pet | Supporting; pet data can be entered correctly at registration. | FR-007, NFR-002 | MVP_SUPPORTING | DEFINED |
| P2 | US-007 | Remove a pet | Supporting; includes automatic cancellation (AC-079), verifiable only after US-019 (DEP-012). | FR-008 | MVP_SUPPORTING | DEFINED |
| P2 | US-012 | Remove a service | Supporting; includes automatic cancellation (AC-083), verifiable only after US-019 (DEP-012). | FR-013 | MVP_CORE | DEFINED |
| P2 | US-014 | Update a product | Supporting product maintenance. | FR-015, NFR-002 | MVP_CORE | DEFINED |
| P2 | US-015 | Remove a product | Supporting product maintenance; existing-orders rule assumed (P02-ASM-012). | FR-016 | MVP_CORE | DEFINED_WITH_ASSUMPTIONS |
| BLOCKED | US-027 | Order a product to my address | Product ordering is MVP scope by team decision (A-P01Q-024), but order contents are undecided (P02-Q-001). Placed last per the approved build order (AVISO-R1). Provisional estimate 3–5 points. | FR-032 | MVP_SUPPORTING | PENDING_DECISION |
| BLOCKED | US-033 | Indicate whether a product is in stock | Stock representation undecided (P02-Q-017). Provisional estimate 2–3 points. | FR-038 | MVP_SUPPORTING | PENDING_DECISION |
| P2 | US-028 | See the product orders placed with me | Needed once ordering exists; depends on US-027 (DEP-015). | FR-033, NFR-002 | MVP_SUPPORTING | DEFINED |
| P2 | US-029 | See my orders | Depends on US-027 (DEP-015). | FR-034, NFR-002 | MVP_SUPPORTING | DEFINED |
| P2 | US-030 | Update the status of an order | Depends on US-027 (DEP-015). | FR-035 | MVP_SUPPORTING | DEFINED_WITH_ASSUMPTIONS |
| P2 | US-031 | Cancel my order | Depends on US-027; cancelled-order display assumed (P02-Q-018). | FR-036 | MVP_SUPPORTING | DEFINED_WITH_ASSUMPTIONS |
| P2 | US-032 | Cancel an order as a provider | Depends on US-027; cancelled-order display assumed (P02-Q-018). | FR-037 | MVP_SUPPORTING | DEFINED_WITH_ASSUMPTIONS |

## 5. MVP Scope

### 5.1 Committed for SPRINT-001

| Story ID | Capability | User Value | Priority | Estimate | Dependencies |
|---|---|---|---|---|---|
| US-002 | Sign up as a provider | I can publish my services and products to pet owners | P0 | 2 | — |
| US-001 | Sign up as a pet owner with my first pet | I can use the platform to find services and book appointments for my pet | P0 | 3 | — |
| US-003 | Sign in to my interface | I can use the interface that corresponds to that account type | P0 | 3 | — |
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

**Total committed: 14 stories, 42 points (preliminary relative estimate).**

### 5.2 Conditional on Capacity

| Story ID | Capability | Value | Condition for Inclusion |
|---|---|---|---|
| US-022 | Cancel my appointment | High value (P01-SUCCESS-006); the core journey works without it. | **Group A (P1, 2 pts):** all committed stories done and verified; enter in the §6 order. |
| US-025 | Cancel an appointment as a provider | High value (P01-SUCCESS-006); the core journey works without it. | **Group A (P1, 2 pts):** all committed stories done and verified; enter in the §6 order. |
| US-023 | Reschedule my appointment | High value (P01-SUCCESS-006); the core journey works without it. | **Group A (P1, 3 pts):** all committed stories done and verified; enter in the §6 order. |
| US-026 | Reschedule an appointment as a provider | High value (P01-SUCCESS-006); the core journey works without it. | **Group A (P1, 2 pts):** all committed stories done and verified; enter in the §6 order. |
| US-004 | Add a pet | Owners with more than one pet; the first pet is already registered at sign-up (US-001). | **Group A (P1, 2 pts):** all committed stories done and verified; enter in the §6 order. |
| US-005 | View my pets | List of pets; pet selection at booking is already covered by US-019. | **Group A (P1, 1 pts):** all committed stories done and verified; enter in the §6 order. |
| US-011 | Update a service | Keeps the catalog accurate (P01-NEED-007); not required for the first demonstration. | **Group A (P1, 2 pts):** all committed stories done and verified; enter in the §6 order. |
| US-006 | Edit a pet | Supporting; pet data can be entered correctly at registration. | **Group B (P2, 1 pts):** Group A done. |
| US-007 | Remove a pet | Supporting; includes automatic cancellation (AC-079), verifiable only after US-019 (DEP-012). | **Group B (P2, 3 pts):** Group A done. |
| US-012 | Remove a service | Supporting; includes automatic cancellation (AC-083), verifiable only after US-019 (DEP-012). | **Group B (P2, 3 pts):** Group A done. |
| US-014 | Update a product | Supporting product maintenance. | **Group B (P2, 1 pts):** Group A done. |
| US-015 | Remove a product | Supporting product maintenance; existing-orders rule assumed (P02-ASM-012). | **Group B (P2, 2 pts):** Group A done. |
| US-028 | See the product orders placed with me | Needed once ordering exists; depends on US-027 (DEP-015). | **Group B (P2, 2 pts):** Group A done. US-027 must be unblocked first. |
| US-029 | See my orders | Depends on US-027 (DEP-015). | **Group B (P2, 2 pts):** Group A done. US-027 must be unblocked first. |
| US-030 | Update the status of an order | Depends on US-027 (DEP-015). | **Group B (P2, 3 pts):** Group A done. US-027 must be unblocked first. |
| US-031 | Cancel my order | Depends on US-027; cancelled-order display assumed (P02-Q-018). | **Group B (P2, 2 pts):** Group A done. US-027 must be unblocked first. |
| US-032 | Cancel an order as a provider | Depends on US-027; cancelled-order display assumed (P02-Q-018). | **Group B (P2, 1 pts):** Group A done. US-027 must be unblocked first. |

Group A: 14 points. Group B: 20 points. If a conditional story is not finished, what happens to it is REQUIRES DECISION (PRIOR-002).

### 5.3 Deferred

| Story ID | Capability | Reason for Deferral | Future Consideration |
|---|---|---|---|
| — | None | No story is deferred by this plan. Every story is MVP scope by team decision (P01 v4.0; A-P01Q-024), and the team accepted the time risk (A-P01Q-020). Moving conditional or blocked stories to a future iteration is a team decision, not a planning default (PRIOR-002). | — |

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
| P02-Q-015 | Sign-out | Approved by AVISO-R1 (not included) |

### 5.5 Requires Decision

| Item ID | Decision Needed | Impact | Proposed Resolution |
|---|---|---|---|
| P02-Q-004 | Can a service for one species be booked for a pet of another species, or with no species? | US-019 (P0) booking validation; must be decided before US-019 is implemented (DEP-011). | PROPOSAL (from P02): only pets of the service's species can be chosen. |
| P02-Q-009 | Must a provider have an address to offer in-clinic services? | US-008, US-010 (P0) validation (DEP-011). | PROPOSAL (from P02): yes. |
| P02-Q-001 | Order contents and quantities. | US-027 is BLOCKED; US-028 to US-032 depend on it. | PROPOSAL (from P02): one product per order, quantity chosen by the owner. |
| P02-Q-017 | Stock representation. | US-033 is BLOCKED. | PROPOSAL (from P02): an in-stock / out-of-stock indicator. |
| P02-Q-018 | Cancelled orders shown as cancelled and frozen. | US-031, US-032 (conditional). | Confirm P02-ASM-011. |
| PRIOR-001 | Approve the committed scope (14 P0 stories) and the order of conditional work. | Defines what the sprint promises. | PROPOSAL: approve as in §5.1 and §6. |
| PRIOR-002 | What happens to conditional or blocked stories not completed in SPRINT-001: deferred to a future iteration, or the MVP is delivered incomplete? | MVP completeness; product ordering may not be delivered. | REQUIRES DECISION; no option chosen by this plan. |
| PRIOR-003 | Confirm the proposed assignments (§7). | Ownership of committed stories. | PROPOSAL in §7. |
| PRIOR-004 | Confirm sprint dates, hours per day and member availability. | Feasibility (§11). | Team provides the data. |

## 6. Single-Sprint Plan

**Sprint:** `SPRINT-001` · **Release:** `RELEASE-001` (the academic MVP delivery)

**Sprint objective:** a pet owner can sign up with a pet, find a service by text and species, see the provider, and book a one-hour appointment (at the clinic or at home) that both the owner and the provider can see, without using any outside channel (P01-SUCCESS-007).

**Dates:** UNKNOWN; not assigned. The team stated three days for P06–P10 (ASSUM-001).

**Selected stories:** US-002, US-001, US-003, US-008, US-009, US-010, US-013, US-016, US-017, US-018, US-019, US-020, US-024, US-021.

**Total estimate:** 42 points committed; 14 conditional (Group A); 20 conditional (Group B); 2 blocked stories with provisional estimates of 5–8 points. The total estimate does not guarantee completion: there is no velocity to compare it with.

**Work sequence within SPRINT-001.** These are steps inside the same sprint, not separate sprints.

| Step | Work | Stories / activities | Prerequisites |
|---|---|---|---|
| 0 | Prerequisites | Decide P02-Q-004 and P02-Q-009; confirm PRIOR-001, PRIOR-003, PRIOR-004; development and deployment environment ready (Fonseca). | P04 and P05 completed (DEP-016) |
| 1 | Foundations | US-002, US-001, US-003, US-008, US-009, US-010, US-013 | DEP-001; for US-009, the AC-081 check waits until step 2 (DEP-012) |
| 2 | Core journey | US-016, US-017, US-018, US-019, US-020 | Step 1; DEP-011, DEP-013 |
| 3 | Closing the loop | US-024, US-021 | US-019 (DEP-014) |
| 4 | Conditional Group A (if capacity) | US-022, US-025, US-023, US-026, US-004, US-005, US-011 | Steps 1–3 done and verified |
| 5 | Conditional Group B (if capacity) | US-006, US-007, US-012, US-014, US-015 | Group A done; US-007 and US-012 automatic-cancellation checks need US-019 (DEP-012) |
| 6 | Product ordering (if unblocked and capacity) | US-027, US-033, US-028, US-029, US-030, US-031, US-032 | P02-Q-001 and P02-Q-017 decided; US-013 done (DEP-015) |
| 7 | Integration, verification, delivery | Run every AC of the stories delivered; check NFR-001 to NFR-004 (Chrome on computer and phone; Spanish UI); deploy; prepare the demonstration; P07–P10 activities. | All delivered stories |

**Definition of Done for the current delivery:**

- Every acceptance criterion of each delivered story has been checked and passes.
- NFR-001 (hashed passwords), NFR-002 (users see only their own data), NFR-003 (Chrome on computers and phones) and NFR-004 (Spanish interface) hold for the delivered stories.
- The applicable business rules and edge cases listed in the story are respected.
- The work is integrated, deployed in an environment the team can demonstrate, and reviewed by at least one other team member.

**Conditions for a successful sprint:**

1. All 14 committed stories meet the Definition of Done.
2. P01-SUCCESS-007 can be demonstrated end to end, and the provider sees the resulting appointment (US-024).
3. The undelivered conditional or blocked stories, if any, are listed and handled according to PRIOR-002.

## 7. Team Responsibilities

All assignments are **PROPOSED** from the role labels in P00 [TEAM]. Availability and skills beyond the labels are UNKNOWN; the team must confirm (PRIOR-003).

| Work Item | Responsible Member(s) | Assignment Status | Rationale / Notes |
|---|---|---|---|
| US-002 Sign up as a provider | David, Sebas | PROPOSED | Backend + provider interface. Roles: David (Backend / Database), Sebas (Fullstack) |
| US-001 Sign up as a pet owner with my first pet | David, Jhonier | PROPOSED | Backend + pet owner interface. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-003 Sign in to my interface | David, Jhonier | PROPOSED | Backend + sign-in screen shared by both interfaces. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-008 Maintain my public profile | Casanova, Sebas | PROPOSED | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-009 Set my working days and hours | Casanova, Sebas | PROPOSED | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-010 Publish a service | Casanova, Sebas | PROPOSED | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-013 Publish a product | Casanova, Sebas | PROPOSED | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-016 Search services and products | David, Jhonier | PROPOSED | Backend + pet owner interface. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-017 Filter by species | David, Jhonier | PROPOSED | Backend + pet owner interface. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-018 View a provider's profile | David, Jhonier | PROPOSED | Backend + pet owner interface. Roles: David (Backend / Database), Jhonier (Frontend) |
| US-019 Book an appointment for my pet | Casanova, Jhonier | PROPOSED | Backend + pet owner interface. Roles: Casanova (Backend), Jhonier (Frontend) |
| US-020 Book a home visit | Casanova, Jhonier | PROPOSED | Backend + pet owner interface. Roles: Casanova (Backend), Jhonier (Frontend) |
| US-024 See my scheduled appointments | Casanova, Sebas | PROPOSED | Backend + provider interface. Roles: Casanova (Backend), Sebas (Fullstack) |
| US-021 View my appointments | Casanova, Jhonier | PROPOSED | Backend + pet owner interface. Roles: Casanova (Backend), Jhonier (Frontend) |
| Environment, CI/CD, deployment, integration support | Fonseca | PROPOSED | DevOps role; P08 activities happen inside the same three days |
| Verification of acceptance criteria (step 7) | All members | REQUIRES DECISION | Who tests which stories is not defined; P07 may refine it |
| Conditional and blocked stories | — | UNASSIGNED | Assigned when they enter the sprint |

**Proposed load (committed stories per member):** Casanova 8, David 6, Jhonier 8, Sebas 6. Jhonier carries most owner-facing work (P03-RISK-004); Sebas (Fullstack) is the proposed backup. Equal load is not a goal.

## 8. Dependencies, Risks and Decisions

Upstream dependencies DEP-001 to DEP-010 (P02) remain valid and are referenced by the stories. New P03 items:

| ID | Related Items | Dependency / Risk / Decision | Impact | Required Action | Status |
|---|---|---|---|---|---|
| DEP-011 | US-019, US-010, US-008; P02-Q-004, P02-Q-009 | Dependency (decision): booking and service-publishing validations depend on two open rules. | Core stories cannot be finished as specified without them. | Team decides before step 1 (Responsible: team). | OPEN |
| DEP-012 | US-009 (AC-081), US-007 (AC-079), US-012 (AC-083); US-019 | Dependency: automatic-cancellation criteria need existing appointments. | These criteria can only be verified after US-019. | Verify them in step 7, or after step 2. | PLANNED |
| DEP-013 | US-019, US-020; US-001, US-009, US-010 | Dependency: booking needs a pet, working hours and a published service. | Ordering of work. | Steps 1 → 2. | PLANNED |
| DEP-014 | US-021, US-024; US-019 | Dependency: appointment views need booking. | Ordering of work. | Step 2 → 3. | PLANNED |
| DEP-015 | US-028 to US-032; US-027, US-013 | Dependency: order views, status and cancellation need ordering; ordering needs products (US-013, committed). | Group B ordering stories cannot start while US-027 is blocked. | Decide P02-Q-001; then step 6. | OPEN |
| DEP-016 | All committed stories | Dependency: P04 (UX/UI) and P05 (Architecture) must be completed before the sprint. | If not, the three days shrink further. | Team schedules P04 and P05 before SPRINT-001. | OPEN |
| DEP-017 | Step 7 | Dependency: deployment environment. | No demonstration without it. | Fonseca prepares it in step 0. | PLANNED |
| P03-RISK-001 | SPRINT-001 | Risk: capacity. 42 committed points plus testing, CI/CD, documentation and evaluation in three days, with unknown hours and velocity. | High: the committed scope may not be completed. | Confirm PRIOR-004; keep the sprint to P0 until it is done; accepted by the team (A-P01Q-020). | OPEN (accepted by team) |
| P03-RISK-002 | US-019 | Risk: complexity. The largest story (8 points), on the critical path; concurrency for independent vets (EDGE-007). | High: delays block US-020, US-021, US-024. | Start it as early as possible in step 2; P03 may split it (P02 VAL-007). | OPEN |
| P03-RISK-003 | US-019, US-010 | Risk: open rules (DEP-011) not decided before the sprint. | Medium: rework or an incomplete validation. | Decide P02-Q-004 and -009 in step 0. | OPEN |
| P03-RISK-004 | Owner-facing stories | Risk: frontend bottleneck; one Frontend role plus one Fullstack. | Medium. | Sebas backs up Jhonier; confirm in PRIOR-003. | OPEN |
| P03-RISK-005 | US-027 to US-033 | Risk: product ordering not reached in the sprint. | Medium: an MVP capability chosen by the team may be missing at delivery. | Decide PRIOR-002 in advance. | OPEN |
| P03-RISK-006 | Step 7 | Risk: verification squeezed into the end of the three days. | Medium: quality and Definition of Done at risk. | Verify each story when it is finished, not only in step 7. | OPEN |
| P03-RISK-007 | All | Risk: upstream drift. P00 and P01 do not yet include the latest answers (P02 VAL-003). | Low for planning: P02 v2.0 is the requirements source. | Regenerate P01/P00 when possible. | OPEN |
| PRIOR-001 to PRIOR-004 | See §5.5 | Decisions on scope approval, the fate of unfinished conditional work, assignments and capacity data. | See §5.5. | Team decides. | REQUIRES DECISION |

## 9. Requirements-to-Priority Traceability

| Requirement ID | User Story ID | Priority | Sprint / Deferred | Decision Basis |
|---|---|---|---|---|
| FR-001 | US-001 | P0 | SPRINT-001 | Entry point for every pet owner; registers the first pet needed to book (BR-003) |
| FR-002 | US-002 | P0 | SPRINT-001 | Without providers there is nothing to find or book (P01-RISK-003) |
| FR-003 | US-003 | P0 | SPRINT-001 | Every other story needs a signed-in user of the right type (DEP-001) |
| FR-004 | US-003 | P0 | SPRINT-001 | Every other story needs a signed-in user of the right type (DEP-001) |
| FR-005 | US-001, US-004 | P0, P1 | SPRINT-001, Conditional (Group A) | Highest-priority story determines delivery |
| FR-006 | US-005 | P1 | Conditional (Group A) | List of pets; pet selection at booking is already covered by US-019 |
| FR-007 | US-006 | P2 | Conditional (Group B) | Supporting; pet data can be entered correctly at registration |
| FR-008 | US-007 | P2 | Conditional (Group B) | Supporting; includes automatic cancellation (AC-079), verifiable only after US-019 (DEP-012) |
| FR-009 | US-008 | P0 | SPRINT-001 | Owners need the provider's contact and address to attend; shown in the core journey (P01-JOURNEY-001) |
| FR-010 | US-009 | P0 | SPRINT-001 | No working hours means no bookable slots (EDGE-014) |
| FR-011 | US-010 | P0 | SPRINT-001 | Services are what owners search and book (P01-MVP-003, Core) |
| FR-012 | US-011 | P1 | Conditional (Group A) | Keeps the catalog accurate (P01-NEED-007); not required for the first demonstration |
| FR-013 | US-012 | P2 | Conditional (Group B) | Supporting; includes automatic cancellation (AC-083), verifiable only after US-019 (DEP-012) |
| FR-014 | US-013 | P0 | SPRINT-001 | Products are part of the Core catalog and search (P01-MVP-001, -003), and committed criteria AC-039 (US-016) and AC-044 (US-018) show products; low effort; prerequisite of ordering |
| FR-015 | US-014 | P2 | Conditional (Group B) | Supporting product maintenance |
| FR-016 | US-015 | P2 | Conditional (Group B) | Supporting product maintenance; existing-orders rule assumed (P02-ASM-012) |
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
| FR-027 | US-022 | P1 | Conditional (Group A) | High value (P01-SUCCESS-006); the core journey works without it |
| FR-028 | US-023 | P1 | Conditional (Group A) | High value (P01-SUCCESS-006); the core journey works without it |
| FR-029 | US-024 | P0 | SPRINT-001 | Without notifications, the provider's appointments space is the only way providers learn of bookings (P01-RISK-012) |
| FR-030 | US-025 | P1 | Conditional (Group A) | High value (P01-SUCCESS-006); the core journey works without it |
| FR-031 | US-026 | P1 | Conditional (Group A) | High value (P01-SUCCESS-006); the core journey works without it |
| FR-032 | US-027 | BLOCKED | Blocked (not in sprint) | Product ordering is MVP scope by team decision (A-P01Q-024), but order contents are undecided (P02-Q-001) |
| FR-033 | US-028 | P2 | Conditional (Group B) | Needed once ordering exists; depends on US-027 (DEP-015) |
| FR-034 | US-029 | P2 | Conditional (Group B) | Depends on US-027 (DEP-015) |
| FR-035 | US-030 | P2 | Conditional (Group B) | Depends on US-027 (DEP-015) |
| FR-036 | US-031 | P2 | Conditional (Group B) | Depends on US-027; cancelled-order display assumed (P02-Q-018) |
| FR-037 | US-032 | P2 | Conditional (Group B) | Depends on US-027; cancelled-order display assumed (P02-Q-018) |
| FR-038 | US-033 | BLOCKED | Blocked (not in sprint) | Stock representation undecided (P02-Q-017) |
| NFR-001 | US-001, US-002 | P0, P0 | SPRINT-001, SPRINT-001 | Highest-priority story determines delivery |
| NFR-002 | US-003, US-005, US-006, US-011, US-014, US-021, US-024, US-028, US-029 | P0, P1, P2, P1, P2, P0, P0, P2, P2 | SPRINT-001, Conditional (Group A), Conditional (Group B), Conditional (Group A), Conditional (Group B), SPRINT-001, SPRINT-001, Conditional (Group B), Conditional (Group B) | Highest-priority story determines delivery |
| NFR-003 | All stories | Follows each story | Follows each story | Global constraint (P02 §5) |
| NFR-004 | All stories | Follows each story | Follows each story | Global constraint (P02 §5) |

## 10. Assumptions and Unknowns

| ID | Item | Classification | Impact on Plan | Action Needed |
|---|---|---|---|---|
| ASSUM-001 | SPRINT-001 corresponds to the three days the team gave to P06–P10. | ASSUMPTION | Defines the sprint length. | Team confirms (PRIOR-004). |
| ASSUM-002 | P04 and P05 are completed before SPRINT-001 and are not part of the three days. | ASSUMPTION | If false, there is even less implementation time. | Team confirms (DEP-016). |
| ASSUM-003 | All five members work on SPRINT-001; hours per day are unknown. | ASSUMPTION / UNKNOWN | Capacity cannot be computed. | PRIOR-004. |
| ASSUM-004 | Story points are preliminary relative estimates by the AI assistant, not by the team, and are not converted to hours. | ASSUMPTION | Estimates may change after team review. | Team reviews the estimates. |
| ASSUM-005 | Role labels describe responsibilities; skills beyond them are unknown. | ASSUMPTION | Assignments are proposals only. | PRIOR-003. |
| ASSUM-006 | Product ordering remains MVP scope; placing it last follows the build-order PROPOSAL approved by AVISO-R1 and is not a deferral. | ASSUMPTION (interpretation of AVISO-R1) | Ordering stories are conditional or blocked, not deferred. | PRIOR-002. |
| ASSUM-007 | The P03 prompt's two-week formal window and the project's one week for the MVP are not reconciled. | UNKNOWN | The plan uses the stricter, explicitly stated three days for P06–P10. | Team clarifies. |
| ASSUM-008 | The open P02 assumptions (P02-ASM-001, -002, -004 to -016) hold for planning. | ASSUMPTION (carried) | Rework if any is rejected. | Team confirms them with the P02 questions. |

## 11. Feasibility Assessment

**Result: CONDITIONALLY_FEASIBLE** (committed scope only).

**Evidence:**

- The committed scope is the smallest coherent set that delivers P01-SUCCESS-007: 14 stories, 42 points.
- Five members with complementary roles are available.
- The team explicitly accepted the time risk (A-P01Q-020).

**Limitations:**

- Three days must cover implementation, testing, CI/CD, documentation and evaluation.
- Dates, hours per day, availability and velocity are unknown, so the points cannot be compared with capacity.
- Two rules affecting P0 stories are undecided (DEP-011).
- P04 and P05 must fit before the sprint (DEP-016).

**Conditions for feasibility:**

1. Sprint dates and availability confirmed (PRIOR-004).
2. P02-Q-004 and P02-Q-009 decided before step 1.
3. P04 and P05 completed before the sprint.
4. The environment is ready at the start (DEP-017).
5. No conditional work starts before the P0 stories are done.

**The full MVP** (33 stories, 76 points plus 2 blocked stories) is **not** assessed as feasible in the sprint with the available evidence. It is not committed.

## 12. Final Recommendation

**Commit** to the 14 P0 stories that form the core journey. They are the smallest set that demonstrates the adopted success criterion (P01-SUCCESS-007): an owner books a service for their pet without outside channels, and the provider sees the appointment.

**Trade-offs made:**

- **Moved to conditional:** appointment cancel and reschedule (P1), pet and catalog maintenance (P1/P2), and product maintenance and order handling (P2). Product publishing stays committed because the committed search and profile criteria show products. They add value but are not needed to demonstrate the core value.
- **Blocked:** ordering stays blocked until its open decisions are made.
- **Deferred:** nothing. Every story stays in MVP scope; deferral needs a team decision (PRIOR-002).
- **Quality kept:** no acceptance criterion was removed to fit more scope.

## 13. Status and Next Actions

**Status: READY_WITH_ASSUMPTIONS.** The plan is usable, but capacity, estimates, assignments and five decisions are provisional.

**P04 can proceed.** UX work should start with the screens of the 14 committed stories (pet owner interface: US-001, US-003, US-016 to US-021; provider interface: US-002, US-003, US-008 to US-010, US-013, US-024). P04 should not design conditional work beyond what the team expects to reach.

**Before implementation:**

- Decide P02-Q-004 and P02-Q-009.
- Confirm PRIOR-001, PRIOR-003 and PRIOR-004.
- Schedule P04 and P05.

**Before ordering enters the sprint:** decide P02-Q-001, P02-Q-017 and P02-Q-018.

**Team review and approval:**

- Committed scope.
- Estimates (ASSUM-004).
- Proposed assignments.
- The decision on unfinished conditional work (PRIOR-002).
