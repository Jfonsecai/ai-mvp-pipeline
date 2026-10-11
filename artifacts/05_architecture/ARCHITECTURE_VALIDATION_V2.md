# Architecture Validation Report

## 1. Validation Metadata

| Field | Value |
|---|---|
| Stage | P05 — Architecture Validation |
| Validator | `P05_validation.md`, version 2.0 |
| Report version | 2.0 (previous: `history/ARCHITECTURE_VALIDATION_v1.0.md`, PASS_WITH_CONDITIONS) |
| Architecture reviewed | `artifacts/05_architecture/ARCHITECTURE.md` v2.0 (status READY) |
| Companion outputs reviewed (TD-20) | `API_SPEC.yaml` v1.0 (OpenAPI 3.1); `DATA_MODEL.md` v1.0 (PostgreSQL) |
| Validation date | 2026-10-10 |
| **Overall validation status** | **PASS_WITH_CONDITIONS** |

**Required inputs reviewed:** REQUIREMENTS.md v3.0, PRIORITIZATION.md v2.0, the P03 `product_backlog.json` v2.0, UX_SPEC.md v2.0 and UX_SPEC_VALIDATION.md v2.0. The P02 backlog was not used as the planning reference.

**Scope extension of this validation (team decision, cascade prompt).** Besides the categories of `P05_validation.md`, this report checks three further points:

- API_SPEC.yaml and DATA_MODEL.md are consistent with ARCHITECTURE.md, UX_SPEC.md and REQUIREMENTS.md;
- API_SPEC.yaml is valid OpenAPI 3.1;
- the DDL in DATA_MODEL.md executes and enforces the rules it claims.

**Short justification.** The architecture is coherent, proportionate and fully traceable for the 15 committed stories and the 7 ordering-package stories. Every v1.0 decision is resolved by a team decision, and the contracts and schema are written and mechanically verified. No critical, high or medium-severity defect that affects the whole design remains. One condition applies to specific implementation work: verifying the Vercel-specific assumptions on the step-0 deployment (COND-001). That condition is why the status is PASS_WITH_CONDITIONS rather than PASS.

### 1.1 How This Validation Was Done

| # | Check | Tool / evidence | Result |
|---|---|---|---|
| 1 | Structure and ID integrity of ARCHITECTURE.md: 18 sections, status, contiguous P05 IDs, ADR inventory against headings, upstream IDs exist, 17 screens and 20 flows referenced, all 85 committed and ordering acceptance criteria referenced, 34 backlog rows and 44 requirement rows with scope equal to the backlog, technology terms only as approved, quantities only from TDs or cited vendor facts, diagram contents | Script on files on disk | **43 / 43 PASS** |
| 2 | API_SPEC.yaml is valid OpenAPI 3.1 | Official OpenAPI Initiative JSON Schemas for 3.1 (`schema.yaml`, `schema-base.yaml` with the OAS dialect and meta-schema), taken from the `OAI/OpenAPI-Specification` repository (branch `v3.1-dev`, `src/schemas/validation`). Validation used `jsonschema` 4.26 (Draft 2020-12). | **Valid** under both schemas |
| 3 | The validator itself detects errors | Five deliberately broken copies (no `info`, invalid response code, parameter without `in`, invalid schema type, unknown operation field) | **5 / 5 detected** |
| 4 | Further API checks: unique operationIds; every IF-001 to IF-013 and IF-025 to IF-032 present; all `$ref` resolve; no unused components; 401, 403 and 404 documented where required; path parameters declared; 26 accept/reject payload cases; examples valid | Script | **19 / 19 PASS** |
| 5 | Cross-document consistency between ARCHITECTURE, API_SPEC, DATA_MODEL, UX_SPEC and REQUIREMENTS (details in §6.1) | Script | **33 / 33 PASS** |
| 6 | DDL executes and enforces its constraints | PostgreSQL 16.15 (local): DDL extracted from DATA_MODEL.md, 32 forbidden writes, behavior checks, and a two-session concurrent double booking | **All as expected** (DATA_MODEL Appendix B) |
| 7 | Diagrams | Six ARCHITECTURE diagrams and one DATA_MODEL diagram rendered with Mermaid (`mmdc`), no syntax errors. The deployment view was inspected visually. | **OK** |
| 8 | Vendor facts | Each hosting FACT was compared with the official Vercel and Neon pages listed in ARCHITECTURE §17.4, read on 2026-10-10 | **Consistent** |
| 9 | Category review A–L | This report | §4, §5 |

