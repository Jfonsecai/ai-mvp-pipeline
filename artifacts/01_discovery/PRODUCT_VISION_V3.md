# Product Vision

> **Classification legend (P01 §15):**
> - **CONFIRMED**: supported by P00 or by an explicit team answer.
> - **ASSUMED**: interpretation explicitly labeled as an assumption.
> - **UNKNOWN**: insufficient information.
> - **REQUIRES_DECISION**: the team must decide.
> - **PROPOSAL**: suggestion for team review, not a decision (SYSTEM_PROMPT §9).
>
> **Source references:**
> - P00 identifiers (`MVP-00n`, `ASM-0nn`, `Q-0nn`, `RISK-0nn`, `OOS-00n`, `SUCCESS-00n`) refer to the P00 body of `PROJECT_CONTEXT_V4.md`, which is identical to `PROJECT_CONTEXT.md` v2.0.
> - **[A-P01Q-0nn]** is the team's answer to question `P01-QUESTION-0nn` of an earlier Product Vision. All 25 answers are in `PROJECT_CONTEXT_V4.md`, section "Questions from Product Vision Version 2.0 and Version 3.0 that are worth responding".
>   - **nn = 002–023:** answers to Product Vision v2.0 questions.
>   - **nn = 024–031:** answers to Product Vision v3.0 questions.
>   - The two ranges do not overlap. This is a reference convention, not a set of new identifiers.
> - The answers are in Spanish. This document uses faithful paraphrases and quotes the original where interpretation matters.

## 1. Document Metadata

- **Version:** 4.0
- **Stage:** P01 — Product Discovery
- **Status:** READY_WITH_ASSUMPTIONS
- **Generated From:** `PROJECT_CONTEXT_V4.md`, consolidated edition (labeled Artifact Version 4.0). Body = P00 v2.0, plus all 25 team answers (19 to Product Vision v2.0 questions, 6 to v3.0 questions).
- **Validation Dependency:** `artifacts/00_context/CONTEXT_VALIDATION.md` v2.0, result **PASS_WITH_WARNINGS**. It covers the P00 body only; no P00 validation exists for the appended answers.
- **Previous Version:** `history/PRODUCT_VISION_v3.0.md` (superseded).
- **Reissue note:** this document replaces an earlier v4.0, archived as `history/PRODUCT_VISION_v4.0-first-input.md`. That version was generated from a first edition of `PROJECT_CONTEXT_V4.md` that lacked the v2.0-question answers. The answers in the consolidated edition were verified by diff to be identical to those used before, so the product content is unchanged. Only the input-integrity items are updated.
- **Generation Date:** 2026-10-09

### Input Integrity Note

`PROJECT_CONTEXT_V4.md` now contains **all** team answers in one file. The fragmentation recorded in the earlier v4.0 is resolved: P01-ASSUMPTION-024 and P01-QUESTION-040 are resolved, and P01-RISK-013 is reduced.

**One issue remains.** The P00 body was not regenerated:

- Its §1 status and metadata still say 2.0.
- Several body statements are superseded by the appended answers: OOS-004 "provisional", species "of the owner's pet", the confirmation step, the admin role still "open", and Q-009 / Q-013 / Q-014 still "open".

Per SYSTEM_PROMPT §3, these conflicts are identified, not silently resolved. Each appended answer is a later, explicit team answer to a question the body itself left open, so this document applies the answer and cites it.

**Recommendation:** regenerate and validate P00 from this consolidated input (P01-QUESTION-033).

### Integration of the Team's Answers

**Answers to Product Vision v2.0 questions** (integrated as in v3.0):

| Answer | Team decision (paraphrase) | Effect on P01 |
|---|---|---|
| A-P01Q-002 | Payments, notifications and real-time tracking are "completely excluded". Providers **can offer products**. | Exclusions CONFIRMED (P01-OOS-004); products in catalog and search. |
| A-P01Q-003 | Home-service providers cover all of Bogotá. | Resolved. |
| A-P01Q-005 | Providers join by themselves. | Self-registration. |
| A-P01Q-006 | No administrator role. | P01-OOS-008. |
| A-P01Q-008 | Species is part of the service details; one species per service. | Catalog rule. |
| A-P01Q-009 | Clinics and independent vets can both offer home services; independent vets may have no clinic. | Offering model. |
| A-P01Q-010 | At least one registered pet is mandatory to sign up as an owner. | P01-MVP-005. |
| A-P01Q-011 | Offerings simply indicate whether they come from a clinic or an independent vet. | Provider-type label. |
| A-P01Q-012 | Both sides are a priority; the type is chosen at sign-up; each type has a distinct interface. | Both primary; P01-MVP-006. |
| (P00 Q-011 repeated) | One week; no budget; no institutional requirements. | Same as ANS-Q011. |
| A-P01Q-013 | P01-SUCCESS-007 adopted. | Success evidence. |
| A-P01Q-015 | No privacy requirements beyond password hashing. | Resolved. |
| A-P01Q-017 | The home-visit address is entered by the client when booking. | P01-MVP-002. |
| A-P01Q-018 | Ratings remain excluded. | P01-OOS-006; trust gap accepted. |
| A-P01Q-019 | Book when the provider is available ("no other appointment"); the owner cancels any time before, or reschedules; **no confirmation**. | P01-MVP-002, -007; P01-OOS-007 (CON-P01-001). |
| A-P01Q-020 | Stages 6–10 have three days; all risks accepted. The proposal was not addressed. | P01-RISK-009 accepted. |
| A-P01Q-021 | Provider information shown: name, address, contact, services, products, availability. | P01-MVP-008. |
| A-P01Q-022 | Filter by the species of the offering, independent of the owner's pets; the pet is chosen at booking. | P01-MVP-001, -002 (CON-P01-002). |
| A-P01Q-023 | Catalog consolidation accepted. | P01-MVP-003. |

**Answers to Product Vision v3.0 questions:**

