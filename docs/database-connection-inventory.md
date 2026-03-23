# Database connection inventory and optimization

This document lists **every class of process** in the monorepo that can open connections to Postgres (or to Prisma Accelerate, which then connects to Postgres). Use it to reason about **`53300` / “remaining connection slots…”** and to decide what to change first.

For general env semantics (`DATABASE_URL`, `DIRECT_URL`, pooling), see **[`operations.md`](./operations.md)** and **[`packages/database.md`](./packages/database.md)**.

---

## 1. What “one connection per platform” can and cannot mean

### Cannot: a single shared pool across all apps

Each **runtime** below is a **separate Node process** (local `next dev`) or a **separate serverless isolate** (Vercel function instance, etc.). There is **no** shared in-memory `pg.Pool` between them.

To share capacity across platforms you need an **external** layer:

- **PgBouncer / host pooler** on `DATABASE_URL` (many app TCP sessions → fewer Postgres sessions).
- **Prisma Accelerate** (`prisma://…` or **`prisma+postgres://…`** on `DATABASE_URL`) — app talks to Prisma; Prisma’s infrastructure pools toward your DB.

### Can: one pool per process

Inside each process that imports `@repo/database`, there is **at most one** Prisma Client and **at most one** `pg.Pool` (when not using Accelerate). See `packages/database/src/index.ts` (`globalForPrisma`).

**Rough upper bound on Postgres sessions** (direct or via pooler, depending on URL):

```text
Σ (each Node / worker process that uses @repo/database) × min(DATABASE_POOL_MAX, pool default)
+ one-off scripts (each script run is its own process)
+ Prisma CLI when you run migrate / db execute (separate process)
```

Serverless: **each concurrent invocation** may be a cold or warm isolate — treat **per-instance** `DATABASE_POOL_MAX` as multiplying by **parallel invocations** across all deployed projects.

---

## 2. Central client: `@repo/database`

| Item | Location | Behavior |
|------|----------|----------|
| Shared Prisma + optional `pg` pool | `packages/database/src/index.ts` | Chooses **Accelerate** (`DATABASE_URL` = `prisma://…` or `prisma+postgres://…`) **first**, else **Postgres `DATABASE_URL`**, else **`DIRECT_URL`**. One global client per process. |
| Env loading | Same file | Loads `packages/database/.env` when present (paths relative to `process.cwd()`). |
| Pool size | `DATABASE_POOL_MAX`, URL hints | See `index.ts`: prod/dev defaults, `pgbouncer=true`, `connection_limit=`. |

Any app or script that **`import { prisma } from "@repo/database"`** participates in this model **for that process**.

---

## 3. Runtime web applications (each dev server = one process)

All use **`import { prisma } from "@repo/database"`** (or `db.ts` re-export in teacher-platform). Each running **`pnpm dev`** (or production `next start` / serverless worker) holds **one** Prisma singleton and thus **one** bounded `pg` pool toward whatever `DATABASE_URL`/`DIRECT_URL` resolves to.

| App | Dev port | Primary DB touchpoints |
|-----|----------|-------------------------|
| **landing-page** | 3000 | Many **pages** (SSR/SSG with data) and **API routes** under `src/pages/api/**` — auth, content, SSO, registration, etc. |
| **teacher-platform** | 3001 | `src/lib/db.ts` → prisma; `src/auth.ts`; storage/types importing Prisma types. |
| **student-platform** | 3002 | API routes under `src/pages/api/student/**`; `requireStudentApiSession.ts`. |
| **curriculum-platform** | 3003 | API routes, dashboard pages, auth, public level APIs, etc. |
| **db-visualizer** | 3004 | **Server Components** and **Route Handlers** call modules in `src/server/queries/*` (see §4). |

**apps/docs** does **not** import `@repo/database` (no DB).

### Connection pattern notes

