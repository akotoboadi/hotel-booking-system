import axios from 'axios'
import { API_BASE_URL } from '../config/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token')
      localStorage.removeItem('admin_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ─────────────────────────────────────────────────────
export const authAPI = {
  login:   (data) => api.post('/api/auth/login', data),
  getMe:   ()     => api.get('/api/auth/me'),
  logout:  ()     => api.post('/api/auth/logout'),
}

// ── Hotels ───────────────────────────────────────────────────
export const hotelsAPI = {
  getAll: (params) => api.get('/api/hotels/', { params }),
  getOne:          (id)     => api.get(`/api/hotels/${id}`),
  create:          (data)   => api.post('/api/hotels/', data),
  update:          (id, data) => api.put(`/api/hotels/${id}`, data),
  delete:          (id)     => api.delete(`/api/hotels/${id}`),
  assignManager:   (id, managerId) => api.post(`/api/hotels/${id}/assign-manager`, { manager_id: managerId }),
}

// ── Rooms ────────────────────────────────────────────────────
export const roomsAPI = {
  getByHotel: (hotelId) => api.get(`/api/rooms/hotel/${hotelId}`),
  getOne:     (roomId)  => api.get(`/api/rooms/${roomId}`),
}

// ── Staff ────────────────────────────────────────────────────
export const staffAPI = {
  getByHotel:   (hotelId) => api.get(`/api/staff/hotel/${hotelId}`),
  create:       (hotelId, data) => api.post(`/api/staff/hotel/${hotelId}`, data),
  toggleStatus: (staffId) => api.patch(`/api/staff/${staffId}/status`),
  delete:       (staffId) => api.delete(`/api/staff/${staffId}`),
}

// ── Bookings ─────────────────────────────────────────────────
export const bookingsAPI = {
  getByHotel: (hotelId, params) => api.get(`/api/bookings/hotel/${hotelId}`, { params }),
  getOne:     (id)              => api.get(`/api/bookings/${id}`),
}

// ── Dashboard ────────────────────────────────────────────────
export const dashboardAPI = {
  getAdmin: () => api.get('/api/dashboard/admin'),
}

export default api