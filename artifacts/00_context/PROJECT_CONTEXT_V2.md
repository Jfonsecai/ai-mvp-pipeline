# Project Context

**Artifact Version:** 2.0
**Stage:** P00 — Context Definition
**Source Input:** `INITIAL_PROJECT_INPUT_V2.md`
**Previous Version:** `history/PROJECT_CONTEXT_v1.0.md` (generated from `INITIAL_PROJECT_INPUT.md`)
**Global Rules:** `prompts/system/SYSTEM_PROMPT.md`

---

## 1. Project Identification

| Field             | Value |
| ----------------- | ----- |
| Project Name      | UNKNOWN — no name provided by the team. Descriptive placeholder: *"Veterinary Services Platform MVP"* (not a team decision). |
| Short Description | FACT: A web application MVP that connects veterinary clinics and independent veterinarians with pet owners who need veterinary services. Providers offer and maintain their services; pet owners register their pets, consult providers and services according to their pet's species, and schedule appointments. Initial coverage: the city of Bogotá. Reference model: "similar to Rappi, but focused on veterinary services" — mainly conceptual. [IDEA][ANS-Q002][ANS-Q008][ANS-Q010] |
| Project Type      | FACT: Academic project; MVP. [ANS-Q007][ANS-Q011] ASSUMPTION: two-sided platform (providers ↔ pet owners), from "connect … with" [IDEA]. |
| Target Platform   | Web application — **Required** (firm requirement). [PLAT][ANS-Q016] |
| Project Status    | P00 — Context Definition, version 2.0. The team has answered 14 of the 17 open questions from v1.0. |

**Classification legend (SYSTEM_PROMPT §9):** **FACT** = stated by the team in the input · **ASSUMPTION** = inferred, not confirmed · **UNKNOWN** = not provided · **DECISION** = explicit team decision recorded in the answers.

**Source references:** [IDEA] Project Idea · [FEAT] Initial Features · [USERS] Initial Users · [PLAT] Platform · [TEAM] Team · [ANS-Q0nn] the team's answer to v1.0 open question Q-0nn in the "Questions" section of `INITIAL_PROJECT_INPUT_V2.md`. The answers are written in Spanish; translations in this document are faithful paraphrases, and short original phrases are quoted where interpretation matters.

---

## 2. Problem

### Problem Statement

FACT [ANS-Q001]: Pet owners in need of veterinary services have no single, centralized platform to find them. They have to search across several unrelated channels, and often cannot find reviews or ratings of veterinary clinics, so the search is neither efficient nor comfortable: they jump from platform to platform or trust places "blindly" because no accessible ratings exist.

ASSUMPTION (ASM-002): Veterinary clinics and independent veterinarians want an additional channel to offer their services. The team's answer describes the pet owner's experience only; the provider-side problem has not been described.

### Current Situation

FACT [ANS-Q001]: Pet owners currently find veterinary services through Instagram, Facebook, Google, Maps, word of mouth, or simply by exploring the surroundings of places familiar to them.

How providers currently acquire clients: UNKNOWN.

### Problem Impact

FACT [ANS-Q001]:

* The search experience is not optimal or comfortable.
* Pet owners have to move between several platforms.
* Pet owners may end up trusting providers "blindly" because ratings are not accessible.

Frequency and severity of these consequences: UNKNOWN. No quantitative data has been provided.

**Note — tension between problem and scope (CON-002):** one of the stated consequences is the lack of reviews/ratings, but ratings/reviews are not part of the MVP (see §5, OOS-004, ASM-009). This is reported, not resolved (Q-019).

---

## 3. Proposed Solution

### Solution Description

FACT [IDEA][ANS-Q*]: A web platform in which:

* Veterinary clinics and independent veterinarians create accounts, offer their services (at their clinic or as home services) and keep their own service catalog up to date. [IDEA][ANS-Q005][ANS-Q006][ANS-Q017]
* Pet owners create accounts, register their pets (species, weight, age, height, breed), consult the providers and services available, see the services that apply according to their pet's species, and schedule appointments. [IDEA][FEAT][ANS-Q005][ANS-Q008]
* Scheduling covers provider availability, confirmation, and rescheduling/cancellation, with no difference between in-clinic and home-visit appointments. [ANS-Q004] — interpretation of the answer is ASSUMPTION ASM-008.
* Coverage is limited to one city, Bogotá; the user's area is not determined by any method. [ANS-Q003][ANS-Q010] — **DECISION**.

