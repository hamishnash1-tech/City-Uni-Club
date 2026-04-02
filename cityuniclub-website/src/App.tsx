import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { RootState } from './store'
import { logout } from './slices/authSlice'
const Login            = React.lazy(() => import('./pages/Login').then(m => ({ default: m.Login })))
const ForgotPassword   = React.lazy(() => import('./pages/ForgotPassword').then(m => ({ default: m.ForgotPassword })))
const ResetPassword    = React.lazy(() => import('./pages/ResetPassword').then(m => ({ default: m.ResetPassword })))
const Home             = React.lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const Events           = React.lazy(() => import('./pages/Events').then(m => ({ default: m.Events })))
const EventDetail      = React.lazy(() => import('./pages/EventDetail').then(m => ({ default: m.EventDetail })))
const News             = React.lazy(() => import('./pages/News').then(m => ({ default: m.News })))
const NewsDetail       = React.lazy(() => import('./pages/NewsDetail').then(m => ({ default: m.NewsDetail })))
const Join             = React.lazy(() => import('./pages/Join').then(m => ({ default: m.Join })))
const Dining           = React.lazy(() => import('./pages/Dining').then(m => ({ default: m.Dining })))
const ReciprocalClubs  = React.lazy(() => import('./pages/ReciprocalClubs'))
const LOIRequest       = React.lazy(() => import('./pages/LOIRequest').then(m => ({ default: m.LOIRequest })))
const Profile          = React.lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const TermsAndConditions = React.lazy(() => import('./pages/TermsAndConditions').then(m => ({ default: m.TermsAndConditions })))
const PrivacyPolicy    = React.lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })))
const MobileApp        = React.lazy(() => import('./pages/MobileApp').then(m => ({ default: m.MobileApp })))
const Info             = React.lazy(() => import('./pages/Info').then(m => ({ default: m.Info })))
import { IconUser } from './icons'

const tabs = [
  { id: 'home',    label: 'Home',    path: '/home' },
  { id: 'dining',  label: 'Dining',  path: '/dining' },
  { id: 'events',  label: 'Events',  path: '/events' },
  { id: 'news',    label: 'News',    path: '/news' },
  { id: 'clubs',   label: 'Clubs',   path: '/reciprocal-clubs' },
  { id: 'info',    label: 'Info',    path: '/info' },
]

