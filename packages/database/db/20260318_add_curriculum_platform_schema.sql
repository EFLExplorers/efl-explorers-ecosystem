CREATE SCHEMA IF NOT EXISTS curriculum;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'curriculum_level_status'
      AND n.nspname = 'curriculum'
  ) THEN
    CREATE TYPE curriculum.curriculum_level_status AS ENUM ('draft', 'published', 'archived');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS curriculum.managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curriculum.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  invited_by_manager_id UUID REFERENCES curriculum.managers(id) ON DELETE SET NULL,
  accepted_by_manager_id UUID REFERENCES curriculum.managers(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curriculum.programs (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(180) NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_manager_id UUID NOT NULL REFERENCES curriculum.managers(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS curriculum.levels (
  id SERIAL PRIMARY KEY,
  program_id INTEGER NOT NULL REFERENCES curriculum.programs(id) ON DELETE CASCADE,
  slug VARCHAR(180) NOT NULL,
  title TEXT NOT NULL,
  order_index INTEGER NOT NULL DEFAULT 0,
  status curriculum.curriculum_level_status NOT NULL DEFAULT 'draft',
  last_published_at TIMESTAMPTZ,
  created_by_manager_id UUID NOT NULL REFERENCES curriculum.managers(id) ON DELETE RESTRICT,
  updated_by_manager_id UUID REFERENCES curriculum.managers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT levels_program_slug_key UNIQUE (program_id, slug)
);

CREATE TABLE IF NOT EXISTS curriculum.units (
  id SERIAL PRIMARY KEY,
  level_id INTEGER NOT NULL REFERENCES curriculum.levels(id) ON DELETE CASCADE,
  slug VARCHAR(220) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  story_markdown TEXT NOT NULL DEFAULT '',
  media_manifest JSONB,
  assignment_config JSONB,
  estimated_minutes INTEGER,
  order_index INTEGER NOT NULL DEFAULT 0,
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_manager_id UUID NOT NULL REFERENCES curriculum.managers(id) ON DELETE RESTRICT,
  updated_by_manager_id UUID REFERENCES curriculum.managers(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT units_level_slug_key UNIQUE (level_id, slug)
);

CREATE TABLE IF NOT EXISTS curriculum.publish_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level_id INTEGER NOT NULL REFERENCES curriculum.levels(id) ON DELETE CASCADE,
  version INTEGER NOT NULL,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  published_at TIMESTAMPTZ NOT NULL,
  published_by_manager_id UUID NOT NULL REFERENCES curriculum.managers(id) ON DELETE RESTRICT,
  snapshot_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT publish_snapshots_level_version_key UNIQUE (level_id, version)
);

CREATE TABLE IF NOT EXISTS curriculum.publish_snapshot_units (
  id SERIAL PRIMARY KEY,
  snapshot_id UUID NOT NULL REFERENCES curriculum.publish_snapshots(id) ON DELETE CASCADE,
  source_unit_id INTEGER NOT NULL REFERENCES curriculum.units(id) ON DELETE RESTRICT,
  order_index INTEGER NOT NULL,
  slug VARCHAR(220) NOT NULL,
  title TEXT NOT NULL,
  summary TEXT,
  story_markdown TEXT NOT NULL,
  estimated_minutes INTEGER,
  media_manifest JSONB,
  assignment_config JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT publish_snapshot_units_snapshot_source_key UNIQUE (snapshot_id, source_unit_id)
);

CREATE INDEX IF NOT EXISTS curriculum_invites_status_idx
  ON curriculum.invites (accepted_at, revoked_at);

CREATE INDEX IF NOT EXISTS curriculum_programs_active_updated_idx
  ON curriculum.programs (is_archived, updated_at DESC);

CREATE INDEX IF NOT EXISTS curriculum_levels_program_order_idx
  ON curriculum.levels (program_id, order_index);

CREATE INDEX IF NOT EXISTS curriculum_levels_status_published_idx
  ON curriculum.levels (status, last_published_at DESC);

CREATE INDEX IF NOT EXISTS curriculum_units_level_order_idx
  ON curriculum.units (level_id, order_index);

CREATE INDEX IF NOT EXISTS curriculum_units_archived_idx
  ON curriculum.units (is_archived);

CREATE INDEX IF NOT EXISTS curriculum_snapshots_level_current_idx
  ON curriculum.publish_snapshots (level_id, is_current);

CREATE INDEX IF NOT EXISTS curriculum_snapshot_units_snapshot_order_idx
  ON curriculum.publish_snapshot_units (snapshot_id, order_index);
