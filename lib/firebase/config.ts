// lib/firebase/config.ts
import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Firebase web config is public by design (access is controlled by Firestore
// security rules), so the production values are built in. Env vars still win,
// e.g. to point a local copy at a test project.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyAWF57TakNaSkGXCRpw_Ig5NSxAVSozCvg',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'eduing-platform.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'eduing-platform',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'eduing-platform.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '475439810258',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:475439810258:web:c6c06c8508f98b9a2c4f0b',
}

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export default app