import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Calendar, MapPin, BedDouble, Clock,
  X, ChevronDown, ChevronUp, CheckCircle2
} from 'lucide-react'
import './Booking.css'

// Mock bookings — will be replaced by API: getUserBookings()
const MOCK_BOOKINGS = [
  {
    id: 'AK-2025-001',
    hotelId: 1,
    hotelName: 'The Grand Meridian',
    hotelLocation: 'Paris, France',
    hotelImage: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600',
    roomName: 'Superior Suite',
    roomType: 'Suite',
    checkIn: '2025-08-10',
    checkOut: '2025-08-13',
    nights: 3,
    guests: 2,
    pricePerNight: 520,
    totalAmount: 1560,
    taxes: 156,
    paymentMethod: 'Pay at Hotel',
    status: 'confirmed',
    bookedOn: '2025-07-01',
  },
  {
    id: 'AK-2025-002',
    hotelId: 2,
    hotelName: 'Azura Beach Resort',
    hotelLocation: 'Maldives',
    hotelImage: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600',
    roomName: 'Overwater Bungalow',
    roomType: 'Villa',
    checkIn: '2025-09-05',
    checkOut: '2025-09-12',
    nights: 7,
    guests: 2,
    pricePerNight: 1100,
    totalAmount: 7700,
    taxes: 770,
    paymentMethod: 'Pay at Hotel',
    status: 'confirmed',
    bookedOn: '2025-07-03',
  },
  {
    id: 'AK-2025-003',
    hotelId: 3,
    hotelName: 'The Vine Boutique',
    hotelLocation: 'Tuscany, Italy',
    hotelImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600',
    roomName: 'Garden Room',
    roomType: 'Standard',
    checkIn: '2025-06-15',
    checkOut: '2025-06-18',
    nights: 3,
    guests: 2,
    pricePerNight: 220,
    totalAmount: 660,
    taxes: 66,
    paymentMethod: 'Pay at Hotel',
    status: 'completed',
    bookedOn: '2025-05-20',
  },
  {
    id: 'AK-2025-004',
    hotelId: 6,
    hotelName: 'Alpine Chalet Zermatt',
    hotelLocation: 'Switzerland',
    hotelImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600',
    roomName: 'Mountain Room',
    roomType: 'Deluxe',
    checkIn: '2025-07-20',
    checkOut: '2025-07-23',
    nights: 3,
    guests: 2,
    pricePerNight: 520,
    totalAmount: 1560,
    taxes: 156,
    paymentMethod: 'Pay at Hotel',
    status: 'cancelled',
    bookedOn: '2025-06-10',
  },
]

const STATUS_CONFIG = {
  confirmed:  { label: 'Confirmed',  color: 'success', icon: CheckCircle2 },
  completed:  { label: 'Completed',  color: 'info',    icon: CheckCircle2 },
  cancelled:  { label: 'Cancelled',  color: 'danger',  icon: X },
  pending:    { label: 'Pending',    color: 'warning', icon: Clock },
}

const TABS = ['All', 'Confirmed', 'Completed', 'Cancelled']

