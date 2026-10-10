# Requirements Specification

> **Classification legend:** **DIRECT** = stated in P01 or by a team answer · **REFINED** = made more concrete without adding scope · **ASSUMED** = interpretation labeled as an assumption · **REQUIRES_DECISION** = the team must decide · **PROPOSAL** = suggestion for the team, not a decision.
>
> **Source references:**
> - `P01-*` identifiers refer to `PRODUCT_VISION.md` v4.0. `A-P01Q-0nn` are team answers recorded in `PROJECT_CONTEXT_V4.md`. `P00 ANS-Q0nn` are answers recorded in `INITIAL_PROJECT_INPUT_V2.md`.
> - **`A-P02Q-0nn`** is the team's answer to `P02-Q-0nn` of Requirements v1.0; **`A-P02Q-P036`** and **`A-P02Q-P038`** answer the carried `P01-QUESTION-036` and `-038`. **`AVISO-R1`** is the team's notice at the end of those answers. All are recorded in `PRODUCT_VISION_V4.md`, section "Questions from Requirements Version 1.0". The answers are in Spanish; this document uses faithful paraphrases. These are reference conventions, not new identifiers.
> - P02 assumptions and questions use the prefixes `P02-ASM-` and `P02-Q-`, because `ASM-` and `Q-` are already used by P00.
> - IDs from v1.0 are kept. New items continue the sequences (FR-034, US-029, AC-074, BR-029, EDGE-021, DEP-009, NFR-004).

## 1. Document Metadata

- **Version:** 2.0
- **Stage:** P02 — Requirements Engineering
- **Status:** READY_WITH_ASSUMPTIONS
- **Generated From:** `PRODUCT_VISION_V4.md` = `PRODUCT_VISION.md` v4.0 (verified by diff: unchanged) plus the team's answers to the Requirements v1.0 questions.
- **Validation Dependency:** `PRODUCT_VISION_VALIDATION.md` v4.0 (PASS_WITH_WARNINGS). The P02 v1.0 findings in `history/REQUIREMENTS_VALIDATION_v1.0.md` are addressed below.
- **Previous Version:** `history/REQUIREMENTS_v1.0.md`, `history/product_backlog_v1.0.json`
- **Generation Date:** 2026-10-09
- **Companion artifact:** `product_backlog.json` v2.0 (same IDs and content).

### Input Integrity Note

The team's answers were appended to the Product Vision rather than integrated into it, and P00 has still not been regenerated. This document integrates the answers directly and cites each one. Where an answer changes a P01 statement, the change is listed below (no silent resolution, SYSTEM_PROMPT §3). The appended answers have no P01 validation.

**Changes to P01 content made by the answers:**

- **Pet fields:** a pet now also has a **name** (A-P02Q-011), which was not in the P01 list (species, weight, age, height, breed). The mandatory fields are name, age and breed, so **species is optional** for pets.
- **Stock:** products now have **stock**. A-P02Q-003 says a product with no stock cannot be ordered; stock was not part of P01.
- **Order handling:** orders now have **statuses** and can be **cancelled** before dispatch (A-P02Q-003), which resolves P01-DECISION-015.

### Integration of the Team's Answers

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

**AVISO-R1 is applied only where an assumed answer existed.** P02-Q-001 (order contents), P02-Q-004 (species mismatch) and P02-Q-009 (address for in-clinic services) had no assumed answer, so they stay open. They now carry a labeled PROPOSAL.

### P02 v1.0 Validation Findings Addressed

| v1.0 finding | Treatment in v2.0 |
|---|---|
| VAL-001: product ordering partly defined | Statuses, cancellation, owner view and stock rule added (FR-034 to FR-038, US-029 to US-033). Order contents and stock representation still open (P02-Q-001, P02-Q-017). |
| VAL-002: six undecided edge cases | EDGE-011, -012, -013 defined; EDGE-019 defined for new orders, assumed for existing ones. EDGE-016 and EDGE-017 remain REQUIRES_DECISION. |
| VAL-003: format gaps | Species values, working-hour format, contact, text search, language and devices defined (A-P02Q-006, -007, -010, -013, -014). |
| VAL-004: requirements on P01 assumptions | FR-025, FR-033 confirmed; FR-026 approved (AVISO-R1); BR-004 confirmed. |
| VAL-006: FR-020/US-018 scope | Reclassified as MVP_SUPPORTING, matching P01-MVP-008. |
| VAL-008: DEP-001 inconsistent | Reworded and referenced from every story after sign-in (US-004 to US-033). |
| VAL-009: NFR-003 not linked | NFR-003 and the new NFR-004 explicitly apply to all stories. |
| VAL-010: sign-out | Not included, approved by AVISO-R1. |
| VAL-005, -007, -011, -012 | Unchanged: refinements remain labeled; US-019 split left to P03; format notes; P00 not regenerated. |

## 2. Requirements Overview

### 2.1 Scope Summary

The requirements cover the MVP defined in P01 v4.0, as refined by the team's answers:

- Accounts for pet owners and providers; the same email can hold both, and the type is chosen at sign-in.
- Pet management: dog or cat; name, age and breed mandatory.
- Provider profile with phone and email, and per-day working hours on the hour.
- Provider catalog of services and products with prices.
- Text search with a species filter.
- One-hour appointment scheduling.
- Appointment management by both parties, with automatic cancellations; cancelled appointments stay visible.
- Product ordering without payment, with three statuses, cancellation before dispatch, and a stock rule.

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
- Sign-out (approved by AVISO-R1).

**No basis for:** performance or availability targets, or privacy requirements beyond password hashing (A-P01Q-015). None are invented.

### 2.2 Requirement Status

| Item | v2.0 | v1.0 | Notes |
|---|---|---|---|
| Epics | 8 | 8 | |
| Functional requirements | 38 | 33 | DIRECT: 24, DIRECT / ASSUMED: 12, DIRECT / REQUIRES_DECISION: 1, REFINED: 1 |
| Non-functional requirements | 4 | 3 | |
| User stories | 33 | 28 | DEFINED: 17, DEFINED_WITH_ASSUMPTIONS: 13, PENDING_DECISION: 3 |
| Acceptance criteria | 101 | 73 | All v1.0 AC IDs kept in their stories |
| Business rules | 38 | 28 | 3 REQUIRES_DECISION |
| Edge cases | 26 | 20 | 2 REQUIRES_DECISION |
| Dependencies | 10 | 8 | |
| Assumptions (open) | 17 | 17 | 6 resolved, confirmed or approved |
| Open questions | 7 | 22 | 17 resolved |

**Story status values:**

- `DEFINED`: no assumption.
- `DEFINED_WITH_ASSUMPTIONS`: depends on a labeled assumption.
- `PENDING_DECISION`: part of its behavior is REQUIRES_DECISION.

### 2.3 Requirement Classification

