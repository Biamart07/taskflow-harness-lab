# TaskFlow — Agent Instructions

## Mission
Build TaskFlow, a small Kanban task management web app, as a hands-on Harness Engineering laboratory.

## Session startup
1. Read this file, `docs/architecture.md`, `docs/conventions.md`, and `PROGRESS.md`.
2. Inspect the repository state before making changes.
3. Read `harness/phases.json` and `harness/features.json` when present, and work only within the currently authorized project phase.

## Architecture
- React, TypeScript, Vite and Tailwind CSS.
- Keep UI, application logic and persistence separate.
- React components must not access `localStorage` directly; persistence belongs in a repository adapter.
- Keep business logic independently testable.

## Human approval gate
- The agent may implement, verify, refactor and correct work within the current phase without repeated approval.
- After verification, update `PROGRESS.md` and present a concise handoff with evidence.
- Only the human owner can authorize moving to another phase.
- Never infer approval from silence, passing tests or completion of a checklist.
- `harness/phases.json` records proposed phase states, but is NOT a secure approval mechanism. Do not edit any approval value on the human's behalf.
- Do not move to the next phase until explicit human authorization is received.

## Verification and clean handoff
- Run the applicable checks; never claim a command passed unless it was actually executed.
- Record failed or unavailable checks honestly.
- Remove temporary debug artifacts and leave the repository in a reproducible state.
- Update `PROGRESS.md` with completed work, ongoing work, blockers and next action.
- Feature completion requires passing required tests AND explicit owner approval; move verified features to `awaiting_approval` first.
- Refer to `docs/feature-state-contract.md` for allowed transitions. Feature approval does not grant phase approval.
- Do not mark features done solely because their implementation looks correct.
- `harness/features.json` is the structured feature registry. For now it is planning data, not an enforced scheduler/verifier.
