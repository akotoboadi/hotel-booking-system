import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, ArrowDownCircle, ArrowUpCircle, PlusCircle, Search, Grid3x3, LogOut, ConciergeBell } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from '../../context/SidebarContext'

const NAV = [
  { to: '/',           icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/arrivals',   icon: ArrowDownCircle, label: 'Arrivals'     },
  { to: '/departures', icon: ArrowUpCircle,   label: 'Departures'   },
  { to: '/walkin',     icon: PlusCircle,      label: 'Walk-In'      },
  { to: '/guests',     icon: Search,          label: 'Guest Search' },
  { to: '/rooms',      icon: Grid3x3,         label: 'Room Grid'    },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { isOpen, close } = useSidebar()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <aside className={`rec-sidebar ${isOpen ? 'rec-sidebar--open' : ''}`}>
      <div className="rec-sidebar__brand">
        <div className="rec-sidebar__brand-icon"><ConciergeBell size={18} /></div>
        <div>
          <p className="rec-sidebar__hotel">{user?.hotelName || 'AKStay Hotel'}</p>
          <p className="rec-sidebar__role">Receptionist Portal</p>
        </div>
      </div>

      <nav className="rec-sidebar__nav">
        <p className="rec-sidebar__label">Operations</p>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to} end={to === '/'}
            onClick={close}
            className={({ isActive }) =>
              `rec-sidebar__link ${isActive ? 'rec-sidebar__link--active' : ''}`
            }
          >
            <Icon size={17} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="rec-sidebar__footer">
        <div className="rec-sidebar__user">
          <div className="rec-sidebar__avatar">{user?.name?.[0] || 'R'}</div>
          <div>
            <p className="rec-sidebar__uname">{user?.name || 'Receptionist'}</p>
            <p className="rec-sidebar__urole">Front Desk</p>
          </div>
        </div>
        <button className="rec-sidebar__logout" onClick={handleLogout} title="Sign out">
          <LogOut size={15} />
        </button>
      </div>
    </aside>
  )
}