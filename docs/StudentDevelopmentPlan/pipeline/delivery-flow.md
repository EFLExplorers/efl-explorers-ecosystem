# Delivery Flow Pipeline

Defines how student platform changes move from local development to deployed
environments with explicit quality gates and env propagation.

## Environments

- **Local**: developer machine, feature iteration.
- **Preview**: branch-based validation environment.
- **Production**: user-facing stable release.

## Required Environment Variables

## Shared

- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_LANDING_PAGE_URL`
- `NEXT_PUBLIC_TEACHER_URL`
- `NEXT_PUBLIC_STUDENT_URL`

## App-Specific

- `apps/landing-page/.env.local`: auth + SSO issuer and content API key values.
- `apps/student-platform/.env.local`: student app URL, landing URL, and NextAuth.
- `packages/database/.env`: runtime + direct DB connection settings.

Reference baseline: `docs/operations.md`.

## Local Development Flow

1. `pnpm install`
2. Copy required env templates and set local values.
3. Generate Prisma client:
   - `pnpm --filter @repo/database build`
4. Start apps:
   - `pnpm --filter landing-page dev`
   - `pnpm --filter student-platform dev`
5. Validate auth handoff and protected endpoint behavior.

## Quality Gates (Before Merge)

- Lint:
  - `pnpm lint`
- Typecheck:
  - `pnpm typecheck`
- Tests:
  - target unit/integration coverage for changed domains
- Manual verification:
  - SSO sign-in flow
  - dashboard/progress/assignments happy-path + failure-path

## Build and Release Flow

1. Merge feature branch after quality gates pass.
2. Trigger preview build and smoke checks.
3. Promote to production after release checklist confirms:
   - migration safety
   - environment parity
   - rollback readiness

## Database Migration Handling

- Apply schema changes in incremental migration units.
- Run migration in preview before production.
- Require backward-compatible API behavior during migration windows.
- Keep rollback scripts for each migration batch.

## Observability and Rollback

- Monitor:
  - auth failure rate
  - `/api/student/*` latency and error codes
  - DB query error spikes
- Rollback triggers:
  - sustained auth failure increases
  - elevated 5xx across student endpoints
  - data integrity anomalies in new student models

## Related Docs

- `docs/operations.md`
- `docs/architecture.md`
- `docs/StudentDevelopmentPlan/pipeline/runtime-flow.md`
- `docs/StudentDevelopmentPlan/pipeline/implementation-roadmap.md`
