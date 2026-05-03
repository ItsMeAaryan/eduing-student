'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, role, isLoggedIn, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!isLoggedIn) {
        router.push('/auth/login')
      } else if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Redirect to appropriate dashboard if role is wrong
        if (role === 'student') router.push('/student/dashboard')
        else if (role === 'super_admin') router.push('/admin/dashboard')
      }
    }
  }, [isLoggedIn, role, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
        <div className="w-12 h-12 border-4 border-brand-indigo/20 border-t-brand-indigo rounded-full animate-spin" />
      </div>
    )
  }

if (!isLoggedIn || (allowedRoles && role && !allowedRoles.includes(role))) {
    return null
  }

  return <>{children}</>
}
