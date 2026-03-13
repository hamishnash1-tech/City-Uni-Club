import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { supabase, FUNCTIONS_URL } from '../services/supabase'

interface AuthContextType {
  user: User | null
  sessionToken: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [sessionToken, setSessionToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const session = localStorage.getItem('admin_session')
    const token = localStorage.getItem('admin_token')
    if (session) {
      try {
        setUser(JSON.parse(session))
        setSessionToken(token)
      } catch (e) {
        localStorage.removeItem('admin_session')
        localStorage.removeItem('admin_token')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${FUNCTIONS_URL}/admin-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    if (!data?.user) throw new Error('Login failed')

    setUser(data.user)
    setSessionToken(data.session?.token || null)
    localStorage.setItem('admin_session', JSON.stringify(data.user))
    if (data.session?.token) {
      localStorage.setItem('admin_token', data.session.token)
    }
  }

  const logout = () => {
    setUser(null)
    setSessionToken(null)
    localStorage.removeItem('admin_session')
    localStorage.removeItem('admin_token')
  }

  return (
    <AuthContext.Provider value={{ user, sessionToken, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
