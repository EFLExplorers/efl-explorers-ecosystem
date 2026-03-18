# Teacher Platform Fallback and Mock Data Policy

## Policy

- Teacher platform runtime is database-only.
- No implicit fallback to in-memory storage is allowed.
- Mock data is allowed only through explicit seed/migration workflows.

## Runtime Rules

- Missing or invalid database configuration should fail fast.
- API and UI behavior must reflect real database state.
- Runtime mode switching based on partial env state is not permitted.

## Allowed Non-Production Data Paths

- SQL migrations in `packages/database/db/` applied via:
  `pnpm --filter @repo/database db:apply-sql-migrations`
- Seed scripts in `packages/database/scripts/` executed intentionally by
  developers/CI.

## Prohibited Patterns

- Auto-fallback to `MemStorage` when Prisma/database is unavailable.
- Hardcoded runtime user assumptions for ownership (`userId = 1`) in API calls.
- Client-provided ownership fields being trusted for writes.

## Optional Demo Mode Guidance

If a future demo mode is needed, it must be explicit and isolated:

- gated behind a dedicated flag (for example `TEACHER_PLATFORM_DEMO_MODE=true`)
- clearly surfaced in UI (banner/badge)
- never active by default
- never enabled in staging/production

## Tracked Runtime Exceptions

Non-curriculum runtime exceptions and migration guidance are tracked in:

- `non-curriculum-data-integrity-audit.md`
