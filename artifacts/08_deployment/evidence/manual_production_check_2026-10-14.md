# Manual check of the hosted application (team-reported)

- Date: 2026-10-14
- Reported by: the project team, through the person running this Claude session. The assistant did not perform or observe this check.
- Scope reported: the manual production check recommended in `DEPLOYMENT_VALIDATION_V2.md` (VAL-006) and `MVP_EVALUATION.md` (EVAL-008): the main owner and provider journeys in a browser on `https://vetcare-mvp.vercel.app` with a test account, including sign-up, sign-in, search and booking, and the points that the read-only smoke test cannot see (session cookie `Secure` attribute over HTTPS, `FEATURES` empty in Production, Node.js version used by Vercel).
- **Result reported: all the manual tests passed** (statement of the team, 2026-10-14).
- Observed values: individual observations (for example the exact cookie attributes or the Node.js version) were not provided to the assistant and are not recorded here. If a value should be on file, add it below with its date.
- Evidence level: human attestation of a passing result. It is not a reproducible artifact, and it was not independently re-run.

| Item | Result | Observed value | Date |
|---|---|---|---|
| Manual tests of the main journeys, cookie `Secure`, `FEATURES`, Node.js version | Passed (team-reported) | not recorded | 2026-10-14 |
| (add observed values as needed) | | | |
