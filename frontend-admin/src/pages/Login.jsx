import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 600))
      // Replace with real API call when backend is ready
      if (form.email === 'admin@luxestay.com' && form.password === 'admin123') {
        login({ name: 'Super Admin', email: form.email, role: 'admin' })
        navigate('/')
      } else {
        setError('Invalid credentials. Try admin@luxestay.com / admin123')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__card">
        <div className="admin-login__logo">LuxeStay<span>·</span> <small>Admin</small></div>
        <h1>Sign in to Admin</h1>
        <p>Manage your properties and bookings</p>

        {error && <div className="admin-login__error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="admin-login__group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="admin@luxestay.com" required />
          </div>
          <div className="admin-login__group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          </div>
          <button type="submit" className="btn-primary admin-login__submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}