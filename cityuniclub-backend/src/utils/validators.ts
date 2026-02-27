import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  full_name: z.string().min(2, 'Full name is required'),
  first_name: z.string().min(1, 'First name is required'),
  membership_number: z.string().min(1, 'Membership number is required'),
  membership_type: z.enum(['Full Membership', 'Associate Membership', 'Junior Membership', 'Senior Membership', 'Corporate Membership']),
  member_since: z.string(),
  phone_number: z.string().optional()
})

export const updateProfileSchema = z.object({
  full_name: z.string().min(2).optional(),
  first_name: z.string().min(1).optional(),
  phone_number: z.string().optional(),
  dietary_requirements: z.string().optional(),
  notification_enabled: z.boolean().optional()
})

export const eventBookingSchema = z.object({
  event_id: z.string().uuid(),
  meal_option: z.enum(['lunch', 'dinner']).optional(),
  guest_count: z.number().min(1).max(10),
  special_requests: z.string().optional()
})

export const diningReservationSchema = z.object({
  reservation_date: z.string(),
  reservation_time: z.string(),
  meal_type: z.enum(['Breakfast', 'Lunch']),
  guest_count: z.number().min(1).max(10),
  table_preference: z.string().optional(),
  special_requests: z.string().optional()
})

export const loiRequestSchema = z.object({
  club_id: z.string().uuid(),
  arrival_date: z.string(),
  departure_date: z.string(),
  purpose: z.enum(['Business', 'Leisure', 'Both']),
  special_requests: z.string().optional()
})

export const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address')
})

export const changePasswordSchema = z.object({
  current_password: z.string().min(6),
  new_password: z.string().min(6, 'New password must be at least 6 characters')
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type EventBookingInput = z.infer<typeof eventBookingSchema>
export type DiningReservationInput = z.infer<typeof diningReservationSchema>
export type LoiRequestInput = z.infer<typeof loiRequestSchema>
export type PasswordResetInput = z.infer<typeof passwordResetSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
