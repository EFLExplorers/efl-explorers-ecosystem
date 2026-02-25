# Tier-Based Route Access (Scale Plan)

This document captures the current approach and future steps for tier-based
route access. It is intended as a reference for scaling the auth and
entitlements pipeline.

## Current Behavior (Implemented)

- **Registration defaults to free tier** on the landing page.
- **Teacher approval** is required before a teacher can log in.
- **Tier-based route protection** applies in the teacher platform middleware:
  - Free-tier users are redirected to landing page `/pricing` for premium routes.
  - Premium-tier users can access all routes.

## Data Model

### User fields

- `role`: `student | teacher`
- `approved`: `boolean`
- `subscriptionTier`: `free | premium`

Defaults:
- `approved` defaults to `false` for teachers and `true` for students.
- `subscriptionTier` defaults to `free`.

## Auth + Session Propagation

Tier is stored and propagated through the auth flow:

1. **Landing Page Registration**
   - Sets `subscriptionTier = "free"` at creation.
2. **Landing Page Login (NextAuth)**
   - Adds `subscriptionTier` to JWT and Session.
3. **Teacher Platform SSO**
   - Receives `subscriptionTier` in the JWT/session.

## Route Protection (Teacher Platform)

Premium route protection is enforced in `apps/teacher-platform/src/middleware.ts`.

High-level behavior:
- If **not logged in** → redirect to landing page login.
- If **non-teacher** → redirect to landing page login.
- If **free tier** and **premium route** → redirect to landing page pricing.

The premium route list lives in:
`apps/teacher-platform/src/lib/entitlements.ts`

## Upgrade Flow (Planned)

This is the expected pipeline once payments are added:

1. User completes payment.
2. Payment webhook confirms success.
3. Backend updates `auth.users.subscription_tier` to `premium`.
4. On next login (or token refresh), session carries `subscriptionTier: "premium"`.
5. Premium routes become accessible automatically.

## Operational Notes

- Keep the premium route list centralized in `entitlements.ts`.
- When new premium pages are added, update the list and verify redirects.
- Avoid hardcoding pricing URLs in multiple places; keep the landing base URL
  as an environment variable.

## Open TODOs

- Define exact premium route list for v1.
- Add payment provider integration + webhook handler.
- Implement a post-payment redirect back to the teacher platform.
