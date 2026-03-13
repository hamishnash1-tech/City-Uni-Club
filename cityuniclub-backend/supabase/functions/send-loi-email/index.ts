import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { id } = await req.json()
    if (!id) throw new Error('Missing LOI request id')

    // Fetch full request details from DB
    const { data: request, error: fetchError } = await supabase
      .from('loi_requests')
      .select(`
        id, arrival_date, departure_date, purpose, status,
        members (full_name, email),
        reciprocal_clubs (name, location, contact_email)
      `)
      .eq('id', id)
      .single()

    if (fetchError || !request) throw new Error('LOI request not found')

    const memberName = request.members?.full_name
    const memberEmail = request.members?.email
    const clubName = request.reciprocal_clubs?.name
    const clubLocation = request.reciprocal_clubs?.location
    const clubEmail = request.reciprocal_clubs?.contact_email

    if (!clubEmail) throw new Error('Club has no contact email configured')

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'City University Club <loi@admin.cityuniversityclub.co.uk>',
        to: [clubEmail],
        cc: ['secretary@cityuniversityclub.co.uk'],
        subject: `Letter of Introduction Request - ${memberName}`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #002147;">Letter of Introduction Request</h2>
              <p>Dear Secretary,</p>
              <p>I am writing to request a Letter of Introduction for my upcoming visit to <strong>${clubLocation}</strong>.</p>
              <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #002147; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #002147;">Member Details</h3>
                <p><strong>Name:</strong> ${memberName}<br>
                <strong>Email:</strong> ${memberEmail}</p>
              </div>
              <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #A3C1AD; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #002147;">Visit Details</h3>
                <p><strong>Club:</strong> ${clubName}<br>
                <strong>Arrival Date:</strong> ${request.arrival_date}<br>
                <strong>Departure Date:</strong> ${request.departure_date || 'TBA'}<br>
                <strong>Purpose of Visit:</strong> ${request.purpose || 'Business/Leisure'}</p>
              </div>
              <p>I would be grateful if you could provide a Letter of Introduction for this member to present upon their visit.</p>
              <p>Please let me know if you require any additional information.</p>
              <p>Thank you for your assistance.</p>
              <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
              <p style="color: #666; font-size: 12px;">
                <strong>City University Club</strong><br>
                42 Crutched Friars, London EC3N 2AP<br>
                secretary@cityuniversityclub.co.uk
              </p>
            </body>
          </html>
        `,
      }),
    })

    const responseData = await response.json()
    if (!response.ok) throw new Error(responseData.message || 'Failed to send email')

    // Update status to sent
    await supabase.from('loi_requests').update({ status: 'sent' }).eq('id', id)

    return new Response(
      JSON.stringify({ success: true, emailId: responseData.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error('Send LOI email error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send LOI request' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
