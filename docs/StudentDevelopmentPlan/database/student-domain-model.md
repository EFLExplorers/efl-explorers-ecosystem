# Student Domain Model Proposal

Proposes the first `students` schema model set for student-centric product
features while preserving existing ownership in `auth`, `shared`, and
`teachers`.

## Design Goals

- Represent student progress and assignment outcomes as first-class records.
- Link to teacher-authored instructional content without ownership conflicts.
- Support timeline and dashboard aggregations efficiently.
- Keep migrations incremental and low-risk.

## Proposed Models (Students Schema)

- `StudentProfile`
  - `id` (uuid)
  - `userId` (uuid, unique, links to `auth.users.id`)
  - `displayName`
  - `avatarUrl`
  - `preferredLanguage`
  - `createdAt`, `updatedAt`
- `StudentEnrollment`
  - `id` (uuid)
  - `studentProfileId` (uuid)
  - `teacherStudentId` (int, optional link to `teachers.students.id`)
  - `status` (`active|paused|archived`)
  - `startedAt`, `endedAt?`
- `StudentAssignment`
  - `id` (uuid)
  - `studentProfileId` (uuid)
  - `lessonId` (int, links to `teachers.lessons.id`)
  - `title`
  - `status` (`assigned|in_progress|submitted|completed`)
  - `dueAt?`, `completedAt?`
  - `createdAt`, `updatedAt`
- `StudentProgressSnapshot`
  - `id` (uuid)
  - `studentProfileId` (uuid)
  - `unitKey`
  - `skillKey`
  - `score` (decimal)
  - `masteryLevel` (string)
  - `recordedAt`
- `StudentActivityLog`
  - `id` (uuid)
  - `studentProfileId` (uuid)
  - `activityType`
  - `metadata` (json)
  - `createdAt`

## Cross-Schema Relations

- `auth.users` -> `students.StudentProfile` by `userId`.
- `teachers.lessons` -> `students.StudentAssignment` by `lessonId` (read-linked).
- `teachers.students` optional compatibility link for transition period.

## Indexing Guidance

- `StudentAssignment(studentProfileId, status, dueAt)`
- `StudentProgressSnapshot(studentProfileId, unitKey, recordedAt desc)`
- `StudentActivityLog(studentProfileId, createdAt desc)`
- Unique index on `StudentProfile.userId`

## Migration Sequence

1. Add `StudentProfile` + `StudentEnrollment`.
2. Add assignment and progress models.
3. Backfill mappings from existing auth/teacher records.
4. Add activity logging model and operational indexes.

## Query Patterns

- Dashboard:
  - assignment counts by status
  - latest `StudentProgressSnapshot` per unit
- Progress page:
  - time-series snapshots grouped by skill
- Assignment page:
  - status-filtered rows with deterministic pagination

## Data Integrity Rules

- All student-owned writes must include resolved `studentProfileId`.
- Lesson linkage must verify lesson existence before assignment creation.
- Assignment completion timestamp must be set atomically with status update.

## References

- `packages/database/prisma/schema.prisma`
- `docs/architecture.md`
- `docs/StudentDevelopmentPlan/database/README.md`
