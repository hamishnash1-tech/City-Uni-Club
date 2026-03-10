import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Session-Token');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get session token from custom header
    const sessionToken = req.headers['x-session-token'] as string;

    if (!sessionToken) {
      return res.status(401).json({ error: 'Session token required' });
    }

    // Validate session
    const { data: session } = await supabase
      .from('sessions')
      .select('member_id')
      .eq('token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (!session || !session.member_id) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    const { club_id, arrival_date, departure_date, purpose, special_requests } = req.body;

    if (!club_id || !arrival_date || !departure_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get member details
    const { data: member } = await supabase
      .from('members')
      .select('email, full_name, first_name, membership_number')
      .eq('id', session.member_id)
      .single();

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    // Get club details
    let club;
    if (club_id.includes('-')) {
      // UUID
      const { data: clubData } = await supabase
        .from('reciprocal_clubs')
        .select('id, name, location, country, contact_email')
        .eq('id', club_id)
        .single();
      club = clubData;
    } else {
      // Name
      const { data: clubData } = await supabase
        .from('reciprocal_clubs')
        .select('id, name, location, country, contact_email')
        .ilike('name', `%${club_id}%`)
        .single();
      club = clubData;
    }

    if (!club) {
      return res.status(404).json({ error: 'Club not found' });
    }

    // Create LOI request
    const { data: request, error: requestError } = await supabase
      .from('loi_requests')
      .insert({
        club_id: club.id,
        member_id: session.member_id,
        arrival_date,
        departure_date,
        purpose: purpose || 'Business',
        special_requests: special_requests || null,
        status: 'pending'
      })
      .select('*, reciprocal_clubs(name, location, country)')
      .single();

    if (requestError) {
      console.error('LOI insert error:', requestError);
      return res.status(500).json({ error: 'Failed to create LOI request' });
    }

    // Send email to club (if RESEND_API_KEY is configured)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey && club.contact_email) {
      try {
        await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${resendApiKey}`,
          },
          body: JSON.stringify({
            from: 'City University Club <loi@cityuniversityclub.co.uk>',
            to: [club.contact_email],
            cc: ['secretary@cityuniversityclub.co.uk'],
            subject: `Letter of Introduction Request - ${member.full_name}`,
            html: `
              <html>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                  <h2 style="color: #002147;">Letter of Introduction Request</h2>
                  <p>Dear Secretary,</p>
                  <p>I hope this letter finds you well.</p>
                  <p>I am writing to request a Letter of Introduction for my upcoming visit to <strong>${club.location}</strong>.</p>
                  <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #002147; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #002147;">Member Details</h3>
                    <p><strong>Name:</strong> ${member.full_name}<br>
                    <strong>Email:</strong> ${member.email}<br>
                    <strong>Membership Number:</strong> ${member.membership_number}</p>
                  </div>
                  <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #A3C1AD; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #002147;">Visit Details</h3>
                    <p><strong>Club:</strong> ${club.name}<br>
                    <strong>Arrival Date:</strong> ${arrival_date}<br>
                    <strong>Departure Date:</strong> ${departure_date}<br>
                    <strong>Purpose:</strong> ${purpose || 'Business/Leisure'}</p>
                  </div>
                  <p>I would be grateful if you could provide me with a Letter of Introduction.</p>
                  <p>Please let me know if you require any additional information.</p>
                  <p>Best regards,<br><strong>${member.full_name}</strong></p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
                  <p style="color: #666; font-size: 12px;">
                    <strong>City University Club</strong><br>
                    42 Crutched Friars, London EC3N 2AP
                  </p>
                </body>
              </html>
            `,
          }),
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
        // Don't fail the request if email fails
      }
    }

    return res.status(201).json({
      request,
      message: 'LOI request submitted successfully',
      email_sent: !!resendApiKey
    });

  } catch (error: any) {
    console.error('LOI request error:', error);
    return res.status(500).json({ error: error.message || 'Failed to create LOI request' });
  }
}
