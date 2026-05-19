import { SidebarProvider, useSidebar } from '../../context/SidebarContext'
import Sidebar from './Sidebar'
import Header from './Header'
import './DashboardLayout.css'

function LayoutInner({ children }) {
  const { isOpen, close } = useSidebar()
  return (
    <div className="adm-layout">
      {/* Mobile overlay */}
      {isOpen && (
        <div className="adm-overlay" onClick={close} />
      )}
      <Sidebar />
      <div className="adm-layout__main">
        <Header />
        <main className="adm-layout__content">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  )
}