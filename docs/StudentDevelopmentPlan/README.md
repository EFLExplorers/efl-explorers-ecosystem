# Student Development Plan

This folder is the implementation context for building the student platform from
boilerplate to production-ready. It captures how student UI work must interact
with landing auth, teacher data boundaries, and the shared database package.

## Scope

- Student UI architecture and interaction contracts.
- Student API and backend ownership boundaries.
- Shared database and schema expansion strategy.
- Runtime and delivery pipelines.
- Milestone-based implementation roadmap.

## How To Use This Plan

1. Start with `pipeline/implementation-roadmap.md` for phase order.
2. Use `ui/` + `api/` docs to define the next feature increment.
3. Confirm backend and database ownership before coding endpoints.
4. Validate environment and deployment flow in `pipeline/delivery-flow.md`.

## Folder Index

- `ui/README.md`
- `ui/interaction-contracts.md`
- `api/README.md`
- `api/integration-map.md`
- `backend/README.md`
- `backend/sso-session-flow.md`
- `database/README.md`
- `database/student-domain-model.md`
- `pipeline/runtime-flow.md`
- `pipeline/delivery-flow.md`
- `pipeline/implementation-roadmap.md`

## Architecture Anchors

- `docs/architecture.md`
- `docs/operations.md`
- `docs/platforms/api-index.md`
- `docs/platforms/teacher-platform/backend/sso.md`
- `packages/database/prisma/schema.prisma`
