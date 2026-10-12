# Feature-specific verification policy (Phase 3)

`validate` proves harness tests, not functional task acceptance. Integrated evidence
requires both harness and feature checks from completed successful main-push runs
at live main's exact full SHA, with expected workflow path, branch, GitHub Actions
origin, check name and suite ID. See approval-evidence.md for the runtime collector.

TASK-001 policy is enabled because its workflow runs 8 dedicated unit tests and
12 dedicated browser tests. TASK-002..TASK-006 remain pending. No generic smoke
or harness result substitutes for these tests.

The registry describes verification configuration with source github_actions and
status pending; it never self-attests passed or stores the anticipated merge SHA.
Successful evidence is queried from GitHub after integration. Both evidence
workflows have read-only permissions and never promote a feature.

Workflow/policy code, repository protections and reviewer credentials require
independent governance outside agent-editable files. Passing preflight verifies
configured evidence, not human identity or comprehensive acceptance correctness.
No secure done promotion exists. Authority options and residual limits are in
approval-evidence.md; no unrestricted token/direct push bypass is introduced.
