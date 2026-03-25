import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-token',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Authenticate via session token
    const sessionToken = req.headers.get('x-session-token')
    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const { data: session } = await supabase
      .from('sessions')
      .select('member_id')
      .eq('token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session?.member_id) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const memberId = session.member_id
    // Fetch event bookings with event details
    const { data: eventBookings, error: ebError } = await supabase
      .from('event_bookings')
      .select(`
        id,
        guest_count,
        total_price,
        status,
        created_at,
        events (
          id,
          title,
          event_date,
          event_type,
          is_tba,
          price_per_person
        )
      `)
      .eq('member_id', memberId)
      .order('created_at', { ascending: false })

    if (ebError) throw ebError

    // Fetch dining reservations
    const { data: diningReservations, error: drError } = await supabase
      .from('dining_reservations')
      .select('id, reservation_date, reservation_time, meal_type, guest_count, status, special_requests')
      .eq('member_id', memberId)
      .order('reservation_date', { ascending: false })

    if (drError) throw drError

    const today = new Date().toISOString().split('T')[0]

    // Classify event bookings
    const upcomingEvents: any[] = []
    const pastEvents: any[] = []

    for (const booking of (eventBookings ?? [])) {
      const event = (booking as any).events
      if (!event) continue
      const entry = {
        id: booking.id,
        type: 'event' as const,
        title: event.title,
        event_type: event.event_type,
        event_date: event.event_date,
        is_tba: event.is_tba,
        guest_count: booking.guest_count,
        total_price: booking.total_price,
        status: booking.status,
        booked_at: booking.created_at,
      }
      if (event.is_tba || !event.event_date || event.event_date >= today) {
        upcomingEvents.push(entry)
      } else {
        pastEvents.push(entry)
      }
    }

    // Classify dining reservations
    const upcomingDining: any[] = []
    const pastDining: any[] = []

    for (const res of (diningReservations ?? [])) {
      const entry = {
        id: res.id,
        type: 'dining' as const,
        title: `${res.meal_type} Reservation`,
        reservation_date: res.reservation_date,
        reservation_time: res.reservation_time,
        meal_type: res.meal_type,
        guest_count: res.guest_count,
        status: res.status,
        special_requests: res.special_requests,
      }
      if (res.reservation_date >= today) {
        upcomingDining.push(entry)
      } else {
        pastDining.push(entry)
      }
    }

    // Sort upcoming: soonest first (TBA at end)
    const upcoming = [
      ...upcomingEvents.sort((a, b) => {
        if (a.is_tba && !b.is_tba) return 1
        if (!a.is_tba && b.is_tba) return -1
        return (a.event_date ?? '').localeCompare(b.event_date ?? '')
      }),
      ...upcomingDining.sort((a, b) => a.reservation_date.localeCompare(b.reservation_date)),
    ]

    const past = [
      ...pastEvents,
      ...pastDining,
    ].sort((a, b) => {
      const aDate = a.event_date ?? a.reservation_date ?? ''
      const bDate = b.event_date ?? b.reservation_date ?? ''
      return bDate.localeCompare(aDate) // most recent first
    })

    return new Response(JSON.stringify({ upcoming, past }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
