import Sidebar from './Sidebar'
import Header from './Header'
import { useSidebar } from '../../context/SidebarContext'
import './Layout.css'

export default function Layout({ children }) {
  const { isOpen, close } = useSidebar()
  return (
    <div className="rec-layout">
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--open' : ''}`}
        onClick={close}
      />
      <Sidebar />
      <div className="rec-layout__main">
        <Header />
        <main className="rec-layout__content">
          {children}
        </main>
      </div>
    </div>
  )
}