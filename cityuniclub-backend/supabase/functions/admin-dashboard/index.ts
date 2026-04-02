import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      })
    }

    const today = new Date().toISOString().split('T')[0]

    // Today's dining reservations
    const { data: diningData, error: diningError } = await supabase
      .from('dining_reservations')
      .select(`
        id, meal_type, guest_count, reservation_time, status, table_preference, special_requests,
        guest_name, guest_email,
        members (full_name, email)
      `)
      .eq('reservation_date', today)
      .order('reservation_time', { ascending: true })

    if (diningError) throw diningError

    // Today's events with booking counts
    const { data: eventsData, error: eventsError } = await supabase
      .from('events')
      .select(`
        id, title, event_type, event_date, price_per_person, is_tba,
        event_bookings (id, guest_count, status)
      `)
      .eq('event_date', today)
      .eq('is_active', true)

    if (eventsError) throw eventsError

    const events = (eventsData || []).map((event: any) => {
      const bookings = event.event_bookings || []
      const confirmedBookings = bookings.filter((b: any) => b.status !== 'cancelled')
      return {
        id: event.id,
        title: event.title,
        event_type: event.event_type,
        price_per_person: event.price_per_person,
        is_tba: event.is_tba,
        booking_count: confirmedBookings.length,
        total_guests: confirmedBookings.reduce((sum: number, b: any) => sum + (b.guest_count || 1), 0),
      }
    })

    return new Response(JSON.stringify({
      today,
      dining: diningData || [],
      events,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
