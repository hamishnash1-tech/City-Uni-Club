import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { api } from '../services/api'
import { RootState } from '../store'

export const LOIRequest: React.FC = () => {
  const navigate = useNavigate()
  const auth = useSelector((state: RootState) => state.auth)
  const token = auth.token
  const loiRequest = useSelector((state: RootState) => state.ui.loiRequest)

  const [formData, setFormData] = useState({
    arrival_date: '',
    departure_date: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Debug: Log club and token on mount
  React.useEffect(() => {
    console.log('LOI Request - Token:', token ? 'Present' : 'Missing')
    console.log('LOI Request - Club:', loiRequest)
    if (!loiRequest?.club_id) {
      setError('No club selected. Please go back and select a club.')
    }
    if (!token) {
      setError('You must be logged in to submit an LOI request.')
    }
  }, [loiRequest, token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Submit clicked')
    
    if (!token) {
      setError('You must be logged in to submit an LOI request.')
      return
    }
    
    if (!loiRequest?.club_id) {
      setError('No club selected. Please go back and select a club.')
      return
    }

    if (!formData.arrival_date || !formData.departure_date) {
      setError('Please fill in both arrival and departure dates.')
      return
    }

    console.log('Submitting LOI request...')
    setIsLoading(true)
    setError('')

    try {
      // Use club_id from Redux store
      const clubId = loiRequest.club_id
      console.log('Club ID:', clubId)

      await api.createLoiRequest(token, {
        club_id: clubId,
        arrival_date: formData.arrival_date,
        departure_date: formData.departure_date,
        purpose: loiRequest.purpose || 'Business',
        special_requests: undefined,
      })
      console.log('LOI request submitted successfully!')
      setSuccess(true)
      setTimeout(() => navigate('/reciprocal-clubs'), 2000)
    } catch (err: any) {
      console.error('LOI request error:', err)
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
        {loiRequest && (
          <div className="bg-card-white rounded-xl shadow-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-cambridge-blue/30 to-oxford-blue/30 rounded-full flex items-center justify-center">
                <span className="text-xl">🌍</span>
              </div>
              <div>
                <h3 className="font-semibold text-oxford-blue">{loiRequest.club_name || 'Selected Club'}</h3>
                <p className="text-sm text-secondary-text">{loiRequest.club_location}, {loiRequest.club_country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dates */}
          <div className="bg-card-white rounded-xl shadow-lg p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-oxford-blue mb-2">
                Arrival Date *
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
              <label className="block text-sm font-medium text-oxford-blue mb-2">
                Departure Date *
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
            className="w-full bg-gradient-to-r from-oxford-blue via-oxford-blue to-cambridge-blue text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl hover:from-oxford-blue/90 hover:via-oxford-blue/90 hover:to-cambridge-blue/90 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none focus:outline-none focus:ring-4 focus:ring-cambridge-blue/50 active:scale-95"
          >
            <span className="flex items-center justify-center gap-2">
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Submit LOI Request
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  )
}