**Independence notice.** The architecture, the API specification, the data model and this report were produced by the same AI assistant. Unlike v1.0, no separate reviewer agent was run on v2.0. The mechanical checks above reduce this limitation but do not remove it, and no human has reviewed these outputs yet (AV-008).

---

## 2. Input Readiness

| Artifact | Available and readable | Role in validation | Limitations or conflicts |
|---|---|---|---|
| REQUIREMENTS.md v3.0 | Yes | Source of FR, NFR, BR, AC, EDGE and TD-01 to TD-20 | P00 and P01 were not regenerated after TD-02 to TD-13. This upstream drift is carried from REQUIREMENTS_VALIDATION v3.0 and does not affect P05. |
| PRIORITIZATION.md v2.0 | Yes | Scope: 15 committed stories; the ordering package P1; Groups A and B P2 and P3 | None |
| `product_backlog.json` v2.0 (P03) | Yes | Authoritative IDs, status and priority | None |
| UX_SPEC.md v2.0 | Yes | Screens SCR-UX-001 to -017, flows FLOW-UX-001 to -020, components, messages, §12 needs | None |
| UX_SPEC_VALIDATION.md v2.0 | Yes | PASS_WITH_WARNINGS; conditions COND-UX-1 and COND-UX-2 for P05 | None |
| ARCHITECTURE.md v2.0 | Yes | Artifact under validation | — |
| API_SPEC.yaml v1.0, DATA_MODEL.md v1.0 | Yes | Additional artifacts under validation (TD-20) | — |
| Official Vercel and Neon documentation | Yes (read online) | Verifying the hosting facts | Vendor pages can change. They were read on 2026-10-10. |

No input is missing or contradictory. Validation can proceed reliably.

---

## 3. Executive Assessment

**Overall quality.** The v2.0 architecture is a clean evolution of v1.0:

- the same modular monolith, with one new module (COMP-012 Ordering);
- the v1.0 open decisions closed by the team's decisions, with the basis named for every ADR;
- a concrete deployment model for the decided host.

The written contracts (API_SPEC.yaml) and the executable schema (DATA_MODEL.md) remove the main v1.0 risk, contract drift during parallel work (v1.0 AV-004).

**Scope and UX alignment.**

- Scope matches P03 v2.0 exactly: 15 committed stories, 7 ordering stories behind feature switches, and 12 Group A/B stories as extension only.
- Every UX_SPEC v2.0 screen maps to interfaces and data.
- Both UX validation conditions for P05 are met:
  - COND-UX-1: every §12 outcome exists in API_SPEC.yaml;
  - COND-UX-2: ADR-017 defines the release switches, which match the slices of P04-ASM-029.

**Main strengths.**

- The integrity rules are enforced twice, in the module and in the database:
  - one booking per slot for an independent veterinarian (partial unique index plus a lock, tested under concurrency);
  - the clinic address is required;
  - independent veterinarians offer home services only;
  - order quantity limits and totals.
- Order status changes are conditional updates, which also handles the owner-cancel versus provider-dispatch race.
- Hosting constraints were taken from official documentation and turned into explicit rules, for example:
  - pooled connections (CR-024);
  - Express on Vercel (CR-025);
  - Hobby's collaboration restriction (P05-RISK-012).

**Most important concerns.**

1. **Vercel topology not yet proven (AV-001).** Static client, Express function and SPA rewrite in one project are an assumption until the step-0 deployment, although each piece is documented by Vercel. Hash routing is the fallback.
2. **Public repository (AV-002).** It was chosen under TD-19 to work around Hobby's private-repository restriction. The choice has a visibility consequence the team should know about.
3. Native Argon2 on Vercel, and the DDL on Neon itself, still need confirming at step 0 (AV-003, AV-004).

