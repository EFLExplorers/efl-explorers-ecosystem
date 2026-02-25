# Teacher Platform

Operational dashboard for instructors, with student management, curriculum,
lesson planning, and analytics.

## Runtime
- Framework: Next.js (pages router)
- Port: `3001`
- Entry: `apps/teacher-platform/src/pages`

## Dependencies
- `@repo/database` — Prisma client + schema.
- `@shared/schema` — Zod schemas and shared types.
- NextAuth (SSO provider).

## Environment Variables (Key)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_LANDING_PAGE_URL`
- `DATABASE_URL`, `DIRECT_URL`

## Sections
- `ui/README.md`
- `api/README.md`
- `backend/README.md`
- `database/README.md`
