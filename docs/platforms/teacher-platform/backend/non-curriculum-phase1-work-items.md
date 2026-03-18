# Teacher Platform Non-Curriculum Phase 1 Work Items

This document translates the non-curriculum audit into concrete implementation
items for immediate execution.

Primary reference:

- `non-curriculum-data-integrity-audit.md`

## Scope

- Included: messages, bookmarks, materials, reports
- Excluded: curriculum (tracked on separate branch)

## Execution Order

1. Messages identity/contact correctness
2. Bookmarks persisted starred state
3. Materials metadata and usage integrity
4. Reports removal of synthetic analytics
5. CI guardrails for regression prevention

## Work Item 1: Messages Integrity

### Objective

Remove client hardcoded identity assumptions and synthetic contact naming.

### Tasks

- Add/extend API response contract for conversation list to include:
  - `viewerId`
  - participant display names resolved server-side
  - unread counts and last message summary
- Update messages UI to use API-provided identity and names only.
- Remove `currentUserId = 1` and mock name branching.

### Acceptance Criteria

- No hardcoded user id in messages page.
- No synthetic names in messages list.
- Conversation rendering works from API response only.

## Work Item 2: Bookmarks Starred Persistence

### Objective

Replace synthetic starred behavior with persisted state.

### Tasks

- Add a persisted starred mechanism:
  - either `bookmarks.starred` boolean, or normalized relation table
- Add API mutations for star/unstar.
- Update bookmarks UI to read/write persisted starred state.
- Remove all modulo-derived starred logic.

### Acceptance Criteria

- Starred status survives refresh and new sessions.
- Star filter returns persisted results.
- No `id %` synthetic logic in bookmarks runtime path.

## Work Item 3: Materials Metadata and Storage Usage

### Objective

Eliminate synthetic size and storage numbers.

### Tasks

- Extend material model/API with persisted metadata:
  - `sizeBytes`
  - `mimeType`
  - normalized `kind` (document/video/image/link/other)
- Add storage aggregate endpoint for totals and breakdown.
- Update materials page to:
  - sort by real size
  - show real storage totals
  - stop using mock size mapping.

### Acceptance Criteria

- Storage panel values come from API aggregate endpoint.
- Size sorting uses persisted numeric size.
- No mock size derivation remains.

## Work Item 4: Reports Data Truth

### Objective

Replace static analytics datasets and id-derived synthetic values.

### Tasks

- Add report endpoints (or read models) for:
  - performance distribution
  - attendance distribution/trends
  - per-student computed report rows
- Move timeframe/class filtering to backend query params.
- Replace static chart arrays and modulo-based row values.

### Acceptance Criteria

- Charts render from API data only.
- Table values are server-derived.
- No hardcoded analytics arrays in runtime report page.

## Work Item 5: CI/Policy Guardrails

### Objective

Prevent reintroduction of synthetic runtime data patterns.

### Tasks

- Add lightweight CI checks for known anti-patterns in dashboard pages:
  - modulo-based synthetic logic for runtime metrics
  - hardcoded runtime demo names
  - new runtime `mock` comments
- Add/extend integration tests for key endpoints:
  - ownership checks
  - aggregate correctness
  - empty-state behavior

### Acceptance Criteria

- CI fails on reintroduced synthetic patterns.
- Integration tests cover non-curriculum report/material/bookmark/message contracts.

## Branch Strategy

- Branch A: messages integrity
- Branch B: bookmarks starred persistence
- Branch C: materials metadata + storage aggregates
- Branch D: reports API-driven charts/tables
- Branch E: CI and test guardrails

Merge in order A -> E to reduce integration conflicts.

## Definition of Done

- Runtime behavior is DB/API-backed for all non-curriculum dashboard pages.
- Empty datasets render explicit empty states (not generated demo data).
- No synthetic placeholders influence user decisions.
- Guardrails in CI prevent regression.
