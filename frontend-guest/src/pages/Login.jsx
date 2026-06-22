import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Eye, EyeOff, Mail } from 'lucide-react'
import { authAPI } from '../services/api'
import './Auth.css'

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

export default function Login() {
  const { login }    = useAuth()
  const navigate     = useNavigate()
  const location     = useLocation()
  const redirectTo   = location.state?.from || '/'

  const [form, setForm]               = useState({ email: '', password: '' })
  const [showPwd, setShowPwd]         = useState(false)
  const [error, setError]             = useState('')
  const [loading, setLoading]         = useState(false)
  const [gmailLoading, setGmailLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res  = await authAPI.login(form)
      const data = res.data.data
      login(data.user, data.access_token)
      navigate(redirectTo, { replace: true })
    } catch (err) {
      const msg = err.response?.data?.error || 'Login failed. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Google OAuth — still mock until Google credentials are configured
  const handleGmailLogin = async () => {
    setGmailLoading(true)
    setError('')
    try {
      // When real Google credentials are ready, replace this with:
      // const googleToken = await getGoogleToken()
      // const res = await authAPI.google(googleToken)
      await new Promise(r => setTimeout(r, 1000))
      setError('Google sign-in requires configuration. Use email login for now.')
    } catch {
      setError('Google sign-in failed.')
    } finally {
      setGmailLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">AKStay<span>·</span></Link>
          <h1>Welcome back</h1>
          <p>Sign in to manage your bookings</p>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <button
          type="button"
          className="gmail-btn"
          onClick={handleGmailLogin}
          disabled={gmailLoading}
        >
          {gmailLoading ? <span className="gmail-btn__spinner" /> : <GoogleIcon />}
          {gmailLoading ? 'Signing in...' : 'Continue with Google'}
        </button>

        <div className="auth-divider"><span>or sign in with email</span></div>

        <form className="auth-form" onSubmit={handleSubmit}>
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
            <div className="input-with-icon">
              <input
                type={showPwd ? 'text' : 'password'}
                placeholder="Your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
              <button type="button" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="auth-forgot">
            <Link to="/forgot-password">Forgot password?</Link>
          </div>

          <button type="submit" className="btn-primary auth-submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>

        <p className="auth-hint">
          <Mail size={12} /> Demo: guest@akstay.com / guest123
        </p>
      </div>

      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1455587734955-081b22074882?w=800" alt="hotel" />
        <div className="auth-visual__overlay">
          <blockquote>"Every great stay begins with the right choice."</blockquote>
        </div>
      </div>
    </div>
  )
}