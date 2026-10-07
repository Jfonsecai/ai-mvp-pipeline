# P02 — Requirements Engineering

**Version:** 1.0
**Stage:** P02 — Requirements Engineering
**Type:** Generation Prompt
**Previous Stage:** P01 — Product Discovery
**Next Stage:** P03 — Planning

## 1. Purpose

Transform the validated Product Vision into a structured, traceable, and verifiable set of product requirements and a prioritized-ready product backlog.

This stage converts the product-level definition from P01 into:

* Functional Requirements.
* Non-Functional Requirements.
* Epics.
* User Stories.
* Acceptance Criteria.
* Relevant business rules.
* Relevant edge cases.
* Dependencies and open questions.
* A structured Product Backlog.

P02 defines **what the product must do and what constraints it must satisfy**. It does not define how the system will be implemented.

The outputs of this stage will be used by P03 — Planning to prioritize, estimate, organize, and schedule the work.

---

## 2. Inputs

Read the following artifacts before generating the outputs:

### Required

```text
artifacts/01_discovery/PRODUCT_VISION.md
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
prompts/system/SYSTEM_PROMPT.md
```

### Input roles

* `PRODUCT_VISION.md` is the primary source for product scope, users, needs, value, MVP capabilities, and product goals.
* `PRODUCT_VISION_VALIDATION.md` identifies validated findings, warnings, assumptions, unresolved questions, and scope concerns from P01.
* `SYSTEM_PROMPT.md` defines the global rules that apply to the entire pipeline.

Do not assume that information not present in these artifacts is known.

---

## 3. Role

Act as a **Senior Requirements Engineer and Product Analyst**.

Your responsibility is to translate validated product-level needs into clear, testable, and traceable requirements without introducing premature technical or implementation decisions.

---

## 4. Core Principle

The central question of this stage is:

> **What must the product do, for whom, and under what verifiable conditions?**

P02 must describe the expected product behavior and relevant quality constraints while leaving implementation decisions to later stages.

---

## 5. Requirements Process

### Step 1 — Review P01

Analyze:

* Product Vision.
* Problem definition.
* Target users.
* User needs.
* Jobs To Be Done.
* Core product experience.
* MVP Core capabilities.
* MVP Supporting capabilities.
* Future features.
* Open questions.
* Assumptions.
* Product risks.

Use the P01 validation report to identify warnings or unresolved decisions that affect requirements.

---

### Step 2 — Identify Epics

Group related functionality into coherent product areas.

Each Epic must have:

* Unique ID: `EPIC-001`, `EPIC-002`, ...
* Name.
* Description.
* Product objective.
* Related Product Vision elements.

Do not create an Epic solely because it is common in other applications. Every Epic must be justified by the project's product vision.

---

### Step 3 — Define Functional Requirements

Create functional requirements for capabilities the product must provide.

Use IDs:

```text
FR-001
FR-002
FR-003
...
```

Each Functional Requirement should describe one clear system capability.

Example:

```text
FR-001 — Pet Registration

The platform shall allow a pet owner to register a pet
associated with their account.
```

Requirements should be:

* Clear.
* Necessary.
* Atomic when practical.
* Testable.
* Traceable to P01.
* Independent of implementation technology.

Do not prescribe frameworks, databases, APIs, libraries, or architecture.

---

### Step 4 — Define Non-Functional Requirements

Identify quality constraints that are relevant and supported by the project context.

Use IDs:

```text
NFR-001
NFR-002
NFR-003
...
```

Possible categories include:

* Security.
* Performance.
* Availability.
* Usability.
* Accessibility.
* Reliability.
* Privacy.
* Maintainability.

Only include a non-functional requirement when there is sufficient basis for it.

Do not invent arbitrary numerical targets merely to make the requirement appear precise.

If a target requires a product or technical decision that has not yet been made, mark it as:

```text
REQUIRES_DECISION
```

rather than inventing a value.

---

### Step 5 — Create User Stories

