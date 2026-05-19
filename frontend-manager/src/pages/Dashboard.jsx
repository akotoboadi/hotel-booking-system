import {
  BedDouble, CalendarCheck, TrendingUp, Users,
  ArrowUp, ArrowDown, Clock, CheckCircle2, AlertCircle
} from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import './Dashboard.css'

const revenueData = [
  { day: 'Mon', revenue: 4200 }, { day: 'Tue', revenue: 5800 },
  { day: 'Wed', revenue: 4100 }, { day: 'Thu', revenue: 7200 },
  { day: 'Fri', revenue: 9100 }, { day: 'Sat', revenue: 11400 },
  { day: 'Sun', revenue: 8600 },
]

const occupancyData = [
  { month: 'Jan', rate: 62 }, { month: 'Feb', rate: 71 },
  { month: 'Mar', rate: 68 }, { month: 'Apr', rate: 79 },
  { month: 'May', rate: 85 }, { month: 'Jun', rate: 91 },
  { month: 'Jul', rate: 88 },
]

const STATS = [
  { label: 'Total Rooms',      value: '48',   sub: '6 under maintenance', icon: BedDouble,     color: '#6366f1', up: null },
  { label: 'Occupancy Rate',   value: '78%',  sub: '+5% vs last month',   icon: TrendingUp,    color: '#10b981', up: true },
  { label: "Today's Bookings", value: '12',   sub: '3 check-ins pending', icon: CalendarCheck, color: '#f59e0b', up: true },
  { label: 'Active Guests',    value: '34',   sub: '8 checking out today', icon: Users,         color: '#3b82f6', up: null },
]

const TODAY_ARRIVALS = [
  { id: 'BK081', guest: 'Alice Johnson',  room: '204', time: '14:00', status: 'confirmed' },
  { id: 'BK082', guest: 'Marcus Chen',    room: '301', time: '15:30', status: 'confirmed' },
  { id: 'BK083', guest: 'Sophia Osei',    room: '112', time: '16:00', status: 'pending'   },
  { id: 'BK084', guest: 'James Antwi',    room: '405', time: '18:00', status: 'confirmed' },
]

const ROOM_STATUS = [
  { type: 'Available',    count: 26, color: '#10b981' },
  { type: 'Occupied',     count: 16, color: '#6366f1' },
  { type: 'Maintenance',  count:  6, color: '#f59e0b' },
]

export default function Dashboard() {
  return (
    <div className="mgr-dash">
      <div className="mgr-dash__heading">
        <div>
          <h1>Hotel Dashboard</h1>
          <p>The Grand Meridian · Wednesday, 2 July 2025</p>
        </div>
      </div>

      {/* Stat cards */}
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
                <p className="stat-card__sub">
                  {s.up === true  && <ArrowUp size={11} color="#10b981" />}
                  {s.up === false && <ArrowDown size={11} color="#ef4444" />}
                  {s.sub}
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts row */}
      <div className="mgr-dash__charts">
        <div className="chart-card">
          <div className="chart-card__hd">
            <h3>Revenue This Week</h3>
            <span>Daily breakdown</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v/1000}k`} />
              <Tooltip formatter={v => [`$${v.toLocaleString()}`, 'Revenue']} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#rg)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card__hd">
            <h3>Occupancy Rate</h3>
            <span>Monthly</span>
          </div>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={occupancyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} domain={[0, 100]} />
              <Tooltip formatter={v => [`${v}%`, 'Occupancy']} />
              <Bar dataKey="rate" fill="#6366f1" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row */}
      <div className="mgr-dash__bottom">
        {/* Today's arrivals */}
        <div className="table-card">
          <div className="table-card__header">
            <h3>Today's Arrivals</h3>
            <span className="badge badge--info">{TODAY_ARRIVALS.length} guests</span>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Booking</th><th>Guest</th><th>Room</th><th>ETA</th><th>Status</th><th></th>
              </tr>
            </thead>
            <tbody>
              {TODAY_ARRIVALS.map(a => (
                <tr key={a.id}>
                  <td className="td-mono">{a.id}</td>
                  <td className="td-bold">{a.guest}</td>
                  <td>Room {a.room}</td>
                  <td>
                    <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.83rem' }}>
                      <Clock size={12} color="var(--gray-400)" /> {a.time}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge--${a.status === 'confirmed' ? 'success' : 'warning'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td><button className="td-action">Check In</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Room status */}
        <div className="chart-card room-status-card">
          <div className="chart-card__hd">
            <h3>Room Status</h3>
            <span>48 total rooms</span>
          </div>
          <div className="room-status__bars">
            {ROOM_STATUS.map(r => (
              <div key={r.type} className="room-status__item">
                <div className="room-status__label">
                  <span>{r.type}</span>
                  <strong>{r.count}</strong>
                </div>
                <div className="room-status__track">
                  <div
                    className="room-status__fill"
                    style={{ width: `${(r.count / 48) * 100}%`, background: r.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="room-status__alerts">
            <div className="alert-item alert-item--success">
              <CheckCircle2 size={14} /> 26 rooms ready for new guests
            </div>
            <div className="alert-item alert-item--warning">
              <AlertCircle size={14} /> 6 rooms need maintenance review
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}