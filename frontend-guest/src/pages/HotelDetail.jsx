import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Star, Wifi, Car, Coffee, ArrowLeft,
  Users, BedDouble, Check, ChevronDown, ChevronUp, Loader
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { hotelsAPI, bookingsAPI } from '../services/api'
import './HotelDetail.css'

const AMENITY_ICONS = { WiFi: Wifi, Parking: Car, Breakfast: Coffee }

export default function HotelDetail() {
  const { id }       = useParams()
  const navigate     = useNavigate()
  const { user }     = useAuth()

  const [hotel, setHotel]                 = useState(null)
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [activeImg, setActiveImg]         = useState(0)
  const [selectedRoom, setRoom]           = useState(null)
  const [checkIn, setCheckIn]             = useState('')
  const [checkOut, setCheckOut]           = useState('')
  const [guests, setGuests]               = useState(2)
  const [showAllAmenities, setShowAll]    = useState(false)
  const [bookingError, setBookingError]   = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const res = await hotelsAPI.getOne(id)
        setHotel(res.data.data)
      } catch {
        setError('Hotel not found.')
      } finally {
        setLoading(false)
      }
    }
    fetchHotel()
  }, [id])

  if (loading) {
    return (
      <div style={{ minHeight:'60vh', display:'flex', alignItems:'center', justifyContent:'center', paddingTop:72 }}>
        <Loader size={32} className="spin" />
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className="hotel-notfound">
        <h2>{error || 'Hotel not found'}</h2>
        <button className="btn-primary" onClick={() => navigate('/search')}>← Back to Search</button>
      </div>
    )
  }

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0

  const displayedAmenities = showAllAmenities
    ? hotel.amenities
    : hotel.amenities?.slice(0, 6) || []

  const handleBook = async () => {
    setBookingError('')
    if (!user)        { navigate('/login', { state: { from: `/hotel/${id}` } }); return }
    if (!selectedRoom) { setBookingError('Please select a room first.'); return }
    if (!checkIn || !checkOut) { setBookingError('Please select check-in and check-out dates.'); return }
    if (nights <= 0)   { setBookingError('Check-out must be after check-in.'); return }

    setBookingLoading(true)
    try {
      const res = await bookingsAPI.create({
        room_id:          selectedRoom.id,
        check_in:         checkIn,
        check_out:        checkOut,
        guests,
        special_requests: '',
      })

      const apiBooking = res.data.data

      // Use the real booking_ref from the API response
      const bookingData = {
        id:            apiBooking.id,
        booking_ref:   apiBooking.booking_ref,   // ← real reference from backend
        hotelId:       hotel.id,
        hotelName:     hotel.name,
        hotelLocation: hotel.location,
        hotelImage:    hotel.images?.[0] || '',
        roomName:      selectedRoom.name,
        roomType:      selectedRoom.type,
        checkIn:       apiBooking.check_in,
        checkOut:      apiBooking.check_out,
        nights:        apiBooking.nights,
        guests:        apiBooking.guests,
        pricePerNight: apiBooking.price_per_night,
        totalAmount:   apiBooking.total_amount,
        taxes:         apiBooking.taxes,
        paymentMethod: apiBooking.payment_method,
        status:        apiBooking.status,
        bookedOn:      apiBooking.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
      }

      navigate('/confirmation', { state: { booking: bookingData } })
    } catch (err) {
      setBookingError(err.response?.data?.error || 'Booking failed. Please try again.')
    } finally {
      setBookingLoading(false)
    }
  }

  return (
    <div className="hotel-detail-page">
      <div className="hotel-detail__back">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back to results
          </button>
        </div>
      </div>

      <div className="container">
        {/* Gallery */}
        <div className="hotel-gallery">
          <div className="hotel-gallery__main">
            <img
              src={hotel.images?.[activeImg] || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200`}
              alt={hotel.name}
            />
          </div>
          {hotel.images?.length > 1 && (
            <div className="hotel-gallery__thumbs">
              {hotel.images.map((img, i) => (
                <button
                  key={i}
                  className={`hotel-gallery__thumb ${activeImg === i ? 'hotel-gallery__thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`View ${i+1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hotel-detail__body">
          {/* Info */}
          <div className="hotel-detail__info">
            <div className="hotel-detail__header">
              <div>
                <span className="hotel-detail__type">{hotel.type}</span>
                <h1 className="hotel-detail__name">{hotel.name}</h1>
                <div className="hotel-detail__location"><MapPin size={15} /> {hotel.location}</div>
              </div>
              {hotel.rating && (
                <div className="hotel-detail__rating">
                  <Star size={18} fill="#F9A825" color="#F9A825" />
                  <strong>{hotel.rating}</strong>
                </div>
              )}
            </div>

            <p className="hotel-detail__desc">{hotel.description}</p>

            {/* Amenities */}
            {hotel.amenities?.length > 0 && (
              <div className="hotel-detail__amenities">
                <h3>Amenities</h3>
                <div className="amenities-list">
                  {displayedAmenities.map(a => {
                    const Icon = AMENITY_ICONS[a] || Check
                    return (
                      <div key={a} className="amenity-item">
                        <Icon size={15} /><span>{a}</span>
                      </div>
                    )
                  })}
                </div>
                {hotel.amenities.length > 6 && (
                  <button className="show-more-btn" onClick={() => setShowAll(!showAllAmenities)}>
                    {showAllAmenities
                      ? <><ChevronUp size={14} /> Show less</>
                      : <><ChevronDown size={14} /> Show all {hotel.amenities.length} amenities</>
                    }
                  </button>
                )}
              </div>
            )}

            {/* Rooms */}
            {hotel.rooms?.length > 0 && (
              <div className="hotel-detail__rooms">
                <h3>Choose Your Room</h3>
                <div className="rooms-list">
                  {hotel.rooms.map(room => (
                    <div
                      key={room.id}
                      className={`room-option ${selectedRoom?.id === room.id ? 'room-option--selected' : ''} ${room.status !== 'available' ? 'room-option--unavailable' : ''}`}
                      onClick={() => room.status === 'available' && setRoom(selectedRoom?.id === room.id ? null : room)}
                    >
                      <div className="room-option__top">
                        <div>
                          <p className="room-option__name">{room.name}</p>
                          <p className="room-option__type">{room.type}</p>
                        </div>
                        <div className="room-option__price">
                          <strong>${room.price}</strong><span>/night</span>
                        </div>
                      </div>
                      <div className="room-option__meta">
                        <span><Users size={13} /> Up to {room.capacity} guests</span>
                        {room.status !== 'available' && (
                          <span className="room-unavailable-tag">Currently {room.status}</span>
                        )}
                      </div>
                      <div className="room-option__amenities">
                        {room.amenities?.map(a => <span key={a} className="room-option__tag">{a}</span>)}
                      </div>
                      {selectedRoom?.id === room.id && (
                        <div className="room-option__selected-badge"><Check size={13} /> Selected</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking widget */}
          <div className="hotel-detail__booking">
            <div className="booking-widget">
              <div className="booking-widget__header">
                <div>
                  <span className="booking-widget__from">from</span>
                  <p className="booking-widget__price">
                    ${hotel.rooms?.length ? Math.min(...hotel.rooms.map(r => r.price)) : '—'}
                    <span>/night</span>
                  </p>
                </div>
                <div className="booking-widget__rating">
                  <Star size={13} fill="#F9A825" color="#F9A825" />
                  {hotel.star_rating || 5}★
                </div>
              </div>

              <div className="booking-widget__fields">
                <div className="booking-widget__dates">
                  <div className="booking-date-field">
                    <label>Check-In</label>
                    <input
                      type="date"
                      value={checkIn}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={e => setCheckIn(e.target.value)}
                    />
                  </div>
                  <div className="booking-date-divider" />
                  <div className="booking-date-field">
                    <label>Check-Out</label>
                    <input
                      type="date"
                      value={checkOut}
                      min={checkIn || new Date().toISOString().split('T')[0]}
                      onChange={e => setCheckOut(e.target.value)}
                    />
                  </div>
                </div>

                <div className="booking-guests-field">
                  <label>Guests</label>
                  <div className="booking-guests-input">
                    <Users size={15} />
                    <select value={guests} onChange={e => setGuests(+e.target.value)}>
                      {[1,2,3,4,5,6].map(n => (
                        <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {selectedRoom && (
                <div className="booking-widget__room-summary">
                  <BedDouble size={14} />
                  <span>{selectedRoom.name}</span>
                  <strong>${selectedRoom.price}/night</strong>
                </div>
              )}

              {nights > 0 && selectedRoom && (
                <div className="booking-widget__breakdown">
                  <div className="breakdown-row">
                    <span>${selectedRoom.price} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>${(selectedRoom.price * nights).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Taxes & fees (10%)</span>
                    <span>${Math.round(selectedRoom.price * nights * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row breakdown-row--total">
                    <strong>Total</strong>
                    <strong>${Math.round(selectedRoom.price * nights * 1.1).toLocaleString()}</strong>
                  </div>
                </div>
              )}

              {bookingError && <div className="booking-widget__error">{bookingError}</div>}

              <button
                className="booking-widget__btn"
                onClick={handleBook}
                disabled={bookingLoading}
              >
                {bookingLoading ? 'Processing...' : user ? 'Reserve Now' : 'Sign In to Book'}
              </button>

              {!user && (
                <p className="booking-widget__signin-note">
                  You need to be signed in to make a booking.
                </p>
              )}

              <p className="booking-widget__note">
                No charge until arrival · Free cancellation within 48hrs
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}