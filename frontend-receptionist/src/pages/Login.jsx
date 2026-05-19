import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { ConciergeBell, Eye, EyeOff } from 'lucide-react'
import './Login.css'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPwd, setShowPwd] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await new Promise(r => setTimeout(r, 700))
      if (form.email === 'reception@akstay.com' && form.password === 'reception123') {
        login({ name: 'Abena Owusu', email: form.email, role: 'receptionist', hotelName: 'The Grand Meridian', hotelId: 1 })
        navigate('/')
      } else {
        setError('Invalid credentials. Try reception@akstay.com / reception123')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="rec-login">
      <div className="rec-login__panel">
        <div className="rec-login__card">
          <div className="rec-login__logo">
            <div className="rec-login__logo-icon"><ConciergeBell size={22} /></div>
            <div>
              <p className="rec-login__logo-name">AKStay</p>
              <p className="rec-login__logo-sub">Receptionist Portal</p>
            </div>
          </div>

          <h1>Front Desk Sign In</h1>
          <p>Access your shift dashboard</p>

          {error && <div className="rec-login__error">{error}</div>}

          <form onSubmit={handleSubmit} className="rec-login__form">
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="reception@hotel.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="rec-login__pwd">
                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                <button type="button" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary rec-login__submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In to Front Desk'}
            </button>
          </form>
        </div>
      </div>

      <div className="rec-login__visual">
        <img src="https://images.unsplash.com/photo-1582719508461-905c673771fd?w=900" alt="hotel lobby" />
        <div className="rec-login__visual-overlay">
          <ConciergeBell size={40} color="rgba(255,255,255,0.6)" />
          <h2>Welcome to the Front Desk</h2>
          <p>Manage arrivals, departures, and walk-in guests with ease.</p>
        </div>
      </div>
    </div>
  )
}