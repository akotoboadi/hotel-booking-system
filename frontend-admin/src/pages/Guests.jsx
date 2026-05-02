import { useState } from 'react'
import { Search, Mail } from 'lucide-react'
import './Guests.css'

const GUESTS = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', bookings: 8, spent: 9420, joined: '2024-01-12', status: 'vip' },
  { id: 2, name: 'Marcus Chen', email: 'marcus@example.com', bookings: 3, spent: 7100, joined: '2024-03-05', status: 'regular' },
  { id: 3, name: 'Sophia Williams', email: 'sophia@example.com', bookings: 12, spent: 15200, joined: '2023-11-20', status: 'vip' },
  { id: 4, name: 'David Osei', email: 'david@example.com', bookings: 1, spent: 3100, joined: '2025-01-08', status: 'regular' },
  { id: 5, name: 'Emma Brown', email: 'emma@example.com', bookings: 5, spent: 4800, joined: '2024-06-15', status: 'regular' },
]

export default function Guests() {
  const [search, setSearch] = useState('')

  const filtered = GUESTS.filter(g =>
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

      <div className="page-controls">
        <div className="search-input">
          <Search size={15} />
          <input placeholder="Search guests..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Guest</th><th>Email</th><th>Bookings</th><th>Total Spent</th><th>Joined</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(g => (
              <tr key={g.id}>
                <td className="data-table__bold">{g.name}</td>
                <td style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{g.email}</td>
                <td>{g.bookings}</td>
                <td className="data-table__bold">${g.spent.toLocaleString()}</td>
                <td style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{g.joined}</td>
                <td>
                  <span className={`badge ${g.status === 'vip' ? 'badge--info' : 'badge--success'}`}>
                    {g.status.toUpperCase()}
                  </span>
                </td>
                <td>
                  <button className="table-action" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Mail size={13} /> Contact
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}