import { useState } from 'react'
import { Search, X, CheckCircle2, User, Clock, Bed } from 'lucide-react'
import './Arrivals.css'

const ARRIVALS = [
  { id: 'BK091', guest: 'Alice Johnson',  email: 'alice@email.com',  phone: '+233 55 111 0001', room: '204', type: 'Deluxe',   eta: '14:00', checkIn: '2025-07-02', checkOut: '2025-07-05', nights: 3, adults: 2, children: 0, amount: 660,  status: 'confirmed', checkedIn: false, requests: 'High floor if possible' },
  { id: 'BK092', guest: 'Marcus Chen',    email: 'marcus@email.com', phone: '+233 55 222 0002', room: '301', type: 'Suite',    eta: '15:30', checkIn: '2025-07-02', checkOut: '2025-07-09', nights: 7, adults: 2, children: 1, amount: 2940, status: 'confirmed', checkedIn: false, requests: '' },
  { id: 'BK093', guest: 'Sophia Osei',    email: 'sophia@email.com', phone: '+233 55 333 0003', room: '112', type: 'Standard', eta: '16:00', checkIn: '2025-07-02', checkOut: '2025-07-04', nights: 2, adults: 1, children: 0, amount: 240,  status: 'pending',   checkedIn: false, requests: 'Early check-in requested' },
  { id: 'BK094', guest: 'James Antwi',    email: 'james@email.com',  phone: '+233 55 444 0004', room: '405', type: 'Suite',    eta: '18:00', checkIn: '2025-07-02', checkOut: '2025-07-06', nights: 4, adults: 3, children: 0, amount: 1680, status: 'confirmed', checkedIn: true,  requests: '' },
  { id: 'BK095', guest: 'Emma Brown',     email: 'emma@email.com',   phone: '+233 55 555 0005', room: '201', type: 'Deluxe',   eta: '19:00', checkIn: '2025-07-02', checkOut: '2025-07-05', nights: 3, adults: 2, children: 2, amount: 660,  status: 'confirmed', checkedIn: false, requests: 'Baby cot needed' },
]

