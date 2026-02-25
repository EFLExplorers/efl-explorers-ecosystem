# Shared Models

## `Page`

- `id` (uuid)
- `route` (string, unique)
- `title` (text, optional)
- `meta_description` (text, optional)
- `layout` (string)
- `created_at` (datetime)
- `updated_at` (datetime)

## `PageSection`

- `id` (uuid)
- `page_id` (uuid, optional)
- `section_key` (string)
- `section_type` (string)
- `title` (text, optional)
- `subtitle` (text, optional)
- `heading` (text, optional)
- `subheading` (text, optional)
- `body` (text, optional)
- `cta_label` (text, optional)
- `cta_href` (text, optional)
- `content` (json, optional)
- `settings` (json, optional)
- `data` (json, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)
- `updated_at` (datetime)

## `ContentItem`

- `id` (uuid)
- `page_id` (uuid, optional)
- `section_key` (string, optional)
- `content_type` (string)
- `slug` (string, optional, unique)
- `title` (text, optional)
- `subtitle` (text, optional)
- `description` (text, optional)
- `content` (json, optional)
- `metadata` (json, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)
- `updated_at` (datetime)

## `SiteSection`

- `id` (uuid)
- `section_key` (string, unique)
- `section_type` (string)
- `content` (json, optional)
- `settings` (json, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)
- `updated_at` (datetime)

## `RouteSection`

- `id` (uuid)
- `page_id` (uuid)
- `section_key` (string)
- `section_type` (string)
- `expected_content` (json, optional)
- `notes` (text, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)
- `updated_at` (datetime)

## `ContentRelationship`

- `id` (uuid)
- `parent_id` (uuid)
- `child_id` (uuid)
- `relationship_type` (string)
- `sort_order` (int)
- `created_at` (datetime)

## `MediaAsset`

- `id` (uuid)
- `filename` (text)
- `original_name` (text)
- `url` (text)
- `alt_text` (text, optional)
- `caption` (text, optional)
- `mime_type` (text)
- `size_bytes` (int, optional)
- `dimensions` (json, optional)
- `metadata` (json, optional)
- `created_at` (datetime)

## `Faq`

- `id` (uuid)
- `category` (text, optional)
- `question` (text, optional)
- `answer` (text, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)

## `TeamMember`

- `id` (uuid)
- `name` (text, optional)
- `role` (text, optional)
- `title` (text, optional)
- `image_url` (text, optional)
- `bio` (text, optional)
- `expertise` (json, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)

## `AboutStat`

- `id` (uuid)
- `number` (text, optional)
- `label` (text, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)

## `CoreValue`

- `id` (uuid)
- `icon` (text, optional)
- `title` (text, optional)
- `description` (text, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)

## `LessonModule`

- `id` (uuid)
- `name` (text, optional)
- `color_token` (text, optional)
- `recommended_students` (text, optional)
- `description` (text, optional)
- `lessons_summary` (text, optional)
- `duration_summary` (text, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)

## `TeacherBenefit`

- `id` (uuid)
- `title` (text, optional)
- `description` (text, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)

## `Testimonial`

- `id` (uuid)
- `quote` (text, optional)
- `author_name` (text, optional)
- `author_role` (text, optional)
- `sort_order` (int)
- `active` (boolean)
- `created_at` (datetime)
