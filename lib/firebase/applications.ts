import {
  collection, addDoc, query, where,
  onSnapshot, updateDoc, doc,
  serverTimestamp, orderBy
} from 'firebase/firestore'
import { db } from './config'
import { Application } from '@/types/firebase'

// Student submits application
export async function submitApplication(
  userId: string,
  universityId: string,
  universityName: string,
  program: string
) {
  console.log("UID:", userId)
  const app = await addDoc(
    collection(db, 'applications'),
    {
      userId,
      studentId: userId, // Cross-platform compatibility
      universityId,
      universityName,
      program,
      status: 'submitted',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }
  )
  
  console.log("Application Submitted:", app.id)
  return app.id
}

// Listen to student's applications (real-time)
export function listenStudentApplications(
  userId: string,
  callback: (apps: Application[]) => void,
  errorCallback?: (error: any) => void
) {
  console.log("[SYNC] Listening to apps for UID:", userId)
  
  // Dual query for cross-platform compatibility
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
  
  // Since we want real-time for BOTH, we need to manage two snapshots
  let apps1: Application[] = []
  let apps2: Application[] = []
  
  const mergeAndCallback = () => {
    const seen = new Set()
    const merged: Application[] = []
    
    for (const app of [...apps1, ...apps2]) {
      if (!seen.has(app.id)) {
        seen.add(app.id)
        merged.push(app)
      }
    }
    
    // Sort merged results by createdAt desc
    merged.sort((a: any, b: any) => {
      const da = a.createdAt?.seconds || 0
      const db2 = b.createdAt?.seconds || 0
      return db2 - da
    })
    
    callback(merged)
  }

  const unsub1 = onSnapshot(q1, (snap) => {
    apps1 = snap.docs.map(d => ({ id: d.id, ...d.data() } as Application))
    mergeAndCallback()
  }, (err) => {
    console.error("Q1 ERROR:", err)
    if (errorCallback) errorCallback(err)
  })

  const unsub2 = onSnapshot(q2, (snap) => {
    apps2 = snap.docs.map(d => ({ id: d.id, ...d.data() } as Application))
    mergeAndCallback()
  }, (err) => {
    console.error("Q2 ERROR:", err)
    if (errorCallback) errorCallback(err)
  })
  
  return () => {
    unsub1()
    unsub2()
  }
}


// University updates application status
export async function updateApplicationStatus(
  applicationId: string,
  newStatus: Application['status'],
  documentsVerified?: boolean
) {
  const updateData: any = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  }
  
  if (documentsVerified !== undefined) {
    updateData.documentsVerified = documentsVerified
  }

  await updateDoc(
    doc(db, 'applications', applicationId),
    updateData
  )
}

// Listen to a single application (real-time)
export function listenApplication(
  applicationId: string,
  callback: (app: Application | null) => void
) {
  return onSnapshot(
    doc(db, 'applications', applicationId),
    (snap) => {
      if (snap.exists()) {
        callback({ id: snap.id, ...snap.data() } as Application)
      } else {
        callback(null)
      }
    }
  )
}

