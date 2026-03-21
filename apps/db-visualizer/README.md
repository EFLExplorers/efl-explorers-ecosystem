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

## Scaling (when data or UI grows)

- **Landing:** Paginate or lazy-load in `getLandingLogicData`; cap JSON or add `?limit=`.
- **Auth:** Paginate users in `/api/auth`; add search; keep `userId` inspect flow.
- **Curriculum:** Lazy-expand units or virtualize long lists.
- **Connectivity:** Filters or date bounds if match lists grow large.
- **Schema health:** Evolve checks in `health.ts` as schemas change.
- **Schema graph:** Improve composite-FK accuracy in SQL separately from the interactive map UI.

## Development

```bash
pnpm dev --filter=db-visualizer
```

Default port: **3004** (`next dev --port 3004`).

Build (from repo root):

```bash
pnpm exec turbo run build --filter=db-visualizer
```
