import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') throw new Error('Method not allowed')

    const { email, password, session_type } = await req.json()
    if (!email || !password) throw new Error('Email and password required')

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('id, email, password_hash, full_name, first_name, membership_number, membership_type, is_active')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single()

    if (memberError || !member) throw new Error('Invalid email or password')

    const forwardedFor = req.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null
    const userAgent = req.headers.get('user-agent')

    const storedHash = member.password_hash as string | null

    if (!storedHash) {
      throw new Error('No password set — please use "Forgot password" to set one')
    }

    const passwordValid = bcrypt.compareSync(password, storedHash)

    if (!passwordValid) {
      await supabaseClient.from('audit_logs').insert({
        table_name: 'auth', operation: 'INSERT', record_id: member.id,
        new_data: { app: 'main', email, ip_address: ipAddress, user_agent: userAgent, success: false }
      })
      throw new Error('Invalid email or password')
    }

    const token = crypto.randomUUID()
    const expiresAt = new Date()
    if (session_type === 'supersession') {
      expiresAt.setMonth(expiresAt.getMonth() + 6)
    } else {
      expiresAt.setDate(expiresAt.getDate() + 30)
    }

    const { data: sessionData, error: sessionError } = await supabaseClient
      .from('sessions')
      .insert({
        member_id: member.id,
        token,
        device_info: userAgent,
        ip_address: ipAddress,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (sessionError) throw sessionError

    await supabaseClient.from('audit_logs').insert({
      table_name: 'auth', operation: 'INSERT', record_id: member.id,
      new_data: { app: 'main', email, ip_address: ipAddress, user_agent: userAgent, success: true }
    })

    return new Response(
      JSON.stringify({
        member: {
          id: member.id,
          email: member.email,
          full_name: member.full_name,
          first_name: member.first_name,
          membership_number: member.membership_number,
          membership_type: member.membership_type
        },
        session: {
          token: sessionData.token,
          expires_at: sessionData.expires_at
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
