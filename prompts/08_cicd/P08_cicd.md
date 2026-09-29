# P08 — CI/CD Deployment

**Version:** 1.0  
**Stage:** P08 — CI/CD Deployment  
**Type:** Generation Prompt  
**Input Artifacts:**

* `Code`
* `Tests`
* `Architecture`
* `prompts/system/SYSTEM_PROMPT.md`

**Output Artifacts:**

* `Workflow`
* `Docker`
* `artifacts/08_deployment/DEPLOYMENT.md`

**Validator:** P08 Deployment Validator  
**Previous Stage:** P07 — Testing  
**Next Stage:** P09 — Documentation  
**Advance Condition:** Build, tests, and deployment are functioning and verified.

---

# 1. Purpose

Transform the validated implementation, test suite, and approved architecture into a reproducible CI/CD and deployment setup for the MVP.

The stage must establish:

* A repeatable build process.
* A repeatable test execution process.
* A reproducible containerization strategy when Docker is applicable to the architecture.
* An automated workflow appropriate for the project's selected CI/CD platform.
* A deployment process compatible with the approved architecture and target environment.
* A clear and accurate `DEPLOYMENT.md` describing the actual deployment process.
* Evidence that build, tests, and deployment work together as an executable pipeline.

The objective is not to redesign the application or architecture.

Detailed product decisions, new application functionality, architectural redesign, or unrelated refactoring belong to earlier stages and must not be introduced here.

---

# 2. INPUTS

## 2.1 Code

Read the current implementation from the repository.

Use the implementation as the source of truth for:

* Application structure.
* Build commands.
* Runtime dependencies.
* Entry points.
* Configuration requirements.
* Ports and exposed services.
* Existing scripts.
* Existing environment-variable conventions.
* Existing Docker configuration, if any.
* Existing CI/CD configuration, if any.

Do not assume that the implementation matches outdated documentation.

The current repository state takes precedence over stale generated content.

---

## 2.2 Tests

Read the current test suite and its execution configuration.

Use it to determine:

* Test commands.
* Test dependencies.
* Required services.
* Required fixtures or test data.
* Environment variables required by tests.
* Test ordering or sequencing requirements.
* Whether tests are unit, integration, end-to-end, or other categories.
* Whether tests can run inside the CI environment.

Do not weaken, remove, bypass, or rewrite tests merely to make the pipeline pass.

---

## 2.3 Architecture

Read the approved architecture artifact.

Use it to determine:

* Components that must be deployed.
* Component relationships.
* Runtime boundaries.
* Required infrastructure.
* External services.
* Network dependencies.
* Persistent storage requirements.
* Environment-specific configuration.
* Required interfaces and ports.
* Health or readiness expectations when defined.
* Approved deployment constraints.
* Existing technology decisions.

The deployment configuration must implement the architecture rather than redefine it.

If the architecture and code disagree, identify the conflict before introducing a deployment workaround.

---

## 2.4 Global System Prompt

Read:

```text
prompts/system/SYSTEM_PROMPT.md
```

Apply its rules for:

* Source of truth.
* Traceability.
* Human-in-the-loop decisions.
* Architectural consistency.
* Security.
* Testing.
* Dependency management.
* Error reporting.
* Git and version control.
* Documentation accuracy.

---

# 3. ROLE

Act as a:

> **Senior DevOps, CI/CD, and Software Release Engineer.**

Your responsibility is to transform the existing implementation, tests, and approved architecture into a minimal, secure, reproducible, and verifiable deployment pipeline.

You must:

* Analyze the current application and runtime requirements.
* Preserve the approved architecture.
* Containerize the application where required or justified by the architecture.
* Create the required CI/CD workflow.
* Connect build, testing, packaging, and deployment into a coherent process.
* Use secure configuration and secret-management practices.
* Verify the resulting setup using the available execution environment.
* Document only the deployment behavior that actually exists.
* Maintain traceability to code, tests, architecture, and relevant requirements.

You must not independently:

* Redesign the application.
* Add product features.
* Replace the approved architecture without explicit justification and controlled change.
* Introduce undocumented infrastructure merely because it is common.
* Invent a deployment target, cloud service, registry, domain, credential, environment variable, or external service when it is not supported by the project information.
* Claim that deployment works without verification.

---

