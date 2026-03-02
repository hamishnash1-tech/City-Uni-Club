import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

export const Home: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const member = auth.member
  const isAuthenticated = auth.isAuthenticated

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-oxford-blue flex items-center justify-center p-4">
        <div className="text-center text-white max-w-md">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <span className="text-5xl font-serif text-white font-bold">CUC</span>
          </div>
          <h1 className="text-4xl font-light mb-4">Welcome to City University Club</h1>
          <p className="text-cambridge-blue mb-8">A private members club in the heart of London</p>
          <a 
            href="/login" 
            className="inline-block bg-cambridge-blue text-oxford-blue px-8 py-3 rounded-lg font-semibold hover:bg-white transition"
          >
            Member Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1920')" }}
      >
        <div className="absolute inset-0 bg-oxford-blue/70"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo */}
        <div className="w-20 h-20 mb-4 bg-white/20 rounded-full flex items-center justify-center">
          <span className="text-2xl font-serif text-white font-bold">CUC</span>
        </div>

        {/* Welcome */}
        <p className="text-cambridge-blue text-lg mb-2">Welcome</p>
        <h1 className="text-4xl font-light text-white mb-8">{member?.first_name || 'Member'}</h1>

        {/* Membership Card */}
        <div className="w-full max-w-md bg-card-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="w-14 h-16 bg-oxford-blue/10 rounded flex items-center justify-center">
                <span className="text-2xl font-serif text-oxford-blue font-bold">CUC</span>
              </div>
              <div>
                <h2 className="text-lg font-serif text-oxford-blue">CITY UNIVERSITY CLUB</h2>
                <p className="text-xs text-address-gray">42 CRUTCHED FRIARS, EC3N 2AP</p>
              </div>
            </div>
          </div>

          {/* Member Name */}
          <div className="py-6 text-center">
            <p className="text-sm text-secondary-text italic">This is to introduce</p>
            <h3 className="text-lg font-serif text-oxford-blue font-semibold mt-2">
              {member?.full_name || 'Member Name'}
            </h3>
          </div>

          {/* Card Footer */}
          <div className="p-5 bg-gray-50">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-secondary-text">Member Since</p>
                <p className="text-sm font-semibold text-oxford-blue">2024</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-cambridge-blue">{member?.membership_type || 'Membership'}</p>
                <p className="text-xs text-secondary-text">{member?.membership_number || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
