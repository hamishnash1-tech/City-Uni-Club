import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PATCH, DELETE, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Verify admin JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user || user.user_metadata?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403
      })
    }

    const url = new URL(req.url)

    if (req.method === 'GET') {
      const id = url.searchParams.get('id')

      if (id) {
        const { data: request, error: reqError } = await supabase
          .from('loi_requests')
          .select(`
            id, member_id, club_id, arrival_date, departure_date, purpose, status, created_at,
            members (full_name, email),
            reciprocal_clubs (name, location, country, region, contact_email)
          `)
          .eq('id', id)
          .single()

        if (reqError) throw reqError

        const { data: emails, error: emailsError } = await supabase
          .from('loi_emails_sent')
          .select('id, sent_to, cc, sent_at, resend_email_id')
          .eq('loi_request_id', id)
          .order('sent_at', { ascending: true })

        if (emailsError) throw emailsError

        return new Response(JSON.stringify({ request, emails }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        })
      }

      const { data, error } = await supabase
        .from('loi_requests')
        .select(`
          id, member_id, club_id, arrival_date, departure_date, purpose, status, created_at,
          members (full_name, email),
          reciprocal_clubs (name, location, country, region, contact_email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      return new Response(JSON.stringify({ requests: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    if (req.method === 'PATCH') {
      const { id, status } = await req.json()
      if (!id || !status) throw new Error('Missing id or status')

      const { error } = await supabase
        .from('loi_requests')
        .update({ status })
        .eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    if (req.method === 'DELETE') {
      const id = url.searchParams.get('id')
      if (!id) throw new Error('Missing id')

      const { error } = await supabase
        .from('loi_requests')
        .delete()
        .eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
