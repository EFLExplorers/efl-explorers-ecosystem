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
   - Or: `pnpm --filter @repo/database exec prisma generate` (use this if you do not want a full package build; the Prisma CLI is **not** on your global `PATH` unless you install it globally).
4. Apply SQL migrations (non-destructive, tracked by filename/checksum):
   - `pnpm --filter @repo/database db:apply-sql-migrations`
5. Copy env for curriculum (if you use it):
   - `apps/curriculum-platform/.env.local.example` ➜ `apps/curriculum-platform/.env.local`
6. Run apps:
   - `pnpm dev` (all apps)
   - `pnpm --filter landing-page dev`
   - `pnpm --filter teacher-platform dev`
   - `pnpm --filter student-platform dev`
   - `pnpm --filter curriculum-platform dev` (port **3003**)

## PostgreSQL, Prisma, and hosted DB (definite behavior)

These points are the source of truth for how this repo expects the database to work locally, on Vercel, and on **PlanetScale Postgres** (or any other Postgres provider).

### Engine and schema

- The database is **PostgreSQL** with **multiple schemas** (`auth`, `curriculum`, `teachers`, etc.). Table DDL lives in dated files under `packages/database/db/*.sql`; the Prisma model layer is `packages/database/prisma/schema.prisma`.
- **Classic PlanetScale (MySQL / Vitess)** is **not** compatible with this codebase as-is. **PlanetScale Postgres** (`*.pg.psdb.cloud`) **is** compatible: use standard `postgresql://` URLs.

### How `DATABASE_URL` and `DIRECT_URL` are used

| Variable | Typical use | Notes |
|----------|-------------|--------|
| **`DATABASE_URL`** | Runtime in apps and `@repo/database` | If the value starts with **`prisma://`** or **`prisma+postgres://`**, Prisma Client is created with **`accelerateUrl`** (Prisma Accelerate). If it is **`postgres://`** or **`postgresql://`**, the client uses the **`pg`** driver via **`PrismaPg`** (`packages/database/src/index.ts`). **Do not** put Accelerate URLs in `DIRECT_URL`. |
| **`DIRECT_URL`** | Migrations, `db:apply-sql-migrations`, Prisma CLI against Postgres, db-visualizer **schema map** when `DATABASE_URL` is Accelerate | Must be a **real Postgres** URL (`postgresql://…` / `postgres://…`) — e.g. **PlanetScale Postgres** direct. Not an Accelerate string. If the provider gives **direct** and **pooler** URLs, put **direct** here; use **pooler or Accelerate** on `DATABASE_URL` for serverless runtime. |

For local Docker or a single Postgres instance, **`DATABASE_URL`** and **`DIRECT_URL`** are commonly **identical**.

For a **full inventory** of processes and scripts that open DB connections (and an optimization checklist), see **[`database-connection-inventory.md`](./database-connection-inventory.md)**.

### PostgreSQL connection limits (error `53300`, “remaining connection slots…”)

If APIs return **500** with Postgres **`53300`** or text like **“remaining connection slots are reserved for roles with the SUPERUSER attribute”**, the database has hit **`max_connections`** for normal roles. This is common when:

- Many **serverless** workers each open a **`pg` pool** (defaults: **2** per process in development, **10** in production unless **`DATABASE_POOL_MAX`** is set), or
- Several apps share one small Postgres tier, or
- **`DATABASE_URL`** points at the **direct** port instead of the host’s **pooler**.

**Mitigations (use one or more):**

1. Switch runtime **`DATABASE_URL`** to the provider’s **pooled** / transaction-pooler URL (keep **`DIRECT_URL`** on a direct URL for migrations).
2. Set **`DATABASE_POOL_MAX`** (read by `@repo/database` when using the `pg` adapter) to a **small** integer **per running Node process** — often **`1`–`5`** on Vercel/serverless alongside a pooler. If the pooler allows only **two** client connections total, use **`DATABASE_POOL_MAX=1`** and run at most **two** app processes against that URL (or one process with **`2`** and nothing else). When unset, the client also tightens the default if the runtime URL includes **`pgbouncer=true`** or **`connection_limit=N`**.
3. **db-visualizer** batches introspection and health checks: schema map uses **`$transaction`** for three `information_schema` queries (one session per request when using Prisma + Postgres); health uses **`$transaction`** for five probes. This reduces per-request connection churn but does not replace pooler/Accelerate for many concurrent Lambdas.
4. Upgrade the database plan or raise **`max_connections`** only if the provider allows it (still prefer pooling for serverless).

### SQL migrations (not Prisma Migrate folders)

- Schema changes ship as **ordered SQL files** in `packages/database/db/` (e.g. `20260318_*.sql`).
- Apply them with: `pnpm --filter @repo/database db:apply-sql-migrations` (uses `DIRECT_URL` or `DATABASE_URL`).
- Tracked in the DB in `public.manual_sql_migrations` (filename + checksum). **Production** should run the same script against the same migration set as `main` before or when you promote a release.

### Prisma Client generation

- `pnpm --filter @repo/database build` runs **`prisma generate`**. Turbo builds **`@repo/database`** before dependent apps, so deployed apps should ship a client generated from the **same commit** as the SQL migrations you applied.
- **Do not** run bare `prisma` in a shell unless Prisma is installed globally; prefer **`pnpm --filter @repo/database exec prisma <command>`** (e.g. `validate`, `generate`, `db pull`).

### Introspection (`db pull`) caution

- **`pnpm --filter @repo/database exec prisma db pull`** rewrites **`packages/database/prisma/schema.prisma`** from the live database. Review **`git diff`** before committing; use **`validate`** + **`generate`** after intentional schema edits.

