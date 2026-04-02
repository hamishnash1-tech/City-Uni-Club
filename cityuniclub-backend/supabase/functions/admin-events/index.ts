// v2
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FROM_EMAIL, CLUB_NAME, CLUB_ADDRESS, CLUB_EMAIL, CLUB_PHONE, escapeHtml } from '../_shared/constants.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

function formatEventDate(dateStr: string | null): string {
  if (!dateStr) return 'Date TBA'
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

async function sendEmail(resendKey: string, payload: object) {
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
      body: JSON.stringify(payload),
    })
  } catch (e) {
    console.error('Email send failed:', e)
  }
}

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify caller is an authenticated admin via their JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await db.auth.getUser(token)

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const slug = url.searchParams.get('slug')

    if (req.method === 'GET') {
      if (id || slug) {
        const eventQuery = db.from('events').select('*')
        const eventResult = await (slug ? eventQuery.eq('slug', slug) : eventQuery.eq('id', id!)).single()
        if (eventResult.error) throw eventResult.error
        const eventId = eventResult.data.id
        const [bookingsResult, pdfsResult] = await Promise.all([
          db.from('event_bookings')
            .select('*, members(full_name, email, membership_number)')
            .eq('event_id', eventId)
            .order('created_at', { ascending: false }),
          db.from('event_assets')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true }),
        ])
        const bookingIds = (bookingsResult.data ?? []).map((b: any) => b.id)
        let auditByBooking: Record<string, any[]> = {}
        if (bookingIds.length > 0) {
          const { data: auditData } = await db
            .from('booking_audit_log')
            .select('booking_id, action, previous_value, new_value, performed_by_admin_email, performed_at')
            .eq('booking_type', 'event')
            .in('booking_id', bookingIds)
            .order('performed_at', { ascending: false })
          for (const entry of auditData ?? []) {
            if (!auditByBooking[entry.booking_id]) auditByBooking[entry.booking_id] = []
            auditByBooking[entry.booking_id].push(entry)
          }
        }
        const bookings = (bookingsResult.data ?? []).map((b: any) => ({
          ...b,
          audit_log: auditByBooking[b.id] ?? [],
        }))
        return new Response(JSON.stringify({ event: eventResult.data, bookings, pdfs: pdfsResult.data ?? [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const url2 = new URL(req.url)
      const pastPage = parseInt(url2.searchParams.get('past_page') ?? '0', 10)
      const pastLimit = 50

      // Past events (paginated, most recent first)
      if (url2.searchParams.get('past') === 'true') {
        const today = new Date().toISOString().split('T')[0]
        const { data, error, count } = await db
          .from('events')
          .select('*', { count: 'exact' })
          .lt('event_date', today)
          .order('event_date', { ascending: false })
          .range(pastPage * pastLimit, (pastPage + 1) * pastLimit - 1)
        if (error) throw error
        return new Response(JSON.stringify({ events: data, total: count }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }

      const today = new Date().toISOString().split('T')[0]

      // Last past event
      const { data: lastPast } = await db
        .from('events')
        .select('*')
        .lt('event_date', today)
        .order('event_date', { ascending: false })
        .limit(1)

      // Upcoming + TBA
      const { data: upcoming, error } = await db
        .from('events')
        .select('*')
        .or(`event_date.gte.${today},is_tba.eq.true`)
        .order('is_tba', { ascending: true })
        .order('event_date', { ascending: true, nullsFirst: false })
      if (error) throw error

      const events = [...(lastPast ?? []), ...(upcoming ?? [])]
      return new Response(JSON.stringify({ events }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { data, error } = await db.from('events').insert([body]).select().single()
      if (error) throw error
      return new Response(JSON.stringify({ event: data }), { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'PUT') {
      if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      const body = await req.json()
      const { data, error } = await db.from('events').update(body).eq('id', id).select().single()
      if (error) throw error
      return new Response(JSON.stringify({ event: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // PATCH: update a booking (status or guest_count)
    if (req.method === 'PATCH') {
      const { booking_id, status, guest_count, special_requests } = await req.json()
      if (!booking_id) return new Response(JSON.stringify({ error: 'Missing booking_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

      const { data: current } = await db
        .from('event_bookings')
        .select('status, guest_count, special_requests, guest_email, guest_name, member_id, event_id, events(title, event_date, price_per_person), members(email, full_name)')
        .eq('id', booking_id)
        .single()

      const updates: Record<string, any> = {}
      let action = ''
      const previousValue: Record<string, any> = {}
      const newValue: Record<string, any> = {}

      if (status !== undefined) {
        updates.status = status
        action = `status_changed_to_${status}`
        previousValue.status = current?.status
        newValue.status = status
      }
      if (guest_count !== undefined) {
        updates.guest_count = guest_count
        const price = (current as any)?.events?.price_per_person ?? 0
        updates.total_price = price * guest_count
        action = action ? `${action},guest_count_updated` : 'guest_count_updated'
        previousValue.guest_count = current?.guest_count
        newValue.guest_count = guest_count
      }
      if (special_requests !== undefined) {
        updates.special_requests = special_requests || null
        action = action ? `${action},notes_updated` : 'notes_updated'
        previousValue.special_requests = (current as any)?.special_requests ?? null
        newValue.special_requests = special_requests || null
      }

      if (Object.keys(updates).length === 0) return new Response(JSON.stringify({ error: 'Nothing to update' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

      const { error: updateError } = await db.from('event_bookings').update(updates).eq('id', booking_id)
      if (updateError) throw updateError

      // Send email notification to the booker
      const resendKey = Deno.env.get('RESEND_API_KEY')
      if (resendKey && current) {
        const recipientEmail = (current as any).guest_email ?? (current as any).members?.email ?? null
        const recipientName = (current as any).guest_name ?? (current as any).members?.full_name ?? 'Guest'
        const eventTitle = (current as any).events?.title ?? 'Event'
        const eventDate = formatEventDate((current as any).events?.event_date ?? null)
        const newGuestCount = updates.guest_count ?? current.guest_count

        if (recipientEmail) {
          let subject = ''
          let bodyContent = ''

          if (status === 'confirmed') {
            subject = `Booking confirmed — ${escapeHtml(eventTitle)}`
            bodyContent = `<p>Great news! Your booking for <strong>${escapeHtml(eventTitle)}</strong> on ${escapeHtml(eventDate)} has been confirmed.</p>
              <p>Guests: ${newGuestCount}</p>`
          } else if (status === 'cancelled') {
            subject = `Booking cancelled — ${escapeHtml(eventTitle)}`
            bodyContent = `<p>Your booking for <strong>${escapeHtml(eventTitle)}</strong> on ${escapeHtml(eventDate)} has been cancelled.</p>
              <p>If you believe this is an error or have any questions, please contact us.</p>`
          } else if (status === 'rejected') {
            subject = `Booking not confirmed — ${escapeHtml(eventTitle)}`
            bodyContent = `<p>Unfortunately, we are unable to confirm your booking for <strong>${escapeHtml(eventTitle)}</strong> on ${escapeHtml(eventDate)}.</p>
              <p>Please contact us if you have any questions.</p>`
          } else if (guest_count !== undefined) {
            subject = `Booking updated — ${escapeHtml(eventTitle)}`
            bodyContent = `<p>Your booking for <strong>${escapeHtml(eventTitle)}</strong> on ${escapeHtml(eventDate)} has been updated.</p>
              <p>Updated guest count: ${guest_count}</p>`
          }

          if (subject) {
            await sendEmail(resendKey, {
              from: FROM_EMAIL,
              to: [recipientEmail],
              subject,
              html: `
                <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;">
                  <p>Dear ${escapeHtml(recipientName)},</p>
                  ${bodyContent}
                  <p>If you have any questions, please contact us:</p>
                  <ul>
                    <li><strong>Phone:</strong> ${CLUB_PHONE}</li>
                    <li><strong>Email:</strong> ${CLUB_EMAIL}</li>
                  </ul>
                  <p>Warm regards,<br>${CLUB_NAME}<br>${CLUB_ADDRESS}</p>
                </body></html>
              `,
            })
          }
        }
      }

      await db.from('booking_audit_log').insert({
        booking_type: 'event',
        booking_id,
        action,
        previous_value: previousValue,
        new_value: newValue,
        performed_by_admin_id: user.id,
        performed_by_admin_email: user.email,
      })

      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    if (req.method === 'DELETE') {
      if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      const { error } = await db.from('events').delete().eq('id', id)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})
