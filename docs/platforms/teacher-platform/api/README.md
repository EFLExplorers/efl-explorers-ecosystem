# Teacher Platform API

All API routes live in `apps/teacher-platform/src/pages/api` and use the
storage layer in `src/lib/storage.ts`.

## Conventions

- Requests should be JSON with `Content-Type: application/json`.
- Date fields accept ISO strings (Zod also allows `Date` objects).
- Responses include model timestamps when present in the schema.

## Docs Index

- `core-resources.md` — Students, lessons, curriculum, events, materials, announcements.
- `tasks-bookmarks.md` — Task and bookmark endpoints.
- `messages.md` — Messaging endpoints.
- `lesson-materials.md` — Lesson-material linking.
- `examples.md` — Curl examples.
- `errors.md` — Status codes by endpoint.
