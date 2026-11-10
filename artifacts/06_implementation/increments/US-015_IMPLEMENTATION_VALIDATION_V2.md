# US-015 Implementation Validation — V2 (revalidation after CR-P06-001)

## 1. Metadata

| Field | Value |
|---|---|
| Phase / prompt | P06 — Implementation / `P06.4_US_validation.md` v1.0 (second execution for US-015) |
| Validation date | 2026-11-10 |
| HU | US-015 — Remove a product (EPIC-004; P2 / SPRINT-002 / RELEASE-002; 2 points) |
| Backlog source | `artifacts/03_planning/product_backlog_priori_v3.json` **v3.2** (item `US-015`, PLANNED, `iteration_2_status: COMMITTED`); amended by `artifacts/03_planning/CHANGE_REQUEST_CR-P06-001.md` |
| Previous report | `US-015_IMPLEMENTATION_VALIDATION.md` (V1, **BLOCKED**, kept unchanged as history, with its own addenda) |
| Implementation log | `US-015_IMPLEMENTATION_LOG.md` (sections 1–15) |
| Requirements | FR-016 |
| Acceptance criteria | AC-037, AC-085 **as amended by CR-P06-001** |
| Business rules / edge cases | BR-030, EDGE-019 (IDs and texts unchanged; their ordering-time parts moved to US-027/028/029 by the CR) |
| Dependencies | DEP-001, DEP-004 |
| Foundation validation | PASS_WITH_WARNINGS; `ARCHITECTURE_VALIDATION_V4.md` PASS (v4.1) |
| Implementation status (P06.3) | READY_WITH_LIMITATIONS |
| **Final validation status** | **PASS_WITH_WARNINGS** |

## 2. Executive Summary

V1 ended `BLOCKED` because two acceptance criteria contained parts that need ordering, which the team deferred (TD-29). The team chose to resolve this with a change request (2026-11-10, "opción 1"); `CR-P06-001` moves those parts to the ordering stories (AC-089 of US-027, AC-072 of US-028, AC-090 of US-029) and restates AC-037 and AC-085 at the level that can be observed today. This report validates US-015 against the **amended** criteria. It does not claim the moved clauses pass: they are explicitly **not validated** here and are conditions of the future ordering stories.

Against the amended criteria both pass with the same independent evidence gathered in V1, re-confirmed now: the production code is byte-identical to the version validated in V1 (`offerings.js` compared with the copy taken at that time; no source file changed afterwards), the full suite passes (278 of 278), the build and the patch check are clean, six new oracle-probe seeds found no difference (2,595 checks; V1 had 3,424 more), and the browser check had already been repeated on the repository's standard servers (V1 addendum §15). No defect, no code change.

Open warnings: the dialog still has no real keyboard / screen-reader / visual pass (F-07), migration 002 is still pending on Neon (F-08), the amended wording was drafted by the assistant and the team should review it in the diff before committing (F-10), and the moved clauses must be verified when US-027, US-028 and US-029 are built (F-01 follow-up).

## 3. Validation Scope and Limitations

**Examined.** Same code as V1 (`removeOffering` and the `DELETE` route, the catalog page and CSS, the removal tests), plus the change request and its application to the three artifacts (`product_backlog_priori_v3.json` v3.2, `product_backlog_requirements_v4.json` v4.2, `REQUIREMENTS_V4.md` v4.2).

**Not validated (by design of the CR).** "It cannot be ordered" and BR-030 as enforced at order time (AC-089, US-027); the order lists of the provider and the owner showing orders of products removed later (AC-072 / AC-090, US-028 / US-029). Also not verified: hosted Vercel/Neon behavior; a real-keyboard, screen-reader and visual pass.

**Independence of the revalidation.** Nothing in the code changed, so the V1 mutation results (16 of 16 detected) remain valid and were not repeated; everything else that can drift (suite, build, probe with new seeds, artifact consistency) was re-run. The amended text of each criterion was compared with the tests that exercise it (section 4).

**This is HU-level validation, not final product-wide testing (P07).**

## 4. Acceptance Criteria Validation Matrix (amended criteria)

| Criterion | Expected behavior (v3.2) | Implementation evidence | Verification method | Result | Evidence | Findings |
|---|---|---|---|---|---|---|
| AC-037 | Given a signed-in provider with a published product, when they remove it, then the product no longer appears in their catalog, on their profile or in search results. | `removeOffering` / `DELETE /provider/offerings/:id`; `removed_at IS NULL` filters; "Eliminar" + dialog. | No-database tests (5), PostgreSQL tests (7), oracle probe (V1: 8 seeds; V2: 6 new seeds), 16 mutants (V1), browser on isolated and on standard servers. | **PASS** | Absent from `GET /provider/offerings`, `GET /providers/:id`, `/search` with and without the species filter, `/search/voice` and the assistant; the row stays with `removed_at = now` and no other column changed; other products, services and appointments untouched; ownership: uniform `404` for another provider, owner, anonymous (401), foreign Origin (403), unknown, malformed and already removed ids, with the product and its order byte-identical afterwards; the probe's catalog, profile and search matched the oracle in 14 seeds (6,019 checks in total with the V1 run). Browser: the card disappears with "Producto eliminado."; the owner's search and profile no longer list it. | — |
| AC-085 | Given a published product with orders that were placed before its removal, when the provider removes the product, then those orders are not changed and keep their current status (P02-ASM-012). | The removal issues no statement on `product_order`; logical removal keeps the foreign key valid. | PostgreSQL test `AC-085 / EDGE-019 / P02-ASM-012`, no-database test asserting that a product removal issues only the lock, the offering select and the `removed_at` update, probe, mutants. | **PASS** | Orders in `confirmed`, `in_delivery`, `closed` and `cancelled` for two owners plus an order of another product are byte-identical after the removal (status, `status_changed_at`, price, quantity, address); none deleted (6 rows before and after); each still joins its removed product row; the probe inserted 11–20 orders per seed (V2 seeds) among random removals and found none changed (full-row comparison); mutants "cancel the product's orders" and "physical delete" detected (V1). Browser: the three orders of a removed product kept their statuses (checked in the database). | — |

## 5. Business Rules, Edge Cases, and Dependencies

| ID | Expected behavior | Evidence reviewed | Result | Findings / limitations |
|---|---|---|---|---|
| BR-030 | A removed or not-available product cannot be ordered. | Applies at order time; by CR-P06-001 it is verified through AC-089 of US-027 (now "not available or removed"). `removed_at` is set correctly by this story, which is its precondition. | Not applicable to this HU (delegated, not validated) | F-01 follow-up, F-06 |
| EDGE-019 | A provider removes a product that has already been ordered: new orders are not possible; existing orders keep their status. | "Existing orders keep their status": see AC-085 (PASS). "New orders are not possible": delegated to AC-089; orders listed with their status: delegated to AC-072 / AC-090. | PASS for the part owned by US-015 | F-01 follow-up |
| NFR-002 / CR-006 | A provider changes only its own catalog; uniform `NOT_FOUND`. | See AC-037. | PASS | — |
| CR-029 | User-facing reads exclude removed rows; history does not. | See AC-037; a removed product cannot be edited (US-014). | PASS | — |
| IF-024 | Removal serialized by the provider lock. | Lock test, simultaneous removals, edit race; mutants M06 / M16 (V1). | PASS | — |
| Services path (US-012) | Services still cancel their upcoming appointments after the generalization. | US-012 tests (18) pass; probe compares cancelled counts with the oracle. | PASS | — |
| DEP-001 / DEP-004 | Provider guard; published products. | As in V1. | PASS | F-09 |

## 6. Test and Verification Results

| Check | Command / procedure | Result | Evidence / limitation |
|---|---|---|---|
| Source unchanged since V1 | `cmp` of `offerings.js` with the copy taken during V1; file modification times of the client files, CSS and tests against the V1 report | PASSED | Identical / all earlier than the V1 report. |
| Full suite | `npm test` (with `TEST_DATABASE_URL`) | PASSED | 278 tests, 278 passed, 0 failed, 0 skipped. |
| Criterion-focused tests | `--test-name-pattern="AC-085\|AC-037"` on the two US-015 files | PASSED | 4 of 4. |
| Production build | `npm run build` | PASSED | Vite build succeeded. |
| Patch check | `git diff --check` | PASSED | No whitespace errors. |
| Artifact consistency | Parse of both backlog files and count of IDs; diff review of the three amended artifacts | PASSED | Both JSON files valid; 42 stories and 160 unique AC IDs in each; versions 3.2 / 4.2; the diff contains only the five criteria, the version/source/revision-note lines and the change-log section; the unrelated "not available" criterion of the stock story (AC-101) was not touched. |
| Adversarial probe, new seeds | Same script as V1 (oracle of offerings, appointments and every order row), seeds 11–16 | PASSED | 2,595 checks, 0 differences. |
| Mutation testing | Not repeated | n/a | Code unchanged; V1 result stands: 16 of 16 detected (the probe alone detected 9). |
| Browser | Not repeated in V2 | n/a | V1 addendum §15 already repeated it on the repository's standard `npm run dev:api` / `dev:client` after the last code edit; the UI did not change. |
| Real keyboard, screen reader, visual pass | — | NOT_RUN | F-07. |
| Hosted Vercel / Neon | — | NOT_RUN | F-08. |

## 7. Architecture, UX, and Integration Conformance

Unchanged from V1: the implementation conforms to `ARCHITECTURE_V4` §8.3, ADR-020, CR-029 and the `RemovalResult` contract; the dialog texts match `UX_SPEC_V3` §5; no schema, dependency or contract change. The change request itself changes only acceptance-criteria text in the planning and requirements artifacts, creates, renames and deletes no ID, and leaves the deferred stories deferred. `UX_SPEC_V3`, `API_SPEC_V2`, `ARCHITECTURE_V4`, `PRIORITIZATION_V3` and `DATA_MODEL_V1` only cite these IDs or already describe AC-037 and AC-085 as data results, so they needed no change.

## 8. Security, Data Integrity, and Regression Findings

As in V1: authorization, input handling, logical removal, orders untouched, serialization and concurrency show no defect; the 264 earlier tests and the 14 added by US-015 pass. The one thing no mechanism covers today is a database-level guard against ordering a removed product (the foreign key only needs the row); it is now an explicit requirement for US-027 through AC-089 and the CR.

## 9. Findings Register

No `CRITICAL`, `HIGH` or `MEDIUM` finding is open. **No mandatory correction is open.**

| ID | Severity | Title | State in V2 |
|---|---|---|---|
| F-01 (V1) | was HIGH (dependency blocker) | Order-related parts of AC-037 / AC-085 unverifiable while ordering is deferred | **Resolved by CR-P06-001.** Follow-up (open, owned by US-027, US-028, US-029): verify AC-089 with removed products and the `removed_at` check under the provider lock, and AC-072 / AC-090 with orders of products removed later. |
| F-02, F-03 (V1) | LOW | Touch target of "Eliminar"; stale comment | Fixed in V1 (unchanged). |
| F-04 (V1) | INFO | Two mutants detected only by white-box assertions | Closed. |
| F-05 (V1) | MEDIUM (environment) | Test rows inserted into `vetcare_dev` | **Closed** (deleted at the developer's request, V1 §14). |
| F-06 (V1) | INFO | No database guard against ordering a removed product | Now a requirement of AC-089 for US-027 (CR-P06-001). Open follow-up. |
| F-07 (V1) | LOW (warning) | No real keyboard / screen-reader / visual pass of the dialog | **Open (non-blocking)**; manual pass in P07, shared with US-011 / US-012 / US-014. |
| F-08 (V1) | INFO (warning) | Hosted run pending (migration 002 on Neon) | **Open**; apply before the iteration-2 deployment (P08), then smoke-test a product removal. |
| F-09 (V1) | INFO | Index rows of US-010 and US-013 are stale FAIL | Open (outside this HU). |
| F-10 (new) | INFO (warning) | The exact wording of the amended criteria was drafted by the assistant from the team's choice of option 1 | **Open until the team reviews the diff** of `product_backlog_priori_v3.json`, `product_backlog_requirements_v4.json` and `REQUIREMENTS_V4.md` (five criteria) and the change request before committing; rename `CR-P06-001` if wanted. |

## 10. Implementation Log Consistency

Confirmed again: the log matches the repository. Its section 6 reports both criteria as `PARTIALLY_IMPLEMENTED` against the **original** text; with the amended text they are fully implemented as far as this HU is concerned. This is recorded in a new addendum (section 16 of the log); the original sections are untouched. Status READY_WITH_LIMITATIONS stays consistent (limitations: F-07, F-08).

## 11. Readiness Decision

US-015 can be considered validated with warnings **against the criteria as amended by CR-P06-001**: both required criteria pass with independent evidence, the business rules and dependencies that belong to this HU are satisfied, there is no material defect, and the part that cannot be exercised today has been moved, with an explicit verification obligation, to the stories that will build ordering. Conditions to carry: F-10 (team review of the amended wording), F-07 (manual pass in P07), F-08 (migration 002 on Neon), and the follow-up of F-01 / F-06 in US-027, US-028 and US-029. Nothing here says the product is ready for release. The catalog stories of iteration 2 (US-011, US-012, US-014, US-015) are now all validated with warnings; the next story must be chosen from the backlog and planning artifacts with its own dependency check.

## 12. Final Status

**PASS_WITH_WARNINGS**

## 13. Corrective Actions and Retest Guidance

No failed or blocking finding. Follow-ups: F-10 — the team reviews the diff and the change request; F-07 and F-08 as above; in the handoff of US-027, US-028 and US-029 include the obligations listed in `CHANGE_REQUEST_CR-P06-001.md` ("Impact" and "Required Revalidation").

## 14. Addendum (2026-11-10): F-10 closed

The team reviewed the exact wording of the five amended criteria and of `CHANGE_REQUEST_CR-P06-001.md` (chat, 2026-11-10: "La revisamos") and accepted it as written, so finding F-10 is closed. The final status is unchanged: **PASS_WITH_WARNINGS** (remaining warnings: F-07, F-08, and the follow-up of the moved clauses in US-027, US-028 and US-029). Nothing has been committed.
