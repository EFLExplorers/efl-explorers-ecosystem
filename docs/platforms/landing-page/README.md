# Landing Page Platform

Marketing site and authentication hub for the ecosystem.

## Runtime
- Framework: Next.js (pages router)
- Port: `3000`
- Entry: `apps/landing-page/src/pages`

## Dependencies
- `@repo/database` — Prisma client + schema.
- `@repo/ui` — Shared UI primitives.
- NextAuth + Prisma adapter.

## Environment Variables (Key)
- `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- `DATABASE_URL`, `DIRECT_URL`
- `NEXT_PUBLIC_TEACHER_URL`, `NEXT_PUBLIC_STUDENT_URL`
- `NEXT_PUBLIC_LANDING_PAGE_URL`
- `EFL_API_KEY`

## Sections
- `ui/README.md`
- `api/README.md`
- `backend/README.md`
- `database/README.md`