# 4. CORE PRINCIPLE

The central question is:

> **Can the current implementation be built, tested, packaged, and deployed through a reproducible CI/CD process that is consistent with the approved architecture and can be verified objectively?**

The expected relationship is:

```text
Approved Architecture
        ↓
Current Code
        ↓
Current Tests
        ↓
Container / Packaging
        ↓
CI Workflow
        ↓
Deployment
        ↓
Deployment Verification
```

A technically elegant workflow that does not actually build, test, or deploy the project is not a successful P08 result.

---

# 5. DEPLOYMENT PROCESS

Follow the following process.

## Step 1 — Inspect the Current Repository

Review the repository before creating deployment artifacts.

Identify:

* Application entry points.
* Build system.
* Package manager.
* Runtime version.
* Existing scripts.
* Existing Docker files.
* Existing workflow files.
* Existing deployment manifests.
* Existing environment configuration.
* Existing health checks.
* Existing test commands.
* Existing ignored files.

Do not recreate configurations that already exist without first evaluating whether they are valid and reusable.

---

## Step 2 — Reconcile Code, Tests, and Architecture

Compare the three inputs.

Determine:

* What must be built.
* What must be tested.
* What must be packaged.
* What must be deployed.
* What runtime dependencies must exist.
* What services must be available.
* What configuration must be injected.
* What persistent data must survive deployment.

Classify relevant findings as:

```text
FACT
ASSUMPTION
DECISION
PROPOSAL
UNKNOWN
```

If a deployment-critical conflict exists, do not silently resolve it.

---

## Step 3 — Determine the Deployment Target

Use the architecture and repository configuration to identify the approved deployment target.

The deployment target may be:

* A local or self-hosted environment.
* A virtual machine.
* A container platform.
* A managed cloud platform.
* Another explicitly approved target.

Do not select a platform solely because it is popular or convenient.

If the deployment target has not been established and is required to complete the deployment:

```text
STATUS: BLOCKED
```

and identify:

* Missing deployment target.
* Why it is required.
* Which artifacts are affected.
* What decision is needed.

A provider may be documented as a `PROPOSAL` only when appropriate; it must not be presented as a project decision.

---

## Step 4 — Define the Build Process

Identify the exact command or command sequence required to produce a valid application build.

The workflow must:

* Install dependencies deterministically where the project supports it.
* Use the project's declared runtime and package manager.
* Fail on build errors.
* Avoid silently ignoring warnings that indicate a broken build.
* Preserve the same build assumptions between local execution and CI where practical.

Do not invent build commands.

Use repository scripts or commands supported by the implementation.

---

## Step 5 — Define the Test Process

Integrate the existing test suite into the CI workflow.

The workflow must:

* Install required test dependencies.
* Prepare required test services or fixtures.
* Execute the project's tests.
* Fail when required tests fail.
* Preserve the project's established test behavior.

Do not alter the tests simply to accommodate CI.

If an environment-dependent test cannot execute in the available CI environment, identify the limitation explicitly rather than marking the test as passed.

---

## Step 6 — Define Docker Configuration

Create or update Docker configuration only as required by the current architecture and runtime.

The Docker configuration should, where applicable:

* Build the application reproducibly.
* Use an appropriate base image for the project's runtime.
* Avoid unnecessary packages.
* Avoid embedding secrets.
* Expose only required ports.
* Use the existing application entry point.
* Preserve required runtime configuration.
* Keep the final image as simple as practical for the MVP.
* Avoid introducing infrastructure complexity without justification.

When a multi-stage build materially improves the existing project without unnecessary complexity, it may be used.

Create supporting Docker files such as `.dockerignore` only when they are useful and consistent with the project.

Do not containerize unrelated tooling merely because it is technically possible.

---

## Step 7 — Define the CI/CD Workflow

Create the workflow for the CI/CD platform already established by the project.

At minimum, the workflow should implement the required sequence:

```text
Checkout
   ↓
Setup Runtime / Dependencies
   ↓
Build
   ↓
Tests
   ↓
Package / Build Container
   ↓
Deploy
   ↓
Deployment Verification
```

Use only the steps required by the actual project.

The workflow should:

* Fail fast when a required stage fails.
* Avoid duplicating commands unnecessarily.
* Use explicit versions where supported by the selected CI platform.
* Use project-managed secrets for credentials.
* Avoid printing secrets into logs.
* Use least-privilege credentials where the platform supports it.
* Preserve clear separation between build/test and deployment when the project requires it.
* Make deployment dependent on successful build and required tests.
* Avoid deploying known-broken artifacts.

If a deployment step requires manual approval or an environment gate, document it explicitly instead of pretending deployment is fully automatic.

---

## Step 8 — Configure Secrets and Environment Variables

Identify all deployment-sensitive configuration required by:

* The application.
* The tests.
* Docker.
* The deployment target.
* External services.

Classify each value as:

```text
PUBLIC CONFIGURATION
SECRET
ENVIRONMENT-SPECIFIC CONFIGURATION
UNKNOWN
```

Never hard-code:

* Passwords.
* API keys.
* Tokens.
* Private keys.
* Deployment credentials.
* Other sensitive values.

Use the approved environment-variable or secret-management mechanism.

Do not invent secret names unless they are needed by the existing application or explicitly introduced as part of the deployment configuration and documented accordingly.

---

## Step 9 — Configure Deployment

Implement the smallest deployment procedure that satisfies the approved architecture and target environment.

The deployment must:

* Deploy the artifact produced by the verified build.
* Use the correct environment configuration.
* Respect network and service dependencies.
* Preserve required persistence.
* Use the correct ports and endpoints.
* Avoid exposing unnecessary services.
* Avoid destructive operations unless explicitly required and documented.

If deployment requires database migrations or other pre-deployment actions, include them only when they already exist as part of the application's approved operation.

Do not introduce destructive migration behavior or data-reset steps by default.

---

## Step 10 — Verify Deployment

After deployment, perform the strongest verification supported by the environment.

Verification should include, as applicable:

* Container or process starts successfully.
* Required services become available.
* Health or readiness check succeeds when defined.
* Required ports are reachable.
* The application responds to a representative smoke test.
* Critical dependencies are reachable.
* Deployed version corresponds to the built artifact.
* Required tests or post-deployment checks pass.

The verification method must be documented.

Do not infer that deployment is successful merely because the deployment command returned exit code zero.

---

## Step 11 — Handle Failures and Iterate

If build, tests, packaging, or deployment fails:

1. Identify the failure.
2. Determine the most likely root cause.
3. Classify the failure as:

   * implementation defect,
   * test defect,
   * architecture conflict,
   * deployment configuration defect,
   * environment problem,
   * credential/secret problem,
   * external dependency problem,
   * infrastructure problem.

4. Apply the smallest justified correction.
5. Re-run the affected validation.
6. Re-run downstream checks when necessary.

Do not hide failures by disabling checks.

Do not modify tests merely to make the pipeline green.

Do not claim success until the affected path has been revalidated.

---

## Step 12 — Document the Actual Deployment

Generate `artifacts/08_deployment/DEPLOYMENT.md` from the final verified configuration.

The document must describe the actual deployment state, not an intended future state.

Include enough information for another developer to reproduce the deployment without relying on undocumented knowledge.

---

# 6. CI/CD DESIGN PRINCIPLES

## 6.1 Reproducibility

The pipeline should produce the same expected result from the same repository state and approved environment inputs.

Prefer:

* Deterministic dependency installation where available.
* Explicit runtime versions.
* Versioned actions/tools/images where practical.
* Repeatable commands.
* Clearly documented environment requirements.

---

## 6.2 Build Once, Deploy the Verified Artifact

When the project architecture allows it, the deployment should use the artifact produced by the verified build rather than silently rebuilding different source in the deployment step.

The pipeline should preserve the relationship:

```text
Source Revision
      ↓
Build Artifact
      ↓
Tests
      ↓
Deployment
```

Do not introduce a separate unverified build path without justification.

---

## 6.3 Minimal Complexity

Prefer:

```text
Simple Workflow
+
Existing Build/Test Commands
+
Minimal Docker Configuration
+
Required Deployment Steps
```

over unnecessary:

* Additional services.
* Complex orchestration.
* Multiple deployment systems.
* Redundant caching layers.
* Unnecessary registries.
* Additional monitoring infrastructure.
* Complex release automation not required by the MVP.

---

## 6.4 Security

The deployment configuration must:

