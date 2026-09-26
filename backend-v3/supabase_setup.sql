-- =============================================
-- CodeSeekho V3 - Supabase Setup SQL
-- Run this in: Supabase Dashboard -> SQL Editor
-- =============================================

-- 1. Create videos table
CREATE TABLE IF NOT EXISTS public.videos (
  id            BIGSERIAL PRIMARY KEY,
  job_id        TEXT UNIQUE NOT NULL,
  title         TEXT,
  language      TEXT DEFAULT 'English',
  scene_count   INTEGER DEFAULT 0,
  script_json   JSONB,
  video_url     TEXT,
  storage_path  TEXT,
  status        TEXT DEFAULT 'completed',
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 3. Allow full access (for backend service role)
CREATE POLICY "Allow all operations" ON public.videos
  FOR ALL USING (true) WITH CHECK (true);

-- 4. Create study_tools table (for Flashcards & Worksheets)
CREATE TABLE IF NOT EXISTS public.study_tools (
  id          BIGSERIAL PRIMARY KEY,
  tool_id     TEXT UNIQUE NOT NULL,
  type        TEXT,  -- 'flashcard' or 'worksheet'
  title       TEXT,
  language    TEXT DEFAULT 'English',
  data        JSONB,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.study_tools ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations" ON public.study_tools
  FOR ALL USING (true) WITH CHECK (true);

-- 5. Create Storage Bucket for sih_videos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('sih_videos', 'sih_videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public access to the bucket
CREATE POLICY "Public Access" ON storage.objects FOR ALL USING (bucket_id = 'sih_videos');

-- Done!
SELECT 'Setup complete!' as status;
