import { EDGE_FUNCTIONS_URL } from './supabase'

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
  title: string
  description: string | null
  event_type: string
  event_date: string
  price_per_person: number
  is_tba: boolean
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

  async getEvents(): Promise<Event[]> {
    const response = await fetch(`${API_BASE}/events?upcoming=true`)
    if (!response.ok) throw new Error('Failed to fetch events')
    const data = await response.json()
    return data.events || []
  },

  async getNews(): Promise<ClubNews[]> {
    const response = await fetch(`${API_BASE}/news`)
    if (!response.ok) throw new Error('Failed to fetch news')
    const data = await response.json()
    return data.news || []
  },

  async getReciprocalClubs(token: string, region?: string): Promise<ReciprocalClub[]> {
    let url = `${API_BASE}/clubs`
    if (region && region !== 'All') url += `?region=${region}`

    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` },
    })
    if (!response.ok) throw new Error('Failed to fetch clubs')
    const data = await response.json()
    return data.clubs || []
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
    const response = await fetch(`${API_BASE}/loi-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
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
