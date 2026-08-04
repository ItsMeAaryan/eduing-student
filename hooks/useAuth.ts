// hooks/useAuth.ts
'use client'

import { useState, useEffect } from 'react'
import { onAuthChange } from '@/lib/firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'

export function useAuth() {
  const [user, setUser] = useState<Record<string, any> | null>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubDoc: (() => void) | null = null

    const unsubAuth = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        unsubDoc = onSnapshot(
          doc(db, 'users', firebaseUser.uid),
          (snap) => {
            const userData = snap.data()
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              ...userData,
            })
            setRole(userData?.role || null)
            setLoading(false)
          },
          (err) => {
            if (process.env.NODE_ENV === 'development') console.error('[useAuth] user doc listener:', err)
            setLoading(false)
          }
        )
      } else {
        if (unsubDoc) unsubDoc()
        setUser(null)
        setRole(null)
        setLoading(false)
      }
    })

    return () => {
      unsubAuth()
      if (unsubDoc) unsubDoc()
    }
  }, [])

  return {
    user,
    role,
    isLoggedIn: !!user,
    loading,
  }
}