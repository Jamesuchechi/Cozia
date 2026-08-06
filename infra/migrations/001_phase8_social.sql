-- Phase 8 Migration: Threaded Comments Support

ALTER TABLE public.comments
ADD COLUMN IF NOT EXISTS parent_comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE;
