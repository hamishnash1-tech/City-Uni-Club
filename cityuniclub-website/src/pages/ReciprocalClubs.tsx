import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setLoiRequest } from '../slices/uiSlice'
import { api, ReciprocalClub } from '../services/api'
import { RootState } from '../store'
import { IconClubs } from '../icons'

const REGION_GROUPS = [
  { label: 'United Kingdom', regions: ['United Kingdom'] },
  { label: 'Ireland',        regions: ['Ireland'] },
  { label: 'Europe',         regions: ['Europe'] },
  { label: 'USA',            regions: ['USA'] },
  { label: 'Canada',         regions: ['Canada'] },
  { label: 'Americas',       regions: ['Americas', 'South America'] },
  { label: 'Asia',           regions: ['Asia'] },
  { label: 'Middle East',    regions: ['Middle East'] },
  { label: 'Africa',         regions: ['Africa'] },
  { label: 'Australasia',    regions: ['Australia', 'Oceania'] },
]

type View = 'regions' | 'countries' | 'cities' | 'clubs' | 'search'

const SlotCount: React.FC<{ value: number; instant?: boolean }> = ({ value, instant = false }) => {
  const [displayed, setDisplayed] = useState(instant ? value : 0)
  const animRef = useRef<number | null>(null)
  const fromRef = useRef(instant ? value : 0)

  useEffect(() => {
    if (instant) { setDisplayed(value); fromRef.current = value; return }
    if (animRef.current) cancelAnimationFrame(animRef.current)
    const from = fromRef.current
    const to = value
    const duration = Math.min(Math.abs(to - from) * 5, 700)
    const startTime = performance.now()

    const tick = (now: number) => {
      const elapsed = now - startTime
      const progress = duration === 0 ? 1 : Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplayed(Math.round(from + (to - from) * eased))
      if (progress < 1) {
        animRef.current = requestAnimationFrame(tick)
      } else {
        fromRef.current = to
      }
    }

    animRef.current = requestAnimationFrame(tick)
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current) }
  }, [value, instant])

  return <>{displayed}</>
}

import { allSingleClub, clubInitial } from '../utils/clubUtils'
export { allSingleClub }

// Module-level caches — persist across navigation/remounts
const _regionCountsCache: { data: Record<string, number> | null } = { data: null }
const _countryCache = new Map<string, { country: string; count: number }[]>()
const _clubCache    = new Map<string, ReciprocalClub[]>()
const _cityCache    = new Map<string, { city: string; count: number }[]>()    // key: "region|country"
const _cityClubCache = new Map<string, ReciprocalClub[]>()                    // key: "region|country|city"

