# P04 — UX Specification and Visual Design System

**Version:** 2.0
**Stage:** P04 — UX Design
**Output language:** English
**Primary output:** `artifacts/04_ux/UX_SPEC.md`

## 1. Purpose

Transform the approved product requirements and delivery scope into a coherent, implementable UX specification and initial visual design system.

The output must allow multiple developers and AI agents to implement different user stories while preserving a consistent user experience, visual identity, component usage, navigation, and interaction behavior.

This stage defines **what users see and how they interact with the product**. It also establishes the visual rules that the frontend must follow.

It does not define the software architecture, API contracts, database schema, backend implementation, or source code. Those belong to P05 and subsequent stages.

Follow `prompts/system/SYSTEM_PROMPT.md` for global project rules.

## 2. Inputs

Read and cross-reference all the following artifacts:

### Product definition and requirements

* `artifacts/02_requirements/REQUIREMENTS.md`
* `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`

### Prioritization and delivery scope

* `artifacts/03_planning/PRIORITIZATION.md`
* `artifacts/03_planning/PRIORITIZATION_VALIDATION.md`
* `artifacts/03_planning/product_backlog.json` — updated P03 backlog.

### Global rules

* `prompts/system/SYSTEM_PROMPT.md`

Use P02 as the authoritative source for product requirements and P03 as the authoritative source for priorities, scope classification, and current delivery decisions.


## 3. Preconditions and input validation

Before designing:

1. Verify that all required input artifacts are available and readable.
2. Review the P02 and P03 validation reports.
3. Check whether requirements and delivery scope are sufficiently clear to design the user experience.
4. Identify unresolved decisions, contradictions, missing information, and dependencies that affect UX.
5. Distinguish approved requirements from assumptions and proposals.

If essential inputs are missing, invalid, or blocked, do not fabricate a complete UX specification. Document the blocking issues and produce the output with an appropriate status.

If some non-critical details remain unknown, proceed only where reasonable. Mark those details as `ASSUMPTION` or `REQUIRES_DECISION` and explain their impact.

Do not silently resolve contradictions between upstream artifacts. Identify them and request a decision where necessary.

## 4. Scope and design principles

The UX specification must:

* Cover user-facing functionality included in the approved MVP scope.
* Reflect the single current delivery sprint, `SPRINT-001`, and the scope established by P03.
* Prioritize clarity, usability, consistency, accessibility, and implementation simplicity.
* Define a coherent visual language across all included screens.
* Prefer reusable components and shared design tokens over isolated styling decisions.
* Support independent development of user stories without allowing each developer to invent a different interface.
* Avoid unnecessary screens, interactions, components, or visual complexity.
* Preserve traceability to existing requirements and backlog items.
* Clearly separate current MVP design from future possibilities.

Do not introduce product functionality solely because it is common in similar applications.

If a screen, component, or interaction requires an unapproved business rule or essential product decision, document it as `REQUIRES_DECISION`.

A proposed improvement that is not part of the approved scope must be marked `PROPOSAL` and must not be treated as an approved MVP requirement.

## 5. Required output

Generate:

`artifacts/04_ux/UX_SPEC.md`

The document must use the following structure.

### 5.1. Document metadata and status

Include:

* Stage and version.
* Source artifacts.
* Current delivery scope.
* Sprint identifier: `SPRINT-001`.
* Overall status: `READY`, `READY_WITH_ASSUMPTIONS`, or `BLOCKED`.
* A brief explanation of the status.

Use `READY` only when the specification is sufficiently complete and no unresolved essential decision prevents implementation.

Use `READY_WITH_ASSUMPTIONS` when implementation can proceed with explicitly documented, non-blocking assumptions.

Use `BLOCKED` when essential decisions, contradictions, or missing inputs prevent a coherent specification.

### 5.2. UX objectives and design principles

Describe:

* The primary user needs the interface must support.
* The key usability objectives.
* The design principles that guide the experience.
* Relevant accessibility and responsive-design considerations.

Derive these from the approved product vision and requirements. Do not create new business objectives or functionality.

### 5.3. Visual direction

Define the initial visual identity of the application.

Include:

* Overall visual style and intended user perception.
* Color palette, including semantic colors for success, warning, error, and informational states where needed.
* Typography and text hierarchy.
* Spacing scale.
* Sizing and layout conventions.
* Border, radius, elevation, and shadow conventions where appropriate.
* Iconography and image usage.
* Principles for visual hierarchy, contrast, and readability.
* Responsive behavior for relevant screen sizes.

