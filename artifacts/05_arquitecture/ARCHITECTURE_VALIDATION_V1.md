# Architecture Validation Report

## 1. Validation Metadata

| Field | Value |
|---|---|
| Stage | P05 — Architecture Validation |
| Validator | `P05_validation.md`, version 2.0 |
| Architecture reviewed | `artifacts/05_architecture/ARCHITECTURE.md`, version 1.0 (status READY_WITH_ASSUMPTIONS) |
| Validation date | 2026-10-10 |
| **Overall validation status** | **PASS_WITH_CONDITIONS** |

**Required inputs reviewed:**

- `REQUIREMENTS.md` v2.0
- `PRIORITIZATION.md` v1.0
- `product_backlog.json` v3.0 (P03)
- `UX_SPEC.md` v1.0
- `UX_SPEC_VALIDATION.md`

All were read in full where relevant.

**Short justification.** The architecture is coherent, proportionate and traceable. It respects the P03 scope and the UX contract, and no critical defect remains. Two kinds of item must still be resolved before the affected implementation can start:

- **Before any coding:**
  - the technology stack and hosting (ADR-003, ADR-014);
  - the shared contracts CTR-001 to CTR-008.
- **Before specific stories:**
  - P02-Q-004 and P02-Q-009 (US-019, US-020, US-010, US-008);
  - the pet units (US-001 data).

These are open decisions, most of them inherited from the inputs. They are not contradictions in the design.

**How this validation was done:**

1. **Scripted checks.** 30 checks were run against the files on disk, and all passed. They cover:
   - the 18 required sections and the status;
   - definition and contiguity of every P05 ID (COMP, IF, DATA, ADR, P05-RISK, CR, CTR and P05-*);
   - ADR inventory against the headings, and only ADR-001 being ACCEPTED;
   - existence of every upstream ID cited, against P00 to P04 and the backlog;
   - coverage of all 14 screens, all 14 flows and all 54 committed acceptance criteria;
   - 33 backlog rows and 42 requirement rows, with scope equal to the backlog;
   - no unsupported technology names;
   - quantities appearing only as labeled proposals;
   - the new interfaces appearing in the diagram.
2. **Diagram rendering.** All 4 Mermaid diagrams were rendered with the locally installed Mermaid 11.16.1 (`mmdc`), with no syntax errors. The component diagram was inspected visually.
3. **Independent review.** A separate AI reviewer agent, which did not draft the architecture, reviewed it against all the sources in two rounds before issue:
   - **Round 1:** 2 HIGH, 3 MEDIUM and 6 LOW findings.
   - **Round 2:** 9 of the 11 resolved, 2 partly, and 3 new LOW issues.
   - All were corrected in version 1.0 before this validation (ARCHITECTURE §18).
4. **Category review.** This report evaluates categories A to L against the sources.

**Independence notice.** The architecture and this report were produced by the same AI assistant. The scripts and the reviewer agent reduce that limitation but do not remove it, and no human has reviewed the architecture yet.

---

## 2. Input Readiness

| Artifact | Available and readable | Role in validation | Limitations or conflicts |
|---|---|---|---|
| `REQUIREMENTS.md` v2.0 (`REQUIREMENTS_v2.md`, identical by diff) | Yes | Requirements, business rules, edge cases, NFRs | P02-Q-001, -004, -009, -017 open. No performance, availability or privacy targets ("No basis for…", §2.1). |
| `PRIORITIZATION.md` v1.0 (`PRIORITIZATION_V1.md`, identical) | Yes | Delivery scope, steps, dependencies | PRIOR-001 to PRIOR-004 open. Assignments only PROPOSED. |
| `product_backlog.json` v3.0 (P03; `product_backlog_priori_v1.json`, identical) | Yes | **Authoritative backlog** | None. The P02 backlog was not used. |
| `UX_SPEC.md` v1.0 (`UX_SPEC_V1.md`, identical) | Yes | UX contract | P04-RD-001 to -006 open. The visual direction is a PROPOSAL. |
| `UX_SPEC_VALIDATION.md` | Yes | UX findings P04-VAL-001 to -008; P05 conditions (§7.8) | Condition 3 (pet units) is unmet upstream. |
| `ARCHITECTURE.md` v1.0 | Yes | Object of validation | — |

**Team input applied:** "All of the assumptions in UX_SPEC_V1.md are 100% confirmed and approved." The architecture applies it narrowly (P05-ASM-001):

- **Covered:** P04-ASM-001 to -017.
- **Not covered:** proposals (P04-PROP), decisions (P04-RD), blockers (P04-BLK), P02 questions and PRIOR decisions.

