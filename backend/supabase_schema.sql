-- =============================================================================
-- CodeSeekho -- Supabase Setup SQL
-- Run this ONCE in your Supabase project:
--   Dashboard -> SQL Editor -> New Query -> paste all -> Run
-- =============================================================================

-- 1. Enable UUID extension (already active on most Supabase projects)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create the videos table
CREATE TABLE IF NOT EXISTS public.videos (
    id            UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id        TEXT          NOT NULL UNIQUE,
    title         TEXT          NOT NULL,
    language      TEXT          NOT NULL CHECK (language IN ('Python', 'C++')),
    scene_count   INTEGER       NOT NULL,
    script_json   JSONB         NOT NULL,
    video_url     TEXT          NOT NULL,
    storage_path  TEXT          NOT NULL,
    status        TEXT          NOT NULL DEFAULT 'completed',
    created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 3. Performance indexes
CREATE INDEX IF NOT EXISTS idx_videos_job_id  ON public.videos (job_id);
CREATE INDEX IF NOT EXISTS idx_videos_created ON public.videos (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_lang    ON public.videos (language);

-- 4. Enable Row Level Security
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;

-- 5. Service role policy (backend API uses service_role key -- full access)
DROP POLICY IF EXISTS "service_role_full_access" ON public.videos;
CREATE POLICY "service_role_full_access" ON public.videos
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- 6. Anon read policy (public-facing reads, e.g. a video gallery page)
DROP POLICY IF EXISTS "anon_read_only" ON public.videos;
CREATE POLICY "anon_read_only" ON public.videos
    FOR SELECT
    USING (true);

-- =============================================================================
-- STORAGE BUCKET
-- If the SELECT below errors, create the bucket manually instead:
--   Dashboard -> Storage -> New Bucket
--   Name:   sih_videos
--   Public: YES  (so video_url works without a signed URL)
-- =============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('sih_videos', 'sih_videos', true)
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- IRIS SCHEMA EXTENSIONS (Mother-Tongue FLN & Teacher Tablet Sync)
-- =============================================================================

-- 7. Create fln_lessons table (Bilingual NCERT FLN Lessons)
CREATE TABLE IF NOT EXISTS public.fln_lessons (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_code       TEXT          NOT NULL UNIQUE,
    title             TEXT          NOT NULL,
    grade             TEXT          NOT NULL,
    subject           TEXT          NOT NULL,
    hindi_text        TEXT          NOT NULL,
    santali_ol_chiki  TEXT          NOT NULL,
    santali_roman     TEXT          NOT NULL,
    vocabulary_json   JSONB         DEFAULT '[]'::jsonb,
    audio_url         TEXT,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 8. Create worksheets table (NIPUN Bharat Competency Worksheets)
CREATE TABLE IF NOT EXISTS public.worksheets (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    nipun_code        TEXT          NOT NULL,
    grade             TEXT          NOT NULL,
    title             TEXT          NOT NULL,
    content_json      JSONB         NOT NULL,
    created_by        TEXT          DEFAULT 'teacher',
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 9. Create classroom_logs table (Offline Tablet Sync Logs)
CREATE TABLE IF NOT EXISTS public.classroom_logs (
    id                UUID          PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id        TEXT          NOT NULL,
    school_code       TEXT          NOT NULL,
    log_type          TEXT          NOT NULL,
    payload           JSONB         NOT NULL,
    created_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 10. Enable RLS and Policies for IRIS Tables
ALTER TABLE public.fln_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classroom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_fln" ON public.fln_lessons FOR SELECT USING (true);
CREATE POLICY "anon_read_worksheets" ON public.worksheets FOR SELECT USING (true);
CREATE POLICY "service_all_fln" ON public.fln_lessons FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_worksheets" ON public.worksheets FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "service_all_logs" ON public.classroom_logs FOR ALL USING (true) WITH CHECK (true);