// Mobile tab bar
const TabBar: React.FC = () => {
  const { pathname } = useLocation()
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-navy-deep border-t border-cambridge/15 px-2 safe-area-bottom">
      <div className="flex justify-around items-stretch">
        {tabs.map((tab) => {
          const isActive = pathname === tab.path
          return (
            <Link
              key={tab.id}
              to={tab.path}
              className={`flex flex-col items-center pt-2 pb-3 px-3 flex-1 transition-colors duration-200 ${
                isActive ? 'text-cambridge' : 'text-ivory hover:text-cambridge'
              }`}
            >
              <span className="font-cormorant text-sm tracking-wide mt-1">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

// Desktop nav — used inside TopBanner
const DesktopNav: React.FC = () => {
  const { pathname } = useLocation()
  const spanRefs = useRef<(HTMLSpanElement | null)[]>([])
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const activeIndex = tabs.findIndex(t => t.path === pathname)
    const el = spanRefs.current[activeIndex]
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth })
  }, [pathname])

  return (
    <nav className="hidden md:flex items-center relative">
      <div
        className="absolute bottom-0 h-0.5 bg-cambridge rounded-full"
        style={{
          left: indicator.left,
          width: indicator.width,
          transition: 'left 0.3s cubic-bezier(0.34, 1.15, 0.64, 1), width 0.3s cubic-bezier(0.34, 1.15, 0.64, 1)',
        }}
      />
      {tabs.map((tab, i) => {
        const isActive = pathname === tab.path
        return (
          <Link
            key={tab.id}
            to={tab.path}
            className={`px-4 py-2 transition-colors duration-200 ${
              isActive ? 'text-cambridge' : 'text-ivory/40 hover:text-cambridge'
            }`}
          >
            <span ref={el => { spanRefs.current[i] = el }} className="font-cormorant text-lg font-semibold tracking-wide">{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

// Mobile slide-in menu
const MobileMenu: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { pathname } = useLocation()
  const auth = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  useEffect(() => { onClose() }, [pathname])

  return (
    <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}>
      <div
        className={`absolute inset-0 bg-navy-deep/80 backdrop-blur-sm transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className="absolute left-0 top-0 bottom-0 w-64 bg-navy-deep border-r border-cambridge/20 flex flex-col pt-14 pb-8 px-5"
        style={{
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s ease-out',
        }}
      >
        <nav className="flex-1 space-y-1 mt-4">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path
            return (
              <Link
                key={tab.id}
                to={tab.path}
                className={`block px-3 py-3 rounded-sm transition font-cormorant text-base tracking-wide ${
                  isActive
                    ? 'text-cambridge bg-cambridge/10'
                    : 'text-ivory/60 hover:text-cambridge'
                }`}
              >
                {tab.label}
              </Link>
            )
          })}
        </nav>
        {auth.isAuthenticated && auth.member ? (
          <div className="border-t border-cambridge/20 pt-4 pb-2 px-3 rounded-sm bg-cambridge/10 space-y-3">
            <Link to="/profile" className="flex items-center gap-2 text-ivory/60 hover:text-ivory transition">
              <IconUser className="w-4 h-4" />
              <span className="text-sm font-light">{auth.member.full_name}</span>
            </Link>
            <button
              onClick={() => { dispatch(logout()); onClose() }}
              className="label-caps text-cambridge-light/50 hover:text-cambridge-light transition"
            >
              Sign out
            </button>
          </div>
        ) : (
          <div className="border-t border-cambridge/20 pt-4">
            <Link to="/login" className="block px-3 py-2 label-caps text-ivory/50 hover:text-cambridge transition">Sign In</Link>
          </div>
        )}
      </div>
    </div>
  )
}

// Top Banner
const TopBanner: React.FC<{ onMenuToggle: () => void; menuOpen: boolean; showAppBanner: boolean; onDismissBanner: () => void }> = ({ onMenuToggle, menuOpen, showAppBanner, onDismissBanner }) => {
  const auth = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-oxford-blue/95 backdrop-blur-sm border-b border-white/10 px-4 py-2">
        <div className="flex items-center gap-4">
          {/* Mobile hamburger */}
          <button
            onClick={onMenuToggle}
            className="md:hidden text-ivory/70 hover:text-ivory transition p-1 flex-shrink-0"
            aria-label="Menu"
          >
            <div style={{ position: 'relative', width: '20px', height: '20px' }}>
              {[
                { closed: 'translateY(-5.5px)', opened: 'rotate(45deg)' },
                { closed: 'translateY(0)',       opened: null },
                { closed: 'translateY(5.5px)',  opened: 'rotate(-45deg)' },
              ].map((bar, i) => (
                <span key={i} style={{
                  position: 'absolute',
                  left: '1px',
                  top: 'calc(50% - 0.75px)',
                  width: '18px',
                  height: '1.5px',
                  borderRadius: '1px',
                  background: 'currentColor',
                  transformOrigin: 'center',
                  ...(bar.opened
                    ? { transform: menuOpen ? bar.opened : bar.closed, transition: 'transform 0.3s ease-out' }
                    : { opacity: menuOpen ? 0 : 1, transition: 'opacity 0.15s ease-out' }),
                }} />
              ))}
            </div>
          </button>

          {/* Logo + name */}
          <Link to="/home" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-cambridge/45 rounded-full flex items-center justify-center overflow-hidden">
              <img src="/assets/cuc-logo-square.png" alt="CUC" className="w-6 h-6 object-contain" />
            </div>
            <span className="block md:hidden lg:block font-cormorant text-sm tracking-widest uppercase text-cambridge-light/70">City University Club</span>
          </Link>

          {/* Desktop nav — centre */}
          <div className="flex-1 flex justify-center">
            <DesktopNav />
          </div>

          {/* Desktop right — user or login/join */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {auth.isAuthenticated && auth.member ? (
              <Link to="/profile" className="flex items-center gap-1.5 text-ivory/80 hover:text-ivory transition">
                <IconUser className="w-4 h-4" />
                <span className="text-sm font-light tracking-wide text-ivory/80">{auth.member.full_name}</span>
              </Link>
            ) : (
              <Link to="/login" className="label-caps text-cambridge-light/60 hover:text-cambridge-light transition">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
      <div
        className="overflow-hidden bg-oxford-blue transition-all duration-500 ease-out"
        style={{ maxHeight: showAppBanner ? '80px' : '0px' }}
      >
        <div className="relative px-6 flex items-center justify-center" style={{ paddingTop: '14px', paddingBottom: '14px' }}>
          <a href="https://apps.apple.com/gb/app/cityuniclub-app/id6760672157" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 transition rounded-full px-5 py-2">
            <span role="img" aria-label="phone" style={{ fontSize: '1.35rem', lineHeight: 1 }}>📱</span>
            <span className="font-cormorant text-base md:text-lg font-bold tracking-wide text-white" style={{ lineHeight: 1.2 }}>
              New! The CUC iPhone app is here
            </span>
            <span className="bg-cambridge text-oxford-blue text-xs md:text-sm font-bold px-3 py-1 rounded-full whitespace-nowrap">
              Download now
            </span>
          </a>
          <button
            onClick={onDismissBanner}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition p-1"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  )
}

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Protected Route
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useSelector((state: RootState) => state.auth)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

// App Component — persistent shell wraps all routes so TabBar never remounts
const App: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false)
  const auth = useSelector((state: RootState) => state.auth)
  const [showBanner, setShowBanner] = useState(() => {
    return auth.isAuthenticated && sessionStorage.getItem('show_app_banner') === 'true'
  })

  useEffect(() => {
    if (auth.isAuthenticated && sessionStorage.getItem('show_app_banner') === 'true') {
      setShowBanner(true)
    }
  }, [auth.isAuthenticated])

  return (
    <>
      <ScrollToTop />
      <TopBanner onMenuToggle={() => setMenuOpen(o => !o)} menuOpen={menuOpen} showAppBanner={showBanner} onDismissBanner={() => { setShowBanner(false); sessionStorage.removeItem('show_app_banner') }} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div
        className="pt-10 md:pt-12 min-h-screen flex flex-col"
        style={{
          backgroundImage: 'url(/assets/cuc-building.avif)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="fixed inset-0 bg-navy-deep/80 pointer-events-none" style={{ zIndex: 0 }} />
        <div className="flex-1 relative" style={{ zIndex: 1 }}>
        <React.Suspense fallback={<div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-cambridge/30 border-t-cambridge rounded-full animate-spin" /></div>}>
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/home" element={<Home />} />
            <Route path="/dining" element={<Dining />} />
            <Route path="/events" element={<Events />} />
            <Route path="/events/:slug" element={<EventDetail />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/reciprocal-clubs" element={<ReciprocalClubs />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/loi-request" element={<ProtectedRoute><LOIRequest /></ProtectedRoute>} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/mobile-app" element={<MobileApp />} />
            <Route path="/info" element={<Info />} />
            <Route path="/about" element={<Navigate to="/info" replace />} />
            <Route path="/contact" element={<Navigate to="/info" replace />} />
            <Route path="/join" element={<Join />} />
          </Routes>
        </React.Suspense>
        </div>
        <footer className="relative border-t border-cambridge/20 mt-8 pb-8 pt-5 px-4 text-center space-y-1.5 bg-navy-deep/60" style={{ zIndex: 1 }}>
          <p className="font-cormorant text-sm tracking-widest text-ivory/80">
            &copy; {new Date().getFullYear()} City University Club · All rights reserved
          </p>
          <div className="flex justify-center gap-4 font-cormorant text-sm tracking-wide text-ivory/60">
            <Link to="/terms" className="hover:text-cambridge transition">Terms & Conditions</Link>
            <span>·</span>
            <Link to="/privacy" className="hover:text-cambridge transition">Privacy Policy</Link>
            <span>·</span>
            <Link to="/mobile-app" className="hover:text-cambridge transition">Mobile App</Link>
            <span>·</span>
            <Link to="/info" className="hover:text-cambridge transition">Info</Link>
          </div>
        </footer>
      </div>
      {/* TabBar removed */}
    </>
  )
}

export default App
