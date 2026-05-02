import { useState } from 'react'
import { Plus, Star, MapPin, X, Upload, User, Trash2 } from 'lucide-react'
import './Hotels.css'

const INITIAL_HOTELS = [
  { id: 1, name: 'The Grand Meridian', location: 'Paris, France', rooms: 48, rating: 4.9, status: 'active', revenue: 142000, type: 'Luxury', manager: 'Jean Dupont', email: 'jean@grandmeridian.com' },
  { id: 2, name: 'Azura Beach Resort', location: 'Maldives', rooms: 32, rating: 4.8, status: 'active', revenue: 218000, type: 'Resort', manager: 'Aisha Rasheed', email: 'aisha@azura.com' },
  { id: 3, name: 'The Vine Boutique', location: 'Tuscany, Italy', rooms: 18, rating: 4.7, status: 'active', revenue: 87000, type: 'Boutique', manager: 'Marco Rossi', email: 'marco@vinetuscany.com' },
  { id: 4, name: 'Urban Loft Tokyo', location: 'Tokyo, Japan', rooms: 60, rating: 4.6, status: 'maintenance', revenue: 64000, type: 'Boutique', manager: null, email: null },
  { id: 5, name: 'Alpine Chalet Zermatt', location: 'Switzerland', rooms: 22, rating: 4.8, status: 'active', revenue: 195000, type: 'Luxury', manager: 'Hans Mueller', email: 'hans@alpinechalet.com' },
]

const HOTEL_TYPES = ['Luxury', 'Resort', 'Boutique', 'Villa', 'Budget', 'Business']
const AMENITIES_LIST = ['WiFi', 'Parking', 'Breakfast', 'Pool', 'Gym', 'Spa', 'Restaurant', 'Bar', 'Room Service', 'Airport Shuttle', 'Pet Friendly', 'Beach Access']

const EMPTY_HOTEL_FORM = {
  name: '', location: '', type: '', description: '',
  phone: '', email: '', starRating: '3', amenities: [],
}

const EMPTY_MANAGER_FORM = {
  name: '', email: '', phone: '', password: '', confirmPassword: ''
}

