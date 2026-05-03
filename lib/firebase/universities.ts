import {
  collection, doc, query, where,
  orderBy, onSnapshot
} from 'firebase/firestore'
import { db } from './config'
import { University } from '@/types/firebase'

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
  console.log('[FIRESTORE] Syncing universities with filters:', filters)
  
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
      console.log("UNIVERSITIES:", snap.docs.length)
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
