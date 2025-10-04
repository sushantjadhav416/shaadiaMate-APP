import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, eventData, eventId } = await req.json();

    switch (action) {
      case 'create':
        return await createEvent(supabaseClient, eventData);
      case 'update':
        return await updateEvent(supabaseClient, eventId, eventData);
      case 'get-user-events':
        return await getUserEvents(supabaseClient);
      case 'duplicate-from-template':
        return await duplicateFromTemplate(supabaseClient, eventData);
      case 'delete':
        return await deleteEvent(supabaseClient, eventId);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in event-management function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function createEvent(supabaseClient: any, eventData: any) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabaseClient
    .from('events')
    .insert({
      ...eventData,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;

  // Schedule reminders if enabled
  if (eventData.reminder_settings?.enabled) {
    await scheduleReminders(supabaseClient, data.id, user.id, eventData);
  }

  return new Response(
    JSON.stringify({ event: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function updateEvent(supabaseClient: any, eventId: string, eventData: any) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Handle status changes with timestamp tracking
  if (eventData.status === 'ongoing' && !eventData.started_at) {
    eventData.started_at = new Date().toISOString();
  }
  
  if (eventData.status === 'ended' && !eventData.ended_at) {
    eventData.ended_at = new Date().toISOString();
    
    // Calculate duration if event was started
    const { data: currentEvent } = await supabaseClient
      .from('events')
      .select('started_at')
      .eq('id', eventId)
      .single();
    
    if (currentEvent?.started_at) {
      const startTime = new Date(currentEvent.started_at).getTime();
      const endTime = new Date().getTime();
      eventData.actual_duration = Math.floor((endTime - startTime) / 60000); // in minutes
    }
  }

  // Handle restart - reset timestamps
  if (eventData.status === 'confirmed' && eventData.restart) {
    eventData.started_at = null;
    eventData.ended_at = null;
    eventData.actual_duration = null;
    delete eventData.restart;
  }

  const { data, error } = await supabaseClient
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ event: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getUserEvents(supabaseClient: any) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data, error } = await supabaseClient
    .from('events')
    .select(`
      *,
      tasks (
        id,
        title,
        status,
        due_date,
        priority
      )
    `)
    .eq('user_id', user.id)
    .order('event_date', { ascending: true });

  if (error) throw error;

  return new Response(
    JSON.stringify({ events: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function duplicateFromTemplate(supabaseClient: any, { templateId, customizations }: any) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { data: template, error: templateError } = await supabaseClient
    .from('event_templates')
    .select('*')
    .eq('id', templateId)
    .single();

  if (templateError) throw templateError;

  const eventData = {
    title: customizations.title || template.name,
    description: template.description,
    event_type: template.event_type,
    ritual_category: template.ritual_category,
    event_date: customizations.event_date,
    event_time: customizations.event_time,
    venue: customizations.venue,
    expected_attendees: customizations.expected_attendees,
    user_id: user.id,
  };

  const { data, error } = await supabaseClient
    .from('events')
    .insert(eventData)
    .select()
    .single();

  if (error) throw error;

  // Auto-generate checklist from template requirements
  if (template.requirements && template.requirements.length > 0) {
    const tasks = template.requirements.map((requirement: string, index: number) => ({
      title: requirement,
      description: `Required for ${template.name}`,
      category: template.ritual_category,
      due_date: customizations.event_date,
      priority: 'medium',
      user_id: user.id,
      event_id: data.id,
    }));

    await supabaseClient.from('tasks').insert(tasks);
  }

  return new Response(
    JSON.stringify({ event: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function deleteEvent(supabaseClient: any, eventId: string) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // Delete associated tasks first
  await supabaseClient
    .from('tasks')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id);

  // Delete associated reminders
  await supabaseClient
    .from('event_reminders')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', user.id);

  // Delete the event
  const { error } = await supabaseClient
    .from('events')
    .delete()
    .eq('id', eventId)
    .eq('user_id', user.id);

  if (error) throw error;

  return new Response(
    JSON.stringify({ success: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scheduleReminders(supabaseClient: any, eventId: string, userId: string, eventData: any) {
  const reminders = [];
  const eventDateTime = new Date(`${eventData.event_date} ${eventData.event_time || '00:00'}`);

  // Schedule reminders based on settings
  const settings = eventData.reminder_settings;
  
  // Day-based reminders
  if (settings.days_before) {
    for (const days of settings.days_before) {
      const reminderTime = new Date(eventDateTime);
      reminderTime.setDate(reminderTime.getDate() - days);
      
      reminders.push({
        event_id: eventId,
        user_id: userId,
        reminder_type: 'email',
        reminder_time: reminderTime.toISOString(),
        recipient_info: { type: 'coordinators' },
        message_template: `Reminder: ${eventData.title} is in ${days} days`,
      });
    }
  }

  // Hour-based reminders
  if (settings.hours_before) {
    for (const hours of settings.hours_before) {
      const reminderTime = new Date(eventDateTime);
      reminderTime.setHours(reminderTime.getHours() - hours);
      
      reminders.push({
        event_id: eventId,
        user_id: userId,
        reminder_type: 'in_app',
        reminder_time: reminderTime.toISOString(),
        recipient_info: { type: 'all' },
        message_template: `Urgent: ${eventData.title} starts in ${hours} hours`,
      });
    }
  }

  if (reminders.length > 0) {
    await supabaseClient.from('event_reminders').insert(reminders);
  }
}
