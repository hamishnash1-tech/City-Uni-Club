import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'

const GALLERY_PHOTOS = [
  { src: '/assets/photos/maindining_HDR1.jpg', alt: 'Main Dining Room' },
  { src: '/assets/photos/Lounge_HDR.jpg', alt: 'The Lounge' },
  { src: '/assets/photos/5D_A4118.jpg', alt: 'Club Exterior' },
  { src: '/assets/photos/5D_A4026.jpg', alt: 'Club Interior' },
  { src: '/assets/photos/5D_A4163-HDR.jpg', alt: 'Club Exterior' },
  { src: '/assets/photos/5D_A4101.jpg', alt: 'Club Interior' },
  { src: '/assets/photos/5D_A4125.jpg', alt: 'Club Exterior' },
  { src: '/assets/photos/5D_A4084-HDR.jpg', alt: 'Club Interior' },
  { src: '/assets/photos/5D_A4088.jpg', alt: 'Club Interior' },
  { src: '/assets/photos/5D_A4066.jpg', alt: 'Club Interior' },
  { src: '/assets/photos/5D_A4008.jpg', alt: 'Club Interior' },
  { src: '/assets/photos/cuc.jpg', alt: 'City University Club' },
]

export const Info: React.FC = () => {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const carouselRef = useRef<HTMLDivElement>(null)

  const scroll = (dir: 'left' | 'right') => {
    carouselRef.current?.scrollBy({ left: dir === 'left' ? -240 : 240, behavior: 'smooth' })
  }

  return (
  <>
  <div className="pb-20">

    {/* Header */}
    <div className="bg-cambridge/15 pt-7 pb-6 px-4 border-b border-cambridge/20 text-center">
      <p className="label-caps text-cambridge-muted mb-2">Est. 1895</p>
      <h1 className="font-serif text-2xl font-normal text-ivory">City University Club</h1>
      <p className="text-ivory/60 text-sm mt-2 max-w-md mx-auto">
        42 Crutched Friars, London EC3N 2AP
      </p>
    </div>

    <div className="max-w-2xl mx-auto px-4 py-8 space-y-10">

      {/* About */}
      <section>
        <p className="label-caps text-cambridge-muted mb-3">About</p>
        <div className="club-card p-5 text-sm text-ink leading-relaxed space-y-4">
          <p>
            The City University Club (CUC) is a lunch club in the heart of the financial area of London.
            It is the ideal place for lunch or simply a drink at the bar. The Club offers a first class
            meal in discreet circumstances for a modest price.
          </p>
          <p>
            We also offer a comfortable space for business use which can be used from early morning.
          </p>
          <p>
            Originally established in 1895 by Oxbridge graduates who wanted a lunch club in the City,
            the link with the universities remains, although membership is now much wider, embracing both
            sexes and many professions. We have moved to our new premises as of 29th January 2018 to
            42 Crutched Friars London EC3N 2AP. These premises used to be the residence of the Spanish
            Ambassador during the late 18th century.
          </p>
          <p>
            Members joining the Club find the atmosphere equally conducive to lunching with friends or
            on their own at the club tables. The food is first-class; the wine-list comprehensive and
            the service excellent. The Club is open for lunch Monday to Friday throughout the year,
            closing only between Christmas and the New Year. In keeping with other private members clubs
            the dress code is jacket and tie for men and smart dress for ladies (no jeans or trainers).
          </p>
          <p>
            The Club enjoys reciprocity with over 450 of the finest clubs throughout the world including
            many in London and other parts of the country.
          </p>
        </div>
      </section>

      {/* Gallery */}
      <section>
        <p className="label-caps text-cambridge-muted mb-3">Gallery</p>
        <div className="flex items-center gap-2">
          <button onClick={() => scroll('left')} className="flex-none w-9 h-9 flex items-center justify-center rounded-sm bg-cambridge/15 border border-cambridge/40 text-ivory/70 text-xl hover:bg-cambridge/30 hover:text-ivory hover:border-cambridge transition" aria-label="Scroll left">‹</button>
          <div ref={carouselRef} className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 flex-1" style={{ scrollbarWidth: 'none' }}>
          {GALLERY_PHOTOS.map((photo, i) => (
            <button
              key={i}
              onClick={() => setLightbox(i)}
              className="flex-none w-56 aspect-[4/3] overflow-hidden rounded-sm snap-start focus:outline-none focus:ring-2 focus:ring-cambridge"
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                className="w-full h-full object-cover transition duration-300 hover:scale-105"
              />
            </button>
          ))}
          </div>
          <button onClick={() => scroll('right')} className="flex-none w-9 h-9 flex items-center justify-center rounded-sm bg-cambridge/15 border border-cambridge/40 text-ivory/70 text-xl hover:bg-cambridge/30 hover:text-ivory hover:border-cambridge transition" aria-label="Scroll right">›</button>
        </div>
      </section>

      {/* Opening Hours */}
      <section>
        <p className="label-caps text-cambridge-muted mb-3">Opening Hours</p>
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
      <section id="get-in-touch">
        <p className="label-caps text-cambridge-muted mb-3">Get in Touch</p>
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

      {/* Membership CTA */}
      <section>
        <p className="label-caps text-cambridge-muted mb-3">Membership</p>
        <div className="club-card p-6 text-center space-y-4">
          <h3 className="font-serif text-oxford-blue text-xl font-normal">Become a Member</h3>
          <p className="text-sm text-ink leading-relaxed max-w-sm mx-auto">
            Join one of London's most distinguished private members' clubs. Enjoy fine dining, reciprocal access to over 450 clubs worldwide, and a community of like-minded professionals.
          </p>
          <Link to="/join" className="inline-block label-caps px-8 py-3 bg-oxford-blue text-ivory font-semibold rounded-sm hover:bg-oxford-blue/80 transition">
            Apply for Membership
          </Link>
        </div>
      </section>

      {/* Map */}
      <section>
        <p className="label-caps text-cambridge-muted mb-3">Location</p>
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
        <p className="label-caps text-cambridge-muted mb-3">Getting Here</p>
        <div className="club-card p-5 text-sm text-ink leading-relaxed space-y-3">
          <p>The nearest Underground station is <strong>Tower Hill</strong> (Circle &amp; District lines), a 3 minute walk. Exit onto Trinity Square, head north along Muscovy Street, then turn right onto Crutched Friars.</p>
          <p><strong>Aldgate</strong> (Circle &amp; Metropolitan lines) is a 4 minute walk. Head south on Aldgate High Street, turn right onto Fenchurch Street, then left onto Crutched Friars.</p>
          <p><strong>Fenchurch Street</strong> (National Rail) is the closest station overall, just a 1 minute walk. Exit the station, turn left onto Railway Place, then left onto Crutched Friars — the Club is on your right.</p>
        </div>
      </section>

    </div>
  </div>

  {/* Lightbox */}
  {lightbox !== null && (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={() => setLightbox(null)}
    >
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white text-3xl leading-none"
        onClick={() => setLightbox(null)}
        aria-label="Close"
      >
        ×
      </button>
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl leading-none px-2"
        onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + GALLERY_PHOTOS.length) % GALLERY_PHOTOS.length) }}
        aria-label="Previous"
      >
        ‹
      </button>
      <img
        src={GALLERY_PHOTOS[lightbox].src}
        alt={GALLERY_PHOTOS[lightbox].alt}
        className="max-h-[85vh] max-w-full object-contain rounded-sm"
        onClick={e => e.stopPropagation()}
      />
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white text-3xl leading-none px-2"
        onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % GALLERY_PHOTOS.length) }}
        aria-label="Next"
      >
        ›
      </button>
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-sm">
        {GALLERY_PHOTOS[lightbox].alt} · {lightbox + 1} / {GALLERY_PHOTOS.length}
      </p>
    </div>
  )}
  </>
  )
}
