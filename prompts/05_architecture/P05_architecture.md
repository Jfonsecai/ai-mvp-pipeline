# P05 — Software Architecture

**Version:** 2.0
**Stage:** P05 — Architecture
**Primary output:** `artifacts/05_architecture/ARCHITECTURE.md`

## 1. Purpose

Define a coherent, implementation-ready software architecture for the MVP.

The architecture must translate the approved requirements, prioritized scope, and UX specification into a system structure that the development team can implement consistently, including when work is performed in parallel.

The architecture must be:

* **Traceable:** major architectural decisions connect to requirements, backlog items, UX needs, or explicit constraints.
* **Proportionate:** appropriate for an MVP and its actual scope.
* **Consistent:** components, responsibilities, interfaces, and data ownership do not contradict one another.
* **Implementable:** the team can understand the system boundaries, dependencies, and implementation constraints.
* **Adaptable:** unresolved decisions are visible rather than hidden behind unsupported assumptions.

This stage defines the architecture, not the implementation. Do not generate application code, complete database schemas, or exhaustive API specifications.

## 2. Required Inputs

Use only the following project artifacts as required inputs:

1. `artifacts/02_requirements/REQUIREMENTS.md`
2. `artifacts/03_planning/PRIORITIZATION.md`
3. `artifacts/03_planning/product_backlog.json`
4. `artifacts/04_ux/UX_SPEC.md`
5. `artifacts/04_ux/UX_SPEC_VALIDATION.md`

Do not require the original P02 backlog. The P03 backlog is the authoritative backlog for architecture scope because it reflects the planning and prioritization stage.

### Input authority

Use each artifact according to its purpose:

* **REQUIREMENTS.md:** source of truth for product requirements, constraints, and quality expectations.
* **PRIORITIZATION.md:** source of truth for delivery scope, priorities, and planning decisions.
* **P03 product_backlog.json:** source of truth for backlog item identifiers, current scope classification, priorities, dependencies, and related metadata.
* **UX_SPEC.md:** source of truth for user flows, information architecture, screen responsibilities, shared components, design tokens, and UX constraints.
* **UX_SPEC_VALIDATION.md:** source of validation findings, unresolved issues, and readiness concerns that may affect architectural decisions.

If these sources conflict, do not silently reconcile them. Record the conflict, identify the affected artifacts, and determine whether architecture can proceed safely.

Do not treat a proposed technology, assumption, or unresolved UX decision as approved merely because it appears in an artifact.

## 3. Input Readiness

Before designing the architecture:

1. Verify that all five required inputs are available and readable.
2. Confirm that the UX validation status and findings are understood.
3. Identify requirements or backlog items that are blocked, deferred, out of scope, or awaiting decisions.
4. Identify ambiguities that materially affect system structure, data ownership, integrations, security, or implementation feasibility.
5. Determine whether the available information is sufficient to produce a useful architecture.

If a required input is missing, do not fabricate its contents. If a material conflict or unresolved decision prevents a reliable architecture, document the issue and mark the deliverable `BLOCKED`.

Minor uncertainties that do not prevent a coherent design may be documented as assumptions, provided their implications are clear.

Do not repeat the full contents of the input artifacts. Extract only what is relevant to architectural decisions.

## 4. Role

Act as a senior software architect working with a small development team delivering an MVP.

Your responsibility is to establish the system structure, architectural boundaries, data ownership, interfaces, important quality requirements, and technical decisions needed to guide implementation.

Think in terms of a system that must work as a whole, not merely a collection of independent features.

Do not assume:

* A technology stack has been approved unless the inputs explicitly establish it.
* Team capacity, individual availability, or implementation effort.
* External services, integrations, hosting platforms, or infrastructure that are not supported by the inputs.
* That every proposed feature must be implemented in the MVP.
* That the architecture should use microservices, complex patterns, or additional infrastructure by default.

When a choice remains open, recommend the simplest reasonable option, explain its trade-offs, and label it `PROPOSAL` if approval is required.

## 5. Architecture Process

### Step 1 — Establish the architectural scope

