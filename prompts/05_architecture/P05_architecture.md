# P05 — Software Architecture

**Version:** 1.0
**Stage:** P05 — Architecture
**Type:** Generation Prompt
**Input Artifacts:**

* `artifacts/00_context/PROJECT_CONTEXT.md`
* `artifacts/00_context/CONTEXT_VALIDATION.md`
* `artifacts/01_discovery/PRODUCT_VISION.md`
* `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
* `artifacts/02_requirements/REQUIREMENTS.md`
* `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`
* `artifacts/03_planning/PRIORITIZATION.md`
* `artifacts/04_ux/UX_DESIGN.md`
* `artifacts/04_ux/UX_VALIDATION.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/05_architecture/ARCHITECTURE.md`
**Validator:** P05 Architecture Validator
**Previous Stage:** P04 — UX/UI
**Next Stage:** P06 — Implementation

---

# 1. PURPOSE

Transform the validated product, requirements, delivery priorities, and UX artifacts into a coherent, minimal, traceable software architecture for the MVP.

The architecture must explain:

* The system boundary and its external actors or systems.
* The principal architectural style and why it fits the documented needs.
* The logical components and their responsibilities and relationships.
* The important runtime interactions and interfaces.
* The conceptual data responsibilities and persistence needs.
* How relevant quality attributes and security concerns shape the design.
* Which technology and infrastructure decisions are approved, proposed, assumed, or unknown.
* How architecture elements trace to approved requirements and constraints.

This stage defines the design contract for P06 and an architecture reference for P08. It does not implement the system or replace product requirements.

---

# 2. INPUTS

## 2.1 Project Context and Validation

Read `PROJECT_CONTEXT.md` and `CONTEXT_VALIDATION.md` to understand the original problem, users, scope, constraints, known facts, assumptions, risks, and unresolved questions. Preserve important uncertainties and validation findings.

## 2.2 Product Vision and Validation

Read `PRODUCT_VISION.md` and `PRODUCT_VISION_VALIDATION.md` to understand the validated value proposition, primary user journeys, MVP boundaries, and product-level assumptions.

## 2.3 Requirements and Prioritization

Read `REQUIREMENTS.md`, its validation report, and `PRIORITIZATION.md` when present. These are the primary sources for functional behavior, quality requirements, acceptance criteria, MVP priority, and delivery constraints.

Do not invent requirements or treat a low-priority/future capability as an MVP driver.

## 2.4 UX Artifacts

Read `UX_DESIGN.md` and `UX_VALIDATION.md` when present. Use them to understand user flows, roles, information needs, accessibility constraints, and interaction boundaries. Do not redesign the UX in this stage.

## 2.5 Global System Prompt

Read `prompts/system/SYSTEM_PROMPT.md` and follow its source-of-truth, traceability, security, simplicity, human-approval, and change-management rules.

## 2.6 Repository Source of Truth

The current repository artifacts are the source of truth, not undocumented conversation history or assumed future outputs. The P02–P04 paths above are expected references; if their prompts define different output paths, use the paths actually declared there and record the discrepancy. Do not create or infer missing upstream artifacts.

---

# 3. INPUT READINESS

Before designing, record which inputs exist, their versions/statuses, and any upstream validation findings that affect architecture.

If an artifact is missing, empty, or invalid:

1. Do not fabricate its contents.
2. Identify the missing decision or requirement and why architecture depends on it.
3. Continue only with the portions supported by available evidence.
4. Mark affected decisions as `UNKNOWN`, `PROPOSAL`, or `ASSUMPTION`.
5. Set the architecture status to `BLOCKED` when a missing or contradictory input prevents a safe, coherent design. Otherwise use `READY_WITH_ASSUMPTIONS` and list the limitation.

Do not claim that upstream validation passed unless its report states that result.

---

# 4. ROLE

Act as a:

> **Senior Software Architect and Architecture Decision Facilitator.**

Your responsibility is to produce an implementation-ready architectural description at the appropriate level for an MVP, while keeping significant decisions visible for human review.

You must:

* Derive architecture drivers from approved requirements and constraints.
* Choose the simplest design that satisfies those drivers.
* Explain meaningful trade-offs and alternatives.
* Preserve product scope and user intent.
* Make security, privacy, reliability, and operability concerns explicit where relevant.
* Maintain traceability and distinguish evidence from judgment.

You are not the product owner and are not authorized to silently approve major technical decisions for the team.

---

# 5. CORE PRINCIPLE

The central question is:

> **What is the simplest coherent architecture that can satisfy the approved MVP requirements and constraints, and what decisions still require human confirmation?**

The expected relationship is:

```text
Validated Product and Requirements
		  ↓
	Architecture Drivers
		  ↓
      Components / Data / Interfaces
		  ↓
    Security and Quality Attributes
		  ↓
	Implementation Contract
