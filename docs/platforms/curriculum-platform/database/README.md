# Curriculum Platform Database

Curriculum Platform data is stored in the `curriculum` schema.

## Core Tables

- `curriculum.managers`
- `curriculum.invites`
- `curriculum.programs`
- `curriculum.levels`
- `curriculum.units`
- `curriculum.publish_snapshots`
- `curriculum.publish_snapshot_units`

## Migration

- SQL migration file: `packages/database/db/20260318_add_curriculum_platform_schema.sql`
- Apply with: `pnpm --filter @repo/database db:apply-sql-migrations`
