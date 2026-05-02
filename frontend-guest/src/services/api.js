import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// Hotels
export const getHotels = (params) => api.get('/hotels', { params })
export const getHotel = (id) => api.get(`/hotels/${id}`)
export const searchHotels = (params) => api.get('/hotels/search', { params })

// Rooms
export const getRooms = (hotelId) => api.get(`/hotels/${hotelId}/rooms`)
export const getRoom = (roomId) => api.get(`/rooms/${roomId}`)

// Bookings
export const createBooking = (data) => api.post('/bookings', data)
export const getBooking = (id) => api.get(`/bookings/${id}`)
export const getUserBookings = () => api.get('/bookings/my')
export const cancelBooking = (id) => api.delete(`/bookings/${id}`)

// Auth
export const loginUser = (data) => api.post('/auth/login', data)
export const registerUser = (data) => api.post('/auth/register', data)
export const getProfile = () => api.get('/auth/profile')

export default api