| Answer | Team decision (paraphrase) | Effect on P01 v4.0 | Earlier statement superseded |
|---|---|---|---|
| A-P01Q-024 | Owners "can also order products to their address without paying. Not request nor reserve; order directly." | **Product ordering added** to the MVP (P01-MVP-009): a direct order delivered to the owner's address, with no payment in the platform. | v3.0 P01-ASSUMPTION-016 ("products are listings only"), now invalidated |
| A-P01Q-025 | An appointment slot is **1 hour**. Providers **can set working days and hours**. A clinic can handle more than one appointment at a time, so in the MVP **a clinic is always available within its working days and hours**. "Don't worry about the rest, or if there's a professional available in the clinic." | Slot model defined; working hours added (P01-MVP-010); clinics have no slot conflicts. | Earlier rule "available = no other appointment" (A-P01Q-019) **for clinics**. For independent vets it is kept, labeled ASSUMED (P01-ASSUMPTION-021). |
| A-P01Q-026 | Providers see appointments in a space of "their scheduled appointments", and **can cancel and reschedule them just like customers**. | Provider appointment view and actions CONFIRMED (P01-MVP-007). | v3.0 P01-ASSUMPTION-018, now confirmed |
| A-P01Q-028 | Each product applies to a single species. | CONFIRMED. | v3.0 P01-ASSUMPTION-020, now confirmed |
| A-P01Q-030 | For an independent vet without a clinic, the address is "whatever they decide"; they **may have none**. | Provider address is optional. | — |
| A-P01Q-031 | Owners can add, edit or remove pets, but **there must be one to schedule services**. | Pet management after sign-up CONFIRMED; at least one pet required to book. | Refines A-P01Q-010 (at least one pet at sign-up) |

**Not answered by the team in V4.** These were not selected as "worth responding" and are kept open at reduced priority:

- P01-QUESTION-027: species mismatch at booking.
- P01-QUESTION-029: clinic or independent vet as a provider attribute.
- P01-QUESTION-032: dates and the build-order proposal.
- P01-QUESTION-033: regenerating P00.

**Explicit conflict notes:**

- **CON-P01-001** (from v3.0): the confirmation step was removed by the team (A-P01Q-019).
- **CON-P01-002** (from v3.0): the species filter applies to the offering, not to the owner's pets (A-P01Q-022).
- **CON-P01-003** (new): A-P01Q-019 said the clinic **or** independent vet is available when "they don't have another appointment". A-P01Q-025 later says a clinic can take several appointments at once and is always available within its working hours. The later answer is applied to clinics. Because it says nothing about independent vets, the earlier rule is kept for them, labeled ASSUMED.
- **CON-P01-004** (new): A-P01Q-010 requires at least one pet at sign-up. A-P01Q-031 allows removing pets but requires one to book. These are reconciled as follows: at least one pet at sign-up, any number afterwards, and at least one to book (P01-ASSUMPTION-025).

---

## 2. Product Vision Statement

For **pet owners in Bogotá** who today look for veterinary services across social networks, search engines, maps and word of mouth, and for the **veterinary clinics and independent veterinarians** who want to offer their services and products, the *Veterinary Services Platform MVP* (placeholder name) is a **web platform** with a separate interface for each side:

- **Providers:**
  - sign up and publish their profile and working hours;
  - list their services and products;
  - manage the appointments and receive the product orders that owners place.
- **Pet owners:**
  - search everything in one place, optionally by species;
  - book a one-hour appointment for one of their pets, at a clinic or at home;
  - order products to their address, with no payment in the platform.

The core value is that a pet owner can go from "my pet needs a service" to a scheduled appointment **without using any channel outside the platform** (CONFIRMED, adopted by the team in A-P01Q-013).

By team decision, the MVP includes no ratings or reviews (A-P01Q-018), so it does not address the lack of ratings mentioned in the problem statement.

---

## 3. Problem Definition

### 3.1 Core Problem

**P01-PROB-001 — Pet owner (CONFIRMED; source: P00 §2, ANS-Q001):**
Pet owners who need a veterinary service for their pet have no single place to find one. They search across several unrelated channels and often cannot find reviews or ratings. As a result, the search is uncomfortable, they move between platforms, and they may end up trusting providers without any accessible rating.

*Source note:* the problem was stated by the team; there is no direct evidence from pet owners (P01-RISK-001). The problem statement concerns **services**. The ordering of **products** is a team decision (A-P01Q-002, -024) and does not derive from the stated problem (see §8.2).

**P01-PROB-002 — Providers (ASSUMED; source: P00 ASM-002):**
Clinics and independent vets want an additional channel to offer their services and products. Providers are a priority user (A-P01Q-012), but their current problem has not been described.

### 3.2 Problem Context

CONFIRMED (P00 §2): pet owners currently use Instagram, Facebook, Google, Maps, word of mouth, or explore familiar surroundings, and there is no centralized platform.

The MVP is an academic project limited to Bogotá (P00 §1, §7). How providers currently acquire clients is UNKNOWN.

### 3.3 Consequences of the Problem

CONFIRMED (P00 §2):

- The search is uncomfortable.
- Owners move between several platforms.
- Owners may trust providers "blindly".

The MVP addresses the first two consequences. The third is **intentionally not addressed**, because ratings are excluded (A-P01Q-018). The frequency and severity of these consequences are UNKNOWN.

---

## 4. Target Users

Both sides are **primary** by team decision (A-P01Q-012). At sign-up, a user chooses to be a **pet owner** or a **provider**, and each type has its own interface.

### 4.1 Primary User

**P01-USER-001 — Pet owner** (source: P00 USER-001; A-P01Q-010, -012, -031)

| Attribute | Description | Classification |
|---|---|---|
| Role | Person responsible for one or more pets, in Bogotá. | CONFIRMED |
| Context | Has an owner account (name, email, password). Registers at least one pet at sign-up and can then add, edit or remove pets; needs at least one pet to book. Demographics, devices and skills are unknown. | CONFIRMED / UNKNOWN |
| Main goal | Find and book veterinary services for their pet in one place; also order products. | CONFIRMED |
| Main problem | P01-PROB-001. | CONFIRMED |
| Relevant needs | P01-NEED-001 to -005, -009 to -011. | See §4.3 |

