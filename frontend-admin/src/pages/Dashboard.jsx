import { useState, useEffect } from 'react'
import { TrendingUp, Users, CalendarCheck, DollarSign, ArrowUp, ArrowDown, Loader } from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { dashboardAPI } from '../services/api'
import './Dashboard.css'

export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    dashboardAPI.getAdmin()
      .then(res => setData(res.data.data))
      .catch(() => setError('Failed to load dashboard data.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
        <Loader size={32} style={{ animation:'spin 1s linear infinite', color:'var(--primary)' }} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign:'center', padding:60, color:'var(--gray-400)' }}>
        <p>{error}</p>
        <button className="btn-primary" style={{ marginTop:16 }} onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    )
  }

  const stats = data?.stats || {}

  const STATS = [
    { label: 'Total Revenue',     value: `$${(stats.total_revenue || 0).toLocaleString()}`, change: '+18.2%', up: true,  icon: DollarSign,    color: '#6366f1' },
    { label: 'Total Bookings',    value: stats.total_bookings || 0,                          change: '+12.5%', up: true,  icon: CalendarCheck, color: '#10b981' },
    { label: 'Active Guests',     value: stats.total_guests   || 0,                          change: '+5.1%',  up: true,  icon: Users,         color: '#f59e0b' },
    { label: 'Active Hotels',     value: stats.active_hotels  || 0,                          change: '',       up: null,  icon: TrendingUp,    color: '#3b82f6' },
  ]

  // Build weekly revenue from hotels data for chart
  const recentBookings = data?.recent_bookings || []
  const hotels         = data?.hotels || []

  return (
    <div className="adm-dash">
      <div className="adm-dash__heading">
        <h1>Dashboard</h1>
        <p>Here's what's happening across your properties.</p>
      </div>

      {/* Stats */}
      <div className="adm-dash__stats">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div className="stat-card" key={s.label}>
              <div className="stat-card__icon" style={{ background: s.color + '18', color: s.color }}>
                <Icon size={20} />
              </div>
              <div className="stat-card__body">
                <p className="stat-card__label">{s.label}</p>
                <p className="stat-card__value">{s.value}</p>
                {s.change && (
                  <p className={`stat-card__change ${s.up ? 'stat-card__change--up' : 'stat-card__change--down'}`}>
                    {s.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                    {s.change} vs last month
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Hotels revenue bar chart */}
      {hotels.length > 0 && (
        <div className="adm-dash__charts">
          <div className="chart-card" style={{ gridColumn: '1 / -1' }}>
            <div className="chart-card__header">
              <h3>Revenue by Hotel</h3>
              <span>All time</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={hotels.map(h => ({ name: h.name.split(' ')[0], revenue: h.revenue }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
                <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Bookings */}
      <div className="adm-dash__table">
        <div className="chart-card__header" style={{ padding:'18px 20px', borderBottom:'1px solid var(--gray-100)' }}>
          <h3>Recent Bookings</h3>
          <a href="/bookings" className="btn-primary" style={{ padding:'8px 16px', fontSize:'0.82rem' }}>View All</a>
        </div>
        <div className="adm-dash__table-wrap">
          {recentBookings.length === 0 ? (
            <div className="table-empty">No bookings yet.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking Ref</th><th>Guest</th><th>Hotel</th>
                  <th>Check-In</th><th>Nights</th><th>Amount</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map(b => (
                  <tr key={b.id}>
                    <td className="data-table__id">{b.booking_ref}</td>
                    <td className="data-table__bold">{b.guest_name}</td>
                    <td>{b.hotel_name}</td>
                    <td>{b.check_in}</td>
                    <td>{b.nights}</td>
                    <td className="data-table__bold">${(b.total_amount || 0).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge--${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : b.status === 'cancelled' ? 'danger' : 'info'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}