# P01 — Product Discovery Validation

**Version:** 1.0
**Stage:** P01 — Product Discovery
**Type:** Validation Prompt
**Input Artifacts:**

* `artifacts/00_context/PROJECT_CONTEXT.md`
* `artifacts/00_context/CONTEXT_VALIDATION.md`
* `artifacts/01_discovery/PRODUCT_VISION.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
**Related Generation Prompt:** `prompts/01_discovery/P01_product_discovery.md`
**Previous Stage:** P00 — Context Definition
**Next Stage:** P02 — Requirements

---

# 1. Purpose

Validate that `PRODUCT_VISION.md` correctly transforms the validated project context into a coherent, traceable, and appropriately scoped product vision.

The validator must determine whether the Product Vision:

* Faithfully represents the project context.
* Clearly defines the product problem.
* Identifies the relevant users.
* Describes the value provided by the product.
* Defines a coherent core product experience.
* Establishes a realistic MVP boundary.
* Distinguishes MVP functionality from future or undefined functionality.
* Preserves assumptions and uncertainties.
* Maintains traceability to P00.
* Avoids unsupported product decisions.
* Does not prematurely introduce detailed requirements or technical design.

This is a **validation prompt**, not a product redesign prompt.

---

# 2. Inputs

## 2.1 Project Context

Read:

```text id="0ndx51"
artifacts/00_context/PROJECT_CONTEXT.md
```

This is the primary source for validating whether the Product Vision is grounded in the established project context.

---

## 2.2 Context Validation

Read:

```text id="xks0u4"
artifacts/00_context/CONTEXT_VALIDATION.md
```

Use this artifact to understand:

* Previously identified issues.
* Accepted assumptions.
* Open questions.
* Scope warnings.
* P00 validation status.

Do not ignore unresolved P00 findings that affect Product Discovery.

---

## 2.3 Product Vision

Read:

```text id="z9iq11"
artifacts/01_discovery/PRODUCT_VISION.md
```

This is the artifact being validated.

---

## 2.4 Global System Prompt

Read:

```text id="4q7kn9"
prompts/system/SYSTEM_PROMPT.md
```

Use it to verify compliance with the global pipeline principles.

---

# 3. Role

Act as a:

> Senior Product Discovery Auditor and Requirements Readiness Analyst.

Your responsibility is to determine whether the Product Vision is sufficiently reliable to become the input for Requirements Engineering.

You must evaluate the artifact objectively.

You must not:

* Redesign the product.
* Add features.
* Remove features based only on personal preference.
* Make product decisions for the team.
* Invent market information.
* Invent user behavior.
* Invent business rules.
* Convert assumptions into facts.
* Rewrite the Product Vision automatically.

---

# 4. Core Validation Principle

The central question is:

> **Does `PRODUCT_VISION.md` define a coherent product and MVP based on the validated P00 context, without introducing unsupported decisions or prematurely specifying the software?**

The validation must evaluate:

```text
P00 Project Context
        ↓
Product Vision
        ↓
