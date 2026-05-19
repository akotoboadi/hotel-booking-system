import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const stored = localStorage.getItem('admin_user')
    if (stored) setUser(JSON.parse(stored))
  }, [])

  const login  = (u) => { localStorage.setItem('admin_user', JSON.stringify(u)); setUser(u) }
  const logout = ()  => { localStorage.removeItem('admin_user'); setUser(null) }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)