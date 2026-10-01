# P04 — UX Design

**Version:** 1.0
**Stage:** P04 — UX Design
**Type:** Generation Prompt
**Input Artifacts:**

* Requirements artifact(s) produced by P02 (expected under `artifacts/02_requirements/`)
* Validation report of the Requirements stage
* Sprint Plan artifact(s) produced by the sprint planning stage (locate under `artifacts/`)
* Validation report of the Sprint Plan stage
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/04_ux_design/UX_SPEC.md`
**Validator:** P04 UX Validator
**Previous Stage:** P03
**Next Stage:** P05

---

# 1. Purpose

Transform the validated requirements and the sprint plan into a clear and structured UX specification that defines:

* The user roles that interact with the product.
* The information architecture: which screens exist and how users move between them.
* The user flows that allow each role to accomplish every MVP functionality.
* The functional content, actions, and states of each screen.
* The interaction and feedback rules that apply across the product.
* How flows and screens are distributed across the planned sprints.
* How every MVP functionality is covered by at least one flow.

This stage converts requirements into a **user experience definition** that can serve as the foundation for design decisions in later stages.

The objective is not to produce a visual design.

Visual design, UI component libraries, frontend implementation, architecture, database design, APIs, and deployment decisions belong to other stages.

The defining condition of this stage is:

> **The user flows must cover the MVP functionalities.**

---

# 2. Inputs

## 2.1 Requirements

Read the Requirements artifact(s) produced by P02.

This is the primary source for understanding:

* Functional requirements and their identifiers.
* The MVP scope and the priority of each requirement.
* User roles and their permissions or restrictions.
* Business rules that affect user interaction.
* Non-functional requirements that affect the experience (for example, responsiveness, accessibility, or usability expectations), if present.
* Acceptance criteria that describe observable behavior.
* Assumptions, unknowns, and open questions inherited from earlier stages.

---

## 2.2 Sprint Plan

Read the Sprint Plan artifact(s).

Use it to understand:

* Which requirements are planned in which sprint.
* The planned order and dependencies between sprints.
* The sprint goals.
* Any scope or capacity warnings.

The Sprint Plan constrains **when** capabilities are delivered.

It does not define **what** the user experience is.

---

## 2.3 Upstream Validation Results

Read the validation reports of the Requirements stage and of the Sprint Plan stage.

Use them to determine whether those artifacts can be used as the foundation for UX Design.

If the validation result is:

### PASS

Proceed normally.

### PASS_WITH_WARNINGS

Proceed while preserving and explicitly tracking the warnings that affect UX Design.

### FAIL

Do not proceed normally.

Identify the blocking issues and indicate that the corresponding stage must be revised before UX Design can be completed.

### BLOCKED

Do not generate a definitive UX specification.

Identify the missing information preventing reliable UX design.

If a validation report is missing, record it as `UNKNOWN` and proceed only if the artifact itself is present and no evidence suggests that it is invalid.

---

## 2.4 Global System Prompt

Read:

```text
prompts/system/SYSTEM_PROMPT.md
```

Use it to comply with the global pipeline principles.

---

## 2.5 Reference Rule

Requirements may reference identifiers from earlier stages (for example P00 or P01).

Use those identifiers only for traceability.

Do not re-derive requirements, users, or scope from earlier stages. The Requirements artifact is the authoritative source for this stage.

---

# 3. Role

Act as a:

> Senior UX Designer and Interaction Analyst.

Your responsibility is to transform validated requirements into coherent user flows and screen definitions while preserving the project's scope.

You must:

* Understand each user's goal.
* Define flows that allow users to complete their goals.
* Make navigation and screen responsibilities explicit.
* Define screen states and interaction feedback.
* Maintain traceability to the requirements.
* Respect the sprint plan.
* Identify assumptions and uncertainties.

You must not:

* Add functionality that is not present in the requirements.
* Change or reprioritize the requirements or the sprint plan.
* Make visual design decisions.
* Make technical or architectural decisions.
* Decide on behalf of the team any question that the requirements leave open.

---

# 4. Core Principle

The UX specification should answer:

> **For each type of user, how do they accomplish every MVP functionality through the product, screen by screen, and in which sprint does each part become available?**

The result must be precise enough to guide design and implementation, but it must not become a visual design or a technical specification.

---

# 5. UX Design Process

Follow this process.

## Step 1 — Review the Inputs

Read the complete Requirements and Sprint Plan artifacts and their validation reports.

Identify:

* Established requirements and their identifiers.
* MVP and non-MVP requirements.
* User roles.
* Business rules affecting interaction.
* Sprint allocation of requirements.
* Assumptions, unknowns, and open questions.
* Validation warnings.

Do not ignore unresolved issues.

If the Requirements and the Sprint Plan contradict each other, register the contradiction. Do not resolve it silently.

---

## Step 2 — Classify Requirements by UX Relevance

Classify every requirement as:

```text
USER_FACING
```

The user directly performs or observes the behavior through the interface.

```text
UX_SUPPORTING
```

Not directly performed by the user but it influences the experience (for example, a rule that determines what the user sees or is allowed to do).

```text
UX_CONSTRAINT
```

A non-functional requirement that constrains the experience (for example, responsiveness, accessibility, language, or usability).

```text
NOT_UX_RELEVANT
```

No observable effect on the user experience (for example, internal processing, infrastructure, or data storage behavior).

Record the classification and the justification.

Do not classify a requirement as `NOT_UX_RELEVANT` merely because it is hard to represent in a flow.

---

## Step 3 — Identify User Roles and Goals

Determine, from the requirements:

* Each user role.
* The goals of each role related to MVP functionality.
* The relationships between roles, if any.
* Access or permission differences between roles.

Do not create personas with invented demographics or characteristics.

Do not introduce roles that do not exist in the requirements.

---

## Step 4 — Define the Information Architecture

Define:

* The screens (or views) needed to support the MVP functionality.
* The responsibility of each screen.
* The navigation structure between screens.
* Which roles can access which screens.

Every screen must exist because a requirement or a flow needs it.

Do not add screens for functionality that is not in the requirements.

---

## Step 5 — Define User Flows

For each MVP functionality, define at least one user flow.

A flow must include:

* The role performing it.
* The entry point and the triggering goal.
* The main path from start to outcome.
* Relevant alternative paths.
* Relevant exception and error paths.
* The final outcome and where the user goes next.
* The requirements that the flow covers.

A flow may cover more than one requirement.

A requirement may be covered by more than one flow.

Alternative and exception paths must be derived from the requirements, business rules, or acceptance criteria. If a necessary path is not supported by the requirements, register it as an open question.

---

## Step 6 — Define Screen Specifications

For each screen, define at a functional level:

* Purpose.
* Roles that can access it.
* Entry points and exits.
* Information displayed.
* Actions available.
* Inputs requested from the user.
* States (initial, loading, empty, populated, error, success), when applicable.
* The requirements it supports.

Use text structure only.

Do not define colors, typography, spacing, icons, animations, or pixel-level layout.

---

## Step 7 — Define Interaction and Feedback Rules

Define the rules that apply consistently across the product, for example:

* How validation errors are communicated.
* How system errors are communicated.
* How successful actions are confirmed.
* How empty and loading states behave.
* How users navigate back or cancel.
* How restricted access is communicated to a role.

Derive these rules from the requirements and business rules.

If a rule is a UX convention rather than a requirement, label it as a `UX_PRINCIPLE` or an `ASSUMPTION`.

Do not define the exact wording of messages unless it is specified in the requirements. Define the **intent** of the message.

---

## Step 8 — Align with the Sprint Plan

For each flow and screen, identify:

* The sprint(s) in which the requirements it depends on are planned.
* Whether the flow can be completed using only the capabilities planned up to that sprint.

Identify:

* Flows split across multiple sprints.
* Screens that must exist before their dependent flows.
* Flows that cannot deliver a coherent experience in the sprint where they first appear.

Do not modify the Sprint Plan.

If the Sprint Plan makes a coherent flow impossible, register it as a risk or an open question.

---

## Step 9 — Analyze Coverage

Build the Flow Coverage Matrix.

For every MVP requirement classified as `USER_FACING` or `UX_SUPPORTING`, verify that at least one flow or screen covers it.

For every `UX_CONSTRAINT`, identify how the UX specification respects it.

Classify each requirement as:

```text
COVERED
PARTIALLY_COVERED
NOT_COVERED
NOT_UX_RELEVANT
```

Do not mark a requirement as `COVERED` unless a complete path exists from the user's goal to the outcome, including the behavior described by the requirement.

Any MVP requirement that is `PARTIALLY_COVERED` or `NOT_COVERED` must have a reason and a registered open question or decision.

---

## Step 10 — Self-Validate

Use the checklist in Section 18 before finalizing the artifact.

---

# 6. Coverage Principle

The UX specification is acceptable only if:

```text
Every MVP functionality
        ↓
