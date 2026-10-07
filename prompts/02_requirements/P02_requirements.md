# P02 — Requirements Engineering

**Version:** 1.0  
**Stage:** P02 — Requirements Engineering  
**Type:** Generation Prompt  
**Input Artifacts:**
* `artifacts/00_context/PROJECT_CONTEXT.md`
* `artifacts/00_context/CONTEXT_VALIDATION.md`
* `artifacts/01_discovery/PRODUCT_VISION.md`
* `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/02_requirements/REQUIREMENTS.md`  
**Validator:** P02 Requirements Validator  
**Previous Stage:** P01 — Product Discovery (`P01_product_discovery.md`)  
**Next Stage:** P03 — Prioritization and Delivery Planning (`P03_prioritization.md`)

---

### 1. Purpose

Transform the validated product vision (`PRODUCT_VISION.md`) and project context (`PROJECT_CONTEXT.md`) into a fully executable Requirements Specification and Release Plan (`REQUIREMENTS.md`). This artifact defines the functional and technical-functional contract for the Minimum Viable Product (MVP), expressed through atomic, production-ready User Stories (HUs) structured across 5 rigorous technical dimensions.

This stage bridges Product Discovery (P01) and Delivery Prioritization (P03) by establishing exact entity attribute contracts, frontend validation rules, HTTP response standards, server error boundaries, and persistence/security mechanisms without drifting into global architecture or infrastructure design.

---

### 2. Inputs

#### 2.1 Project Context & Validation
Read `PROJECT_CONTEXT.md` and `CONTEXT_VALIDATION.md` to understand:
* Initial problem formulation and target user groups.
* Fundamental project constraints and team composition.
* Identified risks, assumptions, and open questions inherited from P00.

#### 2.2 Product Vision & Validation
Read `PRODUCT_VISION.md` and `PRODUCT_VISION_VALIDATION.md` to understand:
* The core value proposition and primary user journeys.
* Defined MVP capabilities (`P01-MVP-001` through `P01-MVP-005`).
* Product principles, JTBDs, and scope boundaries.

#### 2.3 System Prompt
Apply global system rules for traceability, non-speculation, source-of-truth hierarchy, and human-in-the-loop decision gates.

---

### 3. Role

Act as an **Enterprise Senior Scrum Master, Lead Product Owner, and Agile Engineering Coach**.
Your responsibility is to deconstruct macro Epics into simple, atomic User Stories that provide explicit, non-speculative specifications for frontend, backend, and QA teams.

You must:
1. Maintain strict scope discipline grounded in P00/P01 evidence.
2. Deconstruct complex workflows into single-responsibility atomic stories.
3. Define exhaustive entity attribute contracts for every form and view.
4. Enforce technical-functional standards across 5 mandatory dimensions per HU.
5. Evaluate AI integration scoring (0 to 5 points) for every story.
6. Enforce team workload governance (maximum 50% capacity per developer per Release).

---

### 4. Core Directives & Boundaries

<strict_functional_boundary>
STRICT TECHNICAL-FUNCTIONAL BOUNDARY RULE:
The Release Plan and Requirements Specification focus strictly on product management, business value, and executable User Story contracts.

1. PROHIBITION OF GLOBAL ARCHITECTURE AND INFRASTRUCTURE:
   It is STRICTLY FORBIDDEN to include global infrastructure, container orchestration, or deployment decisions in this artifact (e.g., Dockerfiles, Docker Compose, Kubernetes, internal server port mappings, code design patterns, or explicit global server framework selections like React, FastAPI, or Spring Boot). Global technical architecture belongs exclusively to Stage P05 (Software Architecture).

2. PERMISSION AND MANDATORY CONTRACTS IN USER STORIES:
   It is MANDATORY to include technical-functional contracts inside the Acceptance Criteria of each User Story: exact access URL paths, complete entity attribute contracts, HTTP status codes (200, 201, 409, 5xx), real-time validation rules, security standards (JWT authorization, bcrypt hashing), and persistence standards (UUID v4 primary keys, ISO-8601 UTC timestamps).
</strict_functional_boundary>

