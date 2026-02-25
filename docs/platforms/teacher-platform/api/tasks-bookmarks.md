# Tasks and Bookmarks

## Tasks

- `GET /api/tasks` (optional `userId` query; defaults to `1`)
- `POST /api/tasks`
- `PATCH /api/tasks/[id]`
- `DELETE /api/tasks/[id]`
- `GET /api/tasks/user/[userId]`

Request body (POST):
```json
{
  "title": "Prepare flashcards",
  "completed": false,
  "dueDate": "2026-02-25",
  "userId": 1
}
```

Response shape:
```json
{
  "id": 1,
  "title": "Prepare flashcards",
  "completed": false,
  "dueDate": "2026-02-25T00:00:00.000Z",
  "userId": 1,
  "createdAt": "2026-02-25T00:00:00.000Z"
}
```

## Bookmarks

- `GET /api/bookmarks` (optional `userId` query; defaults to `1`)
- `POST /api/bookmarks`
- `GET /api/bookmarks/[userId]`

Request body (POST):
```json
{
  "title": "ESL Resource",
  "url": "https://example.com/resource",
  "category": "Teaching",
  "userId": 1
}
```

Response shape:
```json
{
  "id": 1,
  "title": "ESL Resource",
  "url": "https://example.com/resource",
  "category": "Teaching",
  "userId": 1,
  "createdAt": "2026-02-25T00:00:00.000Z"
}
```
