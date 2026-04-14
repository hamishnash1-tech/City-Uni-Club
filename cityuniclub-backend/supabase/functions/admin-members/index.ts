import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as bcrypt from 'https://deno.land/x/bcrypt@v0.4.1/mod.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403
      })
    }

    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('members')
        .select('id, full_name, email, phone_number, membership_number, membership_type, is_active, member_since, member_until, created_at')
        .order('full_name', { ascending: true })

      if (error) throw error

      return new Response(JSON.stringify({ members: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (req.method === 'POST') {
      const body = await req.json()
      const { full_name, first_name, email, phone_number, membership_type, member_since, member_until, is_active, password } = body

      if (!full_name || !first_name || !email || !membership_type || !member_since || !password) {
        return new Response(JSON.stringify({ error: 'Missing required fields: full_name, first_name, email, membership_type, member_since, password' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
        })
      }

      const password_hash = bcrypt.hashSync(password)

      const { data, error } = await supabase
        .from('members')
        .insert({
          full_name,
          first_name,
          email,
          phone_number: phone_number || null,
          membership_type,
          member_since,
          member_until: member_until || null,
          is_active: is_active ?? true,
          password_hash,
        })
        .select('id, full_name, email, phone_number, membership_number, membership_type, is_active, member_since, member_until, created_at')
        .single()

      if (error) throw error

      return new Response(JSON.stringify({ member: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 201
      })
    }

    if (req.method === 'PATCH') {
      const { id, is_active, member_since, membership_type, email, phone_number } = await req.json()
      if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
        })
      }
      const update: Record<string, unknown> = {}
      if (is_active !== undefined) update.is_active = is_active
      if (member_since !== undefined) update.member_since = member_since
      if (membership_type !== undefined) update.membership_type = membership_type
      if (email !== undefined) update.email = email
      if (phone_number !== undefined) update.phone_number = phone_number
      if (Object.keys(update).length === 0) {
        return new Response(JSON.stringify({ error: 'No fields to update' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400
        })
      }
      const { data, error } = await supabase.from('members').update(update).eq('id', id)
        .select('id, full_name, email, phone_number, membership_number, membership_type, is_active, member_since, member_until, created_at')
        .single()
      if (error) throw error
      return new Response(JSON.stringify({ member: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 405
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500
    })
  }
})
