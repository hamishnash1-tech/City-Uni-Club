import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function authenticate(req: Request, supabaseClient: any) {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  const { data } = await supabaseClient
    .from('sessions')
    .select('member_id')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  return data?.member_id || null
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const member_id = await authenticate(req, supabaseClient)
    
    if (!member_id) {
      throw new Error('Unauthorized')
    }

    const { event_id, meal_option, guest_count, special_requests } = await req.json()

    if (!event_id || !guest_count) {
      throw new Error('Event ID and guest count required')
    }

    // Get event
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('id, price_per_person, event_type')
      .eq('id', event_id)
      .eq('is_active', true)
      .single()

    if (eventError || !event) {
      throw new Error('Event not found')
    }

    // Validate meal option for lunch_dinner events
    if (event.event_type === 'lunch_dinner' && !meal_option) {
      throw new Error('Meal option required for lunch/dinner events')
    }

    const totalPrice = Number(event.price_per_person) * guest_count

    // Create booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('event_bookings')
      .insert({
        event_id: event_id,
        member_id: member_id,
        meal_option: meal_option || null,
        guest_count: guest_count,
        special_requests: special_requests || null,
        total_price: totalPrice,
        status: 'pending',
        booked_at: new Date().toISOString()
      })
      .select(`
        *,
        events (
          id,
          title,
          event_type,
          event_date
        )
      `)
      .single()

    if (bookingError) {
      throw bookingError
    }

    return new Response(
      JSON.stringify({ booking, message: 'Booking created successfully' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized' ? 401 : 400
      }
    )
  }
})
