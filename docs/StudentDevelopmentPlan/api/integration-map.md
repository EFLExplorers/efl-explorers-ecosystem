# Student API Integration Map

Defines how the student platform API layer integrates with landing and teacher
platform capabilities while preserving clear ownership boundaries.

## Endpoint Ownership Matrix

| Endpoint or Capability | Owner | Consumer | Schema Touchpoint | Notes |
| --- | --- | --- | --- | --- |
| `POST /api/auth/sso-token` | landing-page | student-platform | `auth.sso_tokens` | issues one-time sign-in token |
| `GET|POST /api/auth/[...nextauth]` | landing-page | landing-page | `auth.users`, `auth.sessions` | credential auth source of truth |
| `GET /api/student/dashboard` | student-platform | student-ui | `students`, `teachers` (read), `shared` (read) | aggregated student home data |
| `GET /api/student/progress` | student-platform | student-ui | `students` | student progression timeline |
| `GET/PATCH /api/student/assignments*` | student-platform | student-ui | `students` + `teachers` (read link) | completion and due-date views |
| `GET /api/student/lessons` | student-platform | student-ui | `teachers` (read), `students` | teacher-authored lessons filtered for student |
| `GET/PATCH /api/student/profile` | student-platform | student-ui | `students` + `auth` (selected fields) | role-safe profile updates |
| `GET /api/students*` | teacher-platform | teacher-ui | `teachers.students` | teacher management only |

## Integration Rules

- Student UI never calls teacher CRUD endpoints directly.
- Student backend reads teacher-authored instructional data through controlled
  repository methods; no student writes into teacher-owned tables.
- Landing remains the initial auth broker and SSO token issuer.
- Student backend resolves session identity before reading student resources.

## Versioning Approach

- Prefix student-owned endpoints under `/api/student/*`.
- Introduce backward-compatible fields in response `meta` first.
- Breaking response changes require a new endpoint path or version header.

## Cross-Platform Failure Modes

- Landing auth unavailable:
  - student sign-in unavailable
  - UI shows maintenance state with retry
- Token mismatch or expired token:
  - redirect to landing sign-in
- Database partial outage:
  - degrade to read-only views where safe

## Traceability

- Record `requestId` on each response for cross-service debugging.
- Include `actorUserId` + endpoint in backend logs for protected reads/writes.
- Track top-level error codes and endpoint latency for student routes.

## Reference Baselines

- `docs/platforms/api-index.md`
- `docs/architecture.md`
- `docs/platforms/landing-page/backend/sequences.md`
- `docs/platforms/teacher-platform/backend/sso.md`
