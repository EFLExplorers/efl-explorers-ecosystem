# Operations

## Local Setup (Quick)

1. Install dependencies:
   - `pnpm install`
2. Copy env templates:
   - `packages/database/.env.example` ➜ `packages/database/.env`
   - `apps/landing-page/.env.local.example` ➜ `apps/landing-page/.env.local`
   - `apps/teacher-platform/.env.local.example` ➜ `apps/teacher-platform/.env.local`
3. Generate Prisma client:
   - `pnpm --filter @repo/database build`
4. Run apps:
   - `pnpm dev` (all apps)
   - `pnpm --filter landing-page dev`
   - `pnpm --filter teachers-platform dev`
   - `pnpm --filter students-platform dev`

## Environment Variables

### Shared (Turborepo)
These are referenced in `turbo.json` and flow to tasks:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_LANDING_PAGE_URL`
- `NEXT_PUBLIC_TEACHER_URL`

### Landing Page (`apps/landing-page/.env.local`)

- `NEXTAUTH_URL` — Base URL for NextAuth callbacks.
- `NEXTAUTH_SECRET` — Session signing secret.
- `DATABASE_URL`, `DIRECT_URL` — Prisma connections.
- `NEXT_PUBLIC_TEACHER_URL`, `NEXT_PUBLIC_STUDENT_URL` — Cross-app SSO redirects.
- `NEXT_PUBLIC_LANDING_PAGE_URL` — Public site URL (used by auth flows).
- `EFL_API_KEY` — Required for `/api/content` and `/api/page-content`.
- `BCRYPT_SALT_ROUNDS` — Hashing rounds for credentials.

### Teacher Platform (`apps/teacher-platform/.env.local`)

- `NEXTAUTH_URL` — Base URL for NextAuth callbacks.
- `NEXTAUTH_SECRET` — Session signing secret.
- `NEXT_PUBLIC_LANDING_PAGE_URL` — Sign-in redirect target.
- `DATABASE_URL`, `DIRECT_URL` — Prisma connections (optional but recommended).

### Database (`packages/database/.env`)

- `DATABASE_URL` — Primary connection used at runtime.
- `DIRECT_URL` — Direct connection for migrations/seeding.
- Optional seed values like `DEV_USER_EMAIL`, `DEV_TEACHER_EMAIL`, etc.

## Content API Auth

Landing page content endpoints require an API key:

- Header: `x-efl-api-key`
- Value: `EFL_API_KEY` from landing page env

## Storage Mode (Teacher Platform)

- If `DATABASE_URL` is set and Prisma is available, the teacher platform uses
  database-backed storage.
- If not, it falls back to in-memory storage with seeded sample data.
