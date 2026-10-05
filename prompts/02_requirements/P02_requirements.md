### P02 — Requirements Engineering and Release Plan
**Version:** 1.0  
**Stage:** P02 — Requirements Engineering  
**Type:** Generation Prompt  
**Input Artifacts:**
* `artifacts/01_discovery/PRODUCT_VISION.md`
* `artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md`
* `artifacts/00_context/PROJECT_CONTEXT.md`
* `prompts/system/SYSTEM_PROMPT.md`  
**Output Artifact:** `artifacts/02_requirements/REQUIREMENTS_SPEC.md`  
**Validator:** P02 Requirements Validator  
**Previous Stage:** P01 — Product Discovery  
**Next Stage:** P03 — Software Architecture  

---

### 1. PURPOSE
Transform the validated Product Vision (`PRODUCT_VISION.md`) and project context into a structured, highly detailed, and fully executable Requirements Specification and Release Plan (`REQUIREMENTS_SPEC.md`).
The primary goal is to deconstruct the high-level MVP capabilities into atomic User Stories (HUs) enriched with 5-dimension acceptance criteria, exact entity attribute definitions, Fibonacci story point estimations, MoSCoW priorities, AI capability scores, and balanced developer assignments.

---

### 2. INPUTS
#### 2.1 Product Vision
Read:
```text
artifacts/01_discovery/PRODUCT_VISION.md
```
This is the primary source for MVP capabilities, core user journeys, target user roles, and open product questions.

#### 2.2 Product Vision Validation Report
Read:
```text
artifacts/01_discovery/PRODUCT_VISION_VALIDATION.md
```
Use the validation findings to track accepted assumptions, warnings, and undecided business rules that affect requirements.

---

### 3. ROLE
Act as a **Senior Scrum Master, Lead Product Owner, and Enterprise Agile Coach**.
Your responsibility is to generate a production-ready Release Plan and Requirements Specification that bridges business intent and technical implementation without violating architectural boundaries.

---

### 4. CORE DIRECTIVES AND BOUNDARIES

#### 4.1 Strict Technical-Functional Boundary Rule
1. **Prohibition of Global Architecture & Infrastructure:**
   It is STRICTLY FORBIDDEN to include global infrastructure or deployment decisions at this stage (e.g., Docker containers, Kubernetes, internal server ports, code design patterns, or explicit selection of frameworks like React, FastAPI, or Spring Boot). Those belong exclusively to Stage P03 (Software Architecture - DAS Frontend / DAS Backend).
2. **Mandatory Technical-Functional Contracts in HUs:**
   It is MANDATORY to specify the functional-technical contracts within the Acceptance Criteria of each User Story: exact access URL paths, entity attribute contracts, HTTP status codes (200, 201, 409, 5xx), real-time validation rules, security standards (JWT, bcrypt hashing), and persistence formats (UUID v4, ISO-8601 UTC).

#### 4.2 User Story Deconstruction & Atomization Directive
1. **Maintain Macro Epics:** Epics act as high-level domain containers (e.g., AUTH, PET, SERV, ORD, CASH, PROD).
2. **Decompose into Simple Atomic HUs:** Do not generate "monolithic" or multi-step User Stories. Divide flows into atomic stories of small, focused scope.
   * *Bad practice:* "Create cart, checkout, deduct inventory, and record in cash register" (All in 1 HU).
   * *Correct atomic breakdown:*
     - HU-1: Selection and quantity modification in cart interface.
     - HU-2: Checkout processing and cash entry recording.
     - HU-3: Automatic unit deduction in inventory post-sale.
3. **Target Size and Effort:** Most HUs must be simple, rated at 1, 2, or 3 Story Points (Fibonacci scale). Reserve 5 or 8 SPs exclusively for flows with high uncertainty or Artificial Intelligence components.
4. **User Story Limit per Release:** Each release must contain between 8 and 15 atomic User Stories.

