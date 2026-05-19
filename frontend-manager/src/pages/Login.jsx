import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Building2, Eye, EyeOff } from 'lucide-react'
import './Login.css'

export default function ManagerLogin() {
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
      if (form.email === 'manager@akstay.com' && form.password === 'manager123') {
        login({
          name: 'Kofi Mensah',
          email: form.email,
          role: 'manager',
          hotelName: 'The Grand Meridian',
          hotelId: 1,
        })
        navigate('/')
      } else {
        setError('Invalid credentials. Try manager@akstay.com / manager123')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="mgr-login">
      <div className="mgr-login__left">
        <div className="mgr-login__card">
          <div className="mgr-login__logo">
            <div className="mgr-login__logo-icon"><Building2 size={22} /></div>
            <div>
              <p className="mgr-login__logo-name">AKStay</p>
              <p className="mgr-login__logo-sub">Hotel Manager Portal</p>
            </div>
          </div>

          <h1>Welcome back</h1>
          <p>Sign in to manage your property</p>

          {error && <div className="mgr-login__error">{error}</div>}

          <form onSubmit={handleSubmit} className="mgr-login__form">
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email" placeholder="manager@hotel.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <div className="mgr-login__pwd-wrap">
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn-primary mgr-login__submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>

      <div className="mgr-login__right">
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=900" alt="hotel" />
        <div className="mgr-login__overlay">
          <h2>"Manage your property with clarity and confidence."</h2>
          <p>AKStay Manager Portal gives you everything you need to run a world-class hotel.</p>
        </div>
      </div>
    </div>
  )
}