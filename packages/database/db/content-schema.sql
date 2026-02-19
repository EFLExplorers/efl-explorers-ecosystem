-- ============================================
-- IMPROVED CONTENT MANAGEMENT SCHEMA
-- ============================================
-- This schema consolidates content types and improves flexibility
-- while maintaining performance and type safety.

-- ============================================
-- 1. Pages (unchanged - works well)
-- ============================================
create table if not exists public.pages (
  id uuid primary key default gen_random_uuid(),
  route text not null unique,
  title text,
  meta_description text,
  layout text default 'default', -- for different page layouts
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================
-- 2. Content Items (NEW - replaces most specialized tables)
-- ============================================
create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade, -- route ownership (optional; helps visualizer + tracking)
  section_key text, -- optional: which section this item belongs to (e.g. 'services', 'pricing')
  content_type text not null, -- 'pricing', 'service', 'faq', 'team_member', etc.
  slug text unique, -- for URL-friendly identifiers
  title text,
  subtitle text,
  description text,
  content jsonb not null default '{}'::jsonb, -- flexible content storage
  metadata jsonb not null default '{}'::jsonb, -- additional structured data
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Backfill columns on existing deployments
alter table if exists public.content_items
  add column if not exists page_id uuid references public.pages(id) on delete cascade;

alter table if exists public.content_items
  add column if not exists section_key text;

alter table if exists public.content_items
  add column if not exists slug text unique;

alter table if exists public.content_items
  add column if not exists title text;

alter table if exists public.content_items
  add column if not exists subtitle text;

alter table if exists public.content_items
  add column if not exists description text;

alter table if exists public.content_items
  add column if not exists content jsonb not null default '{}'::jsonb;

alter table if exists public.content_items
  add column if not exists metadata jsonb not null default '{}'::jsonb;

alter table if exists public.content_items
  add column if not exists sort_order integer not null default 0;

alter table if exists public.content_items
  add column if not exists active boolean not null default true;

-- Ensure defaults for existing rows
update public.content_items set metadata = '{}'::jsonb where metadata is null;
update public.content_items set content = '{}'::jsonb where content is null;
update public.content_items set sort_order = coalesce(sort_order, 0);
update public.content_items set active = coalesce(active, true);

-- Add indexes for performance
drop index if exists idx_content_items_type_active;
drop index if exists idx_content_items_slug;
create index idx_content_items_type_active on content_items(content_type, active);
create index idx_content_items_slug on content_items(slug);
create index if not exists idx_content_items_page_type_active
  on public.content_items(page_id, content_type, active, sort_order);

-- ============================================
-- 3. Page Sections (improved - more flexible)
-- ============================================
create table if not exists public.page_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid references public.pages(id) on delete cascade,
  section_key text not null, -- e.g. 'hero', 'features', 'testimonials'
  section_type text not null default 'content', -- 'content', 'cta', 'hero', etc.
  title text,
  subtitle text,
  content jsonb not null default '{}'::jsonb, -- flexible content structure
  settings jsonb not null default '{}'::jsonb, -- layout and styling options
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Needed for "ON CONFLICT (page_id, section_key)" upserts in seed scripts
create unique index if not exists idx_page_sections_page_id_section_key_unique
  on public.page_sections(page_id, section_key);

-- Backfill columns for existing deployments
alter table if exists public.page_sections
  add column if not exists heading text;

alter table if exists public.page_sections
  add column if not exists subheading text;

alter table if exists public.page_sections
  add column if not exists body text;

alter table if exists public.page_sections
  add column if not exists cta_label text;

alter table if exists public.page_sections
  add column if not exists cta_href text;

alter table if exists public.page_sections
  add column if not exists data jsonb not null default '{}'::jsonb;

-- Ensure defaults for existing rows
update public.page_sections set data = '{}'::jsonb where data is null;
alter table if exists public.page_sections
  alter column content set default '{}'::jsonb;
update public.page_sections set content = '{}'::jsonb where content is null;
alter table if exists public.page_sections
  alter column content drop not null;

-- Add indexes
create index idx_page_sections_page_key on page_sections(page_id, section_key);
create index idx_page_sections_active on page_sections(active, sort_order);

-- ============================================
-- 3b. Site Sections (global - header/footer/etc)
-- ============================================
create table if not exists public.site_sections (
  id uuid primary key default gen_random_uuid(),
  section_key text not null unique, -- e.g. 'header', 'footer'
  section_type text not null default 'content',
  content jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_site_sections_active on public.site_sections(active, sort_order);

-- ============================================
-- 3c. Route Section Inventory (tracking/migration)
-- ============================================
-- Purpose: explicitly list which sections belong to which route and
-- what shape of JSON we expect in `page_sections.content`.
-- This is a tracking layer (does not replace runtime `page_sections`).
create table if not exists public.route_sections (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages(id) on delete cascade,
  section_key text not null, -- e.g. 'hero', 'pricing'
  section_type text not null default 'content',
  expected_content jsonb not null default '{}'::jsonb, -- example/contract
  notes text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (page_id, section_key)
);

create index if not exists idx_route_sections_page_id on public.route_sections(page_id);

-- Convenience view: what content actually exists per route/section
create or replace view public.route_section_content as
select
  p.route,
  ps.section_key,
  ps.section_type,
  ps.sort_order,
  ps.active,
  ps.content
from public.pages p
join public.page_sections ps on ps.page_id = p.id;

-- ============================================
-- 4. Content Relationships (NEW - for complex relationships)
-- ============================================
create table if not exists public.content_relationships (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references content_items(id) on delete cascade,
  child_id uuid not null references content_items(id) on delete cascade,
  relationship_type text not null, -- 'related', 'category', 'group', etc.
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

-- Backfill columns for existing deployments
alter table if exists public.content_relationships
  add column if not exists parent_id uuid references content_items(id) on delete cascade;

alter table if exists public.content_relationships
  add column if not exists child_id uuid references content_items(id) on delete cascade;

alter table if exists public.content_relationships
  add column if not exists relationship_type text;

alter table if exists public.content_relationships
  add column if not exists sort_order integer not null default 0;

-- Ensure existing rows have defaults
update public.content_relationships set sort_order = coalesce(sort_order, 0);

-- Unique constraint to prevent duplicate relationships
alter table if exists content_relationships
  drop constraint if exists unique_relationship;

alter table if exists content_relationships
  add constraint unique_relationship
  unique (parent_id, child_id, relationship_type);

-- ============================================
-- 5. Media Assets (NEW - for image/file management)
-- ============================================
create table if not exists public.media_assets (
  id uuid primary key default gen_random_uuid(),
  filename text not null,
  original_name text not null,
  url text not null,
  alt_text text,
  caption text,
  mime_type text not null,
  size_bytes integer,
  dimensions jsonb, -- for images: {width, height}
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ============================================
-- 6. Legacy/Supporting Tables (for seed data)
-- ============================================

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  category text,
  question text,
  answer text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  name text,
  role text,
  title text,
  image_url text,
  bio text,
  expertise text[],
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.about_stats (
  id uuid primary key default gen_random_uuid(),
  number text,
  label text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.core_values (
  id uuid primary key default gen_random_uuid(),
  icon text,
  title text,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.lesson_modules (
  id uuid primary key default gen_random_uuid(),
  name text,
  color_token text,
  recommended_students text,
  description text,
  lessons_summary text,
  duration_summary text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.teacher_benefits (
  id uuid primary key default gen_random_uuid(),
  title text,
  description text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text,
  author_name text,
  author_role text,
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================
-- MIGRATION HELPERS
-- ============================================

-- View for easy content access by type
create view content_by_type as
select
  content_type,
  json_agg(
    json_build_object(
      'id', id,
      'slug', slug,
      'title', title,
      'subtitle', subtitle,
      'description', description,
      'content', content,
      'metadata', metadata,
      'sort_order', sort_order
    ) order by sort_order
  ) as items
from content_items
where active = true
group by content_type;

-- Function to get page content with sections
create or replace function get_page_content(page_route text)
returns jsonb as $$
declare
  page_record record;
  sections_data jsonb;
begin
  -- Get page info
  select * into page_record from pages where route = page_route;

  if not found then
    return null;
  end if;

  -- Get sections
  select json_agg(
    json_build_object(
      'id', id,
      'section_key', section_key,
      'section_type', section_type,
      'title', title,
      'subtitle', subtitle,
      'content', content,
      'settings', settings,
      'sort_order', sort_order
    ) order by sort_order
  ) into sections_data
  from page_sections
  where page_id = page_record.id and active = true;

  -- Return combined data
  return json_build_object(
    'page', json_build_object(
      'id', page_record.id,
      'route', page_record.route,
      'title', page_record.title,
      'meta_description', page_record.meta_description,
      'layout', page_record.layout
    ),
    'sections', coalesce(sections_data, '[]'::jsonb)
  );
end;
$$ language plpgsql;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

/*
-- Insert a pricing tier
INSERT INTO content_items (content_type, title, content, sort_order)
VALUES (
  'pricing',
  'Individual Plan',
  '{"price": "$20", "period": "/MO", "features": ["Feature 1", "Feature 2"]}'::jsonb,
  10
);

-- Insert a service
INSERT INTO content_items (content_type, title, description, content, sort_order)
VALUES (
  'service',
  'Student Portal',
  'Interactive learning platform',
  '{"icon": "🎓", "background_icons": ["📖", "✏️", "🎯"]}'::jsonb,
  10
);

-- Get all pricing tiers
SELECT * FROM content_by_type WHERE content_type = 'pricing';

-- Get full page content
SELECT get_page_content('/about');
*/

-- ============================================
-- BENEFITS OF THIS STRUCTURE:
-- ============================================
/*
1. FLEXIBLE: Easy to add new content types without schema changes
2. SCALABLE: Single table for most content reduces complexity
3. RELATIONAL: Content relationships supported
4. PERFORMANT: Proper indexing and views for fast queries
5. MAINTAINABLE: Less tables to manage, consistent structure
6. FUTURE-PROOF: JSONB allows for evolving content structures
*/