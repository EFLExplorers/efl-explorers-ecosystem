# Curriculum Platform API

All API routes live in `apps/curriculum-platform/src/pages/api`.

## Auth Routes

- `POST /api/auth/register` - Invite-only registration (or bootstrap allowlist for first manager).
- `GET /api/auth/invites` - List invites (manager auth required).
- `POST /api/auth/invites` - Create/update invite (manager auth required).
- `POST /api/auth/[...nextauth]` - NextAuth credential sign-in endpoint.

## Authoring Routes

- `GET /api/programs`
- `POST /api/programs`
- `GET /api/programs/[id]`
- `PATCH /api/programs/[id]`
- `DELETE /api/programs/[id]` (soft-archive)
- `GET /api/levels?programId={id}`
- `POST /api/levels`
- `GET /api/units?levelId={id}`
- `POST /api/units`
- `PATCH /api/units/[id]`
- `DELETE /api/units/[id]` (soft-archive)

## Publish Routes

- `POST /api/publish/levels/[levelId]` - Creates immutable snapshot and marks it current.
- `GET /api/public/levels/[programSlug]/[levelSlug]` - Read current published snapshot for downstream platforms.
