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

    const { action, category, baseDate } = await req.json();

    switch (action) {
      case 'get-templates':
        return await getTemplates(supabaseClient, category);
      case 'apply-timeline':
        return await applyTimeline(supabaseClient, baseDate, category);
      case 'get-recommended-timeline':
        return await getRecommendedTimeline(supabaseClient, baseDate);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in ritual-templates function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function getTemplates(supabaseClient: any, category?: string) {
  let query = supabaseClient
    .from('event_templates')
    .select('*')
    .eq('is_active', true)
    .order('sequence_order');

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;

  return new Response(
    JSON.stringify({ templates: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function applyTimeline(supabaseClient: any, baseDate: string, category?: string) {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  let query = supabaseClient
    .from('event_templates')
    .select('*')
    .eq('is_active', true)
    .order('sequence_order');

  if (category) {
    query = query.eq('category', category);
  }

  const { data: templates, error } = await query;
  if (error) throw error;

  const weddingDate = new Date(baseDate);
  const events = [];

  for (const template of templates) {
    let eventDate = new Date(weddingDate);
    
    // Calculate suggested dates based on typical Hindu wedding timeline
    switch (template.ritual_category) {
      case 'engagement':
        eventDate.setDate(eventDate.getDate() - 30); // 1 month before
        break;
      case 'haldi':
        eventDate.setDate(eventDate.getDate() - 2); // 2 days before
        break;
      case 'mehendi':
        eventDate.setDate(eventDate.getDate() - 1); // 1 day before
        break;
      case 'sangeet':
        eventDate.setDate(eventDate.getDate() - 1); // 1 day before (evening)
        break;
      case 'griha_pravesh':
        eventDate.setDate(eventDate.getDate() + 1); // 1 day after
        break;
      case 'reception':
        eventDate.setDate(eventDate.getDate() + 7); // 1 week after
        break;
      default:
        // Wedding day events
        eventDate = new Date(weddingDate);
    }

    const eventData = {
      title: template.name,
      description: template.description,
      event_type: template.event_type,
      ritual_category: template.ritual_category,
      event_date: eventDate.toISOString().split('T')[0],
      event_time: getDefaultTime(template.ritual_category),
      expected_attendees: getDefaultAttendees(template.ritual_category),
      user_id: user.id,
      reminder_settings: {
        enabled: true,
        days_before: [7, 3, 1],
        hours_before: [24, 2]
      }
    };

    events.push(eventData);
  }

  const { data: createdEvents, error: insertError } = await supabaseClient
    .from('events')
    .insert(events)
    .select();

  if (insertError) throw insertError;

  // Generate checklists for each event
  for (let i = 0; i < createdEvents.length; i++) {
    const event = createdEvents[i];
    const template = templates[i];
    
    if (template.requirements && template.requirements.length > 0) {
      const tasks = template.requirements.map((requirement: string) => ({
        title: requirement,
        description: `Required for ${template.name}`,
        category: template.ritual_category,
        due_date: event.event_date,
        priority: 'medium',
        user_id: user.id,
        event_id: event.id,
      }));

      await supabaseClient.from('tasks').insert(tasks);
    }
  }

  return new Response(
    JSON.stringify({ events: createdEvents }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getRecommendedTimeline(supabaseClient: any, baseDate: string) {
  const { data: templates, error } = await supabaseClient
    .from('event_templates')
    .select('*')
    .eq('is_active', true)
    .order('sequence_order');

  if (error) throw error;

  const weddingDate = new Date(baseDate);
  const timeline = templates.map(template => {
    let suggestedDate = new Date(weddingDate);
    
    switch (template.ritual_category) {
      case 'engagement':
        suggestedDate.setDate(suggestedDate.getDate() - 30);
        break;
      case 'haldi':
        suggestedDate.setDate(suggestedDate.getDate() - 2);
        break;
      case 'mehendi':
        suggestedDate.setDate(suggestedDate.getDate() - 1);
        break;
      case 'sangeet':
        suggestedDate.setDate(suggestedDate.getDate() - 1);
        break;
      case 'griha_pravesh':
        suggestedDate.setDate(suggestedDate.getDate() + 1);
        break;
      case 'reception':
        suggestedDate.setDate(suggestedDate.getDate() + 7);
        break;
    }

    return {
      ...template,
      suggested_date: suggestedDate.toISOString().split('T')[0],
      suggested_time: getDefaultTime(template.ritual_category),
      estimated_attendees: getDefaultAttendees(template.ritual_category)
    };
  });

  return new Response(
    JSON.stringify({ timeline }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

function getDefaultTime(category: string): string {
  const timeMap: { [key: string]: string } = {
    engagement: '18:00',
    haldi: '10:00',
    mehendi: '15:00',
    sangeet: '19:00',
    tilaka: '08:00',
    baraat: '17:00',
    jaimala: '18:30',
    saat_phere: '19:00',
    sindoor: '20:00',
    bidaai: '21:00',
    griha_pravesh: '12:00',
    reception: '19:00'
  };
  
  return timeMap[category] || '10:00';
}

function getDefaultAttendees(category: string): number {
  const attendeeMap: { [key: string]: number } = {
    engagement: 50,
    haldi: 30,
    mehendi: 40,
    sangeet: 100,
    tilaka: 20,
    baraat: 150,
    jaimala: 200,
    saat_phere: 200,
    sindoor: 200,
    bidaai: 150,
    griha_pravesh: 50,
    reception: 300
  };
  
  return attendeeMap[category] || 50;
}