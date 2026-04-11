// v1
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { CLUB_NAME, CLUB_EMAIL, FROM_EMAIL, escapeHtml } from '../_shared/constants.ts'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { name, email, phone, organisation, date, guests, message, turnstileToken } = await req.json()

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
          <p>A new venue hire enquiry has been submitted via the website.</p>
          <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
            <tr><td style="padding: 6px 12px 6px 0; font-weight: bold; white-space: nowrap;">Name</td><td style="padding: 6px 0;">${escapeHtml(name)}</td></tr>
            <tr><td style="padding: 6px 12px 6px 0; font-weight: bold; white-space: nowrap;">Email</td><td style="padding: 6px 0;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td></tr>
            ${phone ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: bold; white-space: nowrap;">Phone</td><td style="padding: 6px 0;">${escapeHtml(phone)}</td></tr>` : ''}
            ${organisation ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: bold; white-space: nowrap;">Organisation</td><td style="padding: 6px 0;">${escapeHtml(organisation)}</td></tr>` : ''}
            ${date ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: bold; white-space: nowrap;">Preferred Date</td><td style="padding: 6px 0;">${escapeHtml(date)}</td></tr>` : ''}
            ${guests ? `<tr><td style="padding: 6px 12px 6px 0; font-weight: bold; white-space: nowrap;">No. of Guests</td><td style="padding: 6px 0;">${escapeHtml(String(guests))}</td></tr>` : ''}
          </table>
          ${message ? `<p style="margin-top: 16px;"><strong>Message:</strong><br>${escapeHtml(message).replace(/\n/g, '<br>')}</p>` : ''}
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
        subject: `Venue Hire Enquiry — ${escapeHtml(name)}`,
        html,
      }),
    })

    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to send email')

    const confirmationHtml = `
      <html>
        <body style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.6; max-width: 600px;">
          <p>Dear ${escapeHtml(name)},</p>
          <p>Thank you for your venue hire enquiry. We have received your message and will be in touch shortly to discuss your requirements.</p>
          <p>If you have any questions in the meantime, please do not hesitate to contact us at <a href="mailto:${CLUB_EMAIL}">${CLUB_EMAIL}</a>.</p>
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
        subject: `Your venue hire enquiry — ${CLUB_NAME}`,
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
