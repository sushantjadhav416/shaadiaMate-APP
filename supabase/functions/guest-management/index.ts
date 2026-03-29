import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { action, ...params } = await req.json();

    switch (action) {
      case 'get-event-guests': {
        const { eventId } = params;
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .eq('event_id', eventId)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ guests: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-all-guests': {
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        return new Response(JSON.stringify({ guests: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'add-guest': {
        const { guestData } = params;
        const inviteToken = crypto.randomUUID();
        const { data, error } = await supabase
          .from('guests')
          .insert({
            ...guestData,
            user_id: user.id,
            invite_token: inviteToken,
          })
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ guest: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-guest': {
        const { guestId, guestData } = params;
        const { data, error } = await supabase
          .from('guests')
          .update(guestData)
          .eq('id', guestId)
          .eq('user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ guest: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'delete-guest': {
        const { guestId } = params;
        const { error } = await supabase
          .from('guests')
          .delete()
          .eq('id', guestId)
          .eq('user_id', user.id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'claim-invite': {
        const { inviteToken } = params;
        // Find guest by invite token
        const { data: guest, error: findError } = await supabase
          .from('guests')
          .select('*')
          .eq('invite_token', inviteToken)
          .single();
        if (findError || !guest) {
          return new Response(JSON.stringify({ error: 'Invalid invite token' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        // Link guest to the authenticated user
        const { data, error } = await supabase
          .from('guests')
          .update({ guest_user_id: user.id })
          .eq('id', guest.id)
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ guest: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'get-my-invitations': {
        // Get all guest records linked to this user
        const { data: guestRecords, error: gError } = await supabase
          .from('guests')
          .select('*')
          .eq('guest_user_id', user.id);
        if (gError) throw gError;

        // Get event details for each invitation
        const eventIds = guestRecords?.map(g => g.event_id).filter(Boolean) || [];
        let events: any[] = [];
        if (eventIds.length > 0) {
          const { data: eventData, error: eError } = await supabase
            .from('events')
            .select('*')
            .in('id', eventIds)
            .order('event_date', { ascending: true });
          if (eError) throw eError;
          events = eventData || [];
        }

        return new Response(JSON.stringify({ guestRecords, events }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      case 'update-rsvp': {
        const { guestId, rsvpStatus, dietaryRestrictions } = params;
        const updateData: any = { rsvp_status: rsvpStatus };
        if (dietaryRestrictions !== undefined) {
          updateData.dietary_restrictions = dietaryRestrictions;
        }
        const { data, error } = await supabase
          .from('guests')
          .update(updateData)
          .eq('id', guestId)
          .eq('guest_user_id', user.id)
          .select()
          .single();
        if (error) throw error;
        return new Response(JSON.stringify({ guest: data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      default:
        return new Response(JSON.stringify({ error: 'Unknown action' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
