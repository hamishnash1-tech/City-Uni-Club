import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FROM_EMAIL, CLUB_NAME, CLUB_ADDRESS, CLUB_EMAIL, CLUB_PHONE, escapeHtml } from '../_shared/constants.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

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
    return new Response('ok', { headers: corsHeaders, status: 204 })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const sessionToken = req.headers.get('x-session-token')

    const { reservation_date, reservation_time, meal_type, guest_count, table_preference, special_requests, guest_name, guest_email, guest_phone } = await req.json()

    if (!reservation_date || !reservation_time || !meal_type || !guest_count) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Resolve member if session token provided
    let member: { id: string; first_name: string; middle_name: string | null; last_name: string; email: string; membership_number: string } | null = null

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
          .select('id, first_name, middle_name, last_name, email, membership_number')
          .eq('id', session.member_id)
          .single()
        member = m
      }
    }

    // For non-members, require guest details
    if (!member && (!guest_name?.trim() || !guest_email?.trim())) {
      return new Response(JSON.stringify({ error: 'Name and email are required for non-member bookings' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const price_per_person = 45.00
    const total_price = price_per_person * guest_count

    const { data: reservation, error: reservationError } = await supabase
      .from('dining_reservations')
      .insert({
        member_id: member?.id ?? null,
        guest_name: member ? null : guest_name,
        guest_email: member ? null : guest_email,
        guest_phone: guest_phone || null,
        reservation_date,
        reservation_time,
        meal_type,
        guest_count,
        table_preference: table_preference || null,
        special_requests: special_requests || null,
        total_price,
        status: 'pending'
      })
      .select('*')
      .single()

    if (reservationError) {
      return new Response(JSON.stringify({ error: 'Failed to create reservation: ' + reservationError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    await supabase.from('booking_audit_log').insert({
      booking_type: 'dining',
      booking_id: reservation.id,
      action: 'booking_created',
      previous_value: null,
      new_value: { guest_count, status: 'pending', member_id: member?.id ?? null },
      performed_by_admin_email: member?.email ?? guest_email ?? null,
    })

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (resendKey) {
      const bookerName = member
        ? [member.first_name, member.middle_name, member.last_name].filter(Boolean).join(' ')
        : guest_name
      const bookerEmail = member ? member.email : guest_email
      const membershipInfo = member
        ? `<p><strong>Membership No:</strong> ${escapeHtml(member.membership_number)}</p>`
        : '<p><em>Non-member booking</em></p>'

      const reservationDetails = `
        <div style="background-color:#f5f5f5;padding:15px;border-left:4px solid #A3C1AD;margin:20px 0;">
          <p style="margin:0;"><strong>Date:</strong> ${escapeHtml(reservation_date)}<br>
          <strong>Time:</strong> ${escapeHtml(reservation_time)}<br>
          <strong>Meal Type:</strong> ${escapeHtml(meal_type)}<br>
          <strong>Guests:</strong> ${guest_count}<br>
          <strong>Table Preference:</strong> ${escapeHtml(table_preference || 'Not specified')}<br>
          <strong>Total Price:</strong> £${total_price.toFixed(2)}</p>
        </div>
        ${special_requests ? `<div style="background-color:#fff3cd;padding:15px;border-left:4px solid #ffc107;margin:20px 0;">
          <strong>Special Requests:</strong><br>${escapeHtml(special_requests)}
        </div>` : ''}
      `

      if (bookerEmail) {
        await sendEmail(resendKey, {
          from: FROM_EMAIL,
          to: [bookerEmail],
          subject: `Dining reservation request received`,
          html: `
            <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;">
              <p>Dear ${escapeHtml(bookerName)},</p>
              <p>Thank you for your dining reservation request at ${CLUB_NAME}. We will be in touch to confirm shortly.</p>
              ${reservationDetails}
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

      await sendEmail(resendKey, {
        from: FROM_EMAIL,
        to: [CLUB_EMAIL],
        subject: `New dining reservation — ${escapeHtml(bookerName)}`,
        html: `
          <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;">
            <h2 style="color:#002147;">New Dining Reservation</h2>
            <div style="background-color:#f5f5f5;padding:15px;border-left:4px solid #002147;margin:20px 0;">
              <p style="margin:0;"><strong>Name:</strong> ${escapeHtml(bookerName)}<br>
              <strong>Email:</strong> ${bookerEmail ? escapeHtml(bookerEmail) : '—'}<br>
              ${guest_phone ? `<strong>Phone:</strong> ${escapeHtml(guest_phone)}<br>` : ''}
              ${membershipInfo}</p>
            </div>
            ${reservationDetails}
            <p>Please review this reservation in the admin dashboard.</p>
          </body></html>
        `,
      })
    }

    return new Response(JSON.stringify({
      reservation,
      message: 'Dining reservation submitted successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