Extract the requirements and backlog items that affect the architecture.

Identify:

* The system's primary capabilities.
* The users and external actors interacting with it.
* The requirements with significant architectural implications.
* The prioritized MVP scope.
* Supporting capabilities required for the MVP to function.
* Deferred or out-of-scope capabilities that must not drive unnecessary complexity.
* Dependencies between features that affect architectural sequencing.

Preserve existing requirement and backlog identifiers. Do not create new product requirements or silently change their scope.

If an item is marked `BLOCKED`, `FUTURE_DEFERRED`, `OUT_OF_SCOPE`, or `REQUIRES_DECISION`, respect that classification. Explain any architectural implications without treating the item as approved implementation scope.

### Step 2 — Identify architectural drivers

Identify the requirements and constraints that materially influence the design.

Consider, when relevant:

* Functional boundaries.
* Security, authentication, and authorization.
* Data integrity and ownership.
* Privacy and handling of personal information.
* Reliability and error handling.
* Maintainability and testability.
* Performance and scalability proportional to the MVP.
* Accessibility and usability constraints.
* Deployment and operational simplicity.
* External integrations and their failure modes.

For each significant driver, explain why it matters and connect it to its source identifier when one exists.

Do not invent quantitative quality targets. If a target is necessary but unspecified, record it as `UNKNOWN` or `REQUIRES_DECISION`.

### Step 3 — Define the system context

Describe:

* The system boundary.
* The primary actors and their interactions with the system.
* External systems or services explicitly required by the inputs.
* Trust boundaries and important data exchanges.
* Responsibilities that belong inside or outside the application.

Distinguish confirmed external dependencies from proposed ones. Do not introduce third-party services without a justified need.

Include a simple system-context diagram using Mermaid.

### Step 4 — Select and justify the architectural style

Choose an architectural style appropriate to the actual MVP scope, team constraints, and known requirements.

Consider alternatives only where they represent meaningful choices. For each relevant alternative, briefly describe:

* Benefits.
* Costs and complexity.
* Fit with the requirements and delivery scope.
* Reasons for selecting or rejecting it.

Prefer a simple, cohesive architecture unless the requirements justify additional separation.

Do not select microservices, event-driven infrastructure, distributed systems, or other complex patterns merely because they are common in production architectures.

If the technology stack is not established, separate:

* Architectural principles and structural decisions that can be made now.
* Technology recommendations that remain proposals.
* Decisions that must be resolved before implementation depends on them.

Do not confuse an architectural style with a particular framework or programming language.

### Step 5 — Define components and responsibilities

Identify the major logical components or modules required by the MVP.

For each component, specify:

* Unique identifier, such as `COMP-001`.
* Name and purpose.
* Main responsibilities.
* Responsibilities explicitly outside its boundary.
* Requirements and backlog items it supports.
* Data it owns or manages.
* Interfaces it exposes or consumes.
* Dependencies on other components.
* Important constraints or invariants.

Keep the component model at a level useful for implementation planning. Avoid decomposing the system into excessive classes, files, functions, or trivial modules.

Make responsibilities sufficiently clear that multiple developers can work on different components without relying on conflicting assumptions.

Include a component diagram using Mermaid.

### Step 6 — Define boundaries, dependencies, and interfaces

Establish the rules governing communication between components.

For each significant interface, specify:

* Unique identifier, such as `IF-001`.
* Provider and consumer.
* Purpose and expected interaction.
* Information exchanged at a conceptual level.
* Relevant authorization or validation requirements.
* Expected error or failure behavior.
* Related requirements and backlog items.

Identify allowed and prohibited dependencies between components.

Explain where API contracts, event contracts, or other concrete integration details will need to be defined before dependent work proceeds in parallel.

Do not invent complete endpoint lists, request/response schemas, or transport mechanisms unless the inputs explicitly require them or they are necessary to resolve an architectural decision. Label unapproved choices as proposals.

### Step 7 — Define conceptual data architecture

Identify the principal business entities and relationships required by the MVP.

For each important entity, specify:

