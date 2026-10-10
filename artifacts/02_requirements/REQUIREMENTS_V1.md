# Requirements Specification

> **Classification legend:** **DIRECT** = stated in P01 or by a team answer · **REFINED** = made more concrete without adding scope · **ASSUMED** = interpretation labeled as an assumption · **REQUIRES_DECISION** = the team must decide.
> **Source references:** `P01-*` identifiers refer to `PRODUCT_VISION.md` v4.0. `A-P01Q-0nn` are team answers recorded in `PROJECT_CONTEXT_V4.md` (same convention as P01). `P00 ANS-Q0nn` are answers recorded in `INITIAL_PROJECT_INPUT_V2.md`.
> **ID note:** P02 assumptions and questions use the prefixes `P02-ASM-` and `P02-Q-`, because `ASM-` and `Q-` are already used by P00.

## 1. Document Metadata

- **Version:** 1.0
- **Stage:** P02 — Requirements Engineering
- **Status:** READY_WITH_ASSUMPTIONS
- **Generated From:** `artifacts/01_discovery/PRODUCT_VISION.md` v4.0 (reissued from the consolidated `PROJECT_CONTEXT_V4.md`). Received as `PRODUCT_VISION_V3.md`; verified by diff to be identical to Product Vision v4.0.
- **Validation Dependency:** `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md` v4.0, result **PASS_WITH_WARNINGS** (2 medium, 8 low).
- **Generation Date:** 2026-10-09
- **Companion artifact:** `artifacts/02_requirements/product_backlog.json` (same IDs and content).

### P01 warnings carried into P02

| P01 item | Effect on P02 |
|---|---|
| VAL-001: P00 body not regenerated | Requirements trace to Product Vision v4.0, which integrates all team answers; P01-QUESTION-033 carried. |
| VAL-002: product ordering under-defined | FR-032, FR-033 and US-027, US-028 are defined for what is confirmed; the rest is REQUIRES_DECISION (BR-022, BR-023, BR-027; P02-Q-001 to -003). Status PENDING_DECISION. |
| VAL-004: independent-vet rule assumed | FR-025 and BR-013 are labeled ASSUMED (P02-Q-005). |
| VAL-005: no notifications | No notification requirement added; owners see provider changes in their appointments (FR-026, ASSUMED). |
| P01-DECISION-001: build-order PROPOSAL | Not applied. Priority, releases and sprints are left to P03 (all `null` in the backlog). |

## 2. Requirements Overview

### 2.1 Scope Summary

The requirements cover the MVP defined in P01 v4.0: accounts (owner and provider), pet management, provider profile and working hours, provider catalog (services and products), search with species filter, one-hour appointment scheduling, appointment management by both parties, and direct product ordering without payment. Platform: web (required).

**Not included (P01 Out of Scope, confirmed):** provider verification; area determination; cities other than Bogotá; payments, notifications and real-time tracking; different clinic/home scheduling rules; ratings and reviews; appointment confirmation; administrator role; clinic staff or capacity management; product requests or reservations.

**No basis for:** performance, availability, accessibility or privacy targets beyond password hashing (A-P01Q-015). None are invented.

### 2.2 Requirement Status

| Item | Count | Notes |
|---|---|---|
| Epics | 8 | |
| Functional requirements | 33 | ASSUMED: 3, DIRECT: 20, DIRECT / ASSUMED: 8, REFINED: 2 |
| Non-functional requirements | 3 | |
| User stories | 28 | DEFINED: 9, DEFINED_WITH_ASSUMPTIONS: 17, PENDING_DECISION: 2 |
| Acceptance criteria | 73 | |
| Business rules | 28 | 4 REQUIRES_DECISION |
| Edge cases | 20 | 6 REQUIRES_DECISION |
| Dependencies | 8 | |
| Assumptions | 17 | P02: 10; carried from P01: 7 |
| Open questions | 22 | P02: 16; carried from P01: 6 |

**Story status values:** `DEFINED` (no assumption), `DEFINED_WITH_ASSUMPTIONS` (depends on a labeled assumption), `PENDING_DECISION` (part of its behavior is REQUIRES_DECISION).

### 2.3 Requirement Classification

| Scope | Functional requirements | Epics |
|---|---|---|
| MVP_CORE | 15 | EPIC-004, EPIC-005, EPIC-006 |
| MVP_SUPPORTING | 18 | EPIC-001, EPIC-002, EPIC-003, EPIC-007, EPIC-008 |
| FUTURE | 0 | — |
| OUT_OF_SCOPE | 0 | — |
| REQUIRES_DECISION | 0 | — |

Undecided capabilities (order contents, prices, order handling, species mismatch) are recorded as REQUIRES_DECISION business rules and questions, not as requirements.

## 3. Epics

| Epic ID | Name | Description | Product Objective | Scope |
|---|---|---|---|---|
| EPIC-001 | Accounts and Access | Self-registration as a pet owner or as a provider, sign-in, and access to the interface of the account type. | Separate the two sides of the platform and link pets, catalogs, appointments and orders to their users. | MVP_SUPPORTING |
| EPIC-002 | Pet Management | Registration and maintenance of the pet owner's pets. | Let appointments be booked for a specific pet. | MVP_SUPPORTING |
| EPIC-003 | Provider Profile and Working Hours | The provider's public profile and the days and hours in which it accepts appointments. | Let owners identify and reach a provider, and define when it can be booked. | MVP_SUPPORTING |
| EPIC-004 | Provider Catalog | Publication and maintenance of the provider's services and products. | Provide the offerings that owners can find, book and order. | MVP_CORE |
| EPIC-005 | Search and Discovery | Search of services and products across all providers in Bogotá, species filter, and provider profiles. | Let owners find veterinary services in one place without using other channels. | MVP_CORE |
| EPIC-006 | Appointment Scheduling | Booking of one-hour appointments for a pet within the provider's working hours, at the clinic or at home. | Let owners access the service they found: the outcome of the core journey. | MVP_CORE |
| EPIC-007 | Appointment Management | Viewing, cancelling and rescheduling appointments, by the owner and by the provider. | Keep both parties' schedules accurate. | MVP_SUPPORTING |
| EPIC-008 | Product Ordering | Direct ordering of products to the owner's address, without payment in the platform. | Let owners obtain products from the platform (team decision; not required for the core value). | MVP_SUPPORTING |

**Related Product Vision elements:**

- **EPIC-001:** P01-MVP-006, P01-NEED-009, A-P01Q-005, A-P01Q-012
- **EPIC-002:** P01-MVP-005, P01-NEED-002, A-P01Q-010, A-P01Q-031
- **EPIC-003:** P01-MVP-008, P01-MVP-010, P01-NEED-010, P01-NEED-012, A-P01Q-021, A-P01Q-025, A-P01Q-030
- **EPIC-004:** P01-MVP-003, P01-NEED-006, P01-NEED-007, A-P01Q-002, A-P01Q-008, A-P01Q-009, A-P01Q-023, A-P01Q-028
- **EPIC-005:** P01-MVP-001, P01-NEED-001, P01-NEED-003, P01-NEED-010, A-P01Q-003, A-P01Q-011, A-P01Q-021, A-P01Q-022
- **EPIC-006:** P01-MVP-002, P01-NEED-004, P01-SUCCESS-007, A-P01Q-017, A-P01Q-019, A-P01Q-022, A-P01Q-025, A-P01Q-031
- **EPIC-007:** P01-MVP-007, P01-NEED-004, P01-NEED-008, A-P01Q-019, A-P01Q-026
- **EPIC-008:** P01-MVP-009, P01-NEED-011, P01-NEED-012, A-P01Q-024