**Can it guide the next stage?** Yes. P06 can plan and implement from ARCHITECTURE v2.0, API_SPEC.yaml and DATA_MODEL.md, provided the step-0 checks of COND-001 run before the stories that depend on them.

---

## 4. Validation Scorecard

| Category | Status | Evidence | Findings |
|---|---|---|---|
| A. Scope and requirements alignment | PASS | §2.1 covers FR-001 to FR-005, FR-009 to FR-011, FR-014, FR-017 to FR-026, FR-029, FR-032 to FR-039 and NFR-001 to NFR-005. The 11 uncovered FRs belong only to Groups A and B (EXTENSION_ONLY, TD-16). No requirement is added. | — |
| B. Planning and backlog alignment | PASS | §14 was generated from the P03 backlog v2.0, and its scope labels equal the backlog's (script). Ordering is behind switches, so committed work does not depend on it. | — |
| C. UX and design-system alignment | PASS | §10.1 has a row for every SCR-UX-001 to -017 and for the account menu. The §12 needs table maps each need to an API element. COND-UX-1 and COND-UX-2 are met. The MSG and COMP-UX IDs cited exist in UX_SPEC (script). | — |
| D. Architectural style and simplicity | PASS | One deployable, one database, no runtime services beyond the host. Alternative E (two Vercel projects) is rejected with a reason. | AV-001 |
| E. System context and components | PASS | 12 components with responsibilities, exclusions and interfaces. The context and deployment diagrams match §4 and §5.5. | — |
| F. Interfaces and dependencies | PASS | Client–backend interfaces: the 21 IDs in §7.1 equal API_SPEC's `x-vetcare-interface` set, and the operationIds named per interface match (script). Internal interfaces: 10 active; IF-023 is retired with a reason. Three cross-module commands only. | AV-005 |
| G. Conceptual data architecture | PASS | DATA-001 to DATA-008 map one-to-one to DDL tables with the same owners as DATA_MODEL §4.1 (script). Enumerations and limits are identical in API_SPEC and the DDL (script). The DDL executes and its constraints reject the 32 forbidden writes. | AV-004, AV-006 |
| H. Security and quality attributes | PASS | Required controls trace to NFR-001, NFR-002, NFR-005 and BR-039: Argon2id; a hashed session token; Origin and JSON checks; uniform NOT_FOUND; no secrets in the repository. No targets are invented (P05-UNK-001). | AV-003 |
| I. Architectural decisions and traceability | PASS | 18 ADRs, all ACCEPTED, each with a named basis (TD-01, TD-14, TD-15, TD-19, TD-20 or an upstream fact). The ACCEPTED status for ADR-016 to ADR-018 relies on TD-19's advance approval, and this is stated. | AV-002 |
| J. Risks, constraints and open decisions | PASS | 19 risks with status; 26 constraints (CR-013 revised, CR-014 retired, both marked); no open RD; two non-blocking unknowns. | AV-007 |
| K. Implementation readiness and parallel work | PASS_WITH_CONDITIONS | Step-0 plan (§15.1); seven work areas; contracts written (CTR-001 to -007, -009); CTR-008 at sprint start (TD-15). | AV-001, AV-003, AV-004 → COND-001 |
| L. Document quality and internal consistency | PASS | IDs contiguous; diagrams render; vendor sources cited. | AV-008 |
| **Extra: API_SPEC.yaml valid OpenAPI 3.1** | PASS | Valid under the official OAS 3.1 schemas; validator sensitivity confirmed (§1.1 rows 2–4) | AV-005 |
| **Extra: API_SPEC / DATA_MODEL consistency with ARCHITECTURE, UX_SPEC, REQUIREMENTS** | PASS | 33 / 33 cross checks (§6.1); 85 / 85 committed and ordering acceptance criteria cited in API_SPEC | — |

