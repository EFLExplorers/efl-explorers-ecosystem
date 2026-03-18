# Operations

## Local Setup (Quick)

1. Install dependencies:
   - `pnpm install`
2. Copy env templates:
   - `packages/database/.env.example` ➜ `packages/database/.env`
   - `apps/landing-page/.env.local.example` ➜ `apps/landing-page/.env.local`
   - `apps/teacher-platform/.env.local.example` ➜ `apps/teacher-platform/.env.local`
   - `apps/student-platform/.env.local.example` ➜ `apps/student-platform/.env.local`
3. Generate Prisma client:
   - `pnpm --filter @repo/database build`
4. Apply SQL migrations (non-destructive, tracked by filename/checksum):
   - `pnpm --filter @repo/database db:apply-sql-migrations`
5. Run apps:
   - `pnpm dev` (all apps)
   - `pnpm --filter landing-page dev`
   - `pnpm --filter teacher-platform dev`
   - `pnpm --filter student-platform dev`

## Environment Variables

### Shared (Turborepo)

These are referenced in `turbo.json` and flow to tasks:

- `AUTH_SECRET` (teacher-platform compatibility alias)
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_LANDING_PAGE_URL`
- `NEXT_PUBLIC_TEACHER_URL`
- `NEXT_PUBLIC_STUDENT_URL`
- `CURRICULUM_BOOTSTRAP_ALLOWLIST`
- `CURRICULUM_API_SHARED_SECRET`
- `CURRICULUM_PLATFORM_URL`
- `EFL_API_KEY`
- `BCRYPT_SALT_ROUNDS`

### Naming Conventions

- `NEXT_PUBLIC_*` values are browser-safe and can be exposed to client bundles.
- Unprefixed values are server-only and must never be exposed in client code.
- `NEXTAUTH_SECRET` is the canonical auth secret name across apps.
- `AUTH_SECRET` is accepted only as a teacher-platform alias for Auth.js v5 compatibility.

### Ecosystem Env Matrix

| Variable | Scope | Required In | Public |
|---|---|---|---|
| `DATABASE_URL` | DB runtime | landing, teacher, student, curriculum, database package | No |
| `DIRECT_URL` | DB migrations/seeding | landing, teacher, student, curriculum, database package | No |
| `NEXTAUTH_URL` | Auth callback base URL | landing, teacher, student, curriculum | No |
| `NEXTAUTH_SECRET` | Auth session signing | landing, teacher, student, curriculum | No |
| `AUTH_SECRET` | Teacher Auth.js alias | teacher (optional alias only) | No |
| `NEXT_PUBLIC_SITE_URL` | Landing canonical public URL | landing | Yes |
| `NEXT_PUBLIC_LANDING_PAGE_URL` | Cross-app sign-in redirect target | landing, teacher, student | Yes |
| `NEXT_PUBLIC_TEACHER_URL` | SSO target URL | landing | Yes |
| `NEXT_PUBLIC_STUDENT_URL` | SSO target URL | landing | Yes |
| `CURRICULUM_PLATFORM_URL` | Published curriculum API base | teacher, student | No |
| `CURRICULUM_API_SHARED_SECRET` | Curriculum API request auth | teacher, student, curriculum | No |
| `CURRICULUM_BOOTSTRAP_ALLOWLIST` | First-manager bootstrap policy | curriculum | No |
| `EFL_API_KEY` | Landing content API auth | landing | No |
| `BCRYPT_SALT_ROUNDS` | Password hash rounds | landing, database scripts (optional) | No |

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
- `NEXTAUTH_SECRET` — Session signing secret (preferred).
- `AUTH_SECRET` — Optional alias for `NEXTAUTH_SECRET`.
- `NEXT_PUBLIC_LANDING_PAGE_URL` — Sign-in redirect target.
- `DATABASE_URL`, `DIRECT_URL` — Prisma connections (optional but recommended).

### Student Platform (`apps/student-platform/.env.local`)

- `NEXTAUTH_URL` — Base URL for NextAuth callbacks.
- `NEXTAUTH_SECRET` — Session signing secret.
- `NEXT_PUBLIC_LANDING_PAGE_URL` — Sign-in redirect target.
- `DATABASE_URL`, `DIRECT_URL` — Prisma connections.
- `CURRICULUM_PLATFORM_URL` — Upstream curriculum API base URL.
- `CURRICULUM_API_SHARED_SECRET` — Optional shared secret for curriculum API calls.

### Curriculum Platform (`apps/curriculum-platform/.env.local`)

- `NEXTAUTH_URL` — Base URL for NextAuth callbacks.
- `NEXTAUTH_SECRET` — Session signing secret.
- `DATABASE_URL`, `DIRECT_URL` — Prisma connections.
- `CURRICULUM_BOOTSTRAP_ALLOWLIST` — Comma-separated emails allowed to bootstrap the first manager.
- `CURRICULUM_API_SHARED_SECRET` — Optional shared secret required by `/api/public/*` when set.

### Database (`packages/database/.env`)

- `DATABASE_URL` — Primary connection used at runtime.
- `DIRECT_URL` — Direct connection for migrations/seeding.
- Optional seed values like `DEV_USER_EMAIL`, `DEV_TEACHER_EMAIL`, etc.

## Content API Auth

Landing page content endpoints require an API key:

- Header: `x-efl-api-key`
- Value: `EFL_API_KEY` from landing page env

## Storage Mode (Teacher Platform)

- Teacher platform is database-backed only and requires valid `DATABASE_URL`
  (and `DIRECT_URL` for migrations/seeding flows).

## Vercel Deployment Notes

- Set environment variables per Vercel project (`landing-page`, `teacher-platform`, `student-platform`, `curriculum-platform`), not only at monorepo level.
- `DATABASE_URL` and `DIRECT_URL` should be present for all DB-backed apps: landing, teacher, student, and curriculum.
- `CURRICULUM_API_SHARED_SECRET` must match across curriculum, teacher, and student when curriculum API protection is enabled.
