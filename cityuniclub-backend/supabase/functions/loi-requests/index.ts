import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, x-session-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function authenticate(req: Request, supabaseClient: any) {
  // Use custom header instead of Authorization to avoid Supabase JWT validation
  const sessionToken = req.headers.get('x-session-token')

  if (!sessionToken) {
    return null
  }

  // Check if it's a session token (UUID format)
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
  // Handle CORS preflight FIRST
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders
    })
  }

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

    console.log('Authenticating request...')
    const member_id = await authenticate(req, supabaseClient)

    if (!member_id) {
      console.log('Authentication failed')
      return new Response(
        JSON.stringify({ error: 'Unauthorized - no valid session' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      )
    }

    console.log('Authenticated member:', member_id)

    const { club_id, arrival_date, departure_date, purpose, special_requests } = await req.json()

    if (!club_id || !arrival_date || !departure_date) {
      throw new Error('Missing required fields')
    }

    // Get member details
    const { data: member } = await supabaseClient
      .from('members')
      .select('email, full_name, first_name, membership_number')
      .eq('id', member_id)
      .single()

    if (!member) {
      throw new Error('Member not found')
    }

    // Get club details - club_id could be UUID or name
    let club
    if (club_id.includes('-')) {
      // It's a UUID
      const { data: clubData } = await supabaseClient
        .from('reciprocal_clubs')
        .select('id, name, location, country, contact_email')
        .eq('id', club_id)
        .single()
      club = clubData
    } else {
      // It's a name, find by name
      const { data: clubData } = await supabaseClient
        .from('reciprocal_clubs')
        .select('id, name, location, country, contact_email')
        .ilike('name', `%${club_id}%`)
        .single()
      club = clubData
    }

    if (!club) {
      throw new Error('Club not found')
    }

    // Create LOI request
    const { data: request, error: requestError } = await supabaseClient
      .from('loi_requests')
      .insert({
        club_id: club_id,
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
        )
      `)
      .single()

    if (requestError) {
      throw requestError
    }

    // Send email to the reciprocal club
    const clubEmail = club.contact_email || 'secretary@cityuniversityclub.co.uk'
    const resendApiKey = Deno.env.get('RESEND_API_KEY')

    if (resendApiKey) {
      try {
        const emailContent = `
<html>
  <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <h2 style="color: #002147;">Letter of Introduction Request</h2>

    <p>Dear Secretary,</p>

    <p>I hope this letter finds you well.</p>

    <p>I am writing to request a Letter of Introduction for my upcoming visit to <strong>${club.location}</strong>.</p>

    <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #002147; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #002147;">Member Details</h3>
      <p><strong>Name:</strong> ${member.full_name}<br>
      <strong>Email:</strong> ${member.email}<br>
      <strong>Membership Number:</strong> ${member.membership_number}</p>
    </div>

    <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #A3C1AD; margin: 20px 0;">
      <h3 style="margin-top: 0; color: #002147;">Visit Details</h3>
      <p><strong>Club:</strong> ${club.name}<br>
      <strong>Arrival Date:</strong> ${arrival_date}<br>
      <strong>Departure Date:</strong> ${departure_date}<br>
      <strong>Purpose of Visit:</strong> ${purpose || 'Business/Leisure'}</p>
    </div>

    <p>I would be grateful if you could provide me with a Letter of Introduction to present to the club upon my visit.</p>

    <p>Please let me know if you require any additional information.</p>

    <p>Thank you for your assistance.</p>

    <p>Best regards,<br>
    <strong>${member.full_name}</strong><br>
    ${member.email}</p>

    <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

    <p style="color: #666; font-size: 12px;">
      <strong>City University Club</strong><br>
      42 Crutched Friars, London EC3N 2AP<br>
      secretary@cityuniversityclub.co.uk
    </p>
  </body>
</html>`

        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'City University Club <loi@cityuniversityclub.co.uk>',
            to: [clubEmail],
            cc: ['secretary@cityuniversityclub.co.uk'],
            subject: `Letter of Introduction Request - ${member.full_name}`,
            html: emailContent,
          }),
        })
      } catch (emailError) {
        console.error('Failed to send email:', emailError)
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        request, 
        message: 'LOI request submitted successfully',
        email_sent: !!resendApiKey
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201
      }
    )
  } catch (error: any) {
    console.error('LOI request error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: error.message === 'Unauthorized - no valid session' ? 401 : 400
      }
    )
  }
})