**P01-USER-002 — Veterinary clinic** (source: P00 USER-002; A-P01Q-005, -009, -011, -012, -025)

| Attribute | Description | Classification |
|---|---|---|
| Role | Veterinary clinic that offers services and products. | CONFIRMED |
| Context | Self-registers and is not verified. Offers in-clinic and home services. Sets its working days and hours, and within them is always available, accepting several appointments at once. Its offerings are labeled "clinic". | CONFIRMED |
| Main goal | Make its services and products visible, receive appointments and product orders. | CONFIRMED |
| Main problem | P01-PROB-002. | ASSUMED |
| Relevant needs | P01-NEED-006 to -009, -012. | See §4.3 |

**P01-USER-003 — Independent veterinarian** (source: P00 USER-003; A-P01Q-009, -012, -025, -030)

| Attribute | Description | Classification |
|---|---|---|
| Role | Independent vet who offers services and products. | CONFIRMED |
| Context | Self-registers and is not verified. May have no clinic, so the profile address is optional and is whatever they choose. Offers home services. Sets working days and hours. Availability: one appointment per slot (ASSUMED, P01-ASSUMPTION-021). | CONFIRMED / ASSUMED |
| Main goal | Same as P01-USER-002. | CONFIRMED |
| Main problem | P01-PROB-002. | ASSUMED |
| Relevant needs | P01-NEED-006 to -009, -012. | See §4.3 |

*Account types.* Two sign-up types (owner, provider). Clinic or independent vet is treated as a provider attribute shown as a label. This is ASSUMED (P01-ASSUMPTION-019; P01-QUESTION-029 not answered).

### 4.2 Secondary Users

None. There is no administrator role (A-P01Q-006).

### 4.3 User Needs

| ID | User | Need | Classification | Source |
|---|---|---|---|---|
| P01-NEED-001 | Pet owner | Find veterinary services in a single place. | CONFIRMED | P00 §2, §6 |
| P01-NEED-002 | Pet owner | Register pets (species, weight, age, height, breed): at least one at sign-up; add, edit or remove later. | CONFIRMED | P00 MVP-001; A-P01Q-010, -031 |
| P01-NEED-003 | Pet owner | Find services and products, optionally by species, and see each service's modality and the provider type. | CONFIRMED | A-P01Q-002, -011, -022 |
| P01-NEED-004 | Pet owner | Book a one-hour appointment for a chosen pet within the provider's working hours; give an address for home visits; cancel or reschedule before it happens. | CONFIRMED | A-P01Q-017, -019, -022, -025 |
| P01-NEED-005 | Pet owner | Have some basis to trust a provider. | CONFIRMED as a need; **intentionally not addressed** (A-P01Q-018) | P00 §2 |
| P01-NEED-006 | Provider | Publish services (one species, modality) and products (one species). | CONFIRMED | A-P01Q-002, -008, -028 |
| P01-NEED-007 | Provider | Keep the catalog up to date. | CONFIRMED | P00 MVP-002; A-P01Q-023 |
| P01-NEED-008 | Provider | See the appointments booked with them, and cancel or reschedule them. | CONFIRMED | A-P01Q-026 |
| P01-NEED-009 | All users | Sign up and sign in to their own interface. | CONFIRMED | P00 MVP-006; A-P01Q-005, -012 |
| P01-NEED-010 | Pet owner | See a provider's name, address (if any), contact, services, products and availability. | CONFIRMED | A-P01Q-021, -030 |
| P01-NEED-011 | Pet owner | Order products for delivery to their address without paying in the platform. **New in v4.0.** | CONFIRMED | A-P01Q-024 |
| P01-NEED-012 | Provider | Set working days and hours; learn about product orders placed with them. **New in v4.0.** | CONFIRMED (working hours); ASSUMED (order visibility, P01-ASSUMPTION-022) | A-P01Q-024, -025 |

---

## 5. Jobs To Be Done

| ID | User | Situation | Motivation | Expected Outcome | Source |
|---|---|---|---|---|---|
| P01-JTBD-001 | Pet owner | When my pet needs a veterinary service, | I want to search in one place, filter by species, and see who offers each service and how to reach them, | so I can choose a provider without using other channels. | P00 §2; A-P01Q-021, -022 |
| P01-JTBD-002 | Pet owner | When I have chosen a service, | I want to book a one-hour slot for one of my pets within the provider's working hours, giving my address for home visits, | so I can get the service for my pet. | A-P01Q-017, -019, -022, -025 |
| P01-JTBD-003 | Pet owner | When my plans change before the appointment, | I want to reschedule or cancel it, | so the appointment reflects what I will attend. | A-P01Q-019 |
| P01-JTBD-004 | Pet owner | When I need a product for my pet, | I want to find providers that offer it for its species and order it to my address, | so I receive it without paying online or going elsewhere. | A-P01Q-002, -022, -024, -028 |
| P01-JTBD-005 | Provider | When I want to reach pet owners, | I want to sign up, publish my profile, working hours, services and products, and keep them up to date, | so owners can find me, book appointments and order products. | A-P01Q-005, -021, -023, -025; ASM-002 |
| P01-JTBD-006 | Provider | When owners book appointments with me, | I want to see them in one place and cancel or reschedule them if needed, | so my schedule reflects what I will attend. | A-P01Q-026 |
| P01-JTBD-007 | Provider | When an owner orders one of my products, | I want to know about it and the delivery address, | so I can deliver it. | A-P01Q-024; ASSUMED (P01-ASSUMPTION-022) |

JTBD-005 to -007 inherit the ASSUMED status of the provider-side problem (P01-PROB-002).

---

## 6. Value Proposition

### 6.1 Primary Value

**P01-VALUE-001 (CONFIRMED: P00 §3; A-P01Q-013):** Centralize veterinary services, and the products providers offer, in one platform. A pet owner can find a provider and schedule an appointment for their pet without using any outside channel.

No quantitative or competitive claims are made.

