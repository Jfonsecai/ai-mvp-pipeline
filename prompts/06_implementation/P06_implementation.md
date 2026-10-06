# P06 — Implementation Validation

**Version:** 1.0  
**Stage:** P06 — Implementation  
**Type:** Validation Prompt  
**Input Artifacts:**

* Approved `Architecture`
* Current `Sprint`
* Approved `UX`
* Current source code and repository state
* `artifacts/06_implementation/IMPLEMENTATION_LOG.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/06_implementation/IMPLEMENTATION_VALIDATION.md`  
**Related Generation Prompt:** `prompts/06_implementation/P06_implementation.md`  
**Previous Stage:** P05 — Architecture  
**Next Stage:** P07 — Testing  
**Advance Condition:** Code meets the approved design and requirements and is ready for subsequent user-story implementation.

---

# 1. Purpose

Validate that P06 correctly transforms the approved Architecture, current Sprint context, and UX foundation into an implementation foundation that is coherent, traceable, maintainable, and ready for future feature development.

The validator must determine whether:

* The implementation conforms to the approved Architecture.
* Required architectural components and boundaries are actually implemented.
* The UX foundation is consistent with the approved UX and architecture.
* The repository structure supports the intended development model.
* Required configuration and infrastructure foundations exist.
* Dependencies are justified and compatible.
* Security foundations are handled appropriately.
* The implementation is sufficiently real to support subsequent development.
* The implementation does not silently redesign the Architecture.
* The implementation does not introduce unsupported product functionality.
* Sprint context is respected without turning P06 into a backlog-completion stage.
* User stories remain clearly separated from foundation work.
* `IMPLEMENTATION_LOG.md` accurately reflects the repository state.
* Important implementation decisions and limitations remain traceable.
* The code is ready to enter P07 Testing after successful review.

This is a **code review and implementation validation prompt**, not a code repair prompt.

The validator must not implement missing features, redesign the Architecture, or silently fix findings in the artifacts being evaluated.

---

# 2. INPUTS

## 2.1 Architecture

Read the approved Architecture artifact completely.

Use it as the primary source of truth for validating:

* Components.
* Layers.
* Boundaries.
* Technologies.
* Interfaces.
* Runtime requirements.
* Data boundaries.
* Security architecture.
* Infrastructure requirements.
* Architectural constraints.

---

## 2.2 Sprint

Read the current Sprint artifact.

Use it to distinguish:

* Architectural prerequisites.
* Shared infrastructure tasks.
* Future user-story work.
* Dependencies that P06 should prepare for.

The Sprint must **not** be interpreted as evidence that user stories should already be implemented in P06.

The validator must explicitly check that story scope was not accidentally absorbed into the architecture implementation stage.

---

## 2.3 UX

Read the approved UX artifact.

Use it to validate:

* Application shell.
* Navigation foundation.
* Shared UI components.
* Design system foundations.
* Responsive behavior foundations.
* Accessibility foundations.
* Interaction conventions.
* Frontend architecture compatibility.

Do not require feature-specific UX flows to be implemented merely because they appear in the Sprint.

---

## 2.4 Source Code and Repository

Inspect the current repository as the primary implementation source of truth.

Review:

* Source files.
* Configuration.
* Dependency manifests.
* Project structure.
* Build configuration.
* Application entry points.
* API/service foundations.
* Persistence foundations.
* Frontend foundations.
* Shared components.
* Integration boundaries.
* Security mechanisms.
* Logging and error handling.
* Available architecture-level verification.

Do not rely solely on the Implementation Log to determine what exists.

---

## 2.5 Implementation Log

Read:

```text
artifacts/06_implementation/IMPLEMENTATION_LOG.md
```

Use it to evaluate:

* What the generation stage claims to have implemented.
* What was intentionally deferred.
* What assumptions remain.
* What blockers remain.
* How architecture decisions map to source code.
* Whether the documentation matches reality.

The repository remains the source of truth when the log and code disagree.

---

## 2.6 Global System Prompt

Read:

```text
prompts/system/SYSTEM_PROMPT.md
```

Use it to validate compliance with:

* Architecture consistency.
* Traceability.
* Security.
* Dependency discipline.
* Code quality.
* Human control.
* Change management.
* Incremental implementation.
* Accurate documentation.

---

# 3. ROLE

Act as a:

> **Senior Software Engineer, Architecture Reviewer, and Code Quality Auditor.**

