import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { api, Event as ApiEvent } from '../services/api'

const EVENT_TYPE_LABELS: Record<string, string> = {
  lunch: 'Lunch',
  dinner: 'Dinner',
  lunch_dinner: 'Lunch & Dinner',
  meeting: 'Meeting',
  special: 'Special Event',
}

function formatEventDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function formatPrice(price: number): string {
  return price % 1 === 0 ? `£${price}` : `£${price.toFixed(2)}`
}

export const EventDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const auth = useSelector((state: RootState) => state.auth)
  const isLoggedIn = auth.isAuthenticated && !!auth.member

  const [event, setEvent] = useState<ApiEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [guestCount, setGuestCount] = useState(1)
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [specialRequests, setSpecialRequests] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [cancelError, setCancelError] = useState<string | null>(null)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [pendingGuestCount, setPendingGuestCount] = useState(1)
  const [updatingGuestCount, setUpdatingGuestCount] = useState(false)
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null)
  const [showManageMenu, setShowManageMenu] = useState(false)
  const [manageOption, setManageOption] = useState<'guest-count' | 'cancel'>('guest-count')

  useEffect(() => {
    if (!slug) return
    api.getEventBySlug(slug, auth.token)
      .then(setEvent)
      .catch(() => setError('Event not found.'))
      .finally(() => setLoading(false))
  }, [slug, auth.token])

  useEffect(() => {
    if (event?.my_booking) {
      setPendingGuestCount(event.my_booking.guest_count)
    }
  }, [event?.my_booking?.id, event?.my_booking?.guest_count])

  const noticeWarning = (event: ApiEvent): string | null => {
    if (!event.my_booking || event.is_tba || !event.event_date) return null
    const eventDate = new Date(event.event_date)
    const hoursUntil = (eventDate.getTime() - Date.now()) / (1000 * 60 * 60)
    const threshold = event.my_booking.guest_count >= 5 ? 48 : 24
    if (hoursUntil < threshold) {
      return `This event is within ${threshold} hours. Cancellation may not be possible — please contact the club if you need assistance.`
    }
    return null
  }

  const handleUpdateGuestCount = async () => {
    if (!event?.my_booking || !auth.token || pendingGuestCount === event.my_booking.guest_count) return
    setUpdatingGuestCount(true)
    setUpdateError(null)
    setUpdateSuccess(null)
    setCancelError(null)
    try {
      await api.updateEventGuestCount(auth.token, event.my_booking.id, pendingGuestCount)
      setEvent(prev => prev ? {
        ...prev,
        my_booking: { ...prev.my_booking!, guest_count: pendingGuestCount, status: 'pending' },
      } : prev)
      setUpdateSuccess('Change requested. Booking status is now pending confirmation.')
    } catch (err: any) {
      setUpdateError(err.message || 'Failed to update booking.')
    } finally {
      setUpdatingGuestCount(false)
    }
  }

  const handleCancel = async () => {
    if (!event?.my_booking || !auth.token) return
    setShowCancelConfirm(false)
    setCancelling(true)
    setCancelError(null)
    setUpdateSuccess(null)
    try {
      await api.cancelEventBooking(auth.token, event.my_booking.id)
      setEvent(prev => prev ? { ...prev, my_booking: { ...prev.my_booking!, status: 'cancelled' } } : prev)
    } catch (err: any) {
      setCancelError(err.message || 'Failed to cancel booking.')
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    try {
      await api.createEventBooking(auth.token ?? null, {
        event_id: event!.id,
        guest_count: guestCount,
        special_requests: specialRequests || undefined,
        guest_name: !isLoggedIn ? guestName : undefined,
        guest_email: !isLoggedIn ? guestEmail : undefined,
        guest_phone: guestPhone || undefined,
      })
      setShowSuccess(true)
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit booking. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-cambridge/30 border-t-cambridge rounded-full animate-spin" />
      </div>
    )
  }

  if (error || !event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-ivory/60">{error ?? 'Event not found.'}</p>
        <Link to="/events" className="label-caps text-cambridge-muted hover:text-cambridge transition">← Back to Events</Link>
      </div>
    )
  }

  const displayDate = event.is_tba ? 'Date TBA' : formatEventDate(event.event_date)
  const price = event.price_per_person > 0 ? formatPrice(event.price_per_person) : null
  const countChanged = !!event.my_booking && pendingGuestCount !== event.my_booking.guest_count

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-cambridge/15 pt-7 pb-6 px-4 border-b border-cambridge/20">
        <div className="max-w-2xl mx-auto">
          <Link to="/events" className="label-caps text-cambridge-muted hover:text-cambridge transition mb-4 inline-block">
            ← All Events
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <span className="label-caps border border-cambridge/40 text-cambridge-muted px-2.5 py-0.5 rounded-sm">
              {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
            </span>
            {event.is_tba && (
              <span className="label-caps border border-cambridge/25 text-cambridge/60 px-2 py-0.5 rounded-sm text-xs">TBA</span>
            )}
          </div>
          <h1 className="font-serif text-2xl font-normal text-ivory">{event.title}</h1>
          <p className="text-ivory/60 text-sm mt-1">{displayDate}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Event info */}
        {(event.description || price || !event.is_tba) && (
          <div className="club-card p-5 space-y-4">
            {event.description && (
              <p className="text-sm text-ink leading-relaxed">{event.description}</p>
            )}
            <div className="flex items-baseline gap-2 border-t border-cambridge/10 pt-4">
              <span className="label-caps text-ink-light">Price per person</span>
              <span className="font-serif text-2xl text-oxford-blue">{price ?? 'TBA'}</span>
            </div>
          </div>
        )}

        {/* Event Assets */}
        {event.assets && event.assets.length > 0 && (
          <div className="space-y-2">
            {event.assets.map(asset => (
              <a
                key={asset.id}
                href={asset.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="club-card p-4 flex items-center gap-4 hover:shadow-card-hover transition group"
              >
                <div className="w-10 h-10 rounded-sm bg-red-50 border border-red-200/60 flex items-center justify-center flex-shrink-0">
                  {asset.mime_type?.startsWith('image/') ? (
                    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-oxford-blue text-base font-normal group-hover:text-cambridge-muted transition">{asset.file_name || asset.type}</p>
                  <p className="label-caps text-ink-light mt-0.5">
                    {asset.mime_type === 'application/pdf' ? 'PDF' : asset.mime_type?.startsWith('image/') ? 'Image' : asset.mime_type?.split('/')[1]?.toUpperCase() ?? 'File'}
                  </p>
                </div>
                <svg className="w-5 h-5 text-ink-light group-hover:text-cambridge transition flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        )}

        {/* Manage booking */}
        {event.my_booking && event.my_booking.status !== 'cancelled' && isLoggedIn && (
          <div className="club-card overflow-hidden">
            <div className="bg-cambridge/15 border-b border-cambridge/20 px-5 py-4 flex items-center justify-between">
              <div>
                <span className="label-caps text-ink-light">Your Booking</span>
                <p className="font-serif text-oxford-blue font-normal mt-0.5">
                  {event.my_booking.guest_count} {event.my_booking.guest_count === 1 ? 'ticket' : 'tickets'} ·{' '}
                  <span className={`${event.my_booking.status === 'confirmed' ? 'text-cambridge-muted' : 'text-amber-600'}`}>
                    {event.my_booking.status === 'confirmed' ? 'Confirmed' : 'Pending confirmation'}
                  </span>
                </p>
              </div>
            </div>
            <div className="p-5">
              {(cancelError || updateError) && (
                <p className="text-red-400 text-sm border-l-2 border-red-400/60 pl-3 mb-4">{cancelError || updateError}</p>
              )}
              {updateSuccess && (
                <p className="text-cambridge-muted text-sm border-l-2 border-cambridge/50 pl-3 mb-4">{updateSuccess}</p>
              )}

              <div className="mt-1">
                <button
                  onClick={() => {
                    if (showManageMenu) {
                      setShowManageMenu(false)
                      setShowCancelConfirm(false)
                    } else {
                      setShowManageMenu(true)
                      setManageOption('guest-count')
                      setShowCancelConfirm(false)
                    }
                  }}
                  disabled={updatingGuestCount || cancelling}
                  className="text-sm font-medium bg-oxford-blue text-ivory px-4 py-2.5 rounded hover:bg-oxford-blue/85 transition disabled:opacity-50"
                >
                  {showManageMenu ? 'Close Options' : 'Modify Booking'}
                </button>
              </div>

              {showManageMenu && (
                <div className="mt-4 space-y-5 rounded-md border border-cambridge/20 bg-ivory-warm/70 p-4 sm:p-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setManageOption('guest-count')
                        setShowCancelConfirm(false)
                      }}
                      disabled={updatingGuestCount || cancelling}
                      className={`w-full text-left text-sm font-medium px-3 py-2.5 rounded border transition ${
                        manageOption === 'guest-count'
                          ? 'bg-oxford-blue text-ivory border-oxford-blue'
                          : 'text-ink border-cambridge/30 hover:border-cambridge/50 hover:text-oxford-blue'
                      }`}
                    >
                      Change Guest Count
                    </button>
                    <button
                      onClick={() => setManageOption('cancel')}
                      disabled={updatingGuestCount || cancelling}
                      className={`w-full text-left text-sm font-medium px-3 py-2.5 rounded border transition ${
                        manageOption === 'cancel'
                          ? 'bg-red-600 text-white border-red-600'
                          : 'text-red-700 border-red-300/60 hover:border-red-400 hover:bg-red-50/60'
                      }`}
                    >
                      Cancel Booking
                    </button>
                  </div>

                  {manageOption === 'guest-count' ? (
                    <div className="space-y-3">
                      <p className="label-caps text-ink-light text-xs">Number of Tickets</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <button
                          onClick={() => setPendingGuestCount(prev => Math.max(1, prev - 1))}
                          className="w-10 h-10 rounded border border-ivory-border hover:border-cambridge/50 flex items-center justify-center text-xl text-ink transition"
                          disabled={updatingGuestCount || cancelling || pendingGuestCount <= 1}
                        >−</button>
                        <span className="font-serif text-2xl text-oxford-blue w-8 text-center">{pendingGuestCount}</span>
                        <button
                          onClick={() => setPendingGuestCount(prev => Math.min(20, prev + 1))}
                          className="w-10 h-10 rounded border border-ivory-border hover:border-cambridge/50 flex items-center justify-center text-xl text-ink transition"
                          disabled={updatingGuestCount || cancelling || pendingGuestCount >= 20}
                        >+</button>
                      </div>
                      {countChanged && (
                        <button
                          onClick={handleUpdateGuestCount}
                          disabled={updatingGuestCount || cancelling}
                          className="px-4 py-2 text-sm bg-oxford-blue text-ivory rounded hover:bg-oxford-blue/80 transition disabled:opacity-50"
                        >
                          {updatingGuestCount ? 'Requesting…' : 'Request Change'}
                        </button>
                      )}
                      {countChanged && (
                        <p className="text-xs text-amber-600/80">Changing ticket count resets your booking to pending for re-confirmation.</p>
                      )}
                    </div>
                  ) : (
                    <div className="pt-1 space-y-3">
                      {noticeWarning(event) && (
                        <p className="text-amber-600/80 text-xs border-l-2 border-amber-500/40 pl-3">
                          {noticeWarning(event)}
                        </p>
                      )}
                      {showCancelConfirm ? (
                        <div className="space-y-3">
                          <p className="text-sm text-ink">Are you sure you want to cancel this booking?</p>
                          <div className="flex gap-3">
                            <button
                              onClick={handleCancel}
                              disabled={cancelling || updatingGuestCount}
                              className="text-sm font-medium bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {cancelling ? 'Cancelling…' : 'Yes, cancel booking'}
                            </button>
                            <button
                              onClick={() => setShowCancelConfirm(false)}
                              className="text-sm text-ink-light border border-cambridge/20 px-4 py-2 rounded hover:bg-cambridge/5 transition"
                            >
                              Keep booking
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowCancelConfirm(true)}
                          disabled={updatingGuestCount}
                          className="text-sm font-medium bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition disabled:opacity-50"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Booking form */}
        {!(event.my_booking && event.my_booking.status !== 'cancelled' && isLoggedIn) && (
          <div className="club-card overflow-hidden">
            <div className="bg-oxford-blue border-b border-cambridge/30 px-5 py-4">
              <h2 className="font-serif text-ivory font-normal text-lg">Book Tickets</h2>
            </div>

            {event.is_tba ? (
              <div className="p-6 text-center text-ink text-sm">
                Bookings will open once the date is confirmed.
              </div>
            ) : showSuccess ? (
              <div className="p-6 flex items-center gap-3 text-ink">
                <svg className="w-5 h-5 text-cambridge flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-sm">Booking request sent. We'll be in touch to confirm shortly.</p>
              </div>
            ) : (
              <form className="p-5 space-y-4" onSubmit={handleSubmit}>

              {/* Member info or guest fields */}
              {isLoggedIn ? (
                <div className="bg-ivory-warm border border-cambridge/20 rounded-sm px-4 py-3">
                  <p className="label-caps text-ink-light mb-1">Booking as</p>
                  <p className="font-serif text-oxford-blue">{auth.member!.full_name}</p>
                  <p className="text-xs text-ink-light mt-0.5">{auth.member!.email}</p>
                </div>
              ) : (
                <>
                  <div className="flex gap-3 rounded border border-cambridge/30 bg-cambridge/10 px-4 py-3">
                    <svg className="w-4 h-4 text-cambridge-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-xs text-ink leading-relaxed space-y-1">
                      <p>You are booking as a guest. Your booking won't be confirmed until reviewed by the Club.</p>
                      <p>If you're a member, <Link to="/login" className="text-cambridge-blue underline">sign in</Link> to book with your membership.</p>
                    </div>
                  </div>
                  <div>
                    <label className="label-caps text-ink-light block mb-2">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                      className="club-input"
                      placeholder="John Smith"
                    />
                  </div>
                  <div>
                    <label className="label-caps text-ink-light block mb-2">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={guestEmail}
                      onChange={e => setGuestEmail(e.target.value)}
                      className="club-input"
                      placeholder="john@example.com"
                    />
                  </div>
                </>
              )}

              {!isLoggedIn && (
                <div>
                  <label className="label-caps text-ink-light block mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={e => setGuestPhone(e.target.value)}
                    className="club-input"
                    placeholder="+44 7700 900123"
                  />
                </div>
              )}

              <div>
                <label className="label-caps text-ink-light block mb-2">Number of Guests</label>
                <select
                  className="club-input"
                  value={guestCount}
                  onChange={e => setGuestCount(Number(e.target.value))}
                >
                  {[1,2,3,4,5,6].map(n => (
                    <option key={n} value={n}>{n === 1 ? '1 (Just me)' : n}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label-caps text-ink-light block mb-2">Special Requests</label>
                <textarea
                  value={specialRequests}
                  onChange={e => setSpecialRequests(e.target.value)}
                  className="club-input"
                  rows={3}
                  placeholder="Dietary requirements, seating preferences, accessibility needs, etc."
                />
                {['lunch', 'dinner', 'lunch_dinner'].includes(event.event_type) && (
                  <div className="flex gap-3 rounded border border-amber-300 bg-amber-50 px-4 py-3 mt-2">
                    <svg className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-amber-800 leading-relaxed">
                      Members or guests with food allergies must <a href="/info#get-in-touch" className="underline font-medium hover:text-amber-900">contact the Club Secretary</a> directly before making a booking.
                    </p>
                  </div>
                )}
              </div>

              {submitError && (
                <p className="text-red-400 text-sm border-l-2 border-red-400/60 pl-3">{submitError}</p>
              )}

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? 'Submitting…' : 'Request Booking'}
              </button>
              </form>
            )}
          </div>
        )}


      </div>
    </div>
  )
}