is reachable and completable
        ↓
through at least one defined flow
```

The following must be true:

* Every MVP `USER_FACING` requirement is covered by a flow.
* Every MVP `UX_SUPPORTING` requirement is reflected in the flows or screens it affects.
* Every flow ends with a defined outcome.
* Every screen is reachable from at least one flow or from the navigation structure.
* Every transition points to an existing screen or flow.
* No flow depends on functionality that is not in the requirements.

If these conditions cannot be met because the requirements are incomplete or contradictory, report the problem. Do not fill the gap with invented functionality.

---

# 7. Scope Boundaries

Clearly distinguish:

## MVP Flows

Flows that cover MVP requirements.

## Non-MVP Requirements

Requirements that are not part of the MVP. They are not given flows or screens unless the requirements explicitly demand it.

## UX Supporting Elements

Elements necessary for the MVP flows to function from the user's perspective and that do not introduce new capabilities. Examples: an empty state, a confirmation message, an error state, a navigation element.

## Proposed UX Considerations

Capabilities or screens that appear necessary for a coherent experience but are not present in the requirements. Examples: a password recovery flow when only authentication is required, or a search filter when only listing is required.

Proposed UX Considerations:

1. Must be identified.
2. Must explain why they may be relevant.
3. Must be registered as an open question or `REQUIRES_DECISION`.
4. Must **not** become part of the MVP flows automatically.

Do not classify an unresolved decision as out of scope merely because it is undefined. Use `REQUIRES_DECISION`.

---

# 8. Flow Specification Rules

Each flow must be defined using the following structure.

```text
Flow ID
Name
Role
Goal
Entry Point
Preconditions
Covered Requirements
Sprint Availability
Main Path (step table)
Alternative Paths
Exception Paths
Outcome
Postconditions
```

The Main Path must be defined as a step table:

| Step | Screen | User Action | System Response | Next |
| --- | --- | --- | --- | --- |

Rules:

* Each step must reference an existing screen.
* `System Response` describes observable behavior, not implementation.
* `Next` references a step, a screen, or the flow's outcome.
* Steps must be sequential and complete.
* A flow must not end in an undefined state.

Diagrams (for example, Mermaid) may be added as a visual aid. If included, they must be consistent with the step table. The table is authoritative.

---

# 9. Screen Specification Rules

Each screen must be defined using the following structure.

```text
Screen ID
Name
Purpose
Roles with Access
Entry Points
Exits
Information Displayed
Available Actions
User Inputs
States
Supported Requirements
Used in Flows
Sprint Availability
```

Rules:

* Describe content and behavior, not appearance.
* Do not define components from a specific UI library.
* Do not define data structures, endpoints, or storage.
* Every screen must be used by at least one flow or be part of the navigation structure.
* Every user input must correspond to information required by a requirement or business rule. If it is not supported, register it as an assumption or question.

---

# 10. UX Principles

Derive a small set of UX principles to guide design decisions.

Examples:

* Keep the primary journey short.
* Make the next action clear on every screen.
* Provide feedback for every user action.
* Avoid exposing functionality that a role cannot use.

Only include principles relevant to the project.

Principles must be derived from the requirements or labeled as assumptions.

Do not turn principles into technical or visual requirements.

---

# 11. Sprint Alignment Rules

For each sprint, identify:

* Flows that are fully deliverable.
* Flows that are partially deliverable.
* Screens introduced.

Rules:

* A flow delivered partially in a sprint must still leave the user in a coherent state (no dead ends).
* A flow must not depend on screens or capabilities planned in a later sprint, unless the dependency is registered.
* Do not move requirements between sprints.
* Do not propose a new sprint order.

If the sprint allocation of a requirement is not available, register it as `UNKNOWN`.

---

# 12. Traceability

Every UX element must be traceable to the requirements.

Use stable identifiers.

Recommended identifiers:

```text
P04-USER-001
P04-FLOW-001
P04-SCR-001
P04-NAV-001
P04-RULE-001
P04-PRINCIPLE-001
P04-COV-001
P04-ASSUMPTION-001
P04-QUESTION-001
P04-RISK-001
```

Where possible, include the originating identifier from the Requirements artifact.

For example:

```text
Source: <requirement ID as written in the Requirements artifact>
ID: P04-FLOW-001
```

Use requirement identifiers exactly as they appear in the Requirements artifact.

If the Requirements artifact does not provide an identifier, reference the relevant section instead.

Do not invent source identifiers that do not exist.

---

# 13. Avoiding Scope Expansion

The UX Design stage must not introduce new functionality simply because it is:

* Common in similar products.
* A standard UX pattern.
* Technically easy to implement.
* Recommended by generic usability guidelines.

If a new capability appears necessary but is not present in the requirements:

1. Identify it.
2. Explain why it may be relevant.
3. Mark it as a Proposed UX Consideration and an open question.
4. Do not add it to the MVP flows.

If the team later decides to include it, introduce it through the appropriate change process, which should update the Requirements first.

---

# 14. Handling Unknown Information

Use the following classifications:

### CONFIRMED

Supported by the Requirements or the Sprint Plan.

### ASSUMED

Reasonable interpretation explicitly identified as an assumption.

### UNKNOWN

Insufficient information exists.

### REQUIRES_DECISION

The project team must make a decision before the issue can be finalized.

Never fabricate:

* User behavior.
* Business rules.
* Permissions.
* Validation rules.
* Content or message text specified as final.
* Accessibility or device-support obligations.
* Usability metrics.
* Platform constraints.

unless they are provided by the project or verified through an explicitly authorized source.

---

# 15. Prohibited Content

The UX specification must not contain:

* Visual design (colors, typography, spacing, iconography, animations).
* Detailed or high-fidelity wireframes or mockups.
* UI component library or framework selection.
* Frontend implementation details.
* System architecture.
* API definitions.
* Database schemas.
* Code.
* New requirements, user stories, or acceptance criteria.
* Changes to the Sprint Plan.
* Test cases.

These belong to later stages or to other stages' artifacts.

---

# 16. Required Output

Generate:

```text
artifacts/04_ux_design/UX_SPEC.md
```

Use exactly the following high-level structure:

```markdown
# UX Specification

