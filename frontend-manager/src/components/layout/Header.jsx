import { Bell, ChevronDown, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from '../../context/SidebarContext'

export default function Header() {
  const { user } = useAuth()
  const { toggle } = useSidebar()

  return (
    <header className="mgr-header">
      <div className="mgr-header__left">
        <button className="mgr-sidebar__toggle" onClick={toggle} aria-label="Toggle menu">
          <Menu size={22} />
        </button>
        <p className="mgr-header__greeting">
          Good morning, <strong>{user?.name?.split(' ')[0] || 'Manager'}</strong> 👋
        </p>
      </div>
      <div className="mgr-header__right">
        <button className="mgr-header__notif">
          <Bell size={18} />
          <span className="mgr-header__badge">2</span>
        </button>
        <div className="mgr-header__profile">
          <div className="mgr-header__avatar">{user?.name?.[0] || 'M'}</div>
          <ChevronDown size={14} color="var(--gray-400)" />
        </div>
      </div>
    </header>
  )
}