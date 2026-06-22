import { useState, useEffect } from 'react'
import { Search, Mail, Loader } from 'lucide-react'
import api from '../services/api'
import './Guests.css'

export default function Guests() {
  const [guests, setGuests]   = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  useEffect(() => {
    api.get('/api/dashboard/admin')
      .then(res => {
        // Extract unique guests from recent bookings
        const bookings = res.data.data?.recent_bookings || []
        const guestMap = {}
        bookings.forEach(b => {
          if (b.user_id && !guestMap[b.user_id]) {
            guestMap[b.user_id] = {
              id:      b.user_id,
              name:    b.guest_name  || 'Unknown',
              email:   b.guest_email || '',
              bookings: 1,
            }
          } else if (b.user_id) {
            guestMap[b.user_id].bookings++
          }
        })
        setGuests(Object.values(guestMap))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = guests.filter(g =>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.email.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="guests-page">
      <div className="page-header">
        <div>
          <h1>Guests</h1>
          <p>{filtered.length} registered guests</p>
        </div>
      </div>

      <div className="bookings-controls">
        <div className="search-input">
          <Search size={15} />
          <input
            placeholder="Search guests..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign:'center', padding:60 }}>
          <Loader size={28} style={{ animation:'spin 1s linear infinite', color:'var(--primary)' }} />
        </div>
      ) : (
        <div className="table-card">
          <div className="guests-table-wrap">
            {filtered.length === 0 ? (
              <div className="table-empty">No guests found.</div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Guest</th><th>Email</th><th>Bookings</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(g => (
                    <tr key={g.id}>
                      <td className="data-table__bold">{g.name}</td>
                      <td style={{ fontSize:'0.84rem', color:'var(--gray-400)' }}>{g.email || '—'}</td>
                      <td>{g.bookings}</td>
                      <td>
                        <button
                          className="table-action"
                          style={{ display:'inline-flex', alignItems:'center', gap:4 }}
                        >
                          <Mail size={13} /> Contact
                        </button>
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