import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FROM_EMAIL, CLUB_NAME, CLUB_ADDRESS, CLUB_EMAIL, CLUB_PHONE, escapeHtml } from '../_shared/constants.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

function formatDiningDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

function formatDiningTime(timeStr: string): string {
  return timeStr.slice(0, 5)
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

  if (req.method !== 'POST' && req.method !== 'PATCH') {
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

    // Try to resolve member from session token (optional)
    let memberId: string | null = null
    const sessionToken = req.headers.get('x-session-token')

    if (sessionToken) {
      const { data: session } = await supabase
        .from('sessions')
        .select('member_id')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      memberId = session?.member_id ?? null
    }

    // PATCH: cancel or update a reservation
    if (req.method === 'PATCH') {
      if (!memberId) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        })
      }

      const { reservation_id, guest_count, special_requests } = await req.json()
      if (!reservation_id) {
        return new Response(JSON.stringify({ error: 'Missing reservation_id' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      // Verify ownership and that the date is editable (upcoming or yesterday)
      const { data: existing } = await supabase
        .from('dining_reservations')
        .select('id, reservation_date, reservation_time, meal_type, guest_count, status, member_id')
        .eq('id', reservation_id)
        .single()

      if (!existing || existing.member_id !== memberId) {
        return new Response(JSON.stringify({ error: 'Reservation not found' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        })
      }

      if (existing.status === 'cancelled') {
        return new Response(JSON.stringify({ error: 'Reservation is already cancelled' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      if (existing.reservation_date < yesterdayStr) {
        return new Response(JSON.stringify({ error: 'Reservation cannot be modified' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }

      const { data: member } = await supabase
        .from('members')
        .select('email, full_name')
        .eq('id', memberId)
        .single()
      const actorEmail = member?.email ?? null
      const actorName = member?.full_name ?? 'Member'
      const formattedDate = formatDiningDate(existing.reservation_date)
      const formattedTime = formatDiningTime(existing.reservation_time)
      const resendKey = Deno.env.get('RESEND_API_KEY')

      // Update guest count (resets to pending for re-approval)
      if (guest_count !== undefined) {
        if (!Number.isInteger(guest_count) || guest_count < 1 || guest_count > 20) {
          return new Response(JSON.stringify({ error: 'guest_count must be between 1 and 20' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }
        const { error: updateError } = await supabase
          .from('dining_reservations')
          .update({ guest_count, status: 'pending' })
          .eq('id', reservation_id)
        if (updateError) throw updateError

        const { error: auditError } = await supabase
          .from('booking_audit_log')
          .insert({
            booking_type: 'dining',
            booking_id: reservation_id,
            action: 'member_guest_count_updated',
            previous_value: { guest_count: existing.guest_count, status: existing.status },
            new_value: { guest_count, status: 'pending' },
            performed_by_admin_email: actorEmail,
          })
        if (auditError) throw auditError

        if (resendKey && actorEmail) {
          await sendEmail(resendKey, {
            from: FROM_EMAIL,
            to: [actorEmail],
            subject: `Dining reservation updated — ${formattedDate}`,
            html: `
              <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;">
                <p>Dear ${escapeHtml(actorName)},</p>
                <p>Your dining reservation has been updated.</p>
                <p><strong>Date:</strong> ${escapeHtml(formattedDate)}<br>
                <strong>Time:</strong> ${escapeHtml(formattedTime)}<br>
                <strong>Meal:</strong> ${escapeHtml(existing.meal_type)}<br>
                <strong>Guests:</strong> ${guest_count}<br>
                <strong>Status:</strong> Pending confirmation</p>
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

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }

      // Update notes
      if (special_requests !== undefined) {
        if (special_requests && special_requests.length > 256) {
          return new Response(JSON.stringify({ error: 'Notes must be 256 characters or fewer' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          })
        }
        const { error: updateError } = await supabase
          .from('dining_reservations')
          .update({ special_requests: special_requests || null })
          .eq('id', reservation_id)
        if (updateError) throw updateError

        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }

      // Cancel
      const { error: updateError } = await supabase
        .from('dining_reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservation_id)

      if (updateError) throw updateError

      const { error: auditError } = await supabase
        .from('booking_audit_log')
        .insert({
          booking_type: 'dining',
          booking_id: reservation_id,
          action: 'member_status_changed_to_cancelled',
          previous_value: { status: existing.status },
          new_value: { status: 'cancelled' },
          performed_by_admin_email: actorEmail,
        })
      if (auditError) throw auditError

      if (resendKey && actorEmail) {
        await sendEmail(resendKey, {
          from: FROM_EMAIL,
          to: [actorEmail],
          subject: `Dining reservation cancelled — ${formattedDate}`,
          html: `
            <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;">
              <p>Dear ${escapeHtml(actorName)},</p>
              <p>Your dining reservation has been cancelled.</p>
              <p><strong>Date:</strong> ${escapeHtml(formattedDate)}<br>
              <strong>Time:</strong> ${escapeHtml(formattedTime)}<br>
              <strong>Meal:</strong> ${escapeHtml(existing.meal_type)}</p>
              <p>If this was not expected, please contact us:</p>
              <ul>
                <li><strong>Phone:</strong> ${CLUB_PHONE}</li>
                <li><strong>Email:</strong> ${CLUB_EMAIL}</li>
              </ul>
              <p>Warm regards,<br>${CLUB_NAME}<br>${CLUB_ADDRESS}</p>
            </body></html>
          `,
        })
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    const body = await req.json()
    const { reservation_date, reservation_time, meal_type, guest_count, table_preference, special_requests, guest_name, guest_email } = body

    if (!reservation_date || !reservation_time || !meal_type || !guest_count) {
      return new Response(JSON.stringify({ error: 'Missing required fields: reservation_date, reservation_time, meal_type, guest_count' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    if (new Date(reservation_date) < new Date(yesterday.toISOString().split('T')[0])) {
      return new Response(JSON.stringify({ error: 'Reservation date cannot be more than one day in the past' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    const twoWeeksAhead = new Date()
    twoWeeksAhead.setDate(twoWeeksAhead.getDate() + 14)
    if (new Date(reservation_date) > new Date(twoWeeksAhead.toISOString().split('T')[0])) {
      return new Response(JSON.stringify({ error: 'Reservations cannot be made more than two weeks in advance' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    if (!['Breakfast', 'Lunch'].includes(meal_type)) {
      return new Response(JSON.stringify({ error: 'meal_type must be Breakfast or Lunch' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Non-members must provide name and valid email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!memberId) {
      if (!guest_name || !guest_email) {
        return new Response(JSON.stringify({ error: 'Non-members must provide guest_name and guest_email' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
      if (!emailRegex.test(guest_email)) {
        return new Response(JSON.stringify({ error: 'Invalid email address' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
    }

    const { data: reservation, error: insertError } = await supabase
      .from('dining_reservations')
      .insert({
        member_id: memberId,
        reservation_date,
        reservation_time,
        meal_type,
        guest_count,
        table_preference: table_preference || null,
        special_requests: special_requests || null,
        guest_name: memberId ? null : guest_name,
        guest_email: memberId ? null : guest_email,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) throw insertError

    console.log('Dining reservation created:', reservation.id, memberId ? `member: ${memberId}` : `guest: ${guest_email}`)

    // Email secretary for non-member (guest) bookings only
    if (!memberId) {
      const resendKey = Deno.env.get('RESEND_API_KEY')
      if (resendKey) {
        try {
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: ['secretary@cityuniversityclub.co.uk'],
              reply_to: guest_email,
              subject: `Guest Dining Reservation — ${escapeHtml(guest_name)}`,
              html: `
                <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;">
                  <h2 style="color:#002147;">New Guest Dining Reservation</h2>
                  <div style="background:#f5f5f5;padding:15px;border-left:4px solid #002147;margin:20px 0;">
                    <h3 style="margin-top:0;color:#002147;">Guest Details</h3>
                    <p><strong>Name:</strong> ${escapeHtml(guest_name)}<br>
                    <strong>Email:</strong> <a href="mailto:${escapeHtml(guest_email)}">${escapeHtml(guest_email)}</a></p>
                  </div>
                  <div style="background:#f5f5f5;padding:15px;border-left:4px solid #A3C1AD;margin:20px 0;">
                    <h3 style="margin-top:0;color:#002147;">Reservation Details</h3>
                    <p><strong>Date:</strong> ${escapeHtml(reservation_date)}<br>
                    <strong>Time:</strong> ${escapeHtml(reservation_time)}<br>
                    <strong>Meal Type:</strong> ${escapeHtml(meal_type)}<br>
                    <strong>Guests:</strong> ${guest_count}<br>
                    ${table_preference ? `<strong>Table Preference:</strong> ${escapeHtml(table_preference)}<br>` : ''}
                    </p>
                  </div>
                  ${special_requests ? `<div style="background:#fff3cd;padding:15px;border-left:4px solid #ffc107;margin:20px 0;">
                    <h3 style="margin-top:0;color:#856404;">Special Requests</h3>
                    <p>${escapeHtml(special_requests)}</p>
                  </div>` : ''}
                  <hr style="border:none;border-top:1px solid #ddd;margin:30px 0;">
                  <p style="color:#666;font-size:12px;"><strong>${CLUB_NAME}</strong><br>${CLUB_ADDRESS}</p>
                </body></html>
              `,
            }),
          })
          // Confirmation email to guest
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendKey}` },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: [guest_email],
              subject: `Your dining reservation request — ${CLUB_NAME}`,
              html: `
                <html><body style="font-family:Arial,sans-serif;line-height:1.6;color:#333;max-width:600px;">
                  <p>Dear ${escapeHtml(guest_name)},</p>
                  <p>Thank you for your dining reservation request at City University Club. We have received your request and will be in touch to confirm your booking shortly.</p>
                  <p>We are currently transitioning to a new booking system, so please bear with us. In the meantime, to confirm your reservation or if you have any questions, please don't hesitate to get in touch directly:</p>
                  <ul>
                    <li><strong>Phone:</strong> <a href="tel:${CLUB_PHONE}">${CLUB_PHONE}</a></li>
                    <li><strong>Email:</strong> <a href="mailto:${CLUB_EMAIL}">${CLUB_EMAIL}</a></li>
                  </ul>
                  <p>Warm regards,<br>${CLUB_NAME}</p>
                </body></html>
              `,
            }),
          })
        } catch (e) {
          console.error('Email failed:', e)
        }
      }
    }

    return new Response(JSON.stringify({ reservation, message: 'Reservation submitted successfully' }), {
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
