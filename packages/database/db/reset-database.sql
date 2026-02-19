-- ============================================
-- COMPLETE DATABASE RESET SCRIPT
-- ============================================
-- This script completely wipes and rebuilds your database
-- Use with caution - all data will be lost!

-- ============================================
-- 1. DROP ALL EXISTING TABLES (in reverse dependency order)
-- ============================================

-- Drop tables if they exist (safe to run multiple times)
DROP TABLE IF EXISTS public.page_sections CASCADE;
DROP TABLE IF EXISTS public.content_items CASCADE;
DROP TABLE IF EXISTS public.content_relationships CASCADE;
DROP TABLE IF EXISTS public.media_assets CASCADE;
DROP TABLE IF EXISTS public.pages CASCADE;

-- Drop old tables if they exist (from previous schema versions)
DROP TABLE IF EXISTS public.pricing_tiers CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.learning_tools CASCADE;
DROP TABLE IF EXISTS public.faqs CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.contact_info CASCADE;

-- ============================================
-- 2. APPLY NEW SCHEMA
-- ============================================

-- Pages table
CREATE TABLE public.pages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    route VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Content items table (consolidated content storage)
CREATE TABLE public.content_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content_type VARCHAR(50) NOT NULL, -- 'pricing', 'service', 'learning_tool', 'faq', etc.
    content JSONB NOT NULL, -- Flexible content storage
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Page sections table (links pages to content)
CREATE TABLE public.page_sections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    page_id UUID NOT NULL REFERENCES public.pages(id) ON DELETE CASCADE,
    section_key VARCHAR(100) NOT NULL, -- 'hero', 'tagline', 'pricing', etc.
    section_type VARCHAR(50) NOT NULL, -- 'hero', 'text', 'cta', etc.
    content JSONB NOT NULL, -- Section-specific content
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    UNIQUE(page_id, section_key) -- Each page can only have one of each section type
);

-- Content relationships table (for linking related content)
CREATE TABLE public.content_relationships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    parent_content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
    child_content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
    relationship_type VARCHAR(50) NOT NULL, -- 'related', 'prerequisite', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

    UNIQUE(parent_content_id, child_content_id, relationship_type)
);

-- Media assets table (for images, videos, etc.)
CREATE TABLE public.media_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes INTEGER NOT NULL,
    storage_path TEXT NOT NULL,
    alt_text VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ============================================
-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_assets ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 4. CREATE RLS POLICIES
-- ============================================

-- Pages: Public read access
CREATE POLICY "Pages are publicly readable" ON public.pages
    FOR SELECT USING (true);

-- Content Items: Public read access for active items
CREATE POLICY "Active content items are publicly readable" ON public.content_items
    FOR SELECT USING (active = true);

-- Page Sections: Public read access for active sections
CREATE POLICY "Active page sections are publicly readable" ON public.page_sections
    FOR SELECT USING (active = true);

-- Content Relationships: Public read access
CREATE POLICY "Content relationships are publicly readable" ON public.content_relationships
    FOR SELECT USING (true);

-- Media Assets: Public read access
CREATE POLICY "Media assets are publicly readable" ON public.media_assets
    FOR SELECT USING (true);

-- ============================================
-- 5. INDEXES SKIPPED (Performance optimization)
-- ============================================
-- Indexes will be created automatically by Supabase as needed
-- or can be added later with: db/create-indexes.sql

-- ============================================
-- 6. APPLY SEED DATA
-- ============================================

-- Pages
INSERT INTO public.pages (route, title, meta_description)
VALUES
  ('/', 'EFL Explorers - Home', 'Start your English learning journey with EFL Explorers'),
  ('/about', 'About EFL Explorers', 'Learn more about the EFL Explorers team, mission, and vision'),
  ('/contact', 'Contact EFL Explorers', 'Get in touch with EFL Explorers for course and platform information')
ON CONFLICT (route) DO UPDATE SET
  title = EXCLUDED.title,
  meta_description = EXCLUDED.meta_description;

-- Page Sections for Home Page
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT
  p.id,
  'hero',
  'hero',
  '{"title": "Welcome to EFL Explorers", "subtitle": "Start your English learning adventure today", "background_image": "/hero-bg.jpg"}',
  10,
  true
FROM public.pages p WHERE p.route = '/';

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT
  p.id,
  'tagline',
  'tagline',
  '{"text": "Empowering learners worldwide with innovative English education solutions"}',
  20,
  true
