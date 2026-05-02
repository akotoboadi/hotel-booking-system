import { Link } from 'react-router-dom'
import { Star, MapPin, Wifi, Car, Coffee } from 'lucide-react'
import './HotelCard.css'

const amenityIcons = { wifi: Wifi, parking: Car, breakfast: Coffee }

export default function HotelCard({ hotel }) {
  const { id, name, location, price, rating, reviewCount, images, amenities = [], type } = hotel

  return (
    <Link to={`/hotel/${id}`} className="hotel-card">
      <div className="hotel-card__image-wrap">
        <img
          src={images?.[0] || `https://source.unsplash.com/800x600/?hotel,luxury&sig=${id}`}
          alt={name}
          className="hotel-card__image"
        />
        <span className="hotel-card__type">{type || 'Hotel'}</span>
      </div>
      <div className="hotel-card__body">
        <div className="hotel-card__top">
          <div>
            <h3 className="hotel-card__name">{name}</h3>
            <div className="hotel-card__location">
              <MapPin size={12} />
              <span>{location}</span>
            </div>
          </div>
          <div className="hotel-card__rating">
            <Star size={13} fill="#F9A825" color="#F9A825" />
            <span>{rating?.toFixed(1) || '4.8'}</span>
            <span className="hotel-card__review-count">({reviewCount || 0})</span>
          </div>
        </div>
        {amenities.length > 0 && (
          <div className="hotel-card__amenities">
            {amenities.slice(0, 3).map((a) => {
              const Icon = amenityIcons[a.toLowerCase()] || Wifi
              return <span key={a} className="hotel-card__amenity"><Icon size={12} />{a}</span>
            })}
          </div>
        )}
        <div className="hotel-card__footer">
          <div className="hotel-card__price">
            <span className="hotel-card__price-amount">${price}</span>
            <span className="hotel-card__price-label"> / night</span>
          </div>
          <span className="hotel-card__cta">View Details →</span>
        </div>
      </div>
    </Link>
  )
}