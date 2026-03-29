
-- Add event_id to guests table to link guests to specific events
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS event_id uuid REFERENCES public.events(id) ON DELETE CASCADE;

-- Add guest_user_id to link a guest record to an auth user (when guest signs up)
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS guest_user_id uuid;

-- Add invite_token for shareable invite links
ALTER TABLE public.guests ADD COLUMN IF NOT EXISTS invite_token text UNIQUE;

-- Allow guest users to view events they are invited to
CREATE POLICY "Guests can view events they are invited to"
ON public.events FOR SELECT TO authenticated
USING (
  id IN (SELECT event_id FROM public.guests WHERE guest_user_id = auth.uid() AND event_id IS NOT NULL)
);

-- Allow guest users to view their own guest records by guest_user_id
CREATE POLICY "Guest users can view their guest records"
ON public.guests FOR SELECT TO authenticated
USING (guest_user_id = auth.uid());

-- Allow guest users to update their own RSVP
CREATE POLICY "Guest users can update their RSVP"
ON public.guests FOR UPDATE TO authenticated
USING (guest_user_id = auth.uid())
WITH CHECK (guest_user_id = auth.uid());
