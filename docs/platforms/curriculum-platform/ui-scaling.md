# Curriculum platform UI — scaling guide

This document complements the wireframe shell introduced in the app (`DashboardShell`, dashed borders, system fonts). Use it when growing from prototype → production UX.

## Current architecture (baseline)

| Layer | Location | Role |
|--------|----------|------|
| App chrome | [`apps/curriculum-platform/src/components/dashboard/DashboardShell.tsx`](../../../apps/curriculum-platform/src/components/dashboard/DashboardShell.tsx) | Fixed **sidebar nav** + **top header** (title, subtitle, user, sign out). |
| Chrome styles | [`DashboardShell.module.css`](../../../apps/curriculum-platform/src/components/dashboard/DashboardShell.module.css) | Layout only; keep free of business logic. |
| Workspace blocks | [`workspace.module.css`](../../../apps/curriculum-platform/src/pages/dashboard/workspace.module.css) | Forms, cards, grids inside dashboard pages. |
| Global tokens | [`globals.css`](../../../apps/curriculum-platform/src/styles/globals.css) | CSS variables (`--bg`, `--panel`, `--text`, …). |

**Rule:** New authenticated surfaces should compose **`DashboardShell`** (or a future wrapper) instead of one-off headers.

---

## 1. Navigation scaling

**Today:** Flat list in `NAV_ITEMS` inside `DashboardShell`.

**Next steps:**

1. **Nested sections** — Introduce `navSection: { label, items[] }` and render grouped `<NavSection>` components. Keeps URLs stable; only the shell changes.
2. **Feature flags** — Filter `NAV_ITEMS` by env or remote config (e.g. hide Publish until ready). Prefer server-injected flags via `getServerSideProps` → pass into a thin client shell wrapper if you must avoid flash.
3. **Role / permission-based items** — When `CurriculumManager` gains roles, derive `visibleNav` from session claims (extend NextAuth JWT + session callbacks). Never rely on hiding links alone for security; **enforce in API routes** as today.
4. **Deep links** — Preserve pathname matching helper `isActive` when adding dynamic routes (e.g. `/dashboard/programs/[id]` should still highlight **Programs**).

---

## 2. Layout & routing scaling

| Concern | Recommendation |
|---------|------------------|
| **Pages Router → App Router** | Migrate **shell + layout** first: one `app/(manager)/layout.tsx` wrapping segment children; map each dashboard page to `app/(manager)/dashboard/.../page.tsx`. Keep API routes in `pages/api` or move incrementally. |
| **Shared layout without duplication** | Replace per-page `<DashboardShell>` with a **single layout parent** once on App Router; until then, the shell component is the DRY compromise. |
| **Modal / drawer workflows** | Add parallel routes or URL-driven drawers (`?panel=units`) for dense editors (Programs workspace) so main nav stays stable and URLs are shareable. |

---

## 3. Visual system evolution (wireframe → product)

1. **Tokens** — Move from wireframe grays to semantic tokens: `--color-surface-canvas`, `--color-border-default`, `--space-md`. Implement in `globals.css` or CSS Modules `:global` layer; avoid scattering raw hex in components.
2. **Density** — Introduce `data-density="compact|comfortable"` on `html` or shell root; adjust padding in `DashboardShell.module.css` and `workspace.module.css` via attribute selectors.
3. **Components** — Extract repeated patterns (`FormField`, `DataCard`, `Toolbar`) into `src/components/ui/` with co-located `*.module.css`. Keep **named exports**.
4. **Dark mode** — Toggle `color-scheme` + `[data-theme="dark"]` overrides; test sidebar contrast and dashed borders (may switch to solid for accessibility).

---

## 4. Data & state scaling

| Area | Guidance |
|------|-----------|
| **Programs workspace** | Large page with many `useState` blocks — candidate for **useReducer**, **React Query** (`useQuery` for programs/levels/units), or split into child components with lifted server state IDs only. |
| **Pagination** | APIs should accept `cursor` / `page` before the UI lists hundreds of rows. |
| **Optimistic UI** | Prefer React Query `onMutate` for create/update program; rollback on API error. |
| **Server Actions** | If moving to App Router, colocate mutations next to features; still validate session + `managerId` server-side (mirror `requireCurriculumApiSession` rules). |

---

## 5. Performance & bundles

1. **Dynamic import** — Lazy-load heavy editor subpanels: `dynamic(() => import('./AssignmentPanel'), { ssr: false })` where appropriate.
2. **Prisma in client boundary** — Never import `@repo/database` in client components; keep data in API routes or Server Components.
3. **Middleware / proxy** — Next.js 16 deprecates `middleware.ts` in favor of **`proxy.ts`**; when migrating, preserve matcher paths for `/dashboard` and `/settings` and keep JWT checks cheap (no DB in edge).

---

## 6. Accessibility (scale with features)

- Sidebar: use `<nav aria-label="Primary navigation">` (already); add **skip link** to main content in shell.
- Focus order: tab through nav → header actions → main; avoid positive `tabIndex` except for roving tabindex in custom listboxes.
- Forms: associate `<label htmlFor>` with inputs; surface API errors in `role="alert"` regions.
- Color: when leaving wireframe, verify **contrast** for muted text and error/success messages.

---

## 7. Internationalization (i18n)

- Extract shell strings (`Sign out`, nav labels) into a dictionary early — even a simple `const t = messages[locale]` in the shell — before copy spreads across pages.
- Date/number formatting: centralize in `lib/format.ts` for invites and publish timestamps.

---

## 8. Testing strategy

| Layer | Suggestion |
|-------|------------|
| **Nav + auth** | E2E (Playwright): login → expect sidebar links → restricted routes redirect. |
| **API** | Contract tests for programs CRUD with `createdByManagerId`. |
| **Visual** | Optional Storybook for `DashboardShell` + workspace cards with token themes. |

---

## 9. Documentation hygiene

When you add a new dashboard route:

1. Add it to **`NAV_ITEMS`** in `DashboardShell.tsx`.
2. Protect it with **`requireActiveCurriculumManager`** (or middleware + server guard).
3. Note the route in [`docs/platforms/curriculum-platform/api/README.md`](./api/README.md) if it exposes new API surface.

---

## 10. Quick checklist before “production UI”

- [ ] Replace wireframe subtitle copy with real product copy or remove.
- [ ] Solid design tokens + component library alignment.
- [ ] Responsive sidebar (collapse to icon rail or drawer &lt; 768px).
- [ ] Loading and error boundaries for workspace data.
- [ ] Analytics / audit events for publish and invite actions.

This file is the living scaling contract for the curriculum manager UI; update it when you change shell or navigation structure.
