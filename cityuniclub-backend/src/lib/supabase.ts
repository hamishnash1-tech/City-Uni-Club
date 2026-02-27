import { createClient, SupabaseClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.SUPABASE_URL || 'http://localhost:8000'
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required. Set it in .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const getSupabaseClient = () => {
  return supabase
}

// Type helpers for database operations
export type Member = {
  id: string
  email: string
  password_hash: string
  full_name: string
  first_name: string
  phone_number: string | null
  membership_number: string
  membership_type: 'Full Membership' | 'Associate Membership' | 'Junior Membership' | 'Senior Membership' | 'Corporate Membership'
  member_since: string
  member_until: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type MemberProfile = {
  id: string
  member_id: string
  dietary_requirements: string | null
  preferences: Record<string, any>
  notification_enabled: boolean
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  title: string
  description: string | null
  event_type: 'lunch' | 'dinner' | 'lunch_dinner' | 'meeting' | 'special'
  event_date: string
  lunch_time: string | null
  dinner_time: string | null
  price_per_person: number
  max_capacity: number | null
  is_tba: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type EventBooking = {
  id: string
  event_id: string
  member_id: string
  meal_option: 'lunch' | 'dinner' | null
  guest_count: number
  special_requests: string | null
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  booked_at: string
  created_at: string
  updated_at: string
}

export type DiningReservation = {
  id: string
  member_id: string
  reservation_date: string
  reservation_time: string
  meal_type: 'Breakfast' | 'Lunch'
  guest_count: number
  table_preference: string | null
  special_requests: string | null
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  created_at: string
  updated_at: string
}

export type ReciprocalClub = {
  id: string
  name: string
  location: string
  region: string
  country: string
  note: string | null
  contact_email: string | null
  contact_phone: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type LoiRequest = {
  id: string
  member_id: string
  club_id: string
  arrival_date: string
  departure_date: string
  purpose: 'Business' | 'Leisure' | 'Both'
  special_requests: string | null
  status: 'pending' | 'approved' | 'rejected' | 'sent'
  secretary_notes: string | null
  requested_at: string
  processed_at: string | null
  created_at: string
  updated_at: string
}

export type ClubNews = {
  id: string
  title: string
  content: string
  category: 'Dining' | 'Special Offer' | 'Special Event' | 'Event' | 'General'
  published_date: string
  is_featured: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export type Session = {
  id: string
  member_id: string
  token: string
  device_info: string | null
  ip_address: string | null
  expires_at: string
  created_at: string
  last_active_at: string
}

export type PasswordResetToken = {
  id: string
  member_id: string
  token: string
  expires_at: string
  used: boolean
  created_at: string
}
