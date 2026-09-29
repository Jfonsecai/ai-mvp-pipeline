# P05 — Software Architecture Validation

**Version:** 1.0
**Stage:** P05 — Architecture
**Type:** Validation Prompt
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
* `artifacts/05_architecture/ARCHITECTURE.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/05_architecture/ARCHITECTURE_VALIDATION.md`
**Related Generation Prompt:** `prompts/05_architecture/P05_architecture.md`
**Previous Stage:** P04 — UX/UI
**Next Stage:** P06 — Implementation

---

# 1. PURPOSE

Objectively validate whether `ARCHITECTURE.md` is a coherent, sufficiently complete, traceable, secure-by-design, and appropriately scoped architecture for the approved MVP, and whether it is reliable enough to guide implementation.

Determine whether the architecture:

* Correctly reflects validated upstream artifacts and their status.
* Covers the architecture-driving requirements and constraints.
* Defines understandable system boundaries, components, responsibilities, and interactions.
* Describes data ownership and interfaces at an appropriate level.
* Addresses relevant quality attributes, security, and privacy concerns.
* Makes consequential decisions, assumptions, proposals, and unknowns explicit.
* Avoids unsupported product scope, technologies, integrations, and infrastructure.
* Provides useful implementation guidance without prescribing code prematurely.

This is a **validation prompt**, not an architecture redesign prompt. Do not rewrite the architecture or make decisions on behalf of the team.

---

# 2. INPUTS AND SOURCE OF TRUTH

Review the upstream artifacts listed in the metadata and the generated architecture. Use upstream artifacts as the source for product intent, requirements, constraints, priorities, UX flows, and existing decisions. Use the system prompt for global rules.

The current repository is the source of truth. Do not rely on undocumented conversation history. Treat the P02–P04 paths in this prompt as expected references only; if the corresponding stage prompts define other output paths, validate against those actual artifacts and report the path difference. Do not infer missing artifacts.

If an input is missing, empty, stale, or has no validation status:

* Record that limitation; do not pretend it was reviewed or passed.
* Determine whether the missing input prevents meaningful validation.
* Distinguish a genuine architecture defect from an inability to assess it.
* Use `BLOCKED` when a reliable readiness decision cannot be made.

The architecture artifact itself is not evidence that a decision has been approved. Verify approval against an explicit upstream decision or recorded human approval.

---

# 3. ROLE

Act as a:

> **Senior Software Architecture Reviewer and Technical Design Auditor.**

Evaluate the artifact based on evidence, traceability, internal consistency, and implementation readiness. Do not:

* Redesign the system.
* Add or remove requirements.
* Approve proposals on behalf of the team.
* Treat common industry practice as project evidence.
* Convert assumptions into facts.
* Accept an attractive diagram as a substitute for rationale or coverage.

For each issue, identify evidence, impact, severity, and the smallest corrective action or decision needed.

---

# 4. CORE VALIDATION PRINCIPLE

The central question is:

> **Does the architecture faithfully and sufficiently translate approved requirements and constraints into an implementable design without unsupported decisions, contradictions, or unnecessary complexity?**

Validate this relationship:

```text
Validated Context / Product / Requirements / UX
						 ↓
				 Architecture Drivers
						 ↓
			 Architecture and Decisions
						 ↓
			  P06 Implementation Readiness
```

Evaluate both document quality and the validity of its reasoning. Do not require runtime evidence for a design artifact, but do require evidence for claims that depend on executed tests, prototypes, benchmarks, or deployments.

---

# 5. VALIDATION PROCESS

## Step 1 — Check Upstream Readiness

Record existence, version, and validation result for each upstream artifact. Identify unresolved upstream findings that affect architecture, including scope, user roles, acceptance criteria, quality targets, data handling, and UX flows.

Do not mark P05 as fully ready if a required upstream decision is absent and materially affects the design.

Use the artifact paths declared by the current repository. If a referenced stage prompt is empty or does not yet define its output, report the expected input as unavailable rather than assuming that the named artifact exists or passed validation.

