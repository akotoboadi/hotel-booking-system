import { useState, useEffect } from 'react'
import { Bell, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useSidebar } from '../../context/SidebarContext'
import { format } from 'date-fns'

export default function Header() {
  const { user } = useAuth()
  const { toggle } = useSidebar()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <header className="rec-header">
      <div className="rec-header__left">
        <button className="rec-header__toggle" onClick={toggle} aria-label="Menu">
          <Menu size={21} />
        </button>
        <div>
          <p className="rec-header__hotel">{user?.hotelName || 'AKStay Hotel'} — Front Desk</p>
          <p className="rec-header__date">{format(time, 'EEEE, d MMMM yyyy')}</p>
        </div>
      </div>
      <div className="rec-header__right">
        <p className="rec-header__clock">{format(time, 'HH:mm:ss')}</p>
        <button className="rec-header__notif">
          <Bell size={18} />
          <span className="rec-header__badge">1</span>
        </button>
      </div>
    </header>
  )
}