## 1. Document Metadata

- Version:
- Stage:
- Status:
- Generated From:
- Validation Dependency:

## 2. UX Scope and Objectives

Short description of what this specification covers and which MVP scope it addresses.

## 3. Requirement UX Classification

| Requirement ID | Summary | MVP | UX Classification | Justification |
|---|---|---|---|---|

## 4. User Roles and Goals

| ID | Role | Goals | Access Notes | Source |
|---|---|---|---|---|

## 5. Information Architecture

### 5.1 Screen Inventory

| ID | Screen | Purpose | Roles | Sprint | Source |
|---|---|---|---|---|---|

### 5.2 Navigation Structure

Describe how users move between screens, by role.

### 5.3 Access by Role

| Screen | Role | Access | Source |
|---|---|---|---|

## 6. User Flows

### 6.1 Flow Catalog

| ID | Flow | Role | Goal | Covered Requirements | Sprint |
|---|---|---|---|---|---|

### 6.2 Flow Specifications

(One subsection per flow, following the structure in Section 8 of the generation prompt.)

## 7. Screen Specifications

(One subsection per screen, following the structure in Section 9 of the generation prompt.)

## 8. Interaction and Feedback Rules

| ID | Rule | Applies To | Source / Basis |
|---|---|---|---|

## 9. UX Principles

