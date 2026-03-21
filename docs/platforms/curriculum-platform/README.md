# Curriculum Platform

The **curriculum platform** (`apps/curriculum-platform`) is the **internal authoring and publishing system** for canonical, story-style EFL curriculum: programs → levels → units. It is **not** the teacher or student classroom app; those **consume** published snapshots over HTTP.

## What it is for

- **Content orgs / product owners** (signed in as **curriculum managers**): structure programs and levels, write unit narrative (`storyMarkdown`), summaries, media manifests, and per-unit **`assignmentConfig`** (how assignments and reporting events should behave downstream).
- **Release discipline**: publishing a level creates an **immutable versioned snapshot** (units copied into `publish_snapshot_units`) and marks exactly one snapshot **current** per level. Teachers and students should read **published** data, not draft rows.
- **Integration contract**: each publish builds a normalized **`assignmentHooks`** payload (see `api/assignment-hooks.md`) stored on the snapshot so teacher/student/automation can align assignments and analytics with a specific curriculum version.

## What it is not

- Not a replacement for **`teachers.*` curriculum-like records** used in the teacher dashboard for day-to-day planning (see architecture doc: teacher domain vs canonical `curriculum` schema).
- Not where roster, SSO for teachers/students, or lesson scheduling live—those stay in landing, teacher, and student apps.

## Runtime logic (high level)

1. **Access**: Invite-only managers (`curriculum.managers`); registration gated by invites or a bootstrap allowlist (`invitePolicy`). NextAuth JWT sessions; API routes use `requireCurriculumApiSession`.
2. **Authoring**: CRUD for programs, levels, units via `/api/programs`, `/api/levels`, `/api/units`. Units carry JSON `assignmentConfig` validated with Zod (`assignmentHooks.ts`) on write.
3. **Preview**: `GET /api/hooks/assignments/preview/[levelId]` shows the hook payload that the **next** publish would emit (without writing).
4. **Publish** (`POST /api/publish/levels/[levelId]`):
   - Rejects archived levels, empty levels, or any unit with invalid `assignmentConfig`.
   - Computes next `version`, clears `isCurrent` on prior snapshots, inserts snapshot + snapshot rows for each live unit, embeds `assignmentHooks` in `snapshotPayload`, sets level `status` to `published` and `lastPublishedAt`.
5. **Read model for other apps**: `GET /api/public/levels/[programSlug]/[levelSlug]` returns the **current** published snapshot (level must be `published`). Optional `CURRICULUM_API_SHARED_SECRET` → require header `x-curriculum-shared-secret`.
6. **Downstream consumption**: Teacher and student apps typically call **their own** authenticated routes that proxy to the curriculum platform using `CURRICULUM_PLATFORM_URL` and the same shared secret (see `docs/operations.md`).

## Strategy & roadmap

- `alignment-strategy-drive-and-animated-curriculum.md` — Asset library + Google Drive staging + animated curriculum: how it fits publish snapshots and phased delivery.
- `authoring-flow-and-curriculum-storage.md` — Building levels/lessons → DB draft vs publish snapshot → downstream; evaluation of the current storage and delivery model; **UI/API sequence** (save → validate → publish).
- `capabilities.md` — **Full builder map**: pages, APIs, what the UI covers vs API-only, gaps and roadmap.

## Documentation index

- `ui/README.md`
- `ui-scaling.md` — wireframe shell, navigation, and scaling checklist
- `api/README.md`
- `api/assignment-hooks.md` — `assignmentConfig` + hook payload contract
- `backend/README.md`
- `database/README.md`
- `deployment-vercel.md`
