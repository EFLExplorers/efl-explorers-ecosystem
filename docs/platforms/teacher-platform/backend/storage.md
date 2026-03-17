# Teacher Platform Storage

`src/lib/storage.ts` uses a single storage engine:

- **DatabaseStorage** — Uses Prisma for all reads/writes.

## Seeding Behavior

- `seedInitialData()` runs against the database to bootstrap sample teacher
  domain records where tables are empty.
- There is no in-memory runtime fallback in the teacher platform.

## Operational Requirement

- `DATABASE_URL` is required for teacher-platform runtime.
- `DIRECT_URL` is recommended for migration/seed workflows.
