import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, db } from './config'

export async function registerStudent(
  email: string,
  password: string,
  fullName: string
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  
  // Create user document (Unified Profile)
  await setDoc(doc(db, 'users', cred.user.uid), {
    uid: cred.user.uid,
    email,
    fullName,
    role: 'student',
    profileComplete: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    isVerified: false,
  })
  
  return cred.user
}


export async function loginUser(
  email: string,
  password: string
) {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  
  const userDoc = await getDoc(doc(db, 'users', cred.user.uid))
  const userData = userDoc.data()
  
  return { user: cred.user, role: userData?.role }
}

export async function logoutUser() {
  await signOut(auth)
}

export function onAuthChange(
  callback: (user: User | null) => void
) {
  return onAuthStateChanged(auth, callback)
}
