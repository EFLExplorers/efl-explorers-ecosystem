# EFL Explorers Maticulus (In Depth)

The **maticulus** is the ecosystem matrix: a single place to see every
component, its responsibilities, data ownership, interfaces, and dependencies.
Use it as the navigation map when you are making changes or onboarding.

## Ecosystem Matrix

| Component | Purpose | Entry Points | Data Ownership | Interfaces | Dependencies |
| --- | --- | --- | --- | --- | --- |
| `apps/landing-page` | Marketing site + authentication hub. | `http://localhost:3000`, `/Auth/*`, `/platforms/*` | Auth users + shared content (pages/sections/content items). | Next.js pages, `/api/*` endpoints. | `@repo/database`, `@repo/ui`, NextAuth, Prisma. |
| `apps/teacher-platform` | Teacher dashboard and workflows. | `http://localhost:3001`, `/dashboard/*`, `/sso` | Teacher domain data (students, lessons, teacher-side curriculum/planning, materials, tasks, messages). | Next.js pages, `/api/*` endpoints, SSO. | `@repo/database`, `@shared/schema`, NextAuth. |
| `apps/student-platform` | Student experience. | `http://localhost:3002` | Primarily `students.*` + reads via APIs. | Next.js pages, `/api/student/*`, SSO. | `@repo/database`, NextAuth. |
| `apps/curriculum-platform` | Canonical curriculum authoring + publish snapshots. | `http://localhost:3003`, `/dashboard/*` | `curriculum.*` (programs, levels, units, snapshots, managers). | Next.js pages + `/api/*`, NextAuth (managers). | `@repo/database`, NextAuth. |
| `apps/db-visualizer` | Internal DB inspection (read-only). | Configured deploy URL | None (read-only). | Next.js app router dashboards + `/api/*`. | `@repo/database`. |
| `packages/database` | Prisma schema + shared DB client. | `@repo/database` import. | Auth, shared, curriculum, teacher, student schemas (see Prisma). | Prisma client + typed exports. | PostgreSQL, Prisma. |
| `packages/ui` | Shared UI primitives. | `@repo/ui/*` imports. | None (UI only). | `Button`, `Card`, `Code`. | React. |
| `packages/eslint-config` | Shared lint rules. | ESLint config extends. | None. | N/A | ESLint. |
| `packages/typescript-config` | Shared TS config. | TS config extends. | None. | N/A | TypeScript. |

## Data Domains (Prisma)

- **auth** — Users, accounts, sessions, verification tokens, reset tokens, SSO tokens.
- **shared** — Marketing content: pages, page sections, content items, media, FAQs, team, testimonials.
- **curriculum** — Canonical curriculum: programs, levels, units, publish snapshots, curriculum managers/invites.
- **teachers** — Teacher platform data: students, lessons, teacher-side curriculum/planning, events, messages, announcements, tasks, materials, bookmarks, lesson materials.
- **students** — Student platform domain (progress, roster-facing usage, etc.).

## Capability Matrix

| Capability | Owner | Data | Interfaces | Status |
| --- | --- | --- | --- | --- |
| Marketing pages | Landing page | `shared.*` | Page routes + `/api/page-content` | Active |
| Auth (credentials) | Landing page | `auth.*` | NextAuth credentials provider | Active |
| Password reset | Landing page | `auth.password_reset_tokens` | `/api/auth/forgot-password`, `/api/auth/reset-password` | Active |
| Teacher SSO | Landing page + Teacher platform | `auth.sso_tokens` | `/api/auth/sso-token`, `/sso`, NextAuth SSO provider | Active |
| Teacher data CRUD | Teacher platform | `teachers.*` | `/api/students`, `/api/lessons`, `/api/curriculum`, etc | Active |
| Canonical curriculum | Curriculum platform | `curriculum.*` | Authoring `/api/programs`, publish `/api/publish/...`, public `GET /api/public/levels/...` | Active |
| Published curriculum (proxied) | Teacher / student platforms | N/A (HTTP to curriculum app) | e.g. `/api/curriculum/published/...`, `/api/student/curriculum/...` | Active when `CURRICULUM_PLATFORM_URL` set |
| Student APIs | Student platform | `students.*` (and proxies) | `/api/student/*` | In progress |

## Cross-App Flows

### Registration and Login (Landing Page)
1. User registers via `/api/auth/register`.
2. User logs in via NextAuth credentials.
3. Session includes `role` + `approved` flags.

### Teacher SSO (Landing ➜ Teacher Platform)
1. Logged-in teacher requests `/api/auth/sso-token` on landing page.
2. Token is stored in `auth.sso_tokens` with a short TTL.
3. User is redirected to `teacher-platform` `/sso?token=...`.
4. Teacher platform signs in using NextAuth SSO provider and invalidates the token.

### Content Delivery (Landing Page)
1. The landing page calls `/api/page-content?route=/...` and `/api/content?type=...`.
2. Requests must include `x-efl-api-key` matching `EFL_API_KEY`.
3. Data is sourced from the `shared` schema.

### Published curriculum (Curriculum ➜ Teacher / Student)
1. Managers publish a level in `curriculum-platform`; snapshot rows and `assignmentHooks` are written under `curriculum.*`.
2. Downstream apps call **their** authenticated APIs, which proxy to `GET {CURRICULUM_PLATFORM_URL}/api/public/levels/{programSlug}/{levelSlug}` (optional `x-curriculum-shared-secret`).
3. Classroom users never need direct access to the curriculum manager UI.

## Operational Notes

- Teacher platform auto-falls back to in-memory storage if `DATABASE_URL` is not configured.
- Prisma client is shared across apps via `@repo/database`.
- Turbo tasks expect `.env*` files and share environment variables listed in `turbo.json`.

## Environment & Secrets (Quick View)

- **Auth**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- **Database**: `DATABASE_URL`, `DIRECT_URL`
- **SSO URLs**: `NEXT_PUBLIC_TEACHER_URL`, `NEXT_PUBLIC_STUDENT_URL`, `NEXT_PUBLIC_LANDING_PAGE_URL`
- **API key**: `EFL_API_KEY` (for landing content endpoints)
- **Curriculum integration**: `CURRICULUM_PLATFORM_URL`, `CURRICULUM_API_SHARED_SECRET` (see `docs/operations.md`)
