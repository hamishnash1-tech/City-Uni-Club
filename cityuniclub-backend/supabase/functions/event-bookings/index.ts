import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FROM_EMAIL, CLUB_NAME, CLUB_ADDRESS } from '../_shared/constants.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-token, apikey, authorization',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 204 })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
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
        member_email: member?.email ?? guest_email ?? null,
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

    // Email notification
    const resendKey = Deno.env.get('RESEND_API_KEY')
    const bookerName = member?.full_name ?? guest_name
    const bookerEmail = member?.email ?? guest_email
    const membershipInfo = member
      ? `<p><strong>Membership Number:</strong> ${member.membership_number}</p>`
      : `<p><em>Non-member booking</em></p>`

    if (resendKey) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: ['secretary@cityuniversityclub.co.uk'],
            subject: `Event Booking – ${event.title} – ${bookerName}`,
            html: `
              <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
                <h2 style="color:#002147;">New Event Booking</h2>
                <div style="background:#f5f5f5;padding:15px;border-left:4px solid #002147;margin:20px 0;">
                  <h3 style="margin-top:0;color:#002147;">Booker</h3>
                  <p><strong>Name:</strong> ${bookerName}<br>
                  <strong>Email:</strong> ${bookerEmail}<br>
                  ${guest_phone ? `<strong>Phone:</strong> ${guest_phone}<br>` : ''}
                  </p>
                  ${membershipInfo}
                </div>
                <div style="background:#f5f5f5;padding:15px;border-left:4px solid #A3C1AD;margin:20px 0;">
                  <h3 style="margin-top:0;color:#002147;">Event</h3>
                  <p><strong>Event:</strong> ${event.title}<br>
                  <strong>Date:</strong> ${event.is_tba ? 'TBA' : event.event_date}<br>
                  <strong>Guests:</strong> ${guest_count}<br>
                  <strong>Total:</strong> £${total_price.toFixed(2)}</p>
                </div>
                ${special_requests ? `<div style="background:#fff3cd;padding:15px;border-left:4px solid #ffc107;margin:20px 0;">
                  <h3 style="margin-top:0;color:#856404;">Special Requests</h3>
                  <p>${special_requests}</p>
                </div>` : ''}
                <hr style="border:none;border-top:1px solid #ddd;margin:30px 0;">
                <p style="color:#666;font-size:12px;"><strong>${CLUB_NAME}</strong><br>${CLUB_ADDRESS}</p>
              </body></html>
            `,
          }),
        })
      } catch (e) {
        console.error('Email failed:', e)
      }
    }

    return new Response(JSON.stringify({ booking, message: 'Booking submitted successfully' }), {
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
