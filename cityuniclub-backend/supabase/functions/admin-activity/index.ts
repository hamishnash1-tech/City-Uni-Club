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

    if (req.method !== 'GET') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 405
      })
    }

    const url = new URL(req.url)
    const type = url.searchParams.get('type') // 'event' | 'dining' | 'loi' | 'event_admin' | null (all)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200)
    const offset = parseInt(url.searchParams.get('offset') || '0')

    const overfetch = offset + limit

    // All activity comes from booking_audit_log
    const { data, count, error: qError } = await (() => {
      let q = supabase
        .from('booking_audit_log')
        .select('booking_id, booking_type, action, previous_value, new_value, performed_by_admin_email, performed_at', { count: 'exact' })
        .order('performed_at', { ascending: false })
        .range(0, overfetch - 1)
      if (type === 'dining') q = q.eq('booking_type', 'dining')
      else if (type === 'event') q = q.eq('booking_type', 'event')
      else if (type === 'event_admin') q = q.eq('booking_type', 'event_admin')
      else if (type === 'loi') q = q.eq('booking_type', 'loi')
      return q
    })()

    if (qError) throw qError

    // Normalise entries
    const allEntries = (data ?? []).map((e: any) => ({
      _type: e.booking_type === 'event_admin'
        ? 'event_admin'
        : e.booking_type === 'loi'
          ? 'loi'
          : e.action === 'booking_created'
            ? (e.booking_type === 'event' ? 'new_event_booking' : 'new_dining_booking')
            : 'booking_change',
      _ts: e.performed_at,
      booking_id: e.booking_id,
      booking_type: e.booking_type,
      action: e.action,
      previous_value: e.previous_value,
      new_value: e.new_value,
      performed_by_admin_email: e.performed_by_admin_email,
      performed_at: e.performed_at,
      booking: null,
    }))

    const total = count ?? 0
    const page = allEntries.slice(offset, offset + limit)

    // Enrich entries with related records
    const eventBookingIds = page
      .filter((e: any) => (e._type === 'booking_change' || e._type === 'new_event_booking') && e.booking_type === 'event')
      .map((e: any) => e.booking_id)
    const diningBookingIds = page
      .filter((e: any) => (e._type === 'booking_change' || e._type === 'new_dining_booking') && e.booking_type === 'dining')
      .map((e: any) => e.booking_id)
    const loiIds = page.filter((e: any) => e._type === 'loi').map((e: any) => e.booking_id)
    const eventAdminIds = page.filter((e: any) => e._type === 'event_admin').map((e: any) => e.booking_id)

    const [eventBookings, diningBookings, loiRequests, eventRecords] = await Promise.all([
      eventBookingIds.length > 0
        ? supabase.from('event_bookings')
            .select('id, guest_name, guest_email, guest_count, total_price, status, member_id, members(first_name, middle_name, last_name, email, membership_number), events(id, title, event_date, slug)')
            .in('id', eventBookingIds)
        : { data: [] },
      diningBookingIds.length > 0
        ? supabase.from('dining_reservations')
            .select('id, guest_name, guest_email, guest_count, status, member_id, members(first_name, middle_name, last_name, email, membership_number), reservation_date, reservation_time')
            .in('id', diningBookingIds)
        : { data: [] },
      loiIds.length > 0
        ? supabase.from('loi_requests')
            .select('id, status, arrival_date, departure_date, purpose, member_id, members(first_name, middle_name, last_name, email, membership_number), reciprocal_clubs(id, name, city, country)')
            .in('id', loiIds)
        : { data: [] },
      eventAdminIds.length > 0
        ? supabase.from('events').select('id, title, event_date, slug').in('id', eventAdminIds)
        : { data: [] },
    ])

    const bookingMap: Record<string, any> = {}
    for (const b of (eventBookings.data ?? [])) bookingMap[b.id] = b
    for (const b of (diningBookings.data ?? [])) bookingMap[b.id] = b
    const loiMap: Record<string, any> = {}
    for (const l of (loiRequests.data ?? [])) loiMap[l.id] = l
    const eventMap: Record<string, any> = {}
    for (const ev of (eventRecords.data ?? [])) eventMap[ev.id] = ev

    const entries = page.map((e: any) => {
      if (e._type === 'loi') return { ...e, booking: loiMap[e.booking_id] ?? null }
      if (e._type === 'event_admin') return { ...e, booking: eventMap[e.booking_id] ?? null }
      return { ...e, booking: bookingMap[e.booking_id] ?? null }
    })

    return new Response(JSON.stringify({ entries, total }), {
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
