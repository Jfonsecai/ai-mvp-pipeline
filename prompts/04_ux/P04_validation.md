# P04 — UX Specification and Visual Design System Validator

**Version:** 2.0
**Stage:** P04 Validation
**Output language:** English
**Output:** `artifacts/04_ux/UX_SPEC_VALIDATION.md`

## 1. Purpose

Evaluate whether the P04 UX specification is complete, consistent, traceable, and sufficiently detailed to guide the implementation of the approved MVP without requiring developers or AI agents to invent essential product behavior or independent visual conventions.

Validate both dimensions of the artifact:

1. **Functional UX:** information architecture, screens, navigation, interactions, user flows, states, accessibility, and responsive behavior.
2. **Visual design system:** visual direction, design tokens, reusable components, screen-level consistency, and rules for maintaining a coherent interface during parallel development.

The validation must determine whether the specification faithfully reflects the requirements and delivery scope established by P02 and P03.

Follow `prompts/system/SYSTEM_PROMPT.md` for global rules.

## 2. Inputs

Read and cross-reference all the following artifacts.

### Product definition and requirements

* `artifacts/02_requirements/REQUIREMENTS.md`
* `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`

### Prioritization and delivery scope

* `artifacts/03_planning/PRIORITIZATION.md`
* `artifacts/03_planning/PRIORITIZATION_VALIDATION.md`
* `artifacts/03_planning/product_backlog.json` — updated P03 backlog.

### UX specification under validation

* `artifacts/04_ux/UX_SPEC.md`

### Global rules

* `prompts/system/SYSTEM_PROMPT.md`

Use P02 as the source of truth for requirements and P03 as the source of truth for priorities and delivery scope.

Do not assume that the UX specification is correct merely because it references an upstream artifact.

## 3. Preconditions and validation behavior

Before evaluating the UX specification:

1. Verify that all required input artifacts exist and are readable.
2. Review the P02 and P03 validation results.
3. Determine whether upstream blockers or invalid decisions affect the UX specification.
4. Identify contradictions between the UX specification and upstream artifacts.
5. Confirm that the specification targets the single current sprint, `SPRINT-001`.

If an essential input is missing, unreadable, or invalid, document the issue and use `BLOCKED` when reliable validation cannot proceed.

If an upstream artifact is itself blocked, determine whether that blocker prevents UX validation. Do not automatically treat every upstream warning as a P04 failure.

Distinguish between:

* A defect in the P04 specification.
* An unresolved upstream decision.
* A reasonable, explicitly documented assumption.
* A proposed improvement that has not been approved.

Do not silently correct the artifact being validated. Report the issue and recommend a correction.

## 4. Validation criteria

### 4.1. Structural completeness

Verify that `UX_SPEC.md` contains all required sections:

1. Document metadata and status.
2. UX objectives and design principles.
3. Visual direction.
4. Design tokens.
5. Shared component library specification.
6. Information architecture and navigation.
7. Screen inventory.
8. Screen-level specifications.
9. User flows.
10. UX coverage and traceability matrix.
11. Assumptions, proposals, and open decisions.
12. Handoff to P05 and implementation.
13. Final self-review.

Check that the document has a valid status: `READY`, `READY_WITH_ASSUMPTIONS`, or `BLOCKED`.

A section is not complete merely because its heading exists. Evaluate whether it contains meaningful, consistent, actionable information.

### 4.2. Upstream consistency and scope control

Verify that:

* The UX specification reflects the product vision and approved requirements.
* Screen and interaction decisions are consistent with P02.
* Scope classifications and delivery decisions are consistent with P03.
* The specification targets `SPRINT-001`, without introducing additional sprints.
* Deferred, out-of-scope, and decision-pending functionality is not presented as committed MVP functionality.
* No new product feature, business rule, role, permission, or workflow is silently introduced.
* Proposals and assumptions are clearly labeled and are not presented as approved decisions.
* Existing requirement and user-story IDs are preserved without changing their meanings.
* No nonexistent upstream IDs are used as evidence of traceability.

When the P02 and P03 artifacts disagree, report the conflict rather than choosing one interpretation without justification.

### 4.3. UX objectives and design principles

Verify that:

* UX objectives derive from the product vision and approved requirements.
* Design principles support the actual users and workflows.
* Usability, accessibility, readability, and responsive behavior are addressed where relevant.
* The document avoids generic statements that do not guide implementation.
* No unapproved business objective or functionality is introduced.

### 4.4. Visual direction

