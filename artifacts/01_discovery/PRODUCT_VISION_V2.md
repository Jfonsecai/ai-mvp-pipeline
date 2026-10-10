# Product Vision

> Classification legend (P01 §15): **CONFIRMED** = supported by P00 · **ASSUMED** = interpretation explicitly labeled as assumption · **UNKNOWN** = insufficient information · **REQUIRES_DECISION** = the team must decide · **PROPOSAL** = suggestion for team review, not a decision (SYSTEM_PROMPT §9).
> P00 identifiers (`MVP-00n`, `ASM-0nn`, `Q-0nn`, `RISK-0nn`, `OOS-00n`, `CON-00n`, `SUCCESS-00n`, `VAL-0nn`) refer to `PROJECT_CONTEXT.md` v2.0 and `CONTEXT_VALIDATION.md` v2.0 exactly as written there. P01 identifiers from v1.0 are kept where their meaning is unchanged.

## 1. Document Metadata

- **Version:** 2.0
- **Stage:** P01 — Product Discovery
- **Status:** READY_WITH_ASSUMPTIONS
- **Generated From:** `artifacts/00_context/PROJECT_CONTEXT.md` v2.0 (status READY_WITH_ASSUMPTIONS), received as `PROJECT_CONTEXT_V2.md`
- **Validation Dependency:** `artifacts/00_context/CONTEXT_VALIDATION.md` v2.0 — result **PASS_WITH_WARNINGS** (0 critical, 0 high, 4 medium, 7 low)
- **Previous Version:** `history/PRODUCT_VISION_v1.0.md` (generated from P00 v1.0; superseded)
- **Generation Date:** 2026-10-07

**Input note:** no answers to the P00 v2.0 open questions (Q-018 to Q-022, or the residual and unanswered questions) have been provided since P00 v2.0. None of them is treated as resolved here.

**P00 v2.0 warnings tracked in this document:**

| P00 Finding | Topic | Treatment in P01 v2.0 |
|---|---|---|
| VAL-001 | Scope vs. one-week timeline (CON-003) | MVP split into Core and Supporting; a dependency-based build order is offered as a PROPOSAL only (P01-DECISION-001). No capability removed. |
| VAL-002 | Problem cites missing ratings; ratings excluded (CON-002) | Recorded as a user need not covered by the MVP (P01-NEED-005); ratings/reviews moved to Undefined (P01-DECISION-002). |
| VAL-003 | Scheduling answer ambiguous (ASM-008) | Basic scheduling separated from appointment management; the latter stays ASSUMED (P01-MVP-007, P01-QUESTION-019). |
| VAL-004 | Home visits without location; provider info not stated (CON-004, Q-022) | Kept as REQUIRES_DECISION (P01-DECISION-004); journeys mark the gap. |
| VAL-005 | OOS-004 provisional | Payments, tracking, notifications kept as provisional Out of Scope; ratings moved to Undefined (see VAL-002). |
| VAL-006 | MVP-002 / MVP-005 overlap | Consolidated into one capability (P01-MVP-003) as a refinement; team may keep them separate (P01-QUESTION-023). |
| VAL-007 | Provider problem, prioritization, Q-009, Q-014 unconfirmed | Carried (P01-ASSUMPTION-002, -008; P01-QUESTION-009, -012, -013). |
| VAL-008 | Success criteria measure task completion only | One observable value-level criterion derived from the stated problem added (P01-SUCCESS-007). |
| VAL-009 | Spanish answers, English artifact | No new interpretation of Spanish text introduced in P01. |
| VAL-010, VAL-011 | Format; same-AI generation | Not product issues; human review recommended. |

---

## 2. Product Vision Statement

For **pet owners in Bogotá who need veterinary services for their pets** and today search across social networks, search engines, maps and word of mouth, and for the **veterinary clinics and independent veterinarians** who want to offer those services, the *Veterinary Services Platform MVP* (placeholder name) is a **web platform** where providers publish and maintain their services — at their clinic or as home visits — and pet owners find the services that apply to their pet's species and schedule an appointment, **all in one place**.

Its core value is to let pet owners find and access veterinary services without moving between multiple channels (CONFIRMED — P00 §3). The MVP does not address the lack of ratings that the team also identified as part of the problem; whether it should is undecided (P01-DECISION-002).

---

## 3. Problem Definition

### 3.1 Core Problem

**P01-PROB-001 — Pet owner (CONFIRMED; source: P00 §2, ANS-Q001):**
Pet owners who need a veterinary service for their pet have no single place to find one. They search across several unrelated channels and often cannot find reviews or ratings, so the search is uncomfortable, they move between platforms, and they may end up trusting providers without any accessible rating.

*Source note:* this problem was stated by the project team. No direct evidence from pet owners (e.g., interviews) has been provided (P01-RISK-001).

**P01-PROB-002 — Providers (ASSUMED; source: P00 ASM-002):**
Veterinary clinics and independent veterinarians want an additional channel to offer their services to pet owners. The provider-side problem has not been described by the team.

### 3.2 Problem Context

