# UI Interaction Contracts

This document defines how student UI surfaces call APIs, handle async states,
and manage failures without exposing backend implementation details.

## Contract Format

- Request contracts are versioned by route and method.
- Response shape is normalized across endpoints:
  - success: `{ data, meta?, error: null }`
  - failure: `{ data: null, meta?, error: { code, message, details? } }`
- UI must not parse database fields directly from raw response objects.

## Core Student Views

## Dashboard

- Endpoint: `GET /api/student/dashboard`
- Data:
  - student profile summary
  - next lessons
  - assignment counts by status
  - latest progress snapshot
- UI behaviors:
  - show skeleton cards during first load
  - partial render if one widget fails
  - retry failed widget requests independently

## Lessons

- Endpoint: `GET /api/student/lessons`
- Query:
  - `status` (`upcoming|completed|all`)
  - `page` and `pageSize`
- UI behaviors:
  - persist active filter in URL query
  - paginate with stable ordering (`date`, `id`)
  - render empty state copy when no lessons match filter

## Assignments

- Endpoints:
  - `GET /api/student/assignments`
  - `PATCH /api/student/assignments/[id]`
- Mutation rule:
  - optimistic toggle allowed for simple completion status change
  - rollback if server rejects with auth/ownership conflict
- UI behaviors:
  - disable row action while patch is pending
  - show inline error chip on mutation failure

## Progress

- Endpoint: `GET /api/student/progress`
- Data:
  - unit progression percentages
  - skill trend timeline
  - last updated timestamp
- UI behaviors:
  - stale data hint if `lastUpdatedAt` exceeds threshold
  - fallback summary text when chart data is unavailable

## Profile

- Endpoints:
  - `GET /api/student/profile`
  - `PATCH /api/student/profile`
- UI behaviors:
  - client pre-validates format only; server remains source of truth
  - field-level error mapping from `error.details`

## Global Error and Auth Rules

- `UNAUTHENTICATED`: redirect to landing sign-in with return URL.
- `FORBIDDEN`: show role/access banner and block protected content.
- `VALIDATION_ERROR`: map to inline form errors.
- `NOT_FOUND`: display not-found state with navigation back to dashboard.
- `RATE_LIMITED`: show temporary retry hint and cooldown timer.

## Loading and Revalidation Policy

- Initial page load: fetch required blocks in parallel.
- Background revalidation: refresh on tab focus for dashboard and assignments.
- Mutations: refetch impacted resource keys after successful write.
- Avoid cascading full-page reloads on single widget failures.

## Type Ownership

- Client-facing DTO types live under `apps/student-platform/src/lib/api/types`.
- API route handlers convert Prisma models to DTOs before response.
- Prisma entities remain internal to server/repository layers.

## Dependency References

- `docs/StudentDevelopmentPlan/api/README.md`
- `docs/StudentDevelopmentPlan/backend/README.md`
- `docs/platforms/api-index.md`
