import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminLayout from './components/AdminLayout'
const LoginPage          = lazy(() => import('./pages/LoginPage'))
const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const EventsPage         = lazy(() => import('./pages/EventsPage'))
const EventDetailPage    = lazy(() => import('./pages/EventDetailPage'))
const MembersPage        = lazy(() => import('./pages/MembersPage'))
const DiningPage         = lazy(() => import('./pages/DiningPage'))
const ReciprocalClubsPage = lazy(() => import('./pages/ReciprocalClubsPage'))
const NewsPage           = lazy(() => import('./pages/NewsPage'))
const LoiPage            = lazy(() => import('./pages/LoiPage'))
const OpeningHoursPage   = lazy(() => import('./pages/OpeningHoursPage'))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return user ? children : <Navigate to="/login" />
}

function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Loading…</div>}>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <AdminLayout />
          </PrivateRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="members" element={<MembersPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId" element={<EventDetailPage />} />
        <Route path="dining" element={<DiningPage />} />
        <Route path="clubs" element={<ReciprocalClubsPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="loi" element={<LoiPage />} />
        <Route path="opening-hours" element={<OpeningHoursPage />} />
      </Route>
    </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
