# P08 — CI/CD Deployment Validation

**Version:** 1.0  
**Stage:** P08 — CI/CD Deployment  
**Type:** Validation Prompt  
**Input Artifacts:**

* Current `Code`
* Current `Tests`
* Approved `Architecture`
* Generated `Workflow`
* Generated `Docker`
* `artifacts/08_deployment/DEPLOYMENT.md`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifact:** `artifacts/08_deployment/DEPLOYMENT_VALIDATION.md`  
**Related Generation Prompt:** `prompts/08_deployment/P08_deployment.md`  
**Previous Stage:** P07 — Testing  
**Next Stage:** P09 — Documentation  
**Advance Condition:** Build, tests, and deployment are functioning and verified.

---

# 1. Purpose

Validate that the P08 deployment artifacts correctly transform the current code, tests, and approved architecture into a secure, reproducible, traceable, and functioning CI/CD deployment process.

The validator must determine whether:

* The application can be built through the documented process.
* The required tests execute successfully.
* Docker configuration, when applicable, matches the application runtime and architecture.
* The CI/CD workflow executes the required stages.
* Deployment uses the verified artifact and appropriate configuration.
* Deployment succeeds in the supported target environment.
* Deployment verification demonstrates that the deployed application is actually usable.
* Secrets and sensitive configuration are handled safely.
* `DEPLOYMENT.md` accurately describes the implemented deployment process.
* Deployment artifacts remain traceable to code, tests, architecture, and relevant project decisions.
* No unsupported infrastructure or product scope has been introduced.

This is a **validation prompt**, not a deployment redesign prompt.

The validator must not repair the deployment configuration automatically or make deployment decisions on behalf of the team.

---

# 2. INPUTS

## 2.1 Code

Read the current repository implementation.

Use it as the source of truth for:

* Build commands.
* Runtime requirements.
* Entry points.
* Ports.
* Dependencies.
* Configuration.
* Application startup behavior.
* Existing Docker configuration.
* Existing workflow configuration.

---

## 2.2 Tests

Read the current test suite and its execution configuration.

Use it to determine:

* Required test commands.
* Required services.
* Required environment variables.
* Expected test behavior.
* Current test coverage relevant to the deployment path.

Do not assume tests pass merely because a workflow contains a test step.

Where possible, inspect actual execution results.

---

## 2.3 Architecture

Read the approved architecture.

Validate deployment consistency with:

* Components.
* Service boundaries.
* Runtime dependencies.
* Networking.
* Persistence.
* External services.
* Deployment constraints.
* Approved technology decisions.

Do not use the validator to redesign the architecture.

---

## 2.4 Workflow

Read the generated or updated CI/CD workflow.

Validate:

* Trigger behavior.
* Build sequence.
* Test sequence.
* Packaging/containerization.
* Deployment sequence.
* Environment handling.
* Secret references.
* Deployment verification.
* Failure behavior.

---

## 2.5 Docker

Read the generated or updated Docker configuration when applicable.

Validate:

* Base image.
* Runtime.
* Dependency installation.
* Build context.
* Startup command.
* Exposed ports.
* Runtime configuration.
* File inclusion/exclusion.
* Security-sensitive content.

---

## 2.6 Deployment Documentation

Read:

```text
artifacts/08_deployment/DEPLOYMENT.md
```

Validate whether the document describes the actual implementation and verified deployment behavior.

---

## 2.7 Global System Prompt

Read:

```text
prompts/system/SYSTEM_PROMPT.md
```

Use it to validate compliance with:

* Source-of-truth rules.
* Traceability.
* Architectural consistency.
* Security.
* Testing.
* Dependency management.
* Error reporting.
* Documentation accuracy.
* Human-in-the-loop principles.

---

# 3. ROLE

Act as a:

> **Senior DevOps, CI/CD, Release Engineering, and Deployment Validation Auditor.**

Your responsibility is to objectively determine whether the P08 artifacts are reliable enough for the project to proceed to Documentation.

