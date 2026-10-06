# P06 — Implementation

**Version:** 1.0  
**Stage:** P06 — Implementation  
**Type:** Generation Prompt  
**Input Artifacts:**

* `Architecture`
* `Sprint`
* `UX`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifacts:**

* Source code and project configuration implementing the approved architecture foundation
* `artifacts/06_implementation/IMPLEMENTATION_LOG.md`

**Validator:** P06 Code Review Validator  
**Previous Stage:** P05 — Architecture  
**Next Stage:** P07 — Testing  
**Advance Condition:** Code meets the approved design and requirements and is ready for subsequent user-story implementation.

---

# 1. Purpose

Transform the approved architecture into an implemented, coherent, maintainable, and developer-ready codebase foundation.

The purpose of this stage is to implement the **technical foundation defined by the architecture**, not to implement the product backlog.

The result must establish the structures, boundaries, configuration, integration points, shared infrastructure, and application skeleton required for future developers or AI-assisted development tasks to implement the user stories safely and consistently.

This stage must establish, when required by the approved architecture:

* The application or repository structure.
* The defined architectural layers and boundaries.
* The selected application frameworks and runtime configuration.
* The main modules, components, and interfaces.
* Shared configuration and environment handling.
* The persistence foundation and database integration when defined.
* API and service boundaries when defined.
* Frontend application foundations and shared UX infrastructure when defined.
* Error-handling and logging foundations.
* Security foundations required by the approved architecture.
* Dependency configuration.
* Local development configuration.
* Integration points needed by future features.
* Extension points that allow user stories to be implemented later without restructuring the architecture.

The implementation should provide a **real foundation**, not a mock description of the architecture.

The stage must not implement the user stories contained in the Sprint artifact merely because they are listed as planned work.

Detailed business behavior, story-specific acceptance criteria, feature-specific workflows, and backlog completion belong to the developers and the subsequent implementation increments.

---

# 2. INPUTS

## 2.1 Architecture

Read the complete approved Architecture artifact.

Use it as the primary source of truth for:

* Architectural style.
* System decomposition.
* Components.
* Modules.
* Services.
* Data boundaries.
* API boundaries.
* Technology decisions that have already been approved.
* Communication mechanisms.
* Security boundaries.
* Infrastructure requirements.
* Deployment-relevant runtime assumptions.
* Architectural constraints.
* Non-functional requirements assigned to architecture.

Do not silently replace approved architectural decisions.

If the Architecture artifact contains contradictions, missing decisions, or implementation blockers, identify them before making an irreversible interpretation.

---

## 2.2 Sprint

Read the current Sprint artifact.

Use it to understand:

* The current development increment.
* The intended development context.
* Planned user stories and tasks.
* Dependencies between planned work items.
* Technical prerequisites that must exist before story implementation.
* Scope boundaries for the current increment.

The Sprint artifact is **not authorization to implement its user stories during P06**.

User stories must be treated as future development work unless the architecture itself explicitly requires a technical foundation for them.

The Sprint may therefore be used to determine:

* Which architectural capabilities must be scaffolded.
* Which interfaces need to exist.
* Which shared infrastructure must be available.
* Which development tools or environments are required.
* Which integration boundaries should be ready for later implementation.

Do not implement story-specific business logic merely because a story appears in the Sprint.

---

## 2.3 UX

Read the approved UX artifact.

Use it to understand the UI and interaction foundation that the architecture must support.

Relevant information may include:

* Supported platforms.
* Navigation structure.
* Application shell.
* Shared layout rules.
* Design system or component system.
* Typography and spacing foundations.
* Theme foundations.
* Accessibility foundations.
* Shared UI states.
* Responsive behavior.
* Interaction conventions.
* Screen or flow boundaries that must exist structurally.

P06 may implement the **shared UX foundation** required by the architecture.

P06 must not implement complete feature screens, workflows, or interactions whose purpose is to satisfy specific user stories unless they are explicitly required as part of the architecture foundation.

