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

const PAGE_SIZE = 8

function itemTimestamp(item: any): number {
  if (item.type === 'event') {
    if (!item.event_date || item.is_tba) return Number.NEGATIVE_INFINITY
    const t = new Date(`${item.event_date}T00:00:00`).getTime()
    return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t
  }
  const date = item.reservation_date || ''
  const time = item.reservation_time || '00:00:00'
  const t = new Date(`${date}T${time}`).getTime()
  return Number.isNaN(t) ? Number.NEGATIVE_INFINITY : t
}

function sortByDateDesc(a: any, b: any) {
  return itemTimestamp(b) - itemTimestamp(a)
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
  const [diningPage, setDiningPage] = useState(1)
  const [eventPage, setEventPage] = useState(1)

  useEffect(() => {
    const token = localStorage.getItem('authToken')
    if (!token) return
    api.getMemberBookings(token)
      .then(setBookings)
      .catch(() => setBookings({ upcoming: [], past: [] }))
      .finally(() => setBookingsLoading(false))
  }, [])

  useEffect(() => {
    setDiningPage(1)
    setEventPage(1)
  }, [bookings])

  if (!member) {
    navigate('/login')
    return null
  }

  const allBookings = [...(bookings?.upcoming ?? []), ...(bookings?.past ?? [])]
  const diningBookings = allBookings.filter((item) => item.type === 'dining').sort(sortByDateDesc)
  const eventBookings = allBookings.filter((item) => item.type === 'event').sort(sortByDateDesc)

  const diningPageCount = Math.max(1, Math.ceil(diningBookings.length / PAGE_SIZE))
  const eventPageCount = Math.max(1, Math.ceil(eventBookings.length / PAGE_SIZE))

  const diningStart = (diningPage - 1) * PAGE_SIZE
  const eventStart = (eventPage - 1) * PAGE_SIZE

  const diningPageItems = diningBookings.slice(diningStart, diningStart + PAGE_SIZE)
  const eventPageItems = eventBookings.slice(eventStart, eventStart + PAGE_SIZE)

  const canPrevDining = diningPage > 1
  const canNextDining = diningPage < diningPageCount
  const canPrevEvent = eventPage > 1
  const canNextEvent = eventPage < eventPageCount

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

        {/* Dining Bookings */}
        <div className="club-card p-6 space-y-5">
          <h2 className="font-serif text-oxford-blue font-normal text-lg">My Dining Bookings</h2>

          {bookingsLoading ? (
            <p className="text-sm text-ink-light">Loading…</p>
          ) : (
            <>
              {diningBookings.length === 0 ? (
                <p className="text-sm text-ink-light">No dining bookings found.</p>
              ) : (
                <>
                  <div>
                    {diningPageItems.map(item => <BookingItem key={item.id} item={item} />)}
                  </div>
                  {diningPageCount > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-cambridge/10">
                      <button
                        type="button"
                        className="btn-outline-navy px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setDiningPage((p) => Math.max(1, p - 1))}
                        disabled={!canPrevDining}
                      >
                        Previous
                      </button>
                      <p className="text-xs text-ink-light">Page {diningPage} of {diningPageCount}</p>
                      <button
                        type="button"
                        className="btn-outline-navy px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setDiningPage((p) => Math.min(diningPageCount, p + 1))}
                        disabled={!canNextDining}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* Event Bookings */}
        <div className="club-card p-6 space-y-5">
          <h2 className="font-serif text-oxford-blue font-normal text-lg">My Event Bookings</h2>

          {bookingsLoading ? (
            <p className="text-sm text-ink-light">Loading…</p>
          ) : (
            <>
              {eventBookings.length === 0 ? (
                <p className="text-sm text-ink-light">No event bookings found.</p>
              ) : (
                <>
                  <div>
                    {eventPageItems.map(item => <BookingItem key={item.id} item={item} />)}
                  </div>
                  {eventPageCount > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-cambridge/10">
                      <button
                        type="button"
                        className="btn-outline-navy px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setEventPage((p) => Math.max(1, p - 1))}
                        disabled={!canPrevEvent}
                      >
                        Previous
                      </button>
                      <p className="text-xs text-ink-light">Page {eventPage} of {eventPageCount}</p>
                      <button
                        type="button"
                        className="btn-outline-navy px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        onClick={() => setEventPage((p) => Math.min(eventPageCount, p + 1))}
                        disabled={!canNextEvent}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
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
