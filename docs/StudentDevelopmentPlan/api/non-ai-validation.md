# Non-AI Validation Specification

This document defines deterministic validation rules for student progression.
No checkpoint advancement depends on AI model output.

## Policy

- Progression is server-owned and rule-based.
- Student clients submit activity evidence only.
- Server decides pass/fail and writes checkpoint state.
- Teacher can manually override checkpoint state with audit trail.

## Core Entities

## Curriculum Structure (read-only authoring model)

- `CurriculumLevel` (0-5)
- `CurriculumUnit` (children of level)
- `CurriculumLesson` (children of unit)

These entities define the instructional graph and sequencing only.

## Student Progress Model

- `Enrollment`
  - links student to active level/planet
  - tracks current unit/lesson pointer
- `ProgressCheckpoint`
  - one record per student + checkpoint target
  - status enum: `LOCKED | ACTIVE | COMPLETED`
  - completion source enum: `SYSTEM_RULE | TEACHER_OVERRIDE`
  - includes `completedAt`, `completedBy`, `notes`
- `Assignment`
  - teacher-priority tasks
  - can override generic "next lesson" ordering on dashboard

## Validation Rule Model

Each checkpoint should carry a `validationConfig` (JSON) resolved server-side.

Recommended fields:

- `activityType`: `VOCAB_MATCH | MCQ | ORDERING | FILL_BLANK | SPEAKING_MARKED`
- `attemptPolicy`:
  - `maxAttempts`
  - `cooldownSeconds` (optional)
- `passCriteria`:
  - `minCorrect`
  - `minPercent`
  - `requiredTerms` (allow-list)
  - `forbiddenTerms` (deny-list, optional)
- `normalization`:
  - lowercase
  - trim whitespace
  - punctuation strip
  - accepted aliases map

## Deterministic Evaluation

Given a student submission:

1. Resolve checkpoint config.
2. Normalize submission tokens.
3. Score against criteria.
4. Return stable result:
   - `PASS`
   - `FAIL_RETRY_ALLOWED`
   - `FAIL_ATTEMPTS_EXHAUSTED`
5. On `PASS`, transition `ProgressCheckpoint` to `COMPLETED`.
6. Update unlock state for next checkpoint(s) in the same transaction.

## Suggested API Contracts

## Submit Activity Evidence

- `POST /api/student/checkpoints/[id]/submit`
- Request:
  - `{ payload, attemptNumber, assignmentId? }`
- Success:
  - `{ data: { result, score, checkpointStatus, unlocks }, error: null }`
- Failure:
  - `{ data: null, error: { code, message, details? } }`

## Teacher Override

- `PATCH /api/teacher/checkpoints/[id]/override`
- Request:
  - `{ status, reason }`
- Writes `completionSource = TEACHER_OVERRIDE`.

## Student Progress Read

- `GET /api/student/progress`
- Must return checkpoint status and lock reasons based on deterministic state.

## State Transition Rules

- Default: `LOCKED -> ACTIVE -> COMPLETED`
- Reverse transitions are disallowed except teacher override.
- Teacher override must create audit entry with actor and reason.

## Live Lesson Sync

- During live teaching, checkpoint state changes should be published in real time.
- Transport can be Pusher or equivalent realtime channel.
- Realtime only broadcasts state deltas; server remains source of truth.

## Security and Ownership

- Student cannot mutate checkpoint status directly.
- Student can submit evidence only for owned active checkpoints.
- Server resolves `studentId` from session, not client-provided IDs.
- Assignment visibility and progress writes are scoped by enrollment ownership.

## Why This Approach

- Predictable outcomes and explainable pass/fail logic.
- Lower operational complexity than model-based scoring.
- Easier QA and debugging through deterministic tests.
- Clear manual control path for teacher intervention.
