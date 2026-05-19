import { useState } from 'react'
import { Plus, Users } from 'lucide-react'
import './Rooms.css'

const ROOMS = [
  { id:1, hotel:'The Grand Meridian', name:'Deluxe Suite',    type:'Suite',    capacity:2, price:420, status:'available'   },
  { id:2, hotel:'The Grand Meridian', name:'Presidential',    type:'Suite',    capacity:4, price:980, status:'occupied'    },
  { id:3, hotel:'Azura Beach Resort', name:'Ocean Villa',     type:'Villa',    capacity:2, price:890, status:'available'   },
  { id:4, hotel:'Urban Loft Tokyo',   name:'Studio',          type:'Standard', capacity:1, price:195, status:'maintenance' },
  { id:5, hotel:'Alpine Chalet',      name:'Mountain Suite',  type:'Suite',    capacity:3, price:620, status:'available'   },
]

export default function Rooms() {
  const [rooms] = useState(ROOMS)

  return (
    <div className="rooms-page">
      <div className="page-header">
        <div>
          <h1>Rooms</h1>
          <p>{rooms.length} total rooms</p>
        </div>
        <button className="btn-primary"><Plus size={16} /> Add Room</button>
      </div>

      <div className="table-card">
        <div className="rooms-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Room</th><th>Hotel</th><th>Type</th>
                <th>Capacity</th><th>Price/Night</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map(r => (
                <tr key={r.id}>
                  <td className="data-table__bold">{r.name}</td>
                  <td>{r.hotel}</td>
                  <td>{r.type}</td>
                  <td>
                    <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                      <Users size={13} color="var(--gray-400)" /> {r.capacity}
                    </span>
                  </td>
                  <td className="data-table__bold">${r.price}</td>
                  <td>
                    <span className={`badge badge--${r.status === 'available' ? 'success' : r.status === 'occupied' ? 'info' : 'warning'}`}>
                      {r.status}
                    </span>
                  </td>
                  <td><button className="table-action">Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}