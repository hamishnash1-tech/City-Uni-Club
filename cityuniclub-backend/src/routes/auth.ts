import { Router } from 'express'
import { supabase, type Member } from '../lib/supabase.js'
import { hashPassword, verifyPassword, generateResetToken, generateSessionToken } from '../utils/crypto.js'
import { loginSchema, registerSchema, passwordResetSchema, changePasswordSchema } from '../utils/validators.js'
import { authenticate, type AuthRequest } from '../middleware/auth.js'

const router = Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body)

    const { data: member, error } = await supabase
      .from('members')
      .select('id, email, password_hash, full_name, first_name, membership_number, membership_type, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !member) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const isValid = await verifyPassword(password, member.password_hash)
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' })
      return
    }

    const deviceInfo = req.headers['user-agent']
    const ipAddress = req.ip

    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        member_id: member.id,
        token: generateSessionToken(),
        device_info: deviceInfo,
        ip_address: ipAddress,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    if (sessionError || !sessionData) {
      res.status(500).json({ error: 'Failed to create session' })
      return
    }

    res.json({
      member: {
        id: member.id,
        email: member.email,
        full_name: member.full_name,
        first_name: member.first_name,
        membership_number: member.membership_number,
        membership_type: member.membership_type
      },
      session: {
        token: sessionData.token,
        expires_at: sessionData.expires_at
      }
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors })
      return
    }
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed' })
  }
})

// Logout
router.post('/logout', authenticate, async (req: AuthRequest, res) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.substring(7) || ''

    await supabase
      .from('sessions')
      .delete()
      .eq('token', token)

    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Logout failed' })
  }
})

// Register new member (admin only typically)
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, first_name, membership_number, membership_type, member_since, phone_number } = registerSchema.parse(req.body)

    const { data: existingMember } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single()

    if (existingMember) {
      res.status(400).json({ error: 'Email already registered' })
      return
    }

    const passwordHash = await hashPassword(password)

    const { data: newMember, error } = await supabase
      .from('members')
      .insert({
        email,
        password_hash: passwordHash,
        full_name,
        first_name,
        membership_number,
        membership_type,
        member_since,
        phone_number: phone_number || null
      })
      .select('id, email, full_name, first_name, membership_number, membership_type')
      .single()

    if (error) {
      console.error('Registration error:', error)
      res.status(500).json({ error: 'Registration failed' })
      return
    }

    await supabase
      .from('member_profiles')
      .insert({
        member_id: newMember.id
      })

    res.status(201).json({
      member: newMember,
      message: 'Registration successful'
    })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors })
      return
    }
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Registration failed' })
  }
})

// Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = passwordResetSchema.parse(req.body)

    const { data: member } = await supabase
      .from('members')
      .select('id')
      .eq('email', email)
      .single()

    if (!member) {
      res.json({ message: 'If the email exists, a reset link has been sent' })
      return
    }

    const token = generateResetToken()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

    await supabase
      .from('password_reset_tokens')
      .insert({
        member_id: member.id,
        token,
        expires_at: expiresAt.toISOString()
      })

    res.json({ message: 'If the email exists, a reset link has been sent' })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors })
      return
    }
    console.error('Password reset error:', error)
    res.status(500).json({ error: 'Password reset failed' })
  }
})

// Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, new_password } = req.body

    if (!token || !new_password) {
      res.status(400).json({ error: 'Token and new password required' })
      return
    }

    const { data: resetToken } = await supabase
      .from('password_reset_tokens')
      .select('member_id')
      .eq('token', token)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!resetToken) {
      res.status(400).json({ error: 'Invalid or expired token' })
      return
    }

    const passwordHash = await hashPassword(new_password)

    await supabase
      .from('members')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', resetToken.member_id)

    await supabase
      .from('password_reset_tokens')
      .update({ used: true })
      .eq('token', token)

    await supabase
      .from('sessions')
      .delete()
      .eq('member_id', resetToken.member_id)

    res.json({ message: 'Password reset successful' })
  } catch (error: any) {
    console.error('Password reset error:', error)
    res.status(500).json({ error: 'Password reset failed' })
  }
})

// Change password (authenticated)
router.post('/change-password', authenticate, async (req: AuthRequest, res) => {
  try {
    const { current_password, new_password } = changePasswordSchema.parse(req.body)

    const { data: member } = await supabase
      .from('members')
      .select('password_hash')
      .eq('id', req.member_id)
      .single()

    if (!member) {
      res.status(404).json({ error: 'Member not found' })
      return
    }

    const isValid = await verifyPassword(current_password, member.password_hash)
    if (!isValid) {
      res.status(401).json({ error: 'Current password is incorrect' })
      return
    }

    const passwordHash = await hashPassword(new_password)

    await supabase
      .from('members')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', req.member_id)

    res.json({ message: 'Password changed successfully' })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      res.status(400).json({ error: error.errors })
      return
    }
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Password change failed' })
  }
})

// Get current member info
router.get('/me', authenticate, async (req: AuthRequest, res) => {
  try {
    const { data: member, error } = await supabase
      .from('members')
      .select('id, email, full_name, first_name, phone_number, membership_number, membership_type, member_since, member_until, is_active')
      .eq('id', req.member_id)
      .single()

    if (error || !member) {
      res.status(404).json({ error: 'Member not found' })
      return
    }

    res.json({ member })
  } catch (error) {
    console.error('Get member error:', error)
    res.status(500).json({ error: 'Failed to get member info' })
  }
})

// Validate session
router.post('/validate', async (req, res) => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ valid: false })
      return
    }

    const token = authHeader.substring(7)

    const { data } = await supabase
      .from('sessions')
      .select('member_id, expires_at')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!data) {
      res.status(401).json({ valid: false })
      return
    }

    await supabase
      .from('sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('token', token)

    res.json({ valid: true, member_id: data.member_id, expires_at: data.expires_at })
  } catch (error) {
    res.status(500).json({ valid: false })
  }
})

export default router
