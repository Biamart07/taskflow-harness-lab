# Phase 3 — Integrated evidence and approval preflight

## P1 correction: bind evidence at runtime
`features.json` declares commands and `source: github_actions`, with `status: pending`.
It does not store a provisional `verification.revision` or claim `passed`.
Historical local/PR test SHAs belong only in diagnostic documentation.

`collect-main-evidence.mjs` reads GitHub REST using a read-only token. Both evidence
workflows require dispatch on main, checkout HEAD equal to the full requested SHA,
and live main HEAD equal to that SHA before and after API collection. The collector
paginates check runs and workflow runs, failing closed on API errors/incomplete data.

Both harness and feature checks must match the exact SHA, expected check name,
GitHub Actions origin, completed/success result and suite ID from a successful
completed push on branch main in the exact workflow path. PR runs, unrelated
workflows/suites, old SHAs and a registry claim of passed cannot substitute.
The feature policy remains required; validate alone is insufficient.

## Post-merge sequence, no circular SHA writes
1. The owner reviews and may merge this PR with TASK-001 still in_progress.
2. Wait for harness and feature workflows triggered by the actual main push.
3. Dispatch `Integrated feature evidence` on main using its actual full HEAD SHA.
   It supports in_progress and uploads a receipt. No state or approval writes.
4. In a later owner-reviewed step, consider in_progress → awaiting_approval against
   that integrated evidence. This PR does not implement or authorize that write.
5. A later state-change merge creates another SHA. Do not copy the previous SHA
   into the registry: wait for main-push tests again, then run approval evidence
   against the new live HEAD. Approval preflight still requires awaiting_approval.

`Feature approval evidence` uses the same collector in approval mode, then retains
the existing environment review and live-main recheck after review. Its receipt
is evidence only: the workflow actor is the initiator, not proof of reviewer identity.
A local JSON receipt is not trusted on its own; re-query GitHub for the target SHA.

## P2 correction: final PR transition
The guard compares base registry to final proposed registry, using the contract's
TRANSITIONS table. not_started → awaiting_approval fails even if intermediate
commits include in_progress. This PR ends not_started → in_progress. The guard
still prohibits untrusted done and changes to human approval records.
The later review-state step must be reviewed separately; the PR guard only checks
transition shape and does not retrieve evidence for awaiting_approval writes.

## Security limitations and authority alternatives
Code cannot establish independent authority if the agent possesses owner credentials.
Branch/ruleset protections, required checks, no bypass, review of workflow/policy code,
and environment required reviewers are external prerequisites. The collector does
not configure or certify these protections. A compromised workflow or writable
policy can undermine evidence; protect them with independent reviews/CODEOWNERS
and restricted credentials. Functions accepting fixtures/files are pure validators,
not trusted API acquisition; only the workflow's direct API collection is evidence.
Main may advance after a receipt; every later action must revalidate live HEAD.
No receipt automatically writes awaiting_approval, approval, or done.

Before any done mechanism, the owner must choose and verify authority:
- Manual owner-controlled promotion via a reviewed PR, using fresh live evidence
  and GitHub's authoritative environment/deployment review identity.
- A dedicated GitHub App/service with minimal permissions and protected environment,
  enforcing reviewer identity and PR-based writes without branch bypass.

Neither is implemented here. A shared owner token or github.actor is not independent
human approval. Existing environment settings and effective branch protections have
not been audited in this correction; they must not be assumed secure from YAML.
Phase 4 remains unauthorized. No automatic merge or approval record changes.