This validation agrees with that reading.

**Input conflicts affecting the architecture:** none found. The open decisions are gaps, not contradictions.

---

## 3. Executive Assessment

**Overall quality.** Good, and proportionate to a 14-story MVP:

- a modular monolith with six business modules, a shared kernel, one relational database and a single-page client;
- clear data ownership: one owning module per entity;
- 24 interfaces with providers, consumers, information, authorization and failures;
- 21 invariants;
- 15 ADRs with honest statuses.

**Scope and UX alignment.**

- **Scope:** only the 14 committed stories are designed. Conditional stories are extension-only. Ordering and stock are excluded by an invariant (CR-013).
- **UX:**
  - every screen maps to interfaces and data;
  - every UX_SPEC §12 need is met;
  - the error contract maps one-to-one to the UX message catalog;
  - every UX validation finding is handled.

**Main strengths:**

1. **Booking integrity is designed concretely.** The appointment stores the provider's capacity. A conditional uniqueness rule enforces BR-013 without constraining clinics (BR-012). One provider lock serializes bookings and hours saves (BR-034).
2. **The two undecided business rules are isolated as policies POL-1 and POL-2.** Every option fits without restructuring, which meets UX_SPEC_VALIDATION condition 2.
3. **The minimum shared contracts and the step-0 prerequisites for parallel work are explicit.**

**Most important unresolved concerns:**

- No technology stack or host is decided (AV-001).
- Two business rules are undecided (AV-002).
- All structural ADRs await team approval (AV-003).
- The contracts are named but not yet written (AV-004).

**Can it guide the next stage?** Yes, under the conditions in §8.

---

## 4. Validation Scorecard

| Category | Status | Evidence | Findings |
|---|---|---|---|
| A. Scope and requirements alignment | PASS | **Scope:** §2.1 covers the committed stories and their FRs and NFRs. **Requirements:** §9.1 traces NFR-001 and NFR-002 to controls. **IDs and scope:** IDs are preserved (script). No unsupported requirement. Open questions are documented (§16). | AV-002 |
| B. Planning and backlog alignment | PASS | **Backlog:** the P03 backlog is used. Scope per item equals the backlog for all 33 items (script). **Status handling:** blocked items are not designed (CR-013); conditional items are extension-only. **Priorities and gates:** no priority is changed; the gates beyond P03 are labeled PROPOSAL. | AV-011 |
| C. UX and design-system alignment | PASS | **Screens and needs:** §10.1 maps all 14 screens. The UX_SPEC §12 needs are met (provider phone in IF-012, server time in IF-010, profile-completed flag in IF-004). **Design system:** single design-system library (COMP-002, ADR-013). **States and findings:** loading, empty, validation, success and error are supported (§10.3). UX findings P04-VAL-001 to -007 are handled (§10.4). | AV-006 |
| D. Architectural style and simplicity | PASS | Style and rationale are tied to DRV-01 to DRV-13. Four alternatives are compared (§5.3), with no microservices or extra infrastructure. The stack is not invented: ADR-003 lists options and criteria only. | AV-001 |
| E. System context and components | PASS | Boundary, actors and trust boundaries TB-1 to TB-3 are defined, with no third-party services. 11 components have responsibilities and exclusions. The diagram matches the dependency rules after the revision: rendered and inspected. | AV-008 |
| F. Interfaces and dependencies | PASS | 24 interfaces, with common outcomes stated once (§7.1). There are three cross-module commands, a per-operation cycle rule and a coordination call (§7.3). The closed error contract is in §7.4, and the contracts to agree are CTR-001 to CTR-008. No endpoints or protocols are invented beyond JSON over HTTPS, which is PROPOSED. | AV-004 |
| G. Conceptual data architecture | PASS | 7 entities with owner, relationships and integrity rules. The ER diagram agrees with §8.1 (provider link and capacity added). Data flows are in §8.3 and the booking sequence in §8.4. Missing decisions are listed: pet units, the appointment snapshot (P05-UNK-003). No unsupported attributes. | AV-006 |
| H. Security and quality attributes | PASS | Required controls are traced: hashing (ADR-006), sessions, authorization in two layers, CSRF (CR-021), HTTPS, logging (CR-020). Recommended controls are labeled. Performance, availability, backup and privacy are UNKNOWN, and no compliance is claimed. | AV-005, AV-007 |
| I. Decisions and traceability | PASS | ADR inventory equals the sections. Only ADR-001 is ACCEPTED, supported by A-P02Q-014. The traceability matrix is generated from the sources; gaps are visible ("SUPPORTED_PENDING_DECISION", "EXTENSION_ONLY"). | AV-003 |
| J. Risks, constraints and open decisions | PASS | P05-RISK-001 to -011 with likelihood marked UNKNOWN unless supported. CR-001 to CR-021. ASSUMPTION, UNKNOWN, PROPOSAL and REQUIRES_DECISION are separated (§16). | AV-005, AV-007 |
| K. Implementation readiness and parallel work | PARTIAL | Work areas, step-0 prerequisites and freedoms are clear (§15). However, implementation **cannot start** until ADR-003 and ADR-014 are decided and CTR-001 to CTR-008 are written. The document says so explicitly, so this is a readiness condition, not a concealed gap. | AV-001, AV-004 |
| L. Document quality and internal consistency | PASS | 18 sections. IDs are unique and contiguous (script). The Mermaid diagrams render. The status matches the findings. Facts, assumptions and proposals are labeled. | AV-008, AV-010 |

