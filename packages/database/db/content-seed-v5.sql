-- Seed 5.0: Header content ensured + all v4 content
-- Goal: Ensure header/footer navigation is properly seeded for all pages.
-- Safe to rerun; uses upserts by route/section/content_type/slug.
-- Run AFTER db/content-schema.sql

-- ============================================
-- 1) Pages (routes)
-- ============================================
INSERT INTO public.pages (route, title, meta_description)
VALUES
  ('/', 'EFL Explorers - Home', 'Start your English learning journey with EFL Explorers'),
  ('/about', 'About EFL Explorers', 'Learn more about the EFL Explorers team, mission, and vision'),
  ('/contact', 'Contact EFL Explorers', 'Get in touch with EFL Explorers for course and platform information'),
  ('/pricing', 'Pricing - EFL Explorers', 'Choose the best plan to improve your English skills with EFL Explorers.'),
  ('/platforms/student', 'Student Platform - EFL Explorers', 'Explore the student portal and learning journey inside EFL Explorers.'),
  ('/platforms/teacher', 'Teacher Platform - EFL Explorers', 'Explore the teacher portal and teaching toolkit inside EFL Explorers.'),
  ('/Auth/login', 'Login - EFL Explorers', 'Login to your EFL Explorers account'),
  ('/Auth/register', 'Register - EFL Explorers', 'Create your EFL Explorers account'),
  ('/Auth/forgot-password', 'Forgot Password - EFL Explorers', 'Reset your password'),
  ('/Auth/reset-password', 'Reset Password - EFL Explorers', 'Set your new password'),
  ('/Auth/register/teacher/pending', 'Registration Pending - EFL Explorers', 'Your teacher registration is under review')
ON CONFLICT (route) DO UPDATE SET
  title = EXCLUDED.title,
  meta_description = EXCLUDED.meta_description;

-- ============================================
-- 2) Global site sections (header/footer) - ENSURE HEADER CONTENT
-- ============================================
-- Header content is REQUIRED for navigation to work properly
INSERT INTO public.site_sections (section_key, section_type, content, sort_order, active)
VALUES
  (
    'header',
    'header',
    '{
      "navbar": {
        "dropdown": {
          "label": "Platforms",
          "items": [
            { "label": "Teacher", "href": "/platforms/teacher" },
            { "label": "Student", "href": "/platforms/student" }
          ]
        },
        "links": [
          { "label": "Pricing", "href": "/pricing" },
          { "label": "About", "href": "/about" },
          { "label": "Contact", "href": "/contact" }
        ]
      },
      "auth_buttons": {
        "login": { "label": "Login", "href": "/Auth/login" },
        "register": { "label": "Get Started", "href": "/Auth/register" }
      }
    }'::jsonb,
    10,
    true
  ),
  (
    'footer',
    'footer',
    '{
      "columns": [
        {
          "title": "Socials",
          "links": [
            { "label": "LinkedIn", "href": "https://linkedin.com" },
            { "label": "Instagram", "href": "https://instagram.com" },
            { "label": "Facebook", "href": "https://facebook.com" }
          ]
        },
        {
          "title": "Company",
          "links": [
            { "label": "About Us", "href": "/about" },
            { "label": "Pricing", "href": "/pricing" },
            { "label": "Register", "href": "/Auth/register" }
          ]
        },
        {
          "title": "Support",
          "links": [
            { "label": "Contact Us", "href": "/contact" },
            { "label": "FAQ", "href": "/faq" },
            { "label": "Terms & Conditions", "href": "/terms" },
            { "label": "Cookie Policy", "href": "/privacy" }
          ]
        }
      ],
      "bottom_bar": [
        "All rights reserved",
        "Copyright 2026 | Privacy Policy",
        "Powered by EFL Explorers"
      ]
    }'::jsonb,
    20,
    true
  ),
  (
    '404',
    'error',
    '{
      "title": "404 - Page Not Found",
      "message": "The page you''re looking for doesn''t exist.",
      "home_link_text": "Go back home"
    }'::jsonb,
    30,
    true
  )
