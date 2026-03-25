import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FROM_EMAIL, CLUB_NAME, CLUB_ADDRESS, CLUB_EMAIL, CLUB_PHONE } from '../_shared/constants.ts'

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-token, apikey, authorization, x-client-info',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 })
  }

  if (req.method !== 'POST' && req.method !== 'GET' && req.method !== 'PATCH') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Admin GET: list bookings for an event (v2)
    if (req.method === 'GET') {
      const authHeader = req.headers.get('Authorization')
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const token = authHeader.replace('Bearer ', '')
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (authError || !user || user.user_metadata?.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const url = new URL(req.url)
      const event_id = url.searchParams.get('event_id')
      if (!event_id) {
        return new Response(JSON.stringify({ error: 'Missing event_id' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
      }
      const { data, error } = await supabase
        .from('event_bookings')
        .select('*, members(full_name, email, membership_number)')
        .eq('event_id', event_id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return new Response(JSON.stringify({ bookings: data }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // PATCH: cancel a booking
    if (req.method === 'PATCH') {
      const sessionToken = req.headers.get('x-session-token')
      if (!sessionToken) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
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
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401,
        })
      }

      const { booking_id, guest_count } = await req.json()
      if (!booking_id) {
        return new Response(JSON.stringify({ error: 'Missing booking_id' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
        })
      }

      const { data: booking } = await supabase
        .from('event_bookings')
        .select('id, member_id, status, guest_count, event_id, events(price_per_person)')
        .eq('id', booking_id)
        .single()

      if (!booking || booking.member_id !== session.member_id) {
        return new Response(JSON.stringify({ error: 'Booking not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404,
        })
      }

      if (booking.status === 'cancelled') {
        return new Response(JSON.stringify({ error: 'Booking is already cancelled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
        })
      }

      const { data: member } = await supabase
        .from('members')
        .select('email')
        .eq('id', session.member_id)
        .single()
      const actorEmail = member?.email ?? null

      // Update guest count (resets to pending for re-approval)
      if (guest_count !== undefined) {
        if (!Number.isInteger(guest_count) || guest_count < 1 || guest_count > 20) {
          return new Response(JSON.stringify({ error: 'guest_count must be between 1 and 20' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400,
          })
        }
        const price = (booking as any).events?.price_per_person ?? 0
        const { error: updateError } = await supabase
          .from('event_bookings')
          .update({ guest_count, total_price: price * guest_count, status: 'pending' })
          .eq('id', booking_id)
        if (updateError) throw updateError

        const { error: auditError } = await supabase
          .from('booking_audit_log')
          .insert({
            booking_type: 'event',
            booking_id,
            action: 'member_guest_count_updated',
            previous_value: { guest_count: booking.guest_count, status: booking.status },
            new_value: { guest_count, status: 'pending' },
            performed_by_admin_email: actorEmail,
          })
        if (auditError) throw auditError

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
        })
      }

      // Cancel
      const { error: updateError } = await supabase
        .from('event_bookings')
        .update({ status: 'cancelled' })
        .eq('id', booking_id)

      if (updateError) throw updateError

      const { error: auditError } = await supabase
        .from('booking_audit_log')
        .insert({
          booking_type: 'event',
          booking_id,
          action: 'member_status_changed_to_cancelled',
          previous_value: { status: booking.status },
          new_value: { status: 'cancelled' },
          performed_by_admin_email: actorEmail,
        })
      if (auditError) throw auditError

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200,
      })
    }

    const sessionToken = req.headers.get('x-session-token')

    const { event_id, guest_count, special_requests, guest_name, guest_email, guest_phone } = await req.json()

    if (!event_id || !guest_count) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Resolve member if session token provided
    let member: { id: string; full_name: string; email: string; membership_number: string } | null = null

    if (sessionToken) {
      const { data: session } = await supabase
        .from('sessions')
        .select('member_id')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (session?.member_id) {
        const { data: m } = await supabase
          .from('members')
          .select('id, full_name, email, membership_number')
          .eq('id', session.member_id)
          .single()
        member = m
      }
    }

    // For non-members, require guest details
    if (!member && (!guest_name?.trim() || !guest_email?.trim())) {
      return new Response(JSON.stringify({ error: 'Name and email are required for non-member bookings' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, event_date, price_per_person, is_tba')
      .eq('id', event_id)
      .single()

    if (eventError || !event) {
      return new Response(JSON.stringify({ error: 'Event not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    if (event.is_tba) {
      return new Response(JSON.stringify({ error: 'This event date is TBA — bookings are not yet open' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    const total_price = (event.price_per_person ?? 0) * guest_count

    const { data: booking, error: bookingError } = await supabase
      .from('event_bookings')
      .insert({
        event_id,
        member_id: member?.id ?? null,
        guest_email: member ? null : (guest_email ?? null),
        guest_name: member ? null : guest_name,
        guest_phone: guest_phone || null,
        guest_count,
        special_requests: special_requests || null,
        total_price,
        status: 'pending',
      })
      .select()
      .single()

    if (bookingError) {
      return new Response(JSON.stringify({ error: bookingError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    // Send confirmation email to non-member guest
    if (!member && guest_email) {
      const resendKey = Deno.env.get('RESEND_API_KEY')
      if (resendKey) {
        const formattedDate = formatEventDate(event.event_date)
        const priceText = event.price_per_person
          ? `£${(event.price_per_person * guest_count).toFixed(2)} (${guest_count} × £${event.price_per_person})`
          : 'TBA'
        await sendEmail(resendKey, {
          from: FROM_EMAIL,
          to: [guest_email],
          subject: `Booking request received — ${event.title}`,
          html: `
            <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;">
              <p>Dear ${guest_name},</p>
              <p>Thank you for your booking request for the following event at ${CLUB_NAME}:</p>
              <div style="background:#f5f5f5;padding:15px;border-left:4px solid #002147;margin:20px 0;">
                <p style="margin:0;"><strong>${event.title}</strong><br>
                ${formattedDate}<br>
                Guests: ${guest_count}<br>
                Total: ${priceText}</p>
              </div>
              <p>We have received your request and will be in touch to confirm shortly. If you have any questions, please contact us:</p>
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

    return new Response(JSON.stringify({ id: booking.id, message: 'Booking submitted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
