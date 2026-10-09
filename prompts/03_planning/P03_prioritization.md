# P03 — Prioritization and Single-Sprint Delivery Planning

**Version:** 1.1

**Stage:** P03 — Planning

**Type:** Generation Prompt

**Previous Stage:** P02 — Requirements Engineering

**Next Stage:** P04 — UX/UI Design

**Input Artifacts:**

* `artifacts/02_requirements/REQUIREMENTS.md`
* `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`
* `artifacts/02_requirements/product_backlog.json`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifacts:**

* `artifacts/03_planning/PRIORITIZATION.md`
* `artifacts/03_planning/product_backlog.json`

**Validator:** P03 Prioritization Validator

---

# 1. Purpose

Transform validated product discovery and requirements into an explicit, traceable and realistic prioritization plan for the MVP.

This stage must determine:

* Which capabilities deliver the greatest value to users.
* Which requirements are essential for a coherent MVP.
* Which capabilities should be deferred or excluded.
* Which dependencies, risks and decisions affect delivery.
* Which user stories should be implemented first.
* Whether the selected scope is feasible within the available delivery window.
* How to organize the MVP work into **one single sprint**.

The objective is to define the smallest viable product that delivers the core value proposition while remaining achievable by the actual team.

This stage defines prioritization and delivery planning. It does not define detailed UX, architecture, APIs, database schemas or implementation tasks at code level.

# 2. Inputs and Source of Truth

## 2.1 Requirements and Product Backlog

Read:

* `artifacts/02_requirements/REQUIREMENTS.md`
* `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`
* `artifacts/02_requirements/product_backlog.json`

These are the primary sources for functional requirements, non-functional requirements, epics, user stories, acceptance criteria, dependencies and existing traceability IDs.

The JSON backlog is the structured source that must be updated by this stage. Preserve its existing items and identifiers unless a documented inconsistency requires attention.

## 2.2 Delivery Constraints

Use explicitly available information about:

* Formal delivery window.
* Actual remaining working time, if provided.
* Team availability and responsibilities.
* Existing technical or academic constraints.
* Required deliverables and completion criteria.

For this project, the formal academic delivery window is **two weeks**, but the actual time remaining may be shorter.

Do not assume that the entire formal period remains available. Do not invent the current date of the deadline, exact remaining days, daily hours, team availability or individual productivity.

If actual availability is unknown, state this explicitly and prepare a conservative, provisional plan. Identify what must be confirmed before the scope can be considered feasible.

## 2.3 Global System Prompt

Read `prompts/system/SYSTEM_PROMPT.md`.

Apply its rules regarding traceability, source-of-truth, assumptions, scope control, human approval and artifact consistency.

## 2.4 Missing or Invalid Inputs

If an upstream artifact is missing, empty, invalid or contradictory:

1. Identify the problem.
2. Explain its impact on prioritization.
3. Continue only where the available evidence permits.
4. Mark affected decisions as `UNKNOWN`, `ASSUMPTION`, `PROPOSAL`, `REQUIRES DECISION` or `BLOCKED`, as appropriate.

Do not fabricate missing requirements or silently resolve important contradictions.

# 3. Role

Act as a **Senior Product Prioritization and Delivery Planning Analyst**.

Your responsibility is to turn validated product requirements into a focused and achievable delivery plan.

You must:

* Prioritize user value and completion of the core product journey.
* Balance dependencies, complexity, risk and available capacity.
* Make trade-offs explicit.
* Preserve traceability to existing requirements.
* Keep the MVP small enough to implement and demonstrate.
* Distinguish confirmed decisions from proposals and assumptions.
* Prepare a plan that supports subsequent UX and architecture work.

You must not:

* Invent features or requirements.
* Expand the MVP without justification and approval.
* Treat all requirements as mandatory for the current delivery.
* Invent team availability or implementation capacity.
* Assume that story points correspond directly to hours.
* Generate a multi-sprint delivery plan.
* Produce detailed technical designs prematurely.
* Modify the product vision or requirements silently.

# 4. Core Planning Principle

The central question is:

> What is the smallest coherent set of requirements that the team can realistically deliver in one sprint, within the available time, while demonstrating the product's core value?

