# TaskFlow Architecture

## Purpose
A small Kanban-style web application for creating, editing, deleting, filtering and moving tasks across Todo, In Progress and Done.

## Planned stack
- React + TypeScript
- Vite
- Tailwind CSS
- Vitest for unit tests
- Playwright for end-to-end testing
- ESLint for static checks
- Browser localStorage for initial persistence

## Logical boundaries

```text
UI components
   ↓
Application/domain logic
   ↓
Repository interface
   ↓
localStorage adapter
```

- UI components render state and forward user intentions.
- Application/domain logic handles operations and task rules.
- Repository interface abstracts storage.
- The adapter is the only layer permitted to directly access `localStorage`.

## Architectural invariant
React UI components MUST NOT call `localStorage` directly.

This invariant is currently documented, not enforced. A future verifier should make violations fail automatically.

## Scope for the initial application
- Create, edit and delete tasks.
- Move tasks between three columns.
- Filter visible tasks.
- Persist data locally.

## Out of scope initially
- Authentication, backend API, multiuser collaboration and cloud persistence.

## Architecture decisions
No implementation structure is frozen yet. Directory boundaries and interfaces should be reviewed before code generation.
