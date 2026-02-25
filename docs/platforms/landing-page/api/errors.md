# Landing Page API Errors

Unless noted, unexpected errors return `500`.

## Content + Pages

- `GET /api/content`: `400` missing `type`, `401` bad API key, `405` method.
- `GET /api/page-content`: `400` missing `route`, `401` bad API key, `404` page not found, `405` method.
- `POST /api/revalidate`: `401` bad API key, `405` method.
- `POST /api/getUserRole`: `400` missing or invalid `userId`, `401` bad API key, `405` method.

## Auth

- `POST /api/auth/register`: `400` validation, `409` email exists, `405` method.
- `POST /api/auth/forgot-password`: `400` missing email, `405` method.
- `POST /api/auth/reset-password`: `400` invalid or expired token, `405` method.
- `POST /api/auth/sso-token`: `400` invalid platform, `401` no session, `403` role mismatch, `500` platform URL not configured, `405` method.

## NextAuth

- `/api/auth/[...nextauth]` uses NextAuth defaults (may return `302`, `401`, or `403`).
