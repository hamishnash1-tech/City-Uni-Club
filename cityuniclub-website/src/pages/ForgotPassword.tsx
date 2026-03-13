import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { EDGE_FUNCTIONS_URL } from '../services/supabase'

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send reset email')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-oxford-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-light text-white mb-2">Reset Password</h1>
          <p className="text-cambridge-blue font-serif">City University Club</p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="bg-green-500/20 text-green-300 p-4 rounded-lg text-sm border border-green-500/30 text-center">
              If that email is registered with us, you'll receive a reset link shortly. The link expires in 15 minutes.
            </div>
            <div className="text-center">
              <Link to="/login" className="text-cambridge-blue text-sm hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <p className="text-gray-300 text-sm text-center">
              Enter your membership email and we'll send you a link to reset your password.
            </p>
            <div>
              <label className="block text-sm font-medium text-cambridge-blue mb-2">
                Membership Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-cambridge-blue/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cambridge-blue"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {error && (
              <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm border border-red-500/30">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="w-full bg-gradient-to-r from-cambridge-blue to-cambridge-blue/80 text-white py-4 rounded-lg font-semibold disabled:opacity-60 hover:from-cambridge-blue/90 hover:to-cambridge-blue/70 transition"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-cambridge-blue text-sm hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