CONFIRMED (P00 §2 Current Situation): pet owners currently find veterinary services through Instagram, Facebook, Google, Maps, word of mouth, or by exploring the surroundings of familiar places. There is no single centralized platform for veterinary services.

The MVP context is an academic project limited to the city of Bogotá (P00 §1, §7). How providers currently acquire clients: UNKNOWN.

### 3.3 Consequences of the Problem

CONFIRMED (P00 §2 Problem Impact):

- The search is not optimal or comfortable.
- Pet owners have to move between several platforms.
- Pet owners may trust providers "blindly" because no ratings are accessible.

Frequency and severity: UNKNOWN. The MVP addresses the first two consequences; the third depends on P01-DECISION-002.

---

## 4. Target Users

### 4.1 Primary User

**P01-USER-001 — Pet owner** (source: P00 USER-001) — primary designation ASSUMED (P01-ASSUMPTION-008; P00 Q-013 unanswered).

| Attribute | Description | Classification |
|---|---|---|
| Role | Person responsible for a pet who needs veterinary services, located in Bogotá for the MVP. | CONFIRMED |
| Context | Currently searches across social networks, search engines, maps and word of mouth. Has an account on the platform (name, email, password). Demographics, devices and technical skills unknown. | CONFIRMED / UNKNOWN |
| Main goal | Find and access a veterinary service suitable for their pet in one place. | CONFIRMED |
| Main problem | P01-PROB-001. | CONFIRMED |
| Relevant needs | P01-NEED-001 to P01-NEED-005, P01-NEED-009. | See §4.3 |

*Rationale for primary designation:* the problem statement and value proposition in P00 (§2, §3) are expressed from the pet owner's perspective. P00 lists all three users as primary (ASM-007); this designation is a refinement, not a team decision.

### 4.2 Secondary Users

"Secondary" refers only to how the value proposition is framed. **Provider-side users are required for the MVP to deliver value** (P00 ASM-007, RISK-003).

**P01-USER-002 — Veterinary clinic** (source: P00 USER-002)

| Attribute | Description | Classification |
|---|---|---|
| Role | Veterinary clinic that wants to offer its services. | CONFIRMED |
| Context | Has an account; maintains its own catalog; not verified in the MVP. Whether clinics also offer home services is ambiguous (P01-QUESTION-009). | CONFIRMED / UNKNOWN |
| Main goal | Offer its services to pet owners and keep its catalog up to date. | CONFIRMED |
| Main problem | P01-PROB-002. | ASSUMED |
| Relevant needs | P01-NEED-006 to P01-NEED-009. | See §4.3 |

**P01-USER-003 — Independent veterinarian** (source: P00 USER-003)

| Attribute | Description | Classification |
|---|---|---|
| Role | Independent veterinarian who wants to offer services at their clinic or through home visits. | CONFIRMED |
| Context | Has an account; maintains their own catalog; not verified in the MVP. Whether every independent veterinarian has a clinic is unknown (P01-QUESTION-009). | CONFIRMED / UNKNOWN |
| Main goal | Offer in-clinic and/or home-visit services to pet owners and keep the catalog up to date. | CONFIRMED |
| Main problem | P01-PROB-002. | ASSUMED |
| Relevant needs | P01-NEED-006 to P01-NEED-009. | See §4.3 |

**Not added:** no administrator or operator role (P00 ASM-010). Providers maintain their own catalogs (ANS-Q006) and are not verified (OOS-001).

### 4.3 User Needs

| ID | User | Need | Classification | Source |
|---|---|---|---|---|
| P01-NEED-001 | Pet owner | Find veterinary services in a single place instead of across social networks, search engines, maps and word of mouth. | CONFIRMED | P00 §2, §6 |
| P01-NEED-002 | Pet owner | Register their pets (species, weight, age, height, breed). | CONFIRMED | P00 MVP-001 |
| P01-NEED-003 | Pet owner | See the providers and services that apply to their pet's species, and whether each is offered at a clinic or at home. | CONFIRMED | P00 MVP-003, MVP-005 |
| P01-NEED-004 | Pet owner | Schedule an appointment with a provider for a service; reschedule or cancel it if needed. | CONFIRMED (scheduling); ASSUMED (reschedule/cancel — P00 ASM-008) | P00 MVP-004 |
| P01-NEED-005 | Pet owner | Have some basis to trust a provider before choosing it, instead of choosing "blindly". | CONFIRMED as a need (P00 §2); **not covered by the MVP** — REQUIRES_DECISION (P01-DECISION-002) | P00 §2, CON-002 |
| P01-NEED-006 | Clinic, Independent vet | Make their services available to pet owners, indicating in-clinic or home-service modality. | CONFIRMED | P00 MVP-005 |
| P01-NEED-007 | Clinic, Independent vet | Keep their own service catalog up to date. | CONFIRMED | P00 MVP-002 |
| P01-NEED-008 | Clinic, Independent vet | Know about and manage the appointments scheduled with them (availability, confirmation, rescheduling/cancellation). | ASSUMED (P00 ASM-008) | P00 §6, MVP-004 |
| P01-NEED-009 | All users | Have a personal account to access the platform securely. | CONFIRMED | P00 MVP-006 |

---

