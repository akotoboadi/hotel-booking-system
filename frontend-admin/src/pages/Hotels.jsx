import { useState } from 'react'
import { Plus, Star, MapPin, X, Upload, User, Trash2 } from 'lucide-react'
import './Hotels.css'

const INITIAL_HOTELS = [
  { id: 1, name: 'The Grand Meridian',   location: 'Paris, France',     rooms: 48, rating: 4.9, status: 'active',      revenue: 142000, type: 'Luxury',   manager: 'Jean Dupont',   email: 'jean@grandmeridian.com' },
  { id: 2, name: 'Azura Beach Resort',   location: 'Maldives',          rooms: 32, rating: 4.8, status: 'active',      revenue: 218000, type: 'Resort',   manager: 'Aisha Rasheed', email: 'aisha@azura.com' },
  { id: 3, name: 'The Vine Boutique',    location: 'Tuscany, Italy',    rooms: 18, rating: 4.7, status: 'active',      revenue: 87000,  type: 'Boutique', manager: 'Marco Rossi',   email: 'marco@vinetuscany.com' },
  { id: 4, name: 'Urban Loft Tokyo',     location: 'Tokyo, Japan',      rooms: 60, rating: 4.6, status: 'maintenance', revenue: 64000,  type: 'Boutique', manager: null,            email: null },
  { id: 5, name: 'Alpine Chalet Zermatt',location: 'Switzerland',       rooms: 22, rating: 4.8, status: 'active',      revenue: 195000, type: 'Luxury',   manager: 'Hans Mueller',  email: 'hans@alpinechalet.com' },
]

