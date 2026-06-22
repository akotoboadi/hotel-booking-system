import { useState, useEffect } from 'react'
import { Plus, Users, Loader } from 'lucide-react'
import { roomsAPI, hotelsAPI } from '../services/api'

export default function Rooms() {
  const [rooms, setRooms]     = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const hotelsRes = await hotelsAPI.getAll({ per_page: 50 })
        const hotelList = hotelsRes.data.data.items || []
        const allRooms  = []
        for (const hotel of hotelList) {
          try {
            const rRes = await roomsAPI.getByHotel(hotel.id)
            const hotelRooms = (rRes.data.data || []).map(r => ({
              ...r,
              hotel_name: hotel.name,
            }))
            allRooms.push(...hotelRooms)
          } catch {}
        }
        setRooms(allRooms)
      } catch {}
      finally { setLoading(false) }
    }
    init()
  }, [])

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh' }}>
        <Loader size={28} style={{ animation:'spin 1s linear infinite', color:'var(--primary)' }} />
      </div>
    )
  }

  return (
    <div className="rooms-page">
      <div className="page-header">
        <div>
          <h1>Rooms</h1>
          <p>{rooms.length} total rooms across all hotels</p>
        </div>
      </div>

      <div className="table-card">
        <div className="rooms-table-wrap">
          {rooms.length === 0 ? (
            <div className="table-empty">No rooms yet. Managers add rooms from the Manager portal.</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Room</th><th>Hotel</th><th>Type</th>
                  <th>Capacity</th><th>Price/Night</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(r => (
                  <tr key={r.id}>
                    <td className="data-table__bold">{r.name}</td>
                    <td>{r.hotel_name}</td>
                    <td>{r.type}</td>
                    <td>
                      <span style={{ display:'flex', alignItems:'center', gap:4 }}>
                        <Users size={13} color="var(--gray-400)" /> {r.capacity}
                      </span>
                    </td>
                    <td className="data-table__bold">${r.price}</td>
                    <td>
                      <span className={`badge badge--${
                        r.status === 'available'   ? 'success' :
                        r.status === 'occupied'    ? 'info'    :
                        r.status === 'maintenance' ? 'warning' : 'gray'
                      }`}>
                        {r.status}
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