import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  MapPin, Star, Wifi, Car, Coffee, ArrowLeft,
  Users, BedDouble, Check, ChevronDown, ChevronUp
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import './HotelDetail.css'

// Mock hotel data — will be replaced by API call
const MOCK_HOTELS = {
  1: {
    id: 1, name: 'The Grand Meridian', location: 'Paris, France',
    price: 420, rating: 4.9, reviewCount: 312, type: 'Luxury',
    description: 'Nestled in the heart of Paris, The Grand Meridian offers an unparalleled blend of classic French elegance and modern luxury. Each room is a sanctuary of refined taste, with floor-to-ceiling windows overlooking iconic Parisian landmarks.',
    amenities: ['WiFi', 'Parking', 'Breakfast', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Room Service'],
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    ],
    rooms: [
      { id: 101, name: 'Deluxe Room',        type: 'Deluxe',   capacity: 2, price: 320, amenities: ['WiFi','TV','AC','Mini Bar'] },
      { id: 102, name: 'Superior Suite',     type: 'Suite',    capacity: 3, price: 520, amenities: ['WiFi','TV','AC','Mini Bar','Balcony','Bathtub'] },
      { id: 103, name: 'Presidential Suite', type: 'Suite',    capacity: 4, price: 980, amenities: ['WiFi','TV','AC','Mini Bar','Balcony','Jacuzzi','Kitchen','Butler'] },
    ],
  },
  2: {
    id: 2, name: 'Azura Beach Resort', location: 'Maldives',
    price: 890, rating: 4.8, reviewCount: 198, type: 'Resort',
    description: 'Azura Beach Resort is an exclusive overwater paradise in the crystal-clear lagoons of the Maldives. Wake up to turquoise waters beneath your villa, enjoy world-class diving, and experience dining under the stars.',
    amenities: ['WiFi', 'Breakfast', 'Pool', 'Spa', 'Dive Center', 'Restaurant', 'Bar', 'Water Sports'],
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
      'https://images.unsplash.com/photo-1537572975-f98c9fb6fded?w=1200',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200',
    ],
    rooms: [
      { id: 201, name: 'Beach Villa',       type: 'Villa',  capacity: 2, price: 750,  amenities: ['WiFi','TV','AC','Private Pool'] },
      { id: 202, name: 'Overwater Bungalow',type: 'Villa',  capacity: 2, price: 1100, amenities: ['WiFi','TV','AC','Private Pool','Direct Ocean Access'] },
      { id: 203, name: 'Reef Suite',        type: 'Suite',  capacity: 4, price: 1800, amenities: ['WiFi','TV','AC','Private Pool','Butler','Sunset Deck'] },
    ],
  },
  3: {
    id: 3, name: 'The Vine Boutique', location: 'Tuscany, Italy',
    price: 280, rating: 4.7, reviewCount: 445, type: 'Boutique',
    description: 'Tucked among rolling Tuscan vineyards, The Vine Boutique is a lovingly restored 16th-century farmhouse. Savour award-winning wines from our estate, dine on farm-to-table cuisine, and explore the golden countryside.',
    amenities: ['WiFi', 'Parking', 'Breakfast', 'Pool', 'Wine Tasting', 'Restaurant', 'Cycling'],
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
    ],
    rooms: [
      { id: 301, name: 'Garden Room',    type: 'Standard', capacity: 2, price: 220, amenities: ['WiFi','TV','AC','Garden View'] },
      { id: 302, name: 'Vineyard Suite', type: 'Suite',    capacity: 2, price: 380, amenities: ['WiFi','TV','AC','Vineyard View','Private Terrace'] },
    ],
  },
  4: {
    id: 4, name: 'Urban Loft Tokyo', location: 'Tokyo, Japan',
    price: 195, rating: 4.6, reviewCount: 621, type: 'Boutique',
    description: 'A sleek urban sanctuary in the heart of Shibuya. Urban Loft Tokyo combines minimalist Japanese design with cutting-edge technology, putting you steps away from the city\'s best dining, culture, and nightlife.',
    amenities: ['WiFi', 'Gym', 'Restaurant', 'Bar', 'Concierge', 'Rooftop'],
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200',
    ],
    rooms: [
      { id: 401, name: 'Urban Studio',  type: 'Standard', capacity: 1, price: 160, amenities: ['WiFi','TV','AC'] },
      { id: 402, name: 'City Loft',     type: 'Deluxe',   capacity: 2, price: 240, amenities: ['WiFi','TV','AC','City View','Mini Bar'] },
    ],
  },
  5: {
    id: 5, name: 'Sahara Dunes Camp', location: 'Morocco',
    price: 340, rating: 4.9, reviewCount: 87, type: 'Villa',
    description: 'An extraordinary glamping experience under the Saharan stars. Our luxury desert camp blends Berber tradition with five-star comfort — private tents, gourmet cuisine, camel treks, and silence like you\'ve never heard.',
    amenities: ['Breakfast', 'Dinner', 'Desert Tours', 'Camel Trek', 'Stargazing'],
    images: [
      'https://images.unsplash.com/photo-1537572975-f98c9fb6fded?w=1200',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200',
    ],
    rooms: [
      { id: 501, name: 'Desert Tent',        type: 'Standard', capacity: 2, price: 280, amenities: ['Private Bathroom','Breakfast','Dinner'] },
      { id: 502, name: 'Sultan Luxury Tent', type: 'Suite',    capacity: 4, price: 480, amenities: ['Private Bathroom','Breakfast','Dinner','Private Fire Pit'] },
    ],
  },
  6: {
    id: 6, name: 'Alpine Chalet Zermatt', location: 'Switzerland',
    price: 620, rating: 4.8, reviewCount: 203, type: 'Luxury',
    description: 'With the Matterhorn as your backdrop, Alpine Chalet Zermatt is the ultimate mountain retreat. Ski-in, ski-out access, a roaring fireplace, world-class spa, and Michelin-starred dining make this a once-in-a-lifetime experience.',
    amenities: ['WiFi', 'Parking', 'Breakfast', 'Spa', 'Ski Storage', 'Fireplace', 'Restaurant', 'Sauna'],
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200',
    ],
    rooms: [
      { id: 601, name: 'Mountain Room',    type: 'Deluxe',  capacity: 2, price: 520, amenities: ['WiFi','TV','AC','Mountain View','Fireplace'] },
      { id: 602, name: 'Summit Chalet',    type: 'Suite',   capacity: 4, price: 980, amenities: ['WiFi','TV','AC','Panoramic View','Private Sauna','Fireplace'] },
    ],
  },
}