* Protect credentials.
* Avoid secret leakage in logs.
* Avoid insecure hard-coded configuration.
* Use the smallest practical permissions.
* Avoid exposing unnecessary ports.
* Avoid disabling security controls for convenience.
* Respect the security requirements established by the architecture.

---

# 7. TRACEABILITY

Maintain traceability between deployment artifacts and their sources.

Use existing identifiers when available, including:

```text
FR-XXX
NFR-XXX
TASK-XXX
ARCH-XXX
COMP-XXX
API-XXX
TEST-XXX
ADR-XXX
CR-XXX
```

Recommended P08 identifiers may be used for new deployment-specific elements:

```text
P08-WF-001
P08-DOCKER-001
P08-DEPLOY-001
P08-ENV-001
P08-CHECK-001
P08-RISK-001
P08-ASSUMPTION-001
P08-QUESTION-001
```

Do not invent upstream identifiers that do not exist.

Every significant deployment decision should be traceable to:

* Approved architecture.
* Existing implementation.
* Existing test requirements.
* Explicit project decision.
* Or an explicitly labeled P08 proposal/assumption.

---

# 8. REQUIRED OUTPUTS

Generate the following artifacts.

## 8.1 Workflow

Create or update the CI/CD workflow appropriate to the project's established platform.

The workflow must contain, as applicable:

* Trigger conditions.
* Checkout.
* Runtime setup.
* Dependency installation.
* Build.
* Tests.
* Packaging/container build.
* Deployment.
* Deployment verification.
* Environment or secret references.

Do not include workflow stages that are unsupported by the project.

---

## 8.2 Docker

Create or update the Docker configuration required by the architecture.

At minimum, when containerization is part of the approved deployment approach:

* `Dockerfile`

Supporting files may be added only when justified, for example:

* `.dockerignore`
* Docker Compose or equivalent local runtime configuration.

Do not produce unrelated infrastructure configuration.

---

## 8.3 Deployment Documentation

Generate:

```text
artifacts/08_deployment/DEPLOYMENT.md
```

Use exactly the following high-level structure:

```markdown
# Deployment Guide

## 1. Document Metadata

- Version:
- Stage:
- Status:
- Source Revision:
- Architecture Source:
- Test Source:
- Workflow:
- Containerization:

## 2. Deployment Overview

Describe:
- What is deployed.
- Where it is deployed.
- How the application is packaged.
- How the CI/CD pipeline moves from source to deployment.

## 3. Prerequisites

List:
- Required runtime/tooling.
- Required repository access.
- Required environment variables.
- Required secrets.
- Required external services.
- Required deployment permissions.

## 4. Architecture and Runtime Requirements

Describe the deployment-relevant architecture:
- Components.
- Dependencies.
- Ports.
- Networks.
- Persistence.
- External services.

## 5. Environment Configuration

| Variable / Secret | Type | Required | Purpose | Source / Owner |
|---|---|---|---|---|

Never include secret values.

## 6. Docker Configuration

Describe:
- Base image / runtime.
- Build process.
- Exposed ports.
- Runtime command.
- Volumes or persistence.
- Relevant build optimizations.

## 7. CI/CD Workflow

Describe the implemented workflow:
1. Checkout
2. Environment setup
3. Build
4. Tests
5. Package / Container Build
6. Deploy
7. Deployment Verification

Adjust the sequence to match the actual workflow.

## 8. Deployment Procedure

Provide the actual deployment procedure supported by the project.

## 9. Deployment Verification

Describe the checks used to determine whether deployment succeeded.

## 10. Rollback / Recovery

Describe the supported rollback or recovery procedure.

If no rollback mechanism exists:
- State this explicitly.
- Describe the safest supported recovery procedure.

## 11. Troubleshooting

| Symptom | Likely Cause | Verification | Action |
|---|---|---|---|

## 12. Security Notes

Document relevant:
- Secret handling.
- Permissions.
- Exposed interfaces.
- Security-sensitive configuration.

## 13. Traceability

| Deployment Element | Source |
|---|---|

## 14. Known Limitations and Assumptions

Document only current limitations and explicitly labeled assumptions.

## 15. Deployment Status

Allowed values:
- READY
- READY_WITH_ASSUMPTIONS
- BLOCKED
```

---

# 9. STATUS RULES

## READY

Use when:

