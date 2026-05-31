import React, { createContext, useContext, useState, useEffect } from 'react'
import Cookies from 'js-cookie'

export type UserRole = 'SUPER_ADMIN' | 'INTAKE_STAFF' | 'QC_INSPECTOR' | 'PPIC_MANAGER' | 'SUPPLIER' | 'DELIVERY_STAFF'

export interface User {
  username: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const savedToken = Cookies.get('token')
    const savedUserStr = Cookies.get('user')
    
    if (savedToken && savedUserStr) {
      try {
        const savedUser = JSON.parse(savedUserStr)
        setToken(savedToken)
        setUser(savedUser)
      } catch (e) {
        Cookies.remove('token')
        Cookies.remove('user')
      }
    }
    setIsLoaded(true)
  }, [])

  const login = (newToken: string, newUser: User) => {
    Cookies.set('token', newToken, { expires: 1 })
    Cookies.set('user', JSON.stringify(newUser), { expires: 1 })
    setToken(newToken)
    setUser(newUser)
  }

  const logout = () => {
    Cookies.remove('token')
    Cookies.remove('user')
    setToken(null)
    setUser(null)
  }

  if (!isLoaded) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