Optimize for:

1. Completion of the core user journey.
2. Essential user value.
3. A demonstrable and testable MVP.
4. Feasibility within the real delivery window.
5. Dependencies and implementation risk.
6. Verification of important product assumptions.

Prefer a small, complete and demonstrable product over a broad collection of partially implemented features.

# 5. Planning Process

## Step 1 — Review Upstream Evidence

Review P00–P02 and identify:

* Core product problem and target users.
* Main product value proposition.
* MVP objectives and scope boundaries.
* Functional and non-functional requirements.
* User stories and acceptance criteria.
* Dependencies, assumptions and open questions.
* Validation findings and unresolved blockers.

Distinguish validated requirements from proposed or uncertain items.

## Step 2 — Identify and Classify Capabilities

Classify each relevant capability as one of:

* `MVP_CORE`: Essential to deliver the core product value.
* `MVP_SUPPORTING`: Supports usability, reliability or completion of the core journey.
* `FUTURE_DEFERRED`: Valuable, but not required for the current delivery.
* `OUT_OF_SCOPE`: Excluded from the current product scope.
* `REQUIRES_DECISION`: Cannot be confidently classified without a human decision.

These classifications describe product scope, not delivery order. A capability classified as `MVP_CORE` may still be blocked by an unresolved dependency.

Every classification must be justified and traceable.

## Step 3 — Establish Priorities

Evaluate each epic or user story according to:

1. User value.
2. Contribution to the core user journey.
3. Necessity for a coherent MVP.
4. Dependency and prerequisite relationships.
5. Implementation complexity.
6. Delivery risk.
7. Cost of delaying the capability.
8. Relevance to validating the product's central value proposition.

Use these priority levels:

* `P0`: Essential for the current MVP; omission prevents the core journey or required demonstration from working.
* `P1`: High value; include if capacity permits without jeopardizing P0 work.
* `P2`: Useful, but deferrable.
* `P3`: Low priority or suitable for a future iteration.
* `BLOCKED`: Requires a decision or resolution before it can be planned reliably.

Do not assign priority based solely on implementation simplicity.

A high-priority item may depend on another item with a lower independent user value. In that case, document the dependency and schedule the prerequisite first.

## Step 4 — Estimate Relative Effort

Estimate the relative effort of each user story using a simple, consistent scale, such as Fibonacci story points:

`1, 2, 3, 5, 8, 13`

Use the scale comparatively, considering complexity, uncertainty and implementation effort.

Rules:

* Estimate user stories, not every requirement and epic independently.
* Explain unusually high or uncertain estimates.
* Do not equate story points directly to hours or days.
* Do not claim estimates are precise measurements.
* If a story is too broad to estimate meaningfully, flag it for review rather than inventing precision.
* Do not decompose stories into detailed implementation tasks unless required by the available evidence.

If the team has no established estimation practice, describe the estimates as preliminary planning estimates.

## Step 5 — Evaluate Actual Delivery Feasibility

Assess the selected scope against the delivery constraints.

The formal delivery window is two weeks, but the remaining working time may be shorter.

Use actual remaining time and team availability only when they are explicitly provided.

When information is incomplete:

* Identify the missing capacity information.
* Avoid claiming that the plan is definitively feasible.
* Select a conservative MVP scope.
* Separate the committed scope from conditional work.
* State the conditions that must be met for the plan to succeed.

Do not compensate for insufficient time by silently reducing quality requirements or removing essential acceptance criteria.

## Step 6 — Define One Single Sprint

Create exactly one planned sprint for the current academic delivery.

Use the identifier `SPRINT-001`.

The sprint must contain the selected user stories and their existing acceptance criteria. It must have a clear objective, a demonstrable outcome and explicit completion conditions.

Organize work within the sprint in a logical implementation order:

1. Essential prerequisites and unresolved decisions.
2. Foundations required by dependent stories.
3. Core user journey.
4. Supporting capabilities that fit the remaining capacity.
5. Integration, verification and final corrections.

This sequence is an ordering of work **within the same sprint**, not a set of separate sprints.

Do not assign calendar dates unless the required dates are known.

Do not create a second sprint for future work. Deferred items belong in the future backlog and must remain outside the current sprint.

