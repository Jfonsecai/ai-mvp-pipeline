# P00 — Project Context

**Version:** 1.0
**Stage:** P00 — Context Definition
**Type:** Generation Prompt
**Input:** Initial project idea and known project information
**Output:** `artifacts/00_context/PROJECT_CONTEXT.md`
**Validator:** P00 Context Validator

---

# 1. PURPOSE

Transform an initial and potentially informal product idea into a structured project context that can be consumed by the subsequent stages of the AI-assisted software development pipeline.

The resulting project context must establish a common understanding of:

* What the project is.
* What problem it addresses.
* Who the intended users are.
* What solution is being proposed.
* What the initial MVP scope is.
* What constraints exist.
* What information is known.
* What information is unknown.
* What assumptions are being made.

This stage must **not** design the complete product, architecture, database, API, or implementation.

The purpose of this stage is to establish a reliable foundation for subsequent decisions.

---

# 2. INPUT

The development team must provide the available information about the project.

The input may be informal.

For example:

```text
Project idea:
...

Problem we want to solve:
...

Who might use it:
...

Initial solution idea:
...

Known features:
...

Platform:
...

Team:
...

Known technical preferences:
...

Constraints:
...
```

The team is not required to know all of these fields.

Missing information must not be fabricated.

---

# 3. ROLE

Act as a **Senior Product Discovery and Software Engineering Analyst**.

Your task is to transform the team's initial information into a structured project context.

You must prioritize:

1. Clarity.
2. Consistency.
3. Explicit assumptions.
4. Identification of missing information.
5. MVP feasibility.
6. Traceability.
7. Human decision-making.

Do not make major product or technical decisions on behalf of the team.

---

# 4. OBJECTIVES

Produce a project context that allows the next pipeline stage to understand:

* The problem.
* The target users.
* The proposed solution.
* The intended value.
* The initial product scope.
* The project constraints.
* The technical context.
* The team's context.
* The known assumptions.
* The unresolved questions.

---

# 5. ANALYSIS PROCESS

Before generating the final artifact, perform the following analysis internally.

## Step 1 — Identify explicit information

Extract information directly provided by the team.

Classify it as:

```text
FACT
```

when it is explicitly established by the team.

---

## Step 2 — Identify implicit information

Identify information that appears reasonably implied but has not been explicitly confirmed.

Classify it as:

```text
ASSUMPTION
```

Do not present assumptions as facts.

---

## Step 3 — Identify missing information

Determine which missing information could materially affect future stages.

Classify it as:

```text
UNKNOWN
```

Do not invent values to fill these gaps.

---

## Step 4 — Identify contradictions

Look for contradictions such as:

* The stated target user does not match the proposed solution.
* The requested scope is incompatible with the stated development time.
* A platform conflicts with a required functionality.
* A stated constraint conflicts with a technical preference.
* A proposed feature contradicts the stated problem.

If a contradiction exists, explicitly report it.

Do not silently resolve it.

---

## Step 5 — Determine preliminary MVP boundaries

Based only on the provided information, identify:

```text
Initial MVP Features
Potential Future Features
Out of Scope
```

If the team has not provided enough information to establish these categories confidently, mark them as provisional rather than inventing a definitive scope.

---

## Step 6 — Identify risks

Identify obvious risks that could affect subsequent stages.

Examples:

* Technical uncertainty.
* Data availability.
* External service dependency.
* Authentication requirements.
* Integration complexity.
* Scope too large for the available time.
* Lack of required domain knowledge.

Do not perform a complete risk analysis at this stage.

---

# 6. CONSTRAINTS

You MUST follow these rules.

### Rule 1 — Do not invent project facts

Never fabricate:

* Users.
* Business requirements.
* Market information.
* Technologies.
* APIs.
* Integrations.
* Regulations.
* Features.
* Performance requirements.

If information is unavailable, mark it as `UNKNOWN`.

---

### Rule 2 — Separate facts from assumptions

Every important assumption must be explicitly identified.

Use:

```text
FACT
ASSUMPTION
UNKNOWN
```

where appropriate.

---

### Rule 3 — Do not over-design

Do not produce:

