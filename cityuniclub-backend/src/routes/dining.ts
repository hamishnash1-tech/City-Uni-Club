import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { diningReservationSchema } from '../utils/validators.js'

const router = Router()

// Get dining reservations for member
router.get('/reservations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { date, status } = req.query

    let query = supabase
      .from('dining_reservations')
      .select('*')
      .eq('member_id', req.member_id)
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true })

    if (date) {
      query = query.eq('reservation_date', date as string)
    }

    if (status) {
      query = query.eq('status', status as string)
    }

    const { data: reservations, error } = await query

    if (error) {
      console.error('Get reservations error:', error)
      res.status(500).json({ error: 'Failed to get reservations' })
      return
    }

    res.json({ reservations })
  } catch (error) {
    console.error('Get reservations error:', error)
    res.status(500).json({ error: 'Failed to get reservations' })
  }
})

// Create dining reservation
router.post('/reservations', authenticate, async (req: AuthRequest, res) => {
  try {
    const { reservation_date, reservation_time, meal_type, guest_count, table_preference, special_requests } = diningReservationSchema.parse(req.body)

    const { data: reservation, error } = await supabase
      .from('dining_reservations')
      .insert({
        member_id: req.member_id!,
        reservation_date,
        reservation_time,
        meal_type,
        guest_count,
        table_preference: table_preference || null,
        special_requests: special_requests || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('Create reservation error:', error)
      res.status(500).json({ error: 'Failed to create reservation' })
      return
    }

    res.status(201).json({
      reservation,
      message: 'Reservation created successfully'
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors })
      return
    }
    console.error('Create reservation error:', error)
    res.status(500).json({ error: 'Failed to create reservation' })
  }
})

// Update dining reservation
router.put('/reservations/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { reservation_date, reservation_time, meal_type, guest_count, table_preference, special_requests, status } = req.body

    const { data: existing } = await supabase
      .from('dining_reservations')
      .select('member_id')
      .eq('id', id)
      .single()

    if (!existing) {
      res.status(404).json({ error: 'Reservation not found' })
      return
    }

    if (existing.member_id !== req.member_id) {
      res.status(403).json({ error: 'Not authorized to update this reservation' })
      return
    }

    const updateData: Record<string, any> = { updated_at: new Date().toISOString() }
    if (reservation_date) updateData.reservation_date = reservation_date
    if (reservation_time) updateData.reservation_time = reservation_time
    if (meal_type) updateData.meal_type = meal_type
    if (guest_count) updateData.guest_count = guest_count
    if (table_preference !== undefined) updateData.table_preference = table_preference
    if (special_requests !== undefined) updateData.special_requests = special_requests
    if (status) updateData.status = status

    const { data: updated, error } = await supabase
      .from('dining_reservations')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Update reservation error:', error)
      res.status(500).json({ error: 'Failed to update reservation' })
      return
    }

    res.json({
      reservation: updated,
      message: 'Reservation updated successfully'
    })
  } catch (error) {
    console.error('Update reservation error:', error)
    res.status(500).json({ error: 'Failed to update reservation' })
  }
})

// Cancel dining reservation
router.delete('/reservations/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { data: existing } = await supabase
      .from('dining_reservations')
      .select('member_id, status')
      .eq('id', id)
      .single()

    if (!existing) {
      res.status(404).json({ error: 'Reservation not found' })
      return
    }

    if (existing.member_id !== req.member_id) {
      res.status(403).json({ error: 'Not authorized to cancel this reservation' })
      return
    }

    const { data: updated, error } = await supabase
      .from('dining_reservations')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Cancel reservation error:', error)
      res.status(500).json({ error: 'Failed to cancel reservation' })
      return
    }

    res.json({
      reservation: updated,
      message: 'Reservation cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel reservation error:', error)
    res.status(500).json({ error: 'Failed to cancel reservation' })
  }
})

export default router
