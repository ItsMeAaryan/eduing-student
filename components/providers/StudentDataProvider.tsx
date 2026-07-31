'use client'
import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'
import { calculateProfileStrength } from '@/lib/utils/profileStrength'

const normalizeArray = (data: any) => Array.isArray(data) ? data : data ? Object.values(data) : [];

export const StudentDataContext = createContext<any>(null)

export function StudentDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [applications, setApplications] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [universities, setUniversities] = useState<any[]>([])
  const [scholarships, setScholarships] = useState<any[]>([])
  // Real-time documents subcollection: { [docId]: { fileUrl, status, uploadedAt } }
  const [userDocuments, setUserDocuments] = useState<Record<string, any>>({})
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
        for (const d of [...appsList1, ...appsList2]) {
          if (!seen.has(d.id)) {
            seen.add(d.id)
            apps.push(d)
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

      // User Documents subcollection (real-time)
      const unsubDocs = onSnapshot(
        collection(db, 'users', user.uid, 'documents'),
        (snap) => {
          const docsMap: Record<string, any> = {}
          snap.docs.forEach(d => { docsMap[d.id] = d.data() })
          setUserDocuments(docsMap)
        },
        (err) => console.error('Documents error:', err)
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

      // Universities – real-time from Firestore (approved only)
      const unsubUnis = onSnapshot(
        query(
          collection(db, 'universities'),
          where('approvalStatus', '==', 'approved')
        ),
        (snap) => {
          setUniversities(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        },
        (err) => console.error('Universities error:', err)
      )

      // Scholarships – real-time from Firestore
      const unsubScholarships = onSnapshot(
        collection(db, 'scholarships'),
        (snap) => {
          setScholarships(snap.docs.map(d => ({ id: d.id, ...d.data() })))
        },
        (err) => console.error('Scholarships error:', err)
      )

      return () => {
        unsubProfile()
        unsubApps1()
        unsubApps2()
        unsubDocs()
        unsubNotifs()
        unsubPayments()
        unsubUnis()
        unsubScholarships()
      }
    })
    return unsub
  }, [router])

  // ── Computed data ────────────────────────────────────────────────────────────
  const deadlines = normalizeArray(profile?.deadlines)
  const documents = normalizeArray(profile?.documents)
  const aiMatches = normalizeArray(profile?.aiMatches)
  const savedPrograms = normalizeArray(profile?.savedPrograms)

  // Profile strength — uses the real subcollection documents map
  const profileStrength = calculateProfileStrength(profile, userDocuments)
  const profileScore = profileStrength.percentage

  // ── Document counts from subcollection ────────────────────────────────────
  const docEntries = Object.values(userDocuments) as any[]
  const docUploaded = docEntries.length
  const docVerified = docEntries.filter(d => d?.status === 'verified').length
  const docPending  = docEntries.filter(d => d?.status === 'uploaded').length

  // ── Verification status ───────────────────────────────────────────────────
  // Profile is "complete" for portal purposes when score ≥ 60
  const isProfileDataComplete = profileScore >= 60
  const isDocsVerified  = docVerified > 0 && docVerified === docUploaded && docUploaded >= 3
  const isDocsPending   = docUploaded > 0 && !isDocsVerified

  type VerificationStatus = 'Profile Incomplete' | 'Profile Complete' | 'Documents Pending' | 'Documents Verified'
  let verificationStatus: VerificationStatus = 'Profile Incomplete'
  if (isDocsVerified)           verificationStatus = 'Documents Verified'
  else if (isDocsPending)       verificationStatus = 'Documents Pending'
  else if (isProfileDataComplete) verificationStatus = 'Profile Complete'

  // ── Onboarding / readiness flags ──────────────────────────────────────────
  // Onboarding is considered complete when the user set profileComplete=true
  // (written by the onboarding page on finish) AND has at least a name
  const isOnboardingComplete: boolean =
    !!profile?.profileComplete && !!profile?.fullName

  // Recommendations unlock when there is enough profile data to meaningfully match
  const hasMinimumProfileForRecommendations: boolean =
    profileScore >= 40 &&
    (!!profile?.twelfthPercentage || !!profile?.cgpa || !!profile?.testScores)

  // ── Application helpers ───────────────────────────────────────────────────
  const safeApps  = Array.isArray(applications) ? applications : []
  const safeNotifs = Array.isArray(notifications) ? notifications : []

  const selectedOffers = safeApps.filter(a => a?.status === 'selected')

  const activeApp = safeApps
    .filter(a => a?.status !== 'rejected' && a?.status !== 'selected')
    .sort((a, b) => (b?.progress || 0) - (a?.progress || 0))[0] || safeApps[0] || null

  const uniqueApps = safeApps.filter((v, i, a) => a.findIndex(t => t.id === v.id) === i)

  const value = {
    profile,
    applications: safeApps,
    notifications: safeNotifs,
    payments: Array.isArray(payments) ? payments : [],
    universities,
    scholarships,
    loading,
    error,

    // Documents
    userDocuments,
    docUploaded,
    docVerified,
    docPending,

    // Computed
    deadlines,
    documents,
    aiMatches,
    savedPrograms,
    profileScore,
    profileStrength,
    selectedOffers,
    activeApp,
    uniqueApps,

    // Status & flags
    verificationStatus,
    isOnboardingComplete,
    hasMinimumProfileForRecommendations,
  }

  return <StudentDataContext.Provider value={value}>{children}</StudentDataContext.Provider>
}

export function useStudentData() {
  const context = useContext(StudentDataContext)
  if (!context) throw new Error('useStudentData must be used within a StudentDataProvider')
  return context
}
