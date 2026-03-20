import React, { useState, useEffect, useRef } from 'react'
import { EDGE_FUNCTIONS_URL } from '../services/supabase'

const TURNSTILE_SITE_KEY = '0x4AAAAAACtbv5Jet_gxcPI7'

const benefits = [
  {
    title: 'Fine Dining',
    description: 'Access to the Club\'s restaurant serving seasonal menus, wine cellar selections, and private dining rooms for entertaining guests.',
  },
  {
    title: 'Reciprocal Clubs',
    description: 'Privileges at over 450 distinguished clubs worldwide — from Hong Kong to New York, Edinburgh to Sydney — with a Letter of Introduction.',
  },
  {
    title: 'Events & Lectures',
    description: 'An active calendar of guest dinners, wine tastings, cultural lectures, and social events throughout the year.',
  },
  {
    title: 'Central Location',
    description: 'Conveniently situated in the heart of the City of London, providing a refined retreat from the pace of business life.',
  },
  {
    title: 'Professional Network',
    description: 'A community of members drawn from the professions, business, and academia — ideal for building lasting connections.',
  },
  {
    title: 'Historic Heritage',
    description: 'A club with deep roots in City life, offering a sense of tradition and continuity in an ever-changing world.',
  },
]

export const Join: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
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
      const res = await fetch(`${EDGE_FUNCTIONS_URL}/join-enquiry`, {
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
      <div className="bg-cambridge/15 pt-7 pb-5 px-4 border-b border-cambridge/20">
        <div className="flex items-center justify-center gap-2 text-ivory">
          <h1 className="font-serif text-2xl font-normal text-ivory">Apply for Membership</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-10">

        {/* Benefits */}
        <div>
          <h2 className="font-serif text-ivory text-xl font-normal mb-6 text-center">
            Why Join the City University Club?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {benefits.map((b) => (
              <div key={b.title} className="club-card p-5">
                <h3 className="font-serif text-oxford-blue font-normal text-base mb-2">{b.title}</h3>
                <p className="text-ink-mid text-sm leading-relaxed">{b.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="club-card p-6 sm:p-8 max-w-xl mx-auto">
          <h2 className="font-serif text-oxford-blue text-xl font-normal mb-1">Get in Touch</h2>
          <p className="text-ink-mid text-sm mb-6 leading-relaxed">
            Complete your details below and the Club Secretary will be in touch to discuss membership.
          </p>

          {submitted ? (
            <p className="text-cambridge font-cormorant text-lg text-center py-4">
              Thank you — your enquiry has been sent. We look forward to hearing from you.
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
                <label className="label-caps text-ink-light block mb-1">Message</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                  className="club-input resize-none"
                  rows={4}
                  placeholder="Tell us a little about yourself and your interest in the Club..."
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
