import React, { useEffect, useState } from 'react'
import { api, Event } from '../services/api'
import { BookingModal } from '../components/BookingModal'

export const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    api.getEvents().then((allEvents) => {
      // Filter out past events
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const upcomingEvents = allEvents.filter(event => {
        const eventDate = new Date(event.event_date)
        return eventDate >= today
      })
      
      setEvents(upcomingEvents)
    }).finally(() => setIsLoading(false))
  }, [])

  const handleBookClick = (event: Event) => {
    setSelectedEvent(event)
    setShowBooking(true)
  }

  const handleBookingSuccess = () => {
    setShowBooking(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

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

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Booking confirmed! Check your email.</span>
          </div>
        </div>
      )}

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

                {event.price_per_person > 0 && (
                  <div className="mb-4 text-cambridge-blue font-semibold">
                    £{event.price_per_person} per person
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3">
                  <button 
                    onClick={() => handleBookClick(event)}
                    className="w-full bg-oxford-blue text-white py-3 rounded-lg font-semibold hover:bg-oxford-blue/90 transition flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <span>Book Tickets</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Booking Modal */}
      {showBooking && selectedEvent && (
        <BookingModal
          event={selectedEvent}
          onClose={() => setShowBooking(false)}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  )
}
