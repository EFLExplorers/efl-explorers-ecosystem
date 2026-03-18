# Vercel Deployment Prep

This guide prepares `apps/curriculum-platform` for Vercel deployment without running deployment commands.

## Vercel Project Settings

- **Framework preset**: Next.js
- **Root directory**: `apps/curriculum-platform`
- **Install command**: `pnpm install --frozen-lockfile`
- **Build command**: `pnpm --filter curriculum-platform build`
- **Output directory**: `.next` (default for Next.js)
- **Node.js version**: 20.x

## Required Environment Variables

- `NEXTAUTH_URL`
  - Preview: Vercel preview URL
  - Production: your production domain (for example `https://curriculum.yourdomain.com`)
- `NEXTAUTH_SECRET`
  - Strong random secret used by NextAuth session/JWT signing
- `DATABASE_URL`
  - Postgres connection string reachable from Vercel
- `DIRECT_URL`
  - Direct Postgres URL for Prisma operations (recommended to set)

## Curriculum-Specific Variables

- `CURRICULUM_BOOTSTRAP_ALLOWLIST`
  - Comma-separated emails allowed to create the first manager account
  - After first account is created, keep this controlled and minimal
- `CURRICULUM_API_SHARED_SECRET` (optional)
  - If set, `/api/public/levels/...` requires `x-curriculum-shared-secret`

## Post-Deploy Smoke Checklist

- Register first manager via `/register` (bootstrap allowlist or pre-created invite)
- Sign in via `/login`
- Create one program, one level, and one unit in `/dashboard/programs`
- Publish the level in `/dashboard/publish`
- Verify `GET /api/public/levels/{programSlug}/{levelSlug}` returns current snapshot

## Security Notes

- Do not commit real secrets in repo files.
- Rotate `NEXTAUTH_SECRET` and `CURRICULUM_API_SHARED_SECRET` if exposed.
- Prefer least-privilege DB credentials for production.
