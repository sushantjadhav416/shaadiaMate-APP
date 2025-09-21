-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Enable pg_net extension for HTTP requests
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule the auto-status-updater function to run every 5 minutes
SELECT cron.schedule(
  'auto-update-event-status',
  '*/5 * * * *', -- every 5 minutes
  $$
  SELECT
    net.http_post(
        url:='https://yfviydzxgalogzzbvzzy.supabase.co/functions/v1/auto-status-updater',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlmdml5ZHp4Z2Fsb2d6emJ2enp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3ODY3ODgsImV4cCI6MjA3MzM2Mjc4OH0.dJ3f1YxEdg-ZiJGol4BE8UmcOXTrjIQDKxcH5e6GFhw"}'::jsonb,
        body:='{"trigger": "cron"}'::jsonb
    ) as request_id;
  $$
);