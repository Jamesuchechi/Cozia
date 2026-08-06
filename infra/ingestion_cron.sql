-- ========================================================
-- COZIA INGESTION CRON JOB & SUPABASE EDGE FUNCTION SETUP
-- ========================================================

-- 1. Enable pg_cron and pg_net extensions
CREATE EXTENSION IF NOT EXISTS "pg_cron";
CREATE EXTENSION IF NOT EXISTS "pg_net";

-- 2. Create function to trigger scheduled video ingestion Edge Function
CREATE OR REPLACE FUNCTION public.trigger_video_ingestion()
RETURNS void AS $$
DECLARE
  supabase_url TEXT := current_setting('custom.supabase_url', true);
  service_role_key TEXT := current_setting('custom.service_role_key', true);
BEGIN
  PERFORM net.http_post(
    url := supabase_url || '/functions/v1/ingest-videos',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || service_role_key
    ),
    body := '{}'::jsonb
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Schedule ingestion job every 4 hours via pg_cron
SELECT cron.schedule(
  'cozia-scheduled-video-ingestion',
  '0 */4 * * *',
  $$ SELECT public.trigger_video_ingestion(); $$
);
