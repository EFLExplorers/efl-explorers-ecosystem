-- Adds persisted metadata required for material integrity reporting.
ALTER TABLE IF EXISTS teachers.materials
ADD COLUMN IF NOT EXISTS kind VARCHAR(64) NOT NULL DEFAULT 'other',
ADD COLUMN IF NOT EXISTS mime_type TEXT,
ADD COLUMN IF NOT EXISTS size_bytes INTEGER;