const HOTEL_TYPES    = ['Luxury', 'Resort', 'Boutique', 'Villa', 'Budget', 'Business']
const AMENITIES_LIST = ['WiFi', 'Parking', 'Breakfast', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service', 'Airport Shuttle', 'Pet Friendly', 'Beach Access']
const EMPTY_HOTEL    = { name:'', location:'', type:'', description:'', phone:'', email:'', starRating:'3', amenities:[] }
const EMPTY_MANAGER  = { name:'', email:'', phone:'', password:'', confirmPassword:'' }

export default function Hotels() {
  const [hotels, setHotels]             = useState(INITIAL_HOTELS)
  const [showHotelModal, setShowHotel]  = useState(false)
  const [showManagerModal, setShowMgr]  = useState(false)
  const [showDeleteModal, setShowDel]   = useState(false)
  const [selectedHotel, setSelected]    = useState(null)
  const [hotelForm, setHotelForm]       = useState(EMPTY_HOTEL)
  const [managerForm, setMgrForm]       = useState(EMPTY_MANAGER)
  const [hotelErrors, setHotelErrors]   = useState({})
  const [mgrErrors, setMgrErrors]       = useState({})
  const [hotelSuccess, setHotelSuccess] = useState(false)
  const [mgrSuccess, setMgrSuccess]     = useState(false)
  const [activeStep, setActiveStep]     = useState(1)

  /* ── Hotel form ── */
  const toggleAmenity = (a) => setHotelForm(p => ({
    ...p, amenities: p.amenities.includes(a) ? p.amenities.filter(x => x !== a) : [...p.amenities, a]
  }))

  const validateStep = (step) => {
    const e = {}
    if (step === 1) {
      if (!hotelForm.name.trim())        e.name        = 'Hotel name is required'
      if (!hotelForm.type)               e.type        = 'Hotel type is required'
      if (!hotelForm.location.trim())    e.location    = 'Location is required'
      if (!hotelForm.description.trim()) e.description = 'Description is required'
    }
    if (step === 2) {
      if (!hotelForm.email.trim())                       e.email = 'Contact email is required'
      else if (!/\S+@\S+\.\S+/.test(hotelForm.email))   e.email = 'Invalid email'
      if (!hotelForm.phone.trim())                       e.phone = 'Phone is required'
    }
    setHotelErrors(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => { if (validateStep(activeStep)) setActiveStep(s => s + 1) }

  const handleHotelSubmit = (e) => {
    e.preventDefault()
    setHotels(p => [...p, { id: Date.now(), name: hotelForm.name, location: hotelForm.location, type: hotelForm.type, rooms: 0, rating: 0, status: 'active', revenue: 0, manager: null, email: null }])
    setHotelSuccess(true)
    setTimeout(() => { setHotelSuccess(false); setShowHotel(false); setHotelForm(EMPTY_HOTEL); setActiveStep(1); setHotelErrors({}) }, 1800)
  }

  const closeHotelModal = () => { setShowHotel(false); setHotelForm(EMPTY_HOTEL); setHotelErrors({}); setActiveStep(1); setHotelSuccess(false) }

  /* ── Manager form ── */
  const validateMgr = () => {
    const e = {}
    if (!managerForm.name.trim())   e.name  = 'Full name required'
    if (!managerForm.email.trim())  e.email = 'Email required'
    else if (!/\S+@\S+\.\S+/.test(managerForm.email)) e.email = 'Invalid email'
    if (!managerForm.phone.trim())  e.phone = 'Phone required'
    if (!managerForm.password)      e.password = 'Password required'
    else if (managerForm.password.length < 8) e.password = 'Min 8 characters'
    if (managerForm.password !== managerForm.confirmPassword) e.confirmPassword = 'Passwords do not match'
    setMgrErrors(e)
    return Object.keys(e).length === 0
  }

  const handleMgrSubmit = (e) => {
    e.preventDefault()
    if (!validateMgr()) return
    setHotels(p => p.map(h => h.id === selectedHotel.id ? { ...h, manager: managerForm.name, email: managerForm.email } : h))
    setMgrSuccess(true)
    setTimeout(() => { setMgrSuccess(false); setShowMgr(false); setMgrForm(EMPTY_MANAGER); setSelected(null) }, 1800)
  }

  const openMgrModal = (hotel) => { setSelected(hotel); setMgrForm(EMPTY_MANAGER); setMgrErrors({}); setMgrSuccess(false); setShowMgr(true) }
  const closeMgrModal = () => { setShowMgr(false); setMgrForm(EMPTY_MANAGER); setMgrErrors({}); setSelected(null) }

  /* ── Delete ── */
  const openDelete = (hotel) => { setSelected(hotel); setShowDel(true) }
  const confirmDelete = () => { setHotels(p => p.filter(h => h.id !== selectedHotel.id)); setShowDel(false); setSelected(null) }

  return (
    <div className="hotels-page">
      <div className="page-header">
        <div>
          <h1>Hotels</h1>
          <p>{hotels.length} properties managed</p>
        </div>
        <button className="btn-primary" onClick={() => setShowHotel(true)}>
          <Plus size={16} /> Add Hotel
        </button>
      </div>

      {/* Grid */}
      <div className="hotels-grid">
        {hotels.map(h => (
          <div key={h.id} className="hotel-card">
            <div className="hotel-card__img">
              <img
                src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&sig=${h.id}`}
                alt={h.name}
              />
              <span className={`hotel-card__status hotel-card__status--${h.status}`}>{h.status}</span>
              <span className="hotel-card__type">{h.type}</span>
              <button className="hotel-card__del" onClick={() => openDelete(h)} title="Remove hotel">
                <Trash2 size={13} />
              </button>
            </div>

            <div className="hotel-card__body">
              <h3>{h.name}</h3>
              <div className="hotel-card__meta">
                <span><MapPin size={12} /> {h.location}</span>
                {h.rating > 0 && <span><Star size={12} fill="#f59e0b" color="#f59e0b" /> {h.rating}</span>}
              </div>

              {/* Manager strip */}
              <div className="hotel-card__manager">
                <div className="mgr-info">
                  <div className={`mgr-avatar ${!h.manager ? 'mgr-avatar--empty' : ''}`}>
                    <User size={13} />
                  </div>
                  <div>
                    {h.manager
                      ? <><p className="mgr-name">{h.manager}</p><p className="mgr-role">Hotel Manager</p></>
                      : <p className="mgr-empty">No manager assigned</p>
                    }
                  </div>
                </div>
                <button
                  className={`mgr-btn ${h.manager ? 'mgr-btn--change' : 'mgr-btn--assign'}`}
                  onClick={() => openMgrModal(h)}
                >
                  {h.manager ? 'Change' : 'Assign'}
                </button>
              </div>

              <div className="hotel-card__stats">
                <div><strong>{h.rooms}</strong><span>Rooms</span></div>
                <div><strong>{h.revenue > 0 ? '$' + (h.revenue/1000).toFixed(0) + 'k' : '—'}</strong><span>Revenue</span></div>
              </div>

              <div className="hotel-card__actions">
                <button className="btn-primary" style={{ fontSize:'0.8rem', padding:'7px 14px' }}>Manage</button>
                <button className="table-action">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ══ ADD HOTEL MODAL ══ */}
      {showHotelModal && (
        <div className="modal-overlay" onClick={closeHotelModal}>
          <div className="modal modal--large" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>Add New Hotel</h2>
                <p>Fill in the property details to list it on AKStay</p>
              </div>
              <button className="modal__close" onClick={closeHotelModal}><X size={20} /></button>
            </div>

            {/* Steps */}
            <div className="modal-steps">
              {['Basic Info', 'Contact', 'Amenities'].map((label, i) => (
                <div key={label} className={`modal-step ${activeStep === i+1 ? 'modal-step--active' : ''} ${activeStep > i+1 ? 'modal-step--done' : ''}`}>
                  <div className="modal-step__num">{activeStep > i+1 ? '✓' : i+1}</div>
                  <span>{label}</span>
                </div>
              ))}
            </div>

            {hotelSuccess ? (
              <div className="modal__success">
                <div className="success-icon">✓</div>
                <h3>Hotel Added to AKStay!</h3>
                <p>The property is now listed on the platform.</p>
              </div>
            ) : (
              <form onSubmit={handleHotelSubmit}>
                <div className="modal__body">

                  {activeStep === 1 && (
                    <div className="form-step">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Hotel Name <span className="required">*</span></label>
                          <input placeholder="e.g. The Grand Meridian" value={hotelForm.name}
                            onChange={e => { setHotelForm({...hotelForm, name: e.target.value}); setHotelErrors(p=>({...p,name:''})) }}
                            className={hotelErrors.name ? 'input--error' : ''} />
                          {hotelErrors.name && <span className="field-error">{hotelErrors.name}</span>}
                        </div>
                        <div className="form-group">
                          <label>Hotel Type <span className="required">*</span></label>
                          <select value={hotelForm.type}
                            onChange={e => { setHotelForm({...hotelForm, type: e.target.value}); setHotelErrors(p=>({...p,type:''})) }}
                            className={hotelErrors.type ? 'input--error' : ''}>
                            <option value="">Select type</option>
                            {HOTEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          {hotelErrors.type && <span className="field-error">{hotelErrors.type}</span>}
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Location <span className="required">*</span></label>
                        <input placeholder="e.g. 12 Accra Road, East Legon, Accra" value={hotelForm.location}
                          onChange={e => { setHotelForm({...hotelForm, location: e.target.value}); setHotelErrors(p=>({...p,location:''})) }}
                          className={hotelErrors.location ? 'input--error' : ''} />
                        {hotelErrors.location && <span className="field-error">{hotelErrors.location}</span>}
                      </div>
                      <div className="form-group">
                        <label>Description <span className="required">*</span></label>
                        <textarea placeholder="Describe the hotel..." value={hotelForm.description}
                          onChange={e => { setHotelForm({...hotelForm, description: e.target.value}); setHotelErrors(p=>({...p,description:''})) }}
                          className={hotelErrors.description ? 'input--error' : ''} />
                        {hotelErrors.description && <span className="field-error">{hotelErrors.description}</span>}
                      </div>
                      <div className="form-group">
                        <label>Star Rating</label>
                        <div className="star-picker">
                          {[1,2,3,4,5].map(n => (
                            <button type="button" key={n}
                              className={`star-btn ${parseInt(hotelForm.starRating) >= n ? 'star-btn--on' : ''}`}
                              onClick={() => setHotelForm({...hotelForm, starRating: String(n)})}>★</button>
                          ))}
                          <span>{hotelForm.starRating}-Star Property</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="form-step">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Contact Email <span className="required">*</span></label>
                          <input type="email" placeholder="info@hotel.com" value={hotelForm.email}
                            onChange={e => { setHotelForm({...hotelForm, email: e.target.value}); setHotelErrors(p=>({...p,email:''})) }}
                            className={hotelErrors.email ? 'input--error' : ''} />
                          {hotelErrors.email && <span className="field-error">{hotelErrors.email}</span>}
                        </div>
                        <div className="form-group">
                          <label>Phone Number <span className="required">*</span></label>
                          <input type="tel" placeholder="+233 55 000 0000" value={hotelForm.phone}
                            onChange={e => { setHotelForm({...hotelForm, phone: e.target.value}); setHotelErrors(p=>({...p,phone:''})) }}
                            className={hotelErrors.phone ? 'input--error' : ''} />
                          {hotelErrors.phone && <span className="field-error">{hotelErrors.phone}</span>}
                        </div>
                      </div>
                      <div className="form-group">
                        <label>Hotel Images</label>
                        <div className="upload-box">
                          <Upload size={26} />
                          <p>Drag & drop images or <span>browse files</span></p>
                          <small>PNG, JPG up to 10MB · Max 10 images</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="form-step">
                      <div className="form-group">
                        <label>Amenities & Facilities</label>
                        <p style={{ fontSize:'0.82rem', color:'var(--gray-400)', marginBottom:8 }}>Select everything available at this property</p>
                        <div className="amenities-grid">
                          {AMENITIES_LIST.map(a => (
                            <label key={a} className={`amenity-chip ${hotelForm.amenities.includes(a) ? 'amenity-chip--on' : ''}`}>
                              <input type="checkbox" checked={hotelForm.amenities.includes(a)} onChange={() => toggleAmenity(a)} />
                              {a}
                            </label>
                          ))}
                        </div>
                      </div>
                      {hotelForm.amenities.length > 0 && (
                        <div className="amenities-selected">
                          <strong>{hotelForm.amenities.length} selected:</strong> {hotelForm.amenities.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal__footer">
                  <button type="button" className="btn-ghost" onClick={closeHotelModal}>Cancel</button>
                  <div className="modal__footer-right">
                    {activeStep > 1 && (
                      <button type="button" className="btn-outline-sm" onClick={() => setActiveStep(s => s - 1)}>← Back</button>
                    )}
                    {activeStep < 3
                      ? <button type="button" className="btn-primary" onClick={handleNext}>Next →</button>
                      : <button type="submit" className="btn-primary">Add Hotel</button>
                    }
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ ASSIGN MANAGER MODAL ══ */}
      {showManagerModal && selectedHotel && (
        <div className="modal-overlay" onClick={closeMgrModal}>
          <div className="modal modal--medium" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>{selectedHotel.manager ? 'Change Hotel Manager' : 'Assign Hotel Manager'}</h2>
                <p>Creating a manager account for <strong>{selectedHotel.name}</strong></p>
              </div>
              <button className="modal__close" onClick={closeMgrModal}><X size={20} /></button>
            </div>

            {mgrSuccess ? (
              <div className="modal__success">
                <div className="success-icon">✓</div>
                <h3>Manager Account Created!</h3>
                <p>{managerForm.name} is now managing {selectedHotel.name}.</p>
              </div>
            ) : (
              <form onSubmit={handleMgrSubmit}>
                <div className="modal__body">
                  <div className="hotel-tag">
                    <MapPin size={12} />
                    <span>{selectedHotel.name} · {selectedHotel.location}</span>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name <span className="required">*</span></label>
                      <input placeholder="e.g. Kofi Mensah" value={managerForm.name}
                        onChange={e => { setMgrForm({...managerForm, name: e.target.value}); setMgrErrors(p=>({...p,name:''})) }}
                        className={mgrErrors.name ? 'input--error' : ''} />
                      {mgrErrors.name && <span className="field-error">{mgrErrors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>Phone <span className="required">*</span></label>
                      <input type="tel" placeholder="+233 55 000 0000" value={managerForm.phone}
                        onChange={e => { setMgrForm({...managerForm, phone: e.target.value}); setMgrErrors(p=>({...p,phone:''})) }}
                        className={mgrErrors.phone ? 'input--error' : ''} />
                      {mgrErrors.phone && <span className="field-error">{mgrErrors.phone}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Work Email <span className="required">*</span></label>
                    <input type="email" placeholder="manager@hotel.com" value={managerForm.email}
                      onChange={e => { setMgrForm({...managerForm, email: e.target.value}); setMgrErrors(p=>({...p,email:''})) }}
                      className={mgrErrors.email ? 'input--error' : ''} />
                    {mgrErrors.email && <span className="field-error">{mgrErrors.email}</span>}
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Temporary Password <span className="required">*</span></label>
                      <input type="password" placeholder="Min. 8 characters" value={managerForm.password}
                        onChange={e => { setMgrForm({...managerForm, password: e.target.value}); setMgrErrors(p=>({...p,password:''})) }}
                        className={mgrErrors.password ? 'input--error' : ''} />
                      {mgrErrors.password && <span className="field-error">{mgrErrors.password}</span>}
                    </div>
                    <div className="form-group">
                      <label>Confirm Password <span className="required">*</span></label>
                      <input type="password" placeholder="Repeat password" value={managerForm.confirmPassword}
                        onChange={e => { setMgrForm({...managerForm, confirmPassword: e.target.value}); setMgrErrors(p=>({...p,confirmPassword:''})) }}
                        className={mgrErrors.confirmPassword ? 'input--error' : ''} />
                      {mgrErrors.confirmPassword && <span className="field-error">{mgrErrors.confirmPassword}</span>}
                    </div>
                  </div>
                  <div className="info-box">
                    <strong>This manager will be able to:</strong>
                    <ul>
                      <li>Add and manage rooms for {selectedHotel.name}</li>
                      <li>Create receptionist and housekeeping accounts</li>
                      <li>View bookings and revenue for their hotel only</li>
                      <li>Manage room availability and pricing</li>
                    </ul>
                  </div>
                </div>
                <div className="modal__footer">
                  <button type="button" className="btn-ghost" onClick={closeMgrModal}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Manager Account</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ DELETE MODAL ══ */}
      {showDeleteModal && selectedHotel && (
        <div className="modal-overlay" onClick={() => setShowDel(false)}>
          <div className="modal modal--small" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div><h2>Remove Hotel</h2><p>This action cannot be undone</p></div>
              <button className="modal__close" onClick={() => setShowDel(false)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="delete-warning">
                <div className="delete-warning__icon"><Trash2 size={26} /></div>
                <p>You are about to remove <strong>{selectedHotel.name}</strong> from AKStay. All associated rooms and bookings will be permanently deleted.</p>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-ghost" onClick={() => setShowDel(false)}>Cancel</button>
              <button className="btn-danger-solid" onClick={confirmDelete}>Yes, Remove Hotel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}