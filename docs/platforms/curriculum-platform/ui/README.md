# Curriculum Platform UI

UI implementation is in `apps/curriculum-platform/src/pages` and uses **CSS Modules** only (no Tailwind). New shared layout pieces live under `src/components/dashboard/`.

## Current screens

- `/login` — Manager sign-in page.
- `/register` — Invite/bootstrap account registration.
- `/dashboard` — **Process hub**: cards with CTAs to Programs, Publish, Invites, Settings; server-loaded counts (programs, units, published levels, pending invites). Uses **`ProcessHubCard`** ([`ProcessHubCard.tsx`](../../../apps/curriculum-platform/src/components/dashboard/ProcessHubCard.tsx)).
- `/dashboard/programs` — Program/level/unit workspace: **Lesson content** (slug, order, summary, story markdown, media manifest JSON) + **Assignment config** + archive unit.
- `/dashboard/publish` — Readiness (level status, active unit count), **Preview assignment hooks** (JSON), **Publish** snapshot.
- `/dashboard/invites` — Invite management.
- `/settings` — Manager profile (read-only display).

## Chrome

- **`DashboardShell`** — Sidebar nav, header, sign out ([`DashboardShell.tsx`](../../../apps/curriculum-platform/src/components/dashboard/DashboardShell.tsx)).
- **Workspace styles** — [`workspace.module.css`](../../../apps/curriculum-platform/src/pages/dashboard/workspace.module.css) for cards, forms, `preJson` preview blocks.

See [`ui-scaling.md`](../ui-scaling.md) for wireframe → product scaling notes.
