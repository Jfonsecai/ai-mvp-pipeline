# P05 — Software Architecture Validator

**Version:** 2.0
**Stage:** P05 — Architecture Validation
**Primary output:** `artifacts/05_architecture/ARCHITECTURE_VALIDATION.md`

## 1. Purpose

Independently validate the software architecture produced by P05.

Determine whether the architecture is:

* Aligned with the approved requirements and prioritized MVP scope.
* Consistent with the UX specification and its validation findings.
* Coherent in its components, responsibilities, interfaces, and conceptual data model.
* Traceable to the relevant requirements and backlog items.
* Proportionate to the MVP.
* Sufficiently defined to guide the next stage without concealing important uncertainties or decisions.

Your role is to evaluate the architecture, identify evidence-based findings, and determine readiness. Do not rewrite the architecture or silently correct its deficiencies.

## 2. Required Inputs

Read the following artifacts:

1. `artifacts/02_requirements/REQUIREMENTS.md`
2. `artifacts/03_planning/PRIORITIZATION.md`
3. `artifacts/03_planning/product_backlog.json`
4. `artifacts/04_ux/UX_SPEC.md`
5. `artifacts/04_ux/UX_SPEC_VALIDATION.md`
6. `artifacts/05_architecture/ARCHITECTURE.md`

The P03 backlog is the authoritative backlog for scope and prioritization. Do not require or use the original P02 backlog as an additional source of planning truth.

The architecture document is the object being evaluated, not an authoritative source for its own correctness.

## 3. Validation Principles

### 3.1 Independent assessment

Evaluate the architecture against the source artifacts rather than accepting its own claims.

A statement in `ARCHITECTURE.md` that a requirement is covered does not prove that the design actually supports it.

### 3.2 Evidence-based findings

Every material finding must reference:

* The relevant source artifact.
* The affected requirement, backlog item, component, interface, decision, or section, when identifiable.
* The observed issue.
* Its practical impact.

Use exact identifiers from the artifacts. Do not invent requirement or backlog IDs, and do not fabricate line numbers.

When a source does not provide enough information to establish a conclusion, state that limitation explicitly.

### 3.3 Scope discipline

Evaluate only the approved MVP scope and the architectural implications of documented constraints.

Do not fail the architecture for omitting functionality explicitly deferred or excluded from the MVP.

Do flag deferred functionality if the architecture unnecessarily depends on it or if its inclusion contradicts planning decisions.

### 3.4 Distinguish severity from readiness

A finding may be important without blocking the next stage.

Classify findings by severity and evaluate readiness separately. Do not automatically mark the architecture as blocked because a noncritical detail is missing.

### 3.5 No silent decisions

Check whether assumptions, proposals, unknowns, and required decisions are clearly labeled.

An unapproved technology choice must not be represented as an accepted project decision.

### 3.6 No unnecessary requirements

Do not demand specific technologies, patterns, diagrams, infrastructure, or implementation details unless they are justified by the input artifacts or necessary for a coherent architecture.

## 4. Input Readiness Check

Before validating the architecture:

1. Confirm that all six required artifacts are available and readable.
2. Confirm that the requirements and P03 backlog can be interpreted.
3. Confirm that the UX specification and validation findings are available.
4. Check whether the architecture document exists and includes enough content to assess.
5. Identify contradictions or missing information in the inputs that limit the validation.

If a required artifact is missing or unreadable, document the issue and mark validation `BLOCKED`.

If an input contains ambiguity or conflicting information, do not silently resolve it. Determine whether it affects architectural correctness or readiness.

Do not treat an unresolved issue originating in an input artifact as an architectural defect automatically. Record its origin and assess whether the architecture handled it responsibly.

## 5. Validation Checklist

Evaluate each category using the following statuses:

* `PASS`: sufficient evidence supports compliance.
* `PARTIAL`: some evidence exists, but an important gap or inconsistency remains.
* `FAIL`: a material requirement or architectural expectation is violated.
* `NOT_APPLICABLE`: the criterion genuinely does not apply; explain why.
* `NOT_VERIFIABLE`: available evidence is insufficient to reach a reliable conclusion.

Do not use `PASS` when the evidence is merely an unsupported assertion in the architecture document.

### A. Scope and Requirements Alignment

Verify that:

