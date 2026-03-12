# Student Page Context And Blueprint

This document captures the agreed context for student UI work and the v2
implementation blueprint. Use it as the source of truth while building
`apps/student-platform`.

## 1) Product Intent

- Build student UI flows first, then connect backend integrations in phases.
- Keep the student experience simple: start tasks fast, see next steps, feel
  progress.
- Keep teacher workflows operational so student tasks are clear and actionable.
- Keep student and teacher views aligned through shared status and progress
  contracts.

## 2) Current UI Snapshot

- Student app routes exist for dashboard, lessons, progress, assignments,
  profile, and settings.
- Student pages are mock-driven through `MOCK_STUDENT_PORTAL_DATA`, which is
  useful for rapid UI iteration.
- Teacher app surfaces are more API-driven and operational.
- Landing app already separates student and teacher login and performs SSO
  handoff.
- Main gap is CTA wiring and integration behavior, not visual scaffolding.

## 3) Personas And Outcomes

- Student: complete daily activities with low friction.
- Parent: monitor progress and maintain learner preferences.
- Teacher: assign work, monitor completion, and intervene when needed.

## 4) Canonical Flows

### Student Teacher-Led Flow

1. Login and SSO handoff.
2. Dashboard mission launch.
3. Lessons path continuation.
4. Assignment completion.
5. Progress checkpoint review.
6. Optional profile and settings updates.

### Student Parent-Led Flow

1. Login and SSO handoff.
2. Dashboard orientation.
3. Parent-sourced assignment completion.
4. Progress check and preference updates.

### Teacher Dependency Flow

1. Teacher assigns work.
2. Student receives work.
3. Student completes work.
4. Teacher sees completion signal and status changes.

## 5) Student Route Contracts

- `/` Dashboard: orient learner and launch the next mission.
- `/lessons`: continue lesson path and class preparation.
- `/assignments`: prioritize and complete delegated tasks.
- `/progress`: visualize journey, stars, and unlock gates.
- `/profile`: manage learner profile and teacher relationship context.
- `/settings`: manage profile, learning, notifications, safety, and appearance.

## 6) Required UI States Per Screen

All student pages must support:

- loading
- empty
- error
- partial failure
- success
- locked or gated

## 7) Delivery Framework

1. Freeze information architecture and route purpose.
2. Lock page-level component contracts and CTA behavior.
3. Build interactions against mock data.
4. Define typed API contracts and map to UI props.
5. Ship one vertical end-to-end integration slice.
6. Integrate remaining pages incrementally.
7. Run hardening pass for accessibility, responsive behavior, analytics, and QA.

## 8) Definition Of Done Per Screen

- Primary and secondary CTA behavior is deterministic.
- All required UI states are implemented and testable.
- Accessibility baseline is met (focus, labels, keyboard, contrast).
- Mobile and desktop layouts are validated.
- Analytics events are emitted for key user actions.
- Acceptance criteria and test cases are complete.

## 9) V2 Implementation Blueprint

### Dashboard

- Components:
  - `MissionCard`
  - `AssignedByTeacherCard`
  - `ProgressSnapshotCard`
  - `NextUnlockCard`
  - `LearningToolsCard`
- Primary CTA: Start today's activity.
- Secondary CTA: Open assigned work list.
- Key data: next lesson, due-soon count, stars, level, unlock checkpoint.

### Lessons

- Components:
  - `LessonsHero`
  - `ClassPrepCard`
  - `LessonQueueList`
  - `WeeklyPlanDrawer`
- Primary CTA: Resume next lesson.
- Secondary CTA: Preview weekly plan.
- Key data: queue ordering, class timing, lesson statuses.

### Assignments

- Components:
  - `AssignmentsHero`
  - `DueSoonCard`
  - `TeacherSupportCard`
  - `AssignmentBoard`
  - `AssignmentList`
- Primary CTA: Open top priority task.
- Secondary CTA: Mark homework complete.
- Key data: grouped status columns and detailed list view.

### Progress

- Components:
  - `ProgressHeroStats`
  - `CurrentLevelCard`
  - `StarsCard`
  - `CheckpointTimeline`
- Primary CTA: Continue to next checkpoint.
- Secondary CTA: Review completed unit.
- Key data: units complete, stars, next gate, checkpoint percentages.

### Profile

- Components:
  - `ProfileHero`
  - `StudentIdentityCard`
  - `LearningModeCard`
  - `ProfileForm`
  - `TeacherRelationshipCard`
- Primary CTA: Save profile.
- Secondary CTA: View parent summary.
- Key data: learner identity, mode, preferences, assigned teacher metadata.

### Settings

- Components:
  - `SettingsTabs`
  - `ProfileSettings`
  - `LearningSettings`
  - `NotificationSettings`
  - `SafetySettings`
  - `AppearanceSettings`
- Primary CTA: Save current tab changes.
- Secondary CTA: Reset tab changes.
- Key data: tab-level persistence and settings ownership boundaries.

## 10) Interaction Rules

- Keep a primary CTA visible above the fold on every page.
- Show disabled CTA reason text when actions are blocked.
- Enforce deterministic status transitions:
  - `due-soon -> in-progress -> completed`
- For locked views, always show the exact prerequisite and next action.
- Use widget-level retry when possible; use full-page retry only for critical
  payload failure.

## 11) Analytics Baseline

Track at minimum:

- `student_dashboard_mission_start_clicked`
- `student_lessons_resume_clicked`
- `student_lessons_weekly_plan_opened`
- `student_assignment_open_priority_clicked`
- `student_assignment_status_changed`
- `student_progress_checkpoint_viewed`
- `student_profile_saved`
- `student_settings_tab_changed`
- `student_settings_saved`
- `student_error_retry_clicked`

Common event metadata:

- `student_id`
- `mode`
- `page`
- `component`
- `timestamp`
- optional `assignment_id` and `lesson_id`

## 12) Decision Log Template

- Decision ID: `DEC-YYYYMMDD-XX`
- Screen or area:
- Decision:
- Reason:
- Impact:
- Status: proposed, accepted, or superseded
