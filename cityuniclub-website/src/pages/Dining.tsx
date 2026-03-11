import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { api } from '../services/api'

interface MenuItem {
  name: string
  description: string
  image: string
  category: string
}

export const Dining: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const token = auth.token
  const member = auth.member

  const [formData, setFormData] = useState({
    date: '',
    time: '',
    meal_type: 'Lunch' as 'Breakfast' | 'Lunch',
    guest_count: 2,
    table_preference: '',
    special_requests: '',
    guest_name: '',
    guest_email: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'book' | 'menu'>('book')

  const breakfastTimes = ['09:00', '09:30', '10:00', '10:30', '11:00']
  const lunchTimes = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30']
  const times = formData.meal_type === 'Breakfast' ? breakfastTimes : lunchTimes

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
        table_preference: formData.table_preference || undefined,
        special_requests: formData.special_requests || undefined,
        guest_name: !token ? formData.guest_name : undefined,
        guest_email: !token ? formData.guest_email : undefined,
      })
      setShowSuccess(true)
      setFormData({ date: '', time: '', meal_type: 'Lunch', guest_count: 2, table_preference: '', special_requests: '', guest_name: '', guest_email: '' })
      setTimeout(() => setShowSuccess(false), 4000)
    } catch (e: any) {
      setError(e.message || 'Failed to submit reservation. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const menuItems: MenuItem[] = [
    { name: 'Homemade Soup of the Day', description: 'Served with crusty bread', image: '/assets/food/Starters/cuc-soup.avif', category: 'Starters' },
    { name: 'Chilli Garlic Pan Fried Tiger Prawns & Chorizo', description: 'With crispy bread', image: '/assets/food/Starters/cuc-prawns.avif', category: 'Starters' },
    { name: 'Aged Cheddar Cheese & Caramelised Red Onion Tart', description: 'With rocket and tomato salad', image: '/assets/food/Starters/cuc-cheese.avif', category: 'Starters' },
    { name: 'Devilled Kidneys', description: 'On toast', image: '/assets/food/Starters/cuc-kidneys.avif', category: 'Starters' },
    { name: 'Crispy Ham Hock Croquettes', description: 'With mustard mayo', image: '/assets/food/Starters/cuc-ham.avif', category: 'Starters' },
    { name: 'Smoked Salmon Plate', description: 'With brown bread and butter', image: '/assets/food/Starters/cuc-salmon.avif', category: 'Starters' },
    { name: 'Roast Rump of Lamb', description: 'With seasonal vegetables and gravy', image: '/assets/food/Mains/cuc-lamb.avif', category: 'Mains' },
    { name: 'Pan Fried Delice of Salmon', description: 'With samphire and new potatoes', image: '/assets/food/Mains/cuc-delice.avif', category: 'Mains' },
    { name: 'Confit Belly of English Pork', description: 'With apple sauce and mash', image: '/assets/food/Mains/cuc-pork.avif', category: 'Mains' },
    { name: 'Oven Roasted Free Range Chicken', description: 'With seasonal vegetables', image: '/assets/food/Mains/cuc-chicken.avif', category: 'Mains' },
    { name: 'Homemade Truffle Mushroom Tortellinis', description: 'With parmesan cream', image: '/assets/food/Mains/cuc-tortellini.avif', category: 'Mains' },
    { name: 'Whole Dover Sole', description: 'With butter and new potatoes', image: '/assets/food/Mains/cuc-sole.avif', category: 'Mains' },
    { name: 'Apricot and Pistachio Tart', description: 'With crème fraîche', image: '/assets/food/Pudding/cuc-tart.avif', category: 'Puddings' },
    { name: 'Selection of Cheeses', description: 'With crackers and grapes', image: '/assets/food/Pudding/cuc-cheeses.avif', category: 'Puddings' },
    { name: 'Ice Creams', description: 'Vanilla, chocolate or strawberry', image: '/assets/food/Pudding/cuc-ice-cream.avif', category: 'Puddings' },
  ]

  const starters = menuItems.filter(item => item.category === 'Starters')
  const mains = menuItems.filter(item => item.category === 'Mains')
  const puddings = menuItems.filter(item => item.category === 'Puddings')

  return (
    <div className="min-h-screen bg-oxford-blue pb-20">
      {/* Header */}
      <div className="bg-oxford-blue sticky top-0 z-20 pt-12 pb-4 px-4 border-b border-white/10">
        <h1 className="text-2xl font-semibold text-white text-center">Dining</h1>

        <div className="flex mt-4 bg-white/10 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('book')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'book' ? 'bg-cambridge-blue text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            📅 Book a Table
          </button>
          <button
            onClick={() => setActiveTab('menu')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition ${
              activeTab === 'menu' ? 'bg-cambridge-blue text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            📖 View Menu
          </button>
        </div>
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="fixed top-40 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Reservation submitted! We'll confirm shortly.</span>
          </div>
        </div>
      )}

      <div className="p-4 max-w-4xl mx-auto">
        {activeTab === 'book' ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Opening Hours */}
            <div className="bg-card-white rounded-xl shadow-lg p-4">
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
                <div className="pt-1 text-xs text-gray-400">Open Tuesday – Friday</div>
              </div>
            </div>

            {/* Member info or guest fields */}
            {member ? (
              <div className="bg-card-white rounded-xl shadow-lg p-4">
                <h3 className="font-serif text-oxford-blue font-semibold mb-2">Booking for</h3>
                <p className="text-sm text-oxford-blue font-medium">{member.full_name}</p>
                <p className="text-xs text-secondary-text">{member.email}</p>
              </div>
            ) : (
              <div className="bg-card-white rounded-xl shadow-lg p-4 space-y-4">
                <h3 className="font-serif text-oxford-blue font-semibold">Your Details</h3>
                <div>
                  <label className="block text-sm font-medium text-oxford-blue mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.guest_name}
                    onChange={(e) => setFormData({ ...formData, guest_name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-oxford-blue mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={formData.guest_email}
                    onChange={(e) => setFormData({ ...formData, guest_email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                    placeholder="john@example.com"
                    required
                  />
                </div>
                <p className="text-xs text-secondary-text">
                  Not a member? Your reservation will be pending until confirmed by the club.
                </p>
              </div>
            )}

            {/* Meal Type */}
            <div className="bg-card-white rounded-xl shadow-lg p-4">
              <label className="block text-sm font-medium text-oxford-blue mb-3">Select Meal Type</label>
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
                <label className="block text-sm font-medium text-oxford-blue mb-3">Select Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                  required
                />
              </div>

              {formData.date && (
                <div className="bg-card-white rounded-xl shadow-lg p-4">
                  <label className="block text-sm font-medium text-oxford-blue mb-3">Select Time</label>
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
              <label className="block text-sm font-medium text-oxford-blue mb-3">Number of Guests</label>
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

            {/* Special Requests */}
            <div className="bg-card-white rounded-xl shadow-lg p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-oxford-blue mb-2">Table Preference</label>
                <input
                  type="text"
                  value={formData.table_preference}
                  onChange={(e) => setFormData({ ...formData, table_preference: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                  placeholder="Window seat, quiet corner, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-oxford-blue mb-2">Special Requests</label>
                <textarea
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                  rows={3}
                  placeholder="Dietary requirements, allergies, etc."
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !formData.date || !formData.time}
              className="w-full bg-gradient-to-r from-oxford-blue to-oxford-blue/80 text-white py-4 rounded-lg font-semibold disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Request Reservation'}
            </button>
          </form>
        ) : (
          <div className="space-y-8">
            {/* Starters */}
            <div className="bg-card-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-green-600 text-white px-6 py-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🥗</span>
                  <h2 className="text-xl font-serif font-bold">Starters</h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {starters.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-serif text-oxford-blue font-semibold mb-2">{item.name}</h3>
                      <p className="text-sm text-secondary-text italic">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mains */}
            <div className="bg-card-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-red-600 text-white px-6 py-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🍖</span>
                  <h2 className="text-xl font-serif font-bold">Main Courses</h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {mains.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-serif text-oxford-blue font-semibold mb-2">{item.name}</h3>
                      <p className="text-sm text-secondary-text italic">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Puddings */}
            <div className="bg-card-white rounded-2xl shadow-lg overflow-hidden">
              <div className="bg-pink-600 text-white px-6 py-4">
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">🍰</span>
                  <h2 className="text-xl font-serif font-bold">Desserts</h2>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-6 p-6">
                {puddings.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition">
                    <div className="h-48 bg-gray-200 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-serif text-oxford-blue font-semibold mb-2">{item.name}</h3>
                      <p className="text-sm text-secondary-text italic">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
