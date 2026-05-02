import { Bell, Search } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

export default function Header() {
  const { user } = useAuth()

  return (
    <header className="admin-header">
      <div className="admin-header__search">
        <Search size={16} />
        <input placeholder="Search hotels, bookings, guests..." />
      </div>
      <div className="admin-header__actions">
        <button className="admin-header__notif">
          <Bell size={18} />
          <span className="admin-header__badge">3</span>
        </button>
        <div className="admin-header__user">
          <div className="admin-header__avatar">{user?.name?.[0] || 'A'}</div>
          <div>
            <p className="admin-header__name">{user?.name || 'Admin'}</p>
            <p className="admin-header__role">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  )
}