* Major in-scope requirements have an architectural response.
* The architecture supports the actual MVP rather than an expanded or imagined product.
* Required functional capabilities are represented by appropriate components or responsibilities.
* Significant non-functional requirements have corresponding architectural considerations.
* Requirement identifiers and descriptions are preserved accurately.
* No unsupported requirements are introduced as approved scope.
* Material requirement conflicts and ambiguities are documented.
* The architecture does not rely on functionality that planning explicitly deferred or excluded without justification.

### B. Planning and Backlog Alignment

Verify that:

* `PRIORITIZATION.md` and the P03 backlog are used as the planning references.
* The architecture respects the current scope classifications and priorities.
* Relevant in-scope backlog items can be mapped to architectural components or responsibilities.
* Dependencies between backlog items are not contradicted by the architecture.
* Blocked or decision-dependent items are not presented as unconditionally ready for implementation.
* Deferred work does not drive unnecessary complexity.
* The architecture does not modify priorities, scope, or delivery commitments.
* The original P02 backlog is not incorrectly treated as the authoritative planning version.

### C. UX and Design-System Alignment

Verify that:

* The architecture supports the navigation, information architecture, screens, and flows defined in `UX_SPEC.md`.
* Frontend and backend responsibilities are sufficiently clear for the specified experience.
* Data and capabilities needed by relevant screens are represented or explicitly identified as unresolved.
* Shared UI components and design tokens can be reused consistently.
* Loading, empty, validation, success, and error states are supported where specified.
* Accessibility and responsive behavior are addressed where required by the UX inputs.
* The architecture does not silently redesign or contradict the UX specification.
* Material findings in `UX_SPEC_VALIDATION.md` are handled appropriately.
* Unresolved UX issues that affect component boundaries, data needs, or interfaces are documented.

Do not require the architecture to reproduce the entire UX specification.

### D. Architectural Style and Simplicity

Verify that:

* The selected architectural style is described clearly.
* Its rationale relates to actual requirements, constraints, and MVP scope.
* Meaningful alternatives are considered when a consequential choice exists.
* Complexity is proportionate to the project.
* There is no unjustified adoption of microservices, distributed infrastructure, event-driven systems, or elaborate abstractions.
* Technology recommendations are distinguished from confirmed decisions.
* Missing stack decisions are acknowledged instead of invented.
* The architecture provides enough structure to guide implementation without over-specifying implementation details.

### E. System Context and Components

Verify that:

* The system boundary is understandable.
* Relevant actors and external dependencies are identified.
* Confirmed external dependencies are distinguished from proposals.
* Major components have clear responsibilities.
* Important responsibilities are neither missing nor ambiguously duplicated.
* Component boundaries support cohesive implementation.
* Component dependencies are understandable and consistent.
* Important components map to relevant requirements or backlog items.
* The system-context and component diagrams agree with the written description.

### F. Interfaces and Dependencies

Verify that:

* Significant interfaces identify their providers and consumers.
* Their purpose and conceptual information exchange are understandable.
* Validation, authorization, and error-handling responsibilities are clear where relevant.
* Allowed and prohibited component dependencies are sufficiently defined.
* Important integration assumptions are visible.
* The architecture identifies concrete contracts that must be agreed upon before dependent implementation proceeds in parallel.
* Interface descriptions are consistent with component responsibilities.
* The architecture does not invent unapproved endpoints, protocols, or integrations as settled decisions.

Do not require complete API schemas at this stage unless the inputs or architectural dependencies make them necessary.

### G. Conceptual Data Architecture

Verify that:

* The principal business entities and relationships are identified where relevant.
* Data ownership is clear for important entities.
* The architecture describes the main data flows.
* Responsibilities for creating, modifying, validating, and exposing data are understandable.
* Important integrity, lifecycle, and access constraints are considered.
* Data concepts are consistent with requirements, backlog items, and UX needs.
* The conceptual data diagram, when applicable, matches the written descriptions.
* Missing data requirements are identified rather than concealed.
* The architecture avoids unsupported attributes or unnecessary database-level detail.

### H. Security and Quality Attributes

Verify that:

