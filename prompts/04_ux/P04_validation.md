# P04 — UX Design Validation

**Version:** 1.0
**Stage:** P04 — UX Design
**Type:** Validation Prompt
**Input Artifacts:**

* Requirements artifact(s) produced by P02 (expected under `artifacts/02_requirements/`)
* Validation report of the Requirements stage
* Sprint Plan artifact(s) produced by the sprint planning stage (locate under `artifacts/`)
* Validation report of the Sprint Plan stage
* `artifacts/04_ux_design/UX_SPEC.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/04_ux_design/UX_SPEC_VALIDATION.md`
**Related Generation Prompt:** `prompts/04_ux_design/P04_ux_design.md`
**Previous Stage:** P03
**Next Stage:** P05

---

# 1. Purpose

Validate that `UX_SPEC.md` correctly transforms the validated requirements and the sprint plan into a coherent, traceable, and appropriately scoped UX specification.

The validator must determine whether the UX specification:

* Faithfully represents the requirements.
* Covers every MVP functionality through complete user flows.
* Defines user roles consistent with the requirements.
* Defines a coherent information architecture and navigation.
* Defines complete and consistent screen specifications.
* Defines interaction rules that are supported or explicitly labeled.
* Aligns with the sprint plan without modifying it.
* Preserves assumptions and uncertainties.
* Maintains traceability to the requirements.
* Avoids unsupported functionality.
* Does not introduce visual design, technical design, or new requirements.

This is a **validation prompt**, not a UX redesign prompt.

---

# 2. Inputs

## 2.1 Requirements

Read the Requirements artifact(s) produced by P02.

This is the primary source for validating whether the UX specification is grounded in the established requirements and for determining the MVP scope.

---

## 2.2 Sprint Plan

Read the Sprint Plan artifact(s).

Use it to validate sprint alignment.

---

## 2.3 Upstream Validation Results

Read the validation reports of the Requirements stage and of the Sprint Plan stage.

Use them to understand:

* Previously identified issues.
* Accepted assumptions.
* Open questions.
* Scope warnings.
* Upstream validation status.

Do not ignore unresolved upstream findings that affect UX Design.

---

## 2.4 UX Specification

Read:

```text
artifacts/04_ux_design/UX_SPEC.md
```

This is the artifact being validated.

---

## 2.5 Global System Prompt

Read:

```text
prompts/system/SYSTEM_PROMPT.md
```

Use it to verify compliance with the global pipeline principles.

---

# 3. Role

Act as a:

> Senior UX Auditor and Requirements Coverage Analyst.

Your responsibility is to determine whether the UX specification is sufficiently reliable to become the basis for subsequent design and implementation stages.

You must evaluate the artifact objectively.

You must not:

* Redesign the user experience.
* Add flows, screens, or features.
* Remove flows or screens based only on personal preference.
* Make product or design decisions for the team.
* Modify the requirements or the sprint plan.
* Invent user behavior.
* Invent business rules.
* Convert assumptions into facts.
* Rewrite the UX specification automatically.

---

# 4. Core Validation Principle

The central question is:

> **Does `UX_SPEC.md` define complete, coherent user flows that cover every MVP functionality, based on the validated requirements and sprint plan, without introducing unsupported functionality or prematurely specifying visual or technical design?**

The validation must evaluate:

```text
Requirements + Sprint Plan
        ↓
UX Specification
        ↓
Readiness for Design and Implementation
```

The UX specification should represent a legitimate refinement of the requirements, not a replacement of them.

---

# 5. Validation Process

## Step 1 — Validate Upstream Dependency

Review:

* The Requirements artifact(s).
* The Sprint Plan artifact(s).
* Their validation reports.

Determine:

* Upstream status.
* Existing warnings.
* Existing assumptions.
* Existing open questions.
* The MVP scope.
* The sprint allocation of requirements.

Identify which of these should have been carried into P04.

If the MVP scope cannot be determined from the upstream artifacts, the validation is `BLOCKED`.

---

## Step 2 — Establish the Coverage Baseline Independently

Before reading the UX specification's own classification and coverage tables, build your own baseline:

