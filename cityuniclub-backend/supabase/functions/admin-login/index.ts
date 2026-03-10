import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, password } = await req.json()

    // Validate input
    if (!email || !password) {
      throw new Error('Email and password are required')
    }

    // Create Supabase client with anon key (safe for auth operations)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    if (!supabaseAnonKey) {
      throw new Error('SUPABASE_ANON_KEY not configured')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Sign in with Supabase Auth
    const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (signInError) {
      throw new Error('Invalid email or password')
    }

    // Check if user has admin role
    const userRole = sessionData.user.user_metadata?.role || 'user'
    
    if (userRole !== 'admin') {
      // Sign out non-admin users
      await supabase.auth.signOut()
      throw new Error('Access denied: Admin access required')
    }

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
})
