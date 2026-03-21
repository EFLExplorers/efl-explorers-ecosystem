# EFL Explorers Ecosystem Docs

This folder contains structured, in-depth documentation for the ecosystem.
Start with the maticulus if you want the full system map, then drill into
architecture, operations, and app/package details.

## Start Here
- `maticulus.md` — In-depth ecosystem matrix and cross-app flows.
- `architecture.md` — System architecture, data domains, and auth/SSO.
- `operations.md` — Local setup, environment variables, and workflows.
- `completeness.md` — Checklist for no-assumption understanding.

## Observability / internal tools
- `db-visualizer/scaling-and-operating-model.md` — Operating model for `apps/db-visualizer`: security, performance, health checks, and how it maps to the multi-schema Postgres monorepo.

## Platforms
- `platforms/README.md` — Platform index + UI/API/backend/database split.

## Packages
- `packages/database.md` — Prisma schema + DB client.
- `packages/ui.md` — Shared UI components.