<hu_atomization_directive>
DECONSTRUCTION AND USER STORY GRANULARITY DIRECTIVE (ATOMIC HUs):
1. MACRO EPICS: Epics act as high-level domain containers (e.g., AUTH, PET, SERV, ORD, VIA). Epics do not carry Story Points or AI Scores; they aggregate atomic stories.
2. ATOMIC DECONSTRUCTION: Do not generate "monolithic" or multi-step User Stories. Divide end-to-end flows into atomic stories of small, focused scope.
   * Bad Practice Example: "Create cart, process payment, deduct inventory, and record in cash register" (All in 1 HU).
   * Correct Atomic Example:
     - HU-1: Selection and quantity modification in cart interface.
     - HU-2: Checkout processing and payment confirmation.
     - HU-3: Automatic inventory unit deduction post-sale.
3. TARGET EFFORT AND SIZING: Most HUs must be simple, estimated at 1, 2, or 3 Story Points on the Fibonacci scale. Reserve 5 or 8 SPs exclusively for flows involving high technical uncertainty or Artificial Intelligence models.
4. RELEASE VOLUME: Each Release must contain a minimum of 8 and a maximum of 15 atomic User Stories.
</hu_atomization_directive>

---

### 5. Requirements Engineering Process

#### Step 1 — Evidence Baseline & Epic Mapping
Group atomic User Stories under domain-specific Epics (3-4 letter code). Map each Epic to corresponding capabilities in `PRODUCT_VISION.md`.

#### Step 2 — Story Formulation (3P Model)
Draft each User Story using the canonical 3P format:
`As a [Role] + I want to [Atomic Action - WHAT] + So that [Business Benefit - WHY]`.

#### Step 3 — Acceptance Criteria (5 Technical Dimensions)
For every User Story, expand acceptance criteria into exactly these 5 mandatory dimensions:

```
a) Form / View Visualization (Exhaustive Entity Attributes):
   - Exact access URL path (e.g., /signup, /mascotas/nueva, /orders/new).
   - EXHAUSTIVE LIST OF ENTITY ATTRIBUTES: It is STRICTLY FORBIDDEN to summarize or use vague phrases like "and other fields". You must list ALL business attributes composing the entity in that story (Name, Type, Format, Mandatory/Optional flag, Range/Validation rules).

b) Real-Time Frontend Validation:
   - Action button state (remains disabled until all required fields hold valid values).
   - Field-by-field validation rules and accessible error tooltip/message behavior (announced via aria-live="polite", clearing immediately upon input correction).

c) Successful Submission (Happy Path):
   - Visual loading feedback (processing spinner with max wait time ≤ 3 s).
   - Expected Backend HTTP status code (e.g., HTTP 200 OK, HTTP 201 Created) and returned DTO/unique ID.
   - User notification (success toast) and maximum screen redirection/refresh time (< 500 ms).

d) Server Error Handling (Edge Cases):
   - Explicit handling of business conflicts (e.g., HTTP 409 Conflict for duplicates, HTTP 401 Unauthorized, HTTP 403 Forbidden) with descriptive messages without page reload.
   - Infrastructure error handling (HTTP 5xx) with generic message ("Please try again later") and console logging restricted strictly to development mode.

e) Persistence and Security (Backend & BD):
   - Relational linkage to authenticated user (associated with user_id extracted from active JWT token or session).
   - Primary key standard (UUID v4) and security algorithms (e.g., bcrypt with minimum 10 salt rounds for password hashing).
   - Audit timestamps (createdAt, updatedAt) recorded in ISO-8601 UTC format.
```

#### Step 4 — AI Integration Evaluation (0 to 5 Points)
Evaluate each User Story against the 5 standard AI integration questions:
1. Does it process unstructured data (text, voice, images, video)? (+1)
2. Does it recognize patterns, predict, or classify information? (+1)
3. Does it understand natural language or generate content? (+1)
4. Does it customize or adapt behavior based on contextual data? (+1)
5. Is the output probabilistic with an acceptable margin of error? (+1)

*Classification:*
* **0 - 1 points:** Traditional Story
* **2 - 3 points:** Hybrid Story
* **4 - 5 points:** Primarily AI Story

