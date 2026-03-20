import React from 'react'

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
)

const AndroidIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.523 15.341A7.274 7.274 0 0 0 19.2 10.8a7.274 7.274 0 0 0-1.677-4.541L18.9 4.882a.6.6 0 0 0-.849-.848l-1.414 1.414A7.228 7.228 0 0 0 12 4a7.228 7.228 0 0 0-4.637 1.448L5.949 4.034a.6.6 0 1 0-.848.848l1.376 1.377A7.274 7.274 0 0 0 4.8 10.8c0 4.032 3.268 7.2 7.2 7.2s7.2-3.168 7.2-7.2a7.24 7.24 0 0 0-.523-2.659zM12 5.2a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm-1.8 3.6a.6.6 0 0 1 .6.6v3.6a.6.6 0 1 1-1.2 0V9.4a.6.6 0 0 1 .6-.6zm3.6 0a.6.6 0 0 1 .6.6v3.6a.6.6 0 1 1-1.2 0V9.4a.6.6 0 0 1 .6-.6z"/>
  </svg>
)

const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="club-card p-4 flex gap-4">
    <div className="w-10 h-10 rounded-full bg-cambridge/20 flex items-center justify-center flex-shrink-0 text-cambridge-muted">
      {icon}
    </div>
    <div>
      <h3 className="font-serif text-oxford-blue text-base font-normal mb-1">{title}</h3>
      <p className="text-ink-mid text-sm leading-relaxed">{description}</p>
    </div>
  </div>
)


export const MobileApp: React.FC = () => (
  <div className="pb-20">

    {/* Header */}
    <div className="bg-cambridge/15 pt-7 pb-6 px-4 border-b border-cambridge/20 text-center">
      <p className="label-caps text-cambridge-light/50 mb-2">Member Mobile App</p>
      <h1 className="font-serif text-2xl font-normal text-ivory">City University Club</h1>
      <p className="text-ivory/60 text-sm mt-2 max-w-md mx-auto">
        The official app for City University Club members — available on iPhone and Android.
      </p>

      {/* Download buttons */}
      <div className="flex flex-wrap justify-center gap-3 mt-5">
        <a
          href="https://apps.apple.com/gb/app/city-university-club/id6745389339"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-ivory text-oxford-blue px-5 py-2.5 rounded text-sm font-semibold hover:bg-ivory/90 transition"
        >
          <AppleIcon />
          App Store
        </a>
        <a
          href="https://play.google.com/store/apps/details?id=uk.co.cityuniversityclub"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-cambridge/25 border border-cambridge/40 text-ivory px-5 py-2.5 rounded text-sm font-semibold hover:bg-cambridge/35 transition"
        >
          <AndroidIcon />
          Google Play
        </a>
      </div>
    </div>

    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

      {/* About */}
      <section>
        <p className="label-caps text-cambridge-light/50 mb-3">About the App</p>
        <div className="club-card p-5 text-sm text-ink leading-relaxed space-y-3">
          <p>
            The City University Club app gives members convenient access to Club services directly from their iPhone or Android device. Book a table in the dining room, browse and register for upcoming events, view your membership card, and request Letters of Introduction to reciprocal clubs around the world — all from one place.
          </p>
          <p>
            Access is restricted to current Club members. Your existing membership credentials are used to sign in; no separate registration is required.
          </p>
        </div>
      </section>

      {/* Features */}
      <section>
        <p className="label-caps text-cambridge-light/50 mb-5">Features</p>
        <div className="space-y-5">
          <Feature
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" strokeWidth={1.5}/><path d="M2 10h20" strokeWidth={1.5}/><path d="M6 15h4" strokeWidth={1.5} strokeLinecap="round"/></svg>}
            title="Digital Membership Card"
            description="View your membership number and details at a glance. Present it at the front desk or to reciprocal clubs."
          />
          <Feature
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}
            title="Dining Reservations"
            description="Book a table in the Club dining room for breakfast, lunch, or dinner. Manage and cancel existing reservations."
          />
          <Feature
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}
            title="Events"
            description="Browse the Club's calendar of lectures, dinners, and social events. Book tickets and manage guest registrations."
          />
          <Feature
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}
            title="Reciprocal Clubs"
            description="Search over 200 reciprocal clubs worldwide and submit Letters of Introduction requests directly from the app."
          />
          <Feature
            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/></svg>}
            title="Member Profile"
            description="View and update your contact details and dietary preferences. Change your account password securely."
          />
        </div>
      </section>

      {/* Support & contact */}
      <section>
        <p className="label-caps text-cambridge-light/50 mb-3">Support</p>
        <div className="club-card p-5 text-sm text-ink leading-relaxed space-y-2">
          <p>For technical support with the app, or any membership enquiry, please contact the Club Secretary.</p>
          <p>
            <strong>Email:</strong>{' '}
            <a href="mailto:secretary@cityuniversityclub.co.uk" className="text-oxford-blue underline underline-offset-2 hover:text-cambridge transition">
              secretary@cityuniversityclub.co.uk
            </a>
          </p>
        </div>
      </section>

    </div>
  </div>
)
