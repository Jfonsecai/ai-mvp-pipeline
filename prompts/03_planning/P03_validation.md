# P03 — Prioritization and Delivery Planning Validation

**Version:** 1.0
**Stage:** P03 — Planning
**Type:** Validation Prompt
**Input Artifacts:**

* `artifacts/00_context/PROJECT_CONTEXT.md`
* `artifacts/00_context/CONTEXT_VALIDATION.md`
* `artifacts/01_discovery/PRODUCT_VISION.md`
* `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
* `artifacts/02_requirements/REQUIREMENTS.md`
* `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`
* `artifacts/03_planning/PRIORITIZATION.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/03_planning/PRIORITIZATION_VALIDATION.md`
**Related Generation Prompt:** `prompts/03_planning/P03_prioritization.md`
**Previous Stage:** P02 — Requirements
**Next Stage:** P04 — UX/UI

---

# 1. Purpose

Validate whether the prioritization plan is a reliable, evidence-based, and appropriately scoped sequence for the MVP.

The validator must determine whether:

* The plan reflects valid upstream project context and requirements.
* The MVP scope is coherent and not inflated.
* Priority logic is justified and traceable.
* Deferred work is clearly separated from required MVP work.
* Assumptions, risks, and open decisions are explicitly labeled.
* The output supports planning and downstream UX / implementation work.

This is a **validation prompt**, not a redesign prompt.

---

# 2. Inputs

## 2.1 Project Context and Discovery

Read the validated upstream project context and product vision. These are the primary references for the product problem, target users, scope, and value proposition.

## 2.2 Requirements

Read the requirements artifact and its validation. These are the primary sources for deciding what matters most to the MVP and what can be deferred.

## 2.3 Prioritization Artifact

Read:

```text
artifacts/03_planning/PRIORITIZATION.md
```

This is the artifact being validated.

## 2.4 Global System Prompt

Read:

```text
prompts/system/SYSTEM_PROMPT.md
```

Apply the repository, traceability, MVP, and human-approval rules.

---

# 3. Role

Act as a:

> Senior Product Planning and Delivery Validation Auditor.

Your responsibility is to confirm that the prioritization plan is realistic, traceable, and aligned with the validated project direction.

You must not:

* Redesign the product.
* Reclassify features without justification.
* Convert assumptions into facts.
* Approve broad scope simply because it sounds useful.
* Allow hidden risk or dependency issues.

---

# 4. Core Validation Principle

The central question is:

> Does the prioritization plan reflect the validated product direction and requirement set in a way that supports a coherent MVP and a defensible delivery sequence?

Evaluate both:

1. Evidence quality.
2. Decision quality.

A plan may be polished but still invalid if it is not traceable or is too broad for the stated MVP.

---

# 5. Validation Process

## Step 1 — Validate Upstream Evidence

Check whether the project context, product vision, and requirements exist and are valid enough to support prioritization. If they are missing, weak, or contradictory, the prioritization plan cannot be considered reliable.

## Step 2 — Check MVP Focus

Verify that the plan clearly distinguishes:

* MVP core.
* MVP supporting capabilities.
* Future or deferred capabilities.
* Out-of-scope items.
* Requires-decision items.

A prioritization plan that includes an unbounded feature set is not a valid MVP prioritization.

## Step 3 — Evaluate Priority Logic

For each prioritized item, check whether the reasoning is grounded in:

* user value,
* product mission,
* dependency logic,
* risk reduction,
* feasibility,
* validated requirements.

Flag unsupported or vague priority reasons.

## Step 4 — Check Dependency and Sequencing Quality

Validate whether the phases and sequencing:

* respect dependencies,
* build value in an intentional order,
* avoid premature effort on optional work,
* support early validation of the key user flow.

A sequence that does not reinforce the MVP or user journey is weak.

## Step 5 — Check Traceability

For each important capability, determine whether it is traceable to:

* a requirement,
* a product vision objective,
* a user need,
* a validated constraint,
* or an explicit assumption.

Use the following categories:

```text
DIRECT
REFINED
ASSUMED
PROPOSED
UNSUPPORTED
CONTRADICTORY
```

## Step 6 — Check Risks, Assumptions, and Unknowns

Verify that all important risks and unresolved questions are visible and that the plan does not silently convert them into confirmed decisions.

## Step 7 — Validate Readiness for UX and Implementation

Determine whether the plan provides enough prioritization clarity for P04 and later implementation stages. If it does not, classify the result as `READY_WITH_ASSUMPTIONS` or `BLOCKED` as appropriate.

---

# 6. Validation Rules

## 6.1 MVP Discipline

The final plan must retain the MVP principle. It must not prioritize everything equally.

## 6.2 Importance of User Value

Priority should be derived from verified value and required product capability, not from technical convenience or feature popularity.

## 6.3 Traceability Must Be Visible

A major prioritization choice without evidence is a finding.

## 6.4 Explicit Handling of Uncertainty

Unknowns and assumptions must remain labeled and must not be treated as approved scope.

## 6.5 Sequential Reasoning Must Be Defensible

Phase ordering must be justified by dependencies and MVP validation, not by an arbitrary order.

---

# 7. Severity Levels

### CRITICAL

The prioritization cannot safely support the MVP.

Examples:

* The plan expands beyond the validated scope without justification.
* Requirements or users are redefined without evidence.
* High-risk or dependency-heavy items are treated as MVP without qualification.
* The plan cannot be traced to upstream source material.

### HIGH

A significant issue requires correction before downstream planning.

Examples:

* Major features are mis-ranked.
* MVP core is not clearly identified.
* Critical risks or decisions are hidden.
* Phase sequencing does not support early value delivery.

### MEDIUM

The artifact is usable but requires clarification.

Examples:

* Some deferred items lack clear rationale.
* Some assumptions are weakly framed.
* A few dependencies are not explicitly documented.

### LOW

Minor quality issue.

Examples:

* Small wording inconsistencies.
* Formatting issues.
* Minor clarity gaps that do not change the priority logic.

---

# 8. Overall Result

Return exactly one overall result:

## PASS

Use when the prioritization is evidence-based, aligned to the MVP, traceable, and suitable for P04 and implementation planning.

## PASS_WITH_WARNINGS

Use when a plan is usable but contains non-blocking issues that require documentation or clarification.

## FAIL

Use when the prioritization is materially inconsistent, mis-scoped, or unsupported by upstream artifacts.

## BLOCKED

Use when required upstream evidence is missing or contradictory to the point that a reliable prioritization cannot be produced.

---

# 9. Required Validation Report

Generate:

```text
artifacts/03_planning/PRIORITIZATION_VALIDATION.md
```

Use this structure:

```markdown
# P03 Prioritization Validation Report

