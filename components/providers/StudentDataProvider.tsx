'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'

const normalizeArray = (data: any) => Array.isArray(data) ? data : data ? Object.values(data) : [];

export const StudentDataContext = createContext<any>(null)

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) { router.push('/auth/login'); return }

      let loadingProfile = true
      let loadingApps = true

      const checkLoading = () => {
        if (!loadingProfile && !loadingApps) setLoading(false)
      }

      // Profile
      const unsubProfile = onSnapshot(
        doc(db, 'student_profiles', user.uid),
        (snap) => { 
          setProfile(snap.exists() ? snap.data() : {})
          loadingProfile = false
          checkLoading()
        },
        (err) => { 
          console.error(err)
          loadingProfile = false
          setError('Failed to load profile')
          checkLoading()
        }
      )

      // Applications
      let appsList1: any[] = []
      let appsList2: any[] = []
      const mergeApps = () => {
        const seen = new Set()
        const apps = []
        for (const doc of [...appsList1, ...appsList2]) {
          if (!seen.has(doc.id)) {
            seen.add(doc.id)
            apps.push(doc)
          }
        }
        setApplications(apps)
        if (loadingApps) {
          loadingApps = false
          checkLoading()
        }
      }

      const unsubApps1 = onSnapshot(
        query(collection(db, 'applications'), where('studentId', '==', user.uid)),
        (snap) => {
          appsList1 = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          mergeApps()
        },
        (err) => console.error('Apps error 1:', err)
      )

      const unsubApps2 = onSnapshot(
        query(collection(db, 'applications'), where('userId', '==', user.uid)),
        (snap) => {
          appsList2 = snap.docs.map(d => ({ id: d.id, ...d.data() }))
          mergeApps()
        },
        (err) => console.error('Apps error 2:', err)
      )

      // Notifications
      const unsubNotifs = onSnapshot(
        query(collection(db, 'notifications'), where('userId', '==', user.uid)),
        (snap) => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => console.error('Notifs error:', err)
      )

      // Payments
      const unsubPayments = onSnapshot(
        query(collection(db, 'payments'), where('userId', '==', user.uid)),
        (snap) => setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
        (err) => console.error('Payments error:', err)
      )

      return () => { unsubProfile(); unsubApps1(); unsubApps2(); unsubNotifs(); unsubPayments() }
    })
    return unsub
  }, [router])

  // Computed data
  const deadlines = normalizeArray(profile?.deadlines)
  const documents = normalizeArray(profile?.documents)
  const aiMatches = normalizeArray(profile?.aiMatches)
  const savedPrograms = normalizeArray(profile?.savedPrograms)
  
  // Calculate completion percentage robustly
  const profileScore = profile?.completionPercentage ?? profile?.profileScore ?? 0

  const safeApps = Array.isArray(applications) ? applications : []
  const safeNotifs = Array.isArray(notifications) ? notifications : []
  
  const selectedOffers = safeApps.filter(a => a?.status === 'selected')
  
  // Latest incomplete application
  const activeApp = safeApps
    .filter(a => a?.status !== 'rejected' && a?.status !== 'selected')
    .sort((a, b) => (b?.progress || 0) - (a?.progress || 0))[0] || safeApps[0] || null

  const uniqueApps = safeApps.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)

  const value = {
    profile,
    applications: safeApps,
    notifications: safeNotifs,
    payments: Array.isArray(payments) ? payments : [],
    loading,
    error,
    
    // Computed
    deadlines,
    documents,
    aiMatches,
    savedPrograms,
    profileScore,
    selectedOffers,
    activeApp,
    uniqueApps
  }

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>
}

export function useStudentData() {
  const context = useContext(StudentDataContext)
  if (!context) throw new Error('useStudentData must be used within a StudentDataProvider')
  return context
}
