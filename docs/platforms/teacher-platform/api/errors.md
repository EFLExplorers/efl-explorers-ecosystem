# Teacher Platform API Errors

Unless noted, unexpected errors return `500`.

## Core Resources

- `GET /api/students`: `500` on fetch error.
- `POST /api/students`: `400` validation, `500` create error.
- `GET /api/students/[id]`: `404` not found, `500` fetch error.
- `PUT|PATCH /api/students/[id]`: `400` validation, `500` update error.
- `DELETE /api/students/[id]`: `500` delete error.

- `GET /api/lessons`: `500` on fetch error.
- `POST /api/lessons`: `400` validation, `500` create error.
- `GET /api/lessons/[id]`: `404` not found, `500` fetch error.
- `PUT|PATCH /api/lessons/[id]`: `400` validation, `500` update error.
- `DELETE /api/lessons/[id]`: `500` delete error.

- `GET /api/curriculum`: `500` on fetch error.
- `POST /api/curriculum`: `400` validation, `500` create error.
- `GET /api/curriculum/[id]`: `400` invalid id, `404` not found, `500` fetch error.
- `PUT|PATCH /api/curriculum/[id]`: `400` invalid id or validation, `404` not found, `500` update error.
- `DELETE /api/curriculum/[id]`: `400` invalid id, `404` not found, `500` delete error.

- `GET /api/events`: `500` on fetch error.
- `POST /api/events`: `400` validation, `500` create error.

- `GET /api/materials`: `500` on fetch error.
- `POST /api/materials`: `400` validation, `500` create error.

- `GET /api/announcements`: `500` on fetch error.
- `POST /api/announcements`: `400` validation, `500` create error.

## Tasks and Bookmarks

- `GET /api/tasks`: `500` on fetch error.
- `POST /api/tasks`: `400` validation, `500` create error.
- `PATCH /api/tasks/[id]`: `400` invalid id or validation, `404` not found, `500` update error.
- `DELETE /api/tasks/[id]`: `400` invalid id, `404` not found, `500` delete error.
- `GET /api/tasks/user/[userId]`: `500` on fetch error.

- `GET /api/bookmarks`: `500` on fetch error.
- `POST /api/bookmarks`: `400` validation, `500` create error.
- `GET /api/bookmarks/[userId]`: `500` on fetch error.

## Messages

- `POST /api/messages`: `400` validation, `500` create error.
- `GET /api/messages/user/[userId]`: `500` on fetch error.
- `PATCH /api/messages/[id]/read`: `400` invalid id, `404` not found, `500` update error.

## Lesson Materials

- `POST /api/lesson-materials`: `400` validation, `500` create error.
- `DELETE /api/lesson-materials/[id]`: `400` invalid id, `404` not found, `500` delete error.
- `GET /api/lesson-materials/lesson/[lessonId]`: `400` invalid id, `500` fetch error.

## Method Not Allowed

All routes return `405` for unsupported methods.