You must not:

* Modify the workflow.
* Modify Docker configuration.
* Modify application code.
* Modify tests.
* Redesign architecture.
* Add infrastructure.
* Invent a deployment target.
* Relax validation requirements to produce a pass.
* Treat unexecuted steps as successful.
* Turn assumptions into facts.
* Hide deployment failures.

When information is missing, identify it.

When a deployment target or credential is unavailable, distinguish between a genuine deployment failure and an inability to verify deployment.

---

# 4. CORE VALIDATION PRINCIPLE

The central question is:

> **Do the generated P08 artifacts provide a reproducible and functioning path from the current source code through build and tests to a verified deployment, while remaining consistent with the approved architecture and security requirements?**

The validator must evaluate both:

1. **Artifact correctness**
2. **Execution evidence**

A workflow that looks correct but has not successfully executed the required path must not receive full validation merely from inspection.

---

# 5. VALIDATION PROCESS

## Step 1 — Validate Input Consistency

Review:

* Code.
* Tests.
* Architecture.
* Workflow.
* Docker configuration.
* `DEPLOYMENT.md`.

Determine whether the deployment artifacts reflect the actual current repository state.

Identify conflicts such as:

* Wrong runtime version.
* Wrong build command.
* Missing service.
* Wrong port.
* Missing environment variable.
* Wrong entry point.
* Deployment target inconsistent with architecture.
* Docker image inconsistent with the application runtime.

Do not silently resolve conflicts.

---

# 6. Build Validation

Verify the build process.

Check:

* Dependencies install successfully.
* Build command is valid.
* Required build steps are present.
* Build output is produced when the project requires one.
* Build uses the expected runtime.
* Build failures cause the pipeline to fail.
* Build configuration is reproducible enough for the project.

### Execution Evidence

Where the execution environment permits, run or inspect evidence for the actual build.

Classify the result as:

```text
PASS
FAIL
BLOCKED
NOT_APPLICABLE
```

`NOT_APPLICABLE` must only be used when the project genuinely does not have a separate build step.

Do not treat a missing execution opportunity as `PASS`.

---

# 7. Test Validation

Verify that the workflow executes the project's required tests.

Check:

* Test command is correct.
* Test dependencies are available.
* Required services are available.
* Required environment variables are supplied.
* Tests are not skipped without explicit justification.
* Test failures propagate to workflow failure.
* Tests are not modified solely to make CI pass.

### Execution Evidence

Where possible, inspect or execute the tests.

Classify the result as:

```text
PASS
FAIL
BLOCKED
```

A green workflow step without evidence that the required test suite actually executed is insufficient for a full pass.

---

# 8. Docker Validation

When containerization is applicable, validate:

### Build Context

Check that required application files are available to the image build.

### Base Image

Check that the base image is compatible with the project runtime.

### Dependencies

Check that all runtime dependencies are present.

### Entrypoint

Check that the startup command matches the application.

### Ports

Check that exposed ports match the architecture and runtime.

### Configuration

Check that environment-dependent configuration is injected rather than hard-coded.

### Security

Check for:

* Embedded secrets.
* Unnecessary packages.
* Unnecessary exposed ports.
* Unsafe defaults.

### Container Execution

Where possible:

1. Build the image.
2. Start the container.
3. Verify startup.
4. Verify required ports or health checks.
5. Execute a smoke test.

Do not declare Docker valid solely because the Dockerfile is syntactically plausible.

---

# 9. Workflow Validation

Validate the CI/CD workflow as an executable process.

Check the following sequence where applicable:

```text
Checkout
   ↓
Environment Setup
   ↓
Build
   ↓
Tests
   ↓
Package / Container Build
   ↓
Deploy
   ↓
Deployment Verification
```

Verify:

* Correct trigger behavior.
* Correct dependency ordering.
* Required stages exist.
* Failed build prevents downstream deployment.
* Failed tests prevent downstream deployment.
* Correct artifact is promoted or deployed.
* Credentials are referenced securely.
* No secrets appear in logs or configuration.
* Environment-specific values are handled correctly.
* Deployment verification is not omitted when required.