* Relevant security and quality requirements have corresponding architectural responses.
* Authentication and authorization responsibilities are clear where applicable.
* Trust boundaries and client-input validation are considered.
* Sensitive information is appropriately protected where required.
* Error handling and logging do not introduce obvious security or privacy problems.
* Data integrity and unauthorized access are addressed where relevant.
* Testing and maintainability concerns are considered at an appropriate level.
* Availability, performance, recovery, or observability are addressed when supported by the inputs.
* Quantitative targets are not fabricated.
* Unspecified controls or targets are recorded as unknowns or required decisions.

Do not claim regulatory compliance or certification without evidence.

### I. Architectural Decisions and Traceability

Verify that:

* Significant decisions have unique ADR identifiers.
* Each important decision includes context, rationale, consequences, and status.
* Only explicitly established or approved choices are labeled `ACCEPTED`.
* Recommendations remain `PROPOSED` until approved.
* Relevant requirement and backlog identifiers are preserved.
* Component, interface, data, risk, and constraint identifiers are used consistently.
* The traceability matrix reflects the architecture rather than merely asserting coverage.
* Unmapped requirements and unresolved relationships are visible.
* Diagrams and written decisions do not contradict each other.

### J. Risks, Constraints, and Open Decisions

Verify that:

* Material architectural risks are documented.
* Risks have meaningful impacts and reasonable next actions.
* Severity or likelihood is not presented as established fact without evidence.
* Assumptions, unknowns, proposals, required decisions, and blockers are distinguished.
* Architectural invariants and constraints are explicit enough to guide implementation.
* Important decisions that affect parallel work are identified.
* No critical uncertainty is hidden in vague language.

### K. Implementation Readiness and Parallel Work

Verify that:

* The architecture provides a coherent implementation direction.
* Component responsibilities are clear enough to support task decomposition.
* Important dependencies are identifiable.
* Shared contracts that must be agreed upon before parallel implementation are specified.
* Implementation freedoms are distinguished from mandatory architectural constraints.
* The architecture does not invent developer availability, capacity, assignments, or delivery estimates.
* Remaining implementation details are intentionally deferred rather than accidentally omitted.
* The document states what must be resolved before dependent work can proceed safely.

### L. Document Quality and Internal Consistency

Verify that:

* The required architecture sections are present or explicitly marked not applicable.
* The document uses the required status vocabulary consistently.
* Diagrams are syntactically plausible Mermaid and match the written architecture.
* Identifiers are unique and consistently referenced.
* Tables and traceability mappings are readable.
* There are no major internal contradictions.
* The document distinguishes facts, assumptions, proposals, and unknowns.
* The final status is supported by the actual findings.

## 6. Severity Classification

Assign one severity to each finding:

* `CRITICAL`: the architecture cannot be relied upon for safe or coherent progression because of a fundamental flaw, major contradiction, or critical unresolved dependency.
* `HIGH`: a significant gap or inconsistency that must be resolved before the affected implementation can proceed safely.
* `MEDIUM`: a meaningful weakness that should be addressed but does not necessarily prevent the next stage from proceeding.
* `LOW`: a minor clarification, documentation improvement, or limited inconsistency.
* `INFO`: a useful observation without a confirmed defect.

Severity must reflect practical impact, not the number of words missing from a section.

## 7. Readiness Decision

Assign exactly one overall validation status.

### `PASS`

Use when:

* No critical or high-severity defects remain.
* The architecture is coherent and sufficiently traceable.
* The approved MVP scope and UX are respected.
* No material issue prevents progression to the next stage.

Minor findings may remain if they are documented and do not undermine readiness.

### `PASS_WITH_CONDITIONS`

Use when:

* The architecture is broadly coherent.
* No critical defect makes the design unreliable.
* One or more noncritical gaps or explicit decisions must be addressed before the affected implementation work proceeds.
* Conditions, responsible parties if known, and the affected work are clearly documented.

Do not use this status to conceal a fundamental architectural contradiction.

### `FAIL`

Use when material architectural defects remain, such as:

* A major in-scope capability has no viable architectural support.
* The architecture materially contradicts requirements, planning, or UX.
* Important component responsibilities or data ownership are incoherent.
* Significant interfaces or dependencies cannot be understood.
* Unapproved choices are presented as settled decisions in a way that undermines the design.
* The architecture is so incomplete or overengineered that it cannot reasonably guide implementation.

Explain the required corrections.

### `BLOCKED`