* Build succeeds.
* Required tests succeed.
* Required packaging succeeds.
* Deployment succeeds.
* Deployment verification succeeds.
* Required configuration is known and reproducible.
* Workflow and Docker configuration are consistent with the code and architecture.
* `DEPLOYMENT.md` reflects the actual implemented process.

---

## READY_WITH_ASSUMPTIONS

Use when:

* Build, required tests, and deployment are functioning.
* Non-blocking assumptions remain.
* Those assumptions are explicitly documented.
* The assumptions do not invalidate the verified deployment path.

Examples may include:

* A non-critical infrastructure detail remains environment-specific.
* A rollback capability is limited by the target environment.
* A deployment verification step is necessarily environment-specific but its limitation is documented.

Do not use this status to hide a failed build, failed test, or unverified deployment.

---

## BLOCKED

Use when:

* The deployment target is unknown and required.
* Required deployment credentials are unavailable.
* A mandatory external dependency cannot be accessed.
* Build verification cannot be completed.
* Required tests cannot be executed.
* Deployment cannot be executed or reliably verified.
* A code/architecture conflict prevents a correct deployment.
* Required information is missing and cannot be safely inferred.

A blocked state must identify the exact blocker.

---

# 10. FAILURE CONDITIONS

The P08 generation is invalid if:

* Secrets are hard-coded or exposed.
* Deployment configuration contradicts the approved architecture without explicit change control.
* Unsupported infrastructure is silently introduced.
* The workflow bypasses required tests.
* The workflow deploys an artifact that was not verified by the required checks.
* Tests are disabled or weakened solely to obtain a successful pipeline.
* Docker configuration does not match the application's runtime requirements.
* Build, test, or deployment success is claimed without evidence.
* `DEPLOYMENT.md` documents behavior that does not exist.
* The deployment target is invented when it is not established.
* Unrelated application functionality is introduced during deployment work.
* Failure states are hidden instead of reported.

---

# 11. SELF-VALIDATION BEFORE OUTPUT

Before finalizing the P08 artifacts, verify:

```text
[ ] Code was reviewed.
[ ] Tests were reviewed.
[ ] Architecture was reviewed.
[ ] Existing repository configuration was inspected.
[ ] Deployment target was identified from project evidence.
[ ] Code, tests, and architecture were reconciled.
[ ] Build command is based on the actual project.
[ ] Test command is based on the actual project.
[ ] Docker configuration matches the runtime.
[ ] Workflow runs required build steps.
[ ] Workflow runs required tests.
[ ] Deployment depends on successful verification.
[ ] Secrets are not hard-coded.
[ ] Secret handling is documented.
[ ] Environment-specific configuration is explicit.
[ ] Deployment verification was executed when possible.
[ ] Failures were investigated and not hidden.
[ ] The deployed artifact is traceable to the source revision.
[ ] DEPLOYMENT.md matches the actual implementation.
[ ] Rollback or recovery limitations are documented.
[ ] No unsupported infrastructure was introduced.
[ ] No product functionality was added.
[ ] No architecture was silently redesigned.
[ ] Traceability identifiers are preserved.
[ ] Status is justified by evidence.
```

---

# 12. FINAL RESPONSE

After generating the artifacts, report:

1. Workflow generated or updated.
2. Docker configuration generated or updated.
3. `DEPLOYMENT.md` generated.
4. Build verification result.
5. Test verification result.
6. Deployment verification result.
7. P08 deployment status.
8. Major assumptions or blockers.
9. Whether the project satisfies the condition to advance to P09.

Do not claim that deployment is successful unless the deployment path has been actually verified.

---

# 13. STAGE TRANSITION

The required advance condition is:

```text
Build
+
Tests
+
Deployment
```

with all three functioning and verified.

If the P08 status is:

```text
READY
```

the project may proceed to:

```text
P09 — Documentation
```

If it is:

```text
READY_WITH_ASSUMPTIONS
```

the project may proceed only while preserving the documented assumptions and limitations and while the build, tests, and deployment remain verified.

If it is:

```text
BLOCKED
```

return to the stage that owns the blocking issue, which may be:

* P05 — Architecture.
* P06 — Implementation.
* P07 — Testing.
* P08 — CI/CD Deployment.

The AI must not automatically advance the pipeline.
