import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key for admin operations
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    console.log('Running automatic event status updater...')

    // Get current timestamp
    const now = new Date()
    console.log('Current time:', now.toISOString())

    // Find confirmed events where the event datetime has passed
    const { data: eventsToUpdate, error: fetchError } = await supabaseClient
      .from('events')
      .select('id, title, event_date, event_time, status')
      .eq('status', 'confirmed')
      .not('event_date', 'is', null)

    if (fetchError) {
      console.error('Error fetching events:', fetchError)
      throw fetchError
    }

    console.log(`Found ${eventsToUpdate?.length || 0} confirmed events to check`)

    let updatedCount = 0

    if (eventsToUpdate && eventsToUpdate.length > 0) {
      for (const event of eventsToUpdate) {
        // Combine event_date and event_time to get full datetime
        const eventDate = new Date(event.event_date)
        
        if (event.event_time) {
          // Parse time string (HH:MM:SS format)
          const [hours, minutes, seconds] = event.event_time.split(':').map(Number)
          eventDate.setHours(hours, minutes, seconds || 0)
        }

        console.log(`Checking event "${event.title}": scheduled for ${eventDate.toISOString()}`)

        // Check if the event datetime has passed
        if (eventDate <= now) {
          console.log(`Updating event "${event.title}" to ongoing status`)
          
          const { error: updateError } = await supabaseClient
            .from('events')
            .update({ status: 'ongoing' })
            .eq('id', event.id)

          if (updateError) {
            console.error(`Error updating event ${event.id}:`, updateError)
          } else {
            updatedCount++
            console.log(`Successfully updated event "${event.title}" to ongoing`)
          }
        } else {
          console.log(`Event "${event.title}" is not ready to start yet`)
        }
      }
    }

    console.log(`Auto-status update completed. Updated ${updatedCount} events to ongoing status.`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Auto-status update completed. Updated ${updatedCount} events to ongoing status.`,
        updatedCount,
        checkedEvents: eventsToUpdate?.length || 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in auto-status-updater function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})