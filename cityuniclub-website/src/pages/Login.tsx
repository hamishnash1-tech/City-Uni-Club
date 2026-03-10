import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginStart, loginSuccess, loginFailure } from '../slices/authSlice'
import { api } from '../services/api'
import { RootState } from '../store'

export const Login: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const auth = useSelector((state: RootState) => state.auth)
  const isLoading = auth.isLoading
  const error = auth.error

  const [formData, setFormData] = useState({ email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log('Login attempt:', { email: formData.email, password: formData.password })
    dispatch(loginStart())

    // Simple validation
    if (!formData.email || !formData.password) {
      dispatch(loginFailure('Please enter both email and password'))
      return
    }

    try {
      // Call real API
      console.log('Calling login API...')
      const response = await api.login(formData.email, formData.password)
      console.log('Login successful:', response)

      dispatch(loginSuccess({
        token: response.session.token,
        member: response.member
      }))

      console.log('Navigating to home...')
      // Navigate to home
      navigate('/home')
    } catch (err: any) {
      console.error('Login error:', err)
      dispatch(loginFailure('Login failed: ' + err.message))
    }
  }

  return (
    <div className="min-h-screen bg-oxford-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center overflow-hidden">
            <img 
              src="/assets/cuc-logo.avif" 
              alt="CUC Logo" 
              className="w-20 h-20 object-contain"
              onError={(e) => {
                console.log('Logo failed to load')
                ;(e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=CUC'
              }}
            />
          </div>
          <h1 className="text-3xl font-light text-white mb-2">Welcome</h1>
          <p className="text-cambridge-blue font-serif">City University Club</p>
        </div>

        {/* Login Form */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-cambridge-blue mb-2">
              Membership Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-cambridge-blue/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cambridge-blue"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-cambridge-blue mb-2">
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 bg-white/10 border border-cambridge-blue/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cambridge-blue"
              placeholder="password123"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm border border-red-500/30">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-cambridge-blue to-cambridge-blue/80 text-white py-4 rounded-lg font-semibold disabled:opacity-60 hover:from-cambridge-blue/90 hover:to-cambridge-blue/70 transition"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <div className="text-center text-sm text-gray-400 bg-white/5 p-4 rounded-lg">
            <p className="mb-2">🔑 Login with your membership credentials</p>
            <p className="text-xs">
              Use the email address registered with your City University Club membership
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