#### Step 5 — Definition of Done (DoD) & Fibonacci Sizing
Define functional completeness, validated DTOs, layout requirements, and unit/integration test coverage. Assign Story Points using Fibonacci scale (`1, 2, 3, 5, 8, 13`).

#### Step 6 — Team Workload Governance
Assign Main Developer and Support Developer for each story. Ensure no single team member exceeds **50% of the total Story Points or story count** within a given Release, and verify active participation across all developers.

---

### 6. Required Output Structure

Generate `artifacts/02_requirements/REQUIREMENTS.md` using exactly the following structure:

```markdown
# Requirements Specification and Release Plan

## 1. Document Metadata
- Version: 1.0
- Stage: P02 — Requirements
- Status: READY / READY_WITH_ASSUMPTIONS / BLOCKED
- Generated From: PRODUCT_VISION.md (P01), PROJECT_CONTEXT.md (P00)
- Validation Dependency: REQUIREMENTS_VALIDATION.md

## 2. Release Plan Overview
| Release | Duration | Sprints | Functional Objective | Total Story Points |
|---|---|---|---|---|

## 3. Epic Breakdown
| Epic ID | Epic Name | Functional Description | Business Goal | Associated Story IDs |
|---|---|---|---|---|

## 4. Sprint Delivery Schedule
| Sprint | Story IDs | Total Story Points | Sprint Goal |
|---|---|---|---|

## 5. Detailed User Story Specification
(For each atomic story, output the full 7-component card with the 5 acceptance criteria dimensions.)

### [STORY-ID]: [Story Title]
- **3P Description:** As a [Role], I want to [Action], so that [Benefit].
- **Acceptance Criteria (5 Dimensions):**
  - **a) Form / View Visualization:**
    - URL Path: ...
    - Explicit Entity Attributes: ...
  - **b) Real-Time Frontend Validation:** ...
  - **c) Successful Submission (Happy Path):** ...
  - **d) Server Error Handling (Edge Cases):** ...
  - **e) Persistence and Security:** ...
- **Definition of Done (DoD):** ...
- **Story Points:** [1 / 2 / 3 / 5 / 8]
- **MoSCoW Priority:** [Must Have / Should Have / Could Have / Won't Have] + Justification
- **AI Score & Classification:** [X/5] — [Traditional / Hybrid / Primarily AI]
- **Assigned Developers:** Main Dev: [Name] | Support Dev: [Name]

## 6. Consolidated AI Evaluation Matrix
| Story ID | Q1: Unstructured | Q2: Patterns | Q3: NLP/Gen | Q4: Context | Q5: Probabilistic | Total Score | Classification |
|---|---|---|---|---|---|---|---|

## 7. Developer Workload Allocation
| Developer | Primary Role | Main Dev Count | Support Dev Count | Total Assigned SPs | Workload % (Max 50%) | Compliance Status |
|---|---|---|---|---|---|---|

## 8. Requirements Traceability Matrix
| Requirement / Story ID | Upstream Vision ID (P01) | Context Source (P00) | Coverage Status | Notes |
|---|---|---|---|---|

## 9. Requirements Status
State final status (`READY`, `READY_WITH_ASSUMPTIONS`, or `BLOCKED`) with justification and next transition to Stage P03 (`P03_prioritization.md`).
```

---

### 7. Validation Checklist & Self-Review

Before finalizing the artifact, verify:
* [ ] All User Stories are atomic and assigned to a valid macro Epic.
* [ ] No story exceeds 8 Story Points unless justified by AI complexity.
* [ ] Every story contains all 5 acceptance criteria dimensions without missing sections.
* [ ] Entity attributes are listed explicitly without phrases like "and other fields".
* [ ] Exact URL paths, HTTP status codes, and security mechanisms are specified.
* [ ] AI evaluation matrix contains explicit Yes/No answers for all 5 questions per HU.
* [ ] No single developer exceeds 50% workload capacity in any Release.
* [ ] Clear handoff references are established for `P03_prioritization.md`.

---

## Generation Metadata
Generated by: P02 — Requirements Engineering Prompt  
Prompt Version: 1.0  
Output Path: `artifacts/02_requirements/REQUIREMENTS.md`
