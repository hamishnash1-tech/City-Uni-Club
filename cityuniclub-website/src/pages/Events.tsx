import React, { useState, useEffect } from 'react'
import { IconEvents } from '../icons'
import { api, Event as ApiEvent } from '../services/api'

const EVENT_TYPE_LABELS: Record<string, string> = {
  lunch: 'Lunch',
  dinner: 'Dinner',
  lunch_dinner: 'Lunch & Dinner',
  meeting: 'Meeting',
  special: 'Special Event',
}

function formatEventDate(dateStr: string): string {
  // Parse as local time to avoid UTC midnight timezone shift
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatPrice(price: number): string {
  return price % 1 === 0 ? `£${price}` : `£${price.toFixed(2)}`
}

export const Events: React.FC = () => {
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<ApiEvent | null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    api.getEvents()
      .then(setEvents)
      .catch(() => setError('Unable to load events. Please try again later.'))
      .finally(() => setLoading(false))
  }, [])

  const handleBookClick = (event: ApiEvent) => {
    setSelectedEvent(event)
    setShowBooking(true)
  }

  const handleBookingSuccess = () => {
    setShowBooking(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="bg-navy-deep">
      {/* Header */}
      <div className="bg-cambridge/15 pt-7 pb-5 px-4 border-b border-cambridge/20">
        <div className="flex items-center justify-center gap-2 text-ivory">
          <IconEvents />
          <h1 className="font-serif text-2xl font-normal text-ivory">Club Events</h1>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-oxford-blue border border-cambridge/30 text-ivory px-6 py-3 rounded shadow-modal z-50">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-cambridge" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm">Booking request sent. We'll confirm shortly.</span>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading && (
          <div className="text-center text-cambridge-light/60 py-12">Loading events…</div>
        )}
        {error && (
          <div className="text-center text-red-400 py-12">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const displayDate = event.is_tba ? 'Date TBA' : formatEventDate(event.event_date)
              const price = event.price_per_person > 0 ? formatPrice(event.price_per_person) : '£TBA'
              const isTba = event.is_tba || event.price_per_person === 0

              return (
                <div key={event.id} className="club-card border border-cambridge/50 rounded-md overflow-hidden">
                  {/* Event Type Badge */}
                  <div className="bg-oxford-blue border-b border-cambridge/30 px-4 py-2.5">
                    <div className="flex items-center justify-between">
                      <span className="label-caps text-cambridge-light/70">
                        {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                      </span>
                      {isTba && (
                        <span className="label-caps border border-cambridge/25 text-cambridge/60 px-2 py-0.5 rounded-sm text-xs">
                          TBA
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Event Details */}
                  <div className="p-4">
                    <h3 className="font-serif text-oxford-blue font-normal text-base mb-3 leading-snug">
                      {event.title}
                    </h3>

                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-4 h-4 text-cambridge-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-ink-mid">{displayDate}</span>
                    </div>

                    <div className="mb-4">
                      <span className={`font-serif text-xl ${price === '£TBA' ? 'text-ink-light' : 'text-oxford-blue'}`}>
                        <span className="text-cambridge-muted">£</span>{price.replace('£', '')}
                      </span>
                    </div>

                    <div className="border-t border-cambridge/20 pt-3">
                      <button
                        onClick={() => handleBookClick(event)}
                        className="btn-primary"
                      >
                        Book Tickets
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && selectedEvent && (
        <div className="fixed inset-0 bg-navy-deep/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-ivory border border-ivory-border shadow-modal rounded-sm max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-navy-deep border-b border-white/10 px-5 py-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-ivory font-normal text-lg">Book Event</h2>
                <button onClick={() => setShowBooking(false)} className="text-ivory/50 hover:text-cambridge-light transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleBookingSuccess(); }}>
              <div className="border-l-2 border-cambridge/50 bg-ivory-warm p-4">
                <h3 className="font-serif text-oxford-blue font-normal mb-1">{selectedEvent.title}</h3>
                <p className="text-sm text-ink-mid">
                  {selectedEvent.is_tba ? 'Date TBA' : formatEventDate(selectedEvent.event_date)}
                </p>
                {selectedEvent.price_per_person > 0 && (
                  <p className="font-serif text-oxford-blue mt-2">{formatPrice(selectedEvent.price_per_person)} per person</p>
                )}
              </div>

              <div>
                <label className="label-caps text-ink-light block mb-2">Your Name *</label>
                <input type="text" required className="club-input" placeholder="John Smith" />
              </div>

              <div>
                <label className="label-caps text-ink-light block mb-2">Email Address *</label>
                <input type="email" required className="club-input" placeholder="john@example.com" />
              </div>

              <div>
                <label className="label-caps text-ink-light block mb-2">Phone Number</label>
                <input type="tel" className="club-input" placeholder="+44 7700 900123" />
              </div>

              <div>
                <label className="label-caps text-ink-light block mb-2">Number of Guests</label>
                <select className="club-input">
                  <option value="1">1 (Just me)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>

              <div>
                <label className="label-caps text-ink-light block mb-2">Special Requests</label>
                <textarea className="club-input" rows={3} placeholder="Dietary requirements, seating preferences, etc." />
              </div>

              <button type="submit" className="btn-primary">
                Request Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
