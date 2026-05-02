import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, Users, Star, Shield, Clock } from 'lucide-react'
import HotelCard from '../components/common/HotelCard'
import './Home.css'

const MOCK_FEATURED = [
  { id: 1, name: 'The Grand Meridian', location: 'Paris, France', price: 420, rating: 4.9, reviewCount: 312, type: 'Luxury', amenities: ['WiFi', 'Parking', 'Breakfast'], images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'] },
  { id: 2, name: 'Azura Beach Resort', location: 'Maldives', price: 890, rating: 4.8, reviewCount: 198, type: 'Resort', amenities: ['WiFi', 'Breakfast'], images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'] },
  { id: 3, name: 'The Vine Boutique', location: 'Tuscany, Italy', price: 280, rating: 4.7, reviewCount: 445, type: 'Boutique', amenities: ['WiFi', 'Parking'], images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'] },
  { id: 4, name: 'Urban Loft Tokyo', location: 'Tokyo, Japan', price: 195, rating: 4.6, reviewCount: 621, type: 'Boutique', amenities: ['WiFi'], images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'] },
  { id: 5, name: 'Sahara Dunes Camp', location: 'Morocco', price: 340, rating: 4.9, reviewCount: 87, type: 'Villa', amenities: ['Breakfast'], images: ['https://images.unsplash.com/photo-1537572975-f98c9fb6fded?w=800'] },
  { id: 6, name: 'Alpine Chalet Zermatt', location: 'Switzerland', price: 620, rating: 4.8, reviewCount: 203, type: 'Luxury', amenities: ['WiFi', 'Parking', 'Breakfast'], images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'] },
]

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch] = useState({ destination: '', checkIn: '', checkOut: '', guests: 2 })

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams(search).toString()
    navigate(`/search?${params}`)
  }

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero__bg">
          <img src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1600" alt="hero" />
          <div className="hero__overlay" />
        </div>
        <div className="hero__content">
          <p className="hero__eyebrow">Curated for discerning travelers</p>
          <h1 className="hero__title">Find Your<br />Perfect Stay</h1>
          <p className="hero__subtitle">Handpicked hotels, resorts, and boutique experiences — all in one place.</p>

          <form className="hero__search" onSubmit={handleSearch}>
            <div className="hero__search-group">
              <MapPin size={16} className="hero__search-icon" />
              <input
                type="text"
                placeholder="Where to?"
                value={search.destination}
                onChange={(e) => setSearch({ ...search, destination: e.target.value })}
              />
            </div>
            <div className="hero__search-divider" />
            <div className="hero__search-group">
              <Calendar size={16} className="hero__search-icon" />
              <input
                type="date"
                value={search.checkIn}
                onChange={(e) => setSearch({ ...search, checkIn: e.target.value })}
                placeholder="Check-in"
              />
            </div>
            <div className="hero__search-divider" />
            <div className="hero__search-group">
              <Calendar size={16} className="hero__search-icon" />
              <input
                type="date"
                value={search.checkOut}
                onChange={(e) => setSearch({ ...search, checkOut: e.target.value })}
                placeholder="Check-out"
              />
            </div>
            <div className="hero__search-divider" />
            <div className="hero__search-group">
              <Users size={16} className="hero__search-icon" />
              <select value={search.guests} onChange={(e) => setSearch({ ...search, guests: e.target.value })}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <button type="submit" className="hero__search-btn">
              <Search size={18} />
              <span>Search</span>
            </button>
          </form>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust">
        <div className="container">
          <div className="trust__grid">
            <div className="trust__item">
              <Star size={28} fill="#F9A825" color="#F9A825" />
              <div>
                <strong>Top Rated</strong>
                <p>4.8 average from 50k+ reviews</p>
              </div>
            </div>
            <div className="trust__item">
              <Shield size={28} />
              <div>
                <strong>Secure Booking</strong>
                <p>SSL encrypted payments</p>
              </div>
            </div>
            <div className="trust__item">
              <Clock size={28} />
              <div>
                <strong>Free Cancellation</strong>
                <p>Up to 48 hours before arrival</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <section className="featured">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Editor's Selection</p>
              <h2 className="section-title">Featured Properties</h2>
            </div>
            <a href="/search" className="btn-outline">View All</a>
          </div>
          <div className="featured__grid">
            {MOCK_FEATURED.map(hotel => (
              <HotelCard key={hotel.id} hotel={hotel} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories">
        <div className="container">
          <div className="section-header">
            <div>
              <p className="section-eyebrow">Browse by Type</p>
              <h2 className="section-title">Find Your Style</h2>
            </div>
          </div>
          <div className="categories__grid">
            {[
              { label: 'Luxury Hotels', img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', type: 'luxury' },
              { label: 'Beach Resorts', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', type: 'resort' },
              { label: 'Boutique Stays', img: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600', type: 'boutique' },
              { label: 'Mountain Villas', img: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600', type: 'villa' },
            ].map(cat => (
              <a key={cat.type} href={`/search?type=${cat.type}`} className="category-card">
                <img src={cat.img} alt={cat.label} />
                <div className="category-card__overlay">
                  <span>{cat.label}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}