### 6.2 Value by User Type

| User | Need | Product Value | Source |
|---|---|---|---|
| Pet owner | NEED-001, -003, -010 | **P01-VALUE-002:** One place to see Bogotá providers' services and products, by species, with name, address, contact, type and availability. | A-P01Q-002, -011, -021, -022 |
| Pet owner | NEED-002, -004 | **P01-VALUE-003:** Book, reschedule or cancel one-hour appointments for a specific pet, at a clinic or at home. | A-P01Q-017, -019, -025 |
| Pet owner | NEED-011 | **P01-VALUE-005:** Order products for their pet to their address from the same platform, without online payment. **New.** | A-P01Q-024 |
| Pet owner | NEED-005 | **Not provided**, by team decision. | A-P01Q-018 |
| Provider | NEED-006 to -009, -012 | **P01-VALUE-004:** A self-service channel to present services and products, define working hours, and receive and manage appointments and product orders. | ASM-002; A-P01Q-005, -024 to -026 |

---

## 7. Core Product Experience

### 7.1 Core User Journey

**P01-JOURNEY-001 — Pet owner: from need to scheduled appointment**

```text
Pet owner has a pet that needs a veterinary service
        ↓
Signs up as a pet owner, registering at least one pet           (P01-MVP-006, -005; A-P01Q-010)
   (or signs in; can add, edit or remove pets later)             (A-P01Q-031)
        ↓
Searches services and products in Bogotá,
optionally filtering by species                                  (P01-MVP-001; A-P01Q-022)
        ↓
Views a provider: name, address (if any), contact,
services, products, clinic / independent label                   (P01-MVP-008; A-P01Q-011, -021, -030)
        ↓
Selects a service and one of their pets                          (P01-MVP-002; A-P01Q-022, -031)
        ↓
Chooses a 1-hour slot within the provider's working days/hours:
 • clinic: any slot in working hours                             (A-P01Q-025)
 • independent vet: a slot without another appointment           (ASSUMED — P01-ASSUMPTION-021)
        ↓
If it is a home visit, enters the address                        (A-P01Q-017)
        ↓
Outcome: appointment scheduled (no confirmation step)            (A-P01Q-019)
        ↓ (optional, any time before the appointment)
Owner reschedules or cancels — the provider may also do so       (P01-MVP-007; A-P01Q-019, -026)
```

**Still undefined:**

- Whether a service for one species can be booked for a pet of another species (P01-DECISION-013, Low).
- How an owner learns that a provider cancelled or rescheduled, since notifications are excluded. ASSUMED: by checking their own appointments view (P01-ASSUMPTION-023).

### 7.2 Provider Journey

**P01-JOURNEY-002 — Provider: from sign-up to attending appointments and orders**

```text
Signs up as a provider (clinic or independent vet)               (P01-MVP-006; A-P01Q-005, -012)
        ↓
Completes profile: name, address (optional), contact             (P01-MVP-008; A-P01Q-021, -030)
        ↓
Sets working days and hours                                      (P01-MVP-010; A-P01Q-025)
        ↓
Publishes services (one species; clinic and/or home)
and products (one species)                                       (P01-MVP-003; A-P01Q-002, -008, -009, -028)
        ↓
Offerings become visible to every pet owner in Bogotá            (P01-MVP-001; A-P01Q-003)
        ↓
Owners book appointments and order products
        ↓
Provider sees booked appointments in its appointments space;
can cancel or reschedule them                                    (P01-MVP-007; A-P01Q-026)
Provider sees product orders with the delivery address           (P01-MVP-009; how: ASSUMED — P01-ASSUMPTION-022)
        ↓
Outcome: provider attends appointments (clinic or owner's address)
and delivers ordered products (outside the platform — ASSUMED P01-ASSUMPTION-022)
```

### 7.3 Key Product Interactions

| ID | Interaction | Users | Classification | Source |
|---|---|---|---|---|
| P01-JOURNEY-003 | The provider's catalog (services and products, one species each) determines what owners can search and order. | Provider → Owner | CONFIRMED | A-P01Q-002, -008, -022, -028 |
| P01-JOURNEY-004 | The species filter applies to offerings, not to the owner's pets. There is no area filtering. | Owner | CONFIRMED | A-P01Q-003, -022 |
| P01-JOURNEY-005 | Bookable slots are 1-hour slots inside the provider's working hours. Clinics have no conflicts; independent vets have one appointment per slot. Both parties can cancel or reschedule, and there is no confirmation step. | Owner ↔ Provider | CONFIRMED; independent-vet rule ASSUMED | A-P01Q-019, -025, -026 |
| P01-JOURNEY-006 | A product order is placed directly, with no request, reservation or payment, and goes to the owner's address. **New.** | Owner → Provider | CONFIRMED; order handling partly UNKNOWN | A-P01Q-024 |
| P01-JOURNEY-007 | **Product ordering journey.** Owner searches products → selects a product → orders it to their address → provider sees the order → provider delivers outside the platform. **New.** | Owner → Provider | Ordering CONFIRMED; order contents, price display, cancellation and provider view are REQUIRES_DECISION (P01-DECISION-014, -015) | A-P01Q-024 |

---

## 8. MVP Definition

Identifiers from earlier versions are kept. P01-MVP-004 remains retired, since it was merged into P01-MVP-003 in v2.0.

### 8.1 MVP Core

| ID | Capability | User Need Addressed | Rationale | Source |
|---|---|---|---|---|
| P01-MVP-001 | **Search of services and products** across Bogotá providers, with an optional species filter. Each result shows whether it comes from a clinic or an independent vet. | NEED-001, -003 | Delivers "find in one place". | P00 MVP-003; A-P01Q-002, -011, -022 |
| P01-MVP-002 | **Appointment scheduling.** The owner books a **1-hour slot** within the provider's working days and hours for one of their pets, and must have at least one pet. Clinics accept any slot in working hours; independent vets accept a slot with no other appointment (ASSUMED). An address is required for home visits. There is no confirmation step. | NEED-004 | Delivers "access"; this is the outcome of the core journey. **Changed in v4.0:** slot length, working hours, clinic rule. | P00 MVP-004; A-P01Q-017, -019, -022, -025, -031 |
| P01-MVP-003 | **Provider catalog.** Services (one species; in-clinic and/or home) and products (one species). | NEED-006, -007 | Without offerings there is nothing to find or book. | P00 MVP-002 + MVP-005; A-P01Q-002, -008, -023, -028 |

