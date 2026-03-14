import { useState, useEffect, useCallback, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setLoiRequest } from '../slices/uiSlice'
import { api, ReciprocalClub } from '../services/api'
import { RootState } from '../store'
import { allSingleClub } from '../utils/clubUtils'

export const REGION_GROUPS = [
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

export type RegionGroup = typeof REGION_GROUPS[0]
export type View = 'regions' | 'countries' | 'cities' | 'clubs' | 'search'

// Module-level caches — persist across navigation/remounts
const _regionCountsCache: { data: Record<string, number> | null } = { data: null }
const _countryCache  = new Map<string, { country: string; count: number }[]>()
const _cityCache     = new Map<string, { city: string; count: number }[]>()
const _cityClubCache = new Map<string, ReciprocalClub[]>()

export function useReciprocalClubs() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { token, isAuthenticated } = useSelector((state: RootState) => state.auth)
  const authToken = token!

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

  const [searchInput, setSearchInput]     = useState(queryParam ?? '')
  const [regionCounts, setRegionCounts]   = useState<Record<string, number>>({})
  const [countryCounts, setCountryCounts] = useState<{ country: string; count: number }[]>([])
  const [cityCounts, setCityCounts]       = useState<{ city: string; count: number }[]>([])
  const [clubs, setClubs]                 = useState<ReciprocalClub[]>([])
  const [loading, setLoading]             = useState(false)
  const [error, setError]                 = useState<string | null>(null)

  const prefetchedRef = useRef<string>('')
  const retryFnRef    = useRef<(() => void) | null>(null)

  const [regionCountsFromCache] = useState(() => !!_regionCountsCache.data)

  const fetch_ = useCallback(async (fn: () => Promise<void>) => {
    setLoading(true)
    setError(null)
    try { await fn() } catch { setError('Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (_regionCountsCache.data) { setRegionCounts(_regionCountsCache.data); return }
    const run = () => fetch_(() => api.getClubRegionCounts(authToken).then(counts => {
      _regionCountsCache.data = counts
      setRegionCounts(counts)
    }))
    retryFnRef.current = run
    run()
  }, [authToken])

  useEffect(() => {
    const key = `${regionParam ?? ''}|${countryParam ?? ''}|${cityParam ?? ''}|${queryParam ?? ''}`
    if (prefetchedRef.current === key) return

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
              _cityClubCache.set(cacheKey, results); setClubs(results)
            }))
          : cityParam === '__all__'
          ? fetch_(() => api.getClubsByCountry(authToken, group.regions, countryParam).then(results => {
              _cityClubCache.set(cacheKey, results); setClubs(results)
            }))
          : fetch_(() => api.getClubsByCity(authToken, group.regions, countryParam, cityParam).then(results => {
              _cityClubCache.set(cacheKey, results); setClubs(results)
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
            prefetchedRef.current = `${regionParam}|${counts[0].country}||`
            setSearchParams({ region: regionParam, country: counts[0].country }, { replace: true })
          }
        }))
        retryFnRef.current = run; run()
      }
    }
  }, [regionParam, countryParam, cityParam, queryParam, authToken])

  const handleSelectGroup = (group: RegionGroup) => {
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
            setLoading(true); setError(null)
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
        setLoading(true); setError(null)
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
      }
      prefetchedRef.current = `${group.label}|||`
      setSearchParams({ region: group.label })
      return
    }

    setLoading(true); setError(null)
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
        setLoading(true); setError(null)
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
        setLoading(true); setError(null)
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

    setLoading(true); setError(null)
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
    const cached = _cityClubCache.get(cacheKey)
    if (cached) {
      setClubs(cached)
      prefetchedRef.current = `${regionParam}|${countryParam}|${city}|`
      setSearchParams({ region: regionParam!, country: countryParam!, city })
      return
    }
    setLoading(true); setError(null)
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
    setLoading(true); setError(null)
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
    setLoading(true); setError(null)
    retryFnRef.current = handleSearch
    api.searchClubs(authToken, q)
      .then(results => {
        setClubs(results)
        prefetchedRef.current = `|||${q}`
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

  const groupCount = (group: RegionGroup) =>
    group.regions.reduce((sum, r) => sum + (regionCounts[r] ?? 0), 0)

  const totalClubs     = Object.values(regionCounts).reduce((a, b) => a + b, 0)
  const groupTotal     = selectedGroup ? groupCount(selectedGroup) : 0
  const cityCountsTotal = cityCounts.reduce((a, b) => a + b.count, 0)
  const countryTotal   = selectedCountry
    ? (cityCountsTotal || countryCounts.find(c => c.country === selectedCountry)?.count || clubs.length)
    : 0

  return {
    // auth
    token, isAuthenticated,
    // URL params
    regionParam, countryParam, cityParam, queryParam,
    // derived
    view, selectedGroup, selectedCountry, groupCount,
    // state
    regionCounts, countryCounts, cityCounts, clubs,
    loading, error, searchInput, regionCountsFromCache,
    // computed totals
    totalClubs, groupTotal, cityCountsTotal, countryTotal,
    // refs (for retry button)
    retryFnRef,
    // setters
    setSearchInput, setSearchParams, setError,
    // handlers
    handleSelectGroup, handleSelectCountry, handleSelectCity,
    handleSelectRestOfEngland, handleSearch, handleRequestLOI,
    navigate,
  }
}
