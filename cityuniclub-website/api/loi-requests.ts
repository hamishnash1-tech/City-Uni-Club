import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // CORS headers - allow everything from anywhere
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey, x-session-token')

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Validate session
    const sessionToken = req.headers['x-session-token'] as string
    if (!sessionToken) {
      return res.status(401).json({ error: 'Session token required' })
    }

    const { data: session } = await supabase
      .from('sessions')
      .select('member_id')
      .eq('token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session?.member_id) {
      return res.status(401).json({ error: 'Invalid or expired session' })
    }

    const { club_id, arrival_date, departure_date, purpose } = req.body

    if (!club_id || !arrival_date || !departure_date) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Get member
    const { data: member } = await supabase
      .from('members')
      .select('email, full_name, membership_number')
      .eq('id', session.member_id)
      .single()

    // Get club
    const { data: club } = await supabase
      .from('reciprocal_clubs')
      .select('id, name, location, country, contact_email')
      .eq('id', club_id)
      .single()

    // Create LOI request
    const { data: request, error } = await supabase
      .from('loi_requests')
      .insert({
        member_id: session.member_id,
        club_id,
        arrival_date,
        departure_date,
        purpose: purpose || 'Business',
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    return res.status(201).json({ request, message: 'Success' })

  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}
