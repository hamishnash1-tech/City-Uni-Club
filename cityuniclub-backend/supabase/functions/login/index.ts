// Follow Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import bcrypt from 'https://deno.land/x/bcrypt@0.5.0/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const { email, password } = await req.json()

    if (!email || !password) {
      throw new Error('Email and password required')
    }

    // Create Supabase client with service role
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get member by email
    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('id, email, password_hash, full_name, first_name, membership_number, membership_type, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (memberError || !member) {
      throw new Error('Invalid email or password')
    }

    // Verify password
    const isValid = await bcrypt.compare(password, member.password_hash)
    if (!isValid) {
      throw new Error('Invalid email or password')
    }

    // Create session
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data: sessionData, error: sessionError } = await supabaseClient
      .from('sessions')
      .insert({
        member_id: member.id,
        token: token,
        device_info: req.headers.get('user-agent'),
        ip_address: req.headers.get('x-forwarded-for'),
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (sessionError) {
      throw sessionError
    }

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