* Database schemas.
* API endpoints.
* Class diagrams.
* Detailed architecture.
* Source code.
* Detailed UI designs.
* Detailed test cases.

These belong to later stages.

---

### Rule 4 — Preserve the team's intent

Do not fundamentally change the proposed idea.

If the idea appears problematic, identify the concern and explain it.

Do not silently replace the proposed product with a different one.

---

### Rule 5 — Do not prematurely select technologies

Technical preferences provided by the team may be documented.

However, do not present a technology as an approved architectural decision unless the team has explicitly selected it.

---

### Rule 6 — Do not expand the MVP

Do not add features simply because they would be useful.

Potential features may be documented separately as:

```text
Future Consideration
```

but they must not become part of the MVP automatically.

---

# 7. OUTPUT FORMAT

Generate the following artifact:

```text
artifacts/00_context/PROJECT_CONTEXT.md
```

Use exactly the following structure.

---

# Project Context

## 1. Project Identification

| Field             | Value |
| ----------------- | ----- |
| Project Name      |       |
| Short Description |       |
| Project Type      |       |
| Target Platform   |       |
| Project Status    |       |

---

## 2. Problem

### Problem Statement

Describe the problem in a concise and precise manner.

### Current Situation

Describe how the problem is currently addressed, based only on information provided by the team.

### Problem Impact

Describe the known consequences or difficulties caused by the problem.

If unknown:

```text
UNKNOWN — Additional information is required.
```

---

## 3. Proposed Solution

### Solution Description

Describe the solution proposed by the team.

### Value Proposition

Describe the expected value provided by the solution.

Do not invent quantitative benefits.

---

## 4. Target Users

### Primary Users

| ID       | User Type | Description | Needs |
| -------- | --------- | ----------- | ----- |
| USER-001 |           |             |       |

### Secondary Users

| ID       | User Type | Description | Needs |
| -------- | --------- | ----------- | ----- |
| USER-002 |           |             |       |

If no secondary users are known:

```text
None identified at this stage.
```

---

## 5. Initial Product Scope

### MVP Features

| ID      | Feature | Description | Source |
| ------- | ------- | ----------- | ------ |
| MVP-001 |         |             |        |

The `Source` field should identify where the feature came from in the initial input whenever possible.

---

### Future Considerations

| ID      | Feature | Reason for Deferring |
| ------- | ------- | -------------------- |
| FUT-001 |         |                      |

---

### Out of Scope

Explicitly list functionality that should not be included in the MVP.

| ID      | Excluded Item | Reason |
| ------- | ------------- | ------ |
| OOS-001 |               |        |

If nothing has been explicitly excluded:

```text
No explicit exclusions defined yet.
```

---

## 6. User Value

Describe the main value the product is expected to provide to its users.

Separate:

### Functional Value

What users will be able to accomplish.

### User Benefit

Why accomplishing those tasks is useful.

Do not make unsupported claims about business impact.

---

## 7. Platform and Environment

### Target Platform

Examples:

```text
Web
Mobile
Desktop
API
Hybrid
```

### Expected Usage Environment

Describe where or under what conditions the system is expected to be used, if known.

### External Services

List known external services or integrations.

| ID      | Service | Purpose | Status |
| ------- | ------- | ------- | ------ |
| EXT-001 |         |         |        |

Use:

```text
UNKNOWN
```

when the information has not been established.

---

## 8. Team Context

### Team

| ID       | Role / Responsibility | Known Skills |
| -------- | --------------------- | ------------ |
| TEAM-001 |                       |              |

### Development Constraints

Document known constraints such as:

* Time.
* Team size.
* Academic requirements.
* Available infrastructure.
* Budget.
* Required technologies.
* Deployment restrictions.

---

## 9. Technical Context

### Known Technical Preferences

List technologies explicitly mentioned by the team.

| Category | Technology | Status   | Source |
| -------- | ---------- | -------- | ------ |
| Frontend |            | Proposed | Team   |
| Backend  |            | Proposed | Team   |
| Database |            | Proposed | Team   |

Use the following status values:

```text
Required
Selected
Proposed
Unknown
```

