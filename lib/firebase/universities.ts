import {
  collection, doc, query, where,
  orderBy, onSnapshot, QuerySnapshot, DocumentData
} from 'firebase/firestore'
import { db } from './config'
import { University } from '@/types/firebase'

// ---------------------------------------------------------------------------
// Firestore-native shape for the universities collection
// ---------------------------------------------------------------------------
export interface UniversityFirestore {
  id: string
  name: string
  shortName: string
  type: string
  location: { city: string; state: string }
  rankings: { nirfOverall: number }
  approvalStatus: string
  feesPerYear: number
  totalSeats: number
  about: string
  logoUrl?: string
  heroImageUrl?: string
  tags?: string[]
  naacGrade?: string
  placementRate?: number
  avgPackageLpa?: number
  createdAt: any
}

// ---------------------------------------------------------------------------
// Real-time subscription for all approved universities (used by page + hook)
// ---------------------------------------------------------------------------
export function subscribeToUniversities(
  callback: (unis: UniversityFirestore[]) => void,
  onError: (err: Error) => void
) {
  const q = query(
    collection(db, 'universities'),
    where('approvalStatus', '==', 'approved'),
    orderBy('name')
  )
  return onSnapshot(
    q,
    (snap: QuerySnapshot<DocumentData>) => {
      const unis = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UniversityFirestore[]
      callback(unis)
    },
    onError
  )
}

// ---------------------------------------------------------------------------
// Legacy helpers (kept for backward-compat – do not remove until migrated)
// ---------------------------------------------------------------------------

// Get filtered universities (real-time)
export function listenUniversitiesFiltered(
  filters: { 
    level?: string, 
    location?: string, // This maps to 'state' in DB
    minRating?: number,
    naacGrade?: string // This maps to 'accreditation' in DB
  },
  callback: (unis: University[]) => void,
  onError?: (error: any) => void
) {
  
  let q = query(collection(db, 'universities'))

  try {
    if (filters.location) {
      q = query(q, where('state', '==', filters.location))
    }

    if (filters.naacGrade) {
      // Matches 'NAAC A', 'NAAC A++', etc.
      q = query(q, where('accreditation', '==', filters.naacGrade))
    }

    // Default sorting
    q = query(q, orderBy('name', 'asc'))

    return onSnapshot(q, (snap) => {
      const unis = snap.docs.map(d => ({
        id: d.id, ...d.data()
      })) as University[]
      callback(unis)
    }, (err) => {
      console.error("FIRESTORE ERROR:", err)
      if (onError) onError(err)
    })
  } catch (err) {
    console.error("FIRESTORE ERROR:", err)
    if (onError) onError(err)
    return () => {}
  }
}


// Get single university (real-time)
export function listenUniversity(
  id: string,
  callback: (uni: University | null) => void
) {
  return onSnapshot(
    doc(db, 'universities', id),
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as University)
      } else {
        callback(null)
      }
    }
  )
}