* Unique identifier, such as `DATA-001`.
* Purpose.
* Conceptual attributes or information it represents.
* Relationships with other entities.
* Owning component.
* Important integrity, lifecycle, or access constraints.
* Relevant requirements and backlog items.

Explain the principal data flows and which component is responsible for creating, modifying, validating, and exposing each entity.

Address data consistency, validation, and persistence concerns where they affect the architecture.

Do not produce a complete physical database schema, exhaustive field definitions, or migration scripts. Avoid inventing attributes not supported by the requirements or UX. Any necessary but unresolved data decision must be recorded explicitly.

Include a conceptual data model diagram using Mermaid when the domain has meaningful entity relationships.

### Step 8 — Address security and quality concerns

Define architectural measures for the security and quality requirements identified in the inputs.

Consider, where relevant:

* Authentication and session handling.
* Authorization and access boundaries.
* Server-side validation and trust of client input.
* Protection of sensitive data.
* Secure configuration and secret management.
* Logging and error handling without exposing sensitive information.
* Data integrity and prevention of unauthorized changes.
* Testing boundaries and component testability.
* Maintainability and observability appropriate to the MVP.
* Backup, recovery, and availability where required.

For each significant concern, describe the architectural response and its traceability.

Distinguish required controls from recommended improvements. Do not claim compliance with standards, laws, or certifications unless the inputs establish the applicable requirements and the design supports that claim.

### Step 9 — Preserve the UX and design-system contract

Use `UX_SPEC.md` as the authoritative reference for the user experience.

Explain how the proposed architecture supports:

* The defined navigation and user flows.
* The specified screens and their responsibilities.
* Shared UI components and consistent component reuse.
* Design tokens and the visual system.
* Relevant loading, empty, validation, success, and error states.
* Accessibility and responsive behavior where specified.

Do not redesign the UX or introduce screens and flows without justification.

Keep the UX specification and implementation architecture at their appropriate levels. The architecture should establish the responsibilities and boundaries that allow the frontend to implement the UX consistently; it should not duplicate the full UX specification.

If the UX depends on a backend capability or data requirement that is missing or ambiguous, record the gap and its impact.

### Step 10 — Record architectural decisions

Document significant decisions in an Architecture Decision Record (ADR).

Assign identifiers such as `ADR-001`.

For each decision, include:

* Title.
* Status: `ACCEPTED`, `PROPOSED`, or `REQUIRES_DECISION`.
* Context and problem.
* Considered options, when meaningful.
* Decision or recommendation.
* Rationale and trade-offs.
* Consequences and risks.
* Related requirements, backlog items, components, or interfaces.

Use `ACCEPTED` only for decisions explicitly established by the inputs or otherwise formally approved. A recommendation generated during this stage must remain `PROPOSED` until approved.

Do not create an ADR for every minor implementation detail. Focus on decisions that materially affect component boundaries, data ownership, security, integration, deployment, or parallel development.

### Step 11 — Define implementation guidance

Explain the architectural rules the development team must follow.

Include:

* Component ownership and dependency rules.
* Data ownership and access rules.
* Interface and validation responsibilities.
* Security invariants.
* Shared frontend component and design-token reuse.
* Architectural constraints on testing and error handling.
* Dependencies that must be resolved before parallel implementation.
* Areas where implementation teams retain freedom to choose details.

Identify the minimum contracts that must be agreed upon before dependent backlog items can be implemented independently.

Do not prescribe a detailed sprint plan or invent developer assignments. Use the prioritized backlog as context, not as a reason to expand the architecture beyond the approved scope.

### Step 12 — Check traceability and consistency

Before finalizing, verify that:

* Major architectural components map to actual MVP needs.
* Significant requirements have an architectural response or a documented explanation for why none is required.
* In-scope backlog items are supported by the architecture at the appropriate level.
* Deferred and out-of-scope items do not drive unnecessary implementation.
* UX flows, screens, shared components, and data needs are not contradicted.
* Component responsibilities and dependencies are coherent.
* Data ownership is unambiguous for important entities.
* Significant interfaces have identifiable providers and consumers.
* Unapproved technology choices remain proposals.
* Risks, unknowns, and unresolved decisions are visible.
* The architecture is proportionate to the MVP.

