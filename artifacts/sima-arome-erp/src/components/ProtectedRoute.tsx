import { useAuth, UserRole } from '@/lib/auth-context'
import { useLocation } from 'wouter'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const [, navigate] = useLocation()

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    } else if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
      navigate('/dashboard')
    }
  }, [isAuthenticated, user, allowedRoles, navigate])

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
    return null
  }

  return <>{children}</>
}
