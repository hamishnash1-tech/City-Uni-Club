import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReciprocalClubs, REGION_GROUPS } from '../hooks/useReciprocalClubs'
import { ReciprocalClub } from '../services/api'
import { clubInitial } from '../utils/clubUtils'
import { IconClubs } from '../icons'

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

const Spinner: React.FC = () => (
  <div className="flex justify-center py-12">
    <div className="w-6 h-6 border-2 border-cambridge/30 border-t-cambridge rounded-full animate-spin" />
  </div>
)

const ClubCard: React.FC<{ club: ReciprocalClub; inSearch: boolean; onRequestLOI: (club: ReciprocalClub) => void }> = ({ club, inSearch, onRequestLOI }) => (
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
        <p className="text-xs text-ink-mid mt-0.5">{club.location}{club.country && inSearch ? ` · ${club.country}` : ''}</p>
        {club.note && <p className="text-xs text-cambridge-muted italic mt-0.5">{club.note}</p>}
      </div>
      <button
        onClick={() => onRequestLOI(club)}
        title="Letter of Introduction"
        className="btn-outline-navy flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
      >
        Request LOI
      </button>
    </div>
  </div>
)

const ReciprocalClubs: React.FC = () => {
  const navigate = useNavigate()
  const {
    isAuthenticated,
    regionParam, countryParam, cityParam, queryParam,
    view, selectedGroup, selectedCountry, groupCount,
    regionCounts, countryCounts, cityCounts, clubs,
    loading, error, searchInput, regionCountsFromCache,
    totalClubs, groupTotal, countryTotal,
    retryFnRef,
    setSearchInput, setSearchParams, setError,
    handleSelectGroup, handleSelectCountry, handleSelectCity,
    handleSelectRestOfEngland, handleSearch, handleRequestLOI,
  } = useReciprocalClubs()

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
          <button onClick={() => navigate('/login')} className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    )
  }

  const chevron = (
    <svg className="w-4 h-4 text-cambridge/40 group-hover:text-cambridge transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
    </svg>
  )

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
                      {chevron}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

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
                  {chevron}
                </button>
              ))}
            </div>
          )
        )}

        {view === 'cities' && (
          loading && cityCounts.length === 0 ? <Spinner /> : (() => {
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

        {(view === 'clubs' || view === 'search') && (
          loading ? <Spinner /> : (
            clubs.length === 0
              ? <p className="text-center text-ivory/40 py-12">No clubs found</p>
              : <div className="space-y-2">
                  {clubs.map((club, i) => (
                    <ClubCard key={i} club={club} inSearch={view === 'search'} onRequestLOI={handleRequestLOI} />
                  ))}
                </div>
          )
        )}

        </div>
      </div>
    </div>
  )
}

export default ReciprocalClubs