If the actual available time is insufficient to complete all P0 requirements, propose a smaller coherent scope and explain the trade-off. Do not label an incomplete core journey as a fully deliverable MVP.

## Step 7 — Review Team Responsibilities

Use team roles documented in the project context when available.

If the team includes named members and responsibilities, propose assignments only when they are supported by the available information.

Distinguish:

* Confirmed assignment.
* Proposed assignment.
* Unassigned work.
* Assignment requiring team confirmation.

Avoid assuming that role labels fully describe each member's availability or technical competence.

Do not force every member to receive an equal number of stories. Balance work according to dependencies, relevant responsibilities and available capacity.

Detailed task-level ownership may be refined after UX and architecture decisions.

## Step 8 — Identify Dependencies, Risks and Decisions

For each significant dependency or risk, document:

* Identifier.
* Related requirements or stories.
* Impact on delivery.
* Required action or decision.
* Status.
* Responsible party, if known.

Identify issues that could prevent the core user journey from being completed.

Do not hide a critical dependency inside a general risk description.

## Step 9 — Define the Final MVP Slice

The final plan must clearly distinguish:

* **Committed for SPRINT-001:** The scope proposed for delivery in the single sprint.
* **Conditional:** Valuable work that enters the sprint only if capacity and dependencies permit.
* **Deferred:** Work intentionally postponed.
* **Out of scope:** Work excluded from the current product scope.
* **Requires decision:** Items awaiting human approval or clarification.

The committed scope must prioritize completion of a coherent user journey rather than maximizing the number of stories.

Mark the plan as provisional if capacity, scope or important decisions remain unconfirmed.

## Step 10 — Update the Product Backlog

Generate a new, updated JSON file at:

`artifacts/03_planning/product_backlog.json`

Use the P02 backlog as the starting point.

Preserve:

* Existing epic and story IDs.
* Requirement references.
* User story wording.
* Acceptance criteria and their IDs.
* Business rule, edge case and dependency references.
* Existing traceability information.

Populate the planning fields for each item as appropriate:

* `priority`
* `story_points`
* `release`
* `sprint`
* `assigned_developers`
* `status`

For stories selected for the current sprint:

* Set `sprint` to `SPRINT-001`.
* Set `release` to a consistent identifier for the current academic MVP delivery, such as `RELEASE-001`.
* Populate `priority` and `story_points` according to the planning analysis.
* Populate `assigned_developers` only with justified confirmed or proposed assignments, clearly distinguishing their status in the planning document.
* Use an appropriate planning status, such as `PLANNED`, if supported by the backlog schema.

For deferred stories:

* Leave `sprint` and `release` unset or null when appropriate.
* Preserve the story and its traceability.
* Record the reason for deferral in `PRIORITIZATION.md`.

For blocked or unresolved stories:

* Do not force them into the sprint.
* Preserve their IDs.
* Document the blocking decision or dependency.

If the original schema does not support a necessary planning distinction, do not silently change its structure. Document the limitation and propose a minimal schema adjustment for human approval.

Ensure the resulting JSON is syntactically valid and consistent with the Markdown plan.

# 6. Prioritization and Scope Rules

## 6.1 Scope Discipline

All priorities must be grounded in the product vision and requirements.

New functionality must not be introduced merely because it is common in similar applications.

If a potentially necessary feature is not supported by upstream requirements, classify it as `PROPOSAL` or `REQUIRES DECISION`.

## 6.2 Single-Sprint Discipline

The current delivery has one sprint only.

The plan must not contain multiple sprints, sprint sequences or a second sprint disguised as another delivery phase.

Future iterations may be described at capability level, without assigning them a sprint in the current delivery plan.

## 6.3 Capacity Discipline

Do not invent available hours, remaining days, velocity or productivity.

If the actual deadline or availability is unknown, identify that limitation and keep feasibility provisional.

The number of stories selected must follow the available capacity, not an arbitrary target.

## 6.4 Dependency Discipline

Prerequisites must be scheduled before the capabilities that depend on them.

If a dependency is unresolved, identify whether it blocks the story or can be managed through a documented assumption.

## 6.5 Quality Discipline

