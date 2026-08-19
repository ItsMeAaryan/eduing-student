// components/providers/StudentDataProvider.tsx
'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { onAuthStateChanged, Unsubscribe } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'
import { calculateProfileStrength } from '@/lib/utils/profileStrength'
import type { Application, Notification, Payment, University, Scholarship } from '@/types/firebase'

const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') console.log(...args)
}

const normalizeArray = <T,>(data: unknown): T[] =>
  Array.isArray(data) ? data : data && typeof data === 'object' ? Object.values(data as object) : []

interface StudentDataContextValue {
  profile: Record<string, any> | null
  applications: Application[]
  notifications: Notification[]
  payments: Payment[]
  universities: University[]
  scholarships: Scholarship[]
  loading: boolean
  error: string
  userDocuments: Record<string, any>
  docUploaded: number
  docVerified: number
  docPending: number
  deadlines: any[]
  documents: any[]
  aiMatches: any[]
  savedPrograms: any[]
  profileScore: number
  profileStrength: any
  selectedOffers: Application[]
  activeApp: Application | null
  uniqueApps: Application[]
  verificationStatus: 'Profile Incomplete' | 'Profile Complete' | 'Documents Pending' | 'Documents Verified'
  isOnboardingComplete: boolean
  hasMinimumProfileForRecommendations: boolean
}