ON CONFLICT (section_key) DO UPDATE SET
  section_type = EXCLUDED.section_type,
  content = EXCLUDED.content,
  settings = coalesce(EXCLUDED.settings, '{}'::jsonb),
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ============================================
-- 3) Route section inventory (tracking)
-- ============================================
-- This does NOT power rendering directly; it's a "what belongs where" registry.
INSERT INTO public.route_sections (page_id, section_key, section_type, expected_content, sort_order, active)
SELECT p.id, v.section_key, v.section_type, v.expected_content::jsonb, v.sort_order, true
FROM public.pages p
JOIN (
  VALUES
    -- Home (/)
    ('/', 'hero', 'hero', '{"title":"","subtitle":"","buttons":[{"label":"","href":""}]}'::text, 10),
    ('/', 'tagline', 'content', '{"title":"","subtitle":""}'::text, 20),
    ('/', 'learning-tools', 'content', '{"title":"","subtitle":""}'::text, 30),
    ('/', 'how-we-teach', 'tabs', '{"title":"","description":"","tabs":[{"title":"","content":"","icon":""}]}'::text, 40),
    ('/', 'services', 'content', '{"title":"","subtitle":""}'::text, 50),
    ('/', 'pricing', 'content', '{"title":"","subtitle":""}'::text, 60),
    ('/', 'register-cta', 'cta', '{"title":"","subtitle":"","cta_label":"","cta_href":""}'::text, 100),

    -- About (/about)
    ('/about', 'hero', 'hero', '{"title":"","subtitle":""}'::text, 10),
    ('/about', 'description', 'content', '{"body":""}'::text, 20),
    ('/about', 'tagline', 'content', '{"text":""}'::text, 30),
    ('/about', 'mission', 'content', '{"title":"","body":"","points":[""]}'::text, 40),
    ('/about', 'vision', 'content', '{"title":"","body":"","goals":[""]}'::text, 50),
    ('/about', 'team-intro', 'content', '{"title":"","body":""}'::text, 60),
    ('/about', 'values-header', 'content', '{"title":""}'::text, 70),

    -- Contact (/contact)
    ('/contact', 'hero', 'content', '{"title":"","subtitle":"","contact_methods":[{"icon":"","href":"","text":""}]}'::text, 10),
    ('/contact', 'form', 'content', '{"title":"","subtitle":"","subject_options":[""]}'::text, 20),
    ('/contact', 'faq', 'content', '{"title":"","subtitle":""}'::text, 30),

    -- Pricing (/pricing)
    ('/pricing', 'pricing-header', 'content', '{"badge":"","title":"","subtitle":""}'::text, 10),
    ('/pricing', 'pricing-footer', 'content', '{"note":"","help_text":"","help_href":"","help_label":""}'::text, 30),

    -- Student platform (/platforms/student)
    ('/platforms/student', 'hero', 'content', '{"title":"","subtitle":"","cta":{"label":"","href":""},"image":{"src":"","alt":"","width":0,"height":0}}'::text, 10),
    ('/platforms/student', 'characters', 'content', '{"intro":"","outro":""}'::text, 20),
    ('/platforms/student', 'planets', 'content', '{"title":"","toggle_on_label":"","toggle_off_label":"","autoplay_ms":0}'::text, 30),
    ('/platforms/student', 'cta', 'content', '{"title":"","button":{"label":"","href":""}}'::text, 40),

    -- Teacher platform (/platforms/teacher)
    ('/platforms/teacher', 'hero', 'content', '{"title":"","subtitle":"","cta":{"label":"","href":""},"image":{"src":"","alt":"","width":0,"height":0}}'::text, 10),
    ('/platforms/teacher', 'tools', 'content', '{"kicker":"","title":"","intro":"","outro":"","badge":""}'::text, 20),
    ('/platforms/teacher', 'lesson-modules', 'content', '{"title":"","subtitle":""}'::text, 30),
    ('/platforms/teacher', 'benefits', 'content', '{"title":""}'::text, 40),
    ('/platforms/teacher', 'cta', 'content', '{"title":"","subtitle":"","button":{"label":"","href":""}}'::text, 50)
) AS v(route, section_key, section_type, expected_content, sort_order)
  ON v.route = p.route
ON CONFLICT (page_id, section_key) DO UPDATE SET
  section_type = EXCLUDED.section_type,
  expected_content = EXCLUDED.expected_content,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ============================================
-- 4) Page sections (per route)
-- ============================================

-- ---------- Home (/)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'hero', 'hero',
  '{
    "title": "Start your learning journey today!",
    "subtitle": "We''re so happy you''re here! However, you will need to register to get started.",
    "buttons": [
      { "label": "Register Student", "href": "/Auth/register/student" },
      { "label": "Register Teacher", "href": "/Auth/register/teacher" }
    ]
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'tagline', 'content',
  '{
    "title": "Explore the universe of language!",
    "subtitle": "We provide teachers with stellar EFL resources and guide students on an exciting journey to English mastery!"
  }'::jsonb,
  20, true
FROM public.pages p WHERE p.route = '/'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'learning-tools', 'content',
  '{
    "title": "Learning Tools",
    "subtitle": "Discover our comprehensive suite of tools designed to make learning English engaging and effective"
  }'::jsonb,
  30, true
FROM public.pages p WHERE p.route = '/'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'how-we-teach', 'tabs',
  '{
    "title": "How We Teach",
    "description": "Our comprehensive approach to education combines various learning methods to ensure maximum engagement and retention.",
    "tabs": [
      { "title": "Lessons", "content": "Interactive lessons designed by experts to help you master new concepts quickly and effectively.", "icon": "📘" },
      { "title": "Activities", "content": "Hands-on activities that reinforce learning through practical application of concepts.", "icon": "🧩" },
      { "title": "Minigames", "content": "Fun and engaging minigames that make learning enjoyable while testing your knowledge.", "icon": "🎮" },
      { "title": "Assessments", "content": "Comprehensive assessments to track your progress and identify areas for improvement.", "icon": "🧠" },
      { "title": "Projects", "content": "Collaborative projects that let learners build, present, and get feedback on real-world tasks.", "icon": "🛠️" },
      { "title": "Coaching", "content": "Guided coaching and feedback loops to reinforce strengths and close learning gaps quickly.", "icon": "🎯" }
    ]
  }'::jsonb,
  40, true
FROM public.pages p WHERE p.route = '/'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'services', 'content',
  '{
    "title": "Our Services",
    "subtitle": "Discover how we make learning English an exciting journey for both students and teachers"
  }'::jsonb,
  50, true