Do not claim complete traceability if some mappings are unresolved. Document gaps explicitly.

## 6. Architecture Rules

### Scope and simplicity

* Design for the prioritized MVP, not an imagined future enterprise system.
* Prefer the simplest architecture that satisfies the supported requirements.
* Avoid unnecessary abstractions, infrastructure, services, and dependencies.
* Mention future extensibility only when it can be preserved without unjustified present-day complexity.

### Technology decisions

* Use only technologies explicitly approved in the inputs as confirmed decisions.
* If no stack is approved, provide a justified recommendation where useful and label it `PROPOSAL`.
* Do not fabricate hosting, database, framework, cloud, or third-party service decisions.
* Do not let a proposed technology silently become a project constraint.

### Traceability

* Preserve requirement and backlog IDs exactly as they appear in the input artifacts.
* Use unique IDs for architecture-specific components, interfaces, data concepts, decisions, risks, and architectural constraints.
* If an input item has no identifier, refer to its exact title or description rather than inventing an existing ID.
* Record the rationale for major decisions.

### Assumptions and unknowns

Use these labels consistently:

* `ASSUMPTION`: a temporary premise used to proceed.
* `UNKNOWN`: information not established by the inputs.
* `PROPOSAL`: a recommended option that has not been approved.
* `REQUIRES_DECISION`: an explicit decision needed from the project team.
* `BLOCKED`: an issue preventing a reliable architectural decision or safe progression.

For each important item, include its impact and the action or owner needed to resolve it, if known. Do not invent owners or deadlines.

### Security and privacy

* Treat client input as untrusted.
* Define authorization boundaries explicitly when relevant.
* Avoid exposing sensitive information through errors, logs, or interfaces.
* Do not assume that hiding a UI control is sufficient authorization.
* Make security responsibilities clear across components.

### Diagrams

* Use Mermaid for architecture diagrams.
* Keep diagrams consistent with the written component, interface, and data descriptions.
* Use simple diagrams that clarify boundaries and relationships.
* Do not create diagrams that imply unapproved technologies or integrations.

## 7. Required Output Format

Produce `artifacts/05_architecture/ARCHITECTURE.md` using the following structure.

### 1. Document Metadata

* Stage and version.
* Architecture status: `READY`, `READY_WITH_ASSUMPTIONS`, or `BLOCKED`.
* Inputs reviewed.
* Brief summary of the architecture.

### 2. Architectural Scope

* MVP capabilities covered.
* Relevant in-scope backlog items.
* Deferred or excluded capabilities that affect architectural boundaries.
* Scope limitations.

### 3. Architectural Drivers

* Important functional and quality drivers.
* Source references.
* Architectural implications.

### 4. System Context

* System boundary.
* Actors and external dependencies.
* Trust boundaries.
* Mermaid context diagram.

### 5. Architectural Style and Rationale

* Selected style.
* Justification.
* Meaningful alternatives and trade-offs.
* Confirmed decisions versus proposals.

### 6. Component Architecture

* Component inventory with IDs.
* Responsibilities and exclusions.
* Ownership, dependencies, and source traceability.
* Mermaid component diagram.

### 7. Interfaces and Interaction Rules

* Significant interfaces with IDs.
* Providers, consumers, purpose, and conceptual data exchanged.
* Validation, authorization, and error-handling responsibilities.
* Contracts that must be detailed before dependent implementation.

### 8. Conceptual Data Architecture

* Important data concepts and IDs.
* Relationships and ownership.
* Principal data flows.
* Integrity, lifecycle, and access constraints.
* Mermaid conceptual data diagram, where applicable.

### 9. Security and Quality Architecture

* Relevant quality attributes and constraints.
* Architectural responses.
* Responsibilities and limitations.
* Unspecified targets or controls requiring decisions.

### 10. UX and Design-System Alignment

* How the architecture supports the specified screens and flows.
* Frontend responsibilities and shared-component reuse.
* Design-token and visual-system preservation.
* UX dependencies, gaps, and unresolved issues.

