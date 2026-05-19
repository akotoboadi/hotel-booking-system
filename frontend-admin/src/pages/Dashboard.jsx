import { TrendingUp, Users, CalendarCheck, DollarSign, ArrowUp, ArrowDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import './Dashboard.css'

const revenueData = [
  { month: 'Jan', revenue: 42000 }, { month: 'Feb', revenue: 58000 },
  { month: 'Mar', revenue: 51000 }, { month: 'Apr', revenue: 67000 },
  { month: 'May', revenue: 73000 }, { month: 'Jun', revenue: 89000 },
  { month: 'Jul', revenue: 95000 }, { month: 'Aug', revenue: 81000 },
]

const bookingsData = [
  { day: 'Mon', bookings: 12 }, { day: 'Tue', bookings: 19 },
  { day: 'Wed', bookings: 15 }, { day: 'Thu', bookings: 28 },
  { day: 'Fri', bookings: 35 }, { day: 'Sat', bookings: 42 },
  { day: 'Sun', bookings: 31 },
]

const RECENT_BOOKINGS = [
  { id: 'BK001', guest: 'Alice Johnson',  hotel: 'The Grand Meridian', checkIn: '2025-08-10', nights: 3, amount: 1260, status: 'confirmed' },
  { id: 'BK002', guest: 'Marcus Chen',    hotel: 'Azura Beach Resort', checkIn: '2025-08-12', nights: 7, amount: 6230, status: 'pending'   },
  { id: 'BK003', guest: 'Sophia Williams',hotel: 'Urban Loft Tokyo',   checkIn: '2025-08-14', nights: 2, amount: 390,  status: 'confirmed' },
  { id: 'BK004', guest: 'David Osei',     hotel: 'Alpine Chalet',      checkIn: '2025-08-15', nights: 5, amount: 3100, status: 'cancelled' },
]

const STATS = [
  { label: 'Total Revenue',      value: '$556,000', change: '+18.2%', up: true,  icon: DollarSign,    color: '#6366f1' },
  { label: 'Total Bookings',     value: '1,248',    change: '+12.5%', up: true,  icon: CalendarCheck, color: '#10b981' },
  { label: 'Active Guests',      value: '342',      change: '+5.1%',  up: true,  icon: Users,         color: '#f59e0b' },
  { label: 'Avg. Revenue/Night', value: '$286',     change: '-3.2%',  up: false, icon: TrendingUp,    color: '#ef4444' },
]

export default function Dashboard() {
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
                <p className={`stat-card__change ${s.up ? 'stat-card__change--up' : 'stat-card__change--down'}`}>
                  {s.up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                  {s.change} vs last month
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="adm-dash__charts">
        <div className="chart-card">
          <div className="chart-card__header">
            <h3>Revenue Overview</h3>
            <span>Last 8 months</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card__header">
            <h3>Weekly Bookings</h3>
            <span>This week</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={bookingsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Bar dataKey="bookings" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="adm-dash__table">
        <div className="chart-card__header" style={{ padding: '18px 20px', borderBottom: '1px solid var(--gray-100)' }}>
          <h3>Recent Bookings</h3>
          <a href="/bookings" className="btn-primary" style={{ padding:'8px 16px', fontSize:'0.82rem' }}>View All</a>
        </div>
        <div className="adm-dash__table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking ID</th><th>Guest</th><th>Hotel</th>
                <th>Check-In</th><th>Nights</th><th>Amount</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {RECENT_BOOKINGS.map(b => (
                <tr key={b.id}>
                  <td className="data-table__id">{b.id}</td>
                  <td className="data-table__bold">{b.guest}</td>
                  <td>{b.hotel}</td>
                  <td>{b.checkIn}</td>
                  <td>{b.nights}</td>
                  <td className="data-table__bold">${b.amount.toLocaleString()}</td>
                  <td>
                    <span className={`badge badge--${b.status === 'confirmed' ? 'success' : b.status === 'pending' ? 'warning' : 'danger'}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}