# EFL Explorers Ecosystem

Monorepo for the EFL Explorers apps:

- `apps/landing-page` (Next.js)
- `apps/teacher-platform` (Next.js)
- `packages/database` (Prisma schema + client)

## Prerequisites

- Node.js `>=18`
- `pnpm` (repo expects `pnpm@9`)
- PostgreSQL (local or hosted)

## 1) Install dependencies

From the repository root:

```bash
pnpm install
```

## 2) Set up environment files

Copy the templates and fill in real values:

```bash
cp packages/database/.env.example packages/database/.env
cp apps/landing-page/.env.local.example apps/landing-page/.env.local
cp apps/teacher-platform/.env.local.example apps/teacher-platform/.env.local
```

### Required values

At minimum, configure these before running Prisma/app auth flows:

- `DATABASE_URL`
- `DIRECT_URL` (can match `DATABASE_URL`)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_LANDING_PAGE_URL`
- `NEXT_PUBLIC_TEACHER_URL`
- `NEXT_PUBLIC_STUDENT_URL`

## 3) Prisma setup

This repo uses Prisma from `packages/database`.

Generate Prisma client:

```bash
pnpm --filter @repo/database build
```

Create/apply migrations (after DB is reachable):

```bash
pnpm --filter @repo/database exec prisma migrate dev
```

Optional seed commands:

```bash
pnpm --filter @repo/database db:seed
pnpm --filter @repo/database seed:dev-user
```

## 4) Run apps

Run everything with Turborepo:

```bash
pnpm dev
```

Or run a single app:

```bash
pnpm --filter landing-page dev
pnpm --filter teachers-platform dev
```
