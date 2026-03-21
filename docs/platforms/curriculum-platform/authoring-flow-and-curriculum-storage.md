# Authoring flow: levels, lessons, database curriculum, and “is this the right storage model?”

This doc ties together **how you want to work** (build out levels with lessons → curriculum lands in the DB → downstream apps consume it) with **what the repo does today**, and evaluates **whether the current save/use pattern is a good long-term choice**.

## Vocabulary (avoid mix-ups)

| Your language | Typical mapping in this codebase |
| --- | --- |
| **Program** | `CurriculumProgram` |
| **Level** | `CurriculumLevel` (a band/module inside a program) |
| **Lesson** | Usually a **`CurriculumUnit`** (ordered inside a level). If you later split “lesson” into multiple units, the same ideas apply. |

Downstream APIs speak in **program slug + level slug** and return the **current published snapshot** for that level (ordered units).

## The flow you want (end state)

**Intent:** As you **author** (create/edit level + lessons), the system should **continuously construct** the canonical curriculum in the database, and **pass** the right shape to teacher/student apps when needed.

A sound split is:

### 1) While authoring — **draft curriculum in `curriculum.*` (live rows)**

- Creating/updating **programs, levels, units** via the curriculum platform APIs **already writes** to PostgreSQL (`curriculum.programs`, `curriculum.levels`, `curriculum.units`).
- That **is** your “database curriculum under construction”: markdown, `mediaManifest`, `assignmentConfig`, order indices, etc.
- **Teacher/student apps should not treat draft rows as the source of truth** for production learners—drafts can change minute to minute.

### 2) When you’re ready to ship — **publish** builds the **handoff artifact**

- **`POST /api/publish/levels/[levelId]`** is the deliberate step that:
  - Validates units (e.g. `assignmentConfig`).
  - Writes **`CurriculumPublishSnapshot`** + **`CurriculumPublishSnapshotUnit`** (frozen copy per version).
  - Marks one snapshot **`isCurrent`** for that level.
  - Produces **`assignmentHooks`** embedded in the snapshot payload for integrations.

That snapshot is what **`GET /api/public/levels/[programSlug]/[levelSlug]`** (and teacher/student **proxies**) are designed to consume.

### 3) “Start the process” when building lessons

You can interpret “start the process” in two compatible ways:

| Interpretation | Behavior |
| --- | --- |
| **A — Always-on construction (recommended baseline)** | Each **save** of a unit/level **updates the DB draft** immediately. No extra pipeline required for “having a curriculum in the database.” |
| **B — Downstream-ready package** | The **publish** action (manual button, or **gated automation**) **starts** the process of creating the **versioned, immutable** package other apps rely on. |

**Recommendation:** Keep **A** as default UX (autosave or explicit save → DB). Treat **B** as **publish** (human-approved or checklist-complete), not “every keystroke publishes,” so students never see half-finished content.

Optional later: when a level meets rules (all units valid, all assets resolved), **offer** “Publish now” or a **scheduled** publish—still a conscious release boundary.

## UI/API sequence: from lesson edit → validation → publish readiness

This is the **intended operational sequence** aligned with the codebase. Steps marked **(UI today)** exist in the dashboard; **(API today)** means you can call the route (e.g. from another tool or future UI).

### A. Draft construction (as you build levels & lessons)

1. **Manager signs in** — NextAuth session with `curriculum_manager` role; middleware protects `/dashboard/*` and `/settings`.
2. **Create or select a program** **(UI today)** — `POST /api/programs`, `GET /api/programs`, `PATCH /api/programs/[id]`, `DELETE` (archive) from **Programs** workspace.
3. **Create levels under the program** **(UI today)** — `POST /api/levels` with `programId` + title (optional `slug` / `orderIndex` in API body; UI sends title only). **Editing** a level after create is **not** exposed yet (no levels PATCH route).
4. **Create units (“lessons”) under a level** **(UI today)** — `POST /api/units` with title + optional `estimatedMinutes` + `assignmentConfig` from the form.
5. **Refine the selected unit** **(partial UI today)** — The Programs page **saves `assignmentConfig` + `estimatedMinutes`** via `PATCH /api/units/[id]`. Fields such as **`summary`**, **`storyMarkdown`**, **`mediaManifest`**, **`slug`**, **`orderIndex`**, **`isArchived`** are supported by the **API** but **not yet exposed** in the wireframe UI—use API or add UI when you implement narrative/media/scenes.
6. **Preview integration payload** **(UI today)** — On **Publish**, **Preview assignment hooks** calls `GET /api/hooks/assignments/preview/[levelId]` and shows the JSON for the *next* publish (no snapshot write).