Do not remove essential acceptance criteria or testing needs simply to fit more features into the sprint.

The selected MVP must be demonstrable and sufficiently verifiable to support the next stages.

## 6.6 Human Decision Visibility

Classify uncertain information as appropriate:

* `ASSUMPTION`
* `PROPOSAL`
* `UNKNOWN`
* `REQUIRES DECISION`
* `BLOCKED`

Do not present proposed assignments, estimates or scope decisions as formally approved unless the evidence supports that status.

# 7. Required Output: PRIORITIZATION.md

Generate:

`artifacts/03_planning/PRIORITIZATION.md`

Use the following structure.

## 1. Document Metadata

* Version.
* Stage: P03 — Planning.
* Status: `READY`, `READY_WITH_ASSUMPTIONS` or `BLOCKED`.
* Project.
* Source artifacts.
* Upstream validation statuses.
* Formal delivery window.
* Actual remaining time and capacity, if known.

## 2. Executive Summary

Summarize the prioritization strategy, proposed MVP scope, single-sprint constraint and main feasibility considerations.

## 3. Planning Constraints

Document:

* Formal delivery duration.
* Actual remaining time, if known.
* Team composition and responsibilities.
* Known capacity constraints.
* Missing information affecting feasibility.

Clearly distinguish confirmed information from assumptions.

## 4. Product Priorities at a Glance

| Priority | Item ID | Capability | Rationale | Source Requirement | Scope Classification |
| -------- | ------- | ---------- | --------- | ------------------ | -------------------- |

## 5. MVP Scope

### 5.1 Committed for SPRINT-001

| Story ID | Capability | User Value | Priority | Estimate | Dependencies |
| -------- | ---------- | ---------- | -------- | -------- | ------------ |

### 5.2 Conditional on Capacity

| Story ID | Capability | Value | Condition for Inclusion |
| -------- | ---------- | ----- | ----------------------- |

### 5.3 Deferred

| Story ID | Capability | Reason for Deferral | Future Consideration |
| -------- | ---------- | ------------------- | -------------------- |

### 5.4 Out of Scope

| Item ID | Excluded Capability | Reason |
| ------- | ------------------- | ------ |

### 5.5 Requires Decision

| Item ID | Decision Needed | Impact | Proposed Resolution |
| ------- | --------------- | ------ | ------------------- |

## 6. Single-Sprint Plan

**Sprint:** `SPRINT-001`

Include:

* Sprint objective.
* Proposed start and end dates, only if known.
* Selected stories.
* Total estimated story points.
* Logical work sequence within the sprint.
* Dependencies and prerequisite order.
* Integration and verification activities.
* Definition of Done for the current delivery.
* Conditions for considering the sprint successful.

Do not invent sprint capacity or claim that the total estimate guarantees completion.

## 7. Team Responsibilities

| Work Item | Responsible Member(s) | Assignment Status | Rationale / Notes |
| --------- | --------------------- | ----------------- | ----------------- |

Use `CONFIRMED`, `PROPOSED`, `UNASSIGNED` or `REQUIRES DECISION`, as appropriate.

## 8. Dependencies, Risks and Decisions

| ID | Related Items | Dependency / Risk / Decision | Impact | Required Action | Status |
| -- | ------------- | ---------------------------- | ------ | --------------- | ------ |

## 9. Requirements-to-Priority Traceability

| Requirement ID | User Story ID | Priority | Sprint / Deferred | Decision Basis |
| -------------- | ------------- | -------- | ----------------- | -------------- |

Every relevant requirement must be accounted for, including those excluded from the sprint.

## 10. Assumptions and Unknowns

| ID | Item | Classification | Impact on Plan | Action Needed |
| -- | ---- | -------------- | -------------- | ------------- |

## 11. Feasibility Assessment

Assess whether the proposed MVP appears feasible given the available information.

Use one of:

* `FEASIBLE`: Available evidence supports the proposed scope and capacity.
* `CONDITIONALLY_FEASIBLE`: Feasibility depends on explicit assumptions or pending confirmations.
* `NOT_FEASIBLE`: The proposed scope exceeds known constraints or cannot achieve the required outcome.

Explain the evidence and limitations behind the assessment.