FACT [ANS-Q002]: The "similar to Rappi" reference is "mainly conceptual" — the way services are found and searched for.

### Value Proposition

FACT [IDEA][ANS-Q001]: Centralize veterinary services in one platform so that pet owners can find and access the services their pets need without moving between multiple channels.

No quantitative benefits have been provided.

---

## 4. Target Users

All three user types come from [USERS] and each one has an account [ANS-Q005]. The input does not rank them; all three are listed as primary under ASSUMPTION ASM-007 (Q-013 unanswered).

### Primary Users

| ID       | User Type | Description | Needs |
| -------- | --------- | ----------- | ----- |
| USER-001 | Pet owner | FACT: Pet owners who need veterinary services [USERS], located in Bogotá for the MVP [ANS-Q010]. Account data: name, email, password [ANS-Q015]. Demographics and technical skills: UNKNOWN. | FACT [ANS-Q001][IDEA][FEAT]: find veterinary services in one place instead of across multiple channels; register their pets; see services applicable to their pet's species; schedule, reschedule or cancel appointments. |
| USER-002 | Veterinary clinic | FACT: Veterinary clinics that want to offer their services [USERS]. Account data: name, email, password [ANS-Q015]. No verification of credentials in the MVP [ANS-Q007]. Size and staff: UNKNOWN. | FACT [IDEA][ANS-Q006]: offer their services and keep their catalog up to date. Whether clinics also offer home services: ambiguous (Q-009). |
| USER-003 | Independent veterinarian | FACT: Independent veterinarians who want to offer their services at their clinic or through home visits [USERS]. Same account data and no verification [ANS-Q015][ANS-Q007]. | FACT [USERS][ANS-Q006]: offer in-clinic and/or home-visit services and keep their catalog up to date. |

### Secondary Users

None identified at this stage.

No administrator or operator role was mentioned by the team. The answer on catalog maintenance assigns it to each provider [ANS-Q006] and no verification is performed [ANS-Q007], so no admin role is evident; whether one is needed was not answered explicitly (ASM-010, Q-006 residual).

---

## 5. Initial Product Scope

The initial features "have not yet been fully specified" [FEAT]; v2.0 incorporates the team's answers, but the scope remains **provisional** until Discovery.

### MVP Features

