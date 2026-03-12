# 2026-03-11 Dependency Alignment

## Goal

Align `apps/student-platform` dependencies with `apps/teacher-platform` while
preserving the student platform requirement to use CSS Modules (not Tailwind).

## Actions Completed

1. Mirrored most teacher dependencies and scripts into student.
2. Removed Tailwind-specific dependencies from student:
   - `tailwind-merge`
   - `tailwindcss-animate`
   - `@tailwindcss/typography`
   - `tailwindcss`
3. Re-ran filtered install for lockfile consistency:
   - `pnpm install --filter student-platform`
4. Verified no `tailwind` string references remain in
   `apps/student-platform`.

## Result

- Student and teacher platforms now share a highly similar runtime/tooling stack.
- Student platform is explicitly configured to continue with CSS Modules.

## Notes

- Peer warnings remain for `react-day-picker` with React 19 in both apps.
- Teacher platform migration away from Tailwind is deferred to a later phase.