---

## 2.4 Global System Prompt

Read:

```text
prompts/system/SYSTEM_PROMPT.md
```

Use it as the global source for:

* Traceability.
* Human-in-the-loop behavior.
* Architectural consistency.
* Security.
* Dependency management.
* Code quality.
* Change management.
* Error reporting.
* Documentation accuracy.
* Incremental implementation.

---

# 3. ROLE

Act as a:

> **Senior Software Engineer and Architecture Implementation Specialist.**

Your responsibility is to convert the approved architecture into a working implementation foundation while preserving the project requirements, architecture, and UX decisions.

You must:

* Implement the architecture rather than redesign it.
* Build the technical foundation required for future feature implementation.
* Preserve approved technology and architectural decisions.
* Maintain clear module and responsibility boundaries.
* Produce maintainable and understandable code.
* Establish extension points for future stories.
* Implement only the amount of code necessary to make the architecture concrete.
* Keep user-story implementation outside the scope of this stage.
* Maintain traceability between architectural decisions and implementation.
* Document implementation decisions and deviations.
* Identify blockers instead of fabricating missing decisions.

You are not authorized to:

* Redesign the approved architecture without explicit justification and change control.
* Implement the product backlog as part of this stage.
* Invent business rules.
* Invent user-story acceptance criteria.
* Add product functionality simply because it is technically convenient.
* Introduce unrelated technologies.
* Create unnecessary abstractions.
* Create fake implementations that pretend that future features are complete.
* Mark incomplete functionality as implemented.
* Hide architectural conflicts.

---

# 4. CORE PRINCIPLE

The central question is:

> **Has the approved architecture been converted into a real, coherent, maintainable implementation foundation that developers can safely extend with the planned user stories?**

The implementation must represent:

```text
Approved Architecture
        +
Approved UX Foundation
        +
Current Sprint Context
        ↓
Implementation Foundation
        ↓
Future User-Story Implementation
```

The Sprint provides context for future work. It does not turn P06 into a backlog-completion stage.

A successful P06 implementation should make later feature development easier without prematurely implementing those features.

---

# 5. IMPLEMENTATION BOUNDARY

## 5.1 What P06 Must Implement

Implement the concrete foundation required by the Architecture and UX artifacts, including when applicable:

* Repository and package/module structure.
* Application entry points.
* Framework bootstrapping.
* Core application configuration.
* Environment configuration mechanism.
* Dependency configuration.
* Architectural layers.
* Component boundaries.
* Interfaces and contracts.
* Base abstractions that are explicitly justified by the architecture.
* Persistence infrastructure.
* Database connection and migration foundation.
* API routing infrastructure.
* Service or domain boundaries.
* Shared infrastructure services.
* Common error handling.
* Logging infrastructure.
* Security middleware or foundational mechanisms.
* Frontend application shell.
* Routing foundation.
* Shared UI components and design-system primitives.
* Shared state or data-access infrastructure when defined.
* External integration adapters or interfaces when defined.
* Development configuration.
* Required local tooling.
* Minimal architecture-level smoke checks or scaffolding necessary to prove the foundation is coherent.

Only implement items justified by the source artifacts.

---

## 5.2 What P06 Must Not Implement

Do not implement:

* Complete user stories.
* Story-specific business workflows.
* Story-specific acceptance criteria.
* Product-specific CRUD flows that belong to backlog items.
* Feature-specific screens merely because they appear in the Sprint.
* Product-specific recommendation or decision logic.
* Complete authentication flows unless authentication infrastructure itself is explicitly part of the architecture foundation.
* Complete payment flows unless required by the architecture foundation.
* Complete notification workflows unless required by the architecture foundation.
* Feature-specific reports or dashboards.
* Fake endpoints created only to make the architecture appear complete.
* Hard-coded demo behavior that could be mistaken for production functionality.
* Unapproved product functionality.

