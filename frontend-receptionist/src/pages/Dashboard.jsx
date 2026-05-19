import { useState, useEffect } from 'react'
import { ArrowDownCircle, ArrowUpCircle, BedDouble, Clock, CheckCircle2, AlertCircle, User } from 'lucide-react'
import './Dashboard.css'

const TODAY_ARRIVALS = [
  { id: 'BK091', guest: 'Alice Johnson',  room: '204', type: 'Deluxe',   eta: '14:00', status: 'confirmed', nights: 3, checkedIn: false },
  { id: 'BK092', guest: 'Marcus Chen',    room: '301', type: 'Suite',    eta: '15:30', status: 'confirmed', nights: 7, checkedIn: false },
  { id: 'BK093', guest: 'Sophia Osei',    room: '112', type: 'Standard', eta: '16:00', status: 'pending',   nights: 2, checkedIn: false },
  { id: 'BK094', guest: 'James Antwi',    room: '405', type: 'Suite',    eta: '18:00', status: 'confirmed', nights: 4, checkedIn: true  },
]

const TODAY_DEPARTURES = [
  { id: 'BK081', guest: 'Emma Brown',   room: '102', type: 'Standard', checkout: '11:00', status: 'due',        checkedOut: false },
  { id: 'BK082', guest: 'David Asante', room: '203', type: 'Deluxe',   checkout: '11:00', status: 'checked-out', checkedOut: true  },
  { id: 'BK083', guest: 'Ama Boateng',  room: '308', type: 'Suite',    checkout: '12:00', status: 'due',        checkedOut: false },
]

export default function Dashboard() {
  const [time, setTime] = useState(new Date())
  const [arrivals, setArrivals] = useState(TODAY_ARRIVALS)

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const handleQuickCheckIn = (id) => {
    setArrivals(prev => prev.map(a => a.id === id ? { ...a, checkedIn: true } : a))
  }

  const checkedInCount  = arrivals.filter(a => a.checkedIn).length
  const pendingArrivals = arrivals.filter(a => !a.checkedIn).length
  const pendingDeparts  = TODAY_DEPARTURES.filter(d => !d.checkedOut).length

  const STATS = [
    { label: "Today's Arrivals",    value: arrivals.length,        sub: `${pendingArrivals} pending`,   icon: ArrowDownCircle, color: '#3b82f6' },
    { label: "Today's Departures",  value: TODAY_DEPARTURES.length, sub: `${pendingDeparts} still in`,  icon: ArrowUpCircle,   color: '#f59e0b' },
    { label: 'Currently Checked In', value: 34,                    sub: 'guests in house',              icon: BedDouble,       color: '#10b981' },
    { label: 'Check-ins Done',       value: checkedInCount,        sub: 'today so far',                 icon: CheckCircle2,    color: '#6366f1' },
  ]

  return (
    <div className="rec-dash">
      <div className="rec-dash__heading">
        <div>
          <h1>Front Desk Dashboard</h1>
          <p>
            {time.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            &nbsp;·&nbsp;
            <strong>{time.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' })}</strong>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="rec-dash__stats">
        {STATS.map(s => {
          const Icon = s.icon
          return (
            <div className="rec-stat-card" key={s.label}>
              <div className="rec-stat-card__icon" style={{ background: s.color + '18', color: s.color }}>
                <Icon size={22} />
              </div>
              <div>
                <p className="rec-stat-card__label">{s.label}</p>
                <p className="rec-stat-card__value">{s.value}</p>
                <p className="rec-stat-card__sub">{s.sub}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Two columns */}
      <div className="rec-dash__cols">

        {/* Arrivals */}
        <div className="table-card">
          <div className="table-card__header">
            <h3>Today's Arrivals</h3>
            <span className="badge badge--primary">{arrivals.length} guests</span>
          </div>
          <div className="rec-arrivals-list">
            {arrivals.map(a => (
              <div key={a.id} className={`arrival-item ${a.checkedIn ? 'arrival-item--done' : ''}`}>
                <div className="arrival-item__avatar">
                  <User size={16} />
                </div>
                <div className="arrival-item__info">
                  <p className="arrival-item__name">{a.guest}</p>
                  <p className="arrival-item__meta">
                    Room {a.room} · {a.type} · {a.nights} nights
                  </p>
                  <div className="arrival-item__footer">
                    <span className="arrival-item__eta"><Clock size={11} /> ETA {a.eta}</span>
                    <span className={`badge badge--${a.status === 'confirmed' ? 'success' : 'warning'}`}>
                      {a.status}
                    </span>
                  </div>
                </div>
                <div className="arrival-item__action">
                  {a.checkedIn
                    ? <span className="arrival-item__done"><CheckCircle2 size={18} /> Done</span>
                    : <button className="btn-primary" style={{ padding:'7px 14px', fontSize:'0.8rem' }}
                        onClick={() => handleQuickCheckIn(a.id)}>
                        Check In
                      </button>
                  }
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Departures */}
        <div className="table-card">
          <div className="table-card__header">
            <h3>Today's Departures</h3>
            <span className="badge badge--warning">{pendingDeparts} pending</span>
          </div>
          <div className="rec-arrivals-list">
            {TODAY_DEPARTURES.map(d => (
              <div key={d.id} className={`arrival-item ${d.checkedOut ? 'arrival-item--done' : ''}`}>
                <div className="arrival-item__avatar" style={{ background: '#fef3c7', color: '#92400e' }}>
                  <User size={16} />
                </div>
                <div className="arrival-item__info">
                  <p className="arrival-item__name">{d.guest}</p>
                  <p className="arrival-item__meta">Room {d.room} · {d.type}</p>
                  <div className="arrival-item__footer">
                    <span className="arrival-item__eta"><Clock size={11} /> By {d.checkout}</span>
                    <span className={`badge badge--${d.checkedOut ? 'success' : 'warning'}`}>
                      {d.checkedOut ? 'checked out' : 'due'}
                    </span>
                  </div>
                </div>
                <div className="arrival-item__action">
                  {d.checkedOut
                    ? <span className="arrival-item__done"><CheckCircle2 size={18} /> Done</span>
                    : <button className="btn-outline" style={{ padding:'7px 14px', fontSize:'0.8rem' }}>
                        Check Out
                      </button>
                  }
                </div>
              </div>
            ))}
          </div>

          <div className="rec-dash__alert">
            <AlertCircle size={14} />
            <span>Late check-out fee applies after 12:00 PM</span>
          </div>
        </div>
      </div>
    </div>
  )
}