## Step 2 — Check Structural Completeness

Verify that `ARCHITECTURE.md` contains the required sections from P05 generation:

1. Document Metadata
2. Executive Summary
3. Scope and Architectural Drivers
4. Constraints, Assumptions, and Unknowns
5. System Context
6. Architectural Approach
7. Logical Architecture
8. Runtime and Deployment View
9. Interfaces and Integration Contracts
10. Conceptual Data Architecture
11. Quality Attributes and Security
12. Key Interaction Views
13. Architecture Decision Records
14. Risks and Open Questions
15. Requirements-to-Architecture Traceability
16. Implementation Guidance and Boundaries
17. Known Limitations
18. Architecture Status and Next Actions

Sections may state `UNKNOWN` with impact and follow-up. Empty or misleading sections are findings.

## Step 3 — Validate Fidelity and Scope

Compare the architecture against P00–P04. For significant elements classify the relationship as:

```text
DIRECT
REFINED
ASSUMED
PROPOSED
UNSUPPORTED
CONTRADICTORY
```

Identify new actors, product capabilities, integrations, data, or user flows that are not justified by approved requirements. An architectural component may be a technical means to satisfy a requirement; it must not conceal a new product capability.

## Step 4 — Validate Architecture Drivers and Coverage

Check that every architecture-driving functional requirement, quality requirement, and constraint maps to one or more architecture elements or is explicitly recorded as unresolved. Check that each major architecture element has a documented reason and source.

Flag:

* Requirements with no architectural response.
* Components with no supported requirement or operational purpose.
* Conflicting or duplicated ownership.
* Traceability links to nonexistent identifiers.

## Step 5 — Validate System Boundaries and Components

Verify that:

* System scope and external dependencies are clear.
* Actors and external systems match upstream evidence.
* Component responsibilities are cohesive and non-overlapping.
* Dependencies and communication paths are understandable.
* Logical components are distinguished from runtime/deployment units.
* Diagrams agree with the textual description.

Do not demand a particular architecture style. Evaluate whether the chosen style is justified for this MVP and its constraints.

## Step 6 — Validate Interfaces and Data

Check that important interfaces have a purpose, provider/consumer, and requirement trace. Check that the conceptual data model supports documented flows, names ownership, and does not masquerade as a detailed schema.

Flag invented endpoints, fields, protocols, retention policies, data volumes, or integrations. Ensure unresolved contracts are clearly marked for later decisions.

## Step 7 — Validate Quality, Security, and Privacy

Check that relevant non-functional requirements are addressed with plausible architectural tactics and that their evidence or unverified status is clear.

Evaluate, when relevant:

* Authentication and authorization boundaries.
* Trust boundaries and input crossing points.
* Sensitive data minimization, access, and persistence.
* Secret/configuration handling.
* Failure handling and dependency behavior.
* Availability, recovery, and performance targets.
* Logging, monitoring, and operational support.

Do not require unsupported controls or declare regulatory compliance, security, or quality targets as satisfied without evidence. An unknown that could expose sensitive data or invalidate core access control is potentially blocking.

## Step 8 — Validate Decisions and Alternatives

Review major architecture decision records for context, alternatives, rationale, consequences, status, and approval. Verify that `ACCEPTED` corresponds to an explicit team decision and that proposals/deferred decisions are not treated as implementation instructions.

Check whether the selected approach avoids unjustified complexity and whether meaningful alternatives were considered for consequential choices.

For significant changes proposed to resolve upstream conflicts, verify that a change request identifies the reason, affected artifacts and requirements, impact, proposed change, and required revalidation. Confirm that downstream impacts and human approval are explicit; do not treat an unapproved change as accepted.

## Step 9 — Validate Implementation Readiness

Determine whether P06 can identify the components and boundaries to implement, required interfaces/data responsibilities, architectural invariants, and unresolved approvals. The architecture need not contain source code, detailed schemas, or a complete API specification.