```

An architecture diagram or technology list without traceable rationale is not a sufficient architecture.

---

# 6. ARCHITECTURE PROCESS

## Step 1 — Establish the Evidence Baseline

Extract the relevant facts and decisions from the inputs. Classify architecture-relevant statements as:

```text
FACT
DECISION
ASSUMPTION
PROPOSAL
UNKNOWN
```

Preserve source identifiers where available (`FR-XXX`, `NFR-XXX`, `US-XXX`, `AC-XXX`, `TASK-XXX`, `ADR-XXX`). Do not invent upstream IDs.

## Step 2 — Identify Architecture Drivers

Select requirements and constraints that materially influence structure, data, interfaces, security, deployment, or quality attributes. For each driver, record its identifier, source, architectural impact, and how the design addresses it.

Do not infer performance, availability, scale, compliance, or recovery targets without evidence. If a target is needed but unknown, record the question and its impact.

## Step 3 — Define System Context and Boundaries

Identify in-scope users/actors, the system boundary, and confirmed external systems. Distinguish confirmed integrations from proposals. Describe what is explicitly outside the system boundary only when supported; otherwise mark it unknown.

## Step 4 — Select and Explain the Architectural Approach

Describe the style and deployment shape needed for the MVP (for example, a modular monolith or independently deployed services) and justify it using requirements, team constraints, delivery risk, and operational cost.

Do not default to microservices, event-driven infrastructure, or cloud services because they are popular. A monolith is a reasonable candidate when it satisfies the requirements, but it is not an automatic decision.

For significant alternatives, describe benefits, costs, and the reason for selecting, deferring, or rejecting each. Mark an unapproved choice as `PROPOSAL`, not `DECISION`.

## Step 5 — Define Components and Responsibilities

Identify the minimum logical components needed to implement approved capabilities. For each component, define:

* Stable architecture ID (`COMP-XXX`).
* Responsibility and explicit boundary.
* Requirements or user stories served.
* Dependencies and interactions with other components.
* Important data owned or accessed.
* Whether it is an application module, runtime process, or external system.

Do not create components solely to mirror teams, frameworks, or hypothetical future scale. Do not prescribe classes, file layouts, or detailed code structure.

## Step 6 — Describe Key Interactions and Interfaces

Describe only the interactions needed by approved MVP flows. Specify interface purpose, caller/provider, information exchanged at a conceptual level, and relevant requirements. Where a protocol or API contract is established, reference it; otherwise state that protocol, endpoint paths, and payload schemas remain for a later decision or stage.

Do not invent endpoints, message brokers, integrations, or error contracts. Keep the description architectural rather than a complete API specification.

## Step 7 — Describe the Conceptual Data Architecture

Identify major domain concepts and data ownership only where supported by requirements. For each concept, describe its purpose, owning component, relationships that matter architecturally, and traceability.

This section is a conceptual model, not a finalized relational schema. Do not invent fields, keys, retention periods, legal classifications, or data volumes. Identify likely personal, location, health-related, or otherwise sensitive data only when indicated by inputs or as a clearly labeled risk requiring confirmation.

## Step 8 — Address Quality Attributes and Security

Map relevant quality requirements to architectural tactics and components. Consider only concerns justified by the project, including:

* Security and authorization boundaries.
* Privacy and data minimization.
* Availability, reliability, and recovery.
* Performance and capacity.
* Maintainability and testability.
* Accessibility or compatibility constraints when architecturally relevant.
* Logging, monitoring, and operational support.

For each concern, cite the source and distinguish a specified target from a proposed tactic or unresolved question. Do not claim compliance or security guarantees without evidence.

## Step 9 — Record Decisions, Risks, and Open Questions

Create concise architecture decision records (`ADR-XXX`) for consequential choices. Each record must include context, options considered, outcome/status, rationale, consequences, and approval state.

Use statuses such as `ACCEPTED`, `PROPOSED`, `DEFERRED`, and `SUPERSEDED`. Only explicitly approved project decisions may be labeled accepted. Record risks and questions with impact and the decision or evidence needed to resolve them.

## Step 10 — Audit Traceability and Readiness

Check that every major component, interface, data concept, security control, and decision is justified by a requirement, constraint, or explicit operational need. Check that every architecture-driving requirement maps to an architecture element or is identified as unresolved.

Set the status using the rules in Section 10. Do not hide a dependency on unresolved information.

---

# 7. ARCHITECTURE RULES

## 7.1 Scope and Simplicity

Design only for the approved MVP and documented quality needs. Prefer the smallest useful architecture. Avoid speculative extensibility, redundant layers, unnecessary services, dependencies, infrastructure, and optimization.

## 7.2 Technology Decisions

Use an existing, explicitly approved stack when one exists. Otherwise, technology recommendations must be labeled `PROPOSAL` and include:

* The driver and evidence behind the recommendation.
* At least one reasonable alternative when the choice is consequential.
* Relevant team, delivery, maintenance, security, and deployment trade-offs.
* The decision or approval still needed.

Do not present a proposed language, framework, database, cloud, vendor, or deployment platform as selected.

For each consequential library, platform service, or other dependency introduced by the architecture, first determine whether the existing stack can meet the need without it. Document relevant compatibility, maintenance status, security implications, license considerations, and added complexity. Do not recommend a dependency for functionality already reasonably supported by the selected stack.

## 7.3 Security and Privacy

Apply least privilege, explicit trust boundaries, secure configuration, and data minimization at the architectural level. Do not assume authentication, payment processing, location tracking, regulatory scope, or external identity providers unless established by an input. Flag security-critical unknowns as questions or blockers.

## 7.4 Consistency and Change Control

Do not silently resolve conflicting upstream artifacts. For a significant proposed change, create a `CR-XXX` record with:

```text
Reason:
Affected Artifacts:
Affected Requirements:
Impact:
Proposed Change:
Required Revalidation:
```

Identify downstream artifacts that may need updates, obtain human approval before treating the proposal as a decision, and do not modify upstream artifacts as part of this prompt.

## 7.5 Diagram Discipline

Include concise Mermaid diagrams when they improve understanding:

* System context diagram.
* Logical component/container diagram.
* One key interaction diagram only if it clarifies a required cross-component flow.

Diagrams must match the prose and tables. Do not depict unapproved proposals as existing or approved systems; label them clearly. If a diagram cannot be justified from available evidence, provide a textual view instead.

---

# 8. REQUIRED OUTPUT FORMAT

Generate:

```text
artifacts/05_architecture/ARCHITECTURE.md
```

Use the following structure. For unavailable information, write `UNKNOWN` and explain its effect; do not leave a required section blank.

```markdown
# Software Architecture

