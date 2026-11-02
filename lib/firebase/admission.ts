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
  serverTimestamp, updateDoc, addDoc,
} from 'firebase/firestore'
import { auth, db } from './config'
import { normalizeProfile } from '@/lib/utils/profileFields'

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

/** Issued by the university. `data` holds the letter's contents; the PDF is rendered on demand. */
export interface GeneratedDoc { id: string; type: 'offer_letter' | 'admit_card' | 'enrollment_certificate' | string; data?: Record<string, string>; url?: string; version?: number; generatedAt?: any; generatedBy?: string }
export interface ExamSchedule { id: string; programId: string; universityId: string; date?: string; time?: string; center?: string; instructions?: string }

// ── Listeners ───────────────────────────────────────────────────────────────
export function listenGeneratedDocuments(appId: string, cb: (docs: GeneratedDoc[]) => void) {
  return onSnapshot(collection(db, `applications/${appId}/generated_documents`),
    (snap) => cb(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })).sort((a, b) => (b.version ?? 0) - (a.version ?? 0))),
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

/**
 * Records a fee payment made outside EDUING (UPI / bank transfer / DD). No receipt
 * file is stored — the admissions office matches the reference number with its bank statement.
 */
export async function submitFeePayment(appId: string, input: { amount: number; transactionRef: string; paidOn: string; mode: string; payerName?: string }) {
  await loadOwnedApplication(appId)
  if (!(input.amount > 0)) throw new Error('Enter the amount you paid.')
  const ref = input.transactionRef.trim()
  if (ref.length < 6) throw new Error('Enter the full transaction / UTR reference from your bank or UPI app.')
  const app = await transition(appId, ['seat_accepted'], 'fee_paid', `Fee payment submitted (ref ${ref})`, {
    paymentDetails: {
      amountPaid: input.amount,
      transactionRef: ref,
      paidOn: input.paidOn,
      mode: input.mode,
      payerName: input.payerName?.trim() || '',
      submittedAt: new Date().toISOString(),
      status: 'submitted',
    },
  })
  await notifyUniversity(app, 'Fee payment submitted', `${app.studentName || 'A student'} submitted a fee payment of ₹${input.amount.toLocaleString('en-IN')} (ref ${ref}) for verification.`)
}

// ── Details shared with universities ───────────────────────────────────────
// Students don't upload files. What the university sees is a snapshot of the
// details the student declared in their profile (marks, exams, category …),
// saved on the application as `studentProfile`. DigiLocker will verify them later.
export const SHARED_PROFILE_KEYS = [
  'fullName', 'phone', 'dob', 'gender', 'nationality', 'category', 'pwd', 'domicileState',
  'address', 'city', 'state', 'pincode',
  'guardianName', 'guardianRelation', 'guardianPhone', 'annualIncome',
  'tenthBoard', 'tenthYear', 'tenthScore', 'school', 'twelfthBoard', 'stream', 'twelfthYear', 'twelfthScore',
  'jeeScore', 'neetScore', 'cuetScore', 'bitsatScore', 'nataScore', 'clatScore', 'catPercentile', 'gateScore',
] as const

export function buildProfileSnapshot(raw: Record<string, any> | null | undefined) {
  const p = normalizeProfile(raw ?? {}) ?? {}
  const out: Record<string, string> = {}
  for (const k of SHARED_PROFILE_KEYS) {
    const v = p[k]
    if (v !== undefined && v !== null && String(v).trim() !== '') out[k] = String(v).trim()
  }
  out.sharedAt = new Date().toISOString()
  return out
}

/** Sends the student's current profile details to one application. */
export async function shareDetailsWithApplication(appId: string) {
  const { user, data } = await loadOwnedApplication(appId)
  const status = normalizeStatus(data.status)
  if (CLOSED.includes(status) || status === 'enrolled') return
  const profileSnap = await getDoc(doc(db, 'users', user.uid))
  await updateDoc(doc(db, 'applications', appId), {
    studentProfile: buildProfileSnapshot(profileSnap.exists() ? profileSnap.data() : {}),
    updatedAt: serverTimestamp(),
  })
}

/** Keeps every in-progress application up to date after the student edits their profile. */
export async function shareDetailsWithActiveApplications(uid: string) {
  const [a, b, profileSnap] = await Promise.all([
    getDocs(query(collection(db, 'applications'), where('studentId', '==', uid))),
    getDocs(query(collection(db, 'applications'), where('userId', '==', uid))),
    getDoc(doc(db, 'users', uid)),
  ])
  const snapshot = buildProfileSnapshot(profileSnap.exists() ? profileSnap.data() : {})
  const apps = new Map<string, Record<string, any>>()
  ;[...a.docs, ...b.docs].forEach(d => apps.set(d.id, d.data()))
  for (const [id, data] of apps) {
    const s = normalizeStatus(data.status)
    if (CLOSED.includes(s) || s === 'enrolled') continue
    await updateDoc(doc(db, 'applications', id), { studentProfile: snapshot, updatedAt: serverTimestamp() }).catch(() => {})
  }
}