### Production URL smoke (optional)

- From repo root, set **`SMOKE_*_URL`** env vars to deployed origins and run **`pnpm smoke:prod`** (see **`scripts/production-smoke.mjs`**). This checks **`GET /`** per host only; it does not read Vercel secrets.

### TLS query params (`sslrootcert=system`)

- Providers sometimes append **`sslmode=verify-full`** and **`sslrootcert=system`** (libpq-style). **node-pg** does not treat `system` like libpq; `@repo/database` **strips** SSL file query params when the value is `system` so the pool does not try to open a file named `system` (`sanitizePostgresConnectionString` in `packages/database/src/index.ts`).
- If TLS verification still fails in your environment, fix it with your provider’s **Node/pg** guidance (e.g. explicit CA bundle), not by pasting secrets into chat.

### Prisma seed name (`seed-planetscale.js`)

- The Prisma **`db seed`** entry in `packages/database/package.json` runs **`scripts/seed-planetscale.js`**. Despite the filename, that script **requires a Postgres** connection string; it seeds **content** via SQL parsing + Prisma. It is **not** MySQL PlanetScale classic.

### Sharing connection strings (e.g. with teammates or tools)

- Never commit real passwords or API keys. Share **redacted** URLs (placeholders for user/password) plus **metadata**: provider name, region, `sslmode`, whether you use **direct vs pooler**, and which env var holds which URL.

### Production / preview checklist

1. Set **`DATABASE_URL`** and **`DIRECT_URL`** on every DB-backed Vercel project (and in CI) per the table above.
2. Run **`db:apply-sql-migrations`** against the target database when `db/*.sql` changes (production with an approval gate; previews against a branch DB if you use one).
3. Deploy apps from a build that includes an up-to-date **`prisma generate`** for that commit.
4. Optional but recommended: pin **`prisma`** / **`@prisma/client`** in `packages/database/package.json` instead of **`"latest"`** for reproducible builds.

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
| `DATABASE_URL` | DB runtime | landing, teacher, student, curriculum, **db-visualizer** (read-only role), database package | No |
| `DIRECT_URL` | DB migrations/seeding | landing, teacher, student, curriculum, db-visualizer (optional; often same as `DATABASE_URL`), database package | No |
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
- See **[PostgreSQL, Prisma, and hosted DB (definite behavior)](#postgresql-prisma-and-hosted-db-definite-behavior)** and `packages/database/.env.example` for PlanetScale Postgres / Accelerate patterns.

### DB Visualizer (`apps/db-visualizer/.env.local`)

- `DATABASE_URL` — Read-only Postgres URL for internal inspection UI and `/api/*` routes.
- `DIRECT_URL` — Optional; often set equal to `DATABASE_URL` when not using separate direct/pooler split.
- No NextAuth or curriculum secrets required for baseline deploy. See `apps/db-visualizer/.env.local.example` and [`docs/db-visualizer/scaling-and-operating-model.md`](db-visualizer/scaling-and-operating-model.md).

## Content API Auth

Landing page content endpoints require an API key:

- Header: `x-efl-api-key`
- Value: `EFL_API_KEY` from landing page env

## Storage Mode (Teacher Platform)

- Teacher platform is database-backed only and requires valid `DATABASE_URL`
  (and `DIRECT_URL` for migrations/seeding flows).

## Vercel Deployment Notes

- Set environment variables per Vercel project (`landing-page`, `teacher-platform`, `student-platform`, `curriculum-platform`, `db-visualizer`), not only at monorepo level.
- **`db-visualizer`:** use a **read-only** Postgres role for `DATABASE_URL` / `DIRECT_URL` in Production and Preview. See `apps/db-visualizer/.env.local.example` and [`docs/db-visualizer/scaling-and-operating-model.md`](db-visualizer/scaling-and-operating-model.md).
- **Shared env vars (optional):** On Vercel Teams **Pro** or **Enterprise**, you can define [shared environment variables](https://vercel.com/docs/concepts/projects/environment-variables/shared-environment-variables) once and link them to multiple projects (e.g. the same `DATABASE_URL`, `DIRECT_URL`, or `CURRICULUM_API_SHARED_SECRET`). Updates propagate to every linked project. Project-level variables with the **same key** and **same environment** (Production / Preview / Development) **override** shared values—use that for app-specific secrets like `NEXTAUTH_SECRET` or `NEXTAUTH_URL`.
- `DATABASE_URL` and `DIRECT_URL` should be present for all DB-backed apps: landing, teacher, student, and curriculum. For **PlanetScale Postgres**, use the connection strings from the PlanetScale dashboard: typically **direct** for `DIRECT_URL` and, if offered, a **pooler** URL for serverless `DATABASE_URL` (see [PostgreSQL, Prisma, and hosted DB](#postgresql-prisma-and-hosted-db-definite-behavior) above).
- **Rotating connection strings:** After you change `DATABASE_URL` or `DIRECT_URL` in Vercel, trigger a **new deployment** (Redeploy, or push any commit) so serverless instances load the updated env; do not assume every running invocation refreshes immediately.
- **URL encoding:** In `postgresql://user:password@host/...`, the user and password must be **percent-encoded** if they contain reserved characters (`@`, `#`, `/`, `:`, space, etc.). Dashboard “connect” forms often warn about this; a single unencoded character produces authentication failures that look like a “bad connection string.”
- **Curriculum app auth base URL:** `NEXTAUTH_URL` must be the deployment **origin only** (`https://…` with no path — not `/login`).
- `CURRICULUM_API_SHARED_SECRET` must match across curriculum, teacher, and student when curriculum API protection is enabled.