Transform relevant functional requirements and product capabilities into atomic User Stories.

Use IDs:

```text
US-001
US-002
US-003
...
```

Use the following structure:

> **As a** [user role],
> **I want** [action or capability],
> **so that** [benefit or purpose].

User Stories should:

* Represent a single meaningful user goal.
* Be understandable without implementation knowledge.
* Avoid combining unrelated workflows.
* Trace to one or more relevant requirements.
* Remain within the defined MVP scope.

Avoid monolithic stories.

For example, avoid:

```text
As a pet owner, I want to manage my pets,
find veterinarians, book appointments, and pay
for services.
```

Prefer separate stories for each meaningful goal.

---

### Step 6 — Define Acceptance Criteria

Each User Story must have acceptance criteria that are:

* Observable.
* Testable.
* Specific enough to determine whether the story is satisfied.
* Consistent with the Product Vision.
* Appropriate to the individual story.

Use Given / When / Then when useful:

```text
Given [initial condition]
When [action]
Then [expected result]
```

Acceptance criteria should cover relevant:

* Happy paths.
* Business rules.
* Validation rules.
* Alternative flows.
* Relevant error or edge cases.

Do not force irrelevant criteria into every story.

For example, a search story does not need database persistence criteria simply because another story does.

---

### Step 7 — Identify Business Rules

Document business rules that are necessary to understand or verify requirements.

Use IDs:

```text
BR-001
BR-002
...
```

Examples may include:

* Who can perform an action.
* Restrictions on appointment scheduling.
* Relationships between users, pets, providers, and services.
* Conditions under which an appointment can be created or cancelled.

Do not invent business rules.

If a rule is necessary but not defined by the available inputs, record it as:

```text
REQUIRES_DECISION
```

and add it to the relevant Open Questions section.

---

### Step 8 — Identify Edge Cases and Dependencies

For each relevant requirement or User Story, identify important cases that could affect implementation or testing.

Use:

```text
EDGE-001
DEP-001
```

Examples:

* Missing required information.
* Invalid input.
* Resource no longer available.
* Conflicting appointment.
* User without permission.
* Provider with no available services.

Only include cases that are relevant to the product behavior.

Do not invent technical failure scenarios that belong to Architecture or Implementation.

---

### Step 9 — Preserve Scope

Classify requirements according to the product scope established in P01:

* `MVP_CORE`
* `MVP_SUPPORTING`
* `FUTURE`
* `OUT_OF_SCOPE`
* `REQUIRES_DECISION`

Do not automatically turn common application features into MVP requirements.

If a potentially useful feature is not supported by P01, do not silently add it.

If it appears necessary, record it as a product decision requiring confirmation.

---

### Step 10 — Establish Traceability

Every requirement and User Story must be traceable to the product definition.

The minimum traceability chain is:

```text
P01 Product Vision
        ↓
Epic
        ↓
Functional / Non-Functional Requirement
        ↓
User Story
        ↓
Acceptance Criteria
```

Use stable IDs throughout the artifacts.

Do not create IDs that conflict with IDs already established by previous stages.

---

### Step 11 — Prepare the Product Backlog

Create a structured backlog containing the User Stories and their relevant metadata.

At this stage the backlog should contain enough information for P03 Planning to perform prioritization and estimation.

The backlog may include:

* User Story ID.
* Epic ID.
* Title.
* User Story.
* Requirement IDs.
* Priority status from product scope.
* Acceptance Criteria.
* Dependencies.
* Status.
* Traceability references.

Do **not** assign sprint, release, developer, or Story Point information in P02.

Those decisions belong to P03 — Planning.

---

## 6. Rules and Constraints

### 6.1 Global Rules

Follow all rules defined in:

```text
prompts/system/SYSTEM_PROMPT.md
```

### 6.2 Requirements Boundary

P02 defines product requirements, not implementation.

Do not define:

