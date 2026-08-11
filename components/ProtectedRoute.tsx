// components/ProtectedRoute.tsx
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
        if (role === 'student') router.push('/student/dashboard')
        else if (role === 'super_admin') router.push('/admin/dashboard')
        else router.push('/auth/login')
      }
    }
  }, [isLoggedIn, role, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{
            borderColor: 'var(--accent-border)',
            borderTopColor: 'var(--accent)',
          }}
        />
      </div>
    )
  }

  if (!isLoggedIn || (allowedRoles && role && !allowedRoles.includes(role))) {
    return null
  }

  return <>{children}</>
}