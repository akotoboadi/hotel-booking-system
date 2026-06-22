import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { bookingsAPI } from '../services/api'
import {
  Calendar, MapPin, BedDouble, Clock,
  X, ChevronDown, ChevronUp, CheckCircle2, Loader
} from 'lucide-react'
import './Booking.css'

const STATUS_CONFIG = {
  confirmed:   { label: 'Confirmed',  color: 'success' },
  completed:   { label: 'Completed',  color: 'info'    },
  cancelled:   { label: 'Cancelled',  color: 'danger'  },
  pending:     { label: 'Pending',    color: 'warning' },
  checked_in:  { label: 'Checked In', color: 'info'    },
}

const TABS = ['All', 'Confirmed', 'Completed', 'Cancelled']

export default function Booking() {
  const { user }   = useAuth()
  const navigate   = useNavigate()

  const [bookings, setBookings]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState('')
  const [activeTab, setTab]               = useState('All')
  const [expanded, setExpanded]           = useState(null)
  const [cancelTarget, setCancel]         = useState(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(null)

  useEffect(() => {
    if (!user) return
    const fetchBookings = async () => {
      try {
        const res = await bookingsAPI.getMyBookings()
        setBookings(res.data.data.items || [])
      } catch {
        setError('Failed to load bookings.')
      } finally {
        setLoading(false)
      }
    }
    fetchBookings()
  }, [user])

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

  const handleCancel = async (bookingId) => {
    setCancelLoading(true)
    try {
      await bookingsAPI.cancel(bookingId)
      setBookings(prev => prev.map(b =>
        b.id === bookingId ? { ...b, status: 'cancelled' } : b
      ))
      setCancelSuccess(bookingId)
      setCancel(null)
      setTimeout(() => setCancelSuccess(null), 3000)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking.')
    } finally {
      setCancelLoading(false)
    }
  }

  // const canCancel = (booking) => {
  //   if (booking.status !== 'confirmed') return false
  //   const checkIn    = new Date(booking.check_in)
  //   const now        = new Date()
  //   const daysUntil  = (checkIn - now) / (1000 * 60 * 60 * 24)
  //   return daysUntil > 2
  // }

  const canCancel = (booking) => {
  if (booking.status !== 'confirmed') return false
  // Parse date as local time by replacing dashes to avoid UTC offset issue
  const checkInStr = booking.check_in || ''
  const [year, month, day] = checkInStr.split('-').map(Number)
  if (!year) return false
  const checkIn   = new Date(year, month - 1, day) // local time
  const now       = new Date()
  const daysUntil = (checkIn - now) / (1000 * 60 * 60 * 24)
  return daysUntil > 0 // allow cancel as long as check-in hasn't passed
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

        {cancelSuccess && (
          <div className="bookings-toast">
            ✓ Booking has been cancelled successfully.
          </div>
        )}

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

        {loading ? (
          <div style={{ textAlign:'center', padding:'80px 0' }}>
            <Loader size={32} className="spin" style={{ color:'var(--accent)' }} />
          </div>
        ) : error ? (
          <div style={{ textAlign:'center', padding:'60px', color:'var(--gray-400)' }}>{error}</div>
        ) : filtered.length === 0 ? (
          <div className="bookings-empty">
            <Calendar size={48} />
            <h3>No {activeTab !== 'All' ? activeTab.toLowerCase() : ''} bookings</h3>
            <p>{activeTab === 'All' ? "You haven't made any bookings yet." : `No ${activeTab.toLowerCase()} bookings.`}</p>
            <Link to="/search" className="btn-accent">Explore Hotels</Link>
          </div>
        ) : (
          <div className="bookings-list">
            {filtered.map(b => {
              const cfg        = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending
              const isOpen     = expanded === b.id
              const cancellable = canCancel(b)
              const image      = b.hotel_image || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600`

              return (
                <div key={b.id} className={`booking-card booking-card--${b.status}`}>
                  <div className="booking-card__top">
                    <div className="booking-card__img">
                      <img src={image} alt={b.hotel_name} />
                    </div>
                    <div className="booking-card__info">
                      <div className="booking-card__info-top">
                        <div>
                          <p className="booking-card__id">{b.booking_ref}</p>
                          <h3 className="booking-card__hotel">{b.hotel_name}</h3>
                          <p className="booking-card__location">
                            <MapPin size={12} /> {b.hotel_location}
                          </p>
                        </div>
                        <span className={`booking-status booking-status--${cfg.color}`}>
                          {cfg.label}
                        </span>
                      </div>

                      <div className="booking-card__meta">
                        <div className="booking-meta-item">
                          <BedDouble size={13} />
                          <span>{b.room_name} · {b.room_type}</span>
                        </div>
                        <div className="booking-meta-item">
                          <Calendar size={13} />
                          <span>{formatDate(b.check_in)} → {formatDate(b.check_out)}</span>
                        </div>
                        <div className="booking-meta-item">
                          <Clock size={13} />
                          <span>{b.nights} night{b.nights > 1 ? 's' : ''} · {b.guests} guest{b.guests > 1 ? 's' : ''}</span>
                        </div>
                      </div>

                      <div className="booking-card__footer">
                        <div className="booking-card__amount">
                          <strong>${(b.total_amount || 0).toLocaleString()}</strong>
                          <span>+ ${(b.taxes || 0).toLocaleString()} taxes · {b.payment_method}</span>
                        </div>
                        <div className="booking-card__actions">
                          {b.status === 'confirmed' && (
                            cancellable ? (
                              <button
                                className="booking-btn booking-btn--cancel"
                                onClick={() => setCancel(b)}
                              >
                                Cancel
                              </button>
                            ) : (
                              <span className="booking-no-cancel">Check-in passed</span>
                            )
                          )}
                          <button
                            className="booking-btn booking-btn--detail"
                            onClick={() => setExpanded(isOpen ? null : b.id)}
                          >
                            {isOpen
                              ? <><ChevronUp size={14} /> Less</>
                              : <><ChevronDown size={14} /> Details</>
                            }
                          </button>
                        </div>
                        {/* <div className="booking-card__actions">
                          {b.status === 'confirmed' && cancellable && (
                            <button className="booking-btn booking-btn--cancel" onClick={() => setCancel(b)}>
                              Cancel
                            </button>
                          )}
                          {b.status === 'confirmed' && !cancellable && (
                            <span className="booking-no-cancel">Non-refundable</span>
                          )}
                          <button
                            className="booking-btn booking-btn--detail"
                            onClick={() => setExpanded(isOpen ? null : b.id)}
                          >
                            {isOpen ? <><ChevronUp size={14} /> Less</> : <><ChevronDown size={14} /> Details</>}
                          </button>
                        </div> */}
                      </div>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="booking-card__expanded">
                      <div className="booking-detail-grid">
                        <div className="booking-detail-section">
                          <h4>Stay Details</h4>
                          <div className="booking-detail-rows">
                            <div className="booking-detail-row">
                              <span>Check-In</span>
                              <strong>{formatDate(b.check_in)} (from 2:00 PM)</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Check-Out</span>
                              <strong>{formatDate(b.check_out)} (by 11:00 AM)</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Room</span>
                              <strong>{b.room_name}</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Guests</span>
                              <strong>{b.guests}</strong>
                            </div>
                          </div>
                        </div>
                        <div className="booking-detail-section">
                          <h4>Payment</h4>
                          <div className="booking-detail-rows">
                            <div className="booking-detail-row">
                              <span>${b.price_per_night}/night × {b.nights} nights</span>
                              <strong>${(b.total_amount || 0).toLocaleString()}</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Taxes</span>
                              <strong>${(b.taxes || 0).toLocaleString()}</strong>
                            </div>
                            <div className="booking-detail-row booking-detail-row--total">
                              <span>Total</span>
                              <strong>${((b.total_amount || 0) + (b.taxes || 0)).toLocaleString()}</strong>
                            </div>
                            <div className="booking-detail-row">
                              <span>Method</span>
                              <strong>{b.payment_method}</strong>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="booking-detail-note">
                        <strong>Important:</strong> Present booking reference <code>{b.booking_ref}</code> at check-in.
                        {cancellable && b.status === 'confirmed' && ' Free cancellation available until 48 hours before check-in.'}
                      </div>
                      {b.status === 'confirmed' && (
                        <div className="booking-detail-actions">
                          <Link to={`/hotel/${b.hotel_id}`} className="booking-btn booking-btn--view">
                            View Hotel
                          </Link>
                          {cancellable && (
                            <button className="booking-btn booking-btn--cancel" onClick={() => setCancel(b)}>
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

      {/* Cancel modal */}
      {cancelTarget && (
        <div className="cancel-overlay" onClick={() => setCancel(null)}>
          <div className="cancel-modal" onClick={e => e.stopPropagation()}>
            <div className="cancel-modal__icon"><X size={26} /></div>
            <h3>Cancel Reservation?</h3>
            <p>
              Cancel your stay at <strong>{cancelTarget.hotel_name}</strong> on{' '}
              <strong>{formatDate(cancelTarget.check_in)}</strong>? This cannot be undone.
            </p>
            <div className="cancel-modal__info">
              <strong>Booking:</strong> {cancelTarget.booking_ref}<br />
              <strong>Room:</strong> {cancelTarget.room_name}<br />
              <strong>Refund policy:</strong> Free cancellation (no charge)
            </div>
            <div className="cancel-modal__actions">
              <button className="booking-btn booking-btn--detail" onClick={() => setCancel(null)}>
                Keep Booking
              </button>
              <button
                className="booking-btn booking-btn--cancel"
                disabled={cancelLoading}
                onClick={() => handleCancel(cancelTarget.id)}
              >
                {cancelLoading ? 'Cancelling...' : 'Yes, Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}