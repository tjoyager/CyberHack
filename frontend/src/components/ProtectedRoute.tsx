'use client'

import { useAuth, UserRole } from '@/lib/auth-context'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: UserRole[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/')
    } else if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
      router.push('/dashboard') // Or somewhere else if not authorized
    }
  }, [isAuthenticated, user, allowedRoles, router, pathname])

  if (!isAuthenticated) {
    return null
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role) && user.role !== 'SUPER_ADMIN') {
    return null
  }

  return <>{children}</>
}