| Scope | Functional requirements | Epics |
|---|---|---|
| MVP_CORE | 14 | EPIC-004, EPIC-005, EPIC-006 |
| MVP_SUPPORTING | 24 | EPIC-001, EPIC-002, EPIC-003, EPIC-007, EPIC-008 |
| FUTURE | 0 | — |
| OUT_OF_SCOPE | 0 | — |
| REQUIRES_DECISION | 0 | — |

FR-020 belongs to EPIC-005 (Core) but is classified MVP_SUPPORTING, following P01-MVP-008. Undecided details (order contents, stock representation, species mismatch, address for in-clinic services) are recorded as REQUIRES_DECISION business rules and questions.

## 3. Epics

| Epic ID | Name | Description | Product Objective | Scope |
|---|---|---|---|---|
| EPIC-001 | Accounts and Access | Self-registration as a pet owner or as a provider, sign-in choosing the account type, and access to the interface of that type. | Separate the two sides of the platform and link pets, catalogs, appointments and orders to their users. | MVP_SUPPORTING |
| EPIC-002 | Pet Management | Registration and maintenance of the pet owner's pets. | Let appointments be booked for a specific pet. | MVP_SUPPORTING |
| EPIC-003 | Provider Profile and Working Hours | The provider's public profile and the days and hours in which it accepts appointments. | Let owners identify and reach a provider, and define when it can be booked. | MVP_SUPPORTING |
| EPIC-004 | Provider Catalog | Publication and maintenance of the provider's services and products, with prices. | Provide the offerings that owners can find, book and order. | MVP_CORE |
| EPIC-005 | Search and Discovery | Text search of services and products across all providers in Bogotá, species filter, and provider profiles. | Let owners find veterinary services in one place without using other channels. | MVP_CORE |
| EPIC-006 | Appointment Scheduling | Booking of one-hour appointments for a pet within the provider's working hours, at the clinic or at home. | Let owners access the service they found: the outcome of the core journey. | MVP_CORE |
| EPIC-007 | Appointment Management | Viewing, cancelling and rescheduling appointments, by the owner and by the provider; automatic cancellations. | Keep both parties' schedules accurate. | MVP_SUPPORTING |
| EPIC-008 | Product Ordering | Direct ordering of products to the owner's address without payment, order statuses, order cancellation and product stock. | Let owners obtain products from the platform (team decision; not required for the core value). | MVP_SUPPORTING |

**Related Product Vision elements:**

- **EPIC-001:** P01-MVP-006, P01-NEED-009, A-P01Q-005, A-P01Q-012, A-P02Q-012
- **EPIC-002:** P01-MVP-005, P01-NEED-002, A-P01Q-010, A-P01Q-031, A-P02Q-011
- **EPIC-003:** P01-MVP-008, P01-MVP-010, P01-NEED-010, P01-NEED-012, A-P01Q-021, A-P01Q-025, A-P01Q-030, A-P02Q-007, A-P02Q-010
- **EPIC-004:** P01-MVP-003, P01-NEED-006, P01-NEED-007, A-P01Q-002, A-P01Q-008, A-P01Q-009, A-P01Q-023, A-P01Q-028, A-P02Q-002, A-P02Q-006
- **EPIC-005:** P01-MVP-001, P01-NEED-001, P01-NEED-003, P01-NEED-010, A-P01Q-003, A-P01Q-011, A-P01Q-021, A-P01Q-022, A-P02Q-013
- **EPIC-006:** P01-MVP-002, P01-NEED-004, P01-SUCCESS-007, A-P01Q-017, A-P01Q-019, A-P01Q-022, A-P01Q-025, A-P01Q-031, A-P02Q-005
- **EPIC-007:** P01-MVP-007, P01-NEED-004, P01-NEED-008, A-P01Q-019, A-P01Q-026, A-P02Q-008, A-P02Q-016
- **EPIC-008:** P01-MVP-009, P01-NEED-011, P01-NEED-012, A-P01Q-024, A-P02Q-003, A-P02Q-P036

## 4. Functional Requirements

Priority is not assigned in P02 (P03 — Planning). The **Traceability** column starts with the basis classification.

