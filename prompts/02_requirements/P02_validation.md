# P02 — Requirements Validation

**Version:** 1.0
**Stage:** P02 — Requirements Engineering
**Type:** Validation Prompt
**Previous Stage:** P01 — Product Discovery
**Next Stage:** P03 — Planning

## 1. Purpose

Validate that the P02 requirements artifacts correctly transform the validated Product Vision into a complete, coherent, traceable, and verifiable requirements definition.

The validator must independently evaluate:

* `REQUIREMENTS.md`
* `product_backlog.json`

The validation must determine whether the artifacts are ready to be used by P03 — Planning.

The validator must **not modify the requirements artifacts** or make product decisions on their behalf.

---

## 2. Inputs

Read the following artifacts:

```text
artifacts/02_requirements/REQUIREMENTS.md
artifacts/02_requirements/product_backlog.json

artifacts/01_discovery/PRODUCT_VISION.md
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md

prompts/system/SYSTEM_PROMPT.md
```

### Input roles

* `REQUIREMENTS.md` is the primary human-readable requirements artifact.
* `product_backlog.json` is the structured representation of the product backlog.
* `PRODUCT_VISION.md` is the source for product scope, users, needs, value, and MVP capabilities.
* `PRODUCT_VISION_VALIDATION.md` provides the validation context and unresolved decisions inherited from P01.
* `SYSTEM_PROMPT.md` defines global validation rules.

If an expected input is unavailable, do not reconstruct it from assumptions.

---

## 3. Role

Act as an **Independent Senior Requirements Auditor and Software Quality Analyst**.

Your responsibility is to determine whether the requirements are sufficiently clear, consistent, traceable, verifiable, and ready for the planning stage.

Maintain independence from the generation process.

Do not rewrite, improve, or silently correct the requirements while validating them.

---

## 4. Core Validation Principle

The central question is:

> **Does P02 provide a reliable and traceable definition of what the product must do, without introducing unsupported scope or premature implementation decisions?**

A valid P02 artifact must be:

```text
Complete enough for planning
        +
Clear enough for understanding
        +
Testable enough for verification
        +
Traceable to P01
        +
Consistent across generated artifacts
        +
Free from unjustified technical decisions
```

---

# 5. Validation Framework

## 5.1 Structural Completeness

Verify that `REQUIREMENTS.md` contains the expected sections:

* Document Metadata.
* Requirements Overview.
* Epics.
* Functional Requirements.
* Non-Functional Requirements.
* User Stories.
* Business Rules.
* Edge Cases.
* Dependencies.
* Assumptions and Open Questions.
* Requirements Traceability.
* Requirements Status.

Verify that `product_backlog.json` contains the expected main structures:

* Metadata.
* Epics.
* Backlog items.
* User Story information.
* Acceptance Criteria.
* Traceability.

Flag missing or malformed sections.

---

## 5.2 Functional Requirement Quality

For each `FR-*`, verify that the requirement:

* Has a unique ID.
* Describes a product capability.
* Is understandable without implementation knowledge.
* Is sufficiently atomic.
* Is relevant to the product vision.
* Is testable or objectively verifiable.
* Does not contain unnecessary implementation decisions.

Flag requirements that:

* Combine unrelated capabilities.
* Are vague or ambiguous.
* Cannot reasonably be verified.
* Introduce functionality unsupported by P01.

---

## 5.3 Non-Functional Requirement Quality

For each `NFR-*`, verify that:

* It represents a relevant quality constraint.
* Its category is identifiable.
* It is relevant to the product.
* It is sufficiently clear to be evaluated.
* Any measurable target has a justified basis.

Do not require numerical targets when the project inputs do not provide a justified target.

Flag invented or arbitrary constraints.

---

## 5.4 Epic Validation

Verify that:

* Every Epic has a unique ID.
* Every Epic represents a coherent product area.
* Every Epic is supported by the Product Vision.
* Epics do not introduce unauthorized product scope.
* Requirements and User Stories are correctly associated with Epics.

Flag Epics that exist only because they are common software categories rather than because they are justified by the project.

---

## 5.5 User Story Quality and Atomicity

For every `US-*`, verify:

* Unique ID.
* Associated Epic.
* Associated requirement(s).
* Clear user role.
* Meaningful user goal.
* Clear benefit or purpose.
* Atomic scope.
* Consistency with P01.

User Stories should follow:

> As a [role], I want [goal], so that [benefit].

Flag stories that:

* Combine several independent user goals.
* Describe implementation rather than user value.
* Are too broad to be reasonably planned.
* Introduce unsupported functionality.
* Cannot be traced to a requirement or P01 capability.

Do not reject a story merely because it is larger than expected. Judge granularity according to its actual scope and dependencies.

---

## 5.6 Acceptance Criteria Validation

For every User Story, verify that acceptance criteria are:

* Present.
* Unique.
* Understandable.
* Observable.
* Testable.
* Consistent with the User Story.
* Sufficient to determine whether the story has been satisfied.

When Given / When / Then is used, verify that:

```text
Given → establishes relevant context
When  → describes the triggering action
Then  → describes the expected observable result
```

Verify that relevant cases are represented, including when applicable:

* Happy path.
* Validation behavior.
* Business rules.
* Alternative flows.
* Relevant errors or edge cases.

Do not require irrelevant acceptance criteria merely to satisfy a template.

Do not require technical details such as HTTP status codes, database identifiers, framework behavior, or API implementation unless they are explicitly justified as product requirements.

---

## 5.7 Business Rules

Verify that:

* Business rules have unique IDs.
* They are connected to relevant requirements or stories.
* They describe actual product/business behavior.
* They are supported by P01 or explicitly marked as assumptions/decisions.
* They do not silently introduce new scope.

Flag business rules that appear to have been invented by the generator.

---

## 5.8 Edge Cases

Verify that relevant edge cases have been considered.

The validator should determine whether the identified edge cases are appropriate to the corresponding User Stories.

Do not require an arbitrary number of edge cases.

Flag:

* Important missing cases that could make a requirement ambiguous.
* Edge cases unrelated to the product behavior.
* Technical failure scenarios that belong to later implementation stages rather than requirements.

---

## 5.9 Scope and MVP Audit

Compare the requirements against:

```text
PRODUCT_VISION.md
PRODUCT_VISION_VALIDATION.md
```

Verify that:

* MVP Core capabilities are represented.
* Relevant MVP Supporting capabilities are represented.
* Future functionality has not been silently promoted to MVP.
* Out-of-scope functionality has not been included as active MVP requirements.
* New functionality is explicitly marked as `REQUIRES_DECISION` when necessary.

Classify scope findings as:

```text
DIRECT
REFINED
ASSUMED
UNSUPPORTED
CONTRADICTORY
```

### Important

Reasonable refinement of P01 is expected.

Do not classify a requirement as scope creep merely because P02 makes an existing capability more concrete.

---

## 5.10 Assumptions and Open Questions

Verify that:

* Assumptions are explicitly identified.
* Unknown information is not presented as fact.
* Open questions from P01 are either preserved, resolved with supporting evidence, or carried forward.
* Requirements depending on unresolved decisions are clearly marked.
* No important product decision has been silently invented.

Flag any requirement that depends on information not supported by the available inputs.

---

## 5.11 Dependency Validation

Verify that identified dependencies:

* Are relevant.
* Have valid IDs.
* Reference existing requirements or stories.
* Do not hide unresolved product decisions.
* Do not represent architecture decisions prematurely.

---

## 5.12 Traceability Audit

Verify the following chain wherever applicable:

```text
P01 Product Vision
        ↓
Epic
        ↓
FR / NFR
        ↓
User Story
        ↓
Acceptance Criteria
```

Check that:

* Every MVP capability has corresponding requirements.
* Every requirement is associated with an appropriate Epic or product area.
* Every User Story traces to one or more requirements.
* Every User Story has acceptance criteria.
* Acceptance Criteria belong to the correct User Story.
* IDs are unique and consistent.

Identify:

* Missing links.
* Broken links.
* Orphan requirements.
* Orphan User Stories.
* Orphan Acceptance Criteria.
* Unsupported requirements.

---

## 5.13 Cross-Artifact Consistency

Compare `REQUIREMENTS.md` and `product_backlog.json`.

Verify that:

* IDs match.
* Titles match.
* User Stories match.
* Epics match.
* Requirement relationships match.
* Acceptance Criteria match.
* Scope classifications match.
* Traceability information is consistent.
* No item exists in one artifact but not the other without justification.

The JSON must be valid and machine-readable.

If the same requirement has different content in the two artifacts, report it as an inconsistency rather than choosing one version silently.

---

## 5.14 Premature Technical Specification Audit

Check for implementation decisions that do not belong in P02.

Examples include:

* Specific programming languages.
* Frameworks.
* Libraries.
* Database engines.
* Internal API architecture.
* DTO structures.
* Database schema implementation.
* UUID or primary-key strategy.
* JWT implementation details.
* Hashing algorithms.
* Docker/Kubernetes.
* Deployment infrastructure.
* Internal software design patterns.

A requirement may express a product-level need such as:

> The system must authenticate users before granting access to protected functionality.

It should not prematurely prescribe how authentication will be implemented.

Classify unnecessary technical decisions as findings.

---

## 5.15 Planning Boundary Audit

Verify that P02 does not prematurely make decisions that belong to P03.

The following should normally remain undefined at P02:

* Story Points.
* Sprint assignments.
* Release assignments.
* Developer assignments.
* Workload percentages.
* Sprint schedules.

