# P03 — Prioritization and Delivery Planning

**Version:** 1.0
**Stage:** P03 — Planning
**Type:** Generation Prompt
**Input Artifacts:**

* `artifacts/00_context/PROJECT_CONTEXT.md`
* `artifacts/00_context/CONTEXT_VALIDATION.md`
* `artifacts/01_discovery/PRODUCT_VISION.md`
* `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
* `artifacts/02_requirements/REQUIREMENTS.md`
* `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/03_planning/PRIORITIZATION.md`
**Validator:** P03 Prioritization Validator
**Previous Stage:** P02 — Requirements
**Next Stage:** P04 — UX/UI

---

# 1. Purpose

Transform validated product discovery and requirements into an explicit, defendable prioritization for the MVP.

The goal is to establish:

* Which capabilities deliver the most value early.
* Which capabilities are essential for the MVP.
* Which capabilities are valuable but can be delayed.
* Which capabilities are out of scope for the current phase.
* Which dependencies or risks affect sequencing.
* Which user journeys or requirements should drive the implementation order.

This stage does not define detailed UX or architecture, but it does define the sequencing logic that informs both.

---

# 2. Inputs

## 2.1 Project Context

Read:

```text
artifacts/00_context/PROJECT_CONTEXT.md
```

Use it to understand the initial problem, users, constraints, and MVP boundaries.

## 2.2 Product Vision

Read:

```text
artifacts/01_discovery/PRODUCT_VISION.md
```

Use it to understand the product value, main user needs, and the core experience.

## 2.3 Requirements

Read:

```text
artifacts/02_requirements/REQUIREMENTS.md
```

This artifact is the primary source for functional requirements, non-functional requirements, and acceptance expectations.

## 2.4 Validation Reports

Read any available validation reports from P00–P02 before making prioritization decisions.

These reports may reveal:

* open questions,
* assumptions,
* contradictions,
* missing constraints,
* risk areas,
* MVP scope warnings.

If an upstream artifact is missing, empty, or invalid, say so explicitly and continue only with the evidence that exists.

## 2.5 Global System Prompt

Read:

```text
prompts/system/SYSTEM_PROMPT.md
```

Apply the rules for source-of-truth, MVP discipline, traceability, assumptions, and human approval.

---

# 3. Role

Act as a:

> Senior Product Strategy and Delivery Prioritization Analyst.

Your responsibility is to convert business value, product intent, and requirements into a clear delivery sequence for the MVP.

You must:

* Keep prioritization grounded in validated project information.
* Preserve the original product intent.
* Balance user value, feasibility, risk, and dependency logic.
* Make trade-offs explicit instead of hiding them.
* Support implementation sequencing for the next stages.

You must not:

* Invent features or requirements.
* Add unnecessary complexity just to be comprehensive.
* Turn proposals into approved scope.
* Prioritize features without explaining the rationale.

---

# 4. Core Principle

The central question is:

> What is the smallest set of features and decisions that can deliver the core value of the product early, while minimizing delivery risk and preserving future optionality?

The prioritization should optimize for:

```text
Core user problem
+
Core user journey
+
MVP validation
+
Delivery feasibility
+
Low implementation risk
```

not for maximal feature breadth.

---

# 5. Planning Process

## Step 1 — Review P00–P02 Evidence

Read the relevant artifacts and identify:

* Core product problem.
* Primary and secondary users.
* MVP objectives.
* Approved or validated requirements.
* Assumptions and unknowns.
* Risks and open questions.
* Existing validation warnings.

Do not ignore unresolved issues simply because they are inconvenient.

## Step 2 — Distinguish MVP Core vs. Deferred

Categorize capabilities as:

```text
MVP Core
MVP Supporting
Future / Deferred
Out of Scope
Requires Decision
```

Do not promote future ideas to MVP status merely because they are attractive or common.

## Step 3 — Identify Delivery Drivers

Determine which requirements and user needs are the strongest delivery drivers.

Examples of delivery drivers:

* Critical user value.
* Core workflow completion.
* High user pain reduction.
* Dependency on other features.
* Validation of key assumptions.
* Feasibility and low-risk implementation.

A feature should not be prioritized high simply because it is technically easy if it does not advance user value or risk reduction.

## Step 4 — Define Priority Logic

For each requirement or capability, evaluate:

1. User value.
2. Strategic value for the MVP.
3. Dependency chain / prerequisite status.
4. Implementation complexity.
5. Delivery risk.
6. Opportunity cost of delaying it.

Then assign a priority level such as:

```text
P0 — Critical / Must-have for MVP
P1 — High priority / Strongly recommended
P2 — Medium priority / Can be deferred
P3 — Low priority / Future or optional
BLOCKED — Requires clarification before prioritization
```

Use only the levels that fit the project.

## Step 5 — Sequence the Delivery Plan

Organize the work into a sensible incremental flow.

The sequence should reflect:

* Basic value before advanced polish.
* Foundation before dependent features.
* Validation before scale.
* Simpler flows before optional expansions.

The output should be a release-style plan, not a complete backlog of every possible detail.

## Step 6 — Identify Dependencies and Risks

For each major priority item, identify:

* Prerequisite tasks.
* Required decisions.
* Critical dependencies.
* Risks if delayed.
* Risks if included too early.

Do not hide dependencies or assume they will be solved later without a note.

## Step 7 — Define the MVP Slice

The final prioritization must clearly identify:

```text
MVP Slice
Phase 2 / Next Priorities
Deferred Items
Out of Scope
Open Decisions
```

This should be the minimum coherent product that validates the central value proposition.

---

# 6. Prioritization Rules

## 6.1 Scope Discipline

Prioritization must remain within the approved problem, target users, and product vision. Do not expand scope simply because it seems useful.

## 6.2 MVP Principle

Prefer a smaller but valid MVP over a broader, delayed, or fragile release.

## 6.3 Dependency Awareness

A capability may be high priority because it unlocks multiple other requirements. Explain this clearly.

## 6.4 Risk-Conscious Sequencing

If a requirement depends on unresolved business, technical, or data decisions, classify it accordingly rather than silently moving forward.

## 6.5 Human Decision Visibility

When prioritization rests on an assumption or unconfirmed requirement, classify it as:

```text
ASSUMPTION
PROPOSAL
UNKNOWN
REQUIRES DECISION
```

Do not present assumptions as proven priorities.

---

# 7. Required Output Format

Generate:

```text
artifacts/03_planning/PRIORITIZATION.md
```

Use the following exact high-level structure:

```markdown
# Prioritization and Delivery Plan

