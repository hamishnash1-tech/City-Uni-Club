import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { 
      event_id, 
      member_email, 
      guest_count, 
      guest_emails, 
      meal_option, 
      special_requests 
    } = await req.json()

    if (!event_id || !member_email) {
      throw new Error('Event ID and member email are required')
    }

    // Get event details
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
      throw new Error('Please select lunch or dinner sitting')
    }

    // Calculate total price
    const totalPrice = Number(event.price_per_person) * (1 + (guest_count || 0))

    // Create booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from('event_bookings')
      .insert({
        event_id: event_id,
        member_email: member_email,
        guest_count: guest_count || 0,
        guest_emails: guest_emails?.filter((email: string) => email.trim() !== '') || [],
        meal_option: meal_option || null,
        special_requests: special_requests || null,
        total_price: totalPrice,
        status: 'pending',
        booked_at: new Date().toISOString()
      })
      .select()
      .single()

    if (bookingError) {
      console.error('Booking error:', bookingError)
      throw bookingError
    }

    // TODO: Send confirmation email to member and guests
    // This would integrate with an email service like SendGrid, Resend, etc.

    return new Response(
      JSON.stringify({ 
        booking,
        message: 'Booking confirmed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      }
    )
  } catch (error: any) {
    console.error('Booking error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