## 5. Jobs To Be Done

| ID | User | Situation | Motivation | Expected Outcome | Source |
|---|---|---|---|---|---|
| P01-JTBD-001 | Pet owner | When my pet needs a veterinary service, | I want to find, in one place, the providers that offer a service suitable for my pet's species, | so I can choose a provider without searching across several channels. | P00 §2, MVP-003, USER-001 |
| P01-JTBD-002 | Pet owner | When I have chosen a provider and a service (at the clinic or at home), | I want to schedule an appointment, | so I can get the service for my pet. | P00 MVP-004, MVP-005 |
| P01-JTBD-003 | Pet owner | When my plans change after scheduling, | I want to reschedule or cancel the appointment, | so the provider and I keep an accurate agenda. | P00 MVP-004 — ASSUMED (ASM-008) |
| P01-JTBD-004 | Veterinary clinic | When I want to reach pet owners who need veterinary services, | I want to publish and keep my service catalog up to date, | so pet owners can find my services and schedule appointments. | P00 USER-002, MVP-002, MVP-005, ASM-002 |
| P01-JTBD-005 | Independent veterinarian | When I want to reach pet owners who need veterinary services, | I want to publish my in-clinic and/or home-visit services and keep them up to date, | so pet owners can find them and schedule appointments. | P00 USER-003, MVP-002, MVP-005, ASM-002 |
| P01-JTBD-006 | Clinic, Independent vet | When a pet owner schedules an appointment with me, | I want to know about it and manage it (confirm, reschedule, cancel), | so my agenda reflects the appointments I will actually attend. | P00 §6, MVP-004 — ASSUMED (ASM-008) |

JTBD-004 to -006 inherit the ASSUMED status of the provider-side problem (P01-PROB-002).

---

## 6. Value Proposition

### 6.1 Primary Value

**P01-VALUE-001 (CONFIRMED — P00 §3):** Centralize veterinary services in one platform so that pet owners can find and access the services their pets need without moving between multiple channels.

No quantitative or competitive claims are made.

### 6.2 Value by User Type

| User | Need | Product Value | Source |
|---|---|---|---|
| Pet owner | P01-NEED-001, -003 | **P01-VALUE-002:** One place to see the veterinary providers in Bogotá and the services that apply to their pet's species, in clinic or at home. | P00 §3, §6, MVP-003 |
| Pet owner | P01-NEED-004 | **P01-VALUE-003:** Schedule (and, if ASM-008 holds, reschedule or cancel) the appointment through the same platform. | P00 §3, MVP-004 |
| Pet owner | P01-NEED-005 | **Not provided by the MVP** as currently scoped. Depends on P01-DECISION-002. | P00 CON-002 |
| Clinic / Independent vet | P01-NEED-006 to -008 | **P01-VALUE-004:** A channel where pet owners looking for veterinary services find their maintained catalog and schedule appointments with them. | P00 §6 (ASM-002), MVP-002, MVP-005 |

---

## 7. Core Product Experience

### 7.1 Core User Journey

**P01-JOURNEY-001 — Pet owner: from need to scheduled appointment**

```text
Pet owner has a pet that needs a veterinary service
        ↓
Pet owner creates an account / signs in                          (P01-MVP-006)
        ↓
Pet owner registers the pet (species, weight, age, height, breed) (P01-MVP-005)
        ↓
Pet owner consults providers and services in Bogotá
that apply to the pet's species                                   (P01-MVP-001)
        ↓
Pet owner selects a provider and a service (clinic or home)       (P01-MVP-001, P01-MVP-003)
        ↓
Pet owner schedules an appointment                                (P01-MVP-002; availability: P01-MVP-007, ASSUMED)
        ↓
Appointment is confirmed                                          (who confirms: REQUIRES_DECISION — P01-QUESTION-019)
        ↓
Outcome: appointment scheduled with the provider
        ↓ (optional)
Pet owner reschedules or cancels                                  (P01-MVP-007, ASSUMED)
```

Classification: the sequence of capabilities is CONFIRMED (P00 §3). The order "register pet before consulting" is ASSUMED (P01-ASSUMPTION-013; P01-QUESTION-010). For **home visits**, how the provider learns where to go is undefined (P01-DECISION-004); for **in-clinic** appointments, which provider information the owner sees (e.g., location) is undefined (P01-QUESTION-021).

### 7.2 Provider Journey

**P01-JOURNEY-002 — Clinic or independent veterinarian: from offering to managing appointments**

```text
Provider creates an account / signs in                            (P01-MVP-006; self-registration ASSUMED — P01-ASSUMPTION-014)
        ↓
Provider publishes and maintains its service catalog,
indicating in-clinic and/or home-service modality
and the species each service applies to                           (P01-MVP-003; species link ASSUMED — ASM-011)
        ↓
Provider defines its availability                                 (P01-MVP-007, ASSUMED — ASM-008)
        ↓
Services become visible to pet owners in Bogotá                   (P01-MVP-001)
        ↓
Pet owners schedule appointments                                  (P01-MVP-002)
        ↓
Provider confirms / reschedules / cancels                         (P01-MVP-007, ASSUMED; who confirms: REQUIRES_DECISION)
        ↓
Outcome: provider's agenda reflects scheduled appointments
```

