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

## Application foundation (Phase 3)
- `src/main.tsx`: React entry point and composition root.
- `src/app/App.tsx`: presentation-only application shell.
- `src/features/tasks/ui/`: reserved for task components.
- `src/features/tasks/application/`: reserved for use cases and repository interface.
- `src/features/tasks/domain/`: reserved for task types and pure rules.
- `src/features/tasks/infrastructure/`: reserved for repository adapters.

The reserved layers contain documentation only. No task creation or persistence is
implemented. Future UI code calls application operations, which depend on a
repository interface; the composition root supplies the concrete adapter.
The ESLint rules reject direct localStorage references and property access in
app/task UI files. This is a limited static check, not a comprehensive boundary
validator (aliases, dynamic access and import boundaries are not covered).
