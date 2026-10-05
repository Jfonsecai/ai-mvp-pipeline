### P02 — Requirements Auditing and Validation
**Version:** 1.0  
**Stage:** P02 — Requirements Engineering  
**Type:** Validation Prompt  
**Input Artifacts:**
* `artifacts/02_requirements/REQUIREMENTS_SPEC.md`
* `artifacts/01_discovery/PRODUCT_VISION.md`
* `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
* `prompts/system/SYSTEM_PROMPT.md`  
**Output Artifact:** `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md`  
**Related Generation Prompt:** `prompts/02_requirements/P02_requirements.md`  
**Previous Stage:** P01 — Product Discovery  
**Next Stage:** P03 — Software Architecture  

---

### 1. PURPOSE
Validate that `REQUIREMENTS_SPEC.md` faithfully transforms the validated Product Vision (`PRODUCT_VISION.md`) into a rigorous, complete, atomic, and executable set of User Stories and Release Plan.
The validator must verify that:
* User Stories are atomic and deconstructed (1–3 Story Points).
* Acceptance criteria contain all 5 required dimensions without omissions.
* Entity attributes are exhaustively specified without vague shortcuts.
* Technical-functional boundaries are respected (no premature global infrastructure).
* Developer workload assignments respect the 50% cap.
* Traceability to P01 MVP capabilities is preserved.

---

### 2. INPUTS
#### 2.1 Requirements Specification
Read:
```text
artifacts/02_requirements/REQUIREMENTS_SPEC.md
```
This is the primary artifact being audited.

#### 2.2 Product Vision and Validation
Read:
```text
artifacts/01_discovery/PRODUCT_VISION.md
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
```
Use these to verify traceability, scope alignment, and carried assumptions.

---

### 3. ROLE
Act as an **Independent Software Quality Auditor, Agile Governance Auditor, and Lead QA Architect**.
Your responsibility is to objectively evaluate `REQUIREMENTS_SPEC.md` for completeness, atomicity, technical-functional rigor, and workload balance before authorizing transition to Software Architecture (P03).

---

### 4. CORE VALIDATION PRINCIPLE
The central question is:
**"Does `REQUIREMENTS_SPEC.md` provide an atomic, fully specified, 5-dimension acceptance-criteria-backed, and workload-balanced set of User Stories grounded in `PRODUCT_VISION.md` without introducing premature global architecture?"**

---

### 5. VALIDATION AUDITING FRAMEWORK (5 CONTROL AXES)

#### 5.1 User Story Atomicity & Granularity Check
Verify that:
* User Stories are simple, focused, and single-purpose.
* Monolithic stories (e.g., "cart + checkout + payment + inventory") are properly broken down into independent atomic stories.
* Story points follow Fibonacci (1, 2, 3, 5, 8, 13) with the vast majority at 1, 2, or 3 SP. Stories rated 5 or 8 SP must involve AI or high technical uncertainty.
* Total User Stories per Release range between 8 and 15.

#### 5.2 Acceptance Criteria 5-Dimension Completeness Check
Confirm that EVERY User Story breaks down acceptance criteria into all 5 mandatory sections:
1. **a) Form / View Visualization:**
   - Exact access URL path is stated.
   - List of entity attributes is EXHAUSTIVE. Flag any vague shortcuts like "and other fields" or "etc.".
   - Field types, optionality, and validation constraints are explicit.
2. **b) Real-Time Frontend Validation:**
   - Button states (disabled until valid) and accessible error message behaviors (`aria-live="polite"`) are specified.
3. **c) Successful Submission (Happy Path):**
   - Spinner timers (≤ 3s), exact HTTP status codes (200/201), success toasts, and redirection times (< 500ms) are specified.
4. **d) Server Error Handling (Edge Cases):**
   - Explicit HTTP 4xx business error mapping (e.g., 409 Conflict, 401 Unauthorized, 403 Forbidden) and HTTP 5xx dev-only logging rules are specified.
5. **e) Persistence & Security:**
   - Relational linkage to JWT `user_id`, `UUID v4` primary keys, `bcrypt` hashing (≥ 10 salt rounds), and ISO-8601 UTC timestamps are explicitly declared.

#### 5.3 Technical-Functional Boundary Audit
Verify that:
* NO global infrastructure decisions are included (e.g., Docker Compose files, Kubernetes manifests, internal server ports, or specific framework choices like React or FastAPI).
* All required technical-functional contracts ARE included at the HU level (URLs, HTTP status codes, DTO field types, JWT linkage).

#### 5.4 Traceability with Product Vision (P01)
Verify that:
* Every User Story maps directly to an MVP Core or Supporting capability from `PRODUCT_VISION.md`.
* No unauthorized "scope creep" features are added to the MVP without explicit tracking.

#### 5.5 Team Capacity & Governance Audit
Verify that:
* No single developer is assigned to more than 50% of the User Stories in a single Release.
* All assigned team members participate in each Release.
* Pair programming or support developers are assigned for complex or hybrid stories.

---

### 6. SEVERITY LEVELS
* **CRITICAL / BLOCKER:** Missing 5-dimension structure in HUs, presence of premature global infrastructure (Docker/Kubernetes), monolithic User Stories (> 8 SP), developer workload > 50%, or severe scope creep.
* **HIGH:** Incomplete entity attributes (e.g., "and other fields"), missing explicit HTTP status codes, or missing wait times/spinners.
* **MEDIUM:** Inconsistencies in Fibonacci estimations, missing support dev assignments for hybrid stories, or superficial MoSCoW justifications.
* **LOW:** Minor wording ambiguities in 3P descriptions or cosmetic URL formatting.

---

### 7. VALIDATION DECISION & RULES

```text
IF Critical / Blocker issues exist:
    → BLOCKED or FAIL

