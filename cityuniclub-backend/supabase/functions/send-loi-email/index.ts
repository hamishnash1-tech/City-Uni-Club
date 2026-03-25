import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { PDFDocument, StandardFonts, rgb } from 'https://esm.sh/pdf-lib@1.17.1'
import { SITE_URL, CLUB_NAME, CLUB_EMAIL, CLUB_PHONE, FROM_EMAIL } from '../_shared/constants.ts'


const SIGNATURE_JPG = Uint8Array.from(atob('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'), c => c.charCodeAt(0))
const BUILDING_JPG = Uint8Array.from(atob('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'), c => c.charCodeAt(0))

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function wrapText(text: string, maxWidth: number, font: any, fontSize: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (font.widthOfTextAtSize(test, fontSize) > maxWidth && current) {
      lines.push(current)
      current = word
    } else {
      current = test
    }
  }
  if (current) lines.push(current)
  return lines
}

async function generateLoiPdf(
  memberName: string,
  clubName: string,
  visitDates: string,
  sentDate: string
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4
  const regular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const bold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const { width, height } = page.getSize()
  const margin = 72
  const contentWidth = width - 2 * margin
  const size = 12
  const lineH = size * 1.7

  const buildingImg = await pdfDoc.embedJpg(BUILDING_JPG)
  const signatureImg = await pdfDoc.embedJpg(SIGNATURE_JPG)

  // Building illustration centred at the top
  const imgW = 75
  const imgH = (buildingImg.height / buildingImg.width) * imgW
  page.drawImage(buildingImg, {
    x: (width - imgW) / 2,
    y: height - margin - imgH + 10,
    width: imgW,
    height: imgH,
  })

  let y = height - margin - imgH - 10

  const drawText = (text: string, x: number, font = regular, fontSize = size) => {
    page.drawText(text, { x, y, size: fontSize, font, color: rgb(0, 0, 0) })
    y -= lineH
  }

  const drawCentered = (text: string, font = regular, fontSize = size) => {
    const w = font.widthOfTextAtSize(text, fontSize)
    page.drawText(text, { x: (width - w) / 2, y, size: fontSize, font, color: rgb(0, 0, 0) })
    y -= lineH
  }

  const drawPara = (text: string) => {
    for (const line of wrapText(text, contentWidth, regular, size)) {
      drawText(line, margin)
    }
    y -= lineH * 0.4
  }

  // Header contact details (centered)
  drawCentered(CLUB_EMAIL)
  drawCentered(SITE_URL.replace('https://', ''))
  drawCentered(CLUB_PHONE)
  y -= lineH * 1.5

  // Recipient
  drawText('The Secretary', margin, bold)
  drawText(clubName, margin, bold)
  y -= lineH * 0.5

  // Body
  drawPara(`This letter is to introduce ${memberName} who is a member of the City University Club.`)

  drawPara(`I am most grateful to you for offering ${memberName} the hospitality of your Club under the terms of our reciprocal agreement, they will be visiting your club ${visitDates}.`)

  drawPara('Should you have any queries please do not hesitate to contact me.')

  drawPara('Thanking you in anticipation.')
  y -= lineH * 0.5

  // Signature image above name
  y -= lineH * 1.5
  const sigW = 100
  const sigH = (signatureImg.height / signatureImg.width) * sigW
  page.drawImage(signatureImg, { x: margin, y: y - sigH, width: sigW, height: sigH })
  y -= sigH + 6

  page.drawText('Hasita Senanayake FIH', { x: margin, y, size, font: bold, color: rgb(0, 0, 0) })
  y -= lineH
  drawText('Secretary', margin)
  y -= lineH * 0.5
  drawText(sentDate, margin)

  return pdfDoc.save()
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
    const isServiceRole = token === Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!isServiceRole) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      if (authError || !user || user.user_metadata?.role !== 'admin') {
        return new Response(JSON.stringify({ error: 'Admin access required' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        })
      }
    }

    // Email sending disabled
    return new Response(JSON.stringify({ success: true, disabled: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

    const { id } = await req.json()
    if (!id) throw new Error('Missing LOI request id')

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
    const clubName = request.reciprocal_clubs?.name
    const clubEmail = request.reciprocal_clubs?.contact_email

    if (!clubEmail) throw new Error('Club has no contact email configured')

    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) throw new Error('RESEND_API_KEY not configured')

    const now = new Date()
    const sentDate = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    const ukHour = parseInt(now.toLocaleString('en-GB', { timeZone: 'Europe/London', hour: 'numeric', hour12: false }))
    const greeting = ukHour < 12 ? 'Good morning' : ukHour < 17 ? 'Good afternoon' : 'Good evening'
    const visitDates = request.departure_date
      ? `from ${request.arrival_date} to ${request.departure_date}`
      : `on ${request.arrival_date}`

    // Generate PDF
    const pdfBytes = await generateLoiPdf(memberName, clubName, visitDates, sentDate)
    const pdfBase64 = btoa(String.fromCharCode(...pdfBytes))

    const emailBody = `
      <html>
        <body style="font-family: Arial, sans-serif; font-size: 14px; color: #000; line-height: 1.6;">
          <p>${greeting},</p>

          <p>Please find attached an introduction letter for ${memberName} who is a member of the City University Club and will be visiting your club ${visitDates}.</p>

          <p style="margin-bottom: 0;">Many thanks and kind regards,</p>
          <p style="margin: 0;"><strong>Lauren Wade</strong></p>
          <p style="margin: 0;">Admin Assistant</p>
          <p style="margin: 0;">${CLUB_NAME}</p>
          <p style="margin: 0;"><a href="mailto:${CLUB_EMAIL}" style="color: #000;">${CLUB_EMAIL}</a></p>
          <p style="margin: 0;">Tel: ${CLUB_PHONE}</p>
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
        to: [clubEmail],
        cc: [CLUB_EMAIL],
        subject: `Letter of Introduction — ${memberName}`,
        html: emailBody,
        attachments: [
          {
            filename: `Letter_of_Introduction_${memberName.replace(/\s+/g, '_')}.pdf`,
            content: pdfBase64,
          }
        ]
      }),
    })

    const responseData = await response.json()
    if (!response.ok) throw new Error(responseData.message || 'Failed to send email')

    await supabase.rpc('record_loi_email_sent', {
      p_loi_request_id: id,
      p_sent_to: clubEmail,
      p_cc: CLUB_EMAIL,
      p_resend_email_id: responseData.id ?? null,
    })

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