### 7.3 Key Product Interactions

| ID | Interaction | Users | Classification | Source |
|---|---|---|---|---|
| P01-JOURNEY-003 | Provider's catalog (services, modality, species) → what pet owners can consult. | Provider → Pet owner | CONFIRMED; species link ASSUMED | P00 MVP-002, MVP-003, MVP-005, ASM-011 |
| P01-JOURNEY-004 | Pet's species → which services are shown. No area filtering; all Bogotá providers are visible. | Pet owner | CONFIRMED (species, no area); visibility of all providers ASSUMED (ASM-012) | P00 MVP-003, OOS-002, ASM-012 |
| P01-JOURNEY-005 | Appointment scheduled → involves one owner, one pet (ASSUMED), one provider and one service; same rules for clinic and home. | Pet owner ↔ Provider | CONFIRMED (no modality difference — OOS-005); management rules ASSUMED | P00 MVP-004, OOS-005, ASM-008 |

---

## 8. MVP Definition

All capabilities remain **provisional** (P00 §5). P01 IDs from v1.0 are kept where their meaning is unchanged; see §15 for the mapping.

### 8.1 MVP Core

Capabilities without which the core journey and the core value (P01-VALUE-001) cannot be demonstrated.

| ID | Capability | User Need Addressed | Rationale | Source |
|---|---|---|---|---|
| P01-MVP-001 | Consultation of providers and services by pet species (Bogotá, no area filtering) | P01-NEED-001, -003 | Directly delivers "find in one place"; central step of P01-JOURNEY-001. | P00 MVP-003 |
| P01-MVP-002 | Appointment scheduling (a pet owner books an appointment with a provider for a service) | P01-NEED-004 | Delivers "access"; outcome of the core journey. | P00 MVP-004 |
| P01-MVP-003 | Provider service catalog — providers publish and maintain their services, indicating in-clinic / home modality | P01-NEED-006, -007 | Without providers' services there is nothing to find or schedule. **Refinement:** consolidates P00 MVP-002 (catalog) and MVP-005 (service offering), whose overlap P00 left for P01 (VAL-006). | P00 MVP-002 + MVP-005 |

### 8.2 MVP Supporting

| ID | Capability | Purpose | Source |
|---|---|---|---|
| P01-MVP-005 | Pet registration (species, weight, age, height, breed) | Provides the species used to show applicable services (P01-MVP-001). Only species is used by a stated capability; the other fields are team-stated data (P00 MVP-001). | P00 MVP-001 |
| P01-MVP-006 | User accounts and authentication for each role (name, email, password; passwords stored hashed) | Associates pets, catalogs and appointments with their owners/providers; required by the team. | P00 MVP-006 |
| P01-MVP-007 | Appointment management — provider availability, confirmation, rescheduling/cancellation | Supports reliable scheduling. **ASSUMED** to be in scope (P00 ASM-008); separated from P01-MVP-002 so the team can confirm or prioritize it independently (P00 VAL-003, RISK-004). | P00 MVP-004, ASM-008 |

*P01-MVP-004 (v1.0 "Veterinary service catalog") is retired: merged into P01-MVP-003.*

### 8.3 Future Capabilities

| ID | Capability | Reason for Deferral | Source |
|---|---|---|---|
| — | None defined. | The team has not intentionally deferred any capability (P00 §5). Provider verification is excluded "for the moment" but has not been planned for a later version. | P00 §5, OOS-001 |

### 8.4 Undefined / Requires Decision

| ID | Capability or Decision | Why It Matters |
|---|---|---|
| P01-DECISION-001 | **Prioritization against the one-week constraint** (P00 Q-021, CON-003). **PROPOSAL for team review, not a decision:** if not everything fits, build in the order of the core journey's dependencies — (1) P01-MVP-006 accounts, (2) P01-MVP-003 provider catalog, (3) P01-MVP-005 pet registration, (4) P01-MVP-001 consultation, (5) P01-MVP-002 basic scheduling, (6) P01-MVP-007 appointment management. This order only reflects which capability each step needs; it does not remove anything from the MVP. | The team has one week and five people; P01-RISK-009. Defines what is demonstrable first. |
| P01-DECISION-002 | **Ratings/reviews** — keep excluded, or include in some form? (P00 Q-019, CON-002). Moved from the provisional Out of Scope (P00 OOS-004) because the team's own problem statement identifies the lack of ratings as a consequence. | Determines whether P01-NEED-005 and the "blind trust" consequence are addressed. |
| P01-DECISION-003 | **Scope of appointment management** (P00 Q-020, ASM-008): availability, confirmation, rescheduling/cancellation; who confirms. | Defines P01-MVP-007 and the end of both journeys; largest schedule risk. |
| P01-DECISION-004 | **Home-visit location** (P00 Q-018, CON-004): how does the provider know where to go when no owner address is collected? | Home visits cannot be completed without it. |
| P01-DECISION-005 | **Provider information shown to pet owners** (P00 Q-022): e.g., clinic location, contact details. | Owners need it to attend in-clinic appointments and choose a provider. |
| P01-DECISION-006 | **Service–species relationship** (P00 Q-008 residual, ASM-011): how a service indicates the species it applies to. | Defines P01-MVP-001 filtering and P01-MVP-003 catalog content. |
| P01-DECISION-007 | **Clinic home services** (P00 Q-009): do clinics also offer home visits; do independent vets always have a clinic? | Defines the offering model in P01-MVP-003. |
| P01-DECISION-008 | **"Products"** (P00 Q-002 residual): does "servicios y productos" mean the platform also offers products? | A "yes" would add a new product type to the MVP. |
| P01-DECISION-009 | **Order of pet registration** (P01-QUESTION-010): required before consulting, or only before scheduling? | Order of P01-JOURNEY-001. |

