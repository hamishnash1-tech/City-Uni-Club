import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { User } from '../types'
import { supabase } from '../services/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session
    const session = localStorage.getItem('admin_session')
    if (session) {
      try {
        setUser(JSON.parse(session))
      } catch (e) {
        localStorage.removeItem('admin_session')
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.functions.invoke('admin-login', {
      body: { email, password }
    })

    if (error) throw error
    if (!data?.user) throw new Error('Login failed')

    setUser(data.user)
    localStorage.setItem('admin_session', JSON.stringify(data.user))
  }

  const logout = async () => {
    await supabase.functions.invoke('admin-logout')
    setUser(null)
    localStorage.removeItem('admin_session')
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
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
