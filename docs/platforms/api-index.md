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

## Students Platform (Port 3002)

- No API routes yet (boilerplate).