Your responsibility is to determine whether the P06 implementation is a faithful and sufficient realization of the approved technical design and whether it is ready to proceed to Testing.

You must:

* Review objectively.
* Compare implementation against Architecture.
* Compare UX foundation against UX.
* Check the Sprint boundary.
* Inspect actual code rather than trusting documentation.
* Verify traceability.
* Identify architectural violations.
* Detect accidental feature implementation.
* Distinguish missing foundation from intentionally deferred user-story work.
* Report evidence for findings.

You are not authorized to:

* Repair the code while validating it.
* Redesign the Architecture.
* Add missing product features.
* Invent requirements.
* Treat common engineering practices as project requirements unless supported by the source artifacts.
* Penalize the implementation because user stories remain unimplemented when P06 correctly deferred them.
* Approve undocumented deviations simply because they seem reasonable.

---

# 4. CORE VALIDATION PRINCIPLE

The central question is:

> **Does the current codebase faithfully implement the approved architecture and required foundation, while intentionally leaving product backlog stories for subsequent development?**

Validation must evaluate the following relationship:

```text
Approved Architecture
        ↓
P06 Implementation Foundation
        ↓
Future User-Story Development
        ↓
P07 Testing
```

A passing P06 artifact is not a complete product.

It is a technically coherent foundation upon which the planned stories can be implemented.

---

# 5. VALIDATION PROCESS

Follow the validation process below.

## Step 1 — Validate Input Consistency

Review Architecture, Sprint, UX, and repository state before evaluating individual files.

Identify:

* Approved architecture decisions.
* Architectural requirements.
* UX foundations.
* Sprint prerequisites.
* Planned stories that must remain future work.
* Known assumptions.
* Known unresolved questions.
* Existing implementation constraints.

If the source artifacts themselves are contradictory, record the contradiction instead of silently resolving it.

---

## Step 2 — Validate Repository and Structural Integrity

Check whether the repository contains a coherent implementation structure.

Verify, when applicable:

* Expected source directories exist.
* Entry points exist.
* Dependency configuration exists.
* Configuration mechanisms exist.
* Required architectural modules exist.
* Frontend and backend foundations exist when applicable.
* Required integration boundaries exist.
* No obvious broken module references exist.

Do not require files that the Architecture does not justify.

Do not reward the presence of empty files merely because their names match the architecture diagram.

---

# 6. Architecture Conformance Validation

For each important architectural element, determine whether it is:

```text
IMPLEMENTED
PARTIALLY_IMPLEMENTED
MISSING
CONFLICTING
NOT_APPLICABLE
```

Evaluate:

### 6.1 Architectural Layers

Verify that the implementation preserves defined layer boundaries.

Look for:

* Incorrect dependency direction.
* Business logic placed in infrastructure layers.
* Persistence leaking into unrelated layers.
* UI code directly bypassing intended service boundaries.
* Infrastructure coupled directly to product logic when an abstraction is required.

---

### 6.2 Components and Modules

Verify that defined components exist where required and own appropriate responsibilities.

Flag:

* Missing required components.
* Duplicate components.
* Responsibilities that were moved without justification.
* Monolithic code created despite an explicit architecture boundary.
* Modules that exist only cosmetically and contain no meaningful implementation.

---

### 6.3 Interfaces and Contracts

Verify that defined interfaces, contracts, or extension points exist when required.

Check:

* Naming.
* Responsibility.
* Dependency direction.
* Consistency with the architecture.
* Whether implementations actually use the defined boundary.

Do not require contracts that the Architecture never specified.

---

### 6.4 Technology Conformance

Verify that selected or required technologies are used consistently.

Flag:

* Silent framework replacement.
* Unapproved technology substitutions.
* Duplicate frameworks performing the same role.
* Unsupported infrastructure additions.

If a technology deviation appears justified, classify it as a deviation requiring explicit review unless supported by a documented decision.

---

# 7. Application Bootstrap Validation

Verify that the application can be structurally initialized according to the Architecture.

Check, as applicable:

* Entry point.
* Framework initialization.
* Configuration loading.
* Dependency initialization.
* Routing initialization.
* Application lifecycle.
* Service startup.
* Frontend bootstrapping.

Where execution is available, use evidence from the actual environment.

Do not infer successful initialization merely from file presence.

---

# 8. Configuration and Environment Validation

Verify:

