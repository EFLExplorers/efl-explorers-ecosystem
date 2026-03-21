# Curriculum builder — full capability map

What **`apps/curriculum-platform`** can do **today** (UI vs API), how it connects to the database, and what is **planned / stubbed** in the wireframe shell.

## Who can use it

| Capability | Detail |
| --- | --- |
| **Audience** | **Curriculum managers** only (invite-only or bootstrap allowlist). |
| **Auth** | NextAuth **JWT**; credentials against `curriculum.managers`. |
| **Route guard** | Middleware: `/dashboard/*`, `/settings` require valid manager token; others redirect to `/login` or `/unauthorized`. |

## Surfaces (pages)

| Route | Purpose | Maturity |
| --- | --- | --- |
| `/login` | Manager sign-in | Functional |
| `/register` | Invite-based registration | Functional |
| `/unauthorized` | Wrong role / invalid session | Functional |
| `/` | Redirects to `/dashboard` if session, else `/login` | Functional |
| `/dashboard` | **Process hub** — CTAs into authoring, publish, invites, settings + live counts (programs, units, published levels, pending invites) | Functional |
| `/dashboard/programs` | **Main authoring workspace** | **Functional** for program/level/unit structure, **lesson content** (slug, order, summary, story markdown, media manifest JSON), **assignment config**, unit archive |
| `/dashboard/publish` | Readiness (status + active unit count), **assignment hooks preview**, **Publish** | Functional |
| `/dashboard/invites` | List + create invites | Functional |
| `/settings` | Manager name/email/created (read-only display) | **Wireframe** — profile only |

Shared chrome: **`DashboardShell`** — sidebar (Dashboard, Programs, Publish, Invites, Settings), header, sign out.

**Hub component:** [`ProcessHubCard`](../../../apps/curriculum-platform/src/components/dashboard/ProcessHubCard.tsx) — titled process cards with primary CTA links (used on `/dashboard`).

## Data model you are authoring

Hierarchy: **Program** → **Level** → **Unit** (treat **unit** as a “lesson” in product language).

| Entity | Stored as | Slug | Notes |
| --- | --- | --- | --- |
| Program | `curriculum.programs` | Unique globally | Title, description, soft-archive |
| Level | `curriculum.levels` | Unique per program | `orderIndex`, `status` (draft / published / archived) |
| Unit | `curriculum.units` | Unique per level | `summary`, `storyMarkdown`, `mediaManifest` (JSON), `assignmentConfig` (JSON), `estimatedMinutes`, `orderIndex`, `isArchived` |

**Published handoff:** `curriculum.publish_snapshots` + `curriculum.publish_snapshot_units` (immutable rows + `snapshotPayload` including `assignmentHooks`).

## What the UI can do today (`/dashboard/programs`)

- **Programs:** create (title, optional slug, optional description); **edit** title/slug/description; **archive** (soft-hide).
- **Levels:** **create** with title under selected program; **select** from list. There is **no** `PATCH /api/levels/[id]` route yet—level title/slug/order changes would require a new API + UI (publish still updates level `status` / `lastPublishedAt`).
- **Units:** **create** with title + **assignment** fields; **select** unit; **Lesson content** form (slug, order index, summary, story markdown, media manifest JSON with client JSON validation); **save lesson content**; **archive unit** (confirm); **Assignment config** form for the same unit.

## What the API exposes that the UI still does not

- **Unit `title` rename** — only via **`PATCH /api/units/[id]`** (create sets title; no title field in edit forms yet).
- Other advanced fields if added to the API later (e.g. reporting event arrays in assignment config) may lag the UI.

## Publishing (`/dashboard/publish`)

- Load programs → levels. **`GET /api/levels`** includes **`status`** and **`_count.units`** for **non-archived** units only (used for readiness).
- **Readiness** panel: level status + active unit count; warns when there are zero active units.
- **Preview assignment hooks** calls `GET /api/hooks/assignments/preview/[levelId]` and shows JSON (errors surface API message / invalid units).
- **Publish** is disabled when there are no active units; calls `POST /api/publish/levels/[levelId]`.
- **Blocks** publish if: level **archived**, **no units**, or any live unit has **invalid `assignmentConfig`** (returns `invalidUnits` detail).
- **Success:** shows new snapshot **version**; downstream can read via public API.

## Downstream consumption (other apps)

- **Public reader:** `GET /api/public/levels/[programSlug]/[levelSlug]` — level must be **published**; returns **current** snapshot + units (including `storyMarkdown`, `mediaManifest`, `assignmentConfig` as stored at publish).
- **Teacher platform:** authenticated proxy `GET /api/curriculum/published/[programSlug]/[levelSlug]` (requires `CURRICULUM_PLATFORM_URL`).
- **Student platform:** `GET /api/student/curriculum/[programSlug]/[levelSlug]` (same idea when configured).

## Assignment / reporting contract

- Per-unit **`assignmentConfig`** validated with Zod (`assignmentHooks.ts`): mode, due days, attempts, scoring, reporting events.
- **Publish** embeds **`assignmentHooks`** on the snapshot for integrations (see `api/assignment-hooks.md`).

## Invites & access

- **`GET|POST /api/auth/invites`** — managers create invites; registration flow consumes invite records.
- Bootstrap policy for **first manager** via env (see `backend/README.md`, `invitePolicy.ts`).

## What it does **not** do (yet)

- **No** built-in **Google Drive** browser, asset picker, or scene timeline editor (see `alignment-strategy-drive-and-animated-curriculum.md`).
- **No** rich **markdown editor** or **live lesson preview** player in-app.
- **No** automatic publish on save; **no** teacher/student roster or SSO (those are other apps).
- **Dashboard** does not yet show “continue editing” deep links or version diff (counts only).

## Quick “what can I do right now?” checklist

- [x] Onboard managers via invites  
- [x] Define programs, levels, units in the DB  
- [x] Configure assignment behavior per unit (UI)  
- [x] Edit story, summary, media manifest, slug, order from UI (Programs → Lesson content)  
- [x] Preview assignment hooks + publish readiness (Publish page)  
- [x] Publish versioned level snapshots for API consumers  
- [x] Optional shared-secret protection on public curriculum API  
- [ ] Asset library + animated scenes (roadmap)  

## Related docs

- [`README.md`](README.md) — purpose and runtime logic  
- [`api/README.md`](api/README.md) — endpoint list  
- [`authoring-flow-and-curriculum-storage.md`](authoring-flow-and-curriculum-storage.md) — draft vs publish + UI/API sequence  
- [`alignment-strategy-drive-and-animated-curriculum.md`](alignment-strategy-drive-and-animated-curriculum.md) — assets, Drive, digitization  