## 4. Functional Requirements

Priority is not assigned in P02 (P03 — Planning). The **Traceability** column starts with the basis classification.

| ID | Requirement | Epic | Scope | Priority Status | Traceability |
|---|---|---|---|---|---|
| FR-001 | **Pet owner sign-up.** The platform shall allow a person to create a pet owner account by providing a name, an email and a password, and by registering at least one pet during sign-up. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-006, P01-MVP-005; P00 ANS-Q015; A-P01Q-010, -012 |
| FR-002 | **Provider sign-up.** The platform shall allow a person to create a provider account by providing a name, an email and a password, and by indicating whether the provider is a veterinary clinic or an independent veterinarian. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-006; A-P01Q-005, -011, -012; provider type as an account attribute: P01-ASSUMPTION-019 |
| FR-003 | **Sign-in.** The platform shall allow a registered user to sign in with their email and password. | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | REFINED — P01-MVP-006; P02-ASM-001 |
| FR-004 | **Interface by account type.** After signing in, the platform shall give each user access only to the interface of their account type (pet owner or provider). | EPIC-001 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — A-P01Q-012 |
| FR-005 | **Pet registration.** The platform shall allow a pet owner to register a pet with its species, weight, age, height and breed. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-005; P00 ANS-Q008; mandatory fields: P02-ASM-003 |
| FR-006 | **View pets.** The platform shall allow a pet owner to view the list of their registered pets. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | REFINED — P01-MVP-005 (needed to edit, remove and select pets) |
| FR-007 | **Edit pet.** The platform shall allow a pet owner to edit the data of one of their pets. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-005; A-P01Q-031 |
| FR-008 | **Remove pet.** The platform shall allow a pet owner to remove one of their pets, including their last remaining pet. | EPIC-002 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — A-P01Q-031; removing the last pet: P01-ASSUMPTION-025 |
| FR-009 | **Provider public profile.** The platform shall allow a provider to maintain a public profile containing its name, its contact information and, optionally, an address. | EPIC-003 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-008; A-P01Q-021, -030; content of 'contact': P02-Q-010 |
| FR-010 | **Working days and hours.** The platform shall allow a provider to define the days of the week and the hours in which it accepts appointments. | EPIC-003 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-010; A-P01Q-025; weekly pattern: P02-ASM-010; details: P02-Q-007 |
| FR-011 | **Publish service.** The platform shall allow a provider to publish a service, indicating its name, the single species it applies to, and whether it is offered at the provider's clinic, at the owner's home, or both. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-003; A-P01Q-008, -009; service name: P02-ASM-004 |
| FR-012 | **Update service.** The platform shall allow a provider to update the details of one of its services. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007; A-P01Q-023 |
| FR-013 | **Remove service.** The platform shall allow a provider to remove one of its services from its catalog. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007 |
| FR-014 | **Publish product.** The platform shall allow a provider to publish a product, indicating its name and the single species it applies to. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-003; A-P01Q-002, -028; product name: P02-ASM-004; price: P02-Q-002 |
| FR-015 | **Update product.** The platform shall allow a provider to update the details of one of its products. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007 |
| FR-016 | **Remove product.** The platform shall allow a provider to remove one of its products from its catalog. | EPIC-004 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-003; P01-NEED-007 |
| FR-017 | **Search offerings.** The platform shall allow a pet owner to search the services and products published by all providers, with no filtering by the owner's location. | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-001; A-P01Q-003, -022; P01-OOS-002; matching criteria: P02-Q-013 |
| FR-018 | **Species filter.** The platform shall allow a pet owner to filter search results by the species the service or product applies to, independently of the pets registered in their account. | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-001; A-P01Q-022 |
| FR-019 | **Result details.** Each search result shall show whether it is offered by a veterinary clinic or by an independent veterinarian and, for services, whether it is offered at the clinic, at home, or both. | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT — P01-NEED-003; A-P01Q-009, -011 |
| FR-020 | **View provider profile.** The platform shall allow a pet owner to view a provider's public profile, showing its name, address (if provided), contact information, provider type, and the services and products it offers. | EPIC-005 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-008; P01-NEED-010; A-P01Q-011, -021, -030 |
| FR-021 | **Show available slots.** For a selected service, the platform shall show the pet owner the available one-hour appointment slots within the provider's working days and hours. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-002; A-P01Q-021, -025 |
| FR-022 | **Book appointment.** The platform shall allow a pet owner with at least one registered pet to book an appointment for a selected service by choosing one of their pets and an available one-hour slot. The appointment is scheduled immediately, with no confirmation by the provider. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — P01-MVP-002; A-P01Q-019, -022, -025, -031 |
| FR-023 | **Home-visit address.** When the booked service is to be performed at the owner's home, the platform shall require the pet owner to enter the address of the visit when booking. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT / ASSUMED — A-P01Q-017; modality choice for services offered both ways: P02-ASM-005 |
| FR-024 | **Clinic availability.** For a veterinary clinic, every one-hour slot within its working days and hours shall remain available regardless of how many appointments are already booked in it. | EPIC-006 | MVP_CORE | Unassigned (P03) | DIRECT — A-P01Q-025; P01-OOS-009 |
| FR-025 | **Independent veterinarian availability.** For an independent veterinarian, a one-hour slot shall become unavailable once an appointment is booked in it. | EPIC-006 | MVP_CORE | Unassigned (P03) | ASSUMED — P01-ASSUMPTION-021; A-P01Q-019; confirmation: P02-Q-005 |
| FR-026 | **Owner views appointments.** The platform shall allow a pet owner to view their appointments with their current details, including any changes made by the provider. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | ASSUMED — P01-ASSUMPTION-023; A-P01Q-019, -026 |
| FR-027 | **Owner cancels appointment.** The platform shall allow a pet owner to cancel one of their appointments at any time before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-019 |
| FR-028 | **Owner reschedules appointment.** The platform shall allow a pet owner to change the date and time of one of their appointments to another available slot, at any time before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-019 |
| FR-029 | **Provider views appointments.** The platform shall give each provider a space showing the appointments booked with it, including for each one the service, date and time, pet, owner's name, modality and, for home visits, the address. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-007; A-P01Q-017, -026; details shown: P02-ASM-008 |
| FR-030 | **Provider cancels appointment.** The platform shall allow a provider to cancel an appointment booked with it, before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-026 |
| FR-031 | **Provider reschedules appointment.** The platform shall allow a provider to change the date and time of an appointment booked with it to another available slot, before it takes place. | EPIC-007 | MVP_SUPPORTING | Unassigned (P03) | DIRECT — P01-MVP-007; A-P01Q-026 |
| FR-032 | **Order product.** The platform shall allow a pet owner to order a product directly from the provider that offers it, entering a delivery address, without any payment in the platform and without a request or reservation step. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | DIRECT / ASSUMED — P01-MVP-009; A-P01Q-024; address per order: P01-ASSUMPTION-026; order contents: P02-Q-001 |
| FR-033 | **Provider views orders.** The platform shall allow a provider to view the product orders placed with it, including the product, the owner's name and the delivery address. | EPIC-008 | MVP_SUPPORTING | Unassigned (P03) | ASSUMED — P01-ASSUMPTION-022; A-P01Q-024; order handling: P02-Q-003 |

