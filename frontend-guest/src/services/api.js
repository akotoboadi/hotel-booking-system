import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ── Request interceptor — attach JWT token to every request ──
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('guest_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor — handle token expiry globally ──
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code
      if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN') {
        localStorage.removeItem('guest_token')
        localStorage.removeItem('guest_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  register: (data)        => api.post('/api/auth/register', data),
  login:    (data)        => api.post('/api/auth/login', data),
  google:   (token)       => api.post('/api/auth/google', { token }),
  getMe:    ()            => api.get('/api/auth/me'),
  updateProfile: (data)   => api.put('/api/auth/profile', data),
  logout:   ()            => api.post('/api/auth/logout'),
}

// ── Hotels ───────────────────────────────────────────────────
export const hotelsAPI = {
  getAll:   (params)      => api.get('/api/hotels/', { params }),
  getOne:   (id)          => api.get(`/api/hotels/${id}`),
  search:   (params)      => api.get('/api/hotels/search', { params }),
}

// ── Rooms ────────────────────────────────────────────────────
export const roomsAPI = {
  getByHotel: (hotelId)   => api.get(`/api/rooms/hotel/${hotelId}`),
  getOne:     (roomId)    => api.get(`/api/rooms/${roomId}`),
}

// ── Bookings ─────────────────────────────────────────────────
export const bookingsAPI = {
  create:   (data)        => api.post('/api/bookings/', data),
  getMyBookings: (params) => api.get('/api/bookings/my', { params }),
  getOne:   (id)          => api.get(`/api/bookings/${id}`),
  cancel:   (id)          => api.patch(`/api/bookings/${id}/cancel`),
}

export default api