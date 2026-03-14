import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { IconDining, IconEvents, IconNews } from '../icons'

export const Home: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const isAuthenticated = auth.isAuthenticated

  return (
    <div className="fixed inset-0 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('/assets/cuc-building.avif')` }}
      >
        <div className="absolute inset-0 bg-navy-gradient" style={{ opacity: 0.62 }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full pt-12 px-4 pb-4 md:pt-4">
        {/* Logo — square icon on mobile, full logo on desktop */}
        <div className="md:hidden w-16 h-16 mb-4 bg-cambridge/90 rounded-full flex items-center justify-center p-2 overflow-hidden">
          <img src="/assets/cuc-logo-square.png" alt="CUC" className="w-full h-full object-contain" />
        </div>
        <div className="hidden md:flex w-32 h-32 mb-5 bg-cambridge/90 rounded-full items-center justify-center p-4 overflow-hidden">
          <img src="/assets/cuc-logo.avif" alt="City University Club" className="w-full h-full object-contain" />
        </div>

        {/* Club Name */}
        <h1 className="font-cormorant text-5xl font-light text-ivory tracking-wide uppercase text-center mb-1">
          City University Club
        </h1>

        {/* Decorative gold rule */}
        <div className="w-48 my-3 gold-rule"></div>

        <p className="label-caps text-cambridge-light mb-10 tracking-widest">42 Crutched Friars · London EC3N 2AP</p>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl w-full">
          {/* Dining Card */}
          <a href="/dining" className="bg-ivory/90 backdrop-blur-sm border border-ivory-border shadow-card rounded-sm p-6 text-center hover:bg-ivory transition group">
            <div className="flex justify-center mb-3 text-cambridge-muted group-hover:text-oxford-blue transition">
              <IconDining />
            </div>
            <h3 className="font-serif text-oxford-blue text-lg font-normal mb-1">Dining</h3>
            <p className="label-caps text-ink-light">Book a table & view menu</p>
          </a>

          {/* Events Card */}
          <a href="/events" className="bg-ivory/90 backdrop-blur-sm border border-ivory-border shadow-card rounded-sm p-6 text-center hover:bg-ivory transition group">
            <div className="flex justify-center mb-3 text-cambridge-muted group-hover:text-oxford-blue transition">
              <IconEvents />
            </div>
            <h3 className="font-serif text-oxford-blue text-lg font-normal mb-1">Events</h3>
            <p className="label-caps text-ink-light">Upcoming club events</p>
          </a>

          {/* News Card */}
          <a href="/news" className="bg-ivory/90 backdrop-blur-sm border border-ivory-border shadow-card rounded-sm p-6 text-center hover:bg-ivory transition group">
            <div className="flex justify-center mb-3 text-cambridge-muted group-hover:text-oxford-blue transition">
              <IconNews />
            </div>
            <h3 className="font-serif text-oxford-blue text-lg font-normal mb-1">News</h3>
            <p className="label-caps text-ink-light">Club news & updates</p>
          </a>
        </div>

        {/* Member CTA */}
        <div className="mt-10">
          {isAuthenticated ? (
            <a href="/reciprocal-clubs" className="btn-outline">
              Member Area
            </a>
          ) : (
            <a href="/login" className="btn-outline">
              Member Login
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
