# P07.1 — Automated Test Suite Generation

**Version:** 1.1
**Pipeline Stage:** P07 — Quality Assurance & Testing

## 1. Objective

Generate maintainable, executable automated tests that verify the approved requirements and the actual implementation.

Tests must evaluate expected behavior, not simply reproduce the current code behavior.

## 2. Inputs

Read the following sources when available:

1. `prompts/system/SYSTEM_PROMPT.md`
2. `artifacts/02_requirements/REQUIREMENTS.md`
3. `artifacts/03_planning/PRIORITIZATION.md`
4. `artifacts/03_planning/product_backlog.json`
5. `artifacts/05_architecture/ARCHITECTURE.md`
6. `artifacts/05_architecture/ARCHITECTURE_VALIDATION.md`
7. `artifacts/04_ux/UX_SPEC.md`
8. `artifacts/04_ux/UX_SPEC_VALIDATION.md`
9. `artifacts/06_implementation/IMPLEMENTATION_INDEX.md`, if available
10. Relevant implementation logs and validation reports from P06.
11. The actual repository, including existing tests and configuration.

Inspect the repository to confirm actual paths and available files. Do not assume that every optional artifact exists.

## 3. Rules

1. **Follow approved requirements.** Derive expected behavior from P02 and the approved architecture. Do not invent business rules, API contracts, technologies or acceptance criteria.
2. **Adapt to the project.** Use the existing programming language, test framework, conventions and scripts whenever possible.
3. **Test relevant behavior.** Cover applicable acceptance criteria, normal flows, validation, error handling, permissions, persistence and relevant edge cases.
4. **Maintain traceability.** Link each test to its test ID and, when available, its User Story ID and acceptance criterion.
5. **Keep tests independent.** Tests must not depend on execution order or uncontrolled external services. Use mocks when appropriate and preserve real integration behavior when that is what the test must verify.
6. **Protect sensitive information.** Never include real credentials, tokens or production secrets in tests.
7. **Avoid unnecessary changes.** Do not modify production code merely to make tests pass. Do not overwrite existing tests without justification.
8. **Be honest about limitations.** Do not claim complete coverage or successful execution without evidence. Record missing tools, unavailable environments and unverified behavior.

Do not impose coverage thresholds or technical requirements unless they are defined in approved project artifacts.

## 4. Workflow

1. Inspect the requirements, implementation status, existing tests and project configuration.
2. Identify the implemented scope that must be verified.
3. Build a traceability matrix linking applicable acceptance criteria to planned test cases.
4. Create or update the appropriate test suites.
5. Run the available tests using the project's existing commands, when the environment permits.
6. Record the commands executed and their actual results.
7. Identify criteria that remain untested and explain why.

## 5. Output

Create or update test files under:

`artifacts/07_qa/test_suites/`

Organize them by test type only when useful and consistent with the project:

* `unit/`
* `integration/`
* `contract/`
* `e2e/`
* `security/`

Do not create empty directories or unnecessary test categories.

Also create or update:

`artifacts/07_qa/TEST_EXECUTION_REPORT.md`

The report must include:

* Scope tested and relevant User Story IDs.
* Test files created or modified.
* Traceability between acceptance criteria and tests.
* Commands executed and actual results.
* Tests passed, failed, skipped or not executed.
* Known gaps, limitations and risks.
* Defects that require analysis by P07.2.

If execution was not possible, clearly distinguish generated tests from executed tests.

## 6. Completion Status

Use one of the following statuses:

* `READY_FOR_ANALYSIS`: Tests were created or reviewed, and available execution evidence is documented.
* `READY_WITH_LIMITATIONS`: Testing is incomplete because of documented limitations.
* `BLOCKED`: Required inputs or conditions prevent meaningful progress.

These statuses describe completion of this prompt, not approval of the product for deployment.

## 7. Final Instructions

Work on the actual repository. Preserve existing user changes and avoid destructive commands.

Do not declare the product approved. P07.2 independently analyzes the evidence and determines the quality gate verdict.