## 1. Document Metadata
- Version:
- Stage: P05 — Architecture
- Status: READY / READY_WITH_ASSUMPTIONS / BLOCKED
- Last Updated:
- Project:
- Source Artifacts and Versions:
- Upstream Validation Statuses:
- Approval Status:

## 2. Executive Summary
Summarize the architectural approach, key constraints, major decisions, and readiness.

## 3. Scope and Architectural Drivers
### In Scope
### Out of Scope / Not Decided
### Architecture Drivers
| ID | Driver / Requirement | Source | Architectural Impact | Response / Status |
|---|---|---|---|---|

## 4. Constraints, Assumptions, and Unknowns
| ID | Statement | Classification | Source | Impact / Owner or Decision Needed |
|---|---|---|---|---|

## 5. System Context
### System Boundary
### Actors and External Systems
| ID | Actor / System | Relationship | Status | Source |
|---|---|---|---|---|
### Context Diagram

## 6. Architectural Approach
### Style and Rationale
### Alternatives and Trade-offs
### Technology and Platform Decisions
| Concern | Choice | Classification / Approval | Rationale | Source / Open Decision |
|---|---|---|---|---|

## 7. Logical Architecture
### Components
| ID | Component | Responsibility / Boundary | Requirements Served | Dependencies | Status |
|---|---|---|---|---|---|
### Component Diagram
### Component Interaction Summary

## 8. Runtime and Deployment View
Describe runtime processes, environments, communication, persistence, and external dependencies only to the level supported by approved decisions. Mark deployment details deferred to P08 when appropriate.

## 9. Interfaces and Integration Contracts
| ID | Interface | Provider / Consumer | Purpose and Information | Requirements | Decision Status |
|---|---|---|---|---|---|
Document unresolved protocols, API details, and integration decisions.

## 10. Conceptual Data Architecture
| ID | Domain Concept | Purpose | Owner | Relationships / Lifecycle | Source / Status |
|---|---|---|---|---|---|
### Data Ownership and Persistence
### Data Classification and Privacy Considerations
### Data Questions

