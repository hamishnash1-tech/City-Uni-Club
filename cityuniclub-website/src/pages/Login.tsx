import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loginStart, loginSuccess, loginFailure } from '../slices/authSlice'
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
    dispatch(loginStart())

    try {
      // Simulate login for demo (no backend required)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Accept any email with password "password123"
      if (formData.password === 'password123' && formData.email.includes('@')) {
        const memberData = {
          id: 'demo-user-id',
          email: formData.email,
          full_name: formData.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          first_name: formData.email.split('@')[0].split('.')[0].charAt(0).toUpperCase() + formData.email.split('@')[0].split('.')[0].slice(1),
          membership_number: 'CUC-2024-0001',
          membership_type: 'Full Membership'
        }
        
        dispatch(loginSuccess({ 
          token: 'demo-token-' + Date.now(), 
          member: memberData 
        }))
        navigate('/home')
      } else {
        throw new Error('Invalid email or password. Use password: password123')
      }
    } catch (err: any) {
      dispatch(loginFailure(err.message || 'Login failed'))
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
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=CUC'
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
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !formData.email || !formData.password}
            className="w-full bg-gradient-to-r from-cambridge-blue to-cambridge-blue/80 text-white py-4 rounded-lg font-semibold disabled:opacity-60"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Logging in...
              </span>
            ) : (
              'Login'
            )}
          </button>

          <div className="text-center text-sm text-gray-400">
            <p>Demo: Use password <strong className="text-cambridge-blue">password123</strong></p>
          </div>
        </div>
      </div>
    </div>
  )
}
