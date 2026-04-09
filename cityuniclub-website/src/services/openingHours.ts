import { EDGE_FUNCTIONS_URL } from './supabase'

export interface DayHours {
  open_time: string | null   // 'HH:MM' or null
  close_time: string | null
  is_closed: boolean
  note?: string | null
}

/** Returns opening hours for today from the edge function. */
export async function getTodayHours(): Promise<DayHours | null> {
  const response = await fetch(`${EDGE_FUNCTIONS_URL}/opening-hours`)
  if (!response.ok) return null
  const data = await response.json()
  return data.hours ?? null
}

export function formatTime(t: string): string {
  const [h, m] = t.split(':').map(Number)
  const suffix = h >= 12 ? 'pm' : 'am'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return m === 0 ? `${hour}${suffix}` : `${hour}:${m.toString().padStart(2, '0')}${suffix}`
}