## 5. Non-Functional Requirements

| ID | Category | Requirement | Scope | Traceability |
|---|---|---|---|---|
| NFR-001 | Security | Passwords shall be stored in hashed form and never in plain text. The hashing method is not defined at this stage (P05 — Architecture). | MVP_SUPPORTING | DIRECT — P00 ANS-Q015; P01-MVP-006 |
| NFR-002 | Security (authorization) | Only signed-in users shall access account functionality. Each user shall view and modify only their own data (pets, profile, catalog, appointments, orders), except information the product makes public (provider profiles and offerings) and information shared between the two parties of an appointment or order. | MVP_SUPPORTING | REFINED — P01-MVP-006; A-P01Q-012 |
| NFR-003 | Platform | The product shall be a web application used through a web browser. Supported browsers and devices: REQUIRES_DECISION (P02-Q-014). | MVP_SUPPORTING | DIRECT — P00 [PLAT], ANS-Q016 |

## 6. User Stories

### US-001 — Sign up as a pet owner with my first pet

- **Epic:** EPIC-001
- **Requirement(s):** FR-001, FR-005, NFR-001
- **User Story:** As a pet owner, I want to create an account with my name, email and password and the data of at least one pet, so that I can use the platform to find services and book appointments for my pet.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-006, P01-MVP-005, P01-NEED-002, P01-NEED-009, P01-SUCCESS-001, P01-SUCCESS-005, A-P01Q-010, A-P01Q-012

#### Acceptance Criteria

- AC-001:
  - Given a person without an account
  - When they submit a name, an email, a password and one pet with species, weight, age, height and breed
  - Then a pet owner account is created with that pet registered
- AC-002:
  - Given a person completing pet owner sign-up
  - When they try to finish without registering any pet
  - Then the account is not created and they are told that at least one pet is required
- AC-003:
  - Given a person completing pet owner sign-up
  - When a required account or pet field is missing
  - Then the account is not created and the missing field is indicated (required pet fields: P02-ASM-003)
- AC-004:
  - Given an email that already belongs to an account
  - When a person tries to sign up with that email
  - Then the account is not created (P02-ASM-002)
- AC-005:
  - Given a pet owner account has just been created
  - When its stored credentials are inspected
  - Then the password is not stored in plain text

#### Business Rules

- BR-001, BR-003

#### Edge Cases

- EDGE-001, EDGE-002

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-011, P02-Q-012

### US-002 — Sign up as a provider

- **Epic:** EPIC-001
- **Requirement(s):** FR-002, NFR-001
- **User Story:** As a veterinary clinic or independent veterinarian, I want to create a provider account indicating which of the two I am, so that I can publish my services and products to pet owners.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-006, P01-NEED-009, P01-SUCCESS-002, P01-SUCCESS-005, A-P01Q-005, A-P01Q-011, A-P01Q-012

#### Acceptance Criteria

- AC-006:
  - Given a person without an account
  - When they submit a name, an email, a password and the provider type (clinic or independent veterinarian)
  - Then a provider account of that type is created
- AC-007:
  - Given a person completing provider sign-up
  - When they do not indicate the provider type
  - Then the account is not created and the missing type is indicated
- AC-008:
  - Given an email that already belongs to an account
  - When a person tries to sign up as a provider with that email
  - Then the account is not created (P02-ASM-002)
- AC-009:
  - Given a provider account has just been created
  - When its stored credentials are inspected
  - Then the password is not stored in plain text

#### Business Rules

- BR-001, BR-002

#### Edge Cases

- EDGE-002

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-012, P01-QUESTION-029

### US-003 — Sign in to my interface

- **Epic:** EPIC-001
- **Requirement(s):** FR-003, FR-004, NFR-002
- **User Story:** As a registered user (pet owner or provider), I want to sign in with my email and password, so that I can use the interface that corresponds to my account type.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-006, P01-NEED-009, P01-SUCCESS-005, A-P01Q-012

#### Acceptance Criteria

- AC-010:
  - Given a registered pet owner
  - When they sign in with the correct email and password
  - Then they reach the pet owner interface
- AC-011:
  - Given a registered provider
  - When they sign in with the correct email and password
  - Then they reach the provider interface
- AC-012:
  - Given a registered user
  - When they sign in with an incorrect email or password
  - Then access is not granted
- AC-013:
  - Given a signed-in user of one account type
  - When they try to use a function of the other account type
  - Then access to that function is denied

#### Business Rules

- BR-001

#### Edge Cases

- EDGE-003, EDGE-020

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-015

### US-004 — Add a pet

- **Epic:** EPIC-002
- **Requirement(s):** FR-005
- **User Story:** As a pet owner, I want to register another pet, so that I can book services for it.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-005, P01-NEED-002, P01-SUCCESS-001, A-P01Q-031

#### Acceptance Criteria

- AC-014:
  - Given a signed-in pet owner
  - When they submit a new pet with species, weight, age, height and breed
  - Then the pet is added to their list of pets
- AC-015:
  - Given a signed-in pet owner adding a pet
  - When a required pet field is missing
  - Then the pet is not added and the missing field is indicated (P02-ASM-003)

#### Business Rules

- None

#### Edge Cases

- None

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-006, P02-Q-011

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
  - Then they see each of their pets with its species, weight, age, height and breed
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
- **P01 trace:** P01-MVP-005, P01-NEED-002, P01-SUCCESS-001, A-P01Q-031

#### Acceptance Criteria

- AC-019:
  - Given a signed-in pet owner viewing one of their pets
  - When they change one of its fields and save
  - Then the pet shows the updated data
- AC-020:
  - Given a signed-in pet owner editing a pet
  - When they remove the value of a required field and save
  - Then the change is not saved and the field is indicated (P02-ASM-003)

#### Business Rules

- None

#### Edge Cases

- None

#### Dependencies

- DEP-002

#### Open Questions

- P02-Q-011

### US-007 — Remove a pet

- **Epic:** EPIC-002
- **Requirement(s):** FR-008
- **User Story:** As a pet owner, I want to remove a pet from my account, so that my list only shows the pets I still have.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-005, P01-NEED-002, P01-SUCCESS-001, A-P01Q-031

#### Acceptance Criteria