#### 4.3 Team Assignment and Workload Allocation Rules
1. **Team Composition:** Map roles to team members defined in the project context.
2. **50% Workload Cap:** No developer may be assigned as main or support dev on more than 50% of the User Stories in a single Release.
3. **Full Participation:** Every team member must have at least one active assignment in each Release.
4. **Specialization Alignment:** Assign main and support developers based on their primary expertise (e.g., Frontend, Backend, Fullstack, DevOps).

---

### 5. REQUIREMENTS ANALYSIS & SPECIFICATION PROCESS

#### Step 1 — Review Product Discovery Inputs
Analyze `PRODUCT_VISION.md` and `PRODUCT_VISION_VALIDATION.md` to extract:
* MVP Core and Supporting capabilities.
* Core User Journeys and key interactions.
* Carried assumptions and unresolved product decisions.

#### Step 2 — Define Epics
Group functionality into domain Epics identified by a 3–4 letter code (e.g., AUTH, PET, SERV, ORD). Each Epic must specify:
* ID, Name, Functional Description, Business Objective, and Associated HU IDs.

#### Step 3 — Formulate Atomic User Stories (3P Pattern)
Express each story using the 3P model:
> **As a** [Role], **I want** [Atomic Action - WHAT], **So that** [Benefit - WHY].

#### Step 4 — Construct 5-Dimension Acceptance Criteria
For EVERY User Story, break down acceptance criteria into exactly these 5 dimensions:
1. **a) Form / View Visualization (Mandatory Entity Attribute Detail):**
   - Exact access URL path (e.g., `/signup`, `/mascotas/nueva`, `/orders/new`).
   - Exhaustive and explicit list of entity fields. NEVER summarize or use vague phrases like "and other fields". Enumerate ALL business attributes (e.g., for Pet: Name, Species, Breed, Age, Weight in kg, Sex, Profile Picture, Allergies/Medical Conditions).
   - Data type, mandatory/optional status, and field constraints (e.g., age between 0 and 30 years, weight decimal > 0, password min 8 chars with uppercase, lowercase, number, special char).
2. **b) Real-Time Frontend Validation:**
   - Action button states (disabled until all required fields hold valid values).
   - Field-by-field validation rules and accessible error message/tooltip behaviors (`aria-live="polite"`).
3. **c) Successful Submission (Happy Path):**
   - Visual feedback (processing spinners ≤ 3 s).
   - Expected HTTP status codes from Backend (e.g., HTTP 200 OK, HTTP 201 Created) and returned DTO/ID.
   - User notification (success toast) and screen redirection/refresh time (< 500 ms).
4. **d) Server Error Handling (Edge Cases):**
   - Explicit handling of business errors (e.g., HTTP 409 Conflict for duplicate data, HTTP 401 Unauthorized, HTTP 403 Forbidden) with user-friendly messages without page reload.
   - Infrastructure failure handling (HTTP 5xx) with generic error messages and console logging restricted to dev mode.
5. **e) Persistence and Security (Backend & DB):**
   - Relational linkage to authenticated user (`user_id` from JWT token or session).
   - Primary key standard (`UUID v4`) and security algorithms (e.g., `bcrypt` with min 10 salt rounds).
   - Audit timestamps (`createdAt`, `updatedAt`) recorded in ISO-8601 UTC format.

#### Step 5 — Evaluate AI Integration Score (0 to 5 Points)
Evaluate each User Story against the 5 standard questions (+1 point per 'Yes'):
1. Does it process unstructured data (text, voice, images, video)?
2. Does it recognize patterns, predict, or classify information?
3. Does it understand natural language or generate content?
4. Does it customize or adapt behavior based on data/context?
5. Is the response probabilistic with an acceptable margin of error?
* *Classification:* **0–1 pts:** Traditional | **2–3 pts:** Hybrid | **4–5 pts:** Primarily AI.

#### Step 6 — Estimate Effort & Prioritize
* **Story Points:** Assign relative effort using Fibonacci scale (1, 2, 3, 5, 8, 13).
* **MoSCoW Priority:** Assign Must Have, Should Have, Could Have, or Won't Have with business rationale.

---

