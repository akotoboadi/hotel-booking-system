import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, DollarSign, BedDouble, Users, Loader } from 'lucide-react'
import { dashboardAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import './Reports.css'

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b','#3b82f6']

export default function Reports() {
  const { user }              = useAuth()
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  const hotelId = user?.hotel_id

  useEffect(() => {
    if (!hotelId) return
    dashboardAPI.getHotel(hotelId)
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [hotelId])

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
        <Loader size={32} style={{ animation:'spin 1s linear infinite', color:'var(--primary)' }} />
      </div>
    )
  }

  const stats  = data?.stats         || {}
  const weekly = data?.weekly_revenue || []

  const occupancyPie = [
    { name: 'Occupied',    value: stats.occupied    || 0 },
    { name: 'Available',   value: stats.available   || 0 },
    { name: 'Reserved',    value: stats.reserved    || 0 },
    { name: 'Maintenance', value: stats.maintenance || 0 },
  ].filter(d => d.value > 0)

  const KPI = [
    { label: 'Total Revenue',    value: `$${(stats.total_revenue  || 0).toLocaleString()}`, icon: DollarSign, color: '#6366f1' },
    { label: 'Monthly Revenue',  value: `$${(stats.month_revenue  || 0).toLocaleString()}`, icon: TrendingUp, color: '#10b981' },
    { label: 'Occupancy Rate',   value: `${stats.occupancy_rate  || 0}%`,                   icon: BedDouble,  color: '#f59e0b' },
    { label: 'Staff Members',    value: stats.staff_count || 0,                             icon: Users,      color: '#3b82f6' },
  ]

  return (
    <div className="reports-page">
      <div className="page-top">
        <div>
          <h1>Reports</h1>
          <p>{data?.hotel?.name || 'Hotel'} · Financial & Operational Overview</p>
        </div>
        <button className="btn-outline" onClick={() => window.print()}>Export PDF</button>
      </div>

      {/* KPIs */}
      <div className="reports-kpi">
        {KPI.map(k => {
          const Icon = k.icon
          return (
            <div className="kpi-card" key={k.label}>
              <div className="kpi-card__icon" style={{ background: k.color + '18', color: k.color }}>
                <Icon size={20} />
              </div>
              <div>
                <p className="kpi-card__label">{k.label}</p>
                <p className="kpi-card__value">{k.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Weekly revenue chart */}
      <div className="chart-card" style={{ marginBottom:18 }}>
        <div className="chart-card__hd">
          <h3>Revenue — Last 7 Days</h3>
          <span>Daily breakdown</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={weekly}>
            <defs>
              <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
            <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
            <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revG)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom charts */}
      <div className="reports-bottom">
        <div className="chart-card">
          <div className="chart-card__hd">
            <h3>Room Occupancy</h3>
            <span>Current status</span>
          </div>
          {occupancyPie.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={occupancyPie}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value"
                >
                  {occupancyPie.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip formatter={v => [`${v} rooms`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="table-empty">No room data available.</div>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-card__hd">
            <h3>Key Metrics</h3>
            <span>All time</span>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14, padding:'8px 0' }}>
            {[
              { label: 'Total Rooms',        value: stats.total_rooms || 0 },
              { label: 'Available Now',      value: stats.available   || 0 },
              { label: "Today's Arrivals",   value: stats.today_arrivals || 0 },
              { label: "Today's Departures", value: stats.today_departures || 0 },
              { label: 'Staff Count',        value: stats.staff_count || 0 },
            ].map(({ label, value }) => (
              <div key={label} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--gray-100)', fontSize:'0.875rem' }}>
                <span style={{ color:'var(--gray-500)' }}>{label}</span>
                <strong style={{ color:'var(--gray-800)' }}>{value}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}