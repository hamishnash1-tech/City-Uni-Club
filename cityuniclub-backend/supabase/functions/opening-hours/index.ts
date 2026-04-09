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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get today's date in London time
    const todayLondon = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/London',
      year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date()) // YYYY-MM-DD

    // Day of week in London time (0=Sun)
    const dayOfWeek = new Date(
      new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/London',
        year: 'numeric', month: '2-digit', day: '2-digit',
      }).format(new Date()).split('/').reverse().join('-')
    ).getDay()

    // Check date-specific override first
    const { data: override } = await supabase
      .from('opening_hours_overrides')
      .select('open_time, close_time, is_closed, note')
      .eq('date', todayLondon)
      .maybeSingle()

    if (override) {
      return new Response(JSON.stringify({ hours: override }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Fall back to day-of-week default
    const { data: def } = await supabase
      .from('opening_hours_defaults')
      .select('open_time, close_time, is_closed')
      .eq('day_of_week', dayOfWeek)
      .maybeSingle()

    return new Response(JSON.stringify({ hours: def ?? null }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