* Programming languages.
* Frameworks.
* Libraries.
* Database engines.
* API architecture.
* Internal API routes.
* DTO implementation.
* Repository structure.
* Deployment infrastructure.
* Docker or Kubernetes.
* Authentication implementation details.
* Specific hashing algorithms.
* Database primary-key strategies.
* Internal software design patterns.

These decisions belong to later stages.

---

### 6.3 Avoid Premature Technical Specifications

A requirement may state:

> The platform must authenticate users before allowing access to protected account functionality.

It should not prematurely state:

> The platform must use JWT with UUID v4 and bcrypt with ten salt rounds.

The first describes a product/security requirement.

The second specifies an implementation.

If a technical constraint is explicitly established by the project inputs, preserve it as a documented constraint rather than inventing one.

---

### 6.4 No Fabrication

Do not invent:

* Business rules.
* Required fields.
* User roles.
* Product features.
* Performance targets.
* Security mechanisms.
* External integrations.
* Legal requirements.
* Technical constraints.

When information is missing, use:

```text
UNKNOWN
ASSUMPTION
REQUIRES_DECISION
```

according to the global rules.

---

### 6.5 No Scope Creep

A requirement must be traceable to P01 or explicitly marked as a decision requiring confirmation.

Do not add features merely because they are common in:

* Rappi.
* Marketplace applications.
* Veterinary platforms.
* Booking systems.
* E-commerce applications.

The product vision is the scope authority for this stage.

---

### 6.6 No Planning Decisions

Do not decide:

* Releases.
* Sprints.
* Story Point estimates.
* Developer assignments.
* Workload percentages.

P03 will consume the Product Backlog and make those decisions.

---

## 7. Required Outputs

P02 must generate **two artifacts**.

### Output 1 — Requirements Specification

```text
artifacts/02_requirements/REQUIREMENTS.md
```

Use the following structure:

```markdown
# Requirements Specification

## 1. Document Metadata
- Version:
- Stage:
- Status:
- Generated From:
- Validation Dependency:

## 2. Requirements Overview

### 2.1 Scope Summary
### 2.2 Requirement Status
### 2.3 Requirement Classification

## 3. Epics

| Epic ID | Name | Description | Product Objective | Scope |
|---|---|---|---|---|

## 4. Functional Requirements

| ID | Requirement | Epic | Scope | Priority Status | Traceability |
|---|---|---|---|---|---|

## 5. Non-Functional Requirements

| ID | Category | Requirement | Scope | Traceability |
|---|---|---|---|---|

## 6. User Stories

### US-001 — [Title]

- **Epic:** EPIC-XXX
- **Requirement(s):** FR-XXX
- **User Story:** As a ..., I want ..., so that ...
- **Scope:** MVP_CORE / MVP_SUPPORTING / FUTURE / OUT_OF_SCOPE / REQUIRES_DECISION

#### Acceptance Criteria

- AC-001:
  - Given ...
  - When ...
  - Then ...

- AC-002:
  - Given ...
  - When ...
  - Then ...

#### Business Rules
- BR-XXX

#### Edge Cases
- EDGE-XXX

#### Dependencies
- DEP-XXX

#### Open Questions
- Q-XXX

Repeat for every User Story.

## 7. Business Rules

| ID | Rule | Related Requirements / Stories | Status |
|---|---|---|---|

## 8. Edge Cases

| ID | Description | Related Story | Expected Behavior | Status |
|---|---|---|---|---|

## 9. Dependencies

| ID | Dependency | Related Items | Status |
|---|---|---|---|

## 10. Assumptions and Open Questions

### Assumptions

| ID | Assumption | Impact | Source |
|---|---|---|---|

### Open Questions

| ID | Question | Affected Items | Decision Required |
|---|---|---|---|

## 11. Requirements Traceability

| P01 Element | Epic | Requirement | User Story | Acceptance Criteria |
|---|---|---|---|---|

## 12. Requirements Status

READY / READY_WITH_ASSUMPTIONS / BLOCKED
```

---

### Output 2 — Product Backlog

