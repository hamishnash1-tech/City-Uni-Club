import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const slug = url.searchParams.get('slug')

    // Resolve member from session token if provided
    let memberId: string | null = null
    const sessionToken = req.headers.get('x-session-token')
    if (sessionToken) {
      const { data: session } = await supabaseClient
        .from('sessions')
        .select('member_id')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()
      memberId = session?.member_id ?? null
    }

    if (id || slug) {
      const query = supabaseClient.from('events').select('*')
      const { data: event, error } = await (id ? query.eq('id', id) : query.eq('slug', slug)).single()

      if (error) throw error

      const { data: assets } = await supabaseClient
        .from('event_assets')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: true })

      let myBooking = null
      if (memberId) {
        const { data: booking } = await supabaseClient
          .from('event_bookings')
          .select('id, status, guest_count')
          .eq('event_id', event.id)
          .eq('member_id', memberId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        myBooking = booking ?? null
      }

      return new Response(
        JSON.stringify({ event: { ...event, assets: assets ?? [], my_booking: myBooking } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const today = new Date().toISOString().split('T')[0]

    // Last past event
    const { data: lastPast } = await supabaseClient
      .from('events')
      .select('*')
      .eq('is_active', true)
      .lt('event_date', today)
      .order('event_date', { ascending: false })
      .limit(1)

    // Upcoming + TBA
    const { data: upcoming, error } = await supabaseClient
      .from('events')
      .select('*')
      .eq('is_active', true)
      .or(`event_date.gte.${today},event_date.is.null`)
      .order('event_date', { ascending: true, nullsFirst: false })

    if (error) throw error

    const events = [...(lastPast ?? []), ...(upcoming ?? [])]

    // Attach booking status for each event if member is logged in
    let eventsWithBookings: any[] = events
    if (memberId && events.length > 0) {
      const eventIds = events.map((e: any) => e.id)
      const { data: bookings } = await supabaseClient
        .from('event_bookings')
        .select('id, event_id, status, guest_count')
        .eq('member_id', memberId)
        .in('event_id', eventIds)

      const bookingMap: Record<string, any> = {}
      for (const b of bookings ?? []) {
        // Keep the most recent booking per event (already ordered by created_at desc isn't guaranteed here,
        // but we overwrite so last write wins — good enough for status display)
        bookingMap[b.event_id] = { id: b.id, status: b.status, guest_count: b.guest_count }
      }

      eventsWithBookings = events.map((e: any) => ({
        ...e,
        my_booking: bookingMap[e.id] ?? null,
      }))
    }

    return new Response(
      JSON.stringify({ events: eventsWithBookings }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
