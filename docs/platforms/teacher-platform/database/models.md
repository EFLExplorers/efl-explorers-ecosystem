# Teacher Domain Models

## `Student`

- `id` (int)
- `full_name` (string)
- `email` (text, optional)
- `level` (string)
- `unit_id` (string)
- `native_language` (text, optional)
- `guardian_name` (text, optional)
- `guardian_contact` (text, optional)
- `attendance_rate` (float, optional)
- `performance_level` (text, optional)
- `notes` (text, optional)
- `created_at` (datetime)
- `updated_at` (datetime)

## `Lesson`

- `id` (int)
- `title` (string)
- `subject` (string)
- `description` (text, optional)
- `class_id` (string)
- `date` (datetime)
- `start_time` (string)
- `end_time` (string)
- `location` (text, optional)
- `status` (string, optional)
- `created_at` (datetime)
- `updated_at` (datetime)

## `Curriculum`

- `id` (int)
- `title` (string)
- `subject` (string)
- `level` (string)
- `description` (text, optional)
- `objectives` (text, optional)
- `units` (json, optional)
- `created_at` (datetime)
- `updated_at` (datetime)

## `Event`

- `id` (int)
- `title` (string)
- `description` (text, optional)
- `date` (datetime)
- `start_time` (string)
- `end_time` (string)
- `location` (text, optional)
- `type` (string, optional)
- `created_at` (datetime)

## `Message`

- `id` (int)
- `sender_id` (int)
- `receiver_id` (int)
- `content` (text)
- `is_read` (boolean)
- `created_at` (datetime)

## `Announcement`

- `id` (int)
- `title` (string)
- `content` (text)
- `priority` (string, optional)
- `created_by` (int)
- `created_at` (datetime)

## `Task`

- `id` (int)
- `title` (string)
- `completed` (boolean)
- `due_date` (datetime, optional)
- `user_id` (int)
- `created_at` (datetime)

## `Material`

- `id` (int)
- `title` (string)
- `description` (text, optional)
- `category` (string)
- `url` (text)
- `created_by` (int)
- `created_at` (datetime)

## `Bookmark`

- `id` (int)
- `title` (string)
- `url` (text)
- `category` (string, optional)
- `user_id` (int)
- `created_at` (datetime)

## `LessonMaterial`

- `id` (int)
- `lesson_id` (int)
- `material_id` (int)
- `created_at` (datetime)
