import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { RootState } from '../store'

export const LOIRequest: React.FC = () => {
  const navigate = useNavigate()
  const { token } = useSelector((state: RootState) => state.auth)
  const { loiRequest } = useSelector((state: RootState) => state.member)

  const [formData, setFormData] = useState({
    arrival_date: '',
    departure_date: '',
    purpose: 'Business' as 'Business' | 'Leisure' | 'Both',
    special_requests: '',
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token || !loiRequest) return

    setIsLoading(true)
    setError('')

    try {
      await api.createLoiRequest(token, {
        club_id: loiRequest.club_id,
        arrival_date: formData.arrival_date,
        departure_date: formData.departure_date,
        purpose: formData.purpose,
        special_requests: formData.special_requests || undefined,
      })
      setSuccess(true)
      setTimeout(() => {
        navigate('/member/reciprocal-clubs')
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit request')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
          <div className="text-4xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-oxford-blue mb-4">Request Submitted!</h2>
          <p className="text-gray-600">
            Your Letter of Introduction request has been submitted. 
            You will receive confirmation within 3-5 business days.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="bg-oxford-blue text-white rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Request Letter of Introduction</h1>
          <p className="text-cambridge-blue">Complete the form below</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Arrival Date
                </label>
                <input
                  type="date"
                  value={formData.arrival_date}
                  onChange={(e) => setFormData({ ...formData, arrival_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departure Date
                </label>
                <input
                  type="date"
                  value={formData.departure_date}
                  onChange={(e) => setFormData({ ...formData, departure_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose of Visit
              </label>
              <div className="flex gap-4">
                {['Business', 'Leisure', 'Both'].map(purpose => (
                  <label key={purpose} className="flex items-center">
                    <input
                      type="radio"
                      name="purpose"
                      value={purpose}
                      checked={formData.purpose === purpose}
                      onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                      className="mr-2"
                    />
                    {purpose}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Special Requests (Optional)
              </label>
              <textarea
                value={formData.special_requests}
                onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue"
                rows={4}
                placeholder="Dietary requirements, seating preferences, etc."
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> Please submit your request at least 7 days before 
                your arrival date. The secretary will prepare your Letter of Introduction 
                within 3-5 business days.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate('/member/reciprocal-clubs')}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-oxford-blue text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 transition disabled:opacity-50"
              >
                {isLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
