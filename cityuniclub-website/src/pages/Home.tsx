import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'

export const Home: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const member = auth.member
  const isAuthenticated = auth.isAuthenticated

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background - cuc-building image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url('/assets/cuc-building.avif')`,
        }}
      >
        {/* Oxford Blue Overlay - 35% opacity (matching iOS app) */}
        <div className="absolute inset-0 bg-oxford-blue" style={{ opacity: 0.35 }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Logo - cuc-logo */}
        <div className="w-32 h-32 mb-4 bg-white/20 rounded-full flex items-center justify-center p-4 overflow-hidden shadow-2xl">
          <img 
            src="/assets/cuc-logo.avif" 
            alt="City University Club" 
            className="w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/128?text=CUC'
            }}
          />
        </div>

        {/* Club Name */}
        <h1 className="text-4xl font-serif font-bold text-white mb-2">CITY UNIVERSITY CLUB</h1>
        <p className="text-cambridge-blue text-lg mb-8">42 Crutched Friars, London EC3N 2AP</p>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full">
          {/* Dining Card */}
          <a href="/dining" className="bg-card-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center hover:bg-white transition">
            <div className="text-4xl mb-3">🍽️</div>
            <h3 className="text-xl font-serif text-oxford-blue font-semibold mb-2">Dining</h3>
            <p className="text-sm text-secondary-text">Book a table & view menu</p>
          </a>

          {/* Events Card */}
          <a href="/events" className="bg-card-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center hover:bg-white transition">
            <div className="text-4xl mb-3">📅</div>
            <h3 className="text-xl font-serif text-oxford-blue font-semibold mb-2">Events</h3>
            <p className="text-sm text-secondary-text">Upcoming club events</p>
          </a>

          {/* News Card */}
          <a href="/news" className="bg-card-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 text-center hover:bg-white transition">
            <div className="text-4xl mb-3">📰</div>
            <h3 className="text-xl font-serif text-oxford-blue font-semibold mb-2">News</h3>
            <p className="text-sm text-secondary-text">Club news & updates</p>
          </a>
        </div>

        {/* Member Area Button */}
        <div className="mt-12">
          {isAuthenticated ? (
            <a 
              href="/reciprocal-clubs" 
              className="inline-block bg-cambridge-blue text-oxford-blue px-8 py-4 rounded-lg font-semibold hover:bg-white transition shadow-lg"
            >
              🌍 Member Area (Reciprocal Clubs)
            </a>
          ) : (
            <a 
              href="/login" 
              className="inline-block bg-cambridge-blue text-oxford-blue px-8 py-4 rounded-lg font-semibold hover:bg-white transition shadow-lg"
            >
              🔐 Member Login
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