FROM public.pages p WHERE p.route = '/'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'pricing', 'content',
  '{
    "title": "Pricing",
    "subtitle": "Flexible plans for students, teachers, and schools"
  }'::jsonb,
  60, true
FROM public.pages p WHERE p.route = '/'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'register-cta', 'cta',
  '{
    "title": "Ready to Start Learning?",
    "subtitle": "Join thousands of students already improving their English",
    "cta_label": "Get Started",
    "cta_href": "/Auth/register"
  }'::jsonb,
  100, true
FROM public.pages p WHERE p.route = '/'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ---------- About (/about)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'hero', 'hero',
  '{
    "title": "About EFL Explorers",
    "subtitle": "Pioneering the future of English language learning"
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/about'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'description', 'content',
  '{
    "body": "We''re a passionate team of educators, developers, and designers committed to making English language learning an exciting adventure. Our mission is to break down language barriers and create a world where everyone can communicate confidently in English."
  }'::jsonb,
  20, true
FROM public.pages p WHERE p.route = '/about'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'tagline', 'content',
  '{
    "text": "Adventure awaits - learn English with EFL Explorers"
  }'::jsonb,
  30, true
FROM public.pages p WHERE p.route = '/about'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'mission', 'content',
  '{
    "title": "Our Mission",
    "body": "At EFL Explorers, we believe learning English should be an exciting journey, not a daunting task. Our mission is to transform language education through innovative technology, engaging content, and personalized learning experiences. We empower both teachers and students with tools that make learning effective, enjoyable, and accessible to everyone, regardless of their background or location.",
    "points": [
      "✨ Interactive Learning Experiences",
      "🌍 Global Community Building",
      "📚 Comprehensive Curriculum"
    ]
  }'::jsonb,
  40, true
FROM public.pages p WHERE p.route = '/about'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'vision', 'content',
  '{
    "title": "Our Vision",
    "body": "We envision a world where language barriers dissolve and every individual can confidently communicate in English. Our platform will be the leading destination for EFL education, known for its innovative approach, engaging content, and proven results. We see a future where learning English is not just about grammar and vocabulary, but about connecting cultures and building bridges between people worldwide.",
    "goals": [
      "🚀 Global Accessibility",
      "💡 Innovation Leadership",
      "🤝 Cultural Exchange"
    ]
  }'::jsonb,
  50, true
FROM public.pages p WHERE p.route = '/about'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'team-intro', 'content',
  '{
    "title": "Meet Our Team",
    "body": "Our diverse team brings together expertise in education, technology, design, and content creation to deliver an exceptional learning experience."
  }'::jsonb,
  60, true
FROM public.pages p WHERE p.route = '/about'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'values-header', 'content',
  '{
    "title": "Our Core Values"
  }'::jsonb,
  70, true
FROM public.pages p WHERE p.route = '/about'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ---------- Contact (/contact)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'hero', 'content',
  '{
    "title": "Get in Touch",
    "subtitle": "Have questions about our English learning programs? We''re here to help! Reach out to us and let''s start your learning journey together.",
    "contact_methods": [
      { "icon": "📧", "href": "mailto:contact@eflexplorers.com", "text": "contact@eflexplorers.com" },
      { "icon": "📞", "href": "tel:+1234567890", "text": "+1 (234) 567-890" }
    ]
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/contact'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'form', 'content',
  '{
    "title": "Send us a Message",
    "subtitle": "Fill out the form below and we''ll get back to you as soon as possible. We''re here to help with any questions about our English learning programs.",
    "subject_options": ["General Inquiry", "Course Information", "Pricing", "Technical Support", "Other"],
    "form_labels": {
      "first_name": "First Name",
      "last_name": "Last Name",
      "email": "Email",
      "subject": "Subject",
      "message": "Message",
      "submit_button": "Send Message",
      "select_subject": "Select a subject"
    }
  }'::jsonb,
  20, true
FROM public.pages p WHERE p.route = '/contact'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'faq', 'content',
  '{
    "title": "Frequently Asked Questions",
    "subtitle": "Find answers to common questions about our English learning programs and services"
  }'::jsonb,
  30, true
FROM public.pages p WHERE p.route = '/contact'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ---------- Pricing (/pricing)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'pricing-header', 'content',
  '{
    "badge": "Pricing Plans",
    "title": "Choose Your Perfect Plan",
    "subtitle": "Unlock endless possibilities with our flexible pricing options designed for every learner"
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/pricing'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'pricing-footer', 'content',
  '{
    "note": "All plans include a 14-day free trial. No credit card required.",
    "help_text": "Need help choosing?",
    "help_href": "/contact",
    "help_label": "Contact our team"
  }'::jsonb,
  30, true
FROM public.pages p WHERE p.route = '/pricing'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ---------- Student platform (/platforms/student)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'hero', 'content',
  '{
    "title": "Our Student Portal",
    "subtitle": "Our student portal offers a cutting-edge platform for you to learn English effectively. With interactive lessons, real-time feedback, and engaging activities, learning has never been more fun!",
    "cta": { "label": "Get Started", "href": "/Auth/register/student" },
    "image": { "src": "/assets/images/characters/Emma.png", "alt": "Student Portal character", "width": 480, "height": 360 }
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/platforms/student'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'characters', 'content',
  '{
    "intro": "Help the gang unlock items by completing guided tasks. As you move ahead, they stay around to guide you on the EFL Explorer, and give rewards and English skills!",
    "outro": "With 3D lessons per planet, equipping learners with a solid foundation in English. Each lesson allows you to practice everyday English. That''s the lessons already prepared for teachers, allowing them to focus on their main passion: teaching! Students can track their progress and become masters of the English language. Learning English has never been this easy!"
  }'::jsonb,
  20, true
