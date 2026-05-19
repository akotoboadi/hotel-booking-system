import { useState } from 'react'
import { Plus, Search, X, Trash2, BedDouble, Users, DollarSign } from 'lucide-react'
import './Rooms.css'

const ROOM_TYPES  = ['Standard', 'Deluxe', 'Suite', 'Presidential Suite', 'Villa', 'Studio']
const AMENITIES   = ['WiFi', 'Air Conditioning', 'TV', 'Mini Bar', 'Safe', 'Balcony', 'Bathtub', 'Sea View', 'Kitchen', 'Jacuzzi']
const STATUS_OPTS = ['available', 'occupied', 'maintenance', 'reserved']

const INIT_ROOMS = [
  { id: 1, number: '101', type: 'Standard',  floor: 1, capacity: 2, price: 120, status: 'available',   amenities: ['WiFi','TV','Air Conditioning'] },
  { id: 2, number: '102', type: 'Standard',  floor: 1, capacity: 2, price: 120, status: 'occupied',    amenities: ['WiFi','TV','Air Conditioning'] },
  { id: 3, number: '201', type: 'Deluxe',    floor: 2, capacity: 2, price: 220, status: 'available',   amenities: ['WiFi','TV','Mini Bar','Balcony'] },
  { id: 4, number: '202', type: 'Deluxe',    floor: 2, capacity: 3, price: 220, status: 'maintenance', amenities: ['WiFi','TV','Mini Bar'] },
  { id: 5, number: '301', type: 'Suite',     floor: 3, capacity: 4, price: 420, status: 'available',   amenities: ['WiFi','TV','Mini Bar','Bathtub','Sea View'] },
  { id: 6, number: '401', type: 'Presidential Suite', floor: 4, capacity: 4, price: 980, status: 'reserved', amenities: ['WiFi','TV','Mini Bar','Bathtub','Jacuzzi','Kitchen'] },
]

const EMPTY_FORM = { number: '', type: '', floor: '', capacity: '', price: '', description: '', amenities: [], status: 'available' }

const STATUS_COLOR = { available: 'success', occupied: 'info', maintenance: 'warning', reserved: 'gray' }

