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

      case 'send-invite': {
        const { guestId, appUrl } = params;
        const lovableApiKey = Deno.env.get('LOVABLE_API_KEY');
        const resendKey = Deno.env.get('RESEND_API_KEY');
        if (!lovableApiKey || !resendKey) {
          return new Response(JSON.stringify({ error: 'Email sending is not configured' }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const { data: guest, error: gErr } = await supabase
          .from('guests')
          .select('*')
          .eq('id', guestId)
          .eq('user_id', user.id)
          .single();
        if (gErr || !guest) {
          return new Response(JSON.stringify({ error: 'Guest not found' }), {
            status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (!guest.email) {
          return new Response(JSON.stringify({ error: 'This guest has no email address' }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        let token = guest.invite_token;
        if (!token) {
          token = crypto.randomUUID();
          await supabase.from('guests').update({ invite_token: token }).eq('id', guest.id);
        }

        let eventTitle = 'our celebration';
        let eventWhen = '';
        let eventVenue = '';
        if (guest.event_id) {
          const { data: ev } = await supabase
            .from('events')
            .select('title, event_date, venue')
            .eq('id', guest.event_id)
            .single();
          if (ev) {
            eventTitle = ev.title;
            eventVenue = ev.venue || '';
            eventWhen = ev.event_date
              ? new Date(ev.event_date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })
              : '';
          }
        }

        // Never link to the gated Lovable editor preview (id-preview--*) — those URLs
        // ask the recipient to sign in to Lovable. Prefer an explicit APP_URL secret.
        const configuredUrl = Deno.env.get('APP_URL');
        const candidate = (typeof appUrl === 'string' && appUrl.startsWith('http') && !appUrl.includes('id-preview--') && !appUrl.includes('localhost'))
          ? appUrl
          : (configuredUrl && configuredUrl.startsWith('http') ? configuredUrl : null);
        const baseUrl = (candidate ?? configuredUrl ?? 'https://shaadimate.lovable.app').replace(/\/$/, '');
        const inviteLink = `${baseUrl}/?invite=${token}`;
        const fromAddress = Deno.env.get('INVITE_FROM_EMAIL') || 'ShaadiMate <onboarding@resend.dev>';

        const html = `
          <div style="font-family: Georgia, serif; max-width: 560px; margin: 0 auto; padding: 32px; color: #3b2f2f;">
            <p style="letter-spacing: 3px; text-transform: uppercase; font-size: 12px; color: #b76e79;">You're invited</p>
            <h1 style="font-size: 26px; margin: 8px 0 16px;">${eventTitle}</h1>
            <p>Dear ${guest.first_name} ${guest.last_name},</p>
            <p>We would be delighted to have you join us${eventWhen ? ` on <strong>${eventWhen}</strong>` : ''}${eventVenue ? ` at <strong>${eventVenue}</strong>` : ''}.</p>
            <p>Use the link below to create your guest account (or sign in) and confirm your RSVP:</p>
            <p style="margin: 28px 0;">
              <a href="${inviteLink}" style="background:#b76e79;color:#fff;text-decoration:none;padding:14px 26px;border-radius:8px;display:inline-block;">View invitation &amp; RSVP</a>
            </p>
            <p style="font-size: 12px; color: #7a6b6b;">If the button doesn't work, copy this link: <br />${inviteLink}</p>
          </div>`;

        const emailRes = await fetch('https://connector-gateway.lovable.dev/resend/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${lovableApiKey}`,
            'X-Connection-Api-Key': resendKey,
          },
          body: JSON.stringify({
            from: fromAddress,
            to: [guest.email],
            subject: `Invitation: ${eventTitle}`,
            html,
          }),
        });

        if (!emailRes.ok) {
          const details = await emailRes.text();
          console.error(`Resend request failed [${emailRes.status}]: ${details}`);
          return new Response(JSON.stringify({ error: 'Failed to send invitation email', status: emailRes.status, details }), {
            status: emailRes.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        await supabase.from('guests').update({ invitation_sent: true }).eq('id', guest.id);

        return new Response(JSON.stringify({ success: true, inviteLink }), {
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
