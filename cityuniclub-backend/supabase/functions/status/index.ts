import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const token = req.headers.get('x-session-token')
    if (!token) throw new Error('No session token')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: session, error } = await supabaseClient
      .from('sessions')
      .select('member_id, expires_at')
      .eq('token', token)
      .single()

    if (error || !session) throw new Error('Invalid session')

    const expiresAt = new Date(session.expires_at)
    const now = new Date()
    if (expiresAt <= now) throw new Error('Session expired')

    const ttlSeconds = Math.floor((expiresAt.getTime() - now.getTime()) / 1000)

    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('id, email, first_name, middle_name, last_name, membership_number, membership_type')
      .eq('id', session.member_id)
      .eq('is_active', true)
      .single()

    if (memberError || !member) throw new Error('Member not found')

    return new Response(
      JSON.stringify({
        authenticated: true,
        member: {
          id: member.id,
          email: member.email,
          first_name: member.first_name,
          middle_name: member.middle_name,
          last_name: member.last_name,
          membership_number: member.membership_number,
          membership_type: member.membership_type,
        },
        session: {
          expires_at: session.expires_at,
          ttl_seconds: ttlSeconds,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ authenticated: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
    )
  }
})
