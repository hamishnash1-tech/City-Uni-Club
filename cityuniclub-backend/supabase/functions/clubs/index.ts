import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { getCorsHeaders } from '../_shared/cors.ts'

serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req)

  function json(data: unknown, status = 200) {
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status,
    })
  }

  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) return json({ error: 'Unauthorized' }, 401)

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    const { data: session } = await supabase
      .from('sessions')
      .select('member_id, expires_at')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (!session) return json({ error: 'Unauthorized' }, 401)

    const url = new URL(req.url)
    const regionsParam  = url.searchParams.get('regions')   // comma-separated DB region values
    const country       = url.searchParams.get('country')
    const city          = url.searchParams.get('city')
    const excludeCity   = url.searchParams.get('exclude_city')
    const allClubs      = url.searchParams.get('all_clubs')
    const search        = url.searchParams.get('search')

    const regions = regionsParam ? regionsParam.split(',').map(r => r.trim()) : []

    // --- Search mode ---
    if (search) {
      const { data, error } = await supabase
        .from('reciprocal_clubs')
        .select('id, name, location, region, country, note, contact_email, logo_path')
        .eq('is_active', true)
        .or(`name.ilike.%${search}%,location.ilike.%${search}%`)
        .order('country').order('name')

      if (error) throw error
      return json({ clubs: data })
    }

    // --- Club list mode (region + country + city) ---
    if (regions.length && country && city) {
      const { data, error } = await supabase
        .from('reciprocal_clubs')
        .select('id, name, location, region, country, note, contact_email, logo_path')
        .eq('is_active', true)
        .in('region', regions)
        .eq('country', country)
        .eq('location', city)
        .order('name')

      if (error) throw error
      return json({ clubs: data })
    }

    // --- All clubs for a country (no city breakdown) ---
    if (regions.length && country && allClubs) {
      const { data, error } = await supabase
        .from('reciprocal_clubs')
        .select('id, name, location, region, country, note, contact_email, logo_path')
        .eq('is_active', true)
        .in('region', regions)
        .eq('country', country)
        .order('location').order('name')

      if (error) throw error
      return json({ clubs: data })
    }

    // --- All clubs for country excluding a city (e.g. Rest of England) ---
    if (regions.length && country && excludeCity) {
      const { data, error } = await supabase
        .from('reciprocal_clubs')
        .select('id, name, location, region, country, note, contact_email, logo_path')
        .eq('is_active', true)
        .in('region', regions)
        .eq('country', country)
        .neq('location', excludeCity)
        .order('location').order('name')

      if (error) throw error
      return json({ clubs: data })
    }

    // --- City counts mode (region + country, no city) ---
    if (regions.length && country) {
      const { data, error } = await supabase
        .from('reciprocal_clubs')
        .select('location')
        .eq('is_active', true)
        .in('region', regions)
        .eq('country', country)

      if (error) throw error

      const counts: Record<string, number> = {}
      for (const row of data ?? []) {
        counts[row.location] = (counts[row.location] ?? 0) + 1
      }
      const cities = Object.entries(counts)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => a.city.localeCompare(b.city))

      return json({ cities })
    }

    // --- Country counts mode (region selected) ---
    if (regions.length) {
      const { data, error } = await supabase
        .from('reciprocal_clubs')
        .select('country')
        .eq('is_active', true)
        .in('region', regions)

      if (error) throw error

      const counts: Record<string, number> = {}
      for (const row of data ?? []) {
        counts[row.country] = (counts[row.country] ?? 0) + 1
      }
      const countries = Object.entries(counts)
        .map(([country, count]) => ({ country, count }))
        .sort((a, b) => a.country.localeCompare(b.country))

      return json({ countries })
    }

    // --- Region counts mode (default) ---
    const { data, error } = await supabase
      .from('reciprocal_clubs')
      .select('region')
      .eq('is_active', true)

    if (error) throw error

    const counts: Record<string, number> = {}
    for (const row of data ?? []) {
      counts[row.region] = (counts[row.region] ?? 0) + 1
    }
    return json({ regions: counts })

  } catch (err: any) {
    return json({ error: err.message }, 400)
  }
})