| ID | Requirement | Epic | Scope | Priority Status | Traceability |
|---|---|---|---|---|---|
| FR-001 | **Pet owner sign-up.** The platform shall allow a person to create a pet owner account by providing a name, an email and a password, and by registering at least one pet during sign-up. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-006, P01-MVP-005; P00 ANS-Q015; A-P01Q-010, -012; A-P02Q-012 |
| FR-002 | **Provider sign-up.** The platform shall allow a person to create a provider account by providing a name, an email and a password, and by indicating whether the provider is a veterinary clinic or an independent veterinarian. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-006; A-P01Q-005, -011, -012; provider type as an account attribute: P01-ASSUMPTION-019 (approved, AVISO-R1) |
| FR-003 | **Sign-in.** The platform shall allow a registered user to sign in with their email and password, choosing whether to enter as a pet owner or as a provider. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — A-P01Q-012 ("entrar como un tipo u otro"); A-P02Q-012; email and password as credentials: P02-ASM-001 |
| FR-004 | **Interface by account type.** After signing in, the platform shall give each user access only to the interface of the account type they entered as (pet owner or provider). | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — A-P01Q-012 |
| FR-005 | **Pet registration.** The platform shall allow a pet owner to register a pet with its name, species (dog or cat), weight, age, height and breed, of which name, age and breed are mandatory. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-005; P00 ANS-Q008; A-P02Q-006, -011 |
| FR-006 | **View pets.** The platform shall allow a pet owner to view the list of their registered pets. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | REFINED — P01-MVP-005 (needed to edit, remove and select pets) |
| FR-007 | **Edit pet.** The platform shall allow a pet owner to edit the data of one of their pets. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-005; A-P01Q-031 |
| FR-008 | **Remove pet.** The platform shall allow a pet owner to remove one of their pets, including their last remaining pet. Upcoming appointments for a removed pet are cancelled. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — A-P01Q-031; A-P02Q-008, -P038 |
| FR-009 | **Provider public profile.** The platform shall allow a provider to maintain a public profile containing its name, a contact phone number and email and, optionally, an address. | EPIC-003 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-008; A-P01Q-021, -030; A-P02Q-010 |
| FR-010 | **Working days and hours.** The platform shall allow a provider to define, for each day of the week, whether it works and its working hours, which must start and end on the hour. If a change leaves upcoming appointments outside the working hours, those appointments are cancelled. | EPIC-003 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-010; A-P01Q-025; A-P02Q-007, -008; weekly pattern: P02-ASM-010 |
| FR-011 | **Publish service.** The platform shall allow a provider to publish a service, indicating its name, its price, the single species it applies to (dog or cat), and whether it is offered at the provider's clinic, at the owner's home, or both. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-003; A-P01Q-008, -009; A-P02Q-002, -006; name: P02-ASM-004; price mandatory: P02-ASM-014 |
| FR-012 | **Update service.** The platform shall allow a provider to update the details of one of its services. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007; A-P01Q-023 |
| FR-013 | **Remove service.** The platform shall allow a provider to remove one of its services from its catalog. Upcoming appointments for a removed service are cancelled. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007; A-P02Q-008 |
| FR-014 | **Publish product.** The platform shall allow a provider to publish a product, indicating its name, its price and the single species it applies to (dog or cat). | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-003; A-P01Q-002, -028; A-P02Q-002, -006; name: P02-ASM-004; price mandatory: P02-ASM-014 |
| FR-015 | **Update product.** The platform shall allow a provider to update the details of one of its products. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007 |
| FR-016 | **Remove product.** The platform shall allow a provider to remove one of its products from its catalog; a removed product can no longer be ordered. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-003; A-P02Q-003; existing orders unaffected: P02-ASM-012 |
| FR-017 | **Search offerings.** The platform shall allow a pet owner to search by text the services and products published by all providers, with no filtering by the owner's location. | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-001; A-P01Q-003, -022; A-P02Q-013; P01-OOS-002; matched fields: P02-ASM-013 |
| FR-018 | **Species filter.** The platform shall allow a pet owner to filter search results by the species the service or product applies to (dog or cat), independently of the pets registered in their account. | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-001; A-P01Q-022; A-P02Q-006, -013 |
| FR-019 | **Result details.** Each search result shall show its price, whether it is offered by a veterinary clinic or by an independent veterinarian and, for services, whether it is offered at the clinic, at home, or both. | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT — P01-NEED-003; A-P01Q-009, -011; A-P02Q-002 |
| FR-020 | **View provider profile.** The platform shall allow a pet owner to view a provider's public profile, showing its name, address (if provided), phone, email, provider type, and the services and products it offers with their prices. | EPIC-005 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-008 (Supporting); P01-NEED-010; A-P01Q-011, -021, -030; A-P02Q-002, -010 |
| FR-021 | **Show available slots.** For a selected service, the platform shall show the pet owner the available one-hour appointment slots within the provider's working days and hours. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-002; A-P01Q-021, -025 |
| FR-022 | **Book appointment.** The platform shall allow a pet owner with at least one registered pet to book an appointment for a selected service by choosing one of their pets and an available one-hour slot. The appointment is scheduled immediately, with no confirmation by the provider. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-002; A-P01Q-019, -022, -025, -031; species mismatch: P02-Q-004 |
| FR-023 | **Home-visit address.** When the booked service is to be performed at the owner's home, the platform shall require the pet owner to enter the address of the visit when booking. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT / ASSUMED — A-P01Q-017; modality choice for services offered both ways: P02-ASM-005 |
| FR-024 | **Clinic availability.** For a veterinary clinic, every one-hour slot within its working days and hours shall remain available regardless of how many appointments are already booked in it. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — A-P01Q-025; P01-OOS-009 |
| FR-025 | **Independent veterinarian availability.** For an independent veterinarian, a one-hour slot shall become unavailable once an appointment is booked in it. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — A-P01Q-019; A-P02Q-005 |
| FR-026 | **Owner views appointments.** The platform shall allow a pet owner to view their appointments with their current details and status, including changes made by the provider and cancelled appointments, which are shown as cancelled. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-ASSUMPTION-023 (approved, AVISO-R1); A-P01Q-019, -026; A-P02Q-016 |
| FR-027 | **Owner cancels appointment.** The platform shall allow a pet owner to cancel one of their appointments at any time before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-019 |
| FR-028 | **Owner reschedules appointment.** The platform shall allow a pet owner to change the date and time of one of their appointments to another available slot, at any time before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-019 |
| FR-029 | **Provider views appointments.** The platform shall give each provider a space showing the appointments booked with it, including for each one the service, date and time, pet, owner's name, modality, status and, for home visits, the address. Cancelled appointments are shown as cancelled. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-007; A-P01Q-017, -026; A-P02Q-016; details shown: P02-ASM-008 |
| FR-030 | **Provider cancels appointment.** The platform shall allow a provider to cancel an appointment booked with it, before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-026 |
| FR-031 | **Provider reschedules appointment.** The platform shall allow a provider to change the date and time of an appointment booked with it to another available slot, before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-026 |
| FR-032 | **Order product.** The platform shall allow a pet owner to order an in-stock product directly from the provider that offers it, entering a delivery address, without any payment in the platform and without a request or reservation step. The order is created with status Confirmed. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-009; A-P01Q-024; A-P02Q-003; address per order: P01-ASSUMPTION-026; order contents: P02-Q-001 |
| FR-033 | **Provider views orders.** The platform shall allow a provider to view the product orders placed with it, including the product, the owner's name, the delivery address and the status. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-ASSUMPTION-022 (confirmed); A-P01Q-024; A-P02Q-003 |
| FR-034 | **Owner views orders.** The platform shall allow a pet owner to view their product orders with the product, the provider, the delivery address and the status. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — A-P02Q-003 ("all user types can see their orders") |
| FR-035 | **Provider updates order status.** The platform shall allow a provider to move an order placed with it forward through the statuses Confirmed → Dispatched/In delivery → Closed, one step at a time and never backwards. Only the provider can change the status. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — A-P02Q-003; single combined status: P02-ASM-015 |
| FR-036 | **Owner cancels order.** The platform shall allow a pet owner to cancel one of their orders while it has not been dispatched. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — A-P02Q-003; shown as cancelled: P02-ASM-011 |
| FR-037 | **Provider cancels order.** The platform shall allow a provider to cancel an order placed with it while it has not been dispatched. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — A-P02Q-003; shown as cancelled: P02-ASM-011 |
| FR-038 | **Product stock availability.** The platform shall allow a provider to indicate whether each of its products is in stock, and shall not allow ordering a product that is out of stock. How stock is represented is REQUIRES_DECISION (P02-Q-017). | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / REQUIRES_DECISION — A-P02Q-003 ("no hay stock"); out-of-stock products stay visible: P02-ASM-016 |

## 5. Non-Functional Requirements

| ID | Category | Requirement | Scope | Traceability |
|---|---|---|---|---|
| NFR-001 | Security | Passwords shall be stored in hashed form and never in plain text. The hashing method is not defined at this stage (P05 — Architecture). | MVP_SUPPORTING | DIRECT — P00 ANS-Q015; P01-MVP-006 |
| NFR-002 | Security (authorization) | Only signed-in users shall access account functionality. Each user shall view and modify only their own data (pets, profile, catalog, appointments, orders), except information the product makes public (provider profiles and offerings) and information shared between the two parties of an appointment or order. | MVP_SUPPORTING | REFINED — P01-MVP-006; A-P01Q-012 |
| NFR-003 | Platform and compatibility | The product shall be a web application that works in Google Chrome on computers and on mobile phones. **Applies to all user stories.** | MVP_SUPPORTING | DIRECT — P00 [PLAT], ANS-Q016; A-P02Q-014 |
| NFR-004 | Language | The user interface shall be in Spanish. **Applies to all user stories.** | MVP_SUPPORTING | DIRECT — A-P02Q-014 |