### 8.2 MVP Supporting

| ID | Capability | Purpose | Source |
|---|---|---|---|
| P01-MVP-005 | **Pet management.** Register at least one pet at owner sign-up (species, weight, age, height, breed); add, edit or remove pets afterwards. At least one pet is required to book. Pets are not used to filter search. **Changed in v4.0.** | Links appointments to a specific pet. | P00 MVP-001; A-P01Q-010, -022, -031 |
| P01-MVP-006 | **Accounts and authentication.** Self-registration as a pet owner or a provider, with a distinct interface for each. Account data: name, email, password (hashed). | Separates the two sides and links data to users. | P00 MVP-006; A-P01Q-005, -012 |
| P01-MVP-007 | **Appointment management by both parties.** The owner can cancel or reschedule any time before the appointment. The provider sees its appointments in an "appointments space" and can also cancel or reschedule. **Changed in v4.0:** provider actions. | Keeps both parties' schedules accurate. | A-P01Q-019, -026 |
| P01-MVP-008 | **Provider public profile.** Name, address (optional), contact, services and products, and availability when booking. **Changed in v4.0:** address is optional. | Lets owners identify and reach the provider. | A-P01Q-021, -030 |
| P01-MVP-009 | **Product ordering.** The owner orders products directly, delivered to their address, with no payment in the platform and no request or reservation step. **New in v4.0.** | Lets owners obtain products from the platform. | A-P01Q-024 |
| P01-MVP-010 | **Provider working days and hours.** Each provider sets the days and hours in which it can be booked. **New in v4.0.** | Defines bookable slots for P01-MVP-002. | A-P01Q-025 |

**Note on P01-MVP-009 (product ordering).** It does not derive from the core problem, which is finding and accessing veterinary **services**, and the core value can be demonstrated without it. It is included **by explicit team decision** (A-P01Q-002, -024). The following are not stated by the team and are left as decisions rather than invented:

- What an order contains (one or several products, quantities).
- Whether prices are shown.
- How the provider sees orders.
- Whether orders can be cancelled.
- How delivery happens.

### 8.3 Future Capabilities

| ID | Capability | Reason for Deferral | Source |
|---|---|---|---|
| — | None defined. | The team has not intentionally deferred any capability. | P00 §5 |

### 8.4 Undefined / Requires Decision

**Resolved since v3.0:**

| Decision | Resolution |
|---|---|
| P01-DECISION-010 (products) | Direct ordering to the owner's address, without payment. |
| P01-DECISION-011 (slots) | 1-hour slots, working hours; clinics always available. |
| P01-DECISION-012 (provider actions) | Providers see appointments and can cancel or reschedule them. |

**Still open:**

| ID | Capability or Decision | Why It Matters |
|---|---|---|
| P01-DECISION-001 | **Build order under the time constraint.** Still a PROPOSAL (P01-QUESTION-032 not answered); updated for v4.0. Suggested order: (1) P01-MVP-006 accounts; (2) P01-MVP-003 catalog with P01-MVP-008 profile and P01-MVP-010 working hours; (3) P01-MVP-005 pets; (4) P01-MVP-001 search; (5) P01-MVP-002 scheduling; (6) P01-MVP-007 cancel/reschedule; (7) P01-MVP-009 product ordering. The order follows dependencies, plus the fact that ordering is not needed for the core value. It removes nothing from the MVP. | Defines what is demonstrable first if time runs out. |
| P01-DECISION-013 | **Species consistency at booking.** Can a service for species X be booked for a pet of species Y? Not answered; Low. | Booking rule for P02. |
| P01-DECISION-014 | **Order contents and price.** One or several products per order? Quantities? Are prices of products (and services) shown, given that payment happens outside the platform? **New.** | Defines P01-MVP-009 and the catalog content. |
| P01-DECISION-015 | **Order handling.** Where providers see orders; whether the owner or the provider can cancel an order; whether orders have any status. Real-time tracking is excluded. **New.** | Completes the ordering journey. |

### 8.5 Out of Scope

| ID | Excluded Capability | Basis |
|---|---|---|
| P01-OOS-001 | Verification of provider credentials | CONFIRMED (P00 OOS-001) |
| P01-OOS-002 | Determining the user's area | CONFIRMED (P00 OOS-002) |
| P01-OOS-003 | Cities other than Bogotá | CONFIRMED (P00 OOS-003) |
| P01-OOS-004 | Payments (including for product orders), notifications, real-time tracking (including of orders) | CONFIRMED (A-P01Q-002, -024) |
| P01-OOS-005 | Different scheduling rules for clinic vs. home visits | CONFIRMED (P00 OOS-005) |
| P01-OOS-006 | Ratings and reviews | CONFIRMED (A-P01Q-018) |
| P01-OOS-007 | Appointment confirmation step | CONFIRMED (A-P01Q-019) |
| P01-OOS-008 | Administrator / operator role | CONFIRMED (A-P01Q-006) |
| P01-OOS-009 | Managing staff or capacity inside a clinic ("whether there's a professional available") | **New**, CONFIRMED (A-P01Q-025) |
| P01-OOS-010 | Requesting or reserving products; only direct ordering | **New**, CONFIRMED (A-P01Q-024) |

---

## 9. Product Principles

