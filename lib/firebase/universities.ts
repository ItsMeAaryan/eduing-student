// lib/firebase/universities.ts
import {
  collection, doc, query, where,
  orderBy, onSnapshot, QuerySnapshot, DocumentData
} from 'firebase/firestore'
import { db } from './config'
import { University } from '@/types/firebase'

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
    (snap: QuerySnapshot<DocumentData>) =>
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as UniversityFirestore[]),
    onError
  )
}

export function listenUniversitiesFiltered(
  filters: {
    level?: string
    location?: string
    minRating?: number
    naacGrade?: string
  },
  callback: (unis: University[]) => void,
  onError?: (error: unknown) => void
) {
  try {
    let q = query(
      collection(db, 'universities'),
      where('approvalStatus', '==', 'approved') // ALWAYS enforce this
    )
    if (filters.location) q = query(q, where('state', '==', filters.location))
    if (filters.naacGrade) q = query(q, where('accreditation', '==', filters.naacGrade))
    q = query(q, orderBy('name', 'asc'))

    return onSnapshot(
      q,
      snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })) as University[]),
      err => {
        if (process.env.NODE_ENV === 'development') console.error('[listenUniversitiesFiltered]', err)
        onError?.(err)
      }
    )
  } catch (err) {
    if (process.env.NODE_ENV === 'development') console.error('[listenUniversitiesFiltered setup]', err)
    onError?.(err)
    return () => { }
  }
}

export function listenUniversity(
  id: string,
  callback: (uni: University | null) => void,
  onError?: (error: unknown) => void
) {
  return onSnapshot(
    doc(db, 'universities', id),
    snap => callback(snap.exists() ? { id: snap.id, ...snap.data() } as University : null),
    err => {
      if (process.env.NODE_ENV === 'development') console.error('[listenUniversity]', err)
      onError?.(err)
    }
  )
}