---

## 5. Detailed Findings

No CRITICAL or HIGH findings. One MEDIUM finding is limited to specific implementation work.

### AV-001 — MEDIUM — D, K — The Vercel topology is an assumption until the step-0 deployment

| Field | Content |
|---|---|
| Status | Open; condition COND-001 |
| Evidence | ARCHITECTURE §5.5 and P05-ASM-012: React build in `public/`, Express exported as a single Vercel Function for `/api/*`, and a `vercel.json` rewrite for deep links. Vercel documents each piece separately: Express on Vercel serves static files only from `public/**` and ignores `express.static()`; the Vite page documents the SPA rewrite. Their combination in one project is not documented on those pages. ARCHITECTURE marks it "verified at step 0" (P05-RISK-013). |
| Affected | ADR-014; COMP-001, COMP-003; every screen reachable by URL (deep links, page reload) |
| Impact | If the rewrite intercepted `/api` or static files were not served, reloading client routes would fail. The fallback (hash routing) is defined and cheap, so the impact is limited to rework in routing. |
| Recommendation | Run §15.1 item 3 before building screens. If deep links fail, switch to hash routing and record it in ARCHITECTURE (P05-ASM-012). |
| Blocks | Only the client routing setup; not the next stage |

### AV-002 — LOW — I — Public repository chosen under the standing rule

| Field | Content |
|---|---|
| Status | Approved under TD-19; flagged for team awareness |
| Evidence | P05-ASM-011; P05-RISK-012. Vercel's documentation states that Hobby does not support collaboration for private repositories and that the commit author must be the Hobby team owner; collaboration is free for public repositories. TD-14 says "repository on GitHub" but not its visibility. |
| Impact | Making the repository public exposes the source code, and that exposure cannot be fully undone afterwards. The alternative (a private repository with only owner-authored deployed commits) channels every deployment through one person. |
| Recommendation | No correction is required. The team should know this is the one P05 choice with an irreversible side effect. If the team objects, use the private alternative described in P05-ASM-011. |
| Blocks | No |

### AV-003 — LOW — H, K — Argon2id native library on Vercel is not yet verified

| Field | Content |
|---|---|
| Evidence | ADR-006 names bcrypt as the fallback if the Argon2 library does not build on Vercel's Node.js runtime; §15.1 item 3 includes the check. |
| Impact | At worst, the hashing library is swapped. NFR-001 holds either way. |
| Recommendation | Hash one password on the deployed skeleton (part of COND-001). |
| Blocks | No |

### AV-004 — LOW — G, K — The DDL was verified on local PostgreSQL 16, not on Neon

| Field | Content |
|---|---|
| Evidence | DATA_MODEL Appendix B ran on PostgreSQL 16.15. It uses only core features (`gen_random_uuid`, partial unique index, stored generated column, composite foreign keys). The behavior of Neon's pooled connections is documented (DATA_MODEL §8) but not exercised. |
| Impact | Low. The features are standard PostgreSQL. The pooler restrictions are covered by CR-024. |
| Recommendation | Apply the migration with `DATABASE_URL_UNPOOLED`, and run one booking transaction through `DATABASE_URL` on the skeleton (part of COND-001). |
| Blocks | No |

### AV-005 — LOW — F — Some rules are stated only in descriptions in API_SPEC.yaml

| Field | Content |
|---|---|
| Evidence | JSON Schema cannot express three rules, so API_SPEC.yaml states them in descriptions: "each weekday once" in `WeeklyHours`, "at most one decimal" in `weightKg`, and "a clinic must send a modality" in `PublishServiceRequest`. Each has a reason code (END_NOT_AFTER_START, INVALID_FORMAT, REQUIRED). Validators generated from the schema will not reject them. |
| Impact | Client-side schema validation alone would accept them; the server rejects them (CR-003). |
| Recommendation | Cover the three rules in backend unit tests. Optionally, add them to the client's form validation. |
| Blocks | No |

### AV-006 — LOW — G — Per-request session write