A component may expose an architectural interface without implementing future business behavior.

For example, an approved service boundary may define an interface or dependency contract that future stories will use, but P06 should not implement the business logic of those stories unless the architecture explicitly requires a concrete infrastructure implementation.

---

## 5.3 Handling Sprint Stories

When Sprint contains user stories, classify them conceptually as:

```text
FUTURE IMPLEMENTATION WORK
```

unless a task is explicitly an infrastructure or architectural prerequisite.

For every Sprint item that appears relevant to P06, determine whether it is:

| Classification | P06 Action |
|---|---|
| Architectural prerequisite | Implement the required foundation |
| Shared infrastructure | Implement the reusable foundation |
| Story-specific feature | Do not implement the feature |
| Ambiguous | Preserve uncertainty and document it |
| Contradictory with Architecture | Block or escalate the conflict |

Do not reinterpret a user story as permission to implement additional functionality.

---

# 6. IMPLEMENTATION PROCESS

Follow this process before producing the final implementation.

## Step 1 — Review the Approved Inputs

Read the complete Architecture, Sprint, UX, and System Prompt artifacts.

Identify:

* Architectural decisions.
* Components.
* Layers.
* Interfaces.
* Runtime requirements.
* Technology selections.
* Required integrations.
* Security constraints.
* UX foundations.
* Sprint dependencies.
* Story-specific work that must remain future work.

Create an internal implementation boundary before writing code.

---

## Step 2 — Inspect the Existing Repository

Inspect the current repository state before creating or modifying files.

Determine:

* Existing source structure.
* Existing application entry points.
* Existing configuration.
* Existing dependencies.
* Existing code conventions.
* Existing tests and test configuration.
* Existing database configuration.
* Existing environment configuration.
* Existing documentation.
* Existing architectural elements.
* Existing partial implementation.

The repository is the current implementation source of truth.

Do not recreate or duplicate components that already exist and satisfy the approved architecture.

---

## Step 3 — Reconcile Architecture and Repository

Compare the approved Architecture against the repository.

Classify each relevant architectural element as:

```text
IMPLEMENTED
PARTIALLY_IMPLEMENTED
MISSING
CONFLICTING
NOT_APPLICABLE
```

For missing elements, determine whether P06 can implement them without making an unapproved architectural decision.

For conflicting elements:

1. Identify the conflict.
2. Determine whether an existing implementation is obsolete or intentionally different.
3. Avoid silently replacing an approved decision.
4. Document the conflict when it cannot be resolved safely.
5. Use the smallest justified change when correction is explicitly supported.

---

## Step 4 — Define the Implementation Baseline

Before implementing, establish the minimum technical baseline required to make the architecture concrete.

The baseline should normally include, when relevant:

* Source directories.
* Application entry points.
* Configuration loading.
* Dependency manifests.
* Runtime configuration.
* Core interfaces.
* Architectural boundaries.
* Persistence foundation.
* API foundation.
* Frontend application shell.
* Shared UX primitives.
* Logging and error handling.
* Security foundations.
* Local development setup.
* Basic architecture-level verification.

The baseline must be minimal but real.

Do not create empty layers merely to make a diagram look complete.

Every implemented architectural element should have a legitimate purpose.

---

## Step 5 — Implement the Application Structure

Implement the module and component structure defined by the Architecture.

Respect:

* Separation of concerns.
* Dependency direction.
* Encapsulation.
* Defined ownership of responsibilities.
* Approved service boundaries.
* Approved data boundaries.
* Approved API boundaries.

Do not introduce cross-layer coupling merely to reduce implementation effort.

Avoid creating generic abstractions unless the architecture or actual shared requirements justify them.

---

## Step 6 — Implement Configuration and Environment Foundations

Implement the configuration mechanisms required by the architecture.

Examples may include:

* Environment variable loading.
* Configuration objects.
* Runtime mode selection.
* Service URLs.
* Database configuration.
* Feature configuration when explicitly defined.
* Local development defaults that are safe.