export default function Booking() {
  const { user } = useAuth()
  const navigate  = useNavigate()

  const [bookings, setBookings]   = useState(MOCK_BOOKINGS)
  const [activeTab, setTab]       = useState('All')
  const [expanded, setExpanded]   = useState(null)
  const [cancelTarget, setCancel] = useState(null)
  const [cancelSuccess, setCancelSuccess] = useState(null)

  if (!user) {
    return (
      <div className="bookings-redirect">
        <div className="bookings-redirect__card">
          <Calendar size={40} />
          <h2>Sign in to view your bookings</h2>
          <p>You need to be signed in to see your reservation history.</p>
          <Link to="/login" className="btn-accent">Sign In</Link>
        </div>
      </div>
    )
  }

  const filtered = bookings.filter(b => {
    if (activeTab === 'All') return true
    return b.status === activeTab.toLowerCase()
  })

  const handleCancel = (bookingId) => {
    setBookings(prev =>
      prev.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
    )
    setCancelSuccess(bookingId)
    setCancel(null)
    setTimeout(() => setCancelSuccess(null), 3000)
  }

  const canCancel = (booking) => {
    if (booking.status !== 'confirmed') return false
    const checkIn = new Date(booking.checkIn)
    const now     = new Date()
    const daysUntil = (checkIn - now) / (1000 * 60 * 60 * 24)
    return daysUntil > 2 // free cancellation if more than 48 hours away
  }

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric'
    })

  const counts = {
    All:       bookings.length,
    Confirmed: bookings.filter(b => b.status === 'confirmed').length,
    Completed: bookings.filter(b => b.status === 'completed').length,
    Cancelled: bookings.filter(b => b.status === 'cancelled').length,
  }

  return (
    <div className="bookings-page-guest">
      <div className="container">
        <div className="bookings-header">
          <div>
            <h1>My Bookings</h1>
            <p>Manage and track all your reservations</p>
          </div>
          <Link to="/search" className="btn-accent">+ New Booking</Link>
        </div>

        {/* Success toast */}
        {cancelSuccess && (
          <div className="bookings-toast">
            ✓ Booking {cancelSuccess} has been cancelled successfully.
          </div>
        )}

        {/* Tabs */}
        <div className="bookings-tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`bookings-tab ${activeTab === tab ? 'bookings-tab--active' : ''}`}
              onClick={() => setTab(tab)}
            >
              {tab}
              <span className="bookings-tab__count">{counts[tab]}</span>
            </button>
          ))}
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bookings-empty">
            <Calendar size={48} />
            <h3>No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings</h3>
            <p>
              {activeTab === 'All'
                ? "You haven't made any bookings yet."
                : `You have no ${activeTab.toLowerCase()} bookings.`
              }
            </p>
            <Link to="/search" className="btn-accent">Explore Hotels</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(b => {
              const cfg  = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
              const isOpen = expanded === b.id
              const cancellable = canCancel(b)

              return (
                <div key={b.id} className={`booking-card booking-card--${b.status}`}>
                  {/* Card top */}
                  <div className="booking-card__top">
                    <div className="booking-card__img">
                      <img src={b.hotelImage} alt={b.hotelName} />
                    </div>

                    <div className="booking-card__info">
                      <div className="booking-card__info-top">
                        <div>
                          <p className="booking-card__id">{b.id}</p>
                          <h3 className="booking-card__hotel">{b.hotelName}</h3>
                          <p className="booking-card__location">
                            <MapPin size={12} /> {b.hotelLocation}
                          </p>
                        </div>
                        <span className={`booking-status booking-status--${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="booking-card__meta">
                        <div className="booking-meta-item">
                          <BedDouble size={13} />
                          <span>{b.roomName} · {b.roomType}</span>
                        </div>
                        <div className="booking-meta-item">
                          <Calendar size={13} />
                          <span>{formatDate(b.checkIn)} → {formatDate(b.checkOut)}</span>
                        </div>
                        <div className="booking-meta-item">
                          <Clock size={13} />
                          <span>{b.nights} night{b.nights > 1 ? 's' : ''} · {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="booking-card__footer">
                        <div className="booking-card__amount">
                          <strong>${b.totalAmount.toLocaleString()}</strong>
                          <span>+ ${b.taxes} taxes · {b.paymentMethod}</span>
                        </div>
                        <div className="booking-card__actions">
                          {b.status === 'confirmed' && cancellable && (
                            <button
                              className="booking-btn booking-btn--cancel"
                              onClick={() => setCancel(b)}
                            >
                              Cancel
                            </button>
                          )}
                          {b.status === 'confirmed' && !cancellable && (
                            <span className="booking-no-cancel">
                              Non-refundable
                            </span>
                          )}
                          <button
                            className="booking-btn booking-btn--detail"
                            onClick={() => setExpanded(isOpen ? null : b.id)}
                          >
                            {isOpen ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> Details</>}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isOpen && (
                    <div className="booking-card__expanded">
                      <div className="booking-detail-grid">
                        <div className="booking-detail-section">
                          <h4>Stay Details</h4>
                          <div className="booking-detail-rows">
                            <div className="booking-detail-row">
                              <span>Check-In</span>
                              <strong>{formatDate(b.checkIn)} (from 2:00 PM)</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Check-Out</span>
                              <strong>{formatDate(b.checkOut)} (by 11:00 AM)</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Guests</span>
                              <strong>{b.guests} guest{b.guests > 1 ? 's' : ''}</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Room</span>
                              <strong>{b.roomName}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="booking-detail-section">
                          <h4>Payment Breakdown</h4>
                          <div className="booking-detail-rows">
                            <div className="booking-detail-row">
                              <span>${b.pricePerNight}/night × {b.nights} nights</span>
                              <strong>${b.totalAmount.toLocaleString()}</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Taxes & fees (10%)</span>
                              <strong>${b.taxes.toLocaleString()}</strong>
                            </div>
                            <div className="booking-detail-row booking-detail-row--total">
                              <span>Total</span>
                              <strong>${(b.totalAmount + b.taxes).toLocaleString()}</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Payment method</span>
                              <strong>{b.paymentMethod}</strong>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="booking-detail-note">
                        <strong>Important:</strong> Payment is due at the hotel on arrival.
                        Please present this booking reference: <code>{b.id}</code> at check-in.
                        {cancellable && b.status === 'confirmed' && (
                          <> Free cancellation available until 48 hours before check-in.</>
                        )}
                      </div>

                      {b.status === 'confirmed' && (
                        <div className="booking-detail-actions">
                          <Link
                            to={`/hotel/${b.hotelId}`}
                            className="booking-btn booking-btn--view"
                          >
                            View Hotel
                          </Link>
                          {cancellable && (
                            <button
                              className="booking-btn booking-btn--cancel"
                              onClick={() => setCancel(b)}
                            >
                              Cancel Reservation
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Cancel confirmation modal */}
      {cancelTarget && (
        <div className="cancel-overlay" onClick={() => setCancel(null)}>
          <div className="cancel-modal" onClick={e => e.stopPropagation()}>
            <div className="cancel-modal__icon">
              <X size={26} />
            </div>
            <h3>Cancel Reservation?</h3>
            <p>
              Are you sure you want to cancel your stay at{' '}
              <strong>{cancelTarget.hotelName}</strong> on{' '}
              <strong>{formatDate(cancelTarget.checkIn)}</strong>?
              This action cannot be undone.
            </p>
            <div className="cancel-modal__info">
              <strong>Booking:</strong> {cancelTarget.id}<br />
              <strong>Room:</strong> {cancelTarget.roomName}<br />
              <strong>Refund policy:</strong> Free cancellation (no charge applied)
            </div>
            <div className="cancel-modal__actions">
              <button
                className="booking-btn booking-btn--detail"
                onClick={() => setCancel(null)}
              >
                Keep Booking
              </button>
              <button
                className="booking-btn booking-btn--cancel"
                onClick={() => handleCancel(cancelTarget.id)}
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}