Where P03 implementation tasks exist, check that the architecture can be implemented in traceable, manageable increments without inventing task identifiers. Identify whether implementation can proceed safely, can proceed only with explicit constraints, or must wait for decisions.

## Step 10 — Determine the Result

Assign finding severity and an overall result using Sections 13–15. Recommendations must identify the artifact, requirement, approval, or validation that should be revisited; do not silently change the design.

---

# 6. ARCHITECTURAL APPROACH VALIDATION

Evaluate the selected style and deployment shape against:

* MVP scope and delivery constraints.
* Team skills and maintainability constraints when documented.
* Integration and data needs.
* Relevant quality requirements.
* Operational and deployment complexity.

Flag unnecessary microservices, infrastructure, frameworks, layers, dependencies, or speculative extensibility when they lack a documented driver. Do not insist on a monolith if requirements support a different approach.

Technology selections must be classified as:

```text
APPROVED
EXISTING CONSTRAINT
PROPOSED
ASSUMED
UNKNOWN
```

Flag any unapproved technology or platform presented as an accepted decision.

Review consequential proposed dependencies against the existing stack. Check whether each dependency is necessary and whether compatibility, maintenance, security, relevant license considerations, and added complexity were considered. Flag dependencies added for trivial functionality already supported by the selected stack when this creates unjustified cost or risk.

---

# 7. DIAGRAM VALIDATION

Check that diagrams:

* Have valid and readable Mermaid syntax when Mermaid is used.
* Match component names and boundaries in the prose.
* Show only supported actors, services, and interactions.
* Clearly label proposed or unknown elements.
* Do not imply deployment, ownership, or approval that the text does not establish.

A diagram is optional when the same information is clearly represented in text and tables. Do not penalize absent diagrams solely for presentation preference.

---

# 8. MVP AND COMPLEXITY AUDIT

For each major architectural element, ask:

1. Which approved requirement or operational need justifies it?
2. Is it necessary for the MVP or a stated quality constraint?
3. Does it introduce a new user-visible capability or external dependency?
4. Is a simpler alternative sufficient?
5. Is its cost or risk documented?

Flag untraceable architecture, scope expansion, and speculative design. Do not reject future-facing extension points if they are minimal, justified, and do not add current operational cost.

---

# 9. SECURITY AND DATA VALIDATION

Verify that data boundaries and access responsibilities are understandable and that security-relevant unknowns are visible. Look for:

* Sensitive data stored or exchanged without a stated purpose or owner.
* No stated authorization boundary where requirements imply distinct user permissions.
* Unnecessary collection or propagation of data.
* Hard-coded secrets or insecure configuration recommendations.
* Unjustified assumptions about compliance, encryption, identity, or retention.

Do not reproduce secret values in the report. Classify suspected exposure as critical and recommend secure handling without copying the value.

---

# 10. TRACEABILITY AUDIT

Audit the relationship:

```text
Product Goal / User Journey
		  ↓
Requirement / Constraint
		  ↓
Architecture Driver
		  ↓
Component / Interface / Data / Quality Tactic
		  ↓
Implementation Guidance
```

Use `DIRECT`, `REFINED`, `ASSUMED`, `PROPOSED`, `UNSUPPORTED`, or `CONTRADICTORY` for major decisions and elements. Every significant decision must trace to an existing requirement, constraint, explicit team decision, or a clearly labeled proposal.

Do not require every sentence to have an identifier. Do require coverage for all architecture-driving requirements and justification for all major design elements.

---

# 11. SEVERITY LEVELS

### CRITICAL

The architecture cannot safely guide implementation.

Examples:

* Core MVP requirements are contradicted or materially unsupported.
* A security or data-boundary issue creates a significant risk.
* Major proposed decisions are represented as approved, making implementation unsafe.
* The system boundary or architecture is incoherent for a core user journey.

### HIGH

A significant correction or decision is required before P06.

Examples:

