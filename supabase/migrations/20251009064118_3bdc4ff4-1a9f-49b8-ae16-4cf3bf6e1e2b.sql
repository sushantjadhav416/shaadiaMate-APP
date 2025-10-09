-- Drop the existing check constraint
ALTER TABLE public.budget_items 
DROP CONSTRAINT IF EXISTS budget_items_status_check;

-- Add updated check constraint that includes 'pending'
ALTER TABLE public.budget_items 
ADD CONSTRAINT budget_items_status_check 
CHECK (status IN ('planned', 'pending', 'paid', 'booked', 'cancelled'));