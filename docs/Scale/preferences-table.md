# Preferences Table (Scale Plan)

This document captures the planned preferences table for teacher accounts.
We will revisit after the curriculum work is complete.

## Goal

Store per-user preference data that is currently mocked or not persisted in
the teacher platform settings page.

## Proposed Fields (v1)

- `user_id` (string, auth.users.id)
- `subject` (string | null)
- `grade_level` (string | null)
- `preferred_classroom` (string | null)
- `preferred_schedule` (string | null)
- `contact_email` (string | null)
- `phone` (string | null)
- `address` (string | null)
- `bio` (string | null)
- `created_at` (timestamp)
- `updated_at` (timestamp)

## API Notes

- Read: fetch on settings page load.
- Write: save updates from the settings form.
- Validation: reuse shared schema where possible.

## Access Rules

- Only the authenticated user can read/write their preference row.
- Admin override can be added later if needed.

## Open Questions

- Do we want separate tables for contact details vs teaching preferences?
- Should preferences be required to complete onboarding?
