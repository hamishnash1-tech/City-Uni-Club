import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

export interface Deps {
  supabase?: any
  supabaseAdmin?: any
}

export async function handler(req: Request, deps: Deps = {}): Promise<Response> {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''

    if (!supabaseAnonKey && !deps.supabase) {
      throw new Error('SUPABASE_ANON_KEY not configured')
    }

    const supabase = deps.supabase ?? createClient(supabaseUrl, supabaseAnonKey)
    const supabaseAdmin = deps.supabaseAdmin ?? createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null
    const userAgent = req.headers.get('user-agent')

    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      await supabaseAdmin.from('audit_logs').insert({
        table_name: 'auth', operation: 'INSERT',
        new_data: { app: 'admin', email, ip_address: ipAddress, user_agent: userAgent, success: false }
      })
      throw new Error('Invalid email or password')
    }

    const userRole = sessionData.user.app_metadata?.role || 'user'

    if (userRole !== 'admin') {
      await supabase.auth.signOut()
      await supabaseAdmin.from('audit_logs').insert({
        table_name: 'auth', operation: 'INSERT', record_id: sessionData.user.id,
        new_data: { app: 'admin', email, ip_address: ipAddress, user_agent: userAgent, success: false }
      })
      throw new Error('Access denied: Admin access required')
    }

    await supabaseAdmin.from('audit_logs').insert({
      table_name: 'auth', operation: 'INSERT', record_id: sessionData.user.id,
      new_data: { app: 'admin', email, ip_address: ipAddress, user_agent: userAgent, success: true }
    })

    const adminUser = {
      id: sessionData.user.id,
      email: sessionData.user.email,
      role: userRole
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: adminUser,
        session: {
          token: sessionData.session?.access_token,
          refresh_token: sessionData.session?.refresh_token,
          expires_at: sessionData.session?.expires_at
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Admin login error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Login failed' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      },
    )
  }
}

serve((req) => handler(req))