- AC-021:
  - Given a signed-in pet owner with several pets
  - When they remove one of them
  - Then the pet no longer appears in their list and cannot be chosen for new appointments
- AC-022:
  - Given a signed-in pet owner with only one pet
  - When they remove it
  - Then the pet is removed and the owner cannot book appointments until they register a pet (P01-ASSUMPTION-025)

#### Business Rules

- BR-004, BR-005

#### Edge Cases

- EDGE-011

#### Dependencies

- DEP-002

#### Open Questions

- P02-Q-008, P01-QUESTION-038

### US-008 — Maintain my public profile

- **Epic:** EPIC-003
- **Requirement(s):** FR-009
- **User Story:** As a provider, I want to set my name, my contact information and, optionally, my address, so that pet owners can identify and reach me.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-008, P01-NEED-010, P01-SUCCESS-002, A-P01Q-021, A-P01Q-030

#### Acceptance Criteria

- AC-023:
  - Given a signed-in provider
  - When they save a name, contact information and an address
  - Then their public profile shows that information
- AC-024:
  - Given a signed-in provider
  - When they save their profile without an address
  - Then the profile is saved and shown without an address

#### Business Rules

- BR-025, BR-026

#### Edge Cases

- EDGE-017

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-009, P02-Q-010

### US-009 — Set my working days and hours

- **Epic:** EPIC-003
- **Requirement(s):** FR-010
- **User Story:** As a provider, I want to define the days and hours in which I accept appointments, so that owners can only book me when I work.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-010, P01-NEED-012, P01-SUCCESS-002, A-P01Q-025

#### Acceptance Criteria

- AC-025:
  - Given a signed-in provider
  - When they define their working days and hours
  - Then pet owners are offered appointment slots only within those days and hours
- AC-026:
  - Given a provider with no working days and hours defined
  - When a pet owner tries to book one of its services
  - Then no appointment slots are offered

#### Business Rules

- BR-011, BR-025

#### Edge Cases

- EDGE-013, EDGE-014

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-007, P02-Q-008

### US-010 — Publish a service

- **Epic:** EPIC-004
- **Requirement(s):** FR-011
- **User Story:** As a provider, I want to publish a service with its name, the species it applies to and where I offer it, so that pet owners can find it and book appointments.
- **Scope:** MVP_CORE
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-003, P01-NEED-006, P01-SUCCESS-002, A-P01Q-008, A-P01Q-009

#### Acceptance Criteria

- AC-027:
  - Given a signed-in provider
  - When they publish a service with a name, one species and a modality (clinic, home, or both)
  - Then the service appears in their catalog, on their profile and in search results
- AC-028:
  - Given a signed-in provider publishing a service
  - When they do not indicate exactly one species
  - Then the service is not published and the species is indicated as required
- AC-029:
  - Given a signed-in provider publishing a service
  - When they do not indicate a modality
  - Then the service is not published and the modality is indicated as required

#### Business Rules

- BR-006, BR-007, BR-025, BR-027

#### Edge Cases

- EDGE-017

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-002, P02-Q-006, P02-Q-009

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

- DEP-003

#### Open Questions

- None

### US-012 — Remove a service

- **Epic:** EPIC-004
- **Requirement(s):** FR-013
- **User Story:** As a provider, I want to remove a service I no longer offer, so that pet owners cannot book it.
- **Scope:** MVP_CORE
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-003, P01-NEED-007, P01-SUCCESS-002

#### Acceptance Criteria

- AC-032:
  - Given a signed-in provider with a published service
  - When they remove it
  - Then the service no longer appears in their catalog, on their profile or in search results, and new appointments for it cannot be booked

#### Business Rules

- None

#### Edge Cases

- EDGE-012

#### Dependencies

- DEP-003

#### Open Questions

- P02-Q-008

### US-013 — Publish a product

- **Epic:** EPIC-004
- **Requirement(s):** FR-014
- **User Story:** As a provider, I want to publish a product with its name and the species it applies to, so that pet owners can find it and order it.
- **Scope:** MVP_CORE
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-003, P01-NEED-006, P01-SUCCESS-002, A-P01Q-002, A-P01Q-028

#### Acceptance Criteria

- AC-033:
  - Given a signed-in provider
  - When they publish a product with a name and one species
  - Then the product appears in their catalog, on their profile and in search results
- AC-034:
  - Given a signed-in provider publishing a product
  - When they do not indicate exactly one species
  - Then the product is not published and the species is indicated as required

#### Business Rules

- BR-006, BR-025, BR-027

#### Edge Cases

- None

#### Dependencies

- DEP-001

#### Open Questions

- P02-Q-002, P02-Q-006

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

- DEP-004

#### Open Questions

- None

### US-015 — Remove a product

- **Epic:** EPIC-004
- **Requirement(s):** FR-016
- **User Story:** As a provider, I want to remove a product I no longer offer, so that pet owners cannot order it.
- **Scope:** MVP_CORE
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-003, P01-NEED-007, P01-SUCCESS-002

#### Acceptance Criteria

- AC-037:
  - Given a signed-in provider with a published product
  - When they remove it
  - Then the product no longer appears in their catalog, on their profile or in search results, and it cannot be ordered

#### Business Rules

- None

#### Edge Cases

- EDGE-019

#### Dependencies

- DEP-004

#### Open Questions

- P02-Q-003

### US-016 — Search services and products

- **Epic:** EPIC-005
- **Requirement(s):** FR-017, FR-019
- **User Story:** As a pet owner, I want to search the services and products offered by all providers, so that I can find what my pet needs in one place without using other channels.
- **Scope:** MVP_CORE
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-001, P01-NEED-001, P01-NEED-003, P01-SUCCESS-003, P01-SUCCESS-007, A-P01Q-003, A-P01Q-011, A-P01Q-022

#### Acceptance Criteria

- AC-038:
  - Given services and products published by several providers
  - When a signed-in pet owner searches
  - Then the results include matching offerings from all providers, with no filtering by the owner's location
- AC-039:
  - Given a list of search results
  - When the pet owner looks at a result
  - Then it shows whether it is offered by a clinic or an independent veterinarian and, for a service, whether it is offered at the clinic, at home, or both
- AC-040:
  - Given no offering matches the search
  - When the pet owner searches
  - Then they are told that there are no results

#### Business Rules

- BR-009

#### Edge Cases

- EDGE-015

#### Dependencies

- DEP-003, DEP-004

#### Open Questions

- P02-Q-013

### US-017 — Filter by species

- **Epic:** EPIC-005
- **Requirement(s):** FR-018
- **User Story:** As a pet owner, I want to filter the results by the species a service or product is for, so that I only see offerings that apply to the animal I am looking for.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-001, P01-NEED-003, P01-SUCCESS-003, P01-SUCCESS-007, A-P01Q-022

#### Acceptance Criteria

- AC-041:
  - Given search results that include offerings for several species
  - When the pet owner selects a species filter
  - Then only offerings for that species are shown
- AC-042:
  - Given a pet owner who has no registered pet of a given species
  - When they filter by that species
  - Then the offerings for that species are shown anyway
