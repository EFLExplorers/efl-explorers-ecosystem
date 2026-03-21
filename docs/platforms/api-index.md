# API Endpoints Index

Single-sheet view of all current endpoints.

## Landing Page (Port 3000)

### Content + Pages (API Key Required)

- `GET /api/content`
- `GET /api/page-content`
- `POST /api/revalidate`
- `POST /api/getUserRole`

### Auth

- `POST /api/auth/register`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/sso-token`
- `GET|POST /api/auth/[...nextauth]`

## Teacher Platform (Port 3001)

### Core Resources

- `GET /api/students`
- `POST /api/students`
- `GET /api/students/[id]`
- `PUT|PATCH /api/students/[id]`
- `DELETE /api/students/[id]`

- `GET /api/lessons`
- `POST /api/lessons`
- `GET /api/lessons/[id]`
- `PUT|PATCH /api/lessons/[id]`
- `DELETE /api/lessons/[id]`

- `GET /api/curriculum`
- `POST /api/curriculum`
- `GET /api/curriculum/[id]`
- `PUT|PATCH /api/curriculum/[id]`
- `DELETE /api/curriculum/[id]`

- `GET /api/events`
- `POST /api/events`

- `GET /api/materials`
- `POST /api/materials`

- `GET /api/announcements`
- `POST /api/announcements`

### Tasks + Bookmarks

- `GET /api/tasks`
- `POST /api/tasks`
- `PATCH /api/tasks/[id]`
- `DELETE /api/tasks/[id]`
- `GET /api/tasks/user/[userId]`

- `GET /api/bookmarks`
- `POST /api/bookmarks`
- `GET /api/bookmarks/[userId]`

### Messages

- `POST /api/messages`
- `GET /api/messages/user/[userId]`
- `PATCH /api/messages/[id]/read`

### Lesson Materials

- `POST /api/lesson-materials`
- `DELETE /api/lesson-materials/[id]`
- `GET /api/lesson-materials/lesson/[lessonId]`

### Published curriculum (proxy to curriculum-platform)

- `GET /api/curriculum/published/[programSlug]/[levelSlug]` — requires teacher session; forwards to `CURRICULUM_PLATFORM_URL` / `api/public/levels/...`.

## Curriculum Platform (Port 3003)

### Auth + invites

- `POST /api/auth/register`
- `GET /api/auth/invites`
- `POST /api/auth/invites`
- `GET|POST /api/auth/[...nextauth]` (handler under `src/app/api/auth/`)

### Authoring

- `GET|POST /api/programs`, `GET|PATCH|DELETE /api/programs/[id]`
- `GET|POST /api/levels`, `GET|POST /api/units`, `PATCH|DELETE /api/units/[id]`

### Publish + public read

- `POST /api/publish/levels/[levelId]`
- `GET /api/public/levels/[programSlug]/[levelSlug]`
- `GET /api/hooks/assignments/preview/[levelId]`

Details: `docs/platforms/curriculum-platform/api/README.md`.

## Student Platform (Port 3002)

### Student session APIs

- `GET /api/student/dashboard`
- `GET /api/student/lessons`
- `GET /api/student/progress`
- `GET /api/student/assignments`
- `PATCH /api/student/assignments/[id]`
- `GET /api/student/curriculum/[programSlug]/[levelSlug]` — proxies published curriculum when configured.

### Auth

- `GET|POST /api/auth/[...nextauth]`

Details: `docs/platforms/student-platform/api/README.md`.
