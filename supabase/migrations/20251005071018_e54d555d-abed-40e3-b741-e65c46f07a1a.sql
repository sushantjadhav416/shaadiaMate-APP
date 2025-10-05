-- Add expected_duration column to events table
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS expected_duration integer; -- in minutes

COMMENT ON COLUMN public.events.expected_duration IS 'Expected duration of the event in minutes';