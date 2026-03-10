export interface User {
  id: string
  email: string
  role: 'admin' | 'staff'
}

export interface Member {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  phone_number?: string
  member_until: string
  membership_type?: string
}

export interface Event {
  id: string
  title: string
  event_date: string
  event_end_date?: string | null
  event_type: 'lunch' | 'dinner' | 'lunch_dinner' | 'meeting' | 'special'
  description?: string | null
  price?: number | null
  pdf_url?: string | null
  pdf_name?: string | null
}

export interface DiningReservation {
  id: string
  member_id: string
  reservation_date: string
  reservation_time: string
  meal_type: 'breakfast' | 'lunch'
  guest_count: number
  status: 'pending' | 'confirmed' | 'cancelled'
}

export interface ReciprocalClub {
  id: string
  name: string
  location: string
  country: string
  region: string
  note?: string
}

export interface NewsItem {
  id: string
  title: string
  date: string
  category: string
  content: string
}

export interface LoiRequest {
  id: string
  member_id: string
  club_id: string
  club_name: string
  arrival_date: string
  departure_date: string
  purpose: string
  status: 'pending' | 'approved' | 'rejected'
  special_requests?: string
}