### 11. Architectural Decision Records

* ADR inventory.
* Context, options, rationale, status, and consequences for significant decisions.

### 12. Architectural Risks and Open Issues

Use identifiers such as `RISK-001`.

For each issue, include:

* Description.
* Cause or uncertainty.
* Impact.
* Likelihood or severity only when supported; otherwise mark it `UNKNOWN`.
* Mitigation or next action.
* Related requirements, backlog items, components, or decisions.

### 13. Architectural Constraints and Invariants

Use identifiers such as `CR-001`.

Document rules that must remain true during implementation, including dependency boundaries, data ownership, authorization, interface contracts, and UX consistency.

### 14. Traceability Matrix

Map significant requirements and relevant in-scope backlog items to:

* Architectural components.
* Interfaces or data concepts, when applicable.
* Decisions or constraints, when relevant.
* Status or identified gaps.

Do not force irrelevant mappings. Mark missing or unresolved mappings explicitly.

### 15. Implementation Guidance and Parallelization

* Component boundaries suitable for independent work.
* Allowed and prohibited dependencies.
* Minimum shared contracts required before parallel implementation.
* Decisions that must be resolved before dependent work begins.
* Implementation details intentionally left open.

Do not assign developers or invent capacity.

### 16. Assumptions, Proposals, and Required Decisions

Consolidate important `ASSUMPTION`, `UNKNOWN`, `PROPOSAL`, and `REQUIRES_DECISION` items. Reference their detailed sections and explain their implementation impact.

### 17. Limitations and Next Steps

* What this architecture intentionally does not specify.
* Contracts or design details required before dependent stories are implemented.
* The most important next actions to make implementation safe and consistent.

### 18. Self-Review

Summarize the checks performed for:

* Scope alignment.
* Requirements and backlog traceability.
* UX consistency.
* Component and data ownership clarity.
* Interface and dependency clarity.
* Security and quality concerns.
* Decision status and unresolved issues.
* Suitability for MVP implementation.

## 8. Status Rules

Assign exactly one overall status:

### `READY`

Use when the architecture is coherent, aligned with the available inputs, and sufficiently defined for the next stage. No material unresolved issue prevents progression.

### `READY_WITH_ASSUMPTIONS`

Use when the architecture can proceed, but one or more explicit assumptions, proposals, or decisions still need confirmation. Explain which downstream activities may depend on them.

### `BLOCKED`

Use when a missing input, material contradiction, unresolved decision, or architectural risk prevents a reliable design or makes safe implementation planning impossible.

Do not mark the architecture `READY` merely because the document is complete.

## 9. Failure Conditions

The output is unacceptable if it:

* Requires or uses the obsolete P02 backlog instead of the updated P03 backlog as the planning reference.
* Introduces unsupported requirements or expands the approved MVP scope.
* Contradicts the requirements, prioritization, UX specification, or material UX validation findings without documenting the conflict.
* Treats proposed technologies or assumptions as approved decisions.
* Omits major components needed for in-scope capabilities.
* Leaves important data ownership or component responsibilities ambiguous.
* Defines dependencies that prevent the team from understanding how components interact.
* Ignores significant security, data-integrity, or quality constraints established by the inputs.
* Overengineers the system beyond what the MVP justifies.
* Produces diagrams inconsistent with the written architecture.
* Claims readiness while concealing material blockers.

## 10. Final Instructions

Read and analyze the five required inputs before writing the architecture.

Generate the complete Markdown document at:

`artifacts/05_architecture/ARCHITECTURE.md`

Do not modify the input artifacts.

Do not generate application code or unrelated deliverables.

Do not fabricate missing information, silently resolve contradictions, or treat proposals as approved decisions.

If the architecture is blocked, still produce the document with the available evidence, clearly identifying the blockers and the information or decisions needed to resolve them.

Your final response should briefly state:

* The output file generated.
* The architecture status.
* The most important assumptions, proposals, or blockers.
* Whether the architecture is suitable for the next stage and what must be resolved first.
