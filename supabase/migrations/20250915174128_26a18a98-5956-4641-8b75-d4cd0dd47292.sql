-- Extend events table with ritual-specific fields
ALTER TABLE public.events 
ADD COLUMN event_time TIME,
ADD COLUMN event_type TEXT DEFAULT 'wedding',
ADD COLUMN ritual_category TEXT,
ADD COLUMN expected_attendees INTEGER,
ADD COLUMN assigned_coordinators JSONB DEFAULT '[]'::jsonb,
ADD COLUMN reminder_settings JSONB DEFAULT '{"enabled": true, "days_before": [7, 3, 1], "hours_before": [24, 2]}'::jsonb,
ADD COLUMN is_template BOOLEAN DEFAULT false;

-- Create event templates table for AI-recommended Hindu wedding timelines
CREATE TABLE public.event_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  event_type TEXT NOT NULL,
  ritual_category TEXT,
  description TEXT,
  typical_duration INTEGER, -- in minutes
  requirements TEXT[],
  sequence_order INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create event reminders table for auto-reminder system
CREATE TABLE public.event_reminders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reminder_type TEXT NOT NULL, -- 'email', 'sms', 'in_app'
  reminder_time TIMESTAMP WITH TIME ZONE NOT NULL,
  recipient_info JSONB NOT NULL, -- email, phone, or user_id
  message_template TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
  sent_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.event_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_reminders ENABLE ROW LEVEL SECURITY;

-- RLS policies for event_templates (public read access for templates)
CREATE POLICY "Event templates are viewable by everyone" 
ON public.event_templates 
FOR SELECT 
USING (true);

-- RLS policies for event_reminders (user-specific access)
CREATE POLICY "Users can view their own reminders" 
ON public.event_reminders 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own reminders" 
ON public.event_reminders 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reminders" 
ON public.event_reminders 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reminders" 
ON public.event_reminders 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on new tables
CREATE TRIGGER update_event_templates_updated_at
BEFORE UPDATE ON public.event_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_event_reminders_updated_at
BEFORE UPDATE ON public.event_reminders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert Hindu wedding ritual templates
INSERT INTO public.event_templates (name, category, event_type, ritual_category, description, typical_duration, requirements, sequence_order) VALUES
('Engagement Ceremony', 'pre_wedding', 'pre-wedding', 'engagement', 'Official engagement ceremony with ring exchange', 180, ARRAY['Rings', 'Sweets', 'Flowers', 'Photographer'], 1),
('Haldi Ceremony', 'pre_wedding', 'pre-wedding', 'haldi', 'Turmeric ceremony for purification and blessings', 120, ARRAY['Turmeric paste', 'Rose water', 'Traditional clothes', 'Flowers'], 2),
('Mehendi Ceremony', 'pre_wedding', 'pre-wedding', 'mehendi', 'Henna application ceremony with music and celebration', 240, ARRAY['Henna artists', 'Music system', 'Seating arrangements', 'Refreshments'], 3),
('Sangeet Night', 'pre_wedding', 'pre-wedding', 'sangeet', 'Musical night with dance performances by families', 300, ARRAY['DJ/Musicians', 'Dance floor', 'Sound system', 'Decorations'], 4),
('Tilaka Ceremony', 'wedding', 'wedding', 'tilaka', 'Pre-wedding ritual with tilaka application', 60, ARRAY['Tilaka materials', 'Religious items', 'Priest'], 5),
('Baraat Arrival', 'wedding', 'wedding', 'baraat', 'Groom arrival with procession', 90, ARRAY['Horse/Car decoration', 'Band/DJ', 'Sehenai players'], 6),
('Jaimala Ceremony', 'wedding', 'wedding', 'jaimala', 'Exchange of garlands between bride and groom', 30, ARRAY['Flower garlands', 'Stage setup', 'Photographer'], 7),
('Saat Phere', 'wedding', 'wedding', 'saat_phere', 'Seven sacred rounds around the fire', 45, ARRAY['Sacred fire setup', 'Priest', 'Wedding vows'], 8),
('Sindoor Ceremony', 'wedding', 'wedding', 'sindoor', 'Application of sindoor by groom', 15, ARRAY['Sindoor', 'Mirror'], 9),
('Bidaai', 'wedding', 'wedding', 'bidaai', 'Farewell ceremony for bride', 30, ARRAY['Traditional items', 'Car decoration'], 10),
('Griha Pravesh', 'post_wedding', 'post-wedding', 'griha_pravesh', 'Welcome ceremony at groom home', 60, ARRAY['Kalash', 'Rice', 'Flowers', 'Aarti items'], 11),
('Reception Party', 'post_wedding', 'post-wedding', 'reception', 'Celebration dinner for extended family and friends', 180, ARRAY['Venue decoration', 'Catering', 'Entertainment', 'Photography'], 12);