import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import {
  User, Mail, Phone, MapPin, Calendar,
  Edit2, Save, X, LogOut, Camera, Lock
} from 'lucide-react'
import './Profile.css'

export default function Profile() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()

  const [editing, setEditing]     = useState(false)
  const [success, setSuccess]     = useState(false)
  const [error, setError]         = useState('')
  const [loading, setLoading]     = useState(false)
  const [changingPwd, setChangingPwd] = useState(false)

  const [form, setForm] = useState({
    name:    user?.name    || '',
    phone:   user?.phone   || '',
    address: user?.address || '',
    dob:     user?.dob     || '',
  })

  const [pwdForm, setPwdForm] = useState({
    current_password: '',
    new_password:     '',
    confirm:          '',
  })

  if (!user) { navigate('/login'); return null }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await authAPI.updateProfile(form)
      updateUser(res.data.data)
      setEditing(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    if (pwdForm.new_password !== pwdForm.confirm) {
      setError('New passwords do not match.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authAPI.updateProfile({
        current_password: pwdForm.current_password,
        new_password:     pwdForm.new_password,
      })
      setPwdForm({ current_password: '', new_password: '', confirm: '' })
      setChangingPwd(false)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 2500)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to change password.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const initials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'G'

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-layout">

          {/* Sidebar */}
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

            <nav className="profile-sidebar__nav">
              <Link to="/profile"  className="profile-sidebar__link profile-sidebar__link--active">
                <User size={15} /> Profile
              </Link>
              <Link to="/bookings" className="profile-sidebar__link">
                <Calendar size={15} /> My Bookings
              </Link>
            </nav>
            <button className="profile-sidebar__logout" onClick={handleLogout}>
              <LogOut size={15} /> Sign Out
            </button>
          </aside>

          {/* Main */}
          <div className="profile-main">
            {/* Personal Info card */}
            <div className="profile-card">
              <div className="profile-card__header">
                <div>
                  <h2>Personal Information</h2>
                  <p>Manage your profile details</p>
                </div>
                {!editing ? (
                  <button className="btn-edit" onClick={() => setEditing(true)}>
                    <Edit2 size={15} /> Edit Profile
                  </button>
                ) : (
                  <div className="profile-edit-actions">
                    <button className="btn-cancel" onClick={() => setEditing(false)}>
                      <X size={15} /> Cancel
                    </button>
                    <button className="btn-save" onClick={handleSave} disabled={loading}>
                      <Save size={15} /> {loading ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                )}
              </div>

              {success && <div className="profile-success">✓ Changes saved successfully</div>}
              {error   && <div className="profile-error">{error}</div>}

              <div className="profile-fields">
                {[
                  { icon: User,     label: 'Full Name',     key: 'name',    type: 'text',  placeholder: 'Your full name' },
                  { icon: Mail,     label: 'Email',         key: 'email',   type: 'email', placeholder: 'your@email.com', readOnly: true },
                  { icon: Phone,    label: 'Phone',         key: 'phone',   type: 'tel',   placeholder: '+233 55 000 0000' },
                  { icon: MapPin,   label: 'Address',       key: 'address', type: 'text',  placeholder: 'City, Country' },
                  { icon: Calendar, label: 'Date of Birth', key: 'dob',     type: 'date',  placeholder: '' },
                ].map(({ icon: Icon, label, key, type, placeholder, readOnly }) => (
                  <div key={key} className="profile-field">
                    <div className="profile-field__icon"><Icon size={16} /></div>
                    <div className="profile-field__body">
                      <label>{label}</label>
                      {editing && !readOnly ? (
                        <input
                          type={type}
                          value={key === 'email' ? user.email : form[key]}
                          placeholder={placeholder}
                          readOnly={readOnly}
                          onChange={e => setForm({ ...form, [key]: e.target.value })}
                        />
                      ) : (
                        <p>{key === 'email' ? user.email : (user[key] || form[key] || <span className="profile-field__empty">Not set</span>)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Change Password card */}
            <div className="profile-card" style={{ marginTop: 20 }}>
              <div className="profile-card__header">
                <div>
                  <h2>Password & Security</h2>
                  <p>Update your password</p>
                </div>
                {!changingPwd && (
                  <button className="btn-edit" onClick={() => setChangingPwd(true)}>
                    <Lock size={15} /> Change Password
                  </button>
                )}
              </div>

              {changingPwd && (
                <form className="profile-pwd-form" onSubmit={handlePasswordChange}>
                  <div className="profile-field" style={{ borderBottom:'none' }}>
                    <div className="profile-field__icon"><Lock size={16} /></div>
                    <div className="profile-field__body" style={{ display:'flex', flexDirection:'column', gap:12 }}>
                      <div className="form-group">
                        <label>Current Password</label>
                        <input
                          type="password"
                          value={pwdForm.current_password}
                          onChange={e => setPwdForm({ ...pwdForm, current_password: e.target.value })}
                          placeholder="Your current password"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>New Password</label>
                        <input
                          type="password"
                          value={pwdForm.new_password}
                          onChange={e => setPwdForm({ ...pwdForm, new_password: e.target.value })}
                          placeholder="Min. 6 characters"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Confirm New Password</label>
                        <input
                          type="password"
                          value={pwdForm.confirm}
                          onChange={e => setPwdForm({ ...pwdForm, confirm: e.target.value })}
                          placeholder="Repeat new password"
                          required
                        />
                      </div>
                      <div style={{ display:'flex', gap:10, marginTop:4 }}>
                        <button type="submit" className="btn-save" disabled={loading}>
                          {loading ? 'Updating...' : 'Update Password'}
                        </button>
                        <button type="button" className="btn-cancel" onClick={() => { setChangingPwd(false); setError('') }}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {!changingPwd && (
                <div className="profile-account-info">
                  <div className="account-info-row">
                    <span>Sign-in method</span>
                    <strong>{user.provider === 'google' ? 'Google OAuth' : 'Email & Password'}</strong>
                  </div>
                  <div className="account-info-row">
                    <span>Account type</span>
                    <strong>Guest</strong>
                  </div>
                  <div className="account-info-row">
                    <span>Member since</span>
                    <strong>{new Date(user.created_at || Date.now()).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}