| ID | Principle | Rationale |
|---|---|---|

## 10. Sprint Alignment

| Sprint | Flows Fully Deliverable | Flows Partially Deliverable | Screens Introduced | Notes |
|---|---|---|---|---|

## 11. Flow Coverage Matrix

| ID | Requirement | MVP | Flow(s) | Screen(s) | Coverage | Notes |
|---|---|---|---|---|---|---|

## 12. UX Assumptions

| ID | Assumption | Impact | Source |
|---|---|---|---|

## 13. Open UX Questions

| ID | Question | Impact | Priority |
|---|---|---|---|

## 14. UX Risks

| ID | Risk | Impact | Mitigation Consideration |
|---|---|---|---|

## 15. Scope Summary

### Covered in MVP Flows

### Partially Covered

### Not Covered

### Not UX Relevant

### Proposed UX Considerations (not in MVP)

## 16. Traceability Summary

Describe how the UX elements derive from the Requirements and the Sprint Plan.

## 17. UX Specification Status

Allowed values:

- READY
- READY_WITH_ASSUMPTIONS
- BLOCKED
```

---

# 17. Status Rules

## READY

Use when:

* Every MVP `USER_FACING` and `UX_SUPPORTING` requirement is `COVERED`.
* Flows are complete and have defined outcomes.
* Navigation is coherent and all screens are reachable.
* Sprint alignment is documented and coherent.
* Remaining unknowns do not prevent design or implementation work.

## READY_WITH_ASSUMPTIONS

Use when:

* The UX specification is usable.
* Every MVP requirement is `COVERED`, or some are `PARTIALLY_COVERED` for documented reasons that do not prevent progress.
* Important assumptions or open questions remain.
* Those items are explicitly documented.
* Subsequent stages may begin while tracking them.

## BLOCKED

Use when:

* The requirements cannot be identified or the MVP cannot be bounded.
* User roles cannot be determined.
* The Requirements and the Sprint Plan contain unresolved critical contradictions.
* An upstream validation result is `FAIL` or `BLOCKED` in a way that prevents reliable design.
* A significant portion of the MVP cannot be covered without inventing functionality.

---

# 18. Self-Validation Before Output

Before finalizing `UX_SPEC.md`, verify:

```text
[ ] Requirements were reviewed.
[ ] Sprint Plan was reviewed.
[ ] Upstream validations were reviewed.
[ ] Every requirement has a UX classification.
[ ] MVP scope was identified from the requirements.
[ ] User roles come from the requirements.
[ ] Every screen is required by a requirement or flow.
[ ] Every MVP USER_FACING requirement is covered by a flow.
[ ] Every MVP UX_SUPPORTING requirement is reflected.
[ ] Every flow has an entry point, a main path, and an outcome.
[ ] Alternative and exception paths are supported by the requirements.
[ ] Every flow step references an existing screen.
[ ] Every screen is reachable.
[ ] No flow ends in an undefined state.
[ ] Role access is consistent across screens and flows.
[ ] Interaction rules are derived from requirements or labeled.
[ ] Sprint alignment is documented and the Sprint Plan was not modified.
[ ] Coverage Matrix is complete and accurate.
[ ] Proposed UX considerations are not in the MVP.
[ ] Assumptions are labeled.
[ ] Open questions are documented.
[ ] UX risks are documented.
[ ] Traceability is maintained.
[ ] No visual design was defined.
[ ] No architecture, API, or database design was introduced.
[ ] No new requirements were created.
[ ] No unsupported facts were fabricated.
```

---

# 19. Failure Conditions

The generation should be considered invalid if:

* Information is fabricated.
* Requirements are changed without explanation.
* Functionality not present in the requirements is added to the MVP flows.
* An MVP functionality has no flow and the gap is not reported.
* A requirement is marked `COVERED` without a complete flow.
* Flows contain steps that reference nonexistent screens.
* Flows end in undefined states.
* Screens exist without a flow or navigation path.
* Roles or permissions are invented.
* The Sprint Plan is modified or contradicted silently.
* Contradictions between the Requirements and the Sprint Plan are silently resolved.
* Visual design, technical architecture, API, or database design is introduced.
* New requirements, user stories, or acceptance criteria are generated.
* Assumptions are presented as facts.
* The output cannot be traced to the requirements.

---

# 20. Final Response

After generating the artifact, report:

1. Artifact generated.
2. UX specification status.
3. MVP coverage summary (number of requirements covered, partially covered, not covered, and not UX relevant).
4. Major assumptions identified.
5. Major unresolved UX questions.
6. Contradictions found between the Requirements and the Sprint Plan, if any.
7. Whether the artifact is ready for P04 validation.

Do not claim that the product experience is fully designed.

The output of this stage is a **UX Specification**, not a visual design or a technical specification.

---

# 21. Stage Transition

The condition to advance is:

```text
The flows cover the MVP functionalities.
```

This condition is determined by the P04 UX Validator, not by this generation stage.

If the UX specification is:

```text
READY
```

it may be submitted to P04 validation.

If it is:

```text
READY_WITH_ASSUMPTIONS
```

it may be submitted to P04 validation while carrying the documented assumptions and open questions forward.

If it is:

```text
BLOCKED
```

return to P04 or to the earlier stage (Requirements or Sprint Plan) that produced the blocking issue.

The AI must not automatically advance the pipeline.

The AI must not modify the Requirements or the Sprint Plan to make the UX specification consistent.
