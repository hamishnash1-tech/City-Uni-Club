import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import AdminLayout from './components/AdminLayout'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material'
const LoginPage          = lazy(() => import('./pages/LoginPage'))
const DashboardPage      = lazy(() => import('./pages/DashboardPage'))
const EventsPage         = lazy(() => import('./pages/EventsPage'))
const EventDetailPage    = lazy(() => import('./pages/EventDetailPage'))
const MembersPage        = lazy(() => import('./pages/MembersPage'))
const DiningPage         = lazy(() => import('./pages/DiningPage'))
const ReciprocalClubsPage = lazy(() => import('./pages/ReciprocalClubsPage'))
const NewsPage           = lazy(() => import('./pages/NewsPage'))
const LoiPage            = lazy(() => import('./pages/LoiPage'))
const MenuPage           = lazy(() => import('./pages/MenuPage'))
const ActivityPage       = lazy(() => import('./pages/ActivityPage'))

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return user ? children : <Navigate to="/login" />
}

function SessionExpiredModal() {
  const { sessionExpired, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const handleSignIn = () => {
    logout()
    navigate('/login')
  }

  return (
    <Dialog open={sessionExpired && location.pathname !== '/login'} disableEscapeKeyDown>
      <DialogTitle>Session Expired</DialogTitle>
      <DialogContent>
        <Typography>Your session has expired. Please sign in again to continue.</Typography>
      </DialogContent>
      <DialogActions>
        <Button variant="contained" onClick={handleSignIn}>Sign In</Button>
      </DialogActions>
    </Dialog>
  )
}

function AppRoutes() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>Loading…</div>}>
    <>
    <SessionExpiredModal />
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
        <Route path="events/:slug" element={<EventDetailPage />} />
        <Route path="dining" element={<DiningPage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="clubs" element={<ReciprocalClubsPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="loi" element={<LoiPage />} />
        <Route path="activity" element={<ActivityPage />} />

      </Route>
    </Routes>
    </>
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