FROM public.pages p WHERE p.route = '/';

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT
  p.id,
  'register-cta',
  'cta',
  '{"title": "Ready to Start Learning?", "subtitle": "Join thousands of students already improving their English", "buttons": [{"text": "Get Started", "url": "/register", "primary": true}, {"text": "Learn More", "url": "/about", "primary": false}]}',
  100,
  true
FROM public.pages p WHERE p.route = '/';

-- Content Items (Pricing Tiers)
INSERT INTO public.content_items (content_type, content, sort_order, active)
VALUES
  ('pricing', '{"name": "Free Access", "price": "Free", "period": "", "description": "Free access to basic features and content to help you get started."}', 10, true),
  ('pricing', '{"name": "Individual", "price": "$20", "period": "/MO", "description": "Access to all features and content, perfect for individual learners."}', 20, true),
  ('pricing', '{"name": "Teacher", "price": "$25", "period": "/MO", "description": "Complete access with additional teaching tools and resources."}', 30, true),
  ('pricing', '{"name": "School", "price": "$15", "period": "/MO", "description": "Bulk pricing for schools, includes all features and management tools."}', 40, true);

-- Content Items (Services)
INSERT INTO public.content_items (content_type, content, sort_order, active)
VALUES
  ('service', '{"title": "Student Portal", "description": "Our lessons make learning feel like an exciting adventure, where young learners can explore and grow. Each lesson keeps students feeling they''re in class.", "icon": "🎓", "background_icons": ["📖","✏️","🎯"]}', 10, true),
  ('service', '{"title": "Teacher Resources", "description": "Access a comprehensive library of teaching materials, lesson plans, and interactive activities designed to make your EFL classes more engaging and effective.", "icon": "📚", "background_icons": ["📝","🎨","🔍"]}', 20, true),
  ('service', '{"title": "Interactive Learning", "description": "Engage students with our interactive games and exploration features that make learning English fun while building confidence.", "icon": "🎮", "background_icons": ["🎲","🏆","⭐"]}', 30, true),
  ('service', '{"title": "Progress Tracking", "description": "Monitor student progress with detailed analytics and personalized learning paths that adapt to each student''s needs.", "icon": "📊", "background_icons": ["📈","🎯","🏅"]}', 40, true),
  ('service', '{"title": "Assessment Tools", "description": "Comprehensive evaluation tools and quizzes that help measure learning outcomes and identify areas for improvement in real-time.", "icon": "✅", "background_icons": ["📋","🎯","📝"]}', 50, true),
  ('service', '{"title": "Communication Hub", "description": "Foster collaboration between students, teachers, and parents with our integrated messaging and feedback system.", "icon": "💬", "background_icons": ["📱","📧","👥"]}', 60, true);

-- Content Items (Learning Tools)
INSERT INTO public.content_items (content_type, content, sort_order, active)
VALUES
  ('learning_tool', '{"title": "Interactive Games", "description": "Engage with our collection of fun, educational games that make learning English enjoyable and effective.", "icon": "🎮"}', 10, true),
  ('learning_tool', '{"title": "Digital Flashcards", "description": "Master vocabulary and grammar with our interactive flashcard system that adapts to your learning progress.", "icon": "🎴"}', 20, true),
  ('learning_tool', '{"title": "Progress Tracking", "description": "Monitor your learning journey with detailed analytics and personalized learning paths.", "icon": "📊"}', 30, true),
  ('learning_tool', '{"title": "Practice Exercises", "description": "Reinforce your learning with a variety of exercises designed to improve your English skills.", "icon": "✍️"}', 40, true),
  ('learning_tool', '{"title": "Audio Resources", "description": "Improve your pronunciation and listening skills with our comprehensive audio library.", "icon": "🎧"}', 50, true),
  ('learning_tool', '{"title": "Video Lessons", "description": "Learn through engaging video content that brings English to life in real-world contexts.", "icon": "🎥"}', 60, true);

-- ============================================
-- SETUP COMPLETE!
-- ============================================

-- Verify the setup
SELECT 'Pages' as table_name, COUNT(*) as count FROM public.pages
UNION ALL
SELECT 'Content Items' as table_name, COUNT(*) as count FROM public.content_items
UNION ALL
SELECT 'Page Sections' as table_name, COUNT(*) as count FROM public.page_sections;

-- Expected results:
-- Pages: 3
-- Content Items: 16 (4 pricing + 6 services + 6 tools)
-- Page Sections: 3