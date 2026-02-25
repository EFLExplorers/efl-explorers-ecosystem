# Messages

- `POST /api/messages`
- `GET /api/messages/user/[userId]`
- `PATCH /api/messages/[id]/read`

Request body (POST):
```json
{
  "senderId": 1,
  "receiverId": 2,
  "content": "Hello!",
  "isRead": false
}
```

Response shape:
```json
{
  "id": 1,
  "senderId": 1,
  "receiverId": 2,
  "content": "Hello!",
  "isRead": false,
  "createdAt": "2026-02-25T00:00:00.000Z"
}
```
