# Landing Page SSO

## SSO Token Issuance

- `POST /api/auth/sso-token` creates a short-lived token for the target platform.
- Tokens are stored hashed in `auth.sso_tokens` and expire quickly.

## SSO Rules

- Requires a valid NextAuth session.
- `platform` must be `student` or `teacher`.
- Role mismatch returns `403`.
- Token TTL is 5 minutes.
