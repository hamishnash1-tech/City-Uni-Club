import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate, optionalAuth, type AuthRequest } from '../middleware/auth.js'
import { eventBookingSchema } from '../utils/validators.js'

const router = Router()

// Get all active events (public or authenticated)
router.get('/', optionalAuth, async (req: AuthRequest, res) => {
  try {
    const { date, type, upcoming } = req.query

    let query = supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('event_date', { ascending: true })

    if (date) {
      query = query.eq('event_date', date as string)
    }

    if (type) {
      query = query.eq('event_type', type as string)
    }

    if (upcoming === 'true') {
      query = query.gte('event_date', new Date().toISOString().split('T')[0])
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Get events error:', error)
      res.status(500).json({ error: 'Failed to get events' })
      return
    }

    res.json({ events })
  } catch (error) {
    console.error('Get events error:', error)
    res.status(500).json({ error: 'Failed to get events' })
  }
})

// Get single event by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const { id } = req.params

    const { data: event, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error || !event) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    res.json({ event })
  } catch (error) {
    console.error('Get event error:', error)
    res.status(500).json({ error: 'Failed to get event' })
  }
})

// Book event (authenticated only)
router.post('/:id/book', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params
    const { meal_option, guest_count, special_requests } = eventBookingSchema.parse(req.body)

    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, price_per_person, event_type')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (eventError || !event) {
      res.status(404).json({ error: 'Event not found' })
      return
    }

    if (event.event_type === 'lunch_dinner' && !meal_option) {
      res.status(400).json({ error: 'Meal option required for lunch/dinner events' })
      return
    }

    const totalPrice = Number(event.price_per_person) * guest_count

    const { data: booking, error: bookingError } = await supabase
      .from('event_bookings')
      .insert({
        event_id: id,
        member_id: req.member_id!,
        meal_option: meal_option || null,
        guest_count,
        special_requests: special_requests || null,
        total_price: totalPrice,
        status: 'pending',
        booked_at: new Date().toISOString()
      })
      .select(`
        *,
        events (
          id,
          title,
          event_type,
          event_date
        )
      `)
      .single()

    if (bookingError) {
      console.error('Create booking error:', bookingError)
      res.status(500).json({ error: 'Failed to create booking' })
      return
    }

    res.status(201).json({
      booking,
      message: 'Booking created successfully'
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors })
      return
    }
    console.error('Book event error:', error)
    res.status(500).json({ error: 'Failed to book event' })
  }
})

// Get member's bookings for an event
router.get('/:id/bookings', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params

    const { data: bookings, error } = await supabase
      .from('event_bookings')
      .select('*')
      .eq('event_id', id)
      .eq('member_id', req.member_id)

    if (error) {
      console.error('Get bookings error:', error)
      res.status(500).json({ error: 'Failed to get bookings' })
      return
    }

    res.json({ bookings })
  } catch (error) {
    console.error('Get bookings error:', error)
    res.status(500).json({ error: 'Failed to get bookings' })
  }
})

// Cancel booking
router.put('/bookings/:bookingId/cancel', authenticate, async (req: AuthRequest, res) => {
  try {
    const { bookingId } = req.params

    const { data: booking } = await supabase
      .from('event_bookings')
      .select('member_id, status')
      .eq('id', bookingId)
      .single()

    if (!booking) {
      res.status(404).json({ error: 'Booking not found' })
      return
    }

    if (booking.member_id !== req.member_id) {
      res.status(403).json({ error: 'Not authorized to cancel this booking' })
      return
    }

    if (booking.status === 'cancelled') {
      res.status(400).json({ error: 'Booking already cancelled' })
      return
    }

    const { data: updatedBooking, error } = await supabase
      .from('event_bookings')
      .update({ status: 'cancelled', updated_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select()
      .single()

    if (error) {
      console.error('Cancel booking error:', error)
      res.status(500).json({ error: 'Failed to cancel booking' })
      return
    }

    res.json({
      booking: updatedBooking,
      message: 'Booking cancelled successfully'
    })
  } catch (error) {
    console.error('Cancel booking error:', error)
    res.status(500).json({ error: 'Failed to cancel booking' })
  }
})

export default router
