import React, { useState, useEffect, useRef } from 'react'
import { EDGE_FUNCTIONS_URL } from '../services/supabase'

const TURNSTILE_SITE_KEY = '0x4AAAAAACtbv5Jet_gxcPI7'

const suitableFor = [
  'Conferences',
  'Meetings & workshops',
  'Networking',
  'Presentations',
  'Private dining',
  'Team away days',
]

const facilities = [
  'Air conditioning',
  'Breakout spaces',
  'Close to transport links',
  'Disabled access',
  'Natural light',
  'TV/projector',
  'Whiteboards/flipcharts',
]

const capacities = [
  { layout: 'Boardroom', capacity: 20 },
  { layout: 'Cabaret', capacity: 30 },
  { layout: 'Classroom', capacity: 30 },
  { layout: 'Standing', capacity: 150 },
  { layout: 'Theatre', capacity: 34 },
  { layout: 'U-shaped', capacity: 30 },
]

export const VenueHire: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', organisation: '', date: '', guests: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [turnstileToken, setTurnstileToken] = useState('')
  const widgetRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  useEffect(() => {
    const scriptId = 'cf-turnstile-script'

    const render = () => {
      const w = window as any
      if (!widgetRef.current || !w.turnstile || widgetIdRef.current) return
      widgetIdRef.current = w.turnstile.render(widgetRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: 'light',
        callback: (token: string) => setTurnstileToken(token),
        'expired-callback': () => setTurnstileToken(''),
        'error-callback': () => setTurnstileToken(''),
      })
    }

    if ((window as any).turnstile) {
      render()
    } else if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      script.onload = render
      document.head.appendChild(script)
    } else {
      document.getElementById(scriptId)!.addEventListener('load', render)
    }

    return () => {
      if (widgetIdRef.current && (window as any).turnstile) {
        ;(window as any).turnstile.remove(widgetIdRef.current)
        widgetIdRef.current = null
      }
    }
  }, [])

  const resetTurnstile = () => {
    if (widgetIdRef.current && (window as any).turnstile) {
      ;(window as any).turnstile.reset(widgetIdRef.current)
      setTurnstileToken('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/venue-hire-enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, turnstileToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to send enquiry')
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      resetTurnstile()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="">
      {/* Header */}
      <div className="bg-oxford-blue/80 pt-7 pb-5 px-4 border-b border-cambridge/20">
        <div className="text-center">
          <p className="label-caps text-cambridge-muted mb-2">City University Club</p>
          <h1 className="font-serif text-2xl font-normal text-ivory">Venue Hire</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="club-card p-5 text-sm text-ink space-y-3">
            <h3 className="font-serif text-oxford-blue font-normal text-base">Suitable For</h3>
            <ul className="space-y-1.5">
              {suitableFor.map(item => (
                <li key={item} className="flex items-center gap-2 text-ink-mid">
                  <span className="w-1 h-1 rounded-full bg-cambridge-muted flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="club-card p-5 text-sm text-ink space-y-3">
            <h3 className="font-serif text-oxford-blue font-normal text-base">Facilities</h3>
            <ul className="space-y-1.5">
              {facilities.map(item => (
                <li key={item} className="flex items-center gap-2 text-ink-mid">
                  <span className="w-1 h-1 rounded-full bg-cambridge-muted flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="club-card p-5 text-sm text-ink space-y-3">
            <h3 className="font-serif text-oxford-blue font-normal text-base">Capacities</h3>
            <div className="divide-y divide-cambridge/10">
              {capacities.map(({ layout, capacity }) => (
                <div key={layout} className="flex justify-between py-1.5 first:pt-0 last:pb-0">
                  <span className="text-ink-mid">{layout}</span>
                  <span className="text-ink">{capacity}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Enquiry form */}
        <div className="club-card p-6 sm:p-8 max-w-xl mx-auto">
          <h2 className="font-serif text-oxford-blue text-xl font-normal mb-1">Make an Enquiry</h2>
          <p className="text-ink-mid text-sm mb-6 leading-relaxed">
            Complete your details below and we will be in touch to discuss your requirements.
          </p>

          {submitted ? (
            <p className="text-cambridge font-cormorant text-lg text-center py-4">
              Thank you — your enquiry has been sent. We will be in touch shortly.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label-caps text-ink-light block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="club-input"
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className="label-caps text-ink-light block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="club-input"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="label-caps text-ink-light block mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  className="club-input"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="label-caps text-ink-light block mb-1">Organisation</label>
                <input
                  type="text"
                  value={form.organisation}
                  onChange={e => setForm({ ...form, organisation: e.target.value })}
                  className="club-input"
                  placeholder="Optional"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-caps text-ink-light block mb-1">Preferred Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={e => setForm({ ...form, date: e.target.value })}
                    className="club-input"
                  />
                </div>
                <div>
                  <label className="label-caps text-ink-light block mb-1">No. of Guests</label>
                  <input
                    type="number"
                    min="1"
                    value={form.guests}
                    onChange={e => setForm({ ...form, guests: e.target.value })}
                    className="club-input"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div>
                <label className="label-caps text-ink-light block mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="club-input resize-none"
                  rows={4}
                  placeholder="Please describe your event and any specific requirements..."
                />
              </div>

              <div ref={widgetRef} />

              {error && <p className="text-red-400 text-sm border-l-2 border-red-400/60 pl-3">{error}</p>}
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={submitting || !turnstileToken}
              >
                {submitting ? 'Sending…' : 'Send Enquiry'}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  )
}
