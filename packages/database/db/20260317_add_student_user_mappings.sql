CREATE SCHEMA IF NOT EXISTS students;

CREATE TABLE IF NOT EXISTS students.student_user_mappings (
  id SERIAL PRIMARY KEY,
  auth_user_id UUID NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