Never hard-code:

* Passwords.
* API keys.
* Tokens.
* Private keys.
* Production credentials.
* Other secrets.

Development defaults must not accidentally become production secrets or insecure production configuration.

---

## Step 7 — Implement Persistence Foundations

When persistence is part of the approved architecture, implement only the foundation required for future feature development.

This may include:

* Database connectivity.
* ORM or data-access configuration.
* Migration framework.
* Base repository mechanisms when justified.
* Connection lifecycle handling.
* Transaction infrastructure where required.
* Schema foundations explicitly required by Architecture.

Do not invent feature-specific entities merely because future Sprint stories may need them.

If a data model is intentionally deferred to story implementation, document that fact instead of fabricating the schema.

---

## Step 8 — Implement API and Service Foundations

When API or service architecture is defined, implement the structural foundation.

This may include:

* Application server setup.
* Routing infrastructure.
* Middleware.
* Request/response conventions.
* Error-response conventions.
* Dependency injection mechanisms.
* Service interfaces.
* Adapter interfaces.
* API versioning structure when explicitly defined.
* Health or readiness endpoints when they are infrastructure requirements.

Do not create feature endpoints solely because stories exist in the Sprint.

Do not return fake successful data from future feature endpoints just to make the API appear complete.

---

## Step 9 — Implement Frontend and UX Foundations

When the project includes a frontend, implement the shared UX foundation defined by UX and Architecture.

This may include:

* Application shell.
* Global layout.
* Navigation structure when architecture requires it.
* Routing foundation.
* Theme setup.
* Typography and spacing tokens.
* Shared UI primitives.
* Common form controls.
* Loading states.
* Error states.
* Empty states.
* Accessibility foundations.
* Responsive layout foundations.
* Shared data-access or API-client infrastructure.

Do not implement complete feature screens merely because they appear in the Sprint.

A route or placeholder may exist when required for architecture, but it must not falsely represent an implemented product feature.

---

## Step 10 — Implement Cross-Cutting Infrastructure

Implement cross-cutting technical concerns defined by the Architecture.

Examples include:

* Logging.
* Error handling.
* Validation infrastructure.
* Security middleware.
* Authentication infrastructure.
* Authorization infrastructure.
* Observability hooks.
* Shared utilities.
* Request correlation.
* Configuration validation.
* Dependency injection.

Only implement capabilities that belong to the technical foundation or are explicitly required by the approved architecture.

Do not add infrastructure because it is common in enterprise applications if the project does not require it.

---

## Step 11 — Implement Integration Boundaries

When external services or subsystems are part of the approved architecture, implement the integration boundary required for future development.

Prefer:

```text
Application
    ↓
Defined Interface
    ↓
Adapter / Integration Boundary
    ↓
External Service
```

Avoid coupling application logic directly to external infrastructure when the architecture explicitly defines an abstraction.

Do not invent external services, APIs, providers, or contracts.

If an external integration is not sufficiently defined, implement only the interface or configuration boundary that is justified and document the remaining uncertainty.

---

## Step 12 — Establish Developer-Ready Extension Points

The implementation should make future user-story development predictable.

Verify that developers can identify:

* Where feature logic belongs.
* Where API endpoints belong.
* Where UI screens belong.
* Where persistence logic belongs.
* Where integrations belong.
* Where shared components belong.
* Where configuration belongs.
* Where tests will belong.

Provide clear and minimal extension points.

Do not pre-implement the business behavior that will be added later.

---

## Step 13 — Verify the Implementation Baseline

Perform the strongest available architecture-level verification without turning P06 into the full P07 Testing stage.

Verify, as applicable:

* The project compiles.
* The selected framework starts correctly.
* Dependency resolution succeeds.
* Configuration loads correctly.
* Architectural modules can be imported or initialized.
* The application shell can start.
* Required infrastructure connections can be initialized when safely testable.
* Basic static checks or linting pass when available.
* No obvious broken references remain.

