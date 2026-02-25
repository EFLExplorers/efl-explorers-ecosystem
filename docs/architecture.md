# Architecture

## Monorepo Layout

- **Apps** live under `apps/` and are deployed independently.
- **Shared packages** live under `packages/` and are consumed by apps.
- **Turborepo** orchestrates build, dev, lint, and typecheck tasks.

## Applications

- `landing-page` — Marketing site + authentication hub (Next.js, port 3000).
- `teacher-platform` — Teacher dashboard (Next.js, port 3001).
- `students-platform` — Student platform (Next.js, port 3002).

## Shared Packages

- `@repo/database` — Prisma schema + shared DB client.
- `@repo/ui` — Shared UI primitives.
- `@repo/eslint-config` — Shared lint rules.
- `@repo/typescript-config` — Shared TS config presets.

## Data Access

### Prisma (Shared Client)
`packages/database` exports a shared Prisma client via `@repo/database` and
handles `.env` loading, PostgreSQL pool configuration, and optional Prisma
Accelerate URLs.

### Multi-Schema Layout
The database uses four schemas:

- `auth` — NextAuth users/accounts/sessions, password reset tokens, SSO tokens.
- `shared` — Marketing content: pages, sections, content items, media, FAQs.
- `teachers` — Teacher domain data: students, lessons, curriculum, etc.
- `students` — Reserved for student domain expansion.

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

Both the landing page and teacher platform use Next.js `pages/api` routes:

- Landing page focuses on auth and content delivery.
- Teacher platform exposes CRUD endpoints for teacher domain data and relies
  on Zod schemas from `apps/teacher-platform/shared/schema.ts`.

## Runtime + Routing

- All apps use the Next.js pages router.
- CSS modules are used for component styling.
