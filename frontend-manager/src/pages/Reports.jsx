import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { TrendingUp, DollarSign, BedDouble, Users } from 'lucide-react'
import './Reports.css'

const monthlyRevenue = [
  { month: 'Jan', revenue: 38000, expenses: 14000 },
  { month: 'Feb', revenue: 51000, expenses: 16000 },
  { month: 'Mar', revenue: 44000, expenses: 15000 },
  { month: 'Apr', revenue: 62000, expenses: 18000 },
  { month: 'May', revenue: 71000, expenses: 19000 },
  { month: 'Jun', revenue: 88000, expenses: 22000 },
  { month: 'Jul', revenue: 94000, expenses: 24000 },
]

const roomTypeRevenue = [
  { type: 'Standard', revenue: 24000 },
  { type: 'Deluxe',   revenue: 38000 },
  { type: 'Suite',    revenue: 52000 },
  { type: 'Presidential', revenue: 18000 },
]

const occupancyPie = [
  { name: 'Occupied',    value: 31 },
  { name: 'Available',   value: 11 },
  { name: 'Maintenance', value:  6 },
]

const PIE_COLORS = ['#6366f1','#10b981','#f59e0b']

const KPI = [
  { label: 'Total Revenue (YTD)', value: '$448,000', icon: DollarSign, color: '#6366f1' },
  { label: 'Avg Occupancy Rate',  value: '79%',      icon: TrendingUp, color: '#10b981' },
  { label: 'Total Bookings',      value: '634',      icon: BedDouble,  color: '#f59e0b' },
  { label: 'Unique Guests',       value: '512',      icon: Users,      color: '#3b82f6' },
]

export default function Reports() {
  return (
    <div className="reports-page">
      <div className="page-top">
        <div>
          <h1>Reports</h1>
          <p>The Grand Meridian · Financial & Operational Overview</p>
        </div>
        <button className="btn-outline">Export PDF</button>
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

      {/* Revenue chart */}
      <div className="chart-card" style={{ marginBottom: 18 }}>
        <div className="chart-card__hd">
          <h3>Revenue vs Expenses</h3>
          <span>January – July 2025</span>
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={monthlyRevenue}>
            <defs>
              <linearGradient id="revG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#6366f1" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`} />
            <Tooltip formatter={v=>[`$${v.toLocaleString()}`]} />
            <Legend />
            <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#6366f1" strokeWidth={2.5} fill="url(#revG)" />
            <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ef4444" strokeWidth={2}   fill="url(#expG)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom charts */}
      <div className="reports-bottom">
        <div className="chart-card">
          <div className="chart-card__hd">
            <h3>Revenue by Room Type</h3>
            <span>July 2025</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roomTypeRevenue} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v=>`$${v/1000}k`} />
              <YAxis type="category" dataKey="type" tick={{ fontSize:11, fill:'#94a3b8' }} axisLine={false} tickLine={false} width={90} />
              <Tooltip formatter={v=>[`$${v.toLocaleString()}`,'Revenue']} />
              <Bar dataKey="revenue" fill="#6366f1" radius={[0,4,4,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <div className="chart-card__hd">
            <h3>Room Occupancy</h3>
            <span>Today · 48 rooms</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={occupancyPie} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                {occupancyPie.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={v=>[`${v} rooms`]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}