- AC-043:
  - Given a species filter is applied
  - When the pet owner removes the filter
  - Then offerings for all species are shown again

#### Business Rules

- BR-006, BR-008

#### Edge Cases

- None

#### Dependencies

- DEP-003, DEP-004

#### Open Questions

- P02-Q-006

### US-018 — View a provider's profile

- **Epic:** EPIC-005
- **Requirement(s):** FR-020
- **User Story:** As a pet owner, I want to see a provider's details and everything it offers, so that I can decide whether to book or order and know how to reach it.
- **Scope:** MVP_CORE
- **Status:** DEFINED
- **P01 trace:** P01-MVP-008, P01-NEED-010, P01-SUCCESS-003, A-P01Q-011, A-P01Q-021, A-P01Q-030

#### Acceptance Criteria

- AC-044:
  - Given a provider that has completed its profile
  - When a pet owner opens it
  - Then they see its name, address, contact information, provider type, services and products
- AC-045:
  - Given a provider without an address
  - When a pet owner opens its profile
  - Then the profile is shown without an address

#### Business Rules

- BR-026

#### Edge Cases

- None

#### Dependencies

- DEP-005

#### Open Questions

- None

### US-019 — Book an appointment for my pet

- **Epic:** EPIC-006
- **Requirement(s):** FR-021, FR-022, FR-024, FR-025
- **User Story:** As a pet owner, I want to book a one-hour appointment for one of my pets for a service I found, so that my pet receives the service.
- **Scope:** MVP_CORE
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-002, P01-NEED-004, P01-SUCCESS-004, P01-SUCCESS-007, A-P01Q-019, A-P01Q-022, A-P01Q-025, A-P01Q-031

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
  - Then that slot is not offered (P01-ASSUMPTION-021)
- AC-051:
  - Given a pet owner viewing available slots
  - When the list is shown
  - Then slots whose start time has already passed are not offered (P02-ASM-006)

#### Business Rules

- BR-005, BR-010, BR-011, BR-012, BR-013, BR-014, BR-024

#### Edge Cases

- EDGE-004, EDGE-005, EDGE-006, EDGE-007, EDGE-009, EDGE-016

#### Dependencies

- DEP-002, DEP-005, DEP-006

#### Open Questions

- P02-Q-004, P02-Q-005

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

- DEP-006

#### Open Questions

- None

### US-021 — View my appointments

- **Epic:** EPIC-007
- **Requirement(s):** FR-026, NFR-002
- **User Story:** As a pet owner, I want to see my appointments, so that I know when and where each one takes place, including changes made by the provider.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-007, P01-NEED-004, A-P01Q-019, A-P01Q-026

#### Acceptance Criteria

- AC-055:
  - Given a signed-in pet owner with appointments
  - When they open their appointments
  - Then each one shows the service, provider, pet, date and time, and modality
- AC-056:
  - Given an appointment that the provider has rescheduled
  - When the pet owner opens their appointments
  - Then it shows the new date and time (no notification is sent: P01-OOS-004)

#### Business Rules

- BR-017

#### Edge Cases

- None

#### Dependencies

- DEP-007

#### Open Questions

- P02-Q-016, P01-QUESTION-039

### US-022 — Cancel my appointment

- **Epic:** EPIC-007
- **Requirement(s):** FR-027
- **User Story:** As a pet owner, I want to cancel an appointment, so that I am not expected when I can no longer attend.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED
- **P01 trace:** P01-MVP-007, P01-NEED-004, P01-SUCCESS-006, A-P01Q-019

#### Acceptance Criteria

- AC-057:
  - Given a pet owner with an appointment that has not started
  - When they cancel it
  - Then it is no longer scheduled in the owner's or the provider's appointments
- AC-058:
  - Given a cancelled appointment with an independent veterinarian
  - When another pet owner views that veterinarian's slots
  - Then the freed slot is offered again
- AC-059:
  - Given an appointment whose start time has passed
  - When the pet owner tries to cancel it
  - Then the cancellation is not allowed

#### Business Rules

- BR-013, BR-016

#### Edge Cases

- EDGE-010

#### Dependencies

- DEP-007

#### Open Questions

- P02-Q-016

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

- DEP-007

#### Open Questions

- None

### US-024 — See my scheduled appointments

- **Epic:** EPIC-007
- **Requirement(s):** FR-029, NFR-002
- **User Story:** As a provider, I want to see the appointments owners have booked with me, so that I know what I have to attend and where.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-007, P01-NEED-008, P01-SUCCESS-006, A-P01Q-017, A-P01Q-026

#### Acceptance Criteria

- AC-063:
  - Given a signed-in provider with booked appointments
  - When they open their appointments space
  - Then they see each appointment with its service, date and time, pet, owner's name, modality and, for home visits, the address (P02-ASM-008)
- AC-064:
  - Given a signed-in provider
  - When they open their appointments space
  - Then appointments of other providers are not shown

#### Business Rules

- None

#### Edge Cases

- None

#### Dependencies

- DEP-007

#### Open Questions

- None

### US-025 — Cancel an appointment as a provider

- **Epic:** EPIC-007
- **Requirement(s):** FR-030
- **User Story:** As a provider, I want to cancel an appointment booked with me, so that I am not expected to attend an appointment I cannot keep.
- **Scope:** MVP_SUPPORTING
- **Status:** DEFINED_WITH_ASSUMPTIONS
- **P01 trace:** P01-MVP-007, P01-NEED-008, P01-SUCCESS-006, A-P01Q-026

#### Acceptance Criteria

- AC-065:
  - Given a provider with an appointment that has not started
  - When they cancel it
  - Then it is no longer scheduled in the provider's appointments, and the pet owner sees the change when they open their appointments
- AC-066:
  - Given an appointment whose start time has passed
  - When the provider tries to cancel it
  - Then the cancellation is not allowed

#### Business Rules

- BR-017

#### Edge Cases

- EDGE-010

#### Dependencies

- DEP-007

#### Open Questions

- P02-Q-016

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

- DEP-007

#### Open Questions

- None

### US-027 — Order a product to my address

- **Epic:** EPIC-008
- **Requirement(s):** FR-032
- **User Story:** As a pet owner, I want to order a product to my address, so that I receive it without paying online or going elsewhere.
- **Scope:** MVP_SUPPORTING
- **Status:** PENDING_DECISION
- **P01 trace:** P01-MVP-009, P01-NEED-011, P01-SUCCESS-008, A-P01Q-024

#### Acceptance Criteria

- AC-069:
  - Given a signed-in pet owner viewing a product
  - When they enter a delivery address and place the order
  - Then the order is registered directly, with no request, reservation or payment step, and the provider can see it
- AC-070:
  - Given a pet owner placing an order
  - When they do not enter a delivery address
  - Then the order is not placed and the address is indicated as required
- AC-071:
  - Given a signed-in pet owner with no registered pets
  - When they order a product
  - Then the order is placed (pets are required only to book services: P02-ASM-009)

#### Business Rules

- BR-019, BR-020, BR-021, BR-022, BR-023, BR-027, BR-028

