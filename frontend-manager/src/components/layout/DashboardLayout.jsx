import Sidebar from './Sidebar'
import Header from './Header'
import { SidebarProvider, useSidebar } from '../../context/SidebarContext'
import './Sidebar.css'
import './Header.css'

function LayoutInner({ children }) {
  const { isOpen, close } = useSidebar()
  return (
    <div className="mgr-layout">
      {/* Overlay for mobile */}
      <div
        className={`mgr-sidebar__overlay ${isOpen ? 'mgr-sidebar__overlay--visible' : ''}`}
        onClick={close}
      />
      <Sidebar />
      <div className="mgr-layout__main">
        <Header />
        <main className="mgr-layout__content">
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





// import Sidebar from './Sidebar'
// import Header from './Header'
// import './Sidebar.css'
// import './Header.css'

// export default function DashboardLayout({ children }) {
//   return (
//     <div className="mgr-layout">
//       <Sidebar />
//       <div className="mgr-layout__main">
//         <Header />
//         <main className="mgr-layout__content">
//           {children}
//         </main>
//       </div>
//     </div>
//   )
// }