For each decision, provide a concrete value, rule, or clearly defined convention whenever feasible.

For example, define actual hexadecimal color values rather than only saying “use blue.” Specify a font family or a justified fallback rather than merely saying “use a modern font.”

Use a small, coherent visual system appropriate to the MVP. Avoid excessive tokens or decorative complexity.

If a value cannot be chosen responsibly from the available context, provide a reasonable proposed default and label it `PROPOSAL`, or mark it `REQUIRES_DECISION` if it materially affects implementation.

Do not claim that a proposed visual direction has been approved by a human.

### 5.4. Design tokens

Define a centralized set of design tokens that can later be implemented in CSS, a theme configuration, or another frontend-supported format.

At minimum, consider:

* `color-*`
* `font-family-*`
* `font-size-*`
* `font-weight-*`
* `line-height-*`
* `spacing-*`
* `radius-*`
* `shadow-*`
* `border-*`
* `breakpoint-*`

Only include tokens that serve an actual purpose in the specified interface.

For each token, document:

* Token name.
* Value.
* Intended usage.

Use consistent naming conventions. Components and screens must reference these tokens instead of independently inventing equivalent values.

This section defines the design contract, not a requirement to use a specific CSS framework or frontend library. Technical implementation choices belong to P05 unless already approved upstream.

### 5.5. Shared component library specification

Identify the reusable UI components required by the screens in scope.

Potential component categories include:

* Buttons and links.
* Text fields and form controls.
* Selectors and filters.
* Cards and list items.
* Navigation elements.
* Dialogs, notifications, and feedback messages.
* Loading indicators, empty states, and error states.

Include only components justified by the actual UX.

For each component, define:

* Component ID, such as `COMP-UX-001`.
* Name and purpose.
* Where it is used.
* Relevant variants.
* Relevant interaction states.
* Required behavior.
* Accessibility considerations.
* Design tokens used.
* Related screens and requirement IDs.

Where applicable, define states such as `default`, `hover`, `focus`, `disabled`, `loading`, `error`, or `selected`. Do not require irrelevant states for every component.

Components that appear in multiple screens must follow one shared specification.

Do not define backend components, API services, database entities, or software modules here. Those belong to the technical design stages.

### 5.6. Information architecture and navigation

Describe the structure of the application from the user's perspective.

Include:

* Main navigation areas.
* Screen hierarchy.
* Entry points and destinations.
* Navigation relationships.
* Relevant access or authentication boundaries, if established by the requirements.

Provide a text-based navigation diagram or structured list.

Do not invent user roles, access restrictions, or navigation destinations that are not supported by the upstream artifacts.

### 5.7. Screen inventory

Create a complete inventory of the screens needed to support the in-scope user-facing requirements.

For each screen, document:

* Screen ID, such as `SCR-UX-001`.
* Name.
* Primary user and purpose.
* Related requirement IDs and user-story IDs.
* Scope classification.
* Entry points.
* Main actions.
* Destination or navigation outcomes.
* Shared components used.
* Dependencies or unresolved decisions.

Include only screens required by the approved scope.

If a requirement is not user-facing, mark it as not UX-relevant in the coverage matrix rather than inventing a screen for it.

### 5.8. Screen-level specifications

Provide a functional and visual specification for every screen in the inventory.

For each screen, define:

**A. Structure and layout**

* Main regions and their order.
* Information hierarchy.
* Placement and grouping of content.
* Responsive adaptations where relevant.

**B. Content**

* Information displayed.
* Labels and meaningful interface text where useful.
* Required and optional fields.
* Validation and feedback messages.
* Data-dependent content, distinguishing known requirements from unresolved data decisions.

**C. Actions and interactions**

* Available user actions.
* Expected interface behavior.
* Navigation outcomes.
* Relevant validation rules already established by P02.
* Feedback after successful or unsuccessful actions.

**D. States**

* Initial or default state.
* Loading state, where relevant.
* Empty state, where relevant.
* Error state, where relevant.
* Success state, where relevant.
* Disabled or unavailable state, where relevant.

**E. Visual consistency**

* Components and design tokens used.
* Relevant layout and responsive rules.
* Accessibility considerations.

A screen specification must be detailed enough for frontend implementation without requiring the developer or AI agent to invent essential interaction behavior.

Do not repeat the complete definition of a shared component on every screen. Reference its component ID and describe only screen-specific behavior.

### 5.9. User flows

Document the end-to-end flows needed to complete the in-scope user stories.

For each flow, include:

