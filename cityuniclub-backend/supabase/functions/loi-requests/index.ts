import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

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
  const corsHeaders = getCorsHeaders(req)

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
        reciprocal_clubs (id, name, location, country, contact_email),
        members (full_name, email, membership_number)
      `)
      .single()

    if (requestError) {
      return new Response(
        JSON.stringify({ error: 'Failed to create LOI request: ' + requestError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    return new Response(
      JSON.stringify({ request, message: 'LOI request submitted successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201 }
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
