# Student Page V3 Execution Plan

This document turns the student context and v2 blueprint into sprint-ready
execution artifacts.

## 1) Goal

Deliver student pages through vertical slices that validate user flow quality
before broad backend coupling.

## 2) Planning Model

- Organize work by epics tied to user flow outcomes.
- Keep each story independently testable.
- Define acceptance criteria and test cases for every story.
- Integrate one cross-role flow first, then expand.

## 3) Epic Backlog

## Epic 1: Student Dashboard Mission Flow

### Story 1.1: Render dashboard with deterministic CTA behavior

- Tasks:
  - Implement dashboard card composition per contract.
  - Ensure one primary CTA and one fallback CTA are always visible.
  - Implement loading, empty, error, partial, success, and locked states.
- Acceptance criteria:
  - Dashboard renders all required cards in all six states.
  - Mission CTA always points to a valid next action.
  - Failed widget does not block non-failing widgets.
- Test cases:
  - Unit: card state rendering by payload shape.
  - Integration: partial data failure still renders available widgets.
  - UI: CTA remains visible on mobile and desktop.

### Story 1.2: Dashboard analytics instrumentation

- Tasks:
  - Emit mission start event on primary CTA click.
  - Emit retry event on widget-level retry.
  - Include required metadata fields.
- Acceptance criteria:
  - Event payload includes `student_id`, `mode`, `page`, and `component`.
  - No duplicate events on single click.
- Test cases:
  - Unit: event mapper output.
  - Integration: one click equals one analytics emission.

## Epic 2: Lessons Continuation Flow

### Story 2.1: Build lesson queue with action targeting

- Tasks:
  - Render queue list from route payload.
  - Map statuses to deterministic visual tokens.
  - Bind resume CTA to first actionable lesson.
- Acceptance criteria:
  - Queue ordering remains stable.
  - Resume targets first valid lesson or fallback flow.
  - Empty queue state provides recovery action.
- Test cases:
  - Unit: first-actionable resolver.
  - Integration: queue status transitions update UI correctly.

### Story 2.2: Add weekly plan secondary interaction

- Tasks:
  - Implement weekly plan drawer or panel.
  - Preserve keyboard navigation and focus return.
- Acceptance criteria:
  - Weekly plan opens and closes without focus traps.
  - Secondary action works in all non-error states.
- Test cases:
  - UI: keyboard open, close, and focus cycle.
  - Accessibility: tab order and labeling.

## Epic 3: Assignment Lifecycle Flow (First Cross-Role Integration)

### Story 3.1: Implement assignment board and detailed list coherence

- Tasks:
  - Implement board grouped by due-soon, in-progress, completed.
  - Implement synced detailed list.
  - Add state transitions and optimistic behavior rules.
- Acceptance criteria:
  - Board and list remain consistent after status changes.
  - Due-soon count updates immediately in UI.
  - Error rollback restores prior state with visible error context.
- Test cases:
  - Unit: status transition reducer.
  - Integration: optimistic update and rollback.
  - UI: list and board parity after mutation.

### Story 3.2: Connect teacher-to-student assignment propagation

- Tasks:
  - Validate student assignment ingest contract from teacher-created tasks.
  - Map teacher status semantics to student status semantics.
  - Add reconciliation logging for invalid transitions.
- Acceptance criteria:
  - New teacher assignment appears in student board and dashboard count.
  - Completed student assignment is visible in teacher follow-up view.
  - Contract mismatches surface typed errors.
- Test cases:
  - Contract: DTO compatibility checks.
  - Integration: teacher assign to student complete lifecycle.

## Epic 4: Progress And Unlock Flow

### Story 4.1: Implement checkpoint timeline and gate explanations

- Tasks:
  - Render checkpoint timeline from progress payload.
  - Display gate lock reason and prerequisite action.
  - Add stale-data hint behavior.
- Acceptance criteria:
  - Checkpoint percentages map to visible progress tracks.
  - Locked checkpoint includes explicit unlock condition.
  - Stale data hint appears only when threshold exceeded.
- Test cases:
  - Unit: checkpoint percentage formatting and thresholds.
  - UI: locked and unlocked state rendering.

## Epic 5: Profile And Settings Persistence

### Story 5.1: Profile form validation and save workflow

- Tasks:
  - Add client validation for formatting rules.
  - Map server validation errors to field-level feedback.
  - Add save success and failure feedback states.
- Acceptance criteria:
  - Invalid fields block submit and show inline guidance.
  - Server validation errors map to the correct inputs.
  - Save success is visible and non-blocking.
- Test cases:
  - Unit: validator behavior per field.
  - Integration: form submit success and failure paths.

### Story 5.2: Settings tab-scoped persistence

- Tasks:
  - Persist settings by active tab scope.
  - Maintain tab state across route reloads where supported.
  - Prevent cross-tab overwrite.
- Acceptance criteria:
  - Saving one tab does not mutate another tab's values.
  - Tab selection persistence is deterministic.
- Test cases:
  - Unit: tab-scoped payload builder.
  - Integration: tab change and save boundaries.

## Epic 6: Quality Hardening And Release Readiness

### Story 6.1: Accessibility and responsive hardening

- Tasks:
  - Validate keyboard traversal and focus behavior.
  - Validate color contrast and semantic labels.
  - Validate responsive layout breakpoints.
- Acceptance criteria:
  - Core route flow is keyboard operable.
  - Major controls and inputs have accessible labels.
  - Mobile and desktop pass visual verification.
- Test cases:
  - Accessibility checks for each route.
  - Responsive screenshot and interaction checks.

### Story 6.2: End-to-end flow validation and release gate

- Tasks:
  - Implement end-to-end tests for key student path.
  - Validate analytics emission for critical actions.
  - Define rollback checklist and release checklist.
- Acceptance criteria:
  - End-to-end tests pass for primary flow.
  - Critical analytics events are observed once per action.
  - Release checklist is complete before deploy.
- Test cases:
  - E2E: login to assignment completion to progress verification.
  - E2E: error and retry behavior on selected endpoints.

## 4) Sprint Sequencing

- Sprint 1:
  - Epic 1 stories
  - Epic 2 Story 2.1
- Sprint 2:
  - Epic 2 Story 2.2
  - Epic 3 stories
- Sprint 3:
  - Epic 4 story
  - Epic 5 stories
- Sprint 4:
  - Epic 6 stories and release hardening

## 5) Delivery Controls

- Must-pass quality gates per sprint:
  - lint
  - type checks
  - unit and integration suites for touched areas
  - route-level acceptance checklist updates
- No sprint close until:
  - acceptance criteria are verified,
  - analytics event payloads are validated,
  - regression impact has been reviewed.

## 6) Risks And Mitigations

- Risk: contract drift between teacher assignment model and student board model.
  - Mitigation: add DTO compatibility tests and mapping guards in Epic 3.
- Risk: status naming mismatch across pages.
  - Mitigation: centralize status enum mapping and test transitions.
- Risk: parent-led mode receives less early coverage.
  - Mitigation: add parent-led test data and parity checks from Sprint 2 onward.
- Risk: partial failure UX inconsistency.
  - Mitigation: enforce shared state wrapper behavior per route.
