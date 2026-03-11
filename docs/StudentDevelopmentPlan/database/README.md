# Student Data Ownership

Defines how student platform features use existing schemas and where new student
domain models should be introduced.

## Shared Schema Strategy

- `auth` schema: identity, sessions, SSO tokens, and role flags.
- `shared` schema: reusable content sections and media metadata.
- `teachers` schema: teacher workflow data and source records authored by staff.
- `students` schema: student-centric tracking, progress, and outcomes.

## Ownership Rules

- Student platform is source of truth for `students` schema entities.
- Landing page remains source of truth for identity and auth in `auth`.
- Teacher platform remains source of truth for lesson/curriculum authoring in
  `teachers`.
- Shared marketing content remains source of truth in `shared`.

## Integration Principles

- Prefer relational links over denormalized text when joining teacher-authored
  lessons with student progress.
- Keep write boundaries strict; cross-schema writes require explicit service
  ownership and audit logging.
- Add migrations in small, reversible batches aligned to roadmap phases.

## Schema Anchor

- Current Prisma setup: `packages/database/prisma/schema.prisma`
- Current operations and env: `docs/operations.md`
- Student model extension proposal: `database/student-domain-model.md`
