import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { RootState } from '../store'
import { logout } from '../slices/authSlice'
import { EDGE_FUNCTIONS_URL } from '../services/supabase'
import { api } from '../services/api'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' })
}

function formatTime(timeStr: string) {
  const [h, m] = timeStr.split(':')
  const hour = parseInt(h)
  return `${hour % 12 || 12}:${m} ${hour < 12 ? 'AM' : 'PM'}`
}

function statusBadge(status: string) {
  const styles: Record<string, string> = {
    confirmed: 'bg-cambridge/20 text-cambridge-muted border border-cambridge/30',
    pending:   'bg-amber-50 text-amber-700 border border-amber-200',
    cancelled: 'bg-red-50 text-red-600 border border-red-200',
  }
  return (
    <span className={`label-caps px-2 py-0.5 rounded-sm text-xs ${styles[status] ?? 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {status}
    </span>
  )
}

function BookingItem({ item }: { item: any }) {
  const isEvent = item.type === 'event'
  return (
    <div className="py-3 border-b border-cambridge/10 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-ink leading-snug">{item.title}</p>
          <p className="text-xs text-ink-light mt-0.5">
            {isEvent
              ? (item.is_tba ? 'Date TBA' : formatDate(item.event_date))
              : `${formatDate(item.reservation_date)} · ${formatTime(item.reservation_time)}`}
            {' · '}{item.guest_count} {item.guest_count === 1 ? 'guest' : 'guests'}
          </p>
        </div>
        {statusBadge(item.status)}
      </div>
    </div>
  )
}

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

  const [bookings, setBookings] = useState<{ upcoming: any[]; past: any[] } | null>(null)
  const [bookingsLoading, setBookingsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    api.getMemberBookings(token)
      .then(setBookings)
      .catch(() => setBookings({ upcoming: [], past: [] }))
      .finally(() => setBookingsLoading(false))
  }, [])

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

        {/* Bookings */}
        <div className="club-card p-6 space-y-5">
          <h2 className="font-serif text-oxford-blue font-normal text-lg">My Bookings</h2>

          {bookingsLoading ? (
            <p className="text-sm text-ink-light">Loading…</p>
          ) : (
            <>
              {/* Upcoming */}
              <div>
                <h3 className="label-caps text-ink-light mb-3">Upcoming</h3>
                {bookings?.upcoming.length === 0 ? (
                  <p className="text-sm text-ink-light">No upcoming bookings.</p>
                ) : (
                  <div>
                    {bookings?.upcoming.map(item => <BookingItem key={item.id} item={item} />)}
                  </div>
                )}
              </div>

              {/* Past (last month) */}
              {(bookings?.past.length ?? 0) > 0 && (
                <div className="border-t border-cambridge/10 pt-5">
                  <h3 className="label-caps text-ink-light mb-3">Recent (last month)</h3>
                  <div>
                    {bookings?.past.map(item => <BookingItem key={item.id} item={item} />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Change Password */}
        <div className="club-card p-6 space-y-4">
          <h2 className="font-serif text-oxford-blue font-normal text-lg">Change Password</h2>

          <div>
            <label className="label-caps text-ink-light block mb-1.5">Current Password</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="club-input" placeholder="Enter current password" />
          </div>
          <div>
            <label className="label-caps text-ink-light block mb-1.5">New Password</label>
            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="club-input" placeholder="At least 8 characters" />
          </div>
          <div>
            <label className="label-caps text-ink-light block mb-1.5">Confirm New Password</label>
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="club-input" placeholder="Repeat new password" />
          </div>

          {error && <div className="text-red-700/80 text-sm border-l-2 border-red-400 pl-3 py-1">{error}</div>}
          {success && <div className="border-l-2 border-cambridge/60 text-oxford-blue text-sm pl-3 py-1">{success}</div>}

          <button onClick={handleChangePassword} disabled={loading || !currentPassword || !newPassword || !confirm} className="btn-primary">
            {loading ? 'Saving...' : 'Update Password'}
          </button>
        </div>

        {/* Sign Out */}
        <div className="club-card p-6">
          <h2 className="font-serif text-oxford-blue font-normal text-lg mb-4">Sign Out</h2>
          <button onClick={() => { dispatch(logout()); navigate('/login') }} className="btn-outline-navy w-full">
            Sign Out
          </button>
        </div>

      </div>
    </div>
  )
}
