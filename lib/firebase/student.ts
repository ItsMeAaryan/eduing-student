import {
  doc, updateDoc, onSnapshot,
  serverTimestamp, setDoc, collection,
  query, orderBy, getDocs, where
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL
} from 'firebase/storage'
import { db, storage } from './config'
import { UserProfile, UserDocument } from '@/types/firebase'
import { compressImage } from '../utils/compression'

// Listen to user profile (real-time)
export function listenUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void,
  errorCallback?: (error: any) => void
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
      console.error(`[FIREBASE_ERROR] listenUserProfile:`, err)
      if (errorCallback) errorCallback(err)
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
    console.log(`[STORAGE] Compressing photo for user: ${uid}`)
    const compressed = await compressImage(file)
    
    const path = `student_profiles/${uid}/profile_photo`
    const storageRef = ref(storage, path)
    
    console.log(`[STORAGE] Uploading to: ${path}`)
    await uploadBytes(storageRef, compressed)
    
    const url = await getDownloadURL(storageRef)
    console.log(`[STORAGE] Upload success: ${url}`)
    
    await updateDoc(
      doc(db, 'student_profiles', uid),
      {
        profilePhotoURL: url,
        updatedAt: serverTimestamp(),
      }
    )
    
    return url
  } catch (err) {
    console.error(`[STORAGE_ERROR] Photo upload failed for ${uid}:`, err)
    throw err
  }
}

/** 
 * DOCUMENTS SYSTEM (Subcollection)
 * Path: users/{uid}/documents/{docId}
 */

// Upload student document to subcollection
export async function uploadUserDocument(
  uid: string,
  file: File,
  docId: '10th_marksheet' | '12th_marksheet' | 'id_proof' | 'passport_photo'
) {
  try {
    console.log(`[STORAGE] Processing document ${docId} for user: ${uid}`)
    const compressed = await compressImage(file, 1200, 1200, 0.8) // Higher quality for docs
    
    const path = `users/${uid}/documents/${docId}`
    const storageRef = ref(storage, path)
    
    console.log(`[STORAGE] Uploading document to: ${path}`)
    await uploadBytes(storageRef, compressed)
    
    const url = await getDownloadURL(storageRef)
    console.log(`[STORAGE] Doc upload success: ${url}`)
    
    await setDoc(
      doc(db, 'users', uid, 'documents', docId),
      {
        fileUrl: url,
        status: 'uploaded',
        uploadedAt: serverTimestamp(),
      }
    )
    
    return url
  } catch (err) {
    console.error(`[STORAGE_ERROR] Document ${docId} failed for ${uid}:`, err)
    throw err
  }
}

// Listen to user documents (real-time)
export function listenUserDocuments(
  uid: string,
  callback: (docs: Record<string, UserDocument>) => void,
  errorCallback?: (error: any) => void
) {
  const colRef = collection(db, 'users', uid, 'documents')
  return onSnapshot(colRef, (snap) => {
    const docs: Record<string, UserDocument> = {}
    snap.docs.forEach(d => {
      docs[d.id] = d.data() as UserDocument
    })
    callback(docs)
  }, (err) => {
    console.error(`[FIREBASE_ERROR] listenUserDocuments:`, err)
    if (errorCallback) errorCallback(err)
  })
}

// Remove profile photo
export async function removeProfilePhoto(uid: string) {
  await updateDoc(doc(db, 'users', uid), {
    profilePhotoURL: '',
    updatedAt: serverTimestamp()
  })
}

// Delete document
export async function deleteUserDocument(uid: string, docId: string) {
  // We keep the storage file for audit, but remove from firestore
  await updateDoc(doc(db, 'users', uid, 'documents', docId), {
    status: 'rejected', // or deleteDoc if preferred
    fileUrl: '',
    uploadedAt: serverTimestamp()
  })
}

// Listen to user payments
export function listenUserPayments(
  uid: string,
  callback: (payments: any[]) => void,
  errorCallback?: (error: any) => void
) {
  const colRef = collection(db, 'payments')
  const q = query(colRef, where('userId', '==', uid), orderBy('createdAt', 'desc'))
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }, (err) => {
    console.error(`[FIREBASE_ERROR] listenUserPayments:`, err)
    if (errorCallback) errorCallback(err)
  })
}

// Calculate profile completion percentage
export function calculateProfileCompletion(profile: UserProfile, docsCount: number = 0): number {
  const fields: (keyof UserProfile)[] = [
    'fullName', 'email', 'phone', 'dob', 'gender', 
    'category', 'address', 'state', 'nationality', 'profilePhotoURL',
    'tenthPercentage', 'twelfthPercentage'
  ];
  
  const completedFields = fields.filter(f => !!profile[f]);
  let score = (completedFields.length / fields.length) * 80; // 80% weightage
  
  // Add 20% for documents
  if (docsCount >= 4) score += 20;
  else score += (docsCount / 4) * 20;

  return Math.min(100, Math.round(score));
}

