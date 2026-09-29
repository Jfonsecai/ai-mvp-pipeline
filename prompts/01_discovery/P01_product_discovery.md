# P01 — Product Discovery

**Version:** 1.0
**Stage:** P01 — Product Discovery
**Type:** Generation Prompt
**Input Artifacts:**

* `artifacts/00_context/PROJECT_CONTEXT.md`
* `artifacts/00_context/CONTEXT_VALIDATION.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/01_discovery/PRODUCT_VISION.md`
**Validator:** P01 Product Discovery Validator
**Previous Stage:** P00 — Context Definition
**Next Stage:** P02 — Requirements

---

# 1. Purpose

Transform the validated project context into a clear and structured product vision that defines:

* The product being built.
* The problem it addresses.
* The users it serves.
* The value it provides.
* The main user needs.
* The core product experience.
* The boundaries of the MVP.
* The criteria that will indicate whether the MVP provides its intended value.

This stage converts the project context into a coherent **product definition** that can serve as the foundation for requirements engineering.

The objective is not to fully specify the software.

Detailed functional requirements, user stories, acceptance criteria, architecture, database design, APIs, implementation details, and deployment decisions belong to later stages.

---

# 2. Inputs

## 2.1 Project Context

Read:

```text
artifacts/00_context/PROJECT_CONTEXT.md
```

This is the primary source for understanding:

* Problem.
* Proposed solution.
* Users.
* Initial scope.
* Constraints.
* Assumptions.
* Unknowns.
* Risks.

---

## 2.2 Context Validation

Read:

```text
artifacts/00_context/CONTEXT_VALIDATION.md
```

Use the validation result to determine whether the project context can be used as the foundation for Product Discovery.

If the validation result is:

### PASS

Proceed normally.

### PASS_WITH_WARNINGS

Proceed while preserving and explicitly tracking the warnings that affect Product Discovery.

### FAIL

Do not proceed normally.

Identify the blocking issues and indicate that P00 must be revised before Product Discovery can be completed.

### BLOCKED

Do not generate a definitive Product Vision.

Identify the missing information preventing reliable discovery.

---

# 3. Role

Act as a:

> Senior Product Discovery and Software Product Analyst.

Your responsibility is to transform the validated project context into a coherent product vision while preserving the project's original intent.

You must:

* Analyze user needs.
* Clarify the product's value proposition.
* Define the primary product experience.
* Establish MVP boundaries.
* Identify assumptions and uncertainties.
* Maintain traceability to P00.
* Prepare the project for Requirements Engineering.

You must not independently make major product decisions that have not been supported by the previous stage.

---

# 4. Core Principle

The Product Vision should answer:

> **Who is the product for, what problem does it solve, what value does it provide, and what is the smallest product capable of delivering that value?**

The result should be more precise than `PROJECT_CONTEXT.md`, but it must not become a detailed software specification.

---

# 5. Discovery Process

Follow the following process.

## Step 1 — Review P00

Read the complete:

```text
PROJECT_CONTEXT.md
```

and:

```text
CONTEXT_VALIDATION.md
```

Identify:

* Established facts.
* Assumptions.
* Unknowns.
* MVP candidates.
* Risks.
* Open questions.
* Validation warnings.

Do not ignore unresolved issues.

---

## Step 2 — Identify the Core Problem

Extract and refine the central user problem.

The problem statement should explain:

* Who experiences the problem.
* What they are trying to accomplish.
* What difficulty they currently experience.
* Why that difficulty matters.

Do not introduce a problem that is not supported by P00.

If the problem remains ambiguous, preserve the ambiguity and identify it as an open question.

---

## Step 3 — Identify Primary and Secondary Users

Determine:

* Primary user.
* Secondary users.
* Their relationship with the product.
* Their main goals.

Do not create personas based on invented demographics or characteristics.

When useful, represent users as lightweight product personas.

A persona should focus on:

* Role.
* Context.
* Main goal.
* Main problem.
* Relevant needs.

Do not create unnecessary demographic detail.

---

## Step 4 — Identify User Needs

Translate the problem into high-level user needs.

Examples:

* Discover relevant services.
* Compare available options.
* Manage information.
* Schedule a service.
* Offer services to potential customers.

These are needs, not detailed requirements.

Do not convert them into technical implementation requirements.

---

## Step 5 — Define Jobs To Be Done

Where the available information supports it, define high-level Jobs To Be Done.

Use the structure:

> When [situation], I want to [motivation], so I can [expected outcome].

Each JTBD must represent a genuine user need supported by the project context.

Do not invent jobs merely to increase the number of entries.

---

## Step 6 — Define the Value Proposition

Define the value the product provides to each relevant user group.

The value proposition should explain:

* What the product enables.
* Who benefits.
* What problem is reduced.
* Why the product is useful.

Avoid unsupported claims such as:

* "The best platform."
* "The fastest platform."
* "Guaranteed results."
* "Revolutionary solution."

Unless such claims are explicitly supported by the project context.

---

## Step 7 — Define the Core Product Experience

Describe the primary interaction between users and the product.

Focus on the core journey rather than detailed UI.

For example:

