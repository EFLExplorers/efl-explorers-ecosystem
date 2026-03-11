# Student API Surface

Defines the API boundary owned by the student platform and how it consumes
shared capabilities from landing and teacher platforms.

## API Ownership Model

- **Landing-owned auth endpoints**: issue SSO token and manage credentials.
- **Student-owned endpoints**: student dashboard, progress, assignments,
  profile, and learning activity reads/writes.
- **Teacher-owned endpoints**: teacher authoring and instructor workflows only.

## Student Endpoint Set (Target)

- `GET /api/student/dashboard`
- `GET /api/student/progress`
- `GET /api/student/assignments`
- `PATCH /api/student/assignments/[id]`
- `GET /api/student/lessons`
- `GET /api/student/profile`
- `PATCH /api/student/profile`

## Contract Standards

- Use consistent envelope:
  - Success: `{ data, meta?, error: null }`
  - Failure: `{ data: null, meta?, error: { code, message, details? } }`
- Use server-side session resolution; do not trust raw user IDs from client.
- Validate request payloads with Zod before DB operations.
- Return typed error codes for auth, validation, and not-found cases.

## Security Rules

- Student endpoints require authenticated session with `role = student`.
- Endpoint authorization ensures students can only access their own records.
- Teacher and landing services cannot mutate student-owned records directly
  without explicit administrative contracts.

## Cross References

- Platform endpoint baseline: `docs/platforms/api-index.md`
- Architecture rules: `docs/architecture.md`
- Backend rules: `docs/StudentDevelopmentPlan/backend/README.md`
