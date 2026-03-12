# 2026-03-12 Checkpoint Model UI Application

## Goal

Apply the deterministic progression model into student-facing UI behavior and
state labels.

## Actions Completed

1. Added dashboard mission-control contract in student API response:
   - `live-lesson`
   - `priority-mission`
   - `next-discovery`
2. Updated dashboard UI to render mission mode, mission detail, and context CTA.
3. Updated progress API to return explicit checkpoint status:
   - `LOCKED`
   - `ACTIVE`
   - `COMPLETED`
4. Updated progress UI to show status badges and completion source where present.
5. Kept server as tracking owner and UI as state renderer.

## Why This Matters

- Aligns the student experience with the agreed backend ownership model.
- Makes progression states explicit and testable.
- Prepares the UI for enrollment/checkpoint entities without requiring AI logic.

## Verification

- Student lint and production build passed after changes.