### 6. REQUIRED OUTPUT FORMAT
Generate the artifact: `artifacts/02_requirements/REQUIREMENTS_SPEC.md` using exactly this section structure:

```markdown
# Requirements Specification and Release Plan

## 1. Document Metadata & Executive Summary
- Version:
- Stage: P02 — Requirements Engineering
- Status: [READY / READY_WITH_ASSUMPTIONS / BLOCKED]
- Generated From:
- Validation Dependency:

## 2. Release Plan Roadmap
| Release | Duration | Sprints | Functional Scope / Objective |
|---|---|---|---|

## 3. Epics Definition
| Epic ID | Epic Name | Functional Description | Business Objective | Associated HUs |
|---|---|---|---|---|

## 4. Sprint Schedule & Story Mapping
| Sprint | User Story IDs | Total Story Points | Sprint Objective |
|---|---|---|---|

## 5. Detailed User Story Specifications

### [EPIC_CODE-1]: [Story Title]
- **Description (3P):** As a [Role], I want [Action], So that [Benefit].
- **Acceptance Criteria (5 Dimensions):**
  - **a) Form / View Visualization:**
    - Access URL:
    - Entity Attributes List:
    - Field Constraints:
  - **b) Real-Time Frontend Validation:**
  - **c) Successful Submission (Happy Path):**
  - **d) Server Error Handling (Edge Cases):**
  - **e) Persistence & Security:**
- **Definition of Done (DoD):**
- **Story Points:**
- **MoSCoW Priority:**
- **AI Score & Classification:**
- **Assigned Developers:** Main Dev: [Name] | Support Dev: [Name]

## 6. AI Capability Matrix
| HU ID | Q1 | Q2 | Q3 | Q4 | Q5 | AI Score | Classification |
|---|---|---|---|---|---|---|---|

## 7. Team Workload Allocation Matrix
| Developer | Role / Skill | Assigned HUs (Main) | Assigned HUs (Support) | Total HUs | Workload % (Max 50%) | Status |
|---|---|---|---|---|---|---|

## 8. Traceability Matrix
| User Story ID | Product Vision Capability (P01) | User Need / JTBD | Business Value |
|---|---|---|---|

## 9. Requirements Specification Status
Allowed values: READY / READY_WITH_ASSUMPTIONS / BLOCKED
```

---

### 7. STATUS & FAILURE RULES
* **READY:** All User Stories fully specified across 5 dimensions, no developer over 50% load, and all MVP capabilities covered.
* **READY_WITH_ASSUMPTIONS:** Requirements usable but contain documented business rule assumptions carried from P01.
* **BLOCKED:** Missing core user roles, conflicting scope, or failure to deconstruct capabilities into atomic stories.

---

### 8. SELF-VALIDATION CHECKLIST
Before outputting `REQUIREMENTS_SPEC.md`, verify:
* [ ] Every User Story uses the 3P format and has a unique sequential ID per Epic.
* [ ] Every User Story has acceptance criteria explicitly broken down into all 5 dimensions.
* [ ] Dimension (a) lists ALL entity attributes explicitly without vague shortcuts like "and other fields".
* [ ] Dimension (c) and (d) specify exact HTTP status codes (200, 201, 409, 5xx) and UI feedback times.
* [ ] Dimension (e) specifies JWT user linkage, UUID v4, bcrypt hashing, and ISO-8601 UTC timestamps.
* [ ] No global infrastructure decisions (Docker, Kubernetes, framework picks) are included.
* [ ] Story points follow Fibonacci (1, 2, 3, 5, 8, 13) with emphasis on 1-3 SP.
* [ ] No developer exceeds 50% workload capacity per Release.
* [ ] AI scores (0-5) and MoSCoW priorities are assigned to every HU.
* [ ] Full traceability back to `PRODUCT_VISION.md` is maintained.

---

### 9. STAGE TRANSITION
If `REQUIREMENTS_SPEC.md` is **READY** or **READY_WITH_ASSUMPTIONS**, proceed to **P02 Validation** (`P02_validation.md`), then to **P03 — Software Architecture**.
