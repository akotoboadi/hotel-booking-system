import { Bell, Search, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from '../../context/SidebarContext'
import './Header.css'

export default function Header() {
  const { user } = useAuth()
  const { toggle } = useSidebar()

  return (
    <header className="adm-header">
      <div className="adm-header__left">
        <button
          className="adm-header__toggle"
          onClick={toggle}
          aria-label="Toggle sidebar"
        >
          <Menu size={22} />
        </button>
        <div className="adm-header__search">
          <Search size={15} />
          <input placeholder="Search hotels, bookings, guests..." />
        </div>
      </div>

      <div className="adm-header__right">
        <button className="adm-header__notif">
          <Bell size={18} />
          <span className="adm-header__badge">3</span>
        </button>
        <div className="adm-header__user">
          <div className="adm-header__avatar">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="adm-header__user-info">
            <p className="adm-header__name">{user?.name || 'Admin'}</p>
            <p className="adm-header__role">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  )
}