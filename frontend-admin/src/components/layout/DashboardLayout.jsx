import Sidebar from './Sidebar'
import Header from './Header'
import './DashboardLayout.css'

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout__main">
        <Header />
        <main className="dashboard-layout__content">
          {children}
        </main>
      </div>
    </div>
  )
}