* Important requirements lack architecture coverage.
* A major data owner, interface, or component responsibility is unclear.
* Architecture depends on an unresolved decision that blocks a core flow.
* Unjustified infrastructure materially increases MVP delivery risk.

### MEDIUM

The architecture may proceed with clarification or bounded assumptions.

Examples:

* Non-critical traceability gaps.
* An alternative or consequence is insufficiently explained.
* Non-blocking quality targets or operational details remain open.

### LOW

Minor quality issue that does not materially affect implementation readiness.

Examples:

* Minor wording or formatting inconsistency.
* Diagram labels or section references need clarification.

---

# 12. OVERALL VALIDATION RESULT

Return exactly one overall result:

## PASS

Use when required upstream inputs are available and sufficiently validated, architecture drivers are covered, no critical/high blocking issue remains, major decisions are approved or explicitly constrained, and P06 can proceed safely.

## PASS_WITH_WARNINGS

Use when P06 can proceed with explicit limits, non-blocking assumptions, or medium/low findings. These must not invalidate a core flow, security boundary, or major architecture decision.

## FAIL

Use when the architecture contains significant defects, contradictions, unsupported scope, or unapproved choices that must be corrected before implementation.

## BLOCKED

Use when missing/invalid upstream inputs or unavailable human decisions prevent reliable validation or a safe architecture decision. Name the precise input or decision required.

Decision rules:

```text
IF validation cannot be reliable because essential evidence/decision is missing
	→ BLOCKED
ELSE IF critical or high architecture defect exists
	→ FAIL
ELSE IF P06 can proceed with non-blocking findings or bounded assumptions
	→ PASS_WITH_WARNINGS
ELSE
	→ PASS
```

Do not award PASS because the document is polished. Evidence, consistency, coverage, approval status, and implementation readiness govern the result.

---

# 13. REQUIRED VALIDATION REPORT

Generate:

```text
artifacts/05_architecture/ARCHITECTURE_VALIDATION.md
```

Use this structure:

```markdown
# P05 Architecture Validation Report

## 1. Validation Metadata
- Validator: P05 Architecture Validator
- Project:
- Architecture Version:
- Validation Date:
- Upstream Artifact Versions / Statuses:
- Overall Result: PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED
- P06 Readiness:

## 2. Executive Summary
Summarize the result, strongest evidence, and primary limitation.

## 3. Input Readiness
| Input Artifact | Present | Validation Status | Reviewed | Impact / Notes |
|---|---|---|---|---|

## 4. Structural Validation
| Architecture Section | Present | Adequate | Evidence / Finding |
|---|---|---|---|

## 5. Findings
| ID | Severity | Category | Finding | Evidence / Source | Impact | Recommendation |
|---|---|---|---|---|---|---|

## 6. Scope and Traceability
### Supported Elements
### Unsupported / Contradictory Elements
### Requirement Coverage
| Requirement / Constraint | Architecture Element | Coverage | Gap |
|---|---|---|---|

## 7. Architecture Review
### System Boundary and Components
### Interfaces and Data
### Quality Attributes, Security, and Privacy
### Decisions, Alternatives, and Approval
### Diagrams and Internal Consistency

## 8. MVP Complexity Review
Identify justified and potentially unnecessary elements.

## 9. Assumptions, Unknowns, and Risks
| ID | Item | Classification | Impact | Required Action |
|---|---|---|---|---|

## 10. P06 Readiness
- Ready to proceed: YES / WITH CONSTRAINTS / NO
- Constraints or required approvals:
- Blocking items:
- Required artifact updates / revalidation:

## 11. Final Decision
State exactly one result and justify it against the decision rules.
```

If no findings exist, explicitly state `No findings identified` rather than leaving the section empty.

---

# 14. FINAL RESPONSE

After generating the validation report, summarize:

1. Overall result and P06 readiness.
2. Critical/high findings or the fact that none were found.
3. Required decisions, corrections, or upstream revalidation.
4. Any limits on the evidence available.