export default function Hotels() {
  const [hotels, setHotels] = useState(INITIAL_HOTELS)
  const [showHotelModal, setShowHotelModal] = useState(false)
  const [showManagerModal, setShowManagerModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedHotel, setSelectedHotel] = useState(null)
  const [hotelForm, setHotelForm] = useState(EMPTY_HOTEL_FORM)
  const [managerForm, setManagerForm] = useState(EMPTY_MANAGER_FORM)
  const [hotelErrors, setHotelErrors] = useState({})
  const [managerErrors, setManagerErrors] = useState({})
  const [hotelSuccess, setHotelSuccess] = useState(false)
  const [managerSuccess, setManagerSuccess] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  // ── Step-specific validation ─────────────────────────────────
  const validateStep = (step) => {
    const errs = {}

    if (step === 1) {
      if (!hotelForm.name.trim()) errs.name = 'Hotel name is required'
      if (!hotelForm.type) errs.type = 'Hotel type is required'
      if (!hotelForm.location.trim()) errs.location = 'Location is required'
      if (!hotelForm.description.trim()) errs.description = 'Description is required'
    }

    if (step === 2) {
      if (!hotelForm.email.trim()) errs.email = 'Contact email is required'
      else if (!/\S+@\S+\.\S+/.test(hotelForm.email)) errs.email = 'Invalid email address'
      if (!hotelForm.phone.trim()) errs.phone = 'Phone number is required'
    }

    setHotelErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(s => s + 1)
    }
  }

  const toggleAmenity = (amenity) => {
    setHotelForm(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }))
  }

  const handleHotelSubmit = (e) => {
    e.preventDefault()
    const newHotel = {
      id: Date.now(),
      name: hotelForm.name,
      location: hotelForm.location,
      type: hotelForm.type,
      rooms: 0,
      rating: 0,
      status: 'active',
      revenue: 0,
      manager: null,
      email: null,
    }
    setHotels(prev => [...prev, newHotel])
    setHotelSuccess(true)
    setTimeout(() => {
      setHotelSuccess(false)
      setShowHotelModal(false)
      setHotelForm(EMPTY_HOTEL_FORM)
      setActiveStep(1)
      setHotelErrors({})
    }, 1800)
  }

  const closeHotelModal = () => {
    setShowHotelModal(false)
    setHotelForm(EMPTY_HOTEL_FORM)
    setHotelErrors({})
    setActiveStep(1)
    setHotelSuccess(false)
  }

  // ── Manager handlers ─────────────────────────────────────────
  const validateManagerForm = () => {
    const errs = {}
    if (!managerForm.name.trim()) errs.name = 'Full name is required'
    if (!managerForm.email.trim()) errs.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(managerForm.email)) errs.email = 'Invalid email address'
    if (!managerForm.phone.trim()) errs.phone = 'Phone number is required'
    if (!managerForm.password) errs.password = 'Password is required'
    else if (managerForm.password.length < 8) errs.password = 'Minimum 8 characters'
    if (managerForm.password !== managerForm.confirmPassword) errs.confirmPassword = 'Passwords do not match'
    setManagerErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleManagerSubmit = (e) => {
    e.preventDefault()
    if (!validateManagerForm()) return
    setHotels(prev => prev.map(h =>
      h.id === selectedHotel.id
        ? { ...h, manager: managerForm.name, email: managerForm.email }
        : h
    ))
    setManagerSuccess(true)
    setTimeout(() => {
      setManagerSuccess(false)
      setShowManagerModal(false)
      setManagerForm(EMPTY_MANAGER_FORM)
      setSelectedHotel(null)
    }, 1800)
  }

  const openManagerModal = (hotel) => {
    setSelectedHotel(hotel)
    setManagerForm(EMPTY_MANAGER_FORM)
    setManagerErrors({})
    setManagerSuccess(false)
    setShowManagerModal(true)
  }

  const closeManagerModal = () => {
    setShowManagerModal(false)
    setManagerForm(EMPTY_MANAGER_FORM)
    setManagerErrors({})
    setSelectedHotel(null)
  }

  // ── Delete handlers ──────────────────────────────────────────
  const openDeleteModal = (hotel) => {
    setSelectedHotel(hotel)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    setHotels(prev => prev.filter(h => h.id !== selectedHotel.id))
    setShowDeleteModal(false)
    setSelectedHotel(null)
  }

  return (
    <div className="hotels-page">

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>Hotels</h1>
          <p>{hotels.length} properties managed</p>
        </div>
        <button className="btn-primary btn-icon" onClick={() => setShowHotelModal(true)}>
          <Plus size={16} /> Add Hotel
        </button>
      </div>

      {/* Hotels Grid */}
      <div className="hotels-grid">
        {hotels.map(h => (
          <div key={h.id} className="hotel-mgmt-card">
            <div className="hotel-mgmt-card__img">
              <img
                src={`https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&sig=${h.id}`}
                alt={h.name}
              />
              <span className={`hotel-mgmt-card__status hotel-mgmt-card__status--${h.status}`}>
                {h.status}
              </span>
              <span className="hotel-mgmt-card__type">{h.type}</span>
              <button className="hotel-mgmt-card__delete" onClick={() => openDeleteModal(h)} title="Remove hotel">
                <Trash2 size={14} />
              </button>
            </div>

            <div className="hotel-mgmt-card__body">
              <h3>{h.name}</h3>
              <div className="hotel-mgmt-card__meta">
                <span><MapPin size={12} /> {h.location}</span>
                {h.rating > 0 && <span><Star size={12} fill="#f59e0b" color="#f59e0b" /> {h.rating}</span>}
              </div>

              {/* Manager strip */}
              <div className="hotel-mgmt-card__manager">
                <div className="manager-info">
                  <div className={`manager-avatar ${!h.manager ? 'manager-avatar--empty' : ''}`}>
                    <User size={14} />
                  </div>
                  <div>
                    {h.manager
                      ? <><p className="manager-name">{h.manager}</p><p className="manager-role">Hotel Manager</p></>
                      : <p className="manager-unassigned">No manager assigned</p>
                    }
                  </div>
                </div>
                <button
                  className={`manager-btn ${h.manager ? 'manager-btn--change' : 'manager-btn--assign'}`}
                  onClick={() => openManagerModal(h)}
                >
                  {h.manager ? 'Change' : 'Assign'}
                </button>
              </div>

              <div className="hotel-mgmt-card__stats">
                <div><strong>{h.rooms}</strong><span>Rooms</span></div>
                <div><strong>{h.revenue > 0 ? '$' + (h.revenue / 1000).toFixed(0) + 'k' : '—'}</strong><span>Revenue</span></div>
              </div>

              <div className="hotel-mgmt-card__actions">
                <button className="btn-primary btn-sm">Manage</button>
                <button className="table-action">Edit</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ════════════════════════════════
          ADD HOTEL MODAL
      ════════════════════════════════ */}
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

            {/* Step indicator */}
            <div className="modal__steps">
              {['Basic Info', 'Contact Details', 'Amenities'].map((label, i) => (
                <div
                  key={label}
                  className={`step ${activeStep === i + 1 ? 'step--active' : ''} ${activeStep > i + 1 ? 'step--done' : ''}`}
                >
                  <div className="step__num">{activeStep > i + 1 ? '✓' : i + 1}</div>
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

                  {/* ── Step 1: Basic Info ── */}
                  {activeStep === 1 && (
                    <div className="form-step">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Hotel Name <span className="required">*</span></label>
                          <input
                            type="text"
                            placeholder="e.g. The Grand Meridian"
                            value={hotelForm.name}
                            onChange={e => {
                              setHotelForm({ ...hotelForm, name: e.target.value })
                              if (hotelErrors.name) setHotelErrors(prev => ({ ...prev, name: '' }))
                            }}
                            className={hotelErrors.name ? 'input--error' : ''}
                          />
                          {hotelErrors.name && <span className="field-error">{hotelErrors.name}</span>}
                        </div>
                        <div className="form-group">
                          <label>Hotel Type <span className="required">*</span></label>
                          <select
                            value={hotelForm.type}
                            onChange={e => {
                              setHotelForm({ ...hotelForm, type: e.target.value })
                              if (hotelErrors.type) setHotelErrors(prev => ({ ...prev, type: '' }))
                            }}
                            className={hotelErrors.type ? 'input--error' : ''}
                          >
                            <option value="">Select type</option>
                            {HOTEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                          {hotelErrors.type && <span className="field-error">{hotelErrors.type}</span>}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Location / Address <span className="required">*</span></label>
                        <input
                          type="text"
                          placeholder="e.g. 12 Accra Road, East Legon, Accra, Ghana"
                          value={hotelForm.location}
                          onChange={e => {
                            setHotelForm({ ...hotelForm, location: e.target.value })
                            if (hotelErrors.location) setHotelErrors(prev => ({ ...prev, location: '' }))
                          }}
                          className={hotelErrors.location ? 'input--error' : ''}
                        />
                        {hotelErrors.location && <span className="field-error">{hotelErrors.location}</span>}
                      </div>

                      <div className="form-group">
                        <label>Description <span className="required">*</span></label>
                        <textarea
                          placeholder="Describe the hotel — atmosphere, highlights, what makes it unique..."
                          rows={4}
                          value={hotelForm.description}
                          onChange={e => {
                            setHotelForm({ ...hotelForm, description: e.target.value })
                            if (hotelErrors.description) setHotelErrors(prev => ({ ...prev, description: '' }))
                          }}
                          className={hotelErrors.description ? 'input--error' : ''}
                        />
                        {hotelErrors.description && <span className="field-error">{hotelErrors.description}</span>}
                      </div>

                      <div className="form-group">
                        <label>Star Rating</label>
                        <div className="star-select">
                          {[1, 2, 3, 4, 5].map(n => (
                            <button
                              type="button"
                              key={n}
                              className={`star-btn ${parseInt(hotelForm.starRating) >= n ? 'star-btn--active' : ''}`}
                              onClick={() => setHotelForm({ ...hotelForm, starRating: String(n) })}
                            >★</button>
                          ))}
                          <span>{hotelForm.starRating}-Star Property</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 2: Contact Details ── */}
                  {activeStep === 2 && (
                    <div className="form-step">
                      <div className="form-row">
                        <div className="form-group">
                          <label>Contact Email <span className="required">*</span></label>
                          <input
                            type="email"
                            placeholder="info@hotel.com"
                            value={hotelForm.email}
                            onChange={e => {
                              setHotelForm({ ...hotelForm, email: e.target.value })
                              if (hotelErrors.email) setHotelErrors(prev => ({ ...prev, email: '' }))
                            }}
                            className={hotelErrors.email ? 'input--error' : ''}
                          />
                          {hotelErrors.email && <span className="field-error">{hotelErrors.email}</span>}
                        </div>
                        <div className="form-group">
                          <label>Phone Number <span className="required">*</span></label>
                          <input
                            type="tel"
                            placeholder="+233 55 000 0000"
                            value={hotelForm.phone}
                            onChange={e => {
                              setHotelForm({ ...hotelForm, phone: e.target.value })
                              if (hotelErrors.phone) setHotelErrors(prev => ({ ...prev, phone: '' }))
                            }}
                            className={hotelErrors.phone ? 'input--error' : ''}
                          />
                          {hotelErrors.phone && <span className="field-error">{hotelErrors.phone}</span>}
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Hotel Images</label>
                        <div className="upload-area">
                          <Upload size={28} />
                          <p>Drag & drop images here, or <span>browse files</span></p>
                          <small>PNG, JPG up to 10MB each · Max 10 images</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ── Step 3: Amenities ── */}
                  {activeStep === 3 && (
                    <div className="form-step">
                      <div className="form-group">
                        <label>Amenities & Facilities</label>
                        <p className="form-hint">Select everything available at this property</p>
                        <div className="amenities-grid">
                          {AMENITIES_LIST.map(a => (
                            <label
                              key={a}
                              className={`amenity-check ${hotelForm.amenities.includes(a) ? 'amenity-check--active' : ''}`}
                            >
                              <input
                                type="checkbox"
                                checked={hotelForm.amenities.includes(a)}
                                onChange={() => toggleAmenity(a)}
                              />
                              {a}
                            </label>
                          ))}
                        </div>
                      </div>

                      {hotelForm.amenities.length > 0 && (
                        <div className="selected-amenities">
                          <strong>{hotelForm.amenities.length} selected:</strong> {hotelForm.amenities.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="modal__footer">
                  <button type="button" className="btn-ghost" onClick={closeHotelModal}>Cancel</button>
                  <div className="modal__footer-right">
                    {activeStep > 1 && (
                      <button type="button" className="btn-outline-sm" onClick={() => setActiveStep(s => s - 1)}>
                        ← Back
                      </button>
                    )}
                    {activeStep < 3 ? (
                      <button type="button" className="btn-primary" onClick={handleNextStep}>
                        Next →
                      </button>
                    ) : (
                      <button type="submit" className="btn-primary">
                        Add Hotel
                      </button>
                    )}
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          ASSIGN MANAGER MODAL
      ════════════════════════════════ */}
      {showManagerModal && selectedHotel && (
        <div className="modal-overlay" onClick={closeManagerModal}>
          <div className="modal modal--medium" onClick={e => e.stopPropagation()}>

            <div className="modal__header">
              <div>
                <h2>{selectedHotel.manager ? 'Change Hotel Manager' : 'Assign Hotel Manager'}</h2>
                <p>Creating a manager account for <strong>{selectedHotel.name}</strong></p>
              </div>
              <button className="modal__close" onClick={closeManagerModal}><X size={20} /></button>
            </div>

            {managerSuccess ? (
              <div className="modal__success">
                <div className="success-icon">✓</div>
                <h3>Manager Account Created!</h3>
                <p>{managerForm.name} is now managing {selectedHotel.name}.</p>
              </div>
            ) : (
              <form onSubmit={handleManagerSubmit}>
                <div className="modal__body">
                  <div className="hotel-tag">
                    <MapPin size={13} />
                    <span>{selectedHotel.name} · {selectedHotel.location}</span>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name <span className="required">*</span></label>
                      <input
                        type="text"
                        placeholder="e.g. Kofi Mensah"
                        value={managerForm.name}
                        onChange={e => {
                          setManagerForm({ ...managerForm, name: e.target.value })
                          if (managerErrors.name) setManagerErrors(prev => ({ ...prev, name: '' }))
                        }}
                        className={managerErrors.name ? 'input--error' : ''}
                      />
                      {managerErrors.name && <span className="field-error">{managerErrors.name}</span>}
                    </div>
                    <div className="form-group">
                      <label>Phone Number <span className="required">*</span></label>
                      <input
                        type="tel"
                        placeholder="+233 55 000 0000"
                        value={managerForm.phone}
                        onChange={e => {
                          setManagerForm({ ...managerForm, phone: e.target.value })
                          if (managerErrors.phone) setManagerErrors(prev => ({ ...prev, phone: '' }))
                        }}
                        className={managerErrors.phone ? 'input--error' : ''}
                      />
                      {managerErrors.phone && <span className="field-error">{managerErrors.phone}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Work Email <span className="required">*</span></label>
                    <input
                      type="email"
                      placeholder="manager@hotel.com"
                      value={managerForm.email}
                      onChange={e => {
                        setManagerForm({ ...managerForm, email: e.target.value })
                        if (managerErrors.email) setManagerErrors(prev => ({ ...prev, email: '' }))
                      }}
                      className={managerErrors.email ? 'input--error' : ''}
                    />
                    {managerErrors.email && <span className="field-error">{managerErrors.email}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Temporary Password <span className="required">*</span></label>
                      <input
                        type="password"
                        placeholder="Min. 8 characters"
                        value={managerForm.password}
                        onChange={e => {
                          setManagerForm({ ...managerForm, password: e.target.value })
                          if (managerErrors.password) setManagerErrors(prev => ({ ...prev, password: '' }))
                        }}
                        className={managerErrors.password ? 'input--error' : ''}
                      />
                      {managerErrors.password && <span className="field-error">{managerErrors.password}</span>}
                    </div>
                    <div className="form-group">
                      <label>Confirm Password <span className="required">*</span></label>
                      <input
                        type="password"
                        placeholder="Repeat password"
                        value={managerForm.confirmPassword}
                        onChange={e => {
                          setManagerForm({ ...managerForm, confirmPassword: e.target.value })
                          if (managerErrors.confirmPassword) setManagerErrors(prev => ({ ...prev, confirmPassword: '' }))
                        }}
                        className={managerErrors.confirmPassword ? 'input--error' : ''}
                      />
                      {managerErrors.confirmPassword && <span className="field-error">{managerErrors.confirmPassword}</span>}
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
                  <button type="button" className="btn-ghost" onClick={closeManagerModal}>Cancel</button>
                  <button type="submit" className="btn-primary">Create Manager Account</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ════════════════════════════════
          DELETE CONFIRMATION MODAL
      ════════════════════════════════ */}
      {showDeleteModal && selectedHotel && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal modal--small" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>Remove Hotel</h2>
                <p>This action cannot be undone</p>
              </div>
              <button className="modal__close" onClick={() => setShowDeleteModal(false)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="delete-warning">
                <div className="delete-warning__icon"><Trash2 size={28} /></div>
                <p>You are about to remove <strong>{selectedHotel.name}</strong> from AKStay. All associated data including rooms and bookings will be permanently deleted.</p>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-ghost" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn-danger-solid" onClick={confirmDelete}>Yes, Remove Hotel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
















// import { useState } from 'react'
// import { Plus, Star, MapPin } from 'lucide-react'
// import './Hotels.css'

// const HOTELS = [
//   { id: 1, name: 'The Grand Meridian', location: 'Paris, France', rooms: 48, rating: 4.9, status: 'active', revenue: 142000 },
//   { id: 2, name: 'Azura Beach Resort', location: 'Maldives', rooms: 32, rating: 4.8, status: 'active', revenue: 218000 },
//   { id: 3, name: 'The Vine Boutique', location: 'Tuscany, Italy', rooms: 18, rating: 4.7, status: 'active', revenue: 87000 },
//   { id: 4, name: 'Urban Loft Tokyo', location: 'Tokyo, Japan', rooms: 60, rating: 4.6, status: 'maintenance', revenue: 64000 },
//   { id: 5, name: 'Alpine Chalet Zermatt', location: 'Switzerland', rooms: 22, rating: 4.8, status: 'active', revenue: 195000 },
// ]

// export default function Hotels() {
//   const [hotels] = useState(HOTELS)

//   return (
//     <div className="hotels-page">
//       <div className="page-header">
//         <div>
//           <h1>Hotels</h1>
//           <p>{hotels.length} properties managed</p>
//         </div>
//         <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
//           <Plus size={16} /> Add Hotel
//         </button>
//       </div>

//       <div className="hotels-grid">
//         {hotels.map(h => (
//           <div key={h.id} className="hotel-mgmt-card">
//             <div className="hotel-mgmt-card__img">
//               <img src={`https://images.unsplash.com/photo-155${h.id}882547-ff40c63fe5fa?w=400`} alt={h.name}
//                 onError={e => e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'} />
//               <span className={`hotel-mgmt-card__status hotel-mgmt-card__status--${h.status}`}>{h.status}</span>
//             </div>
//             <div className="hotel-mgmt-card__body">
//               <h3>{h.name}</h3>
//               <div className="hotel-mgmt-card__meta">
//                 <span><MapPin size={12} /> {h.location}</span>
//                 <span><Star size={12} fill="#f59e0b" color="#f59e0b" /> {h.rating}</span>
//               </div>
//               <div className="hotel-mgmt-card__stats">
//                 <div><strong>{h.rooms}</strong><span>Rooms</span></div>
//                 <div><strong>${(h.revenue/1000).toFixed(0)}k</strong><span>Revenue</span></div>
//               </div>
//               <div className="hotel-mgmt-card__actions">
//                 <button className="btn-primary" style={{fontSize: '0.8rem', padding: '7px 14px'}}>Manage</button>
//                 <button className="table-action">Edit</button>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }