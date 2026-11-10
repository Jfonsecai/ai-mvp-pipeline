# Change Request CR-P06-001 — Verification of the order-related clauses of US-015

> **ID note.** The sequence `CR-0nn` is already used for two unrelated things in the artifacts (team change requests such as `CR-027` and architecture constraints `CR-001` to `CR-032`). To avoid a third collision this request uses the provisional ID `CR-P06-001` (raised in stage P06). The team may rename it.

| Field | Value |
|---|---|
| Date | 2026-11-10 |
| Raised by | AI assistant, during P06.4 of US-015 (`US-015_IMPLEMENTATION_VALIDATION.md`, finding F-01) |
| Decision | **APPROVED in direction by the team** on 2026-11-10 (chat: "Escogemos la opción 1 como equipo"), option 1 of the explanation given the same day. The exact wording below was drafted by the assistant from that option. **The team reviewed the exact wording** (the five criteria in the three artifacts) on 2026-11-10 (chat: "La revisamos") and accepted it as written. |
| Status | APPLIED to the artifacts listed below (uncommitted) |

## Reason

US-015 (Remove a product) has two acceptance criteria whose literal text cannot be verified in the current delivery:

- **AC-037** ends with "…and it cannot be ordered" (rule BR-030).
- **AC-085** is observed when "the owner or the provider opens their orders".

Product ordering and the order views (US-027, US-028, US-029) are DEFERRED by the team (TD-29); there is no code that creates or lists orders. Validation of US-015 therefore ended `BLOCKED` (F-01) although everything exercisable passed. The ordering-time rule and the order views belong, by nature, to the ordering stories; keeping them as conditions of a catalog story makes that story unclosable until ordering exists.

## Affected Artifacts

| Artifact | Change |
|---|---|
| `artifacts/03_planning/product_backlog_priori_v3.json` (authoritative for the acceptance criteria) | Text of AC-037, AC-085 (US-015), AC-089 (US-027), AC-072 (US-028), AC-090 (US-029); version 3.1 → 3.2 |
| `artifacts/02_requirements/product_backlog_requirements_v4.json` (P02 backlog) | Same five criteria; version 4.1 → 4.2 |
| `artifacts/02_requirements/REQUIREMENTS_V4.md` (P02 requirements) | Same five criteria; version 4.1 → 4.2; new change-log section |
| `artifacts/06_implementation/increments/US-015_IMPLEMENTATION_VALIDATION.md`, `…_V2.md`, `…_LOG.md`, `IMPLEMENTATION_INDEX.md` | Revalidation record (history kept) |

Reviewed and **not** changed because they only cite IDs or already describe AC-037 and AC-085 as data results: `UX_SPEC_V3.md` (§ "Acceptance criteria not cited by ID"), `API_SPEC_V2.yaml`, `ARCHITECTURE_V4.md`, `ARCHITECTURE_VALIDATION_V4.md`, `PRIORITIZATION_V3.md`, `DATA_MODEL_V1.md`. The earlier versions of the requirements and backlog files are history and are not modified.

## Affected Requirements

FR-016 (Remove product), FR-032 (Order a product), FR-033, FR-034 (order views); rules BR-030 and EDGE-019 (their IDs and texts are unchanged); stories US-015, US-027, US-028, US-029. No ID is created, renamed or deleted.

## Impact

- **US-015** keeps everything that is observable today: the product leaves the catalog, the profile and the search; orders already placed are not changed when the product is removed (verified at the data level). It can be re-validated without new code.
- **US-027 / US-028 / US-029** (deferred) receive the clauses that need ordering. They remain DEFERRED; nothing is implemented now. When they are built, their validation must cover:
  - AC-089: an order for a **removed** product is rejected exactly like one for a not-available product (BR-030). The ordering code must read `removed_at` under the provider lock; the database has no guard of its own (`product_order` only needs the product row to exist).
  - AC-072 and AC-090: the provider's and the owner's order lists include the orders of products removed after the order was placed, with their current status (EDGE-019, P02-ASM-012).
- No change to scope, architecture, schema, API or UX. The estimate of the deferred stories is kept.

## Proposed Change (exact wording applied)

| Criterion | Before | After |
|---|---|---|
| AC-037 (US-015) | Then: "the product no longer appears in their catalog, on their profile or in search results, **and it cannot be ordered**" | Then: "the product no longer appears in their catalog, on their profile or in search results" |
| AC-085 (US-015) | Given: "a removed product with orders that were placed before its removal" · When: "the owner or the provider opens their orders" · Then: "those orders keep their current status (P02-ASM-012)" | Given: "a published product with orders that were placed before its removal" · When: "the provider removes the product" · Then: "those orders are not changed and keep their current status (P02-ASM-012)" |
| AC-089 (US-027) | Given: "a product marked as not available" | Given: "a product marked as not available or removed" |
| AC-072 (US-028) | Then: "…the delivery address and the status" | Then: "…the delivery address and the status, including orders for products that were removed after the order was placed (EDGE-019, P02-ASM-012)" |
| AC-090 (US-029) | Then: "…the delivery address and the status" | Then: "…the delivery address and the status, including orders for products that were removed after the order was placed (EDGE-019, P02-ASM-012)" |

Unchanged: the business-rule and edge-case lists of every story (BR-030 and EDGE-019 stay on US-015; BR-030 is already on US-027), all IDs, priorities, estimates and statuses.

## Required Revalidation

1. **US-015:** repeat P06.4 against the amended criteria (new versioned report `US-015_IMPLEMENTATION_VALIDATION_V2.md`; the first report is kept as history). No code change is expected.
2. **US-027, US-028, US-029:** when they are implemented, their P06.3 handoff and P06.4 validation must verify the clauses above (including the `removed_at` check under the provider lock and a test for it).
3. Nothing else needs revalidation: the only criteria texts touched belong to stories that are not implemented.
