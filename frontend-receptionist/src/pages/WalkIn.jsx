import { useState } from 'react'
import { Search, X, CheckCircle2 } from 'lucide-react'
import './WalkIn.css'

const AVAILABLE_ROOMS = [
  { id: 1, number: '103', type: 'Standard', floor: 1, capacity: 2, price: 120, amenities: ['WiFi', 'TV', 'AC'] },
  { id: 2, number: '205', type: 'Deluxe',   floor: 2, capacity: 3, price: 220, amenities: ['WiFi', 'TV', 'Mini Bar', 'Balcony'] },
  { id: 3, number: '302', type: 'Suite',    floor: 3, capacity: 4, price: 420, amenities: ['WiFi', 'TV', 'Mini Bar', 'Bathtub', 'Sea View'] },
  { id: 4, number: '104', type: 'Standard', floor: 1, capacity: 2, price: 120, amenities: ['WiFi', 'TV'] },
  { id: 5, number: '206', type: 'Deluxe',   floor: 2, capacity: 2, price: 220, amenities: ['WiFi', 'TV', 'Mini Bar'] },
]

const EMPTY = { guestName:'', email:'', phone:'', idNumber:'', adults:'1', children:'0', checkIn:'', checkOut:'', specialRequests:'', paymentMethod:'cash' }