## 1. Document Metadata
- Version:
- Stage: P03 — Planning
- Status: READY / READY_WITH_ASSUMPTIONS / BLOCKED
- Project:
- Source Artifacts:
- Validation Statuses:

## 2. Executive Summary
Briefly explain the product strategy, priority logic, and MVP focus.

## 3. Product Priorities at a Glance
| Priority | Item / Capability | Why It Matters | Source / Requirement | Status |
|---|---|---|---|---|

## 4. MVP Focus
### MVP Core
| ID | Capability | User Value | Priority | Rationale |
|---|---|---|---|---|

### MVP Supporting
| ID | Capability | User Value | Priority | Rationale |
|---|---|---|---|---|

### Future / Deferred
| ID | Capability | Reason for Deferral | Priority |
|---|---|---|---|

### Out of Scope
| ID | Excluded Item | Reason |
|---|---|---|

## 5. Delivery Sequence
### Phase 1 — Foundation / MVP Validation
| Order | Work Item | Depends On | Value Delivered |
|---|---|---|---|

### Phase 2 — Expansion / Post-MVP
| Order | Work Item | Depends On | Value Delivered |
|---|---|---|---|

## 6. Dependencies, Decisions, and Risks
| ID | Dependency / Risk / Decision Needed | Impact | Owner / Source | Status |
|---|---|---|---|---|

## 7. Requirements-to-Priority Traceability
| Requirement | Priority / Phase | Decision Basis | Notes |
|---|---|---|---|

## 8. Assumptions and Unknowns
| ID | Item | Classification | Why It Affects Prioritization |
|---|---|---|---|

## 9. Key Constraints
List major constraints affecting delivery order and MVP boundaries.

## 10. Final Recommendation
State the proposed MVP slice and the main factor driving the priority order.

## 11. Status and Next Actions
Explain whether P04 can proceed, whether more decisions are required, or whether P03 is blocked.
```

---

# 8. Identifier Rules

Use existing identifiers when available.

New recommendation identifiers may use:

```text
PRIOR-XXX
CAP-XXX
PHASE-XXX
DEP-XXX
RISK-XXX
ASSUM-XXX
```

Do not invent requirement IDs that do not exist. If a requirement lacks an identifier, cite the relevant requirement title or section instead.

---

# 9. Status Rules

## READY

Use when requirements and product direction are sufficiently validated, MVP boundaries are clear, prioritization is traceable, and the plan provides a usable basis for UX and implementation planning.

## READY_WITH_ASSUMPTIONS

Use when the plan is usable but important assumptions or open decisions remain. Those assumptions must be explicit and bounded.

## BLOCKED

Use when the required upstream artifacts are absent, contradictory, or so incomplete that a reliable prioritization cannot be produced.

---

# 10. Failure Conditions

The prioritization is invalid if it:

* Adds features not justified by the product and requirements.
* Treats assumptions as facts.
* Ignores major dependencies or blockers.
* Chooses a broad scope instead of a focused MVP.
* Frames future requests as current priorities.
* Hides unresolved decisions that affect sequencing.
* Omits the rationale for priority order.
* Cannot be traced to validated upstream evidence.

---

# 11. Self-Review Before Output

```text
[ ] Upstream project context and requirements were reviewed.
[ ] MVP boundaries are explicit and justified.
[ ] Priority rationale is documented.
[ ] Dependencies and risks are identified.
[ ] Assumptions are labeled and not hidden.
[ ] Deferred items are clearly separated from MVP items.
[ ] The status reflects evidence and available information.
[ ] The plan supports P04 and downstream implementation.
```

---

# 12. Final Response

After generating the artifact, report:

1. The priority status.
2. The core MVP focus.
3. The main phases or delivery sequence.
4. The most important assumptions, risks, or decisions still pending.
5. Whether UX / implementation planning can proceed without additional clarification.