| ID | Principle | Rationale |
|---|---|---|
| P01-PRINCIPLE-001 | Keep the whole path from "my pet needs a service" to "appointment scheduled" inside the platform. | Adopted success evidence (A-P01Q-013). |
| P01-PRINCIPLE-002 | Let owners narrow results by species, independently of the pets they own. | A-P01Q-022. |
| P01-PRINCIPLE-003 | Treat both sides as first-class, each with its own interface. | A-P01Q-012. |
| P01-PRINCIPLE-004 | Providers own their profile, working hours and catalog; there is no central administration. | A-P01Q-005, -006, -025. |
| P01-PRINCIPLE-005 | Prefer the simplest rule the team has stated: no confirmation, no payment, no staff capacity, clinics always available in working hours. | A-P01Q-019, -024, -025; SYSTEM_PROMPT §8. |
| P01-PRINCIPLE-006 | Build the core service journey before supporting capabilities; the time window is very short and its risks are accepted. | P00 §8; A-P01Q-020. |
| P01-PRINCIPLE-007 | Keep undecided rules visible instead of filling them in implicitly. | §8.4; SYSTEM_PROMPT §9, §10. |

These are guidance for product decisions, not requirements.

---

## 10. Initial Success Criteria

| ID | Success Criterion | Related User/Value | Source |
|---|---|---|---|
| P01-SUCCESS-001 | A pet owner can sign up after registering at least one pet, and later add, edit or remove pets. | Owner / NEED-002 | A-P01Q-010, -031 |
| P01-SUCCESS-002 | A provider can sign up, complete its profile (address optional), set working days and hours, and publish and update services and products. | Providers / VALUE-004 | A-P01Q-002, -005, -021, -025, -030 |
| P01-SUCCESS-003 | A pet owner can search services and products across Bogotá, filter by species, and see the provider's details and type. | Owner / VALUE-002 | A-P01Q-011, -021, -022 |
| P01-SUCCESS-004 | A pet owner with at least one pet can book a 1-hour slot within the provider's working hours (respecting the independent-vet rule), entering an address for home visits. | Owner / VALUE-003 | A-P01Q-017, -019, -025, -031 |
| P01-SUCCESS-005 | Pet owners and providers can create an account and sign in to their own interface. | All / NEED-009 | A-P01Q-012 |
| P01-SUCCESS-006 | Either the owner or the provider can cancel or reschedule an appointment before it takes place, and the provider sees its appointments in one place. | Owner, Providers / NEED-004, -008 | A-P01Q-019, -026 |
| P01-SUCCESS-007 | A pet owner can go from "my pet needs a service" to a scheduled appointment with a provider offering a service for the pet's species **without using any channel outside the platform** to find that provider. | Owner / VALUE-001 | **Adopted by the team** (A-P01Q-013) |
| P01-SUCCESS-008 | A pet owner can order a product to their address without paying in the platform, and the provider can see the order. **New.** | Owner, Providers / VALUE-005 | A-P01Q-024; the provider-side view is ASSUMED |

---

## 11. Product Assumptions

### Resolved (kept for traceability)

| ID | Resolution |
|---|---|
| P01-ASSUMPTION-001, -003 to -015 | Resolved in v2.0 or v3.0 (see `history/PRODUCT_VISION_v3.0.md`). |
| P01-ASSUMPTION-016 | Products are listings only. **Invalidated**: owners can order products (A-P01Q-024). |
| P01-ASSUMPTION-017 | Availability means no other appointment, with no working hours. **Replaced**: 1-hour slots in working hours; clinics always available (A-P01Q-025). Independent vets: see -021. |
| P01-ASSUMPTION-018 | Providers see their appointments. **Confirmed** (A-P01Q-026). |
| P01-ASSUMPTION-020 | One species per product. **Confirmed** (A-P01Q-028). |
| P01-ASSUMPTION-024 | *(earlier v4.0: answers to v2.0 questions remain valid although absent from the first V4 input)*. **Resolved**: the consolidated `PROJECT_CONTEXT_V4.md` contains all answers. |

### Open

| ID | Assumption | Impact | Source |
|---|---|---|---|
| P01-ASSUMPTION-002 | Providers want an additional channel to reach pet owners. | Medium (supply side) | P00 ASM-002 |
| P01-ASSUMPTION-019 | Two account types; clinic or independent vet is a provider attribute shown as a label. Not answered in V4. | Low | A-P01Q-011, -012 |
| P01-ASSUMPTION-021 | An independent vet can have only **one appointment per 1-hour slot**. The earlier rule ("no other appointment", A-P01Q-019) still applies to them; A-P01Q-025 changed it only for clinics. **New.** | Medium (scheduling) | A-P01Q-019, -025; CON-P01-003 |
| P01-ASSUMPTION-022 | Providers see product orders, with the owner's delivery address, in their interface, and deliver **outside the platform**. The platform has no delivery logistics. **New.** | Medium (ordering journey) | A-P01Q-024; OOS-004 |
| P01-ASSUMPTION-023 | Owners have their own appointments view (implied by being able to cancel or reschedule). Since notifications are excluded, this view is how they learn of changes made by the provider. **New.** | Medium (owner journey) | A-P01Q-019, -026; OOS-004 |
| P01-ASSUMPTION-025 | An owner must register at least one pet at sign-up, may later remove pets (even all of them), and needs at least one pet to book. **New.** | Low | A-P01Q-010, -031; CON-P01-004 |
| P01-ASSUMPTION-026 | The delivery address is entered when the order is placed, as with home visits. **New.** | Low | A-P01Q-017, -024 |

---

## 12. Open Product Questions

### Open

