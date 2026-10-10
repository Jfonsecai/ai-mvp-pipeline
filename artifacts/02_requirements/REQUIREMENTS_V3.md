# Requirements Specification

> **Classification legend:** **DIRECT** = stated in P01 or by a team answer · **REFINED** = made more concrete without adding scope · **ASSUMED** = interpretation labeled as an assumption · **REQUIRES_DECISION** = the team must decide · **PROPOSAL** = suggestion for the team, not a decision.
>
> **Source references:**
> - `P01-*` identifiers refer to `PRODUCT_VISION.md` v4.0. `A-P01Q-0nn` are team answers recorded in `PROJECT_CONTEXT_V4.md`. `P00 ANS-Q0nn` are answers recorded in `INITIAL_PROJECT_INPUT_V2.md`.
> - **`A-P02Q-0nn`** is the team's answer to `P02-Q-0nn` of Requirements v1.0; **`A-P02Q-P036`** and **`A-P02Q-P038`** answer the carried `P01-QUESTION-036` and `-038`. **`AVISO-R1`** is the team's notice at the end of those answers. All are recorded in `PRODUCT_VISION_V4.md`, section "Questions from Requirements Version 1.0". The answers are in Spanish; this document uses faithful paraphrases. These are reference conventions, not new identifiers.
> - P02 assumptions and questions use the prefixes `P02-ASM-` and `P02-Q-`, because `ASM-` and `Q-` are already used by P00.
> - **`TD-01` to `TD-20`** are the team decisions recorded in the cascade prompt of 2026-10-10 (§1, "Integration of the Team Decisions"). **TD-19** is the standing rule: new refinements generated in this cascade are approved unless the team objects. These are reference conventions, not new requirement IDs.
> - IDs from v1.0 and v2.0 are kept with their meaning. New items continue the sequences: FR-039, NFR-005, US-034, AC-102 to AC-114, BR-039, BR-040, EDGE-027 to EDGE-032. No new dependency ID is created, because P03 uses the next dependency numbers.

## 1. Document Metadata

- **Version:** 3.0
- **Stage:** P02 — Requirements Engineering
- **Status:** READY
- **Generated From:** `REQUIREMENTS_v2.md` (= REQUIREMENTS v2.0, verified by diff), `product_backlog_v2.json` (= P02 backlog v2.0, verified by diff), `PRODUCT_VISION_V4.md` (P01 v4.0 plus the appended answers to the Requirements v1.0 questions) and the team decisions TD-01 to TD-20 of 2026-10-10.
- **Validation Dependency:** `PRODUCT_VISION_VALIDATION.md` v4.0 (PASS_WITH_WARNINGS); `history/REQUIREMENTS_VALIDATION_v2.0.md` (PASS_WITH_WARNINGS), whose findings are addressed below.
- **Previous Versions:** `history/REQUIREMENTS_v2.0.md`, `history/product_backlog_v2.0.json`; v1.0 also in `history/`.
- **Generation Date:** 2026-10-10
- **Companion artifact:** `product_backlog.json` v3.0 (same IDs and content).

### Input Integrity Note

The team's answers were appended to the Product Vision rather than integrated into it, and P00 has still not been regenerated. This document integrates the answers directly and cites each one. Where an answer changes a P01 statement, the change is listed below (no silent resolution, SYSTEM_PROMPT §3). The appended answers have no P01 validation.

**Changes to P01 content made by the answers:**

- **Pet fields:** a pet now also has a **name** (A-P02Q-011), which was not in the P01 list (species, weight, age, height, breed). In v2.0 the mandatory fields were name, age and breed, so species was optional; **in v3.0 species is mandatory (TD-07)**.
- **Stock:** products now have **stock**. A-P02Q-003 says a product with no stock cannot be ordered; stock was not part of P01. In v3.0 it is an available / not available indicator (TD-13).
- **Order handling:** orders now have **statuses** and can be **cancelled** before dispatch (A-P02Q-003), which resolves P01-DECISION-015.

### Integration of the Team Decisions (v3.0)

The team answered every open question and confirmed every assumption in the cascade prompt of 2026-10-10. This version integrates those decisions directly; each change cites its decision. Decisions that only concern planning, UX or architecture are recorded here so later stages can trace them, but they change no requirement.

| Decision | Team decision (paraphrase) | Effect in v3.0 |
|---|---|---|
| TD-01 | All assumptions of UX_SPEC v1.0 and ARCHITECTURE v1.0 confirmed; structural and technical recommendations of ARCHITECTURE v1.0 approved; P04-PROP-001 to -008 approved. | No requirement change; recorded for P04/P05. |
| TD-02 | Product name: VetCare. | Name used in the document title context; no requirement change. |
| TD-03 | There will be a sign-out in both interfaces, in the menu, with no confirmation dialog, leading to the sign-in screen. Replaces the 'no sign-out' decision of AVISO-R1 (P02-Q-015). | New FR-039, US-034, BR-040, AC-112, AC-113, EDGE-031; sign-out removed from 'Not included'. |
| TD-04 | Password: minimum 8 characters, no other rules. | New BR-039, AC-102, AC-103, EDGE-028; FR-001, FR-002 updated. |
| TD-05 | Session: ends after 60 minutes idle or 12 hours after sign-in. | New NFR-005, AC-114, EDGE-032. |
| TD-06 | P02-Q-004: only pets of the same species as the service can be chosen. | BR-024 and EDGE-016 defined; FR-022 updated; AC-108, AC-109; P02-Q-004 resolved. |
| TD-07 | A pet's species is mandatory at registration; the option 'Sin especificar' is removed. | BR-037, FR-005 updated; AC-001, AC-003, AC-014, AC-015, AC-020 updated. |
| TD-08 | P02-Q-009: clinics must register an address at sign-up; they cannot remove it, only change it. | FR-002, FR-009, BR-026 updated; AC-104, AC-106; EDGE-017 defined, EDGE-027 new; P02-Q-009 resolved. |
| TD-09 | Independent veterinarians offer services only at the owner's home; their address is optional. | BR-007, FR-011, FR-019 updated; AC-105, AC-107; AC-024, AC-054 reworded. |
| TD-10 | Pet units: age in whole years (0 if under one year), weight in kg with one decimal, height in whole cm. | FR-005, BR-037 updated (P04-RD-003 resolved). |
| TD-11 | No personal-data regulation applies (P05-UNK-002); no backups and no real data in the demonstration (P05-RD-006). | §2.1 note; no requirement change. |
| TD-12 | P02-Q-001: one product per order, quantity 1 to 99; the total (price × quantity) is shown and payment happens outside the app; delivery address entered with each order; tabs 'Mis pedidos' and 'Pedidos'. | BR-020, BR-022 defined; FR-032 to FR-034 updated; AC-069, AC-072, AC-090 updated; AC-110; EDGE-029; P01-ASSUMPTION-026 confirmed; P02-Q-001 resolved. |
| TD-13 | P02-Q-017: stock is an available / not available indicator set by the provider; every new product is published as available. | BR-031 defined; FR-038 updated; AC-111; P02-Q-017 resolved. |
| TD-14 | Technology stack, hosting, account management and source repository decided by the team. | No requirement change; recorded in ARCHITECTURE v2.0 (P05), where technology belongs. |
| TD-15 | Contracts CTR-001 to CTR-007 are written in API_SPEC.yaml (P05); CTR-008 is written at the start of the sprint. | No requirement change; recorded for P05. |
| TD-16 | Sprint scope: the 14 P0 stories plus the new sign-out story are committed; the ordering stories US-027 to US-033 come first if time remains, and their screens are designed in P04; the rest of Groups A and B stay conditional without UX; unfinished work is deferred to a future iteration. | Planning decision for P03; no requirement change. |
| TD-17 | PRIOR-003: the assignments proposed by P03 are approved, including those of new stories. | Planning decision for P03. |
| TD-18 | PRIOR-004: the sprint is the 3 confirmed days (ASSUM-001); exact dates and hours per person are not recorded. | P01-QUESTION-032 resolved. |
| TD-19 | Standing rule: every new assumption or proposal generated by any stage of this cascade is approved unless the team says otherwise; no new questions. | New refinements in v3.0 are recorded as CONFIRMED (standing rule). |
| TD-20 | P05 must also produce API_SPEC.yaml and DATA_MODEL.md. | Recorded for P05. |

**Changes to earlier decisions (no silent resolution):**

- **Sign-out:** v2.0 excluded sign-out (AVISO-R1 approved the assumed answer to P02-Q-015). TD-03 reverses this: sign-out is now included (FR-039, US-034).
- **Pet species:** v2.0 made species optional (A-P02Q-011). TD-07 makes it mandatory.
- **Provider address:** v2.0 made the address optional for every provider (A-P01Q-030). TD-08 makes it mandatory for clinics; it stays optional for independent veterinarians.
- **Independent veterinarians:** v2.0 allowed any provider to offer services at its clinic (BR-007). TD-09 limits independent veterinarians to home services.
- **Assumptions:** all P02 assumptions (P02-ASM-001, -002, -004 to -016) are now CONFIRMED by the team (ASSUM-008, confirmed 2026-10-09), so no story depends on an unconfirmed assumption.

### Integration of the Team's Answers (v2.0, kept for traceability)

