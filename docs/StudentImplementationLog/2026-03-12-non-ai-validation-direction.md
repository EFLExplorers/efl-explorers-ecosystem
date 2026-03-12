# 2026-03-12 Non-AI Validation Direction

## Goal

Capture the agreed curriculum-progression direction where checkpoint advancement
is deterministic and server-owned, without AI scoring dependencies.

## Decisions Logged

1. AI is removed from core progression logic.
2. Student progression state remains hierarchical:
   - `LOCKED -> ACTIVE -> COMPLETED`
3. Student client submits evidence only; server evaluates pass/fail using rules.
4. Teacher retains manual override capability with audit trail.
5. Assignment remains a priority mission layer that can override default "next"
   lesson ordering.

## Planning Artifacts Updated

- Added `docs/StudentDevelopmentPlan/api/non-ai-validation.md`.
- Updated API surface doc to include checkpoint submit endpoint.
- Updated integration map to mark deterministic checkpoint flow and ownership.

## Impact on Delivery Plan

- Low impact on existing UI shell work.
- Medium impact on API and data-model sequencing due to new checkpoint contract.
- Lower technical risk versus AI-dependent scoring.

## Immediate Next Steps

1. Add Prisma entities for enrollment and progress checkpoints.
2. Implement `POST /api/student/checkpoints/[id]/submit` with rule evaluation.
3. Add teacher override endpoint and audit fields.
4. Wire dashboard and progress pages to checkpoint-derived status.
