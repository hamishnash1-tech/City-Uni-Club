import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { loadClubsStart, loadClubsSuccess, loadClubsFailure, setRegion, setLoiRequest } from '../slices/memberSlice'
import { api } from '../services/api'
import { RootState, AppDispatch } from '../store'

const REGIONS = ['All', 'United Kingdom', 'Europe', 'Asia', 'Americas', 'Africa', 'Oceania']

export const ReciprocalClubs: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()
  const { token } = useSelector((state: RootState) => state.auth)
  const { clubs, selectedRegion, isLoading } = useSelector((state: RootState) => state.member)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }

    const fetchClubs = async () => {
      dispatch(loadClubsStart())
      try {
        const data = await api.getReciprocalClubs(token, selectedRegion)
        dispatch(loadClubsSuccess(data))
      } catch (err: any) {
        dispatch(loadClubsFailure(err.message))
      }
    }

    fetchClubs()
  }, [token, selectedRegion, dispatch, navigate])

  const handleRequestLOI = (club: any) => {
    dispatch(setLoiRequest({
      club_id: club.id,
      arrival_date: '',
      departure_date: '',
      purpose: 'Business',
    }))
    navigate('/member/loi-request')
  }

  const filteredClubs = selectedRegion === 'All' 
    ? clubs 
    : clubs.filter(club => club.region === selectedRegion)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="bg-oxford-blue text-white rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-serif font-bold mb-2">Reciprocal Clubs</h1>
          <p className="text-cambridge-blue">
            Access over 450 reciprocal clubs worldwide
          </p>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold text-oxford-blue mb-4">Letter of Introduction</h2>
          <p className="text-gray-700 mb-4">
            When visiting reciprocal clubs, you may need a Letter of Introduction. 
            Please request your LOI at least 7 days before your visit.
          </p>
        </div>

        {/* Region Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {REGIONS.map(region => (
              <button
                key={region}
                onClick={() => dispatch(setRegion(region))}
                className={`px-4 py-2 rounded-lg transition ${
                  selectedRegion === region
                    ? 'bg-oxford-blue text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        {/* Clubs List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-oxford-blue mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading clubs...</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClubs.map(club => (
              <div key={club.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
                <div className="flex items-start mb-4">
                  <div className="text-3xl mr-3">🌍</div>
                  <div>
                    <h3 className="font-bold text-oxford-blue">{club.name}</h3>
                    <p className="text-sm text-gray-600">{club.location}, {club.country}</p>
                  </div>
                </div>
                {club.note && (
                  <p className="text-sm text-cambridge-blue mb-4 italic">{club.note}</p>
                )}
                <button
                  onClick={() => handleRequestLOI(club)}
                  className="w-full bg-oxford-blue text-white py-2 rounded-lg hover:bg-opacity-90 transition"
                >
                  Request LOI
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