---

## 5. Detailed Findings

### AV-001 — HIGH — K, D — Technology stack and hosting are undecided

| Aspect | Detail |
|---|---|
| Issue | ADR-003 (stack) and ADR-014 (hosting) are REQUIRES_DECISION. |
| Evidence | No input approves a stack: REQUIREMENTS has no technology constraint, and P00 ANS-Q012 (cited as context) says none is required. ARCHITECTURE §11 ADR-003 lists two options with selection criteria and "No option is selected by this document". |
| Origin | An **input gap**, handled responsibly. It is not an architecture defect. |
| Affected | All components; P05-RISK-001, P05-RISK-008; PRIORITIZATION step 0 and DEP-017 |
| Impact | No implementation or deployment can begin. In a three-day sprint (ASSUM-001), a late decision directly reduces delivery (P03-RISK-001). |
| Recommendation | The team chooses the stack, using criterion 1 (existing skills), and the host before `SPRINT-001`. Then it builds and deploys the skeleton (ARCHITECTURE §15.1). |
| Blocks | All implementation work, not the next planning activities. |

### AV-002 — MEDIUM — A, J — Two business rules undecided; four committed stories depend on them

| Aspect | Detail |
|---|---|
| Issue | P02-Q-004 (POL-1) and P02-Q-009 (POL-2) are open. |
| Evidence | REQUIREMENTS §10 lists both as OPEN. ARCHITECTURE ADR-012 and CR-014 implement the policies only after the decision. §14 marks US-019, US-020, US-010 and US-008 as "SUPPORTED_PENDING_DECISION". |
| Origin | Upstream. The architecture meets UX_SPEC_VALIDATION §7.8 condition 2. |
| Impact | Those stories cannot be finished. US-019 is on the critical path (P03-RISK-002). |
| Recommendation | Decide in sprint step 0 (DEP-011). If POL-1 option A is chosen, also decide whether species becomes mandatory or US-006 moves up (UX_SPEC P04-RD-001 note). |
| Blocks | US-019, US-020, US-010; US-008 under option A. |

### AV-003 — MEDIUM — I, D — The structural decisions are all proposals

| Aspect | Detail |
|---|---|
| Issue | 13 ADRs are PROPOSED, including the style (ADR-002), the SPA and API (ADR-004), the database (ADR-005), hashing (ADR-006) and sessions (ADR-007). |
| Evidence | ARCHITECTURE §11.1 inventory. They are correctly labeled, which complies with the validator's §3.5. |
| Impact | If the team rejects ADR-002, ADR-004 or ADR-005, the component and interface model changes. |
| Recommendation | The team reviews and approves the ADRs in sprint step 0, together with AV-001. |
| Blocks | Only if rejected. |

### AV-004 — MEDIUM — F, K — The shared contracts are identified but not written

| Aspect | Detail |
|---|---|
| Issue | CTR-001 to CTR-008 define what must be agreed, but not the fields and outcomes in detail. |
| Evidence | ARCHITECTURE §15.3: "These must be written down… before dependent work proceeds in parallel". §17.1 defers endpoint paths and schemas, which is in line with the validator's §5.F ("Do not require complete API schemas…"). |
| Impact | Without them, the client and backend pairs integrate late (P05-RISK-003). |
| Recommendation | Write CTR-001 to CTR-003 first (errors, sessions, formats). Write the others before their stories start. |
| Blocks | Parallel client and backend work on each pair. |

### AV-005 — LOW — H, J — Session lifetime is proposed; no sign-out

