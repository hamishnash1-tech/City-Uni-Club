import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
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
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
}

function formatPrice(price: number): string {
  return price % 1 === 0 ? `£${price}` : `£${price.toFixed(2)}`
}

export const Events: React.FC = () => {
  const token = useSelector((state: RootState) => state.auth.token)
  const [events, setEvents] = useState<ApiEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getEvents(token)
      .then(setEvents)
      .catch(() => setError('Unable to load events. Please try again later.'))
      .finally(() => setLoading(false))
  }, [token])

  return (
    <div className="">
      {/* Header */}
      <div className="bg-oxford-blue/80 pt-7 pb-5 px-4 border-b border-cambridge/20">
        <div className="flex items-center justify-center gap-2 text-ivory">
          <IconEvents />
          <h1 className="font-serif text-2xl font-normal text-ivory">Club Events</h1>
        </div>
      </div>

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
              const displayDate = event.event_date ? formatEventDate(event.event_date) : 'Date TBA'
              const price = event.price_per_person ? formatPrice(event.price_per_person) : '£TBA'
              const isTba = !event.event_date || !event.price_per_person

              const booking = event.my_booking
              const bookingStatus = booking?.status

              return (
                <Link
                  key={event.id}
                  to={`/events/${event.slug}`}
                  className={`club-card rounded-md overflow-hidden hover:shadow-card transition block ${bookingStatus ? 'border border-cambridge/70 ring-1 ring-cambridge/30' : 'border border-cambridge/50'}`}
                >
                  {/* Event Type Badge */}
                  <div className={`border-b border-cambridge/30 px-4 py-2.5 ${bookingStatus ? 'bg-cambridge/20' : 'bg-oxford-blue'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`label-caps ${bookingStatus ? 'text-oxford-blue' : 'text-cambridge-light/70'}`}>
                        {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                      </span>
                      <div className="flex items-center gap-2">
                        {bookingStatus && (
                          <span className="label-caps bg-cambridge/30 text-oxford-blue border border-cambridge/40 px-2 py-0.5 rounded-sm text-xs">
                            {bookingStatus === 'confirmed' ? '✓ Booked' : bookingStatus === 'pending' ? 'Pending' : bookingStatus}
                          </span>
                        )}
                        {isTba && (
                          <span className="label-caps border border-cambridge/25 text-cambridge/60 px-2 py-0.5 rounded-sm text-xs">
                            TBA
                          </span>
                        )}
                      </div>
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

                    {event.description && (
                      <p className="text-sm text-ink-mid leading-relaxed mb-3 line-clamp-2">{event.description}</p>
                    )}

                    <div className="flex items-center justify-between border-t border-cambridge/20 pt-3">
                      <span className={`font-serif text-xl ${price === '£TBA' ? 'text-ink-light' : 'text-oxford-blue'}`}>
                        <span className="text-cambridge-muted">£</span>{price.replace('£', '')}
                      </span>
                      <span className="label-caps text-cambridge-muted">{bookingStatus ? 'Manage →' : 'View & Book →'}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
