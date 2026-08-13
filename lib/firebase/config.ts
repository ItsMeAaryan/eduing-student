// lib/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

const required = (key: string, val: string | undefined): string => {
  if (!val) {
    console.warn(`Warning: Missing required env var: ${key}`)
    return 'demo-' + key
  }
  return val
}

const firebaseConfig = {
  apiKey: required('NEXT_PUBLIC_FIREBASE_API_KEY', process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: required('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: required('NEXT_PUBLIC_FIREBASE_PROJECT_ID', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: required('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: required('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID', process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: required('NEXT_PUBLIC_FIREBASE_APP_ID', process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
}

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app