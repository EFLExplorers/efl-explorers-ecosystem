# Teacher Platform API Examples

## Core Resources

```bash
curl -s "http://localhost:3001/api/students"
```

```bash
curl -s -X POST "http://localhost:3001/api/lessons" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Daily Routines\",\"subject\":\"ESL\",\"classId\":\"Pre A1\",\"date\":\"2026-02-25\",\"startTime\":\"10:30\",\"endTime\":\"11:45\"}"
```

```bash
curl -s "http://localhost:3001/api/curriculum"
```

```bash
curl -s -X POST "http://localhost:3001/api/events" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"Workshop\",\"date\":\"2026-02-25\",\"startTime\":\"09:00\",\"endTime\":\"10:00\"}"
```

```bash
curl -s "http://localhost:3001/api/materials"
```

```bash
curl -s -X POST "http://localhost:3001/api/announcements" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"ESL Workshop\",\"content\":\"Reminder\",\"createdBy\":1}"
```

## Tasks and Bookmarks

```bash
curl -s "http://localhost:3001/api/tasks?userId=1"
```

```bash
curl -s -X POST "http://localhost:3001/api/bookmarks" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"ESL Resource\",\"url\":\"https://example.com\",\"userId\":1}"
```

## Messages

```bash
curl -s -X POST "http://localhost:3001/api/messages" \
  -H "Content-Type: application/json" \
  -d "{\"senderId\":1,\"receiverId\":2,\"content\":\"Hello\"}"
```

## Lesson Materials

```bash
curl -s -X POST "http://localhost:3001/api/lesson-materials" \
  -H "Content-Type: application/json" \
  -d "{\"lessonId\":1,\"materialId\":1}"
```
