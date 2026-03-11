import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  // CORS headers - allow all origins and headers
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

    // Validate session by looking it up in database
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
    const { club_id, arrival_date, departure_date, purpose, special_requests } = await req.json()

    if (!club_id || !arrival_date || !departure_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields: club_id, arrival_date, departure_date' }), {
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

    // Get club details
    let club
    if (club_id.includes('-')) {
      // UUID lookup
      const { data: clubData } = await supabase
        .from('reciprocal_clubs')
        .select('id, name, location, country, contact_email')
        .eq('id', club_id)
        .single()
      club = clubData
    } else {
      // Name lookup
      const { data: clubData } = await supabase
        .from('reciprocal_clubs')
        .select('id, name, location, country, contact_email')
        .ilike('name', `%${club_id}%`)
        .single()
      club = clubData
    }

    if (!club) {
      return new Response(JSON.stringify({ error: 'Club not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    // Create LOI request
    const { data: request, error: requestError } = await supabase
      .from('loi_requests')
      .insert({
        member_id: session.member_id,
        club_id: club.id,
        arrival_date,
        departure_date,
        purpose: purpose || 'Business',
        special_requests: special_requests || null,
        status: 'pending'
      })
      .select(`
        *,
        reciprocal_clubs (name, location, country, contact_email),
        members (full_name, email, membership_number)
      `)
      .single()

    if (requestError) {
      return new Response(JSON.stringify({ error: 'Failed to create request: ' + requestError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      })
    }

    // Send email notification (if configured)
    const resendKey = Deno.env.get('RESEND_API_KEY')
    let email_sent = false
    
    if (resendKey && club.contact_email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'City University Club <loi@cityuniversityclub.co.uk>',
            to: [club.contact_email],
            cc: ['secretary@cityuniversityclub.co.uk'],
            subject: `LOI Request - ${member.full_name}`,
            html: `<html><body>
              <h2>Letter of Introduction Request</h2>
              <p><strong>Member:</strong> ${member.full_name}</p>
              <p><strong>Email:</strong> ${member.email}</p>
              <p><strong>Club:</strong> ${club.name}</p>
              <p><strong>Dates:</strong> ${arrival_date} to ${departure_date}</p>
            </body></html>`
          })
        })
        email_sent = true
      } catch (e) {
        console.error('Email failed:', e)
      }
    }

    return new Response(JSON.stringify({
      request,
      message: 'LOI request submitted successfully',
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
