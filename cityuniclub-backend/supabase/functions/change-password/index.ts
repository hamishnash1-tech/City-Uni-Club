import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import bcrypt from 'npm:bcryptjs@2.4.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function authenticate(req: Request, supabaseClient: any) {
  const authHeader = req.headers.get('Authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  const { data } = await supabaseClient
    .from('sessions')
    .select('member_id')
    .eq('token', token)
    .gt('expires_at', new Date().toISOString())
    .single()

  return data?.member_id || null
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const member_id = await authenticate(req, supabaseClient)
    
    if (!member_id) {
      throw new Error('Unauthorized')
    }

    const { current_password, new_password } = await req.json()

    if (!current_password || !new_password) {
      throw new Error('Current and new password required')
    }

    if (new_password.length < 6) {
      throw new Error('Password must be at least 6 characters')
    }

    // Get current member
    const { data: member, error: memberError } = await supabaseClient
      .from('members')
      .select('password_hash')
      .eq('id', member_id)
      .single()

    if (memberError || !member) {
      throw new Error('Member not found')
    }

    // Verify current password
    const isValid = await bcrypt.compare(current_password, member.password_hash)
    if (!isValid) {
      throw new Error('Current password is incorrect')
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(new_password, 10)

    // Update password
    const { error: updateError } = await supabaseClient
      .from('members')
      .update({ 
        password_hash: newPasswordHash,
        updated_at: new Date().toISOString()
      })
      .eq('id', member_id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({ message: 'Password changed successfully' }),
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
        status: error.message === 'Unauthorized' ? 401 : 400
      }
    )
  }
})
