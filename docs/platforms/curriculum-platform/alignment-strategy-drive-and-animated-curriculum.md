# Alignment strategy: asset library, Google Drive staging, animated curriculum

This document aligns a **north-star** (reusable asset library → animated curriculum experiences for teachers and students, with **Google Drive** as the authoring/staging source) with the **current** ecosystem (curriculum platform, `mediaManifest` on units, immutable publish snapshots, teacher/student proxies).

## Your intended workflow (how this maps to the builder)

You described three pieces that fit together cleanly:

### 1) Central asset library (individual files)

All **reusable** visuals and media live in one place first (e.g. Drive folders by **type**, not only by lesson):

| Category | Examples | Notes |
| --- | --- | --- |
| **Backgrounds** | scene PNG/WebP, parallax layers | Often `role: background` in manifest |
| **Icons / UI chrome** | buttons, badges, props | Small SVG/PNG; reusable across units |
| **Characters** | poses, expressions (per character folder) | May be many files per character |
| **Audio** | VO, SFX, music beds | Drive or synced CDN for playback |
| **Motion** (optional) | Lottie JSON, short video loops | “Animation” can be these + timed layout |

Each file gets a stable **`assetKey`** (slug) so the curriculum builder **references** the library instead of duplicating uploads per unit.

### 2) Static PowerPoints as **UI / flow guides** (not the runtime)

Treat each PowerPoint as a **design artifact**:

- Slides = **story beats**: what appears on screen, rough layout, order, and teaching intent.
- They are **guides to digitize**, not what students run in the browser (exporting PPT to “the lesson” usually produces poor UX and huge files).

**Digitization** means: for each slide (or slide group), you recreate the experience in data + assets:

- Pick **background**, **characters**, **icons** from the library.
- Add **copy** (can align with or extend `storyMarkdown`).
- Define **timing** (how long the “slide” stays, transitions)—this becomes a **scene** in a timeline stored with the unit (e.g. inside `mediaManifest` or a sibling JSON field later).

Optionally store a **link or Drive file ID** to the source `.pptx` on the unit as `designSource` so authors always know which deck they digitized (documentation only; not required at runtime for students).

### 3) Curriculum builder = where assembly + animation happen

Flow:

1. **Sync / browse** the asset library (from Drive) inside or alongside the curriculum platform.
2. **Create/edit unit** → attach assets and build an **ordered scene list** (slide 1 → scene 0, …).
3. **Preview** (later) in teacher/student-style player.
4. **Publish** → snapshot **pins** asset revisions / URLs so the animated lesson is stable for that version.

So: **PPT defines intent and order; the builder + library define the actual digital lesson.**

## Does this make sense?

**Yes, if roles are separated clearly:**

| Layer | Role |
| --- | --- |
| **Google Drive** | Human-friendly **library + staging**: folders per program/level/unit or per asset type; collaborators upload/replace files; optional review workflow *outside* the app. |
| **Curriculum platform (`curriculum.*`)** | **Structure + pedagogy**: programs, levels, units, `storyMarkdown`, `assignmentConfig`, **ordered references** into the asset library (not the binary source of truth for large files). |
| **Publish snapshots** | **Immutable contract** for what teachers/students receive at a given version: copy of narrative + **resolved asset descriptors** (see below)—so a published level does not silently change when someone edits a Drive file. |
| **Delivery** | Students/teachers need **fast, cacheable URLs**. Production usually means **Drive → object storage / CDN** (or Google Drive **file revision IDs** + short-lived export URLs), not hot-linking Drive UI for every page load. |

Without that separation, Drive becomes both CMS and CDN: quotas, latency, permission leaks, and “we published Tuesday but the image changed Wednesday” become hard problems.

## Current anchor in code

- Units already carry **`mediaManifest`** (`Json`) on `CurriculumUnit` and snapshot units—ideal place to store **asset references** (IDs, roles, timing hints) once you define a schema.
- **`storyMarkdown`** can stay the narrative spine; animation can be driven by a **companion manifest** (JSON) or conventions in markdown (later).
- **Publish** already freezes unit rows into **`CurriculumPublishSnapshotUnit`**—extend the mental model: at publish, **pin** asset revisions or **pin** CDN URLs generated from a sync job.

## Target concept (one paragraph)

You maintain a **Drive folder tree**: (a) **library** buckets (`backgrounds/`, `characters/`, `icons/`, `audio/`, …) and (b) optional **per-unit** folders for unit-specific exports. A **sync or import job** (or a future UI action in curriculum-platform) inventories files → **Drive file IDs + revision IDs** + **`assetKey`**. Authors **digitize** slide decks into **scenes** in the builder; **`mediaManifest`** (plus a future explicit `scenes[]` timeline) holds references and layout hints. Teacher/student clients render that timeline. **Publish** pins revisions/URLs so the digitized lesson matches a fixed version.

## Principles (non-negotiable for alignment)

1. **Stable keys** — Every asset has a stable `assetKey` (slug) inside the lib; Drive path is *mapping*, not identity.
2. **Pin on publish** — Published snapshots must reference **revision-specific** or **CDN-immutable** URLs so content is reproducible.
3. **Teachers vs students** — Same **published snapshot** for both unless you explicitly fork “teacher guide” assets later; avoid two divergent sources of truth.
4. **Auth boundary** — Drive credentials stay on **server-side** sync/workers; browsers never need full Drive access for learners.

