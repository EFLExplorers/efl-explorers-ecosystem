# 2026-03-11 Lint Tooling Alignment

## Goal

Make lint scripts run consistently across student and teacher platforms after the
Next.js `next lint` command behavior change.

## Problem Observed

- `pnpm --filter student-platform lint` and
  `pnpm --filter teachers-platform lint` both failed with:
  `Invalid project directory .../lint`

## Actions Completed

1. Updated lint script in both apps from `next lint` to `eslint .`.
2. Aligned ESLint version to v9 in both app package files.
3. Added missing flat config in teachers app:
   - `apps/teachers-platform/eslint.config.js`
4. Reinstalled dependencies with filters for both apps.
5. Verified lint command behavior:
   - student lint passes cleanly.
   - teacher lint runs and reports warnings (no errors).

## Result

- Lint tooling now executes successfully in both apps.
- Existing teacher warnings are visible and can be addressed incrementally.
