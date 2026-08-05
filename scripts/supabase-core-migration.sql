-- Run once in Supabase SQL Editor before migrate-to-supabase.js

-- Allow all niveaux used by the site
ALTER TABLE public.content_exams DROP CONSTRAINT IF EXISTS content_exams_niveau_check;
ALTER TABLE public.content_exams
  ADD CONSTRAINT content_exams_niveau_check
  CHECK (niveau IN ('bac', 'bac2', 'bac3', 'master', 'licence'));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS content_exams_source_idx ON public.content_exams (source);
CREATE INDEX IF NOT EXISTS content_exams_id_niveau_idx ON public.content_exams (id, niveau);

-- Optional: after migration, fix any leftover Lot labels
-- UPDATE public.content_exams SET annee = '2026' WHERE id = 'e2db12096cfbf9370cb9d183';