export default function WalkIn() {
  const [step, setStep]         = useState(1)
  const [form, setForm]         = useState(EMPTY)
  const [selectedRoom, setRoom] = useState(null)
  const [errors, setErrors]     = useState({})
  const [success, setSuccess]   = useState(false)

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000))
    : 0

  const totalAmount = selectedRoom ? selectedRoom.price * nights : 0

  const validateStep1 = () => {
    const e = {}
    if (!form.guestName.trim()) e.guestName = 'Guest name is required'
    if (!form.phone.trim())     e.phone     = 'Phone number is required'
    if (!form.idNumber.trim())  e.idNumber  = 'ID number is required'
    if (!form.checkIn)          e.checkIn   = 'Check-in date is required'
    if (!form.checkOut)         e.checkOut  = 'Check-out date is required'
    else if (nights <= 0)       e.checkOut  = 'Check-out must be after check-in'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const validateStep2 = () => {
    if (!selectedRoom) { setErrors({ room: 'Please select a room' }); return false }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2)
    else if (step === 2 && validateStep2()) setStep(3)
  }

  const handleSubmit = () => {
    setSuccess(true)
  }

  const reset = () => {
    setStep(1); setForm(EMPTY); setRoom(null)
    setErrors({}); setSuccess(false)
  }

  if (success) {
    return (
      <div className="walkin-success">
        <div className="success-circle" style={{ width:72, height:72, fontSize:'1.8rem' }}>✓</div>
        <h2>Walk-In Booking Created!</h2>
        <p>{form.guestName} has been checked into Room {selectedRoom?.number} ({selectedRoom?.type}).</p>
        <div className="walkin-success__detail">
          <div><span>Room</span><strong>#{selectedRoom?.number}</strong></div>
          <div><span>Nights</span><strong>{nights}</strong></div>
          <div><span>Total</span><strong>${totalAmount.toLocaleString()}</strong></div>
          <div><span>Payment</span><strong style={{ textTransform:'capitalize' }}>{form.paymentMethod}</strong></div>
        </div>
        <button className="btn-primary" onClick={reset}>New Walk-In</button>
      </div>
    )
  }

  return (
    <div className="walkin-page">
      <div className="page-top">
        <div>
          <h1>Walk-In Booking</h1>
          <p>Register a guest who arrived without a prior reservation</p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="walkin-steps">
        {['Guest Details', 'Select Room', 'Confirm & Pay'].map((label, i) => (
          <div key={label} className={`walkin-step ${step === i + 1 ? 'walkin-step--active' : ''} ${step > i + 1 ? 'walkin-step--done' : ''}`}>
            <div className="walkin-step__num">{step > i + 1 ? '✓' : i + 1}</div>
            <span>{label}</span>
          </div>
        ))}
      </div>

      <div className="walkin-body">
        {/* STEP 1 — Guest Details */}
        {step === 1 && (
          <div className="walkin-card">
            <h3>Guest Information</h3>
            <div className="walkin-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input placeholder="e.g. Kofi Asante" value={form.guestName}
                    onChange={e => { setForm({...form, guestName: e.target.value}); setErrors(p=>({...p,guestName:''})) }}
                    className={errors.guestName ? 'input--error' : ''} />
                  {errors.guestName && <span className="field-error">{errors.guestName}</span>}
                </div>
                <div className="form-group">
                  <label>Phone Number <span className="required">*</span></label>
                  <input type="tel" placeholder="+233 55 000 0000" value={form.phone}
                    onChange={e => { setForm({...form, phone: e.target.value}); setErrors(p=>({...p,phone:''})) }}
                    className={errors.phone ? 'input--error' : ''} />
                  {errors.phone && <span className="field-error">{errors.phone}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email (Optional)</label>
                  <input type="email" placeholder="guest@email.com" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>ID / Passport Number <span className="required">*</span></label>
                  <input placeholder="e.g. GHA-123456789" value={form.idNumber}
                    onChange={e => { setForm({...form, idNumber: e.target.value}); setErrors(p=>({...p,idNumber:''})) }}
                    className={errors.idNumber ? 'input--error' : ''} />
                  {errors.idNumber && <span className="field-error">{errors.idNumber}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Check-In Date <span className="required">*</span></label>
                  <input type="date" value={form.checkIn}
                    onChange={e => { setForm({...form, checkIn: e.target.value}); setErrors(p=>({...p,checkIn:''})) }}
                    className={errors.checkIn ? 'input--error' : ''} />
                  {errors.checkIn && <span className="field-error">{errors.checkIn}</span>}
                </div>
                <div className="form-group">
                  <label>Check-Out Date <span className="required">*</span></label>
                  <input type="date" value={form.checkOut}
                    onChange={e => { setForm({...form, checkOut: e.target.value}); setErrors(p=>({...p,checkOut:''})) }}
                    className={errors.checkOut ? 'input--error' : ''} />
                  {errors.checkOut && <span className="field-error">{errors.checkOut}</span>}
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Adults</label>
                  <select value={form.adults} onChange={e => setForm({...form, adults: e.target.value})}>
                    {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Children</label>
                  <select value={form.children} onChange={e => setForm({...form, children: e.target.value})}>
                    {[0,1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Special Requests</label>
                <textarea placeholder="Any special requests from the guest..." value={form.specialRequests}
                  onChange={e => setForm({...form, specialRequests: e.target.value})} />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2 — Select Room */}
        {step === 2 && (
          <div className="walkin-card">
            <h3>Available Rooms</h3>
            {errors.room && <p className="field-error" style={{ marginBottom:12 }}>{errors.room}</p>}
            <div className="walkin-rooms">
              {AVAILABLE_ROOMS.map(r => (
                <div
                  key={r.id}
                  className={`walkin-room ${selectedRoom?.id === r.id ? 'walkin-room--selected' : ''}`}
                  onClick={() => { setRoom(r); setErrors({}) }}
                >
                  <div className="walkin-room__top">
                    <div>
                      <p className="walkin-room__num">Room #{r.number}</p>
                      <p className="walkin-room__type">{r.type} · Floor {r.floor}</p>
                    </div>
                    <div className="walkin-room__price">
                      <strong>${r.price}</strong><span>/night</span>
                    </div>
                  </div>
                  <div className="walkin-room__tags">
                    {r.amenities.map(a => <span key={a} className="walkin-room__tag">{a}</span>)}
                  </div>
                  {nights > 0 && (
                    <div className="walkin-room__total">
                      {nights} nights · Total: <strong>${(r.price * nights).toLocaleString()}</strong>
                    </div>
                  )}
                  {selectedRoom?.id === r.id && (
                    <div className="walkin-room__check"><CheckCircle2 size={18} /> Selected</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 3 — Confirm */}
        {step === 3 && selectedRoom && (
          <div className="walkin-card">
            <h3>Booking Summary</h3>
            <div className="walkin-confirm">
              <div className="checkin-summary">
                <div className="checkin-summary__row">
                  <div className="checkin-summary__item"><span>Guest</span><strong>{form.guestName}</strong></div>
                  <div className="checkin-summary__item"><span>Phone</span><strong>{form.phone}</strong></div>
                </div>
                <div className="checkin-summary__row">
                  <div className="checkin-summary__item"><span>Room</span><strong>#{selectedRoom.number} ({selectedRoom.type})</strong></div>
                  <div className="checkin-summary__item"><span>Guests</span><strong>{form.adults} adults, {form.children} children</strong></div>
                </div>
                <div className="checkin-summary__row">
                  <div className="checkin-summary__item"><span>Check-In</span><strong>{form.checkIn}</strong></div>
                  <div className="checkin-summary__item"><span>Check-Out</span><strong>{form.checkOut}</strong></div>
                </div>
                <div className="checkin-summary__row" style={{ background:'#f8fafc' }}>
                  <div className="checkin-summary__item"><span>Total Amount</span><strong style={{ color:'var(--primary)', fontSize:'1.1rem' }}>${totalAmount.toLocaleString()}</strong></div>
                  <div className="checkin-summary__item"><span>Nights</span><strong>{nights}</strong></div>
                </div>
              </div>

              <div className="form-group">
                <label>Payment Method</label>
                <div className="walkin-payment">
                  {['cash', 'card', 'mobile money'].map(m => (
                    <label key={m} className={`payment-opt ${form.paymentMethod === m ? 'payment-opt--active' : ''}`}>
                      <input type="radio" name="payment" value={m} checked={form.paymentMethod === m}
                        onChange={() => setForm({...form, paymentMethod: m})} />
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </label>
                  ))}
                </div>
              </div>

              {form.specialRequests && (
                <div className="checkin-summary__note" style={{ borderRadius: 'var(--radius-sm)', padding:'12px 14px' }}>
                  <strong>Special Request:</strong> {form.specialRequests}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="walkin-nav">
          {step > 1 && <button className="btn-outline" onClick={() => setStep(s => s - 1)}>← Back</button>}
          {step < 3
            ? <button className="btn-primary" onClick={handleNext}>Next →</button>
            : <button className="btn-success" onClick={handleSubmit}><CheckCircle2 size={16} /> Confirm Walk-In Booking</button>
          }
        </div>
      </div>
    </div>
  )
}