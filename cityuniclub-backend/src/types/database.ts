export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MembershipType = 'Full Membership' | 'Associate Membership' | 'Junior Membership' | 'Senior Membership' | 'Corporate Membership'
export type EventType = 'lunch' | 'dinner' | 'lunch_dinner' | 'meeting' | 'special'
export type MealOption = 'lunch' | 'dinner'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type LoiStatus = 'pending' | 'approved' | 'rejected' | 'sent'
export type VisitPurpose = 'Business' | 'Leisure' | 'Both'
export type NewsCategory = 'Dining' | 'Special Offer' | 'Special Event' | 'Event' | 'General'

export interface Database {
  public: {
    Tables: {
      members: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          first_name: string
          phone_number: string | null
          membership_number: string
          membership_type: MembershipType
          member_since: string
          member_until: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          first_name: string
          phone_number?: string | null
          membership_number: string
          membership_type?: MembershipType
          member_since: string
          member_until?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          first_name?: string
          phone_number?: string | null
          membership_number?: string
          membership_type?: MembershipType
          member_since?: string
          member_until?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      member_profiles: {
        Row: {
          id: string
          member_id: string
          dietary_requirements: string | null
          preferences: Json
          notification_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          dietary_requirements?: string | null
          preferences?: Json
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          dietary_requirements?: string | null
          preferences?: Json
          notification_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: EventType
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
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type: EventType
          event_date: string
          lunch_time?: string | null
          dinner_time?: string | null
          price_per_person?: number
          max_capacity?: number | null
          is_tba?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_type?: EventType
          event_date?: string
          lunch_time?: string | null
          dinner_time?: string | null
          price_per_person?: number
          max_capacity?: number | null
          is_tba?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      event_bookings: {
        Row: {
          id: string
          event_id: string
          member_id: string
          meal_option: MealOption | null
          guest_count: number
          special_requests: string | null
          total_price: number
          status: BookingStatus
          booked_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          member_id: string
          meal_option?: MealOption | null
          guest_count?: number
          special_requests?: string | null
          total_price: number
          status?: BookingStatus
          booked_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          member_id?: string
          meal_option?: MealOption | null
          guest_count?: number
          special_requests?: string | null
          total_price?: number
          status?: BookingStatus
          booked_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      dining_reservations: {
        Row: {
          id: string
          member_id: string
          reservation_date: string
          reservation_time: string
          meal_type: string
          guest_count: number
          table_preference: string | null
          special_requests: string | null
          status: ReservationStatus
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          reservation_date: string
          reservation_time: string
          meal_type: string
          guest_count?: number
          table_preference?: string | null
          special_requests?: string | null
          status?: ReservationStatus
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          reservation_date?: string
          reservation_time?: string
          meal_type?: string
          guest_count?: number
          table_preference?: string | null
          special_requests?: string | null
          status?: ReservationStatus
          created_at?: string
          updated_at?: string
        }
      }
      reciprocal_clubs: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          location: string
          region: string
          country: string
          note?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          location?: string
          region?: string
          country?: string
          note?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      loi_requests: {
        Row: {
          id: string
          member_id: string
          club_id: string
          arrival_date: string
          departure_date: string
          purpose: VisitPurpose
          special_requests: string | null
          status: LoiStatus
          secretary_notes: string | null
          requested_at: string
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_id: string
          club_id: string
          arrival_date: string
          departure_date: string
          purpose: VisitPurpose
          special_requests?: string | null
          status?: LoiStatus
          secretary_notes?: string | null
          requested_at?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          club_id?: string
          arrival_date?: string
          departure_date?: string
          purpose?: VisitPurpose
          special_requests?: string | null
          status?: LoiStatus
          secretary_notes?: string | null
          requested_at?: string
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      club_news: {
        Row: {
          id: string
          title: string
          content: string
          category: NewsCategory
          published_date: string
          is_featured: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          category: NewsCategory
          published_date: string
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          category?: NewsCategory
          published_date?: string
          is_featured?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      password_reset_tokens: {
        Row: {
          id: string
          member_id: string
          token: string
          expires_at: string
          used: boolean
          created_at: string
        }
        Insert: {
          id?: string
          member_id: string
          token: string
          expires_at: string
          used?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          token?: string
          expires_at?: string
          used?: boolean
          created_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          member_id: string
          token: string
          device_info: string | null
          ip_address: string | null
          expires_at: string
          created_at: string
          last_active_at: string
        }
        Insert: {
          id?: string
          member_id: string
          token: string
          device_info?: string | null
          ip_address?: string | null
          expires_at: string
          created_at?: string
          last_active_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          token?: string
          device_info?: string | null
          ip_address?: string | null
          expires_at?: string
          created_at?: string
          last_active_at?: string
        }
      }
    }
  }
}
