# Teacher Platform

Operational dashboard for instructors, with student management, lesson
planning, and analytics. **Canonical published EFL curriculum** (programs /
levels / story units) is authored in [`curriculum-platform`](../curriculum-platform/README.md)
and consumed here via proxy APIs when `CURRICULUM_PLATFORM_URL` is set; teacher-local
curriculum/planning data remains under `teachers.*`.

## Runtime
- Framework: Next.js (pages router)
- Port: `3001`
- Entry: `apps/teacher-platform/src/pages`

## Dependencies
- `@repo/database` — Prisma client + schema.
- `@shared/schema` — Zod schemas and shared types.
- NextAuth (SSO provider).

## Environment Variables (Key)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET` (preferred), `AUTH_SECRET` (alias)
- `NEXT_PUBLIC_LANDING_PAGE_URL`
- `DATABASE_URL`, `DIRECT_URL`

## Sections
- `ui/README.md`
- `api/README.md`
- `backend/README.md`
- `database/README.md`