### 8.5 Out of Scope

| ID | Excluded Capability | Basis |
|---|---|---|
| P01-OOS-001 | Verification of provider credentials | CONFIRMED — P00 OOS-001 |
| P01-OOS-002 | Determining the user's area by any method | CONFIRMED — P00 OOS-002 (team DECISION) |
| P01-OOS-003 | Coverage of cities other than Bogotá | CONFIRMED — P00 OOS-003 |
| P01-OOS-004 | Payments, real-time tracking, notifications | **PROVISIONAL — ASSUMED** (P00 OOS-004, ASM-009). Ratings/reviews moved to P01-DECISION-002. |
| P01-OOS-005 | Different scheduling rules for in-clinic vs. home-visit appointments | CONFIRMED — P00 OOS-005 |

*(The template's §8 has no Out of Scope subsection; this table is added so that P00 exclusions remain visible at MVP level. It is summarized again in §14.)*

---

## 9. Product Principles

| ID | Principle | Rationale |
|---|---|---|
| P01-PRINCIPLE-001 | Prioritize the pet owner's path from "my pet needs a service" to "appointment scheduled", entirely within the platform. | The core problem is having to search across several channels (P00 §2). |
| P01-PRINCIPLE-002 | Show pet owners only what is relevant to their pet. | Team decision that services are shown according to the pet's species (ANS-Q008). |
| P01-PRINCIPLE-003 | Fit the MVP to the available time: build the core journey first, and treat supporting capabilities as candidates for prioritization. | One week, five people, no budget (P00 §8, RISK-008). |
| P01-PRINCIPLE-004 | Keep the MVP limited to capabilities traceable to P00; features suggested by the Rappi reference enter only by explicit team decision. | P00 RISK-002; SYSTEM_PROMPT §7, §8. |
| P01-PRINCIPLE-005 | Providers own their catalog content. | Team decision (ANS-Q006); no administrator role (ASM-010). |
| P01-PRINCIPLE-006 | Keep undecided business rules visible instead of filling them in implicitly. | Several rules remain open (§8.4); SYSTEM_PROMPT §9, §10. |

These are guidance for product decisions, not requirements.

---

## 10. Initial Success Criteria

| ID | Success Criterion | Related User/Value | Source |
|---|---|---|---|
| P01-SUCCESS-001 | A pet owner can register a pet with species, weight, age, height and breed. | P01-USER-001 / P01-NEED-002 | P00 SUCCESS-001 |
| P01-SUCCESS-002 | A clinic or independent veterinarian can publish services, indicating in-clinic or home modality, and keep its catalog up to date. | P01-USER-002, -003 / P01-VALUE-004 | P00 SUCCESS-002 |
| P01-SUCCESS-003 | A pet owner can consult providers and services in Bogotá and see the services that apply to their pet's species. | P01-USER-001 / P01-VALUE-002 | P00 SUCCESS-003 |
| P01-SUCCESS-004 | A pet owner can schedule an appointment with a provider for a service. | P01-USER-001 / P01-VALUE-003 | P00 SUCCESS-004 |
| P01-SUCCESS-005 | Users of each role can create an account and sign in. | All users / P01-NEED-009 | P00 SUCCESS-005 |
| P01-SUCCESS-006 | An appointment can be confirmed, rescheduled or cancelled as defined by P01-DECISION-003. | P01-USER-001, -002, -003 / P01-NEED-004, -008 | P00 SUCCESS-004 — ASSUMED (ASM-008) |
| P01-SUCCESS-007 | A pet owner can go from "my pet needs a service" to a scheduled appointment with a provider offering a service for the pet's species **without using any channel outside the platform** to find that provider. | P01-USER-001 / P01-VALUE-001 | Refined from P00 §2 (problem) and SUCCESS-001 to -004; observable in a demo; not a numeric metric (P00 VAL-008). |

P00 Q-014 (what the team accepts as evidence of success) is still unanswered (P01-QUESTION-013).

---

## 11. Product Assumptions

| ID | Assumption | Impact | Source |
|---|---|---|---|
| P01-ASSUMPTION-001 | *(v1.0: owners have difficulty finding services)* — **RESOLVED**: confirmed by the team (P00 §2). | — | P00 ASM-001 |
| P01-ASSUMPTION-002 | Providers want an additional channel to reach pet owners. | High — supply side. | P00 ASM-002 |
| P01-ASSUMPTION-003 | *(v1.0: location filtering)* — **RESOLVED — invalidated** by team decision. | — | P00 ASM-003 |
| P01-ASSUMPTION-004 | *(v1.0: data linked to owners/providers)* — **RESOLVED**: accounts (P01-MVP-006). | — | P00 ASM-004 |
| P01-ASSUMPTION-005 | *(v1.0: scheduling for both modalities)* — **RESOLVED**: confirmed, no difference. | — | P00 ASM-005 |
| P01-ASSUMPTION-006 | *(v1.0: Rappi = general concept)* — **RESOLVED**: "mainly conceptual". | — | P00 ASM-006 |
| P01-ASSUMPTION-007 | All three user types are required for the MVP to deliver its value. | Medium | P00 ASM-007 |
| P01-ASSUMPTION-008 | The pet owner is the primary user; providers are secondary in value framing but required. | Medium — prioritization. | P00 §2, §3, ASM-007 (carried from P01 v1.0) |
| P01-ASSUMPTION-009 | *(v1.0: pet registration serves "pet's needs")* — **RESOLVED**: the team said services are shown according to the pet's species (ANS-Q008). | — | P00 MVP-001, MVP-003 |
| P01-ASSUMPTION-010 | Appointment management includes provider availability, confirmation, and rescheduling/cancellation (replaces v1.0 "providers need to know about appointments"). | High — scope and timeline. | P00 ASM-008 |
| P01-ASSUMPTION-011 | Payments, real-time tracking and notifications are not part of the MVP. | Medium — MVP boundary. | P00 ASM-009 (ratings excluded from this assumption — P01-DECISION-002) |
| P01-ASSUMPTION-012 | No administrator role; each service indicates the species it applies to; all Bogotá providers are visible to every owner. | Medium | P00 ASM-010, ASM-011, ASM-012 |
| P01-ASSUMPTION-013 | The pet owner registers a pet before consulting services, so its species can be used to show applicable services. **New in v2.0.** | Medium — journey order. | P00 MVP-001, MVP-003 |
| P01-ASSUMPTION-014 | Providers create their own accounts (self-registration), since no administrator role exists. **New in v2.0.** | Medium — provider onboarding. | P00 MVP-006, ASM-010 |
| P01-ASSUMPTION-015 | An appointment is made for one specific registered pet. **New in v2.0.** | Low — journey consistency. | P00 MVP-001, MVP-004 |

None of the open assumptions has been confirmed by the team.

---

## 12. Open Product Questions

v1.0 question IDs are kept. Questions resolved by P00 v2.0 are listed in the second table.

### Open

| ID | Question | Impact | Priority |
|---|---|---|---|
| P01-QUESTION-002 | Are payments, real-time tracking and notifications explicitly excluded? Does "servicios y productos" mean products are also offered? (P00 Q-002 residual) | MVP boundary. | High — before P02 |
| P01-QUESTION-003 | Do home-service providers cover all of Bogotá? (P00 Q-003 residual) | Home-visit journey. | Medium |
| P01-QUESTION-005 | How do providers join — self-registration or created by someone? (P00 Q-005 follow-up; P01-ASSUMPTION-014) | Provider journey. | Medium |
| P01-QUESTION-006 | Is an administrator/operator role needed? (P00 Q-006 residual) | User roles. | Medium |
| P01-QUESTION-008 | How does a service indicate the species it applies to? (P00 Q-008 residual) | P01-MVP-001, -003. | Medium — during P02 |
| P01-QUESTION-009 | Do clinics also offer home services? Do independent vets always have a clinic? (P00 Q-009) | P01-MVP-003. | Medium |
| P01-QUESTION-010 | Is pet registration required before consulting, or only before scheduling? | Journey order. | Medium — during P02 |
| P01-QUESTION-011 | Should pet owners see a distinction between clinics and independent veterinarians? | Presentation of providers. | Low |
| P01-QUESTION-012 | Which user type is prioritized, and how will providers and pet owners be present for the MVP demo? (P00 Q-013) | Prioritization, adoption. | Medium |
| P01-QUESTION-013 | What evidence would the team accept as MVP success? Should P01-SUCCESS-007 be adopted? (P00 Q-014) | Evaluation (P10). | Medium |
| P01-QUESTION-015 | Privacy or data-protection requirements beyond password hashing? (P00 Q-015 residual) | Trust, data. | Medium |
| P01-QUESTION-017 | How does the provider know where a home visit takes place? (P00 Q-018) | Home-visit journey. | High — before P02 |
| P01-QUESTION-018 | Should ratings/reviews remain excluded, given that the problem statement cites their absence? (P00 Q-019) | Problem, value, scope. | High — before P02 |
| P01-QUESTION-019 | Confirm appointment management scope (availability, confirmation, rescheduling/cancellation) and who confirms. (P00 Q-020) | P01-MVP-007. | High — before P02 |
| P01-QUESTION-020 | Does the one week cover all stages or only implementation? Dates? Accept, modify or reject the priority PROPOSAL in P01-DECISION-001. (P00 Q-021) | Scope, planning. | High — before P02 |
| P01-QUESTION-021 | What provider information is shown to pet owners (e.g., location, contact)? (P00 Q-022) | Journeys. | Medium — during P02 |
| P01-QUESTION-022 | When a pet owner has more than one pet, is the species filter applied per selected pet? **New.** | P01-MVP-001. | Low — during P02 |
| P01-QUESTION-023 | Accept the consolidation of catalog and service offering into one capability (P01-MVP-003)? **New.** | MVP structure. | Low |

### Resolved since P01 v1.0

| ID | v1.0 Question | Resolution (P00 v2.0) |
|---|---|---|
| P01-QUESTION-001 | Current problem and consequences | Stated by the team (ANS-Q001). |
| P01-QUESTION-004 | Scheduling rules | Partially — no clinic/home difference; rest carried as P01-QUESTION-019. |
| P01-QUESTION-007 | Provider verification | None in the MVP (OOS-001). |
| P01-QUESTION-014 | Confirm provider service offering | Confirmed (ANS-Q017). |
| P01-QUESTION-016 | Initial market | Bogotá (ANS-Q010). |

**Not carried as product questions:** P00 Q-011/Q-012/Q-016 are resolved; their residual timeline aspect is P01-QUESTION-020.

---

## 13. Product Risks

| ID | Risk | Impact | Mitigation Consideration |
|---|---|---|---|
| P01-RISK-001 | The problem is described by the team; no evidence from pet owners or providers has been provided. **Reduced** from v1.0 (problem no longer assumed). | Low | Optional: collect a few owner/provider opinions before P10 Evaluation. |
| P01-RISK-002 | Scope creep from the Rappi reference. **Reduced** (conceptual similarity). | Low | Confirm P01-QUESTION-002. (P00 RISK-002) |
| P01-RISK-003 | Two-sided dependency: without providers registered, there is nothing to find; the demo needs both sides. | Medium | Answer P01-QUESTION-012. (P00 RISK-003) |
| P01-RISK-004 | Core workflows depend on undecided rules — mainly appointment management and the service–species link. **Reduced** from v1.0. | Medium | Resolve P01-DECISION-003 and -006 at the start of P02. (P00 RISK-001, RISK-004) |
| P01-RISK-005 | Ambiguous offering model (clinics vs. independent vets; modalities). | Medium | Answer P01-QUESTION-009. |
| P01-RISK-006 | Unverified providers may reduce trust. **Accepted by the team** for an academic MVP. | Low | Keep visible. (P00 RISK-007) |
| P01-RISK-007 | Home visits cannot be fulfilled without a visit location. Replaces v1.0 "home-visit personal data". | Medium | Resolve P01-DECISION-004. (P00 RISK-011) |
| P01-RISK-008 | Without veterinary domain input, the service–species relationship may be defined incorrectly. | Medium | Identify a domain source for P01-DECISION-006. (P00 RISK-009) |
| P01-RISK-009 | **Time feasibility:** the MVP (six capabilities, three roles, appointment management) may not fit in one week. **New in P01 v2.0.** | High | Answer P01-QUESTION-020; use the PROPOSAL in P01-DECISION-001 as a starting point. (P00 RISK-008, CON-003) |
| P01-RISK-010 | **Value gap:** the MVP does not address the "blind trust" consequence of the stated problem. **New in P01 v2.0.** | Medium | Resolve P01-DECISION-002. (P00 RISK-010, CON-002) |

**P00 risks not carried as product risks:** RISK-005 (closed), RISK-006 (security — P02/P05; its product aspect is P01-QUESTION-015).

---

## 14. Scope Summary

### Included in MVP

- **Core:** P01-MVP-001 Consultation of providers and services by pet species (Bogotá) · P01-MVP-002 Appointment scheduling · P01-MVP-003 Provider service catalog (in-clinic / home).
- **Supporting:** P01-MVP-005 Pet registration · P01-MVP-006 User accounts and authentication · P01-MVP-007 Appointment management (ASSUMED).
- **Platform:** web (required).

### Deferred

None defined by the team.

### Undefined

P01-DECISION-001 to -009 (§8.4), notably: prioritization against one week, ratings/reviews, appointment-management scope, home-visit location, provider information shown, service–species link, and the meaning of "products".

### Out of Scope

P01-OOS-001 Provider verification · P01-OOS-002 User area determination · P01-OOS-003 Cities other than Bogotá · P01-OOS-005 Different clinic/home scheduling rules · P01-OOS-004 Payments, real-time tracking, notifications (**provisional**, ASSUMED).

---

## 15. Traceability Summary

| P01 Element | P00 v2.0 Source | Relationship |
|---|---|---|
| P01-PROB-001 | §2 (ANS-Q001) | Direct |
| P01-PROB-002 | ASM-002 | Direct; ASSUMED |
| P01-USER-001 to -003 | USER-001 to -003 | Direct; primary designation ASSUMED |
| P01-NEED-001 to -003, -006, -007, -009 | §2, §6, MVP-001, -002, -003, -005, -006 | Direct |
| P01-NEED-004 | MVP-004, ASM-008 | Direct / ASSUMED (reschedule/cancel) |
| P01-NEED-005 | §2 Problem Impact, CON-002 | Direct (need); not covered by MVP |
| P01-NEED-008 | §6, ASM-008 | ASSUMED |
| P01-JTBD-001 to -006 | §2, USER-001 to -003, MVP-002 to -005, ASM-002, ASM-008 | Refined |
| P01-VALUE-001 to -004 | §3, §6 | Direct / refined |
| P01-JOURNEY-001 to -005 | §3, MVP-001 to -006, OOS-002, OOS-005, ASM-008, -011, -012 | Refined; order and management steps partly ASSUMED |
| P01-MVP-001 | MVP-003 | Direct |
| P01-MVP-002 | MVP-004 (booking) | Direct |
| P01-MVP-003 | MVP-002 + MVP-005 | Refined (consolidation) |
| P01-MVP-005 | MVP-001 | Direct |
| P01-MVP-006 | MVP-006 | Direct |
| P01-MVP-007 | MVP-004 (management), ASM-008 | Refined (separation); ASSUMED |
| P01-DECISION-001 to -009 | Q-021, Q-019, Q-020, Q-018, Q-022, Q-008 res., Q-009, Q-002 res., P01-QUESTION-010 | Carried; DECISION-001 contains a labeled PROPOSAL |
| P01-OOS-001 to -005 | OOS-001 to -005 | Direct; ratings moved out of OOS-004 |
| P01-PRINCIPLE-001 to -006 | §2, ANS-Q006, ANS-Q008, §8, RISK-002, ASM-010 | Derived |
| P01-SUCCESS-001 to -005 | SUCCESS-001 to -005 | Direct |
| P01-SUCCESS-006 | SUCCESS-004, ASM-008 | Refined; ASSUMED |
| P01-SUCCESS-007 | §2, SUCCESS-001 to -004 | Refined |
| P01-ASSUMPTION-002, -007, -010 to -012 | ASM-002, -007 to -012 | Carried |
| P01-ASSUMPTION-008 | §2, §3, ASM-007 | Carried from P01 v1.0 |
| P01-ASSUMPTION-013 to -015 | MVP-001, -004, -006, ASM-010 | New, labeled |
| P01-QUESTION-* | Q-002, -003, -005, -006, -008, -009, -013 to -015, -018 to -022 | Carried; -022, -023 new |
| P01-RISK-001 to -010 | RISK-001 to -004, -007, -009 to -011, CON-002, CON-003 | Carried / refined |

### MVP identifier mapping

| P01 v2.0 | P01 v1.0 | P00 v2.0 |
|---|---|---|
| P01-MVP-001 Consultation | P01-MVP-001 | MVP-003 |
| P01-MVP-002 Scheduling (booking) | P01-MVP-002 | MVP-004 |
| P01-MVP-003 Provider service catalog | P01-MVP-003 + P01-MVP-004 | MVP-005 + MVP-002 |
| *(retired)* | P01-MVP-004 | — |
| P01-MVP-005 Pet registration | P01-MVP-005 | MVP-001 |
| P01-MVP-006 Accounts | — (new) | MVP-006 |
| P01-MVP-007 Appointment management | — (split from scheduling) | MVP-004, ASM-008 |

---

## 16. Product Vision Status

**READY_WITH_ASSUMPTIONS**

Justification: the problem is now team-stated, the users are identified, the value proposition and journeys are coherent, and the MVP is bounded on both sides and traceable to P00 v2.0. Requirements Engineering can begin while carrying the documented assumptions. However:

- Requirements for **P01-MVP-007** (appointment management) cannot be finalized until P01-DECISION-003 is made.
- Home-visit requirements cannot be finalized until P01-DECISION-004 is made.
- The team must decide P01-DECISION-001 (fit to one week) before P03 — Planning; it may change what the MVP includes.

The product is **not** fully specified.

### Change Log (v1.0 → v2.0)

| Change | Reason |
|---|---|
| Problem changed from ASSUMED to CONFIRMED; context and consequences filled. | P00 v2.0 §2 |
| Consultation: no area filtering, Bogotá only, filtered by pet species. | P00 MVP-003, OOS-002 |
| Catalog and service offering consolidated (P01-MVP-003); P01-MVP-004 retired. | P00 VAL-006 |
| Accounts added (P01-MVP-006); appointment management separated (P01-MVP-007). | P00 MVP-006, ASM-008 |
| Out of Scope section added; ratings moved to Undefined. | P00 OOS-001 to -005, CON-002 |
| New need P01-NEED-005 (trust) recorded as not covered. | P00 CON-002 |
| Prioritization PROPOSAL added (not a decision). | P00 VAL-001, CON-003 |
| P01-SUCCESS-007 (journey without external channels) added; v1.0 SUCCESS-006 (perceived ease) replaced by the management criterion. | P00 VAL-008, ASM-008 |
| Assumptions -001, -003 to -006, -009 resolved; -013 to -015 added. | P00 v2.0 |
| Questions -001, -004, -007, -014, -016 resolved; -017 to -023 added. | P00 v2.0 |
| Risks updated; P01-RISK-009 (time) and -010 (value gap) added. | P00 RISK-008, RISK-010 |