* List every MVP requirement.
* Classify each one by UX relevance (see Section 7).
* Determine which ones the UX specification must cover.

Do not use the UX specification's classification as the baseline. Compare against it afterward.

---

## Step 3 — Validate Structure

Verify that all required sections exist and follow the expected structure.

---

## Step 4 — Validate Coverage

Apply Section 8. This is the most important validation.

---

## Step 5 — Validate Flows, Screens, and Navigation

Apply Sections 9 to 13.

---

## Step 6 — Validate Scope, Sprint Alignment, and Prematurity

Apply Sections 14 to 17.

---

## Step 7 — Audit Assumptions, Questions, Risks, and Traceability

Apply Sections 18 to 21.

---

## Step 8 — Decide

Apply Sections 22 to 24 and produce the report.

---

# 6. Structural Validation

Verify that `UX_SPEC.md` contains:

```text
1. Document Metadata
2. UX Scope and Objectives
3. Requirement UX Classification
4. User Roles and Goals
5. Information Architecture
6. User Flows
7. Screen Specifications
8. Interaction and Feedback Rules
9. UX Principles
10. Sprint Alignment
11. Flow Coverage Matrix
12. UX Assumptions
13. Open UX Questions
14. UX Risks
15. Scope Summary
16. Traceability Summary
17. UX Specification Status
```

Verify that:

* Each flow follows the required flow structure (ID, name, role, goal, entry point, preconditions, covered requirements, sprint availability, main path table, alternative paths, exception paths, outcome, postconditions).
* Each screen follows the required screen structure (ID, name, purpose, roles, entry points, exits, information displayed, actions, inputs, states, supported requirements, used in flows, sprint availability).
* Identifiers are unique and stable.

A missing section or structure element is a finding.

---

# 7. Requirement Classification Validation

Compare the UX specification's classification with your baseline.

For every requirement, verify the classification:

```text
USER_FACING
UX_SUPPORTING
UX_CONSTRAINT
NOT_UX_RELEVANT
```

Classify each as:

```text
CORRECT
INCORRECT
UNSUPPORTED_JUSTIFICATION
MISSING
```

Pay particular attention to:

* User-facing requirements classified as `NOT_UX_RELEVANT` to avoid designing a flow.
* Requirements missing from the classification table.
* MVP status that differs from the Requirements artifact.
* Non-functional requirements that constrain the experience and were ignored.

A requirement may only be `NOT_UX_RELEVANT` when it has no observable effect on the user. A justification of "difficult to represent" is not valid.

---

# 8. Flow Coverage Validation

This is the **gate for this stage**.

The condition to advance is:

```text
The flows cover the MVP functionalities.
```

## 8.1 Coverage Test

