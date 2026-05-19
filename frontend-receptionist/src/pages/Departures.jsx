import { useState } from 'react'
import { Search, X, CheckCircle2, User, Clock, Receipt } from 'lucide-react'
import './Departures.css'

const DEPARTURES = [
  { id: 'BK081', guest: 'Emma Brown',   email: 'emma@email.com',   room: '102', type: 'Standard', checkIn: '2025-06-29', checkOut: '2025-07-02', nights: 3, amount: 360,  extras: 45,  status: 'due',         checkedOut: false },
  { id: 'BK082', guest: 'David Asante', email: 'david@email.com',  room: '203', type: 'Deluxe',   checkIn: '2025-06-28', checkOut: '2025-07-02', nights: 4, amount: 880,  extras: 120, status: 'checked-out', checkedOut: true  },
  { id: 'BK083', guest: 'Ama Boateng',  email: 'ama@email.com',    room: '308', type: 'Suite',    checkIn: '2025-06-25', checkOut: '2025-07-02', nights: 7, amount: 2940, extras: 0,   status: 'due',         checkedOut: false },
  { id: 'BK084', guest: 'Yaw Mensah',   email: 'yaw@email.com',    room: '410', type: 'Deluxe',   checkIn: '2025-06-30', checkOut: '2025-07-02', nights: 2, amount: 440,  extras: 60,  status: 'late',        checkedOut: false },
]

export default function Departures() {
  const [departures, setDepartures] = useState(DEPARTURES)
  const [search, setSearch]         = useState('')
  const [filter, setFilter]         = useState('all')
  const [selected, setSelected]     = useState(null)
  const [success, setSuccess]       = useState(false)
  const [keyReturned, setKey]       = useState(false)
  const [settled, setSettled]       = useState(false)

  const filtered = departures.filter(d => {
    const matchSearch = d.guest.toLowerCase().includes(search.toLowerCase()) ||
                        d.id.toLowerCase().includes(search.toLowerCase()) ||
                        d.room.includes(search)
    const matchFilter = filter === 'all' || (filter === 'pending' && !d.checkedOut) || (filter === 'done' && d.checkedOut)
    return matchSearch && matchFilter
  })

  const handleCheckOut = () => {
    setDepartures(prev => prev.map(d => d.id === selected.id ? { ...d, checkedOut: true, status: 'checked-out' } : d))
    setSuccess(true)
    setTimeout(() => {
      setSuccess(false); setSelected(null)
      setKey(false); setSettled(false)
    }, 2000)
  }

  const STATUS_COLOR = { due: 'warning', 'checked-out': 'success', late: 'danger' }

  return (
    <div className="departures-page">
      <div className="page-top">
        <div>
          <h1>Today's Departures</h1>
          <p>{departures.filter(d => !d.checkedOut).length} guests pending check-out</p>
        </div>
      </div>

      <div className="arrivals-controls">
        <div className="search-box">
          <Search size={15} />
          <input placeholder="Search by name, booking ID or room..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {[['all','All'],['pending','Pending'],['done','Checked Out']].map(([val, label]) => (
            <button key={val} className={`filter-tab ${filter === val ? 'filter-tab--active' : ''}`} onClick={() => setFilter(val)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="departures-list">
        {filtered.map(d => (
          <div key={d.id} className={`departure-row ${d.checkedOut ? 'departure-row--done' : ''} ${d.status === 'late' ? 'departure-row--late' : ''}`}>
            <div className="departure-row__guest">
              <div className="departure-row__avatar"><User size={16} /></div>
              <div>
                <p className="departure-row__name">{d.guest}</p>
                <p className="departure-row__id">{d.id}</p>
              </div>
            </div>
            <div className="departure-row__info">
              <p>Room {d.room}</p>
              <p className="departure-row__sub">{d.type}</p>
            </div>
            <div className="departure-row__info">
              <p>{d.nights} nights</p>
              <p className="departure-row__sub">{d.checkIn} → {d.checkOut}</p>
            </div>
            <div className="departure-row__info">
              <p className="departure-row__amount">${(d.amount + d.extras).toLocaleString()}</p>
              {d.extras > 0 && <p className="departure-row__sub">incl. ${d.extras} extras</p>}
            </div>
            <div>
              <span className={`badge badge--${STATUS_COLOR[d.status] || 'gray'}`}>{d.status}</span>
            </div>
            <div>
              {d.checkedOut
                ? <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.82rem', fontWeight:600, color:'var(--success)' }}><CheckCircle2 size={15} /> Done</span>
                : <button className="btn-outline" style={{ padding:'7px 14px', fontSize:'0.82rem' }} onClick={() => { setSelected(d); setSuccess(false); setKey(false); setSettled(false) }}>
                    <Receipt size={14} /> Check Out
                  </button>
              }
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="table-empty">No departures found.</div>}
      </div>

      {/* CHECK-OUT MODAL */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal--md" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div>
                <h2>Check Out Guest</h2>
                <p>{selected.guest} · Room {selected.room}</p>
              </div>
              <button className="modal__close" onClick={() => setSelected(null)}><X size={20} /></button>
            </div>

            {success ? (
              <div className="modal__success">
                <div className="success-circle">✓</div>
                <h3>Checked Out Successfully!</h3>
                <p>{selected.guest} has been checked out. Room {selected.room} is now being prepared.</p>
              </div>
            ) : (
              <>
                <div className="modal__body">
                  <div className="checkin-summary">
                    <div className="checkin-summary__row">
                      <div className="checkin-summary__item"><span>Guest</span><strong>{selected.guest}</strong></div>
                      <div className="checkin-summary__item"><span>Room</span><strong>#{selected.room} ({selected.type})</strong></div>
                    </div>
                    <div className="checkin-summary__row">
                      <div className="checkin-summary__item"><span>Check-In</span><strong>{selected.checkIn}</strong></div>
                      <div className="checkin-summary__item"><span>Check-Out</span><strong>{selected.checkOut}</strong></div>
                    </div>
                    <div className="checkin-summary__row">
                      <div className="checkin-summary__item"><span>Room Charges</span><strong>${selected.amount.toLocaleString()}</strong></div>
                      <div className="checkin-summary__item"><span>Extra Charges</span><strong>${selected.extras.toLocaleString()}</strong></div>
                    </div>
                    <div className="checkin-summary__row" style={{ background: '#f8fafc' }}>
                      <div className="checkin-summary__item"><span>Total Due</span><strong style={{ color:'var(--primary)', fontSize:'1.05rem' }}>${(selected.amount + selected.extras).toLocaleString()}</strong></div>
                      <div className="checkin-summary__item"><span>Nights</span><strong>{selected.nights}</strong></div>
                    </div>
                  </div>

                  <div className="checkin-checklist">
                    <p className="checkin-checklist__label">Check-Out Checklist</p>
                    <label className="checkin-check">
                      <input type="checkbox" checked={settled} onChange={e => setSettled(e.target.checked)} />
                      <span>All charges settled / Final bill issued</span>
                    </label>
                    <label className="checkin-check">
                      <input type="checkbox" checked={keyReturned} onChange={e => setKey(e.target.checked)} />
                      <span>Room key / key card returned</span>
                    </label>
                  </div>
                </div>
                <div className="modal__footer">
                  <button className="btn-ghost" onClick={() => setSelected(null)}>Cancel</button>
                  <button className="btn-danger" onClick={handleCheckOut} disabled={!settled || !keyReturned}>
                    Confirm Check-Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}