import React, { useState } from 'react'
import { Event } from '../services/api'

interface BookingModalProps {
  event: Event
  onClose: () => void
  onSuccess: () => void
}

export const BookingModal: React.FC<BookingModalProps> = ({ event, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    member_email: '',
    guest_count: 1,
    guest_emails: [''],
    meal_option: event.event_type === 'lunch_dinner' ? 'lunch' : '',
    special_requests: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      // Simulate API call - replace with actual API endpoint
      const response = await fetch('https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/events/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_id: event.id,
          meal_option: formData.meal_option || null,
          guest_count: formData.guest_count,
          guest_emails: formData.guest_emails.filter(email => email.trim() !== ''),
          special_requests: formData.special_requests,
          member_email: formData.member_email,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Booking failed')
      }

      onSuccess()
    } catch (err: any) {
      setError(err.message || 'Failed to complete booking')
      setIsSubmitting(false)
    }
  }

  const addGuestEmail = () => {
    if (formData.guest_emails.length < formData.guest_count) {
      setFormData({ ...formData, guest_emails: [...formData.guest_emails, ''] })
    }
  }

  const updateGuestEmail = (index: number, email: string) => {
    const newEmails = [...formData.guest_emails]
    newEmails[index] = email
    setFormData({ ...formData, guest_emails: newEmails })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-oxford-blue text-white p-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-serif font-bold">Book Tickets</h2>
            <button onClick={onClose} className="text-white hover:text-cambridge-blue">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Event Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-serif text-oxford-blue font-semibold mb-1">{event.title}</h3>
            <p className="text-sm text-secondary-text">
              {new Date(event.event_date).toLocaleDateString('en-GB', { 
                weekday: 'long', 
                day: 'numeric', 
                month: 'long' 
              })}
            </p>
            {event.price_per_person > 0 && (
              <p className="text-sm text-cambridge-blue font-semibold mt-2">
                £{event.price_per_person} per person
              </p>
            )}
          </div>

          {/* Member Email */}
          <div>
            <label className="block text-sm font-medium text-oxford-blue mb-2">
              Your Email Address *
            </label>
            <input
              type="email"
              value={formData.member_email}
              onChange={(e) => setFormData({ ...formData, member_email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
              placeholder="your.email@example.com"
              required
            />
          </div>

          {/* Meal Option */}
          {event.event_type === 'lunch_dinner' && (
            <div>
              <label className="block text-sm font-medium text-oxford-blue mb-2">
                Select Sitting *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, meal_option: 'lunch' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.meal_option === 'lunch'
                      ? 'border-oxford-blue bg-oxford-blue text-white'
                      : 'border-gray-300 hover:border-oxford-blue'
                  }`}
                >
                  <div className="text-2xl mb-1">☀️</div>
                  <div className="font-semibold">Lunch</div>
                  <div className="text-sm">12:30 PM</div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, meal_option: 'dinner' })}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.meal_option === 'dinner'
                      ? 'border-oxford-blue bg-oxford-blue text-white'
                      : 'border-gray-300 hover:border-oxford-blue'
                  }`}
                >
                  <div className="text-2xl mb-1">🌙</div>
                  <div className="font-semibold">Dinner</div>
                  <div className="text-sm">7:00 PM</div>
                </button>
              </div>
            </div>
          )}

          {/* Guest Count */}
          <div>
            <label className="block text-sm font-medium text-oxford-blue mb-2">
              Number of Guests (excluding yourself)
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  guest_count: Math.max(0, formData.guest_count - 1),
                  guest_emails: formData.guest_emails.slice(0, -1)
                })}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl font-bold"
              >
                -
              </button>
              <span className="text-2xl font-bold text-oxford-blue w-12 text-center">
                {formData.guest_count}
              </span>
              <button
                type="button"
                onClick={() => setFormData({ 
                  ...formData, 
                  guest_count: Math.min(10, formData.guest_count + 1)
                })}
                className="w-10 h-10 rounded-full bg-oxford-blue text-white hover:bg-oxford-blue/90 flex items-center justify-center text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Guest Emails */}
          {formData.guest_count > 0 && (
            <div>
              <label className="block text-sm font-medium text-oxford-blue mb-2">
                Guest Email Addresses
              </label>
              <div className="space-y-2">
                {Array.from({ length: formData.guest_count }).map((_, index) => (
                  <input
                    key={index}
                    type="email"
                    value={formData.guest_emails[index] || ''}
                    onChange={(e) => updateGuestEmail(index, e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                    placeholder={`Guest ${index + 1} email (optional)`}
                  />
                ))}
              </div>
              <p className="text-xs text-secondary-text mt-2">
                Optional - add guest emails for confirmation
              </p>
            </div>
          )}

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-oxford-blue mb-2">
              Special Requests
            </label>
            <textarea
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
              rows={3}
              placeholder="Dietary requirements, seating preferences, etc."
            />
          </div>

          {/* Price Summary */}
          {event.price_per_person > 0 && (
            <div className="bg-cambridge-blue/20 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-oxford-blue font-medium">Total Price</span>
                <span className="text-2xl font-bold text-oxford-blue">
                  £{event.price_per_person * (1 + formData.guest_count)}
                </span>
              </div>
              <p className="text-xs text-secondary-text mt-1">
                {1 + formData.guest_count} ticket(s) × £{event.price_per_person}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || (event.event_type === 'lunch_dinner' && !formData.meal_option)}
            className="w-full bg-gradient-to-r from-oxford-blue to-oxford-blue/80 text-white py-4 rounded-lg font-semibold disabled:opacity-60"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  )
}
