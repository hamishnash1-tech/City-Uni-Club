import React from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { IconDining, IconEvents, IconNews } from '../icons'

export const Home: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const isAuthenticated = auth.isAuthenticated

  return (
    <div
      className="relative bg-cover bg-center bg-no-repeat min-h-[calc(100vh-2.5rem)]"
      style={{ backgroundImage: `url('/assets/cuc-building.avif')`, backgroundAttachment: 'fixed' }}
    >

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-2.5rem)] px-4 py-10">
        {/* Logo — square icon on mobile, full logo on desktop */}
        <div className="md:hidden w-16 h-16 mb-4 bg-cambridge/90 rounded-full flex items-center justify-center p-2 overflow-hidden">
          <img src="/assets/cuc-logo-square.png" alt="CUC" className="w-full h-full object-contain" />
        </div>
        <div className="hidden md:flex w-32 h-32 mb-5 bg-cambridge/90 rounded-full items-center justify-center p-4 overflow-hidden">
          <img src="/assets/cuc-logo.avif" alt="City University Club" className="w-full h-full object-contain" />
        </div>

        {/* Club Name */}
        <div className="bg-black/30 backdrop-blur-sm rounded-xl px-10 py-6 flex flex-col items-center mb-10">
          <h1 className="font-cormorant text-5xl font-light text-ivory tracking-wide uppercase text-center mb-1">
            City University Club
          </h1>

          {/* Decorative gold rule */}
          <div className="w-48 my-3 gold-rule"></div>

          <p className="label-caps text-cambridge-light mb-3 tracking-widest">42 Crutched Friars · London EC3N 2AP</p>
          <div className="flex flex-col items-center gap-1 text-sm text-ivory/60">
            <a href="tel:+442071676682" className="hover:text-cambridge transition">0207 167 6682</a>
            <a href="mailto:secretary@cityuniversityclub.co.uk" className="hover:text-cambridge transition">secretary@cityuniversityclub.co.uk</a>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-3 gap-4 max-w-3xl w-full">
          {/* Dining Card */}
          <a href="/dining" className="bg-ivory/75 backdrop-blur-sm border border-ivory-border shadow-card rounded-sm p-6 text-center hover:bg-ivory transition group">
            <div className="flex justify-center mb-3 text-cambridge-muted group-hover:text-oxford-blue transition">
              <IconDining />
            </div>
            <h3 className="font-serif text-oxford-blue text-lg font-normal mb-1">Dining</h3>
            <p className="label-caps text-ink-light">Book a table & view menu</p>
          </a>

          {/* Events Card */}
          <a href="/events" className="bg-ivory/75 backdrop-blur-sm border border-ivory-border shadow-card rounded-sm p-6 text-center hover:bg-ivory transition group">
            <div className="flex justify-center mb-3 text-cambridge-muted group-hover:text-oxford-blue transition">
              <IconEvents />
            </div>
            <h3 className="font-serif text-oxford-blue text-lg font-normal mb-1">Events</h3>
            <p className="label-caps text-ink-light">Upcoming club events</p>
          </a>

          {/* News Card */}
          <a href="/news" className="bg-ivory/75 backdrop-blur-sm border border-ivory-border shadow-card rounded-sm p-6 text-center hover:bg-ivory transition group">
            <div className="flex justify-center mb-3 text-cambridge-muted group-hover:text-oxford-blue transition">
              <IconNews />
            </div>
            <h3 className="font-serif text-oxford-blue text-lg font-normal mb-1">News</h3>
            <p className="label-caps text-ink-light">Club news & updates</p>
          </a>
        </div>

        {/* Member CTA */}
        <div className="mt-10 flex flex-col items-center gap-3 bg-black/30 backdrop-blur-sm rounded-xl px-8 py-4">
          {isAuthenticated ? (
            <a href="/reciprocal-clubs" className="btn-outline">
              Member Area
            </a>
          ) : (
            <div className="flex gap-3">
              <a href="/login" className="btn-outline">
                Member Login
              </a>
              <a href="/join" className="btn-outline" style={{ backgroundColor: 'rgba(250,247,242,0.0)' }}>
                Apply for Membership
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

