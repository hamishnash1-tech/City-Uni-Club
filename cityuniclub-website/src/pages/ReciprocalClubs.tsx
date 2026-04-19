import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useReciprocalClubs, REGION_GROUPS } from '../hooks/useReciprocalClubs'
import { ReciprocalClub, api } from '../services/api'
import { clubInitial } from '../utils/clubUtils'
import { IconClubs } from '../icons'
import { RootState } from '../store'

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

const STATUS_COLOURS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-blue-100 text-blue-700',
  sent: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100/60 text-red-600',
}

const ReciprocalClubs: React.FC = () => {
  const navigate = useNavigate()
  const token = useSelector((state: RootState) => state.auth.token)
  const [activeTab, setActiveTab] = useState<'clubs' | 'my-lois'>('clubs')
  const [myLois, setMyLois] = useState<any[]>([])
  const [loisLoading, setLoisLoading] = useState(false)
  const [loisPage, setLoisPage] = useState(1)
  const [loisTotal, setLoisTotal] = useState(0)
  const [loiDetail, setLoiDetail] = useState<{ request: any; emails: any[] } | null>(null)
  const [loiDetailLoading, setLoiDetailLoading] = useState(false)
  const LOIS_PER_PAGE = 10

  const handleLoiClick = async (id: string) => {
    if (!token) return
    setLoiDetailLoading(true)
    setLoiDetail(null)
    const detail = await api.getLoi(token, id)
    setLoiDetail(detail)
    setLoiDetailLoading(false)
  }

  useEffect(() => {
    if (!token || activeTab !== 'my-lois') return
    setLoisLoading(true)
    api.getMyLois(token, loisPage, LOIS_PER_PAGE)
      .then(({ requests, total }) => { setMyLois(requests); setLoisTotal(total) })
      .finally(() => setLoisLoading(false))
  }, [token, activeTab, loisPage])

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
      <div className="">
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
    <>
    <div className="">
      <div className="bg-oxford-blue/80 pt-7 pb-5 px-4 border-b border-cambridge/20">
        <div className="flex items-center justify-center gap-2 text-ivory mb-4">
          <IconClubs />
          <h1 className="font-serif text-2xl font-normal">Reciprocal Clubs</h1>
        </div>

        {token && (
          <div className="relative flex w-full max-w-sm sm:max-w-md md:max-w-2xl mx-auto border border-cambridge/20 rounded-sm p-1">
            {(() => {
              const tabs = [
                { id: 'clubs' as const, label: 'Clubs' },
                { id: 'my-lois' as const, label: 'My Requests' },
              ]
              const activeIndex = tabs.findIndex(t => t.id === activeTab)
              return (
                <>
                  <div
                    className="absolute top-1 bottom-1 bg-cambridge/25 rounded-sm transition-all duration-300 ease-out"
                    style={{
                      left: '4px',
                      width: `calc(${100 / tabs.length}% - ${8 / tabs.length}px)`,
                      transform: `translateX(${activeIndex * 100}%)`,
                    }}
                  />
                  {tabs.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative flex-1 py-2 px-2 sm:px-3 md:px-4 text-xs sm:text-sm transition-colors duration-200 rounded-sm ${
                        activeTab === tab.id ? 'text-ivory' : 'text-ivory/50 hover:text-ivory'
                      }`}
                    >
                      <span className="label-caps whitespace-nowrap">{tab.label}</span>
                    </button>
                  ))}
                </>
              )
            })()}
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-4 mt-5">
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
        {activeTab === 'clubs' && <Breadcrumb />}

        {activeTab === 'my-lois' ? (
          <div className="space-y-3">
            {loisLoading ? (
              <Spinner />
            ) : myLois.length === 0 ? (
              <div className="club-card p-6 text-center text-ink-mid">No LOI requests found.</div>
            ) : (
              <>
                {myLois.map(loi => (
                  <button key={loi.id} onClick={() => handleLoiClick(loi.id)} className="club-card p-4 flex items-center justify-between gap-4 flex-wrap w-full text-left hover:shadow-card-hover transition">
                    <div>
                      <p className="font-serif text-oxford-blue text-base">{loi.reciprocal_clubs?.name ?? '—'}</p>
                      <p className="text-sm text-ink-mid mt-0.5">{loi.reciprocal_clubs?.location}, {loi.reciprocal_clubs?.country}</p>
                      <p className="text-xs text-ink-light mt-0.5">
                        {new Date(loi.arrival_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {loi.departure_date ? ` – ${new Date(loi.departure_date + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`label-caps text-xs px-2 py-1 rounded ${STATUS_COLOURS[loi.status] ?? 'bg-cambridge/10 text-cambridge-muted'}`}>
                        {loi.status}
                      </span>
                      <svg className="w-4 h-4 text-ink-light flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </button>
                ))}
                {loisTotal > LOIS_PER_PAGE && (
                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => setLoisPage(p => p - 1)}
                      disabled={loisPage === 1}
                      className="label-caps text-xs text-cambridge-light/70 hover:text-cambridge-light transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>
                    <span className="label-caps text-xs text-ink-light">
                      Page {loisPage} of {Math.ceil(loisTotal / LOIS_PER_PAGE)}
                    </span>
                    <button
                      onClick={() => setLoisPage(p => p + 1)}
                      disabled={loisPage >= Math.ceil(loisTotal / LOIS_PER_PAGE)}
                      className="label-caps text-xs text-cambridge-light/70 hover:text-cambridge-light transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}

        {activeTab === 'clubs' && (
        <>
        <div className="club-card p-3 mb-4 flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search clubs by name or location..."
              className="club-input pl-9 text-sm py-2"
            />
            <svg className="w-4 h-4 text-ink-light absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <button
            onClick={handleSearch}
            disabled={!searchInput.trim()}
            className="px-4 py-2 bg-oxford-blue hover:bg-oxford-blue/90 text-ivory text-sm rounded-sm transition disabled:opacity-30 disabled:cursor-not-allowed label-caps"
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
        </>
        )}

      </div>
    </div>

    {/* LOI Detail Modal */}
    {(loiDetail || loiDetailLoading) && (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setLoiDetail(null)} />
        <div className="relative bg-ivory w-full sm:max-w-md rounded-t-xl sm:rounded-xl shadow-xl p-6 max-h-[85vh] overflow-y-auto">
          <button onClick={() => setLoiDetail(null)} className="absolute top-4 right-4 text-ink-light hover:text-ink transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {loiDetailLoading ? (
            <div className="py-8 flex justify-center">
              <div className="w-6 h-6 border-2 border-cambridge/30 border-t-cambridge rounded-full animate-spin" />
            </div>
          ) : loiDetail?.request && (() => {
            const { request, emails } = loiDetail
            const fmt = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
            const fmtTime = (d: string) => new Date(d).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })
            const isResolved = request.status !== 'pending'

            type TimelineStep = { label: string; date: string | null; icon: React.ReactNode; connector: string }
            const timeline: TimelineStep[] = [
              {
                label: 'Requested',
                date: fmtTime(request.created_at),
                icon: (
                  <div className="w-7 h-7 rounded-full bg-cambridge/15 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-cambridge-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                ),
                connector: 'bg-cambridge/20',
              },
              ...(isResolved ? [{
                label: request.status === 'rejected' ? 'Rejected' : 'Approved',
                date: fmtTime(request.updated_at),
                icon: request.status === 'rejected' ? (
                  <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                ),
                connector: 'bg-cambridge/20',
              }] : [{
                label: 'Awaiting approval',
                date: null,
                icon: (
                  <div className="w-7 h-7 rounded-full border-2 border-cambridge/30 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-cambridge/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                ),
                connector: 'bg-cambridge/10',
              }]),
              ...emails.map((e: any): TimelineStep => ({
                label: 'LoI sent to club',
                date: fmtTime(e.sent_at),
                icon: (
                  <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                ),
                connector: 'bg-cambridge/20',
              })),
            ]

            return (
              <>
                <h2 className="font-serif text-oxford-blue text-xl font-normal mb-1 pr-6">{request.reciprocal_clubs?.name}</h2>
                <p className="text-sm text-ink-mid mb-1">{request.reciprocal_clubs?.location}, {request.reciprocal_clubs?.country}</p>
                <p className="text-xs text-ink-light mb-5">
                  {fmt(request.arrival_date)}{request.departure_date ? ` – ${fmt(request.departure_date)}` : ''}
                </p>

                <div className="space-y-0">
                  {timeline.map((step, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        {step.icon}
                        {i < timeline.length - 1 && <div className={`w-px flex-1 ${step.connector} my-1`} />}
                      </div>
                      <div className="pb-4 pt-1">
                        <p className="text-sm font-medium text-oxford-blue">{step.label}</p>
                        {step.date && <p className="text-xs text-ink-light mt-0.5">{step.date}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )
          })()}
        </div>
      </div>
    )}
    </>
  )
}

export default ReciprocalClubs