Do not claim that product functionality works unless it has actually been implemented and verified.

The absence of user-story implementation is not itself a P06 failure.

---

## Step 14 — Review Scope Boundaries

Before finishing, inspect the changes for accidental story implementation.

Look for:

* Feature-specific business logic.
* Story-specific controllers.
* Story-specific screens.
* Product-specific workflows.
* Hard-coded demo behavior.
* Fake data presented as real functionality.
* Unapproved dependencies.
* Unapproved infrastructure.

Remove or document any change that exceeds the P06 implementation boundary.

---

## Step 15 — Generate the Implementation Log

Create:

```text
artifacts/06_implementation/IMPLEMENTATION_LOG.md
```

The log must describe the actual state of the implementation, not the intended state.

Document:

* What was implemented.
* Which architecture elements were implemented.
* Which source files were created or modified.
* Which shared foundations were established.
* Which Sprint stories were intentionally left for future implementation.
* Which UX foundations were implemented.
* Which assumptions were required.
* Which architecture elements remain incomplete.
* Which blockers remain.
* How implementation can be extended safely.

---

# 7. IMPLEMENTATION PRINCIPLES

## 7.1 Architecture Is the Primary Technical Contract

The approved Architecture defines what technical foundation P06 must implement.

Do not substitute personal preferences for approved decisions.

If the architecture is inadequate, identify the issue rather than silently redesigning it.

---

## 7.2 Implement the Foundation, Not the Backlog

P06 must optimize for:

```text
Architecture
+
Shared Infrastructure
+
Developer Readiness
+
Future Extensibility
```

not:

```text
Architecture
+
All Sprint Stories
```

The distinction is mandatory.

A technically complete application feature is outside the P06 boundary when it exists solely to satisfy a user story.

---

## 7.3 Real Code Over Empty Scaffolding

Do not generate meaningless placeholder files simply to mirror an architecture diagram.

Use minimal real implementations for:

* Entrypoints.
* Configuration.
* Interfaces.
* Shared infrastructure.
* Framework bootstrapping.
* Integration boundaries.
* Persistence infrastructure.
* UX foundations.

A placeholder is acceptable only when the corresponding implementation is intentionally deferred and the placeholder does not falsely imply that the feature exists.

---

## 7.4 Minimal Complexity

Prefer:

* Simple modules.
* Clear boundaries.
* Existing framework capabilities.
* Small dependency sets.
* Explicit interfaces.
* Maintainable code.
* Straightforward configuration.

Avoid unnecessary:

* Abstractions.
* Frameworks.
* Libraries.
* Microservices.
* Code generation.
* Design patterns.
* Infrastructure.
* Optimization.

---

## 7.5 Existing Repository Conventions

Preserve established conventions where they do not conflict with the approved architecture.

Examples include:

* Naming.
* File organization.
* Formatting.
* Linting.
* Error handling.
* Testing structure.
* Configuration conventions.

Do not rewrite unrelated code merely to match personal preferences.

---

## 7.6 Security

Implement the security foundations explicitly required by the architecture.

Never:

* Hard-code secrets.
* Commit credentials.
* Disable security checks to simplify implementation.
* Trust external or user input without appropriate boundaries.
* Create insecure development defaults without documenting the risk.

Security mechanisms must remain consistent with the approved architecture.

---

## 7.7 Dependency Discipline

Before adding a dependency, consider:

* Whether the current stack already provides the capability.
* Compatibility with the architecture.
* Maintenance status.
* Security implications.
* License considerations when relevant.
* Complexity introduced.

Do not add dependencies for trivial functionality that the current stack already supports.

---

# 8. TRACEABILITY

Maintain traceability between implementation and approved architecture.

Where identifiers exist, preserve them.

Use relationships such as:

```text
ARCH-001
    ↓
COMP-001
    ↓
Source Files / Modules
```

