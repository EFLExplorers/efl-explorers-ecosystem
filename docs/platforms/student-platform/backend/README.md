# Student Platform Backend

Student platform backend supports SSO-based sessions and authenticated data access.

## Key Files

- `apps/student-platform/src/pages/api/auth/[...nextauth].ts` — SSO token validation.
- `apps/student-platform/src/pages/sso.tsx` — SSO receiver route.
- `apps/student-platform/src/lib/requireStudentApiSession.ts` — Auth + identity mapping.
- `apps/student-platform/src/pages/api/student/*` — Authenticated API routes.

## Identity Mapping

Student sessions map authenticated UUIDs to numeric student record IDs via:

- `students.student_user_mappings` (Prisma: `StudentUserMapping`)