| ID      | Feature | Description | Source |
| ------- | ------- | ----------- | ------ |
| MVP-001 | Pet registration | Pet owners register their pets with species, weight, age, height and breed. | [FEAT] + [ANS-Q008] |
| MVP-002 | Veterinary service catalog | Each provider maintains its own catalog of services in the platform and keeps it up to date. | [FEAT] + [ANS-Q006] |
| MVP-003 | Consultation of veterinary services and providers | Pet owners consult the providers and services available in Bogotá. Services shown depend on the species of the owner's pet. **Changed from v1.0:** no filtering by user area of any kind (team DECISION — CON-001: the original feature said "in the user's area"; the team's answer replaces it). How services are related to species: UNKNOWN (ASM-011). | [FEAT] + [IDEA] + [ANS-Q003] + [ANS-Q008] + [ANS-Q010] |
| MVP-004 | Appointment scheduling | Pet owners schedule appointments with providers. Includes provider availability, confirmation, and rescheduling/cancellation (ASM-008), with no difference between in-clinic and home-visit appointments. Who confirms, and rules for availability/cancellation: UNKNOWN (Q-020). | [FEAT] + [IDEA] + [ANS-Q004] |
| MVP-005 | Provider service offering (in-clinic / home service) | Clinics and independent veterinarians offer their services, indicating whether each is provided at their clinic or as a home service. **Confirmed by the team.** Overlaps with MVP-002 (the provider's catalog); the relationship is left for P01. | [IDEA] + [ANS-Q017] |
| MVP-006 | User accounts and authentication | Accounts with authentication for each role (pet owner, clinic, independent veterinarian). Account data: name, email and password; passwords must be stored hashed. **New in v2.0.** | [ANS-Q005] + [ANS-Q015] |

### Future Considerations

No future features have been defined by the team.

Note: the team said there will be no provider verification "for the moment" (*"por el momento"*) [ANS-Q007], which may indicate a later intention, but no future feature has been stated. It is recorded under Out of Scope only.

### Out of Scope

| ID      | Excluded Item | Reason |
| ------- | ------------- | ------ |
| OOS-001 | Verification of provider credentials | FACT [ANS-Q007]: academic project; no verification "for the moment". |
| OOS-002 | Determining the user's area (by city/zone selection, address, device location, distance or any other method) | FACT / DECISION [ANS-Q003]: the MVP covers a single city. |
| OOS-003 | Coverage of cities other than Bogotá | FACT [ANS-Q010]. |
| OOS-004 | Payments, ratings/reviews, real-time tracking, notifications | **PROVISIONAL — ASSUMPTION ASM-009.** The team said the Rappi similarity is "mainly conceptual" (search/discovery) [ANS-Q002] but did not list exclusions explicitly. Team confirmation required (Q-002 residual, Q-019). |
| OOS-005 | Differentiated scheduling rules for in-clinic vs. home-visit appointments | FACT [ANS-Q004]: "without taking into account differences between clinic and home care". |

---

## 6. User Value

### Functional Value

* Pet owners (USER-001) can create an account, register their pets, consult the veterinary providers and services available in Bogotá according to their pet's species, and schedule, reschedule or cancel appointments. [FEAT][ANS-Q004][ANS-Q005][ANS-Q008]
* Clinics (USER-002) and independent veterinarians (USER-003) can create an account, offer in-clinic or home services, keep their catalog up to date, and manage their availability and appointments. [IDEA][ANS-Q004][ANS-Q006]

### User Benefit

* Pet owners: find veterinary services in a single platform instead of searching across social networks, search engines, maps and word of mouth. [ANS-Q001]
* Providers: ASSUMPTION (ASM-002) — a channel to reach pet owners who are looking for veterinary services.

No business-impact claims are made.

---

## 7. Platform and Environment

### Target Platform

Web — **Required** (firm requirement). [PLAT][ANS-Q016]

### Expected Usage Environment

* Geographic scope: the city of Bogotá. FACT [ANS-Q010]
* Devices (desktop vs. mobile browser), connectivity conditions, and interface language(s): UNKNOWN.

### External Services

| ID      | Service | Purpose | Status |
| ------- | ------- | ------- | ------ |
| EXT-001 | None identified | No external services or integrations were mentioned. The location/mapping dependency identified in v1.0 no longer applies, because the user's area is not determined [ANS-Q003]. | None identified |

---

## 8. Team Context

### Team

| ID       | Role / Responsibility | Known Skills |
| -------- | --------------------- | ------------ |
| TEAM-001 | David — Backend / Database | UNKNOWN beyond stated role. |
| TEAM-002 | Jhonier — Frontend | UNKNOWN beyond stated role. |
| TEAM-003 | Casanova — Backend | UNKNOWN beyond stated role. |
| TEAM-004 | Fonseca — DevOps | UNKNOWN beyond stated role. |
| TEAM-005 | Sebas — Fullstack | UNKNOWN beyond stated role. |

Veterinary domain knowledge within the team: UNKNOWN.

### Development Constraints

| Constraint | Status |
| ---------- | ------ |
| Time / deadline | FACT [ANS-Q011]: **one week** to develop the MVP. Start/end dates and whether the week covers all pipeline stages (P01–P10) or only implementation: UNKNOWN (Q-021). |
| Team size | FACT [TEAM]: 5 members. |
| Academic requirements | FACT [ANS-Q011]: academic project; no institutional requirements. |
| Available infrastructure | FACT [ANS-Q012]: no existing infrastructure. |
| Budget | FACT [ANS-Q011]: no budget. |
| Required technologies | FACT [ANS-Q012]: none required or preferred. |
| Deployment restrictions | FACT [ANS-Q012]: no hosting constraints. |
| Security | FACT [ANS-Q015]: passwords must be stored hashed. |

**Potential contradiction (CON-003, P00 Step 4):** the MVP scope (six features, three authenticated roles, scheduling with availability, confirmation and rescheduling/cancellation) may be incompatible with a one-week development time, a team of five, and no budget. Reported, not resolved: no feature has been removed (RISK-008, Q-021).

---

## 9. Technical Context

### Known Technical Preferences

| Category | Technology | Status   | Source |
| -------- | ---------- | -------- | ------ |
| Platform | Web application | Required | Team [PLAT][ANS-Q016] |
| Security | Password hashing (algorithm not specified) | Required | Team [ANS-Q015] |
| Authentication | Accounts and authentication for each role (mechanism not specified) | Required | Team [ANS-Q005] |
| Frontend | — | Unknown (none required or preferred) | Team [ANS-Q012] |
| Backend  | — | Unknown (none required or preferred) | Team [ANS-Q012] |
| Database | — | Unknown (none required or preferred) | Team [ANS-Q012] |
| Hosting / DevOps | — | Unknown (no constraints, no existing infrastructure) | Team [ANS-Q012] |

No technology stack or architecture is defined; these belong to P05 — Architecture.

---

## 10. Assumptions

IDs from v1.0 are preserved. Assumptions resolved by the team's answers are kept for traceability with their new status.

| ID      | Assumption | Impact | Validation Needed |
| ------- | ---------- | ------ | ----------------- |
| ASM-001 | Pet owners have difficulty finding and accessing veterinary services because these are not centralized. | — | **RESOLVED — confirmed as FACT** by [ANS-Q001] (§2). |
| ASM-002 | Clinics and independent veterinarians want an additional channel to reach pet owners. | High — supply side depends on it. | **OPEN.** Not addressed by the answers. Confirm in P01. |
| ASM-003 | "In the user's area" implies filtering by location. | — | **RESOLVED — invalidated** by team DECISION [ANS-Q003]: no area determination. |
| ASM-004 | Data must be associated with specific owners and providers (mechanism undefined). | — | **RESOLVED — confirmed**: accounts with authentication per role [ANS-Q005] (MVP-006). |
| ASM-005 | Scheduling applies to both in-clinic and home-visit services. | — | **RESOLVED — confirmed** [ANS-Q004]: no difference between modalities. |
| ASM-006 | "Similar to Rappi" refers to the general concept, not specific Rappi features. | — | **RESOLVED — confirmed**: "mainly conceptual" [ANS-Q002]. Specific exclusions remain an assumption (ASM-009). |
| ASM-007 | All three user types are required for the MVP to deliver its value. | Medium — prioritization. | **OPEN.** Q-013 was not answered. |
| ASM-008 | The scheduling answer ("todo lo anterior…", *"all of the above…"*) means that the MVP includes provider availability, confirmation, and rescheduling/cancellation. **New in v2.0.** | High — largest effect on scope and on the one-week constraint. | Team confirmation (Q-020). |
| ASM-009 | Payments, ratings/reviews, real-time tracking and notifications are not part of the MVP, inferred from "mainly conceptual" [ANS-Q002]. **New in v2.0.** | High — defines the MVP upper boundary (OOS-004). | Team confirmation (Q-002 residual, Q-019). |
| ASM-010 | No administrator or operator role is needed in the MVP (providers maintain their catalogs; no verification). **New in v2.0.** | Medium — user roles. | Team confirmation (Q-006 residual). |
| ASM-011 | Showing services "depending on species" requires each service to indicate the species it applies to; the mechanism is undefined. **New in v2.0.** | Medium — affects MVP-002 and MVP-003. | Team decision in P01/P02 (Q-008 residual). |
| ASM-012 | All providers registered in the MVP operate in Bogotá and are visible to every pet owner. **New in v2.0.** | Medium — consultation results and home-visit coverage. | Team confirmation (Q-003 residual). |

---

## 11. Unknowns and Open Questions

IDs from v1.0 are preserved. Answered questions are kept with their resolution for traceability.

| ID    | Question | Affected Area | Priority |
| ----- | -------- | ------------- | -------- |
| Q-001 | Current problem and consequences. | Problem | **RESOLVED** [ANS-Q001] |
| Q-002 | Which Rappi aspects apply? *Residual:* are payments, ratings/reviews, real-time tracking and notifications explicitly excluded? Does "servicios y productos" (*services and products*) mean the platform also offers products? | Scope | **PARTIALLY RESOLVED** [ANS-Q002] — residual: High |
| Q-003 | How is the user's area determined? *Residual:* do home-service providers cover all of Bogotá? | Scope | **RESOLVED** (no area) [ANS-Q003] — residual: Medium |
| Q-004 | How does scheduling work? | Scope | **PARTIALLY RESOLVED** [ANS-Q004] — see Q-020 |
| Q-005 | Do users need accounts? | Security, scope | **RESOLVED** — yes [ANS-Q005] |
| Q-006 | Who maintains the catalog? *Residual:* is an administrator/operator role needed? | Users | **PARTIALLY RESOLVED** (each provider) [ANS-Q006] — residual: Medium |
| Q-007 | Must providers be verified? | Users, trust | **RESOLVED** — no [ANS-Q007] |
| Q-008 | What pet data is registered and what are "pet's needs"? *Residual:* how is a service related to the species it applies to? | Scope, data | **RESOLVED** [ANS-Q008] — residual: Medium |
| Q-009 | Do clinics also offer home services? Do independent veterinarians always have a clinic? | Users, scope | **OPEN — not answered** — Medium |
| Q-010 | Initial geographic market. | Scope | **RESOLVED** — Bogotá [ANS-Q010] |
| Q-011 | Timeline, budget, requirements. | Planning | **RESOLVED** — one week, no budget, no institutional requirements [ANS-Q011] — see Q-021 |
| Q-012 | Required technologies, hosting, infrastructure. | Architecture | **RESOLVED** — none [ANS-Q012] |
| Q-013 | Which user type is prioritized, and how will the first providers and pet owners be onboarded? | Users, adoption | **OPEN — not answered** — Medium |
| Q-014 | What outcome would the team consider evidence of MVP success? | Evaluation | **OPEN — not answered** — Medium |
| Q-015 | Personal data handled and privacy requirements. *Residual:* are there privacy or data-protection requirements beyond password hashing? | Security, data | **PARTIALLY RESOLVED** [ANS-Q015] — residual: Medium |
| Q-016 | Is web a firm requirement? | Platform | **RESOLVED** — firm requirement [ANS-Q016] |
| Q-017 | Confirm MVP-005. | Scope | **RESOLVED** — confirmed [ANS-Q017] |
| Q-018 | For home-visit appointments, how does the provider learn where to go, given that no owner address is collected [ANS-Q015]? (CON-004: home services are offered, but the stated personal data does not include a visit location.) **New.** | Scope, data, privacy | High |
| Q-019 | The stated problem includes the lack of reviews/ratings [ANS-Q001]. Is excluding ratings/reviews from the MVP intended, and does the MVP still address the "blind trust" consequence? **New.** | Problem, value, scope | High |
| Q-020 | Confirm ASM-008: does the MVP include availability management, confirmation, and rescheduling/cancellation? Who confirms an appointment (provider, automatic)? **New.** | Scope | High |
| Q-021 | Does the one-week timeline cover all pipeline stages or only implementation? What are the start and end dates? If not everything fits, which features have priority? **New.** | Planning, scope | High |
| Q-022 | Besides name, email and password, what provider information is shown to pet owners (e.g., clinic location, contact details), so that owners can attend in-clinic appointments? **New.** | Scope, data | Medium |

---

## 12. Initial Risks

IDs from v1.0 are preserved.

| ID       | Risk | Impact | Likelihood | Mitigation / Next Action |
| -------- | ---- | ------ | ---------- | ------------------------ |
| RISK-001 | Requirement uncertainty. **Reduced in v2.0**: most behaviors are now defined; scheduling rules and species mapping remain open. | Medium | Medium | Resolve Q-020 and Q-008 residual in P01/P02. |
| RISK-002 | Scope creep from the "similar to Rappi" reference. **Reduced**: similarity is conceptual. | Medium | Low | Confirm OOS-004 (Q-002 residual). |
| RISK-003 | Two-sided adoption: owners get value only if providers are registered. Onboarding strategy unknown. | Medium | UNKNOWN | Answer Q-013. For an academic demo, decide how providers will be present. |
| RISK-004 | Scheduling complexity: availability, confirmation, rescheduling and cancellation (ASM-008) may exceed the available time. **Increased.** | High | High | Confirm Q-020; prioritize in P01 (Q-021). |
| RISK-005 | External location-service dependency. | — | — | **CLOSED** — no area determination [ANS-Q003]. |
| RISK-006 | Security and privacy: three authenticated roles and personal data (name, email, password; pet data). Password hashing is required; other requirements unknown. | High | Medium | Answer Q-015 residual; treat security in P02/P05. |
| RISK-007 | Trust: providers are not verified. **Accepted by the team** for an academic project [ANS-Q007]. | Medium | — | Keep visible; no action required for the MVP. |
| RISK-008 | **Time feasibility:** six MVP features, three roles and full scheduling in one week with five people and no budget (CON-003). **Elevated.** | High | High | Answer Q-021; prioritize and possibly reduce MVP scope in P01 by team decision. |
| RISK-009 | Veterinary domain knowledge needed to relate services to species. | Medium | UNKNOWN | Identify domain sources for ASM-011. |
| RISK-010 | Problem/scope mismatch: the stated problem includes lack of ratings, but ratings are excluded (CON-002); the MVP may not address one of the stated consequences. **New.** | Medium | Medium | Answer Q-019. |
| RISK-011 | Home-visit appointments may be impossible to fulfill without a visit location (CON-004). **New.** | Medium | High | Answer Q-018. |

---

## 13. Initial Success Definition

Qualitative criteria derived from the MVP features. The team has not provided measurable targets (Q-014 unanswered).

* **SUCCESS-001:** A pet owner can register a pet with species, weight, age, height and breed (MVP-001).
* **SUCCESS-002:** A clinic or independent veterinarian can offer services, indicating in-clinic or home-service modality, and keep its catalog up to date (MVP-002, MVP-005).
* **SUCCESS-003:** A pet owner can consult providers and services in Bogotá and see the services that apply to their pet's species (MVP-003).
* **SUCCESS-004:** A pet owner can schedule an appointment with a provider, and the appointment can be confirmed, rescheduled or cancelled as defined in Q-020 (MVP-004).
* **SUCCESS-005:** Users of each role can create an account and sign in; passwords are stored hashed (MVP-006). **New in v2.0.**

---

## 14. Scope Summary

### Included in MVP

Provisional: MVP-001 Pet registration · MVP-002 Veterinary service catalog (maintained by each provider) · MVP-003 Consultation of services and providers (Bogotá, by pet species, no area filtering) · MVP-004 Appointment scheduling (availability, confirmation, rescheduling/cancellation — ASM-008) · MVP-005 Provider service offering (confirmed) · MVP-006 User accounts and authentication (new). Platform: web (required).

### Excluded from MVP

OOS-001 Provider verification · OOS-002 User area determination · OOS-003 Cities other than Bogotá · OOS-005 Differentiated clinic/home scheduling · OOS-004 Payments, ratings/reviews, real-time tracking, notifications (**provisional**, ASM-009). No future features defined.

### Pending Decisions

* Fit of the scope within one week and feature priority (Q-021, CON-003).
* Scheduling details and who confirms (Q-020).
* Explicit confirmation of OOS-004 and the meaning of "products" (Q-002 residual).
* Ratings/reviews vs. the stated problem (Q-019).
* Home-visit location (Q-018) and provider information shown to owners (Q-022).
* Service–species relationship (Q-008 residual).
* Clinic home services (Q-009), user prioritization and onboarding (Q-013), success evidence (Q-014), admin role (Q-006 residual), privacy requirements (Q-015 residual).

---

## 15. Context Status

**READY_WITH_ASSUMPTIONS**

Justification: the problem is now stated by the team, the three user types are identified, the solution and MVP features are traceable to the input, and the platform, market, and constraints are known. Product Discovery can start. Remaining assumptions (ASM-002, -007 to -012) and open questions (notably Q-018 to Q-021) are documented. The time-feasibility concern (CON-003) does not block Discovery, but it must be addressed by the team during P01 before P03 — Planning.

---

## Generation Metadata

Generated by:
P00 — Project Context Prompt

Prompt Version:
1.0

Artifact Version:
2.0

Generation Date:
2026-10-07

Status:
READY_WITH_ASSUMPTIONS

### Change Log (v1.0 → v2.0)

| Change | Source |
| ------ | ------ |
| Problem, current situation and impact now FACT (previously ASSUMPTION / UNKNOWN). | ANS-Q001 |
| Platform changed from Proposed to Required. | ANS-Q016 |
| MVP-003 no longer filters by user area; coverage limited to Bogotá; filtering by pet species. | ANS-Q003, ANS-Q008, ANS-Q010 |
| MVP-001 pet data defined; MVP-002 catalog maintained by each provider; MVP-004 scheduling scope defined; MVP-005 confirmed. | ANS-Q004, Q006, Q008, Q017 |
| MVP-006 User accounts and authentication added. | ANS-Q005, ANS-Q015 |
| Out of Scope defined (OOS-001 to OOS-005; OOS-004 provisional). | ANS-Q002, Q003, Q004, Q007, Q010 |
| Team constraints defined: one week, no budget, academic, no required technologies or infrastructure. | ANS-Q011, ANS-Q012 |
| ASM-001, -003, -004, -005, -006 resolved; ASM-008 to -012 added. | Answers |
| Q-001, -003, -005, -007, -008, -010, -011, -012, -016, -017 resolved; Q-002, -004, -006, -015 partially resolved; Q-018 to Q-022 added; Q-009, -013, -014 still open. | Answers |
| RISK-005 closed; RISK-004 and RISK-008 elevated; RISK-010, RISK-011 added. | Answers |
| Contradictions CON-002 to CON-004 reported (CON-001 = area decision, recorded as team DECISION). | Analysis |

**Downstream impact:** `artifacts/01_discovery/PRODUCT_VISION.md` v1.0 was generated from P00 v1.0 and is now outdated. P01 must be re-run against this version.
