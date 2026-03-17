CREATE SCHEMA IF NOT EXISTS teachers;

CREATE TABLE IF NOT EXISTS teachers.teacher_user_mappings (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
