# Student Data Ownership

Defines how student platform features use existing schemas and where new student
domain models should be introduced.

## Shared Schema Strategy

- `auth` schema: identity, sessions, SSO tokens, and role flags.
- `shared` schema: reusable content sections and media metadata.
- `curriculum` schema: canonical programs/levels/units and publish snapshots (owned by curriculum platform).
- `teachers` schema: teacher workflow data and staff-authored records tied to classroom operations.
- `students` schema: student-centric tracking, progress, and outcomes.

## Ownership Rules

- Student platform is source of truth for `students` schema entities.
- Landing page remains source of truth for identity and auth in `auth`.
- **Curriculum platform** is source of truth for **published EFL curriculum** in `curriculum.*` (programs, levels, units, snapshots). Other apps consume it via HTTP; they should not write `curriculum.*` directly.
- Teacher platform remains source of truth for **teacher workflow** data in `teachers.*` (students, lessons, teacher-local planning, materials)—distinct from canonical curriculum content.
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
