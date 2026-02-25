# Teacher Platform Storage

`src/lib/storage.ts` selects the storage engine:

- **DatabaseStorage** — Uses Prisma when `DATABASE_URL` is configured.
- **MemStorage** — In-memory fallback with seeded sample data.

## Seeding Behavior

- If Prisma is available, `seedInitialData()` runs to populate sample data.
- When no database is configured, `MemStorage` seeds mock users, students,
  lessons, curriculum, tasks, announcements, and materials in memory.
