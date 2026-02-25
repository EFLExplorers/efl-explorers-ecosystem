# Teacher Platform Access Control

- Middleware protects all routes except `/sso`, `/api`, and static assets.
- Sign-in redirects to the landing page login when unauthenticated.

Note: API routes are not gated by the auth middleware.
