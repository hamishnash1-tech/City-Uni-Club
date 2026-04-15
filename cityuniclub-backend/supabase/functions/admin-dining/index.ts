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

    const url = new URL(req.url)

    if (req.method === 'GET') {
      const from = url.searchParams.get('from')
      const to = url.searchParams.get('to')

      let query = supabase
        .from('dining_reservations')
        .select(`
          id, member_id, reservation_date, reservation_time, meal_type,
          guest_count, table_preference, special_requests, status, created_at,
          guest_name, guest_email,
          members (first_name, middle_name, last_name, email, membership_number)
        `)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true })

      if (from) query = query.gte('reservation_date', from)
      if (to) query = query.lte('reservation_date', to)

      const { data, error } = await query
      if (error) throw error

      // Fetch audit log for these reservations
      const ids = (data ?? []).map((r: any) => r.id)
      let auditByBooking: Record<string, any[]> = {}
      if (ids.length > 0) {
        const { data: auditData } = await supabase
          .from('booking_audit_log')
          .select('booking_id, action, previous_value, new_value, performed_by_admin_email, performed_at')
          .eq('booking_type', 'dining')
          .in('booking_id', ids)
          .order('performed_at', { ascending: false })
        for (const entry of auditData ?? []) {
          if (!auditByBooking[entry.booking_id]) auditByBooking[entry.booking_id] = []
          auditByBooking[entry.booking_id].push(entry)
        }
      }

      const reservations = (data ?? []).map((r: any) => ({
        ...r,
        audit_log: auditByBooking[r.id] ?? [],
      }))

      return new Response(JSON.stringify({ reservations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    if (req.method === 'PATCH') {
      const { id, status, guest_count, special_requests } = await req.json()
      if (!id) throw new Error('Missing id')

      // Fetch current reservation for audit and emails
      const { data: current } = await supabase
        .from('dining_reservations')
        .select('status, guest_count, special_requests, guest_name, guest_email, reservation_date, reservation_time, member_id, members(first_name, middle_name, last_name, email)')
        .eq('id', id)
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
        updates.status = 'pending'
        action = action ? `${action},guest_count_updated` : 'guest_count_updated'
        previousValue.guest_count = current?.guest_count
        newValue.guest_count = guest_count
        if (status === undefined) {
          previousValue.status = current?.status
          newValue.status = 'pending'
        }
      }
      if (special_requests !== undefined) {
        updates.special_requests = special_requests || null
        action = action ? `${action},notes_updated` : 'notes_updated'
        previousValue.special_requests = (current as any)?.special_requests ?? null
        newValue.special_requests = special_requests || null
      }

      if (Object.keys(updates).length === 0) throw new Error('Nothing to update')

      const { error } = await supabase
        .from('dining_reservations')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      await supabase.from('booking_audit_log').insert({
        booking_type: 'dining',
        booking_id: id,
        action,
        previous_value: previousValue,
        new_value: newValue,
        performed_by_admin_id: user.id,
        performed_by_admin_email: user.email,
      })

      // Send status-change email to booker
      const resendKey = Deno.env.get('RESEND_API_KEY')
      if (resendKey && status !== undefined && current) {
        const members = (current as any).members
        const recipientEmail = (current as any).guest_email ?? members?.email ?? null
        const recipientName = (current as any).guest_name
          ?? (members ? [members.first_name, members.middle_name, members.last_name].filter(Boolean).join(' ') : null)
          ?? 'Guest'
        const reservationDate = (current as any).reservation_date ?? ''
        const reservationTime = (current as any).reservation_time ?? ''

        if (recipientEmail) {
          let subject = ''
          let bodyContent = ''

          if (status === 'confirmed') {
            subject = `Dining reservation confirmed — ${escapeHtml(reservationDate)}`
            bodyContent = `<p>Great news! Your dining reservation on <strong>${escapeHtml(reservationDate)}</strong> at ${escapeHtml(reservationTime)} has been confirmed.</p>
              <p>Guests: ${updates.guest_count ?? current.guest_count}</p>`
          } else if (status === 'cancelled') {
            subject = `Dining reservation cancelled — ${escapeHtml(reservationDate)}`
            bodyContent = `<p>Your dining reservation on <strong>${escapeHtml(reservationDate)}</strong> at ${escapeHtml(reservationTime)} has been cancelled.</p>
              <p>If you believe this is an error or have any questions, please contact us.</p>`
          } else if (status === 'rejected') {
            subject = `Dining reservation not confirmed — ${escapeHtml(reservationDate)}`
            bodyContent = `<p>Unfortunately, we are unable to confirm your dining reservation on <strong>${escapeHtml(reservationDate)}</strong> at ${escapeHtml(reservationTime)}.</p>
              <p>Please contact us if you have any questions.</p>`
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

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