FROM public.pages p WHERE p.route = '/platforms/student'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'planets', 'content',
  '{
    "title": "Explore our planets",
    "toggle_on_label": "Stop Rotation",
    "toggle_off_label": "Start Rotation",
    "autoplay_ms": 5000
  }'::jsonb,
  30, true
FROM public.pages p WHERE p.route = '/platforms/student'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'cta', 'content',
  '{
    "title": "Register today to start your learning journey!",
    "button": { "label": "Register", "href": "/Auth/register/student" }
  }'::jsonb,
  40, true
FROM public.pages p WHERE p.route = '/platforms/student'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ---------- Teacher platform (/platforms/teacher)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'hero', 'content',
  '{
    "title": "Our Teacher Portal",
    "subtitle": "Empower your teaching with lesson planning, student analytics, and ready-made resources that keep learners engaged.",
    "cta": { "label": "Start Teaching", "href": "/Auth/register/teacher" },
    "image": { "src": "/assets/images/characters/Emma.png", "alt": "Teacher Portal character", "width": 400, "height": 300 }
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/platforms/teacher'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'tools', 'content',
  '{
    "kicker": "Tools for teachers",
    "title": "Everything you need, in one hub",
    "intro": "Plan faster, teach with confidence, and keep every student on track with our integrated toolkit.",
    "outro": "Pre-designed lesson plans for every level, interactive activities, grading, and analytics—so you can spend less time preparing and more time teaching.",
    "badge": "⚡️"
  }'::jsonb,
  20, true
FROM public.pages p WHERE p.route = '/platforms/teacher'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'lesson-modules', 'content',
  '{
    "title": "Explore our lesson modules",
    "subtitle": "Choose from our comprehensive range of EFL modules designed for every proficiency level"
  }'::jsonb,
  30, true
FROM public.pages p WHERE p.route = '/platforms/teacher'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'benefits', 'content',
  '{
    "title": "Why Teachers Choose EFL Explorers"
  }'::jsonb,
  40, true
FROM public.pages p WHERE p.route = '/platforms/teacher'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'cta', 'content',
  '{
    "title": "Join our community of EFL educators today!",
    "subtitle": "Start creating engaging lessons and inspiring your students to master English",
    "button": { "label": "Register as Teacher", "href": "/Auth/register/teacher" }
  }'::jsonb,
  50, true
FROM public.pages p WHERE p.route = '/platforms/teacher'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ============================================
-- 5) Content items (per route/section)
-- ============================================

-- ---------- Home (/): pricing tiers
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, content, sort_order, active)
SELECT p.id, 'pricing', v.content_type, v.slug, v.title, v.content::jsonb, v.sort_order, v.active
FROM public.pages p
JOIN (
  VALUES
    ('pricing', 'pricing-free-access', 'Free Access', '{"price": "Free", "period": "", "description": "Free access to basic features and content to help you get started.", "cta_label": "Get Started", "cta_href": "/Auth/register"}'::text, 10, true),
    ('pricing', 'pricing-individual', 'Individual', '{"price": "$20", "period": "/MO", "description": "Access to all features and content, perfect for individual learners.", "cta_label": "Get Started", "cta_href": "/Auth/register"}'::text, 20, true),
    ('pricing', 'pricing-teacher', 'Teacher', '{"price": "$25", "period": "/MO", "description": "Complete access with additional teaching tools and resources.", "cta_label": "Get Started", "cta_href": "/Auth/register"}'::text, 30, true),
    ('pricing', 'pricing-school', 'School', '{"price": "$15", "period": "/MO", "description": "Bulk pricing for schools, includes all features and management tools.", "cta_label": "Get Started", "cta_href": "/Auth/register"}'::text, 40, true)
) AS v(content_type, slug, title, content, sort_order, active)
  ON true
WHERE p.route = '/'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Home (/): services
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, description, content, sort_order, active)
SELECT p.id, 'services', v.content_type, v.slug, v.title, v.description, v.content::jsonb, v.sort_order, v.active
FROM public.pages p
JOIN (
  VALUES
    ('service', 'service-student-portal', 'Student Portal', 'Our lessons make learning feel like an exciting adventure, where young learners can explore and grow. Each lesson keeps students feeling they''re in class.', '{"icon": "🎓", "background_icons": ["📖","✏️","🎯"], "cta_label": "Learn more", "cta_href": "/platforms/student"}'::text, 10, true),
    ('service', 'service-teacher-resources', 'Teacher Resources', 'Access a comprehensive library of teaching materials, lesson plans, and interactive activities designed to make your EFL classes more engaging and effective.', '{"icon": "📚", "background_icons": ["📝","🎨","🔍"], "cta_label": "See resources", "cta_href": "/platforms/teacher"}'::text, 20, true),
    ('service', 'service-interactive-learning', 'Interactive Learning', 'Engage students with our interactive games and exploration features that make learning English fun while building confidence.', '{"icon": "🎮", "background_icons": ["🎲","🏆","⭐"], "cta_label": "Learn more", "cta_href": "/platforms/student"}'::text, 30, true),
    ('service', 'service-progress-tracking', 'Progress Tracking', 'Monitor student progress with detailed analytics and personalized learning paths that adapt to each student''s needs.', '{"icon": "📊", "background_icons": ["📈","🎯","🏅"], "cta_label": "Learn more", "cta_href": "/platforms/teacher"}'::text, 40, true),
    ('service', 'service-assessment-tools', 'Assessment Tools', 'Comprehensive evaluation tools and quizzes that help measure learning outcomes and identify areas for improvement in real-time.', '{"icon": "✅", "background_icons": ["📋","🎯","📝"], "cta_label": "Learn more", "cta_href": "/platforms/teacher"}'::text, 50, true),
    ('service', 'service-communication-hub', 'Communication Hub', 'Foster collaboration between students, teachers, and parents with our integrated messaging and feedback system.', '{"icon": "💬", "background_icons": ["📱","📧","👥"], "cta_label": "Learn more", "cta_href": "/platforms/teacher"}'::text, 60, true)
) AS v(content_type, slug, title, description, content, sort_order, active)
  ON true