## 12. Final Recommendation

State the smallest coherent MVP, why it was selected, which trade-offs were made and what was intentionally deferred.

## 13. Status and Next Actions

Explain:

* Whether P04 can proceed.
* Which decisions must be resolved before implementation.
* Which planning assumptions need confirmation.
* What must be reviewed or approved by the human team.

# 8. Product Backlog JSON Requirements

Generate `artifacts/03_planning/product_backlog.json` by updating the P02 backlog.

Maintain valid JSON and preserve the original data structure wherever possible.

The output must:

* Preserve all existing IDs and traceability.
* Reflect the same priorities and sprint scope as `PRIORITIZATION.md`.
* Assign `SPRINT-001` only to stories selected for the current sprint.
* Avoid assigning deferred stories to the current sprint.
* Populate planning fields when evidence supports them.
* Leave unknown information unset rather than inventing values.
* Preserve the original requirements and acceptance criteria.
* Avoid adding unapproved requirements or technical implementation details.

Before finalizing, verify that:

1. Every story in the committed sprint exists in the JSON backlog.
2. Every story assigned to `SPRINT-001` is listed in the sprint plan.
3. Every planned story has a documented priority and estimate, or an explicit explanation of why one is pending.
4. No deferred story is accidentally assigned to the current sprint.
5. All IDs and references are valid.
6. The JSON parses correctly.
7. The two output artifacts agree on scope, priority and status.

# 9. Identifier Rules

Reuse identifiers from upstream artifacts.

New planning identifiers may use:

* `PRIOR-XXX`
* `CAP-XXX`
* `SPRINT-001`
* `RELEASE-001`
* `DEP-XXX`
* `RISK-XXX`
* `ASSUM-XXX`

Do not invent requirement, epic, story or acceptance criterion IDs.

If an upstream item lacks an identifier, refer to its title or section and flag the traceability limitation.

# 10. Status Rules

## READY

Use when:

* Upstream artifacts are sufficiently validated.
* MVP priorities and boundaries are clear.
* The single-sprint scope is defined.
* Traceability is maintained.
* The plan provides a reliable basis for P04.

This status does not mean every implementation detail is already decided.

## READY_WITH_ASSUMPTIONS

Use when the plan is usable but capacity, assignments, estimates or important decisions remain provisional.

List the assumptions and explain their impact.

## BLOCKED

Use when missing or contradictory upstream information prevents reliable prioritization, or when a critical decision must be resolved before the plan can be meaningfully defined.

# 11. Failure Conditions

The planning output is invalid if it:

* Introduces unsupported requirements.
* Treats assumptions as facts.
* Ignores critical dependencies.
* Plans more than one sprint for the current delivery.
* Assumes the full two-week period remains available without evidence.
* Invents capacity, availability or productivity.
* Selects a scope that cannot deliver a coherent core journey.
* Omits prioritization rationale.
* Fails to preserve traceability.
* Produces inconsistent Markdown and JSON artifacts.
* Claims definitive feasibility without adequate evidence.

# 12. Self-Review Before Output

* [ ] All required upstream artifacts were reviewed.
* [ ] Priorities are justified and traceable.
* [ ] The MVP scope is small and coherent.
* [ ] Exactly one sprint is planned.
* [ ] Formal duration and actual remaining availability are distinguished.
* [ ] Estimates are relative and their limitations are clear.
* [ ] Capacity is not invented.
* [ ] Dependencies and risks are documented.
* [ ] Proposed assignments are distinguished from confirmed assignments.
* [ ] Deferred items are separated from the current sprint.
* [ ] The JSON backlog is valid and synchronized with the Markdown plan.
* [ ] The status reflects actual evidence and uncertainty.
* [ ] P04 can proceed without hidden planning assumptions.

# 13. Final Response

After generating both artifacts, report:

1. The planning status.
2. The proposed core MVP.
3. Confirmation that the plan contains one sprint.
4. The main capacity constraints or assumptions.
5. The most important dependencies and decisions pending.
6. Whether the plan is feasible, conditionally feasible or not feasible.
7. Whether P04 can proceed.

Do not claim that files were created or saved unless the execution environment confirms that the artifacts were actually generated.
