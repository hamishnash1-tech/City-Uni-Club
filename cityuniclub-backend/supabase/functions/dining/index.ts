import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-session-token',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405
    })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Try to resolve member from session token (optional)
    let memberId: string | null = null
    const sessionToken = req.headers.get('x-session-token')

    if (sessionToken) {
      const { data: session } = await supabase
        .from('sessions')
        .select('member_id')
        .eq('token', sessionToken)
        .gt('expires_at', new Date().toISOString())
        .single()

      memberId = session?.member_id ?? null
    }

    const body = await req.json()
    const { reservation_date, reservation_time, meal_type, guest_count, table_preference, special_requests, guest_name, guest_email } = body

    if (!reservation_date || !reservation_time || !meal_type || !guest_count) {
      return new Response(JSON.stringify({ error: 'Missing required fields: reservation_date, reservation_time, meal_type, guest_count' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    if (!['Breakfast', 'Lunch'].includes(meal_type)) {
      return new Response(JSON.stringify({ error: 'meal_type must be Breakfast or Lunch' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      })
    }

    // Non-members must provide name and email
    if (!memberId) {
      if (!guest_name || !guest_email) {
        return new Response(JSON.stringify({ error: 'Non-members must provide guest_name and guest_email' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        })
      }
    }

    const { data: reservation, error: insertError } = await supabase
      .from('dining_reservations')
      .insert({
        member_id: memberId,
        reservation_date,
        reservation_time,
        meal_type,
        guest_count,
        table_preference: table_preference || null,
        special_requests: special_requests || null,
        guest_name: memberId ? null : guest_name,
        guest_email: memberId ? null : guest_email,
        status: 'pending'
      })
      .select()
      .single()

    if (insertError) throw insertError

    console.log('Dining reservation created:', reservation.id, memberId ? `member: ${memberId}` : `guest: ${guest_email}`)

    return new Response(JSON.stringify({ reservation, message: 'Reservation submitted successfully' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 201
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