WHERE p.route = '/'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Home (/): learning tools
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, description, content, sort_order, active)
SELECT p.id, 'learning-tools', v.content_type, v.slug, v.title, v.description, v.content::jsonb, v.sort_order, v.active
FROM public.pages p
JOIN (
  VALUES
    ('learning_tool', 'learning-tool-interactive-games', 'Interactive Games', 'Engage with our collection of fun, educational games that make learning English enjoyable and effective.', '{"icon": "🎮"}'::text, 10, true),
    ('learning_tool', 'learning-tool-digital-flashcards', 'Digital Flashcards', 'Master vocabulary and grammar with our interactive flashcard system that adapts to your learning progress.', '{"icon": "🎴"}'::text, 20, true),
    ('learning_tool', 'learning-tool-progress-tracking', 'Progress Tracking', 'Monitor your learning journey with detailed analytics and personalized learning paths.', '{"icon": "📊"}'::text, 30, true),
    ('learning_tool', 'learning-tool-practice-exercises', 'Practice Exercises', 'Reinforce your learning with a variety of exercises designed to improve your English skills.', '{"icon": "✍️"}'::text, 40, true),
    ('learning_tool', 'learning-tool-audio-resources', 'Audio Resources', 'Improve your pronunciation and listening skills with our comprehensive audio library.', '{"icon": "🎧"}'::text, 50, true),
    ('learning_tool', 'learning-tool-video-lessons', 'Video Lessons', 'Learn through engaging video content that brings English to life in real-world contexts.', '{"icon": "🎥"}'::text, 60, true)
) AS v(content_type, slug, title, description, content, sort_order, active)
  ON true
WHERE p.route = '/'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- About (/about): team members
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, subtitle, description, content, sort_order, active)
SELECT p.id, 'team', v.content_type, v.slug, v.title, v.subtitle, v.description, v.content::jsonb, v.sort_order, v.active
FROM public.pages p
JOIN (
  VALUES
    ('team_member', 'team-member-shinade-groves', 'Shinade Groves', 'Chief Executive Officer', 'Passionate about revolutionizing EFL education through innovative technology and engaging content.', '{"role": "CEO & Founder", "image": "/assets/images/characters/Emma.png", "expertise": ["Leadership","Education Strategy","Product Vision"]}'::text, 10, true),
    ('team_member', 'team-member-bobby-brown', 'Bobby Brown', 'Lead Developer', 'Full-stack developer dedicated to creating seamless learning experiences through cutting-edge technology.', '{"role": "Technical Lead", "image": "/assets/images/characters/Luke.png", "expertise": ["Full-Stack Development","UI/UX","System Architecture"]}'::text, 20, true),
    ('team_member', 'team-member-nathan-van-der-watt', 'Nathan Van Der Watt', 'Senior Designer', 'Creative visionary focused on designing beautiful, intuitive interfaces that enhance the learning experience.', '{"role": "Creative Lead", "image": "/assets/images/characters/Riley.png", "expertise": ["Visual Design","User Experience","Brand Identity"]}'::text, 30, true)
) AS v(content_type, slug, title, subtitle, description, content, sort_order, active)
  ON true
WHERE p.route = '/about'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- About (/about): stats
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, description, sort_order, active)
SELECT p.id, 'stats', v.content_type, v.slug, v.title, v.description, v.sort_order, v.active
FROM public.pages p
JOIN (
  VALUES
    ('about_stat', 'about-stat-students-worldwide', '10K+', 'Students Worldwide', 10, true),
    ('about_stat', 'about-stat-expert-teachers', '500+', 'Expert Teachers', 20, true),
    ('about_stat', 'about-stat-success-rate', '95%', 'Success Rate', 30, true),
    ('about_stat', 'about-stat-learning-support', '24-7', 'Learning Support', 40, true)
) AS v(content_type, slug, title, description, sort_order, active)
  ON true