| Answer | Question | Team decision (paraphrase) | Effect in v2.0 |
|---|---|---|---|
| A-P02Q-002 | P02-Q-002 Prices shown? | Yes. | Prices on services and products (FR-011, FR-014, FR-019, FR-020; BR-027). |
| A-P02Q-003 | P02-Q-003 Order cancellation, status, owner view, removed product | Both owner and provider can cancel an order as long as it has not been dispatched. Three statuses: Confirmed (when placed); Dispatched or in delivery (prepared, the courier is on the way to the owner's address); Closed (delivered). All user types can see their orders. Only the veterinarian or clinic changes the status, forward only, one step at a time. A removed or out-of-stock product cannot be ordered. | New FR-034 to FR-038, US-029 to US-033; BR-023, BR-029 to BR-031; stock introduced (P02-Q-017). |
| A-P02Q-005 | P02-Q-005 Independent vet: one appointment per slot? | Yes. | FR-025, BR-013 confirmed. |
| A-P02Q-006 | P02-Q-006 Species values | Predefined. For this MVP, only dog and cat. | BR-032; FR-005, FR-011, FR-014, FR-018. |
| A-P02Q-007 | P02-Q-007 Working-hour format | Hours can differ by day and must start and end on the hour. | FR-010; BR-033. |
| A-P02Q-008 | P02-Q-008 Upcoming appointments when a pet or service is removed or hours change | "Se cancela" (they are cancelled). | FR-008, FR-010, FR-013; BR-034; EDGE-011 to -013 defined. |
| A-P02Q-010 | P02-Q-010 Provider contact | Only phone and email. | FR-009, FR-020; BR-038. |
| A-P02Q-011 | P02-Q-011 Mandatory pet fields | Name, age and breed. | FR-005; BR-037. Adds the pet's **name**, not in the earlier field list. |
| A-P02Q-012 | P02-Q-012 Same email for owner and provider accounts? | Yes. | BR-036; FR-003 (type chosen at sign-in). |
| A-P02Q-013 | P02-Q-013 Text search? | Yes, search matches text and also allows the species filter. | FR-017, FR-018. |
| A-P02Q-014 | P02-Q-014 Language, browsers, devices | Spanish. Compatibility with Google Chrome is enough. Available on computers and mobile phones. | NFR-003 updated; NFR-004 new. |
| A-P02Q-016 | P02-Q-016 Cancelled appointments shown? | Yes, shown as cancelled. | FR-026, FR-029; BR-035. |
| A-P02Q-P036 | P01-QUESTION-036 Delivery outside the platform? | Yes. | BR-028 confirmed. |
| A-P02Q-P038 | P01-QUESTION-038 Remove all pets? | Yes, but a service cannot be booked without at least one pet. | FR-008, BR-004 confirmed. |
| AVISO-R1 | Notice | "If a question was not answered, the assumed answer is approved." | Approves: P01-ASSUMPTION-019 (P01-QUESTION-029), P01-ASSUMPTION-023 (P01-QUESTION-039), no sign-out in the MVP (P02-Q-015), and the P01 build-order PROPOSAL (P01-QUESTION-032, for P03). Questions with no assumed answer stay open: P02-Q-001, P02-Q-004, P02-Q-009. |

In v2.0, AVISO-R1 left P02-Q-001, P02-Q-004 and P02-Q-009 open. They are resolved in v3.0 by TD-12, TD-06 and TD-08/TD-09.

### P02 v2.0 Validation Findings Addressed

| v1.0 finding | Treatment in v2.0 |
|---|---|
| v2.0 open decisions (P02-Q-001, -004, -009, -017, -018) affecting US-008, US-010, US-019, US-027, US-031 to US-033 | All resolved (TD-06, TD-08, TD-09, TD-12, TD-13; P02-ASM-011 confirmed). BR-022, BR-024, BR-031 and EDGE-016, EDGE-017 defined. |
| v2.0 new assumptions to confirm (P02-ASM-011 to -016) | Confirmed (ASSUM-008). |
| Stock wording presumed an indicator (US-033) | Now matches the decision (TD-13). |
| US-019 broad (8 points) | Unchanged in P02; splitting is a P03 decision. |
| P00 not regenerated (P01-QUESTION-033) | Still open; it does not affect requirements. |

## 2. Requirements Overview

### 2.1 Scope Summary

The requirements cover the MVP defined in P01 v4.0, as refined by the team's answers and decisions:

- Accounts for pet owners and providers; the same email can hold both, and the type is chosen at sign-in; passwords of at least 8 characters; sign-out; sessions that expire.
- Pet management: dog or cat; name, species, age and breed mandatory.
- Provider profile with phone and email, an address that is mandatory for clinics, and per-day working hours on the hour.
- Provider catalog of services and products with prices; independent veterinarians offer services only at home.
- Text search with a species filter.
- One-hour appointment scheduling, for pets of the service's species only.
- Appointment management by both parties, with automatic cancellations; cancelled appointments stay visible.
- Product ordering without payment: one product per order in a quantity of 1 to 99, three statuses, cancellation before dispatch, and an available / not available indicator.

**Platform:** web, Google Chrome, computers and phones. **Interface language:** Spanish.

**Not included (P01 Out of Scope, confirmed):**

- Provider verification.
- Area determination; cities other than Bogotá.
- Payments, notifications and real-time tracking.
- Different clinic/home scheduling rules.
- Ratings and reviews.
- Appointment confirmation.
- Administrator role.
- Clinic staff or capacity management.
- Product requests or reservations.

**No basis for:** performance or availability targets. **Personal data:** no regulation applies (TD-11); no backups and no real data in the demonstration (TD-11). Beyond password hashing (A-P01Q-015) and session expiry (TD-05), no privacy requirement is added.

### 2.2 Requirement Status

| Item | v3.0 | v2.0 | Notes |
|---|---|---|---|
| Epics | 8 | 8 | |
| Functional requirements | 39 | 38 | DIRECT: 27, DIRECT / CONFIRMED_ASSUMPTION: 11, REFINED: 1 |
| Non-functional requirements | 5 | 4 | |
| User stories | 34 | 33 | DEFINED: 34 |
| Acceptance criteria | 114 | 101 | All earlier AC IDs kept in their stories |
| Business rules | 40 | 38 | 0 REQUIRES_DECISION |
| Edge cases | 32 | 26 | 0 REQUIRES_DECISION |
| Dependencies | 10 | 10 | |
| Assumptions (open) | 1 | 17 | 22 resolved, confirmed or approved |
| Open questions | 1 | 7 | 23 resolved |

**Story status values:**

- `DEFINED`: no assumption.
- `DEFINED_WITH_ASSUMPTIONS`: depends on a labeled assumption. (Not used in v3.0: every assumption is confirmed.)
- `PENDING_DECISION`: part of its behavior is REQUIRES_DECISION. (Not used in v3.0: every decision is made.)

### 2.3 Requirement Classification

| Scope | Functional requirements | Epics |
|---|---|---|
| MVP_CORE | 14 | EPIC-004, EPIC-005, EPIC-006 |
| MVP_SUPPORTING | 25 | EPIC-001, EPIC-002, EPIC-003, EPIC-007, EPIC-008 |
| FUTURE | 0 | — |
| OUT_OF_SCOPE | 0 | — |
| REQUIRES_DECISION | 0 | — |

FR-020 belongs to EPIC-005 (Core) but is classified MVP_SUPPORTING, following P01-MVP-008. FR-039 (sign-out) belongs to EPIC-001 (MVP_SUPPORTING). No requirement is REQUIRES_DECISION in v3.0.

## 3. Epics

| Epic ID | Name | Description | Product Objective | Scope |
|---|---|---|---|---|
| EPIC-001 | Accounts and Access | Self-registration as a pet owner or as a provider, sign-in choosing the account type, access to the interface of that type, and sign-out. | Separate the two sides of the platform and link pets, catalogs, appointments and orders to their users. | MVP_SUPPORTING |
| EPIC-002 | Pet Management | Registration and maintenance of the pet owner's pets. | Let appointments be booked for a specific pet. | MVP_SUPPORTING |
| EPIC-003 | Provider Profile and Working Hours | The provider's public profile and the days and hours in which it accepts appointments. | Let owners identify and reach a provider, and define when it can be booked. | MVP_SUPPORTING |
| EPIC-004 | Provider Catalog | Publication and maintenance of the provider's services and products, with prices. | Provide the offerings that owners can find, book and order. | MVP_CORE |
| EPIC-005 | Search and Discovery | Text search of services and products across all providers in Bogotá, species filter, and provider profiles. | Let owners find veterinary services in one place without using other channels. | MVP_CORE |
| EPIC-006 | Appointment Scheduling | Booking of one-hour appointments for a pet within the provider's working hours, at the clinic or at home. | Let owners access the service they found: the outcome of the core journey. | MVP_CORE |
| EPIC-007 | Appointment Management | Viewing, cancelling and rescheduling appointments, by the owner and by the provider; automatic cancellations. | Keep both parties' schedules accurate. | MVP_SUPPORTING |
| EPIC-008 | Product Ordering | Direct ordering of one product per order, in a chosen quantity, to the owner's address without payment; order statuses, order cancellation and a product stock indicator. | Let owners obtain products from the platform (team decision; not required for the core value). | MVP_SUPPORTING |

**Related Product Vision elements:**

- **EPIC-001:** P01-MVP-006, P01-NEED-009, A-P01Q-005, A-P01Q-012, A-P02Q-012, TD-03
- **EPIC-002:** P01-MVP-005, P01-NEED-002, A-P01Q-010, A-P01Q-031, A-P02Q-011
- **EPIC-003:** P01-MVP-008, P01-MVP-010, P01-NEED-010, P01-NEED-012, A-P01Q-021, A-P01Q-025, A-P01Q-030, A-P02Q-007, A-P02Q-010
- **EPIC-004:** P01-MVP-003, P01-NEED-006, P01-NEED-007, A-P01Q-002, A-P01Q-008, A-P01Q-009, A-P01Q-023, A-P01Q-028, A-P02Q-002, A-P02Q-006
- **EPIC-005:** P01-MVP-001, P01-NEED-001, P01-NEED-003, P01-NEED-010, A-P01Q-003, A-P01Q-011, A-P01Q-021, A-P01Q-022, A-P02Q-013
- **EPIC-006:** P01-MVP-002, P01-NEED-004, P01-SUCCESS-007, A-P01Q-017, A-P01Q-019, A-P01Q-022, A-P01Q-025, A-P01Q-031, A-P02Q-005
- **EPIC-007:** P01-MVP-007, P01-NEED-004, P01-NEED-008, A-P01Q-019, A-P01Q-026, A-P02Q-008, A-P02Q-016
- **EPIC-008:** P01-MVP-009, P01-NEED-011, P01-NEED-012, A-P01Q-024, A-P02Q-003, A-P02Q-P036, TD-12, TD-13

## 4. Functional Requirements

Priority is not assigned in P02 (P03 — Planning). The **Traceability** column starts with the basis classification. `CONFIRMED_ASSUMPTION` marks a part that was an assumption in v2.0 and is now confirmed by the team.

| ID | Requirement | Epic | Scope | Priority Status | Traceability |
|---|---|---|---|---|---|
| FR-001 | **Pet owner sign-up.** The platform shall allow a person to create a pet owner account by providing a name, an email and a password of at least 8 characters, and by registering at least one pet during sign-up. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-006, P01-MVP-005; P00 ANS-Q015; A-P01Q-010, -012; A-P02Q-012; password length: TD-04 |
| FR-002 | **Provider sign-up.** The platform shall allow a person to create a provider account by providing a name, an email, a password of at least 8 characters, and whether the provider is a veterinary clinic or an independent veterinarian. A clinic shall also provide its address. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-006; A-P01Q-005, -011, -012; provider type as an account attribute: P01-ASSUMPTION-019 (approved, AVISO-R1); password length: TD-04; clinic address: TD-08 |
| FR-003 | **Sign-in.** The platform shall allow a registered user to sign in with their email and password, choosing whether to enter as a pet owner or as a provider. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — A-P01Q-012 ("entrar como un tipo u otro"); A-P02Q-012; email and password as credentials: P02-ASM-001 |
| FR-004 | **Interface by account type.** After signing in, the platform shall give each user access only to the interface of the account type they entered as (pet owner or provider). | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — A-P01Q-012 |
| FR-005 | **Pet registration.** The platform shall allow a pet owner to register a pet with its name, species (dog or cat), age in whole years (0 if under one year), breed, and optionally its weight in kg with one decimal and its height in whole cm. Name, species, age and breed are mandatory. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-005; P00 ANS-Q008; A-P02Q-006, -011; species mandatory: TD-07; units: TD-10 |
| FR-006 | **View pets.** The platform shall allow a pet owner to view the list of their registered pets. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | REFINED — P01-MVP-005 (needed to edit, remove and select pets) |
| FR-007 | **Edit pet.** The platform shall allow a pet owner to edit the data of one of their pets. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-005; A-P01Q-031 |
| FR-008 | **Remove pet.** The platform shall allow a pet owner to remove one of their pets, including their last remaining pet. Upcoming appointments for a removed pet are cancelled. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — A-P01Q-031; A-P02Q-008, -P038 |
| FR-009 | **Provider public profile.** The platform shall allow a provider to maintain a public profile containing its name, a contact phone number and email, and an address. The address is mandatory for a clinic, which can change it but not remove it, and optional for an independent veterinarian. | EPIC-003 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-008; A-P01Q-021, -030; A-P02Q-010; address rule: TD-08, TD-09 |
| FR-010 | **Working days and hours.** The platform shall allow a provider to define, for each day of the week, whether it works and its working hours, which must start and end on the hour. If a change leaves upcoming appointments outside the working hours, those appointments are cancelled. | EPIC-003 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — P01-MVP-010; A-P01Q-025; A-P02Q-007, -008; weekly pattern: P02-ASM-010 |
| FR-011 | **Publish service.** The platform shall allow a provider to publish a service, indicating its name, its price, the single species it applies to (dog or cat), and where it is offered. A clinic offers it at its clinic, at the owner's home, or both; an independent veterinarian offers it only at the owner's home. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — P01-MVP-003; A-P01Q-008, -009; A-P02Q-002, -006; name: P02-ASM-004; price mandatory: P02-ASM-014; independent vets home only: TD-09 |
| FR-012 | **Update service.** The platform shall allow a provider to update the details of one of its services. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007; A-P01Q-023 |
| FR-013 | **Remove service.** The platform shall allow a provider to remove one of its services from its catalog. Upcoming appointments for a removed service are cancelled. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007; A-P02Q-008 |
| FR-014 | **Publish product.** The platform shall allow a provider to publish a product, indicating its name, its price and the single species it applies to (dog or cat). | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — P01-MVP-003; A-P01Q-002, -028; A-P02Q-002, -006; name: P02-ASM-004; price mandatory: P02-ASM-014 |
| FR-015 | **Update product.** The platform shall allow a provider to update the details of one of its products. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007 |
| FR-016 | **Remove product.** The platform shall allow a provider to remove one of its products from its catalog; a removed product can no longer be ordered. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — P01-MVP-003; A-P02Q-003; existing orders unaffected: P02-ASM-012 |
| FR-017 | **Search offerings.** The platform shall allow a pet owner to search by text the services and products published by all providers, with no filtering by the owner's location. | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — P01-MVP-001; A-P01Q-003, -022; A-P02Q-013; P01-OOS-002; matched fields: P02-ASM-013 |
| FR-018 | **Species filter.** The platform shall allow a pet owner to filter search results by the species the service or product applies to (dog or cat), independently of the pets registered in their account. | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-001; A-P01Q-022; A-P02Q-006, -013 |
| FR-019 | **Result details.** Each search result shall show its price, whether it is offered by a veterinary clinic or by an independent veterinarian and, for services, whether it is offered at the clinic, at home, or both (independent veterinarians: at home only). | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT — P01-NEED-003; A-P01Q-009, -011; A-P02Q-002; TD-09 |
| FR-020 | **View provider profile.** The platform shall allow a pet owner to view a provider's public profile, showing its name, address (if provided), phone, email, provider type, and the services and products it offers with their prices. | EPIC-005 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-008 (Supporting); P01-NEED-010; A-P01Q-011, -021, -030; A-P02Q-002, -010 |
| FR-021 | **Show available slots.** For a selected service, the platform shall show the pet owner the available one-hour appointment slots within the provider's working days and hours. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-002; A-P01Q-021, -025 |
| FR-022 | **Book appointment.** The platform shall allow a pet owner with at least one registered pet to book an appointment for a selected service by choosing one of their pets of the service's species and an available one-hour slot. The appointment is scheduled immediately, with no confirmation by the provider. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-002; A-P01Q-019, -022, -025, -031; same species only: TD-06 |
| FR-023 | **Home-visit address.** When the booked service is to be performed at the owner's home, the platform shall require the pet owner to enter the address of the visit when booking. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — A-P01Q-017; modality choice for services offered both ways: P02-ASM-005 |
| FR-024 | **Clinic availability.** For a veterinary clinic, every one-hour slot within its working days and hours shall remain available regardless of how many appointments are already booked in it. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — A-P01Q-025; P01-OOS-009 |
| FR-025 | **Independent veterinarian availability.** For an independent veterinarian, a one-hour slot shall become unavailable once an appointment is booked in it. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — A-P01Q-019; A-P02Q-005 |
| FR-026 | **Owner views appointments.** The platform shall allow a pet owner to view their appointments with their current details and status, including changes made by the provider and cancelled appointments, which are shown as cancelled. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-ASSUMPTION-023 (approved, AVISO-R1); A-P01Q-019, -026; A-P02Q-016 |
| FR-027 | **Owner cancels appointment.** The platform shall allow a pet owner to cancel one of their appointments at any time before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-019 |
| FR-028 | **Owner reschedules appointment.** The platform shall allow a pet owner to change the date and time of one of their appointments to another available slot, at any time before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-019 |
| FR-029 | **Provider views appointments.** The platform shall give each provider a space showing the appointments booked with it, including for each one the service, date and time, pet, owner's name, modality, status and, for home visits, the address. Cancelled appointments are shown as cancelled. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — P01-MVP-007; A-P01Q-017, -026; A-P02Q-016; details shown: P02-ASM-008 |
| FR-030 | **Provider cancels appointment.** The platform shall allow a provider to cancel an appointment booked with it, before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-026 |
| FR-031 | **Provider reschedules appointment.** The platform shall allow a provider to change the date and time of an appointment booked with it to another available slot, before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-026 |
| FR-032 | **Order product.** The platform shall allow a pet owner to order one available product directly from the provider that offers it, choosing a quantity from 1 to 99 and entering a delivery address for that order, without any payment in the platform and without a request or reservation step. The total (price × quantity) is shown before ordering. The order is created with status Confirmed. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-009; A-P01Q-024; A-P02Q-003; address per order: P01-ASSUMPTION-026 (confirmed, TD-12); contents and quantity: TD-12 |
| FR-033 | **Provider views orders.** The platform shall allow a provider to view the product orders placed with it, including the product, the quantity, the owner's name, the delivery address and the status. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-ASSUMPTION-022 (confirmed); A-P01Q-024; A-P02Q-003; quantity: TD-12 |
| FR-034 | **Owner views orders.** The platform shall allow a pet owner to view their product orders with the product, the quantity, the provider, the delivery address and the status. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — A-P02Q-003 ("all user types can see their orders"); quantity: TD-12 |
| FR-035 | **Provider updates order status.** The platform shall allow a provider to move an order placed with it forward through the statuses Confirmed → Dispatched/In delivery → Closed, one step at a time and never backwards. Only the provider can change the status. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — A-P02Q-003; single combined status: P02-ASM-015 |
| FR-036 | **Owner cancels order.** The platform shall allow a pet owner to cancel one of their orders while it has not been dispatched. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — A-P02Q-003; shown as cancelled: P02-ASM-011 |
| FR-037 | **Provider cancels order.** The platform shall allow a provider to cancel an order placed with it while it has not been dispatched. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / CONFIRMED_ASSUMPTION — A-P02Q-003; shown as cancelled: P02-ASM-011 |
| FR-038 | **Product stock availability.** The platform shall allow a provider to mark each of its products as available or not available, and shall not allow ordering a product that is not available. A newly published product is available. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — A-P02Q-003 ("no hay stock"); indicator and default: TD-13; not-available products stay visible: P02-ASM-016 |
| FR-039 | **Sign-out.** The platform shall allow a signed-in user of either account type to sign out from the menu of their interface, ending the session and returning to the sign-in screen. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — TD-03 (replaces the no-sign-out decision of AVISO-R1) |

## 5. Non-Functional Requirements

| ID | Category | Requirement | Scope | Traceability |
|---|---|---|---|---|
| NFR-001 | Security | Passwords shall be stored in hashed form and never in plain text. The hashing method is not defined at this stage (P05 — Architecture). | MVP_SUPPORTING | DIRECT — P00 ANS-Q015; P01-MVP-006 |
| NFR-002 | Security (authorization) | Only signed-in users shall access account functionality. Each user shall view and modify only their own data (pets, profile, catalog, appointments, orders), except information the product makes public (provider profiles and offerings) and information shared between the two parties of an appointment or order. | MVP_SUPPORTING | REFINED — P01-MVP-006; A-P01Q-012 |
| NFR-003 | Platform and compatibility | The product shall be a web application that works in Google Chrome on computers and on mobile phones. **Applies to all user stories.** | MVP_SUPPORTING | DIRECT — P00 [PLAT], ANS-Q016; A-P02Q-014 |
| NFR-004 | Language | The user interface shall be in Spanish. **Applies to all user stories.** | MVP_SUPPORTING | DIRECT — A-P02Q-014 |
| NFR-005 | Security (sessions) | A session shall end after 60 minutes without activity or 12 hours after sign-in, whichever comes first; the user must then sign in again. | MVP_SUPPORTING | DIRECT — TD-05 (P05-RD-003 approved) |

## 6. User Stories

### US-001 — Sign up as a pet owner with my first pet

- **Epic:** EPIC-001
- **Requirement(s):** FR-001, FR-005, NFR-001
- **User Story:** As a pet owner, I want to create an account with my name, email and password and the data of at least one pet, so that I can use the platform to find services and book appointments for my pet.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-006, P01-MVP-005, P01-NEED-002, P01-NEED-009, P01-SUCCESS-001, P01-SUCCESS-005, A-P01Q-010, A-P01Q-012, A-P02Q-006, A-P02Q-011, A-P02Q-012, TD-04, TD-07, TD-10

#### Acceptance Criteria

- AC-001:
  - Given a person without a pet owner account
  - When they submit a name, an email, a password of at least 8 characters and one pet with at least its name, species, age and breed
  - Then a pet owner account is created with that pet registered
- AC-002:
  - Given a person completing pet owner sign-up
  - When they try to finish without registering any pet
  - Then the account is not created and they are told that at least one pet is required
- AC-003:
  - Given a person completing pet owner sign-up
  - When the name, email or password, or the pet's name, species, age or breed, is missing
  - Then the account is not created and the missing field is indicated
- AC-004:
  - Given an email that already belongs to another pet owner account
  - When a person tries to sign up as a pet owner with that email
  - Then the account is not created (P02-ASM-002)
- AC-005:
  - Given a pet owner account has just been created
  - When its stored credentials are inspected
  - Then the password is not stored in plain text
- AC-074:
  - Given an email that belongs to a provider account
  - When a person signs up as a pet owner with that email
  - Then the pet owner account is created
- AC-075:
  - Given a person registering a pet
  - When they choose the pet's species
  - Then only dog or cat can be chosen
- AC-102:
  - Given a person completing pet owner sign-up
  - When the password has fewer than 8 characters
  - Then the account is not created and the password is indicated as too short

#### Business Rules

- BR-001, BR-003, BR-032, BR-036, BR-037, BR-039

#### Edge Cases

- EDGE-001, EDGE-002, EDGE-028

#### Dependencies

- None

#### Open Questions

- None

### US-002 — Sign up as a provider

- **Epic:** EPIC-001
- **Requirement(s):** FR-002, NFR-001
- **User Story:** As a veterinary clinic or independent veterinarian, I want to create a provider account indicating which of the two I am and, for a clinic, its address, so that I can publish my services and products to pet owners.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-006, P01-NEED-009, P01-SUCCESS-002, P01-SUCCESS-005, A-P01Q-005, A-P01Q-011, A-P01Q-012, A-P02Q-012, TD-04, TD-08, TD-09

#### Acceptance Criteria

- AC-006:
  - Given a person without a provider account
  - When they submit a name, an email, a password of at least 8 characters and the provider type (clinic or independent veterinarian) and, for a clinic, its address
  - Then a provider account of that type is created
- AC-007:
  - Given a person completing provider sign-up
  - When they do not indicate the provider type
  - Then the account is not created and the missing type is indicated
- AC-008:
  - Given an email that already belongs to another provider account
  - When a person tries to sign up as a provider with that email
  - Then the account is not created (P02-ASM-002)
- AC-009:
  - Given a provider account has just been created
  - When its stored credentials are inspected
  - Then the password is not stored in plain text
- AC-076:
  - Given an email that belongs to a pet owner account
  - When a person signs up as a provider with that email
  - Then the provider account is created
- AC-103:
  - Given a person completing provider sign-up
  - When the password has fewer than 8 characters
  - Then the account is not created and the password is indicated as too short
- AC-104:
  - Given a person signing up as a clinic
  - When they do not enter an address
  - Then the account is not created and the address is indicated as required
- AC-105:
  - Given a person signing up as an independent veterinarian
  - When they do not enter an address
  - Then the provider account is created

#### Business Rules

- BR-001, BR-002, BR-036, BR-026, BR-039

#### Edge Cases

- EDGE-002, EDGE-028

#### Dependencies

- None

#### Open Questions

- None

### US-003 — Sign in to my interface

- **Epic:** EPIC-001
- **Requirement(s):** FR-003, FR-004, NFR-002, NFR-005
- **User Story:** As a registered user (pet owner or provider), I want to sign in with my email and password, choosing the account type I want to enter as, so that I can use the interface that corresponds to that account type.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-006, P01-NEED-009, P01-SUCCESS-005, A-P01Q-012, A-P02Q-012, TD-05

#### Acceptance Criteria

- AC-010:
  - Given a registered pet owner
  - When they sign in as a pet owner with the correct email and password
  - Then they reach the pet owner interface
- AC-011:
  - Given a registered provider
  - When they sign in as a provider with the correct email and password
  - Then they reach the provider interface
- AC-012:
  - Given a registered user
  - When they sign in with an incorrect email or password, or as an account type they have not registered
  - Then access is not granted
- AC-013:
  - Given a signed-in user of one account type
  - When they try to use a function of the other account type
  - Then access to that function is denied
- AC-077:
  - Given a person with a pet owner account and a provider account under the same email
  - When they sign in choosing one of the two types
  - Then they reach the interface of the account of that type
- AC-114:
  - Given a signed-in user
  - When 60 minutes pass without activity, or 12 hours pass since they signed in
  - Then their next action requires signing in again

#### Business Rules

- BR-001, BR-036

#### Edge Cases

- EDGE-003, EDGE-020, EDGE-032

#### Dependencies

- None

#### Open Questions

- None

### US-004 — Add a pet

- **Epic:** EPIC-002
- **Requirement(s):** FR-005
- **User Story:** As a pet owner, I want to register another pet, so that I can book services for it.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-005, P01-NEED-002, P01-SUCCESS-001, A-P01Q-031, A-P02Q-006, A-P02Q-011, TD-07, TD-10

#### Acceptance Criteria

- AC-014:
  - Given a signed-in pet owner
  - When they submit a new pet with at least its name, species, age and breed
  - Then the pet is added to their list of pets
- AC-015:
  - Given a signed-in pet owner adding a pet
  - When the pet's name, species, age or breed is missing
  - Then the pet is not added and the missing field is indicated
- AC-078:
  - Given a signed-in pet owner adding a pet
  - When they choose its species
  - Then only dog or cat can be chosen

#### Business Rules

- BR-032, BR-037

#### Edge Cases

- None

#### Dependencies

- DEP-001

#### Open Questions

- None

### US-005 — View my pets

- **Epic:** EPIC-002
- **Requirement(s):** FR-006, NFR-002
- **User Story:** As a pet owner, I want to see the list of my registered pets, so that I can check, edit or remove them and choose one when booking.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-005, P01-NEED-002, A-P01Q-031

#### Acceptance Criteria

- AC-016:
  - Given a signed-in pet owner with registered pets
  - When they open their list of pets
  - Then they see each of their pets with its name and registered data
- AC-017:
  - Given a signed-in pet owner who has removed all their pets
  - When they open their list of pets
  - Then they are told that no pets are registered
- AC-018:
  - Given two different pet owners
  - When one of them opens their list of pets
  - Then only their own pets are shown

#### Business Rules

- None

#### Edge Cases

- None

#### Dependencies

- DEP-001

#### Open Questions

- None

### US-006 — Edit a pet

- **Epic:** EPIC-002
- **Requirement(s):** FR-007, NFR-002
- **User Story:** As a pet owner, I want to edit the data of one of my pets, so that the information about my pet stays correct.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-005, P01-NEED-002, P01-SUCCESS-001, A-P01Q-031, A-P02Q-011, TD-07

#### Acceptance Criteria

- AC-019:
  - Given a signed-in pet owner viewing one of their pets
  - When they change one of its fields and save
  - Then the pet shows the updated data
- AC-020:
  - Given a signed-in pet owner editing a pet
  - When they leave its name, species, age or breed empty and save
  - Then the change is not saved and the field is indicated

#### Business Rules

- BR-037

#### Edge Cases

- None

#### Dependencies

- DEP-001, DEP-002

#### Open Questions

- None

### US-007 — Remove a pet

- **Epic:** EPIC-002
- **Requirement(s):** FR-008
- **User Story:** As a pet owner, I want to remove a pet from my account, so that my list only shows the pets I still have.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-005, P01-NEED-002, P01-SUCCESS-001, A-P01Q-031, A-P02Q-008, A-P02Q-P038

#### Acceptance Criteria

- AC-021:
  - Given a signed-in pet owner with several pets
  - When they remove one of them
  - Then the pet no longer appears in their list and cannot be chosen for new appointments
- AC-022:
  - Given a signed-in pet owner with only one pet
  - When they remove it
  - Then the pet is removed and the owner cannot book appointments until they register a pet
- AC-079:
  - Given a pet with upcoming appointments
  - When its owner removes it
  - Then those appointments are cancelled and shown as cancelled to the owner and the provider

#### Business Rules

- BR-004, BR-005, BR-034, BR-035

#### Edge Cases

- EDGE-011

#### Dependencies

- DEP-001, DEP-002

#### Open Questions

- None

### US-008 — Maintain my public profile

- **Epic:** EPIC-003
- **Requirement(s):** FR-009
- **User Story:** As a provider, I want to set my name, my contact phone and email and my address (mandatory for a clinic, optional for an independent veterinarian), so that pet owners can identify and reach me.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-008, P01-NEED-010, P01-SUCCESS-002, A-P01Q-021, A-P01Q-030, A-P02Q-010, TD-08, TD-09

#### Acceptance Criteria

- AC-023:
  - Given a signed-in provider
  - When they save a name, a phone, an email and an address
  - Then their public profile shows that information
- AC-024:
  - Given a signed-in independent veterinarian
  - When they save their profile without an address
  - Then the profile is saved and shown without an address
- AC-106:
  - Given a signed-in clinic
  - When it tries to save its profile without an address
  - Then the profile is not saved and the address is indicated as required; the clinic can change its address but not remove it

#### Business Rules

- BR-025, BR-026, BR-038

#### Edge Cases

- EDGE-017, EDGE-027

#### Dependencies

- DEP-001

#### Open Questions

- None

### US-009 — Set my working days and hours

- **Epic:** EPIC-003
- **Requirement(s):** FR-010
- **User Story:** As a provider, I want to define the days and hours in which I accept appointments, so that owners can only book me when I work.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-010, P01-NEED-012, P01-SUCCESS-002, A-P01Q-025, A-P02Q-007, A-P02Q-008

#### Acceptance Criteria

- AC-025:
  - Given a signed-in provider
  - When they define their working hours for each working day, which may differ between days
  - Then pet owners are offered appointment slots only within those days and hours
- AC-026:
  - Given a provider with no working days and hours defined
  - When a pet owner tries to book one of its services
  - Then no appointment slots are offered
- AC-080:
  - Given a signed-in provider defining working hours
  - When a start or end time is not on the hour
  - Then the hours are not saved and the time is indicated
- AC-081:
  - Given a provider with upcoming appointments
  - When they change their working hours so that some appointments fall outside them
  - Then those appointments are cancelled and shown as cancelled to both parties

#### Business Rules

- BR-011, BR-025, BR-033, BR-034, BR-035

#### Edge Cases

- EDGE-013, EDGE-014, EDGE-025

#### Dependencies

- DEP-001

#### Open Questions

- None

### US-010 — Publish a service

- **Epic:** EPIC-004
- **Requirement(s):** FR-011
- **User Story:** As a provider, I want to publish a service with its name, price, the species it applies to and where I offer it, so that pet owners can find it and book appointments.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-003, P01-NEED-006, P01-SUCCESS-002, A-P01Q-008, A-P01Q-009, A-P02Q-002, A-P02Q-006, TD-08, TD-09

#### Acceptance Criteria

- AC-027:
  - Given a signed-in clinic
  - When it publishes a service with a name, a price, one species (dog or cat) and a modality (clinic, home, or both)
  - Then the service appears in their catalog, on their profile and in search results
- AC-028:
  - Given a signed-in provider publishing a service
  - When they do not indicate exactly one species
  - Then the service is not published and the species is indicated as required
- AC-029:
  - Given a signed-in provider publishing a service
  - When they do not indicate a modality
  - Then the service is not published and the modality is indicated as required
- AC-082:
  - Given a signed-in provider publishing a service
  - When they do not indicate a price
  - Then the service is not published and the price is indicated as required (P02-ASM-014)
- AC-107:
  - Given a signed-in independent veterinarian
  - When they publish a service
  - Then the service is offered only at the owner's home; the clinic and both modalities cannot be chosen

#### Business Rules

- BR-006, BR-007, BR-025, BR-027, BR-032

#### Edge Cases

- EDGE-017

#### Dependencies

- DEP-001

#### Open Questions

- None

### US-011 — Update a service

- **Epic:** EPIC-004
- **Requirement(s):** FR-012, NFR-002
- **User Story:** As a provider, I want to change the details of one of my services, so that my catalog stays up to date.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-003, P01-NEED-007, P01-SUCCESS-002, A-P01Q-023

#### Acceptance Criteria

- AC-030:
  - Given a signed-in provider with a published service
  - When they change its details and save
  - Then the updated details appear in their catalog, on their profile and in search results
- AC-031:
  - Given a signed-in provider
  - When they try to change a service of another provider
  - Then the change is not allowed

#### Business Rules

- BR-006, BR-007

#### Edge Cases

- None

#### Dependencies

- DEP-001, DEP-003

#### Open Questions

- None

### US-012 — Remove a service

- **Epic:** EPIC-004
- **Requirement(s):** FR-013
- **User Story:** As a provider, I want to remove a service I no longer offer, so that pet owners cannot book it.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-003, P01-NEED-007, P01-SUCCESS-002, A-P02Q-008

#### Acceptance Criteria

- AC-032:
  - Given a signed-in provider with a published service
  - When they remove it
  - Then the service no longer appears in their catalog, on their profile or in search results, and new appointments for it cannot be booked
- AC-083:
  - Given a removed service that had upcoming appointments
  - When the owners and the provider open their appointments
  - Then those appointments are shown as cancelled

#### Business Rules

- BR-034, BR-035

#### Edge Cases

- EDGE-012

#### Dependencies

- DEP-001, DEP-003

#### Open Questions

- None

### US-013 — Publish a product

- **Epic:** EPIC-004
- **Requirement(s):** FR-014
- **User Story:** As a provider, I want to publish a product with its name, price and the species it applies to, so that pet owners can find it and order it.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-003, P01-NEED-006, P01-SUCCESS-002, A-P01Q-002, A-P01Q-028, A-P02Q-002, A-P02Q-006

#### Acceptance Criteria

- AC-033:
  - Given a signed-in provider
  - When they publish a product with a name, a price and one species (dog or cat)
  - Then the product appears in their catalog, on their profile and in search results
- AC-034:
  - Given a signed-in provider publishing a product
  - When they do not indicate exactly one species
  - Then the product is not published and the species is indicated as required
- AC-084:
  - Given a signed-in provider publishing a product
  - When they do not indicate a price
  - Then the product is not published and the price is indicated as required (P02-ASM-014)

#### Business Rules

- BR-006, BR-025, BR-027, BR-032

#### Edge Cases

- None

#### Dependencies

- DEP-001

#### Open Questions

- None

### US-014 — Update a product

- **Epic:** EPIC-004
- **Requirement(s):** FR-015, NFR-002
- **User Story:** As a provider, I want to change the details of one of my products, so that my catalog stays up to date.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-003, P01-NEED-007, P01-SUCCESS-002

#### Acceptance Criteria

- AC-035:
  - Given a signed-in provider with a published product
  - When they change its details and save
  - Then the updated details appear in their catalog, on their profile and in search results
- AC-036:
  - Given a signed-in provider
  - When they try to change a product of another provider
  - Then the change is not allowed

#### Business Rules

- BR-006

#### Edge Cases

- None

#### Dependencies

- DEP-001, DEP-004

#### Open Questions

- None

### US-015 — Remove a product

- **Epic:** EPIC-004
- **Requirement(s):** FR-016
- **User Story:** As a provider, I want to remove a product I no longer offer, so that pet owners cannot order it.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-003, P01-NEED-007, P01-SUCCESS-002, A-P02Q-003

#### Acceptance Criteria

- AC-037:
  - Given a signed-in provider with a published product
  - When they remove it
  - Then the product no longer appears in their catalog, on their profile or in search results, and it cannot be ordered
- AC-085:
  - Given a removed product with orders that were placed before its removal
  - When the owner or the provider opens their orders
  - Then those orders keep their current status (P02-ASM-012)

#### Business Rules

- BR-030

#### Edge Cases

- EDGE-019

#### Dependencies

- DEP-001, DEP-004

#### Open Questions

- None

### US-016 — Search services and products

- **Epic:** EPIC-005
- **Requirement(s):** FR-017, FR-019
- **User Story:** As a pet owner, I want to search by text the services and products offered by all providers, so that I can find what my pet needs in one place without using other channels.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-001, P01-NEED-001, P01-NEED-003, P01-SUCCESS-003, P01-SUCCESS-007, A-P01Q-003, A-P01Q-011, A-P01Q-022, A-P02Q-002, A-P02Q-013

#### Acceptance Criteria

- AC-038:
  - Given services and products published by several providers
  - When a signed-in pet owner searches by text
  - Then the results include offerings from all providers whose name matches the text (P02-ASM-013), with no filtering by the owner's location
- AC-039:
  - Given a list of search results
  - When the pet owner looks at a result
  - Then it shows its price, whether it is offered by a clinic or an independent veterinarian and, for a service, whether it is offered at the clinic, at home, or both
- AC-040:
  - Given no offering matches the search
  - When the pet owner searches
  - Then they are told that there are no results

#### Business Rules

- BR-009, BR-027

#### Edge Cases

- EDGE-015

#### Dependencies

- DEP-001, DEP-003, DEP-004

#### Open Questions

- None

### US-017 — Filter by species

- **Epic:** EPIC-005
- **Requirement(s):** FR-018
- **User Story:** As a pet owner, I want to filter the results by the species a service or product is for, so that I only see offerings that apply to the animal I am looking for.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-001, P01-NEED-003, P01-SUCCESS-003, P01-SUCCESS-007, A-P01Q-022, A-P02Q-006, A-P02Q-013

#### Acceptance Criteria

- AC-041:
  - Given search results that include offerings for dogs and for cats
  - When the pet owner selects a species filter (dog or cat)
  - Then only offerings for that species are shown
- AC-042:
  - Given a pet owner who has no registered pet of a given species
  - When they filter by that species
  - Then the offerings for that species are shown anyway
- AC-043:
  - Given a species filter is applied
  - When the pet owner removes the filter
  - Then offerings for both species are shown again
- AC-086:
  - Given a text search with results
  - When the pet owner also applies a species filter
  - Then only results that match both the text and the species are shown

#### Business Rules

- BR-006, BR-008, BR-032

#### Edge Cases

- None

#### Dependencies

- DEP-001, DEP-003, DEP-004

#### Open Questions

- None

### US-018 — View a provider's profile

- **Epic:** EPIC-005
- **Requirement(s):** FR-020
- **User Story:** As a pet owner, I want to see a provider's details and everything it offers, so that I can decide whether to book or order and know how to reach it.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-008, P01-NEED-010, P01-SUCCESS-003, A-P01Q-011, A-P01Q-021, A-P01Q-030, A-P02Q-002, A-P02Q-010

#### Acceptance Criteria

- AC-044:
  - Given a provider that has completed its profile
  - When a pet owner opens it
  - Then they see its name, address, phone, email, provider type, and its services and products with their prices
- AC-045:
  - Given a provider without an address
  - When a pet owner opens its profile
  - Then the profile is shown without an address

#### Business Rules

- BR-026, BR-027, BR-038

#### Edge Cases

- None

#### Dependencies

- DEP-001, DEP-005

#### Open Questions

- None

### US-019 — Book an appointment for my pet

- **Epic:** EPIC-006
- **Requirement(s):** FR-021, FR-022, FR-024, FR-025
- **User Story:** As a pet owner, I want to book a one-hour appointment for one of my pets for a service I found, so that my pet receives the service.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-002, P01-NEED-004, P01-SUCCESS-004, P01-SUCCESS-007, A-P01Q-019, A-P01Q-022, A-P01Q-025, A-P01Q-031, A-P02Q-005, TD-06

#### Acceptance Criteria

- AC-046:
  - Given a signed-in pet owner with at least one pet viewing a service
  - When they start a booking
  - Then they are shown available one-hour slots only within the provider's working days and hours
- AC-047:
  - Given a pet owner who has chosen one of their pets and an available slot
  - When they book
  - Then the appointment is scheduled immediately, with no confirmation by the provider, and appears in the owner's and the provider's appointments
- AC-048:
  - Given a signed-in pet owner with no registered pets
  - When they try to book a service
  - Then the booking is not allowed and they are told to register a pet first
- AC-049:
  - Given a clinic that already has an appointment in a slot within its working hours
  - When another pet owner views that clinic's slots
  - Then that slot is still offered
- AC-050:
  - Given an independent veterinarian that already has an appointment in a slot
  - When another pet owner views that veterinarian's slots
  - Then that slot is not offered
- AC-051:
  - Given a pet owner viewing available slots
  - When the list is shown
  - Then slots whose start time has already passed are not offered (P02-ASM-006)
- AC-108:
  - Given a pet owner with pets of different species booking a service for one species
  - When they choose the pet
  - Then only their pets of the service's species can be chosen
- AC-109:
  - Given a pet owner with no pet of the service's species
  - When they try to book that service
  - Then the booking is not allowed and they are told the service is only for the other species

#### Business Rules

- BR-005, BR-010, BR-011, BR-012, BR-013, BR-014, BR-024

#### Edge Cases

- EDGE-004, EDGE-005, EDGE-006, EDGE-007, EDGE-009, EDGE-016, EDGE-030

#### Dependencies

- DEP-001, DEP-002, DEP-005, DEP-006

#### Open Questions

- None

### US-020 — Book a home visit

- **Epic:** EPIC-006
- **Requirement(s):** FR-022, FR-023
- **User Story:** As a pet owner, I want to give my address when I book a service at home, so that the provider knows where to attend my pet.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-002, P01-NEED-004, P01-SUCCESS-004, A-P01Q-017, TD-09

#### Acceptance Criteria

- AC-052:
  - Given a pet owner booking a service offered at home
  - When they enter the visit address and book
  - Then the appointment is scheduled with that address, and the provider can see it
- AC-053:
  - Given a pet owner booking a service at home
  - When they do not enter an address
  - Then the appointment is not booked and the address is indicated as required
- AC-054:
  - Given a clinic service offered both at the clinic and at home
  - When the pet owner books it
  - Then they choose the modality, and an address is required only if they choose home (P02-ASM-005)

#### Business Rules

- BR-007, BR-015

#### Edge Cases

- EDGE-008

#### Dependencies

- DEP-001, DEP-006

#### Open Questions

- None

### US-021 — View my appointments

- **Epic:** EPIC-007
- **Requirement(s):** FR-026, NFR-002
- **User Story:** As a pet owner, I want to see my appointments, so that I know when and where each one takes place, including changes made by the provider.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-007, P01-NEED-004, A-P01Q-019, A-P01Q-026, A-P02Q-016, AVISO-R1

#### Acceptance Criteria

- AC-055:
  - Given a signed-in pet owner with appointments
  - When they open their appointments
  - Then each one shows the service, provider, pet, date and time, modality and status
- AC-056:
  - Given an appointment that the provider has rescheduled
  - When the pet owner opens their appointments
  - Then it shows the new date and time (no notification is sent: P01-OOS-004)
- AC-087:
  - Given an appointment cancelled by the owner, by the provider or automatically
  - When the pet owner opens their appointments
  - Then it is shown as cancelled

#### Business Rules

- BR-017, BR-035

#### Edge Cases

- None

#### Dependencies

- DEP-001, DEP-007

#### Open Questions

- None

### US-022 — Cancel my appointment

- **Epic:** EPIC-007
- **Requirement(s):** FR-027
- **User Story:** As a pet owner, I want to cancel an appointment, so that I am not expected when I can no longer attend.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-007, P01-NEED-004, P01-SUCCESS-006, A-P01Q-019, A-P02Q-016

#### Acceptance Criteria

- AC-057:
  - Given a pet owner with an appointment that has not started
  - When they cancel it
  - Then it is shown as cancelled in the owner's and the provider's appointments
- AC-058:
  - Given a cancelled appointment with an independent veterinarian
  - When another pet owner views that veterinarian's slots
  - Then the freed slot is offered again
- AC-059:
  - Given an appointment whose start time has passed
  - When the pet owner tries to cancel it
  - Then the cancellation is not allowed

#### Business Rules

- BR-013, BR-016, BR-035

#### Edge Cases

- EDGE-010

#### Dependencies

- DEP-001, DEP-007

#### Open Questions

- None

### US-023 — Reschedule my appointment

- **Epic:** EPIC-007
- **Requirement(s):** FR-028
- **User Story:** As a pet owner, I want to move an appointment to another date and time, so that I can keep the appointment when my plans change.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-007, P01-NEED-004, P01-SUCCESS-006, A-P01Q-019

#### Acceptance Criteria

- AC-060:
  - Given a pet owner with an appointment that has not started
  - When they choose another available slot
  - Then the appointment moves to the new date and time in both parties' appointments
- AC-061:
  - Given a pet owner rescheduling
  - When the slots are shown
  - Then only slots available under the same rules as a new booking are offered
- AC-062:
  - Given an appointment whose start time has passed
  - When the pet owner tries to reschedule it
  - Then the change is not allowed

#### Business Rules

- BR-016, BR-018

#### Edge Cases

- EDGE-009, EDGE-010

#### Dependencies

- DEP-001, DEP-007

#### Open Questions

- None

### US-024 — See my scheduled appointments

- **Epic:** EPIC-007
- **Requirement(s):** FR-029, NFR-002
- **User Story:** As a provider, I want to see the appointments owners have booked with me, so that I know what I have to attend and where.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-007, P01-NEED-008, P01-SUCCESS-006, A-P01Q-017, A-P01Q-026, A-P02Q-016

#### Acceptance Criteria

- AC-063:
  - Given a signed-in provider with booked appointments
  - When they open their appointments space
  - Then they see each appointment with its service, date and time, pet, owner's name, modality, status and, for home visits, the address (P02-ASM-008)
- AC-064:
  - Given a signed-in provider
  - When they open their appointments space
  - Then appointments of other providers are not shown
- AC-088:
  - Given an appointment cancelled by the owner, by the provider or automatically
  - When the provider opens their appointments space
  - Then it is shown as cancelled

#### Business Rules

- BR-035

#### Edge Cases

- None

#### Dependencies

- DEP-001, DEP-007

#### Open Questions

- None

### US-025 — Cancel an appointment as a provider

- **Epic:** EPIC-007
- **Requirement(s):** FR-030
- **User Story:** As a provider, I want to cancel an appointment booked with me, so that I am not expected to attend an appointment I cannot keep.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-007, P01-NEED-008, P01-SUCCESS-006, A-P01Q-026, A-P02Q-016

#### Acceptance Criteria

- AC-065:
  - Given a provider with an appointment that has not started
  - When they cancel it
  - Then it is shown as cancelled in the provider's appointments, and the pet owner sees it as cancelled when they open their appointments
- AC-066:
  - Given an appointment whose start time has passed
  - When the provider tries to cancel it
  - Then the cancellation is not allowed

#### Business Rules

- BR-017, BR-035

#### Edge Cases

- EDGE-010

#### Dependencies

- DEP-001, DEP-007

#### Open Questions

- None

### US-026 — Reschedule an appointment as a provider

- **Epic:** EPIC-007
- **Requirement(s):** FR-031
- **User Story:** As a provider, I want to move an appointment booked with me to another date and time, so that I can keep it when my schedule changes.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-007, P01-NEED-008, P01-SUCCESS-006, A-P01Q-026

#### Acceptance Criteria

- AC-067:
  - Given a provider with an appointment that has not started
  - When they move it to another available slot within their working hours
  - Then the appointment shows the new date and time in both parties' appointments
- AC-068:
  - Given an appointment whose start time has passed
  - When the provider tries to reschedule it
  - Then the change is not allowed

#### Business Rules

- BR-011, BR-017, BR-018

#### Edge Cases

- EDGE-010

#### Dependencies

- DEP-001, DEP-007

#### Open Questions

- None

### US-027 — Order a product to my address

- **Epic:** EPIC-008
- **Requirement(s):** FR-032
- **User Story:** As a pet owner, I want to order a product to my address, so that I receive it without paying online or going elsewhere.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-009, P01-NEED-011, P01-SUCCESS-008, A-P01Q-024, A-P02Q-003, TD-12, TD-13

#### Acceptance Criteria

- AC-069:
  - Given a signed-in pet owner viewing an available product
  - When they choose a quantity from 1 to 99, enter a delivery address and place the order
  - Then the order for that product and quantity is registered directly with status Confirmed, with no request, reservation or payment step, the total (price × quantity) was shown before ordering, and both the owner and the provider can see it
- AC-070:
  - Given a pet owner placing an order
  - When they do not enter a delivery address
  - Then the order is not placed and the address is indicated as required
- AC-071:
  - Given a signed-in pet owner with no registered pets
  - When they order a product
  - Then the order is placed (pets are required only to book services: P02-ASM-009)
- AC-089:
  - Given a product marked as not available
  - When a pet owner tries to order it
  - Then the order is not allowed
- AC-110:
  - Given a pet owner placing an order
  - When the quantity is less than 1 or greater than 99
  - Then the order is not placed and the quantity is indicated as invalid

#### Business Rules

- BR-019, BR-020, BR-021, BR-022, BR-023, BR-027, BR-028, BR-030

#### Edge Cases

- EDGE-018, EDGE-021, EDGE-029

#### Dependencies

- DEP-001, DEP-004, DEP-010

#### Open Questions

- None

### US-028 — See the product orders placed with me

- **Epic:** EPIC-008
- **Requirement(s):** FR-033, NFR-002
- **User Story:** As a provider, I want to see the orders owners place for my products, so that I know what to deliver and where.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-009, P01-NEED-012, P01-SUCCESS-008, A-P01Q-024, A-P02Q-003, A-P02Q-P036, TD-12

#### Acceptance Criteria

- AC-072:
  - Given a provider with orders placed for its products
  - When they open their orders
  - Then they see each order with the product, the quantity, the owner's name, the delivery address and the status
- AC-073:
  - Given a signed-in provider
  - When they open their orders
  - Then orders placed with other providers are not shown

#### Business Rules

- BR-023, BR-028

#### Edge Cases

- None

#### Dependencies

- DEP-001, DEP-009

#### Open Questions

- None

### US-029 — See my orders

- **Epic:** EPIC-008
- **Requirement(s):** FR-034, NFR-002
- **User Story:** As a pet owner, I want to see my product orders and their status, so that I know whether each order is confirmed, on its way or delivered.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-009, P01-NEED-011, A-P02Q-003, TD-12

#### Acceptance Criteria

- AC-090:
  - Given a signed-in pet owner with orders
  - When they open their orders
  - Then each order shows the product, the quantity, the provider, the delivery address and the status
- AC-091:
  - Given two different pet owners
  - When one of them opens their orders
  - Then only their own orders are shown

#### Business Rules

- BR-023

#### Edge Cases

- None

#### Dependencies

- DEP-001, DEP-009

#### Open Questions

- None

### US-030 — Update the status of an order

- **Epic:** EPIC-008
- **Requirement(s):** FR-035
- **User Story:** As a provider, I want to move an order forward when I dispatch it and when it is delivered, so that the owner knows where their order is.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-009, P01-NEED-012, A-P02Q-003

#### Acceptance Criteria

- AC-092:
  - Given an order with status Confirmed
  - When the provider marks it as dispatched
  - Then its status becomes Dispatched/In delivery, and the owner sees the new status
- AC-093:
  - Given an order with status Dispatched/In delivery
  - When the provider marks it as delivered
  - Then its status becomes Closed
- AC-094:
  - Given an order in any status
  - When the provider tries to move it back to an earlier status or skip a status
  - Then the change is not allowed
- AC-095:
  - Given a signed-in pet owner viewing one of their orders
  - When they try to change its status
  - Then the change is not allowed

#### Business Rules

- BR-023

#### Edge Cases

- EDGE-023, EDGE-024, EDGE-026

#### Dependencies

- DEP-001, DEP-009

#### Open Questions

- None

### US-031 — Cancel my order

- **Epic:** EPIC-008
- **Requirement(s):** FR-036
- **User Story:** As a pet owner, I want to cancel an order that has not been dispatched, so that I do not receive a product I no longer want.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-009, P01-NEED-011, A-P02Q-003

#### Acceptance Criteria

- AC-096:
  - Given a pet owner with an order with status Confirmed
  - When they cancel it
  - Then the order is cancelled and shown as cancelled to the owner and the provider (P02-ASM-011)
- AC-097:
  - Given an order with status Dispatched/In delivery or Closed
  - When the pet owner tries to cancel it
  - Then the cancellation is not allowed

#### Business Rules

- BR-029

#### Edge Cases

- EDGE-022

#### Dependencies

- DEP-001, DEP-009

#### Open Questions

- None

### US-032 — Cancel an order as a provider

- **Epic:** EPIC-008
- **Requirement(s):** FR-037
- **User Story:** As a provider, I want to cancel an order placed with me that has not been dispatched, so that I am not expected to deliver an order I cannot fulfil.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-009, P01-NEED-012, A-P02Q-003

#### Acceptance Criteria

- AC-098:
  - Given a provider with an order with status Confirmed
  - When they cancel it
  - Then the order is cancelled and shown as cancelled to the provider and the owner (P02-ASM-011)
- AC-099:
  - Given an order with status Dispatched/In delivery or Closed
  - When the provider tries to cancel it
  - Then the cancellation is not allowed

#### Business Rules

- BR-029

#### Edge Cases

- EDGE-022

#### Dependencies

- DEP-001, DEP-009

#### Open Questions

- None

### US-033 — Indicate whether a product is in stock

- **Epic:** EPIC-008
- **Requirement(s):** FR-038
- **User Story:** As a provider, I want to mark each of my products as available or not available, so that owners cannot order products I do not have.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-009, P01-NEED-012, A-P02Q-003, TD-13

#### Acceptance Criteria

- AC-100:
  - Given a published product
  - When the provider marks it as not available
  - Then owners can still see it but cannot order it (P02-ASM-016)
- AC-101:
  - Given a product marked as not available
  - When the provider marks it as available again
  - Then owners can order it
- AC-111:
  - Given a signed-in provider
  - When they publish a new product
  - Then the product is published as available

#### Business Rules

- BR-030, BR-031

#### Edge Cases

- EDGE-021

#### Dependencies

- DEP-001, DEP-004

#### Open Questions

- None

### US-034 — Sign out

- **Epic:** EPIC-001
- **Requirement(s):** FR-039, NFR-002
- **User Story:** As a signed-in user (pet owner or provider), I want to sign out from the menu of my interface, so that nobody else can use my account on this device, and I can sign in again with another account type.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-006, TD-03

#### Acceptance Criteria

- AC-112:
  - Given a signed-in pet owner or provider
  - When they select sign out in the menu
  - Then the session ends without a confirmation dialog and they are taken to the sign-in screen
- AC-113:
  - Given a user who has signed out
  - When they try to open a screen of their interface
  - Then they are asked to sign in again

#### Business Rules

- BR-040

#### Edge Cases

- EDGE-031

#### Dependencies

- DEP-001

#### Open Questions

- None

## 7. Business Rules

| ID | Rule | Related Requirements / Stories | Status |
|---|---|---|---|
| BR-001 | There are two account types: pet owner and provider. Each has its own interface. | FR-001, FR-002, FR-004; US-001, US-002, US-003 | CONFIRMED (A-P01Q-012) |
| BR-002 | A provider is either a veterinary clinic or an independent veterinarian, recorded as an attribute of the provider account and shown as a label on its offerings and profile. | FR-002, FR-019, FR-020; US-002 | CONFIRMED (A-P01Q-011; attribute approved by AVISO-R1) |
| BR-003 | A pet owner must register at least one pet to create an account. | FR-001; US-001 | CONFIRMED (A-P01Q-010) |
| BR-004 | After sign-up, a pet owner may remove pets, including the last one. | FR-008; US-007 | CONFIRMED (A-P02Q-P038) |
| BR-005 | Booking an appointment requires at least one registered pet, and each appointment is for exactly one of the owner's pets. | FR-022; US-007, US-019 | CONFIRMED (A-P01Q-022, -031; A-P02Q-P038) |
| BR-006 | Each service and each product applies to exactly one species. | FR-011, FR-014, FR-018; US-010, US-011, US-013, US-014, US-017 | CONFIRMED (A-P01Q-008, -028) |
| BR-007 | A service is offered at the provider's clinic, at the owner's home, or both. A clinic can offer any of the three; an independent veterinarian offers services only at the owner's home. | FR-011, FR-019, FR-023; US-010, US-011, US-020 | CONFIRMED (A-P01Q-009; P00 MVP-005); independent veterinarians home only: TD-09 |
| BR-008 | The species filter uses the species of the offering, not the species of the owner's pets. | FR-018; US-017 | CONFIRMED (A-P01Q-022) |
| BR-009 | All providers are visible to all pet owners; there is no filtering by area. Coverage is the city of Bogotá. | FR-017; US-016 | CONFIRMED (A-P01Q-003; P01-OOS-002, -003) |
| BR-010 | An appointment lasts one hour. | FR-021, FR-022; US-019 | CONFIRMED (A-P01Q-025) |
| BR-011 | Appointments can only be booked or moved within the provider's working days and hours. | FR-010, FR-021, FR-031; US-009, US-019, US-026 | CONFIRMED (A-P01Q-025) |
| BR-012 | A clinic accepts any number of appointments in the same slot within its working hours; staff availability is not managed. | FR-024; US-019 | CONFIRMED (A-P01Q-025; P01-OOS-009) |
| BR-013 | An independent veterinarian accepts one appointment per slot. | FR-025; US-019, US-022 | CONFIRMED (A-P02Q-005) |
| BR-014 | An appointment is scheduled as soon as it is booked; there is no confirmation step. | FR-022; US-019 | CONFIRMED (A-P01Q-019; P01-OOS-007) |
| BR-015 | A home-visit appointment requires the address of the visit, entered by the owner when booking. | FR-023; US-020 | CONFIRMED (A-P01Q-017) |
| BR-016 | A pet owner can cancel or reschedule an appointment at any time before it takes place. | FR-027, FR-028; US-022, US-023 | CONFIRMED (A-P01Q-019) |
| BR-017 | A provider can cancel or reschedule an appointment booked with it, with the same time limit as the owner (before it takes place). | FR-030, FR-031; US-021, US-025, US-026 | CONFIRMED (A-P01Q-026: "just like customers") |
| BR-018 | Rescheduling follows the same availability rules as a new booking. | FR-028, FR-031; US-023, US-026 | REFINED (A-P01Q-019, -025) |
| BR-019 | A product order is placed directly: no payment in the platform, no request or reservation step. | FR-032; US-027 | CONFIRMED (A-P01Q-024; P01-OOS-004, -010) |
| BR-020 | A product order is delivered to an address the owner enters when ordering. | FR-032; US-027 | CONFIRMED (A-P01Q-024); per-order entry CONFIRMED (P01-ASSUMPTION-026, TD-12) |
| BR-021 | Ordering a product does not require a registered pet. | FR-032; US-027 | CONFIRMED (P02-ASM-009, confirmed by ASSUM-008) |
| BR-022 | An order contains exactly one product, in a quantity from 1 to 99 chosen by the owner. The total (price × quantity) is shown; payment happens outside the platform. | FR-032; US-027 | CONFIRMED (TD-12) |
| BR-023 | Order statuses are Confirmed (when placed), Dispatched/In delivery (prepared and the courier is on the way), and Closed (delivered). Only the provider changes the status, one step forward at a time, never backwards. Owners and providers see their orders and statuses. | FR-032 to FR-035; US-027 to US-030 | CONFIRMED (A-P02Q-003); single combined second status CONFIRMED (P02-ASM-015) |
| BR-024 | A service can be booked only for a pet of the service's species. | FR-022; US-019 | CONFIRMED (TD-06) |
| BR-025 | Each provider maintains its own profile, working hours and catalog; there is no administrator role. | FR-009, FR-010, FR-011, FR-014; US-008, US-009, US-010, US-013 | CONFIRMED (A-P01Q-005, -006) |
| BR-026 | A clinic's address is mandatory from sign-up; the clinic can change it but not remove it. An independent veterinarian's address is optional. | FR-002, FR-009, FR-020; US-002, US-008, US-018 | CONFIRMED (A-P01Q-030 for independent veterinarians; TD-08, TD-09) |
| BR-027 | Services and products show a price. Payment is not made in the platform. | FR-011, FR-014, FR-019, FR-020; US-010, US-013, US-016, US-018, US-027 | CONFIRMED (A-P02Q-002; P01-OOS-004); price mandatory and in Colombian pesos CONFIRMED (P02-ASM-014) |
| BR-028 | The provider delivers ordered products outside the platform (by a courier); the platform has no delivery logistics or tracking. | FR-033; US-027, US-028 | CONFIRMED (A-P02Q-P036, A-P02Q-003; P01-OOS-004) |
| BR-029 | The owner and the provider can cancel an order only while it has not been dispatched (status Confirmed). | FR-036, FR-037; US-031, US-032 | CONFIRMED (A-P02Q-003); shown as cancelled CONFIRMED (P02-ASM-011) |
| BR-030 | A removed or not-available product cannot be ordered. | FR-016, FR-032, FR-038; US-015, US-027, US-033 | CONFIRMED (A-P02Q-003) |
| BR-031 | Product stock is an available / not available indicator set by the provider; a newly published product is available. | FR-038; US-033 | CONFIRMED (TD-13) |
| BR-032 | Species are predefined; in the MVP only dog and cat. | FR-005, FR-011, FR-014, FR-018; US-001, US-004, US-010, US-013, US-017 | CONFIRMED (A-P02Q-006) |
| BR-033 | Working hours can differ by day and must start and end on the hour. | FR-010; US-009 | CONFIRMED (A-P02Q-007) |
| BR-034 | Upcoming appointments are cancelled automatically when their pet is removed, their service is removed, or a change of working hours leaves them outside the new hours. | FR-008, FR-010, FR-013; US-007, US-009, US-012 | CONFIRMED (A-P02Q-008); scope limited to affected appointments REFINED |
| BR-035 | Cancelled appointments remain visible, shown as cancelled. | FR-026, FR-029; US-007, US-009, US-012, US-021, US-022, US-024, US-025 | CONFIRMED (A-P02Q-016) |
| BR-036 | The same email can be used for one pet owner account and one provider account; at sign-in the user chooses the type to enter as. | FR-001, FR-002, FR-003; US-001, US-002, US-003 | CONFIRMED (A-P02Q-012; A-P01Q-012); one account per type per email CONFIRMED (P02-ASM-002) |
| BR-037 | A pet's mandatory fields are name, species, age (whole years; 0 if under one year) and breed; weight (kg, one decimal) and height (whole cm) are optional. | FR-005; US-001, US-004, US-006 | CONFIRMED (A-P02Q-011; TD-07; TD-10) |
| BR-038 | A provider's contact information is a phone number and an email. | FR-009, FR-020; US-008, US-018 | CONFIRMED (A-P02Q-010) |
| BR-039 | A password must have at least 8 characters; there are no other password rules. | FR-001, FR-002; US-001, US-002 | CONFIRMED (TD-04) |
| BR-040 | A signed-in user can sign out from the menu of either interface, with no confirmation dialog; sign-out ends the session and leads to the sign-in screen. | FR-039; US-034 | CONFIRMED (TD-03) |

## 8. Edge Cases

| ID | Description | Related Story | Expected Behavior | Status |
|---|---|---|---|---|
| EDGE-001 | A person tries to finish pet owner sign-up without registering a pet. | US-001 | The account is not created; the owner is told that at least one pet is required. | DEFINED |
| EDGE-002 | A person signs up with an email that already belongs to an account. | US-001, US-002 | Allowed if the existing account is of the other type; rejected if it is of the same type. | DEFINED (A-P02Q-012; P02-ASM-002 confirmed) |
| EDGE-003 | A user signs in with an incorrect email or password, or as a type they have not registered. | US-003 | Access is not granted. | DEFINED |
| EDGE-004 | A pet owner with no registered pets tries to book. | US-019 | Booking is not allowed; the owner is told to register a pet. | DEFINED |
| EDGE-005 | A pet owner tries to book outside the provider's working days and hours. | US-019 | Those slots are not offered. | DEFINED |
| EDGE-006 | A pet owner tries to book an independent veterinarian in a slot that already has an appointment. | US-019 | The slot is not offered. | DEFINED (A-P02Q-005) |
| EDGE-007 | Two pet owners try to book the same independent veterinarian slot at almost the same time. | US-019 | Only one appointment is scheduled in that slot; the other owner is told the slot is no longer available. | DEFINED (consequence of BR-013) |
| EDGE-008 | A pet owner books a home visit without entering an address. | US-020 | The appointment is not booked; the address is indicated as required. | DEFINED |
| EDGE-009 | A pet owner tries to book or reschedule to a date and time that has already passed. | US-019, US-023 | Those slots are not offered. | DEFINED (P02-ASM-006 confirmed) |
| EDGE-010 | A user tries to cancel or reschedule an appointment whose start time has passed. | US-022, US-023, US-025, US-026 | The action is not allowed. | DEFINED |
| EDGE-011 | A pet owner removes a pet that has upcoming appointments. | US-007 | The pet's upcoming appointments are cancelled and shown as cancelled. | DEFINED (A-P02Q-008, -016) |
| EDGE-012 | A provider removes a service that has upcoming appointments. | US-012 | Those appointments are cancelled and shown as cancelled. | DEFINED (A-P02Q-008, -016) |
| EDGE-013 | A provider changes its working hours so that existing appointments fall outside them. | US-009 | The appointments outside the new hours are cancelled and shown as cancelled. | DEFINED (A-P02Q-008, -016) |
| EDGE-014 | A provider has not defined working days and hours. | US-009 | No appointment slots are offered for its services. | DEFINED |
| EDGE-015 | A search returns no results. | US-016 | The owner is told that there are no results. | DEFINED |
| EDGE-016 | A pet owner tries to book a service for a pet of a different species than the service's species. | US-019 | That pet cannot be chosen; only pets of the service's species can be chosen. | DEFINED (TD-06) |
| EDGE-017 | A provider without an address wants to offer a service at its clinic. | US-002, US-008, US-010 | Cannot occur: a clinic always has an address, and an independent veterinarian cannot offer in-clinic services. | DEFINED (TD-08, TD-09) |
| EDGE-018 | A pet owner places an order without a delivery address. | US-027 | The order is not placed; the address is indicated as required. | DEFINED |
| EDGE-019 | A provider removes a product that has already been ordered. | US-015 | New orders are not possible; existing orders keep their status. | DEFINED (A-P02Q-003; P02-ASM-012 confirmed) |
| EDGE-020 | A signed-in user tries to use a function of the other account type, or another user's data. | US-003 | Access is denied. | DEFINED (NFR-002) |
| EDGE-021 | A pet owner tries to order a product marked as not available. | US-027, US-033 | The order is not allowed. | DEFINED (A-P02Q-003) |
| EDGE-022 | The owner or the provider tries to cancel an order that has been dispatched or closed. | US-031, US-032 | The cancellation is not allowed. | DEFINED (A-P02Q-003) |
| EDGE-023 | The provider tries to move an order back to an earlier status, or to skip a status. | US-030 | The change is not allowed. | DEFINED (A-P02Q-003) |
| EDGE-024 | A pet owner tries to change the status of an order. | US-030 | The change is not allowed. | DEFINED (A-P02Q-003) |
| EDGE-025 | A provider sets working hours that do not start or end on the hour. | US-009 | The hours are not saved. | DEFINED (A-P02Q-007) |
| EDGE-026 | The provider tries to change the status of a cancelled order. | US-030 | The change is not allowed. | DEFINED (P02-ASM-011 confirmed) |
| EDGE-027 | A clinic tries to remove its address. | US-008 | The change is not saved; the address is indicated as required. | DEFINED (TD-08) |
| EDGE-028 | A person signs up with a password shorter than 8 characters. | US-001, US-002 | The account is not created; the password is indicated as too short. | DEFINED (TD-04) |
| EDGE-029 | A pet owner orders a quantity below 1 or above 99. | US-027 | The order is not placed; the quantity is indicated as invalid. | DEFINED (TD-12) |
| EDGE-030 | A pet owner has no pet of the service's species. | US-019 | Booking is not allowed; the owner is told the service is only for the other species. | DEFINED (TD-06) |
| EDGE-031 | A user who signed out uses the browser's back button or a saved link. | US-034 | Access is not granted; the sign-in screen is shown. | DEFINED (TD-03; standing rule TD-19) |
| EDGE-032 | A session expires while the user is using the platform. | US-003 | The next action requires signing in again. | DEFINED (TD-05) |

## 9. Dependencies

Dependencies are between product capabilities, not technical components.

| ID | Dependency | Related Items | Status |
|---|---|---|---|
| DEP-001 | Every story after sign-up and sign-in requires a signed-in user of the right account type. | FR-001 to FR-004 → US-004 to US-034 | Functional dependency |
| DEP-002 | Editing, removing and booking for a pet depend on pet registration. | FR-005 → FR-007, FR-008, FR-022; US-006, US-007, US-019 | Functional dependency |
| DEP-003 | Updating, removing, searching and booking services depend on published services. | FR-011 → FR-012, FR-013, FR-017, FR-021; US-011, US-012, US-016, US-017 | Functional dependency |
| DEP-004 | Updating, removing, searching, stock and ordering of products depend on published products. | FR-014 → FR-015, FR-016, FR-017, FR-032, FR-038; US-014, US-015, US-016, US-017, US-027, US-033 | Functional dependency |
| DEP-005 | The provider profile and booking show information the provider has entered. | FR-009 → FR-020; US-018, US-019 | Functional dependency |
| DEP-006 | Available slots depend on the provider's working days and hours. | FR-010 → FR-021; US-019, US-020 | Functional dependency |
| DEP-007 | Viewing, cancelling and rescheduling appointments depend on booking. | FR-022 → FR-026 to FR-031; US-021 to US-026 | Functional dependency |
| DEP-008 | The final definition of order contents and of stock depended on team decisions. | FR-032, FR-038; US-027, US-033; P02-Q-001, P02-Q-017 | Decision dependency (RESOLVED by TD-12, TD-13) |
| DEP-009 | Viewing orders, updating their status and cancelling them depend on placing orders. | FR-032 → FR-033 to FR-037; US-028 to US-032 | Functional dependency |
| DEP-010 | Ordering depends on the provider's stock indication. | FR-038 → FR-032; US-027, US-033 | Functional dependency |

## 10. Assumptions and Open Questions

### Assumptions

| ID | Assumption | Impact | Source |
|---|---|---|---|
| P01-ASSUMPTION-002 | Providers want an additional channel to reach pet owners (no direct effect on requirements). | Medium | P01 — OPEN |

**Resolved, confirmed or approved:**

| ID | Assumption | Resolution |
|---|---|---|
| P02-ASM-001 | Users sign in with their email and password (the only credentials stated by the team). | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-002 | An email can have at most one account of each type (one pet owner and one provider). *Revised in v2.0:* A-P02Q-012 allows the same email for both types. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-003 | *(v1.0: all five pet fields are required.)* | RESOLVED: mandatory fields are name, age and breed |
| P02-ASM-004 | Services and products have a name, so that owners can identify them. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-005 | When a service is offered both at the clinic and at home, the owner chooses the modality when booking. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-006 | Appointments cannot be booked or moved to a time that has already passed. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-007 | All dates and times are Bogotá local time. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-008 | The provider's appointments space shows the service, date and time, pet, owner's name, modality, status and, for home visits, the address. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-009 | Ordering a product does not require a registered pet; the team said a pet is required to book services. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-010 | Working hours are a weekly pattern: each day of the week has its own hours. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-011 | A cancelled order is shown as cancelled to both parties and its status can no longer change, by analogy with cancelled appointments. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-012 | Orders placed before a product is removed keep their status and can still be dispatched, closed or cancelled. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-013 | Text search matches the names of services and products. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-014 | A price is mandatory when publishing a service or product, and prices are in Colombian pesos. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-015 | "Dispatched or in delivery" is a single status. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P02-ASM-016 | An out-of-stock product stays visible in search and on the profile, but cannot be ordered. | CONFIRMED (ASSUM-008, team 2026-10-09) |
| P01-ASSUMPTION-019 | Two account types; clinic or independent veterinarian is a provider attribute. | APPROVED by AVISO-R1 |
| P01-ASSUMPTION-021 | An independent veterinarian accepts one appointment per slot. | CONFIRMED (A-P02Q-005) |
| P01-ASSUMPTION-022 | Providers see orders in their interface and deliver outside the platform. | CONFIRMED (A-P02Q-003, -P036) |
| P01-ASSUMPTION-023 | Owners have an appointments view, where they see changes made by the provider. | APPROVED by AVISO-R1 |
| P01-ASSUMPTION-025 | An owner may remove all pets after sign-up; one pet is needed to book. | CONFIRMED (A-P02Q-P038) |
| P01-ASSUMPTION-026 | The delivery address is entered when the order is placed. | CONFIRMED (TD-12) |

### Open Questions

| ID | Question | Affected Items | Decision Required |
|---|---|---|---|
| P01-QUESTION-033 | Regenerate and validate P00 from the consolidated input (carried; recommendation). | Source of truth | Before P03 (OPEN) |

**Resolved:**

| ID | Question | Resolution |
|---|---|---|
| P02-Q-001 | Can an order contain several products, and quantities? | RESOLVED (TD-12): one product per order, quantity 1–99 |
| P02-Q-004 | Can a service for one species be booked for a pet of another species? | RESOLVED (TD-06): only pets of the service's species |
| P02-Q-009 | Must a provider have an address to offer services at its clinic? | RESOLVED (TD-08, TD-09): clinics must have an address; independent veterinarians home only |
| P02-Q-017 | How is stock represented? | RESOLVED (TD-13): available / not available indicator |
| P02-Q-018 | Confirm that a cancelled order is shown as cancelled and cannot change status. | RESOLVED: P02-ASM-011 confirmed (ASSUM-008) |
| P01-QUESTION-032 | Project dates. | RESOLVED (TD-18): the sprint is the 3 confirmed days; exact dates are not recorded |
| P02-Q-002 | Are prices shown? | RESOLVED (A-P02Q-002) |
| P02-Q-003 | Order cancellation, status, owner view, removed product. | RESOLVED (A-P02Q-003); existing orders of a removed product: P02-ASM-012 |
| P02-Q-005 | Independent vet one per slot? | RESOLVED (A-P02Q-005) |
| P02-Q-006 | Species values? | RESOLVED (A-P02Q-006) |
| P02-Q-007 | Working-hour format? | RESOLVED (A-P02Q-007) |
| P02-Q-008 | Appointments when a pet or service is removed or hours change? | RESOLVED (A-P02Q-008) |
| P02-Q-010 | Provider contact? | RESOLVED (A-P02Q-010) |
| P02-Q-011 | Mandatory pet fields? | RESOLVED (A-P02Q-011) |
| P02-Q-012 | Same email for both account types? | RESOLVED (A-P02Q-012) |
| P02-Q-013 | Text search? | RESOLVED (A-P02Q-013); matched fields: P02-ASM-013 |
| P02-Q-014 | Language, browsers, devices? | RESOLVED (A-P02Q-014) |
| P02-Q-015 | Sign-out required? | RESOLVED by AVISO-R1 (no sign-out); SUPERSEDED by TD-03: sign-out is included |
| P02-Q-016 | Cancelled appointments shown? | RESOLVED (A-P02Q-016) |
| P01-QUESTION-029 | Clinic or independent vet as attribute? | RESOLVED by AVISO-R1 |
| P01-QUESTION-036 | Delivery outside the platform? | RESOLVED (A-P02Q-P036) |
| P01-QUESTION-038 | Remove all pets? | RESOLVED (A-P02Q-P038) |
| P01-QUESTION-039 | Owner appointments view? | RESOLVED by AVISO-R1 |

## 11. Requirements Traceability

| P01 Element | Epic | Requirement | User Story | Acceptance Criteria |
|---|---|---|---|---|
| P01-MVP-006 Accounts; TD-03 sign-out | EPIC-001 | FR-001 to FR-004, FR-039; NFR-001, NFR-002, NFR-005 | US-001, US-002, US-003, US-034 | AC-001–AC-013, AC-074–AC-077, AC-102–AC-105, AC-112–AC-114 |
| P01-MVP-005 Pet management | EPIC-002 | FR-005 to FR-008 | US-001, US-004 to US-007 | AC-001–AC-005, AC-014–AC-022, AC-074–AC-075, AC-078–AC-079, AC-102 |
| P01-MVP-008 Provider public profile | EPIC-003, EPIC-005 | FR-009, FR-020 | US-008, US-018 | AC-023–AC-024, AC-044–AC-045, AC-106 |
| P01-MVP-010 Working days and hours | EPIC-003 | FR-010 | US-009 | AC-025–AC-026, AC-080–AC-081 |
| P01-MVP-003 Provider catalog | EPIC-004 | FR-011 to FR-016 | US-010 to US-015 | AC-027–AC-037, AC-082–AC-085, AC-107 |
| P01-MVP-001 Search | EPIC-005 | FR-017 to FR-019 | US-016, US-017 | AC-038–AC-043, AC-086 |
| P01-MVP-002 Scheduling | EPIC-006 | FR-021 to FR-025 | US-019, US-020 | AC-046–AC-054, AC-108–AC-109 |
| P01-MVP-007 Appointment management | EPIC-007 | FR-026 to FR-031 | US-021 to US-026 | AC-055–AC-068, AC-087–AC-088 |
| P01-MVP-009 Product ordering | EPIC-008 | FR-032 to FR-038 | US-027 to US-033 | AC-069–AC-073, AC-089–AC-101, AC-110–AC-111 |
| P01-SUCCESS-007 End-to-end journey without outside channels | EPIC-001, -002, -005, -006 | FR-001, FR-005, FR-017, FR-018, FR-020 to FR-022 | US-001, US-016, US-017, US-018, US-019 | AC-001–AC-005, AC-038–AC-051, AC-074–AC-075, AC-086, AC-102, AC-108–AC-109 |
| P00 [PLAT], ANS-Q016; A-P02Q-014 Web, Chrome, computers and phones, Spanish | All | NFR-003, NFR-004 | All | All |

Each story's full P01 trace, including needs, success criteria and team answers, is listed under the story in §6 and in `product_backlog.json` (`traceability.p01_elements`).

## 12. Requirements Status

**READY**

The requirements cover every MVP capability in P01 v4.0, as refined by the team's answers (v2.0) and decisions (v3.0). Every question that affected requirements is resolved and every P02 assumption is confirmed. They trace to P01 and to cited answers and decisions, and contain no out-of-scope functionality or implementation decisions.

**Still open, with no effect on the requirements:**

- P01-QUESTION-033: P00 has not been regenerated from the consolidated input (process recommendation).
- P01-ASSUMPTION-002: providers want an additional channel (a product assumption with no direct requirement).

**Baseline:** the team's decisions of 2026-10-10 approve this content, so the requirements can be treated as the baseline for P03 v2.0, unless the P02 validation finds a defect.

### Change Log (v2.0 → v3.0)

| Change | Source |
|---|---|
| Sign-out added: FR-039, US-034, BR-040, AC-112, AC-113, EDGE-031; removed from 'Not included'. | TD-03 |
| Password of at least 8 characters: BR-039; FR-001, FR-002; AC-102, AC-103; EDGE-028. | TD-04 |
| Session expiry (60 minutes idle, 12 hours absolute): NFR-005; AC-114; EDGE-032. | TD-05 |
| Only pets of the service's species can be booked: BR-024, EDGE-016 defined; FR-022; AC-108, AC-109; EDGE-030. | TD-06 |
| Pet species mandatory; units of age, weight and height: FR-005, BR-037; AC-001, AC-003, AC-014, AC-015, AC-020. | TD-07, TD-10 |
| Clinic address mandatory from sign-up and not removable; independent veterinarians home only, address optional: FR-002, FR-009, FR-011, FR-019; BR-007, BR-026; AC-104 to AC-107, AC-024, AC-027, AC-054; EDGE-017 defined; EDGE-027. | TD-08, TD-09 |
| One product per order, quantity 1–99, total shown, address per order: FR-032 to FR-034; BR-020, BR-022; AC-069, AC-072, AC-090, AC-110; EDGE-029. | TD-12 |
| Stock as an available / not available indicator; new products available: FR-038, BR-031; AC-089, AC-100, AC-101, AC-111; EDGE-021. | TD-13 |
| All P02 assumptions and P01-ASSUMPTION-026 confirmed; all stories DEFINED; DEP-008 resolved. | ASSUM-008; TD-12; TD-19 |
| Questions P02-Q-001, -004, -009, -017, -018 and P01-QUESTION-032 resolved; P02-Q-015 superseded. | TD-03, TD-06, TD-08, TD-09, TD-12, TD-13, TD-18 |
