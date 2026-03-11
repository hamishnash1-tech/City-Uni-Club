import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RootState } from './store'
import { logout } from './slices/authSlice'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Events } from './pages/Events'
import { News } from './pages/News'
import { Dining } from './pages/Dining'
import { ReciprocalClubs } from './pages/ReciprocalClubs'
import { LOIRequest } from './pages/LOIRequest'

// Bottom Tab Bar
const TabBar: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const isAuthenticated = auth.isAuthenticated

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/home' },
    { id: 'dining', icon: '🍽️', label: 'Dining', path: '/dining' },
    { id: 'events', icon: '📅', label: 'Events', path: '/events' },
    { id: 'news', icon: '📰', label: 'News', path: '/news' },
    { id: 'clubs', icon: '🌍', label: 'Clubs', path: '/reciprocal-clubs' },
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => (
          <a
            key={tab.id}
            href={tab.path}
            className={`flex flex-col items-center p-2 rounded-lg transition ${
              isAuthenticated ? 'text-oxford-blue' : 'text-gray-400'
            }`}
          >
            <span className="text-2xl mb-1">{tab.icon}</span>
            <span className="text-xs font-medium">{tab.label}</span>
          </a>
        ))}
      </div>
    </div>
  )
}

// Protected Route (optional - can make public)
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useSelector((state: RootState) => state.auth)
  const isAuthenticated = auth.isAuthenticated
  // For now, allow access without login
  return <>{children}</>
  // return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

// Top Banner
const TopBanner: React.FC = () => {
  const auth = useSelector((state: RootState) => state.auth)
  const dispatch = useDispatch()

  if (!auth.isAuthenticated || !auth.member) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-oxford-blue/95 backdrop-blur-sm border-b border-white/10 px-4 py-2">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <span className="text-white/60 text-xs">City University Club</span>
        <div className="flex items-center gap-3">
          <span className="text-white text-sm font-medium">{auth.member.full_name}</span>
          <button
            onClick={() => dispatch(logout())}
            className="text-white/50 hover:text-white text-xs transition"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Layout with Tabs
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useSelector((state: RootState) => state.auth)
  const isAuthenticated = auth.isAuthenticated

  return (
    <div className={`pb-20 ${isAuthenticated ? 'pt-9' : ''}`}>
      <TopBanner />
      {children}
      <TabBar />
    </div>
  )
}

// App Component
const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/login" element={<Login />} />
      
      <Route path="/home" element={
        <MainLayout><Home /></MainLayout>
      } />
      
      <Route path="/dining" element={
        <MainLayout><Dining /></MainLayout>
      } />
      
      <Route path="/events" element={
        <MainLayout><Events /></MainLayout>
      } />
      
      <Route path="/news" element={
        <MainLayout><News /></MainLayout>
      } />
      
      <Route path="/reciprocal-clubs" element={
        <ProtectedRoute>
          <MainLayout><ReciprocalClubs /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/loi-request" element={
        <ProtectedRoute>
          <MainLayout><LOIRequest /></MainLayout>
        </ProtectedRoute>
      } />
    </Routes>
  )
}

export default App