## 6. User Stories

### US-001 — Sign up as a pet owner with my first pet

- **Epic:** EPIC-001
- **Requirement(s):** FR-001, FR-005, NFR-001
- **User Story:** As a pet owner, I want to create an account with my name, email and password and the data of at least one pet, so that I can use the platform to find services and book appointments for my pet.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-006, P01-MVP-005, P01-NEED-002, P01-NEED-009, P01-SUCCESS-001, P01-SUCCESS-005, A-P01Q-010, A-P01Q-012, A-P02Q-006, A-P02Q-011, A-P02Q-012

#### Acceptance Criteria

- AC-001:
  - Given a person without a pet owner account
  - When they submit a name, an email, a password and one pet with at least its name, age and breed
  - Then a pet owner account is created with that pet registered
- AC-002:
  - Given a person completing pet owner sign-up
  - When they try to finish without registering any pet
  - Then the account is not created and they are told that at least one pet is required
- AC-003:
  - Given a person completing pet owner sign-up
  - When the name, email or password, or the pet's name, age or breed, is missing
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

#### Business Rules

- BR-001, BR-003, BR-032, BR-036, BR-037

#### Edge Cases

- EDGE-001, EDGE-002

#### Dependencies

- None

#### Open Questions

- None

### US-002 — Sign up as a provider

- **Epic:** EPIC-001
- **Requirement(s):** FR-002, NFR-001
- **User Story:** As a veterinary clinic or independent veterinarian, I want to create a provider account indicating which of the two I am, so that I can publish my services and products to pet owners.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-006, P01-NEED-009, P01-SUCCESS-002, P01-SUCCESS-005, A-P01Q-005, A-P01Q-011, A-P01Q-012, A-P02Q-012

#### Acceptance Criteria

- AC-006:
  - Given a person without a provider account
  - When they submit a name, an email, a password and the provider type (clinic or independent veterinarian)
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

#### Business Rules

- BR-001, BR-002, BR-036

#### Edge Cases

- EDGE-002

#### Dependencies

- None

#### Open Questions

- None

### US-003 — Sign in to my interface

- **Epic:** EPIC-001
- **Requirement(s):** FR-003, FR-004, NFR-002
- **User Story:** As a registered user (pet owner or provider), I want to sign in with my email and password, choosing the account type I want to enter as, so that I can use the interface that corresponds to that account type.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-006, P01-NEED-009, P01-SUCCESS-005, A-P01Q-012, A-P02Q-012

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

#### Business Rules

- BR-001, BR-036

#### Edge Cases

- EDGE-003, EDGE-020

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
- **P01 trace:** P01-MVP-005, P01-NEED-002, P01-SUCCESS-001, A-P01Q-031, A-P02Q-006, A-P02Q-011

#### Acceptance Criteria

- AC-014:
  - Given a signed-in pet owner
  - When they submit a new pet with at least its name, age and breed
  - Then the pet is added to their list of pets
- AC-015:
  - Given a signed-in pet owner adding a pet
  - When the pet's name, age or breed is missing
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
- **P01 trace:** P01-MVP-005, P01-NEED-002, P01-SUCCESS-001, A-P01Q-031, A-P02Q-011

#### Acceptance Criteria

- AC-019:
  - Given a signed-in pet owner viewing one of their pets
  - When they change one of its fields and save
  - Then the pet shows the updated data
- AC-020:
  - Given a signed-in pet owner editing a pet
  - When they leave its name, age or breed empty and save
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
- **User Story:** As a provider, I want to set my name, my contact phone and email and, optionally, my address, so that pet owners can identify and reach me.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-008, P01-NEED-010, P01-SUCCESS-002, A-P01Q-021, A-P01Q-030, A-P02Q-010

#### Acceptance Criteria

- AC-023:
  - Given a signed-in provider
  - When they save a name, a phone, an email and an address
  - Then their public profile shows that information
- AC-024:
  - Given a signed-in provider
  - When they save their profile without an address
  - Then the profile is saved and shown without an address

#### Business Rules

- BR-025, BR-026, BR-038

#### Edge Cases

- EDGE-017

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-009

### US-009 — Set my working days and hours

- **Epic:** EPIC-003
- **Requirement(s):** FR-010
- **User Story:** As a provider, I want to define the days and hours in which I accept appointments, so that owners can only book me when I work.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
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
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-003, P01-NEED-006, P01-SUCCESS-002, A-P01Q-008, A-P01Q-009, A-P02Q-002, A-P02Q-006

#### Acceptance Criteria

- AC-027:
  - Given a signed-in provider
  - When they publish a service with a name, a price, one species (dog or cat) and a modality (clinic, home, or both)
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

#### Business Rules

- BR-006, BR-007, BR-025, BR-027, BR-032

#### Edge Cases

- EDGE-017

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-009

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
- **Status:** DEFINED_WITH_ASSUMPTIONS
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
- **Status:** DEFINED_WITH_ASSUMPTIONS
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
- **Status:** DEFINED_WITH_ASSUMPTIONS
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
- **Status:** PENDING_DECISION
- **P01 trace:** P01-MVP-002, P01-NEED-004, P01-SUCCESS-004, P01-SUCCESS-007, A-P01Q-019, A-P01Q-022, A-P01Q-025, A-P01Q-031, A-P02Q-005

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

#### Business Rules

- BR-005, BR-010, BR-011, BR-012, BR-013, BR-014, BR-024

#### Edge Cases

- EDGE-004, EDGE-005, EDGE-006, EDGE-007, EDGE-009, EDGE-016

#### Dependencies

- DEP-001, DEP-002, DEP-005, DEP-006

#### Open Questions

- P02-Q-004

### US-020 — Book a home visit

- **Epic:** EPIC-006
- **Requirement(s):** FR-022, FR-023
- **User Story:** As a pet owner, I want to give my address when I book a service at home, so that the provider knows where to attend my pet.
- **Scope:** MVP_CORE
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-002, P01-NEED-004, P01-SUCCESS-004, A-P01Q-017

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
  - Given a service offered both at the clinic and at home
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
- **Status:** DEFINED_WITH_ASSUMPTIONS
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
- **Status:** PENDING_DECISION
- **P01 trace:** P01-MVP-009, P01-NEED-011, P01-SUCCESS-008, A-P01Q-024, A-P02Q-003

#### Acceptance Criteria

