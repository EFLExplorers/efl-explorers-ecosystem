# Landing Page Backend

## Docs Index

- `auth.md` — Login rules and session behavior.
- `password-reset.md` — Reset token lifecycle and validation.
- `sso.md` — SSO token issuance and rules.
- `sequences.md` — Mermaid sequence diagrams.

## API Key Gate

Content endpoints require `x-efl-api-key` and reject requests without
`EFL_API_KEY` configured.

## Data Access

All backend data access uses the shared Prisma client from `@repo/database`.