const AMENITY_ICONS = {
  WiFi: Wifi, Parking: Car, Breakfast: Coffee,
}

export default function HotelDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const hotel = MOCK_HOTELS[parseInt(id)]

  const [activeImg, setActiveImg]     = useState(0)
  const [selectedRoom, setRoom]       = useState(null)
  const [checkIn, setCheckIn]         = useState('')
  const [checkOut, setCheckOut]       = useState('')
  const [guests, setGuests]           = useState(2)
  const [showAllAmenities, setShowAll] = useState(false)
  const [bookingError, setBookingError] = useState('')
  const [bookingLoading, setBookingLoading] = useState(false)
  // const [bookingSuccess, setBookingSuccess] = useState(false)

  if (!hotel) {
    return (
      <div className="hotel-notfound">
        <h2>Hotel not found</h2>
        <button className="btn-primary" onClick={() => navigate('/search')}>
          ← Back to Search
        </button>
      </div>
    )
  }

  const nights = checkIn && checkOut
    ? Math.max(0, Math.round((new Date(checkOut) - new Date(checkIn)) / 86400000))
    : 0

  const totalAmount = selectedRoom && nights > 0
    ? selectedRoom.price * nights
    : 0



    const handleBook = async () => {
      setBookingError('')

      if (!user) {
        navigate('/login')
        return
      }
      if (!selectedRoom) {
        setBookingError('Please select a room first.')
        return
      }
      if (!checkIn || !checkOut) {
        setBookingError('Please select your check-in and check-out dates.')
        return
      }
      if (nights <= 0) {
        setBookingError('Check-out date must be after check-in date.')
        return
      }

      setBookingLoading(true)
      try {
        // Simulated API — replace with real call when backend is ready
        await new Promise(r => setTimeout(r, 1200))

        // Build booking data to pass to confirmation page
        const bookingData = {
          id:            `AK-${Date.now()}`,
          hotelId:       hotel.id,
          hotelName:     hotel.name,
          hotelLocation: hotel.location,
          hotelImage:    hotel.images[0],
          roomName:      selectedRoom.name,
          roomType:      selectedRoom.type,
          checkIn,
          checkOut,
          nights,
          guests,
          pricePerNight: selectedRoom.price,
          totalAmount:   selectedRoom.price * nights,
          taxes:         Math.round(selectedRoom.price * nights * 0.1),
          paymentMethod: 'Pay at Hotel',
          status:        'confirmed',
          bookedOn:      new Date().toISOString().split('T')[0],
        }

        // Go straight to confirmation with the booking data
        navigate('/confirmation', { state: { booking: bookingData } })

      } catch {
        setBookingError('Booking failed. Please try again.')
      } finally {
        setBookingLoading(false)
      }
    }
  // const handleBook = async () => {
  //   setBookingError('')

  //   if (!user) {
  //     navigate('/login')
  //     return
  //   }
  //   if (!selectedRoom) {
  //     setBookingError('Please select a room.')
  //     return
  //   }
  //   if (!checkIn || !checkOut) {
  //     setBookingError('Please select check-in and check-out dates.')
  //     return
  //   }
  //   if (nights <= 0) {
  //     setBookingError('Check-out must be after check-in.')
  //     return
  //   }

  //   setBookingLoading(true)
  //   try {
  //     // Replace with real API call: await createBooking({...})
  //     await new Promise(r => setTimeout(r, 1200))
  //     setBookingSuccess(true)
  //   } catch {
  //     setBookingError('Booking failed. Please try again.')
  //   } finally {
  //     setBookingLoading(false)
  //   }
  // }

  const displayedAmenities = showAllAmenities
    ? hotel.amenities
    : hotel.amenities.slice(0, 6)

  // if (bookingSuccess) {
  //   return (
  //     <div className="booking-success-page">
  //       <div className="booking-success__card">
  //         <div className="booking-success__icon">✓</div>
  //         <h2>Booking Confirmed!</h2>
  //         <p>Your stay at <strong>{hotel.name}</strong> is confirmed.</p>
  //         <div className="booking-success__details">
  //           <div><span>Room</span><strong>{selectedRoom.name}</strong></div>
  //           <div><span>Check-In</span><strong>{checkIn}</strong></div>
  //           <div><span>Check-Out</span><strong>{checkOut}</strong></div>
  //           <div><span>Nights</span><strong>{nights}</strong></div>
  //           <div><span>Guests</span><strong>{guests}</strong></div>
  //           <div><span>Total</span><strong>${totalAmount.toLocaleString()}</strong></div>
  //         </div>
  //         <div className="booking-success__actions">
  //           <button className="btn-primary" onClick={() => navigate('/')}>
  //             Back to Home
  //           </button>
  //           <button className="btn-outline-guest" onClick={() => navigate('/bookings')}>
  //             My Bookings
  //           </button>
  //           <button className="btn-outline-guest" onClick={() => navigate('/confirmation')}>
  //             Confirm Bookings
  //           </button>
  //         </div>
  //       </div>
  //     </div>
  //   )
  // }

  return (
    <div className="hotel-detail-page">
      {/* Back */}
      <div className="hotel-detail__back">
        <div className="container">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} /> Back to results
          </button>
        </div>
      </div>

      <div className="container">
        {/* Image gallery */}
        <div className="hotel-gallery">
          <div className="hotel-gallery__main">
            <img src={hotel.images[activeImg]} alt={hotel.name} />
          </div>
          {hotel.images.length > 1 && (
            <div className="hotel-gallery__thumbs">
              {hotel.images.map((img, i) => (
                <button
                  key={i}
                  className={`hotel-gallery__thumb ${activeImg === i ? 'hotel-gallery__thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt={`View ${i + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="hotel-detail__body">
          {/* LEFT — Hotel info */}
          <div className="hotel-detail__info">
            {/* Header */}
            <div className="hotel-detail__header">
              <div>
                <span className="hotel-detail__type">{hotel.type}</span>
                <h1 className="hotel-detail__name">{hotel.name}</h1>
                <div className="hotel-detail__location">
                  <MapPin size={15} /> {hotel.location}
                </div>
              </div>
              <div className="hotel-detail__rating">
                <Star size={18} fill="#F9A825" color="#F9A825" />
                <strong>{hotel.rating}</strong>
                <span>({hotel.reviewCount} reviews)</span>
              </div>
            </div>

            {/* Description */}
            <p className="hotel-detail__desc">{hotel.description}</p>

            {/* Amenities */}
            <div className="hotel-detail__amenities">
              <h3>Amenities</h3>
              <div className="amenities-list">
                {displayedAmenities.map(a => {
                  const Icon = AMENITY_ICONS[a] || Check
                  return (
                    <div key={a} className="amenity-item">
                      <Icon size={15} />
                      <span>{a}</span>
                    </div>
                  )
                })}
              </div>
              {hotel.amenities.length > 6 && (
                <button
                  className="show-more-btn"
                  onClick={() => setShowAll(!showAllAmenities)}
                >
                  {showAllAmenities
                    ? <><ChevronUp size={14} /> Show less</>
                    : <><ChevronDown size={14} /> Show all {hotel.amenities.length} amenities</>
                  }
                </button>
              )}
            </div>

            {/* Rooms */}
            <div className="hotel-detail__rooms">
              <h3>Choose Your Room</h3>
              <div className="rooms-list">
                {hotel.rooms.map(room => (
                  <div
                    key={room.id}
                    className={`room-option ${selectedRoom?.id === room.id ? 'room-option--selected' : ''}`}
                    onClick={() => setRoom(selectedRoom?.id === room.id ? null : room)}
                  >
                    <div className="room-option__top">
                      <div>
                        <p className="room-option__name">{room.name}</p>
                        <p className="room-option__type">{room.type}</p>
                      </div>
                      <div className="room-option__price">
                        <strong>${room.price}</strong>
                        <span>/night</span>
                      </div>
                    </div>
                    <div className="room-option__meta">
                      <span>
                        <Users size={13} /> Up to {room.capacity} guests
                      </span>
                    </div>
                    <div className="room-option__amenities">
                      {room.amenities.map(a => (
                        <span key={a} className="room-option__tag">{a}</span>
                      ))}
                    </div>
                    {selectedRoom?.id === room.id && (
                      <div className="room-option__selected-badge">
                        <Check size={13} /> Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT — Booking widget */}
          <div className="hotel-detail__booking">
            <div className="booking-widget">
              <div className="booking-widget__header">
                <div>
                  <span className="booking-widget__from">from</span>
                  <p className="booking-widget__price">
                    ${hotel.price}
                    <span>/night</span>
                  </p>
                </div>
                <div className="booking-widget__rating">
                  <Star size={13} fill="#F9A825" color="#F9A825" />
                  {hotel.rating}
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
                    <select
                      value={guests}
                      onChange={e => setGuests(+e.target.value)}
                    >
                      {[1,2,3,4,5,6].map(n => (
                        <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Selected room summary */}
              {selectedRoom && (
                <div className="booking-widget__room-summary">
                  <BedDouble size={14} />
                  <span>{selectedRoom.name}</span>
                  <strong>${selectedRoom.price}/night</strong>
                </div>
              )}

              {/* Price breakdown */}
              {nights > 0 && selectedRoom && (
                <div className="booking-widget__breakdown">
                  <div className="breakdown-row">
                    <span>${selectedRoom.price} × {nights} night{nights > 1 ? 's' : ''}</span>
                    <span>${(selectedRoom.price * nights).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row">
                    <span>Taxes & fees</span>
                    <span>${Math.round(selectedRoom.price * nights * 0.1).toLocaleString()}</span>
                  </div>
                  <div className="breakdown-row breakdown-row--total">
                    <strong>Total</strong>
                    <strong>${Math.round(selectedRoom.price * nights * 1.1).toLocaleString()}</strong>
                  </div>
                </div>
              )}

              {bookingError && (
                <div className="booking-widget__error">{bookingError}</div>
              )}

              <button
                className="booking-widget__btn"
                onClick={handleBook}
                disabled={bookingLoading}
              >
                {bookingLoading
                  ? 'Processing...'
                  : user
                    ? 'Reserve Now'
                    : 'Sign In to Book'
                }
              </button>

              {!user && (
                <p className="booking-widget__signin-note">
                  You need to be signed in to make a booking.
                </p>
              )}

              <p className="booking-widget__note">
                No charge until confirmation · Free cancellation
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}