- **Concurrent HTTP requests** in the same process **share** the same pool (queries queue if all clients are busy).
- **Parallel work inside one request** (e.g. multiple `await prisma` without serializing) can **check out multiple pool clients at once** — cap is `DATABASE_POOL_MAX` for that process.
- **Landing** and **curriculum** pages historically use Prisma heavily on SSR; high traffic × many lambdas × pool max is a common production pressure point.

---

## 4. db-visualizer (detailed)

### Server query modules (`prisma` usage)

| Module | Role |
|--------|------|
| `src/server/queries/health.ts` | Schema health checks — five **`findFirst`** probes inside **one** **`prisma.$transaction`** (one backend session per layout load). |
| `src/server/queries/schema-graph.ts` | If **`DATABASE_URL`** is **Accelerate** (`prisma://…` or `prisma+postgres://…`), uses **`pg.Client`** + **`DIRECT_URL`** (three sequential queries, then `end()`). Otherwise three **`prisma.$queryRaw`** calls inside **one** **`$transaction`** (one session per schema-map request). |
| `src/server/queries/landing.ts` | Landing-related read models. |
| `src/server/queries/curriculum.ts` | Curriculum graph reads. |
| `src/server/queries/connectivity.ts` | Cross-app connectivity sample queries. |
| `src/server/queries/auth-mapping.ts` | Auth / mapping inspection. |

### API route handlers (thin wrappers over queries)

- `src/app/api/health/route.ts` → `getSchemaHealthData`
- `src/app/api/schema-graph/route.ts` → `getSchemaGraphData`
- `src/app/api/deployment-env/route.ts` → deployment env report + DB probe JSON (no secret values)
- `src/app/api/landing/route.ts` → landing query module
- `src/app/api/curriculum/route.ts` → curriculum query module
- `src/app/api/connectivity/route.ts` → connectivity module
- `src/app/api/auth/route.ts` → `getIdentityBridgeData` (`auth-mapping.ts`, uses prisma)

### App Router layout / pages

- `(dashboard)/layout.tsx` loads health **in-process** via `getSchemaHealthData` (no self-HTTP to `/api/health`). Shows an **env warning banner** when `getCriticalEnvIssues()` reports missing/invalid URL shapes (sync `process.env` only).
- **`/deployment`** (outside `(dashboard)`) — full deployment / env report page + DB `SELECT 1` probe (`src/app/deployment/`).
- Individual dashboard pages call query functions directly where refactored (e.g. schema map).

---

## 5. `packages/database` scripts (separate processes, own connections)

Each **invocation** is a **new Node process**. Several construct their **own** `Pool` + `PrismaClient` instead of reusing `@repo/database` exports.

| Script | Connection mechanism | Notes |
|--------|----------------------|--------|
| `scripts/apply-sql-migrations.js` | **`pg.Pool`** with **`max: 1`**. | Uses `DIRECT_URL ?? DATABASE_URL`. Single `client` checkout for the migration loop. |
| `scripts/seed-planetscale.js` | `new Pool` + `PrismaClient` + **PrismaPg** adapter | Full seed; separate from app pool. |
| `scripts/seed-dev-user.js` | Same pattern | One-off. |
| `scripts/seed-curriculum-manager.js` | Same pattern | One-off. |
| `scripts/approve-user.js` | Same pattern | One-off. |
| `scripts/import-content.js` | **`new PrismaClient()`** (no adapter) | Uses generated client default URL behavior — **not** aligned with `PrismaPg` pool in `src/index.ts`. **Candidate:** migrate to `@repo/database` or explicit adapter + `DATABASE_POOL_MAX=1`. |
| `scripts/seed-admin.ts` | **`import("../src/index")`** → shared **`prisma`** from `@repo/database` | Same env + pool rules as apps **for that script process**. |

**package.json hooks:** `db:seed` runs `prisma db seed` → typically `seed-planetscale.js` (check `package.json` `prisma.seed`).

---

## 6. Prisma CLI (developer / CI machines)

Commands such as:

