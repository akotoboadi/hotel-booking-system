import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Login.css'

export default function AdminLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      await new Promise(r => setTimeout(r, 600))
      if (form.email === 'admin@akstay.com' && form.password === 'admin123') {
        login({ name: 'Super Admin', email: form.email, role: 'admin' })
        navigate('/')
      } else {
        setError('Invalid credentials. Try admin@akstay.com / admin123')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="adm-login">
      <div className="adm-login__card">
        <div className="adm-login__logo">
          AKStay<span>·</span>
          <small>Admin</small>
        </div>

        <h1>Sign in to Admin</h1>
        <p>Manage your properties and bookings</p>

        {error && <div className="adm-login__error">{error}</div>}

        <form onSubmit={handleSubmit} className="adm-login__form">
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              placeholder="admin@akstay.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary adm-login__submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}