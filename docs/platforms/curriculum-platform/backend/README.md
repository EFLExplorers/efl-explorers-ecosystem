# Curriculum Platform Backend

## Key Files

- `apps/curriculum-platform/src/lib/authOptions.ts` - Standalone credentials-based NextAuth configuration.
- `apps/curriculum-platform/src/lib/requireCurriculumApiSession.ts` - API session guard for manager-only routes.
- `apps/curriculum-platform/src/lib/invitePolicy.ts` - Bootstrap allowlist handling.
- `apps/curriculum-platform/src/pages/api/auth/register.ts` - Invite-only registration flow.
- `apps/curriculum-platform/src/pages/api/publish/levels/[levelId].ts` - Publish snapshot transaction.

## Auth Model

- Session strategy is JWT.
- Managers are stored in `curriculum.managers`.
- Registration is blocked unless invite is valid, except for first-manager bootstrap allowlist.

## Deployment Inputs

- Runtime env contract is defined in `apps/curriculum-platform/.env.local.example`.
- Vercel setup checklist is documented in `docs/platforms/curriculum-platform/deployment-vercel.md`.