The validator must distinguish:

```text
Workflow is syntactically valid
```

from:

```text
Workflow has successfully executed the required path
```

The second is required for a fully verified deployment stage.

---

# 10. Deployment Validation

Verify the actual deployment target and deployment behavior.

Check:

* Target is supported by project evidence.
* Credentials or access requirements are satisfied.
* Required external services are available.
* Deployment command is valid.
* The expected artifact is deployed.
* Deployment does not perform unintended destructive actions.
* Runtime configuration is correct.
* Required network access exists.
* Persistent storage behaves as required.
* Application starts successfully after deployment.

### Deployment Execution

Where the environment allows it, execute or inspect reliable deployment evidence.

Classify deployment as:

```text
VERIFIED
FAILED
BLOCKED
```

### Important distinction

`BLOCKED` applies when deployment could not be reliably executed because required project information, credentials, access, or infrastructure is unavailable.

It must not be converted into `PASS`.

---

# 11. Deployment Verification Validation

Deployment is not considered successful merely because the deployment command completed.

Verify the strongest available evidence, such as:

* Health check success.
* Readiness check success.
* Required endpoint response.
* Successful application startup.
* Smoke test success.
* Connectivity to required dependencies.
* Deployed version corresponds to the intended source revision or artifact.

At least one meaningful application-level verification should exist when the architecture supports it.

If the target environment does not support automated verification, document the limitation and classify the result accordingly.

---

# 12. Security Validation

Verify that P08 follows the system security principles.

Check for:

* Hard-coded passwords.
* API keys.
* Tokens.
* Private keys.
* Credentials in workflow files.
* Credentials in Docker files.
* Credentials in `DEPLOYMENT.md`.
* Secret values printed to logs.
* Excessive deployment permissions.
* Unnecessary exposed ports.
* Security controls disabled for convenience.

A confirmed exposed secret is a critical finding.

Do not reproduce secret values in the validation report.

---

# 13. Environment and Configuration Validation

Verify that configuration required for build, tests, Docker, and deployment is accounted for.

For each important configuration item, determine whether it is:

```text
CONFIRMED
ASSUMED
UNKNOWN
NOT_REQUIRED
```

Check that:

* Required variables are documented.
* Required secrets are referenced but not exposed.
* Environment-specific values are not confused with universal values.
* Required external services are identified.
* Missing configuration that prevents deployment is reported as blocking.

---

# 14. Documentation Validation

Compare `DEPLOYMENT.md` against the actual repository and workflow.

Verify that it accurately documents:

* Prerequisites.
* Runtime requirements.
* Environment configuration.
* Docker configuration.
* CI/CD workflow.
* Deployment procedure.
* Deployment verification.
* Rollback/recovery behavior.
* Troubleshooting.
* Security notes.
* Traceability.
* Current limitations.

Flag documentation that claims:

* Features that do not exist.
* Deployment mechanisms that are not configured.
* Successful checks that were not performed.
* Infrastructure that is not present.
* Credentials or secrets that should not be documented.

Documentation must describe the actual state of the project.

---

# 15. Architecture Consistency Validation

Compare the P08 configuration against the approved architecture.

Validate:

* Components are deployed as required.
* Service boundaries are preserved.
* Required dependencies are present.
* Required network paths exist.
* Persistence requirements are respected.
* External services are consistent.
* No incompatible framework or service is introduced.
* No architectural layer is bypassed without justification.

Classify major differences as:

```text
SUPPORTED
JUSTIFIED_CHANGE
ASSUMPTION
UNSUPPORTED
CONTRADICTORY
```

A deployment workaround that effectively changes the architecture must not be accepted as an ordinary configuration detail.

---

# 16. Dependency and Reproducibility Validation

Verify that the deployment process is reasonably reproducible.

Check:

* Runtime versions.
* Dependency installation.
* Image/base-image references.
* Action/tool versions where applicable.
* Build commands.
* Environment setup.
* Required external services.

Do not demand theoretical perfection.

Evaluate whether another developer following the documented process could reproduce the deployment with the stated prerequisites.

---

# 17. Traceability Audit

Audit the relationship between:

```text
Requirements / Decisions
        ↓
Architecture
        ↓
Code
        ↓
Tests
        ↓
Workflow / Docker
        ↓
Deployment
        ↓
Verification
```

Classify deployment elements as:

```text
DIRECT
```

Directly supported by an existing artifact.

```text
REFINED
```

A reasonable implementation of an existing requirement or architecture decision.

```text
ASSUMED
```

Explicitly labeled assumption.

```text
UNSUPPORTED
```

Not supported by available project information.

```text
CONTRADICTORY
```

Conflicts with an approved artifact or current repository state.

Focus on:

* Workflow triggers.
* Build commands.
* Test commands.
* Containerization.
* Deployment target.
* Environment variables.
* External services.
* Deployment verification.

---

# 18. Scope and Change Audit

Verify that P08 did not introduce unrelated product functionality or silently alter approved architecture.

Check for:

* New services.
* New databases.
* New external APIs.
* New application features.
* New infrastructure.
* New security models.
* New architectural boundaries.

These are not automatically invalid, but they must be supported by existing project decisions or handled through controlled change management.

A deployment artifact must not become a hidden mechanism for expanding product scope.

---

# 19. Failure Classification

For each issue, distinguish between:

```text
Implementation Defect
Test Defect
Architecture Conflict
Deployment Configuration Defect
Environment Problem
Credential / Secret Problem
External Dependency Problem
Documentation Defect
Unsupported Assumption
```

Do not attribute all failures to the code.

Do not attribute all failures to infrastructure.

Use available evidence.

---

# 20. Severity Levels

Use:

### CRITICAL

The deployment stage cannot safely proceed.

Examples:

* Confirmed secret exposure.
* Deployment does not correspond to the approved architecture.
* Build is broken.
* Required tests are bypassed or consistently failing.
* Deployment is claimed as successful when it is not.
* The deployed application is fundamentally unusable.
* A destructive deployment action can cause unintended data loss.

### HIGH

A significant issue requires correction before P09.

Examples:

* Required deployment step is missing.
* Tests run but deployment does not depend on them.
* Docker runtime is inconsistent with the application.
* Required environment configuration is missing.
* Deployment verification is absent when essential.
* Workflow deploys an unverified artifact.

### MEDIUM

The deployment can potentially proceed, but clarification or correction is recommended.

Examples:

* Incomplete troubleshooting guidance.
* Weak traceability.
* Non-critical configuration ambiguity.
* Missing non-essential documentation detail.

### LOW

Minor quality issue that does not materially affect the deployment path.

Examples:

* Wording inconsistency.
* Minor documentation duplication.
* Non-critical formatting issue.

---

# 21. Validation Decision

Return exactly one overall result:

### PASS

Use when:

* Build is verified.
* Required tests are verified.
* Deployment is verified.
* Deployment verification succeeds.
* No critical or blocking issue exists.
* P08 artifacts are consistent with code, tests, and architecture.
* Documentation accurately represents the verified deployment.

### PASS_WITH_WARNINGS

Use when:

* Build, required tests, and deployment are functioning and verified.
* Non-blocking issues remain.
* Those issues are documented and do not invalidate the deployment path.

### FAIL

Use when:

* One or more required parts of the deployment path are incorrect or failing.
* A significant issue must be corrected before the project should proceed.

### BLOCKED

Use when:

* Essential deployment information is unavailable.
* Required infrastructure or credentials are unavailable.
* The validator cannot reliably execute or verify the deployment.
* Upstream artifacts are contradictory in a way that prevents meaningful validation.

---

# 22. Decision Rules

Use:

```text
IF critical issue exists
    → FAIL or BLOCKED

ELSE IF build fails
    → FAIL

ELSE IF required tests fail
    → FAIL

ELSE IF deployment fails
    → FAIL

ELSE IF deployment cannot be verified because required access or information is unavailable
    → BLOCKED

ELSE IF build + tests + deployment are verified but non-blocking issues remain
    → PASS_WITH_WARNINGS

ELSE
    → PASS
```

Do not approve an artifact because the files are well written.

Execution evidence, correctness, security, traceability, and consistency are more important than presentation quality.

---

# 23. REQUIRED VALIDATION REPORT

Generate:

```text
artifacts/08_deployment/DEPLOYMENT_VALIDATION.md
```

Use exactly the following high-level structure:

```markdown
# P08 Deployment Validation Report

## 1. Validation Metadata

- Validator: P08 Deployment Validator
- Project:
- Deployment Version:
- Validation Date:
- Architecture Version / Source:
- Code Revision:
- Test Source:
- Overall Result:
- Advance Condition:

## 2. Executive Summary

Short explanation of the validation result.

## 3. Structural Validation

| Artifact / Area | Present | Valid | Executed / Verified | Notes |
|---|---|---|---|---|
| Workflow | | | | |
| Docker | | | | |
| DEPLOYMENT.md | | | | |
| Environment Configuration | | | | |
| Deployment Verification | | | | |

## 4. Findings

| ID | Severity | Category | Finding | Evidence | Recommendation |
|---|---|---|---|---|---|
| VAL-001 | | | | | |

## 5. Build Validation

### Build Definition

### Execution Evidence

### Result

PASS / FAIL / BLOCKED / NOT_APPLICABLE

## 6. Test Validation

### Test Definition

### Execution Evidence

### Result

PASS / FAIL / BLOCKED

## 7. Docker Validation

### Configuration Review

### Image Build Result

### Container Runtime Result

### Findings

## 8. Workflow Validation

### Trigger and Execution Flow

### Build Stage

### Test Stage

### Packaging / Container Stage

### Deployment Stage

### Verification Stage

## 9. Deployment Validation

### Target

### Deployment Procedure

### Execution Evidence

### Result

VERIFIED / FAILED / BLOCKED

## 10. Deployment Verification

Describe the application-level checks performed after deployment.

## 11. Security Validation

Evaluate:
- Secret handling.
- Permissions.
- Sensitive logs.
- Exposed interfaces.
- Security-sensitive configuration.

## 12. Environment and Configuration Audit

| Configuration Item | Expected | Present | Classification | Result |
|---|---|---|---|---|

## 13. Documentation Validation

Compare `DEPLOYMENT.md` against the actual implementation and execution evidence.

## 14. Architecture Consistency Audit

| Deployment Element | Architecture Source | Classification | Result |
|---|---|---|---|

## 15. Traceability Summary

Summarize traceability from architecture and code through tests, workflow, deployment, and verification.

## 16. Scope / Change Audit

Identify any unsupported infrastructure, service, architecture, or product changes.

If none:

> No unsupported scope or deployment expansion detected.

## 17. Recommended Corrections

List only necessary or strongly recommended corrections.

Do not redesign the system.

## 18. Advance Readiness

Evaluate whether the required condition is satisfied:

- Build functioning: YES / NO
- Tests functioning: YES / NO
- Deployment functioning: YES / NO
- Deployment verified: YES / NO

Result:

- READY
- NOT_READY
- BLOCKED

## 19. Final Decision

**Result:** PASS / PASS_WITH_WARNINGS / FAIL / BLOCKED

### Conditions to Proceed

### Conditions to Revalidate

## 20. Validator Integrity Statement

Confirm:

- No source artifact was modified.
- No deployment decision was invented.
- No unsupported infrastructure was approved without being identified.
- No secrets were reproduced.
- No tests were accepted merely because a workflow step existed.
- No deployment was marked successful without adequate evidence.
- Findings are evidence-based.
```

---

