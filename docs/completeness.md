# Documentation Completeness Checklist

This checklist captures what a base model needs to know to understand the
platform without assumptions. Each item points to the exact docs that answer it.

## System Map + Boundaries

- Ecosystem components, responsibilities, dependencies  
  → `docs/maticulus.md`, `docs/architecture.md`, `docs/platforms/README.md`

## Runtime + Operations

- Local setup, environment variables, and dev commands  
  → `docs/operations.md`

## Platform UI

- Routes, UI surface areas, and user-facing screens  
  → `docs/platforms/landing-page/ui/README.md`  
  → `docs/platforms/teacher-platform/ui/README.md`  
  → `docs/platforms/students-platform/ui/README.md`

## API Contracts (Requests + Responses)

- Landing page content + auth endpoints  
  → `docs/platforms/landing-page/api/README.md`  
  → `docs/platforms/landing-page/api/content-endpoints.md`  
  → `docs/platforms/landing-page/api/auth-endpoints.md`

- Teacher platform endpoints  
  → `docs/platforms/teacher-platform/api/README.md`  
  → `docs/platforms/teacher-platform/api/core-resources.md`  
  → `docs/platforms/teacher-platform/api/tasks-bookmarks.md`  
  → `docs/platforms/teacher-platform/api/messages.md`  
  → `docs/platforms/teacher-platform/api/lesson-materials.md`

## API Examples + Error Codes

- Curl examples  
  → `docs/platforms/landing-page/api/examples.md`  
  → `docs/platforms/teacher-platform/api/examples.md`

- Status codes and error behavior  
  → `docs/platforms/landing-page/api/errors.md`  
  → `docs/platforms/teacher-platform/api/errors.md`

## Auth + SSO Flows

- Landing page auth rules and flows  
  → `docs/platforms/landing-page/backend/auth.md`  
  → `docs/platforms/landing-page/backend/password-reset.md`  
  → `docs/platforms/landing-page/backend/sso.md`  
  → `docs/platforms/landing-page/backend/sequences.md`

- Teacher platform SSO validation  
  → `docs/platforms/teacher-platform/backend/sso.md`

## Backend Implementation Details

- Storage layer and fallbacks  
  → `docs/platforms/teacher-platform/backend/storage.md`

- Access control boundaries  
  → `docs/platforms/teacher-platform/backend/access-control.md`

- Validation sources (Zod schemas)  
  → `docs/platforms/teacher-platform/backend/validation.md`

## Data Model (ERD + Fields)

- Landing page auth + shared schema  
  → `docs/platforms/landing-page/database/erd.md`  
  → `docs/platforms/landing-page/database/auth-models.md`  
  → `docs/platforms/landing-page/database/shared-models.md`

- Teacher domain models  
  → `docs/platforms/teacher-platform/database/erd.md`  
  → `docs/platforms/teacher-platform/database/models.md`

## Current Scope Note

- Student platform is a boilerplate app.  
  → `docs/platforms/students-platform/README.md`

## Known Unknowns (Explicitly Not Defined Yet)

- Production deployment targets and CI/CD pipeline.
- Observability/logging standards.
- Data retention and privacy policies.

These are not represented in code or configuration today.
