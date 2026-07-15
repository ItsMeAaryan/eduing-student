'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Loader2 } from 'lucide-react'

export default function Page() {
  const router = useRouter()
  const { isLoggedIn, loading: authLoading } = useAuth()

  useEffect(() => {
    if (!authLoading) {
      if (isLoggedIn) {
        router.replace('/student/dashboard')
      } else {
        router.replace('/auth/login')
      }
    }
  }, [isLoggedIn, authLoading, router])

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-white/50 animate-spin" />
    </div>
  )
}
