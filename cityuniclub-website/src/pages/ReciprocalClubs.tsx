import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { api, ReciprocalClub } from '../services/api'
import { RootState } from '../store'
import { setSelectedRegion } from '../slices/uiSlice'

const REGIONS = ['All', 'United Kingdom', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania']

export const ReciprocalClubs: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const auth = useSelector((state: RootState) => state.auth)
  const ui = useSelector((state: RootState) => state.ui)
  const token = auth.token
  const selectedRegion = ui.selectedRegion
  const [clubs, setClubs] = useState<ReciprocalClub[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    api.getReciprocalClubs(token, selectedRegion)
      .then(setClubs)
      .finally(() => setIsLoading(false))
  }, [token, selectedRegion, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-oxford-blue flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cambridge-blue mx-auto mb-4"></div>
          <p>Loading clubs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-oxford-blue pb-20">
      {/* Header */}
      <div className="bg-card-white sticky top-0 z-10 pt-12 pb-4 px-4 shadow">
        <h1 className="text-xl font-semibold text-oxford-blue">Reciprocal Clubs</h1>
      </div>

      {/* Info Card */}
      <div className="p-4">
        <div className="bg-card-white rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-serif text-oxford-blue font-semibold mb-2">
            Letter of Introduction
          </h2>
          <p className="text-secondary-text text-sm">
            When visiting reciprocal clubs, you may need a Letter of Introduction. 
            Please request your LOI at least 7 days before your visit.
          </p>
        </div>
      </div>

      {/* Region Filter */}
      <div className="px-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => dispatch(setSelectedRegion(region))}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition ${
                selectedRegion === region
                  ? 'bg-oxford-blue text-white'
                  : 'bg-card-white text-oxford-blue'
              }`}
            >
              {region}
            </button>
          ))}
        </div>
      </div>

      {/* Clubs List */}
      <div className="px-4 space-y-3">
        {clubs.map((club) => (
          <div key={club.id} className="bg-card-white rounded-xl shadow-lg p-4">
            <div className="flex items-start space-x-4">
              {/* Globe Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-cambridge-blue/30 to-oxford-blue/30 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-xl">🌍</span>
              </div>

              {/* Club Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-oxford-blue">{club.name}</h3>
                <div className="flex items-center space-x-2 text-sm text-secondary-text mt-1">
                  <span>📍 {club.location}</span>
                  {club.note && (
                    <>
                      <span className="text-cambridge-blue">•</span>
                      <span className="text-cambridge-blue italic">{club.note}</span>
                    </>
                  )}
                </div>
                <p className="text-xs text-secondary-text mt-1">{club.country}</p>
              </div>

              {/* Chevron */}
              <svg className="w-5 h-5 text-secondary-text flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {/* LOI Button */}
            <button 
              onClick={() => navigate('/loi-request', { state: { club } })}
              className="w-full mt-3 bg-oxford-blue text-white py-2 rounded-lg text-sm font-semibold"
            >
              Request Letter of Introduction
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
