-- Adds persisted starred state for teacher bookmarks.
ALTER TABLE IF EXISTS teachers.bookmarks
ADD COLUMN IF NOT EXISTS starred BOOLEAN NOT NULL DEFAULT FALSE;