P02 Requirements Readiness
```

The Product Vision should represent a legitimate refinement of P00, not a replacement of it.

---

# 5. Validation Process

## Step 1 — Validate P00 Dependency

Review:

* `PROJECT_CONTEXT.md`
* `CONTEXT_VALIDATION.md`

Determine:

* P00 status.
* Existing warnings.
* Existing assumptions.
* Existing open questions.
* Existing MVP candidates.
* Existing risks.

Identify which of these should have been carried into P01.

---

## Step 2 — Validate Product Problem

Check whether the Product Vision:

* Clearly identifies the core problem.
* Identifies who experiences it.
* Explains the relevant context.
* Describes the consequence or importance of the problem.
* Remains consistent with P00.

Flag any problem statement that:

* Was not supported by P00.
* Changes the original problem substantially.
* Introduces unsupported market claims.
* Replaces the problem with a solution description.

---

# 6. User Validation

Verify:

* Primary user.
* Secondary users.
* User relationships.
* User needs.

Compare them against P00.

For every important user group, determine whether it is:

* Supported by P00.
* A reasonable refinement.
* An unsupported addition.
* Contradictory.

Pay particular attention to newly introduced:

* Administrators.
* Moderators.
* Business owners.
* Partners.
* Service providers.
* Other actors.

Do not assume that a role is justified simply because it is common in marketplace applications.

---

# 7. User Need Validation

Verify that each identified user need:

* Relates directly to the problem.
* Is supported by P00.
* Is appropriate for Product Discovery.
* Has not been transformed into an unsupported feature.

Distinguish:

```text
User Need
```

from:

```text
Functional Requirement
```

Example:

> "The user needs to find an appropriate veterinary service."

is a user need.

> "The system shall filter veterinarians using a 10 km radius."

is a detailed requirement and should not be introduced at this stage unless already established.

---

# 8. JTBD Validation

For every JTBD, verify:

* User is supported.
* Situation is plausible and grounded.
* Motivation corresponds to a documented need.
* Expected outcome corresponds to the product value.
* Source is traceable to P00.

Flag JTBDs that introduce unsupported behavior.

Do not require a specific number of JTBDs.

Quality is more important than quantity.

---

# 9. Value Proposition Validation

Verify that the value proposition:

* Directly addresses the core problem.
* Provides value to the identified users.
* Is consistent with the proposed product.
* Does not contain unsupported competitive claims.

Flag claims such as:

* "Best."
* "Cheapest."
* "Fastest."
* "Most reliable."
* "Guaranteed."
* "Revolutionary."

unless supported by evidence.

The Product Vision should explain value, not market superiority.

---

# 10. Core Product Experience Validation

Verify that the core journey:

* Starts with a legitimate user need.
* Contains the necessary high-level interactions.
* Leads to the expected outcome.
* Supports the value proposition.
* Is consistent with the MVP.

Check that the journey does not introduce unsupported steps.

The validator must not require detailed:

* Screens.
* UI components.
* API calls.
* Database operations.
* Technical implementation.

Those belong to later stages.

---

# 11. MVP Validation

This is one of the most important checks.

For every MVP capability, evaluate:

### Necessity

Is it necessary for the core product value?

### Traceability

Can it be traced to P00?

### Coherence

Does it support the core user journey?

### Scope

Is it reasonable for an MVP?

### Dependency

Does it depend on undefined capabilities that could make the MVP infeasible?

Classify each MVP capability as:

```text
SUPPORTED
SUPPORTED_WITH_ASSUMPTION
UNSUPPORTED
CONTRADICTORY
```

---

# 12. MVP Scope Creep Detection

Look for functionality added during P01 that was not present in P00.

Examples:

* Payment systems.
* Reviews.
* Messaging.
* Notifications.
* Advanced recommendation engines.
* Loyalty systems.
* Complex administration.
* AI personalization.
* Multiple external integrations.
* Advanced analytics.

These features are not automatically invalid.

However, if they were not present in P00, the Product Vision must not silently treat them as confirmed MVP functionality.

Classify them as:

* New proposal.
* Assumption.
* Requires Decision.
* Scope expansion.

---

# 13. Future and Undefined Scope Validation

Verify that the artifact distinguishes:

### MVP

What is currently intended to be built.

### Future

Potential functionality intentionally deferred.

### Undefined / Requires Decision

Functionality or decisions that have not yet been resolved.

### Out of Scope

Functionality explicitly excluded.

Do not treat an undefined feature as Out of Scope unless the project context supports that decision.

---

# 14. Product Principle Validation

Verify that product principles:

* Support the product vision.
* Are relevant.
* Do not become hidden requirements.
* Do not introduce unsupported constraints.

For example:

> "The product should prioritize simplicity."

is a product principle.

> "The application must use React."

is not a product principle.

---

# 15. Success Criteria Validation

Verify that success criteria:

* Reflect the intended product value.
* Are observable.
* Relate to the core user journey.
* Do not claim that success has already been achieved.
* Do not introduce unsupported business metrics.

Detailed acceptance criteria belong to P02.

Flag criteria that are actually:

* Technical requirements.
* Implementation requirements.
* Unsupported business KPIs.

---

# 16. Assumption Validation

Compare P01 assumptions with P00 assumptions.

For every assumption:

* Check whether it was already identified.
* Determine whether it is a legitimate refinement.
* Verify that it remains explicitly labeled.

Flag cases where:

```text
P00 ASSUMPTION
        ↓
