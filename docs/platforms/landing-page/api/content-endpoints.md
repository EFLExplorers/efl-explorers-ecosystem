# Content Endpoints

These endpoints require `x-efl-api-key` matching `EFL_API_KEY`.

## `GET /api/content`

Query:
- `type` (required, string)
- `category` (optional, string) — Only used for `type=faq`

Response: array of content items
```json
[
  {
    "id": "uuid",
    "content_type": "pricing",
    "slug": "starter",
    "title": "Starter",
    "subtitle": "Optional",
    "description": "Optional",
    "content": {},
    "metadata": {},
    "sort_order": 0,
    "active": true,
    "created_at": "2026-02-25T00:00:00.000Z",
    "updated_at": "2026-02-25T00:00:00.000Z"
  }
]
```

## `GET /api/page-content`

Query:
- `route` (required, string)

Response:
```json
{
  "id": "uuid",
  "route": "/",
  "title": "Home",
  "meta_description": "Optional",
  "sections": [
    {
      "id": "uuid",
      "section_key": "hero",
      "section_type": "content",
      "title": "Optional",
      "subtitle": "Optional",
      "heading": "Optional",
      "subheading": "Optional",
      "body": "Optional",
      "cta_label": "Optional",
      "cta_href": "Optional",
      "content": {},
      "data": {},
      "settings": {},
      "sort_order": 0,
      "active": true
    }
  ]
}
```

Section `content` is validated by `apps/landing-page/src/schemas/page-sections.ts`
when the section key is known (currently `hero` and `tagline`).

## `POST /api/revalidate`

Revalidates ISR pages:
- `/`, `/about`, `/pricing`, `/platforms/student`, `/platforms/teacher`

Response:
```json
{
  "message": "Revalidation triggered successfully",
  "revalidated": ["/", "/about", "/pricing"],
  "timestamp": "2026-02-25T00:00:00.000Z"
}
```

## `POST /api/getUserRole`

Request body:
```json
{ "userId": "uuid" }
```

Response:
```json
{ "role": "student" }
```
