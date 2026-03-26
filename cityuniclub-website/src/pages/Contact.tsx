import React from 'react'

export const Contact: React.FC = () => (
  <div className="pb-20">

    {/* Header */}
    <div className="bg-cambridge/15 pt-7 pb-6 px-4 border-b border-cambridge/20 text-center">
      <h1 className="font-serif text-2xl font-normal text-ivory">Contact</h1>
      <p className="text-ivory/60 text-sm mt-2 max-w-md mx-auto">
        42 Crutched Friars, London EC3N 2AP
      </p>
    </div>

    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

      {/* Opening Hours */}
      <section>
        <p className="label-caps text-cambridge-light/50 mb-3">Opening Hours</p>
        <div className="club-card p-5 text-sm text-ink space-y-3">
          <div className="flex justify-between border-b border-cambridge/10 pb-3">
            <span className="text-ink-mid">Tuesday – Friday</span>
            <span className="text-ink">9:00 am – 5:00 pm</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-mid">Monday, Saturday &amp; Sunday</span>
            <span className="text-ink-light italic">Closed</span>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section>
        <p className="label-caps text-cambridge-light/50 mb-3">Get in Touch</p>
        <div className="club-card p-5 text-sm text-ink space-y-4">

          <div className="flex gap-3">
            <svg className="w-4 h-4 text-cambridge-muted mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div>
              <p>42 Crutched Friars</p>
              <p>London EC3N 2AP</p>
              <a
                href="https://maps.google.com/?q=42+Crutched+Friars,+London+EC3N+2AP"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cambridge-muted hover:text-cambridge text-xs mt-1 inline-block transition"
              >
                Get directions →
              </a>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <svg className="w-4 h-4 text-cambridge-muted mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
            </svg>
            <div className="space-y-1">
              <a href="mailto:secretary@cityuniversityclub.co.uk" className="block hover:text-cambridge transition">
                secretary@cityuniversityclub.co.uk
              </a>
              <a href="mailto:admin@cityuniversityclub.co.uk" className="block hover:text-cambridge transition">
                admin@cityuniversityclub.co.uk
              </a>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <svg className="w-4 h-4 text-cambridge-muted mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
            </svg>
            <a href="tel:+442071676682" className="hover:text-cambridge transition">
              0207 167 6682
            </a>
          </div>

        </div>
      </section>

      {/* Map */}
      <section>
        <p className="label-caps text-cambridge-light/50 mb-3">Location</p>
        <div className="rounded-sm overflow-hidden border border-cambridge/20">
          <iframe
            title="City University Club location"
            src="https://maps.google.com/maps?q=42+Crutched+Friars,+London+EC3N+2AP&output=embed"
            width="100%"
            height="320"
            style={{ border: 0, display: 'block' }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      {/* Getting Here */}
      <section>
        <p className="label-caps text-cambridge-light/50 mb-3">Getting Here</p>
        <div className="club-card p-5 text-sm text-ink leading-relaxed space-y-3">
          <p>The nearest Underground station is <strong>Tower Hill</strong> (Circle &amp; District lines), a 3 minute walk. Exit onto Trinity Square, head north along Muscovy Street, then turn right onto Crutched Friars.</p>
          <p><strong>Aldgate</strong> (Circle &amp; Metropolitan lines) is a 4 minute walk. Head south on Aldgate High Street, turn right onto Fenchurch Street, then left onto Crutched Friars.</p>
          <p><strong>Fenchurch Street</strong> (National Rail) is the closest station overall, just a 1 minute walk. Exit the station, turn left onto Railway Place, then left onto Crutched Friars — the Club is on your right.</p>
        </div>
      </section>

    </div>
  </div>
)
