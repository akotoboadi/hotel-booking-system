import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  // On app load, restore user from localStorage
  useEffect(() => {
    const storedUser  = localStorage.getItem('guest_user')
    const storedToken = localStorage.getItem('guest_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      // Optionally verify token is still valid
      authAPI.getMe()
        .then(res => setUser(res.data.data))
        .catch(() => {
          localStorage.removeItem('guest_user')
          localStorage.removeItem('guest_token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('guest_user',  JSON.stringify(userData))
    localStorage.setItem('guest_token', token)
    setUser(userData)
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('guest_user')
    localStorage.removeItem('guest_token')
    setUser(null)
  }

  const updateUser = (updatedData) => {
    const merged = { ...user, ...updatedData }
    localStorage.setItem('guest_user', JSON.stringify(merged))
    setUser(merged)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)