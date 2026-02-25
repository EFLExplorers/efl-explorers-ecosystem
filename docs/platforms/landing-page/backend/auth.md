# Landing Page Auth

## Auth Flow

- NextAuth credentials provider validates users stored in `auth.users`.
- Teachers must be `approved` before they can sign in.
- Session includes `role`, `approved`, `firstName`, and `lastName`.

## Credentials Validation Rules

- Missing user or missing `password_hash` rejects the login.
- If `platform` is provided, the user role must match (`student` or `teacher`).
- Unapproved teachers are rejected with an error message.
