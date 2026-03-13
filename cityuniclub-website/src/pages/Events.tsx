import React, { useState } from 'react'

interface Event {
  id: string
  title: string
  date: string
  displayDate: string
  price: string
  priceValue?: number
  eventType: 'lunch' | 'dinner' | 'lunch_dinner' | 'meeting' | 'special'
}

export const Events: React.FC = () => {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [showBooking, setShowBooking] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  // Real events from City University Club
  const events: Event[] = [
    {
      id: '1',
      title: 'St Patricks Day Lunch',
      date: '2026-03-17',
      displayDate: 'Tuesday 17 March',
      price: '£32',
      priceValue: 32,
      eventType: 'lunch'
    },
    {
      id: '2',
      title: 'Moules Frites Lunch',
      date: '2026-03-25',
      displayDate: 'Wednesday 25 March',
      price: '£34',
      priceValue: 34,
      eventType: 'lunch'
    },
    {
      id: '3',
      title: 'Younger Members Dinner',
      date: '2026-03-26',
      displayDate: 'Wednesday 26 March',
      price: '£45',
      priceValue: 45,
      eventType: 'dinner'
    },
    {
      id: '4',
      title: '4 Course French Tasting Menu with Paired Wines',
      date: '2026-04-01',
      displayDate: 'April (TBA)',
      price: '£TBA',
      eventType: 'special'
    },
    {
      id: '5',
      title: 'New Member Candidates Meeting',
      date: '2026-04-01',
      displayDate: 'April (TBA)',
      price: '£TBA',
      eventType: 'meeting'
    },
    {
      id: '6',
      title: 'Sea Food Lunch',
      date: '2026-04-01',
      displayDate: 'April (TBA)',
      price: '£TBA',
      eventType: 'lunch'
    },
    {
      id: '7',
      title: 'Literary Lunch - The Second Curtain by Roy Fuller',
      date: '2026-04-17',
      displayDate: 'Thursday 17 April',
      price: '£46',
      priceValue: 46,
      eventType: 'lunch'
    },
    {
      id: '8',
      title: 'St Georges Day Lunch and Dinner',
      date: '2026-04-23',
      displayDate: 'Wednesday 23 April',
      price: '£48',
      priceValue: 48,
      eventType: 'lunch_dinner'
    },
    {
      id: '9',
      title: 'Younger Members Dinner',
      date: '2026-04-30',
      displayDate: 'Wednesday 30 April',
      price: '£45',
      priceValue: 45,
      eventType: 'dinner'
    },
    {
      id: '10',
      title: 'Steak and Kidney Lunch',
      date: '2026-05-13',
      displayDate: '13/14 May (TBA)',
      price: '£TBA',
      eventType: 'lunch'
    },
    {
      id: '11',
      title: 'Moules Frites',
      date: '2026-05-27',
      displayDate: '27/28 May (TBA)',
      price: '£TBA',
      eventType: 'lunch'
    },
    {
      id: '12',
      title: 'Royal Ascot Tent',
      date: '2026-06-17',
      displayDate: 'Tuesday 17 June',
      price: '£320',
      priceValue: 320,
      eventType: 'special'
    }
  ]

  const handleBookClick = (event: Event) => {
    setSelectedEvent(event)
    setShowBooking(true)
  }

  const handleBookingSuccess = () => {
    setShowBooking(false)
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="min-h-screen bg-oxford-blue pb-20">
      {/* Header */}
      <div className="bg-oxford-blue sticky top-10 z-10 pb-4 pt-6 px-4 border-b border-white/10">
        <h1 className="text-2xl font-semibold text-white text-center">Club Events</h1>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Booking request sent! We'll confirm shortly.</span>
          </div>
        </div>
      )}

      {/* Events List */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <div key={event.id} className="bg-card-white rounded-2xl shadow-lg overflow-hidden">
            {/* Event Type Badge */}
            <div className={`px-4 py-2 ${
              event.eventType === 'lunch' ? 'bg-orange-500' :
              event.eventType === 'dinner' ? 'bg-indigo-600' :
              event.eventType === 'lunch_dinner' ? 'bg-cambridge-blue' :
              event.eventType === 'meeting' ? 'bg-club-gold' :
              'bg-pink-600'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-white text-sm font-medium">
                    {event.eventType === 'lunch' ? '🍽️ LUNCH' :
                     event.eventType === 'dinner' ? '🌙 DINNER' :
                     event.eventType === 'lunch_dinner' ? '☀️ LUNCH & DINNER' :
                     event.eventType === 'meeting' ? '👥 MEETING' :
                     '⭐ SPECIAL'}
                  </span>
                </div>
                {event.displayDate.includes('TBA') && (
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
                <span className="text-sm">{event.displayDate}</span>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-cambridge-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className={`text-lg font-bold ${event.price === '£TBA' ? 'text-secondary-text' : 'text-oxford-blue'}`}>
                    {event.price}
                  </span>
                </div>
              </div>

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
        ))}
        </div>
      </div>

      {/* Booking Modal */}
      {showBooking && selectedEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-oxford-blue text-white p-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-serif font-bold">Book Event</h2>
                <button onClick={() => setShowBooking(false)} className="text-white hover:text-cambridge-blue">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Form */}
            <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); handleBookingSuccess(); }}>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-serif text-oxford-blue font-semibold mb-1">{selectedEvent.title}</h3>
                <p className="text-sm text-secondary-text">{selectedEvent.displayDate}</p>
                {selectedEvent.price !== '£TBA' && (
                  <p className="text-sm text-cambridge-blue font-semibold mt-2">{selectedEvent.price} per person</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-oxford-blue mb-2">Your Name *</label>
                <input type="text" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue" placeholder="John Smith" />
              </div>

              <div>
                <label className="block text-sm font-medium text-oxford-blue mb-2">Email Address *</label>
                <input type="email" required className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-sm font-medium text-oxford-blue mb-2">Phone Number</label>
                <input type="tel" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue" placeholder="+44 7700 900123" />
              </div>

              <div>
                <label className="block text-sm font-medium text-oxford-blue mb-2">Number of Guests</label>
                <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue">
                  <option value="1">1 (Just me)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-oxford-blue mb-2">Special Requests</label>
                <textarea className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue" rows={3} placeholder="Dietary requirements, seating preferences, etc." />
              </div>

              <button type="submit" className="w-full bg-oxford-blue text-white py-4 rounded-lg font-semibold hover:bg-oxford-blue/90 transition">
                Request Booking
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
