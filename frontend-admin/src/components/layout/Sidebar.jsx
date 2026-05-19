import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Hotel, BedDouble,
  CalendarCheck, Users, LogOut, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from '../../context/SidebarContext'
import './Sidebar.css'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/hotels',   icon: Hotel,           label: 'Hotels'    },
  { to: '/rooms',    icon: BedDouble,       label: 'Rooms'     },
  { to: '/bookings', icon: CalendarCheck,   label: 'Bookings'  },
  { to: '/guests',   icon: Users,           label: 'Guests'    },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { isOpen, close } = useSidebar()

  const handleLogout = () => { logout(); navigate('/login') }
  const handleNav    = () => { close() }

  return (
    <aside className={`adm-sidebar ${isOpen ? 'adm-sidebar--open' : ''}`}>
      {/* Close button — mobile only */}
      <button className="adm-sidebar__close" onClick={close} aria-label="Close menu">
        <X size={20} />
      </button>

      <div className="adm-sidebar__logo">
        <span>AKStay</span>
        <span className="adm-sidebar__logo-dot">·</span>
        <small>Admin</small>
      </div>

      <nav className="adm-sidebar__nav">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={handleNav}
            className={({ isActive }) =>
              `adm-sidebar__link ${isActive ? 'adm-sidebar__link--active' : ''}`
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="adm-sidebar__bottom">
        <button
          className="adm-sidebar__link adm-sidebar__logout"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}