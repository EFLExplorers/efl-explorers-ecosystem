# Assignment Hooks Contract

Assignment/reporting hooks are managed inside curriculum-platform and are validated before publish.

## Contract Source

- `apps/curriculum-platform/src/lib/assignmentHooks.ts`

## Unit-Level Input (`assignmentConfig`)

Each unit can carry `assignmentConfig` in `POST /api/units` and `PATCH /api/units/[id]`.

Supported shape:

- `mode`: `self_paced` | `teacher_led`
- `dueDays`: positive integer (max 365)
- `maxAttempts`: positive integer (max 20)
- `estimatedMinutes`: positive integer (max 600)
- `scoring`:
  - `passingScore`: 0-100
  - `masteryThreshold`: 0-100
- `reporting`:
  - `emitUnitCompletion`: boolean
  - `events[]`:
    - `eventKey`: string
    - `eventType`: `unit_started` | `checkpoint_submitted` | `checkpoint_passed` | `checkpoint_failed` | `unit_completed`
    - `required`: boolean
    - `metadata`: object

## Publish Enforcement

- `POST /api/publish/levels/[levelId]` validates all active units in the level.
- Publish fails with `400` if any unit has invalid `assignmentConfig`.
- On success, response includes `assignmentHooks` payload and snapshot stores it in `snapshotPayload.assignmentHooks`.

## Preview Endpoint

- `GET /api/hooks/assignments/preview/[levelId]` (manager-auth required)
- Returns:
  - `currentSnapshotVersion`
  - `previewSnapshotVersion`
  - `payload` (the normalized hook payload for next publish)
