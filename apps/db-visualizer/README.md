# DB Visualizer

Read-only Next.js dashboard for exploring EFL database structure and cross-schema relationships. Data is **live**: each page is a Server Component that calls the app’s own `/api/*` routes (via `fetchFromApi`, `cache: 'no-store'`), which run Prisma or SQL against the configured database.

## Live-data surface matrix

| Surface | Page | API | Panel | Notes |
|--------|------|-----|-------|-------|
| Schema health | `(dashboard)/layout` (shell) | `/api/health` | `SchemaHealthPanel` | Per-schema probes |
| Landing logic | `(dashboard)/landing` | `/api/landing` | `LandingLogicPanel` | Pages, sections, content tree |
| Auth & mapping | `(dashboard)/auth` | `/api/auth` | `AuthMappingPanel` | Users + student/teacher mappings; Prisma has no `teachers.Teacher` model (called out in-panel) |
| Curriculum | `(dashboard)/curriculum` | `/api/curriculum` | `CurriculumExplorerPanel` | Tree-shaped; empty when no programs |
| Connectivity | `(dashboard)/connectivity` | `/api/connectivity` | `ConnectivityPanel` | Cross-schema links |
| Schema map | `(dashboard)/schema-map` | `/api/schema-graph` | `SchemaGraphCanvas` | Postgres `information_schema` metadata |

**Presentational-only (no fetch):** `RouteWarning`, `JsonCodeBlock`, `AppSidebarNav`.

Failures surface as `RouteWarning` when `fetchFromApi` throws (e.g. missing `DATABASE_URL` or API error).

### Schema map / API shows Postgres `53300` or “connection slots”

That is **connection exhaustion** on the server, not a broken schema-graph query. Use a **pooled** `DATABASE_URL` when your host provides one, set **`DATABASE_POOL_MAX`** to **`1`–`3`** in `packages/database/.env` (or per app) if you still see `53300`, stop extra local dev servers that share the same DB, and see `docs/operations.md`. `@repo/database` already uses a **smaller default pool in development** (2) than in production (10).

## Scaling (when data or UI grows)

- **Landing:** Paginate or lazy-load in `getLandingLogicData`; cap JSON or add `?limit=`.
- **Auth:** Paginate users in `/api/auth`; add search; keep `userId` inspect flow.
- **Curriculum:** Lazy-expand units or virtualize long lists.
- **Connectivity:** Filters or date bounds if match lists grow large.
- **Schema health:** Evolve checks in `health.ts` as schemas change.
- **Schema graph:** Improve composite-FK accuracy in SQL separately from the interactive map UI.

## UI system

Global design tokens live in `src/app/globals.css` (surfaces, accent, semantic success/danger/warn, radii, focus ring). Shared dashboard patterns (cards, callouts, forms) are in `src/components/layout/dashboardUi.module.css` and composed from feature modules. Each route uses `DashboardPageHeader` for a single page `<h1>`; the shell brand line is not a heading.

## Development

```bash
pnpm dev --filter=db-visualizer
```

Default port: **3004** (`next dev --port 3004`).

Build (from repo root):

```bash
pnpm exec turbo run build --filter=db-visualizer
```
