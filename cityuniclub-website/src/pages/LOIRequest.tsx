import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
      const clubId = loiRequest.club_id
      console.log('Club ID:', clubId)

      await api.createLoiRequest(token, {
        club_id: clubId,
        arrival_date: formData.arrival_date,
        departure_date: formData.departure_date,
        purpose: loiRequest.purpose || 'Business',
        special_requests: undefined,
      })
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="club-card rounded-sm p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 border-2 border-cambridge rounded-full flex items-center justify-center mx-auto mb-5">
            <svg className="w-7 h-7 text-cambridge" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="font-serif text-oxford-blue font-normal text-2xl mb-3">Request Submitted</h2>
          <p className="text-ink-mid text-sm leading-relaxed">
            Your Letter of Introduction request has been submitted and is awaiting approval. The Club Secretary will send the LoI on your behalf once approved.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="bg-navy-deep sticky top-0 z-10 pt-12 pb-4 px-4 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <button onClick={() => navigate(-1)} className="text-ivory/60 hover:text-ivory transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="font-serif text-xl font-normal text-ivory flex-1">LOI Request</h1>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Club Info */}
        {loiRequest && (
          <div className="club-card p-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 border border-cambridge/30 bg-ivory-warm rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-cambridge-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 0c-2.5 0-4 4.5-4 10s1.5 10 4 10 4-4.5 4-10S14.5 2 12 2zM2 12h20" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-oxford-blue text-sm">{loiRequest.club_name || 'Selected Club'}</h3>
                <p className="text-xs text-ink-mid mt-0.5">{loiRequest.club_location}, {loiRequest.club_country}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dates */}
          <div className="club-card p-5 space-y-4">
            <div>
              <label className="label-caps text-ink-light block mb-2">Arrival Date *</label>
              <input
                type="date"
                value={formData.arrival_date}
                onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                className="club-input"
                required
              />
            </div>

            <div>
              <label className="label-caps text-ink-light block mb-2">Departure Date *</label>
              <input
                type="date"
                value={formData.departure_date}
                onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                className="club-input"
                required
              />
            </div>
          </div>

          {/* Notice */}
          <div className="border-l-2 border-cambridge/50 bg-cambridge-subtle/30 p-4">
            <p className="text-sm text-ivory/90">
              <strong>Important:</strong> Please submit your request at least 7 days before your arrival date.
            </p>
          </div>

          {error && (
            <div className="bg-red-900/15 text-red-200/80 p-3 text-sm border-l-2 border-red-400/40 pl-4">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary"
          >
            {isLoading ? (
              'Submitting...'
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Submit LOI Request
              </span>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
