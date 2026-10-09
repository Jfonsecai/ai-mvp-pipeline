# P03 — Prioritization and Single-Sprint Planning Validator

**Version:** 1.1

**Stage:** P03 — Planning

**Type:** Validation Prompt

**Previous Stage:** P02 — Requirements Engineering

**Next Stage:** P04 — UX/UI Design

**Input Artifacts:**

* `artifacts/02_requirements/REQUIREMENTS.md`
* `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`
* `artifacts/02_requirements/product_backlog.json`
* `artifacts/03_planning/PRIORITIZATION.md`
* `artifacts/03_planning/product_backlog.json`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:**
`artifacts/03_planning/PRIORITIZATION_VALIDATION.md`

**Validator Role:** Independent Senior Planning Auditor and Software Delivery Quality Analyst

---

# 1. Purpose

Independently evaluate whether P03 has produced a coherent, traceable and realistic prioritization plan for the MVP, respecting the constraint of delivering the product in exactly one sprint.

The validator must determine whether:

* Priorities are supported by validated upstream artifacts.
* The MVP scope is small, coherent and justified.
* The single-sprint plan reflects the actual known delivery constraints.
* Estimates, dependencies, risks and assignments are handled responsibly.
* The structured product backlog agrees with the Markdown planning document.
* Deferred items remain outside the current sprint.
* Important assumptions and unresolved decisions are visible.
* The plan provides a reliable basis for P04 — UX/UI Design.

The validator must identify problems without modifying the source artifacts.

# 2. Validation Principles

## 2.1 Independence

Evaluate the planning artifacts against the upstream evidence and the requirements of P03.

Do not assume that the generation prompt was followed correctly merely because the expected sections are present.

## 2.2 Source of Truth

Use P02 as the source of requirements and acceptance criteria.

Use the original P02 `product_backlog.json` to compare the pre-planning requirements with the updated P03 backlog.

Use the P03 Markdown and JSON artifacts as the objects being validated.

## 2.3 No Silent Corrections

Do not:

* Modify the planning document or backlog.
* Invent missing information.
* Resolve business or product decisions on behalf of the team.
* Reprioritize requirements without documenting the finding.
* Change story IDs or acceptance criteria.
* Treat proposals as approved decisions.

Report findings and recommend corrections instead.

## 2.4 Evidence-Based Evaluation

Every significant finding must identify the affected artifact and, where possible, the relevant section, table row, requirement ID or story ID.

Distinguish:

* A confirmed defect.
* A reasonable recommendation.
* A missing piece of information.
* An assumption that requires confirmation.
* A disagreement that requires human judgment.

Do not report subjective preferences as objective failures.

# 3. Validation Workflow

## Step 1 — Verify Input Availability

Confirm that all required artifacts are available and readable.

If a required artifact is missing or invalid:

1. Identify it.
2. Explain which validations cannot be completed.
3. Continue with independent checks where possible.
4. Set the overall decision to `BLOCKED` if the missing artifact prevents a reliable overall assessment.

Do not assume that a missing validation report means its upstream artifact passed validation.

## Step 2 — Validate Upstream Readiness

Review the P00, P01 and P02 validation reports.

Identify unresolved findings that materially affect prioritization, scope or feasibility.

Check whether P03 acknowledges these issues rather than treating uncertain requirements as approved facts.

Not every upstream warning automatically invalidates P03. Evaluate its actual impact on the planning decision.

## Step 3 — Validate Prioritization Logic

Check whether priorities reflect:

* User value.
* Contribution to the core user journey.
* MVP necessity.
* Dependencies and prerequisites.
* Relative complexity.
* Delivery risk.
* Cost of delaying a capability.
* Importance for validating the product's value proposition.

Verify that the rationale is explicit and traceable.

Flag priorities that appear arbitrary, contradictory or unsupported.

Do not require a particular prioritization formula unless the project explicitly established one.

## Step 4 — Validate MVP Scope

Check whether capabilities are classified consistently as:

* `MVP_CORE`
* `MVP_SUPPORTING`
* `FUTURE_DEFERRED`
* `OUT_OF_SCOPE`
* `REQUIRES_DECISION`

Verify that:

* The MVP delivers a coherent core user journey.
* Supporting features do not unnecessarily expand the scope.
* Deferred items have defensible reasons for exclusion from the current delivery.
* Out-of-scope items do not contradict approved product requirements.
* Unresolved decisions are not presented as approved scope.
* High-priority items are not silently omitted from the sprint.

A capability may be essential to the MVP without being immediately implementable. Check whether its dependencies and blockers are explicitly documented.

## Step 5 — Validate the Single-Sprint Constraint

The current academic delivery must use exactly one sprint.

Verify that:

* The sprint identifier is `SPRINT-001`.
* Only one sprint is planned for the current delivery.
* The plan does not introduce a second sprint under another name.
* The implementation sequence represents ordering within the same sprint.
* Future work is deferred rather than assigned to another sprint in the current plan.
* The selected scope is justified against the actual available time and team capacity.
* The sprint objective describes a coherent and demonstrable outcome.

Flag any multi-sprint calendar, sprint sequence or conflicting sprint identifier.

