'use client'
import { useState, useEffect } from 'react'
import { subscribeToUniversities, UniversityFirestore } from '@/lib/firebase/universities'

export function useUniversities() {
  const [universities, setUniversities] = useState<UniversityFirestore[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsub = subscribeToUniversities(
      (unis) => {
        setUniversities(unis)
        setLoading(false)
      },
      (err) => {
        console.error(err)
        setError('Failed to load universities')
        setLoading(false)
      }
    )
    return () => unsub()
  }, [])

  return { universities, loading, error }
}