| ID | Question | Impact | Priority |
|---|---|---|---|
| P01-QUESTION-034 | Can an order contain several products and quantities? Are prices shown for products and services? (P01-DECISION-014) | Ordering, catalog | Medium (during P02) |
| P01-QUESTION-035 | Where do providers see product orders? Can the owner or the provider cancel an order? Do orders have a status? (P01-DECISION-015) | Ordering journey | Medium (during P02) |
| P01-QUESTION-036 | Is delivery always handled by the provider outside the platform? Is the address entered per order? (P01-ASSUMPTION-022, -026) | Ordering journey | Low |
| P01-QUESTION-037 | Do independent vets keep the "one appointment per slot" rule? (P01-ASSUMPTION-021) | Scheduling | Medium (before P02) |
| P01-QUESTION-038 | Can an owner remove all their pets after sign-up? (P01-ASSUMPTION-025) | Pet management | Low |
| P01-QUESTION-039 | Do owners have a "my appointments" view, and is it how they learn of provider cancellations? (P01-ASSUMPTION-023) | Owner journey | Low |
| P01-QUESTION-027 | Can a service for one species be booked for a pet of another species? Not answered in V4. | Booking rule | Low (decide in P02) |
| P01-QUESTION-029 | Is "clinic or independent vet" a provider attribute? Not answered in V4. | Account model | Low |
| P01-QUESTION-032 | What are the dates? Is the build-order PROPOSAL accepted? Not answered in V4. | Planning | Low (before P03) |
| P01-QUESTION-033 | Regenerate and validate P00 from the consolidated `PROJECT_CONTEXT_V4.md`, so its body matches the answers? Not answered. | Source of truth | Medium (before P02) |

### Resolved Since v3.0

| ID | Question | Resolution |
|---|---|---|
| P01-QUESTION-024 | Product interaction | Direct ordering to address, no payment, no request or reservation. |
| P01-QUESTION-040 | *(earlier v4.0)* Do the answers to v2.0 questions remain valid? | Yes: included in the consolidated `PROJECT_CONTEXT_V4.md`. |
| P01-QUESTION-025 | Slot model | 1 hour; working days and hours; clinics always available; no staff availability. |
| P01-QUESTION-026 | Provider appointment actions | Appointments space; can cancel or reschedule. |
| P01-QUESTION-028 | Species per product | One. |
| P01-QUESTION-030 | Address of an independent vet | Their choice; may be empty. |
| P01-QUESTION-031 | Pet management after sign-up | Add, edit or remove; one needed to book. |

---

## 13. Product Risks

| ID | Risk | Impact | Mitigation Consideration |
|---|---|---|---|
| P01-RISK-001 | The problem is team-stated; there is no evidence from pet owners or providers. | Low | Optional evidence in P10. |
| P01-RISK-002 | **Scope growth.** Product ordering is now in the MVP by team decision. The residual risk is that order handling (statuses, cancellation, stock, delivery) expands it further. | Medium | Decide P01-DECISION-014 and -015 with the simplest option; keep tracking and payments out. |
| P01-RISK-003 | Two-sided dependency for the demo. | Low | Plan demo data for both sides. |
| P01-RISK-004 | Scheduling rules. **Reduced**: the slot model is defined. Residual: the independent-vet rule is assumed. | Low | Confirm P01-QUESTION-037. |
| P01-RISK-006 | Unverified providers. **Accepted by the team.** | Low | Keep visible. |
| P01-RISK-008 | Domain knowledge for the species mapping. **Reduced**. | Low | None. |
| P01-RISK-009 | **Time feasibility.** P06–P10 must fit in three days, and scope grew again in v4.0 (product ordering, working hours, provider cancel/reschedule). **Accepted by the team** (A-P01Q-020). | High (accepted) | Use the build-order PROPOSAL as a fallback; ordering last. |
| P01-RISK-010 | **Value gap.** The trust consequence is not addressed. **Accepted by the team** (A-P01Q-018). | Low (accepted) | Optionally narrow the problem in P00. |
| P01-RISK-011 | Owners' home and delivery addresses are collected; there are no privacy requirements beyond password hashing (A-P01Q-015). | Low | Keep visible for P02/P05. |
| P01-RISK-012 | **No notifications.** Owners may not learn that a provider cancelled or rescheduled, and providers may not notice new appointments or orders, unless they check their interface. **New.** | Medium | Make appointment and order views easy to check (P01-ASSUMPTION-023); team decides whether this is acceptable for the demo. |
| P01-RISK-013 | **Outdated P00 body.** All answers are now in one input file, so the fragmentation is resolved. However, the P00 body still contradicts several answers and has not been validated with them, so downstream stages that read the body alone may use outdated rules. **Reduced.** | Low | Regenerate P00 (P01-QUESTION-033). |

Closed: P01-RISK-005, P01-RISK-007 (closed in v3.0).

---

## 14. Scope Summary

### Included in MVP

**Core:**

- **P01-MVP-001 Search:** services and products, species filter, provider-type label.
- **P01-MVP-002 Scheduling:** 1-hour slots in working hours; clinics always available; independent vets one per slot (assumed); a pet is required; address for home visits; no confirmation.
- **P01-MVP-003 Provider catalog:** services and products, one species each.

**Supporting:**

- **P01-MVP-005 Pet management:** at least one pet at sign-up; add, edit or remove later.
- **P01-MVP-006 Accounts:** two types, self-registration, separate interfaces.
- **P01-MVP-007 Appointment management:** owner and provider can cancel or reschedule; provider appointments space.
- **P01-MVP-008 Provider public profile:** address optional.
- **P01-MVP-009 Product ordering:** direct, to the owner's address, no payment. New in v4.0.
- **P01-MVP-010 Provider working days and hours.** New in v4.0.

**Platform:** web (required).

### Deferred

None defined by the team.

### Undefined

- **P01-DECISION-001:** build-order PROPOSAL.
- **P01-DECISION-013:** species consistency at booking.
- **P01-DECISION-014:** order contents and prices.
- **P01-DECISION-015:** order handling.

### Out of Scope

All CONFIRMED:

- P01-OOS-001 Provider verification.
- P01-OOS-002 Area determination.
- P01-OOS-003 Other cities.
- P01-OOS-004 Payments, notifications, real-time tracking.
- P01-OOS-005 Different clinic/home scheduling rules.
- P01-OOS-006 Ratings and reviews.
- P01-OOS-007 Appointment confirmation.
- P01-OOS-008 Administrator role.
- P01-OOS-009 Clinic staff and capacity management.
- P01-OOS-010 Product requests and reservations.

---

## 15. Traceability Summary

