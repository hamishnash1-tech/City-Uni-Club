// v2
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { CLUB_NAME, CLUB_EMAIL, FROM_EMAIL } from '../_shared/constants.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, phone, message, turnstileToken } = await req.json()

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!name || !email) {
      return new Response(JSON.stringify({ error: 'Name and email are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Verify Turnstile token
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY')
    if (!turnstileSecret) throw new Error('TURNSTILE_SECRET_KEY not configured')
    if (!turnstileToken) {
      return new Response(JSON.stringify({ error: 'Please complete the security check' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ secret: turnstileSecret, response: turnstileToken }),
    })
    const verifyData = await verifyRes.json()
    if (!verifyData.success) {
      return new Response(JSON.stringify({ error: 'Security check failed. Please try again.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.6;">
          <p>A new membership enquiry has been submitted via the website.</p>
          <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
            <tr><td style="padding: 6px 12px 6px 0; font-weight: bold; white-space: nowrap;">Name</td><td style="padding: 6px 0;">${name}</td></tr>
            <tr><td style="padding: 6px 12px 6px 0; font-weight: bold; white-space: nowrap;">Email</td><td style="padding: 6px 0;"><a href="mailto:${email}">${email}</a></td></tr>
            ${phone ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: bold; white-space: nowrap;">Phone</td><td style="padding: 6px 0;">${phone}</td></tr>` : ''}
          </table>
          ${message ? `<p style="margin-top: 16px;"><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>` : ''}
        </body>
      </html>
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [CLUB_EMAIL],
        reply_to: email,
        subject: `Membership Enquiry — ${name}`,
        html,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to send email')

    const confirmationHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.6; max-width: 600px;">
          <p>Dear ${name},</p>
          <p>Thank you for your interest in becoming a member of City University Club. We have received your enquiry and will be in touch shortly.</p>
          <p>If you have any questions in the meantime, or have not heard from us within a few days, please do not hesitate to contact our secretary directly at <a href="mailto:${CLUB_EMAIL}">${CLUB_EMAIL}</a>.</p>
          <p>Warm regards,<br>${CLUB_NAME}</p>
        </body>
      </html>
    `

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: `Your membership enquiry — ${CLUB_NAME}`,
        html: confirmationHtml,
      }),
    })

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
