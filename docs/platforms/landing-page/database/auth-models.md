# Auth Models

## `User`

- `id` (uuid)
- `name` (string, optional)
- `email` (string, optional, unique)
- `email_verified` (datetime, optional)
- `image` (text, optional)
- `password_hash` (text, optional)
- `role` (`student` | `teacher`)
- `approved` (boolean)
- `first_name` (string, optional)
- `last_name` (string, optional)
- `created_at` (datetime)
- `updated_at` (datetime)

## `Account`

- `id` (uuid)
- `user_id` (uuid)
- `type` (string)
- `provider` (string)
- `provider_account_id` (string)
- `refresh_token` (text, optional)
- `access_token` (text, optional)
- `expires_at` (int, optional)
- `token_type` (string, optional)
- `scope` (text, optional)
- `id_token` (text, optional)
- `session_state` (text, optional)

## `Session`

- `id` (uuid)
- `session_token` (string, unique)
- `user_id` (uuid)
- `expires` (datetime)

## `VerificationToken`

- `identifier` (string)
- `token` (string, unique)
- `expires` (datetime)

## `PasswordResetToken`

- `id` (uuid)
- `user_id` (uuid)
- `token_hash` (string, unique)
- `expires_at` (datetime)
- `created_at` (datetime)

## `SsoToken`

- `id` (uuid)
- `user_id` (uuid)
- `token_hash` (string, unique)
- `platform` (`student` | `teacher`)
- `expires_at` (datetime)
- `used_at` (datetime, optional)
- `created_at` (datetime)
