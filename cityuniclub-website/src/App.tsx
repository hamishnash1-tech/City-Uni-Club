import React from 'react'
import { useSelector } from 'react-redux'
import { Routes, Route, Navigate } from 'react-router-dom'
import { RootState } from './store'
import { Login } from './pages/Login'
import { Home } from './pages/Home'
import { Events } from './pages/Events'
import { News } from './pages/News'
import { ReciprocalClubs } from './pages/ReciprocalClubs'
import { LOIRequest } from './pages/LOIRequest'

// Bottom Tab Bar
const TabBar: React.FC = () => {
  const state = useSelector((state: RootState) => state.ui)
  const auth = useSelector((state: RootState) => state.auth)
  const activeTab = state.activeTab
  const isAuthenticated = auth.isAuthenticated

  const tabs = [
    { id: 'home', icon: '🏠', label: 'Home', path: '/home' },
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
              activeTab === tab.id ? 'text-oxford-blue' : 'text-gray-400'
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

// Main Layout with Tabs
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="pb-20">
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
        <ProtectedRoute>
          <MainLayout><Home /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/events" element={
        <ProtectedRoute>
          <MainLayout><Events /></MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/news" element={
        <ProtectedRoute>
          <MainLayout><News /></MainLayout>
        </ProtectedRoute>
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