Do not reject a plan merely because it describes future iterations at a high level, provided they are clearly outside the current sprint.

## Step 6 — Validate Estimates and Feasibility

Review the estimation method and the feasibility assessment.

Verify that:

* Estimates use a consistent relative scale or a clearly explained alternative.
* Estimates are not falsely presented as exact durations.
* Story points are not automatically converted to hours or days without a justified method.
* Capacity assumptions are explicitly identified.
* Unknown remaining days or team availability are not fabricated.
* The selected scope reflects known constraints.
* Conditional work is distinguished from committed work.
* The plan does not claim definitive feasibility when essential capacity information is missing.

Check the consistency of the feasibility classification:

* `FEASIBLE`
* `CONDITIONALLY_FEASIBLE`
* `NOT_FEASIBLE`

A plan with unknown capacity may still be useful, but its feasibility must remain appropriately qualified.

Do not assume that the formal two-week delivery window represents two fully available working weeks.

## Step 7 — Validate Team Responsibilities

Check whether assignments:

* Use team members and roles supported by the project context.
* Distinguish confirmed assignments from proposals.
* Avoid unsupported claims about individual availability or expertise.
* Identify unassigned work or assignments requiring a decision.
* Respect known dependencies and responsibilities.

Do not require perfectly equal workloads across team members.

Do not treat a proposed assignment as confirmed unless the evidence supports that status.

## Step 8 — Validate Dependencies, Risks and Decisions

Verify that significant dependencies and risks include:

* A unique identifier when appropriate.
* Affected stories or requirements.
* The expected impact.
* A required action or decision.
* A meaningful status.
* A responsible party when known.

Check that critical prerequisites are reflected in the implementation order.

Flag unresolved issues that could prevent the core user journey from working.

Do not require speculative risks to be presented as confirmed problems.

## Step 9 — Validate Traceability

Check the traceability chain:

`Product Vision → Requirement → User Story → Priority → Sprint or Deferral`

Verify that:

* Existing epic, requirement, story and acceptance criterion IDs are preserved.
* P03 does not invent IDs for upstream requirements.
* Relevant requirements are accounted for in the planning document.
* Every committed story can be traced to an existing P02 story.
* Every story selected for the sprint has a documented priority.
* Deferred stories remain traceable.
* Unsupported features are not introduced into the committed scope.

Flag missing or ambiguous links.

## Step 10 — Validate the Updated JSON Backlog

Compare the original P02 backlog with the updated P03 backlog.

Verify that:

* Both JSON files parse successfully.
* Existing epic and story IDs are preserved.
* Existing user story wording is not silently rewritten.
* Requirement references remain intact.
* Acceptance criteria and their IDs are preserved.
* Business rule, edge case and dependency references remain intact.
* Planning fields are populated where justified.
* Stories committed to the sprint use `SPRINT-001`.
* Deferred stories are not assigned to the current sprint.
* Blocked stories are not silently treated as committed work.
* Assignments and estimates are supported or explicitly provisional.
* No unapproved requirements have been added.

If the schema does not support an important distinction, report it as a schema limitation rather than assuming that the data is valid.

## Step 11 — Validate Cross-Artifact Consistency

Compare `PRIORITIZATION.md` and the updated `product_backlog.json`.

Check that:

* The committed story lists agree.
* Priority values agree.
* Sprint assignments agree.
* Estimates agree.
* Deferred items are consistent.
* The planning status is consistent with documented blockers and assumptions.
* Dependencies are represented consistently.
* No story appears as committed in one artifact and deferred or blocked in the other.

Report every material inconsistency with the affected IDs.

## Step 12 — Validate Readiness for P04

Determine whether the prioritization and delivery plan provide a sufficiently reliable basis for UX/UI Design.

Check that:

* The target MVP scope is understandable.
* The core user journey is identifiable.
* The user stories driving UX work are traceable.
* Important scope decisions are visible.
* Unresolved questions that affect UX are documented.
* The team can proceed without relying on hidden assumptions.

P03 does not need to settle detailed screen designs, interaction behavior or architecture decisions that belong to later stages.

# 4. Severity Classification

Assign a severity to each finding.

* `CRITICAL`: The plan is fundamentally unreliable, cannot be assessed, or violates the single-sprint constraint in a way that invalidates the delivery plan.
* `HIGH`: A significant defect affects MVP scope, traceability, feasibility, dependencies or the reliability of the backlog.
* `MEDIUM`: A material omission or inconsistency reduces planning quality but does not necessarily prevent P04 from proceeding.
* `LOW`: A minor documentation, clarity or consistency issue.

Each finding must include:

* Finding ID.
* Severity.
* Affected artifact.
* Affected section or item ID.
* Evidence.
* Explanation of the impact.
* Recommended correction.

# 5. Overall Validation Decision

Choose exactly one decision:

## PASS

Use when no critical or high-severity defects remain, the artifacts are consistent, the single-sprint constraint is respected, and P04 can proceed reliably.

## PASS_WITH_WARNINGS

Use when the plan is usable but has limited unresolved assumptions, medium/low findings or decisions that should be tracked.

