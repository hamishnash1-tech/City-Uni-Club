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
      <div className="min-h-screen bg-oxford-blue flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center space-y-4">
          <p className="text-red-300">Invalid or missing reset link.</p>
          <Link to="/login" className="text-cambridge-blue text-sm hover:underline">Back to login</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-oxford-blue flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="text-2xl font-light text-white mb-2">Set New Password</h1>
          <p className="text-cambridge-blue font-serif">City University Club</p>
        </div>

        {done ? (
          <div className="space-y-4">
            <div className="bg-green-500/20 text-green-300 p-4 rounded-lg text-sm border border-green-500/30 text-center">
              Your password has been reset successfully.
            </div>
            <div className="text-center">
              <Link to="/login" className="text-cambridge-blue text-sm hover:underline">
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-cambridge-blue mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-cambridge-blue/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cambridge-blue"
                placeholder="At least 8 characters"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-cambridge-blue mb-2">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 border border-cambridge-blue/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cambridge-blue"
                placeholder="Repeat password"
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
              disabled={loading || !newPassword || !confirm}
              className="w-full bg-gradient-to-r from-cambridge-blue to-cambridge-blue/80 text-white py-4 rounded-lg font-semibold disabled:opacity-60 hover:from-cambridge-blue/90 hover:to-cambridge-blue/70 transition"
            >
              {loading ? 'Saving...' : 'Reset Password'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
