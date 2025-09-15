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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { action, eventId, reminderData } = await req.json();

    switch (action) {
      case 'process-pending':
        return await processPendingReminders(supabaseClient);
      case 'schedule-custom':
        return await scheduleCustomReminder(supabaseClient, eventId, reminderData);
      case 'get-event-reminders':
        return await getEventReminders(supabaseClient, eventId);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    console.error('Error in reminder-system function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

async function processPendingReminders(supabaseClient: any) {
  const now = new Date();
  
  // Get all pending reminders that should be sent now
  const { data: reminders, error } = await supabaseClient
    .from('event_reminders')
    .select(`
      *,
      events!inner(title, event_date, event_time, ritual_category),
      profiles!inner(display_name, first_name, last_name)
    `)
    .eq('status', 'pending')
    .lte('reminder_time', now.toISOString());

  if (error) throw error;

  const processed = [];
  
  for (const reminder of reminders) {
    try {
      let success = false;
      
      switch (reminder.reminder_type) {
        case 'email':
          success = await sendEmailReminder(reminder);
          break;
        case 'sms':
          success = await sendSMSReminder(reminder);
          break;
        case 'in_app':
          success = await createInAppNotification(supabaseClient, reminder);
          break;
      }

      const updateData = {
        status: success ? 'sent' : 'failed',
        sent_at: success ? now.toISOString() : null
      };

      await supabaseClient
        .from('event_reminders')
        .update(updateData)
        .eq('id', reminder.id);

      processed.push({
        id: reminder.id,
        status: success ? 'sent' : 'failed',
        type: reminder.reminder_type
      });

    } catch (error) {
      console.error(`Failed to process reminder ${reminder.id}:`, error);
      
      await supabaseClient
        .from('event_reminders')
        .update({ status: 'failed' })
        .eq('id', reminder.id);
    }
  }

  return new Response(
    JSON.stringify({ processed }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function scheduleCustomReminder(supabaseClient: any, eventId: string, reminderData: any) {
  const { data, error } = await supabaseClient
    .from('event_reminders')
    .insert({
      event_id: eventId,
      user_id: reminderData.user_id,
      reminder_type: reminderData.type,
      reminder_time: reminderData.reminder_time,
      recipient_info: reminderData.recipient_info,
      message_template: reminderData.message_template
    })
    .select()
    .single();

  if (error) throw error;

  return new Response(
    JSON.stringify({ reminder: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function getEventReminders(supabaseClient: any, eventId: string) {
  const { data, error } = await supabaseClient
    .from('event_reminders')
    .select('*')
    .eq('event_id', eventId)
    .order('reminder_time');

  if (error) throw error;

  return new Response(
    JSON.stringify({ reminders: data }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

async function sendEmailReminder(reminder: any): Promise<boolean> {
  // This would integrate with email service (Resend, SendGrid, etc.)
  console.log('Email reminder sent:', {
    to: reminder.recipient_info,
    subject: `Reminder: ${reminder.events.title}`,
    message: reminder.message_template
  });
  return true;
}

async function sendSMSReminder(reminder: any): Promise<boolean> {
  // This would integrate with SMS service (Twilio, etc.)
  console.log('SMS reminder sent:', {
    to: reminder.recipient_info,
    message: reminder.message_template
  });
  return true;
}

async function createInAppNotification(supabaseClient: any, reminder: any): Promise<boolean> {
  // Create in-app notification record
  const { error } = await supabaseClient
    .from('notifications')
    .insert({
      user_id: reminder.user_id,
      title: `Reminder: ${reminder.events.title}`,
      message: reminder.message_template,
      type: 'event_reminder',
      metadata: {
        event_id: reminder.event_id,
        reminder_id: reminder.id
      }
    });

  return !error;
}