- `pnpm --filter @repo/database exec prisma …`
- `prisma migrate`, `prisma db push`, `prisma generate` (generate does not connect)

run in a **separate process** from your apps. They read **`prisma.config.ts`** / schema datasource URL (currently prefers **`DIRECT_URL` || `DATABASE_URL`** for the datasource URL in config). Each migrate invocation opens **its own** DB sessions (provider-dependent).

**CI:** parallel jobs that each run migrate or seed multiply connections briefly.

---

## 7. Turbo / env passthrough

`turbo.json` includes `DATABASE_URL` and `DIRECT_URL` in `globalEnv` so tasks see the same vars. This does **not** merge pools; it only ensures **each task process** gets the vars.

---

## 8. Optimization playbook (priority order)

Use this as a checklist; stop when `53300` disappears and latency is acceptable.

1. **Runtime URL strategy**  
   - Put **pooler** or **Accelerate** on `DATABASE_URL` for all deployed apps.  
   - Keep **`DIRECT_URL`** as real `postgresql://…` for migrations and scripts.  
   - See `packages/database/src/index.ts` order: Accelerate → Postgres `DATABASE_URL` → `DIRECT_URL`.

2. **Cap per-instance pool**  
   - Set **`DATABASE_POOL_MAX=1`** (or `2`) in `packages/database/.env` and in **each** Vercel project (or shared env).  
   - Restart all local dev servers after changes.

3. **Reduce concurrent processes in dev**  
   - Do not run five `next dev` apps against one tiny Postgres tier unless necessary.

4. **Reduce parallel Prisma work per request**  
   - Prefer **sequential** `await` or **`$transaction`** where you batch reads (**db-visualizer** health + schema-graph Prisma path use **`$transaction`**).  
   - Audit **landing** / **curriculum** for `Promise.all` over many `prisma` calls.

5. **Scripts**  
   - **`apply-sql-migrations.js`:** uses `max: 1` on `Pool`.  
   - **`import-content.js`:** align with `@repo/database` or a single `max: 1` pool.  
   - Run seeds/migrations **off-peak** or **sequentially** in CI.

6. **Serverless**  
   - Assume **many** warm instances across **all** Vercel projects sharing one DB → **low** `DATABASE_POOL_MAX` + pooler/Accelerate is mandatory.

7. **Observability**  
   - On Postgres (as admin): `pg_stat_activity` / provider dashboard to see **which role** and **application_name** hold sessions.

---

## 9. File index: `@repo/database` imports (runtime)

The following apps import `prisma` (or Prisma types) from `@repo/database`. This is the **complete app list** for “anything that can hold a pool in production,” excluding `packages/database` itself and tests.

- **db-visualizer:** `src/server/queries/*.ts`
- **landing-page:** `src/pages/**`, `src/utils/**`, `src/pages/api/**` (many files — same single pool per running Next process)
- **teacher-platform:** `src/lib/db.ts`, `src/auth.ts`, `shared/schema.ts` (types)
- **student-platform:** `src/pages/api/**`, `src/lib/requireStudentApiSession.ts`
- **curriculum-platform:** `src/pages/**`, `src/lib/**`, `src/pages/api/**`

For an exact file list, run from repo root:

```bash
rg "from [\"']@repo/database[\"']" apps --glob "*.{ts,tsx}"
```

---

## 10. Future work (optional refactors)

| Idea | Benefit |
|------|---------|
| Unify **`import-content.js`** on `@repo/database` | One connection strategy; respect `DATABASE_POOL_MAX`. |
| Shared **read-only** role for db-visualizer in production | Blast radius; does not reduce connection *count* by itself. |
| **Prisma Accelerate** for all serverless runtimes | Moves multiplexing to Prisma; `DIRECT_URL` unchanged for CLI. |

---

*Last reviewed with codebase grep for `@repo/database`, `new PrismaClient`, `new Pool`. Update this doc when adding new apps, scripts, or DB entry points. Accelerate URL schemes: `prisma://` and `prisma+postgres://`.*