export const ReciprocalClubs: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const authToken = token!

  if (!isAuthenticated) {
    return (
      <div className="bg-navy-deep">
        <div className="bg-cambridge/15 pt-7 pb-5 px-4 border-b border-cambridge/20">
          <div className="flex items-center justify-center gap-2 text-ivory">
            <IconClubs />
            <h1 className="font-serif text-2xl font-normal text-ivory">Reciprocal Clubs</h1>
          </div>
        </div>
        <div className="max-w-lg mx-auto px-6 py-10 text-center">
          <div className="mb-8">
            <h2 className="font-serif text-3xl font-normal text-ivory mb-4 leading-snug">
              A World of Distinguished Clubs Awaits
            </h2>
            <p className="text-ivory/55 leading-relaxed mb-3">
              As a City University Club member, you enjoy privileged access to over 450 reciprocal clubs across the globe — from Hong Kong to New York, Edinburgh to Sydney.
            </p>
            <p className="text-ivory/40 text-sm leading-relaxed">
              Sign in to explore clubs by region. A Letter of Introduction grants you access as a guest member of any reciprocal club.
            </p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="btn-primary"
          >
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const regionParam  = searchParams.get('region')
  const countryParam = searchParams.get('country')
  const cityParam    = searchParams.get('city')
  const queryParam   = searchParams.get('q')

  const selectedGroup   = REGION_GROUPS.find(g => g.label === regionParam) ?? null
  const selectedCountry = countryParam

  const view: View = queryParam
    ? 'search'
    : cityParam
    ? 'clubs'
    : countryParam
    ? 'cities'
    : regionParam
    ? 'countries'
    : 'regions'

  const [searchInput, setSearchInput] = useState(queryParam ?? '')

  const [regionCounts, setRegionCounts]   = useState<Record<string, number>>({})
  const [countryCounts, setCountryCounts] = useState<{ country: string; count: number }[]>([])
  const [cityCounts, setCityCounts]       = useState<{ city: string; count: number }[]>([])
  const [clubs, setClubs]                 = useState<ReciprocalClub[]>([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const fetch_ = useCallback(async (fn: () => Promise<void>) => {
    setLoading(true)
    setError(null)
    try { await fn() } catch { setError('Failed to load') }
    finally { setLoading(false) }
  }, [])

  // Tracks which params were pre-fetched by handlers (to avoid double-fetch on URL change)
  const prefetchedRef = useRef<string>('')
  const retryFnRef    = useRef<(() => void) | null>(null)

  const [regionCountsFromCache] = useState(() => !!_regionCountsCache.data)

  // Load region counts on mount (use cache if available)
  useEffect(() => {
    if (_regionCountsCache.data) {
      setRegionCounts(_regionCountsCache.data)
      return
    }
    const run = () => fetch_(() => api.getClubRegionCounts(authToken).then(counts => {
      _regionCountsCache.data = counts
      setRegionCounts(counts)
    }))
    retryFnRef.current = run
    run()
  }, [authToken])

  // Handle browser back/forward and deep links by reacting to URL param changes
  useEffect(() => {
    const key = `${regionParam ?? ''}|${countryParam ?? ''}|${cityParam ?? ''}|${queryParam ?? ''}`
    if (prefetchedRef.current === key) return  // already loaded by a handler

    if (queryParam) {
      setSearchInput(queryParam)
      const run = () => fetch_(() => api.searchClubs(authToken, queryParam).then(setClubs))
      retryFnRef.current = run; run()
    } else if (regionParam && countryParam && cityParam) {
      const cacheKey = `${regionParam}|${countryParam}|${cityParam}`
      const cached = _cityClubCache.get(cacheKey)
      if (cached) { setClubs(cached); return }
      const group = REGION_GROUPS.find(g => g.label === regionParam)
      if (group) {
        const run = () => cityParam === '__rest__'
          ? fetch_(() => api.getClubsExcludingCity(authToken, group.regions, countryParam, 'London').then(results => {
              _cityClubCache.set(cacheKey, results)
              setClubs(results)
            }))
          : cityParam === '__all__'
          ? fetch_(() => api.getClubsByCountry(authToken, group.regions, countryParam).then(results => {
              _cityClubCache.set(cacheKey, results)
              setClubs(results)
            }))
          : fetch_(() => api.getClubsByCity(authToken, group.regions, countryParam, cityParam).then(results => {
              _cityClubCache.set(cacheKey, results)
              setClubs(results)
            }))
        retryFnRef.current = run; run()
      }
    } else if (regionParam && countryParam) {
      const cacheKey = `${regionParam}|${countryParam}`
      const cached = _cityCache.get(cacheKey)
      if (cached) {
        setCityCounts(cached)
        if (cached.length === 1) {
          const onlyCity = cached[0].city
          prefetchedRef.current = `${regionParam}|${countryParam}|${onlyCity}|`
          setSearchParams({ region: regionParam, country: countryParam, city: onlyCity }, { replace: true })
        }
        return
      }
      const group = REGION_GROUPS.find(g => g.label === regionParam)
      if (group) {
        const run = () => fetch_(() => api.getClubCityCounts(authToken, group.regions, countryParam).then(cities => {
          _cityCache.set(cacheKey, cities)
          setCityCounts(cities)
          if (cities.length === 1) {
            const onlyCity = cities[0].city
            prefetchedRef.current = `${regionParam}|${countryParam}|${onlyCity}|`
            setSearchParams({ region: regionParam, country: countryParam, city: onlyCity }, { replace: true })
          }
        }))
        retryFnRef.current = run; run()
      }
    } else if (regionParam) {
      const cached = _countryCache.get(regionParam)
      if (cached) { setCountryCounts(cached); return }
      const group = REGION_GROUPS.find(g => g.label === regionParam)
      if (group) {
        const run = () => fetch_(() => api.getClubCountryCounts(authToken, group.regions).then(counts => {
          _countryCache.set(regionParam, counts)
          setCountryCounts(counts)
          if (counts.length === 1) {
            const key2 = `${regionParam}|${counts[0].country}||`
            prefetchedRef.current = key2
            setSearchParams({ region: regionParam, country: counts[0].country }, { replace: true })
          }
        }))
        retryFnRef.current = run; run()
      }
    }
  }, [regionParam, countryParam, cityParam, queryParam, authToken])

  const handleSelectGroup = (group: typeof REGION_GROUPS[0]) => {
    retryFnRef.current = () => handleSelectGroup(group)
    const cachedCounts = _countryCache.get(group.label)

    if (cachedCounts) {
      setCountryCounts(cachedCounts)
      if (cachedCounts.length === 1) {
        const only = cachedCounts[0].country
        const cachedCities = _cityCache.get(`${group.label}|${only}`)
        if (cachedCities) {
          setCityCounts(cachedCities)
          if (cachedCities.length === 1) {
            const onlyCity = cachedCities[0].city
            const cachedCityClubs = _cityClubCache.get(`${group.label}|${only}|${onlyCity}`)
            if (cachedCityClubs) {
              setClubs(cachedCityClubs)
              prefetchedRef.current = `${group.label}|${only}|${onlyCity}|`
              setSearchParams({ region: group.label, country: only, city: onlyCity })
              return
            }
            setLoading(true)
            setError(null)
            api.getClubsByCity(authToken, group.regions, only, onlyCity)
              .then(results => {
                _cityClubCache.set(`${group.label}|${only}|${onlyCity}`, results)
                setClubs(results)
                prefetchedRef.current = `${group.label}|${only}|${onlyCity}|`
                setSearchParams({ region: group.label, country: only, city: onlyCity })
              })
              .catch(() => setError('Failed to load'))
              .finally(() => setLoading(false))
            return
          }
          prefetchedRef.current = `${group.label}|${only}||`
          setSearchParams({ region: group.label, country: only })
          return
        }
        // No city cache — fetch cities now
        setLoading(true)
        setError(null)
        api.getClubCityCounts(authToken, group.regions, only)
          .then(cities => {
            _cityCache.set(`${group.label}|${only}`, cities)
            setCityCounts(cities)
            if (cities.length === 1) {
              const onlyCity = cities[0].city
              return api.getClubsByCity(authToken, group.regions, only, onlyCity).then(results => {
                _cityClubCache.set(`${group.label}|${only}|${onlyCity}`, results)
                setClubs(results)
                prefetchedRef.current = `${group.label}|${only}|${onlyCity}|`
                setSearchParams({ region: group.label, country: only, city: onlyCity })
              })
            }
            if (allSingleClub(cities)) {
              return api.getClubsByCountry(authToken, group.regions, only).then(results => {
                _cityClubCache.set(`${group.label}|${only}|__all__`, results)
                setClubs(results)
                prefetchedRef.current = `${group.label}|${only}|__all__|`
                setSearchParams({ region: group.label, country: only, city: '__all__' })
              })
            }
            prefetchedRef.current = `${group.label}|${only}||`
            setSearchParams({ region: group.label, country: only })
          })
          .catch(() => setError('Failed to load'))
          .finally(() => setLoading(false))
        return
      } else {
        prefetchedRef.current = `${group.label}|||`
        setSearchParams({ region: group.label })
        return
      }
    }

    setLoading(true)
    setError(null)
    api.getClubCountryCounts(authToken, group.regions)
      .then(counts => {
        _countryCache.set(group.label, counts)
        setCountryCounts(counts)
        if (counts.length === 1) {
          const only = counts[0].country
          return api.getClubCityCounts(authToken, group.regions, only).then(cities => {
            _cityCache.set(`${group.label}|${only}`, cities)
            setCityCounts(cities)
            if (cities.length === 1) {
              const onlyCity = cities[0].city
              return api.getClubsByCity(authToken, group.regions, only, onlyCity).then(results => {
                _cityClubCache.set(`${group.label}|${only}|${onlyCity}`, results)
                setClubs(results)
                prefetchedRef.current = `${group.label}|${only}|${onlyCity}|`
                setSearchParams({ region: group.label, country: only, city: onlyCity })
              })
            }
            if (allSingleClub(cities)) {
              return api.getClubsByCountry(authToken, group.regions, only).then(results => {
                _cityClubCache.set(`${group.label}|${only}|__all__`, results)
                setClubs(results)
                prefetchedRef.current = `${group.label}|${only}|__all__|`
                setSearchParams({ region: group.label, country: only, city: '__all__' })
              })
            }
            prefetchedRef.current = `${group.label}|${only}||`
            setSearchParams({ region: group.label, country: only })
          })
        }
        prefetchedRef.current = `${group.label}|||`
        setSearchParams({ region: group.label })
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }

  const handleSelectCountry = (country: string) => {
    retryFnRef.current = () => handleSelectCountry(country)
    const cityCacheKey = `${regionParam}|${country}`
    const cachedCities = _cityCache.get(cityCacheKey)

    if (cachedCities) {
      setCityCounts(cachedCities)
      if (cachedCities.length === 1) {
        const onlyCity = cachedCities[0].city
        const cachedCityClubs = _cityClubCache.get(`${regionParam}|${country}|${onlyCity}`)
        if (cachedCityClubs) {
          setClubs(cachedCityClubs)
          prefetchedRef.current = `${regionParam}|${country}|${onlyCity}|`
          setSearchParams({ region: regionParam!, country, city: onlyCity })
          return
        }
        setLoading(true)
        setError(null)
        api.getClubsByCity(authToken, selectedGroup!.regions, country, onlyCity)
          .then(results => {
            _cityClubCache.set(`${regionParam}|${country}|${onlyCity}`, results)
            setClubs(results)
            prefetchedRef.current = `${regionParam}|${country}|${onlyCity}|`
            setSearchParams({ region: regionParam!, country, city: onlyCity })
          })
          .catch(() => setError('Failed to load'))
          .finally(() => setLoading(false))
        return
      }
      if (allSingleClub(cachedCities)) {
        const cachedAll = _cityClubCache.get(`${regionParam}|${country}|__all__`)
        if (cachedAll) {
          setClubs(cachedAll)
          prefetchedRef.current = `${regionParam}|${country}|__all__|`
          setSearchParams({ region: regionParam!, country, city: '__all__' })
          return
        }
        setLoading(true)
        setError(null)
        api.getClubsByCountry(authToken, selectedGroup!.regions, country)
          .then(results => {
            _cityClubCache.set(`${regionParam}|${country}|__all__`, results)
            setClubs(results)
            prefetchedRef.current = `${regionParam}|${country}|__all__|`
            setSearchParams({ region: regionParam!, country, city: '__all__' })
          })
          .catch(() => setError('Failed to load'))
          .finally(() => setLoading(false))
        return
      }
      prefetchedRef.current = `${regionParam}|${country}||`
      setSearchParams({ region: regionParam!, country })
      return
    }

    setLoading(true)
    setError(null)
    api.getClubCityCounts(authToken, selectedGroup!.regions, country)
      .then(cities => {
        _cityCache.set(cityCacheKey, cities)
        setCityCounts(cities)
        if (cities.length === 1) {
          const onlyCity = cities[0].city
          return api.getClubsByCity(authToken, selectedGroup!.regions, country, onlyCity).then(results => {
            _cityClubCache.set(`${regionParam}|${country}|${onlyCity}`, results)
            setClubs(results)
            prefetchedRef.current = `${regionParam}|${country}|${onlyCity}|`
            setSearchParams({ region: regionParam!, country, city: onlyCity })
          })
        }
        if (allSingleClub(cities)) {
          return api.getClubsByCountry(authToken, selectedGroup!.regions, country).then(results => {
            _cityClubCache.set(`${regionParam}|${country}|__all__`, results)
            setClubs(results)
            prefetchedRef.current = `${regionParam}|${country}|__all__|`
            setSearchParams({ region: regionParam!, country, city: '__all__' })
          })
        }
        prefetchedRef.current = `${regionParam}|${country}||`
        setSearchParams({ region: regionParam!, country })
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }

  const handleSelectCity = (city: string) => {
    retryFnRef.current = () => handleSelectCity(city)
    const cacheKey = `${regionParam}|${countryParam}|${city}`
    const cachedClubs = _cityClubCache.get(cacheKey)

    if (cachedClubs) {
      setClubs(cachedClubs)
      prefetchedRef.current = `${regionParam}|${countryParam}|${city}|`
      setSearchParams({ region: regionParam!, country: countryParam!, city })
      return
    }

    setLoading(true)
    setError(null)
    api.getClubsByCity(authToken, selectedGroup!.regions, countryParam!, city)
      .then(results => {
        _cityClubCache.set(cacheKey, results)
        setClubs(results)
        prefetchedRef.current = `${regionParam}|${countryParam}|${city}|`
        setSearchParams({ region: regionParam!, country: countryParam!, city })
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }

  const handleSelectRestOfEngland = () => {
    retryFnRef.current = handleSelectRestOfEngland
    const cacheKey = `${regionParam}|${countryParam}|__rest__`
    const cached = _cityClubCache.get(cacheKey)
    if (cached) {
      setClubs(cached)
      prefetchedRef.current = `${regionParam}|${countryParam}|__rest__|`
      setSearchParams({ region: regionParam!, country: countryParam!, city: '__rest__' })
      return
    }
    setLoading(true)
    setError(null)
    api.getClubsExcludingCity(authToken, selectedGroup!.regions, countryParam!, 'London')
      .then(results => {
        _cityClubCache.set(cacheKey, results)
        setClubs(results)
        prefetchedRef.current = `${regionParam}|${countryParam}|__rest__|`
        setSearchParams({ region: regionParam!, country: countryParam!, city: '__rest__' })
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }

  const handleSearch = () => {
    if (!searchInput.trim()) return
    const q = searchInput.trim()
    setLoading(true)
    setError(null)
    retryFnRef.current = () => handleSearch()
    api.searchClubs(authToken, q)
      .then(results => {
        setClubs(results)
        const key = `||${q}`
        prefetchedRef.current = key
        setSearchParams({ q })
      })
      .catch(() => setError('Failed to load'))
      .finally(() => setLoading(false))
  }

  const handleRequestLOI = (club: ReciprocalClub) => {
    if (!token) { navigate('/login'); return }
    dispatch(setLoiRequest({
      club_id: club.id,
      club_name: club.name,
      club_location: club.location,
      club_country: club.country,
      arrival_date: '',
      departure_date: '',
      purpose: 'Business',
    }))
    navigate('/loi-request')
  }

  const groupCount = (group: typeof REGION_GROUPS[0]) =>
    group.regions.reduce((sum, r) => sum + (regionCounts[r] ?? 0), 0)

  const ClubCard = ({ club }: { club: ReciprocalClub }) => (
    <div className="club-card p-4 hover:shadow-card-hover transition group">
      <div className="flex items-start space-x-3">
        <div className="w-11 h-11 bg-ivory-warm border border-ivory-border rounded-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
          {club.logo_path ? (
            <img src={club.logo_path} alt={club.name} className="w-full h-full object-contain p-1" />
          ) : (
            <span className="font-serif text-oxford-blue font-normal text-base">{clubInitial(club.name)}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-oxford-blue text-sm leading-snug">{club.name}</h3>
          <p className="text-xs text-ink-mid mt-0.5">{club.location}{club.country && view === 'search' ? ` · ${club.country}` : ''}</p>
          {club.note && <p className="text-xs text-cambridge-muted italic mt-0.5">{club.note}</p>}
        </div>
        <button
          onClick={() => handleRequestLOI(club)}
          title="Letter of Introduction"
          className="btn-outline-navy flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        >
          Request LOI
        </button>
      </div>
    </div>
  )

  const Spinner = () => (
    <div className="flex justify-center py-12">
      <div className="w-6 h-6 border-2 border-cambridge/30 border-t-cambridge rounded-full animate-spin" />
    </div>
  )

  const totalClubs    = Object.values(regionCounts).reduce((a, b) => a + b, 0)
  const groupTotal    = selectedGroup ? groupCount(selectedGroup) : 0
  const cityCountsTotal = cityCounts.reduce((a, b) => a + b.count, 0)
  const countryTotal  = selectedCountry
    ? (cityCountsTotal || countryCounts.find(c => c.country === selectedCountry)?.count || clubs.length)
    : 0

  const Breadcrumb = () => (
    <div className="py-3 flex items-center gap-2 text-sm text-ivory/40">
      <button
        onClick={() => setSearchParams({})}
        className={view === 'regions' ? 'text-ivory/70' : 'hover:text-cambridge transition'}
      >
        All clubs {totalClubs > 0 && <span className="text-ivory/30">({totalClubs})</span>}
      </button>
      {selectedGroup && (
        <>
          <span>/</span>
          <button
            onClick={() => setSearchParams({ region: selectedGroup.label })}
            className={view === 'countries' ? 'text-ivory/70' : 'hover:text-cambridge transition'}
          >
            {selectedGroup.label} <span className="text-ivory/30">({groupTotal})</span>
          </button>
        </>
      )}
      {selectedCountry && selectedCountry !== selectedGroup?.label && selectedCountry !== cityParam && (
        <>
          <span>/</span>
          {(view === 'clubs' || view === 'search') && cityParam ? (
            <button
              onClick={() => setSearchParams({ region: regionParam!, country: countryParam! })}
              className="hover:text-cambridge transition"
            >
              {selectedCountry} <span className="text-ivory/30">({countryTotal})</span>
            </button>
          ) : (
            <span className="text-ivory/70">{selectedCountry} <span className="text-ivory/30">({countryTotal})</span></span>
          )}
        </>
      )}
      {cityParam && cityParam !== '__all__' && (
        <>
          <span>/</span>
          <span className="text-ivory/70">
            {cityParam === '__rest__' ? 'Rest of England' : cityParam} <span className="text-ivory/30">({clubs.length})</span>
          </span>
        </>
      )}
      {view === 'search' && (
        <>
          <span>/</span>
          <span className="text-ivory/70">Search: "{queryParam}" <span className="text-ivory/30">({clubs.length})</span></span>
        </>
      )}
    </div>
  )

  return (
    <div className="bg-navy-deep">
      {/* Header */}
      <div className="bg-cambridge/15 pt-7 pb-5 border-b border-cambridge/20">
        <div className="max-w-2xl mx-auto px-4 relative flex items-center justify-center">
          {view !== 'regions' && (
            <button onClick={() => navigate(-1)} className="absolute left-4 text-ivory/60 hover:text-ivory transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <div className="flex items-center gap-2 text-ivory">
            <IconClubs />
            <h1 className="font-serif text-2xl font-normal">Reciprocal Clubs</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        <Breadcrumb />

        {error && (
          <div className="mb-4 border-l-4 border-red-400/60 bg-red-900/20 px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-red-300/80 text-sm">Unable to load clubs. Please try again later.</p>
            {retryFnRef.current && (
              <button
                onClick={() => { setError(null); retryFnRef.current?.() }}
                className="label-caps text-cambridge-light/70 hover:text-cambridge-light transition flex-shrink-0"
              >
                Retry
              </button>
            )}
          </div>
        )}

        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search clubs by name or location..."
              className="club-input-dark pl-9 text-sm py-2"
            />
            <svg className="w-4 h-4 text-ivory/30 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchInput.trim()}
            className="px-4 py-2 bg-cambridge/20 hover:bg-cambridge/30 text-cambridge-light text-sm rounded-sm border border-cambridge/30 transition disabled:opacity-30 disabled:cursor-not-allowed label-caps"
          >
            Search
          </button>
        </div>

        <div>

        {/* Regions */}
        {view === 'regions' && (
          <>
            <div className="club-card border-l-4 border-cambridge/50 p-5 mb-4">
              <h2 className="font-serif text-oxford-blue font-normal mb-2">Letter of Introduction</h2>
              <p className="text-ink-mid text-sm leading-relaxed">
                When visiting reciprocal clubs, you may need a Letter of Introduction.
                Please request your LOI at least 7 days before your visit.
              </p>
            </div>
            {loading && Object.keys(regionCounts).length === 0 ? <Spinner /> : (
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 transition-opacity duration-500 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                {REGION_GROUPS.map(group => (
                  <button key={group.label} onClick={() => handleSelectGroup(group)}
                    disabled={loading}
                    className="club-card p-4 text-left hover:shadow-card-hover transition group">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-serif text-oxford-blue text-base font-normal group-hover:text-cambridge-muted transition">{group.label}</h3>
                        <p className="label-caps text-ink-light mt-1"><SlotCount value={groupCount(group)} instant={regionCountsFromCache} /> clubs</p>
                      </div>
                      <svg className="w-4 h-4 text-cambridge/40 group-hover:text-cambridge transition mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {/* Countries */}
        {view === 'countries' && (
          loading && countryCounts.length === 0 ? <Spinner /> : (
            <div className={`space-y-2 transition-opacity duration-500 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
              {countryCounts.map(({ country, count }) => (
                <button key={country} onClick={() => handleSelectCountry(country)}
                  disabled={loading}
                  className="club-card p-4 w-full text-left hover:shadow-card-hover transition group flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-oxford-blue text-base font-normal group-hover:text-cambridge-muted transition">{country}</h3>
                    <p className="label-caps text-ink-light mt-0.5">{count} clubs</p>
                  </div>
                  <svg className="w-4 h-4 text-cambridge/40 group-hover:text-cambridge transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>
          )
        )}

        {/* Cities */}
        {view === 'cities' && (
          loading && cityCounts.length === 0 ? <Spinner /> : (() => {
            const chevron = (
              <svg className="w-4 h-4 text-cambridge/40 group-hover:text-cambridge transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            )
            if (selectedCountry === 'England') {
              const londonCount = cityCounts.find(c => c.city === 'London')?.count ?? 0
              const restCount   = cityCounts.filter(c => c.city !== 'London').reduce((a, b) => a + b.count, 0)
              return (
                <div className={`space-y-2 transition-opacity duration-500 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                  {londonCount > 0 && (
                    <button onClick={() => handleSelectCity('London')} disabled={loading}
                      className="club-card p-4 w-full text-left hover:shadow-card-hover transition group flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-oxford-blue text-base font-normal group-hover:text-cambridge-muted transition">London</h3>
                        <p className="label-caps text-ink-light mt-0.5">{londonCount} clubs</p>
                      </div>
                      {chevron}
                    </button>
                  )}
                  {restCount > 0 && (
                    <button onClick={handleSelectRestOfEngland} disabled={loading}
                      className="club-card p-4 w-full text-left hover:shadow-card-hover transition group flex items-center justify-between">
                      <div>
                        <h3 className="font-serif text-oxford-blue text-base font-normal group-hover:text-cambridge-muted transition">Rest of England</h3>
                        <p className="label-caps text-ink-light mt-0.5">{restCount} clubs</p>
                      </div>
                      {chevron}
                    </button>
                  )}
                </div>
              )
            }
            return (
              <div className={`space-y-2 transition-opacity duration-500 ${loading ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                {cityCounts.map(({ city, count }) => (
                  <button key={city} onClick={() => handleSelectCity(city)}
                    disabled={loading}
                    className="club-card p-4 w-full text-left hover:shadow-card-hover transition group flex items-center justify-between">
                    <div>
                      <h3 className="font-serif text-oxford-blue text-base font-normal group-hover:text-cambridge-muted transition">{city}</h3>
                      <p className="label-caps text-ink-light mt-0.5">{count} clubs</p>
                    </div>
                    {chevron}
                  </button>
                ))}
              </div>
            )
          })()
        )}

        {/* Clubs + Search */}
        {(view === 'clubs' || view === 'search') && (
          loading ? <Spinner /> : (
            clubs.length === 0
              ? <p className="text-center text-ivory/40 py-12">No clubs found</p>
              : <div className="space-y-2">
                  {clubs.map((club, i) => <ClubCard key={i} club={club} />)}
                </div>
          )
        )}

        </div>
      </div>
    </div>
  )
}
