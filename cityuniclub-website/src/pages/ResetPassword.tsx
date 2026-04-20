import React, { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { EDGE_FUNCTIONS_URL } from '../services/supabase'

export const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''

  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirm) { setError('Passwords do not match'); return }
    if (newPassword.length < 8) { setError('Password must be at least 8 characters'); return }

    setLoading(true)
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token, new_password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to reset password')
      setDone(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <p className="text-red-300/80 text-sm">Invalid or missing reset link.</p>
          <Link to="/login" className="text-xs text-cambridge/60 hover:text-cambridge-light transition">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-serif text-3xl font-light text-ivory mb-2 tracking-wide">Set New Password</h1>
          <p className="label-caps text-cambridge-light/65">City University Club</p>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="border border-cambridge/30 bg-white/5 text-ivory/70 p-4 rounded text-sm text-center">
              Your password has been reset successfully.
            </div>
            <div className="text-center">
              <Link to="/login" className="text-xs text-cambridge/60 hover:text-cambridge-light transition">
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <label className="label-caps text-cambridge-light/65 block mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="club-input-dark"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div>
              <label className="label-caps text-cambridge-light/65 block mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="club-input-dark"
                placeholder="Repeat password"
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
              disabled={loading || !newPassword || !confirm}
              className="btn-primary"
            >
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
