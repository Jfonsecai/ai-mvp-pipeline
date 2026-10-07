# P02 — Requirements Validation

**Version:** 1.0  
**Stage:** P02 — Requirements Engineering  
**Type:** Validation Prompt  
**Input Artifacts:**
* `artifacts/00_context/PROJECT_CONTEXT.md`
* `artifacts/00_context/CONTEXT_VALIDATION.md`
* `artifacts/01_discovery/PRODUCT_VISION.md`
* `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
* `artifacts/02_requirements/REQUIREMENTS.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`  
**Related Generation Prompt:** `prompts/02_requirements/P02_requirements.md`  
**Previous Stage:** P01 — Product Discovery (`P01_product_discovery.md`)  
**Next Stage:** P03 — Prioritization and Delivery Planning (`P03_prioritization.md`)

---

### 1. Purpose

Validate that `REQUIREMENTS.md` correctly transforms the validated Product Vision (`PRODUCT_VISION.md`) and Project Context (`PROJECT_CONTEXT.md`) into a coherent, traceable, atomic, and technically specified set of User Stories and Release Plan.

The validator evaluates whether:
1. User Stories are properly deconstructed and atomic (1 to 3 SPs target).
2. Acceptance Criteria complete all 5 required technical dimensions without shortcuts.
3. Entity attributes are listed exhaustively without vague placeholders.
4. Technical-functional boundaries are respected (no premature global infrastructure).
5. AI scoring (0-5) and MoSCoW priorities are logically sound.
6. Developer workload governance complies with the 50% maximum allocation rule.
7. The artifact is ready to feed Stage P03 — Prioritization and Delivery Planning (`P03_prioritization.md`).

This is an **independent audit prompt**. The validator must not rewrite the requirements or alter business scope.

---

### 2. Audit Framework & Control Axes

#### Control Axis 1: Atomicity & Granularity Audit
* Verify that stories are simple and single-responsibility.
* Confirm story point distribution favors 1, 2, or 3 SPs on the Fibonacci scale.
* Flag any monolithic story (> 8 SPs) or story combining multiple independent user tasks.
* Confirm each Release contains between 8 and 15 atomic User Stories.

#### Control Axis 2: 5-Dimension Acceptance Criteria & Entity Attribute Audit
Inspect every User Story for complete 5-dimension breakdown:
* **a) Visualization:** Exact URL path and EXHAUSTIVE entity attribute list. Flag any use of "and other fields", "etc.", or generic summaries.
* **b) Real-Time Validation:** Disabled button state rules and accessible error region behavior (`aria-live="polite"`).
* **c) Happy Path:** Spinner wait times (≤ 3s), HTTP status codes (200/201), success toasts, and redirection times (< 500ms).
* **d) Edge Cases:** Explicit HTTP 4xx business error mapping and HTTP 5xx generic error handling with dev-only logging.
* **e) Persistence & Security:** JWT `user_id` linkage, `UUID v4` primary keys, `bcrypt` hashing (≥ 10 salt rounds), and ISO-8601 UTC timestamps.

#### Control Axis 3: Technical-Functional Boundary Audit
* Verify NO premature global infrastructure decisions are introduced (e.g., Docker Compose, Kubernetes, server port maps, or explicit global server framework selections).
* Confirm that all story-level technical-functional contracts (URLs, DTOs, HTTP codes, security standards) are present.

#### Control Axis 4: Upstream Traceability & Scope Creep
* Map every User Story back to capability IDs in `PRODUCT_VISION.md` (`P01-MVP-001` through `P01-MVP-005`) and `PROJECT_CONTEXT.md`.
* Identify and classify any "orphaned" story or unsupported feature added without upstream evidence.

#### Control Axis 5: Team Governance & Workload Balance
* Verify that no developer is assigned more than 50% of the total Story Points or story count in any Release.
* Verify that all team members are actively assigned across the Release.

---

### 3. Severity Classification

* **BLOCKER:** Missing 5-dimension acceptance criteria structure, premature global infrastructure (Docker/Kubernetes), monolithic stories (> 8 SP), severe scope creep, or developer workload exceeding 50%.
* **HIGH:** Incomplete entity attribute lists (e.g., "and other fields"), missing explicit HTTP status codes, or missing loading wait times/spinners.
* **MEDIUM:** Inconsistent Fibonacci estimations, minor MoSCoW justification gaps, or minor URL formatting issues.
* **LOW:** Minor wording refinements in 3P descriptions or cosmetic formatting gaps.

---

### 4. Decision Gate Directives

At the conclusion of the audit, issue exactly one verdict:

* **PASS / APPROVED:** `REQUIREMENTS.md` satisfies all control axes and 5-dimension criteria. Authorization is granted to advance to Stage P03 (`P03_prioritization.md`).
* **PASS_WITH_WARNINGS:** The document is usable for delivery planning, but contains non-blocking Medium/Low severity findings that must be tracked.
* **FAIL / BLOCKED:** Blocker or High severity findings exist. `REQUIREMENTS.md` must be corrected and re-audited before advancing to Stage P03 (`P03_prioritization.md`).

---

### 5. Required Output Report Structure

Generate `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md` using the following structure:

```markdown
# P02 Requirements Validation Report

