import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import { FUNCTIONS_URL } from '../services/supabase'

const MAX_SESSION_MS = 12 * 60 * 60 * 1000 // 12 hours

interface AuthContextType {
  user: User | null
  sessionToken: string | null
  sessionExpired: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setSessionToken(null)
    setSessionExpired(false)
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_login_time')
  }, [])

  // Check if session has exceeded 12-hour cap OR if the JWT itself has expired
  const isExpiredLocally = useCallback((token: string | null): boolean => {
    if (!token) return false
    // Decode JWT exp to catch Supabase's own expiry (default 1 hour)
    try {
      const [, payload] = token.split('.')
      const { exp, iat } = JSON.parse(atob(payload))
      const nowSec = Date.now() / 1000
      if (exp && nowSec > exp) return true
      // Also enforce 12-hour cap from iat
      if (iat && nowSec > iat + MAX_SESSION_MS / 1000) return true
    } catch {}
    return false
  }, [])

  useEffect(() => {
    const session = localStorage.getItem('admin_session')
    const token = localStorage.getItem('admin_token')
    if (session && token) {
      try {
        if (isExpiredLocally(token)) {
          logout()
        } else {
          setUser(JSON.parse(session))
          setSessionToken(token)
        }
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, [])

  // Poll every 30 seconds to detect expiry
  useEffect(() => {
    if (!sessionToken) return
    const interval = setInterval(() => {
      if (isExpiredLocally(sessionToken)) {
        setSessionExpired(true)
      }
    }, 30_000)
    return () => clearInterval(interval)
  }, [sessionToken])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    if (!data?.user) throw new Error('Login failed')

    const now = Date.now().toString()
    setUser(data.user)
    setSessionToken(data.session?.token || null)
    setSessionExpired(false)
    localStorage.setItem('admin_session', JSON.stringify(data.user))
    localStorage.setItem('admin_login_time', now)
    if (data.session?.token) {
      localStorage.setItem('admin_token', data.session.token)
    }
  }

  return (
    <AuthContext.Provider value={{ user, sessionToken, sessionExpired, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
