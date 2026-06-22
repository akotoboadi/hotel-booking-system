import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('manager_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('manager_token')
      localStorage.removeItem('manager_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login:         (data) => api.post('/api/auth/login', data),
  getMe:         ()     => api.get('/api/auth/me'),
  updateProfile: (data) => api.put('/api/auth/profile', data),
  logout:        ()     => api.post('/api/auth/logout'),
}

// ── Rooms ────────────────────────────────────────────────────
export const roomsAPI = {
  getByHotel:   (hotelId)        => api.get(`/api/rooms/hotel/${hotelId}`),
  getOne:       (roomId)         => api.get(`/api/rooms/${roomId}`),
  create:       (hotelId, data)  => api.post(`/api/rooms/hotel/${hotelId}`, data),
  update:       (roomId, data)   => api.put(`/api/rooms/${roomId}`, data),
  updateStatus: (roomId, status) => api.patch(`/api/rooms/${roomId}/status`, { status }),
  delete:       (roomId)         => api.delete(`/api/rooms/${roomId}`),
}

// ── Bookings ─────────────────────────────────────────────────
export const bookingsAPI = {
  getByHotel: (hotelId, params) => api.get(`/api/bookings/hotel/${hotelId}`, { params }),
  getToday:   (hotelId)         => api.get(`/api/bookings/hotel/${hotelId}/today`),
  checkIn:    (bookingId)       => api.patch(`/api/bookings/${bookingId}/checkin`),
  checkOut:   (bookingId)       => api.patch(`/api/bookings/${bookingId}/checkout`),
  cancel:     (bookingId)       => api.patch(`/api/bookings/${bookingId}/cancel`),
}

// ── Staff ────────────────────────────────────────────────────
export const staffAPI = {
  getByHotel:   (hotelId)        => api.get(`/api/staff/hotel/${hotelId}`),
  create:       (hotelId, data)  => api.post(`/api/staff/hotel/${hotelId}`, data),
  toggleStatus: (staffId)        => api.patch(`/api/staff/${staffId}/status`),
  delete:       (staffId)        => api.delete(`/api/staff/${staffId}`),
}

// ── Dashboard ────────────────────────────────────────────────
export const dashboardAPI = {
  getHotel: (hotelId) => api.get(`/api/dashboard/hotel/${hotelId}`),
}

export default api