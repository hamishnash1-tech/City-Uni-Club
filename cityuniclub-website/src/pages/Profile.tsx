import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { logout } from '../slices/authSlice'
import { EDGE_FUNCTIONS_URL } from '../services/supabase'

export const Profile: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const member = auth.member

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  if (!member) {
    navigate('/login')
    return null
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirm) { setError('New passwords do not match'); return }
    if (newPassword.length < 8) { setError('New password must be at least 8 characters'); return }
    if (newPassword === currentPassword) { setError('New password must be different from current password'); return }

    setLoading(true)
    try {
      const token = localStorage.getItem('authToken')
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to change password')
      setSuccess('Password changed successfully.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirm('')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ivory-warm px-4 py-6">
      <div className="max-w-md mx-auto space-y-5">

        {/* Account Details */}
        <div className="club-card p-6 space-y-4">
          <h2 className="font-serif text-oxford-blue font-normal text-lg">Account Details</h2>

          <div>
            <label className="label-caps text-ink-light block mb-1">Full Name</label>
            <p className="text-ink font-medium">{member.full_name}</p>
          </div>

          <div>
            <label className="label-caps text-ink-light block mb-1">Email Address</label>
            <p className="text-ink">{member.email}</p>
            <p className="text-xs text-ink-light mt-1.5 leading-relaxed">
              To change your email address, please contact the secretary at{' '}
              <a href="mailto:secretary@cityuniversityclub.co.uk" className="text-cambridge-muted hover:text-oxford-blue underline transition">
                secretary@cityuniversityclub.co.uk
              </a>
            </p>
          </div>
        </div>

        {/* Change Password */}
        <div className="club-card p-6 space-y-4">
          <h2 className="font-serif text-oxford-blue font-normal text-lg">Change Password</h2>

          <div>
            <label className="label-caps text-ink-light block mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="club-input"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="label-caps text-ink-light block mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="club-input"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="label-caps text-ink-light block mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="club-input"
              placeholder="Repeat new password"
            />
          </div>

          {error && (
            <div className="text-red-700/80 text-sm border-l-2 border-red-400 pl-3 py-1">
              {error}
            </div>
          )}
          {success && (
            <div className="border-l-2 border-cambridge/60 text-oxford-blue text-sm pl-3 py-1">
              {success}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={loading || !currentPassword || !newPassword || !confirm}
            className="btn-primary"
          >
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </div>

        {/* Sign Out */}
        <div className="club-card p-6">
          <h2 className="font-serif text-oxford-blue font-normal text-lg mb-4">Sign Out</h2>
          <button
            onClick={() => { dispatch(logout()); navigate('/login') }}
            className="btn-outline-navy w-full"
          >
            Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}
