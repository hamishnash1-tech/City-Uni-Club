import React from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { toggleMobileMenu, toggleMemberArea } from '../slices/uiSlice'
import { RootState } from '../store'
import { Link, useNavigate } from 'react-router-dom'

export const Header: React.FC = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { isAuthenticated, member } = useSelector((state: RootState) => state.auth)
  const { isMobileMenuOpen } = useSelector((state: RootState) => state.ui)

  const handleMemberArea = () => {
    if (isAuthenticated) {
      navigate('/member/reciprocal-clubs')
    } else {
      dispatch(toggleMemberArea())
    }
  }

  return (
    <header className="bg-oxford-blue text-white sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <Link to="/" className="text-2xl font-serif font-bold">
            CITY UNIVERSITY CLUB
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="hover:text-cambridge-blue transition">Home</Link>
            <Link to="/about" className="hover:text-cambridge-blue transition">About</Link>
            <Link to="/dining" className="hover:text-cambridge-blue transition">Dining</Link>
            <Link to="/events" className="hover:text-cambridge-blue transition">Events</Link>
            <button
              onClick={handleMemberArea}
              className="hover:text-cambridge-blue transition"
            >
              Member Area
            </button>
            {isAuthenticated ? (
              <span className="text-cambridge-blue">{member?.first_name}</span>
            ) : (
              <Link to="/login" className="hover:text-cambridge-blue transition">Login</Link>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => dispatch(toggleMobileMenu())}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-4">
              <Link to="/" className="hover:text-cambridge-blue transition">Home</Link>
              <Link to="/about" className="hover:text-cambridge-blue transition">About</Link>
              <Link to="/dining" className="hover:text-cambridge-blue transition">Dining</Link>
              <Link to="/events" className="hover:text-cambridge-blue transition">Events</Link>
              <button
                onClick={handleMemberArea}
                className="text-left hover:text-cambridge-blue transition"
              >
                Member Area
              </button>
              {isAuthenticated ? (
                <>
                  <span className="text-cambridge-blue">{member?.first_name}</span>
                  <Link to="/login" className="hover:text-cambridge-blue transition">Logout</Link>
                </>
              ) : (
                <Link to="/login" className="hover:text-cambridge-blue transition">Login</Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