For every MVP requirement classified as `USER_FACING` or `UX_SUPPORTING` (according to the validator's baseline), verify:

### Existence

Does at least one flow cover it?

### Completeness

Does the flow provide a path from the user's goal to the outcome described by the requirement?

### Behavior Fidelity

Does the flow reflect the behavior, business rules, and acceptance criteria stated in the requirement?

### Accessibility of the Flow

Is the flow reachable by the role that the requirement concerns?

### Consistency

Do the Flow Coverage Matrix, the flow catalog, and the flow specifications agree about this requirement?

---

## 8.2 Coverage Classification

Classify each MVP requirement as:

```text
COVERED
PARTIALLY_COVERED
NOT_COVERED
NOT_UX_RELEVANT
```

Then compare with the UX specification's matrix:

```text
MATRIX_CORRECT
MATRIX_OVERSTATED
MATRIX_UNDERSTATED
MATRIX_MISSING
```

* `MATRIX_OVERSTATED`: the specification claims `COVERED` but the flow is incomplete or absent.
* `MATRIX_UNDERSTATED`: the specification reports a gap that does not actually exist.
* `MATRIX_MISSING`: the requirement does not appear in the matrix.

---

## 8.3 UX Constraints

For every `UX_CONSTRAINT` requirement (for example, responsiveness, accessibility, or language), verify that the specification describes how it is respected or registers why it cannot yet be.

---

## 8.4 Coverage Result

Summarize:

* Number of MVP requirements by baseline classification.
* Number covered, partially covered, and not covered.
* Overstated and missing entries.

Coverage is considered **satisfied** only if:

* Every MVP `USER_FACING` and `UX_SUPPORTING` requirement is `COVERED`; or
* Gaps are explicitly reported, justified, and registered as open questions or `REQUIRES_DECISION`, and they do not prevent the core MVP experience.

Unreported gaps (`MATRIX_OVERSTATED` or `MATRIX_MISSING`) make coverage **not satisfied**.

---

# 9. User Role Validation

Verify:

* Every role in the specification exists in the requirements.
* Every role in the requirements that interacts with MVP functionality exists in the specification.
* Access differences between roles match the requirements.

For every role, classify:

```text
SUPPORTED
REASONABLE_REFINEMENT
UNSUPPORTED_ADDITION
CONTRADICTORY
MISSING
```

Pay particular attention to newly introduced:

* Administrators.
* Moderators.
* Guests or anonymous users.
* Other actors not present in the requirements.

Do not assume that a role is justified simply because it is common in similar applications.

---

# 10. Information Architecture and Navigation Validation

Verify:

* Every screen is required by a requirement or flow.
* Every screen is reachable from at least one flow or from the navigation structure.
* Every navigation path leads to an existing screen.
* Access by role is consistent between the screen inventory, the access table, the screen specifications, and the flows.
* There are no orphan screens, dead ends, or circular navigation without exit.
* There is a way for users to return, cancel, or leave a flow when applicable.

Classify screens as:

```text
SUPPORTED
SUPPORTED_WITH_ASSUMPTION
UNSUPPORTED
ORPHAN
```

Flag screens that exist only because they are common in similar products.

---

# 11. User Flow Validation

For every flow, verify:

### Structure

All required elements are present.

### Entry and Goal

The flow starts from a legitimate user goal and entry point.

### Main Path

The steps are sequential, complete, and lead to the outcome.

### Step Integrity

Every step references an existing screen. Every `Next` reference points to an existing step, screen, or outcome.

### Alternative and Exception Paths

Relevant paths are present and derived from the requirements, business rules, or acceptance criteria.

### Outcome

The flow ends in a defined state, and the next destination is defined.

### Role Consistency

The role performing the flow is allowed to access every screen in the flow.

### Traceability

The covered requirements are cited and the flow actually implements their behavior.

### Diagram Consistency

If diagrams are included, they agree with the step tables.

Classify each flow as:

```text
SUPPORTED
SUPPORTED_WITH_ASSUMPTION
UNSUPPORTED
CONTRADICTORY
INCOMPLETE
```

Flag flows that:

* Contain steps unsupported by the requirements.
* Skip steps required by business rules.
* End in undefined states.
* Cover requirements not listed in the flow.
* Introduce functionality not present in the requirements.

The validator must not require visual detail, UI components, or technical implementation in flows.

---

# 12. Screen Specification Validation

For every screen, verify:

* Purpose is consistent with the requirements it supports.
* Information displayed is supported by the requirements or business rules.
* Available actions correspond to flows.
* User inputs correspond to information required by requirements or business rules.
* States (loading, empty, error, success) are defined where relevant.
* Role access matches Section 10 and the access table.
* The requirements and flows it cites actually use it.

Flag:

* Inputs that no requirement justifies.
* Actions that no flow uses.
* Information displayed that implies unspecified data.
* Screens that describe appearance instead of content and behavior.

---

# 13. Interaction and Feedback Rule Validation

Verify that interaction rules:

* Are consistent with requirements, business rules, and acceptance criteria.
* Are labeled as `UX_PRINCIPLE` or `ASSUMPTION` when they are conventions, not requirements.
* Do not contradict each other or any flow.
* Define message intent rather than final text, unless the requirements specify the text.
* Do not introduce unsupported validation rules or business rules.

Classify each rule as:

```text
SUPPORTED
SUPPORTED_WITH_ASSUMPTION
UNSUPPORTED
CONTRADICTORY
```

---

# 14. Scope Creep Detection

Look for functionality added during P04 that is not present in the requirements.

Examples:

* Password recovery.
* Registration flows when only authentication is required.
* Search, filtering, or sorting.
* Notifications.
* Profile or settings management.
* Onboarding tours.
* Administration screens.
* Analytics dashboards.
* Social or sharing features.
* Multi-language support.

These features are not automatically invalid.

However, if they are not present in the requirements, the UX specification must not silently treat them as confirmed MVP functionality.

Classify them as:

* `NEW_UX_PROPOSAL`: identified as a proposal requiring a decision (acceptable if labeled and excluded from MVP flows).
* `ASSUMPTION`: explicitly labeled assumption.
* `REQUIRES_DECISION`: registered decision.
* `SCOPE_EXPANSION`: included in MVP flows without support (finding).

Do not penalize **UX supporting elements** that do not introduce new capabilities, such as empty states, loading states, error states, confirmations, and basic navigation, provided they are derived from the requirements or labeled.

---

# 15. Sprint Alignment Validation

Compare the Sprint Alignment section with the Sprint Plan.

Verify:

* Every flow and screen has a sprint availability consistent with the sprint allocation of the requirements it depends on.
* A flow does not depend on screens or capabilities planned in a later sprint, or the dependency is registered.
* Partially delivered flows leave users in a coherent state.
* The specification does not move requirements between sprints.
* The specification does not propose a different sprint order.
* Contradictions between the Requirements and the Sprint Plan are reported, not silently resolved.
* Requirements missing from the Sprint Plan are reported.

Classify each alignment entry as:

```text
ALIGNED
ALIGNED_WITH_RISK
MISALIGNED
UNKNOWN
```

A flow that cannot deliver a coherent experience in its first sprint and has no registered risk is a finding.

The validator must not re-plan sprints.

---

# 16. UX Principle Validation

Verify that UX principles:

* Support the experience of the identified roles.
* Are relevant to the project.
* Are derived from requirements or labeled as assumptions.
* Do not become hidden requirements.
* Do not introduce technical or visual constraints.

For example:

> "Provide feedback for every user action."

is a UX principle.

> "Use a modal dialog with a blue confirmation button."

is not a UX principle.

---

# 17. Premature Specification Check

Detect whether the UX specification contains content that belongs to other stages.

Flag detailed:

* Visual design (colors, typography, spacing, icons, animations).
* High-fidelity wireframes or mockups.
* UI component library or framework decisions.
* Frontend implementation details.
* Architecture decisions.
* API contracts.
* Database schemas.
* Code.
* New requirements, user stories, or acceptance criteria.
* Test cases.

The UX specification may describe the content and behavior of a screen at a functional level.

It should not specify how the software renders or implements it.

---

# 18. Assumption Validation

Compare UX assumptions with the assumptions in the Requirements and the Sprint Plan.

For every assumption:

* Check whether it was already identified upstream.
* Determine whether it is a legitimate refinement.
* Verify that it remains explicitly labeled.

Flag cases where:

```text
Upstream ASSUMPTION or UNKNOWN
        ↓
UX FACT
```

without evidence or an explicit project decision.

---

# 19. Open Question Validation

Verify that important unresolved questions from the Requirements and the Sprint Plan that affect UX have been:

* Carried forward.
* Resolved with explicit evidence.
* Reclassified appropriately.

An open question must not disappear simply because it is inconvenient.

For example:

```text
Requirements:
"How are users notified of a rejected request?"
```

should not silently become:

```text
UX_SPEC:
"The system shows a notification banner."
```

unless that decision was actually made.

---

# 20. Risk Validation

Verify that UX-relevant risks from upstream remain visible, and that new UX risks are identified where evident (for example, flows split across sprints, complex flows, or unresolved role permissions).

Check that the specification does not:

* Hide uncertainty.
* Present risky assumptions as established facts.
* Ignore sprint-related risks that affect flow coherence.

Do not require every upstream risk to appear in P04. Only UX-relevant risks need to be carried forward.

---

# 21. Traceability Audit

Perform a traceability audit for the main UX elements.

| UX Element | Expected Source |
| --- | --- |
| Roles | Requirements (users and permissions) |
| Screens | Requirements and flows |
| Flows | Requirements (functional requirements, business rules, acceptance criteria) |
| Alternative/exception paths | Business rules, acceptance criteria, validation rules |
| Interaction rules | Requirements, business rules, or labeled principles |
| Screen inputs and displayed information | Requirements and business rules |
| Sprint alignment | Sprint Plan |
| UX constraints | Non-functional requirements |
| Assumptions | Upstream assumptions |
| Questions | Upstream unknowns and open questions |
| Risks | Upstream risks |

Each element should be classified as:

```text
DIRECT
```

Directly supported by the upstream artifacts.

```text
REFINED
```

A reasonable refinement of the upstream artifacts.

```text
ASSUMED
```

A new assumption explicitly labeled.

```text
UNSUPPORTED
```

Not supported by the upstream artifacts.

```text
CONTRADICTORY
```

Conflicts with the upstream artifacts.

---

# 22. Traceability Rule

Not every sentence needs a source identifier.

However, all major UX decisions must be explainable through:

* A requirement.
* A business rule or acceptance criterion.
* A documented assumption.
* An explicit project decision.

If a major decision cannot be traced to one of these, flag it.

Verify that source identifiers match the identifiers used in the Requirements artifact exactly, and that no source identifier was invented.

---

# 23. Severity Levels

Use:

### CRITICAL

The UX specification cannot safely become the basis for the next stages.

Examples:

* A significant part of the MVP is not covered and the gap is not reported.
* The specification describes a different product from the requirements.
* The user roles are fundamentally different from the requirements.
* Major unsupported functionality is introduced in the MVP flows.

### HIGH

A significant issue requires correction before proceeding.

Examples:

* An MVP user-facing requirement is not covered, or the coverage is overstated.
* A flow is incomplete, ends in an undefined state, or references nonexistent screens.
* Orphan screens or unreachable functionality exist.
* An unsupported role or screen is included in the MVP flows.
* Major assumptions are presented as facts.
* The specification contradicts the Sprint Plan or silently resolves a contradiction.
* The Flow Coverage Matrix is missing or does not match the flows.

### MEDIUM

The artifact is usable but requires clarification.

Examples:

* Some alternative or exception paths are missing.
* Some screens lack defined states.
* Some interaction rules are unlabeled conventions.
* Some open questions are missing.
* Weak traceability for some elements.
* Sprint alignment entries are incomplete.

### LOW

Minor quality issue.

Examples:

* Wording inconsistencies.
* Minor duplication.
* Small traceability gaps.
* Formatting issues.

---

# 24. Validation Decision

Return exactly one overall result:

### PASS

The UX specification satisfies the P04 contract.

### PASS_WITH_WARNINGS

The UX specification is sufficiently reliable to proceed, but non-blocking issues remain.

### FAIL

The UX specification requires correction before proceeding.

### BLOCKED

Validation cannot be reliably completed because essential upstream information is unavailable or contradictory.

---

# 25. Decision Rules

Use:

```text
IF the MVP scope cannot be determined
    → BLOCKED

ELSE IF critical issue exists
    → FAIL

ELSE IF flow coverage is not satisfied
    → FAIL

ELSE IF any high-severity issue exists
    → FAIL

ELSE IF the specification is usable but has non-blocking issues
    → PASS_WITH_WARNINGS

ELSE
    → PASS
```

The condition to advance is:

```text
The flows cover the MVP functionalities.
```

Interpretation:

* A reported and justified gap does not by itself cause `FAIL`, provided it does not prevent the core MVP experience and is registered as an open question or `REQUIRES_DECISION`.
* An unreported gap, an overstated coverage claim, or an incomplete flow **does** cause `FAIL`.

Do not approve an artifact simply because it is well written.

Content correctness, coverage, and traceability are more important than presentation quality.

---

# 26. Required Validation Report

Generate:

```text
artifacts/04_ux_design/UX_SPEC_VALIDATION.md
```

Use this structure:

```markdown
# P04 UX Specification Validation Report

## 1. Validation Metadata

- Validator: P04 UX Validator
- Project:
- UX Specification Version:
- Validation Date:
- Requirements Validation Status:
- Sprint Plan Validation Status:
- Overall Result:

## 2. Executive Summary

Short explanation of the validation result.

## 3. Structural Validation

| Section | Present | Valid | Notes |
|---|---|---|---|
| Document Metadata | | | |
| UX Scope and Objectives | | | |
| Requirement UX Classification | | | |
| User Roles and Goals | | | |
| Information Architecture | | | |
| User Flows | | | |
| Screen Specifications | | | |
| Interaction and Feedback Rules | | | |
| UX Principles | | | |
| Sprint Alignment | | | |
| Flow Coverage Matrix | | | |
| UX Assumptions | | | |
| Open UX Questions | | | |
| UX Risks | | | |
| Scope Summary | | | |
| Traceability Summary | | | |
| UX Specification Status | | | |

## 4. Findings

| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| VAL-001 | | | | | |

## 5. Requirement Classification Validation

| Requirement | MVP | Specification Classification | Validator Classification | Result |
|---|---|---|---|---|

## 6. Flow Coverage Validation (Gate)

### 6.1 Coverage Baseline

Summary of MVP requirements by validator classification.

### 6.2 Coverage Audit

| Requirement | MVP | Validator Coverage | Specification Coverage | Flow(s) | Matrix Result | Notes |
|---|---|---|---|---|---|---|

### 6.3 UX Constraint Audit

| Constraint | Source | How Respected | Result |
|---|---|---|---|

### 6.4 Coverage Result

- MVP requirements requiring coverage:
- Covered:
- Partially covered:
- Not covered:
- Overstated entries:
- Missing entries:
- **Coverage satisfied:** YES / NO

## 7. User Role Validation

| Role | Requirements Source | UX Representation | Classification | Result |
|---|---|---|---|---|

## 8. Information Architecture and Navigation Audit

| Screen | Source | Reachable | Role Consistency | Classification | Result |
|---|---|---|---|---|---|

## 9. User Flow Validation

| Flow | Role | Covered Requirements | Structure | Step Integrity | Outcome Defined | Classification | Result |
|---|---|---|---|---|---|---|---|

## 10. Screen Specification Validation

| Screen | Purpose Supported | Inputs Supported | States Defined | Flows Consistent | Result |
|---|---|---|---|---|---|

## 11. Interaction Rule Validation

| Rule | Basis | Classification | Result |
|---|---|---|---|

## 12. Scope Creep Audit

List functionality introduced without sufficient support.

If none:

> No relevant scope expansion detected.

## 13. Sprint Alignment Audit

| Flow / Screen | Specification Sprint | Sprint Plan Evidence | Classification | Result |
|---|---|---|---|---|

Include contradictions between the Requirements and the Sprint Plan.

## 14. UX Principle Validation

Evaluate whether the principles are relevant and do not act as hidden requirements.

## 15. Assumption Audit

| ID | Assumption | Upstream Status | UX Status | Result |
|---|---|---|---|---|

## 16. Open Question Audit

| Upstream Question | UX Status | Result |
|---|---|---|

## 17. UX Risk Audit

Identify important risks that were:
- Preserved.
- Resolved.
- Lost.
- Newly introduced.

## 18. Premature Specification Audit

Check for:
- Visual design.
- High-fidelity wireframes.
- UI component or framework decisions.
- Frontend implementation.
- Architecture.
- API/database design.
- New requirements, user stories, or acceptance criteria.

## 19. Traceability Audit

| UX Element | Expected Source | Classification | Result |
|---|---|---|---|

## 20. Recommended Corrections

List only necessary or strongly recommended corrections.

Do not redesign the experience.

## 21. Downstream Readiness

Evaluate whether the UX specification provides enough clarity for the next stages.

Result:

- READY
- READY_WITH_ASSUMPTIONS
- NOT_READY

## 22. Final Decision

**Result:** PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED

**Flows cover MVP functionalities:** YES / NO / PARTIAL

### Conditions to Proceed

### Conditions to Revalidate

## 23. Validator Integrity Statement

Confirm:

- No UX decisions were invented.
- No unsupported flows or screens were accepted.
- No source artifact was modified.
- No requirement or sprint allocation was changed.
- No technical or visual design was introduced during validation.
- Findings are evidence-based.
```

---

# 27. Validator Behavior

## Rule 1 — Do Not Modify the UX Specification

Never silently modify:

```text
artifacts/04_ux_design/UX_SPEC.md
```

The validator produces a separate report.

---

## Rule 2 — Do Not Solve Findings

If a problem is found:

> Identify the problem.

Do not automatically rewrite the UX specification or design the missing flow.

---

## Rule 3 — Independent Verification

Do not accept the specification's own classification and coverage claims without confirming them against the requirements.

---

## Rule 4 — Preserve Uncertainty

If the correct classification is unknown:

> UNKNOWN

If the project team must decide:

> REQUIRES_DECISION

Do not guess.

---

## Rule 5 — Do Not Penalize Reasonable Refinement

P04 is expected to provide more structure than the requirements.

Not every new sentence represents scope creep.

A refinement is valid when it:

* Makes an implicit relationship explicit.
* Organizes existing requirements into flows.
* Defines supporting states and feedback derived from the requirements.
* Clarifies how a requirement is experienced by a role.

---

## Rule 6 — Do Not Reward Quantity

A UX specification is not better because it contains more screens or flows.

Prefer:

```text
Complete flows
+
Full MVP coverage
+
Coherent navigation
+
Honest assumptions
```

over:

```text
Many screens and flows
```

---

## Rule 7 — Separate UX Gaps from Requirement Gaps

If a flow cannot be completed because the requirements are incomplete or ambiguous, the finding concerns the upstream stage.

Record it as a dependency issue.

It is acceptable for the UX specification to expose such a gap, provided it reports the gap instead of inventing functionality.

---

# 28. Handling New UX Ideas

If P04 introduces a potentially useful capability not present in the requirements:

Do not automatically reject it.

Classify it as:

```text
NEW_UX_PROPOSAL
```

and determine whether the specification clearly indicates that it requires team validation and excludes it from MVP flows.

If the new capability is already included as a confirmed MVP flow or screen without justification, flag it as a scope traceability issue.

---

# 29. Handling Conflicting Decisions

If the Requirements, the Sprint Plan, and the UX specification contain conflicting decisions:

1. Identify each statement.
2. Cite the respective sections.
3. Explain the conflict.
4. Do not decide which is correct.
5. Require explicit project-team resolution when necessary.

---

# 30. Self-Validation Checklist

Before producing the validation report:

```text
[ ] Requirements were reviewed.
[ ] Sprint Plan was reviewed.
[ ] Upstream validation reports were reviewed.
[ ] UX_SPEC.md was reviewed.
[ ] The MVP scope was determined independently.
[ ] An independent coverage baseline was built.
[ ] Requirement classification was checked.
[ ] Flow coverage was checked for every MVP requirement.
[ ] The Coverage Matrix was compared with the baseline.
[ ] UX constraints were checked.
[ ] User roles were checked.
[ ] Information architecture and navigation were checked.
[ ] Flows were checked for completeness and step integrity.
[ ] Screens were checked.
[ ] Interaction rules were checked.
[ ] Scope expansion was checked.
[ ] Sprint alignment was checked.
[ ] UX principles were checked.
[ ] Assumptions were checked.
[ ] Open questions were checked.
[ ] UX risks were checked.
[ ] Premature specification was checked.
[ ] Traceability was audited.
[ ] Downstream readiness was evaluated.
[ ] Findings received severity levels.
[ ] Final decision was justified.
[ ] Source artifacts were not modified.
[ ] No UX decisions were made by the validator.
```

---

# 31. Stage Transition

If:

```text
PASS
```

the project may proceed to:

```text
P05
```

If:

```text
PASS_WITH_WARNINGS
```

the project may proceed while preserving the documented warnings and assumptions.

If:

```text
FAIL
```

return to P04 and correct the UX specification.

If the cause lies in the Requirements or the Sprint Plan, return to the responsible stage.

If:

```text
BLOCKED
```

resolve the upstream issue before continuing.

The validator must not automatically advance the pipeline.
