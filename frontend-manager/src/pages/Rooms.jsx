import { useState, useEffect } from 'react'
import { Plus, Search, X, Trash2, Users, Loader } from 'lucide-react'
import { roomsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Rooms.css'

const ROOM_TYPES  = ['Standard','Deluxe','Suite','Presidential Suite','Villa','Studio']
const AMENITIES   = ['WiFi','Air Conditioning','TV','Mini Bar','Safe','Balcony','Bathtub','Sea View','Kitchen','Jacuzzi']
const STATUS_OPTS = ['available','occupied','maintenance','reserved']
const STATUS_COLOR = { available:'success', occupied:'info', maintenance:'warning', reserved:'gray' }

const EMPTY_FORM = {
  name:'', type:'', floor:'', capacity:'', price:'',
  description:'', amenities:[], status:'available'
}

export default function Rooms() {
  const { user }              = useAuth()
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [typeFilter, setType] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showModal, setShowModal]   = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [editRoom, setEditRoom]     = useState(null)
  const [targetRoom, setTarget]     = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [errors, setErrors]         = useState({})
  const [success, setSuccess]       = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const hotelId = user?.hotel_id

  useEffect(() => {
    if (!hotelId) return
    fetchRooms()
  }, [hotelId])

  const fetchRooms = async () => {
    setLoading(true)
    try {
      const res = await roomsAPI.getByHotel(hotelId)
      setRooms(res.data.data || [])
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }

  const types = ['All', ...new Set(rooms.map(r => r.type).filter(Boolean))]

  const filtered = rooms.filter(r => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) ||
                        String(r.floor).includes(search)
    const matchType   = typeFilter === 'All' || r.type === typeFilter
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name     = 'Room name is required'
    if (!form.type)         e.type     = 'Room type is required'
    if (!form.floor)        e.floor    = 'Floor is required'
    if (!form.capacity)     e.capacity = 'Capacity is required'
    if (!form.price)        e.price    = 'Price is required'
    else if (isNaN(form.price) || +form.price <= 0) e.price = 'Enter a valid price'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const toggleAmenity = (a) => setForm(prev => ({
    ...prev,
    amenities: prev.amenities.includes(a)
      ? prev.amenities.filter(x => x !== a)
      : [...prev.amenities, a]
  }))

  const openAdd = () => {
    setEditRoom(null); setForm(EMPTY_FORM)
    setErrors({}); setSuccess(false); setShowModal(true)
  }

  const openEdit = (room) => {
    setEditRoom(room)
    setForm({
      name:        room.name,
      type:        room.type        || '',
      floor:       String(room.floor    || ''),
      capacity:    String(room.capacity || ''),
      price:       String(room.price    || ''),
      description: room.description || '',
      amenities:   [...(room.amenities || [])],
      status:      room.status      || 'available',
    })
    setErrors({}); setSuccess(false); setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSubmitLoading(true)
    try {
      const payload = {
        name:        form.name,
        type:        form.type,
        floor:       +form.floor,
        capacity:    +form.capacity,
        price:       +form.price,
        description: form.description,
        amenities:   form.amenities,
        status:      form.status,
      }
      if (editRoom) {
        const res = await roomsAPI.update(editRoom.id, payload)
        setRooms(prev => prev.map(r => r.id === editRoom.id ? res.data.data : r))
      } else {
        const res = await roomsAPI.create(hotelId, payload)
        setRooms(prev => [...prev, res.data.data])
      }
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM) }, 1600)
    } catch (err) {
      setErrors({ submit: err.response?.data?.error || 'Failed to save room.' })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async () => {
    setSubmitLoading(true)
    try {
      await roomsAPI.delete(targetRoom.id)
      setRooms(prev => prev.filter(r => r.id !== targetRoom.id))
      setShowDelete(false); setTarget(null)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete room.')
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleStatusChange = async (room, newStatus) => {
    try {
      const res = await roomsAPI.updateStatus(room.id, newStatus)
      setRooms(prev => prev.map(r => r.id === room.id ? res.data.data : r))
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update status.')
    }
  }

  // Summary counts
  const counts = { available:0, occupied:0, maintenance:0, reserved:0 }
  rooms.forEach(r => { if (counts[r.status] !== undefined) counts[r.status]++ })

  if (!hotelId) {
    return (
      <div style={{ textAlign:'center', padding:60, color:'var(--gray-500)' }}>
        <p>Your account is not assigned to a hotel yet.</p>
      </div>
    )
  }

  return (
    <div className="rooms-page">
      <div className="page-top">
        <div>
          <h1>Rooms</h1>
          <p>{rooms.length} total rooms</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Room</button>
      </div>

      {/* Summary */}
      <div className="rooms-summary">
        {Object.entries(counts).map(([status, count]) => (
          <div key={status} className={`summary-pill summary-pill--${STATUS_COLOR[status]}`}>
            <strong>{count}</strong> {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="rooms-controls">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by room name or floor..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {types.map(t => (
            <button
              key={t}
              className={`filter-tab ${typeFilter === t ? 'filter-tab--active' : ''}`}
              onClick={() => setType(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <select
          className="status-select"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="All">All Statuses</option>
          {STATUS_OPTS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <Loader size={28} style={{ animation:'spin 1s linear infinite', color:'var(--primary)' }} />
        </div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room</th><th>Type</th><th>Floor</th><th>Capacity</th>
                <th>Price/Night</th><th>Amenities</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td className="td-bold">#{r.name}</td>
                  <td>{r.type}</td>
                  <td>Floor {r.floor}</td>
                  <td>
                    <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                      <Users size={13} color="var(--gray-400)" /> {r.capacity}
                    </span>
                  </td>
                  <td className="td-bold">${r.price}</td>
                  <td>
                    <div className="amenity-tags">
                      {(r.amenities || []).slice(0, 2).map(a => (
                        <span key={a} className="amenity-tag">{a}</span>
                      ))}
                      {(r.amenities || []).length > 2 && (
                        <span className="amenity-tag amenity-tag--more">
                          +{r.amenities.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    <select
                      className={`status-pill status-pill--${STATUS_COLOR[r.status]}`}
                      value={r.status}
                      onChange={e => handleStatusChange(r, e.target.value)}
                    >
                      {STATUS_OPTS.map(s => (
                        <option key={s} value={s}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:8 }}>
                      <button className="td-action" onClick={() => openEdit(r)}>Edit</button>
                      <button
                        className="td-action td-action--danger"
                        onClick={() => { setTarget(r); setShowDelete(true) }}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="table-empty">
              {rooms.length === 0 ? 'No rooms yet. Add your first room.' : 'No rooms match your filters.'}
            </div>
          )}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>{editRoom ? `Edit Room — ${editRoom.name}` : 'Add New Room'}</h2>
                <p>{editRoom ? 'Update room details' : 'Fill in room details'}</p>
              </div>
              <button className="modal__close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {success ? (
              <div className="modal__success">
                <div className="success-circle">✓</div>
                <h3>{editRoom ? 'Room Updated!' : 'Room Added!'}</h3>
                <p>Room {form.name} has been {editRoom ? 'updated' : 'added'} successfully.</p>
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
                      <label>Room Name / Number <span className="required">*</span></label>
                      <input
                        placeholder="e.g. Deluxe Room 204"
                        value={form.name}
                        onChange={e => { setForm({...form, name: e.target.value}); setErrors(p=>({...p,name:''})) }}
                        className={errors.name ? 'input--error' : ''}
                      />
                      {errors.name && <span className="field-error">{errors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>Room Type <span className="required">*</span></label>
                      <select
                        value={form.type}
                        onChange={e => { setForm({...form, type: e.target.value}); setErrors(p=>({...p,type:''})) }}
                        className={errors.type ? 'input--error' : ''}
                      >
                        <option value="">Select type</option>
                        {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.type && <span className="field-error">{errors.type}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Floor <span className="required">*</span></label>
                      <input
                        type="number" min="1" placeholder="e.g. 2"
                        value={form.floor}
                        onChange={e => { setForm({...form, floor: e.target.value}); setErrors(p=>({...p,floor:''})) }}
                        className={errors.floor ? 'input--error' : ''}
                      />
                      {errors.floor && <span className="field-error">{errors.floor}</span>}
                    </div>
                    <div className="form-group">
                      <label>Max Capacity <span className="required">*</span></label>
                      <input
                        type="number" min="1" max="10" placeholder="e.g. 2"
                        value={form.capacity}
                        onChange={e => { setForm({...form, capacity: e.target.value}); setErrors(p=>({...p,capacity:''})) }}
                        className={errors.capacity ? 'input--error' : ''}
                      />
                      {errors.capacity && <span className="field-error">{errors.capacity}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price per Night ($) <span className="required">*</span></label>
                      <input
                        type="number" min="1" placeholder="e.g. 250"
                        value={form.price}
                        onChange={e => { setForm({...form, price: e.target.value}); setErrors(p=>({...p,price:''})) }}
                        className={errors.price ? 'input--error' : ''}
                      />
                      {errors.price && <span className="field-error">{errors.price}</span>}
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select
                        value={form.status}
                        onChange={e => setForm({...form, status: e.target.value})}
                      >
                        {STATUS_OPTS.map(s => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      placeholder="Describe the room..."
                      value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Amenities</label>
                    <div className="amenities-picker">
                      {AMENITIES.map(a => (
                        <button
                          type="button"
                          key={a}
                          className={`amenity-pick ${form.amenities.includes(a) ? 'amenity-pick--on' : ''}`}
                          onClick={() => toggleAmenity(a)}
                        >
                          {form.amenities.includes(a) ? '✓ ' : ''}{a}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal__footer">
                  <button className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={submitLoading}
                  >
                    {submitLoading ? 'Saving...' : editRoom ? 'Save Changes' : 'Add Room'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {showDelete && targetRoom && (
        <div className="modal-overlay" onClick={() => setShowDelete(false)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div><h2>Delete Room</h2><p>This cannot be undone</p></div>
              <button className="modal__close" onClick={() => setShowDelete(false)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="delete-confirm">
                <div className="delete-confirm__icon"><Trash2 size={26} /></div>
                <p>Delete <strong>{targetRoom.name}</strong>? Active bookings will be affected.</p>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-ghost" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete} disabled={submitLoading}>
                {submitLoading ? 'Deleting...' : 'Delete Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}