```text
artifacts/02_requirements/product_backlog.json
```

The JSON must contain valid, machine-readable data.

Use this general structure:

```json
{
  "backlog_metadata": {
    "version": "1.0",
    "stage": "P02",
    "status": "READY",
    "source": "PRODUCT_VISION.md"
  },
  "epics": [
    {
      "id": "EPIC-001",
      "name": "",
      "description": "",
      "scope": "MVP_CORE"
    }
  ],
  "items": [
    {
      "id": "US-001",
      "title": "",
      "epic_id": "EPIC-001",
      "requirement_ids": [
        "FR-001"
      ],
      "user_story": {
        "as_a": "",
        "i_want": "",
        "so_that": ""
      },
      "scope": "MVP_CORE",
      "acceptance_criteria": [
        {
          "id": "AC-001",
          "given": "",
          "when": "",
          "then": ""
        }
      ],
      "business_rule_ids": [],
      "edge_case_ids": [],
      "dependency_ids": [],
      "priority": null,
      "story_points": null,
      "release": null,
      "sprint": null,
      "assigned_developers": [],
      "status": "DEFINED",
      "traceability": {
        "p01_elements": []
      }
    }
  ]
}
```

Fields such as:

```text
priority
story_points
release
sprint
assigned_developers
```

must remain `null` or empty when they are not defined by P02.

They are reserved for P03 — Planning.

---

## 8. Requirement Status

Use one of the following statuses:

### READY

The requirements are sufficiently defined and traceable for planning.

### READY_WITH_ASSUMPTIONS

The requirements can proceed to planning but contain documented assumptions or unresolved non-critical decisions.

### BLOCKED

The requirements cannot be reliably produced because essential product information is missing, contradictory, or unresolved.

Do not use `READY` merely because the artifact has been generated.

---

## 9. Self-Validation

Before producing the final artifacts, verify:

* [ ] Every Epic has a unique ID.
* [ ] Every Functional Requirement has a unique `FR-*` ID.
* [ ] Every Non-Functional Requirement has a unique `NFR-*` ID.
* [ ] Every User Story has a unique `US-*` ID.
* [ ] User Stories represent atomic user goals.
* [ ] User Stories use the As a / I want / So that structure.
* [ ] Every User Story has verifiable acceptance criteria.
* [ ] Relevant business rules are identified.
* [ ] Relevant edge cases are identified.
* [ ] Dependencies are documented when applicable.
* [ ] Requirements are traceable to P01.
* [ ] MVP scope has not been silently expanded.
* [ ] Unknown information has not been presented as fact.
* [ ] Assumptions are explicitly documented.
* [ ] Decisions requiring human confirmation are identified.
* [ ] No architecture or implementation decisions have been introduced.
* [ ] No sprint, release, developer, or Story Point decisions have been made.
* [ ] `REQUIREMENTS.md` and `product_backlog.json` contain consistent information.
* [ ] All IDs referenced by one artifact exist in the corresponding artifact.
* [ ] The generated JSON is syntactically valid.
* [ ] The final status accurately reflects the completeness of the requirements.

---

## 10. Failure Conditions

Set the stage to `BLOCKED` if:

* The Product Vision is unavailable.
* The Product Vision validation is unavailable when required.
* Core user roles are undefined.
* The MVP scope cannot be determined.
* Major contradictions in P01 prevent reliable requirement definition.
* A critical product decision is required before requirements can be meaningfully specified.

Do not resolve blocking product decisions by inventing information.

---

## 11. Stage Transition

When P02 reaches:

```text
READY
```

or

```text
READY_WITH_ASSUMPTIONS
```

the generated artifacts are ready for:

```text
P02 Requirements Validation
```

After successful validation, the resulting Requirements Specification and Product Backlog become inputs for:

```text
P03 — Planning
```

P03 will use them to determine:

* Prioritization.
* Story Points.
* Releases.
* Sprints.
* Work allocation.
* Planning dependencies.

P02 must not perform those activities itself.
