# 2026-03-11 Student Mock Portal Flow

## Goal

Shift student UI development to a realistic authenticated experience without
waiting for full auth implementation.

## Actions Completed

1. Removed `SSO` from student navigation.
2. Removed student SSO page route scaffold (`src/pages/sso.tsx`).
3. Added centralized mock logged-in portal data:
   - `src/lib/mock/student-portal-data.ts`
4. Updated dashboard to consume shared mock student/teacher/assignment/lesson data.
5. Rebuilt core pages with mock portal UX:
   - lessons
   - assignments
   - progress
   - profile

## Product Behavior Direction

- Student signs in through landing page, same model as teacher entry.
- Student app focuses on authenticated in-app flow:
  - delegated tasks
  - class schedule context
  - level/planet progression
  - teacher relationship visibility
