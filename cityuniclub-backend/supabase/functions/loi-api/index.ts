import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req: Request) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-session-token',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
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
    if (!sessionToken) {
      return new Response(JSON.stringify({ error: 'Session token required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

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

    const { club_id, arrival_date, departure_date, purpose, special_requests } = await req.json()
    console.log('LOI request body:', JSON.stringify({ club_id, arrival_date, departure_date, purpose }))

    if (!club_id || !arrival_date || !departure_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields: club_id, arrival_date, departure_date' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

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

    const { data: club } = await supabase
      .from('reciprocal_clubs')
      .select('id, name, location, country, contact_email')
      .eq('id', club_id)
      .single()

    if (!club) {
      return new Response(JSON.stringify({ error: 'Club not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404
      })
    }

    const { data: request, error: insertError } = await supabase
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
      .select(`*, reciprocal_clubs (name, location, country, contact_email), members (full_name, email, membership_number)`)
      .single()

    if (insertError) throw insertError
    console.log('LOI request created, id:', request.id, 'member_id:', session.member_id)

    return new Response(JSON.stringify({ request, message: 'Success' }), {
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
