# Teacher Platform SSO

## Auth + SSO

- Uses NextAuth credentials provider (`id: "sso"`).
- Validates SSO tokens issued by the landing page.

## SSO Validation

- Token is hashed with SHA-256 and matched against `auth.sso_tokens`.
- Token must be unused and unexpired.
- On success, `used_at` is set to prevent reuse.

## SSO Login Sequence

```mermaid
sequenceDiagram
  participant U as User
  participant T as Teacher UI
  participant API as NextAuth (Teacher)
  participant DB as auth.sso_tokens

  U->>T: Open /sso?token=...
  T->>API: signIn("sso", token)
  API->>DB: Find token_hash (unused, unexpired)
  DB-->>API: Token + user
  API->>DB: Set used_at
  API-->>T: Session + redirect
```
