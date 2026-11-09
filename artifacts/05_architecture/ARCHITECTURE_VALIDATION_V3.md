# Architecture Validation Report

## 1. Validation Metadata

| Field | Value |
|---|---|
| Stage | P05 — Architecture Validation |
| Validator | `prompts/05_architecture/P05_validation.md`, version 2.0 |
| Report version | 3.0 (previous: `ARCHITECTURE_VALIDATION_V2.md`, `PASS_WITH_CONDITIONS`) |
| Architecture reviewed | `artifacts/05_architecture/ARCHITECTURE_V3.md` v3.0 (controlled correction of the deployment view, change P05-CHG-001; previous version `ARCHITECTURE_V2.md`) |
| Companion outputs | `API_SPEC_V1.yaml` and `DATA_MODEL_V1.md`: unchanged since v2.0 (git clean), not re-executed in this validation |
| Required inputs reviewed | `REQUIREMENTS_V3.md` (v3.0), `PRIORITIZATION_v2.md`, `product_backlog_priori_v2.json` (P03 backlog v2.0, 34 items), `UX_SPEC_V2.md`, `UX_SPEC_VALIDATION_V2.md` |
| Other evidence used | P08 `DEPLOYMENT.md` v2.0, `DEPLOYMENT_VALIDATION_V2.md` and its evidence files; `vercel.json`; `src/index.js`; the official Vercel page on `vercel.json` (read 2026-10-14) |
| Validation date | 2026-10-14 |
| **Overall validation status** | **PASS** |

**Short justification.** v3.0 changes only the Vercel deployment view. The validation shows by comparison that nothing else changed, re-runs the mechanical checks of v2.0 on v3.0 (30 of 30 pass), checks every new statement against the repository, the deployment evidence and the vendor documentation, and checks the one open condition of v2.0 (COND-001) against recorded executions. Two statements of the first draft of v3.0 were not supported by the evidence and one risk was missing; they were corrected after the findings below (AV-V3-001, AV-V3-002) and the corrected text was re-checked. No critical, high or medium finding remains. COND-001 is satisfied.

### 1.1 How This Validation Was Done

| # | Check | Evidence | Result |
|---|---|---|---|
| 1 | v3.0 differs from v2.0 only in the deployment view, and the deleted lines are only the superseded ones | `git diff --no-index` and a line-set comparison: 18 sections in both; 13 lines only in v2.0, all metadata or deployment-view items; the six Mermaid diagrams are byte-identical; `API_SPEC_V1.yaml` and `DATA_MODEL_V1.md` are git-clean | PASS |
| 2 | Identifier integrity | 18 ADR headings equal the 18 inventory rows; P05-RISK-001..020 and P05-ASM-001..019 unique and contiguous; P05-CHG-001 defined once (§1.4) and used consistently | PASS |
| 3 | Every upstream identifier cited exists upstream | 276 distinct IDs (US, FR, NFR, AC, BR, EDGE, TD, SCR-UX, FLOW-UX, COMP-UX, MSG) found in the inputs | PASS |
| 4 | Coverage of the inputs | 17 of 17 screens, 20 of 20 flows (compressed lists expanded), 34 of 34 backlog items in §14.1, 42 of 42 requirement IDs, 85 of 85 acceptance criteria of the committed (P0) and ordering (P1) stories (same count as the v2.0 validation) | PASS |
| 5 | New statements of §1.4 against the repository | `vercel.json` builds and routes as described; `src/index.js` imports `express` without using it and default-exports `createApp(...)`; `src/application.js` exists and `src/app.js` does not; the five cited commits exist with the titles used; SMOKE-01/06/07/08/09 exist | PASS (9 checks) |
| 6 | New statements against the deployment evidence | Five failed Production smoke runs and the three failed deployments of 2026-10-13 are in `p08_rerun_github_history.txt`; Production smoke 9 of 9 on 2026-10-14 | PASS |
| 7 | Vendor facts (Vercel documentation, `vercel.json` page, read 2026-10-14) | `builds` is listed as Legacy and "we recommend against using this property"; with `builds`, only the build outputs are in the deployment; `handle: filesystem` is listed under "Deprecated route properties" in favor of `rewrites`. The page does **not** say that `builds` overrides the project's Build Command | Two findings: AV-V3-001, AV-V3-002 |
| 8 | Technology terms | The only names new relative to v2.0 are `@vercel/static-build` and `@vercel/node`, Vercel build runtimes under the decided host (TD-14), not new technology choices | PASS |
| 9 | Category review A–L | Sections 4 and 5 | — |

