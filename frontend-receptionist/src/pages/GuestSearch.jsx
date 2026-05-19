import { useState } from 'react'
import { Search, User, X } from 'lucide-react'
import './GuestSearch.css'

const ALL_GUESTS = [
  { id: 1, name: 'Alice Johnson',  email: 'alice@email.com',  phone: '+233 55 111 0001', room: '204', status: 'checked-in',  checkIn: '2025-07-02', checkOut: '2025-07-05', bookingId: 'BK091', type: 'Deluxe' },
  { id: 2, name: 'Marcus Chen',    email: 'marcus@email.com', phone: '+233 55 222 0002', room: '301', status: 'checked-in',  checkIn: '2025-07-02', checkOut: '2025-07-09', bookingId: 'BK092', type: 'Suite' },
  { id: 3, name: 'Emma Brown',     email: 'emma@email.com',   phone: '+233 55 333 0003', room: '—',   status: 'checked-out', checkIn: '2025-06-29', checkOut: '2025-07-02', bookingId: 'BK081', type: 'Standard' },
  { id: 4, name: 'James Antwi',    email: 'james@email.com',  phone: '+233 55 444 0004', room: '405', status: 'checked-in',  checkIn: '2025-07-02', checkOut: '2025-07-06', bookingId: 'BK094', type: 'Suite' },
  { id: 5, name: 'David Asante',   email: 'david@email.com',  phone: '+233 55 555 0005', room: '—',   status: 'checked-out', checkIn: '2025-06-28', checkOut: '2025-07-02', bookingId: 'BK082', type: 'Deluxe' },
  { id: 6, name: 'Sophia Osei',    email: 'sophia@email.com', phone: '+233 55 666 0006', room: '112', status: 'expected',    checkIn: '2025-07-02', checkOut: '2025-07-04', bookingId: 'BK093', type: 'Standard' },
]

const STATUS_COLOR = { 'checked-in': 'success', 'checked-out': 'gray', 'expected': 'primary' }

export default function GuestSearch() {
  const [search, setSearch]   = useState('')
  const [selected, setSelected] = useState(null)

  const results = search.trim().length < 1 ? ALL_GUESTS : ALL_GUESTS.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase()) ||
    g.phone.includes(search) ||
    g.room.includes(search) ||
    g.bookingId.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="guest-search-page">
      <div className="page-top">
        <div>
          <h1>Guest Search</h1>
          <p>Search for any guest by name, room, email, phone or booking ID</p>
        </div>
      </div>

      <div className="guest-search-bar">
        <Search size={20} color="var(--gray-400)" />
        <input
          autoFocus
          placeholder="Type a guest name, room number, email or booking ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {search && <button onClick={() => setSearch('')}><X size={16} /></button>}
      </div>

      <div className="guest-results">
        <p className="guest-results__count">{results.length} guest{results.length !== 1 ? 's' : ''} found</p>
        {results.map(g => (
          <div key={g.id} className="guest-row" onClick={() => setSelected(g)}>
            <div className="guest-row__avatar"><User size={18} /></div>
            <div className="guest-row__info">
              <p className="guest-row__name">{g.name}</p>
              <p className="guest-row__meta">{g.email} · {g.phone}</p>
            </div>
            <div className="guest-row__booking">
              <p className="guest-row__id">{g.bookingId}</p>
              <p className="guest-row__meta">{g.type}</p>
            </div>
            <div>
              <p className="guest-row__room">{g.status === 'checked-out' ? '—' : `Room ${g.room}`}</p>
            </div>
            <div>
              <span className={`badge badge--${STATUS_COLOR[g.status]}`}>{g.status}</span>
            </div>
          </div>
        ))}
        {results.length === 0 && (
          <div className="table-empty">No guests found matching your search.</div>
        )}
      </div>

      {/* Guest detail modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div><h2>Guest Profile</h2><p>{selected.bookingId}</p></div>
              <button className="modal__close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="guest-profile">
                <div className="guest-profile__avatar"><User size={32} /></div>
                <h3>{selected.name}</h3>
                <span className={`badge badge--${STATUS_COLOR[selected.status]}`} style={{ fontSize:'0.85rem', padding:'5px 14px' }}>
                  {selected.status}
                </span>
              </div>
              <div className="checkin-summary">
                <div className="checkin-summary__row">
                  <div className="checkin-summary__item"><span>Email</span><strong>{selected.email}</strong></div>
                  <div className="checkin-summary__item"><span>Phone</span><strong>{selected.phone}</strong></div>
                </div>
                <div className="checkin-summary__row">
                  <div className="checkin-summary__item"><span>Room</span><strong>{selected.room === '—' ? 'N/A' : `#${selected.room} (${selected.type})`}</strong></div>
                  <div className="checkin-summary__item"><span>Booking ID</span><strong style={{fontFamily:'monospace'}}>{selected.bookingId}</strong></div>
                </div>
                <div className="checkin-summary__row">
                  <div className="checkin-summary__item"><span>Check-In</span><strong>{selected.checkIn}</strong></div>
                  <div className="checkin-summary__item"><span>Check-Out</span><strong>{selected.checkOut}</strong></div>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
              {selected.status === 'checked-in' && <button className="btn-outline">Issue Key Card</button>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}