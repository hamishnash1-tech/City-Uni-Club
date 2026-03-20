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
    const id = url.searchParams.get('id')
    const slug = url.searchParams.get('slug')

    if (id || slug) {
      const query = supabaseClient.from('events').select('*')
      const { data: event, error } = await (id ? query.eq('id', id) : query.eq('slug', slug)).single()

      if (error) throw error

      const { data: assets } = await supabaseClient
        .from('event_assets')
        .select('*')
        .eq('event_id', event.id)
        .order('created_at', { ascending: true })

      return new Response(
        JSON.stringify({ event: { ...event, assets: assets ?? [] } }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    const today = new Date().toISOString().split('T')[0]

    const { data: events, error } = await supabaseClient
      .from('events')
      .select('*')
      .eq('is_active', true)
      .or(`event_date.gte.${today},is_tba.eq.true`)
      .order('is_tba', { ascending: true })
      .order('event_date', { ascending: true, nullsFirst: false })

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ events }),
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
