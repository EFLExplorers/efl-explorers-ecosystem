-- ============================================
-- PERFORMANCE INDEXES (Optional)
-- Run this after successful database reset if needed
-- ============================================

-- Pages indexes
CREATE INDEX IF NOT EXISTS idx_pages_route ON public.pages(route);

-- Content items indexes
CREATE INDEX IF NOT EXISTS idx_content_items_type_active ON public.content_items(content_type, active);
CREATE INDEX IF NOT EXISTS idx_content_items_sort_order ON public.content_items(sort_order);

-- Page sections indexes
CREATE INDEX IF NOT EXISTS idx_page_sections_page_id ON public.page_sections(page_id);
CREATE INDEX IF NOT EXISTS idx_page_sections_key ON public.page_sections(section_key);
CREATE INDEX IF NOT EXISTS idx_page_sections_active ON public.page_sections(active);

-- Success message
SELECT 'Performance indexes created successfully!' as status;