'use client'

import { useState, useEffect } from 'react'
import { onAuthChange } from '@/lib/firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { UserProfile } from '@/types/firebase'

export function useAuth() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsubDoc: (() => void) | null = null

    const unsubAuth = onAuthChange((firebaseUser) => {
      if (firebaseUser) {
        // Listen to user document in real-time
        unsubDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (snap) => {
          const userData = snap.data()
          setUser({
            ...firebaseUser,
            ...userData
          })
          setRole(userData?.role || null)
          setLoading(false)
        }, (err) => {
          console.error("User doc listener error:", err)
          setLoading(false)
        })
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
    loading
  }
}