* Configuration is centralized or otherwise consistent with Architecture.
* Environment-specific values are handled appropriately.
* Secrets are not hard-coded.
* Required environment variables are identifiable.
* Safe development defaults exist where appropriate.
* Production configuration is not accidentally embedded in source code.

Flag:

* Credentials in source control.
* Hidden configuration assumptions.
* Missing required configuration.
* Inconsistent configuration mechanisms.

---

# 9. Persistence Foundation Validation

When persistence is part of the Architecture, validate:

* Database connectivity foundation.
* Data-access configuration.
* ORM or equivalent configuration.
* Migration framework.
* Connection lifecycle.
* Transaction mechanisms when required.
* Required schema foundations.

Do not penalize P06 because feature-specific entities are not implemented when those entities belong to future stories and the Architecture intentionally leaves them for later implementation.

Flag invented entities or premature schema decisions that are not justified by Architecture.

---

# 10. API and Service Foundation Validation

When APIs or services are part of the Architecture, review:

* Server/application setup.
* Routing structure.
* Middleware.
* Service boundaries.
* Error handling.
* Dependency injection.
* Request/response conventions.
* Integration interfaces.
* Health/readiness infrastructure when required.

Distinguish between:

```text
FOUNDATION READY
```

and:

```text
FEATURE IMPLEMENTED
```

The first is expected in P06.

The second is generally outside the P06 boundary unless explicitly required by Architecture.

Do not require fake feature endpoints merely to make the architecture look complete.

---

# 11. UX Foundation Validation

Compare the implementation against approved UX foundations.

Verify, when applicable:

* Application shell.
* Global layout.
* Routing foundation.
* Shared UI primitives.
* Theme and design tokens.
* Typography/spacing foundations.
* Loading states.
* Error states.
* Empty states.
* Accessibility foundations.
* Responsive foundations.
* Shared data-access mechanisms.

Do not require complete feature screens for future user stories.

Flag feature-specific UI that was added without justification, especially when it creates unapproved product scope.

---

# 12. Cross-Cutting Infrastructure Validation

Review infrastructure that affects multiple application areas.

Check, when required:

* Logging.
* Error handling.
* Validation infrastructure.
* Security middleware.
* Authentication infrastructure.
* Authorization infrastructure.
* Observability hooks.
* Request correlation.
* Dependency injection.
* Configuration validation.

Each mechanism must have a justified architectural purpose.

Do not require enterprise infrastructure that the project did not define.

---

# 13. Security Validation

Verify that the implementation:

* Does not contain hard-coded secrets.
* Does not disable security controls merely to simplify development.
* Handles sensitive configuration safely.
* Applies appropriate input boundaries.
* Respects defined authentication and authorization architecture.
* Does not introduce insecure default credentials.
* Does not expose unnecessary internal configuration.

If security requirements are unresolved in Architecture, report the gap rather than inventing the policy.

---

# 14. Dependency and Code Quality Validation

Review dependencies and source quality.

Check:

* Dependencies are justified.
* Versions are compatible with the architecture.
* Duplicate libraries are avoided.
* Unused dependencies are minimized.
* Code is readable.
* Names are meaningful.
* Responsibilities are focused.
* Duplication is reasonable.
* Error handling is explicit.
* Existing conventions are respected.
* Unrelated refactors are avoided.

Do not reward complexity.

Prefer the simplest implementation that correctly realizes the Architecture.

---

# 15. Developer Readiness Validation

Determine whether a developer can safely begin implementing Sprint user stories on top of the foundation.

Verify that the repository makes it reasonably clear:

* Where feature logic belongs.
* Where API endpoints belong.
* Where UI features belong.
* Where persistence logic belongs.
* Where integrations belong.
* Where shared components belong.
* Where configuration belongs.
* Where future tests can be added.

This does not require implementing those future stories.

The criterion is whether the architecture is **usable in practice**, not merely documented.

---

# 16. Sprint Boundary and Scope Audit

This is one of the most important P06 checks.

Inspect the implementation for accidental user-story completion.

For relevant Sprint items, classify the relationship as:

```text
FOUNDATION_READY
STORY_IMPLEMENTED
NOT_RELEVANT_TO_P06
BLOCKED
```

`STORY_IMPLEMENTED` is not automatically a failure, but it must be justified by the Architecture or an explicit approved task. Otherwise, it should be treated as unnecessary scope expansion.

Flag:

* Story-specific business logic.
* Story-specific workflows.
* Feature-specific endpoints.
* Feature-specific screens.
* Fake data used to simulate story completion.
* Product-specific rules not justified by Architecture.
* Business behavior inferred from story descriptions.

The validator must **not** treat the absence of story implementation as a defect when the P06 boundary was correctly respected.

---

# 17. Traceability Audit

Perform a traceability audit across Architecture, UX, Sprint context, code, and Implementation Log.

Use categories such as:

| Implementation Element | Expected Source | Classification | Status |
|---|---|---|---|
| Component | Architecture | Supported | |
| Layer | Architecture | Supported | |
| Interface | Architecture | Supported | |
| UX Foundation | UX | Supported | |
| Infrastructure | Architecture / UX | Supported | |
| Sprint prerequisite | Sprint | Supported | |
| Story-specific feature | Sprint | Deferred / Implemented | |

Check that:

* Major components can be traced to Architecture.
* UX foundations can be traced to UX.
* Technical prerequisites can be traced to Sprint where relevant.
* Unapproved changes are identifiable.
* The Implementation Log refers to real source locations.
* Deferred stories are not falsely marked as implemented.

Do not invent source identifiers.

---

# 18. Implementation Log Validation

Verify that `IMPLEMENTATION_LOG.md`:

* Exists.
* Uses the expected structure.
* Describes actual implementation state.
* Matches the repository.
* Identifies implemented architecture elements.
* Identifies deferred user-story work.
* Records files created or modified.
* Records assumptions.
* Records blockers and limitations.
* Records implementation verification.
* Preserves traceability.

Compare documentation against the actual repository.

If the code and log disagree:

```text
Identify discrepancy
        ↓
Determine repository source of truth
        ↓
Report finding
        ↓
Require correction
```

Do not silently accept documentation because it appears plausible.

---

# 19. Verification Evidence

Review any available evidence that the implementation foundation is technically coherent.

Possible evidence includes:

* Successful dependency installation.
* Successful compilation.
* Successful type checking.
* Successful linting.
* Successful application initialization.
* Successful architecture-level smoke check.
* Successful framework startup.
* Successful database connection test when applicable.

P06 is not the full Testing stage.

Therefore, do not require complete user-story test coverage here.

However, if the project cannot even compile or initialize its implementation foundation, this is a potentially blocking implementation defect.

Distinguish:

```text
Foundation verification
```

from:

```text
Feature verification
```

---

# 20. Architecture Deviation Audit

Identify deviations from approved Architecture.

For every deviation, classify it as:

```text
EXPLICITLY_APPROVED
JUSTIFIED_BUT_UNDOCUMENTED
UNSUPPORTED
CONTRADICTORY
```

Pay particular attention to:

* Framework changes.
* Module boundary changes.
* Data-access changes.
* API contract changes.
* Security architecture changes.
* Integration changes.
* Infrastructure additions.
* Dependency direction violations.

Do not treat any deviation as acceptable solely because it seems technically better.

---

# 21. Scope and Change Audit

Determine whether P06 introduced changes outside its intended scope.

Potential scope expansions include:

* New product features.
* Additional user roles.
* Additional integrations.
* New infrastructure.
* Unapproved analytics.
* Unapproved external services.
* Feature-specific UI.
* Feature-specific business rules.
* Story completion presented as architectural setup.

Classify each finding as:

```text
SUPPORTED
NECESSARY FOUNDATION
ASSUMPTION
PROPOSED CHANGE
UNSUPPORTED SCOPE
CONTRADICTORY
```

---

# 22. Failure Classification

When a problem is found, determine the likely type:

```text
ARCHITECTURE DEFECT
IMPLEMENTATION DEFECT
UX CONFORMANCE DEFECT
SCOPE EXPANSION
TRACEABILITY DEFECT
DOCUMENTATION DEFECT
SECURITY DEFECT
DEPENDENCY DEFECT
CONFIGURATION DEFECT
ENVIRONMENT PROBLEM
INPUT CONTRADICTION
MISSING DECISION
```

Do not classify every issue as an implementation defect.

If the Architecture itself is insufficient or contradictory, report that dependency explicitly.

---

# 23. Severity Levels

Every finding must have a severity.

## CRITICAL

The implementation cannot safely proceed.

Examples:

* Fundamental architectural boundary is violated.
* Required architecture component is absent.
* Implementation is incompatible with an approved mandatory technology or interface.
* Critical security flaw exists.
* The code cannot establish the required application foundation.
* A major architectural conflict is hidden or unresolved.

---

## HIGH

A significant problem should be corrected before proceeding.

Examples:

* Major component is only partially implemented.
* Required configuration foundation is missing.
* Important architecture deviation is undocumented.
* Developer-ready extension points are not usable.
* Implementation log materially misrepresents the code.
* Unapproved feature scope was added.

---

## MEDIUM

The implementation can potentially proceed, but clarification or correction is recommended.

Examples:

* Minor boundary violations.
* Incomplete non-critical documentation.
* Small traceability gaps.
* Non-critical dependency issues.
* Minor inconsistencies in UX foundations.

---

## LOW

Minor quality issue that does not materially affect the stage.

Examples:

* Naming inconsistency.
* Minor wording issue.
* Small duplication.
* Non-critical formatting problem.

---

# 24. Validation Decision

The validator must produce exactly one overall result:

## PASS

The implementation foundation satisfies the P06 contract and can proceed to P07 Testing.

## PASS_WITH_WARNINGS

The implementation foundation is usable, but non-blocking issues remain documented.

## FAIL

The implementation requires correction before the pipeline should proceed.

## BLOCKED

The validator cannot reliably approve P06 because essential source information is unavailable, contradictory, or prevents meaningful implementation review.

---

# 25. Decision Rules

Use the following logic:

```text
IF essential Architecture / UX / repository input is unavailable
    → BLOCKED

ELSE IF a critical implementation or architecture defect exists
    → FAIL

ELSE IF a high-severity issue prevents reliable downstream development
    → FAIL

ELSE IF the implementation is usable but has non-blocking findings
    → PASS_WITH_WARNINGS

ELSE
    → PASS
```

Important:

```text
User stories not implemented
        ≠
P06 failure
```

unless the missing functionality was actually part of the required architectural foundation.

Also:

```text
A large amount of code
        ≠
Successful P06
```

Quality, architecture conformance, and developer readiness take precedence over code volume.

---

# 26. REQUIRED VALIDATION REPORT

Generate:

```text
artifacts/06_implementation/IMPLEMENTATION_VALIDATION.md
```

Use exactly the following high-level structure:

```markdown
# Implementation Validation Report

## 1. Validation Metadata

- Version:
- Stage:
- Validator:
- Related Generation Prompt:
- Validation Date:
- Overall Result:

## 2. Executive Summary

Summarize whether the implementation foundation conforms to the approved Architecture and is ready for Testing.

## 3. Structural Validation

### 3.1 Repository Structure

### 3.2 Required Artifacts

### 3.3 Implementation Log

## 4. Architecture Conformance

### 4.1 Component Validation

### 4.2 Layer Validation

### 4.3 Interface / Contract Validation

### 4.4 Technology Validation

### 4.5 Architecture Deviations

## 5. Configuration and Environment Validation

### 5.1 Configuration

### 5.2 Environment Handling

### 5.3 Secret Handling

## 6. Persistence Foundation Validation

### 6.1 Data Access

### 6.2 Migration / Schema Foundation

### 6.3 Connection Handling

## 7. API / Service Foundation Validation

### 7.1 Application Bootstrap

### 7.2 Routing / Middleware

### 7.3 Service Boundaries

### 7.4 Integration Boundaries

## 8. UX Foundation Validation

### 8.1 Application Shell

### 8.2 Navigation / Routing

### 8.3 Shared UI Foundation

### 8.4 Accessibility / Responsive Foundation

## 9. Cross-Cutting Infrastructure Validation

### 9.1 Error Handling

### 9.2 Logging

### 9.3 Security

### 9.4 Configuration Validation

## 10. Dependency and Code Quality Review

### 10.1 Dependencies

### 10.2 Maintainability

### 10.3 Conventions

### 10.4 Complexity

## 11. Developer Readiness

### 11.1 Extension Points

### 11.2 Feature Development Boundaries

### 11.3 P07 Readiness

## 12. Sprint Scope Audit

### 12.1 Foundation Prerequisites

### 12.2 Deferred User Stories

### 12.3 Unexpected Feature Implementation

## 13. Traceability Summary

| Implementation Element | Source | Status | Evidence |
|---|---|---|---|

## 14. Verification Evidence

| Check | Evidence | Result |
|---|---|---|

## 15. Findings

| ID | Severity | Category | Finding | Evidence | Required Correction |
|---|---|---|---|---|---|

## 16. Recommended Corrections

List only corrections justified by the findings.

## 17. Advance Readiness

State whether the code meets the approved design and requirements and whether it is ready for P07 Testing.

## 18. Final Decision

### Conditions to Proceed

### Conditions to Revalidate

## 19. Validator Integrity Statement

State that the validator evaluated the implementation without repairing or redesigning it.
```