## Phased alignment roadmap

### Phase 0 — Document & contract (now)

- [ ] Freeze a **v0 `mediaManifest` shape** (example below) in docs or a shared Zod package (include **`assetKind`**: `background` | `icon` | `character` | `audio` | `motion` | `other`).
- [ ] Document **Drive layout**: **library roots** by asset type *and* optional **`/Units/{unitSlug}/`** for deck-specific exports or scratch files.
- [ ] Naming convention for **`assetKey`** (e.g. `char-mimi-wave`, `bg-forest-clearing`) so the builder stays stable when files move between folders.
- [ ] Optional: **`designSource`** convention — store Drive link / file ID to the **source PowerPoint** per unit for traceability (authoring metadata, not student-critical).
- [ ] Decide **pinning strategy**: (A) store `driveFileId` + `revisionId` in manifest, or (B) sync to R2/S3/GCS and store public/signed URL at publish.

### Phase 1 — Asset library + “slide-accurate” static assembly

- [ ] Read-only **inventory**: script or internal API that walks Drive (service account) and outputs a manifest JSON or DB table `curriculum.asset_library_entries` (optional future table).
- [ ] Curriculum authoring UI: **picker** filtered by **asset kind** (background / icon / character / audio).
- [ ] **Scene list v0**: one scene per “slide” with **static** layout (positions optional later)—enough to prove “deck → digital” without motion yet.
- [ ] Teacher/student apps: render **static** step-through (or simple next/prev) from published snapshot.

### Phase 2 — Animated lesson (timeline + motion)

- [ ] Add **`scenes[]`** (inside or next to `mediaManifest`): per scene — `durationMs`, `assetKeys[]`, **layout** (e.g. character anchor points), **transitions**, **narration/audio** `assetKey`.
- [ ] **Player component** in student-platform (and teacher preview): timeline-driven; respects **reduced motion** fallback (static first slide or simpler transition).
- [ ] **Preview** path for managers: draft unit in same player (optional).
- [ ] Optional pipeline: PPT → exported **PDF/storyboard images** in Drive only as **author reference**, not student delivery—true digitization stays in builder data.

### Phase 3 — Operational hardening

- [ ] **Webhook or scheduled sync** when Drive files change (only affects **draft** until re-publish).
- [ ] **Quota + rate limits** for Drive API; backoff and caching of file metadata.
- [ ] **Accessibility**: captions, reduced motion, fallbacks when asset fails to load.

## Example: v0 `mediaManifest` shape (illustrative)

```json
{
  "driveRootHint": "folderId-or-label-for-authors",
  "designSource": {
    "type": "google_drive_file",
    "driveFileId": "optional-pptx-for-authors",
    "note": "UI guide only; students use scenes + assets below"
  },
  "assets": [
    {
      "assetKey": "bg-forest-opening",
      "assetKind": "background",
      "driveFileId": "…",
      "revisionId": "…",
      "mimeType": "image/webp"
    },
    {
      "assetKey": "char-leo-wave",
      "assetKind": "character",
      "driveFileId": "…",
      "revisionId": "…",
      "mimeType": "image/png"
    },
    {
      "assetKey": "icon-star-gold",
      "assetKind": "icon",
      "driveFileId": "…",
      "revisionId": "…",
      "mimeType": "image/svg+xml"
    }
  ],
  "scenes": [
    {
      "order": 0,
      "label": "Slide 1 — title",
      "durationMs": 5000,
      "layers": [
        { "role": "background", "assetKey": "bg-forest-opening" },
        { "role": "character", "assetKey": "char-leo-wave", "placement": "center-bottom" }
      ],
      "caption": "Welcome to the forest."
    }
  ]
}
```

Validate incrementally with Zod in curriculum-platform when you are ready; until then, `z.record(z.unknown())` remains as today.

## Open decisions (capture as you go)

1. **Drive only vs Drive + object storage** — Strongly recommend **hybrid** for production learners.
2. **Who runs sync** — Vercel cron, GitHub Action, or worker with service account.
3. **Animation format** — Lottie JSON vs video vs sprite sheets (affects pipeline from Drive).
4. **Copyright / PII** — Drive sharing settings vs service-account-owned folder.
5. **PowerPoint in the loop** — Keep as **author-only** reference vs invest in **import helpers** (e.g. slide thumbnails to Drive + manual scene mapping); full auto “PPT → timeline” is a large product on its own.

## Related docs

- [`README.md`](README.md) — curriculum platform purpose and publish flow.
- [`api/assignment-hooks.md`](api/assignment-hooks.md) — assignment/reporting contract (orthogonal to media, but same snapshot boundary).
- [`docs/architecture.md`](../../architecture.md) — multi-schema ownership.
- [`docs/operations.md`](../../operations.md) — env vars for cross-app curriculum fetch.

---

**Summary:** Keep **backgrounds, icons, characters, audio, etc.** as a **typed asset library** in Drive with stable **`assetKey`s**. Use **PowerPoints as digitization guides** (slide order + intent), and implement the real lesson as **scenes** in the curriculum builder that reference the library. **Publish** pins asset revisions/URLs so teachers and students get a stable, animated (or stepped) experience. This doc is the phased checklist without breaking the existing snapshot model.
