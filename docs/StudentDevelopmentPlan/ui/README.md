# Student UI Architecture

Defines the frontend structure for `apps/student-platform` and how pages and
components consume student-facing APIs safely and consistently.

## Current Baseline

- Entry app: `apps/student-platform`
- Current route: `/` only (`src/pages/index.tsx`)
- Router: Next.js pages router
- Styling: CSS modules

## Proposed Route Map (Phase-Driven)

- `/` - Student dashboard home and daily summary
- `/lessons` - Assigned lessons and completion state
- `/progress` - Unit and skill progress timeline
- `/assignments` - Assignment list, due dates, and status
- `/profile` - Student profile and preferences
- `/sso` - One-time sign-in token exchange and redirect landing

## UI Layers

- **Page layer**: Route-level containers in `src/pages`.
- **Feature layer**: Domain sections in `src/components/student/*`.
- **Shared layer**: Reusable primitives in `@repo/ui` where possible.
- **Data layer**: API clients and typed contracts in `src/lib/api/*`.

## State Model

- Session state: authenticated user, role, and approval flags.
- View state: loading, empty, and error states per page.
- Domain state: lessons, assignments, and progress aggregates.
- Mutation state: optimistic updates only where server conflict is low risk.

## UX Standards

- Every data view has loading, empty, and retry states.
- User-visible errors are concise and actionable.
- Role and auth failures redirect to landing sign-in.
- Data timestamps are shown in local timezone with clear labels.

## Dependencies

- Auth and SSO: `docs/platforms/teacher-platform/backend/sso.md`
- API index baseline: `docs/platforms/api-index.md`
- Shared UI package: `packages/ui`
