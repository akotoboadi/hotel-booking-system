import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, Menu, X, LogOut, BookOpen } from 'lucide-react'
import './Navbar.css'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const isHome = location.pathname === '/'

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
    setDropdownOpen(false)
  }

  return (
    <nav className={`navbar ${scrolled || !isHome ? 'navbar--solid' : 'navbar--transparent'}`}>
      <div className="navbar__container">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-text">AKStay</span>
          <span className="navbar__logo-dot">·</span>
        </Link>

        <div className="navbar__links">
          <Link to="/search" className="navbar__link">Explore</Link>
          <Link to="/search?type=resort" className="navbar__link">Resorts</Link>
          <Link to="/search?type=boutique" className="navbar__link">Boutique</Link>
        </div>

        <div className="navbar__actions">
          {user ? (
            <div className="navbar__user">
              <button className="navbar__user-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                <User size={16} />
                <span>{user.name?.split(' ')[0]}</span>
              </button>
              {dropdownOpen && (
                <div className="navbar__dropdown">
                  <Link to="/profile" className="navbar__dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <BookOpen size={14} /> My Bookings
                  </Link>
                  <button className="navbar__dropdown-item navbar__dropdown-item--danger" onClick={handleLogout}>
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="navbar__link">Sign In</Link>
              <Link to="/register" className="btn-accent navbar__cta">Get Started</Link>
            </>
          )}
          <button className="navbar__mobile-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="navbar__mobile-menu">
          <Link to="/search" onClick={() => setMenuOpen(false)}>Explore</Link>
          <Link to="/search?type=resort" onClick={() => setMenuOpen(false)}>Resorts</Link>
          <Link to="/search?type=boutique" onClick={() => setMenuOpen(false)}>Boutique</Link>
          {!user && <Link to="/login" onClick={() => setMenuOpen(false)}>Sign In</Link>}
          {!user && <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>}
          {user && <button onClick={handleLogout}>Sign Out</button>}
        </div>
      )}
    </nav>
  )
}