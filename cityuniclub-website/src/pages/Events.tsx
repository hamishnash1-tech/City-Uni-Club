import React, { useEffect, useState } from 'react'
import { api, Event } from '../services/api'

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    api.getEvents().then(setEvents).finally(() => setIsLoading(false))
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-oxford-blue flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cambridge-blue mx-auto mb-4"></div>
          <p>Loading events...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-oxford-blue pb-20">
      {/* Header */}
      <div className="bg-oxford-blue sticky top-0 z-10 pt-12 pb-4 px-4">
        <h1 className="text-2xl font-semibold text-white text-center">Club Events</h1>
      </div>

      {/* Events List */}
      <div className="p-4 space-y-4">
        {events.length === 0 ? (
          <div className="text-center text-white/70 py-12">
            <p className="text-lg">No upcoming events</p>
          </div>
        ) : (
          events.map((event) => (
            <div key={event.id} className="bg-card-white rounded-2xl shadow-lg overflow-hidden">
              {/* Event Type Badge */}
              <div className={`px-4 py-2 ${
                event.event_type === 'lunch' ? 'bg-orange-500' :
                event.event_type === 'dinner' ? 'bg-indigo-600' :
                event.event_type === 'lunch_dinner' ? 'bg-cambridge-blue' :
                'bg-club-gold'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm font-medium">
                      {event.event_type === 'lunch' ? '🍽️ LUNCH' :
                       event.event_type === 'dinner' ? '🌙 DINNER' :
                       event.event_type === 'lunch_dinner' ? '☀️ LUNCH & DINNER' :
                       '⭐ SPECIAL'}
                    </span>
                  </div>
                  {event.is_tba && (
                    <span className="bg-white/30 text-white text-xs px-2 py-1 rounded">TBA</span>
                  )}
                </div>
              </div>

              {/* Event Details */}
              <div className="p-4">
                <h3 className="text-lg font-serif text-oxford-blue font-semibold mb-3">
                  {event.title}
                </h3>
                
                <div className="flex items-center space-x-2 text-secondary-text mb-4">
                  <svg className="w-4 h-4 text-cambridge-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm">{formatDate(event.event_date)}</span>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <button className="w-full bg-oxford-blue text-white py-3 rounded-lg font-semibold hover:bg-oxford-blue/90 transition">
                    Book Tickets
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
