import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export const Dining: React.FC = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    meal_type: 'Lunch',
    guest_count: 2,
    special_requests: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const breakfastTimes = ['09:00', '09:30', '10:00', '10:30', '11:00']
  const lunchTimes = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30']
  const times = formData.meal_type === 'Breakfast' ? breakfastTimes : lunchTimes

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate booking
    await new Promise(resolve => setTimeout(resolve, 1000))
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
    setIsSubmitting(false)
  }

  const menuHighlights = [
    { name: 'Homemade Soup', image: '/assets/food/soup.jpg', category: 'Starter' },
    { name: 'Pan Fried Salmon', image: '/assets/food/salmon.jpg', category: 'Main' },
    { name: 'Sticky Toffee Pudding', image: '/assets/food/cake.jpg', category: 'Dessert' },
  ]

  return (
    <div className="min-h-screen bg-oxford-blue pb-20">
      {/* Header */}
      <div className="bg-oxford-blue sticky top-0 z-10 pt-12 pb-4 px-4">
        <h1 className="text-2xl font-semibold text-white text-center">Dining Reservations</h1>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Reservation confirmed! Check your email.</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4 max-w-4xl mx-auto">
        {/* Menu Highlights */}
        <div className="bg-card-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif text-oxford-blue font-semibold">Today's Highlights</h2>
            <button 
              onClick={() => navigate('/menu')}
              className="text-cambridge-blue text-sm font-semibold hover:underline flex items-center space-x-1"
            >
              <span>View Full Menu</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {menuHighlights.map((item, index) => (
              <div key={index} className="text-center">
                <div className="h-32 bg-gray-200 rounded-lg overflow-hidden mb-2">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x200?text=Food'
                    }}
                  />
                </div>
                <p className="text-xs text-secondary-text mb-1">{item.category}</p>
                <h3 className="text-sm font-semibold text-oxford-blue">{item.name}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* Opening Hours */}
        <div className="bg-card-white rounded-xl shadow-lg p-4 mb-6">
          <h2 className="text-lg font-serif text-oxford-blue font-semibold mb-3">Opening Hours</h2>
          <div className="space-y-2 text-sm text-secondary-text">
            <div className="flex justify-between">
              <span>Breakfast</span>
              <span>8:00 AM - 11:00 AM</span>
            </div>
            <div className="flex justify-between">
              <span>Lunch</span>
              <span>12:00 PM - 2:30 PM</span>
            </div>
          </div>
        </div>

        {/* Booking Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Meal Type */}
          <div className="bg-card-white rounded-xl shadow-lg p-4">
            <label className="block text-sm font-medium text-oxford-blue mb-3">
              Select Meal Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, meal_type: 'Breakfast', time: '' })}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.meal_type === 'Breakfast'
                    ? 'border-oxford-blue bg-oxford-blue text-white'
                    : 'border-gray-300 hover:border-oxford-blue'
                }`}
              >
                <div className="text-2xl mb-1">☀️</div>
                <div className="font-semibold">Breakfast</div>
                <div className="text-sm">8:00 - 11:00</div>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, meal_type: 'Lunch', time: '' })}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.meal_type === 'Lunch'
                    ? 'border-oxford-blue bg-oxford-blue text-white'
                    : 'border-gray-300 hover:border-oxford-blue'
                }`}
              >
                <div className="text-2xl mb-1">🍽️</div>
                <div className="font-semibold">Lunch</div>
                <div className="text-sm">12:00 - 14:30</div>
              </button>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-card-white rounded-xl shadow-lg p-4">
              <label className="block text-sm font-medium text-oxford-blue mb-3">
                Select Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                required
              />
            </div>

            {formData.date && (
              <div className="bg-card-white rounded-xl shadow-lg p-4">
                <label className="block text-sm font-medium text-oxford-blue mb-3">
                  Select Time
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {times.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, time })}
                      className={`py-2 rounded-lg text-xs font-medium transition ${
                        formData.time === time
                          ? 'bg-oxford-blue text-white'
                          : 'bg-gray-100 text-oxford-blue hover:bg-gray-200'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Guest Count */}
          <div className="bg-card-white rounded-xl shadow-lg p-4">
            <label className="block text-sm font-medium text-oxford-blue mb-3">
              Number of Guests
            </label>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, guest_count: Math.max(1, formData.guest_count - 1) })}
                className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-xl font-bold"
              >
                -
              </button>
              <span className="text-2xl font-bold text-oxford-blue w-12 text-center">
                {formData.guest_count}
              </span>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, guest_count: Math.min(20, formData.guest_count + 1) })}
                className="w-10 h-10 rounded-full bg-oxford-blue text-white hover:bg-oxford-blue/90 flex items-center justify-center text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-card-white rounded-xl shadow-lg p-4 space-y-4">
            <h3 className="font-serif text-oxford-blue font-semibold">Your Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-oxford-blue mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                placeholder="John Smith"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-oxford-blue mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                placeholder="john@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-oxford-blue mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                placeholder="+44 7700 900123"
              />
            </div>
          </div>

          {/* Special Requests */}
          <div className="bg-card-white rounded-xl shadow-lg p-4">
            <label className="block text-sm font-medium text-oxford-blue mb-2">
              Special Requests
            </label>
            <textarea
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
              rows={3}
              placeholder="Dietary requirements, table preferences, etc."
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.date || !formData.time}
            className="w-full bg-gradient-to-r from-oxford-blue to-oxford-blue/80 text-white py-4 rounded-lg font-semibold disabled:opacity-60"
          >
            {isSubmitting ? 'Processing...' : 'Confirm Reservation'}
          </button>
        </form>
      </div>
    </div>
  )
}
