# Architecture

**Current schema and models:** treat [`packages/database/prisma/schema.prisma`](../packages/database/prisma/schema.prisma) as the source of truth. For operating the internal **DB Visualizer** (read-only inspection across schemas), see [`docs/db-visualizer/scaling-and-operating-model.md`](db-visualizer/scaling-and-operating-model.md).

## Monorepo Layout

- **Apps** live under `apps/` and are deployed independently.
- **Shared packages** live under `packages/` and are consumed by apps.
- **Turborepo** orchestrates build, dev, lint, and typecheck tasks.

## Applications

- `landing-page` — Marketing site + authentication hub (Next.js, port 3000).
- `teacher-platform` — Teacher dashboard (Next.js, port 3001).
- `student-platform` — Student experience (Next.js, port 3002).
- `curriculum-platform` — Invite-only **canonical curriculum** authoring and **publish snapshots** for shared EFL content; consumed by teacher/student apps over HTTP (Next.js, port 3003). See [`docs/platforms/curriculum-platform/README.md`](platforms/curriculum-platform/README.md).
- `db-visualizer` — Internal read-only multi-schema inspection (Next.js). See [`docs/db-visualizer/scaling-and-operating-model.md`](db-visualizer/scaling-and-operating-model.md).

## Shared Packages

- `@repo/database` — Prisma schema + shared DB client.
- `@repo/ui` — Shared UI primitives.
- `@repo/eslint-config` — Shared lint rules.
- `@repo/typescript-config` — Shared TS config presets.

## Data Access

### Prisma (Shared Client)
`packages/database` exports a shared Prisma client via `@repo/database` and
handles `.env` loading, PostgreSQL pool configuration, and optional Prisma
Accelerate URLs (`prisma://…` or `prisma+postgres://…` on `DATABASE_URL`; `DIRECT_URL` stays Postgres for CLI and direct introspection).

### Multi-Schema Layout
PostgreSQL uses multiple schemas (full list in Prisma). Primary domains:

- `auth` — NextAuth users/accounts/sessions, password reset tokens, SSO tokens.
- `shared` — Marketing content: pages, sections, content items, media, FAQs.
- `curriculum` — **Canonical published curriculum**: programs, levels, units, publish snapshots, curriculum managers/invites. Separate from teacher-local records under `teachers.*`.
- `teachers` — Teacher workflow data: students, lessons, teacher-side curriculum/planning, events, messages, etc.
- `students` — Student domain (progress, roster-facing data, etc.).

## Auth + SSO

### Landing Page (Credentials)
- NextAuth credentials provider validates against `auth.users`.
- Approved teachers are enforced via `approved` flag.
- Session callbacks expose `role`, `approved`, `firstName`, `lastName`.

### Teacher Platform (SSO)
- Landing page issues a short-lived SSO token (`/api/auth/sso-token`).
- Teacher platform uses a NextAuth credentials provider (`id: "sso"`) to
  validate the token and mark it used.
- Middleware protects all routes except `/sso`, `/api`, and static assets.

## API Strategy

Apps expose HTTP APIs mainly via Next.js `pages/api` routes:

- Landing page focuses on auth and content delivery.
- Teacher platform exposes CRUD for teacher domain data (Zod in `apps/teacher-platform/shared/schema.ts`) and can **proxy** published curriculum from `curriculum-platform` when configured (e.g. `GET /api/curriculum/published/[programSlug]/[levelSlug]` with `CURRICULUM_PLATFORM_URL`).
- Curriculum platform owns authoring/publish APIs and the **public** snapshot reader (`GET /api/public/levels/[programSlug]/[levelSlug]`, optional shared-secret header).

## Runtime + Routing

- Most surfaces use the Next.js **pages** router; some apps also use the **app** router for specific handlers (e.g. NextAuth in `curriculum-platform`).
- CSS modules are used for component styling.
