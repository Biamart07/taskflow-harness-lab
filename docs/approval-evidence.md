# Phase 3 — Feature approval evidence workflow

This is a **safe evidence-only integration step**, not a completed `done` transition.

## What the workflow checks
- The requested full 40-character revision equals the current `main` commit.
- The feature exists and is already `awaiting_approval`.
- The feature has verification status `passed`, matching revision and nonempty configured commands.
- The trusted GitHub Actions `validate` check is successful for that exact commit.
- The `feature-approval` environment separately pauses for your manual review.
- Upon approval the workflow uploads a read-only receipt containing feature ID, SHA and workflow run ID; your approval is recorded by GitHub's environment review audit trail, **not** in this receipt.

## Deliberate limits
There are **no application features ready to approve yet**, so attempting to run this now must fail preflight; that is expected.

Feature verification evidence in repository JSON is still agent-writable, and the `validate` check currently runs harness tests rather than feature-specific application tests. These two facts mean evidence is not yet sufficient for actual application feature completion.

The workflow has `contents: read` only; it **cannot edit** `features.json`. It also does not cryptographically verify the human reviewer identity by itself. The GitHub deployment review audit trail and GitHub permissions remain the actual authority.

## What is left for secure promotion to done
1. Configure and run feature-specific tests (the app does not yet exist).
2. Protect trusted workflow/policy code against changes by the agent.
3. Verify the actual GitHub deployment approval reviewer through an authoritative API, not a self-reported JSON field.
4. Add a privileged, restricted promotion mechanism after all checks pass, respecting PR-only `main` rules; a generic token with direct push rights would undermine the branch policy.
5. Test adversarial attempts to bypass protection.

Because the repository owner can still change repository protections and because PRs currently require zero independent approvals, the current system must NOT be described as agent-proof when an agent shares owner-level GitHub permissions.
