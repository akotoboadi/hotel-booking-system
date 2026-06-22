import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser  = localStorage.getItem('admin_user')
    const storedToken = localStorage.getItem('admin_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      authAPI.getMe()
        .then(res => {
          const u = res.data.data
          if (u.role !== 'admin') {
            localStorage.removeItem('admin_user')
            localStorage.removeItem('admin_token')
            setUser(null)
          } else {
            setUser(u)
          }
        })
        .catch(() => {
          localStorage.removeItem('admin_user')
          localStorage.removeItem('admin_token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('admin_user',  JSON.stringify(userData))
    localStorage.setItem('admin_token', token)
    setUser(userData)
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('admin_user')
    localStorage.removeItem('admin_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)