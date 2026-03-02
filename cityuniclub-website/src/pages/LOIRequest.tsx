import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { api } from '../services/api'
import { RootState } from '../store'

export const LOIRequest: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const auth = useSelector((state: RootState) => state.auth)
  const token = auth.token
  const club = location.state?.club

  const [formData, setFormData] = useState({
    arrival_date: '',
    departure_date: '',
    purpose: 'Business',
    special_requests: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !club) return

    setIsLoading(true)
    setError('')

    try {
      await api.createLoiRequest(token, {
        club_id: club.id,
        arrival_date: formData.arrival_date,
        departure_date: formData.departure_date,
        purpose: formData.purpose,
        special_requests: formData.special_requests || undefined,
      })
      setSuccess(true)
      setTimeout(() => navigate('/reciprocal-clubs'), 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit request')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-oxford-blue flex items-center justify-center p-4">
        <div className="bg-card-white rounded-2xl shadow-2xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif text-oxford-blue font-bold mb-4">Request Submitted!</h2>
          <p className="text-secondary-text">
            Your Letter of Introduction request has been submitted. You will receive confirmation within 3-5 business days.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-oxford-blue pb-20">
      {/* Header */}
      <div className="bg-card-white sticky top-0 z-10 pt-12 pb-4 px-4 shadow">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-oxford-blue">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-oxford-blue flex-1">LOI Request</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Club Info */}
        {club && (
          <div className="bg-card-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cambridge-blue/30 to-oxford-blue/30 rounded-full flex items-center justify-center">
                <span className="text-xl">🌍</span>
              </div>
              <div>
                <h3 className="font-semibold text-oxford-blue">{club.name}</h3>
                <p className="text-sm text-secondary-text">{club.location}, {club.country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dates */}
          <div className="bg-card-white rounded-xl shadow-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-text mb-2">
                Arrival Date
              </label>
              <input
                type="date"
                value={formData.arrival_date}
                onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-text mb-2">
                Departure Date
              </label>
              <input
                type="date"
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Purpose */}
          <div className="bg-card-white rounded-xl shadow-lg p-4">
            <label className="block text-sm font-medium text-secondary-text mb-3">
              Purpose of Visit
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Business', 'Leisure', 'Both'].map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  onClick={() => setFormData({ ...formData, purpose })}
                  className={`py-3 rounded-lg text-sm font-medium transition ${
                    formData.purpose === purpose
                      ? 'bg-oxford-blue text-white'
                      : 'bg-gray-100 text-oxford-blue'
                  }`}
                >
                  {purpose}
                </button>
              ))}
            </div>
          </div>

          {/* Special Requests */}
          <div className="bg-card-white rounded-xl shadow-lg p-4">
            <label className="block text-sm font-medium text-secondary-text mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              value={formData.special_requests}
              onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
              rows={4}
              placeholder="Dietary requirements, seating preferences, etc."
            />
          </div>

          {/* Info */}
          <div className="bg-cambridge-blue/20 rounded-lg p-4">
            <p className="text-sm text-oxford-blue">
              <strong>Important:</strong> Please submit your request at least 7 days before your arrival date.
            </p>
          </div>

          {error && (
            <div className="bg-red-500/20 text-red-300 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-oxford-blue to-oxford-blue/80 text-white py-4 rounded-lg font-semibold disabled:opacity-60"
          >
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </div>
    </div>
  )
}