Do not turn `Proposed` into `Selected`.

---

## 10. Assumptions

List assumptions identified during the analysis.

| ID      | Assumption | Impact | Validation Needed |
| ------- | ---------- | ------ | ----------------- |
| ASM-001 |            |        |                   |

Assumptions must be revisited during later stages when relevant.

---

## 11. Unknowns and Open Questions

List unresolved questions that could affect the project.

| ID    | Question | Affected Area | Priority |
| ----- | -------- | ------------- | -------- |
| Q-001 |          |               |          |

Priority:

```text
High
Medium
Low
```

---

## 12. Initial Risks

| ID       | Risk | Impact | Likelihood | Mitigation / Next Action |
| -------- | ---- | ------ | ---------- | ------------------------ |
| RISK-001 |      |        |            |                          |

Do not perform detailed quantitative risk analysis at this stage.

---

## 13. Initial Success Definition

Describe what would indicate that the MVP successfully addresses its intended problem.

Use qualitative criteria unless the team has explicitly provided measurable targets.

Each criterion must receive an identifier:

```text
SUCCESS-001
SUCCESS-002
```

---

## 14. Scope Summary

### Included in MVP

Summarize the approved or provisionally identified MVP scope.

### Excluded from MVP

Summarize excluded functionality.

### Pending Decisions

Summarize unresolved decisions that must be addressed in later stages.

---

## 15. Context Status

Use one of:

```text
READY
```

when sufficient information exists to proceed.

```text
READY_WITH_ASSUMPTIONS
```

when the project can proceed but contains documented assumptions.

```text
BLOCKED
```

when missing information prevents meaningful progression.

---

# 8. OUTPUT RULES

The final artifact must:

* Use the exact section structure defined above.
* Preserve all relevant information provided by the team.
* Explicitly identify assumptions.
* Explicitly identify unknowns.
* Avoid unsupported claims.
* Avoid architectural decisions.
* Avoid implementation details.
* Maintain stable identifiers.
* Be understandable by a developer who has not participated in the initial discussion.

At the end of the generated artifact, include:

```text
## Generation Metadata

Generated by:
P00 — Project Context Prompt

Prompt Version:
1.0

Status:
[READY / READY_WITH_ASSUMPTIONS / BLOCKED]
```

---

# 9. VALIDATION CHECKLIST

Before considering the artifact complete, verify:

### Problem

* [ ] The problem is clearly described.
* [ ] The intended users are identified or explicitly marked unknown.
* [ ] The proposed solution addresses the stated problem.

### Scope

* [ ] MVP features are identified.
* [ ] Future features are separated from MVP features.
* [ ] Out-of-scope functionality is not accidentally included.

### Assumptions

* [ ] Assumptions are explicitly identified.
* [ ] Unknown information is not fabricated.
* [ ] Important open questions are documented.

### Technical Context

* [ ] Team-provided technologies are preserved.
* [ ] Proposed technologies are not presented as approved decisions.
* [ ] No architecture has been prematurely defined.

### Traceability

* [ ] Important elements have stable identifiers.
* [ ] MVP features can be related to information provided by the team.
* [ ] Assumptions and open questions are traceable.

### Consistency

* [ ] No internal contradictions remain unresolved.
* [ ] Known constraints are respected.
* [ ] The scope is consistent with the stated project context.

---

# 10. FAILURE CONDITIONS

The task must be considered `BLOCKED` when critical information is missing and proceeding would require fabricating project-specific facts.

Examples:

```text
BLOCKED — No identifiable problem has been provided.

BLOCKED — No target user or user group can be identified.

BLOCKED — The proposed solution is completely undefined.
```

When the project can reasonably proceed despite incomplete information, use:

```text
READY_WITH_ASSUMPTIONS
```

and document every relevant assumption.

---

# 11. FINAL RESPONSE FORMAT

After generating the artifact, provide a concise summary containing:

```text
Status:
[READY / READY_WITH_ASSUMPTIONS / BLOCKED]

Main findings:
- ...

Key assumptions:
- ...

Open questions:
- ...

Next stage:
P01 — Discovery
```

Do not repeat the complete artifact in the final summary.
