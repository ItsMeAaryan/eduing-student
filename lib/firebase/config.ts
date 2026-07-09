import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'

// Firebase web config (eduing-platform project). This is a client-side
// identifier, not a traditional secret — Firebase's own docs confirm these
// values are meant to be public in the bundle; the real security boundary
// is firestore.rules / storage.rules (see Phase 3 audit), not hiding this
// object. Kept as a fallback so the build never breaks if env vars are
// unset; set NEXT_PUBLIC_FIREBASE_* to override per-environment (e.g. a
// separate staging project) without touching code.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAWF57TakNaSkGXCRpw_Ig5NSxAVSozCvg",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "eduing-platform.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "eduing-platform",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "eduing-platform.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "475439810258",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:475439810258:web:c6c06c8508f98b9a2c4f0b",
}

const app = getApps().length === 0
  ? initializeApp(firebaseConfig)
  : getApps()[0]

export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