WHERE p.route = '/about'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- About (/about): core values
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, description, content, sort_order, active)
SELECT p.id, 'values', v.content_type, v.slug, v.title, v.description, v.content::jsonb, v.sort_order, v.active
FROM public.pages p
JOIN (
  VALUES
    ('core_value', 'core-value-excellence', 'Excellence', 'We strive for the highest quality in everything we create', '{"icon": "🎓"}'::text, 10, true),
    ('core_value', 'core-value-community', 'Community', 'Building connections and fostering a supportive learning environment', '{"icon": "🤝"}'::text, 20, true),
    ('core_value', 'core-value-innovation', 'Innovation', 'Continuously evolving and improving our learning methods', '{"icon": "💡"}'::text, 30, true),
    ('core_value', 'core-value-accessibility', 'Accessibility', 'Making quality education available to everyone, everywhere', '{"icon": "🌍"}'::text, 40, true)
) AS v(content_type, slug, title, description, content, sort_order, active)
  ON true
WHERE p.route = '/about'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Contact (/contact): FAQs
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, description, content, sort_order, active)
SELECT p.id, 'faq', 'faq', v.slug, v.question, v.answer, '{"category":"contact"}'::jsonb, v.sort_order, true
FROM public.pages p
JOIN (
  VALUES
    ('faq-contact-courses', 'What types of English courses do you offer?', 'We offer a wide range of English courses including General English, Business English, IELTS Preparation, TOEFL Preparation, and Conversational English. Our courses cater to all proficiency levels from beginner to advanced.', 10),
    ('faq-contact-structure', 'How are the lessons structured?', 'Each lesson is 60 minutes long and includes interactive activities, real-world examples, and practical exercises. Our curriculum follows a communicative approach with focus on speaking, listening, reading, and writing skills.', 20),
    ('faq-contact-resources', 'What resources do teachers use?', 'Our teachers use a combination of modern textbooks, multimedia materials, authentic content, and our proprietary digital learning platform. All materials are regularly updated to ensure relevance and effectiveness.', 30),
    ('faq-contact-frequency', 'How many lessons can I take per week?', 'You can choose from flexible scheduling options ranging from 1 to 5 lessons per week. We recommend at least 2-3 lessons per week for optimal learning progress.', 40),
    ('faq-contact-activities', 'What types of activities are included?', 'Our lessons include role-plays, discussions, pronunciation practice, grammar exercises, vocabulary building, and cultural exchange activities. We also incorporate games and multimedia content to make learning engaging.', 50),
    ('faq-contact-exams', 'Do you offer exam preparation courses?', 'Yes, we specialize in preparation courses for IELTS, TOEFL, Cambridge exams, and other international English proficiency tests. Our teachers are experienced in exam strategies and techniques.', 60),
    ('faq-contact-access', 'How can I access the course content?', 'All course materials are available through our online learning platform. You can access them 24/7 from any device with an internet connection. We also provide downloadable resources for offline study.', 70),
    ('faq-contact-started', 'How do I get started?', 'Simply fill out the contact form above or reach out to us through email or phone. We''ll schedule a free consultation to assess your level and discuss your learning goals.', 80)
) AS v(slug, question, answer, sort_order)
  ON true
WHERE p.route = '/contact'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Pricing (/pricing): plans
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, subtitle, description, content, sort_order, active)
SELECT p.id, 'pricing-plans', 'pricing_plan', v.slug, v.title, v.badge, v.description, v.content::jsonb, v.sort_order, true
FROM public.pages p
JOIN (
  VALUES
    (
      'pricing-basic',
      'Basic',
      'Free',
      'Perfect for individual use and exploration of EFL learning',
      '{
        "variant": "basic",
        "price": "0",
        "currency": "$",
        "period": "/month",
        "button": { "label": "Get Started Free", "href": "/Auth/register/student", "style": "default" },
        "features": [
          "10 daily active users",
          "Basic learning resources access",
          "Limited EFL exercises",
          "Community support"
        ]
      }'::text,
      10
    ),
    (
      'pricing-premium',
      'Premium',
      'Most Popular',
      'Perfect for serious learners who want more features',
      '{
        "variant": "premium",
        "featured": true,
        "price": "9.99",
        "currency": "$",
        "period": "/month",
        "button": { "label": "Start Premium Trial", "href": "/Auth/register/student", "style": "primary" },
        "features": [
          "Unlimited active users",
          "Full learning resources access",
          "Priority email support",
          "Advanced EFL exercises",
          "Progress tracking",
          "Custom learning paths"
        ]
      }'::text,
      20
    ),
    (
      'pricing-enterprise',
      'Enterprise',
      'Enterprise',
      'Perfect for schools and large organizations',
      '{
        "variant": "enterprise",
        "price": "Custom",
        "button": { "label": "Contact Sales Team", "href": "/contact", "style": "enterprise" },
        "features": [
          "Custom user management",
          "Advanced analytics",
          "24/7 phone support",
          "Training workshops",
          "Custom curriculum development",
          "Dedicated account manager"
        ]
      }'::text,
      30
    )
) AS v(slug, title, badge, description, content, sort_order)
  ON true
WHERE p.route = '/pricing'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Student platform (/platforms/student): characters
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, content, sort_order, active)
SELECT p.id, 'characters', 'student_character', v.slug, v.name, v.content::jsonb, v.sort_order, true
FROM public.pages p
JOIN (
  VALUES
    ('student-character-cassidy', 'Cassidy', '{ "imageUrl": "/assets/images/characters/Cassidy.png" }'::text, 10),
    ('student-character-emma', 'Emma', '{ "imageUrl": "/assets/images/characters/Emma.png" }'::text, 20),
    ('student-character-luke', 'Luke', '{ "imageUrl": "/assets/images/characters/Luke.png" }'::text, 30),
    ('student-character-riley', 'Riley', '{ "imageUrl": "/assets/images/characters/Riley.png" }'::text, 40)
) AS v(slug, name, content, sort_order)
  ON true
