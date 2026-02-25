# EFL Explorers Maticulus (In Depth)

The **maticulus** is the ecosystem matrix: a single place to see every
component, its responsibilities, data ownership, interfaces, and dependencies.
Use it as the navigation map when you are making changes or onboarding.

## Ecosystem Matrix

| Component | Purpose | Entry Points | Data Ownership | Interfaces | Dependencies |
| --- | --- | --- | --- | --- | --- |
| `apps/landing-page` | Marketing site + authentication hub. | `http://localhost:3000`, `/Auth/*`, `/platforms/*` | Auth users + shared content (pages/sections/content items). | Next.js pages, `/api/*` endpoints. | `@repo/database`, `@repo/ui`, NextAuth, Prisma. |
| `apps/teacher-platform` | Teacher dashboard and workflows. | `http://localhost:3001`, `/dashboard/*`, `/sso` | Teacher domain data (students, lessons, curriculum, materials, tasks, messages). | Next.js pages, `/api/*` endpoints, SSO. | `@repo/database`, `@shared/schema`, NextAuth. |
| `apps/students-platform` | Student experience (currently boilerplate). | `http://localhost:3002` | None yet (placeholder). | Next.js pages. | Base Next.js stack. |
| `packages/database` | Prisma schema + shared DB client. | `@repo/database` import. | Auth, shared content, teacher domain schemas. | Prisma client + typed exports. | PostgreSQL, Prisma. |
| `packages/ui` | Shared UI primitives. | `@repo/ui/*` imports. | None (UI only). | `Button`, `Card`, `Code`. | React. |
| `packages/eslint-config` | Shared lint rules. | ESLint config extends. | None. | N/A | ESLint. |
| `packages/typescript-config` | Shared TS config. | TS config extends. | None. | N/A | TypeScript. |

## Data Domains (Prisma)

- **auth** — Users, accounts, sessions, verification tokens, reset tokens, SSO tokens.
- **shared** — Marketing content: pages, page sections, content items, media, FAQs, team, testimonials.
- **teachers** — Teacher platform data: students, lessons, curriculum, events, messages, announcements, tasks, materials, bookmarks, lesson materials.
- **students** — Reserved for future student platform domain.

## Capability Matrix

| Capability | Owner | Data | Interfaces | Status |
| --- | --- | --- | --- | --- |
| Marketing pages | Landing page | `shared.*` | Page routes + `/api/page-content` | Active |
| Auth (credentials) | Landing page | `auth.*` | NextAuth credentials provider | Active |
| Password reset | Landing page | `auth.password_reset_tokens` | `/api/auth/forgot-password`, `/api/auth/reset-password` | Active |
| Teacher SSO | Landing page + Teacher platform | `auth.sso_tokens` | `/api/auth/sso-token`, `/sso`, NextAuth SSO provider | Active |
| Teacher data CRUD | Teacher platform | `teachers.*` | `/api/students`, `/api/lessons`, `/api/curriculum`, etc | Active |
| Student platform | Students platform | None yet | `/` only | Placeholder |

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

## Operational Notes

- Teacher platform auto-falls back to in-memory storage if `DATABASE_URL` is not configured.
- Prisma client is shared across apps via `@repo/database`.
- Turbo tasks expect `.env*` files and share environment variables listed in `turbo.json`.

## Environment & Secrets (Quick View)

- **Auth**: `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- **Database**: `DATABASE_URL`, `DIRECT_URL`
- **SSO URLs**: `NEXT_PUBLIC_TEACHER_URL`, `NEXT_PUBLIC_STUDENT_URL`, `NEXT_PUBLIC_LANDING_PAGE_URL`
- **API key**: `EFL_API_KEY` (for landing content endpoints)
