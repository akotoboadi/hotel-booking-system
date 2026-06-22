import { useState, useEffect } from 'react'
import {
  BedDouble, CalendarCheck, TrendingUp, Users,
  ArrowUp, ArrowDown, Clock, CheckCircle2, AlertCircle, Loader
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { dashboardAPI, bookingsAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Dashboard.css'

export default function Dashboard() {
  const { user }              = useAuth()
  const [data, setData]       = useState(null)
  const [today, setToday]     = useState({ arrivals: [], departures: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  const hotelId = user?.hotel_id

  useEffect(() => {
    if (!hotelId) return
    const fetchAll = async () => {
      try {
        const [dashRes, todayRes] = await Promise.all([
          dashboardAPI.getHotel(hotelId),
          bookingsAPI.getToday(hotelId),
        ])
        setData(dashRes.data.data)
        setToday(todayRes.data.data)
      } catch {
        setError('Failed to load dashboard data.')
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [hotelId])

  if (!hotelId) {
    return (
      <div style={{ textAlign:'center', padding:60, color:'var(--gray-500)' }}>
        <p>Your account is not assigned to a hotel yet.</p>
        <p style={{ fontSize:'0.85rem', marginTop:8 }}>Contact the system administrator.</p>
      </div>
    )
  }

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
        <button className="btn-primary" style={{ marginTop:16 }} onClick={() => window.location.reload()}>Retry</button>
      </div>
    )
  }

  const stats   = data?.stats        || {}
  const weekly  = data?.weekly_revenue || []
  const hotel   = data?.hotel         || {}

  const STATS = [
    { label: 'Total Rooms',       value: stats.total_rooms    || 0,    sub: `${stats.available || 0} available`,      icon: BedDouble,     color: '#6366f1' },
    { label: 'Occupancy Rate',    value: `${stats.occupancy_rate || 0}%`, sub: `${stats.occupied || 0} rooms occupied`, icon: TrendingUp,    color: '#10b981' },
    { label: "Today's Arrivals",  value: today.arrivals?.length   || 0, sub: 'expected check-ins',                    icon: CalendarCheck, color: '#f59e0b' },
    { label: 'Active Guests',     value: stats.occupied       || 0,    sub: 'currently in hotel',                    icon: Users,         color: '#3b82f6' },
  ]

  return (
    <div className="mgr-dash">
      <div className="mgr-dash__heading">
        <div>
          <h1>Hotel Dashboard</h1>
          <p>{hotel.name} · {new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mgr-dash__stats">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div className="stat-card" key={s.label}>
              <div className="stat-card__icon" style={{ background: s.color + '18', color: s.color }}>
                <Icon size={20} />
              </div>
              <div>
                <p className="stat-card__label">{s.label}</p>
                <p className="stat-card__value">{s.value}</p>
                <p className="stat-card__sub">{s.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="mgr-dash__charts">
        <div className="chart-card">
          <div className="chart-card__hd">
            <h3>Revenue This Week</h3>
            <span>Daily breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={weekly}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#rg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Room status */}
        <div className="chart-card room-status-card">
          <div className="chart-card__hd">
            <h3>Room Status</h3>
            <span>{stats.total_rooms || 0} total rooms</span>
          </div>
          <div className="room-status__bars">
            {[
              { type: 'Available',   count: stats.available   || 0, color: '#10b981' },
              { type: 'Occupied',    count: stats.occupied    || 0, color: '#6366f1' },
              { type: 'Reserved',    count: stats.reserved    || 0, color: '#3b82f6' },
              { type: 'Maintenance', count: stats.maintenance || 0, color: '#f59e0b' },
            ].map(r => (
              <div key={r.type} className="room-status__item">
                <div className="room-status__label">
                  <span>{r.type}</span>
                  <strong>{r.count}</strong>
                </div>
                <div className="room-status__track">
                  <div
                    className="room-status__fill"
                    style={{
                      width: stats.total_rooms
                        ? `${(r.count / stats.total_rooms) * 100}%`
                        : '0%',
                      background: r.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="room-status__alerts">
            <div className="alert-item alert-item--success">
              <CheckCircle2 size={14} /> {stats.available || 0} rooms ready for guests
            </div>
            {(stats.maintenance || 0) > 0 && (
              <div className="alert-item alert-item--warning">
                <AlertCircle size={14} /> {stats.maintenance} rooms need maintenance
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's arrivals and departures */}
      <div className="mgr-dash__bottom">
        <div className="table-card">
          <div className="table-card__header">
            <h3>Today's Arrivals</h3>
            <span className="badge badge--info">{today.arrivals?.length || 0} guests</span>
          </div>
          {today.arrivals?.length === 0 ? (
            <div className="table-empty">No arrivals today.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Ref</th><th>Guest</th><th>Room</th><th>Nights</th><th>Status</th></tr>
              </thead>
              <tbody>
                {today.arrivals.map(b => (
                  <tr key={b.id}>
                    <td className="td-mono">{b.booking_ref}</td>
                    <td className="td-bold">{b.guest_name}</td>
                    <td>{b.room_name}</td>
                    <td>{b.nights}</td>
                    <td>
                      <span className={`badge badge--${b.status === 'confirmed' ? 'success' : 'info'}`}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="table-card">
          <div className="table-card__header">
            <h3>Today's Departures</h3>
            <span className="badge badge--warning">{today.departures?.length || 0} guests</span>
          </div>
          {today.departures?.length === 0 ? (
            <div className="table-empty">No departures today.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr><th>Ref</th><th>Guest</th><th>Room</th><th>Status</th></tr>
              </thead>
              <tbody>
                {today.departures.map(b => (
                  <tr key={b.id}>
                    <td className="td-mono">{b.booking_ref}</td>
                    <td className="td-bold">{b.guest_name}</td>
                    <td>{b.room_name}</td>
                    <td>
                      <span className="badge badge--warning">{b.status}</span>
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