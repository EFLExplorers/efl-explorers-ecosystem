# Teacher Platform Database

## Schemas Used

- `teachers` — Primary data domain for the teacher platform.
- `auth` — Used indirectly via SSO (managed by the landing page).

## Docs Index

- `erd.md` — Entity relationships.
- `models.md` — Field list for the teachers schema.

Notes:
- `Task.user_id`, `Bookmark.user_id`, `Message.sender_id`, and `Message.receiver_id`
  are numeric identifiers used by the app; they are not foreign keys in this schema.

## Client

Prisma client is shared via `@repo/database`. When `DATABASE_URL` is not set,
the platform falls back to in-memory storage.
