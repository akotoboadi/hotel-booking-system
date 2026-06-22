import { useState, useEffect } from 'react'
import { Search, Loader } from 'lucide-react'
import { bookingsAPI, hotelsAPI } from '../services/api'
import './Bookings.css'

export default function Bookings() {
  const [bookings, setBookings]     = useState([])
  const [hotels, setHotels]         = useState([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState('all')
  const [selectedHotel, setHotelId] = useState('all')

  useEffect(() => {
    const init = async () => {
      try {
        const hotelsRes = await hotelsAPI.getAll({ per_page: 50 })
        const hotelList = hotelsRes.data.data.items || []
        setHotels(hotelList)

        // Fetch bookings for all hotels
        const allBookings = []
        for (const hotel of hotelList) {
          try {
            const bRes = await bookingsAPI.getByHotel(hotel.id, { per_page: 100 })
            allBookings.push(...(bRes.data.data.items || []))
          } catch {}
        }
        setBookings(allBookings)
      } catch {
        // silent
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const filtered = bookings.filter(b => {
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    const matchHotel  = selectedHotel === 'all' || String(b.hotel_id) === selectedHotel
    const matchSearch = (
      (b.guest_name  || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.hotel_name  || '').toLowerCase().includes(search.toLowerCase()) ||
      (b.booking_ref || '').toLowerCase().includes(search.toLowerCase())
    )
    return matchStatus && matchHotel && matchSearch
  })

  return (
    <div className="bookings-page">
      <div className="page-header">
        <div>
          <h1>Bookings</h1>
          <p>{filtered.length} bookings</p>
        </div>
      </div>

      <div className="bookings-controls">
        <div className="search-input">
          <Search size={15} />
          <input
            placeholder="Search by guest, hotel or booking ref..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className="status-select"
          value={selectedHotel}
          onChange={e => setHotelId(e.target.value)}
        >
          <option value="all">All Hotels</option>
          {hotels.map(h => <option key={h.id} value={String(h.id)}>{h.name}</option>)}
        </select>
        <div className="status-tabs">
          {['all','confirmed','checked_in','completed','cancelled'].map(s => (
            <button
              key={s}
              className={`status-tab ${statusFilter === s ? 'status-tab--active' : ''}`}
              onClick={() => setStatus(s)}
            >
              {s === 'all' ? 'All' : s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase())}
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
          <div className="bookings-table-wrap">
            {filtered.length === 0 ? (
              <div className="table-empty">No bookings found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref</th><th>Guest</th><th>Hotel</th><th>Room</th>
                    <th>Check-In</th><th>Check-Out</th><th>Amount</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td className="data-table__id">{b.booking_ref}</td>
                      <td className="data-table__bold">{b.guest_name}</td>
                      <td>{b.hotel_name}</td>
                      <td>{b.room_name}</td>
                      <td>{b.check_in}</td>
                      <td>{b.check_out}</td>
                      <td className="data-table__bold">${(b.total_amount || 0).toLocaleString()}</td>
                      <td>
                        <span className={`badge badge--${
                          b.status === 'confirmed'  ? 'success' :
                          b.status === 'checked_in' ? 'info'    :
                          b.status === 'completed'  ? 'info'    :
                          b.status === 'cancelled'  ? 'danger'  : 'warning'
                        }`}>
                          {b.status?.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  )
}