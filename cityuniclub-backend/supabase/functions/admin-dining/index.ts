import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, PATCH, OPTIONS',
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
      const from = url.searchParams.get('from')
      const to = url.searchParams.get('to')

      let query = supabase
        .from('dining_reservations')
        .select(`
          id, member_id, reservation_date, reservation_time, meal_type,
          guest_count, table_preference, special_requests, status, created_at,
          guest_name, guest_email,
          members (full_name, email, membership_number)
        `)
        .order('reservation_date', { ascending: true })
        .order('reservation_time', { ascending: true })

      if (from) query = query.gte('reservation_date', from)
      if (to) query = query.lte('reservation_date', to)

      const { data, error } = await query
      if (error) throw error

      // Fetch audit log for these reservations
      const ids = (data ?? []).map((r: any) => r.id)
      let auditByBooking: Record<string, any[]> = {}
      if (ids.length > 0) {
        const { data: auditData } = await supabase
          .from('booking_audit_log')
          .select('booking_id, action, previous_value, new_value, performed_by_admin_email, performed_at')
          .eq('booking_type', 'dining')
          .in('booking_id', ids)
          .order('performed_at', { ascending: false })
        for (const entry of auditData ?? []) {
          if (!auditByBooking[entry.booking_id]) auditByBooking[entry.booking_id] = []
          auditByBooking[entry.booking_id].push(entry)
        }
      }

      const reservations = (data ?? []).map((r: any) => ({
        ...r,
        audit_log: auditByBooking[r.id] ?? [],
      }))

      return new Response(JSON.stringify({ reservations }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    if (req.method === 'PATCH') {
      const { id, status, guest_count } = await req.json()
      if (!id) throw new Error('Missing id')

      // Fetch current reservation for audit
      const { data: current } = await supabase
        .from('dining_reservations')
        .select('status, guest_count')
        .eq('id', id)
        .single()

      const updates: Record<string, any> = {}
      let action = ''
      const previousValue: Record<string, any> = {}
      const newValue: Record<string, any> = {}

      if (status !== undefined) {
        updates.status = status
        action = `status_changed_to_${status}`
        previousValue.status = current?.status
        newValue.status = status
      }
      if (guest_count !== undefined) {
        updates.guest_count = guest_count
        updates.status = 'pending'
        action = action ? `${action},guest_count_updated` : 'guest_count_updated'
        previousValue.guest_count = current?.guest_count
        newValue.guest_count = guest_count
        if (status === undefined) {
          previousValue.status = current?.status
          newValue.status = 'pending'
        }
      }

      if (Object.keys(updates).length === 0) throw new Error('Nothing to update')

      const { error } = await supabase
        .from('dining_reservations')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      // Write audit log
      await supabase.from('booking_audit_log').insert({
        booking_type: 'dining',
        booking_id: id,
        action,
        previous_value: previousValue,
        new_value: newValue,
        performed_by_admin_id: user.id,
        performed_by_admin_email: user.email,
      })

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