- AC-069:
  - Given a signed-in pet owner viewing an in-stock product
  - When they enter a delivery address and place the order
  - Then the order is registered directly with status Confirmed, with no request, reservation or payment step, and both the owner and the provider can see it
- AC-070:
  - Given a pet owner placing an order
  - When they do not enter a delivery address
  - Then the order is not placed and the address is indicated as required
- AC-071:
  - Given a signed-in pet owner with no registered pets
  - When they order a product
  - Then the order is placed (pets are required only to book services: P02-ASM-009)
- AC-089:
  - Given a product marked as out of stock
  - When a pet owner tries to order it
  - Then the order is not allowed

#### Business Rules

- BR-019, BR-020, BR-021, BR-022, BR-023, BR-027, BR-028, BR-030

#### Edge Cases

- EDGE-018, EDGE-021

#### Dependencies

- DEP-001, DEP-004, DEP-008, DEP-010

#### Open Questions

- P02-Q-001

### US-028 — See the product orders placed with me

- **Epic:** EPIC-008
- **Requirement(s):** FR-033, NFR-002
- **User Story:** As a provider, I want to see the orders owners place for my products, so that I know what to deliver and where.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-009, P01-NEED-012, P01-SUCCESS-008, A-P01Q-024, A-P02Q-003, A-P02Q-P036

#### Acceptance Criteria

- AC-072:
  - Given a provider with orders placed for its products
  - When they open their orders
  - Then they see each order with the product, the owner's name, the delivery address and the status
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
- **P01 trace:** P01-MVP-009, P01-NEED-011, A-P02Q-003

#### Acceptance Criteria

- AC-090:
  - Given a signed-in pet owner with orders
  - When they open their orders
  - Then each order shows the product, the provider, the delivery address and the status
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
- **Status:** DEFINED_WITH_ASSUMPTIONS
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
- **Status:** DEFINED_WITH_ASSUMPTIONS
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

- P02-Q-018

### US-032 — Cancel an order as a provider

- **Epic:** EPIC-008
- **Requirement(s):** FR-037
- **User Story:** As a provider, I want to cancel an order placed with me that has not been dispatched, so that I am not expected to deliver an order I cannot fulfil.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
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

- P02-Q-018

### US-033 — Indicate whether a product is in stock

- **Epic:** EPIC-008
- **Requirement(s):** FR-038
- **User Story:** As a provider, I want to indicate whether each of my products is in stock, so that owners cannot order products I do not have.
- **Scope:** MVP_SUPPORTING
- **Status:** PENDING_DECISION
- **P01 trace:** P01-MVP-009, P01-NEED-012, A-P02Q-003

#### Acceptance Criteria

- AC-100:
  - Given a published product
  - When the provider marks it as out of stock
  - Then owners can still see it but cannot order it (P02-ASM-016)
- AC-101:
  - Given a product marked as out of stock
  - When the provider marks it as in stock again
  - Then owners can order it

#### Business Rules

- BR-030, BR-031

#### Edge Cases

- EDGE-021

#### Dependencies

- DEP-001, DEP-004, DEP-008

#### Open Questions

- P02-Q-017

## 7. Business Rules

| ID | Rule | Related Requirements / Stories | Status |
|---|---|---|---|
| BR-001 | There are two account types: pet owner and provider. Each has its own interface. | FR-001, FR-002, FR-004; US-001, US-002, US-003 | CONFIRMED (A-P01Q-012) |
| BR-002 | A provider is either a veterinary clinic or an independent veterinarian, recorded as an attribute of the provider account and shown as a label on its offerings and profile. | FR-002, FR-019, FR-020; US-002 | CONFIRMED (A-P01Q-011; attribute approved by AVISO-R1) |
| BR-003 | A pet owner must register at least one pet to create an account. | FR-001; US-001 | CONFIRMED (A-P01Q-010) |
| BR-004 | After sign-up, a pet owner may remove pets, including the last one. | FR-008; US-007 | CONFIRMED (A-P02Q-P038) |
| BR-005 | Booking an appointment requires at least one registered pet, and each appointment is for exactly one of the owner's pets. | FR-022; US-007, US-019 | CONFIRMED (A-P01Q-022, -031; A-P02Q-P038) |
| BR-006 | Each service and each product applies to exactly one species. | FR-011, FR-014, FR-018; US-010, US-011, US-013, US-014, US-017 | CONFIRMED (A-P01Q-008, -028) |
| BR-007 | A service is offered at the provider's clinic, at the owner's home, or both. Both clinics and independent veterinarians can offer home services. | FR-011, FR-019, FR-023; US-010, US-011, US-020 | CONFIRMED (A-P01Q-009; P00 MVP-005) |
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
| BR-020 | A product order is delivered to an address the owner enters when ordering. | FR-032; US-027 | CONFIRMED (A-P01Q-024); per-order entry ASSUMED (P01-ASSUMPTION-026) |
| BR-021 | Ordering a product does not require a registered pet. | FR-032; US-027 | ASSUMED (P02-ASM-009, from A-P01Q-031) |
| BR-022 | Contents of an order: one or several products, and quantities. | FR-032; US-027 | REQUIRES_DECISION (P02-Q-001; not answered and no assumed answer existed) |
| BR-023 | Order statuses are Confirmed (when placed), Dispatched/In delivery (prepared and the courier is on the way), and Closed (delivered). Only the provider changes the status, one step forward at a time, never backwards. Owners and providers see their orders and statuses. | FR-032 to FR-035; US-027 to US-030 | CONFIRMED (A-P02Q-003); single combined second status ASSUMED (P02-ASM-015) |
| BR-024 | Whether a service for one species can be booked for a pet of another species, or for a pet with no species recorded (species is optional for pets). | FR-022; US-019 | REQUIRES_DECISION (P02-Q-004; not answered and no assumed answer existed) |
| BR-025 | Each provider maintains its own profile, working hours and catalog; there is no administrator role. | FR-009, FR-010, FR-011, FR-014; US-008, US-009, US-010, US-013 | CONFIRMED (A-P01Q-005, -006) |
| BR-026 | A provider's address is optional. | FR-009, FR-020; US-008, US-018 | CONFIRMED (A-P01Q-030) |
| BR-027 | Services and products show a price. Payment is not made in the platform. | FR-011, FR-014, FR-019, FR-020; US-010, US-013, US-016, US-018, US-027 | CONFIRMED (A-P02Q-002; P01-OOS-004); price mandatory and in Colombian pesos ASSUMED (P02-ASM-014) |
| BR-028 | The provider delivers ordered products outside the platform (by a courier); the platform has no delivery logistics or tracking. | FR-033; US-027, US-028 | CONFIRMED (A-P02Q-P036, A-P02Q-003; P01-OOS-004) |
| BR-029 | The owner and the provider can cancel an order only while it has not been dispatched (status Confirmed). | FR-036, FR-037; US-031, US-032 | CONFIRMED (A-P02Q-003); shown as cancelled ASSUMED (P02-ASM-011) |
| BR-030 | A removed or out-of-stock product cannot be ordered. | FR-016, FR-032, FR-038; US-015, US-027, US-033 | CONFIRMED (A-P02Q-003) |
| BR-031 | How product stock is represented: an in-stock / out-of-stock indicator, or a quantity that orders reduce. | FR-038; US-033 | REQUIRES_DECISION (P02-Q-017) |
| BR-032 | Species are predefined; in the MVP only dog and cat. | FR-005, FR-011, FR-014, FR-018; US-001, US-004, US-010, US-013, US-017 | CONFIRMED (A-P02Q-006) |
| BR-033 | Working hours can differ by day and must start and end on the hour. | FR-010; US-009 | CONFIRMED (A-P02Q-007) |
| BR-034 | Upcoming appointments are cancelled automatically when their pet is removed, their service is removed, or a change of working hours leaves them outside the new hours. | FR-008, FR-010, FR-013; US-007, US-009, US-012 | CONFIRMED (A-P02Q-008); scope limited to affected appointments REFINED |
| BR-035 | Cancelled appointments remain visible, shown as cancelled. | FR-026, FR-029; US-007, US-009, US-012, US-021, US-022, US-024, US-025 | CONFIRMED (A-P02Q-016) |
| BR-036 | The same email can be used for one pet owner account and one provider account; at sign-in the user chooses the type to enter as. | FR-001, FR-002, FR-003; US-001, US-002, US-003 | CONFIRMED (A-P02Q-012; A-P01Q-012); one account per type per email ASSUMED (P02-ASM-002) |
| BR-037 | A pet's mandatory fields are name, age and breed; species, weight and height are optional. | FR-005; US-001, US-004, US-006 | CONFIRMED (A-P02Q-011) |
| BR-038 | A provider's contact information is a phone number and an email. | FR-009, FR-020; US-008, US-018 | CONFIRMED (A-P02Q-010) |

