import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { IconDining } from '../icons'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { api, type MenuItem as DbMenuItem } from '../services/api'

export const Dining: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const token = auth.token
  const member = auth.member

  const [menuItems, setMenuItems] = useState<DbMenuItem[]>([])
  const [menuLoading, setMenuLoading] = useState(true)

  useEffect(() => {
    api.getMenu().then(items => setMenuItems(items)).finally(() => setMenuLoading(false))
  }, [])

  const breakfastItems = menuItems.filter(i => i.menu === 'breakfast')
  const lunchStarters = menuItems.filter(i => i.menu === 'lunch' && i.category === 'Starters')
  const lunchMains = menuItems.filter(i => i.menu === 'lunch' && i.category === 'Mains')
  const lunchPuddings = menuItems.filter(i => i.menu === 'lunch' && i.category === 'Puddings')
  const canapesItems = menuItems.filter(i => i.menu === 'canapes')

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    meal_type: 'Lunch' as 'Breakfast' | 'Lunch',
    guest_count: 2,
    special_requests: '',

    guest_name: '',
    guest_email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'book' | 'reservations' | 'menu'>('book')
  const [activeMenuTab, setActiveMenuTab] = useState<'breakfast' | 'lunch' | 'canapes'>('breakfast')

  const [reservations, setReservations] = useState<any[]>([])
  const [reservationsLoading, setReservationsLoading] = useState(false)
  const [reservationsError, setReservationsError] = useState('')
  const [cancelConfirm, setCancelConfirm] = useState<string | null>(null)
  const [cancelling, setCancelling] = useState<string | null>(null)
  const [updatingCount, setUpdatingCount] = useState<string | null>(null)
  const [updatingNotes, setUpdatingNotes] = useState<string | null>(null)
  const [localCounts, setLocalCounts] = useState<Record<string, number>>({})
  const [localNotes, setLocalNotes] = useState<Record<string, string>>({})
  const [manageReservationId, setManageReservationId] = useState<string | null>(null)
  const [manageOption, setManageOption] = useState<'guest-count' | 'notes' | 'cancel'>('guest-count')

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yesterdayStr = yesterday.toISOString().split('T')[0]

  const loadReservations = useCallback(async () => {
    if (!token) return
    setReservationsLoading(true)
    setReservationsError('')
    try {
      const data = await api.getMemberBookings(token)
      const dining = [
        ...(data.upcoming || []).filter((b: any) => b.type === 'dining'),
        ...(data.past || []).filter((b: any) => b.type === 'dining' && b.reservation_date >= yesterdayStr),
      ]
      setReservations(dining)
      const counts: Record<string, number> = {}
      const notes: Record<string, string> = {}
      dining.forEach((r: any) => {
        counts[r.id] = r.guest_count
        notes[r.id] = r.special_requests ?? r.table_preference ?? ''
      })
      setLocalCounts(counts)
      setLocalNotes(notes)
    } catch (e: any) {
      setReservationsError(e.message)
    } finally {
      setReservationsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (token) loadReservations()
  }, [token, loadReservations])

  const handleCancelReservation = async (id: string) => {
    if (!token) return
    setCancelling(id)
    try {
      await api.cancelDiningReservation(token, id)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r))
    } catch (e: any) {
      setReservationsError(e.message)
    } finally {
      setCancelling(null)
      setCancelConfirm(null)
      setManageReservationId(prev => prev === id ? null : prev)
    }
  }

  const handleUpdateGuestCount = async (id: string) => {
    if (!token) return
    const count = localCounts[id]
    setUpdatingCount(id)
    try {
      await api.updateDiningGuestCount(token, id, count)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, guest_count: count, status: 'pending' } : r))
    } catch (e: any) {
      setReservationsError(e.message)
      setLocalCounts(prev => ({ ...prev, [id]: reservations.find(r => r.id === id)?.guest_count ?? count }))
    } finally {
      setUpdatingCount(null)
    }
  }

  const handleUpdateNotes = async (id: string) => {
    if (!token) return
    const notes = localNotes[id] ?? ''
    setUpdatingNotes(id)
    try {
      await api.updateDiningNotes(token, id, notes)
      setReservations(prev => prev.map(r => r.id === id ? { ...r, special_requests: notes } : r))
    } catch (e: any) {
      setReservationsError(e.message)
    } finally {
      setUpdatingNotes(null)
    }
  }

  const breakfastTimes = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30']
  const lunchTimes = ['11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00']
  const allTimes = formData.meal_type === 'Breakfast' ? breakfastTimes : lunchTimes
  const breakfastRange = `${breakfastTimes[0]} – ${breakfastTimes[breakfastTimes.length - 1]}`
  const lunchRange = `${lunchTimes[0]} – ${lunchTimes[lunchTimes.length - 1]}`

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.date || !formData.time) {
      setError('Please select a date and time.')
      return
    }

    if (!token && (!formData.guest_name.trim() || !formData.guest_email.trim())) {
      setError('Please enter your name and email.')
      return
    }

    setIsSubmitting(true)
    try {
      await api.createDiningReservation(token || null, {
        reservation_date: formData.date,
        reservation_time: formData.time,
        meal_type: formData.meal_type,
        guest_count: formData.guest_count,
        special_requests: formData.special_requests || undefined,

        guest_name: !token ? formData.guest_name : undefined,
        guest_email: !token ? formData.guest_email : undefined,
      })
      setShowSuccess(true)
      setFormData({ date: '', time: '', meal_type: 'Lunch', guest_count: 2, special_requests: '', guest_name: '', guest_email: '' })
      setTimeout(() => setShowSuccess(false), 4000)
    } catch (e: any) {
      setError(e.message || 'Failed to submit reservation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="">
      {/* Header */}
      <div className="bg-cambridge/15 pt-7 pb-5 px-4 border-b border-cambridge/20">
        <div className="flex items-center justify-center gap-2 mb-4 text-ivory">
          <IconDining />
          <h1 className="font-serif text-2xl font-normal text-ivory">Dining</h1>
        </div>

        <div className="relative flex w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto border border-cambridge/20 rounded-sm p-1">
          {(() => {
            const tabs = [
              { id: 'book', label: 'Book a Table' },
              ...(token ? [{ id: 'reservations', label: 'My Reservations' }] : []),
              { id: 'menu', label: 'Menu' },
            ] as { id: typeof activeTab; label: string }[]
            const activeIndex = tabs.findIndex(t => t.id === activeTab)
            return (
              <>
                <div
                  className="absolute top-1 bottom-1 bg-cambridge/25 rounded-sm transition-all duration-300 ease-out"
                  style={{
                    left: '4px',
                    width: `calc(${100 / tabs.length}% - ${8 / tabs.length}px)`,
                    transform: `translateX(${activeIndex * 100}%)`,
                  }}
                />
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex-1 py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm transition-colors duration-200 rounded-sm ${
                      activeTab === tab.id ? 'text-ivory' : 'text-ivory/50 hover:text-ivory'
                    }`}
                  >
                    <span className="label-caps whitespace-nowrap">
                      {tab.id === 'reservations' ? (
                        <><span className="hidden sm:inline">My </span>Reservations{reservations.length > 0 ? ` (${reservations.length})` : ''}</>
                      ) : tab.label}
                    </span>
                  </button>
                ))}
              </>
            )
          })()}
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-40 left-1/2 transform -translate-x-1/2 bg-oxford-blue border border-cambridge/30 text-ivory px-6 py-3 rounded shadow-modal z-50">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-cambridge" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">Reservation submitted. We'll confirm shortly.</span>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'menu' && (
          <div className="flex justify-center mb-6">
            <div className="relative flex border border-cambridge/20 rounded-sm p-1">
              {(() => {
                const menuTabs = [
                  { id: 'breakfast', label: 'Breakfast' },
                  { id: 'lunch', label: 'Lunch' },
                  { id: 'canapes', label: 'Canapés' },
                ] as const
                const activeIndex = menuTabs.findIndex(t => t.id === activeMenuTab)
                return (
                  <>
                    <div
                      className="absolute top-1 bottom-1 bg-cambridge/25 rounded-sm transition-all duration-300 ease-out"
                      style={{
                        left: '4px',
                        width: `calc(${100 / menuTabs.length}% - ${8 / menuTabs.length}px)`,
                        transform: `translateX(${activeIndex * 100}%)`,
                      }}
                    />
                    {menuTabs.map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveMenuTab(tab.id)}
                        className={`relative py-1.5 px-4 text-sm transition-colors duration-200 rounded-sm ${
                          activeMenuTab === tab.id ? 'text-ivory' : 'text-ivory/50 hover:text-ivory'
                        }`}
                      >
                        <span className="label-caps">{tab.label}</span>
                      </button>
                    ))}
                  </>
                )
              })()}
            </div>
          </div>
        )}

        {activeTab === 'reservations' && token ? (
          <div className="space-y-4 max-w-2xl mx-auto">
            {reservationsError && (
              <div className="text-red-300/80 text-sm border-l-2 border-red-400/60 pl-3 py-1">{reservationsError}</div>
            )}
            {reservationsLoading ? (
              <div className="text-center py-10 text-ivory/50">Loading reservations...</div>
            ) : reservations.length === 0 ? (
              <div className="club-card p-6 text-center text-ink-mid">No dining reservations found.</div>
            ) : (
              reservations.map(r => {
                const isEditable = r.status !== 'cancelled' && r.reservation_date >= yesterdayStr
                const currentCount = localCounts[r.id] ?? r.guest_count
                const countChanged = currentCount !== r.guest_count
                const showManageOptions = manageReservationId === r.id
                return (
                  <div key={r.id} className="club-card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="font-serif text-oxford-blue text-base">
                          {new Date(r.reservation_date + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-sm text-ink-mid mt-0.5">{r.meal_type} · {r.reservation_time}</p>
                        {(r.special_requests || r.table_preference) && <p className="text-xs text-ink-light mt-0.5 italic">{r.special_requests || r.table_preference}</p>}
                      </div>
                      <span className={`label-caps text-xs px-2 py-1 rounded ${
                        r.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                        r.status === 'cancelled' ? 'bg-red-100/60 text-red-600' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    {isEditable && (
                      <div className="mt-4 pt-4 border-t border-cambridge/10">
                        <button
                          onClick={() => {
                            if (showManageOptions) {
                              setManageReservationId(null)
                              setCancelConfirm(null)
                            } else {
                              setManageReservationId(r.id)
                              setManageOption('guest-count')
                              setCancelConfirm(null)
                            }
                          }}
                          disabled={updatingCount === r.id || updatingNotes === r.id || cancelling === r.id}
                          className="text-sm font-medium bg-oxford-blue text-ivory px-4 py-2.5 rounded hover:bg-oxford-blue/85 transition disabled:opacity-50"
                        >
                          {showManageOptions ? 'Close Options' : 'Modify Reservation'}
                        </button>

                        {showManageOptions && (
                          <div className="mt-4 space-y-4 rounded-md border border-cambridge/20 bg-ivory-warm/70 p-4">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => {
                                  setManageOption('guest-count')
                                  setCancelConfirm(null)
                                }}
                                disabled={updatingCount === r.id || updatingNotes === r.id || cancelling === r.id}
                                className={`text-xs transition ${
                                  manageOption === 'guest-count' ? 'text-oxford-blue font-semibold' : 'text-ink-light hover:text-oxford-blue'
                                }`}
                              >
                                Change Guest Count
                              </button>
                              <span className="h-4 w-px bg-cambridge/20" />
                              <button
                                onClick={() => {
                                  setManageOption('notes')
                                  setCancelConfirm(null)
                                }}
                                disabled={updatingCount === r.id || updatingNotes === r.id || cancelling === r.id}
                                className={`text-xs transition ${
                                  manageOption === 'notes' ? 'text-oxford-blue font-semibold' : 'text-ink-light hover:text-oxford-blue'
                                }`}
                              >
                                Update Notes
                              </button>
                              <span className="h-4 w-px bg-cambridge/20" />
                              <button
                                onClick={() => setManageOption('cancel')}
                                disabled={updatingCount === r.id || updatingNotes === r.id || cancelling === r.id}
                                className={`text-xs transition ${
                                  manageOption === 'cancel' ? 'text-red-600 font-semibold' : 'text-ink-light hover:text-red-600'
                                }`}
                              >
                                Cancel Reservation
                              </button>
                            </div>

                            {manageOption === 'notes' ? (
                              <div>
                                <p className="label-caps text-ink-light text-xs mb-2">Notes</p>
                                <input
                                  type="text"
                                  value={localNotes[r.id] ?? ''}
                                  onChange={(e) => setLocalNotes(prev => ({ ...prev, [r.id]: e.target.value }))}
                                  className="club-input w-full mb-3"
                                  placeholder="Dietary requirements, table preference, seating requests, etc."
                                  disabled={updatingNotes === r.id}
                                />
                                <button
                                  onClick={() => handleUpdateNotes(r.id)}
                                  disabled={updatingNotes === r.id}
                                  className="px-3 py-1.5 text-xs bg-oxford-blue text-ivory rounded hover:bg-oxford-blue/80 transition disabled:opacity-50"
                                >
                                  {updatingNotes === r.id ? 'Saving...' : 'Save Notes'}
                                </button>
                              </div>
                            ) : manageOption === 'guest-count' ? (
                              <div>
                                <p className="label-caps text-ink-light text-xs mb-2">Number of Guests</p>
                                <div className="flex items-center gap-3 flex-wrap">
                                  <button
                                    onClick={() => setLocalCounts(prev => ({ ...prev, [r.id]: Math.max(1, (prev[r.id] ?? r.guest_count) - 1) }))}
                                    className="w-8 h-8 rounded border border-ivory-border hover:border-cambridge/50 flex items-center justify-center text-lg text-ink transition"
                                    disabled={updatingCount === r.id || updatingNotes === r.id || cancelling === r.id}
                                  >−</button>
                                  <span className="font-serif text-xl text-oxford-blue w-6 text-center">{currentCount}</span>
                                  <button
                                    onClick={() => setLocalCounts(prev => ({ ...prev, [r.id]: Math.min(20, (prev[r.id] ?? r.guest_count) + 1) }))}
                                    className="w-8 h-8 rounded border border-ivory-border hover:border-cambridge/50 flex items-center justify-center text-lg text-ink transition"
                                    disabled={updatingCount === r.id || updatingNotes === r.id || cancelling === r.id}
                                  >+</button>
                                  {countChanged && (
                                    <button
                                      onClick={() => handleUpdateGuestCount(r.id)}
                                      disabled={updatingCount === r.id || updatingNotes === r.id || cancelling === r.id}
                                      className="ml-2 px-3 py-1.5 text-xs bg-oxford-blue text-ivory rounded hover:bg-oxford-blue/80 transition disabled:opacity-50"
                                    >
                                      {updatingCount === r.id ? 'Requesting...' : 'Request Change'}
                                    </button>
                                  )}
                                </div>
                                {countChanged && (
                                  <p className="text-xs text-amber-600/80 mt-2">Changing guest count will reset your reservation to pending for re-confirmation.</p>
                                )}
                              </div>
                            ) : (
                              <div className="pt-3 border-t border-cambridge/10 space-y-3">
                                {cancelConfirm === r.id ? (
                                  <div className="space-y-3">
                                    <p className="text-sm text-ink">Cancel this reservation?</p>
                                    <div className="flex gap-3">
                                      <button
                                        onClick={() => handleCancelReservation(r.id)}
                                        disabled={cancelling === r.id || updatingCount === r.id}
                                        className="px-3 py-1.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition disabled:opacity-50"
                                      >
                                        {cancelling === r.id ? 'Cancelling...' : 'Yes, Cancel'}
                                      </button>
                                      <button
                                        onClick={() => setCancelConfirm(null)}
                                        className="px-3 py-1.5 text-xs border border-ivory-border text-ink rounded hover:border-cambridge/50 transition"
                                      >Keep</button>
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => setCancelConfirm(r.id)}
                                    disabled={updatingCount === r.id}
                                    className="px-3 py-1.5 text-xs border border-red-300/50 text-red-500 rounded hover:border-red-400 transition disabled:opacity-50"
                                  >Cancel Reservation</button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        ) : activeTab === 'book' ? (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
            {/* Opening Hours */}
            <div className="club-card p-5">
              <h2 className="font-serif text-oxford-blue text-base font-normal mb-3">Opening Hours</h2>
              <div className="space-y-2 text-sm text-ink-mid">
                <div className="flex justify-between">
                  <span>Breakfast</span>
                  <span>{breakfastRange}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lunch</span>
                  <span>{lunchRange}</span>
                </div>
                <div className="pt-1">
                  <span className="label-caps text-ink-light">Tuesday – Friday</span>
                </div>
              </div>
            </div>

            {/* Member info or guest fields */}
            {member ? (
              <div className="club-card p-5">
                <h3 className="label-caps text-ink-light mb-3">Booking for</h3>
                <p className="font-serif text-oxford-blue">{member.full_name}</p>
                <p className="text-xs text-ink-light mt-1">{member.email}</p>
              </div>
            ) : (
              <div className="club-card p-5 space-y-4">
                <h3 className="font-serif text-oxford-blue font-normal">Your Details</h3>
                <div>
                  <label className="label-caps text-ink-light block mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.guest_name}
                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                    className="club-input"
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="label-caps text-ink-light block mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.guest_email}
                    onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                    className="club-input"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <div className="flex gap-3 rounded border border-cambridge/30 bg-cambridge/10 px-4 py-3">
                  <svg className="w-4 h-4 text-cambridge-muted flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs text-ink leading-relaxed space-y-1">
                    <p>You are reserving as a guest. Please await confirmation of your booking.</p>
                    <p>If you're a member, <Link to="/login" className="text-cambridge-blue underline">sign in</Link> to reserve with your membership.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Meal Type */}
            <div className="club-card p-5">
              <label className="label-caps text-ink-light block mb-3">Select Meal</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, meal_type: 'Breakfast', time: '' })}
                  className={`p-4 rounded border-2 transition text-left ${
                    formData.meal_type === 'Breakfast'
                      ? 'border-cambridge-muted bg-cambridge-subtle text-oxford-blue'
                      : 'border-ivory-border hover:border-cambridge/40'
                  }`}
                >
                  <div className="font-serif text-oxford-blue font-normal mb-0.5">Breakfast</div>
                  <div className="label-caps text-ink-light">{breakfastRange}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, meal_type: 'Lunch', time: '' })}
                  className={`p-4 rounded border-2 transition text-left ${
                    formData.meal_type === 'Lunch'
                      ? 'border-cambridge-muted bg-cambridge-subtle text-oxford-blue'
                      : 'border-ivory-border hover:border-cambridge/40'
                  }`}
                >
                  <div className="font-serif text-oxford-blue font-normal mb-0.5">Lunch</div>
                  <div className="label-caps text-ink-light">{lunchRange}</div>
                </button>
              </div>
              <p className="text-xs text-ink-light mt-2">
                To arrange a booking outside of normal hours, please <a href="/info#get-in-touch" className="underline hover:text-oxford-blue">contact the Club Secretary</a>.
              </p>
            </div>

            {/* Date & Guests */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="club-card p-5">
                <label className="label-caps text-ink-light block mb-3">Select Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                  min={new Date(Date.now() - 86400000).toISOString().split('T')[0]}
                  max={new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]}
                  className="club-input"
                  required
                />
              </div>

              <div className="club-card p-5">
                <label className="label-caps text-ink-light block mb-3">Number of Guests</label>
                <div className="flex items-center space-x-5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, guest_count: Math.max(1, formData.guest_count - 1) })}
                    className="w-10 h-10 rounded border border-ivory-border hover:border-cambridge/50 flex items-center justify-center text-xl text-ink transition"
                  >
                    −
                  </button>
                  <span className="font-serif text-2xl text-oxford-blue w-10 text-center">
                    {formData.guest_count}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, guest_count: Math.min(20, formData.guest_count + 1) })}
                    className="w-10 h-10 rounded border border-ivory-border hover:border-cambridge/50 flex items-center justify-center text-xl text-ink transition"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Time */}
            {formData.date && (
              <div className="club-card p-5">
                <label className="label-caps text-ink-light block mb-3">Select Time</label>
                <select
                  value={formData.time}
                  onChange={e => setFormData({ ...formData, time: e.target.value })}
                  className="club-input"
                >
                  <option value="">Choose a time…</option>
                  {allTimes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Notes */}
            <div className="club-card p-5">
              <label className="label-caps text-ink-light block mb-2">Notes</label>
              <input
                type="text"
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                className="club-input"
                placeholder="Dietary requirements, table preference, seating requests, etc."
              />
            </div>

            {error && (
              <div className="text-red-300/80 text-sm border-l-2 border-red-400/60 pl-3 py-1">
                {error}
              </div>
            )}

            <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-800 leading-relaxed">
              Members or guests with food allergies must <a href="/info#get-in-touch" className="underline font-medium hover:text-amber-900">contact the Club Secretary</a> directly before making a booking.
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.date || !formData.time}
              className="btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Request Reservation'}
            </button>
          </form>
        ) : menuLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-cambridge/30 border-t-cambridge rounded-full animate-spin" />
          </div>
        ) : activeMenuTab === 'breakfast' ? (
          <div className="max-w-2xl mx-auto">
            <div className="club-card overflow-hidden">
              <div className="bg-oxford-blue border-b border-cambridge/30 px-6 py-4">
                <p className="label-caps text-cambridge-light/60 mb-1">Morning</p>
                <h2 className="font-serif text-ivory text-xl font-normal">Breakfast Menu</h2>
              </div>
              <div className="px-6 py-4">
                <p className="text-sm text-ink-mid italic mb-5">All breakfasts include Tea, Coffee, Juice and Toast</p>
                <div className="divide-y divide-cambridge/10">
                  {breakfastItems.map((item) => (
                    <div key={item.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-serif text-oxford-blue font-normal">{item.name}</p>
                        {item.price && <span className="font-serif text-oxford-blue flex-shrink-0">{item.price}</span>}
                      </div>
                      {item.description && <p className="text-xs text-ink-mid mt-0.5">{item.description}</p>}
                      {item.image_url && <img src={item.image_url} alt={item.name} className="mt-2 rounded w-full max-w-xs object-cover" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : activeMenuTab === 'lunch' ? (
          <div className="space-y-10">
            {[
              { label: 'First Course', title: 'Starters', items: lunchStarters },
              { label: 'Second Course', title: 'Main Courses', items: lunchMains },
              { label: 'Third Course', title: 'Desserts & Cheese', items: lunchPuddings },
            ].map(({ label, title, items }) => (
              <div key={title} className="club-card overflow-hidden">
                <div className="bg-oxford-blue border-b border-cambridge/30 px-6 py-4">
                  <p className="label-caps text-cambridge-light/60 mb-1">{label}</p>
                  <h2 className="font-serif text-ivory text-xl font-normal">{title}</h2>
                </div>
                <ul className="divide-y divide-cambridge/10 px-6 py-2">
                  {items.map((item) => (
                    <li key={item.id} className="py-3">
                      <div className="flex items-baseline justify-between gap-4">
                        <p className="font-serif text-oxford-blue font-normal">{item.name}</p>
                        {item.price && <span className="font-serif text-oxford-blue flex-shrink-0">{item.price}</span>}
                      </div>
                      {item.description && <p className="text-xs text-ink-mid mt-0.5">{item.description}</p>}
                      {item.image_url && <img src={item.image_url} alt={item.name} className="mt-2 rounded w-full max-w-xs object-cover" />}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="club-card overflow-hidden">
              <div className="bg-oxford-blue border-b border-cambridge/30 px-6 py-4">
                <p className="label-caps text-cambridge-light/60 mb-1">Reception</p>
                <h2 className="font-serif text-ivory text-xl font-normal">Canapés</h2>
              </div>
              <ul className="divide-y divide-cambridge/10 px-6 py-2">
                {canapesItems.map((item) => (
                  <li key={item.id} className="py-3">
                    <p className="font-serif text-oxford-blue font-normal">{item.name}</p>
                    {item.description && <p className="text-xs text-ink-mid mt-0.5">{item.description}</p>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
