import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST' && req.method !== 'GET') {
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

    if (req.method === 'GET') {
      const url = new URL(req.url)
      const id = url.searchParams.get('id')

      if (id) {
        const { data: request, error: reqError } = await supabase
          .from('loi_requests')
          .select('id, arrival_date, departure_date, purpose, status, created_at, updated_at, reciprocal_clubs (name, location, country)')
          .eq('id', id)
          .eq('member_id', session.member_id)
          .single()

        if (reqError || !request) {
          return new Response(JSON.stringify({ error: 'Not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404
          })
        }

        const { data: emails } = await supabase
          .from('loi_emails_sent')
          .select('sent_at')
          .eq('loi_request_id', id)
          .order('sent_at', { ascending: true })

        return new Response(JSON.stringify({ request, emails: emails ?? [] }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }

      const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1') || 1)
      const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') ?? '10') || 10))
      const from = (page - 1) * limit
      const to = from + limit - 1

      const { data, error, count } = await supabase
        .from('loi_requests')
        .select('id, arrival_date, departure_date, status, created_at, reciprocal_clubs (name, location, country)', { count: 'exact' })
        .eq('member_id', session.member_id)
        .order('created_at', { ascending: false })
        .range(from, to)

      if (error) throw error

      return new Response(JSON.stringify({ requests: data, total: count ?? 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
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
