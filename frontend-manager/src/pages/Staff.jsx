import { useState, useEffect } from 'react'
import { Plus, Search, X, Trash2, Loader } from 'lucide-react'
import { staffAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Staff.css'

const ROLES  = ['Receptionist','Housekeeping','Finance','Security','Maintenance']
const SHIFTS = ['Morning (6am–2pm)','Afternoon (2pm–10pm)','Night (10pm–6am)']
const ROLE_COLOR = { Receptionist:'info', Housekeeping:'warning', Finance:'success', Security:'gray', Maintenance:'danger' }
const EMPTY_FORM = { name:'', role:'', email:'', phone:'', shift:'', password:'', confirmPassword:'' }

export default function Staff() {
  const { user }                  = useAuth()
  const [staff, setStaff]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [roleFilter, setRole]     = useState('All')
  const [showModal, setShowModal] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [targetStaff, setTarget]  = useState(null)
  const [form, setForm]           = useState(EMPTY_FORM)
  const [errors, setErrors]       = useState({})
  const [success, setSuccess]     = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const hotelId = user?.hotel_id

  useEffect(() => {
    if (!hotelId) return
    staffAPI.getByHotel(hotelId)
      .then(res => setStaff(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [hotelId])

  const roleOptions = ['All', ...ROLES]

  const filtered = staff.filter(s =>
    (roleFilter === 'All' || s.role.toLowerCase() === roleFilter.toLowerCase()) &&
    (s.name.toLowerCase().includes(search.toLowerCase()) ||
     s.email.toLowerCase().includes(search.toLowerCase()))
  )

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Full name is required'
    if (!form.role)         e.role  = 'Role is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (!form.phone.trim()) e.phone = 'Phone is required'
    if (!form.shift)        e.shift = 'Shift is required'
    if (!form.password)     e.password = 'Password is required'
    else if (form.password.length < 6) e.password = 'Minimum 6 characters'
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitLoading(true)
    try {
      const res = await staffAPI.create(hotelId, {
        name:     form.name,
        role:     form.role.toLowerCase(),
        email:    form.email,
        phone:    form.phone,
        password: form.password,
      })
      setStaff(prev => [...prev, res.data.data])
      setSuccess(true)
      setTimeout(() => {
        setSuccess(false); setShowModal(false); setForm(EMPTY_FORM)
      }, 1600)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to create staff account.' })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async () => {
    setSubmitLoading(true)
    try {
      await staffAPI.delete(targetStaff.id)
      setStaff(prev => prev.filter(s => s.id !== targetStaff.id))
      setShowDelete(false); setTarget(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to remove staff.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const toggleStatus = async (id) => {
    try {
      const res = await staffAPI.toggleStatus(id)
      setStaff(prev => prev.map(s => s.id === id ? res.data.data : s))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.')
    }
  }

  return (
    <div className="staff-page">
      <div className="page-top">
        <div>
          <h1>Staff</h1>
          <p>{staff.length} team members · {staff.filter(s => s.is_active).length} active</p>
        </div>
        <button className="btn-primary" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setSuccess(false); setShowModal(true) }}>
          <Plus size={15} /> Add Staff
        </button>
      </div>

      {/* Role summary */}
      <div className="staff-role-summary">
        {ROLES.map(r => {
          const count = staff.filter(s => s.role.toLowerCase() === r.toLowerCase()).length
          return (
            <div key={r} className="role-chip">
              <span className={`badge badge--${ROLE_COLOR[r]}`}>{count}</span>
              {r}
            </div>
          )
        })}
      </div>

      <div className="staff-controls">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search staff by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {roleOptions.map(r => (
            <button
              key={r}
              className={`filter-tab ${roleFilter === r ? 'filter-tab--active' : ''}`}
              onClick={() => setRole(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <Loader size={28} style={{ animation:'spin 1s linear infinite', color:'var(--primary)' }} />
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th><th>Role</th><th>Email</th>
                <th>Phone</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="staff-name-cell">
                      <div className="staff-avatar">{s.name[0]}</div>
                      <span className="td-bold">{s.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge--${ROLE_COLOR[s.role.charAt(0).toUpperCase() + s.role.slice(1)] || 'gray'}`}>
                      {s.role.charAt(0).toUpperCase() + s.role.slice(1)}
                    </span>
                  </td>
                  <td style={{ fontSize:'0.84rem', color:'var(--gray-500)' }}>{s.email}</td>
                  <td style={{ fontSize:'0.84rem' }}>{s.phone || '—'}</td>
                  <td>
                    <button
                      className={`status-toggle ${s.is_active ? 'status-toggle--active' : 'status-toggle--inactive'}`}
                      onClick={() => toggleStatus(s.id)}
                    >
                      {s.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td>
                    <button
                      className="td-action td-action--danger"
                      onClick={() => { setTarget(s); setShowDelete(true) }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="table-empty">
              {staff.length === 0 ? 'No staff members yet. Add your first team member.' : 'No staff match your search.'}
            </div>
          )}
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div><h2>Add Staff Member</h2><p>Create a new staff account for this hotel</p></div>
              <button className="modal__close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {success ? (
              <div className="modal__success">
                <div className="success-circle">✓</div>
                <h3>Staff Account Created!</h3>
                <p>{form.name} has been added as {form.role}.</p>
              </div>
            ) : (
              <>
                <div className="modal__body">
                  {errors.submit && (
                    <div style={{ background:'var(--danger-light)', color:'var(--danger)', padding:'10px 14px', borderRadius:8, fontSize:'0.84rem' }}>
                      {errors.submit}
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name <span className="required">*</span></label>
                      <input
                        placeholder="e.g. Abena Owusu" value={form.name}
                        onChange={e => { setForm({...form, name: e.target.value}); setErrors(p=>({...p,name:''})) }}
                        className={errors.name ? 'input--error' : ''}
                      />
                      {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>Role <span className="required">*</span></label>
                      <select
                        value={form.role}
                        onChange={e => { setForm({...form, role: e.target.value}); setErrors(p=>({...p,role:''})) }}
                        className={errors.role ? 'input--error' : ''}
                      >
                        <option value="">Select role</option>
                        {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                      {errors.role && <span className="field-error">{errors.role}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Email <span className="required">*</span></label>
                      <input
                        type="email" placeholder="staff@hotel.com" value={form.email}
                        onChange={e => { setForm({...form, email: e.target.value}); setErrors(p=>({...p,email:''})) }}
                        className={errors.email ? 'input--error' : ''}
                      />
                      {errors.email && <span className="field-error">{errors.email}</span>}
                    </div>
                    <div className="form-group">
                      <label>Phone <span className="required">*</span></label>
                      <input
                        type="tel" placeholder="+233 55 000 0000" value={form.phone}
                        onChange={e => { setForm({...form, phone: e.target.value}); setErrors(p=>({...p,phone:''})) }}
                        className={errors.phone ? 'input--error' : ''}
                      />
                      {errors.phone && <span className="field-error">{errors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Shift <span className="required">*</span></label>
                    <select
                      value={form.shift}
                      onChange={e => { setForm({...form, shift: e.target.value}); setErrors(p=>({...p,shift:''})) }}
                      className={errors.shift ? 'input--error' : ''}
                    >
                      <option value="">Select shift</option>
                      {SHIFTS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.shift && <span className="field-error">{errors.shift}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Temporary Password <span className="required">*</span></label>
                      <input
                        type="password" placeholder="Min. 6 characters" value={form.password}
                        onChange={e => { setForm({...form, password: e.target.value}); setErrors(p=>({...p,password:''})) }}
                        className={errors.password ? 'input--error' : ''}
                      />
                      {errors.password && <span className="field-error">{errors.password}</span>}
                    </div>
                    <div className="form-group">
                      <label>Confirm Password <span className="required">*</span></label>
                      <input
                        type="password" placeholder="Repeat password" value={form.confirmPassword}
                        onChange={e => { setForm({...form, confirmPassword: e.target.value}); setErrors(p=>({...p,confirmPassword:''})) }}
                        className={errors.confirmPassword ? 'input--error' : ''}
                      />
                      {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
                    </div>
                  </div>

                  <div className="info-box">
                    <strong>Account access by role:</strong>
                    <ul>
                      <li>Receptionist — check-in/out portal access</li>
                      <li>Housekeeping — room status board access</li>
                      <li>Finance — revenue reports access</li>
                    </ul>
                  </div>
                </div>

                <div className="modal__footer">
                  <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn-primary" onClick={handleSubmit} disabled={submitLoading}>
                    {submitLoading ? 'Creating...' : 'Create Staff Account'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && targetStaff && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div><h2>Remove Staff Member</h2><p>This cannot be undone</p></div>
              <button className="modal__close" onClick={() => setShowDelete(false)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="delete-confirm">
                <div className="delete-confirm__icon"><Trash2 size={26} /></div>
                <p>Remove <strong>{targetStaff.name}</strong> ({targetStaff.role}) from the system?</p>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-ghost" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={submitLoading}>
                {submitLoading ? 'Removing...' : 'Remove Staff'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}