```text
User identifies a need
        ↓
User discovers relevant options
        ↓
User evaluates an option
        ↓
User selects a service
        ↓
User schedules the service
```

The exact flow must be derived from the project context.

Do not define screens, components, APIs, database entities, or implementation details here.

---

## Step 8 — Define the MVP

Determine the minimum product scope required to demonstrate the core value proposition.

For each candidate capability, evaluate:

1. Does it directly address the core problem?
2. Is it necessary for the primary user journey?
3. Is it required to demonstrate the value proposition?
4. Can the MVP function without it?

Classify capabilities as:

* MVP Core.
* MVP Supporting.
* Future.
* Out of Scope.

Do not expand the MVP simply because a feature would be useful.

---

# 6. MVP Prioritization Principle

The MVP should optimize for:

```text
Core User Problem
        +
Core User Journey
        +
Minimum Required Functionality
```

Avoid turning the MVP into a complete commercial product.

Features such as:

* Payments.
* Reviews.
* Messaging.
* Notifications.
* Advanced analytics.
* Complex administration.
* Advanced recommendation systems.

must not automatically be included.

Their inclusion requires evidence that they are necessary to validate the core product value.

---

# 7. Product Scope Boundaries

Clearly distinguish:

## MVP Core

Capabilities required to demonstrate the product's central value.

## MVP Supporting

Capabilities that support the core journey but are not themselves the primary value proposition.

## Future

Potential capabilities intentionally deferred.

## Out of Scope

Capabilities that are explicitly excluded from the current project.

Do not classify an unresolved feature as Out of Scope simply because it has not yet been defined.

Use:

> Undefined / Requires Decision

when appropriate.

---

# 8. Product Principles

Derive a small set of principles that should guide product decisions.

Examples:

* Focus on the core user problem.
* Keep the MVP simple.
* Prioritize discoverability and usability.
* Avoid unnecessary complexity.
* Preserve traceability between product decisions and user needs.

Only include principles relevant to the project.

Do not turn principles into technical requirements.

---

# 9. Success Criteria

Define initial product-level success criteria.

These should describe observable outcomes related to the core value proposition.

Examples:

* A user can complete the primary journey.
* A provider can make its services available through the platform.
* Users can successfully find a relevant service.
* Users can schedule the selected service.

Avoid inventing numerical business metrics.

Detailed measurable acceptance criteria belong to P02.

---

# 10. Assumptions

Carry forward relevant assumptions from P00.

For each important assumption, identify:

* Assumption.
* Why it matters.
* Potential impact if incorrect.

Do not silently convert assumptions into confirmed product decisions.

---

# 11. Open Product Questions

Identify unresolved questions that could affect:

* Product value.
* User experience.
* MVP scope.
* User roles.
* Core workflows.
* Business rules.

Prioritize questions that must be resolved before or during Requirements Engineering.

Do not attempt to answer unresolved questions without evidence.

---

# 12. Product Risks

Identify risks specifically related to the product definition.

Examples:

* Unclear user needs.
* Excessive MVP scope.
* Multiple user groups with conflicting needs.
* Complex core workflows.
* Dependence on unresolved business rules.
* Unclear value proposition.

Do not duplicate every technical risk from P00 unless it affects product definition.

---

# 13. Traceability

Every major product decision must be traceable to P00.

Use stable identifiers.

Recommended identifiers:

```text
P01-PROB-001
P01-USER-001
P01-NEED-001
P01-JTBD-001
P01-VALUE-001
P01-JOURNEY-001
P01-MVP-001
P01-FUT-001
P01-PRINCIPLE-001
P01-SUCCESS-001
P01-ASSUMPTION-001
P01-QUESTION-001
P01-RISK-001
```

Where possible, include the originating P00 identifier.

For example:

```text
Source: P00-MVP-001
ID: P01-MVP-001
```

If the P00 artifact does not provide a corresponding identifier, reference the relevant P00 section instead.

Do not invent source identifiers that do not exist.

---

# 14. Avoiding Scope Expansion

The Product Discovery stage must not introduce new functionality simply because it is:

* Common in similar products.
* Technically easy to implement.
* Recommended by generic product patterns.
* Expected in commercial platforms.

If a new capability appears necessary but was not present in P00:

1. Identify it.
2. Explain why it may be relevant.
3. Mark it as a product question or proposed consideration.
4. Do not automatically add it to the MVP.

If the team later decides to include it, introduce it through the appropriate change process.

---

# 15. Handling Unknown Information

Use the following classifications:

### CONFIRMED

Supported by P00.

### ASSUMED

Reasonable interpretation explicitly identified as an assumption.

### UNKNOWN

Insufficient information exists.

### REQUIRES_DECISION

The project team must make a decision before the issue can be finalized.

Never fabricate:

* User behavior.
* Business rules.
* Market data.
* Competitor information.
* Pricing.
* Legal requirements.
* Technical constraints.
* Business metrics.

unless they are provided by the project or verified through an explicitly authorized source.

---

# 16. Required Output

Generate:

```text
artifacts/01_discovery/PRODUCT_VISION.md
```

Use exactly the following high-level structure:

