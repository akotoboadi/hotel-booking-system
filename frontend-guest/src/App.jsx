import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import Home from './pages/Home'
import Search from './pages/Search'
import HotelDetail from './pages/HotelDetail'
import Booking from './pages/Booking'
import Confirmation from './pages/Confirmation'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/"              element={<Home />} />
          <Route path="/search"        element={<Search />} />
          <Route path="/hotel/:id"     element={<HotelDetail />} />
          <Route path="/bookings"      element={<Booking />} />
          <Route path="/confirmation"  element={<Confirmation />} />
          <Route path="/profile"       element={<Profile />} />
          <Route path="/login"         element={<Login />} />
          <Route path="/register"      element={<Register />} />
        </Routes>
        <Footer />
      </Router>
    </AuthProvider>
  )
}