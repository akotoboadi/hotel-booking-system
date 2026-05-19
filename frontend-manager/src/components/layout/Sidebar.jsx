import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BedDouble, CalendarCheck,
  Users, BarChart3, LogOut, Building2
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from '../../context/SidebarContext'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/rooms',    icon: BedDouble,       label: 'Rooms'       },
  { to: '/bookings', icon: CalendarCheck,   label: 'Bookings'    },
  { to: '/staff',    icon: Users,           label: 'Staff'       },
  { to: '/reports',  icon: BarChart3,       label: 'Reports'     },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isOpen, close } = useSidebar()

  const handleLogout = () => { logout(); navigate('/login') }
  const handleNavClick = () => { close() }

  return (
    <aside className={`mgr-sidebar ${isOpen ? 'mgr-sidebar--open' : ''}`}>
      <div className="mgr-sidebar__brand">
        <div className="mgr-sidebar__brand-icon"><Building2 size={18} /></div>
        <div>
          <p className="mgr-sidebar__hotel-name">{user?.hotelName || 'Grand Hotel'}</p>
          <p className="mgr-sidebar__sub">Hotel Manager Portal</p>
        </div>
      </div>

      <nav className="mgr-sidebar__nav">
        <p className="mgr-sidebar__section-label">Main Menu</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `mgr-sidebar__link ${isActive ? 'mgr-sidebar__link--active' : ''}`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mgr-sidebar__footer">
        <div className="mgr-sidebar__user">
          <div className="mgr-sidebar__avatar">{user?.name?.[0] || 'M'}</div>
          <div className="mgr-sidebar__user-info">
            <p>{user?.name || 'Manager'}</p>
            <span>Hotel Manager</span>
          </div>
        </div>
        <button className="mgr-sidebar__logout" onClick={handleLogout} title="Sign out">
          <LogOut size={16} />
        </button>
      </div>
    </aside>
  )
}