```markdown
# Product Vision

## 1. Document Metadata

- Version:
- Stage:
- Status:
- Generated From:
- Validation Dependency:

## 2. Product Vision Statement

A concise statement describing:
- Target users.
- Problem.
- Product.
- Core value.

## 3. Problem Definition

### 3.1 Core Problem

### 3.2 Problem Context

### 3.3 Consequences of the Problem

## 4. Target Users

### 4.1 Primary User

### 4.2 Secondary Users

### 4.3 User Needs

## 5. Jobs To Be Done

| ID | User | Situation | Motivation | Expected Outcome | Source |
|---|---|---|---|---|---|

## 6. Value Proposition

### 6.1 Primary Value

### 6.2 Value by User Type

| User | Need | Product Value | Source |
|---|---|---|---|

## 7. Core Product Experience

### 7.1 Core User Journey

### 7.2 Provider Journey

### 7.3 Key Product Interactions

## 8. MVP Definition

### 8.1 MVP Core

| ID | Capability | User Need Addressed | Rationale | Source |
|---|---|---|---|---|

### 8.2 MVP Supporting

| ID | Capability | Purpose | Source |
|---|---|---|---|

### 8.3 Future Capabilities

| ID | Capability | Reason for Deferral | Source |
|---|---|---|---|

### 8.4 Undefined / Requires Decision

| ID | Capability or Decision | Why It Matters |
|---|---|---|

## 9. Product Principles

| ID | Principle | Rationale |
|---|---|---|

## 10. Initial Success Criteria

| ID | Success Criterion | Related User/Value | Source |
|---|---|---|---|

## 11. Product Assumptions

| ID | Assumption | Impact | Source |
|---|---|---|---|

## 12. Open Product Questions

| ID | Question | Impact | Priority |
|---|---|---|---|

## 13. Product Risks

| ID | Risk | Impact | Mitigation Consideration |
|---|---|---|---|

## 14. Scope Summary

### Included in MVP

### Deferred

### Undefined

### Out of Scope

## 15. Traceability Summary

Describe how the main product elements derive from P00.

## 16. Product Vision Status

Allowed values:

- READY
- READY_WITH_ASSUMPTIONS
- BLOCKED
```

---

# 17. Status Rules

## READY

Use when:

* Product vision is coherent.
* Core problem is sufficiently clear.
* Primary users are identifiable.
* Value proposition is understandable.
* MVP boundaries are sufficiently defined.
* Remaining unknowns do not prevent Requirements Engineering.

## READY_WITH_ASSUMPTIONS

Use when:

* Product vision is usable.
* Important assumptions remain.
* Those assumptions are explicitly documented.
* Requirements Engineering can begin while tracking those assumptions.

## BLOCKED

Use when:

* Core problem cannot be established.
* Primary users cannot be meaningfully identified.
* Product value is fundamentally unclear.
* P00 contains unresolved critical contradictions.
* MVP cannot be reasonably bounded.

---

# 18. Failure Conditions

The generation should be considered invalid if:

* Information is fabricated.
* P00 facts are changed without explanation.
* Unsupported functionality is added to the MVP.
* Assumptions are presented as facts.
* Unknowns are silently resolved.
* Product decisions are invented.
* Detailed technical architecture is introduced.
* User stories or acceptance criteria are generated.
* Database or API specifications are generated.
* The output cannot be traced to P00.
* The MVP becomes unnecessarily broad.

---

# 19. Self-Validation Before Output

Before finalizing `PRODUCT_VISION.md`, verify:

```text
[ ] P00 Project Context was reviewed.
[ ] P00 Validation was reviewed.
[ ] Problem is clearly defined.
[ ] Primary user is identified or explicitly unknown.
[ ] Secondary users are identified when relevant.
[ ] User needs are supported by P00.
[ ] JTBDs are grounded in the project context.
[ ] Value proposition addresses the identified problem.
[ ] Core user journey is coherent.
[ ] MVP is explicitly bounded.
[ ] MVP does not contain unsupported functionality.
[ ] Future functionality is separated.
[ ] Undefined decisions remain explicitly unresolved.
[ ] Assumptions are labeled.
[ ] Open questions are documented.
[ ] Product risks are documented.
[ ] Success criteria relate to product value.
[ ] Traceability is maintained.
[ ] No detailed requirements were created.
[ ] No architecture was designed.
[ ] No implementation decisions were introduced.
[ ] No unsupported facts were fabricated.
```

---

# 20. Final Response

After generating the artifact, report:

1. Artifact generated.
2. Product Vision status.
3. Major assumptions identified.
4. Major unresolved product questions.
5. Whether the artifact is ready for P01 validation.

Do not claim that the product is fully specified.

The output of this stage is a **Product Vision**, not a complete software specification.

---

# 21. Stage Transition

If the Product Vision is:

```text
READY
```

the project may proceed to:

```text
P02 — Requirements
```

If it is:

```text
READY_WITH_ASSUMPTIONS
```

the project may proceed only while carrying the documented assumptions forward.

If it is:

```text
BLOCKED
```

return to P01 or P00 depending on the source of the blocking issue.

The AI must not automatically advance the pipeline.
