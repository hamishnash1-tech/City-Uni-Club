import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
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

    if (!formData.email || !formData.password) {
      dispatch(loginFailure('Please enter both email and password'))
      return
    }

    try {
      console.log('Calling login API...')
      const response = await api.login(formData.email, formData.password)
      console.log('Login successful:', response)

      dispatch(loginSuccess({
        token: response.session.token,
        member: response.member
      }))

      console.log('Navigating to home...')
      navigate('/home')
    } catch (err: any) {
      console.error('Login error:', err)
      dispatch(loginFailure('Login failed: ' + err.message))
    }
  }

  return (
    <div className="bg-navy-gradient flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-5 border border-cambridge/35 bg-white/5 rounded-full flex items-center justify-center overflow-hidden">
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
          <h1 className="font-serif text-4xl font-light text-ivory tracking-wide mb-2">Welcome</h1>
          <p className="label-caps text-cambridge-light/65">City University Club</p>
        </div>

        {/* Login Form */}
        <div className="space-y-5">
          <div>
            <label className="label-caps text-cambridge-light/65 block mb-2">
              Membership Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="club-input-dark"
              placeholder="your.email@example.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="label-caps text-cambridge-light/65">
                Password
              </label>
              <Link to="/forgot-password" className="text-xs text-cambridge/60 hover:text-cambridge-light transition">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="club-input-dark"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-red-900/20 text-red-200/80 p-3 text-sm border border-red-400/20 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            onClick={handleSubmit}
            className="btn-primary mt-2"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <p className="text-center text-xs text-ivory/50 pt-1">
            Use the email address registered with your City University Club membership
          </p>
        </div>
      </div>
    </div>
  )
}
