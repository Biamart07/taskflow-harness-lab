# Phase 3 — Exercise: environment approval gate

This is a **manual approval demonstration**, not yet a trusted feature completion system.

## Setup
1. Configure the GitHub environment `feature-approval` with required reviewer `Biamart07` and restrict deployment branches to `main`.
2. Review and merge the PR that adds `.github/workflows/feature-approval-demo.yml`.
3. Navigate to GitHub **Actions → Feature approval gate demo → Run workflow**.
4. Select branch `main` and type `TASK-001`. This ID is a label for the demonstration: it does **not** approve the feature.
5. Open the queued workflow run. It should wait for an environment review.
6. Click **Review deployments**, select `feature-approval` and **Approve and deploy**.
7. Confirm the job resumes and prints the feature ID and SHA.

## Negative test
Start another run but **do not approve**. It should remain waiting for review rather than proceeding. Cancel that run afterward.

## Security scope
- Workflow permissions are read-only: `contents: read`.
- It does not edit `features.json` and cannot mark any task `done`.
- The current human review proves that a GitHub environment gate can pause a workflow.
- It does not establish independent human identity when agent and human share the same GitHub principal.
- Environment rules do not defend against a coding agent that can change protected settings or workflows.
- A future privileged promotion workflow must validate feature ID, immutable commit SHA, verification evidence and human authorization before changing state, with the approval mechanism outside the agent's write scope.

## Important
Never submit production secrets to this demonstration. Feature and phase state remain unchanged.
