// lib/firebase/admission.ts
// Everything that happens after a student applies: results the university
// publishes (offer letter, admit card, exam schedule, seat), the student's
// responses (accept / decline / withdraw / fee payment) and keeping the
// university's copy of the student's documents up to date.
//
// Status flow shared with the university portal:
//   submitted → under_review → docs_verified → selected | allotted
//   → seat_accepted → fee_paid → payment_verified → enrolled
//   side exits: rejected · waitlisted · offer_declined · withdrawn
import {
  arrayUnion, collection, doc, getDoc, getDocs, onSnapshot, query, where,
  serverTimestamp, setDoc, updateDoc, addDoc,
} from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { auth, db, storage } from './config'

export type AdmissionStatus =
  | 'submitted' | 'under_review' | 'docs_verified' | 'selected' | 'allotted' | 'waitlisted'
  | 'seat_accepted' | 'fee_paid' | 'payment_verified' | 'enrolled'
  | 'rejected' | 'offer_declined' | 'withdrawn'

/** Map legacy / alternative spellings onto the shared status vocabulary. */
export function normalizeStatus(raw?: string): AdmissionStatus {
  const s = (raw || 'submitted').toLowerCase()
  const alias: Record<string, AdmissionStatus> = {
    review: 'under_review', in_review: 'under_review', in_progress: 'submitted', draft: 'submitted', pending: 'submitted',
    accepted: 'selected', offered: 'selected', offer: 'selected', reject: 'rejected', declined: 'offer_declined',
    payment_rejected: 'seat_accepted',
  }
  return (alias[s] ?? s) as AdmissionStatus
}

/** Statuses where the student is holding an offer and must respond. */
export const OFFER_STATUSES: AdmissionStatus[] = ['selected', 'allotted']
/** Statuses where the student may still withdraw. */
export const WITHDRAWABLE: AdmissionStatus[] = ['submitted', 'under_review', 'docs_verified', 'waitlisted']
export const CLOSED: AdmissionStatus[] = ['rejected', 'offer_declined', 'withdrawn']

export interface GeneratedDoc { id: string; type: 'offer_letter' | 'admit_card' | 'enrollment_certificate' | string; url: string; version?: number; generatedAt?: any }
export interface SharedDoc { id: string; name: string; url: string; category?: string; status?: string; history?: { note?: string; reason?: string; status?: string }[]; rejectionReason?: string }
export interface ExamSchedule { id: string; programId: string; universityId: string; date?: string; time?: string; center?: string; instructions?: string }

// ── Listeners ───────────────────────────────────────────────────────────────
export function listenGeneratedDocuments(appId: string, cb: (docs: GeneratedDoc[]) => void) {
  return onSnapshot(collection(db, `applications/${appId}/generated_documents`),
    (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })).sort((a, b) => (b.version ?? 0) - (a.version ?? 0))),
    () => cb([]))
}

export function listenSharedDocuments(appId: string, cb: (docs: SharedDoc[]) => void) {
  return onSnapshot(collection(db, `applications/${appId}/documents`),
    (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }))),
    () => cb([]))
}

export function listenExamSchedules(universityId: string, programId: string | undefined, cb: (s: ExamSchedule[]) => void) {
  // isPublished is part of the query because security rules only let students read published schedules.
  const q = query(collection(db, 'exam_schedules'), where('universityId', '==', universityId), where('isPublished', '==', true))
  return onSnapshot(q,
    (snap) => cb(snap.docs
      .map(d => ({ id: d.id, ...(d.data() as any) }) as ExamSchedule & { isPublished?: boolean })
      .filter(s => s.isPublished !== false && (!programId || s.programId === programId))),
    () => cb([]))
}

// ── Student actions ─────────────────────────────────────────────────────────
async function loadOwnedApplication(appId: string) {
  const user = auth.currentUser
  if (!user) throw new Error('Please log in again to continue.')
  const snap = await getDoc(doc(db, 'applications', appId))
  if (!snap.exists()) throw new Error('This application no longer exists.')
  const data = snap.data() as Record<string, any>
  if (data.studentId !== user.uid && data.userId !== user.uid) throw new Error('This application belongs to another account.')
  return { user, data }
}

async function notifyUniversity(app: Record<string, any>, title: string, message: string) {
  if (!app.universityId) return
  await addDoc(collection(db, 'notifications'), {
    userId: app.universityId,
    universityId: app.universityId,
    title, message,
    type: 'application',
    isRead: false,
    createdAt: serverTimestamp(),
  }).catch(() => { /* a failed notification must not undo the student's action */ })
}

async function transition(appId: string, allowedFrom: AdmissionStatus[], next: AdmissionStatus, note: string, extra: Record<string, any> = {}) {
  const { data } = await loadOwnedApplication(appId)
  const current = normalizeStatus(data.status)
  if (!allowedFrom.includes(current)) {
    throw new Error(`This can't be done while the application is "${current.replace(/_/g, ' ')}".`)
  }
  await updateDoc(doc(db, 'applications', appId), {
    status: next,
    updatedAt: serverTimestamp(),
    statusHistory: arrayUnion({ status: next, date: new Date().toISOString(), note }),
    ...extra,
  })
  return data
}

