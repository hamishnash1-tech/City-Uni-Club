import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-session-token, prefer',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function authenticate(req: Request, supabaseClient: any) {
  const sessionToken = req.headers.get('x-session-token')

  if (!sessionToken) {
    return null
  }

  const { data, error } = await supabaseClient
    .from('sessions')
    .select('member_id')
    .eq('token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error) {
    return null
  }

  return data?.member_id || null
}

serve(async (req: Request) => {
  // Supabase automatically handles OPTIONS preflight
  // We only need to add CORS headers to our responses

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405 }
    )
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const member_id = await authenticate(req, supabaseClient)

    if (!member_id) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - no valid session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    const { club_id, arrival_date, departure_date, purpose, special_requests } = await req.json()

    if (!club_id || !arrival_date || !departure_date) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: club_id, arrival_date, departure_date' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get member details
    const { data: member } = await supabaseClient
      .from('members')
      .select('email, full_name, first_name, membership_number')
      .eq('id', member_id)
      .single()

    if (!member) {
      return new Response(
        JSON.stringify({ error: 'Member not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Get club details - club_id could be UUID or name
    let club
    if (club_id.includes('-')) {
      const { data: clubData } = await supabaseClient
        .from('reciprocal_clubs')
        .select('id, name, location, country, contact_email')
        .eq('id', club_id)
        .single()
      club = clubData
    } else {
      const { data: clubData } = await supabaseClient
        .from('reciprocal_clubs')
        .select('id, name, location, country, contact_email')
        .ilike('name', `%${club_id}%`)
        .single()
      club = clubData
    }

    if (!club) {
      return new Response(
        JSON.stringify({ error: 'Club not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    // Create LOI request
    const { data: request, error: requestError } = await supabaseClient
      .from('loi_requests')
      .insert({
        club_id: club.id,
        member_id: member_id,
        arrival_date: arrival_date,
        departure_date: departure_date,
        purpose: purpose || 'Business',
        special_requests: special_requests || null,
        status: 'pending'
      })
      .select(`
        *,
        reciprocal_clubs (
          id,
          name,
          location,
          country,
          contact_email
        ),
        members (
          full_name,
          email,
          membership_number
        )
      `)
      .single()

    if (requestError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create LOI request: ' + requestError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Send email to club (if RESEND_API_KEY is configured)
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    let email_sent = false
    
    if (resendApiKey && club.contact_email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'City University Club <loi@cityuniversityclub.co.uk>',
            to: [club.contact_email],
            cc: ['secretary@cityuniversityclub.co.uk'],
            subject: `Letter of Introduction Request - ${member.full_name}`,
            html: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="color: #002147;">Letter of Introduction Request</h2>
                  <p>Dear Secretary,</p>
                  <p>A Letter of Introduction request has been submitted.</p>
                  <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #002147; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #002147;">Member Details</h3>
                    <p><strong>Name:</strong> ${member.full_name}<br>
                    <strong>Email:</strong> ${member.email}<br>
                    <strong>Membership Number:</strong> ${member.membership_number}</p>
                  </div>
                  <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #A3C1AD; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #002147;">Visit Details</h3>
                    <p><strong>Club:</strong> ${club.name}<br>
                    <strong>Location:</strong> ${club.location}, ${club.country}<br>
                    <strong>Arrival Date:</strong> ${arrival_date}<br>
                    <strong>Departure Date:</strong> ${departure_date}<br>
                    <strong>Purpose:</strong> ${purpose || 'Business/Leisure'}</p>
                  </div>
                  <p>Please review this request in the admin dashboard.</p>
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
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
      }
    }

    return new Response(
      JSON.stringify({ 
        request, 
        message: 'LOI request submitted successfully',
        email_sent
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