Warnings must not conceal a fundamentally unworkable delivery plan.

## FAIL

Use when the artifacts are available but contain material defects that require correction before P03 can be considered valid.

Examples include unsupported priorities, serious traceability failures, contradictory scope decisions or inconsistent backlog assignments.

## BLOCKED

Use when missing inputs or unresolved critical decisions prevent a reliable validation.

Explain precisely what is missing and what must be supplied before validation can continue.

# 6. Required Output Format

Generate:

`artifacts/03_planning/PRIORITIZATION_VALIDATION.md`

Use the following structure.

## 1. Validation Metadata

* Validator version.
* Stage: P03 — Planning.
* Validation date, if known.
* Input artifacts reviewed.
* Upstream validation statuses.
* Overall decision.

## 2. Executive Summary

Summarize the quality of the prioritization plan, the main findings and whether P04 can proceed.

## 3. Input and Upstream Readiness Audit

| Artifact | Available | Status / Findings | Impact |
| -------- | --------- | ----------------- | ------ |

## 4. Structural Completeness Audit

Verify that both required output artifacts exist and that the Markdown document contains the required sections.

## 5. Prioritization Quality Audit

Evaluate the priority rationale, consistency and traceability to upstream evidence.

## 6. MVP Scope Audit

Evaluate committed, conditional, deferred, out-of-scope and decision-pending items.

## 7. Single-Sprint Compliance Audit

Explicitly confirm whether exactly one sprint is planned and whether all current sprint assignments use `SPRINT-001`.

## 8. Estimation and Feasibility Audit

Evaluate the estimation approach, capacity assumptions, delivery constraints and feasibility classification.

## 9. Team Responsibility Audit

Evaluate assignments, their evidence and whether proposed responsibilities are clearly distinguished from confirmed ones.

## 10. Dependency, Risk and Decision Audit

List material omissions, blockers and sequencing issues.

## 11. Traceability Audit

| Source Requirement | User Story | Planned Priority | Sprint / Deferral | Result |
| ------------------ | ---------- | ---------------- | ----------------- | ------ |

Include all relevant requirements or explicitly identify gaps.

## 12. JSON Backlog Integrity Audit

Report JSON validity, ID preservation, schema consistency and changes introduced by P03.

## 13. Cross-Artifact Consistency Audit

| Item ID | Markdown Value | JSON Value | Result | Finding |
| ------- | -------------- | ---------- | ------ | ------- |

Include only material differences, plus an explicit statement if no inconsistencies were found.

## 14. Findings Matrix

| Finding ID | Severity | Artifact | Evidence | Impact | Recommended Correction |
| ---------- | -------- | -------- | -------- | ------ | ---------------------- |

If no findings exist, state that explicitly.

## 15. P04 Readiness Assessment

State whether P04 can proceed and identify any decisions that must be resolved before UX work.

## 16. Final Decision

State `PASS`, `PASS_WITH_WARNINGS`, `FAIL` or `BLOCKED`.

Justify the decision based on the findings.

## 17. Auditor Integrity Statement

Confirm that the validator did not modify the source artifacts, invent requirements, silently resolve decisions or treat unsupported assumptions as facts.

# 7. Rules for Findings and Corrections

The validator must recommend corrections without directly applying them to the source artifacts.

When a finding requires a decision from the team:

1. Explain the issue.
2. Describe the available options when supported by evidence.
3. Identify the impact of each option.
4. Mark the item `REQUIRES DECISION`.
5. Do not choose an option on behalf of the team.

Do not require changes merely to match personal stylistic preferences.

Do not reject a reasonable, evidence-supported planning decision solely because another prioritization approach could also work.

# 8. Final Validation Checklist

* [ ] Required inputs are available and reviewed.
* [ ] Upstream findings that affect planning are acknowledged.
* [ ] Priorities have explicit rationales.
* [ ] MVP boundaries are clear and traceable.
* [ ] Exactly one sprint is planned.
* [ ] The sprint identifier is `SPRINT-001`.
* [ ] The implementation order respects dependencies.
* [ ] Estimates use a consistent approach.
* [ ] Capacity assumptions are explicit and not fabricated.
* [ ] Feasibility is qualified appropriately.
* [ ] Proposed and confirmed assignments are distinguished.
* [ ] Risks and open decisions are documented.
* [ ] Existing IDs and acceptance criteria are preserved.
* [ ] The updated JSON is valid.
* [ ] The Markdown and JSON artifacts are consistent.
* [ ] Deferred work remains outside the current sprint.
* [ ] P04 readiness is explicitly assessed.
* [ ] The overall decision follows the documented findings.

# 9. Stage Transition Rules

If the decision is `PASS` or `PASS_WITH_WARNINGS`, P04 may proceed using:

* `artifacts/03_planning/PRIORITIZATION.md`
* `artifacts/03_planning/PRIORITIZATION_VALIDATION.md`
* `artifacts/03_planning/product_backlog.json`

P04 must respect the validated MVP scope and should not silently reintroduce deferred work.

If the decision is `FAIL` or `BLOCKED`, correct the identified issues, update the relevant artifacts through the agreed workflow and rerun validation before treating P03 as complete.
