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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-light text-ivory mb-2 tracking-wide">Reset Password</h1>
          <p className="label-caps text-cambridge-light/65">City University Club</p>
        </div>

        {submitted ? (
          <div className="space-y-4">
            <div className="border border-cambridge/30 bg-white/5 text-ivory/70 p-4 rounded text-sm text-center">
              If that email is registered with us, you'll receive a reset link shortly. The link expires in 15 minutes.
            </div>
            <div className="text-center">
              <Link to="/login" className="text-xs text-cambridge/60 hover:text-cambridge-light transition">
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <p className="text-ivory/40 text-sm text-center">
              Enter your membership email and we'll send you a link to reset your password.
            </p>
            <div>
              <label className="label-caps text-cambridge-light/65 block mb-2">
                Membership Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="club-input-dark"
                placeholder="your.email@example.com"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/20 text-red-200/80 p-3 text-sm border border-red-400/20 rounded">
                {error}
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || !email}
              className="btn-primary"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <Link to="/login" className="text-xs text-cambridge/60 hover:text-cambridge-light transition">
                Back to login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
