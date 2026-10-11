# Feature-specific verification policy (Phase 3)

## Why we need this
The harness validation check named `validate` proves that the harness code passes its own tests. It **does not** prove TaskFlow's Create Task, Edit Task, persistence or other user-facing functionality works.

The approval preflight must therefore require **both**:
1. Trusted harness CI for the exact protected `main` SHA.
2. A successful feature-specific check from a trusted feature workflow for that same SHA.

## Implemented
- `harness/feature-verification-policy.json` maps all six features to future dedicated checks.
- Every entry has `status: pending`, so no feature can pass the new gate today.
- `harness/feature-quality-gate.mjs` verifies the dedicated job name, trusted workflow path, successful workflow run/check-suite, GitHub Actions origin and exact revision.
- The approval evidence workflow calls this gate **before** the environment review.
- Unit tests include wrong workflow, wrong suite, wrong revision, missing policy and failures.

## Why all entries are pending
The web application and its tests have not been implemented. A passing harness validator cannot substitute for an E2E test. Do **not** set entries to `enabled` just to get a green workflow.

The currently referenced `taskflow-feature-tests.yml` workflow is not yet present. Future work must implement it with real, isolated tests and verify all test jobs are required. Check-run identity, CI configuration and workflow code must be protected from the development agent.

## Remaining security work
This is a preflight policy, not a fully secure approval or state mutation mechanism. Repository policy files and code can be modified through Pull Requests that need no independent reviewer on this personal repository. Do not treat this as agent-proof when the agent holds owner credentials.

Promotion to `done` must use separate approval authority, verify actual deployment review identity, bind evidence to immutable commit SHA and respect main branch protection. Do not add an unrestricted token or direct-push bypass.
