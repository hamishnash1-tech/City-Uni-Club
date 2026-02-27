import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate, optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { loiRequestSchema } from '../utils/validators.js'

const router = Router()

// Get all reciprocal clubs (authenticated only)
router.get('/clubs', authenticate, async (req: AuthRequest, res) => {
  try {
    const { region, country, search } = req.query

    let query = supabase
      .from('reciprocal_clubs')
      .select('*')
      .eq('is_active', true)
      .order('region', { ascending: true })
      .order('country', { ascending: true })
      .order('name', { ascending: true })

    if (region && region !== 'All') {
      query = query.eq('region', region as string)
    }

    if (country) {
      query = query.eq('country', country as string)
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`)
    }

    const { data: clubs, error } = await query

    if (error) {
      console.error('Get clubs error:', error)
      res.status(500).json({ error: 'Failed to get clubs' })
      return
    }

    res.json({ clubs })
  } catch (error) {
    console.error('Get clubs error:', error)
    res.status(500).json({ error: 'Failed to get clubs' })
  }
})

// Get single club by ID
router.get('/clubs/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { data: club, error } = await supabase
      .from('reciprocal_clubs')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !club) {
      res.status(404).json({ error: 'Club not found' })
      return
    }

    res.json({ club })
  } catch (error) {
    console.error('Get club error:', error)
    res.status(500).json({ error: 'Failed to get club' })
  }
})

// Get LOI requests for member
router.get('/loi-requests', authenticate, async (req: AuthRequest, res) => {
  try {
    const { status } = req.query

    let query = supabase
      .from('loi_requests')
      .select(`
        *,
        reciprocal_clubs (
          id,
          name,
          location,
          country,
          note
        )
      `)
      .eq('member_id', req.member_id)
      .order('requested_at', { ascending: false })

    if (status) {
      query = query.eq('status', status as string)
    }

    const { data: requests, error } = await query

    if (error) {
      console.error('Get LOI requests error:', error)
      res.status(500).json({ error: 'Failed to get LOI requests' })
      return
    }

    res.json({ requests })
  } catch (error) {
    console.error('Get LOI requests error:', error)
    res.status(500).json({ error: 'Failed to get LOI requests' })
  }
})

// Create LOI request
router.post('/loi-requests', authenticate, async (req: AuthRequest, res) => {
  try {
    const { club_id, arrival_date, departure_date, purpose, special_requests } = loiRequestSchema.parse(req.body)

    const { data: club, error: clubError } = await supabase
      .from('reciprocal_clubs')
      .select('id, name')
      .eq('id', club_id)
      .eq('is_active', true)
      .single()

    if (clubError || !club) {
      res.status(404).json({ error: 'Club not found' })
      return
    }

    const { data: request, error } = await supabase
      .from('loi_requests')
      .insert({
        member_id: req.member_id!,
        club_id,
        arrival_date,
        departure_date,
        purpose,
        special_requests: special_requests || null,
        status: 'pending'
      })
      .select(`
        *,
        reciprocal_clubs (
          id,
          name,
          location,
          country
        )
      `)
      .single()

    if (error) {
      console.error('Create LOI request error:', error)
      res.status(500).json({ error: 'Failed to create LOI request' })
      return
    }

    res.status(201).json({
      request,
      message: 'LOI request submitted successfully'
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors })
      return
    }
    console.error('Create LOI request error:', error)
    res.status(500).json({ error: 'Failed to create LOI request' })
  }
})

// Cancel LOI request
router.put('/loi-requests/:id/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { data: existing } = await supabase
      .from('loi_requests')
      .select('member_id, status')
      .eq('id', id)
      .single()

    if (!existing) {
      res.status(404).json({ error: 'LOI request not found' })
      return
    }

    if (existing.member_id !== req.member_id) {
      res.status(403).json({ error: 'Not authorized to cancel this request' })
      return
    }

    if (existing.status !== 'pending') {
      res.status(400).json({ error: 'Can only cancel pending requests' })
      return
    }

    const { data: updated, error } = await supabase
      .from('loi_requests')
      .update({ status: 'rejected', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Cancel LOI request error:', error)
      res.status(500).json({ error: 'Failed to cancel LOI request' })
      return
    }

    res.json({
      request: updated,
      message: 'LOI request cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel LOI request error:', error)
    res.status(500).json({ error: 'Failed to cancel LOI request' })
  }
})

export default router