| Aspect | Detail |
|---|---|
| Evidence | ADR-007 proposes 60 minutes idle and 12 hours absolute expiry, labeled as "design parameters proposed by P05, not quality targets from the inputs". It is pending P05-RD-003. Sign-out is excluded by AVISO-R1. |
| Impact | On shared devices a session stays open until expiry (P05-RISK-006). |
| Recommendation | The team approves or adjusts the values and acknowledges P04-RD-006. |
| Blocks | Finalizing US-003. |

### AV-006 — LOW — G, C — Pet units unresolved (UX validation condition 3 unmet)

| Aspect | Detail |
|---|---|
| Evidence | DATA-003: "Units of age, weight and height: REQUIRES_DECISION (P04-RD-003)". UX_SPEC_VALIDATION §7.8 condition 3 asks for it before P05 fixes the pet data definition. |
| Origin | Upstream. The architecture carries it, as P05-RD-007, instead of assuming a value. |
| Impact | Possible rework of the US-001 pet fields (P05-RISK-009). |
| Recommendation | The team confirms the UX proposal or gives other units before P06 fixes the schema. |
| Blocks | The US-001 data definition. |

### AV-007 — LOW — H — Quality and privacy gaps without targets

| Aspect | Detail |
|---|---|
| Evidence | §9.3: performance, availability, backup and privacy are all UNKNOWN. P05-RD-006 covers backups and real personal data; P05-RD-009 covers a minimum password length (no policy under P04-ASM-005). P05-RISK-007 notes that the UX's duplicate-email message reveals which emails are registered. |
| Origin | The inputs give "No basis" (REQUIREMENTS §2.1). |
| Impact | Possible data loss or weak passwords in the demonstration. |
| Recommendation | Use test data for the demonstration, or decide P05-RD-006. Decide P05-RD-009 together with the UX copy. |
| Blocks | No. |

### AV-008 — LOW — E, L — The component diagram is dense

| Aspect | Detail |
|---|---|
| Evidence | The component diagram has 33 edges (counted from its source). Its arrows point from caller to provider, while the §7 tables read "provider → consumer"; the document states this explicitly. |
| Impact | Slower reading. There is no inconsistency. |
| Recommendation | Optional: split it into an external view (client to API) and an internal module view. |
| Blocks | No. |

### AV-009 — LOW — G, F — The integrity mechanism depends on database capability

| Aspect | Detail |
|---|---|
| Evidence | ADR-010 uses a uniqueness rule limited to scheduled, independent-capacity appointments, "If the chosen database cannot express a conditional uniqueness rule, P06 uses an equivalent check under the provider lock". |
| Impact | The guarantee for BR-013 depends on P06 implementing the fallback correctly if the chosen database lacks this feature. |
| Recommendation | Once ADR-003 and ADR-005 are decided, confirm the mechanism and include the concurrency test listed in §9.4. |
| Blocks | No. |

### AV-010 — INFO — L — Process limitation

The same AI generated and validated the architecture. The mitigations were scripted checks, local Mermaid rendering and two independent reviewer rounds whose findings were corrected before issue. Team review of the PROPOSED ADRs is still recommended.

### AV-011 — LOW — B — Conditional work has only extension notes

| Aspect | Detail |
|---|---|
| Evidence | §2.2 and §14.1: 17 conditional stories are "EXTENSION_ONLY", each naming its owning module. The UX first step is labeled PROPOSAL (not a P03 gate). |
| Impact | If capacity admits Group A, a short UX and architecture increment is needed before coding. |
| Recommendation | The team decides P05-RD-008 (PRIOR-001, PRIOR-002, P04-RD-005). |
| Blocks | Conditional stories only. |

**No material issue was identified in the other aspects of the categories.** This is based on the evidence above.

---

## 6. Traceability Review

| Connection | Assessment | Gaps |
|---|---|---|
| Requirements → architectural responses | Correct. Each FR of a committed story maps to components and interfaces (§14.2, generated from REQUIREMENTS). NFR-001 to NFR-004 map to ADRs and controls. | FR-009, FR-011 and FR-022 are pending decisions (AV-002). 16 FRs are extension-only and 2 blocked (FR-032, FR-038), consistent with P03. |
| Backlog items → components | Correct for all 33 items, with scope equal to the backlog (script). 10 committed items are supported and 4 pending decisions. | US-008, US-010, US-019, US-020 (AV-002) |
| UX screens and flows → client capabilities and data | Correct. 14 screens and 14 flows are referenced. The data needed by each screen comes from a named interface. The reviewer's earlier gaps (owner name, pet names, provider offerings, provider phone) were closed through IF-012, IF-017, IF-021 and IF-022. | None |
| Decisions → evidence and constraints | Correct. Each ADR cites its context. ACCEPTED is limited to ADR-001, which A-P02Q-014 and NFR-003/-004 support. | None |

