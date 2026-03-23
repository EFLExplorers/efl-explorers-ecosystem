# EFL Explorers Ecosystem

Monorepo for the EFL Explorers apps:

- `apps/landing-page` (Next.js)
- `apps/teacher-platform` (Next.js)
- `apps/student-platform` (Next.js)
- `apps/curriculum-platform` (Next.js)
- `apps/db-visualizer` (Next.js)
- `packages/database` (Prisma schema + client)

## Documentation

Start with the ecosystem docs index:

- `docs/README.md`

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
cp apps/student-platform/.env.local.example apps/student-platform/.env.local
cp apps/curriculum-platform/.env.local.example apps/curriculum-platform/.env.local
cp apps/db-visualizer/.env.local.example apps/db-visualizer/.env.local
```

Use the **same** `DATABASE_URL` / `DIRECT_URL` across apps for one shared Postgres (see **`docs/operations.md`** → *Cross-app DB parity*). For **db-visualizer** in production, prefer **read-only** credentials.

### Required values

At minimum, configure these before running Prisma/app auth flows:

- `DATABASE_URL`
- `DIRECT_URL` — real **`postgresql://…`**; must match `DATABASE_URL` when not using Accelerate, or stay on Postgres when **`DATABASE_URL`** is **`prisma://…`** / **`prisma+postgres://…`**
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_LANDING_PAGE_URL`
- `NEXT_PUBLIC_TEACHER_URL`
- `NEXT_PUBLIC_STUDENT_URL`

Teacher platform also accepts `AUTH_SECRET` as a compatibility alias, but `NEXTAUTH_SECRET` is the canonical variable used across the ecosystem.

## 3) Prisma setup

This repo uses Prisma from `packages/database`. Use **`pnpm --filter @repo/database exec prisma …`** (the `prisma` CLI is not assumed to be global).

From the **repo root**, shortcuts:

```bash
pnpm db:validate
pnpm db:generate
pnpm db:apply-sql-migrations
```

Generate Prisma client (same as `pnpm db:generate`):

```bash
pnpm --filter @repo/database build
# or
pnpm --filter @repo/database exec prisma generate
```

Schema and migrations (after DB is reachable — see **`docs/operations.md`** for SQL migration workflow and hosted DB behavior):

```bash
pnpm db:validate
# Introspection (rewrites schema — review git diff):
# pnpm --filter @repo/database exec prisma db pull
```

Optional production smoke (set `SMOKE_*_URL` env vars to deployed origins):

```bash
pnpm smoke:prod
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
pnpm --filter teacher-platform dev
```
