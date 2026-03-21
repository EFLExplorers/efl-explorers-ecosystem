# Curriculum Platform API

All API routes live in `apps/curriculum-platform/src/pages/api`.

## Auth Routes

- `POST /api/auth/register` - Invite-only registration (or bootstrap allowlist for first manager).
- `GET /api/auth/invites` - List invites (manager auth required).
- `POST /api/auth/invites` - Create/update invite (manager auth required).
- `GET|POST /api/auth/[...nextauth]` - NextAuth route handler (`src/app/api/auth/[...nextauth]/route.ts`); credentials validate `curriculum.managers` (`prisma.curriculumManager`).

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
- Unit create/update validates `assignmentConfig` contract.

## Publish Routes

- `POST /api/publish/levels/[levelId]` - Creates immutable snapshot and marks it current.
- `GET /api/public/levels/[programSlug]/[levelSlug]` - Read current published snapshot for downstream platforms.
- `GET /api/hooks/assignments/preview/[levelId]` - Preview normalized assignment/reporting hook payload before publish (manager auth required).

## Additional Docs

- `assignment-hooks.md` - Assignment/reporting hook contract and validation behavior.