**Not re-executed here (stated, not hidden):** the OpenAPI 3.1 validity of `API_SPEC_V1.yaml` and the execution of the DDL on PostgreSQL (verified in `ARCHITECTURE_VALIDATION_V2.md`; the files are unchanged, and the DDL was additionally exercised through the deployed application, see COND-001); the rendering of the Mermaid diagrams (`mmdc` is not installed here; the diagrams are byte-identical to the rendered ones of v2.0).

**Independence notice.** The same assistant produced v3.0 and this report. The decisive checks are mechanical or external (diff, repository, GitHub deployment records, the vendor's own documentation), and they found two defects in the assistant's own draft, which is evidence that the check is not a rubber stamp. No person has reviewed v3.0 (AV-V3-004).

---

## 2. Input Readiness

| Artifact | Available and readable | Role in validation | Limitations or conflicts |
|---|---|---|---|
| `REQUIREMENTS_V3.md` | Yes | Requirement, acceptance-criteria and TD identifiers | Carried from v2.0: P00/P01 drift outside P05 |
| `PRIORITIZATION_v2.md` | Yes | Scope: 15 committed stories, ordering package, Groups A and B | None |
| `product_backlog_priori_v2.json` (P03) | Yes | Authoritative IDs, scope, priority | None |
| `UX_SPEC_V2.md` | Yes | Screens and flows | None |
| `UX_SPEC_VALIDATION_V2.md` | Yes | `PASS_WITH_WARNINGS`; COND-UX-1 and COND-UX-2 | None |
| `ARCHITECTURE_V3.md` | Yes | Artifact under validation | — |
| P08 artifacts and Vercel documentation | Yes | Evidence for the corrected deployment view | Build logs not readable; vendor page may change |

No input is missing or contradictory. The P02 backlog was not used.

---

## 3. Executive Assessment

**Overall quality.** v3.0 is a small, honest correction. It replaces an assumption that the deployment refuted (P05-ASM-019: auto-detection of the entry file; and `rewrites` for deep links) with the configuration that was actually deployed and smoke-tested, keeps everything else of v2.0 byte-for-byte, records the change as P05-CHG-001 with reason, effect and evidence, and does not touch components, interfaces, data or security.

**Scope and UX alignment.** Unchanged and re-checked: 15 committed stories, 7 ordering stories behind feature switches, 12 Group A/B stories as extension only; all screens, flows and acceptance criteria are still referenced. UX validation conditions COND-UX-1 and COND-UX-2 remain met.

**Main strengths.** The change record names its evidence and its limits; the platform assumptions of v2.0 are now settled by execution rather than left as assumptions (SMOKE-06 settles ADR-006's Argon2 question on Vercel, SMOKE-08 the deep links).

**Most important unresolved concerns.** The working deployment depends on a legacy property (`builds`) and a deprecated route property (`handle: filesystem`) that Vercel still supports (AV-V3-001; risk P05-RISK-020 added). Whether the unused `import express` is still necessary was not tested. No person has reviewed v3.0.

**Can it guide the next stage?** Yes. P06 and later stages already ran on this deployed configuration; v3.0 makes the architecture agree with it.

---

## 4. Validation Scorecard

| Category | Status | Evidence | Findings |
|---|---|---|---|
| A. Scope and requirements alignment | PASS | 42 of 42 backlog requirement IDs present; no requirement added; unchanged from v2.0 | — |
| B. Planning and backlog alignment | PASS | 34 of 34 backlog items in §14.1 with the P03 backlog as reference | — |
| C. UX and design-system alignment | PASS | 17 of 17 screens, 20 of 20 flows, conditions COND-UX-1/2 unchanged | — |
| D. Architectural style and simplicity | PASS | Modular monolith, one function, one database. The change adds configuration detail, not structure. The deprecated-property reliance is registered | AV-V3-001 |
| E. System context and components | PASS | Components and diagrams identical to v2.0 | — |
| F. Interfaces and dependencies | PASS | Interface IDs cited in v3.0 all exist in API_SPEC (excluding internal ones); API_SPEC unchanged | — |
| G. Conceptual data architecture | PASS | Eight tables unchanged; the schema is exercised on Neon by SMOKE-06 | AV-V3-005 |
| H. Security and quality attributes | PASS | Origin guard (CR-021) and Argon2 path verified on the platform by SMOKE-05/06 | — |
| I. Architectural decisions and traceability | PASS | ADR-014 stays ACCEPTED (decision unchanged: Vercel plus Neon, TD-14; only the mechanism wording changed); P05-CHG-001 traceable to commits, evidence and approval note | AV-V3-003 |
| J. Risks, constraints and open decisions | PASS | RISK-013 closed with evidence; RISK-020 added; ASM-012 and ASM-019 statuses updated | AV-V3-001 |
| K. Implementation readiness and parallel work | PASS | Step 0 (§15.1) complete; COND-001 satisfied (section 8) | — |
| L. Document quality and internal consistency | PASS | IDs contiguous; 6 diagrams unchanged; vendor source added to §17.4 | AV-V3-002, AV-V3-004 |

---

## 5. Detailed Findings

No CRITICAL, HIGH or MEDIUM findings remain. Two findings were raised against the first draft of v3.0 and corrected; they are kept here so the correction is traceable.

### AV-V3-001 — LOW — D, J — The working configuration relies on legacy and deprecated Vercel properties

| Field | Content |
|---|---|
| Status | Mitigated by recording: risk **P05-RISK-020** added to v3.0 after this finding; the underlying reliance remains |
| Evidence | Vercel documentation, `vercel.json` page, read 2026-10-14: `builds` is under "Legacy" and "we recommend against using this property"; `handle: filesystem` is listed as a deprecated route property, to be replaced by `rewrites`. `vercel.json` of the repository uses both. They are still supported (Production smoke 9 of 9 on 2026-10-14). |
| Affected | ADR-014; §5.5; `vercel.json` |
| Impact | A future change by Vercel could break the build or the routing without any change in the repository. No date is announced in the page read. |
| Recommendation | Keep the post-deployment smoke test; plan a move to supported properties (`rewrites`, an entry point detected by the framework) as a controlled change when convenient, and re-test with the smoke test. Whether the unused `import express` can then be removed is untested. |
| Blocks | No |

### AV-V3-002 — LOW — L — Two statements of the first draft were not supported by the evidence

| Field | Content |
|---|---|
| Status | Corrected in v3.0 after this finding; the corrected text was re-checked |
| Evidence | (1) The first draft said that, because `builds` is legacy, "the Vercel project settings for the build command are ignored". The vendor page does not state this. (2) It said that `src/app.js` was renamed "because the name `app.js` made Vercel treat it as the entry point" and that `import express` "exists only so that Vercel recognizes the file". The only evidence is the titles of commits `b308d6a` ("avoid Vercel app entrypoint detection") and `599ead6` ("make Express entrypoint detectable by Vercel"); the Vercel build logs are not readable from the repository. The causes of the failed attempts are likewise inferred. |
| Affected | `ARCHITECTURE_V3.md` §1.4 (Reason, What is now true, Effect); P08 `DEPLOYMENT.md` §4 had repeated claim (1) and was corrected too |
| Impact | A reader could rely on an effect of `builds` that no source confirms. |
| Correction made | §1.4 now says what the documentation does and does not state, attributes the rename and the import to the commit titles, says that the exact error of each failed attempt is not recorded, and says that the need for `import express` was not tested. |
| Blocks | No |

### AV-V3-003 — LOW — I — The approval of the change rests on a recorded instruction, not on a numbered decision

| Field | Content |
|---|---|
| Status | Open, informational |
| Evidence | §1.4 "Approval": "Recorded at the request of the project team on 2026-10-14". Earlier changes used numbered team decisions (TD-01 to TD-20). |
| Impact | Low: ADR-014's decision (Vercel plus Neon, same origin) is unchanged and was accepted under TD-14; only the mechanism wording changed, and it reflects a deployment that exists. |
| Recommendation | If the team keeps a decision log, give P05-CHG-001 a TD number there. |
| Blocks | No |

### AV-V3-004 — INFO — L — Same-AI production and no human review of v3.0

| Field | Content |
|---|---|
| Evidence | §1.1, independence notice; v2.0 AV-008 and P05-RISK-011. The team reported a review of P08, P09 and P10 by a person who did not write them; it did not mention P05 or v3.0. |
| Recommendation | A team member reads §1.4 and the changed rows of §5.5, ADR-014, P05-RISK-020 and §15.1. |
| Blocks | No |

### AV-V3-005 — LOW — G, K — The schema and a booking transaction on Neon are evidenced indirectly

| Field | Content |
|---|---|
| Evidence | SMOKE-06 runs a query on the `account` table through the pooled `DATABASE_URL` on Production, so the schema exists there; a booking was part of the manual test that the team reports as passed (attestation, no recorded values). The 32 forbidden-write checks of v2.0 were run on local PostgreSQL 16, not on Neon. |
| Impact | Low: standard PostgreSQL features; v2.0 AV-004 already stated it. |
| Recommendation | Optional: run the DDL integrity checks once against the Neon `dev` branch. |
| Blocks | No |

**Categories without findings:** A, B, C, E, F, H, K.

**Status of the v2.0 findings:** AV-001 (Vercel topology) resolved with a corrected mechanism; AV-003 (Argon2 on Vercel) resolved by SMOKE-06; AV-004 narrowed to AV-V3-005; AV-002, AV-005, AV-006, AV-007, AV-008 unchanged and unaffected.

---

## 6. Traceability Review

- **Requirements → architecture.** 42 of 42 requirement IDs of the backlog are present; unchanged from v2.0.
- **Backlog → components.** 34 of 34 items in §14.1; scope labels as in the P03 backlog.
- **UX → frontend and data.** 17 screens, 20 flows, 85 of 85 acceptance criteria of the committed and ordering stories (in v3.0 or API_SPEC).
- **Decisions → evidence.** P05-CHG-001 → commits `b308d6a`, `599ead6`, `87bad3c`, `9efd49e`, `0d232d1` → `vercel.json`, `src/index.js` → P08 evidence (Production smoke 9 of 9) → vendor documentation.

**Material gaps:** none.

---

## 7. Scope and Consistency Review

- **Unjustified scope expansion:** none. No component, interface, data or feature was added.
- **Deferred features driving complexity:** none.
- **Conflicts between sources:** none new.
- **Diagrams versus text:** the deployment diagram (Vercel Function from `src/index.js`, client in `public/`) agrees with the corrected §5.5; all diagrams identical to v2.0.
- **Unsupported technology assumptions:** none; the two new package names are Vercel build runtimes.
- **Settled assumptions:** P05-ASM-012 verified; P05-ASM-019 corrected; P05-RISK-013 closed.

---

## 8. Readiness Conditions

COND-001 of `ARCHITECTURE_VALIDATION_V2.md` (step-0 checks on the real platform) is **satisfied**:

| Item | Evidence | Level |
|---|---|---|
| (a) `/api/*` reaches the function; static files from `public/` | SMOKE-01, SMOKE-07, SMOKE-09 on Production (GitHub run 38477169616; and by hand 2026-10-14) | Executed, recorded |
| (b) deep-link reload returns the client | SMOKE-08 | Executed, recorded |
| (c) Argon2id works on Vercel | SMOKE-06 (and the function starts: the module hashes at import) | Executed, recorded |
| (d) migration through the direct URL; a booking transaction through `DATABASE_URL` | Schema present on Neon (SMOKE-06 queries `account`); booking in the team's manual test | Partly executed (schema); booking is a team attestation |

No new condition is needed. The three LOW findings and the two INFO items are not conditions.

---

## 9. Strengths and Nonblocking Improvements

### Strengths

- A change record with reason, effect, evidence and limits, instead of a silent edit of the approved architecture.
- Assumptions settled by execution and the statuses updated in the same document.
- Everything not affected is unchanged, which the comparison proves.

### Optional Improvements

- Move to supported Vercel properties as a controlled change (AV-V3-001), then test whether `import express` is still needed.
- Give P05-CHG-001 a decision number (AV-V3-003).
- Human review of the corrected sections (AV-V3-004).
- Run the DDL integrity checks on a Neon branch (AV-V3-005).

---

## 10. Final Recommendation

- **Final status: PASS.**
- **Suitable for the next stage:** yes; the stages after P05 already ran on this configuration, and v3.0 now agrees with it.
- **What must be done first:** nothing blocking.
- **Revise the architecture document before proceeding?** No. The two corrections raised by this validation were already applied to v3.0.

---

## Validator Integrity Statement

The source artifacts were read from disk and checked by scripts (`evidence/p05_v3_validation_checks.txt`), not inferred from the architecture's own claims. The vendor facts were read from the official Vercel page on 2026-10-14. The same assistant produced v3.0 and this report; the two corrections to v3.0 listed in AV-V3-001 and AV-V3-002 were made after the findings and are disclosed here. No source artifact other than `ARCHITECTURE_V3.md` (and the repeated claim in P08 `DEPLOYMENT.md`) was modified. No approval or fact was invented; the team's request for the change and its manual-test report are cited as reports.
