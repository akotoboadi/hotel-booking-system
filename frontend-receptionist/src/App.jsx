import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SidebarProvider } from './context/SidebarContext'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Arrivals from './pages/Arrivals'
import Departures from './pages/Departures'
import WalkIn from './pages/WalkIn'
import GuestSearch from './pages/GuestSearch'
import RoomGrid from './pages/RoomGrid'

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <SidebarProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/"           element={<Dashboard />} />
                    <Route path="/arrivals"   element={<Arrivals />} />
                    <Route path="/departures" element={<Departures />} />
                    <Route path="/walkin"     element={<WalkIn />} />
                    <Route path="/guests"     element={<GuestSearch />} />
                    <Route path="/rooms"      element={<RoomGrid />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </SidebarProvider>
    </AuthProvider>
  )
}