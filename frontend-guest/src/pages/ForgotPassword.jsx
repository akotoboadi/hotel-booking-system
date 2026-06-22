import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft } from 'lucide-react'
import './Auth.css'

export default function ForgotPassword() {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      // Will call: await api.post('/api/auth/forgot-password', { email })
      // For now shows success since email service not yet configured
      await new Promise(r => setTimeout(r, 1000))
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-card__header">
          <Link to="/" className="auth-card__logo">AKStay<span>·</span></Link>
          <h1>Forgot password?</h1>
          <p>Enter your email and we'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="forgot-success">
            <div className="forgot-success__icon"><Mail size={28} /></div>
            <h3>Check your inbox</h3>
            <p>
              We sent a password reset link to <strong>{email}</strong>.
              Check your spam folder if you don't see it.
            </p>
            <Link to="/login" className="btn-primary auth-submit" style={{ textAlign: 'center', display: 'block' }}>
              Back to Sign In
            </Link>
          </div>
        ) : (
          <>
            {error && <div className="auth-error">{error}</div>}
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn-primary auth-submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p className="auth-switch">
              <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </p>
          </>
        )}
      </div>

      <div className="auth-visual">
        <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800" alt="hotel" />
        <div className="auth-visual__overlay">
          <blockquote>"We'll get you back in no time."</blockquote>
        </div>
      </div>
    </div>
  )
}