---

## 7. Scope and Consistency Review

| Check | Result |
|---|---|
| **Unjustified scope expansion** | None. No ordering, stock, notifications, payments, administration or location features. CR-013 prevents product ordering actions. |
| **Deferred features driving the architecture** | None material. CR-018 (logical removal) and the extension notes add no component, data or interface now. |
| **Conflicts between requirements, planning, UX and architecture** | None found. The provider-capacity copy, the profile-completed flag and the server time are additions that support confirmed UX behavior. They add no new product rule. |
| **Diagrams versus text** | Consistent after the revision. Context, component, data and sequence diagrams agree with §4, §6/§7.3, §8.1 and ADR-010. All four render. |
| **Unsupported technology or integration assumptions** | None presented as decisions. Candidate technologies appear only as options in ADR-003, ADR-005 (database examples) and ADR-006 (Argon2id or bcrypt, PROPOSED), and as the icon-set proposal inherited from UX. |

---

## 8. Readiness Conditions

| ID | Required action | Reason | Related findings | Affected work |
|---|---|---|---|---|
| COND-001 | Decide the technology stack (ADR-003) and the hosting (ADR-014). Then build and deploy the skeleton (§15.1). | Nothing can be implemented or demonstrated without them | AV-001 | All implementation; the demonstration (DEP-017) |
| COND-002 | Review and approve, or amend, the PROPOSED ADRs, at least ADR-002, -004, -005, -006, -007, -010 and -011. | They define the structure and the security behavior | AV-003, AV-005 | All implementation |
| COND-003 | Write the shared contracts: CTR-001 to CTR-003 first, the others before their stories. | They are the basis for parallel client and backend work | AV-004 | Every client–backend pair |
| COND-004 | Decide P02-Q-004 (POL-1) and P02-Q-009 (POL-2, including the address-removal sub-rule). | The policies must not be guessed (CR-014) | AV-002 | US-019, US-020, US-010; US-008 under option A |
| COND-005 | Confirm the pet units (P04-RD-003). | Pet data definition | AV-006 | The US-001 data definition |

**Owners and deadlines:** none are given. The inputs name roles, but no confirmed owners (PRIOR-003). PRIORITIZATION places COND-004 in sprint step 0.

---

## 9. Strengths and Nonblocking Improvements

### Strengths

- **Concrete integrity design:** the provider capacity on the appointment, a conditional uniqueness rule and one provider lock. It covers EDGE-007, BR-012, BR-013 and BR-034 without over-engineering.
- **Policy isolation:** POL-1 and POL-2 keep two open product decisions from reshaping the system.
- **A closed error contract mapped to the UX message catalog:** consistent copy and no information leakage (CR-005, CR-006).
- **Rules that support parallel work:** explicit dependency rules, with only three cross-module commands and a per-operation cycle rule.
- **Honest labeling:** no invented targets, compliance claims, owners or estimates.

### Optional Improvements

- Split the component diagram into an external view and a module view (AV-008).
- Once the stack is chosen, add a one-page summary of the skeleton layout to CTR-008.
- Use test data in the demonstration until P05-RD-006 is decided (AV-007).

---

## 10. Final Recommendation

**Final status: PASS_WITH_CONDITIONS.**

**Is it suitable for the next stage?** Yes. It is coherent, aligned with P02, P03 and the UX, and traceable. It can guide P06 planning and the sprint's step 0.

**What must be decided first:**

1. COND-001: the stack and hosting.
2. COND-002: approval of the PROPOSED ADRs.
3. COND-003: the shared contracts.
4. COND-004: P02-Q-004 and P02-Q-009, before US-019, US-020, US-010 and US-008.
5. COND-005: the pet units, before the US-001 data definition.

**Should the architecture document be revised before proceeding?** No revision is required. After COND-001, COND-002 and COND-004 are decided, record the outcomes in ARCHITECTURE.md as a new version: change the ADR statuses to ACCEPTED and fill in the policy bodies.

---

## Validator Integrity Statement

- `ARCHITECTURE.md` and the input artifacts were not modified by this validation.
- The pre-issue corrections, made after the independent review, were made before this validation and are disclosed in ARCHITECTURE §18.
- No identifier, requirement, approval, owner or target was invented. No line numbers are cited.
- The P03 backlog, not the P02 backlog, was the planning reference.
