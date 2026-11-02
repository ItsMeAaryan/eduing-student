// lib/firebase/applications.ts
import {
  collection, addDoc, query, where,
  onSnapshot, doc, getDoc, serverTimestamp, orderBy
} from 'firebase/firestore'
import { auth, db } from './config'
import { Application } from '@/types/firebase'
import { shareDocumentsWithApplication } from './admission'

export async function submitApplication(
  universityId: string,
  universityName: string,
  program: string,
  programId?: string
) {
  const currentUser = auth.currentUser
  if (!currentUser) throw new Error('Not authenticated')

  const userId = currentUser.uid

  // Prevent duplicate applications: check for existing submission for same university+program
  const existingQuery = query(
    collection(db, 'applications'),
    where('userId', '==', userId),
    where('universityId', '==', universityId)
  )
  const existingSnap = await import('firebase/firestore').then(({ getDocs }) => getDocs(existingQuery))
  const duplicate = existingSnap.docs.find(
    d => (d.data().program === program) || (d.data().programName === program) || !program
  )
  if (duplicate) {
    throw new Error('You have already applied to this program. Check your Applications page.')
  }

  // Snapshot of the applicant so the university portal can identify them.
  // (It reads studentName / studentEmail / programName — previously missing,
  // so every web application showed up as "Unnamed Student".)
  const profileSnap = await getDoc(doc(db, 'users', userId))
  const profile = profileSnap.exists() ? profileSnap.data() : {}

  const docRef = await addDoc(collection(db, 'applications'), {
    userId,
    studentId: userId,
    studentName: profile.fullName || currentUser.displayName || '',
    studentEmail: profile.email || currentUser.email || '',
    studentPhone: profile.phone || '',
    category: profile.category || '',
    universityId,
    universityName,
    program,
    programName: program,
    programId: programId || '',
    status: 'submitted',
    statusHistory: [{ status: 'submitted', date: new Date().toISOString(), note: 'Application submitted' }],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  // Give the university the documents the student has already uploaded.
  await shareDocumentsWithApplication(docRef.id, userId).catch(() => {})
  return docRef.id
}

export function listenStudentApplications(
  userId: string,
  callback: (apps: Application[]) => void,
  errorCallback?: (error: unknown) => void
) {
  let apps1: Application[] = []
  let apps2: Application[] = []

  const merge = () => {
    const seen = new Set<string>()
    const merged: Application[] = []
    for (const app of [...apps1, ...apps2]) {
      if (!seen.has(app.id)) { seen.add(app.id); merged.push(app) }
    }
    merged.sort((a: any, b: any) =>
      (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
    )
    callback(merged)
  }

  const q1 = query(
    collection(db, 'applications'),
    where('studentId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const q2 = query(
    collection(db, 'applications'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )

  const unsub1 = onSnapshot(q1,
    snap => { apps1 = snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)); merge() },
    err => { if (process.env.NODE_ENV === 'development') console.error('[applications q1]', err); errorCallback?.(err) }
  )
  const unsub2 = onSnapshot(q2,
    snap => { apps2 = snap.docs.map(d => ({ id: d.id, ...d.data() } as Application)); merge() },
    err => { if (process.env.NODE_ENV === 'development') console.error('[applications q2]', err); errorCallback?.(err) }
  )

  return () => { unsub1(); unsub2() }
}

export function listenApplication(
  applicationId: string,
  callback: (app: Application | null) => void,
  errorCallback?: (error: unknown) => void
) {
  return onSnapshot(
    doc(db, 'applications', applicationId),
    snap => callback(snap.exists() ? { id: snap.id, ...snap.data() } as Application : null),
    err => { if (process.env.NODE_ENV === 'development') console.error('[listenApplication]', err); errorCallback?.(err) }
  )
}