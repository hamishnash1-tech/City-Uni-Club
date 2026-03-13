import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { SITE_URL, CLUB_NAME, CLUB_EMAIL, CLUB_PHONE, FROM_EMAIL } from '../_shared/constants.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

    const { action, email, token, new_password } = await req.json()

    // REQUEST: send reset email
    if (action === 'request') {
      if (!email) throw new Error('Email required')

      const { data: member } = await supabase
        .from('members')
        .select('id, full_name, first_name')
        .eq('email', email.toLowerCase().trim())
        .eq('is_active', true)
        .single()

      // Always return success to avoid email enumeration
      if (!member) {
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      const resetToken = crypto.randomUUID()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

      await supabase.from('password_reset_tokens').insert({
        member_id: member.id,
        token: resetToken,
        expires_at: expiresAt,
      })

      const resetLink = `${SITE_URL}/reset-password?token=${resetToken}`

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${resendApiKey}` },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [email],
          subject: 'Reset your password',
          html: `
            <html>
              <body style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.6;">
                <p>Dear ${member.first_name},</p>
                <p>We received a request to reset your password for your ${CLUB_NAME} account.</p>
                <p>
                  <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background-color: #002147; color: #fff; text-decoration: none; border-radius: 4px;">
                    Reset Password
                  </a>
                </p>
                <p>This link expires in <strong>15 minutes</strong>. If you did not request a password reset, you can safely ignore this email.</p>
                <br>
                <p style="margin: 0;">${CLUB_NAME}</p>
                <p style="margin: 0;">${CLUB_EMAIL}</p>
                <p style="margin: 0;">Tel: ${CLUB_PHONE}</p>
              </body>
            </html>
          `,
        }),
      })

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // RESET: validate token and set new password
    if (action === 'reset') {
      if (!token || !new_password) throw new Error('Token and new_password required')
      if (new_password.length < 8) throw new Error('Password must be at least 8 characters')

      const { data: resetRecord } = await supabase
        .from('password_reset_tokens')
        .select('member_id, used')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .eq('used', false)
        .single()

      if (!resetRecord) throw new Error('Invalid or expired reset link')

      await supabase
        .from('members')
        .update({ password_hash: new_password })
        .eq('id', resetRecord.member_id)

      await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token)

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    throw new Error('Invalid action')

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})
