-- Drop the existing check constraint on events status
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- Add updated check constraint that includes 'ongoing' status
ALTER TABLE events ADD CONSTRAINT events_status_check 
CHECK (status IN ('planning', 'confirmed', 'ongoing', 'completed', 'cancelled'));