Verify that the visual direction provides a coherent, practical starting point for implementation.

Check whether it defines, as applicable:

* Overall visual style and intended user perception.
* Primary and secondary colors.
* Semantic colors for feedback states.
* Typography and text hierarchy.
* Spacing and sizing conventions.
* Borders, radii, shadows, and elevation.
* Iconography and image usage.
* Contrast, readability, and visual hierarchy.
* Responsive layout principles.

Evaluate specificity.

Examples of insufficient definitions include:

* “Use attractive colors.”
* “Choose a modern font.”
* “Make the interface responsive.”
* “Use consistent spacing.”

Prefer concrete values, token references, or verifiable rules.

A proposed default may be acceptable if it is explicitly identified as a proposal and does not contradict approved decisions. Do not fail a specification solely because a human has not yet approved a proposed visual direction; evaluate whether its status is clear and whether that approval is required before implementation.

### 4.5. Design-token quality and consistency

Verify that:

* Tokens have consistent names and defined values.
* Each token has an understandable intended use.
* Repeated visual decisions are centralized rather than duplicated with conflicting values.
* Colors, typography, spacing, radii, and other tokens are used consistently across the document.
* Token references used by components and screens actually exist.
* There are no unexplained conflicting definitions for the same visual purpose.
* Tokens are sufficiently concrete to be implemented in a frontend theme, CSS, or equivalent configuration.
* The specification does not mandate a framework or implementation technology without upstream justification.

Report redundant, undefined, conflicting, or unused tokens when they materially affect consistency.

Do not require every possible token category if it is irrelevant to the actual MVP interface.

### 4.6. Shared component library

Verify that each relevant shared component has:

* A stable P04 component ID.
* A clear name and purpose.
* Identified screens or contexts of use.
* Appropriate variants.
* Relevant interaction states.
* Expected behavior.
* References to applicable design tokens.
* Accessibility considerations where relevant.
* Traceability to screens or requirements when applicable.

Check that:

* Components reused across screens follow one consistent definition.
* Component names and IDs are stable throughout the document.
* Variants and states are not contradictory.
* Screen specifications reference shared components rather than redefining their styles independently.
* No unnecessary component complexity is introduced.
* The specification distinguishes UI components from backend modules, database entities, and API services.

A component inventory consisting only of names, without enough behavior or visual information to guide implementation, is insufficient.

### 4.7. Information architecture and navigation

Verify that:

* The application structure is understandable.
* Screen relationships and navigation destinations are explicit.
* Navigation supports the approved user stories.
* Entry points and relevant authentication or access boundaries match upstream requirements.
* Every referenced screen exists in the screen inventory.
* No unsupported role, permission, or navigation destination is introduced.
* Navigation is consistent across the specification.

### 4.8. Screen inventory and screen-level specifications

Verify that:

* All necessary user-facing screens for the in-scope MVP are inventoried.
* Each screen has a stable ID, name, purpose, scope classification, and relevant traceability.
* Screen entry points, actions, destinations, dependencies, and shared components are identified.
* Screen specifications describe structure, information hierarchy, content, actions, and relevant states.
* Validation behavior matches the approved requirements.
* Loading, empty, error, success, disabled, or selected states are documented where applicable.
* Responsive behavior and accessibility are considered where relevant.
* Screen-specific styling follows the common visual direction and design tokens.
* Shared components are reused consistently.
* No screen introduces functionality outside the approved scope.

Evaluate implementation readiness. A screen is not adequately specified if a developer must invent essential business behavior, navigation outcomes, or component conventions to implement it.

Do not require irrelevant states or fields for every screen.

### 4.9. User flows and interaction behavior

Verify that:

* All important in-scope user journeys are documented.
* Each flow has a stable ID, goal, starting point, ordered steps, outcomes, and relevant traceability.
* Flow steps correspond to existing screens and supported user actions.
* Alternative paths, errors, and recovery behavior are documented where material.
* The flows agree with screen-level specifications.
* The flows do not introduce unsupported business rules or features.
* Unresolved decisions that prevent flow completion are explicitly identified.

A flow is incomplete if it ends at an undefined destination, relies on an unspecified essential action, or assumes behavior not supported by upstream requirements.

### 4.10. UX coverage and traceability

Validate the coverage matrix against both the P02 backlog and the updated P03 backlog.

Check that:

* Every in-scope user-facing MVP requirement is mapped to the relevant screens or flows.
* Every in-scope user story involving user interaction is mapped to relevant UX elements.
* Screen, flow, and component IDs exist and are used consistently.
* Existing requirement and user-story IDs are valid.
* Requirements classified as `NOT_UX_RELEVANT` have a reasonable explanation.
* `PARTIALLY_COVERED` and `NOT_COVERED` entries explain the gaps.
* A requirement is not marked `COVERED` merely because a related screen exists.
* Scope classifications agree with P03.
* Coverage claims are supported by actual content in the specification.

Accept only the following coverage statuses:

* `COVERED`
* `PARTIALLY_COVERED`
* `NOT_COVERED`
* `NOT_UX_RELEVANT`

An in-scope, user-facing MVP requirement marked `NOT_COVERED` is a significant defect. A material gap in a critical user flow may prevent approval even if the overall coverage matrix appears complete.

### 4.11. Assumptions, proposals, and unresolved decisions

Verify that:

* Assumptions, proposals, required decisions, and blockers are distinguishable.
* Each item explains its impact and affected screens, flows, or components.
* Decisions that affect essential functionality are not hidden inside screen descriptions.
* Unresolved decisions are consistent with the document status.
* No specific team member is assigned responsibility without supporting planning information.

A non-blocking assumption may be acceptable when explicitly documented. An essential unresolved decision that makes the interface incoherent must result in a blocker or an appropriate status downgrade.

### 4.12. Handoff readiness for P05

Verify that the handoff identifies the UX decisions that subsequent stages must preserve.

Check that it includes, where applicable:

* Visual direction and its approval status.
* Design tokens and naming conventions.
* Shared component specifications.
* Screen inventory and navigation.
* User flows and interaction states.
* Responsive and accessibility requirements.
* Unresolved UX decisions.
* Relevant requirement and story IDs.

Verify that P04 defines user-facing behavior and visual conventions without prematurely defining:

* API contracts.
* Database schemas.
* Backend architecture.
* Implementation code.
* Detailed implementation tasks.

The handoff must make it clear that P05 should respect the UX contract when defining the technical solution.

### 4.13. Parallel-development consistency

Assess whether multiple developers or AI agents could implement separate in-scope stories without independently inventing major visual or interaction decisions.

Check for:

* One shared source of truth for design tokens.
* Reusable component definitions.
* Consistent screen and component naming.
* Clear references from screens to shared components.
* Consistent feedback, validation, and interaction states.
* Sufficient responsive and accessibility rules.
* Explicitly documented exceptions.
* A clear mechanism for identifying unresolved decisions rather than silently improvising.

This criterion is essential. A visually descriptive document is not enough if it does not establish reusable conventions that prevent divergence during parallel implementation.

### 4.14. Scope, duplication, and premature technical decisions

Verify that the specification:

* Remains focused on UX and visual design.
* Avoids unnecessary repetition of shared definitions.
* Does not duplicate the global rules already established in `SYSTEM_PROMPT.md` without a clear reason.
* Does not invent implementation technologies or frameworks.
* Does not generate architecture, APIs, database structures, source code, or formal implementation plans.
* Does not expand the MVP beyond the P03 scope.

Report material scope violations and unnecessary complexity.

## 5. Defect severity

Classify each finding using one of the following severity levels:

* `CRITICAL`: A major contradiction, missing essential input, or fundamental defect prevents reliable validation or makes the specification unusable.
* `HIGH`: A significant requirements, scope, traceability, flow, or design-system defect prevents reliable implementation of important in-scope functionality.
* `MEDIUM`: A meaningful omission or inconsistency creates ambiguity or a risk of divergent implementations but does not invalidate the entire specification.
* `LOW`: A minor documentation, naming, or clarity issue with limited impact.

For each finding, provide:

* Finding ID, such as `P04-VAL-001`.
* Severity.
* Criterion.
* Affected artifact section.
* Evidence or a precise description of the issue.
* Why it matters.
* Recommended correction.

Do not invent line numbers or claim evidence that was not inspected.

Prioritize findings by implementation impact, not by the number of stylistic preferences involved.

## 6. Validation decision

Choose exactly one final decision.

### `PASS`

Use when:

* All critical criteria are satisfied.
* No critical or high-severity defects remain.
* In-scope, user-facing requirements have appropriate UX coverage.
* The visual system is sufficiently concrete and consistent.
* Shared components and design tokens support parallel frontend implementation.
* No unresolved essential decision prevents implementation.
* The handoff to P05 is clear.

### `PASS_WITH_WARNINGS`

Use when:

