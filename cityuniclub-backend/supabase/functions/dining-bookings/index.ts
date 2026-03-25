import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { FROM_EMAIL } from '../_shared/constants.ts'

serve(async (req: Request) => {
  // CORS headers - allow all origins
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-session-token, apikey',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight
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

    // Get session token from header
    const sessionToken = req.headers.get('x-session-token')

    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'Session token required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    // Validate session by looking it up in database (NO JWT)
    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .select('member_id')
      .eq('token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (sessionError || !session?.member_id) {
      return new Response(JSON.stringify({ error: 'Invalid or expired session' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    // Parse request body
    const { reservation_date, reservation_time, meal_type, guest_count, table_preference, special_requests } = await req.json()

    if (!reservation_date || !reservation_time || !meal_type || !guest_count) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Get member details
    const { data: member } = await supabase
      .from('members')
      .select('email, full_name, membership_number')
      .eq('id', session.member_id)
      .single()

    if (!member) {
      return new Response(JSON.stringify({ error: 'Member not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Calculate total price (example: £45 per person)
    const price_per_person = 45.00
    const total_price = price_per_person * guest_count

    // Create dining reservation
    const { data: reservation, error: reservationError } = await supabase
      .from('dining_reservations')
      .insert({
        member_id: session.member_id,
        reservation_date,
        reservation_time,
        meal_type,
        guest_count,
        table_preference: table_preference || null,
        special_requests: special_requests || null,
        total_price,
        status: 'pending'
      })
      .select(`
        *,
        members (full_name, email, membership_number)
      `)
      .single()

    if (reservationError) {
      return new Response(JSON.stringify({ error: 'Failed to create reservation: ' + reservationError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Email notifications disabled
    const email_sent = false
    if (false) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: ['secretary@cityuniversityclub.co.uk'],
            subject: `Dining Reservation - ${member.full_name}`,
            html: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="color: #002147;">New Dining Reservation</h2>
                  <p>A new dining reservation has been submitted.</p>
                  <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #002147; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #002147;">Member Details</h3>
                    <p><strong>Name:</strong> ${member.full_name}<br>
                    <strong>Email:</strong> ${member.email}<br>
                    <strong>Membership Number:</strong> ${member.membership_number}</p>
                  </div>
                  <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #A3C1AD; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #002147;">Reservation Details</h3>
                    <p><strong>Date:</strong> ${reservation_date}<br>
                    <strong>Time:</strong> ${reservation_time}<br>
                    <strong>Meal Type:</strong> ${meal_type}<br>
                    <strong>Guests:</strong> ${guest_count}<br>
                    <strong>Table Preference:</strong> ${table_preference || 'Not specified'}<br>
                    <strong>Total Price:</strong> £${total_price.toFixed(2)}</p>
                  </div>
                  ${special_requests ? `<div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #856404;">Special Requests</h3>
                    <p>${special_requests}</p>
                  </div>` : ''}
                  <p>Please review this reservation in the admin dashboard.</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                  <p style="color: #666; font-size: 12px;">
                    <strong>City University Club</strong><br>
                    42 Crutched Friars, London EC3N 2AP
                  </p>
                </body>
              </html>
            `,
          }),
        })
        email_sent = true
      } catch (e) {
        console.error('Email failed:', e)
      }
    }

    return new Response(JSON.stringify({
      reservation,
      message: 'Dining reservation submitted successfully',
      email_sent
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