export async function acceptSeat(appId: string) {
  const app = await transition(appId, OFFER_STATUSES, 'seat_accepted', 'Student accepted the seat', { offerResponse: { accepted: true, respondedAt: new Date().toISOString() } })
  await notifyUniversity(app, 'Seat accepted', `${app.studentName || 'A student'} accepted the seat for ${app.programName || app.program || 'your program'}.`)
}

export async function declineOffer(appId: string, reason: string) {
  const app = await transition(appId, OFFER_STATUSES, 'offer_declined', `Student declined the offer${reason ? `: ${reason}` : ''}`, { offerResponse: { accepted: false, reason, respondedAt: new Date().toISOString() } })
  await notifyUniversity(app, 'Offer declined', `${app.studentName || 'A student'} declined the offer for ${app.programName || app.program || 'your program'}. The seat can be re-allotted.`)
}

export async function withdrawApplication(appId: string, reason: string) {
  const app = await transition(appId, WITHDRAWABLE, 'withdrawn', `Student withdrew the application${reason ? `: ${reason}` : ''}`, { withdrawal: { reason, at: new Date().toISOString() } })
  await notifyUniversity(app, 'Application withdrawn', `${app.studentName || 'A student'} withdrew their application for ${app.programName || app.program || 'your program'}.`)
}

export async function submitFeePayment(appId: string, input: { amount: number; transactionRef: string; paidOn: string; mode: string; receipt: File }) {
  const { user } = await loadOwnedApplication(appId)
  if (!(input.amount > 0)) throw new Error('Enter the amount you paid.')
  if (!input.transactionRef.trim()) throw new Error('Enter the transaction / UTR reference from your bank.')
  if (input.receipt.size > 10 * 1024 * 1024) throw new Error('The receipt must be smaller than 10 MB.')
  const ext = input.receipt.name.split('.').pop() || 'pdf'
  const storageRef = ref(storage, `users/${user.uid}/payments/${appId}_${Date.now()}.${ext}`)
  await uploadBytes(storageRef, input.receipt, { contentType: input.receipt.type || 'application/octet-stream' })
  const receiptUrl = await getDownloadURL(storageRef)
  const app = await transition(appId, ['seat_accepted'], 'fee_paid', `Fee payment submitted (ref ${input.transactionRef.trim()})`, {
    paymentDetails: {
      amountPaid: input.amount,
      transactionRef: input.transactionRef.trim(),
      paidOn: input.paidOn,
      mode: input.mode,
      receiptUrl,
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    },
  })
  await notifyUniversity(app, 'Fee payment submitted', `${app.studentName || 'A student'} submitted a fee payment of ₹${input.amount.toLocaleString('en-IN')} for verification.`)
}

// ── Documents shared with universities ──────────────────────────────────────
const DOC_LABELS: Record<string, string> = {
  '10th_marksheet': '10th Marksheet', '12th_marksheet': '12th Marksheet',
  id_proof: 'Identity Proof', passport_photo: 'Passport Photo',
}

/** Copy the student's uploaded documents into an application so the university can verify them. */
export async function shareDocumentsWithApplication(appId: string, uid?: string) {
  const owner = uid || auth.currentUser?.uid
  if (!owner) return 0
  const [mine, shared] = await Promise.all([
    getDocs(collection(db, 'users', owner, 'documents')),
    getDocs(collection(db, `applications/${appId}/documents`)),
  ])
  const existing = new Map(shared.docs.map(d => [d.id, d.data() as Record<string, any>]))
  let count = 0
  for (const d of mine.docs) {
    const data = d.data() as Record<string, any>
    const url = data.fileUrl || data.downloadUrl || data.url || data.previewUrl
    if (!url) continue
    const prev = existing.get(d.id)
    if (prev && prev.url === url) continue // unchanged — keep the university's verification status
    await setDoc(doc(db, `applications/${appId}/documents`, d.id), {
      name: data.name || DOC_LABELS[d.id] || d.id.replace(/_/g, ' '),
      url,
      category: data.category || 'Academic',
      status: 'pending',
      ownerId: owner,
      uploadDate: serverTimestamp(),
      history: prev ? arrayUnion({ status: 'pending', date: new Date().toISOString(), note: 'Student uploaded a new version' }) : [],
    }, { merge: true })
    count++
  }
  return count
}

/** Re-share documents with every application that is still being processed. */
export async function shareDocumentsWithActiveApplications(uid: string) {
  const [a, b] = await Promise.all([
    getDocs(query(collection(db, 'applications'), where('studentId', '==', uid))),
    getDocs(query(collection(db, 'applications'), where('userId', '==', uid))),
  ])
  const ids = new Map<string, Record<string, any>>()
  ;[...a.docs, ...b.docs].forEach(d => ids.set(d.id, d.data()))
  for (const [id, data] of ids) {
    const s = normalizeStatus(data.status)
    if (CLOSED.includes(s) || s === 'enrolled') continue
    await shareDocumentsWithApplication(id, uid).catch(() => {})
  }
}
