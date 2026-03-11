# 2026-03-11 UI Shell Scaffold

## Goal

Implement the route and component shell for Milestone 2 UI work in
`apps/student-platform` using CSS Modules only.

## Actions Completed

1. Added student shell layout and navigation components:
   - `src/components/student/shell/StudentLayout.tsx`
   - `src/components/student/shell/StudentNav.tsx`
   - `src/components/student/shell/student-layout.module.css`
   - `src/components/student/shell/student-nav.module.css`
2. Added reusable state-view component for consistent loading/empty/error shell:
   - `src/components/student/StudentStateView.tsx`
   - `src/components/student/state-view.module.css`
3. Added route map constants:
   - `src/lib/navigation/student-routes.ts`
4. Added route shells:
   - `/` (dashboard)
   - `/lessons`
   - `/progress`
   - `/assignments`
   - `/profile`
   - `/sso`
5. Removed old starter-only page stylesheet:
   - deleted `src/pages/home.module.css`
6. Added exports to component barrel:
   - `src/components/index.tsx`

## Contract Alignment

Each route shell includes explanatory placeholders aligned to
`docs/StudentDevelopmentPlan/ui/interaction-contracts.md`:

- Dashboard -> `GET /api/student/dashboard`
- Lessons -> `GET /api/student/lessons`
- Progress -> `GET /api/student/progress`
- Assignments -> `GET /api/student/assignments`, `PATCH /api/student/assignments/[id]`
- Profile -> `GET /api/student/profile`, `PATCH /api/student/profile`
- SSO -> Milestone 1 sign-in bootstrap behavior

## Next Steps

1. Add typed API DTOs under `src/lib/api/types`.
2. Implement fetch clients and per-page loading/error/empty state logic.
3. Wire auth/session guard and SSO token exchange behavior.
