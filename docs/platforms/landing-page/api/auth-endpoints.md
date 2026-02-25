# Auth Endpoints

## `POST /api/auth/register`

Request body:
```json
{
  "email": "user@example.com",
  "password": "secret",
  "firstName": "Ada",
  "lastName": "Lovelace",
  "platform": "teacher"
}
```

Response:
```json
{ "id": "uuid", "role": "teacher", "approved": false }
```

Notes:
- `platform` must be `student` or `teacher`.
- Password must be at least 6 characters.
- Teachers are created as `approved=false`.

## `POST /api/auth/forgot-password`

Request body:
```json
{ "email": "user@example.com" }
```

Response:
```json
{ "ok": true }
```

In non-production, a `resetUrl` is returned for convenience.

## `POST /api/auth/reset-password`

Request body:
```json
{ "token": "raw-reset-token", "password": "new-password" }
```

Response:
```json
{ "ok": true }
```

## `POST /api/auth/sso-token`

Requires a valid NextAuth session.

Request body:
```json
{ "platform": "teacher" }
```

Response:
```json
{
  "token": "base64url",
  "redirectUrl": "https://teacher-platform/sso?token=...",
  "expiresAt": "2026-02-25T00:00:00.000Z"
}
```

## `GET|POST /api/auth/[...nextauth]`

NextAuth credentials provider; used by login forms and session handling.