## 8. Edge Cases

| ID | Description | Related Story | Expected Behavior | Status |
|---|---|---|---|---|
| EDGE-001 | A person tries to finish pet owner sign-up without registering a pet. | US-001 | The account is not created; the owner is told that at least one pet is required. | DEFINED |
| EDGE-002 | A person signs up with an email that already belongs to an account. | US-001, US-002 | Allowed if the existing account is of the other type; rejected if it is of the same type. | DEFINED (A-P02Q-012) / ASSUMED for same type (P02-ASM-002) |
| EDGE-003 | A user signs in with an incorrect email or password, or as a type they have not registered. | US-003 | Access is not granted. | DEFINED |
| EDGE-004 | A pet owner with no registered pets tries to book. | US-019 | Booking is not allowed; the owner is told to register a pet. | DEFINED |
| EDGE-005 | A pet owner tries to book outside the provider's working days and hours. | US-019 | Those slots are not offered. | DEFINED |
| EDGE-006 | A pet owner tries to book an independent veterinarian in a slot that already has an appointment. | US-019 | The slot is not offered. | DEFINED (A-P02Q-005) |
| EDGE-007 | Two pet owners try to book the same independent veterinarian slot at almost the same time. | US-019 | Only one appointment is scheduled in that slot; the other owner is told the slot is no longer available. | DEFINED (consequence of BR-013) |
| EDGE-008 | A pet owner books a home visit without entering an address. | US-020 | The appointment is not booked; the address is indicated as required. | DEFINED |
| EDGE-009 | A pet owner tries to book or reschedule to a date and time that has already passed. | US-019, US-023 | Those slots are not offered. | ASSUMED (P02-ASM-006) |
| EDGE-010 | A user tries to cancel or reschedule an appointment whose start time has passed. | US-022, US-023, US-025, US-026 | The action is not allowed. | DEFINED |
| EDGE-011 | A pet owner removes a pet that has upcoming appointments. | US-007 | The pet's upcoming appointments are cancelled and shown as cancelled. | DEFINED (A-P02Q-008, -016) |
| EDGE-012 | A provider removes a service that has upcoming appointments. | US-012 | Those appointments are cancelled and shown as cancelled. | DEFINED (A-P02Q-008, -016) |
| EDGE-013 | A provider changes its working hours so that existing appointments fall outside them. | US-009 | The appointments outside the new hours are cancelled and shown as cancelled. | DEFINED (A-P02Q-008, -016) |
| EDGE-014 | A provider has not defined working days and hours. | US-009 | No appointment slots are offered for its services. | DEFINED |
| EDGE-015 | A search returns no results. | US-016 | The owner is told that there are no results. | DEFINED |
| EDGE-016 | A pet owner books a service for a pet of a different species than the service's species, or for a pet with no species recorded. | US-019 | REQUIRES_DECISION: allowed, warned, or blocked. | REQUIRES_DECISION (P02-Q-004) |
| EDGE-017 | A provider without an address publishes a service offered at its clinic. | US-008, US-010 | REQUIRES_DECISION: whether an address is required to offer in-clinic services. | REQUIRES_DECISION (P02-Q-009) |
| EDGE-018 | A pet owner places an order without a delivery address. | US-027 | The order is not placed; the address is indicated as required. | DEFINED |
| EDGE-019 | A provider removes a product that has already been ordered. | US-015 | New orders are not possible; existing orders keep their status. | DEFINED for new orders (A-P02Q-003) / ASSUMED for existing orders (P02-ASM-012) |
| EDGE-020 | A signed-in user tries to use a function of the other account type, or another user's data. | US-003 | Access is denied. | DEFINED (NFR-002) |
| EDGE-021 | A pet owner tries to order a product that is out of stock. | US-027, US-033 | The order is not allowed. | DEFINED (A-P02Q-003) |
| EDGE-022 | The owner or the provider tries to cancel an order that has been dispatched or closed. | US-031, US-032 | The cancellation is not allowed. | DEFINED (A-P02Q-003) |
| EDGE-023 | The provider tries to move an order back to an earlier status, or to skip a status. | US-030 | The change is not allowed. | DEFINED (A-P02Q-003) |
| EDGE-024 | A pet owner tries to change the status of an order. | US-030 | The change is not allowed. | DEFINED (A-P02Q-003) |
| EDGE-025 | A provider sets working hours that do not start or end on the hour. | US-009 | The hours are not saved. | DEFINED (A-P02Q-007) |
| EDGE-026 | The provider tries to change the status of a cancelled order. | US-030 | The change is not allowed. | ASSUMED (P02-ASM-011) |

## 9. Dependencies

Dependencies are between product capabilities, not technical components.