#### Edge Cases

- EDGE-018, EDGE-019

#### Dependencies

- DEP-004, DEP-008

#### Open Questions

- P02-Q-001, P02-Q-002, P02-Q-003

### US-028 — See the product orders placed with me

- **Epic:** EPIC-008
- **Requirement(s):** FR-033, NFR-002
- **User Story:** As a provider, I want to see the orders owners place for my products, so that I know what to deliver and where.
- **Scope:** MVP_SUPPORTING
- **Status:** PENDING_DECISION
- **P01 trace:** P01-MVP-009, P01-NEED-012, P01-SUCCESS-008, A-P01Q-024

#### Acceptance Criteria

- AC-072:
  - Given a provider with orders placed for its products
  - When they open their orders
  - Then they see each order with the product, the owner's name and the delivery address
- AC-073:
  - Given a signed-in provider
  - When they open their orders
  - Then orders placed with other providers are not shown

#### Business Rules

- BR-023, BR-028

#### Edge Cases

- None

#### Dependencies

- DEP-008

#### Open Questions

- P02-Q-003, P01-QUESTION-036

## 7. Business Rules

| ID | Rule | Related Requirements / Stories | Status |
|---|---|---|---|
| BR-001 | There are two account types: pet owner and provider. Each has its own interface. | FR-001, FR-002, FR-004; US-001, US-002, US-003 | CONFIRMED (A-P01Q-012) |
| BR-002 | A provider is either a veterinary clinic or an independent veterinarian; the type is shown as a label on its offerings and profile. | FR-002, FR-019, FR-020; US-002 | CONFIRMED (A-P01Q-011); recorded as an account attribute: ASSUMED (P01-ASSUMPTION-019) |
| BR-003 | A pet owner must register at least one pet to create an account. | FR-001; US-001 | CONFIRMED (A-P01Q-010) |
| BR-004 | After sign-up, a pet owner may remove pets, including the last one. | FR-008; US-007 | ASSUMED (P01-ASSUMPTION-025) |
| BR-005 | Booking an appointment requires at least one registered pet, and each appointment is for exactly one of the owner's pets. | FR-022; US-007, US-019 | CONFIRMED (A-P01Q-022, -031) |
| BR-006 | Each service and each product applies to exactly one species. | FR-011, FR-014, FR-018; US-010, US-011, US-013, US-014, US-017 | CONFIRMED (A-P01Q-008, -028) |
| BR-007 | A service is offered at the provider's clinic, at the owner's home, or both. Both clinics and independent veterinarians can offer home services. | FR-011, FR-019, FR-023; US-010, US-011, US-020 | CONFIRMED (A-P01Q-009; P00 MVP-005) |
| BR-008 | The species filter uses the species of the offering, not the species of the owner's pets. | FR-018; US-017 | CONFIRMED (A-P01Q-022) |
| BR-009 | All providers are visible to all pet owners; there is no filtering by area. Coverage is the city of Bogotá. | FR-017; US-016 | CONFIRMED (A-P01Q-003; P01-OOS-002, -003) |
| BR-010 | An appointment lasts one hour. | FR-021, FR-022; US-019 | CONFIRMED (A-P01Q-025) |
| BR-011 | Appointments can only be booked or moved within the provider's working days and hours. | FR-010, FR-021, FR-031; US-009, US-019, US-026 | CONFIRMED (A-P01Q-025) |
| BR-012 | A clinic accepts any number of appointments in the same slot within its working hours; staff availability is not managed. | FR-024; US-019 | CONFIRMED (A-P01Q-025; P01-OOS-009) |
| BR-013 | An independent veterinarian accepts one appointment per slot. | FR-025; US-019, US-022 | ASSUMED (P01-ASSUMPTION-021) |
| BR-014 | An appointment is scheduled as soon as it is booked; there is no confirmation step. | FR-022; US-019 | CONFIRMED (A-P01Q-019; P01-OOS-007) |
| BR-015 | A home-visit appointment requires the address of the visit, entered by the owner when booking. | FR-023; US-020 | CONFIRMED (A-P01Q-017) |
| BR-016 | A pet owner can cancel or reschedule an appointment at any time before it takes place. | FR-027, FR-028; US-022, US-023 | CONFIRMED (A-P01Q-019) |
| BR-017 | A provider can cancel or reschedule an appointment booked with it, with the same time limit as the owner (before it takes place). | FR-030, FR-031; US-021, US-025, US-026 | CONFIRMED (A-P01Q-026: "just like customers") |
| BR-018 | Rescheduling follows the same availability rules as a new booking. | FR-028, FR-031; US-023, US-026 | REFINED (A-P01Q-019, -025) |
| BR-019 | A product order is placed directly: no payment in the platform, no request or reservation step. | FR-032; US-027 | CONFIRMED (A-P01Q-024; P01-OOS-004, -010) |
| BR-020 | A product order is delivered to an address the owner enters when ordering. | FR-032; US-027 | CONFIRMED (A-P01Q-024); per-order entry ASSUMED (P01-ASSUMPTION-026) |
| BR-021 | Ordering a product does not require a registered pet. | FR-032; US-027 | ASSUMED (P02-ASM-009, from A-P01Q-031) |
| BR-022 | Contents of an order: one or several products, and quantities. | FR-032; US-027 | REQUIRES_DECISION (P02-Q-001) |
| BR-023 | Order cancellation and order status. | FR-032, FR-033; US-027, US-028 | REQUIRES_DECISION (P02-Q-003) |
| BR-024 | Whether a service for one species can be booked for a pet of another species. | FR-022; US-019 | REQUIRES_DECISION (P02-Q-004) |
| BR-025 | Each provider maintains its own profile, working hours and catalog; there is no administrator role. | FR-009, FR-010, FR-011, FR-014; US-008, US-009, US-010, US-013 | CONFIRMED (A-P01Q-005, -006) |
| BR-026 | A provider's address is optional. | FR-009, FR-020; US-008, US-018 | CONFIRMED (A-P01Q-030) |
| BR-027 | Whether prices of services and products are shown. | FR-011, FR-014; US-010, US-013, US-027 | REQUIRES_DECISION (P02-Q-002) |
| BR-028 | The provider delivers ordered products outside the platform; the platform has no delivery logistics or tracking. | FR-033; US-027, US-028 | ASSUMED (P01-ASSUMPTION-022); no tracking CONFIRMED (P01-OOS-004) |

## 8. Edge Cases

