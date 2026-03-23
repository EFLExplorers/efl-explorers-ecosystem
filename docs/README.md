# EFL Explorers — documentation map

## How documentation is split

| What | Where | Mindset |
|------|--------|--------|
| **Docs that appear in the Nextra app** | `apps/docs` (`@repo/docs`), content: **`apps/docs/content/`** | **Structured and simplified** — navigation, hubs, manifests, guides people actually read in the site. Only put MDX here if it should ship in that UI. Run: `pnpm --filter @repo/docs dev`. |
| **Chaos / dev-oriented notes** | **`docs/`** (this folder, repo root) | **Organic** — scratchpads, deep dives, logs, experiments, anything you add as you go. **Not** built by Nextra; Markdown (and whatever structure you like). Optimized for *you* and Cursor, not for the public docs sidebar. |

New site-facing content belongs in `apps/docs/content/` only.

## Optional subfolders under `docs/`

- **`docs/dev/`** — handy inbox for messy WIP (optional).
- **`docs/prod/`** — handy inbox for rollout / env / incident notes (optional).

Everything else (`platforms/`, `StudentDevelopmentPlan/`, `Scale/`, …) is still valid chaos corpus—no need to move files unless you want to.

---

## Start here (root corpus — internal)

- `maticulus.md` — Ecosystem matrix and cross-app flows.
- `architecture.md` — System architecture, data domains, auth/SSO.
- `operations.md` — Local setup, environment variables, workflows.
- `completeness.md` — Checklist for no-assumption understanding.

## Observability / internal tools

- `db-visualizer/scaling-and-operating-model.md` — Operating model for `apps/db-visualizer`.

## Platforms

- `platforms/README.md` — Platform index + UI/API/backend/database split.

## Packages

- `packages/database.md` — Prisma schema + DB client.
- `packages/ui.md` — Shared UI components.
