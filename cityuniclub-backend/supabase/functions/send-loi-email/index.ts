import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

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
    const { clubName, clubLocation, memberName, memberEmail, arrivalDate, departureDate, purpose } = await req.json()

    // Validate required fields
    if (!clubName || !memberName || !memberEmail || !arrivalDate) {
      throw new Error('Missing required fields')
    }

    // Get club email (you'll need to maintain a mapping or fetch from database)
    const clubEmails: Record<string, string> = {
      // Add club emails here or fetch from database
      "Buck's Club": 'info@bucksclub.co.uk',
      'Oxford and Cambridge Club': 'admin@oxfordandcambridgeclub.co.uk',
      // ... add more as needed
    }

    const clubEmail = clubEmails[clubName] || 'reservations@club.com' // Fallback

    // Send email via Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    if (!resendApiKey) {
      throw new Error('RESEND_API_KEY not configured')
    }

    const emailContent = `
Dear Secretary,

I hope this letter finds you well.

I am writing to request a Letter of Introduction for my upcoming visit to ${clubLocation}.

**Member Details:**
- Name: ${memberName}
- Email: ${memberEmail}

**Visit Details:**
- Club: ${clubName}
- Arrival Date: ${arrivalDate}
- Departure Date: ${departureDate || 'TBA'}
- Purpose of Visit: ${purpose || 'Business/Leisure'}

I would be grateful if you could provide me with a Letter of Introduction to present to the club upon my visit.

Please let me know if you require any additional information.

Thank you for your assistance.

Best regards,
${memberName}
${memberEmail}

---
City University Club
42 Crutched Friars, London EC3N 2AP
secretary@cityuniversityclub.co.uk
    `

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: 'City University Club <loi@cityuniversityclub.co.uk>',
        to: [clubEmail],
        cc: ['secretary@cityuniversityclub.co.uk'],
        subject: `Letter of Introduction Request - ${memberName}`,
        html: `
          <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
              <h2 style="color: #002147;">Letter of Introduction Request</h2>
              
              <p>Dear Secretary,</p>
              
              <p>I hope this letter finds you well.</p>
              
              <p>I am writing to request a Letter of Introduction for my upcoming visit to <strong>${clubLocation}</strong>.</p>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #002147; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #002147;">Member Details</h3>
                <p><strong>Name:</strong> ${memberName}<br>
                <strong>Email:</strong> ${memberEmail}</p>
              </div>
              
              <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #A3C1AD; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #002147;">Visit Details</h3>
                <p><strong>Club:</strong> ${clubName}<br>
                <strong>Arrival Date:</strong> ${arrivalDate}<br>
                <strong>Departure Date:</strong> ${departureDate || 'TBA'}<br>
                <strong>Purpose of Visit:</strong> ${purpose || 'Business/Leisure'}</p>
              </div>
              
              <p>I would be grateful if you could provide me with a Letter of Introduction to present to the club upon my visit.</p>
              
              <p>Please let me know if you require any additional information.</p>
              
              <p>Thank you for your assistance.</p>
              
              <p>Best regards,<br>
              <strong>${memberName}</strong><br>
              ${memberEmail}</p>
              
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

    if (!response.ok) {
      throw new Error(responseData.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({
        success: true,
        emailId: responseData.id,
        message: 'LOI request email sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Send LOI email error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Failed to send LOI request' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
