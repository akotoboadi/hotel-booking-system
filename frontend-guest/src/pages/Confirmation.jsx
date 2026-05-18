import { useLocation, useNavigate, Link } from 'react-router-dom'
import { CheckCircle2, Calendar, BedDouble, Users, MapPin, Printer, ArrowLeft } from 'lucide-react'
import './Confirmation.css'

export default function Confirmation() {
  const location = useLocation()
  const navigate  = useNavigate()

  // Data passed from HotelDetail booking flow via navigate state
  // Falls back to mock data so the page is always previewable
  const booking = location.state?.booking || {
    id:            'AK-2025-001',
    hotelName:     'The Grand Meridian',
    hotelLocation: 'Paris, France',
    hotelImage:    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800',
    roomName:      'Superior Suite',
    roomType:      'Suite',
    checkIn:       '2025-08-10',
    checkOut:      '2025-08-13',
    nights:        3,
    guests:        2,
    pricePerNight: 520,
    totalAmount:   1560,
    taxes:         156,
    paymentMethod: 'Pay at Hotel',
    status:        'confirmed',
    bookedOn:      new Date().toISOString().split('T')[0],
  }

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      weekday: 'short', day: 'numeric', month: 'long', year: 'numeric'
    })

  return (
    <div className="confirmation-page">
      <div className="container">
        <div className="confirmation-wrap">

          {/* Success banner */}
          <div className="confirmation-banner">
            <div className="confirmation-banner__icon">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <h1>Booking Confirmed!</h1>
              <p>
                Your reservation is confirmed. A summary has been saved to your account.
              </p>
            </div>
          </div>

          <div className="confirmation-body">
            {/* Hotel image + name */}
            <div className="confirmation-hotel">
              <img src={booking.hotelImage} alt={booking.hotelName} />
              <div className="confirmation-hotel__info">
                <span className="confirmation-hotel__type">{booking.roomType}</span>
                <h2>{booking.hotelName}</h2>
                <p><MapPin size={13} /> {booking.hotelLocation}</p>
              </div>
            </div>

            {/* Booking reference */}
            <div className="confirmation-ref">
              <span>Booking Reference</span>
              <strong>{booking.id}</strong>
              <p>Show this at check-in</p>
            </div>

            {/* Details grid */}
            <div className="confirmation-details">
              <div className="confirmation-detail">
                <div className="confirmation-detail__icon">
                  <Calendar size={16} />
                </div>
                <div>
                  <label>Check-In</label>
                  <strong>{formatDate(booking.checkIn)}</strong>
                  <p>From 2:00 PM</p>
                </div>
              </div>

              <div className="confirmation-detail">
                <div className="confirmation-detail__icon">
                  <Calendar size={16} />
                </div>
                <div>
                  <label>Check-Out</label>
                  <strong>{formatDate(booking.checkOut)}</strong>
                  <p>By 11:00 AM</p>
                </div>
              </div>

              <div className="confirmation-detail">
                <div className="confirmation-detail__icon">
                  <BedDouble size={16} />
                </div>
                <div>
                  <label>Room</label>
                  <strong>{booking.roomName}</strong>
                  <p>{booking.nights} night{booking.nights > 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="confirmation-detail">
                <div className="confirmation-detail__icon">
                  <Users size={16} />
                </div>
                <div>
                  <label>Guests</label>
                  <strong>{booking.guests} guest{booking.guests > 1 ? 's' : ''}</strong>
                  <p>{booking.roomType} room</p>
                </div>
              </div>
            </div>

            {/* Payment summary */}
            <div className="confirmation-payment">
              <h3>Payment Summary</h3>
              <div className="confirmation-payment__rows">
                <div className="confirmation-payment__row">
                  <span>${booking.pricePerNight}/night × {booking.nights} nights</span>
                  <span>${booking.totalAmount.toLocaleString()}</span>
                </div>
                <div className="confirmation-payment__row">
                  <span>Taxes & fees (10%)</span>
                  <span>${booking.taxes.toLocaleString()}</span>
                </div>
                <div className="confirmation-payment__row confirmation-payment__row--total">
                  <strong>Total Amount Due</strong>
                  <strong>${(booking.totalAmount + booking.taxes).toLocaleString()}</strong>
                </div>
                <div className="confirmation-payment__row confirmation-payment__note">
                  <span>💳 Payment method</span>
                  <span>{booking.paymentMethod}</span>
                </div>
              </div>
            </div>

            {/* Important info */}
            <div className="confirmation-notice">
              <h4>Important Information</h4>
              <ul>
                <li>Payment is due at the hotel on arrival — no online payment required.</li>
                <li>Present your booking reference <strong>{booking.id}</strong> at the front desk.</li>
                <li>Free cancellation is available up to 48 hours before check-in.</li>
                <li>Check-in is from 2:00 PM · Check-out is by 11:00 AM.</li>
                <li>Contact the hotel directly for early check-in or special requests.</li>
              </ul>
            </div>

            {/* Actions */}
            <div className="confirmation-actions">
              <button className="confirmation-print" onClick={() => window.print()}>
                <Printer size={15} /> Print / Save PDF
              </button>
              <Link to="/bookings" className="btn-accent confirmation-bookings-btn">
                View My Bookings
              </Link>
              <Link to="/" className="confirmation-home-btn">
                <ArrowLeft size={14} /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}