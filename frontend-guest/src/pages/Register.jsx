import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

// Inline Google SVG icon
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.9-11.4-7.2l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.7 6l6.2 5.2C40.3 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  )
}

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]           = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [gmailLoading, setGmail]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    setError('')
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 800))
      login(
        { name: form.name, email: form.email, id: Date.now(), avatar: null },
        'mock-guest-token'
      )
      navigate('/')
    } catch {
      setError('Registration failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGmailRegister = async () => {
    setGmail(true)
    setError('')
    try {
      await new Promise(r => setTimeout(r, 1200))
      login(
        {
          name: 'Gmail User',
          email: 'gmailuser@gmail.com',
          id: 99,
          avatar: null,
          provider: 'google',
        },
        'mock-google-token'
      )
      navigate('/')
    } catch {
      setError('Google sign-up failed. Please try again.')
    } finally {
      setGmail(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">
            AKStay<span>·</span>
          </Link>
          <h1>Create account</h1>
          <p>Start exploring extraordinary stays</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        {/* Gmail register button */}
        <button
          type="button"
          className="gmail-btn"
          onClick={handleGmailRegister}
          disabled={gmailLoading}
        >
          {gmailLoading ? <span className="gmail-btn__spinner" /> : <GoogleIcon />}
          {gmailLoading ? 'Connecting to Google...' : 'Sign up with Google'}
        </button>

        <div className="auth-divider">
          <span>or register with email</span>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={e => setForm({ ...form, confirm: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            className="btn-primary auth-submit"
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>

      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"
          alt="hotel"
        />
        <div className="auth-visual__overlay">
          <blockquote>"The world is yours to explore."</blockquote>
        </div>
      </div>
    </div>
  )
}