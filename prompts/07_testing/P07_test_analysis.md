# P07.2 — Test Execution Analysis & Coverage Audit

**Version:** 1.0
**Pipeline Stage:** P07 — Quality Assurance & Testing

## 1. Objective

Independently evaluate the available test results and verify whether the implemented product complies with approved requirements and is ready to advance to P08.

Use actual repository contents and execution evidence. Do not trust a summary without checking its supporting evidence when that evidence is available.

## 2. Inputs

Read the following sources when available:

1. `prompts/system/SYSTEM_PROMPT.md`
2. `artifacts/02_requirements/REQUIREMENTS.md`
3. `artifacts/03_planning/PRIORITIZATION.md`
4. `artifacts/03_planning/product_backlog.json`
5. `artifacts/05_architecture/ARCHITECTURE.md`
6. `artifacts/05_architecture/ARCHITECTURE_VALIDATION.md`
7. `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`, if available
8. Relevant P06 implementation and validation reports.
9. `artifacts/07_qa/TEST_EXECUTION_REPORT.md`, if available
10. Test suites, execution logs, coverage reports and actual repository contents.

Inspect actual paths and available evidence. Clearly identify missing inputs.

## 3. Rules

1. **Use evidence.** Report test counts, coverage and performance only when supported by actual results.
2. **Respect requirements.** Evaluate behavior against approved requirements and architecture. Do not invent acceptance criteria or impose arbitrary coverage, latency or execution-time thresholds.
3. **Distinguish failure types.** Classify findings as implementation defects, test defects, environment problems, flaky tests or unverified issues when the evidence supports the distinction.
4. **Do not confuse missing evidence with failure.** A test that was not executed is not a passing test. Missing coverage data does not mean coverage is zero.
5. **Preserve traceability.** Link findings to relevant test IDs, User Stories, acceptance criteria and affected files when known.
6. **Do not modify production code.** This prompt analyzes and reports; P07.3 handles confirmed defects.
7. **Avoid unsupported conclusions.** If the root cause is uncertain, record it as a hypothesis rather than a confirmed fact.

## 4. Workflow

1. Inspect the implemented scope and test suites.
2. Review available test execution results and coverage reports.
3. Compare results with the approved acceptance criteria.
4. Identify failures, uncovered criteria, risks and missing evidence.
5. Assign each finding a unique ID, such as `DEF-001`, and a severity:

   * `BLOCKER`: Prevents a critical workflow or creates a serious security or data-integrity risk.
   * `CRITICAL`: Violates an essential business rule, requirement or contract.
   * `MAJOR`: Significant functional defect.
   * `MINOR`: Limited-impact defect.
   * `INFO`: Observation or improvement recommendation.
6. Determine the quality gate verdict using the criteria below.
7. Generate the analysis report and machine-readable summary.

## 5. Quality Gate

Use one of these verdicts:

* `PASS`: The planned scope has been verified, required tests have passed, and no unresolved blocking or critical defects remain.
* `PASS_WITH_WARNINGS`: The essential requirements are verified and no unresolved blocking or critical defects remain, but documented non-blocking gaps or minor issues remain.
* `FAIL`: Evidence confirms defects or failed tests that prevent approval.
* `BLOCKED`: There is insufficient evidence, a required environment is unavailable, or an unresolved dependency prevents a reliable decision.

A failed test must be investigated before its cause is classified. A test failure caused by an incorrect test or unavailable environment must not automatically be reported as a production-code defect.

A `PASS` verdict requires sufficient evidence that the planned scope was tested. Do not approve untested requirements merely because the available tests pass.

Document any unresolved issue that prevents a verdict from being reliable.

## 6. Outputs

Create or update:

`artifacts/07_qa/TEST_ANALYSIS_REPORT.md`

Include:

1. Executive summary and verdict.
2. Scope reviewed and evidence sources.
3. Test execution results, including actual counts when available.
4. Coverage results, when measured.
5. Traceability between requirements, acceptance criteria and tests.
6. Findings with IDs, severity, evidence, affected components and known or suspected causes.
7. Untested criteria, limitations and risks.
8. Required next actions.

Also create or update:

`artifacts/07_qa/test_execution_summary.json`

Use valid JSON with this minimum structure:

```json
{
  "verdict": "BLOCKED",
  "tests": {
    "total": null,
    "passed": null,
    "failed": null,
    "skipped": null,
    "not_executed": null
  },
  "coverage": {
    "available": false,
    "line_percent": null,
    "branch_percent": null
  },
  "findings": [],
  "limitations": []
}
```

Replace example values only with verified information. Use `null` for unavailable numerical results and `false` when coverage data is unavailable. Keep the JSON consistent with the Markdown report.

## 7. Handoff

* If the verdict is `PASS` or `PASS_WITH_WARNINGS`, P07 may proceed to its next approved stage, subject to the pipeline's release criteria.
* If confirmed defects require correction, provide their IDs and evidence to P07.3.
* If the verdict is `BLOCKED`, resolve the missing inputs, environment issues or evidence gaps before making an approval decision.
* After corrections, re-run the relevant tests and update this report. Preserve the history of significant findings and previous verdicts.

Do not declare a defect resolved solely because a patch report says it is fixed.