| P01 Element | Source | Relationship |
|---|---|---|
| P01-PROB-001 / -002 | P00 §2 / ASM-002 | Direct / ASSUMED |
| P01-USER-001 to -003 | P00 USER-001 to -003; A-P01Q-005, -009 to -012, -025, -030, -031 | Direct; account model ASSUMED |
| P01-NEED-001 to -011 | P00 §2, §6, MVP-001 to -006; A-P01Q-002 to -031 as listed | Direct / refined |
| P01-NEED-012 | A-P01Q-024, -025 | Direct (working hours); ASSUMED (order visibility) |
| P01-JTBD-001 to -007 | As listed in §5 | Refined; JTBD-007 partly ASSUMED |
| P01-VALUE-001 to -005 | P00 §3, §6; A-P01Q-002, -013, -018, -021, -024 to -026 | Direct / refined |
| P01-JOURNEY-001 to -007 | P00 §3; answers as cited inline | Refined; independent-vet rule, owner view and order handling ASSUMED |
| P01-MVP-001 | P00 MVP-003; A-P01Q-002, -011, -022 | Direct |
| P01-MVP-002 | P00 MVP-004; A-P01Q-017, -019, -022, -025, -031 | Direct; superseding answers (CON-P01-001, -003) |
| P01-MVP-003 | P00 MVP-002 + MVP-005; A-P01Q-002, -008, -023, -028 | Refined (consolidation accepted) |
| P01-MVP-005 | P00 MVP-001; A-P01Q-010, -022, -031 | Direct (CON-P01-004 reconciled) |
| P01-MVP-006 | P00 MVP-006; A-P01Q-005, -012 | Direct |
| P01-MVP-007 | P00 MVP-004; A-P01Q-019, -026 | Direct |
| P01-MVP-008 | A-P01Q-021, -030 | Direct |
| P01-MVP-009 | A-P01Q-002, -024 | Direct (team decision; not derived from the core problem) |
| P01-MVP-010 | A-P01Q-025 | Direct |
| P01-OOS-001 to -010 | P00 OOS-001 to -005; A-P01Q-002, -006, -018, -019, -024, -025 | Direct |
| P01-SUCCESS-001 to -008 | P00 SUCCESS-001 to -005; answers as cited | Direct; SUCCESS-007 adopted |
| P01-DECISION-001, -013 to -015 | A-P01Q-020; gaps in A-P01Q-022, -024 | Carried / new |
| P01-ASSUMPTION-021 to -023, -025, -026 | A-P01Q-010, -017, -019, -024 to -026, -031 | New, labeled |
| P01-QUESTION-034 to -039 | Gaps in A-P01Q-024, -025, -031 | New |
| P01-RISK-001 to -013 | P00 risks; answers | Carried / updated / new |

### MVP identifier mapping

| P01 v4.0 | P01 v3.0 | P00 (body) / Answers |
|---|---|---|
| P01-MVP-001 Search | P01-MVP-001 | MVP-003 |
| P01-MVP-002 Scheduling (1-hour slots, working hours) | P01-MVP-002 ("no other appointment") | MVP-004; A-P01Q-025 |
| P01-MVP-003 Provider catalog | P01-MVP-003 | MVP-002 + MVP-005 |
| *(retired)* | *(retired)* | — |
| P01-MVP-005 Pet management | P01-MVP-005 (registration at sign-up) | MVP-001; A-P01Q-031 |
| P01-MVP-006 Accounts | P01-MVP-006 | MVP-006 |
| P01-MVP-007 Appointment management (both parties) | P01-MVP-007 (owner only) | MVP-004; A-P01Q-026 |
| P01-MVP-008 Provider profile (address optional) | P01-MVP-008 | A-P01Q-021, -030 |
| P01-MVP-009 Product ordering | — (new) | A-P01Q-024 |
| P01-MVP-010 Working days and hours | — (new) | A-P01Q-025 |

---

## 16. Product Vision Status

**READY_WITH_ASSUMPTIONS**

The scheduling model is now fully defined except for one assumed rule for independent vets. Users, value, journeys, MVP and exclusions are confirmed and bounded. Requirements Engineering can begin, carrying the documented assumptions.

**What must be tracked:**

1. **Product ordering details.** Order contents, prices and order handling are undecided (P01-DECISION-014, -015). Requirements for P01-MVP-009 should stay provisional until they are decided.
2. **Outdated P00 body.** All team answers are now in one input file, but the P00 body has not been regenerated or validated with them (P01-QUESTION-033). It should be regenerated before P02 baselines requirements.

The product is **not** fully specified.

### Change Log (v3.0 → v4.0)

| Change | Source |
|---|---|
| Product ordering added (direct, to address, no payment); "listings only" assumption invalidated. | A-P01Q-024 |
| Scheduling: 1-hour slots; providers set working days and hours (new P01-MVP-010); clinics always available within hours; independent vets keep one per slot (ASSUMED). | A-P01Q-025 (CON-P01-003) |
| Providers see an appointments space and can cancel or reschedule. | A-P01Q-026 |
| One species per product confirmed. | A-P01Q-028 |
| Provider address optional. | A-P01Q-030 |
| Pet management: add, edit or remove after sign-up; one pet required to book. | A-P01Q-031 (CON-P01-004) |
| Out of Scope: clinic staff/capacity management, product requests/reservations added. | A-P01Q-024, -025 |
| Decisions -010 to -012 resolved; -014 and -015 added; build-order PROPOSAL updated, ordering placed last. | Answers |
| Assumptions -016 to -018 and -020 resolved; -021 to -026 added. | Answers; input integrity |
| Questions -024 to -026, -028, -030, -031 resolved; -034 to -039 added; -027, -029, -032, -033 kept open at reduced priority. | Answers |
| Risks -012 (no notifications) and -013 (outdated P00 body) added; -009 updated. | Answers |
| **Reissue:** input replaced by the consolidated `PROJECT_CONTEXT_V4.md` (all 25 answers, verified identical to those used before). Integration table now covers all answers; P01-ASSUMPTION-024 and P01-QUESTION-040 resolved; P01-RISK-013 reduced. Product content unchanged. | Consolidated input |
