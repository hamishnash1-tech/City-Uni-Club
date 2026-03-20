import React, { useState } from 'react'
import { IconDining } from '../icons'
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
  const [activeMenuTab, setActiveMenuTab] = useState<'breakfast' | 'lunch'>('breakfast')

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
    <div className="">
      {/* Header */}
      <div className="bg-cambridge/15 pt-7 pb-5 px-4 border-b border-cambridge/20">
        <div className="flex items-center justify-center gap-2 mb-4 text-ivory">
          <IconDining />
          <h1 className="font-serif text-2xl font-normal text-ivory">Dining</h1>
        </div>

        <div className="relative flex max-w-xs mx-auto border border-cambridge/20 rounded-sm p-1">
          <div
            className="absolute top-1 bottom-1 bg-cambridge/25 rounded-sm transition-all duration-300 ease-out"
            style={{
              left: '4px',
              width: 'calc(50% - 4px)',
              transform: activeTab === 'book' ? 'translateX(0)' : 'translateX(100%)',
            }}
          />
          {([
            { id: 'book', label: 'Book a Table' },
            { id: 'menu', label: 'Menu' },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 py-2 px-2 text-sm transition-colors duration-200 rounded-sm ${
                activeTab === tab.id ? 'text-ivory' : 'text-ivory/50 hover:text-ivory'
              }`}
            >
              <span className="label-caps">{tab.label}</span>
            </button>
          ))}
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
              <div
                className="absolute top-1 bottom-1 bg-cambridge/25 rounded-sm transition-all duration-300 ease-out"
                style={{
                  left: '4px',
                  width: 'calc(50% - 4px)',
                  transform: activeMenuTab === 'breakfast' ? 'translateX(0)' : 'translateX(100%)',
                }}
              />
              {([
                { id: 'breakfast', label: 'Breakfast' },
                { id: 'lunch', label: 'Lunch' },
              ] as const).map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveMenuTab(tab.id)}
                  className={`relative py-1.5 px-6 text-sm transition-colors duration-200 rounded-sm ${
                    activeMenuTab === tab.id ? 'text-ivory' : 'text-ivory/50 hover:text-ivory'
                  }`}
                >
                  <span className="label-caps">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'book' ? (
          <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl mx-auto">
            {/* Opening Hours */}
            <div className="club-card p-5">
              <h2 className="font-serif text-oxford-blue text-base font-normal mb-3">Opening Hours</h2>
              <div className="space-y-2 text-sm text-ink-mid">
                <div className="flex justify-between">
                  <span>Breakfast</span>
                  <span>8:00 – 11:00</span>
                </div>
                <div className="flex justify-between">
                  <span>Lunch</span>
                  <span>12:00 – 14:30</span>
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
                <p className="text-xs text-ink-light">
                  Not a member? Your reservation will be pending until confirmed by the club.
                </p>
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
                  <div className="label-caps text-ink-light">8:00 – 11:00</div>
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
                  <div className="label-caps text-ink-light">12:00 – 14:30</div>
                </button>
              </div>
            </div>

            {/* Date & Guests */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="club-card p-5">
                <label className="label-caps text-ink-light block mb-3">Select Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value, time: '' })}
                  min={new Date().toISOString().split('T')[0]}
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
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {times.map((time) => (
                    <button
                      key={time}
                      type="button"
                      onClick={() => setFormData({ ...formData, time })}
                      className={`py-2 rounded text-xs font-medium transition ${
                        formData.time === time
                          ? 'bg-oxford-blue text-ivory'
                          : 'bg-ivory-cream text-ink hover:bg-cambridge-subtle'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Special Requests */}
            <div className="club-card p-5 space-y-4">
              <div>
                <label className="label-caps text-ink-light block mb-2">Table Preference</label>
                <input
                  type="text"
                  value={formData.table_preference}
                  onChange={(e) => setFormData({ ...formData, table_preference: e.target.value })}
                  className="club-input"
                  placeholder="Window seat, quiet corner, etc."
                />
              </div>
              <div>
                <label className="label-caps text-ink-light block mb-2">Special Requests</label>
                <textarea
                  value={formData.special_requests}
                  onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                  className="club-input"
                  rows={3}
                  placeholder="Dietary requirements, allergies, etc."
                />
              </div>
            </div>

            {error && (
              <div className="text-red-300/80 text-sm border-l-2 border-red-400/60 pl-3 py-1">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !formData.date || !formData.time}
              className="btn-primary"
            >
              {isSubmitting ? 'Submitting...' : 'Request Reservation'}
            </button>
          </form>
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
                  {[
                    { name: 'Full English Breakfast', description: 'Egg, Bacon, Sausages, Tomatoes, Mushrooms, Black Pudding and Hash Browns (Beans optional)', price: '£24.50' },
                    { name: 'Continental Breakfast', description: '', price: '£14.50' },
                    { name: 'Vegetarian Breakfast', description: 'Pre-order required', price: '£18.50' },
                    { name: 'Smoked Salmon & Scrambled Eggs', description: '', price: '£18.50' },
                    { name: 'Bacon or Sausage Sandwich', description: '', price: '£8.50' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-baseline justify-between py-3 gap-4">
                      <div>
                        <p className="font-serif text-oxford-blue font-normal">{item.name}</p>
                        {item.description && <p className="text-xs text-ink-mid mt-0.5">{item.description}</p>}
                      </div>
                      <span className="font-serif text-oxford-blue flex-shrink-0">{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Starters */}
            <div className="club-card overflow-hidden">
              <div className="bg-oxford-blue border-b border-cambridge/30 px-6 py-4">
                <p className="label-caps text-cambridge-light/60 mb-1">First Course</p>
                <h2 className="font-serif text-ivory text-xl font-normal">Starters</h2>
              </div>
              <div className="gold-rule mx-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6 pt-2">
                {starters.map((item, index) => (
                  <div key={index} className="border border-cambridge/20 rounded-sm overflow-hidden hover:shadow-card transition">
                    <div className="h-48 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-oxford-blue font-normal mb-1">{item.name}</h3>
                      <p className="text-sm text-ink-mid italic">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mains */}
            <div className="club-card overflow-hidden">
              <div className="bg-oxford-blue border-b border-cambridge/30 px-6 py-4">
                <p className="label-caps text-cambridge-light/60 mb-1">Second Course</p>
                <h2 className="font-serif text-ivory text-xl font-normal">Main Courses</h2>
              </div>
              <div className="gold-rule mx-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6 pt-2">
                {mains.map((item, index) => (
                  <div key={index} className="border border-cambridge/20 rounded-sm overflow-hidden hover:shadow-card transition">
                    <div className="h-48 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-oxford-blue font-normal mb-1">{item.name}</h3>
                      <p className="text-sm text-ink-mid italic">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Puddings */}
            <div className="club-card overflow-hidden">
              <div className="bg-oxford-blue border-b border-cambridge/30 px-6 py-4">
                <p className="label-caps text-cambridge-light/60 mb-1">Third Course</p>
                <h2 className="font-serif text-ivory text-xl font-normal">Desserts</h2>
              </div>
              <div className="gold-rule mx-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 sm:p-6 pt-2">
                {puddings.map((item, index) => (
                  <div key={index} className="border border-cambridge/20 rounded-sm overflow-hidden hover:shadow-card transition">
                    <div className="h-48 overflow-hidden">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-oxford-blue font-normal mb-1">{item.name}</h3>
                      <p className="text-sm text-ink-mid italic">{item.description}</p>
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
