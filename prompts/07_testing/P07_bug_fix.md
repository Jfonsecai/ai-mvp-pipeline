# P07.3 — Root Cause Analysis & Bug Fixing

**Version:** 1.0
**Pipeline Stage:** P07 — Quality Assurance & Testing

## 1. Objective

Investigate confirmed defects identified by P07.2, determine their causes, apply minimal corrections and add regression tests to prevent the same problems from recurring.

A correction must respect the approved requirements, architecture and existing repository conventions.

## 2. Inputs

Read the following sources when available:

1. `prompts/system/SYSTEM_PROMPT.md`
2. `artifacts/02_requirements/REQUIREMENTS.md`
3. `artifacts/05_architecture/ARCHITECTURE.md`
4. `artifacts/05_architecture/ARCHITECTURE_VALIDATION.md`
5. `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`, if available
6. Relevant P06 implementation and validation reports.
7. `artifacts/07_qa/TEST_ANALYSIS_REPORT.md`
8. `artifacts/07_qa/test_execution_summary.json`
9. Relevant test files, execution logs and actual source code.

Inspect the repository and confirm the actual paths before making changes.

## 3. Rules

1. **Confirm the defect.** Review the evidence and reproduce the failure when possible. If reproduction is not possible, document the limitation.
2. **Identify the cause.** Explain the relationship between the observed failure and its underlying cause. Use debugging techniques such as stack-trace analysis and the five whys when useful, without forcing unsupported conclusions.
3. **Make minimal changes.** Modify only what is necessary to fix the confirmed defect. Avoid unrelated refactoring.
4. **Preserve approved contracts.** Do not change requirements, business rules, API contracts, database constraints or architecture to make a test pass. If an approved artifact is ambiguous or contradictory, document the conflict and request resolution.
5. **Add a regression test.** Create or update a test that verifies the corrected behavior. When feasible, demonstrate that it detects the original defect and passes after the correction.
6. **Verify the correction.** Run the regression test and relevant existing tests when possible. Record commands and actual results.
7. **Protect the repository.** Preserve unrelated user changes. Do not discard work, perform destructive operations or modify unrelated files.
8. **Be transparent.** Distinguish changes applied from changes verified. Never claim a test passed if it was not executed.
9. **Handle uncertainty safely.** If the cause is unclear, the fix requires an unapproved architectural change, or the correction cannot be verified, document the issue and mark it as blocked or awaiting validation.

Do not add dependencies or change configuration unless the correction requires it and the change is justified.

## 4. Workflow

1. Select a defect identified in `TEST_ANALYSIS_REPORT.md`.
2. Review its severity, evidence, expected behavior and affected components.
3. Reproduce the failure when possible and investigate its cause.
4. Define the smallest correction consistent with the approved requirements.
5. Add or update the regression test.
6. Apply the correction.
7. Run the regression test and relevant existing tests.
8. Record the changes, results and any remaining limitations.
9. Repeat for additional defects when appropriate, keeping each defect identifiable.

Do not modify unrelated defects simply because they are discovered during the investigation. Record them for separate analysis unless they must be addressed to complete the current correction safely.

## 5. Output

Create or update:

`artifacts/07_qa/BUG_FIX_REPORT.md`

Include:

### Defect Information

* Defect ID from P07.2.
* Summary and severity.
* Related User Story or acceptance criterion, when known.
* Affected files and components.

### Root Cause Analysis

* Observed behavior and expected behavior.
* Evidence supporting the cause.
* Confirmed root cause or unresolved hypothesis.

### Correction

* Files modified.
* Description of the minimal fix.
* Any relevant design or contract considerations.

### Regression and Verification

* Regression test created or updated.
* Commands executed and actual results.
* Relevant existing tests executed and their results.
* Whether the original failure was reproduced before the correction.
* Remaining limitations and unverified behavior.

### Final Status

Use one of these statuses for each defect:

* `FIXED_AND_VERIFIED`: The correction was applied and the relevant verification passed.
* `FIXED_NOT_VERIFIED`: The correction was applied, but verification could not be completed.
* `UNRESOLVED`: The defect remains.
* `BLOCKED`: Progress requires missing information, environmental access or an unapproved decision.

Preserve previous defect records when updating the report. Do not overwrite historical findings or claim that every defect is resolved when only some have been addressed.

## 6. Handoff

After corrections, return to P07.2 to independently reassess the affected requirements and tests.

P07.3 does not grant permission to advance to P08. The quality gate verdict must be updated using the actual verification evidence.

If the correction remains unverified or unresolved, clearly identify what must happen next.