## 1. Validation Metadata
- Validator: P02 Requirements Validator
- Project: [Project Name]
- Requirements Version: 1.0
- Validation Date: [YYYY-MM-DD]
- Upstream Statuses: PRODUCT_VISION.md (P01: PASS_WITH_WARNINGS), PROJECT_CONTEXT.md (P00: PASS_WITH_WARNINGS)
- Overall Result: PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED
- P03 Readiness: READY / NOT_READY

## 2. Executive Summary
Concise summary of audit findings, coverage quality, and readiness for Stage P03 (`P03_prioritization.md`).

## 3. Structural & Boundary Validation
| Check Item | Requirement | Status | Findings / Evidence |
|---|---|---|---|
| 5-Dimension AC Structure | Mandatory across all HUs | PASS / FAIL | ... |
| Entity Attribute Detail | Exhaustive (No shortcuts) | PASS / FAIL | ... |
| Zero Global Architecture | No Docker/K8s/Frameworks | PASS / FAIL | ... |
| Technical Contracts | URLs, HTTP Codes, JWT, UUID | PASS / FAIL | ... |

## 4. Audit Findings & Severity Classification
| Finding ID | Severity | Category | Description | Evidence / Affected Story | Recommended Action |
|---|---|---|---|---|---|

## 5. Atomicity & Granularity Audit
- Total User Stories Evaluated: [N]
- Sizing Distribution: 1 SP: [Count], 2 SP: [Count], 3 SP: [Count], 5 SP: [Count], 8 SP: [Count]
- Granularity Verdict: [PASS / FAIL]

## 6. 5-Dimension Acceptance Criteria Audit
| Story ID | Dimension A: View & Attributes | Dimension B: Validation | Dimension C: Happy Path | Dimension D: Edge Cases | Dimension E: Security & DB | Result |
|---|---|---|---|---|---|---|

## 7. AI Evaluation & Prioritization Audit
| Story ID | Evaluated AI Score | Classification | MoSCoW Priority | Justification Quality | Audit Status |
|---|---|---|---|---|---|

## 8. Team Workload Governance Audit
| Developer | Assigned Story Count | Assigned Story Points | Workload % | Threshold Check (≤ 50%) | Status |
|---|---|---|---|---|---|

## 9. Traceability & Scope Creep Matrix
| Story ID | Upstream Vision ID (P01) | Context Source (P00) | Classification | Traceability Result |
|---|---|---|---|---|

## 10. Downstream Readiness for Stage P03
Evaluate readiness to transition to Stage P03 — Prioritization and Delivery Planning (`P03_prioritization.md`).

## 11. Final Decision & Gate Verdict
**Result:** [PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED]

### Conditions to Proceed to P03:
1. ...
```

---

## Validation Metadata
Validated by: P02 Requirements Validation Prompt  
Prompt Version: 1.0  
Output Path: `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`