Use when validation cannot be completed reliably because a required input is missing, unreadable, or materially insufficient, or because an unresolved source conflict prevents a defensible assessment.

A blocked validation is not equivalent to proving that the architecture itself is defective.

## 8. Required Output Format

Generate `artifacts/05_architecture/ARCHITECTURE_VALIDATION.md` using this structure.

### 1. Validation Metadata

* Stage and validator version.
* Architecture document reviewed.
* Required inputs reviewed.
* Overall validation status: `PASS`, `PASS_WITH_CONDITIONS`, `FAIL`, or `BLOCKED`.
* Short justification.

### 2. Input Readiness

A table containing:

* Artifact.
* Availability and readability.
* Role in validation.
* Limitations or conflicts.

### 3. Executive Assessment

Summarize:

* Overall architectural quality.
* Scope and UX alignment.
* Main strengths.
* Most important unresolved concerns.
* Whether the architecture can guide the next stage.

### 4. Validation Scorecard

A table containing each category A–L, its status, concise evidence, and any finding IDs.

Do not calculate a numeric score or percentage unless the project explicitly defines a scoring method.

### 5. Detailed Findings

Assign unique identifiers such as `AV-001`.

For each finding, include:

* ID.
* Severity.
* Category.
* Status or issue.
* Evidence and source artifact.
* Affected requirement, backlog item, component, interface, ADR, or architecture section.
* Practical impact.
* Recommended correction or next action.
* Whether the finding blocks the next stage or only affected implementation work.

If there are no findings in a category, state that no material issue was identified based on the available evidence.

### 6. Traceability Review

Summarize whether the architecture correctly connects:

* Requirements to architectural responses.
* In-scope backlog items to components and responsibilities.
* UX flows and screens to frontend capabilities and required data.
* Architectural decisions to their evidence and constraints.

List material gaps and affected identifiers. Do not duplicate the full architecture traceability matrix unless needed to explain a finding.

### 7. Scope and Consistency Review

Report any:

* Unjustified scope expansion.
* Deferred features influencing the architecture unnecessarily.
* Conflicts between requirements, planning, UX, and architecture.
* Contradictions between diagrams and written descriptions.
* Unsupported technology or integration assumptions.

### 8. Readiness Conditions

List every condition that must be resolved before the affected work proceeds.

For each condition, include:

* Condition ID, such as `COND-001`.
* Required action.
* Reason.
* Related finding IDs.
* Affected work or dependency.
* Owner or deadline only if explicitly known.

If no conditions are needed, state that explicitly.

### 9. Strengths and Nonblocking Improvements

List meaningful strengths and optional improvements separately from defects that must be corrected.

Do not inflate this section with generic praise.

### 10. Final Recommendation

State:

* Final status.
* Whether the architecture is suitable for the next stage.
* What must be corrected or decided first.
* Whether the architecture document itself should be revised before proceeding.

Do not rewrite `ARCHITECTURE.md` as part of this validation task.

## 9. Failure Conditions

The validation is unacceptable if it:

* Evaluates the architecture without checking the source artifacts.
* Treats the architecture's own claims as sufficient evidence.
* Uses the P02 backlog instead of the P03 backlog as the planning reference.
* Invents source identifiers, requirements, approvals, or facts.
* Requires technologies or patterns not justified by the inputs.
* Ignores material UX validation findings.
* Fails to distinguish architecture defects from missing or contradictory inputs.
* Labels the architecture ready while overlooking critical defects.
* Marks the architecture blocked for minor issues that do not prevent reliable validation.
* Gives findings without evidence or practical impact.
* Rewrites the architecture instead of independently validating it.
* Produces a status that conflicts with the documented findings.

## 10. Final Instructions

Read all six required artifacts before completing the validation.

Evaluate the architecture against the source artifacts, not against an imagined ideal system.

Generate the complete validation report at:

`artifacts/05_architecture/ARCHITECTURE_VALIDATION.md`

Do not modify the source artifacts or the architecture document.

Do not invent missing information, silently resolve contradictions, or treat proposals as approved.

If validation is blocked, produce the report with the available evidence and clearly state what is missing.

Your final response should briefly report:

* The validation file generated.
* The overall validation status.
* The most important findings or conditions.
* Whether the architecture can proceed to the next stage.