export default function Rooms() {
  const [rooms, setRooms]             = useState(INIT_ROOMS)
  const [search, setSearch]           = useState('')
  const [typeFilter, setTypeFilter]   = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showModal, setShowModal]     = useState(false)
  const [showDelete, setShowDelete]   = useState(false)
  const [editRoom, setEditRoom]       = useState(null)
  const [targetRoom, setTargetRoom]   = useState(null)
  const [form, setForm]               = useState(EMPTY_FORM)
  const [errors, setErrors]           = useState({})
  const [success, setSuccess]         = useState(false)

  const types = ['All', ...new Set(INIT_ROOMS.map(r => r.type))]

  const filtered = rooms.filter(r => {
    const matchSearch = r.number.includes(search) || r.type.toLowerCase().includes(search.toLowerCase())
    const matchType   = typeFilter === 'All' || r.type === typeFilter
    const matchStatus = statusFilter === 'All' || r.status === statusFilter
    return matchSearch && matchType && matchStatus
  })

  const validate = () => {
    const e = {}
    if (!form.number.trim())  e.number   = 'Room number is required'
    if (!form.type)           e.type     = 'Room type is required'
    if (!form.floor)          e.floor    = 'Floor is required'
    if (!form.capacity)       e.capacity = 'Capacity is required'
    if (!form.price)          e.price    = 'Price is required'
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
    setForm({ number: room.number, type: room.type, floor: String(room.floor), capacity: String(room.capacity), price: String(room.price), description: room.description || '', amenities: [...room.amenities], status: room.status })
    setErrors({}); setSuccess(false); setShowModal(true)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    if (editRoom) {
      setRooms(prev => prev.map(r => r.id === editRoom.id
        ? { ...r, ...form, floor: +form.floor, capacity: +form.capacity, price: +form.price }
        : r
      ))
    } else {
      setRooms(prev => [...prev, { id: Date.now(), ...form, floor: +form.floor, capacity: +form.capacity, price: +form.price }])
    }
    setSuccess(true)
    setTimeout(() => { setSuccess(false); setShowModal(false); setForm(EMPTY_FORM) }, 1600)
  }

  const handleDelete = () => {
    setRooms(prev => prev.filter(r => r.id !== targetRoom.id))
    setShowDelete(false); setTargetRoom(null)
  }

  const handleStatusChange = (room, newStatus) => {
    setRooms(prev => prev.map(r => r.id === room.id ? { ...r, status: newStatus } : r))
  }

  // Summary counts
  const counts = { available: 0, occupied: 0, maintenance: 0, reserved: 0 }
  rooms.forEach(r => counts[r.status]++)

  return (
    <div className="rooms-page">
      <div className="page-top">
        <div>
          <h1>Rooms</h1>
          <p>{rooms.length} total rooms across all floors</p>
        </div>
        <button className="btn-primary" onClick={openAdd}><Plus size={15} /> Add Room</button>
      </div>

      {/* Summary pills */}
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
          <input placeholder="Search by room number or type..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {types.map(t => (
            <button key={t} className={`filter-tab ${typeFilter === t ? 'filter-tab--active' : ''}`} onClick={() => setTypeFilter(t)}>{t}</button>
          ))}
        </div>
        <select className="status-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
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
                <td  data-label="Room" className="td-bold">#{r.number}</td>
                <td data-label="Type" >{r.type}</td>
                <td data-label="Floor">Floor {r.floor}</td>
                <td data-label="Capacity">
                  <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                    <Users size={13} color="var(--gray-400)" /> {r.capacity}
                  </span>
                </td>
                <td data-label="Price" className="td-bold">${r.price}</td>
                <td data-label="Amenities">
                  <div className="amenity-tags">
                    {r.amenities.slice(0, 2).map(a => <span key={a} className="amenity-tag">{a}</span>)}
                    {r.amenities.length > 2 && <span className="amenity-tag amenity-tag--more">+{r.amenities.length - 2}</span>}
                  </div>
                </td>
                <td data-label="Status">
                  <select
                    className={`status-pill status-pill--${STATUS_COLOR[r.status]}`}
                    value={r.status}
                    onChange={e => handleStatusChange(r, e.target.value)}
                  >
                    {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </td>
                <td data-label="Actions">
                  <div style={{ display:'flex', gap:8 }}>
                    <button className="td-action" onClick={() => openEdit(r)}>Edit</button>
                    <button className="td-action td-action--danger" onClick={() => { setTargetRoom(r); setShowDelete(true) }}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="table-empty">No rooms match your filters.</div>}
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal--lg" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>{editRoom ? `Edit Room #${editRoom.number}` : 'Add New Room'}</h2>
                <p>{editRoom ? 'Update room details below' : 'Fill in details to add a room'}</p>
              </div>
              <button className="modal__close" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>

            {success ? (
              <div className="modal__success">
                <div className="success-circle">✓</div>
                <h3>{editRoom ? 'Room Updated!' : 'Room Added!'}</h3>
                <p>Room #{form.number} has been {editRoom ? 'updated' : 'added'} successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="modal__body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Room Number <span className="required">*</span></label>
                      <input placeholder="e.g. 204" value={form.number}
                        onChange={e => { setForm({...form, number: e.target.value}); setErrors(p=>({...p,number:''})) }}
                        className={errors.number ? 'input--error' : ''} />
                      {errors.number && <span className="field-error">{errors.number}</span>}
                    </div>
                    <div className="form-group">
                      <label>Room Type <span className="required">*</span></label>
                      <select value={form.type}
                        onChange={e => { setForm({...form, type: e.target.value}); setErrors(p=>({...p,type:''})) }}
                        className={errors.type ? 'input--error' : ''}>
                        <option value="">Select type</option>
                        {ROOM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.type && <span className="field-error">{errors.type}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Floor <span className="required">*</span></label>
                      <input type="number" min="1" placeholder="e.g. 2" value={form.floor}
                        onChange={e => { setForm({...form, floor: e.target.value}); setErrors(p=>({...p,floor:''})) }}
                        className={errors.floor ? 'input--error' : ''} />
                      {errors.floor && <span className="field-error">{errors.floor}</span>}
                    </div>
                    <div className="form-group">
                      <label>Max Capacity <span className="required">*</span></label>
                      <input type="number" min="1" max="10" placeholder="e.g. 2" value={form.capacity}
                        onChange={e => { setForm({...form, capacity: e.target.value}); setErrors(p=>({...p,capacity:''})) }}
                        className={errors.capacity ? 'input--error' : ''} />
                      {errors.capacity && <span className="field-error">{errors.capacity}</span>}
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Price per Night ($) <span className="required">*</span></label>
                      <input type="number" min="1" placeholder="e.g. 250" value={form.price}
                        onChange={e => { setForm({...form, price: e.target.value}); setErrors(p=>({...p,price:''})) }}
                        className={errors.price ? 'input--error' : ''} />
                      {errors.price && <span className="field-error">{errors.price}</span>}
                    </div>
                    <div className="form-group">
                      <label>Status</label>
                      <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea placeholder="Describe the room — view, layout, special features..." value={form.description}
                      onChange={e => setForm({...form, description: e.target.value})} />
                  </div>

                  <div className="form-group">
                    <label>Amenities</label>
                    <div className="amenities-picker">
                      {AMENITIES.map(a => (
                        <label key={a} className={`amenity-pick ${form.amenities.includes(a) ? 'amenity-pick--on' : ''}`}>
                          <input type="checkbox" checked={form.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                          {a}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="modal__footer">
                  <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">{editRoom ? 'Save Changes' : 'Add Room'}</button>
                </div>
              </form>
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
                <p>Are you sure you want to delete <strong>Room #{targetRoom.number}</strong>? Any existing bookings linked to this room will be affected.</p>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-ghost" onClick={() => setShowDelete(false)}>Cancel</button>
              <button className="btn-danger" onClick={handleDelete}>Delete Room</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}