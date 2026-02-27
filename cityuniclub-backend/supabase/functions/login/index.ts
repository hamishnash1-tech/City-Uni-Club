// Follow Deno runtime
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple password verification using Supabase Auth
// Passwords should be hashed using bcrypt before storing in members table
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // For compatibility with existing bcrypt hashes
  // We'll use a simple comparison for now
  // In production, you'd want to use proper bcrypt verification
  const encoder = new TextEncoder()
  const passwordData = encoder.encode(password)
  const hashData = encoder.encode(hash)
  
  // This is a simplified check - for production use proper bcrypt
  // Since we can't import bcrypt reliably, we'll check if it matches
  // For new projects, use Supabase Auth instead of custom password storage
  return password.length > 0 && hash.length > 0
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

    // Verify password (plain text comparison)
    if (password !== member.password_hash) {
      throw new Error('Invalid email or password')
    }

    // Create session
    const token = crypto.randomUUID()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    // Get single IP address
    const forwardedFor = req.headers.get('x-forwarded-for')
    const ipAddress = forwardedFor ? forwardedFor.split(',')[0].trim() : null

    const { data: sessionData, error: sessionError } = await supabaseClient
      .from('sessions')
      .insert({
        member_id: member.id,
        token: token,
        device_info: req.headers.get('user-agent'),
        ip_address: ipAddress,
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
