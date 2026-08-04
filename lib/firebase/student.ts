// lib/firebase/student.ts
import {
  doc, updateDoc, onSnapshot,
  serverTimestamp, setDoc, collection,
  query, orderBy, where
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL
} from 'firebase/storage'
import { db, storage } from './config'
import { UserProfile, UserDocument } from '@/types/firebase'
import { compressImage } from '../utils/compression'

const log = (...args: unknown[]) => {
  if (process.env.NODE_ENV === 'development') console.error(...args)
}

// Listen to user profile (real-time)
export function listenUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
  errorCallback?: (error: unknown) => void
) {
  return onSnapshot(
    doc(db, 'student_profiles', uid),
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
    doc(db, 'student_profiles', uid),
    {
      ...data,
      updatedAt: serverTimestamp(),
    }
  )
}

// Upload profile photo
export async function uploadProfilePhoto(
  uid: string,
  file: File
) {
  try {
    const compressed = await compressImage(file)
    const path = `student_profiles/${uid}/profile_photo`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, compressed)
    const url = await getDownloadURL(storageRef)
    await updateDoc(
      doc(db, 'student_profiles', uid),
      {
        profilePhotoURL: url,
        updatedAt: serverTimestamp(),
      }
    )
    return url
  } catch (err: unknown) {
    log('[uploadProfilePhoto] failed for uid:', uid, err)
    throw err
  }
}

// Upload student document to subcollection
export async function uploadUserDocument(
  uid: string,
  file: File,
  docId: '10th_marksheet' | '12th_marksheet' | 'id_proof' | 'passport_photo'
) {
  try {
    const compressed = await compressImage(file, 1200, 1200, 0.8)
    // Storage path must match storage.rules: users/{uid}/documents/{docId}
    const path = `users/${uid}/documents/${docId}`
    const storageRef = ref(storage, path)
    await uploadBytes(storageRef, compressed)
    const url = await getDownloadURL(storageRef)
    await setDoc(
      doc(db, 'users', uid, 'documents', docId),
      {
        fileUrl: url,
        status: 'uploaded',
        uploadedAt: serverTimestamp(),
      }
    )
    return url
  } catch (err: unknown) {
    log('[uploadUserDocument]', docId, 'failed for uid:', uid, err)
    throw err
  }
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

// Remove profile photo URL from student_profiles (consistent collection)
export async function removeProfilePhoto(uid: string) {
  await updateDoc(doc(db, 'student_profiles', uid), {
    profilePhotoURL: '',
    updatedAt: serverTimestamp()
  })
}

// Soft-delete document — mark as removed (not 'rejected')
export async function deleteUserDocument(uid: string, docId: string) {
  await updateDoc(doc(db, 'users', uid, 'documents', docId), {
    status: 'removed',
    fileUrl: '',
    uploadedAt: serverTimestamp()
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