WHERE p.route = '/platforms/student'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Student platform (/platforms/student): planets
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, content, sort_order, active)
SELECT p.id, 'planets', 'student_planet', v.slug, v.name, v.content::jsonb, v.sort_order, true
FROM public.pages p
JOIN (
  VALUES
    ('student-planet-earth', 'Earth', '{ "color": "var(--theme-muted)", "icon": "🌍" }'::text, 10),
    ('student-planet-mars', 'Mars', '{ "color": "var(--accent)", "icon": "🔴" }'::text, 20),
    ('student-planet-venus', 'Venus', '{ "color": "var(--text-secondary)", "icon": "🟠" }'::text, 30),
    ('student-planet-jupiter', 'Jupiter', '{ "color": "var(--theme-foreground)", "icon": "🪐" }'::text, 40),
    ('student-planet-saturn', 'Saturn', '{ "color": "var(--theme-muted-foreground)", "icon": "🪐" }'::text, 50),
    ('student-planet-neptune', 'Neptune', '{ "color": "var(--primary-three)", "icon": "🔵" }'::text, 60)
) AS v(slug, name, content, sort_order)
  ON true
WHERE p.route = '/platforms/student'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Teacher platform (/platforms/teacher): teaching tools
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, description, content, sort_order, active)
SELECT p.id, 'tools', 'teaching_tool', v.slug, v.title, v.description, v.content::jsonb, v.sort_order, true
FROM public.pages p
JOIN (
  VALUES
    ('teacher-tool-lesson-planner', 'Lesson Planner', 'Create and customize engaging lesson plans with templates, timing, and objectives.', '{"icon":"📝"}'::text, 10),
    ('teacher-tool-student-analytics', 'Student Analytics', 'Track student progress with dashboards, trends, and per-learner insights.', '{"icon":"📈"}'::text, 20),
    ('teacher-tool-interactive-resources', 'Interactive Resources', 'Use games, multimedia, and activities to keep every lesson lively and fun.', '{"icon":"🎮"}'::text, 30),
    ('teacher-tool-assessment-tools', 'Assessment Tools', 'Build quizzes, tests, and assignments with automated grading and feedback.', '{"icon":"✅"}'::text, 40),
    ('teacher-tool-progress-tracking', 'Progress Tracking', 'Monitor mastery, gaps, and pacing with detailed reports and alerts.', '{"icon":"📊"}'::text, 50),
    ('teacher-tool-resource-library', 'Resource Library', 'Browse ready-to-use slides, worksheets, and multimedia assets for any level.', '{"icon":"📚"}'::text, 60)
) AS v(slug, title, description, content, sort_order)
  ON true
WHERE p.route = '/platforms/teacher'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Teacher platform (/platforms/teacher): lesson modules
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, description, content, sort_order, active)
SELECT p.id, 'lesson-modules', 'lesson_module', v.slug, v.title, v.description, v.content::jsonb, v.sort_order, true
FROM public.pages p
JOIN (
  VALUES
    ('teacher-module-beginner', 'Beginner', 'Perfect for students with little to no English experience', '{"students":"25-30","lessons":"120+ lessons","duration":"6-8 months","colorKey":"muted"}'::text, 10),
    ('teacher-module-elementary', 'Elementary', 'Building foundational vocabulary and basic grammar skills', '{"students":"20-25","lessons":"150+ lessons","duration":"8-10 months","colorKey":"accent"}'::text, 20),
    ('teacher-module-pre-intermediate', 'Pre-Intermediate', 'Developing conversational skills and intermediate grammar', '{"students":"18-22","lessons":"180+ lessons","duration":"10-12 months","colorKey":"textSecondary"}'::text, 30),
    ('teacher-module-intermediate', 'Intermediate', 'Enhancing fluency and expanding vocabulary range', '{"students":"15-20","lessons":"200+ lessons","duration":"12-15 months","colorKey":"foreground"}'::text, 40),
    ('teacher-module-upper-intermediate', 'Upper-Intermediate', 'Advanced communication skills and complex grammar structures', '{"students":"12-18","lessons":"220+ lessons","duration":"15-18 months","colorKey":"mutedForeground"}'::text, 50),
    ('teacher-module-advanced', 'Advanced', 'Mastery of English for academic and professional contexts', '{"students":"10-15","lessons":"250+ lessons","duration":"18-24 months","colorKey":"primaryThree"}'::text, 60),
    ('teacher-module-business-english', 'Business English', 'Specialized vocabulary and skills for professional environments', '{"students":"8-12","lessons":"100+ lessons","duration":"6-8 months","colorKey":"secondaryHover"}'::text, 70),
    ('teacher-module-exam-prep', 'Exam Prep', 'Focused preparation for IELTS, TOEFL, and Cambridge exams', '{"students":"6-10","lessons":"80+ lessons","duration":"4-6 months","colorKey":"primaryTwo"}'::text, 80),
    ('teacher-module-conversation', 'Conversation', 'Fluency-focused speaking practice and cultural exchange', '{"students":"5-8","lessons":"60+ lessons","duration":"3-4 months","colorKey":"secondary"}'::text, 90),
    ('teacher-module-specialized', 'Specialized', 'Customized content for specific industries or interests', '{"students":"3-6","lessons":"40+ lessons","duration":"2-3 months","colorKey":"textMuted"}'::text, 100)
) AS v(slug, title, description, content, sort_order)
  ON true
