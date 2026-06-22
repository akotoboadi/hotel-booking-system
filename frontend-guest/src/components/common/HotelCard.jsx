import { Link } from 'react-router-dom'
import { Star, MapPin, Wifi, Car, Coffee } from 'lucide-react'
import './HotelCard.css'

const amenityIcons = { WiFi: Wifi, Parking: Car, Breakfast: Coffee }

export default function HotelCard({ hotel }) {
  const {
    id, name, location, type,
    rating, images, amenities = [],
  } = hotel

  // Get the lowest room price from rooms array if available
  const minPrice = hotel.rooms?.length
    ? Math.min(...hotel.rooms.map(r => r.price))
    : hotel.price || null

  const imageUrl = images?.[0]
    || `https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&sig=${id}`

  return (
    <Link to={`/hotel/${id}`} className="hotel-card">
      <div className="hotel-card__image-wrap">
        <img src={imageUrl} alt={name} className="hotel-card__image" />
        <span className="hotel-card__type">{type || 'Hotel'}</span>
      </div>
      <div className="hotel-card__body">
        <div className="hotel-card__top">
          <div>
            <h3 className="hotel-card__name">{name}</h3>
            <div className="hotel-card__location">
              <MapPin size={12} /><span>{location}</span>
            </div>
          </div>
          {rating && (
            <div className="hotel-card__rating">
              <Star size={13} fill="#F9A825" color="#F9A825" />
              <span>{typeof rating === 'number' ? rating.toFixed(1) : rating}</span>
            </div>
          )}
        </div>

        {amenities.length > 0 && (
          <div className="hotel-card__amenities">
            {amenities.slice(0, 3).map(a => {
              const Icon = amenityIcons[a] || Wifi
              return (
                <span key={a} className="hotel-card__amenity">
                  <Icon size={12} />{a}
                </span>
              )
            })}
          </div>
        )}

        <div className="hotel-card__footer">
          <div className="hotel-card__price">
            {minPrice ? (
              <>
                <span className="hotel-card__price-amount">${minPrice}</span>
                <span className="hotel-card__price-label"> / night</span>
              </>
            ) : (
              <span className="hotel-card__price-label">Contact for price</span>
            )}
          </div>
          <span className="hotel-card__cta">View Details →</span>
        </div>
      </div>
    </Link>
  )
}