# Lesson Materials

- `POST /api/lesson-materials`
- `DELETE /api/lesson-materials/[id]`
- `GET /api/lesson-materials/lesson/[lessonId]`

Request body (POST):
```json
{ "lessonId": 1, "materialId": 1 }
```

Response shape:
```json
{
  "id": 1,
  "lessonId": 1,
  "materialId": 1,
  "createdAt": "2026-02-25T00:00:00.000Z"
}
```
