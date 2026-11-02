// lib/firebase/student.ts
import {
  doc, updateDoc, onSnapshot,
  serverTimestamp, setDoc, collection,
  query, orderBy, where
} from 'firebase/firestore'
import { db } from './config'
import { UserProfile, UserDocument } from '@/types/firebase'
// EDUING doesn't store files (no Firebase Storage). Documents will be verified
// through DigiLocker; until then students enter their marks in the profile.

const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') console.log(...args)
}

// Listen to user profile (real-time)
export function listenUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
  errorCallback?: (error: unknown) => void
) {
  return onSnapshot(
    doc(db, 'users', uid),
    (snap) => {
      if (snap.exists()) {
        callback({ uid: snap.id, ...snap.data() } as UserProfile)
      } else {
        callback(null)
      }
    },
    (err) => {
      log('[listenUserProfile]', err)
      errorCallback?.(err)
    }
  )
}

// Update user profile
export async function updateUserProfile(
  uid: string,
  data: Partial<UserProfile>
) {
  await updateDoc(
    doc(db, 'users', uid),
    {
      ...data,
      updatedAt: serverTimestamp(),
    }
  )
}

// Listen to user documents (real-time)
export function listenUserDocuments(
  uid: string,
  callback: (docs: Record<string, UserDocument>) => void,
  errorCallback?: (error: unknown) => void
) {
  const colRef = collection(db, 'users', uid, 'documents')
  return onSnapshot(
    colRef,
    (snap) => {
      const docs: Record<string, UserDocument> = {}
      snap.docs.forEach(d => {
        docs[d.id] = d.data() as UserDocument
      })
      callback(docs)
    },
    (err) => {
      log('[listenUserDocuments]', err)
      errorCallback?.(err)
    }
  )
}

// Remove profile photo URL from users collection (canonical collection)
export async function removeProfilePhoto(uid: string) {
  await updateDoc(doc(db, 'users', uid), {
    profilePhotoURL: '',
    updatedAt: serverTimestamp()
  })
}

// Listen to user payments
export function listenUserPayments(
  uid: string,
  callback: (payments: any[]) => void,
  errorCallback?: (error: unknown) => void
) {
  const colRef = collection(db, 'payments')
  const q = query(colRef, where('userId', '==', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(
    q,
    (snap) => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    },
    (err) => {
      log('[listenUserPayments]', err)
      errorCallback?.(err)
    }
  )
}

// Calculate profile completion percentage
export function calculateProfileCompletion(profile: UserProfile, docsCount: number = 0): number {
  const fields: (keyof UserProfile)[] = [
    'fullName', 'email', 'phone', 'dob', 'gender',
    'category', 'address', 'state', 'nationality', 'profilePhotoURL',
    'tenthPercentage', 'twelfthPercentage'
  ]
  const completedFields = fields.filter(f => !!profile[f])
  let score = (completedFields.length / fields.length) * 80
  if (docsCount >= 4) score += 20
  else score += (docsCount / 4) * 20
  return Math.min(100, Math.round(score))
}