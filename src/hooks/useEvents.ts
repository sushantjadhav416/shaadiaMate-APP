import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  event_time?: string;
  venue?: string;
  event_type: string;
  ritual_category?: string;
  expected_attendees?: number;
  assigned_coordinators?: any[];
  reminder_settings?: any;
  status: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  tasks?: any[];
}

export interface EventTemplate {
  id: string;
  name: string;
  category: string;
  event_type: string;
  ritual_category?: string;
  description?: string;
  typical_duration?: number;
  requirements?: string[];
  sequence_order?: number;
}

export const useEvents = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('event-management', {
        body: { action: 'get-user-events' }
      });
      
      if (error) throw error;
      return data.events as Event[];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Partial<Event>) => {
      const { data, error } = await supabase.functions.invoke('event-management', {
        body: { action: 'create', eventData }
      });
      
      if (error) throw error;
      return data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event created successfully",
        description: "Your event has been added to the timeline.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async ({ eventId, eventData }: { eventId: string; eventData: Partial<Event> }) => {
      const { data, error } = await supabase.functions.invoke('event-management', {
        body: { action: 'update', eventId, eventData }
      });
      
      if (error) throw error;
      return data.event;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Event updated successfully",
        description: "Your changes have been saved.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating event",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    events: eventsQuery.data || [],
    isLoading: eventsQuery.isLoading,
    error: eventsQuery.error,
    createEvent: createEventMutation.mutate,
    updateEvent: updateEventMutation.mutate,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
  };
};

export const useEventTemplates = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: ['event-templates'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ritual-templates', {
        body: { action: 'get-templates' }
      });
      
      if (error) throw error;
      return data.templates as EventTemplate[];
    },
  });

  const applyTimelineMutation = useMutation({
    mutationFn: async ({ baseDate, category }: { baseDate: string; category?: string }) => {
      const { data, error } = await supabase.functions.invoke('ritual-templates', {
        body: { action: 'apply-timeline', baseDate, category }
      });
      
      if (error) throw error;
      return data.events;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      toast({
        title: "Wedding timeline applied",
        description: "All ritual events have been added to your schedule.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error applying timeline",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const recommendedTimelineQuery = useQuery({
    queryKey: ['recommended-timeline'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ritual-templates', {
        body: { action: 'get-recommended-timeline', baseDate: new Date().toISOString().split('T')[0] }
      });
      
      if (error) throw error;
      return data.timeline;
    },
    enabled: false,
  });

  return {
    templates: templatesQuery.data || [],
    isLoading: templatesQuery.isLoading,
    applyTimeline: applyTimelineMutation.mutate,
    isApplying: applyTimelineMutation.isPending,
    getRecommendedTimeline: recommendedTimelineQuery.refetch,
    recommendedTimeline: recommendedTimelineQuery.data,
  };
};