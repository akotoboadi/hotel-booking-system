import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  User, Mail, Phone, MapPin, Calendar,
  Edit2, Save, X, LogOut, Camera
} from 'lucide-react'
import './Profile.css'

export default function Profile() {
  const { user, logout, login } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing]   = useState(false)
  const [success, setSuccess]   = useState(false)
  const [form, setForm] = useState({
    name:    user?.name    || '',
    email:   user?.email   || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
    dob:     user?.dob     || '',
  })

  if (!user) {
    navigate('/login')
    return null
  }

  const handleSave = () => {
    login({ ...user, ...form }, localStorage.getItem('token') || 'mock-guest-token')
    setEditing(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 2500)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'G'

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">

          {/* ── LEFT: Avatar + nav ── */}
          <aside className="profile-sidebar">
            <div className="profile-avatar-wrap">
              <div className="profile-avatar">
                {user.avatar
                  ? <img src={user.avatar} alt={user.name} />
                  : <span>{initials}</span>
                }
              </div>
              <button className="profile-avatar__change" title="Change photo">
                <Camera size={14} />
              </button>
            </div>
            <p className="profile-sidebar__name">{user.name}</p>
            <p className="profile-sidebar__email">{user.email}</p>
            {user.provider === 'google' && (
              <span className="profile-sidebar__badge">
                <GoogleDot /> Signed in with Google
              </span>
            )}
            <nav className="profile-sidebar__nav">
              <a href="/profile" className="profile-sidebar__link profile-sidebar__link--active">
                <User size={15} /> Profile
              </a>
              <a href="/bookings" className="profile-sidebar__link">
                <Calendar size={15} /> My Bookings
              </a>
            </nav>
            <button className="profile-sidebar__logout" onClick={handleLogout}>
              <LogOut size={15} /> Sign Out
            </button>
          </aside>

          {/* ── RIGHT: Profile details ── */}
          <div className="profile-main">
            <div className="profile-card">
              <div className="profile-card__header">
                <div>
                  <h2>Personal Information</h2>
                  <p>Manage your profile details</p>
                </div>
                {!editing
                  ? (
                    <button className="btn-edit" onClick={() => setEditing(true)}>
                      <Edit2 size={15} /> Edit Profile
                    </button>
                  ) : (
                    <div className="profile-edit-actions">
                      <button className="btn-cancel" onClick={() => setEditing(false)}>
                        <X size={15} /> Cancel
                      </button>
                      <button className="btn-save" onClick={handleSave}>
                        <Save size={15} /> Save
                      </button>
                    </div>
                  )
                }
              </div>

              {success && (
                <div className="profile-success">
                  ✓ Profile updated successfully
                </div>
              )}

              <div className="profile-fields">
                <div className="profile-field">
                  <div className="profile-field__icon"><User size={16} /></div>
                  <div className="profile-field__body">
                    <label>Full Name</label>
                    {editing
                      ? <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your full name" />
                      : <p>{user.name || <span className="profile-field__empty">Not set</span>}</p>
                    }
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-field__icon"><Mail size={16} /></div>
                  <div className="profile-field__body">
                    <label>Email Address</label>
                    {editing
                      ? <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" />
                      : <p>{user.email || <span className="profile-field__empty">Not set</span>}</p>
                    }
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-field__icon"><Phone size={16} /></div>
                  <div className="profile-field__body">
                    <label>Phone Number</label>
                    {editing
                      ? <input type="tel" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+233 55 000 0000" />
                      : <p>{user.phone || <span className="profile-field__empty">Not set</span>}</p>
                    }
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-field__icon"><MapPin size={16} /></div>
                  <div className="profile-field__body">
                    <label>Home Address</label>
                    {editing
                      ? <input value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="City, Country" />
                      : <p>{user.address || <span className="profile-field__empty">Not set</span>}</p>
                    }
                  </div>
                </div>

                <div className="profile-field">
                  <div className="profile-field__icon"><Calendar size={16} /></div>
                  <div className="profile-field__body">
                    <label>Date of Birth</label>
                    {editing
                      ? <input type="date" value={form.dob} onChange={e => setForm({ ...form, dob: e.target.value })} />
                      : <p>{user.dob || <span className="profile-field__empty">Not set</span>}</p>
                    }
                  </div>
                </div>
              </div>
            </div>

            {/* Account info card */}
            <div className="profile-card" style={{ marginTop: 20 }}>
              <div className="profile-card__header">
                <div>
                  <h2>Account</h2>
                  <p>Your account settings and preferences</p>
                </div>
              </div>
              <div className="profile-account-info">
                <div className="account-info-row">
                  <span>Account type</span>
                  <strong>Guest</strong>
                </div>
                <div className="account-info-row">
                  <span>Sign-in method</span>
                  <strong>{user.provider === 'google' ? 'Google OAuth' : 'Email & Password'}</strong>
                </div>
                <div className="account-info-row">
                  <span>Member since</span>
                  <strong>{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function GoogleDot() {
  return (
    <svg width="12" height="12" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.1-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.6-2.9-11.4-7.2l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.7 6l6.2 5.2C40.3 35.7 44 30.3 44 24c0-1.3-.1-2.7-.4-4z"/>
    </svg>
  )
}