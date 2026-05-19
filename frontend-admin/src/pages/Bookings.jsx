import { useState } from 'react'
import { Search } from 'lucide-react'
import './Bookings.css'

const BOOKINGS = [
  { id: 'BK001', guest: 'Alice Johnson',   hotel: 'The Grand Meridian', room: 'Deluxe Suite',    checkIn: '2025-08-10', checkOut: '2025-08-13', amount: 1260, status: 'confirmed' },
  { id: 'BK002', guest: 'Marcus Chen',     hotel: 'Azura Beach Resort', room: 'Ocean Villa',     checkIn: '2025-08-12', checkOut: '2025-08-19', amount: 6230, status: 'pending'   },
  { id: 'BK003', guest: 'Sophia Williams', hotel: 'Urban Loft Tokyo',   room: 'Studio',          checkIn: '2025-08-14', checkOut: '2025-08-16', amount: 390,  status: 'confirmed' },
  { id: 'BK004', guest: 'David Osei',      hotel: 'Alpine Chalet',      room: 'Mountain Suite',  checkIn: '2025-08-15', checkOut: '2025-08-20', amount: 3100, status: 'cancelled' },
  { id: 'BK005', guest: 'Emma Brown',      hotel: 'The Vine Boutique',  room: 'Garden Room',     checkIn: '2025-08-18', checkOut: '2025-08-21', amount: 840,  status: 'confirmed' },
]

export default function Bookings() {
  const [search, setSearch]   = useState('')
  const [statusFilter, setStatus] = useState('all')

  const filtered = BOOKINGS.filter(b =>
    (statusFilter === 'all' || b.status === statusFilter) &&
    (b.guest.toLowerCase().includes(search.toLowerCase()) ||
     b.hotel.toLowerCase().includes(search.toLowerCase()) ||
     b.id.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p>{filtered.length} total bookings</p>
        </div>
      </div>

      <div className="bookings-controls">
        <div className="search-input">
          <Search size={15} />
          <input
            placeholder="Search by guest, hotel or ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="status-tabs">
          {['all','confirmed','pending','cancelled'].map(s => (
            <button
              key={s}
              className={`status-tab ${statusFilter === s ? 'status-tab--active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="table-card">
        <div className="bookings-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th><th>Guest</th><th>Hotel</th><th>Room</th>
                <th>Check-In</th><th>Check-Out</th><th>Amount</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td className="data-table__id">{b.id}</td>
                  <td className="data-table__bold">{b.guest}</td>
                  <td>{b.hotel}</td>
                  <td>{b.room}</td>
                  <td>{b.checkIn}</td>
                  <td>{b.checkOut}</td>
                  <td className="data-table__bold">${b.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge--${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'danger'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td><button className="table-action">View</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="table-empty">No bookings found.</div>}
        </div>
      </div>
    </div>
  )
}