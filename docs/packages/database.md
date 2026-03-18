# Database Package

## Purpose

`@repo/database` provides the shared Prisma schema and a reusable Prisma client
for all apps in the monorepo.

## Exports

- `prisma` — Shared Prisma client.
- Prisma model types (re-exported from `@prisma/client`).

## Prisma Configuration

The schema uses PostgreSQL with multiple schemas:

- `auth` — Identity + sessions
- `shared` — Marketing content
- `teachers` — Teacher platform domain
- `students` — Reserved for student domain

## Key Models

### Auth (`auth.*`)

- `User`, `Account`, `Session`, `VerificationToken`
- `PasswordResetToken` — Reset flow support
- `SsoToken` — Short-lived SSO tokens for platform logins

### Shared Content (`shared.*`)

- `Page`, `PageSection`, `ContentItem`, `RouteSection`
- `MediaAsset`, `Faq`, `TeamMember`, `AboutStat`
- `CoreValue`, `LessonModule`, `TeacherBenefit`, `Testimonial`

### Teacher Domain (`teachers.*`)

- `Student`, `Lesson`, `Curriculum`, `Event`
- `Message`, `Announcement`, `Task`
- `Material`, `Bookmark`, `LessonMaterial`
- `TeacherUserMapping` — maps authenticated UUID users to numeric teacher record IDs

### Student Domain (`students.*`)

- `StudentUserMapping` — maps authenticated UUID users to numeric student record IDs

## Runtime Behavior

`packages/database/src/index.ts`:

- Loads `.env` from `packages/database/.env` if present.
- Chooses connection via `DIRECT_URL`, `DATABASE_URL`, or Prisma Accelerate URL.
- Reuses a shared PostgreSQL pool in development.

## Scripts

- `pnpm --filter @repo/database build` — `prisma generate`
- `pnpm --filter @repo/database db:apply-sql-migrations` — Apply tracked SQL migrations from `db/`
- `pnpm --filter @repo/database db:seed` — Run Prisma seed.
- `pnpm --filter @repo/database seed:dev-user` — Create dev user (script).

## SQL Assets

The `db/` folder contains helpers for bootstrapping or resetting data and
importing content (schema + content seeds).
For incremental manual rollout, `db/20260317_add_teacher_user_mappings.sql`
adds the teacher identity mapping table without requiring a full database reset.
For student identity mapping, use `db/20260317_add_student_user_mappings.sql`.