### B. Publish readiness (gates before downstream sees content)

7. **Pre-flight checks (conceptual)** — Before calling publish, ensure:
   - Level is **not archived**.
   - At least **one non-archived unit**.
   - Every included unit has **valid `assignmentConfig`** (same rules as publish).
   - *Future:* `mediaManifest` / asset pins valid per your alignment doc.
8. **Publish the level** **(UI today)** — **Publish** page → `POST /api/publish/levels/[levelId]`. On success: new snapshot **version**, **`isCurrent`** flipped, **`assignmentHooks`** in `snapshotPayload`, level **`published`**.
9. **Downstream read** — Teacher/student apps use **proxies** → curriculum **`GET /api/public/levels/[programSlug]/[levelSlug]`** (optional shared secret). Only **published** levels with a **current** snapshot return data.

### C. Optional async “process” (not required for correctness)

- **On unit save:** persist draft only (already happens). Optionally later: enqueue **validation warnings**, **Drive sync**, or **search index**—without auto-publishing.
- **On publish success:** optionally notify webhooks, invalidate caches, or log release notes—**after** the snapshot exists.

## Is this method of saving and using curriculum “the best”?

There is no single universal best; there is a **good default for your architecture**. Here is an honest evaluation.

### What you have today (strengths)

1. **Clear write path** — Authoring mutates **normalized** program/level/unit tables; easy to query and back up.
2. **Immutable read path for learners** — Snapshots mean “what we taught Tuesday” stays addressable and stable (version + `isCurrent`).
3. **Simple integration surface** — HTTP JSON for teacher/student proxies; no tight coupling to Drive or the authoring UI.
4. **Flexible payloads** — `mediaManifest` / timelines as **JSON** lets the asset library + animation model evolve without a migration per new field (early phase win).

### Tradeoffs (not wrong, just conscious)

1. **Two layers of truth** — Draft units vs published snapshot units. That is **intentional**; the alternative (everyone reads draft) is worse for classrooms.
2. **JSON blobs** — Great for speed of iteration; weaker for **SQL analytics** (“which units use asset X?”) until you add indexes, materialized views, or normalize.
3. **Snapshot duplication** — Copies unit fields into snapshot tables. **Storage cost is usually small** compared to media; you gain reproducibility and simpler reader queries.
4. **Publish is a choke point** — If you need **instant** propagation to every edge without a publish step, you’d need a different model (usually worse for curriculum). For education content, a **publish boundary** is usually correct.

### Alternatives (when to consider them)

| Approach | When it might win |
| --- | --- |
| **Normalized `asset` / `scene` tables** + FKs from units | Heavy reporting, reuse rules, strict integrity, many authors |
| **Event sourcing** for all edits | Very large teams, audit-heavy workflows (complexity cost) |
| **CDN-only curriculum** (no DB snapshot) | Static sites only—you’d lose tight **assignmentHooks** + DB-backed governance |
| **Auto-publish on every unit save** | Rarely desirable; use **preview** environments or draft flags instead |

**Verdict for where you are:** The **draft tables + explicit publish snapshots + public/proxy read** pattern is **appropriate and scalable** for EFL curriculum with assignments and versioning. Plan to **tighten schemas** (Zod for `mediaManifest`, optional relational asset registry) as the library grows—not to throw the model away.

## Practical alignment checklist

- [ ] Treat **unit saves** as “constructing DB curriculum” (draft).
- [ ] Treat **publish** as “constructing the **downstream** curriculum package” (snapshot + hooks).
- [ ] Keep **teacher/student** on **published** data only (proxies already point at public snapshot reader).
- [ ] When animation/assets land, add **validation at publish** (and optionally **warnings** on draft save) so broken manifests never ship.

## Related docs

- [`README.md`](README.md) — runtime logic and scope.
- [`alignment-strategy-drive-and-animated-curriculum.md`](alignment-strategy-drive-and-animated-curriculum.md) — Drive library, scenes, digitization.
- [`api/assignment-hooks.md`](api/assignment-hooks.md) — hook payload at publish.