And when appropriate:

```text
UX-001
    ↓
Shared UI Foundation
```

Sprint items should be referenced only when the implementation establishes their technical prerequisites.

Do not claim:

```text
US-001 → IMPLEMENTED
```

unless the user story was actually implemented, which is outside normal P06 scope.

Prefer:

```text
US-001 → FOUNDATION_READY
```

when the architecture foundation required for the story has been established.

Do not invent identifiers that do not exist in source artifacts.

When source artifacts lack stable identifiers, reference the relevant section or component explicitly.

---

# 9. REQUIRED OUTPUTS

Generate and/or modify the project repository as required by the approved Architecture.

The implementation output consists of:

## 9.1 Source Code

Implement the architecture foundation directly in the project repository.

This may include:

* Source files.
* Configuration files.
* Dependency manifests.
* Migration infrastructure.
* API scaffolding.
* Application shell.
* Shared UI infrastructure.
* Integration boundaries.
* Development tooling.

Do not include unrelated feature development.

---

## 9.2 Implementation Log

Generate:

```text
artifacts/06_implementation/IMPLEMENTATION_LOG.md
```

Use exactly the following high-level structure:

```markdown
# Implementation Log

## 1. Document Metadata

- Version:
- Stage:
- Status:
- Generated From:
- Validation Dependency:

## 2. Implementation Scope

### 2.1 Implemented Foundation

### 2.2 Explicitly Deferred User-Story Work

### 2.3 Out of Scope for P06

## 3. Architecture Implementation

| Architecture ID | Component / Decision | Implementation Location | Status | Notes |
|---|---|---|---|---|

## 4. Project Structure

Describe the implemented repository and module structure.

## 5. Core Infrastructure

### 5.1 Application Bootstrap

### 5.2 Configuration

### 5.3 Dependencies

### 5.4 Persistence Foundation

### 5.5 API / Service Foundation

### 5.6 Security Foundation

### 5.7 Error Handling and Logging

### 5.8 Integration Boundaries

## 6. UX Foundation

### 6.1 Application Shell

### 6.2 Navigation / Routing Foundation

### 6.3 Shared UI Components

### 6.4 Design System / Theme

### 6.5 Accessibility / Responsive Foundation

## 7. Sprint Readiness

| Sprint Item | Required Foundation | P06 Status | Future Work |
|---|---|---|---|

## 8. Files Created or Modified

| File | Change | Reason | Related Architecture |
|---|---|---|---|

## 9. Implementation Verification

| Check | Result | Evidence |
|---|---|---|

## 10. Assumptions

| ID | Assumption | Impact |
|---|---|---|

## 11. Known Limitations / Blockers

| ID | Issue | Impact | Required Action |
|---|---|---|---|

## 12. Extension Guidance

Describe where future developers should implement feature-specific logic.

## 13. Traceability Summary

Describe the relationship between Architecture, UX, Sprint prerequisites, and the implemented foundation.

## 14. Implementation Status

Allowed values:

- READY
- READY_WITH_ASSUMPTIONS
- BLOCKED
```

The log must never state that deferred user stories are implemented.

---

# 10. STATUS RULES

## READY

Use when:

* The approved architecture has been implemented sufficiently as a technical foundation.
* Required UX foundations are present when applicable.
* Required development infrastructure is present.
* The project structure is coherent.
* The code respects architectural boundaries.
* The implementation can proceed to Testing.
* No material blocker remains.
* Deferred user stories are clearly distinguished from implemented foundation work.

---

## READY_WITH_ASSUMPTIONS

Use when:

* The architecture foundation is usable.
* Non-critical assumptions remain.
* Those assumptions are explicitly documented.
* Future story implementation can proceed without resolving every non-critical uncertainty.

---

## BLOCKED

Use when:

