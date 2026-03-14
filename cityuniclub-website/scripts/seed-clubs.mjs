/**
 * Seed reciprocal_clubs table from static data file.
 * Checks if a logo file exists locally and sets logo_path accordingly.
 *
 * Usage: node scripts/seed-clubs.mjs
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars, or reads
 * from hardcoded values below.
 */

import { readFileSync, existsSync } from 'fs'
import { createClient } from '@supabase/supabase-js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://myfoyoyjtkqthjjvabmn.supabase.co'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im15Zm95b3lqdGtxdGhqanZhYm1uIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MjIwMjk0MCwiZXhwIjoyMDg3Nzc4OTQwfQ.6KeM30VOjJLg0MJXq8gR6OjAgV_UrQDIB87wBobFZjA'

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)

const LOGOS_DIR = join(__dirname, '../public/assets/club-logos')
const LOGO_EXTENSIONS = ['.png', '.jpg', '.svg', '.webp', '.ico', '.jpeg', '.gif']

function logoKey(region, location, name) {
  const clean = s => s.replace(/['&]/g, '').replace(/\s+/g, '_')
  return `${clean(region)}_${clean(location)}_${clean(name)}`
}

function findLogoPath(region, location, name) {
  const key = logoKey(region, location, name)
  for (const ext of LOGO_EXTENSIONS) {
    if (existsSync(join(LOGOS_DIR, key + ext))) {
      return `/assets/club-logos/${key}${ext}`
    }
  }
  return null
}

// NOTE: reciprocalClubs.ts has been deleted after seeding.
// To re-seed, restore the file first or provide the data another way.
function loadClubs() {
  const src = readFileSync(join(__dirname, '../src/data/reciprocalClubs.ts'), 'utf-8')
  const js = src
    .replace(/export interface Club \{[\s\S]*?\n\}/m, '')
    .replace(/: Club\[\]/, '')
    .replace(/^export const /m, 'const ')
  const fn = new Function(js + '\nreturn reciprocalClubs;')
  return fn()
}

async function main() {
  const clubs = loadClubs()
  console.log(`Loaded ${clubs.length} clubs from source file`)

  let inserted = 0, updated = 0, errors = 0

  for (const club of clubs) {
    const logo_path = findLogoPath(club.region, club.location, club.name)

    const record = {
      name: club.name,
      location: club.location,
      region: club.region,
      country: club.country,
      note: club.note || null,
      contact_email: club.contact_email || null,
      logo_path,
      is_active: true,
    }

    if (club.id) record.id = club.id

    const { error } = await supabase
      .from('reciprocal_clubs')
      .insert(record)

    if (error) {
      console.error(`✗ ${club.name} (${club.location}):`, error.message)
      errors++
    } else {
      const hasLogo = logo_path ? '🖼' : '  '
      console.log(`${hasLogo} ${club.name} — ${club.location}`)
      inserted++
    }
  }

  console.log(`\nDone: ${inserted} upserted, ${errors} errors`)
  console.log(`Logos found: ${clubs.filter(c => findLogoPath(c.region, c.location, c.name)).length}/${clubs.length}`)
}

main().catch(console.error)
