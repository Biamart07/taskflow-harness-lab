# Feature state contract (Phase 2)

## Goal
Every feature must have a machine-readable state and a clear, auditable completion rule. This file is a **specification**, not a working enforcement system.

## States
- `not_started`: work has not begun.
- `in_progress`: implementation or rework is happening.
- `blocked`: a dependency or decision prevents progress; record reason in PROGRESS.md.
- `awaiting_approval`: implementation is ready, all required automated checks passed, and a human review is pending.
- `done`: required verification passed AND the project owner explicitly approved this feature.

## Allowed transitions
- `not_started → in_progress`: dependencies that must be completed are `done`; the current phase authorizes work.
- `in_progress → blocked`: a concrete blocker exists.
- `blocked → in_progress`: blocker has been resolved.
- `in_progress → awaiting_approval`: required tests ran successfully, acceptance criteria were checked, and evidence is recorded.
- `awaiting_approval → in_progress`: human requests changes, or verification becomes invalid after new changes.
- `awaiting_approval → done`: explicit feature-level approval by the project owner and valid passing verification evidence.
- `done → in_progress`: regression or newly discovered defect requires rework; previous approval does not excuse revalidation.

All other transitions are disallowed by contract.

## Verification evidence
Record the command, outcome and relevant revision/commit in future verification results. A command that is missing, unconfigured, skipped or failed never counts as passed. A test passing before a later code change must be rerun if affected.

## Approval policy
Feature approval and phase approval are distinct:
- **Feature approval:** allows an individual feature to become `done` after passing tests.
- **Phase approval:** authorizes starting the next project phase.

The agent may fix defects within the authorized phase without obtaining approval for every edit. Explicit approval is required again after corrections to a feature submitted for review. The agent must not self-approve.

## Security limitation
Until an external validator/scheduler enforces these rules with approval authority inaccessible to the agent, entries in JSON can still be changed directly. Merely adding this state contract does not prevent bypasses.

## Next implementation milestone
Build the verifier and approval gate in a subsequent authorized phase, and test both valid and invalid transitions.

## Integrated revision evidence (PR #7 correction)
The PR guard validates the final base-to-head transition, not the sequence of
intermediate commits. This TASK-001 PR must end in_progress. Review-state mutation
is deferred to a later owner-reviewed step after integrated evidence is available.

Registry verification is configuration (pending/github_actions); it must not store
a guessed merge SHA or attest passed. Runtime preflight obtains checks from GitHub
for the exact live main SHA. Evidence receipts bind to a specific SHA and do not
mutate this contract, the registry or human approvals. See approval-evidence.md.