WHERE p.route = '/platforms/teacher'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Teacher platform (/platforms/teacher): benefits
INSERT INTO public.content_items (page_id, section_key, content_type, slug, title, description, sort_order, active)
SELECT p.id, 'benefits', 'teacher_benefit', v.slug, v.title, v.description, v.sort_order, true
FROM public.pages p
JOIN (
  VALUES
    ('teacher-benefit-ready-made', 'Ready-Made Content', 'Access hundreds of pre-designed lesson plans, activities, and assessments that save you hours of preparation time.', 10),
    ('teacher-benefit-progress-tracking', 'Student Progress Tracking', 'Monitor individual and class progress with detailed analytics and performance reports.', 20),
    ('teacher-benefit-interactive-learning', 'Interactive Learning', 'Engage students with gamified lessons, multimedia content, and collaborative activities.', 30),
    ('teacher-benefit-flexible-scheduling', 'Flexible Scheduling', 'Manage your classes with flexible scheduling tools and automated reminders for students.', 40)
) AS v(slug, title, description, sort_order)
  ON true
WHERE p.route = '/platforms/teacher'
ON CONFLICT (slug) DO UPDATE SET
  page_id = EXCLUDED.page_id,
  section_key = EXCLUDED.section_key,
  content_type = EXCLUDED.content_type,
  title = EXCLUDED.title,
  subtitle = EXCLUDED.subtitle,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  metadata = EXCLUDED.metadata,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active,
  updated_at = now();

-- ---------- Auth pages: Login selection (/Auth/login)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'selection', 'content',
  '{
    "title": "Welcome Back",
    "subtitle": "Select your platform to continue:",
    "student_button_label": "📚 Student Login",
    "teacher_button_label": "👨‍🏫 Teacher Login",
    "register_prompt": "New to EFL Explorers?",
    "register_link_text": "Register here",
    "register_href": "/Auth/register"
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/Auth/login'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ---------- Auth pages: Register selection (/Auth/register)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'selection', 'content',
  '{
    "title": "Join EFL Explorers",
    "subtitle": "Choose your account type:",
    "student_button_label": "📚 Register as Student",
    "teacher_button_label": "👨‍🏫 Register as Teacher",
    "login_prompt": "Already have an account?",
    "login_link_text": "Login here",
    "login_href": "/Auth/login"
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/Auth/register'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ---------- Auth pages: Forgot password (/Auth/forgot-password)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'form', 'content',
  '{
    "form": {
      "title": "Forgot Password",
      "subtitle": "Enter your email to reset your password",
      "email_label": "Email",
      "submit_button_label": "Send Reset Link",
      "submit_button_loading_label": "Sending...",
      "back_to_login_text": "Back to Login",
      "back_to_login_href": "/Auth/login"
    },
    "success": {
      "title": "Check Your Email",
      "subtitle": "We''ve sent you a password reset link",
      "message1": "We''ve sent a password reset link to {email}.",
      "message2": "Please check your email and click the link to reset your password. The link will expire in 1 hour.",
      "return_text": "Return to Login",
      "return_href": "/Auth/login"
    }
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/Auth/forgot-password'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ---------- Auth pages: Reset password (/Auth/reset-password)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'form', 'content',
  '{
    "form": {
      "title": "Reset Password",
      "subtitle": "Enter your new password",
      "new_password_label": "New Password",
      "confirm_password_label": "Confirm New Password",
      "submit_button_label": "Update Password",
      "submit_button_loading_label": "Updating...",
      "back_to_login_text": "Back to Login",
      "back_to_login_href": "/Auth/login"
    },
    "success": {
      "title": "Password Updated",
      "subtitle": "Your password has been successfully reset",
      "message": "Your password has been successfully updated. You can now log in with your new password.",
      "go_to_login_text": "Go to Login",
      "go_to_login_href": "/Auth/login"
    }
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/Auth/reset-password'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ---------- Auth pages: Teacher pending (/Auth/register/teacher/pending)
INSERT INTO public.page_sections (page_id, section_key, section_type, content, sort_order, active)
SELECT p.id, 'content', 'content',
  '{
    "title": "Registration Pending",
    "messages": [
      "Thank you for registering as a teacher with EFL Explorers. Your application is currently under review.",
      "Our admin team will verify your credentials and approve your account. You will receive an email notification once your account has been approved.",
      "Please note that this process may take 1-2 business days."
    ],
    "button_label": "Return to Login",
    "button_href": "/Auth/login"
  }'::jsonb,
  10, true
FROM public.pages p WHERE p.route = '/Auth/register/teacher/pending'
ON CONFLICT (page_id, section_key) DO UPDATE SET content = EXCLUDED.content, active = true, sort_order = EXCLUDED.sort_order;

-- ============================================
-- 6) Legacy / compatibility seeds
-- ============================================
INSERT INTO public.faqs (category, question, answer, sort_order, active)
VALUES
  ('contact', 'How do I get started?', 'Fill out the contact form or reach out via email/phone. We''ll schedule a free consultation to assess your level and goals.', 10, true)
ON CONFLICT DO NOTHING;
