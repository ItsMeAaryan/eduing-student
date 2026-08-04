// lib/firebase/scholarships.ts
import { collection, onSnapshot, query } from 'firebase/firestore'
import { db } from './config'

export function listenScholarships(
  onUpdate: (data: any[]) => void,
  onError: (err: unknown) => void
) {
  const q = query(collection(db, 'scholarships'))
  return onSnapshot(
    q,
    (snap) => {
      const results = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      onUpdate(results)
    },
    (err) => {
      if (process.env.NODE_ENV === 'development') console.error('[listenScholarships]', err)
      onError(err)
    }
  )
}