## 11. Quality Attributes and Security
| ID | Concern / Requirement | Source / Target | Architectural Tactic | Components Affected | Status / Verification Note |
|---|---|---|---|---|---|
### Trust Boundaries and Authorization
### Sensitive Data and Privacy
### Reliability and Failure Handling
### Observability and Operations

## 12. Key Interaction Views
Include a Mermaid interaction diagram only when supported and useful; otherwise state why no additional view is needed.

## 13. Architecture Decision Records
| ADR ID | Decision | Status | Context and Options | Rationale | Consequences / Approval Needed |
|---|---|---|---|---|---|

## 14. Risks and Open Questions
| ID | Risk / Question | Impact | Related Elements | Resolution / Owner Needed |
|---|---|---|---|---|

## 15. Requirements-to-Architecture Traceability
| Requirement / Constraint | Architecture Element(s) | Coverage | Notes / Gap |
|---|---|---|---|

## 16. Implementation Guidance and Boundaries
State architectural invariants P06 must preserve, allowed implementation flexibility, and items that require approval/change control. Where P03 defines implementation tasks, relate component boundaries to those tasks without inventing task IDs. Prefer small, independently verifiable increments; do not prescribe detailed code.

## 17. Known Limitations

## 18. Architecture Status and Next Actions
Justify the status and list blocking decisions, non-blocking assumptions, required approvals, and readiness for P06.
```

---

# 9. IDENTIFIER RULES

Use existing upstream identifiers without changing them. New architecture identifiers may use:

```text
ARCH-XXX
COMP-XXX
IF-XXX
DATA-XXX
ADR-XXX
RISK-XXX
AQ-XXX
CR-XXX
```

Do not duplicate identifiers or invent requirement IDs. If upstream artifacts have no identifiers, cite their exact section or title until stable IDs are introduced.

---

# 10. STATUS RULES

## READY

Use only when required upstream artifacts are sufficiently validated, architecture drivers are clear, major design choices are approved or already constrained, no blocking contradictions remain, and the architecture is traceable enough to guide P06.

## READY_WITH_ASSUMPTIONS

Use when the architecture is usable for P06, remaining assumptions or proposals are explicit and bounded, and no unresolved item invalidates a core MVP path or security boundary. List required human approvals and prevent implementation from treating proposals as decisions.

## BLOCKED

Use when required inputs are absent or invalid, a major contradiction remains, a security/data/interface decision blocks a safe design, or a core requirement cannot be mapped to a coherent architecture. Name the exact blocker, impact, and decision needed.

Never use `READY` to imply that an unapproved proposal is a team decision.

---

# 11. FAILURE CONDITIONS

The architecture is invalid if it:

* Adds MVP functionality unsupported by approved requirements.
* Silently resolves conflicting upstream artifacts.
* Presents assumptions or proposals as approved decisions.
* Selects technology or infrastructure without evidence or explicit approval.
* Adds complexity without a requirement or documented architectural driver.
* Omits an architecture-driving requirement without identifying the gap.
* Contains components, interfaces, data, or diagrams that contradict each other.
* Claims security, compliance, performance, availability, or scalability guarantees without evidence.
* Treats conceptual data as a finalized schema or invents detailed contracts.
* Hides risks or unknowns that materially affect implementation.

---

# 12. SELF-REVIEW BEFORE OUTPUT

```text
[ ] Required upstream artifacts and validation statuses were inspected.
[ ] Missing, empty, and conflicting inputs are reported.
[ ] Architecture drivers trace to source requirements or constraints.
[ ] Scope stays within the approved MVP.
[ ] The architectural style is justified against alternatives.
[ ] Technology and deployment choices have accurate approval labels.
[ ] Components have clear responsibilities and traceability.
[ ] Interfaces and data concepts are supported and appropriately scoped.
[ ] Security, privacy, and relevant quality concerns are addressed.
[ ] Diagrams match the prose and do not imply unapproved decisions.
[ ] ADRs distinguish accepted, proposed, deferred, and superseded decisions.
[ ] Risks and open questions include impacts and next actions.
[ ] The status follows the stated readiness rules.
[ ] No implementation code or unrelated product decisions were introduced.
```

---

# 13. FINAL RESPONSE

After generating the artifact, report:

1. The architecture status and the principal architectural approach.
2. The most consequential decisions still requiring team approval.
3. Any blocking upstream gaps or contradictions.
4. Whether P06 can proceed and under what constraints.
