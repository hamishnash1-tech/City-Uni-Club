import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const url = new URL(req.url)
    const region = url.searchParams.get('region')

    let query = supabaseClient
      .from('reciprocal_clubs')
      .select('*')
      .eq('is_active', true)
      .order('region', { ascending: true })
      .order('country', { ascending: true })
      .order('name', { ascending: true })

    if (region && region !== 'All') {
      query = query.eq('region', region)
    }

    const { data: clubs, error } = await query

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ clubs }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