| ID | Dependency | Related Items | Status |
|---|---|---|---|
| DEP-001 | Every story after sign-up and sign-in requires a signed-in user of the right account type. | FR-001 to FR-004 → US-004 to US-033 | Functional dependency |
| DEP-002 | Editing, removing and booking for a pet depend on pet registration. | FR-005 → FR-007, FR-008, FR-022; US-006, US-007, US-019 | Functional dependency |
| DEP-003 | Updating, removing, searching and booking services depend on published services. | FR-011 → FR-012, FR-013, FR-017, FR-021; US-011, US-012, US-016, US-017 | Functional dependency |
| DEP-004 | Updating, removing, searching, stock and ordering of products depend on published products. | FR-014 → FR-015, FR-016, FR-017, FR-032, FR-038; US-014, US-015, US-016, US-017, US-027, US-033 | Functional dependency |
| DEP-005 | The provider profile and booking show information the provider has entered. | FR-009 → FR-020; US-018, US-019 | Functional dependency |
| DEP-006 | Available slots depend on the provider's working days and hours. | FR-010 → FR-021; US-019, US-020 | Functional dependency |
| DEP-007 | Viewing, cancelling and rescheduling appointments depend on booking. | FR-022 → FR-026 to FR-031; US-021 to US-026 | Functional dependency |
| DEP-008 | The final definition of order contents and of stock depends on team decisions. | FR-032, FR-038; US-027, US-033; P02-Q-001, P02-Q-017 | Decision dependency (open) |
| DEP-009 | Viewing orders, updating their status and cancelling them depend on placing orders. | FR-032 → FR-033 to FR-037; US-028 to US-032 | Functional dependency |
| DEP-010 | Ordering depends on the provider's stock indication. | FR-038 → FR-032; US-027, US-033 | Functional dependency |

## 10. Assumptions and Open Questions

### Assumptions

| ID | Assumption | Impact | Source |
|---|---|---|---|
| P02-ASM-001 | Users sign in with their email and password (the only credentials stated by the team). | Low | P00 ANS-Q015 — OPEN |
| P02-ASM-002 | An email can have at most one account of each type (one pet owner and one provider). *Revised in v2.0:* A-P02Q-012 allows the same email for both types. | Low | A-P02Q-012 — OPEN (revised) |
| P02-ASM-004 | Services and products have a name, so that owners can identify them. | Low | Refinement of A-P01Q-008 — OPEN |
| P02-ASM-005 | When a service is offered both at the clinic and at home, the owner chooses the modality when booking. | Low | Refinement of A-P01Q-009, -017 — OPEN |
| P02-ASM-006 | Appointments cannot be booked or moved to a time that has already passed. | Low | Refinement of A-P01Q-019 — OPEN |
| P02-ASM-007 | All dates and times are Bogotá local time. | Low | A-P01Q-003; P01-OOS-003 — OPEN |
| P02-ASM-008 | The provider's appointments space shows the service, date and time, pet, owner's name, modality, status and, for home visits, the address. | Low | Refinement of A-P01Q-017, -026 — OPEN |
| P02-ASM-009 | Ordering a product does not require a registered pet; the team said a pet is required to book services. | Low | A-P01Q-031; A-P02Q-P038 — OPEN |
| P02-ASM-010 | Working hours are a weekly pattern: each day of the week has its own hours. | Low | A-P02Q-007 — PARTLY RESOLVED: per-day hours on the hour confirmed; weekly recurrence assumed |
| P02-ASM-011 | A cancelled order is shown as cancelled to both parties and its status can no longer change, by analogy with cancelled appointments. | Medium | A-P02Q-003, -016 — OPEN, new |
| P02-ASM-012 | Orders placed before a product is removed keep their status and can still be dispatched, closed or cancelled. | Medium | A-P02Q-003 (answers only new orders) — OPEN, new |
| P02-ASM-013 | Text search matches the names of services and products. | Low | A-P02Q-013 — OPEN, new |
| P02-ASM-014 | A price is mandatory when publishing a service or product, and prices are in Colombian pesos. | Low | A-P02Q-002; Bogotá coverage — OPEN, new |
| P02-ASM-015 | "Dispatched or in delivery" is a single status. | Low | A-P02Q-003 ("despachadas o en entrega") — OPEN, new |
| P02-ASM-016 | An out-of-stock product stays visible in search and on the profile, but cannot be ordered. | Low | A-P02Q-003 — OPEN, new |
| P01-ASSUMPTION-002 | Providers want an additional channel to reach pet owners (no direct effect on requirements). | Medium | P01 — OPEN |
| P01-ASSUMPTION-026 | The delivery address is entered when the order is placed. | Low | P01 — OPEN |

**Resolved, confirmed or approved since v1.0:**

| ID | Assumption | Resolution |
|---|---|---|
| P02-ASM-003 | *(v1.0: all five pet fields are required.)* | RESOLVED: mandatory fields are name, age and breed |
| P01-ASSUMPTION-019 | Two account types; clinic or independent veterinarian is a provider attribute. | APPROVED by AVISO-R1 |
| P01-ASSUMPTION-021 | An independent veterinarian accepts one appointment per slot. | CONFIRMED (A-P02Q-005) |
| P01-ASSUMPTION-022 | Providers see orders in their interface and deliver outside the platform. | CONFIRMED (A-P02Q-003, -P036) |
| P01-ASSUMPTION-023 | Owners have an appointments view, where they see changes made by the provider. | APPROVED by AVISO-R1 |
| P01-ASSUMPTION-025 | An owner may remove all pets after sign-up; one pet is needed to book. | CONFIRMED (A-P02Q-P038) |

### Open Questions

| ID | Question | Affected Items | Decision Required |
|---|---|---|---|
| P02-Q-001 | Can an order contain several products, and quantities? **PROPOSAL (not a decision):** one product per order, in a quantity chosen by the owner. | FR-032; US-027; BR-022 | Yes: not answered; no assumed answer existed, so AVISO-R1 does not apply (OPEN) |
| P02-Q-004 | Can a service for one species be booked for a pet of another species, or for a pet with no species recorded (species is optional for pets)? **PROPOSAL:** only pets of the service's species can be chosen. | FR-022; US-019; BR-024; EDGE-016 | Yes: not answered; no assumed answer existed (OPEN) |
| P02-Q-009 | Must a provider have an address to offer services at its clinic? **PROPOSAL:** yes. | FR-009, FR-011; US-008, US-010; EDGE-017 | Yes: not answered; no assumed answer existed (OPEN) |
| P02-Q-017 | How is stock represented: an in-stock / out-of-stock indicator set by the provider, or a quantity that orders reduce? **PROPOSAL:** an indicator set by the provider. **New.** | FR-038; US-033; BR-031 | Yes: before P05 (OPEN) |
| P02-Q-018 | Confirm that a cancelled order is shown as cancelled and cannot change status (P02-ASM-011). **New.** | FR-036, FR-037; US-031, US-032; EDGE-026 | Confirm assumption (OPEN) |
| P01-QUESTION-033 | Regenerate and validate P00 from the consolidated input (carried; recommendation). | Source of truth | Before P03 (OPEN) |
| P01-QUESTION-032 | Project dates (carried). The build-order PROPOSAL is approved by AVISO-R1 and passed to P03; dates are still unknown. | Planning | P03 (PARTLY RESOLVED) |

