import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setRegion, setLoiRequest } from '../slices/uiSlice'
import { reciprocalClubs } from '../data/reciprocalClubs'
import { RootState } from '../store'

interface Club {
  name: string
  location: string
  region: string
  country: string
  note?: string
}

const REGIONS = ['All', 'United Kingdom', 'Ireland', 'Australia', 'Canada', 'USA', 'Europe', 'Asia', 'Africa', 'Americas', 'Oceania', 'Middle East', 'South America']

export const ReciprocalClubs: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { token } = useSelector((state: RootState) => state.auth)
  const { selectedRegion } = useSelector((state: RootState) => state.ui)
  const [searchTerm, setSearchTerm] = useState('')

  const handleRequestLOI = (club: Club) => {
    if (!token) {
      navigate('/login')
      return
    }
    dispatch(setLoiRequest({
      club_id: club.name,
      arrival_date: '',
      departure_date: '',
      purpose: 'Business',
    }))
    navigate('/loi-request')
  }

  const filteredClubs = reciprocalClubs.filter(club => {
    if (selectedRegion !== 'All' && !club.region.includes(selectedRegion) && club.country !== selectedRegion) return false
    if (searchTerm && !club.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !club.location.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getLogoForClub = (club: Club): string => {
    const region = club.region.replace(/\s+/g, '_')
    const location = club.location.replace(/['&]/g, '').replace(/\s+/g, '_')
    const name = club.name.replace(/['&]/g, '').replace(/\s+/g, '_')
    
    const extensions = ['.png', '.jpg', '.svg', '.webp', '.ico', '.jpeg', '.gif']
    for (const ext of extensions) {
      const logoPath = `/assets/club-logos/${region}_${location}_${name}${ext}`
      return logoPath
    }
    return ''
  }

  return (
    <div className="min-h-screen bg-oxford-blue pb-20">
      {/* Header */}
      <div className="bg-card-white sticky top-0 z-10 pt-12 pb-4 px-4 shadow">
        <h1 className="text-xl font-semibold text-oxford-blue">Reciprocal Clubs</h1>
        <p className="text-sm text-secondary-text mt-1">{filteredClubs.length} clubs worldwide</p>
      </div>

      {/* Info Card */}
      <div className="p-4">
        <div className="bg-card-white rounded-xl shadow-lg p-4">
          <h2 className="text-lg font-serif text-oxford-blue font-semibold mb-2">Letter of Introduction</h2>
          <p className="text-secondary-text text-sm">
            When visiting reciprocal clubs, you may need a Letter of Introduction. 
            Please request your LOI at least 7 days before your visit.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search clubs by name or location..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-oxford-blue focus:border-transparent"
          />
          <svg className="w-5 h-5 text-secondary-text absolute left-3 top-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Region Filter */}
      <div className="px-4 mb-4">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {REGIONS.map((region) => (
            <button
              key={region}
              onClick={() => dispatch(setRegion(region))}
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
        {filteredClubs.length === 0 ? (
          <div className="text-center text-white/70 py-12">
            <p className="text-lg">No clubs found</p>
          </div>
        ) : (
          filteredClubs.map((club, index) => {
            const logoPath = getLogoForClub(club)
            return (
              <div key={index} className="bg-card-white rounded-xl shadow-lg p-4 hover:shadow-xl transition">
                <div className="flex items-start space-x-4">
                  {/* Club Logo */}
                  <div className="w-16 h-16 bg-gradient-to-br from-cambridge-blue/30 to-oxford-blue/30 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                    <img 
                      src={logoPath} 
                      alt={club.name}
                      className="w-full h-full object-contain p-1"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none'
                        ;(e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden')
                      }}
                    />
                    <span className="text-xl font-serif text-oxford-blue font-bold hidden">{club.name.charAt(0)}</span>
                  </div>

                  {/* Club Info */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-oxford-blue">{club.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-secondary-text mt-1">
                      <span>📍 {club.location}</span>
                      <span className="text-cambridge-blue">•</span>
                      <span>{club.country}</span>
                    </div>
                    {club.note && (
                      <p className="text-xs text-cambridge-blue italic mt-1">Note: {club.note}</p>
                    )}
                  </div>

                  {/* LOI Button */}
                  <button 
                    onClick={() => handleRequestLOI(club)}
                    className="bg-oxford-blue text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-oxford-blue/90 whitespace-nowrap"
                  >
                    Request LOI
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