| Field | Content |
|---|---|
| Evidence | ADR-007 updates `last_seen_at` on every authenticated request to implement the 60-minute idle expiry. |
| Impact | One extra write per request. This is negligible at demonstration volume, and the architecture acknowledges it. |
| Recommendation | Optional: update at most once per minute; this does not change NFR-005 meaningfully. |
| Blocks | No |

### AV-007 — LOW — J — Revised and retired IDs

| Field | Content |
|---|---|
| Evidence | CR-013 changes from "no ordering" to "ordering only within its module and switches". CR-014 and IF-023 are retired. All three are marked in the text, and the IDs are not reused. |
| Impact | Readers of v1.0 could misread CR-013 if they skip the "Revised" note. |
| Recommendation | Keep the explicit markers. No change is needed. |
| Blocks | No |

### AV-008 — INFO — L — Same-AI production without a separate reviewer

| Field | Content |
|---|---|
| Evidence | §1.1, independence notice; P05-RISK-011. |
| Impact | Judgment errors not caught by the mechanical checks could remain, for example in the choice of feature-switch granularity or in the ordering design. |
| Recommendation | A team member reviews ADR-014, ADR-016, ADR-017 and P05-ASM-011 before implementation. |
| Blocks | No |

**Categories without findings:** A, B, C and E. No material issue was identified, based on the evidence in §4 and §6.

---

## 6. Traceability Review

- **Requirements → architecture.** All 44 requirements (39 FR, 5 NFR) appear once in §14.2:
  - 26 SUPPORTED;
  - 7 SUPPORTED (switch): FR-032 to FR-038;
  - 11 EXTENSION_ONLY: Group A/B functions only.

  FR-039 (sign-out) and NFR-005 (expiry) are new and supported (IF-025, IF-003, ADR-007).
- **Backlog → components.** All 34 backlog items appear once in §14.1, with scope equal to the P03 backlog v2.0 (script):
  - 15 committed: SUPPORTED;
  - 7 ordering: SUPPORTED (switch);
  - 12 Group A/B: EXTENSION_ONLY, each naming its owning module.
- **UX → frontend and data.** All 17 screens and 20 flows are referenced. The 85 acceptance criteria of the committed and ordering stories are referenced in ARCHITECTURE and in API_SPEC.yaml (85 / 85).
- **Decisions → evidence.** Each ADR names its basis. Hosting facts cite official documentation.

**Material gaps:** none.

### 6.1 Consistency of API_SPEC.yaml and DATA_MODEL.md (Cross-Document Checks)

| Check | Result |
|---|---|
| Client–backend interfaces: ARCHITECTURE §7.1 equals API_SPEC (21 IDs; operationIds per interface) | PASS |
| Outcome codes and HTTP statuses: ARCHITECTURE §7.4 equals API_SPEC `OutcomeCode`; response descriptions use codes with their documented statuses; `CLINIC_ADDRESS_REQUIRED` removed | PASS |
| Reason codes identical | PASS |
| Enumerations identical between API and DDL: account type, provider type, species, offered and chosen modality, appointment status, order status | PASS |
| 12 limits identical between API and DDL: names, email, phone, address, pet name, breed, offering name, quantity 1–99, price > 0, weekday 1–7, hours, weight | PASS |
| P05-ASM-004 limits stated identically in ARCHITECTURE | PASS |
| Tables and owning modules: ARCHITECTURE §8.1 equals DATA_MODEL §4.1 equals the DDL (8 tables) | PASS |
| DDL extracted from DATA_MODEL.md executes on PostgreSQL 16 | PASS |
| Every UX screen in ARCHITECTURE §10.1; MSG, COMP-UX and P04 IDs exist upstream | PASS |
| Feature switches: API `Feature` enum equals ADR-017 equals operations' `x-vetcare-feature`; every ordering and stock operation is switched; `orders` covers IF-027 to IF-030, matching P04-ASM-029 | PASS |
| Session: cookie name, 60 minutes / 12 hours, and `Max-Age=43200` consistent across the three documents and NFR-005 | PASS |
| Clinic-address rule (API `if/then`, DDL `clinic_address_required`), independent-home rule (AC-107, `independent_home_only`), partial unique index: present in all relevant documents | PASS |

