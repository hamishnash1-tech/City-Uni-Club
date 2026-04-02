import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

const MAX_SESSION_SECONDS = 12 * 60 * 60 // 12 hours

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const db = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: { user }, error } = await db.auth.getUser(token)
    if (error || !user || user.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // JWT expiry is in the token — decode it (no verification needed, service role already verified it)
    const [, payload] = token.split('.')
    const decoded = JSON.parse(atob(payload))
    const jwtExpiresAt = decoded.exp as number // unix seconds
    const now = Math.floor(Date.now() / 1000)

    // Cap at 12 hours from login time (iat)
    const loginAt = decoded.iat as number
    const maxExpiresAt = loginAt + MAX_SESSION_SECONDS
    const effectiveExpiresAt = Math.min(jwtExpiresAt, maxExpiresAt)
    const ttlSeconds = Math.max(0, effectiveExpiresAt - now)

    return new Response(JSON.stringify({
      id: user.id,
      email: user.email,
      name: user.user_metadata?.full_name ?? user.email,
      expires_at: effectiveExpiresAt,
      ttl_seconds: ttlSeconds,
      expired: ttlSeconds === 0,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