export default function Arrivals() {
  const [arrivals, setArrivals] = useState(ARRIVALS)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('all')
  const [selected, setSelected] = useState(null)
  const [success, setSuccess]   = useState(false)
  const [idVerified, setIdVerified] = useState(false)
  const [payVerified, setPayVerified] = useState(false)

  const filtered = arrivals.filter(a => {
    const matchSearch = a.guest.toLowerCase().includes(search.toLowerCase()) ||
                        a.id.toLowerCase().includes(search.toLowerCase()) ||
                        a.room.includes(search)
    const matchFilter = filter === 'all' || (filter === 'pending' && !a.checkedIn) || (filter === 'done' && a.checkedIn)
    return matchSearch && matchFilter
  })

  const handleCheckIn = () => {
    setArrivals(prev => prev.map(a => a.id === selected.id ? { ...a, checkedIn: true } : a))
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false); setSelected(null)
      setIdVerified(false); setPayVerified(false)
    }, 2000)
  }

  const openModal = (a) => {
    setSelected(a); setSuccess(false)
    setIdVerified(false); setPayVerified(false)
  }

  return (
    <div className="arrivals-page">
      <div className="page-top">
        <div>
          <h1>Today's Arrivals</h1>
          <p>{arrivals.filter(a => !a.checkedIn).length} guests pending check-in</p>
        </div>
      </div>

      <div className="arrivals-controls">
        <div className="search-box">
          <Search size={15} />
          <input placeholder="Search by name, booking ID or room..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {[['all','All'],['pending','Pending'],['done','Checked In']].map(([val, label]) => (
            <button key={val} className={`filter-tab ${filter === val ? 'filter-tab--active' : ''}`} onClick={() => setFilter(val)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="arrivals-grid">
        {filtered.map(a => (
          <div key={a.id} className={`arrival-card ${a.checkedIn ? 'arrival-card--done' : ''}`}>
            <div className="arrival-card__top">
              <div className="arrival-card__avatar">
                <User size={20} />
              </div>
              <div className="arrival-card__id">
                <p className="arrival-card__name">{a.guest}</p>
                <p className="arrival-card__booking">{a.id}</p>
              </div>
              <span className={`badge badge--${a.checkedIn ? 'success' : a.status === 'confirmed' ? 'primary' : 'warning'}`}>
                {a.checkedIn ? 'Checked In' : a.status}
              </span>
            </div>

            <div className="arrival-card__details">
              <div className="arrival-card__detail">
                <Bed size={13} />
                <span>Room {a.room} · {a.type}</span>
              </div>
              <div className="arrival-card__detail">
                <Clock size={13} />
                <span>ETA {a.eta} · {a.nights} nights</span>
              </div>
              <div className="arrival-card__detail">
                <User size={13} />
                <span>{a.adults} adult{a.adults > 1 ? 's' : ''}{a.children > 0 ? ` · ${a.children} child${a.children > 1 ? 'ren' : ''}` : ''}</span>
              </div>
            </div>

            {a.requests && (
              <div className="arrival-card__request">📝 {a.requests}</div>
            )}

            <div className="arrival-card__footer">
              <span className="arrival-card__amount">${a.amount.toLocaleString()}</span>
              {a.checkedIn
                ? <span className="arrival-card__checked"><CheckCircle2 size={15} /> Done</span>
                : <button className="btn-primary" style={{ padding:'8px 16px', fontSize:'0.82rem' }} onClick={() => openModal(a)}>
                    Check In →
                  </button>
              }
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="arrivals-empty">No arrivals match your search.</div>
        )}
      </div>

      {/* CHECK-IN MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>Check In Guest</h2>
                <p>{selected.guest} · Booking {selected.id}</p>
              </div>
              <button className="modal__close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>

            {success ? (
              <div className="modal__success">
                <div className="success-circle">✓</div>
                <h3>Checked In Successfully!</h3>
                <p>{selected.guest} is now checked into Room {selected.room}.</p>
              </div>
            ) : (
              <>
                <div className="modal__body">
                  {/* Booking summary */}
                  <div className="checkin-summary">
                    <div className="checkin-summary__row">
                      <div className="checkin-summary__item"><span>Guest</span><strong>{selected.guest}</strong></div>
                      <div className="checkin-summary__item"><span>Room</span><strong>#{selected.room} ({selected.type})</strong></div>
                    </div>
                    <div className="checkin-summary__row">
                      <div className="checkin-summary__item"><span>Check-In</span><strong>{selected.checkIn}</strong></div>
                      <div className="checkin-summary__item"><span>Check-Out</span><strong>{selected.checkOut}</strong></div>
                    </div>
                    <div className="checkin-summary__row">
                      <div className="checkin-summary__item"><span>Guests</span><strong>{selected.adults} adults{selected.children > 0 ? `, ${selected.children} children` : ''}</strong></div>
                      <div className="checkin-summary__item"><span>Total Amount</span><strong style={{ color: 'var(--primary)' }}>${selected.amount.toLocaleString()}</strong></div>
                    </div>
                    {selected.requests && (
                      <div className="checkin-summary__note">
                        <strong>Special Request:</strong> {selected.requests}
                      </div>
                    )}
                  </div>

                  {/* Checklist */}
                  <div className="checkin-checklist">
                    <p className="checkin-checklist__label">Check-In Checklist</p>
                    <label className="checkin-check">
                      <input type="checkbox" checked={idVerified} onChange={e => setIdVerified(e.target.checked)} />
                      <span>ID / Passport verified and recorded</span>
                    </label>
                    <label className="checkin-check">
                      <input type="checkbox" checked={payVerified} onChange={e => setPayVerified(e.target.checked)} />
                      <span>Payment confirmed / Security deposit collected</span>
                    </label>
                  </div>
                </div>

                <div className="modal__footer">
                  <button className="btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                  <button
                    className="btn-success"
                    onClick={handleCheckIn}
                    disabled={!idVerified || !payVerified}
                  >
                    <CheckCircle2 size={16} /> Confirm Check-In
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}