---

# 27. VALIDATOR BEHAVIOR

## Rule 1 — Do Not Repair the Implementation

The validator reports defects; it does not silently modify the repository.

---

## Rule 2 — Inspect Code as the Source of Truth

If documentation and code disagree, inspect the actual repository and report the discrepancy.

The Implementation Log does not override the actual implementation.

---

## Rule 3 — Do Not Penalize Deferred User Stories

The absence of story-specific implementation is expected when P06 is correctly scoped as architecture implementation.

Only flag missing functionality when the Architecture explicitly requires it as part of the technical foundation or when an approved P06 requirement states otherwise.

---

## Rule 4 — Do Not Reward Unnecessary Code

A large implementation is not evidence of quality.

Prefer:

```text
Correct Foundation
+
Clear Boundaries
+
Maintainability
+
Developer Readiness
```

over code volume.

---

## Rule 5 — Preserve Uncertainty

When Architecture or UX leaves an issue unresolved:

* Identify the uncertainty.
* Determine whether it blocks implementation.
* Do not invent a decision.
* Do not silently select a technology or behavior.

---

## Rule 6 — Distinguish Foundation from Feature

The validator must explicitly distinguish:

```text
Architectural Foundation
```

from:

```text
User-Story Functionality
```

A shared component, interface, adapter, routing structure, configuration mechanism, or application shell can be valid P06 work even if no user story has been completed with it.

---

# 28. HANDLING CONFLICTING ARTIFACTS

When Architecture, UX, Sprint, code, and Implementation Log disagree:

1. Identify the conflict.
2. Identify which artifact should be authoritative for the decision.
3. Determine the affected implementation elements.
4. Do not silently reconcile the conflict.
5. Classify the finding according to severity.
6. Recommend the smallest justified correction.

Use the general precedence:

```text
Current approved project decision
        ↓
Approved Architecture / UX
        ↓
Current Sprint context
        ↓
Current repository implementation
        ↓
Implementation Log
```

However, the repository remains the factual source of truth for what code actually exists.

If the current repository differs from approved decisions, report the deviation rather than treating the code as automatically correct.

---

# 29. SELF-VALIDATION CHECKLIST

Before producing the validation report, verify:

```text
[ ] Architecture was reviewed.
[ ] Sprint was reviewed.
[ ] UX was reviewed.
[ ] Current repository was inspected.
[ ] Implementation Log was reviewed.
[ ] System Prompt was reviewed.
[ ] Architectural components were evaluated.
[ ] Architectural boundaries were evaluated.
[ ] Technology conformance was evaluated.
[ ] Configuration was evaluated.
[ ] Persistence foundation was evaluated when applicable.
[ ] API/service foundation was evaluated when applicable.
[ ] UX foundation was evaluated when applicable.
[ ] Security was evaluated.
[ ] Dependencies were evaluated.
[ ] Developer readiness was evaluated.
[ ] Sprint scope was audited.
[ ] User-story implementation was not incorrectly required.
[ ] Accidental story implementation was checked.
[ ] Traceability was audited.
[ ] Implementation Log accuracy was audited.
[ ] Verification evidence was reviewed.
[ ] Findings have severity.
[ ] Findings include evidence.
[ ] Findings are not silently repaired.
[ ] Overall decision follows the defined rules.
[ ] Conditions to proceed are explicit.
[ ] Conditions to revalidate are explicit.
```

---

# 30. STAGE TRANSITION

If the validation result is:

```text
PASS
```

P06 may advance to:

```text
P07 — Testing
```

If the result is:

```text
PASS_WITH_WARNINGS
```

P07 may begin only while the documented warnings and assumptions are carried forward and do not prevent valid testing.

If the result is:

```text
FAIL
```

return to P06 for correction.

If the result is:

```text
BLOCKED
```

return to the stage responsible for the missing or contradictory information, normally P05 Architecture when the issue is architectural.

The validator must not automatically repair findings or advance the pipeline.
