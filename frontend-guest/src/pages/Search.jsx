import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import HotelCard from '../components/common/HotelCard'
import './Search.css'

const MOCK_HOTELS = [
  { id: 1, name: 'The Grand Meridian', location: 'Paris, France', price: 420, rating: 4.9, reviewCount: 312, type: 'Luxury', amenities: ['WiFi', 'Parking', 'Breakfast'], images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'] },
  { id: 2, name: 'Azura Beach Resort', location: 'Maldives', price: 890, rating: 4.8, reviewCount: 198, type: 'Resort', amenities: ['WiFi', 'Breakfast'], images: ['https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800'] },
  { id: 3, name: 'The Vine Boutique', location: 'Tuscany, Italy', price: 280, rating: 4.7, reviewCount: 445, type: 'Boutique', amenities: ['WiFi', 'Parking'], images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'] },
  { id: 4, name: 'Urban Loft Tokyo', location: 'Tokyo, Japan', price: 195, rating: 4.6, reviewCount: 621, type: 'Boutique', amenities: ['WiFi'], images: ['https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'] },
  { id: 5, name: 'Sahara Dunes Camp', location: 'Morocco', price: 340, rating: 4.9, reviewCount: 87, type: 'Villa', amenities: ['Breakfast'], images: ['https://images.unsplash.com/photo-1537572975-f98c9fb6fded?w=800'] },
  { id: 6, name: 'Alpine Chalet Zermatt', location: 'Switzerland', price: 620, rating: 4.8, reviewCount: 203, type: 'Luxury', amenities: ['WiFi', 'Parking', 'Breakfast'], images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800'] },
]

const TYPES = ['All', 'Luxury', 'Resort', 'Boutique', 'Villa']

export default function Search() {
  const [params] = useSearchParams()
  const [hotels, setHotels] = useState(MOCK_HOTELS)
  const [activeType, setActiveType] = useState(params.get('type') || 'All')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const [sortBy, setSortBy] = useState('recommended')
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    let filtered = MOCK_HOTELS
    if (activeType !== 'All') {
      filtered = filtered.filter(h => h.type.toLowerCase() === activeType.toLowerCase())
    }
    filtered = filtered.filter(h => h.price >= priceRange[0] && h.price <= priceRange[1])
    if (sortBy === 'price-asc') filtered.sort((a,b) => a.price - b.price)
    if (sortBy === 'price-desc') filtered.sort((a,b) => b.price - a.price)
    if (sortBy === 'rating') filtered.sort((a,b) => b.rating - a.rating)
    setHotels(filtered)
  }, [activeType, priceRange, sortBy])

  return (
    <div className="search-page">
      <div className="search-page__header">
        <div className="container">
          <h1>Explore Hotels</h1>
          <p>{hotels.length} properties available</p>

          <div className="search-page__filters">
            <div className="search-page__types">
              {TYPES.map(t => (
                <button
                  key={t}
                  className={`type-btn ${activeType === t ? 'type-btn--active' : ''}`}
                  onClick={() => setActiveType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="search-page__controls">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="sort-select">
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <button className="filter-btn" onClick={() => setFiltersOpen(!filtersOpen)}>
                <SlidersHorizontal size={16} />
                Filters
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="search-page__filter-panel">
              <div className="filter-group">
                <label>Price Range: ${priceRange[0]} – ${priceRange[1]}</label>
                <input
                  type="range"
                  min={0} max={1000}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([priceRange[0], +e.target.value])}
                />
              </div>
              <button className="filter-clear" onClick={() => { setPriceRange([0,1000]); setActiveType('All'); }}>
                <X size={14} /> Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container">
        {hotels.length > 0 ? (
          <div className="search-page__grid">
            {hotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
        ) : (
          <div className="search-page__empty">
            <p>No hotels match your filters.</p>
            <button className="btn-outline" onClick={() => { setActiveType('All'); setPriceRange([0,1000]); }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}