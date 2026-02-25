# Core Resources

## Students

- `GET /api/students`
- `POST /api/students`
- `GET /api/students/[id]`
- `PUT|PATCH /api/students/[id]`
- `DELETE /api/students/[id]`

Request body (POST):
```json
{
  "fullName": "Emma Wilson",
  "email": "emma@example.com",
  "level": "Pre A1",
  "unitId": "ESL-A1",
  "nativeLanguage": "Spanish",
  "guardianName": "Sarah Wilson",
  "guardianContact": "555-123-4567",
  "attendanceRate": 95,
  "performanceLevel": "A",
  "notes": "Optional"
}
```

Response shape:
```json
{
  "id": 1,
  "fullName": "Emma Wilson",
  "email": "emma@example.com",
  "level": "Pre A1",
  "unitId": "ESL-A1",
  "nativeLanguage": "Spanish",
  "guardianName": "Sarah Wilson",
  "guardianContact": "555-123-4567",
  "attendanceRate": 95,
  "performanceLevel": "A",
  "notes": "Optional",
  "createdAt": "2026-02-25T00:00:00.000Z",
  "updatedAt": "2026-02-25T00:00:00.000Z"
}
```

## Lessons

- `GET /api/lessons`
- `POST /api/lessons`
- `GET /api/lessons/[id]`
- `PUT|PATCH /api/lessons/[id]`
- `DELETE /api/lessons/[id]`

Request body (POST):
```json
{
  "title": "Daily Routines Vocabulary",
  "subject": "ESL",
  "description": "Optional",
  "classId": "Pre A1",
  "date": "2026-02-25",
  "startTime": "10:30",
  "endTime": "11:45",
  "location": "Language Lab 1",
  "status": "upcoming"
}
```

Response shape:
```json
{
  "id": 1,
  "title": "Daily Routines Vocabulary",
  "subject": "ESL",
  "description": "Optional",
  "classId": "Pre A1",
  "date": "2026-02-25T00:00:00.000Z",
  "startTime": "10:30",
  "endTime": "11:45",
  "location": "Language Lab 1",
  "status": "upcoming",
  "createdAt": "2026-02-25T00:00:00.000Z",
  "updatedAt": "2026-02-25T00:00:00.000Z"
}
```

## Curriculum

- `GET /api/curriculum`
- `POST /api/curriculum`
- `GET /api/curriculum/[id]`
- `PUT|PATCH /api/curriculum/[id]`
- `DELETE /api/curriculum/[id]`

Request body (POST):
```json
{
  "title": "ESL Curriculum - Pre A1",
  "subject": "ESL",
  "level": "Pre A1",
  "description": "Optional",
  "objectives": "Optional",
  "units": []
}
```

Response shape:
```json
{
  "id": 1,
  "title": "ESL Curriculum - Pre A1",
  "subject": "ESL",
  "level": "Pre A1",
  "description": "Optional",
  "objectives": "Optional",
  "units": [],
  "createdAt": "2026-02-25T00:00:00.000Z",
  "updatedAt": "2026-02-25T00:00:00.000Z"
}
```

## Events

- `GET /api/events`
- `POST /api/events`

Request body (POST):
```json
{
  "title": "Workshop",
  "description": "Optional",
  "date": "2026-02-25",
  "startTime": "09:00",
  "endTime": "10:00",
  "location": "Room 101",
  "type": "class"
}
```

Response shape:
```json
{
  "id": 1,
  "title": "Workshop",
  "description": "Optional",
  "date": "2026-02-25T00:00:00.000Z",
  "startTime": "09:00",
  "endTime": "10:00",
  "location": "Room 101",
  "type": "class",
  "createdAt": "2026-02-25T00:00:00.000Z"
}
```

## Materials

- `GET /api/materials`
- `POST /api/materials`

Request body (POST):
```json
{
  "title": "Daily Routines Flashcards",
  "description": "Optional",
  "category": "Flashcards",
  "url": "/materials/daily-routines.pdf",
  "createdBy": 1
}
```

Response shape:
```json
{
  "id": 1,
  "title": "Daily Routines Flashcards",
  "description": "Optional",
  "category": "Flashcards",
  "url": "/materials/daily-routines.pdf",
  "createdBy": 1,
  "createdAt": "2026-02-25T00:00:00.000Z"
}
```

## Announcements

- `GET /api/announcements`
- `POST /api/announcements`

Request body (POST):
```json
{
  "title": "ESL Workshop",
  "content": "Reminder: no classes Friday.",
  "priority": "high",
  "createdBy": 1
}
```

Response shape:
```json
{
  "id": 1,
  "title": "ESL Workshop",
  "content": "Reminder: no classes Friday.",
  "priority": "high",
  "createdBy": 1,
  "createdAt": "2026-02-25T00:00:00.000Z"
}
```