## 1. Validation Metadata
- Validator: P03 Prioritization Validator
- Project:
- Planning Version:
- Validation Date:
- Upstream Artifact Statuses:
- Overall Result: PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED
- P04 Readiness:

## 2. Executive Summary
Explain the result and main reason.

## 3. Input Readiness
| Input Artifact | Present | Valid | Reviewed | Notes |
|---|---|---|---|---|

## 4. Structural Validation
| Section | Present | Valid | Notes |
|---|---|---|---|

## 5. Findings
| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|

## 6. MVP and Priority Review
### MVP Core
### Supporting Items
### Deferred Items
### Out of Scope

## 7. Traceability Review
| Requirement / Objective | Priority / Phase | Coverage | Notes |
|---|---|---|---|

## 8. Dependency, Risk, and Assumption Review
| ID | Item | Classification | Impact | Required Action |
|---|---|---|---|---|

## 9. P04 Readiness
- Ready to proceed: YES / WITH CONSTRAINTS / NO
- Constraints:
- Blocking items:

## 10. Final Decision
State the final result and justify it based on the decision rules.
```

If no findings exist, explicitly state `No findings identified`.

---

# 10. Final Response

After generating the validation report, summarize:

1. Overall result.
2. Main strengths or issues.
3. Whether the plan is ready for P04.
4. Any unresolved decisions that require human input.
