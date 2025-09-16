-- Fix the tasks-events relationship
ALTER TABLE tasks ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX idx_tasks_event_id ON tasks(event_id);

-- Update the events table to ensure event_date is timestamp with time zone (if not already)
-- This might already exist, so we'll use IF NOT EXISTS equivalent
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' 
    AND column_name = 'event_date' 
    AND data_type = 'timestamp with time zone'
  ) THEN
    ALTER TABLE events ALTER COLUMN event_date TYPE timestamp with time zone;
  END IF;
END $$;