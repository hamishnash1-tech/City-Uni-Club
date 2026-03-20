import { Event } from '../services/api'

export function eventSlug(event: Event): string {
  const datePart = event.event_date ?? 'tba'
  const titlePart = event.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
  return `${datePart}-${titlePart}--${event.id}`
}

export function idFromSlug(slug: string): string {
  const parts = slug.split('--')
  return parts[parts.length - 1]
}
