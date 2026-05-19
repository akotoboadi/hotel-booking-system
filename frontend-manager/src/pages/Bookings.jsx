import { useState } from 'react'
import { Search, X, Eye } from 'lucide-react'
import './Bookings.css'

const BOOKINGS = [
  { id: 'BK081', guest: 'Alice Johnson',  email: 'alice@email.com',  room: '204', type: 'Deluxe',   checkIn: '2025-07-02', checkOut: '2025-07-05', nights: 3, amount: 660,  status: 'confirmed',  guests: 2 },
  { id: 'BK082', guest: 'Marcus Chen',    email: 'marcus@email.com', room: '301', type: 'Suite',    checkIn: '2025-07-02', checkOut: '2025-07-09', nights: 7, amount: 2940, status: 'confirmed',  guests: 2 },
  { id: 'BK083', guest: 'Sophia Osei',    email: 'sophia@email.com', room: '112', type: 'Standard', checkIn: '2025-07-02', checkOut: '2025-07-04', nights: 2, amount: 240,  status: 'pending',    guests: 1 },
  { id: 'BK084', guest: 'James Antwi',    email: 'james@email.com',  room: '405', type: 'Suite',    checkIn: '2025-07-04', checkOut: '2025-07-08', nights: 4, amount: 1680, status: 'confirmed',  guests: 3 },
  { id: 'BK085', guest: 'Emma Brown',     email: 'emma@email.com',   room: '101', type: 'Standard', checkIn: '2025-07-06', checkOut: '2025-07-07', nights: 1, amount: 120,  status: 'cancelled',  guests: 1 },
  { id: 'BK086', guest: 'David Asante',   email: 'david@email.com',  room: '202', type: 'Deluxe',   checkIn: '2025-07-08', checkOut: '2025-07-12', nights: 4, amount: 880,  status: 'confirmed',  guests: 2 },
]

const STATUS_COLOR = { confirmed: 'success', pending: 'warning', cancelled: 'danger', 'checked-in': 'info' }

export default function Bookings() {
  const [bookings] = useState(BOOKINGS)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [viewBooking, setView]    = useState(null)

  const filtered = bookings.filter(b =>
    (statusFilter === 'all' || b.status === statusFilter) &&
    (b.guest.toLowerCase().includes(search.toLowerCase()) ||
     b.id.toLowerCase().includes(search.toLowerCase()) ||
     b.room.includes(search))
  )

  const totals = { revenue: bookings.reduce((s,b) => b.status !== 'cancelled' ? s + b.amount : s, 0), confirmed: bookings.filter(b => b.status === 'confirmed').length }

  return (
    <div className="bookings-page">
      <div className="page-top">
        <div>
          <h1>Bookings</h1>
          <p>{filtered.length} bookings · ${ totals.revenue.toLocaleString()} total revenue</p>
        </div>
      </div>

      <div className="bookings-controls">
        <div className="search-box">
          <Search size={15} />
          <input placeholder="Search by guest, booking ID or room..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['all','confirmed','pending','cancelled'].map(s => (
            <button key={s} className={`filter-tab ${statusFilter === s ? 'filter-tab--active' : ''}`} onClick={() => setStatus(s)}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Booking ID</th><th>Guest</th><th>Room</th>
              <th>Check-In</th><th>Check-Out</th><th>Nights</th>
              <th>Amount</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(b => (
              <tr key={b.id}>
                <td  data-label="ID" className="td-mono">{b.id}</td>
                <td  data-label="Guest" className="td-bold">{b.guest}</td>
                <td data-label="Room" >Room {b.room} <span style={{fontSize:'0.75rem',color:'var(--gray-400)'}}>· {b.type}</span></td>
                <td data-label="Check-In" >{b.checkIn}</td>
                <td data-label="Check-Out" >{b.checkOut}</td>
                <td data-label="Nights" >{b.nights}</td>
                <td data-label="Amount" className="td-bold">${b.amount.toLocaleString()}</td>
                <td data-label="Status" ><span className={`badge badge--${STATUS_COLOR[b.status]}`}>{b.status}</span></td>
                <td data-label="Action">
                  <button className="td-action" style={{display:'inline-flex',alignItems:'center',gap:4}}
                    onClick={() => setView(b)}>
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="table-empty">No bookings found.</div>}
      </div>

      {/* View booking modal */}
      {viewBooking && (
        <div className="modal-overlay" onClick={() => setView(null)}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>Booking {viewBooking.id}</h2>
                <p>Full booking details</p>
              </div>
              <button className="modal__close" onClick={() => setView(null)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="booking-detail">
                <div className="booking-detail__row">
                  <div className="booking-detail__item"><span>Guest</span><strong>{viewBooking.guest}</strong></div>
                  <div className="booking-detail__item"><span>Email</span><strong>{viewBooking.email}</strong></div>
                </div>
                <div className="booking-detail__row">
                  <div className="booking-detail__item"><span>Room</span><strong>#{viewBooking.room} ({viewBooking.type})</strong></div>
                  <div className="booking-detail__item"><span>Guests</span><strong>{viewBooking.guests} person{viewBooking.guests > 1 ? 's' : ''}</strong></div>
                </div>
                <div className="booking-detail__row">
                  <div className="booking-detail__item"><span>Check-In</span><strong>{viewBooking.checkIn}</strong></div>
                  <div className="booking-detail__item"><span>Check-Out</span><strong>{viewBooking.checkOut}</strong></div>
                </div>
                <div className="booking-detail__row">
                  <div className="booking-detail__item"><span>Duration</span><strong>{viewBooking.nights} nights</strong></div>
                  <div className="booking-detail__item"><span>Total Amount</span><strong style={{color:'var(--primary)',fontSize:'1.1rem'}}>${viewBooking.amount.toLocaleString()}</strong></div>
                </div>
                <div className="booking-detail__status">
                  <span>Status</span>
                  <span className={`badge badge--${STATUS_COLOR[viewBooking.status]}`} style={{fontSize:'0.85rem',padding:'5px 14px'}}>
                    {viewBooking.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-ghost" onClick={() => setView(null)}>Close</button>
              {viewBooking.status === 'confirmed' && (
                <button className="btn-primary">Check In Guest</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}