# Human feature approval — enforcement design

## Security boundary
A coding agent must not be able to grant its own approval. The state in `features.json` is untrusted repository data; approval requires a separately authenticated human action.

## Implemented (Phase 3)
- `harness/check-feature-changes.mjs` rejects proposed transitions to `done` and edits to approval records in an untrusted PR.
- `.github/workflows/feature-state-guard.yml` runs that policy against the base branch for PRs.
- Unit tests exercise attempted bypasses.

## Required GitHub repository settings (manual, not configured by this integration)
1. Settings → Environments → New environment: `feature-approval`.
2. Configure **Required reviewers** to include the repository owner; enable **Prevent self-review** where available.
3. Settings → Branches (or Rules → Rulesets) → protect `main`: require pull requests, require status checks (including Feature state guard), and restrict bypasses.
4. Do not give the coding agent GitHub repository admin rights, permission to edit these protections, or direct write access to protected `main`.
5. Protect changes to workflow and validator code by owner review (e.g. CODEOWNERS and appropriate branch rules).

## Important: this is NOT a complete approval gate
The above environment is not yet integrated into a trusted workflow that *promotes* a feature to `done`. The current CI only rejects bypasses in PRs. It does not verify whether a reviewer truly approved a feature, nor prevent direct writes if `main` is unprotected. A malicious agent with permission to change CI configuration could also bypass unprotected workflows. Until permissions, protected branch, protected environment and trusted promotion workflow are configured and checked, do not treat this as a hard security guarantee.

## Proposed trusted promotion workflow
- Owner initiates approval for a specific feature and verified commit via a GitHub-controlled action on protected `main`.
- A deployment job uses the `feature-approval` environment and pauses for human review.
- After approval, a trusted job validates required checks for the exact revision, and updates the approved feature using a restricted token.
- The system stores the approval identity, timestamp, feature ID and revision as provenance.
- A feature becomes `done` only through that controlled path; rerun verification after relevant code changes.

## Why this matters
Documentation cannot stop an agent from altering JSON. CI + permissions + an independent approval authority establish enforceable boundaries — *only if configured correctly*.
