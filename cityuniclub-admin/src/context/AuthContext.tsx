import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { User } from '../types'
import { supabase, FUNCTIONS_URL } from '../services/supabase'

const MAX_SESSION_HOURS = 12

interface AuthContextType {
  user: User | null
  sessionToken: string | null
  sessionExpired: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getTokenClaims(token: string): { exp?: number; iat?: number } {
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch {
    return {}
  }
}

function isTokenExpired(token: string): boolean {
  const { exp, iat } = getTokenClaims(token)
  const now = Date.now() / 1000
  if (exp && now > exp) return true
  if (iat && now > iat + MAX_SESSION_HOURS * 3600) return true
  return false
}

async function refreshAccessToken(refreshToken: string): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken })
    if (error || !data.session) return null
    localStorage.setItem('admin_token', data.session.access_token)
    if (data.session.refresh_token) {
      localStorage.setItem('admin_refresh_token', data.session.refresh_token)
    }
    return data.session.access_token
  } catch {
    return null
  }
}

function clearLocalStorage() {
  localStorage.removeItem('admin_session')
  localStorage.removeItem('admin_token')
  localStorage.removeItem('admin_refresh_token')
  localStorage.removeItem('admin_login_time')
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [sessionExpired, setSessionExpired] = useState(false)
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    setUser(null)
    setSessionToken(null)
    setSessionExpired(false)
    clearLocalStorage()
  }, [])

  // Restore session on mount
  useEffect(() => {
    const init = async () => {
      const storedToken = localStorage.getItem('admin_token')
      const refreshToken = localStorage.getItem('admin_refresh_token')
      const sessionData = localStorage.getItem('admin_session')

      if (!storedToken || !sessionData) {
        setLoading(false)
        return
      }

      let token = storedToken

      if (isTokenExpired(token)) {
        if (refreshToken) {
          const refreshed = await refreshAccessToken(refreshToken)
          if (!refreshed) {
            clearLocalStorage()
            setLoading(false)
            return
          }
          token = refreshed
        } else {
          clearLocalStorage()
          setLoading(false)
          return
        }
      }

      try {
        setUser(JSON.parse(sessionData))
        setSessionToken(token)
      } catch {
        clearLocalStorage()
      }
      setLoading(false)
    }

    init()
  }, [])

  // Proactive refresh: every 5 minutes, refresh token if < 10 minutes to expiry
  useEffect(() => {
    if (!sessionToken) return
    const interval = setInterval(async () => {
      const refreshToken = localStorage.getItem('admin_refresh_token')
      const { exp, iat } = getTokenClaims(sessionToken)
      const now = Date.now() / 1000

      // Enforce 12-hour cap from iat
      if (iat && now > iat + MAX_SESSION_HOURS * 3600) {
        logout()
        setSessionExpired(true)
        return
      }

      // Proactively refresh if < 10 minutes left
      if (exp && exp - now < 600 && refreshToken) {
        const newToken = await refreshAccessToken(refreshToken)
        if (newToken) {
          setSessionToken(newToken)
        } else if (exp && now > exp) {
          logout()
          setSessionExpired(true)
        }
        return
      }

      // Already expired
      if (exp && now > exp) {
        logout()
        setSessionExpired(true)
      }
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [sessionToken, logout])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    if (!data?.user) throw new Error('Login failed')

    const accessToken = data.session?.token
    const refreshToken = data.session?.refresh_token

    setUser(data.user)
    setSessionToken(accessToken || null)
    setSessionExpired(false)
    localStorage.setItem('admin_session', JSON.stringify(data.user))
    localStorage.setItem('admin_login_time', Date.now().toString())
    if (accessToken) localStorage.setItem('admin_token', accessToken)
    if (refreshToken) localStorage.setItem('admin_refresh_token', refreshToken)
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
