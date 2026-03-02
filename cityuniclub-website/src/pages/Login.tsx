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
    dispatch(loginStart())

    try {
      const response = await api.login(formData.email, formData.password)
      dispatch(loginSuccess({ token: response.session.token, member: response.member }))
      navigate('/home')
    } catch (err: any) {
      dispatch(loginFailure(err.message || 'Login failed'))
    }
  }

  return (
    <div className="min-h-screen bg-oxford-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-4xl font-serif text-white font-bold">CUC</span>
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
              placeholder="email@example.com"
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

          <div className="text-center">
            <a href="#" className="text-cambridge-blue text-sm underline">Forgot Password?</a>
          </div>

          <p className="text-center text-xs text-secondary-text mt-6">
            Contact the secretary for login assistance<br/>
            <a href="mailto:secretary@cityuniversityclub.co.uk" className="text-cambridge-blue">
              secretary@cityuniversityclub.co.uk
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
