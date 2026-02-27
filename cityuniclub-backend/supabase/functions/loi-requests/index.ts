import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function authenticate(req: Request, supabaseClient: any) {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  const { data } = await supabaseClient
    .from('sessions')
    .select('member_id')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  return data?.member_id || null
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const member_id = await authenticate(req, supabaseClient)
    
    if (!member_id) {
      throw new Error('Unauthorized')
    }

    const { club_id, arrival_date, departure_date, purpose, special_requests } = await req.json()

    if (!club_id || !arrival_date || !departure_date || !purpose) {
      throw new Error('Missing required fields')
    }

    // Create LOI request
    const { data: request, error: requestError } = await supabaseClient
      .from('loi_requests')
      .insert({
        club_id: club_id,
        member_id: member_id,
        arrival_date: arrival_date,
        departure_date: departure_date,
        purpose: purpose,
        special_requests: special_requests || null,
        status: 'pending'
      })
      .select(`
        *,
        reciprocal_clubs (
          id,
          name,
          location,
          country
        )
      `)
      .single()

    if (requestError) {
      throw requestError
    }

    return new Response(
      JSON.stringify({ request, message: 'LOI request submitted successfully' }),
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
        status: error.message === 'Unauthorized' ? 401 : 400
      }
    )
  }
})