P01 FACT
```

without evidence or explicit project decision.

---

# 17. Open Question Validation

Verify that important unresolved product questions from P00 have been:

* Carried forward.
* Resolved with explicit evidence.
* Reclassified appropriately.

An open question must not disappear simply because it is inconvenient.

For example:

```text
P00:
"How will provider availability be managed?"
```

should not become silently:

```text
P01:
"Providers define available time slots."
```

unless that decision was actually made.

---

# 18. Risk Validation

Verify that major product risks identified in P00 remain visible when relevant.

Check that P01 does not:

* Ignore important scope risks.
* Hide uncertainty.
* Present risky assumptions as established facts.

Do not require every P00 technical risk to appear in P01.

Only product-relevant risks need to be carried forward.

---

# 19. Premature Specification Check

Detect whether P01 contains content that belongs primarily to P02 or later stages.

Flag detailed:

* Functional requirements.
* Non-functional requirements.
* User stories.
* Acceptance criteria.
* API contracts.
* Database schemas.
* Architecture decisions.
* Technology stack decisions.
* Detailed UI specifications.
* Deployment decisions.

The Product Vision may mention a capability at a high level.

It should not specify how the software implements it.

---

# 20. Traceability Audit

Perform a traceability audit for the main Product Vision elements.

Use the following categories:

| Product Element | Expected Source                 |
| --------------- | ------------------------------- |
| Problem         | P00 Problem                     |
| Users           | P00 Target Users                |
| Needs           | P00 Problem / Users             |
| JTBD            | P00 Problem / Users             |
| Value           | P00 Problem / Proposed Solution |
| Core Journey    | P00 Proposed Solution / Scope   |
| MVP             | P00 Initial Scope               |
| Assumptions     | P00 Assumptions                 |
| Questions       | P00 Unknowns / Open Questions   |
| Risks           | P00 Risks                       |

Each element should be classified as:

```text
DIRECT
```

Directly supported by P00.

```text
REFINED
```

A reasonable refinement of P00.

```text
ASSUMED
```

A new assumption explicitly labeled.

```text
UNSUPPORTED
```

Not supported by P00.

```text
CONTRADICTORY
```

Conflicts with P00.

---

# 21. Traceability Rule

A Product Vision does not need every sentence to have a source identifier.

However, all major product decisions must be explainable through P00.

If a major decision cannot be traced to:

* A P00 statement.
* A documented assumption.
* An explicit project decision.

flag it.

---

# 22. Severity Levels

Use:

### CRITICAL

The Product Vision cannot safely become the basis for Requirements.

Examples:

* Core problem is changed.
* Primary users are fundamentally different from P00.
* MVP is unrelated to the core problem.
* Major unsupported product direction is introduced.

### HIGH

A significant issue requires correction before P02.

Examples:

* Major MVP functionality has no traceability.
* Important user needs are missing.
* Major assumptions became facts.
* Product value is unclear.

### MEDIUM

The artifact is usable but requires clarification.

Examples:

* Some JTBDs have weak traceability.
* Some open questions are missing.
* Some scope classifications are ambiguous.

### LOW

Minor quality issue.

Examples:

* Wording inconsistencies.
* Minor duplication.
* Small traceability gaps.

---

# 23. Validation Decision

Return exactly one overall result:

### PASS

Product Vision satisfies the P01 contract.

### PASS_WITH_WARNINGS

Product Vision is sufficiently reliable to proceed, but non-blocking issues remain.

### FAIL

Product Vision requires correction before proceeding to P02.

### BLOCKED

Validation cannot be reliably completed because essential upstream information is unavailable or contradictory.

---

# 24. Decision Rules

Use:

```text id="crr9yt"
IF critical issue exists
    → FAIL or BLOCKED

ELSE IF high-severity issue affects requirements readiness
    → FAIL

ELSE IF product vision is usable but has non-blocking issues
    → PASS_WITH_WARNINGS

ELSE
    → PASS
```

Do not approve an artifact simply because it is well written.

Content correctness and traceability are more important than presentation quality.

---

# 25. Required Validation Report

Generate:

```text id="k4d5as"
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
```

Use this structure:

```markdown id="d3j0y2"
# P01 Product Vision Validation Report

## 1. Validation Metadata

- Validator: P01 Product Discovery Validator
- Project:
- Product Vision Version:
- Validation Date:
- P00 Validation Status:
- Overall Result:

## 2. Executive Summary

Short explanation of the validation result.

## 3. Structural Validation

| Section | Present | Valid | Notes |
|---|---|---|---|
| Document Metadata | | | |
| Product Vision Statement | | | |
| Problem Definition | | | |
| Target Users | | | |
| Jobs To Be Done | | | |
| Value Proposition | | | |
| Core Product Experience | | | |
| MVP Definition | | | |
| Product Principles | | | |
| Success Criteria | | | |
| Product Assumptions | | | |
| Open Product Questions | | | |
| Product Risks | | | |
| Scope Summary | | | |
| Traceability Summary | | | |
| Product Vision Status | | | |

## 4. Findings

| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| VAL-001 | | | | | |

## 5. Problem Validation

### P00 Problem

### P01 Problem

### Consistency

### Findings

## 6. User Validation

| User | P00 Source | P01 Representation | Classification | Result |
|---|---|---|---|---|

## 7. User Need Validation

| Need | Source | Classification | Result |
|---|---|---|---|

## 8. JTBD Validation

| JTBD | User | Source | Classification | Result |
|---|---|---|---|---|

## 9. Value Proposition Validation

Evaluate consistency between:
- Problem
- User needs
- Product value
- Proposed solution

## 10. Core Journey Validation

Evaluate:
- Starting need.
- Main interactions.
- Expected outcome.
- MVP consistency.