**Resolved since v1.0:**

| ID | Question | Resolution |
|---|---|---|
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
| P02-Q-015 | Sign-out required? | RESOLVED by AVISO-R1: the assumed answer (not included) is approved |
| P02-Q-016 | Cancelled appointments shown? | RESOLVED (A-P02Q-016) |
| P01-QUESTION-029 | Clinic or independent vet as attribute? | RESOLVED by AVISO-R1 |
| P01-QUESTION-036 | Delivery outside the platform? | RESOLVED (A-P02Q-P036) |
| P01-QUESTION-038 | Remove all pets? | RESOLVED (A-P02Q-P038) |
| P01-QUESTION-039 | Owner appointments view? | RESOLVED by AVISO-R1 |

## 11. Requirements Traceability

| P01 Element | Epic | Requirement | User Story | Acceptance Criteria |
|---|---|---|---|---|
| P01-MVP-006 Accounts | EPIC-001 | FR-001 to FR-004; NFR-001, NFR-002 | US-001, US-002, US-003 | AC-001–AC-013, AC-074–AC-077 |
| P01-MVP-005 Pet management | EPIC-002 | FR-005 to FR-008 | US-001, US-004 to US-007 | AC-001–AC-005, AC-014–AC-022, AC-074–AC-075, AC-078–AC-079 |
| P01-MVP-008 Provider public profile | EPIC-003, EPIC-005 | FR-009, FR-020 | US-008, US-018 | AC-023–AC-024, AC-044–AC-045 |
| P01-MVP-010 Working days and hours | EPIC-003 | FR-010 | US-009 | AC-025–AC-026, AC-080–AC-081 |
| P01-MVP-003 Provider catalog | EPIC-004 | FR-011 to FR-016 | US-010 to US-015 | AC-027–AC-037, AC-082–AC-085 |
| P01-MVP-001 Search | EPIC-005 | FR-017 to FR-019 | US-016, US-017 | AC-038–AC-043, AC-086 |
| P01-MVP-002 Scheduling | EPIC-006 | FR-021 to FR-025 | US-019, US-020 | AC-046–AC-054 |
| P01-MVP-007 Appointment management | EPIC-007 | FR-026 to FR-031 | US-021 to US-026 | AC-055–AC-068, AC-087–AC-088 |
| P01-MVP-009 Product ordering | EPIC-008 | FR-032 to FR-038 | US-027 to US-033 | AC-069–AC-073, AC-089–AC-101 |
| P01-SUCCESS-007 End-to-end journey without outside channels | EPIC-001, -002, -005, -006 | FR-001, FR-005, FR-017, FR-018, FR-020 to FR-022 | US-001, US-016, US-017, US-018, US-019 | AC-001–AC-005, AC-038–AC-051, AC-074–AC-075, AC-086 |
| P00 [PLAT], ANS-Q016; A-P02Q-014 Web, Chrome, computers and phones, Spanish | All | NFR-003, NFR-004 | All | All |

Each story's full P01 trace, including needs, success criteria and team answers, is listed under the story in §6 and in `product_backlog.json` (`traceability.p01_elements`).

## 12. Requirements Status

**READY_WITH_ASSUMPTIONS**

The requirements cover every MVP capability in P01 v4.0, as refined by the team's answers. They trace to P01 and to cited answers, and contain no out-of-scope functionality or implementation decisions. They can go to P03 — Planning, carrying the documented assumptions.

**Open before baselining:**

1. **Order contents** (P02-Q-001) and **stock representation** (P02-Q-017). These affect US-027 and US-033.
2. **Species mismatch at booking**, including pets with no species (P02-Q-004). This affects US-019.
3. **Address for in-clinic services** (P02-Q-009). This affects US-008 and US-010.
4. **New assumptions to confirm:**
   - Cancelled orders are shown as cancelled (P02-ASM-011).
   - Existing orders are kept when a product is removed (P02-ASM-012).
   - Text search matches names (P02-ASM-013).
   - Price is mandatory and in Colombian pesos (P02-ASM-014).
   - "Dispatched or in delivery" is a single status (P02-ASM-015).
   - Out-of-stock products stay visible (P02-ASM-016).

The requirements are **not** baselined.

### Change Log (v1.0 → v2.0)

| Change | Source |
|---|---|
| Sign-in now includes choosing the account type; the same email can hold one owner and one provider account (FR-003, BR-036; AC-074, -076, -077). | A-P01Q-012; A-P02Q-012 |
| Pet fields: name added; name, age and breed mandatory; species dog or cat (FR-005; BR-032, BR-037; AC-075, -078). | A-P02Q-006, -011 |
| Profile contact is phone and email (FR-009, FR-020; BR-038). | A-P02Q-010 |
| Working hours per day, on the hour; affected appointments cancelled on change (FR-010; BR-033, BR-034; AC-080, -081). | A-P02Q-007, -008 |
| Prices on services and products (FR-011, FR-014, FR-019, FR-020; BR-027; AC-082, -084). | A-P02Q-002 |
| Automatic cancellation when a pet or service is removed (FR-008, FR-013; AC-079, -083); cancelled appointments shown as cancelled (FR-026, FR-029; BR-035; AC-087, -088). | A-P02Q-008, -016 |
| Text search confirmed; text and species filter combined (FR-017; AC-086). | A-P02Q-013 |
| Independent vet one per slot confirmed (FR-025, BR-013). | A-P02Q-005 |
| Order statuses, owner order view, status updates, cancellation before dispatch, stock rule: FR-034 to FR-038, US-029 to US-033, BR-029 to BR-031, EDGE-021 to EDGE-024, EDGE-026, AC-089 to AC-101. | A-P02Q-003 |
| NFR-003 updated (Chrome, computers, phones); NFR-004 Spanish added; both apply to all stories. | A-P02Q-014 |
| FR-020 and US-018 reclassified MVP_SUPPORTING; DEP-001 reworded and referenced from US-004 to US-033; DEP-009, DEP-010 added. | P02 v1.0 validation VAL-006, -008 |
| P01-ASSUMPTION-019, -023 and the no-sign-out answer approved; build-order PROPOSAL approved for P03. | AVISO-R1 |
| P02-ASM-003 resolved; P02-ASM-002 and -010 revised; P02-ASM-011 to -016 added (labeled). | Answers; gaps |
| Questions P02-Q-002, -003, -005 to -008, -010 to -016 and P01-QUESTION-029, -036, -038, -039 resolved; P02-Q-017, -018 added; P02-Q-001, -004, -009 open with a PROPOSAL. | Answers |
