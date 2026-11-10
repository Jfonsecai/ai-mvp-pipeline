# US-035 Implementation Validation Report

## 8.1 Metadata

| Field | Value |
|---|---|
| Prompt | `P06.4_US_validation.md` (quick validation, deadline 2026-11-10) |
| HU | US-035 — Search by voice (P0 / SPRINT-002) |
| Validation date | 2026-11-09 |
| Implementation log | `US-035_IMPLEMENTATION_LOG.md` (incl. step 0 and §14 fix DEV-I2-002) |
| Commits validated | `700e63f` (step 0), `fdf6caa` (US-035), `e75b07e` (error mapping fix) |
| Sources | REQUIREMENTS_V4 v4.1; PRIORITIZATION_V3 v3.1; UX_SPEC_V3 v3.1; ARCHITECTURE_V4 v4.1; API_SPEC_V2 |
| **Final status** | **PASS_WITH_WARNINGS** |

## 8.2 Executive Summary

All ten acceptance criteria are supported by evidence: automated text and PostgreSQL tests, a simulated-recognizer browser walk-through, and the team's report of a working real voice search in Google Chrome. Two low UX consistency findings were found on SCR-UX-004 (F-01, F-02) and corrected in the same session (§8.13). Warnings: Android Chrome and the production deployment (migration 002 on Neon) are not evidenced yet.

## 8.3 Validation Scope and Limitations

Inspected: `src/modules/search/voice-phrase.js`, `src/modules/search/offerings.js`, `client/src/voice/*`, `client/src/pages/OwnerSearch.jsx`, styles, tests, evidence files. Re-executed: `npm test` and the QA suite with a fresh local PostgreSQL 16 (one first run failed because the sandbox's PostgreSQL had stopped — `ECONNREFUSED`; after restarting it, all tests passed; not a product defect). Limitations: no real microphone in the validation sandbox; real-device evidence is the team's attestation (Chrome desktop, 2026-11-09; the first browser tried was not Chrome and returned an unavailable-service error, which led to DEV-I2-002); Android not tried.

## 8.4 Acceptance Criteria Validation Matrix

| AC | Expected | Evidence | Result |
|---|---|---|---|
| AC-115 | Phrase → text *vacunación*, species dog, same results as typing | Unit 1; DB 10 (voice results deep-equal typed results); browser; team test in Chrome | PASS |
| AC-116 | Visible listening state; can stop | `VoiceInputButton.jsx` (`aria-pressed`, *"Escuchando… toca para detener"*, second tap → `stop()`); debug run | PASS |
| AC-117 | Box = interpreted text; filter = interpreted species; heard text visible | Browser row AC-115/117 | PASS |
| AC-118 | Edited text searched as typed | Browser row AC-118 | PASS |
| AC-119 | No species → filter unchanged | Unit 3; DB 11 | PASS |
| AC-120 | Only fillers/species → no search, ask to say/type | Unit 4; DB 12; browser row AC-120 | PASS (F-01 fixed) |
| AC-121 | Nothing recognized → message, retry or type | Browser row AC-121; errors run `no-speech` | PASS |
| AC-122 | No voice support → no microphone | Browser row AC-122 (0 buttons) | PASS |
| AC-123 | Permission denied → message, typing available | Browser row AC-123; errors run `not-allowed` | PASS |
| AC-159 | Species word in the offering name → retry finds it | Unit 8; DB 13; browser row AC-159 | PASS |

## 8.5 Business Rules, Edge Cases, and Dependencies

BR-041 (provider → 404, DB 14) PASS; BR-042 (DB 10) PASS; BR-043/BR-044 (unit 2, 5, 6) PASS; BR-050 / CR-027 (no storage; logger records no body) PASS; BR-051 PASS; BR-053 PASS. EDGE-033 to EDGE-038 and EDGE-047 covered by the rows above. DEP-018 satisfied (text search and filter exist).

## 8.6 Test and Verification Results

| Run | Result |
|---|---|
| `npm test` (PostgreSQL 16) | 189 / 189, 0 skipped |
| QA suite | 143 / 143 |
| Browser walk-through (simulated recognizer) | 8 / 8; after F-01/F-02 fix 10 / 10 (§8.13) |
| Simulated browser errors (DEV-I2-002) | 6 / 6 |
| Real device | Chrome desktop: works (team attestation, values not recorded); Android: NOT_VERIFIED |

## 8.7 Architecture, UX, and Integration Conformance

Conforms to ARCHITECTURE_V4 (interpretation on the server, CR-031; COMP-014 in the client; IF-041 contract matches API_SPEC_V2 — validated by the QA contract suite run). UX: COMP-UX-023 and SCR-UX-004 as specified; two messages added by DEV-I2-002 (MSG-VOICE-NOMIC, MSG-VOICE-UNAVAILABLE) are not in UX_SPEC_V3 — accepted as an addition, to record in P09. F-01 and F-02 below.

## 8.8 Security, Data Integrity, and Regression Findings

Owner-only route; same-origin rule applies to the POST; input limits (300 / 120); no transcript logged. Step 0 regression: removal filters and booking re-check pass all existing booking and search tests. No integrity issue found.

## 8.9 Findings Register

| ID | Severity | Description | Status |
|---|---|---|---|
| F-01 | LOW | On `empty_query` (AC-120) the client changed the species filter although no search ran, so the filter could disagree with the results still shown. | FIXED (§8.13) |
| F-02 | LOW | The heard line stayed visible after a later typed search, where it no longer described the results. | FIXED (§8.13) |
| F-03 | LOW | Real-device evidence: Chrome desktop attested without recorded values; Android not tried. | OPEN — record during P08 |
| F-04 | INFO | Migration 002 must be applied to each Neon branch used by deployments before this code runs there. | OPEN — P08 |

## 8.10 Implementation Log Consistency

The log matches the code and evidence; §14 documents DEV-I2-002. The log claimed "AC-116 PASS (manual)"; confirmed by code inspection.

## 8.11 Readiness Decision

US-035 is ready to be considered complete for SPRINT-002, subject to F-03/F-04 in P08. US-036 (assistant) can start: it reuses COMP-014 and `interpretPhrase`.

## 8.12 Final Status

**PASS_WITH_WARNINGS**

## 8.13 Corrective Actions and Retest Guidance

F-01 and F-02 were corrected by the implementation process after this validation (`OwnerSearch.jsx`: the filter is not changed on `empty_query`; a typed search hides the heard line) and re-tested with the browser walk-through (two added checks). Retest for P08: one real voice search on Chrome desktop and one on Android Chrome against production, recording phrase, heard text, resulting text, filter and number of results.
