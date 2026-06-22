import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, Calendar, Users, Star, Shield, Clock } from 'lucide-react'
import HotelCard from '../components/common/HotelCard'
import { hotelsAPI } from '../services/api'
import './Home.css'

export default function Home() {
  const navigate = useNavigate()
  const [search, setSearch]     = useState({ destination: '', checkIn: '', checkOut: '', guests: 2 })
  const [hotels, setHotels]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const res = await hotelsAPI.getAll({ per_page: 6 })
        setHotels(res.data.data.items || [])
      } catch {
        setError('Failed to load hotels.')
      } finally {
        setLoading(false)
      }
    }
    fetchHotels()
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams({
      destination: search.destination,
      checkIn:     search.checkIn,
      checkOut:    search.checkOut,
      guests:      search.guests,
    }).toString()
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
          <p className="hero__subtitle">Handpicked hotels, resorts, and boutique experiences.</p>

          <form className="hero__search" onSubmit={handleSearch}>
            <div className="hero__search-group">
              <MapPin size={16} className="hero__search-icon" />
              <input
                type="text"
                placeholder="Where to?"
                value={search.destination}
                onChange={e => setSearch({ ...search, destination: e.target.value })}
              />
            </div>
            <div className="hero__search-divider" />
            <div className="hero__search-group">
              <Calendar size={16} className="hero__search-icon" />
              <input
                type="date"
                value={search.checkIn}
                onChange={e => setSearch({ ...search, checkIn: e.target.value })}
              />
            </div>
            <div className="hero__search-divider" />
            <div className="hero__search-group">
              <Calendar size={16} className="hero__search-icon" />
              <input
                type="date"
                value={search.checkOut}
                onChange={e => setSearch({ ...search, checkOut: e.target.value })}
              />
            </div>
            <div className="hero__search-divider" />
            <div className="hero__search-group">
              <Users size={16} className="hero__search-icon" />
              <select value={search.guests} onChange={e => setSearch({ ...search, guests: e.target.value })}>
                {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} Guest{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <button type="submit" className="hero__search-btn">
              <Search size={18} /><span>Search</span>
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
              <div><strong>Top Rated</strong><p>4.8 average from reviews</p></div>
            </div>
            <div className="trust__item">
              <Shield size={28} />
              <div><strong>Secure Booking</strong><p>SSL encrypted payments</p></div>
            </div>
            <div className="trust__item">
              <Clock size={28} />
              <div><strong>Free Cancellation</strong><p>Up to 48 hours before arrival</p></div>
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

          {loading ? (
            <div className="hotels-loading">
              {[1,2,3,4,5,6].map(i => <div key={i} className="hotel-skeleton" />)}
            </div>
          ) : error ? (
            <div className="hotels-error">
              <p>{error}</p>
              <button className="btn-outline" onClick={() => window.location.reload()}>Retry</button>
            </div>
          ) : hotels.length === 0 ? (
            <div className="hotels-error"><p>No hotels available yet.</p></div>
          ) : (
            <div className="featured__grid">
              {hotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
            </div>
          )}
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
              { label: 'Luxury Hotels', img: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600', type: 'Luxury' },
              { label: 'Beach Resorts', img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600', type: 'Resort' },
              { label: 'Boutique Stays', img: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=600', type: 'Boutique' },
              { label: 'Mountain Villas', img: 'https://images.unsplash.com/photo-1599619351208-3e6c839d6828?w=600', type: 'Villa' },
            ].map(cat => (
              <a key={cat.type} href={`/search?type=${cat.type}`} className="category-card">
                <img src={cat.img} alt={cat.label} />
                <div className="category-card__overlay"><span>{cat.label}</span></div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}