* The Architecture is missing or unusable.
* Architectural contradictions prevent implementation.
* Required technical decisions are absent and cannot safely be inferred.
* The codebase cannot establish the required architecture foundation.
* Critical dependencies or infrastructure are unavailable.
* The implementation cannot meet mandatory architecture requirements.
* Proceeding would require inventing project-specific behavior or redesigning the architecture without approval.

Do not use `BLOCKED` merely because user stories remain unimplemented. That is expected in P06.

---

# 11. FAILURE CONDITIONS

The generation should be considered invalid if:

* User stories are implemented as part of P06 without architectural justification.
* Story-specific business logic is generated merely because it appears in the Sprint.
* The approved architecture is silently redesigned.
* Unsupported technologies or infrastructure are introduced.
* Secrets are hard-coded.
* Fake feature implementations are presented as complete functionality.
* Architecture components are documented as implemented when they are not.
* The implementation contains major unresolved architectural contradictions that were not documented.
* Unnecessary complexity is introduced.
* The repository is modified without inspecting its current state.
* Unrelated files are rewritten without justification.
* The implementation cannot be traced to the approved Architecture or explicit technical needs.
* `IMPLEMENTATION_LOG.md` claims functionality that does not exist.
* The implementation log omits material blockers or assumptions.
* The output is presented as complete despite a blocking implementation failure.

---

# 12. SELF-VALIDATION BEFORE OUTPUT

Before finalizing the implementation, verify:

```text
[ ] Architecture was reviewed completely.
[ ] Sprint context was reviewed.
[ ] UX was reviewed.
[ ] System Prompt was followed.
[ ] Existing repository state was inspected.
[ ] Architecture components were mapped to implementation locations.
[ ] Core application structure was implemented.
[ ] Required configuration foundations were implemented.
[ ] Required persistence foundations were implemented when applicable.
[ ] Required API/service foundations were implemented when applicable.
[ ] Required UX foundations were implemented when applicable.
[ ] Required security foundations were implemented when applicable.
[ ] Required logging/error handling foundations were implemented when applicable.
[ ] Integration boundaries were implemented when defined.
[ ] Future extension points are clear.
[ ] User stories were not implemented merely because they appear in the Sprint.
[ ] Story-specific business logic was not introduced.
[ ] Fake feature implementations were not introduced.
[ ] No unsupported technology was introduced.
[ ] No secrets were hard-coded.
[ ] Dependency additions are justified.
[ ] Architecture boundaries are respected.
[ ] The implementation does not redesign approved architecture silently.
[ ] The project can be compiled, initialized, or otherwise verified at the strongest practical level.
[ ] Implementation verification evidence is recorded.
[ ] IMPLEMENTATION_LOG.md describes actual implementation state.
[ ] Deferred user stories are explicitly identified.
[ ] Assumptions are documented.
[ ] Blockers are documented.
[ ] Traceability is preserved.
```

---

# 13. FINAL RESPONSE

After implementing the foundation, report:

1. Implementation status.
2. Main architecture elements implemented.
3. Main shared foundations established.
4. User-story work intentionally deferred.
5. Important assumptions.
6. Important blockers or limitations.
7. Verification performed.
8. Whether the implementation is ready for P06 Code Review and P07 Testing.

Do not claim that the MVP is complete.

Do not claim that the Sprint stories are complete unless they were explicitly and legitimately implemented, which is outside the normal P06 boundary.

The output of this stage is an **implementation foundation**, not a completed product increment.

---

# 14. STAGE TRANSITION

If the implementation status is:

```text
READY
```

the project may proceed to:

```text
P06 Code Review
```

and, after successful validation:

```text
P07 — Testing
```

If the status is:

```text
READY_WITH_ASSUMPTIONS
```

the project may proceed only while carrying the documented assumptions forward.

If the status is:

```text
BLOCKED
```

return to the appropriate previous stage, normally P05 Architecture, when the blocker originates from an architectural decision, or remain in P06 when the blocker is implementation-specific.

The AI must not automatically advance the pipeline.