ELSE IF High-severity issues affect requirements readiness:
    → FAIL

ELSE IF Artifact is usable with non-blocking issues:
    → PASS_WITH_WARNINGS

ELSE:
    → PASS
```

* **PASS / APPROVED:** Complete compliance with all 5 control axes. Ready for Stage P03 (Software Architecture).
* **PASS_WITH_WARNINGS:** Usable requirements with non-blocking Medium/Low findings documented for tracking.
* **FAIL / BLOCKED:** Blocker or High findings exist. `REQUIREMENTS_SPEC.md` must be corrected and re-audited.

---

### 8. REQUIRED VALIDATION REPORT TEMPLATE
Generate `artifacts/02_requirements/REQUIREMENTS_VALIDATION.md` using this exact structure:

```markdown
# P02 Requirements Validation Report

## 1. Validation Metadata
- Validator: P02 Requirements Auditor
- Project:
- Requirements Spec Version:
- Validation Date:
- Overall Result: [PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED]

## 2. Executive Summary

## 3. Structural & 5-Dimension Audit Table
| HU ID | 3P Redaction | 5-Dimension AC | Explicit Entity Attributes | HTTP Codes & Timers | JWT & Persistence | Result |
|---|---|---|---|---|---|---|

## 4. Findings & Findings Matrix
| Finding ID | Severity | Category | Description / Evidence | Recommended Correction |
|---|---|---|---|---|

## 5. Atomicity & Fibonacci Estimation Audit

## 6. Technical-Functional Boundary Audit

## 7. Traceability Audit (P01 -> P02)

## 8. Team Workload & Governance Audit

## 9. Requirements Readiness for Architecture (P03)

## 10. Final Decision & Conditions
- **Result:** [PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED]
- **Conditions to Proceed to P03:**

## 11. Auditor Integrity Statement
```

---

### 9. STAGE TRANSITION
* **PASS / PASS_WITH_WARNINGS:** Proceed to **Stage P03 — Software Architecture (DAS Frontend / DAS Backend)**.
* **FAIL / BLOCKED:** Re-run `P02_requirements.md` to resolve findings before proceeding.