| ID | Description | Related Story | Expected Behavior | Status |
|---|---|---|---|---|
| EDGE-001 | A person tries to finish pet owner sign-up without registering a pet. | US-001 | The account is not created; the owner is told that at least one pet is required. | DEFINED |
| EDGE-002 | A person tries to sign up with an email that already belongs to an account. | US-001, US-002 | The account is not created. | ASSUMED (P02-ASM-002; P02-Q-012) |
| EDGE-003 | A user signs in with an incorrect email or password. | US-003 | Access is not granted. | DEFINED |
| EDGE-004 | A pet owner with no registered pets tries to book. | US-019 | Booking is not allowed; the owner is told to register a pet. | DEFINED |
| EDGE-005 | A pet owner tries to book outside the provider's working days and hours. | US-019 | Those slots are not offered. | DEFINED |
| EDGE-006 | A pet owner tries to book an independent veterinarian in a slot that already has an appointment. | US-019 | The slot is not offered. | ASSUMED (P01-ASSUMPTION-021) |
| EDGE-007 | Two pet owners try to book the same independent veterinarian slot at almost the same time. | US-019 | Only one appointment is scheduled in that slot; the other owner is told the slot is no longer available. | ASSUMED (consequence of BR-013) |
| EDGE-008 | A pet owner books a home visit without entering an address. | US-020 | The appointment is not booked; the address is indicated as required. | DEFINED |
| EDGE-009 | A pet owner tries to book or reschedule to a date and time that has already passed. | US-019, US-023 | Those slots are not offered. | ASSUMED (P02-ASM-006) |
| EDGE-010 | A user tries to cancel or reschedule an appointment whose start time has passed. | US-022, US-023, US-025, US-026 | The action is not allowed. | DEFINED |
| EDGE-011 | A pet owner removes a pet that has upcoming appointments. | US-007 | REQUIRES_DECISION: whether removal is blocked, or the appointments are kept or cancelled. | REQUIRES_DECISION (P02-Q-008) |
| EDGE-012 | A provider removes a service that has upcoming appointments. | US-012 | REQUIRES_DECISION: whether removal is blocked, or the appointments are kept or cancelled. | REQUIRES_DECISION (P02-Q-008) |
| EDGE-013 | A provider changes its working hours so that existing appointments fall outside them. | US-009 | REQUIRES_DECISION: whether the change is blocked, or the appointments are kept or cancelled. | REQUIRES_DECISION (P02-Q-008) |
| EDGE-014 | A provider has not defined working days and hours. | US-009 | No appointment slots are offered for its services. | DEFINED |
| EDGE-015 | A search returns no results. | US-016 | The owner is told that there are no results. | DEFINED |
| EDGE-016 | A pet owner books a service for a pet of a different species than the service's species. | US-019 | REQUIRES_DECISION: allowed, warned, or blocked. | REQUIRES_DECISION (P02-Q-004) |
| EDGE-017 | A provider without an address publishes a service offered at its clinic. | US-008, US-010 | REQUIRES_DECISION: whether an address is required to offer in-clinic services. | REQUIRES_DECISION (P02-Q-009) |
| EDGE-018 | A pet owner places an order without a delivery address. | US-027 | The order is not placed; the address is indicated as required. | DEFINED |
| EDGE-019 | A provider removes a product that has already been ordered. | US-015 | REQUIRES_DECISION: what happens to existing orders. | REQUIRES_DECISION (P02-Q-003) |
| EDGE-020 | A signed-in user tries to use a function of the other account type, or another user's data. | US-003 | Access is denied. | DEFINED (NFR-002) |

## 9. Dependencies

Dependencies are between product capabilities, not technical components.

| ID | Dependency | Related Items | Status |
|---|---|---|---|
| DEP-001 | All account functions depend on sign-up and sign-in. | FR-001 to FR-004 → all user stories | Functional dependency |
| DEP-002 | Editing, removing and booking for a pet depend on pet registration. | FR-005 → FR-007, FR-008, FR-022; US-006, US-007, US-019 | Functional dependency |
| DEP-003 | Updating, removing, searching and booking services depend on published services. | FR-011 → FR-012, FR-013, FR-017, FR-021; US-011, US-012, US-016, US-017 | Functional dependency |
| DEP-004 | Updating, removing, searching and ordering products depend on published products. | FR-014 → FR-015, FR-016, FR-017, FR-032; US-014, US-015, US-016, US-017, US-027 | Functional dependency |
| DEP-005 | The provider profile and booking show information the provider has entered. | FR-009 → FR-020; US-018, US-019 | Functional dependency |
| DEP-006 | Available slots depend on the provider's working days and hours. | FR-010 → FR-021; US-019, US-020 | Functional dependency |
| DEP-007 | Viewing, cancelling and rescheduling appointments depend on booking. | FR-022 → FR-026 to FR-031; US-021 to US-026 | Functional dependency |
| DEP-008 | The final definition of product ordering depends on team decisions on order contents, prices and order handling. | FR-032, FR-033; US-027, US-028; P02-Q-001 to P02-Q-003 | Decision dependency (open) |

## 10. Assumptions and Open Questions

### Assumptions

| ID | Assumption | Impact | Source |
|---|---|---|---|
| P02-ASM-001 | Users sign in with their email and password (the only credentials stated by the team). | Low | P00 ANS-Q015 |
| P02-ASM-002 | Each email can belong to only one account; sign-up with an existing email is rejected. | Low | Refinement; P02-Q-012 |
| P02-ASM-003 | All five pet fields (species, weight, age, height, breed) are required. | Low | P00 ANS-Q008; P02-Q-011 |
| P02-ASM-004 | Services and products have a name, so that owners can identify them. | Low | Refinement of A-P01Q-008 |
| P02-ASM-005 | When a service is offered both at the clinic and at home, the owner chooses the modality when booking. | Low | Refinement of A-P01Q-009, -017 |
| P02-ASM-006 | Appointments cannot be booked or moved to a time that has already passed. | Low | Refinement of A-P01Q-019 |
| P02-ASM-007 | All dates and times are Bogotá local time. | Low | Single-city coverage (A-P01Q-003; P01-OOS-003) |
| P02-ASM-008 | The provider's appointments space shows the service, date and time, pet, owner's name, modality and, for home visits, the address. | Low | Refinement of A-P01Q-017, -026 |
| P02-ASM-009 | Ordering a product does not require a registered pet; the team said a pet is required to book services. | Low | A-P01Q-031 |
| P02-ASM-010 | Working days and hours are a weekly pattern (the same each week). | Medium | Refinement of A-P01Q-025; P02-Q-007 |
| P01-ASSUMPTION-002 | Providers want an additional channel to reach pet owners (carried; no direct effect on requirements). | Medium | P01 |
| P01-ASSUMPTION-019 | Two account types; clinic or independent veterinarian is a provider attribute. | Low | P01 |
| P01-ASSUMPTION-021 | An independent veterinarian accepts one appointment per slot. | Medium | P01 |
| P01-ASSUMPTION-022 | Providers see orders in their interface and deliver outside the platform. | Medium | P01 |
| P01-ASSUMPTION-023 | Owners have an appointments view, where they see changes made by the provider. | Medium | P01 |
| P01-ASSUMPTION-025 | An owner may remove all pets after sign-up; one pet is needed to book. | Low | P01 |
| P01-ASSUMPTION-026 | The delivery address is entered when the order is placed. | Low | P01 |

### Open Questions

