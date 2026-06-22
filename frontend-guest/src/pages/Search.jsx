import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { SlidersHorizontal, X } from 'lucide-react'
import HotelCard from '../components/common/HotelCard'
import { hotelsAPI } from '../services/api'
import './Search.css'

const TYPES = ['All', 'Luxury', 'Resort', 'Boutique', 'Villa', 'Budget', 'Business']

export default function Search() {
  const [params]                      = useSearchParams()
  const [hotels, setHotels]           = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [activeType, setActiveType]   = useState(params.get('type') || 'All')
  const [sortBy, setSortBy]           = useState('recommended')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [maxPrice, setMaxPrice]       = useState(2000)

  const destination = params.get('destination') || ''

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true)
      setError('')
      try {
        const searchParams = {}
        if (destination)              searchParams.destination = destination
        if (activeType !== 'All')     searchParams.type        = activeType
        if (maxPrice < 2000)          searchParams.max_price   = maxPrice

        const res = await hotelsAPI.search(searchParams)
        let results = res.data.data.items || []

        if (sortBy === 'price-asc')  results.sort((a,b) => (a.min_price || 0) - (b.min_price || 0))
        if (sortBy === 'price-desc') results.sort((a,b) => (b.min_price || 0) - (a.min_price || 0))
        if (sortBy === 'rating')     results.sort((a,b) => (b.rating || 0) - (a.rating || 0))

        setHotels(results)
      } catch {
        setError('Failed to load hotels. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    fetchHotels()
  }, [activeType, sortBy, maxPrice, destination])

  return (
    <div className="search-page">
      <div className="search-page__header">
        <div className="container">
          <h1>Explore Hotels</h1>
          <p>
            {loading ? 'Loading...' : `${hotels.length} properties available`}
            {destination && ` in "${destination}"`}
          </p>

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
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="sort-select"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <button className="filter-btn" onClick={() => setFiltersOpen(!filtersOpen)}>
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>
          </div>

          {filtersOpen && (
            <div className="search-page__filter-panel">
              <div className="filter-group">
                <label>Max Price: ${maxPrice}/night</label>
                <input
                  type="range" min={50} max={2000} step={50}
                  value={maxPrice}
                  onChange={e => setMaxPrice(+e.target.value)}
                />
              </div>
              <button
                className="filter-clear"
                onClick={() => { setMaxPrice(2000); setActiveType('All') }}
              >
                <X size={14} /> Clear All
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container">
        {loading ? (
          <div className="hotels-loading" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:28, paddingBottom:80 }}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="hotel-skeleton" style={{ height:340, background:'linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%)',backgroundSize:'200% 100%',borderRadius:12,animation:'shimmer 1.4s infinite' }} />)}
          </div>
        ) : error ? (
          <div style={{ textAlign:'center', padding:'80px 0', color:'var(--gray-400)' }}>
            <p>{error}</p>
            <button className="btn-outline" style={{ marginTop:16 }} onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : hotels.length > 0 ? (
          <div className="search-page__grid">
            {hotels.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />)}
          </div>
        ) : (
          <div className="search-page__empty">
            <p>No hotels match your filters.</p>
            <button className="btn-outline" onClick={() => { setActiveType('All'); setMaxPrice(2000) }}>
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  )
}