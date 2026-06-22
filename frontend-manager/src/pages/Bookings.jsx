import { useState, useEffect } from 'react'
import { Search, X, Eye, Loader } from 'lucide-react'
import { bookingsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Bookings.css'

const STATUS_COLOR = {
  confirmed:   'success',
  checked_in:  'info',
  completed:   'info',
  cancelled:   'danger',
  pending:     'warning',
}

export default function Bookings() {
  const { user }                  = useAuth()
  const [bookings, setBookings]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [statusFilter, setStatus] = useState('all')
  const [viewBooking, setView]    = useState(null)

  const hotelId = user?.hotel_id

  useEffect(() => {
    if (!hotelId) return
    bookingsAPI.getByHotel(hotelId, { per_page: 100 })
      .then(res => setBookings(res.data.data.items || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [hotelId])

  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    const matchSearch = (
      (b.guest_name  || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.booking_ref || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.room_name   || '').toLowerCase().includes(search.toLowerCase())
    )
    return matchStatus && matchSearch
  })

  const totalRevenue = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((s, b) => s + (b.total_amount || 0), 0)

  return (
    <div className="bookings-page">
      <div className="page-top">
        <div>
          <h1>Bookings</h1>
          <p>{filtered.length} bookings · ${totalRevenue.toLocaleString()} total revenue</p>
        </div>
      </div>

      <div className="bookings-controls">
        <div className="search-box">
          <Search size={15} />
          <input
            placeholder="Search by guest, booking ref or room..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {['all','confirmed','checked_in','completed','cancelled'].map(s => (
            <button
              key={s}
              className={`filter-tab ${statusFilter === s ? 'filter-tab--active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s === 'all' ? 'All' : s.replace('_',' ').replace(/^\w/, c => c.toUpperCase())}
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
                <th>Booking Ref</th><th>Guest</th><th>Room</th>
                <th>Check-In</th><th>Check-Out</th><th>Nights</th>
                <th>Amount</th><th>Status</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td className="td-mono">{b.booking_ref}</td>
                  <td className="td-bold">{b.guest_name}</td>
                  <td>{b.room_name} <span style={{ fontSize:'0.75rem', color:'var(--gray-400)' }}>· {b.room_type}</span></td>
                  <td>{b.check_in}</td>
                  <td>{b.check_out}</td>
                  <td>{b.nights}</td>
                  <td className="td-bold">${(b.total_amount || 0).toLocaleString()}</td>
                  <td>
                    <span className={`badge badge--${STATUS_COLOR[b.status] || 'gray'}`}>
                      {b.status?.replace('_',' ')}
                    </span>
                  </td>
                  <td>
                    <button
                      className="td-action"
                      style={{ display:'inline-flex', alignItems:'center', gap:4 }}
                      onClick={() => setView(b)}
                    >
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="table-empty">No bookings found.</div>
          )}
        </div>
      )}

      {/* View booking modal */}
      {viewBooking && (
        <div className="modal-overlay" onClick={() => setView(null)}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>Booking {viewBooking.booking_ref}</h2>
                <p>Full booking details</p>
              </div>
              <button className="modal__close" onClick={() => setView(null)}><X size={20} /></button>
            </div>
            <div className="modal__body">
              <div className="booking-detail">
                {[
                  ['Guest',       viewBooking.guest_name],
                  ['Email',       viewBooking.guest_email || '—'],
                  ['Room',        `${viewBooking.room_name} (${viewBooking.room_type})`],
                  ['Check-In',    viewBooking.check_in],
                  ['Check-Out',   viewBooking.check_out],
                  ['Nights',      viewBooking.nights],
                  ['Guests',      viewBooking.guests],
                  ['Amount',      `$${(viewBooking.total_amount || 0).toLocaleString()}`],
                  ['Taxes',       `$${(viewBooking.taxes || 0).toLocaleString()}`],
                  ['Payment',     viewBooking.payment_method],
                  ['Pay Status',  viewBooking.payment_status],
                ].map(([label, value], i) => (
                  <div key={i} className="booking-detail__row">
                    <div className="booking-detail__item">
                      <span>{label}</span><strong>{value}</strong>
                    </div>
                  </div>
                ))}
                <div className="booking-detail__status">
                  <span>Status</span>
                  <span className={`badge badge--${STATUS_COLOR[viewBooking.status] || 'gray'}`}
                    style={{ fontSize:'0.85rem', padding:'5px 14px' }}>
                    {viewBooking.status?.replace('_',' ')}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-ghost" onClick={() => setView(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}