---

## 7. Scope and Consistency Review

- **Unjustified scope expansion:** none. Ordering is in scope by TD-16 and is switchable.
- **Deferred features driving complexity:** none. Groups A and B add no table, column or interface; DATA_MODEL §9 only notes how they would extend.
- **Conflicts between sources:** none found among REQUIREMENTS v3.0, PRIORITIZATION v2.0, UX_SPEC v2.0 and the architecture. The P00/P01 drift is outside P05.
- **Diagrams versus text:** consistent. The component diagram's arrows match §7.3, IF-023 is absent, and COMP-012 is present (script). The deployment view matches §5.5.
- **Unsupported technology or integration assumptions:** none. React, Express, PostgreSQL, Vercel, Neon and GitHub come from TD-14. Vite, React Router and `pg` are complementary choices approved under TD-19 (P05-ASM-014, -015). The script found no other technology names.

---

## 8. Readiness Conditions

| ID | Required action | Reason | Findings | Affected work | Owner |
|---|---|---|---|---|---|
| COND-001 | On the step-0 skeleton deployment (ARCHITECTURE §15.1 item 3), verify on the real Vercel and Neon setup that: (a) `/api/*` reaches the Express function and static files are served from `public/`; (b) reloading a client route returns the client (otherwise adopt hash routing); (c) Argon2id hashing works (otherwise bcrypt); (d) the migration applies through `DATABASE_URL_UNPOOLED` and a booking transaction runs through `DATABASE_URL`. Record the outcome in ARCHITECTURE (P05-ASM-012). | These are the only P05 assumptions not yet verified on the target platform. | AV-001, AV-003, AV-004 | Client routing setup; sign-up hashing; any database work on Neon | The DevOps role; the hosting accounts are managed by Fonseca (TD-14) |

No other condition is needed. Conditions COND-UX-1 and COND-UX-2 from UX validation are met.

---

## 9. Strengths and Nonblocking Improvements

### Strengths

- **Contracts and schema exist as verified files.** API_SPEC.yaml is valid OpenAPI 3.1, and the DDL is executable with integrity tests. Parallel work no longer depends on contracts being written during the sprint.
- **Defense in depth for business rules.** Each rule is enforced in a module and again by a database constraint where one can express it, with module-only rules listed explicitly (DATA_MODEL §6.2).
- **Race-safe design.** A provider lock plus a partial unique index for bookings, a share lock for orders against availability changes, and conditional updates for order status.
- **Release control.** Feature switches let the team ship the committed scope without exposing partial ordering work.
- **Platform facts verified at the source.** The documented hosting restrictions (Hobby collaboration, pooler limits, static files on Vercel) became explicit constraints.

### Optional Improvements

- AV-005: unit tests, and optionally client checks, for the three description-only API rules.
- AV-006: throttle the session last-use update.
- Write the environment variables and deployment steps into the repository README (P05-RISK-019).
- Add contract tests that validate responses against API_SPEC.yaml (already recommended in ARCHITECTURE §9.4).

---

## 10. Final Recommendation

- **Final status: PASS_WITH_CONDITIONS.**
- **Suitable for the next stage:** yes. P06 can plan and implement from ARCHITECTURE v2.0, API_SPEC.yaml v1.0 and DATA_MODEL.md v1.0.
- **What must be done first:** COND-001, the step-0 platform checks, before client routing and database work depend on them.
- **Revise ARCHITECTURE.md before proceeding?** No. Record the COND-001 outcome in P05-ASM-012 after the step-0 deployment.

---

## Validator Integrity Statement

The source artifacts were read from disk and checked by scripts, not inferred from the architecture's own claims. Every identifier cited in this report exists in the inspected artifacts. Vendor facts were compared with the official pages listed in ARCHITECTURE §17.4. The same AI produced the artifacts and this report (AV-008); human review is recommended.