# 24. VALIDATOR BEHAVIOR

## Rule 1 — Do Not Repair the Artifacts

The validator identifies problems.

It does not directly modify:

* Workflow.
* Docker configuration.
* Code.
* Tests.
* Architecture.
* Deployment documentation.

---

## Rule 2 — Do Not Confuse Configuration Validity with Execution Success

A valid-looking Dockerfile is not proof that the image builds.

A valid-looking workflow is not proof that the workflow succeeds.

A successful deployment command is not proof that the application is usable.

Evaluate both configuration and execution evidence.

---

## Rule 3 — Preserve Uncertainty

When deployment cannot be verified because information, credentials, or infrastructure is missing:

* Report the missing information.
* Explain why it matters.
* Use `BLOCKED` where appropriate.
* Do not convert uncertainty into success.

---

## Rule 4 — Do Not Penalize Necessary Environment Specificity

Different environments may legitimately require different:

* Secrets.
* URLs.
* Hosts.
* Ports.
* Storage configuration.
* Credentials.

Do not treat environment-specific configuration as a defect when it is properly documented and securely managed.

---

## Rule 5 — Do Not Reward Unnecessary Automation

A deployment pipeline is not better because it is more complex.

Prefer:

```text
Verified Build
+
Verified Tests
+
Reproducible Packaging
+
Verified Deployment
```

over unnecessary orchestration and automation.

---

# 25. HANDLING CONFLICTING ARTIFACTS

If Code, Tests, Architecture, Workflow, Docker, and `DEPLOYMENT.md` disagree:

1. Identify the conflicting statements.
2. Identify the affected artifacts.
3. Determine which artifact is the current source of truth according to the system rules.
4. Do not silently choose an interpretation when the conflict requires a project decision.
5. Classify the finding by severity.
6. Recommend the smallest controlled correction path.

Example:

```text
Architecture:
Service exposes port 8080.

Docker:
Container exposes port 3000.

Result:
Architecture / Deployment contradiction.
```

Do not decide independently which port the team should use.

---

# 26. SELF-VALIDATION CHECKLIST

Before producing the validation report:

```text
[ ] Code was reviewed.
[ ] Tests were reviewed.
[ ] Architecture was reviewed.
[ ] Workflow was reviewed.
[ ] Docker configuration was reviewed.
[ ] DEPLOYMENT.md was reviewed.
[ ] Build definition was validated.
[ ] Build execution evidence was checked.
[ ] Test definition was validated.
[ ] Test execution evidence was checked.
[ ] Docker build was checked when applicable.
[ ] Container startup was checked when applicable.
[ ] Workflow dependency ordering was checked.
[ ] Deployment target was verified against project evidence.
[ ] Deployment execution evidence was checked.
[ ] Deployment verification was checked.
[ ] Secret handling was checked.
[ ] Environment configuration was checked.
[ ] Architecture consistency was checked.
[ ] Reproducibility was checked.
[ ] Documentation accuracy was checked.
[ ] Scope / change expansion was checked.
[ ] Traceability was audited.
[ ] Findings received severity levels.
[ ] Final decision was justified by evidence.
[ ] Source artifacts were not modified.
[ ] No secrets were reproduced.
```

---

# 27. STAGE TRANSITION

If:

```text
PASS
```

and the following are verified:

```text
Build = PASS
Tests = PASS
Deployment = VERIFIED
Deployment Verification = PASS
```

the project may proceed to:

```text
P09 — Documentation
```

If:

```text
PASS_WITH_WARNINGS
```

and the build, tests, and deployment still satisfy the advance condition, the project may proceed while preserving the documented warnings and assumptions.

If:

```text
FAIL
```

return to the stage responsible for the underlying defect:

* P05 — Architecture.
* P06 — Implementation.
* P07 — Testing.
* P08 — CI/CD Deployment.

If:

```text
BLOCKED
```

resolve the missing information, access, infrastructure, or upstream contradiction before continuing.

The validator must not automatically advance the pipeline.
