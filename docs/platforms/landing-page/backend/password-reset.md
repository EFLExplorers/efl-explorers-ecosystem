# Landing Page Password Reset

## Endpoints

- `POST /api/auth/forgot-password` creates a reset token.
- `POST /api/auth/reset-password` resets the password using the token.

## Registration Rules

- Password must be at least 6 characters.
- Teachers are created as `approved=false`; students are auto-approved.

## Reset Tokens

- Tokens are hashed with SHA-256 before storing.
- TTL is 60 minutes.
- Existing tokens for the user are deleted on new reset requests.
