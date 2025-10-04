-- Add timer tracking columns to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS started_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS ended_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS actual_duration integer, -- in minutes
ADD COLUMN IF NOT EXISTS pause_history jsonb DEFAULT '[]'::jsonb;

-- Update the status check constraint to include 'ended' status
ALTER TABLE public.events DROP CONSTRAINT IF EXISTS events_status_check;
ALTER TABLE public.events ADD CONSTRAINT events_status_check 
  CHECK (status IN ('planning', 'confirmed', 'ongoing', 'ended', 'draft'));