If these fields exist in `product_backlog.json`, verify that they are `null`, empty, or otherwise explicitly undefined.

---

# 6. Severity Levels

Use the following severity levels.

### CRITICAL

A problem prevents reliable progression to planning.

Examples:

* Core MVP capability is missing.
* Major product scope contradiction.
* Requirements are fundamentally disconnected from P01.
* Critical requirements cannot be understood or verified.
* The backlog is unusable or structurally invalid.

### HIGH

A significant issue affects requirements completeness, correctness, or traceability.

Examples:

* Major User Stories lack acceptance criteria.
* Significant scope creep.
* Important requirements are unsupported.
* Broken traceability across multiple items.
* Major inconsistency between `REQUIREMENTS.md` and `product_backlog.json`.

### MEDIUM

A non-blocking issue that should be corrected before or during planning.

Examples:

* Ambiguous User Story.
* Missing relevant edge case.
* Incomplete dependency information.
* Inconsistent metadata.
* Unclear business rule.

### LOW

A minor issue that does not materially affect requirements readiness.

Examples:

* Minor wording ambiguity.
* Formatting inconsistency.
* Non-critical metadata omission.

---

# 7. Validation Decision

Use the following logic:

```text
IF critical issues exist:
    → BLOCKED

ELSE IF high-severity issues prevent reliable planning:
    → FAIL

ELSE IF artifact is usable but has non-blocking findings:
    → PASS_WITH_WARNINGS

ELSE:
    → PASS
```

### PASS

Requirements are sufficiently complete, coherent, traceable, and verifiable for P03.

### PASS_WITH_WARNINGS

Requirements can proceed to P03, but documented non-blocking findings should be tracked.

### FAIL

Requirements require correction before planning.

### BLOCKED

Requirements cannot be reliably validated or progressed because essential information or artifacts are unavailable or unresolved.

---

# 8. Required Validation Report

Generate:

```text
artifacts/02_requirements/REQUIREMENTS_VALIDATION.md
```

Use this structure:

```markdown
# P02 Requirements Validation Report

## 1. Validation Metadata

- Validator:
- Stage:
- Validation Date:
- Requirements Version:
- Backlog Version:
- Overall Result:

## 2. Executive Summary

## 3. Structural Validation

### 3.1 REQUIREMENTS.md
### 3.2 product_backlog.json

## 4. Functional Requirements Audit

| Requirement ID | Clarity | Atomicity | Testability | Traceability | Result |
|---|---|---|---|---|---|

## 5. Non-Functional Requirements Audit

| Requirement ID | Relevance | Clarity | Verifiability | Traceability | Result |
|---|---|---|---|---|---|

## 6. Epic Audit

## 7. User Story Audit

| Story ID | Atomicity | User Value | Requirement Link | Scope | Result |
|---|---|---|---|---|---|

## 8. Acceptance Criteria Audit

| Story ID | Criteria Present | Testable | Relevant Cases Covered | Result |
|---|---|---|---|---|

## 9. Business Rules, Edge Cases and Dependencies

## 10. MVP Scope Audit

## 11. Assumption and Open Question Audit

## 12. Traceability Audit

## 13. Cross-Artifact Consistency

### REQUIREMENTS.md ↔ product_backlog.json

## 14. Premature Technical Specification Audit

## 15. Planning Boundary Audit

## 16. Findings Matrix

| Finding ID | Severity | Category | Description | Evidence | Recommended Correction |
|---|---|---|---|---|---|

## 17. Requirements Readiness for P03

## 18. Final Decision

- Result:
- Conditions to Proceed:
- Required Corrections:

## 19. Auditor Integrity Statement
```

---

# 9. Validator Integrity Rules

The validator must:

* Never modify `REQUIREMENTS.md`.
* Never modify `product_backlog.json`.
* Never silently correct inconsistencies.
* Never invent missing requirements.
* Never make unresolved product decisions.
* Never expand or reduce MVP scope.
* Report evidence for every significant finding.
* Distinguish source-supported facts from assumptions.
* Evaluate the artifacts independently from the generation process.

If a correction is necessary, describe the correction but leave implementation of that correction to the requirements generation process.

---

# 10. Stage Transition

If the result is:

```text
PASS
```

or

```text
PASS_WITH_WARNINGS
```

the Requirements artifacts may proceed to:

```text
P03 — Planning
```

P03 receives:

```text
artifacts/02_requirements/REQUIREMENTS.md
artifacts/02_requirements/product_backlog.json
artifacts/02_requirements/REQUIREMENTS_VALIDATION.md
```

P03 is responsible for planning decisions such as:

* Prioritization.
* Story Point estimation.
* Release planning.
* Sprint organization.
* Team allocation.

If the result is:

```text
FAIL
```

or

```text
BLOCKED
```

P02 must be corrected and validated again before progressing.
