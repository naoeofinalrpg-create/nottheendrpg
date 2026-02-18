import { createContext, useContext, useState } from 'react'

const AuthContext = createContext()

const MASTER_PASSWORD = 'DnD7MarPkm'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem('rpg-user')
    return saved ? JSON.parse(saved) : null
  })

  const loginAsMaster = (password) => {
    if (password === MASTER_PASSWORD) {
      const userData = { role: 'master', name: 'Mestre' }
      setUser(userData)
      sessionStorage.setItem('rpg-user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const loginAsPlayer = (name, password) => {
    if (password === MASTER_PASSWORD && name.trim()) {
      const userData = { role: 'player', name: name.trim(), isNew: false }
      setUser(userData)
      sessionStorage.setItem('rpg-user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const loginAsNewPlayer = (name, password) => {
    if (password === MASTER_PASSWORD && name.trim()) {
      const userData = { role: 'player', name: name.trim(), isNew: true }
      setUser(userData)
      sessionStorage.setItem('rpg-user', JSON.stringify(userData))
      return true
    }
    return false
  }

  const logout = () => {
    setUser(null)
    sessionStorage.removeItem('rpg-user')
  }

  return (
    <AuthContext.Provider value={{ user, loginAsMaster, loginAsPlayer, loginAsNewPlayer, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
