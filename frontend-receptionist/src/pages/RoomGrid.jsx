import { useState } from 'react'
import { BedDouble } from 'lucide-react'
import './RoomGrid.css'

const ROOMS = [
  { number: '101', type: 'Standard', floor: 1, status: 'available',   guest: null,           price: 120 },
  { number: '102', type: 'Standard', floor: 1, status: 'occupied',    guest: 'Emma Brown',    price: 120 },
  { number: '103', type: 'Standard', floor: 1, status: 'available',   guest: null,            price: 120 },
  { number: '104', type: 'Standard', floor: 1, status: 'maintenance', guest: null,            price: 120 },
  { number: '105', type: 'Standard', floor: 1, status: 'available',   guest: null,            price: 120 },
  { number: '201', type: 'Deluxe',   floor: 2, status: 'occupied',    guest: 'Alice Johnson', price: 220 },
  { number: '202', type: 'Deluxe',   floor: 2, status: 'available',   guest: null,            price: 220 },
  { number: '203', type: 'Deluxe',   floor: 2, status: 'occupied',    guest: 'David Asante',  price: 220 },
  { number: '204', type: 'Deluxe',   floor: 2, status: 'occupied',    guest: 'Alice Johnson', price: 220 },
  { number: '205', type: 'Deluxe',   floor: 2, status: 'available',   guest: null,            price: 220 },
  { number: '301', type: 'Suite',    floor: 3, status: 'occupied',    guest: 'Marcus Chen',   price: 420 },
  { number: '302', type: 'Suite',    floor: 3, status: 'available',   guest: null,            price: 420 },
  { number: '303', type: 'Suite',    floor: 3, status: 'maintenance', guest: null,            price: 420 },
  { number: '401', type: 'Presidential Suite', floor: 4, status: 'reserved', guest: null,    price: 980 },
  { number: '402', type: 'Presidential Suite', floor: 4, status: 'available', guest: null,   price: 980 },
]

const STATUS_LABELS = { available: 'Available', occupied: 'Occupied', maintenance: 'Maintenance', reserved: 'Reserved' }
const STATUS_COLORS = { available: '#10b981', occupied: '#6366f1', maintenance: '#f59e0b', reserved: '#3b82f6' }

const floors = [...new Set(ROOMS.map(r => r.floor))].sort()

export default function RoomGrid() {
  const [filter, setFilter]   = useState('all')
  const [selected, setSelected] = useState(null)

  const counts = { available: 0, occupied: 0, maintenance: 0, reserved: 0 }
  ROOMS.forEach(r => counts[r.status]++)

  const filtered = filter === 'all' ? ROOMS : ROOMS.filter(r => r.status === filter)

  return (
    <div className="roomgrid-page">
      <div className="page-top">
        <div>
          <h1>Room Grid</h1>
          <p>Live overview of all {ROOMS.length} rooms</p>
        </div>
      </div>

      {/* Legend */}
      <div className="roomgrid-legend">
        {Object.entries(STATUS_LABELS).map(([status, label]) => (
          <button
            key={status}
            className={`legend-btn ${filter === status ? 'legend-btn--active' : ''}`}
            onClick={() => setFilter(filter === status ? 'all' : status)}
            style={{ '--dot-color': STATUS_COLORS[status] }}
          >
            <span className="legend-dot" />
            {label} ({counts[status]})
          </button>
        ))}
        <button className={`legend-btn ${filter === 'all' ? 'legend-btn--all' : ''}`} onClick={() => setFilter('all')}>
          All Rooms ({ROOMS.length})
        </button>
      </div>

      {/* Grid by floor */}
      {floors.map(floor => {
        const floorRooms = filtered.filter(r => r.floor === floor)
        if (floorRooms.length === 0) return null
        return (
          <div key={floor} className="roomgrid-floor">
            <div className="roomgrid-floor__label">Floor {floor}</div>
            <div className="roomgrid-floor__rooms">
              {floorRooms.map(r => (
                <button
                  key={r.number}
                  className={`room-tile room-tile--${r.status}`}
                  onClick={() => setSelected(r)}
                >
                  <span className="room-tile__num">{r.number}</span>
                  <BedDouble size={14} />
                  <span className="room-tile__type">{r.type.split(' ')[0]}</span>
                  {r.guest && <span className="room-tile__guest">{r.guest.split(' ')[0]}</span>}
                </button>
              ))}
            </div>
          </div>
        )
      })}

      {/* Room detail popup */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal modal--sm" onClick={e => e.stopPropagation()}>
            <div className="modal__header">
              <div><h2>Room #{selected.number}</h2><p>{selected.type}</p></div>
              <button className="modal__close" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="modal__body">
              <div className="room-detail">
                <div className="room-detail__status" style={{ background: STATUS_COLORS[selected.status] + '18', color: STATUS_COLORS[selected.status] }}>
                  <span className="legend-dot" style={{ '--dot-color': STATUS_COLORS[selected.status] }} />
                  {STATUS_LABELS[selected.status]}
                </div>
                <div className="checkin-summary">
                  <div className="checkin-summary__row">
                    <div className="checkin-summary__item"><span>Type</span><strong>{selected.type}</strong></div>
                    <div className="checkin-summary__item"><span>Floor</span><strong>Floor {selected.floor}</strong></div>
                  </div>
                  <div className="checkin-summary__row">
                    <div className="checkin-summary__item"><span>Price</span><strong>${selected.price}/night</strong></div>
                    <div className="checkin-summary__item"><span>Guest</span><strong>{selected.guest || '—'}</strong></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal__footer">
              <button className="btn-ghost" onClick={() => setSelected(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}