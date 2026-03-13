import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { EDGE_FUNCTIONS_URL } from '../services/supabase'

export const Profile: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
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
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-md mx-auto space-y-6">

        {/* Account details */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-oxford-blue">Account Details</h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
            <p className="text-gray-900 font-medium">{member.full_name}</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Email Address</label>
            <p className="text-gray-900">{member.email}</p>
            <p className="text-xs text-gray-400 mt-1">
              To change your email address, please contact the secretary at{' '}
              <a href="mailto:secretary@cityuniversityclub.co.uk" className="underline">
                secretary@cityuniversityclub.co.uk
              </a>
            </p>
          </div>
        </div>

        {/* Change password */}
        <div className="bg-white rounded-2xl shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-oxford-blue">Change Password</h2>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-oxford-blue/30"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-oxford-blue/30"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Confirm New Password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-oxford-blue/30"
              placeholder="Repeat new password"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg border border-green-100">
              {success}
            </div>
          )}

          <button
            onClick={handleChangePassword}
            disabled={loading || !currentPassword || !newPassword || !confirm}
            className="w-full bg-oxford-blue text-white py-3 rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-oxford-blue/90 transition"
          >
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </div>

      </div>
    </div>
  )
}
