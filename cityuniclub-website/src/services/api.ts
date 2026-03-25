import { EDGE_FUNCTIONS_URL, SUPABASE_ANON_KEY } from './supabase'

// Use new edge function with proper CORS
const LOI_API_URL = 'https://myfoyoyjtkqthjjvabmn.supabase.co/functions/v1/loi-api'
const API_BASE = EDGE_FUNCTIONS_URL

export interface Member {
  id: string
  email: string
  full_name: string
  first_name: string
  membership_number: string
  membership_type: string
}

export interface Session {
  token: string
  expires_at: string
}

export interface AuthResponse {
  member: Member
  session: Session
}

export interface Event {
  id: string
  slug: string
  title: string
  description: string | null
  event_type: string
  event_date: string
  price_per_person: number
  is_tba: boolean
  assets?: { id: string; type: string; file_url: string; file_name: string | null; mime_type: string | null }[]
  my_booking?: { id: string; status: string; guest_count: number } | null
}

export interface ClubNews {
  id: string
  title: string
  content: string
  category: string
  published_date: string
  is_featured: boolean
}

export interface ReciprocalClub {
  id: string
  name: string
  location: string
  region: string
  country: string
  note?: string
  logo_path?: string | null
}

export const api = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Login failed')
    }

    return response.json()
  },

  async logout(token: string): Promise<void> {
    await fetch(`${API_BASE}/logout`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
    })
  },

  async getEvents(token?: string | null): Promise<Event[]> {
    const headers: Record<string, string> = {}
    if (token) headers['x-session-token'] = token
    const response = await fetch(`${API_BASE}/events?upcoming=true`, { headers })
    if (!response.ok) throw new Error('Failed to fetch events')
    const data = await response.json()
    return data.events || []
  },

  async createEventBooking(
    sessionToken: string | null,
    booking: {
      event_id: string
      guest_count: number
      special_requests?: string
      guest_name?: string
      guest_email?: string
      guest_phone?: string
    }
  ): Promise<any> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (sessionToken) headers['x-session-token'] = sessionToken

    const response = await fetch(`${API_BASE}/event-bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(booking),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to submit booking')
    }

    return response.json()
  },

  async getEventBySlug(slug: string, token?: string | null): Promise<Event> {
    const headers: Record<string, string> = {}
    if (token) headers['x-session-token'] = token
    const response = await fetch(`${API_BASE}/events?slug=${encodeURIComponent(slug)}`, { headers })
    if (!response.ok) throw new Error('Failed to fetch event')
    const data = await response.json()
    return data.event
  },

  async cancelEventBooking(token: string, bookingId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/event-bookings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-session-token': token },
      body: JSON.stringify({ booking_id: bookingId }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel booking')
    }
  },

  async updateEventGuestCount(token: string, bookingId: string, guestCount: number): Promise<void> {
    const response = await fetch(`${API_BASE}/event-bookings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-session-token': token },
      body: JSON.stringify({ booking_id: bookingId, guest_count: guestCount }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update booking')
    }
  },

  async getNews(): Promise<ClubNews[]> {
    const response = await fetch(`${API_BASE}/news`)
    if (!response.ok) throw new Error('Failed to fetch news')
    const data = await response.json()
    return data.news || []
  },

  async getClubRegionCounts(token: string): Promise<Record<string, number>> {
    const response = await fetch(`${API_BASE}/clubs`, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
    })
    if (!response.ok) throw new Error('Failed to fetch club regions')
    const data = await response.json()
    return data.regions || {}
  },

  async getClubCountryCounts(token: string, regions: string[]): Promise<{ country: string; count: number }[]> {
    const url = `${API_BASE}/clubs?regions=${encodeURIComponent(regions.join(','))}`
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
    })
    if (!response.ok) throw new Error('Failed to fetch club countries')
    const data = await response.json()
    return data.countries || []
  },

  async getClubsByCountry(token: string, regions: string[], country: string): Promise<ReciprocalClub[]> {
    const url = `${API_BASE}/clubs?regions=${encodeURIComponent(regions.join(','))}&country=${encodeURIComponent(country)}&all_clubs=true`
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
    })
    if (!response.ok) throw new Error('Failed to fetch clubs')
    const data = await response.json()
    return data.clubs || []
  },

  async getClubCityCounts(token: string, regions: string[], country: string): Promise<{ city: string; count: number }[]> {
    const url = `${API_BASE}/clubs?regions=${encodeURIComponent(regions.join(','))}&country=${encodeURIComponent(country)}`
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
    })
    if (!response.ok) throw new Error('Failed to fetch club cities')
    const data = await response.json()
    return data.cities || []
  },

  async getClubsByCity(token: string, regions: string[], country: string, city: string): Promise<ReciprocalClub[]> {
    const url = `${API_BASE}/clubs?regions=${encodeURIComponent(regions.join(','))}&country=${encodeURIComponent(country)}&city=${encodeURIComponent(city)}`
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
    })
    if (!response.ok) throw new Error('Failed to fetch clubs by city')
    const data = await response.json()
    return data.clubs || []
  },

  async getClubsExcludingCity(token: string, regions: string[], country: string, excludeCity: string): Promise<ReciprocalClub[]> {
    const url = `${API_BASE}/clubs?regions=${encodeURIComponent(regions.join(','))}&country=${encodeURIComponent(country)}&exclude_city=${encodeURIComponent(excludeCity)}`
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
    })
    if (!response.ok) throw new Error('Failed to fetch clubs')
    const data = await response.json()
    return data.clubs || []
  },

  async searchClubs(token: string, query: string): Promise<ReciprocalClub[]> {
    const url = `${API_BASE}/clubs?search=${encodeURIComponent(query)}`
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}`, 'apikey': SUPABASE_ANON_KEY },
    })
    if (!response.ok) throw new Error('Failed to search clubs')
    const data = await response.json()
    return data.clubs || []
  },

  async createDiningReservation(
    token: string | null,
    reservation: {
      reservation_date: string
      reservation_time: string
      meal_type: 'Breakfast' | 'Lunch'
      guest_count: number
      table_preference?: string
      special_requests?: string
      guest_name?: string
      guest_email?: string
    }
  ): Promise<any> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'apikey': SUPABASE_ANON_KEY,
    }
    if (token) headers['x-session-token'] = token

    const response = await fetch(`${API_BASE}/dining`, {
      method: 'POST',
      headers,
      body: JSON.stringify(reservation),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create reservation')
    }

    return response.json()
  },

  async getMemberBookings(token: string): Promise<{ upcoming: any[]; past: any[] }> {
    const response = await fetch(`${API_BASE}/member-bookings`, {
      headers: { 'x-session-token': token },
    })
    if (!response.ok) throw new Error('Failed to fetch bookings')
    return response.json()
  },

  async cancelDiningReservation(token: string, reservationId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/dining`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-session-token': token },
      body: JSON.stringify({ reservation_id: reservationId }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to cancel reservation')
    }
  },

  async updateDiningNotes(token: string, reservationId: string, notes: string): Promise<void> {
    const response = await fetch(`${API_BASE}/dining`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-session-token': token },
      body: JSON.stringify({ reservation_id: reservationId, special_requests: notes }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update notes')
    }
  },

  async updateDiningGuestCount(token: string, reservationId: string, guestCount: number): Promise<void> {
    const response = await fetch(`${API_BASE}/dining`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-session-token': token },
      body: JSON.stringify({ reservation_id: reservationId, guest_count: guestCount }),
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update guest count')
    }
  },

  async createLoiRequest(
    token: string,
    request: {
      club_id: string
      arrival_date: string
      departure_date: string
      purpose: string
      special_requests?: string
    }
  ): Promise<any> {
    // Use deployed Vercel backend API (not Supabase Edge Function due to CORS)
    const response = await fetch(LOI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'x-session-token': token,
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create LOI request')
    }

    return response.json()
  },
}
