import { Router } from 'express'
import { supabase } from '../lib/supabase.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'
import { updateProfileSchema } from '../utils/validators.js'

const router = Router()

router.use(authenticate)

// Get member profile
router.get('/profile', async (req: AuthRequest, res) => {
  try {
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('id, email, full_name, first_name, phone_number, membership_number, membership_type, member_since, member_until')
      .eq('id', req.member_id)
      .single()

    if (memberError || !member) {
      res.status(404).json({ error: 'Member not found' })
      return
    }

    const { data: profile } = await supabase
      .from('member_profiles')
      .select('*')
      .eq('member_id', req.member_id)
      .single()

    res.json({
      member,
      profile: profile || {
        dietary_requirements: null,
        preferences: {},
        notification_enabled: true
      }
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Failed to get profile' })
  }
})

// Update member profile
router.put('/profile', async (req: AuthRequest, res) => {
  try {
    const { full_name, first_name, phone_number, dietary_requirements, notification_enabled } = updateProfileSchema.parse(req.body)

    const memberUpdate: Record<string, any> = { updated_at: new Date().toISOString() }
    if (full_name) memberUpdate.full_name = full_name
    if (first_name) memberUpdate.first_name = first_name
    if (phone_number !== undefined) memberUpdate.phone_number = phone_number

    const { data: updatedMember, error: memberError } = await supabase
      .from('members')
      .update(memberUpdate)
      .eq('id', req.member_id)
      .select()
      .single()

    if (memberError) {
      console.error('Member update error:', memberError)
      res.status(500).json({ error: 'Failed to update member' })
      return
    }

    const profileUpdate: Record<string, any> = { updated_at: new Date().toISOString() }
    if (dietary_requirements !== undefined) profileUpdate.dietary_requirements = dietary_requirements
    if (notification_enabled !== undefined) profileUpdate.notification_enabled = notification_enabled

    const { data: updatedProfile } = await supabase
      .from('member_profiles')
      .upsert({
        member_id: req.member_id,
        ...profileUpdate
      }, { onConflict: 'member_id' })
      .select()
      .single()

    res.json({
      member: updatedMember,
      profile: updatedProfile
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors })
      return
    }
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Failed to update profile' })
  }
})

// Get member's upcoming event bookings
router.get('/bookings', async (req: AuthRequest, res) => {
  try {
    const { data: bookings, error } = await supabase
      .from('event_bookings')
      .select(`
        *,
        events (
          id,
          title,
          event_type,
          event_date,
          lunch_time,
          dinner_time
        )
      `)
      .eq('member_id', req.member_id)
      .eq('status', 'confirmed')
      .gte('events.event_date', new Date().toISOString().split('T')[0])
      .order('events.event_date', { ascending: true })

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

// Get member's dining reservations
router.get('/reservations', async (req: AuthRequest, res) => {
  try {
    const { data: reservations, error } = await supabase
      .from('dining_reservations')
      .select('*')
      .eq('member_id', req.member_id)
      .gte('reservation_date', new Date().toISOString().split('T')[0])
      .order('reservation_date', { ascending: true })
      .order('reservation_time', { ascending: true })

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

// Get member's LOI requests
router.get('/loi-requests', async (req: AuthRequest, res) => {
  try {
    const { data: requests, error } = await supabase
      .from('loi_requests')
      .select(`
        *,
        reciprocal_clubs (
          id,
          name,
          location,
          country
        )
      `)
      .eq('member_id', req.member_id)
      .order('requested_at', { ascending: false })

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

export default router