* No critical or high-severity defect prevents implementation.
* The UX specification is usable.
* Remaining issues are limited to manageable medium- or low-severity findings.
* Any assumptions or proposals are explicitly documented.
* The visual system remains coherent despite the outstanding issues.

### `FAIL`

Use when the specification contains material defects that require correction before it can be approved, such as:

* Significant missing UX coverage.
* Contradictions with approved requirements or scope.
* Inconsistent or unusable design tokens.
* Shared components with conflicting definitions.
* Important user flows that cannot be implemented coherently.
* Insufficient screen-level detail for critical MVP functionality.

Use `FAIL` when the inputs are available and validation can be performed, but the specification does not meet the acceptance criteria.

### `BLOCKED`

Use when validation cannot be performed reliably because essential input artifacts are missing, unreadable, or invalid, or upstream blockers prevent meaningful evaluation.

Also identify upstream decisions that must be resolved before UX can be finalized.

Do not use `BLOCKED` merely because minor visual preferences remain undecided if a reasonable, explicitly labeled proposal allows implementation to proceed.

## 7. Required validation report

Generate:

`artifacts/04_ux/UX_SPEC_VALIDATION.md`

Use the following structure.

### 7.1. Metadata

Include:

* Validator name and version.
* Artifact validated.
* Validation date, only if reliably available.
* Input artifacts inspected.
* Final decision: `PASS`, `PASS_WITH_WARNINGS`, `FAIL`, or `BLOCKED`.

### 7.2. Executive summary

Summarize:

* Overall readiness.
* Most important findings.
* Whether the UX specification supports consistent parallel development.
* Whether P05 can proceed.

Do not claim readiness if unresolved essential issues remain.

### 7.3. Criterion results

Provide a table:

| Criterion | Result | Severity | Evidence / notes |
| --------- | ------ | -------- | ---------------- |

Use `PASS`, `WARN`, `FAIL`, or `BLOCKED` for individual criterion results.

Include at least:

* Input integrity and upstream consistency.
* Structural completeness.
* Scope control.
* UX objectives and principles.
* Visual direction.
* Design tokens.
* Shared component library.
* Information architecture and navigation.
* Screen inventory.
* Screen-level specifications.
* User flows.
* UX coverage and traceability.
* Assumptions and open decisions.
* Handoff to P05.
* Parallel-development consistency.
* Separation of UX from technical architecture.

### 7.4. Findings

List all material findings using the severity format defined in Section 5.

If there are no findings, explicitly state that no material defects were identified.

### 7.5. Coverage summary

Summarize:

* Number of in-scope user-facing requirements reviewed.
* Number covered.
* Number partially covered.
* Number not covered.
* Number classified as not UX-relevant.
* Any important exceptions.

Use counts only when they can be reliably derived from the inspected artifacts. Do not estimate missing counts.

### 7.6. Visual-system assessment

Explicitly assess:

* Whether the visual direction is actionable.
* Whether design tokens are sufficiently concrete.
* Whether shared components are reusable and consistent.
* Whether screens reference the shared design system.
* Whether responsive and accessibility rules are adequate.
* Whether parallel frontend development is likely to produce a consistent result.

Identify any material gap between the documented design and what can be implemented reliably.

### 7.7. Required corrections and recommendations

Separate:

* Corrections required before approval.
* Recommended non-blocking improvements.
* Upstream decisions requiring human input.

For each correction, reference the finding ID and affected section.

### 7.8. Readiness for P05

Choose one:

* `READY`
* `READY_WITH_CONDITIONS`
* `NOT_READY`

Explain the decision.

`READY` requires an acceptable validation decision and no unresolved essential issue that prevents architecture design.

`READY_WITH_CONDITIONS` is appropriate when P05 can begin with clearly documented, non-blocking assumptions or conditions.

`NOT_READY` applies when material defects or upstream blockers prevent a reliable handoff.

### 7.9. Final recommendation

State the final validation decision, the most important reason for it, and the next action.

Do not silently modify `UX_SPEC.md` while validating it.

## 8. Output and completion rules

Create or update only:

`artifacts/04_ux/UX_SPEC_VALIDATION.md`

Do not modify the UX specification or upstream artifacts.

Do not generate source code, design assets, API contracts, database schemas, or architecture documents.

At completion, report:

1. Validation report created.
2. Final decision.
3. Critical and high-severity findings, if any.
4. Whether P05 is ready to proceed.
5. Any human decisions required.

Follow `prompts/system/SYSTEM_PROMPT.md` and preserve traceability throughout the report.
