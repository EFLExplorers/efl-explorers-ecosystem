# Student Backend Boundaries

Defines server-side responsibilities for the student platform, including auth,
session handling, validation, and protected data access.

## Responsibilities

- Resolve and validate student session for every protected API request.
- Enforce role-based and record-level authorization.
- Execute validated reads/writes against `@repo/database`.
- Normalize API responses and map errors to typed client-safe codes.

## Backend Modules (Target)

- `auth`: session access, role checks, and redirect rules.
- `validation`: Zod schema parsing and typed coercion.
- `repositories`: Prisma queries scoped to student identity.
- `services`: dashboard/progress aggregation and mutation orchestration.
- `http`: route handlers and response serialization.

## Security Guardrails

- No direct client-driven model selection or raw SQL in route handlers.
- No cross-student reads unless an explicit admin policy is introduced.
- All write paths log actor + target IDs for observability.
- SSO tokens are one-time use and short-lived.

## Data Access Policy

- `auth` schema: session and SSO token verification only.
- `shared` schema: read-only consumption for reusable content.
- `students` schema: primary read/write ownership for student domain.
- `teachers` schema: read-only, explicitly scoped dependencies if needed.

## Reference Docs

- `docs/platforms/teacher-platform/backend/sso.md`
- `docs/StudentDevelopmentPlan/backend/sso-session-flow.md`
- `packages/database/prisma/schema.prisma`