## 11. MVP Scope Audit

| Capability | Source | Classification | Necessary for Core Value? | Result |
|---|---|---|---|---|

## 12. Scope Creep Audit

List functionality introduced without sufficient support.

If none:

> No relevant scope expansion detected.

## 13. Assumption Audit

| ID | Assumption | P00 Status | P01 Status | Result |
|---|---|---|---|---|

## 14. Open Question Audit

| P00 Question | P01 Status | Result |
|---|---|---|

## 15. Product Risk Audit

Identify important risks that were:
- Preserved.
- Resolved.
- Lost.
- Newly introduced.

## 16. Premature Specification Audit

Check for:
- Requirements.
- User stories.
- Acceptance criteria.
- Architecture.
- Technology decisions.
- API/database design.
- Detailed UI specifications.

## 17. Traceability Summary

Summarize the overall traceability from P00 to P01.

## 18. Recommended Corrections

List only necessary or strongly recommended corrections.

Do not redesign the product.

## 19. Requirements Readiness

Evaluate whether the Product Vision provides enough clarity to begin Requirements Engineering.

Result:

- READY
- READY_WITH_ASSUMPTIONS
- NOT_READY

## 20. Final Decision

**Result:** PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED

### Conditions to Proceed

### Conditions to Revalidate

## 21. Validator Integrity Statement

Confirm:

- No product decisions were invented.
- No unsupported requirements were accepted.
- No source artifact was modified.
- No technical architecture was introduced during validation.
- Findings are evidence-based.
```

---

# 26. Validator Behavior

## Rule 1 — Do Not Modify the Product Vision

Never silently modify:

```text id="v47h8c"
artifacts/01_discovery/PRODUCT_VISION.md
```

The validator produces a separate report.

---

## Rule 2 — Do Not Solve Findings

If a problem is found:

> Identify the problem.

Do not automatically rewrite the Product Vision.

---

## Rule 3 — Preserve Uncertainty

If the correct classification is unknown:

> UNKNOWN

If the project team must decide:

> REQUIRES_DECISION

Do not guess.

---

## Rule 4 — Do Not Penalize Reasonable Refinement

P01 is expected to provide more structure than P00.

Not every new sentence represents scope creep.

A refinement is valid when it:

* Clarifies an existing idea.
* Makes an implicit relationship explicit.
* Organizes existing information.
* Defines the product value more clearly.

---

## Rule 5 — Do Not Reward Feature Quantity

A Product Vision is not better because it contains more features.

Prefer:

```text
Clear problem
+
Clear users
+
Clear value
+
Small coherent MVP
```

over:

```text
Large feature list
```

---

# 27. Handling New Product Ideas

If P01 introduces a potentially useful capability not present in P00:

Do not automatically reject it.

Classify it as:

```text
NEW_PRODUCT_PROPOSAL
```

and determine whether the Product Vision clearly indicates that it requires team validation.

If the new capability is already included as a confirmed MVP feature without justification, flag it as a scope traceability issue.

---

# 28. Handling Conflicting Product Decisions

If P00 and P01 contain conflicting decisions:

1. Identify both statements.
2. Cite their respective sections.
3. Explain the conflict.
4. Do not decide which is correct.
5. Require explicit project-team resolution when necessary.

---

# 29. Self-Validation Checklist

Before producing the validation report:

```text id="7qhy0p"
[ ] PROJECT_CONTEXT.md was reviewed.
[ ] CONTEXT_VALIDATION.md was reviewed.
[ ] PRODUCT_VISION.md was reviewed.
[ ] Problem consistency was checked.
[ ] Users were checked.
[ ] User needs were checked.
[ ] JTBDs were checked.
[ ] Value proposition was checked.
[ ] Core journey was checked.
[ ] MVP scope was checked.
[ ] Scope expansion was checked.
[ ] Future scope was checked.
[ ] Undefined decisions were checked.
[ ] Assumptions were checked.
[ ] Open questions were checked.
[ ] Product risks were checked.
[ ] Premature specification was checked.
[ ] Traceability was audited.
[ ] Requirements readiness was evaluated.
[ ] Findings received severity levels.
[ ] Final decision was justified.
[ ] Source artifact was not modified.
[ ] No product decisions were made by the validator.
```

---

# 30. Stage Transition

If:

```text id="j40kcg"
PASS
```

the project may proceed to:

```text id="P02 — Requirements"
```

If:

```text id="e4pxr7"
PASS_WITH_WARNINGS
```

the project may proceed while preserving the documented warnings and assumptions.

If:

```text id="8ibx7n"
FAIL
```

return to P01 and correct the Product Vision.

If:

```text id="by7vps"
BLOCKED
```

resolve the upstream issue before continuing.

The validator must not automatically advance the pipeline.