* Flow ID, such as `FLOW-UX-001`.
* Name and goal.
* Primary user.
* Preconditions, where applicable.
* Starting screen.
* Ordered user actions and system responses.
* Destination or completion condition.
* Relevant alternative paths.
* Relevant error and recovery paths.
* Related screen IDs and requirement IDs.

Represent the flows using concise numbered steps or Mermaid diagrams where useful.

Cover failure and recovery scenarios that materially affect usability. Do not create new business rules to fill gaps in P02.

If a flow cannot be completed coherently because a required business decision is unresolved, identify the exact blocker.

### 5.10. UX coverage and traceability matrix

Map the user-facing requirements and user stories to the UX specification.

Include at least:

| Requirement / story ID | Scope | Screen IDs | Flow IDs | Component IDs | Coverage status | Notes |
| ---------------------- | ----- | ---------- | -------- | ------------- | --------------- | ----- |

Use these coverage statuses:

* `COVERED`: the relevant UX behavior is sufficiently specified.
* `PARTIALLY_COVERED`: some relevant behavior is specified, but a gap remains.
* `NOT_COVERED`: relevant UX behavior has not been specified.
* `NOT_UX_RELEVANT`: the requirement does not directly require a user interface.

Explain every `PARTIALLY_COVERED`, `NOT_COVERED`, or `NOT_UX_RELEVANT` classification.

Every in-scope, user-facing MVP requirement must have verifiable UX coverage. Every in-scope user story involving user interaction must map to the relevant screens or flows.

Do not mark a requirement as covered merely because a screen with a related name exists.

Preserve existing requirement and user-story IDs. Do not invent upstream IDs or modify their meanings.

### 5.11. Assumptions, proposals, and open decisions

Maintain a consolidated list of:

* `ASSUMPTION`: a reasonable, non-blocking interpretation used to proceed.
* `PROPOSAL`: an improvement or design choice that still requires review.
* `REQUIRES_DECISION`: an unresolved decision that affects the design or implementation.
* `BLOCKED`: an issue that prevents a coherent specification or implementation.

For each item, include:

* ID, using a P04-specific identifier where necessary.
* Description.
* Reason it matters.
* Affected screens, flows, or components.
* Impact on implementation.
* Recommended next action or responsible decision-maker, if known.

Do not assign responsibility to a specific team member unless that assignment is supported by the planning artifacts.

### 5.12. Handoff to P05 and implementation

Provide a concise handoff checklist identifying the UX decisions and artifacts that P05 and subsequent implementation stages must respect.

At minimum, include:

* Approved or proposed visual direction and its approval status.
* Design tokens and naming conventions.
* Shared component specifications.
* Screen inventory and navigation.
* Interaction behavior and user flows.
* Responsive and accessibility rules.
* UX requirements with unresolved decisions.
* Relevant requirement and story IDs.

State explicitly that P05 must preserve the UX contract when defining the technical architecture and frontend/backend integration.

The design tokens and component specifications must remain the single reference for visual decisions. If implementation requires a change to them, the change must be reviewed and documented rather than introduced independently in a user story.

Do not generate API contracts, database schemas, architecture diagrams, source code, or implementation tasks in this stage.

### 5.13. Final self-review

Before finalizing the document, verify:

* Every required input was considered.
* The output reflects the approved P02 requirements and P03 scope.
* The specification is limited to `SPRINT-001`.
* Every in-scope user-facing MVP requirement has appropriate UX coverage.
* All screens and flows have traceable IDs and relationships.
* Shared components and design tokens are defined consistently.
* Screen specifications reference the shared visual system.
* No screen introduces unapproved functionality.
* Unknown business behavior is not presented as a confirmed requirement.
* The document provides enough detail for consistent parallel frontend development.
* The handoff does not prematurely define technical architecture or backend contracts.
* Assumptions, proposals, blockers, and unresolved decisions are explicit.

If a material gap remains, document it and adjust the status accordingly. Do not claim completeness merely because every section contains text.

## 6. Output and completion rules

Create or update only:

`artifacts/04_ux/UX_SPEC.md`

Do not overwrite or modify P00, P01, P02, or P03 artifacts.

Do not generate the P04 validation report. That is the responsibility of `P04_validation.md`.

At completion, report:

1. Output artifact created.
2. Final status.
3. Main design decisions established.
4. Important assumptions or unresolved decisions.
5. Any blockers that prevent proceeding to P05.

Follow the global rules in `SYSTEM_PROMPT.md`. The specification is a proposed project artifact until it passes validation and receives any required human approval.