| ID | Question | Affected Items | Decision Required |
|---|---|---|---|
| P02-Q-001 | Can an order contain several products, and quantities? (from P01-QUESTION-034) | FR-032; US-027; BR-022 | Yes: before the ordering requirements are baselined |
| P02-Q-002 | Are prices shown for services and products? (from P01-QUESTION-034) | FR-011, FR-014; US-010, US-013, US-027; BR-027 | Yes: before P03 |
| P02-Q-003 | Can the owner or the provider cancel an order? Do orders have a status? Does the owner see their orders? What happens to orders of a removed product? (from P01-QUESTION-035) | FR-032, FR-033; US-015, US-027, US-028; BR-023; EDGE-019 | Yes: before the ordering requirements are baselined |
| P02-Q-004 | Can a service for one species be booked for a pet of another species? (from P01-QUESTION-027) | FR-022; US-019; BR-024; EDGE-016 | Yes: during P03 |
| P02-Q-005 | Do independent veterinarians accept only one appointment per slot? (from P01-QUESTION-037) | FR-025; US-019, US-022; BR-013 | Yes: confirm assumption |
| P02-Q-006 | Are species chosen from a fixed list, or entered freely? The species filter needs consistent values between pets and offerings. | FR-005, FR-011, FR-014, FR-018; US-004, US-010, US-013, US-017 | Yes: before P04/P05 |
| P02-Q-007 | Can working hours differ by day? Must they start and end on the hour, to fit one-hour slots? | FR-010, FR-021; US-009; P02-ASM-010 | Yes: before P04/P05 |
| P02-Q-008 | What happens to upcoming appointments when a pet is removed, a service is removed, or working hours change? | US-007, US-009, US-012; EDGE-011 to EDGE-013 | Yes: during P03 |
| P02-Q-009 | Must a provider have an address to offer services at its clinic? | FR-009, FR-011; US-008, US-010; EDGE-017 | Yes: during P03 |
| P02-Q-010 | What does the provider's "contact" consist of (for example phone, email)? | FR-009, FR-020; US-008, US-018 | Yes: before P04 |
| P02-Q-011 | Which pet fields are mandatory? | FR-005; US-001, US-004, US-006; P02-ASM-003 | Confirm assumption |
| P02-Q-012 | Can the same email be used for both a pet owner and a provider account? | FR-001, FR-002; US-001, US-002; EDGE-002 | Confirm assumption |
| P02-Q-013 | Does search match text (for example by name), or is it browsing with a species filter? | FR-017; US-016 | Yes: before P04 |
| P02-Q-014 | Which interface language(s), browsers and devices must be supported? (P00 §7: UNKNOWN) | NFR-003 | Yes: before P04/P05 |
| P02-Q-015 | Is a sign-out function required? It was not stated by the team and is not included. | US-003 | Low priority |
| P02-Q-016 | Are cancelled appointments still shown (as cancelled), or do they disappear from the views? | FR-026, FR-027, FR-030; US-021, US-022, US-025 | Low priority |
| P01-QUESTION-029 | Is clinic or independent veterinarian a provider attribute? (carried) | FR-002; US-002 | Confirm assumption |
| P01-QUESTION-032 | Project dates and the build-order PROPOSAL (carried; belongs to P03). | Planning | P03 |
| P01-QUESTION-033 | Regenerate and validate P00 from the consolidated input (carried). | Source of truth | Before P03 |
| P01-QUESTION-036 | Is delivery always handled by the provider outside the platform? (carried) | FR-033; US-028; BR-028 | Confirm assumption |
| P01-QUESTION-038 | Can an owner remove all their pets? (carried) | FR-008; US-007; BR-004 | Confirm assumption |
| P01-QUESTION-039 | Do owners have a "my appointments" view? (carried) | FR-026; US-021 | Confirm assumption |

## 11. Requirements Traceability

| P01 Element | Epic | Requirement | User Story | Acceptance Criteria |
|---|---|---|---|---|
| P01-MVP-006 Accounts | EPIC-001 | FR-001 to FR-004; NFR-001, NFR-002 | US-001, US-002, US-003 | AC-001–AC-005, AC-006–AC-009, AC-010–AC-013 |
| P01-MVP-005 Pet management | EPIC-002 | FR-005 to FR-008 | US-001, US-004 to US-007 | AC-001–AC-005, AC-014–AC-015, AC-016–AC-018, AC-019–AC-020, AC-021–AC-022 |
| P01-MVP-008 Provider public profile | EPIC-003, EPIC-005 | FR-009, FR-020 | US-008, US-018 | AC-023–AC-024, AC-044–AC-045 |
| P01-MVP-010 Working days and hours | EPIC-003 | FR-010 | US-009 | AC-025–AC-026 |
| P01-MVP-003 Provider catalog | EPIC-004 | FR-011 to FR-016 | US-010 to US-015 | AC-027–AC-029, AC-030–AC-031, AC-032, AC-033–AC-034, AC-035–AC-036, AC-037 |
| P01-MVP-001 Search | EPIC-005 | FR-017 to FR-019 | US-016, US-017 | AC-038–AC-040, AC-041–AC-043 |
| P01-MVP-002 Scheduling | EPIC-006 | FR-021 to FR-025 | US-019, US-020 | AC-046–AC-051, AC-052–AC-054 |
| P01-MVP-007 Appointment management | EPIC-007 | FR-026 to FR-031 | US-021 to US-026 | AC-055–AC-056, AC-057–AC-059, AC-060–AC-062, AC-063–AC-064, AC-065–AC-066, AC-067–AC-068 |
| P01-MVP-009 Product ordering | EPIC-008 | FR-032, FR-033 | US-027, US-028 | AC-069–AC-071, AC-072–AC-073 |
| P01-SUCCESS-007 End-to-end journey without outside channels | EPIC-001, -002, -005, -006 | FR-001, FR-005, FR-017, FR-018, FR-020 to FR-022 | US-001, US-016, US-017, US-018, US-019 | AC-001–AC-005, AC-038–AC-040, AC-041–AC-043, AC-044–AC-045, AC-046–AC-051 |
| P00 [PLAT], ANS-Q016 Web platform | All | NFR-003 | All | All |

Each story's full P01 trace (needs, success criteria, team answers) is listed under the story in §6 and in `product_backlog.json` (`traceability.p01_elements`).

## 12. Requirements Status

**READY_WITH_ASSUMPTIONS**

The requirements cover every MVP capability in P01 v4.0, are traceable to P01, and include no out-of-scope functionality or implementation decisions. They can go to P03 — Planning, carrying the documented assumptions. Before baselining:

1. **Product ordering** (US-027, US-028): order contents, prices and order handling are REQUIRES_DECISION (P02-Q-001 to -003).
2. **Behavior for some edge cases** is undecided: removing pets or services with upcoming appointments, changing working hours, species mismatch, in-clinic services without an address (P02-Q-004, -008, -009).
3. **Assumptions** on the independent-vet rule, the owner's appointments view and the provider's order view must be confirmed (P02-Q-005; P01-QUESTION-036, -039).
4. **Data-format details** needed before design: species values, working-hour format, contact content, search matching, language and devices (P02-Q-006, -007, -010, -013, -014).

The requirements are **not** baselined; this is a first version for validation.
