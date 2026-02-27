import { Request, Response, NextFunction } from 'express'
import { supabase } from '../lib/supabase.js'

export interface AuthRequest extends Request {
  member_id?: string
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' })
      return
    }

    const token = authHeader.substring(7)

    const { data, error } = await supabase
      .from('sessions')
      .select('member_id')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    req.member_id = data.member_id
    
    // Update last active
    await supabase
      .from('sessions')
      .update({ last_active_at: new Date().toISOString() })
      .eq('token', token)
    
    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

export const optionalAuth = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      const { data } = await supabase
        .from('sessions')
        .select('member_id')
        .eq('token', token)
        .gt('expires_at', new Date().toISOString())
        .single()

      if (data) {
        req.member_id = data.member_id
      }
    }
    
    next()
  } catch (error) {
    next()
  }
}
