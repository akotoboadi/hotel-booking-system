import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Hotel, BedDouble, CalendarCheck, Users, BarChart3, Settings, LogOut } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Sidebar.css'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hotels', icon: Hotel, label: 'Hotels' },
  { to: '/rooms', icon: BedDouble, label: 'Rooms' },
  { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
  { to: '/guests', icon: Users, label: 'Guests' },
]

export default function Sidebar() {
  const { logout } = useAuth()

  return (
    <aside className="sidebar">
      <div className="sidebar__logo">
        AKStay<span>·</span>
        <small>Admin</small>
      </div>

      <nav className="sidebar__nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar__link ${isActive ? 'sidebar__link--active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <button className="sidebar__link sidebar__logout" onClick={logout}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}