export const StudentDataContext = createContext<StudentDataContextValue | null>(null)

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<Record<string, any> | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [payments, setPayments] = useState<Payment[]>([])
  const [universities, setUniversities] = useState<University[]>([])
  const [scholarships, setScholarships] = useState<Scholarship[]>([])
  const [userDocuments, setUserDocuments] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Store all Firestore unsubscribes so they survive auth callback scope
  const firestoreUnsubs = useRef<Unsubscribe[]>([])

  const clearFirestoreListeners = () => {
    firestoreUnsubs.current.forEach(u => u())
    firestoreUnsubs.current = []
  }

  useEffect(() => {
    if (!auth) return
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      // Clean up any previous listeners before setting up new ones
      clearFirestoreListeners()

      if (!user) {
        setLoading(false)
        router.push('/auth/login')
        return
      }

      let loadingProfile = true
      let loadingApps = true
      const checkLoading = () => {
        if (!loadingProfile && !loadingApps) setLoading(false)
      }

      // Profile
      let unsubProfile = () => {}
      try {
        unsubProfile = onSnapshot(
          doc(db, 'users', user.uid),
          (snap) => {
            setProfile(snap.exists() ? snap.data() : {})
            loadingProfile = false
            checkLoading()
          },
          (err) => {
            log('Profile listener error:', err)
            setError('Failed to load profile')
            loadingProfile = false
            checkLoading()
          }
        )
      } catch (err) {
        log('Profile listener synchronous error:', err)
        setError('Failed to load profile')
        loadingProfile = false
        checkLoading()
      }

      // Applications (dual query for backward compat)
      let appsList1: Application[] = []
      let appsList2: Application[] = []
      let appsFirstFired = false

      const mergeApps = () => {
        const seen = new Set<string>()
        const merged: Application[] = []
        for (const d of [...appsList1, ...appsList2]) {
          if (!seen.has(d.id)) { seen.add(d.id); merged.push(d) }
        }
        setApplications(merged)
        if (!appsFirstFired) { appsFirstFired = true; loadingApps = false; checkLoading() }
      }

      const unsubApps1 = onSnapshot(
        query(collection(db, 'applications'), where('studentId', '==', user.uid)),
        snap => { appsList1 = snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)); mergeApps() },
        err => log('Applications listener 1:', err)
      )
      const unsubApps2 = onSnapshot(
        query(collection(db, 'applications'), where('userId', '==', user.uid)),
        snap => { appsList2 = snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)); mergeApps() },
        err => log('Applications listener 2:', err)
      )

      const unsubDocs = onSnapshot(
        collection(db, 'users', user.uid, 'documents'),
        snap => {
          const docsMap: Record<string, any> = {}
          snap.docs.forEach(d => { docsMap[d.id] = d.data() })
          setUserDocuments(docsMap)
        },
        err => log('Documents listener:', err)
      )

      const unsubNotifs = onSnapshot(
        query(collection(db, 'notifications'), where('userId', '==', user.uid)),
        snap => setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() } as Notification))),
        err => log('Notifications listener:', err)
      )

      const unsubPayments = onSnapshot(
        query(collection(db, 'payments'), where('userId', '==', user.uid)),
        snap => setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as Payment))),
        err => log('Payments listener:', err)
      )

      const unsubUnis = onSnapshot(
        query(collection(db, 'universities'), where('approvalStatus', '==', 'approved')),
        snap => setUniversities(snap.docs.map(d => ({ id: d.id, ...d.data() } as University))),
        err => log('Universities listener:', err)
      )

      const unsubScholarships = onSnapshot(
        collection(db, 'scholarships'),
        snap => setScholarships(snap.docs.map(d => ({ id: d.id, ...d.data() } as Scholarship))),
        err => log('Scholarships listener:', err)
      )

      firestoreUnsubs.current = [
        unsubProfile, unsubApps1, unsubApps2, unsubDocs,
        unsubNotifs, unsubPayments, unsubUnis, unsubScholarships
      ]
    })

    return () => {
      unsubAuth()
      clearFirestoreListeners()
    }
  }, [router])

  // Computed
  const deadlines = normalizeArray<any>(profile?.deadlines)
  const documents = normalizeArray<any>(profile?.documents)
  const aiMatches = normalizeArray<any>(profile?.aiMatches)
  const savedPrograms = normalizeArray<any>(profile?.savedPrograms)

  const profileStrength = calculateProfileStrength(profile, userDocuments)
  const profileScore = profileStrength.percentage

  const docEntries = Object.values(userDocuments) as any[]
  const docUploaded = docEntries.length
  const docVerified = docEntries.filter(d => d?.status === 'verified').length
  const docPending = docEntries.filter(d => d?.status === 'uploaded').length

  const isProfileDataComplete = profileScore >= 60
  const isDocsVerified = docVerified > 0 && docVerified === docUploaded && docUploaded >= 3
  const isDocsPending = docUploaded > 0 && !isDocsVerified

  type VerificationStatus = 'Profile Incomplete' | 'Profile Complete' | 'Documents Pending' | 'Documents Verified'
  let verificationStatus: VerificationStatus = 'Profile Incomplete'
  if (isDocsVerified) verificationStatus = 'Documents Verified'
  else if (isDocsPending) verificationStatus = 'Documents Pending'
  else if (isProfileDataComplete) verificationStatus = 'Profile Complete'

  const isOnboardingComplete = !!profile?.profileComplete && !!profile?.fullName
  const hasMinimumProfileForRecommendations =
    profileScore >= 40 && (!!profile?.twelfthPercentage || !!profile?.cgpa || !!profile?.testScores)

  const safeApps = Array.isArray(applications) ? applications : []
  const safeNotifs = Array.isArray(notifications) ? notifications : []
  const selectedOffers = safeApps.filter(a => a?.status === 'selected')
  const activeApp = safeApps
    .filter(a => a?.status !== 'rejected' && a?.status !== 'selected')
    .sort((a: any, b: any) => (b?.progress || 0) - (a?.progress || 0))[0] ?? safeApps[0] ?? null
  const uniqueApps = safeApps.filter((v, i, arr) => arr.findIndex(t => t.id === v.id) === i)

  const value: StudentDataContextValue = {
    profile, applications: safeApps, notifications: safeNotifs,
    payments: Array.isArray(payments) ? payments : [],
    universities, scholarships, loading, error,
    userDocuments, docUploaded, docVerified, docPending,
    deadlines, documents, aiMatches, savedPrograms,
    profileScore, profileStrength, selectedOffers, activeApp, uniqueApps,
    verificationStatus, isOnboardingComplete, hasMinimumProfileForRecommendations,
  }

  return (
    <StudentDataContext.Provider value={value}>
      {children}
    </StudentDataContext.Provider>
  )
}

export function useStudentData() {
  const context = useContext(StudentDataContext)
  if (!context) throw new Error('useStudentData must be used within a StudentDataProvider')
  return context
}