# TaskFlow Development Conventions

## General
- Prefer small, cohesive TypeScript modules.
- Use descriptive names and explicit types at module boundaries.
- Avoid unnecessary abstraction and dependencies.
- Keep code and documentation consistent.

## Frontend
- Use semantic HTML and accessible labels.
- Support keyboard interaction and responsive layouts.
- Avoid placing business logic or direct storage calls inside UI components.

## Testing
- Prefer deterministic tests.
- Test application logic with unit tests.
- Test critical workflows from the user's perspective with Playwright once configured.
- Never report an unexecuted test as passing.

## Git and delivery
- Make focused, descriptive commits.
- Don't commit secrets, generated build output or temporary debugging files.
- Keep `PROGRESS.md` useful for the next session, not as a line-by-line activity log.

## Phase boundary
- Corrections within the current phase are allowed.
- Starting a new phase requires explicit human approval.
