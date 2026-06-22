import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser  = localStorage.getItem('manager_user')
    const storedToken = localStorage.getItem('manager_token')
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      authAPI.getMe()
        .then(res => {
          const u = res.data.data
          if (u.role !== 'manager') {
            localStorage.removeItem('manager_user')
            localStorage.removeItem('manager_token')
            setUser(null)
          } else {
            setUser(u)
          }
        })
        .catch(() => {
          localStorage.removeItem('manager_user')
          localStorage.removeItem('manager_token')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = (userData, token) => {
    localStorage.setItem('manager_user',  JSON.stringify(userData))
    localStorage.setItem('manager_token', token)
    setUser(userData)
  }

  const logout = async () => {
    try { await authAPI.logout() } catch {}
    localStorage.removeItem('manager_user')
    localStorage.removeItem('manager_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)