// app/student/applications/[id]/page.tsx
// One application, end to end: where it stands, what the university has
// published (offer letter, admit card, exam), and what the student must do next.
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import {
  ChevronLeft, Check, Clock, XCircle, FileText, Download, CalendarDays, MapPin,
  Upload, RefreshCw, ShieldCheck, AlertTriangle, PartyPopper, Wallet,
  Building2, History, Loader2, GraduationCap,
} from 'lucide-react'
import { listenApplication } from '@/lib/firebase/applications'
import {
  normalizeStatus, OFFER_STATUSES, WITHDRAWABLE, CLOSED, type AdmissionStatus,
  listenGeneratedDocuments, listenExamSchedules,
  acceptSeat, declineOffer, withdrawApplication, submitFeePayment, shareDetailsWithApplication,
  type GeneratedDoc, type ExamSchedule,
} from '@/lib/firebase/admission'

/* ── vocabulary ─────────────────────────────────────────────────────────── */
const STATUS_META: Record<AdmissionStatus, { label: string; tone: 'brand' | 'gold' | 'green' | 'red' | 'muted' }> = {
  submitted: { label: 'Submitted', tone: 'brand' },
  under_review: { label: 'Under review', tone: 'gold' },
  docs_verified: { label: 'Documents verified', tone: 'brand' },
  waitlisted: { label: 'Waitlisted', tone: 'gold' },
  selected: { label: 'Offer received', tone: 'green' },
  allotted: { label: 'Seat allotted', tone: 'green' },
  seat_accepted: { label: 'Seat accepted', tone: 'green' },
  fee_paid: { label: 'Fee under verification', tone: 'gold' },
  payment_verified: { label: 'Fee verified', tone: 'green' },
  enrolled: { label: 'Enrolled', tone: 'green' },
  rejected: { label: 'Not selected', tone: 'red' },
  offer_declined: { label: 'Offer declined', tone: 'muted' },
  withdrawn: { label: 'Withdrawn', tone: 'muted' },
}
const TONE: Record<string, string> = {
  brand: 'bg-[var(--accent-bg)] text-[var(--accent)] border-[var(--accent-border)]',
  gold: 'bg-[var(--gold-bg)] text-[var(--gold)] border-[color-mix(in_srgb,var(--gold)_20%,transparent)]',
  green: 'bg-[color-mix(in_srgb,var(--green)_10%,transparent)] text-[var(--green)] border-[color-mix(in_srgb,var(--green)_20%,transparent)]',
  red: 'bg-[color-mix(in_srgb,var(--red)_10%,transparent)] text-[var(--red)] border-[color-mix(in_srgb,var(--red)_20%,transparent)]',
  muted: 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border)]',
}

const STEPS: { key: string; label: string; reached: AdmissionStatus[] }[] = [
  { key: 'applied', label: 'Applied', reached: ['submitted', 'under_review', 'docs_verified', 'waitlisted', 'selected', 'allotted', 'seat_accepted', 'fee_paid', 'payment_verified', 'enrolled'] },
  { key: 'review', label: 'Review', reached: ['under_review', 'docs_verified', 'waitlisted', 'selected', 'allotted', 'seat_accepted', 'fee_paid', 'payment_verified', 'enrolled'] },
  { key: 'docs', label: 'Documents verified', reached: ['docs_verified', 'selected', 'allotted', 'seat_accepted', 'fee_paid', 'payment_verified', 'enrolled'] },
  { key: 'offer', label: 'Offer', reached: ['selected', 'allotted', 'seat_accepted', 'fee_paid', 'payment_verified', 'enrolled'] },
  { key: 'seat', label: 'Seat accepted', reached: ['seat_accepted', 'fee_paid', 'payment_verified', 'enrolled'] },
  { key: 'fee', label: 'Fee paid', reached: ['payment_verified', 'enrolled'] },
  { key: 'enrolled', label: 'Enrolled', reached: ['enrolled'] },
]

const DOC_TYPE_LABEL: Record<string, string> = {
  offer_letter: 'Offer letter', admit_card: 'Admit card', enrollment_certificate: 'Enrollment certificate',
}
const DOC_STATUS: Record<string, { label: string; tone: string }> = {
  verified: { label: 'Verified', tone: 'green' },
  rejected: { label: 'Rejected', tone: 'red' },
  requires_resubmission: { label: 'Re-upload needed', tone: 'red' },
  under_review: { label: 'In review', tone: 'gold' },
  pending: { label: 'Waiting for review', tone: 'muted' },
}

const CARD = 'rounded-[28px] border border-[var(--border)] bg-[var(--bg-card)] p-[20px] md:p-[26px] shadow-[var(--shadow-card)]'
const BTN = 'inline-flex h-[42px] items-center justify-center gap-[8px] rounded-full px-[20px] text-[13.5px] font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50'
const INPUT = 'h-[44px] w-full rounded-[14px] border border-[var(--border)] bg-[var(--bg)] px-[14px] text-[14px] text-[var(--text-primary)] outline-none transition focus:border-[var(--accent)]'

function toDate(v: any): Date | null {
  if (!v) return null
  if (typeof v?.toDate === 'function') return v.toDate()
  const d = new Date(v)
  return isNaN(d.getTime()) ? null : d
}
/** Issued documents open as a printable page; very old ones may still have a file link. */
const letterHref = (appId: string, d: GeneratedDoc) => (d.data || !d.url ? `/letter/${appId}/${d.id}` : d.url)

const fmt = (d: Date | null, withTime = false) =>
  d ? d.toLocaleString('en-IN', withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' }) : '—'

/* ── page ───────────────────────────────────────────────────────────────── */
export default function ApplicationDetailsPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const [app, setApp] = useState<Record<string, any> | null>(null)
  const [loading, setLoading] = useState(true)
  const [generated, setGenerated] = useState<GeneratedDoc[]>([])
  const [exams, setExams] = useState<ExamSchedule[]>([])

  useEffect(() => {
    if (!id) return
    const u1 = listenApplication(id, (a) => { setApp(a as any); setLoading(false) }, () => setLoading(false))
    const u2 = listenGeneratedDocuments(id, setGenerated)
    return () => { u1(); u2() }
  }, [id])

  useEffect(() => {
    if (!app?.universityId) return
    return listenExamSchedules(app.universityId, app.programId || undefined, setExams)
  }, [app?.universityId, app?.programId])

  const status = normalizeStatus(app?.status)
  const latest = useMemo(() => {
    const m: Record<string, GeneratedDoc> = {}
    for (const d of generated) if (!m[d.type] || (d.version ?? 0) > (m[d.type].version ?? 0)) m[d.type] = d
    return m
  }, [generated])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-[var(--accent)]" size={32} />
      </div>
    )
  }
  if (!app) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-[16px] text-center">
        <XCircle size={44} strokeWidth={1.5} className="text-[var(--red)]" />
        <h2 className="font-display text-[22px] font-bold">We couldn&apos;t find this application</h2>
        <p className="max-w-[360px] text-[14px] text-[var(--text-secondary)]">It may have been removed, or it belongs to a different account.</p>
        <Link href="/student/applications" className={`${BTN} border border-[var(--border)] bg-[var(--bg-card)]`}>
          <ChevronLeft size={15} /> All applications
        </Link>
      </div>
    )
  }

  const meta = STATUS_META[status] ?? STATUS_META.submitted
  const program = app.programName || app.program || app.courseName || 'Program'
  const uni = app.universityName || 'University'
  const history = [...(app.statusHistory ?? [])].sort((a, b) => (toDate(b.date)?.getTime() ?? 0) - (toDate(a.date)?.getTime() ?? 0))
  const appliedOn = toDate(app.createdAt ?? app.appliedAt)

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="page-in mx-auto w-full max-w-[1120px] px-[16px] pb-[64px] pt-[24px] md:px-[24px]">
        <button onClick={() => router.push('/student/applications')} className="mb-[20px] inline-flex items-center gap-[6px] text-[13px] font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          <ChevronLeft size={16} /> All applications
        </button>

        {/* header */}
        <header className="mb-[24px] flex flex-wrap items-end justify-between gap-[16px]">
          <div className="min-w-0">
            <p className="mb-[6px] flex items-center gap-[8px] text-[13px] text-[var(--text-muted)]">
              <Building2 size={14} /> {uni}
            </p>
            <h1 className="font-display text-[28px] font-bold leading-tight tracking-[-0.02em] md:text-[34px]">{program}</h1>
          </div>
          <span className={`inline-flex items-center gap-[8px] rounded-full border px-[14px] py-[8px] text-[13px] font-semibold ${TONE[meta.tone]}`}>
            <span className="h-[7px] w-[7px] rounded-full bg-current" /> {meta.label}
          </span>
        </header>

        <Journey status={status} />

        <div className="mt-[24px] grid gap-[20px] lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="flex min-w-0 flex-col gap-[20px]">
            <NextStep app={app} status={status} latest={latest} />
            {(latest.admit_card || exams.length > 0) && <ExamCard appId={id} exams={exams} admitCard={latest.admit_card} />}
            <DetailsCard appId={id} snapshot={app.studentProfile} closed={CLOSED.includes(status) || status === 'enrolled'} />
          </div>

          <aside className="flex flex-col gap-[20px]">
            {generated.length > 0 && (
              <section className={CARD}>
                <h2 className="mb-[14px] font-display text-[17px] font-bold">From the university</h2>
                <ul className="flex flex-col gap-[8px]">
                  {Object.values(latest).map(d => (
                    <li key={d.id}>
                      <a href={letterHref(id, d)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-[12px] rounded-[16px] border border-[var(--border)] p-[12px] transition hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)]">
                        <span className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-[var(--accent-bg)] text-[var(--accent)]"><FileText size={16} /></span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-[13.5px] font-semibold">{DOC_TYPE_LABEL[d.type] ?? d.type}</span>
                          <span className="block text-[12px] text-[var(--text-muted)]">Issued {fmt(toDate(d.generatedAt))}{d.version && d.version > 1 ? ` · v${d.version}` : ''}</span>
                        </span>
                        <Download size={15} className="text-[var(--text-muted)]" />
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className={CARD}>
              <h2 className="mb-[14px] flex items-center gap-[8px] font-display text-[17px] font-bold"><History size={16} /> Activity</h2>
              {history.length === 0 ? (
                <p className="text-[13px] text-[var(--text-muted)]">Applied {fmt(appliedOn)}. Updates from the university will show here.</p>
              ) : (
                <ol className="relative ml-[6px] flex flex-col gap-[16px] border-l border-[var(--border)] pl-[18px]">
                  {history.slice(0, 8).map((h, i) => {
                    const s = normalizeStatus(h.status)
                    return (
                      <li key={i} className="relative">
                        <span className={`absolute -left-[24px] top-[5px] h-[11px] w-[11px] rounded-full border-2 border-[var(--bg-card)] ${i === 0 ? 'bg-[var(--accent)]' : 'bg-[var(--border-hover)]'}`} />
                        <p className="text-[13px] font-semibold">{STATUS_META[s]?.label ?? h.status}</p>
                        {h.note && <p className="text-[12.5px] leading-snug text-[var(--text-secondary)]">{h.note}</p>}
                        <p className="text-[11.5px] text-[var(--text-muted)]">{fmt(toDate(h.date), true)}</p>
                      </li>
                    )
                  })}
                </ol>
              )}
            </section>

            <section className={`${CARD} text-[13px]`}>
              <dl className="grid grid-cols-[auto_1fr] gap-x-[16px] gap-y-[10px]">
                <dt className="text-[var(--text-muted)]">Applied on</dt><dd className="text-right font-medium">{fmt(appliedOn)}</dd>
                <dt className="text-[var(--text-muted)]">Reference</dt><dd className="truncate text-right font-mono text-[12px]">{id.slice(0, 10).toUpperCase()}</dd>
              </dl>
            </section>
          </aside>
        </div>
      </div>
    </ProtectedRoute>
  )
}

/* ── journey stepper ────────────────────────────────────────────────────── */
function Journey({ status }: { status: AdmissionStatus }) {
  const closed = CLOSED.includes(status)
  const lastReached = STEPS.reduce((acc, s, i) => (s.reached.includes(status) ? i : acc), 0)
  return (
    <div className={`${CARD} overflow-x-auto`}>
      <ol className="flex min-w-[640px] items-start">
        {STEPS.map((s, i) => {
          const done = i < lastReached || (i === lastReached && (status === 'enrolled'))
          const current = i === lastReached && !done
          const tone = closed && current ? 'red' : done ? 'done' : current ? 'current' : 'todo'
          return (
            <li key={s.key} className="relative flex flex-1 flex-col items-center text-center">
              {i > 0 && <span className={`absolute right-1/2 top-[15px] h-[3px] w-full rounded-full ${i <= lastReached ? 'bg-[var(--accent)]' : 'bg-[var(--border)]'}`} />}
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.05 }}
                className={`relative z-10 flex h-[32px] w-[32px] items-center justify-center rounded-full text-[12px] font-bold ${
                  tone === 'done' ? 'bg-[var(--accent)] text-white'
                    : tone === 'current' ? 'bg-[var(--bg-card)] text-[var(--accent)] ring-[3px] ring-[var(--accent)]'
                    : tone === 'red' ? 'bg-[var(--red)] text-white'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'}`}
              >
                {tone === 'done' ? <Check size={15} strokeWidth={3} /> : tone === 'red' ? <XCircle size={15} /> : i + 1}
              </motion.span>
              <span className={`mt-[8px] text-[12px] font-semibold ${tone === 'todo' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'}`}>{s.label}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

/* ── the one thing to do next ───────────────────────────────────────────── */
function NextStep({ app, status, latest }: { app: Record<string, any>; status: AdmissionStatus; latest: Record<string, GeneratedDoc> }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'idle' | 'decline' | 'withdraw' | 'accept'>('idle')
  const [reason, setReason] = useState('')

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError('')
    try { await fn(); setMode('idle'); setReason('') } catch (e: any) { setError(e?.message || 'Something went wrong. Try again.') } finally { setBusy(false) }
  }

  const night = 'relative overflow-hidden rounded-[28px] bg-[var(--night)] p-[24px] text-white md:p-[30px] shadow-[0_30px_70px_-30px_rgba(22,19,38,0.8)]'
  const glow = <div aria-hidden className="pointer-events-none absolute -right-[80px] -top-[80px] h-[260px] w-[260px] rounded-full bg-[#4B2FC9] opacity-60 blur-[90px]" />
  const errorLine = error && <p role="alert" className="mt-[12px] flex items-center gap-[6px] text-[13px] font-medium text-[#FF8A8D]"><AlertTriangle size={14} /> {error}</p>

  /* offer in hand */
  if (OFFER_STATUSES.includes(status)) {
    return (
      <section className={night}>
        {glow}
        <div className="relative">
          <span className="inline-flex items-center gap-[6px] rounded-full bg-[#F5B829] px-[12px] py-[5px] text-[12px] font-bold text-[#17142B]"><PartyPopper size={13} /> {status === 'allotted' ? 'Seat allotted' : 'Offer received'}</span>
          <h2 className="mt-[14px] font-display text-[26px] font-bold leading-tight">Congratulations — {app.universityName || 'the university'} wants you.</h2>
          <p className="mt-[8px] max-w-[520px] text-[14px] text-white/65">Read the offer letter, then accept the seat to move on to fee payment. If you&apos;ve chosen another college, decline so the seat goes to someone on the waitlist.</p>
          <div className="mt-[20px] h-[6px] w-full overflow-hidden rounded-full bg-white/10"><div className="h-full w-full rounded-full bg-[#F5B829]" /></div>

          <AnimatePresence mode="wait" initial={false}>
            {mode === 'decline' ? (
              <motion.div key="decline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-[20px]">
                <label className="mb-[6px] block text-[13px] font-semibold" htmlFor="decline-reason">Why are you declining? (optional)</label>
                <input id="decline-reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Joining another college" className="h-[44px] w-full rounded-[14px] border border-white/15 bg-white/[0.06] px-[14px] text-[14px] text-white outline-none placeholder:text-white/35 focus:border-white/40" />
                <p className="mt-[8px] text-[12.5px] text-white/55">This can&apos;t be undone — the university will release your seat.</p>
                <div className="mt-[14px] flex flex-wrap gap-[10px]">
                  <button disabled={busy} onClick={() => run(() => declineOffer(app.id, reason.trim()))} className={`${BTN} bg-[var(--red)] text-white`}>{busy ? <Loader2 size={15} className="animate-spin" /> : null} Decline offer</button>
                  <button disabled={busy} onClick={() => setMode('idle')} className={`${BTN} border border-white/20 text-white`}>Keep the offer</button>
                </div>
              </motion.div>
            ) : mode === 'accept' ? (
              <motion.div key="accept" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-[20px]">
                <p className="text-[14px] text-white/80">Accepting confirms you&apos;ll take this seat. Next, you&apos;ll pay the admission fee and enter the payment reference.</p>
                <div className="mt-[14px] flex flex-wrap gap-[10px]">
                  <button disabled={busy} onClick={() => run(() => acceptSeat(app.id))} className={`${BTN} bg-[#F5B829] text-[#17142B]`}>{busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Yes, accept the seat</button>
                  <button disabled={busy} onClick={() => setMode('idle')} className={`${BTN} border border-white/20 text-white`}>Not yet</button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-[20px] flex flex-wrap gap-[10px]">
                {latest.offer_letter && (
                  <a href={letterHref(app.id, latest.offer_letter)} target="_blank" rel="noopener noreferrer" className={`${BTN} bg-white text-[#17142B]`}><Download size={15} /> Offer letter</a>
                )}
                <button onClick={() => setMode('accept')} className={`${BTN} bg-[#F5B829] text-[#17142B]`}>Accept seat</button>
                <button onClick={() => setMode('decline')} className={`${BTN} border border-white/20 text-white/85 hover:bg-white/10`}>Decline</button>
              </motion.div>
            )}
          </AnimatePresence>
          {errorLine}
        </div>
      </section>
    )
  }

  /* pay the fee */
  if (status === 'seat_accepted') return <FeeForm app={app} />

  /* fee submitted, waiting */
  if (status === 'fee_paid') {
    const p = app.paymentDetails ?? {}
    return (
      <section className={CARD}>
        <div className="flex items-start gap-[14px]">
          <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[14px] bg-[var(--gold-bg)] text-[var(--gold)]"><Clock size={20} /></span>
          <div className="min-w-0">
            <h2 className="font-display text-[20px] font-bold">Your payment is being checked</h2>
            <p className="mt-[4px] text-[14px] text-[var(--text-secondary)]">The admissions office matches your reference number with their bank statement. This usually takes 1–3 working days.</p>
            <dl className="mt-[16px] grid grid-cols-2 gap-[12px] text-[13px] sm:grid-cols-3">
              <div><dt className="text-[var(--text-muted)]">Amount</dt><dd className="font-semibold">₹{Number(p.amountPaid || 0).toLocaleString('en-IN')}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Reference</dt><dd className="truncate font-mono font-semibold">{p.transactionRef || '—'}</dd></div>
              <div><dt className="text-[var(--text-muted)]">Submitted</dt><dd className="font-semibold">{fmt(toDate(p.submittedAt))}</dd></div>
            </dl>
          </div>
        </div>
      </section>
    )
  }

  if (status === 'payment_verified' || status === 'enrolled') {
    const cert = latest.enrollment_certificate
    return (
      <section className={night}>
        {glow}
        <div className="relative">
          <span className="flex h-[48px] w-[48px] items-center justify-center rounded-[16px] bg-[#F5B829] text-[#17142B]"><GraduationCap size={22} /></span>
          <h2 className="mt-[14px] font-display text-[26px] font-bold">{status === 'enrolled' ? `You're enrolled at ${app.universityName || 'the university'}.` : 'Fee received. Enrollment is next.'}</h2>
          <p className="mt-[8px] max-w-[520px] text-[14px] text-white/65">
            {status === 'enrolled' ? 'Keep your enrollment certificate handy for hostel allotment and the first day of classes.' : 'The university has verified your payment and will confirm your enrollment shortly.'}
          </p>
          {cert && <a href={letterHref(app.id, cert)} target="_blank" rel="noopener noreferrer" className={`${BTN} mt-[20px] bg-white text-[#17142B]`}><Download size={15} /> Enrollment certificate</a>}
        </div>
      </section>
    )
  }

  if (CLOSED.includes(status)) {
    const copy: Record<string, [string, string]> = {
      rejected: ['This application wasn’t successful', app.rejectionReason || 'The university didn’t offer a seat this time. Your profile stays ready for other applications.'],
      offer_declined: ['You declined this offer', 'The university has been told, and the seat has been released.'],
      withdrawn: ['You withdrew this application', 'The university will no longer process it.'],
    }
    const [title, body] = copy[status]
    return (
      <section className={CARD}>
        <h2 className="font-display text-[20px] font-bold">{title}</h2>
        <p className="mt-[6px] text-[14px] text-[var(--text-secondary)]">{body}</p>
        <Link href="/student/universities" className={`${BTN} mt-[16px] bg-[var(--accent)] text-white`}>Find other universities</Link>
      </section>
    )
  }

  /* still under consideration */
  const reviewCopy: Record<string, string> = {
    submitted: 'Your application has reached the admissions office. They’ll start by checking your documents.',
    under_review: 'The admissions office is reviewing your application and documents.',
    docs_verified: 'Your documents are verified. The university will publish its decision next.',
    waitlisted: 'You’re on the waitlist. If a seat opens up, your status changes to “Offer received”.',
  }
  return (
    <section className={CARD}>
      <div className="flex items-start gap-[14px]">
        <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[14px] bg-[var(--accent-bg)] text-[var(--accent)]"><ShieldCheck size={20} /></span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-[20px] font-bold">Nothing to do right now</h2>
          <p className="mt-[4px] text-[14px] text-[var(--text-secondary)]">{reviewCopy[status] ?? reviewCopy.submitted} We&apos;ll notify you the moment anything changes.</p>
        </div>
      </div>
      {WITHDRAWABLE.includes(status) && (
        <div className="mt-[18px] border-t border-[var(--border)] pt-[16px]">
          {mode === 'withdraw' ? (
            <div>
              <label htmlFor="withdraw-reason" className="mb-[6px] block text-[13px] font-semibold">Reason for withdrawing (optional)</label>
              <input id="withdraw-reason" className={INPUT} value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Got admission elsewhere" />
              <p className="mt-[8px] text-[12.5px] text-[var(--text-muted)]">Withdrawing can&apos;t be undone. You&apos;d need to apply again.</p>
              <div className="mt-[12px] flex flex-wrap gap-[10px]">
                <button disabled={busy} onClick={() => run(() => withdrawApplication(app.id, reason.trim()))} className={`${BTN} bg-[var(--red)] text-white`}>{busy && <Loader2 size={15} className="animate-spin" />} Withdraw application</button>
                <button disabled={busy} onClick={() => setMode('idle')} className={`${BTN} border border-[var(--border)]`}>Cancel</button>
              </div>
            </div>
          ) : (
            <button onClick={() => setMode('withdraw')} className="text-[13px] font-semibold text-[var(--text-muted)] underline-offset-4 hover:text-[var(--red)] hover:underline">Withdraw this application</button>
          )}
          {error && <p role="alert" className="mt-[10px] text-[13px] font-medium text-[var(--red)]">{error}</p>}
        </div>
      )}
    </section>
  )
}

/* ── manual fee payment ─────────────────────────────────────────────────── */
function FeeForm({ app }: { app: Record<string, any> }) {
  const rejected = app.paymentDetails?.status === 'rejected'
  const [amount, setAmount] = useState('')
  const [ref, setRef] = useState('')
  const [paidOn, setPaidOn] = useState(() => new Date().toISOString().slice(0, 10))
  const [mode, setMode] = useState('UPI')
  const [payer, setPayer] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try {
      await submitFeePayment(app.id, { amount: Number(amount), transactionRef: ref, paidOn, mode, payerName: payer })
    } catch (err: any) { setError(err?.message || 'Couldn\u2019t submit. Check your connection and try again.') } finally { setBusy(false) }
  }

  return (
    <section className={CARD}>
      <div className="flex items-start gap-[14px]">
        <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[14px] bg-[var(--gold-bg)] text-[var(--gold)]"><Wallet size={20} /></span>
        <div>
          <h2 className="font-display text-[20px] font-bold">Pay the admission fee</h2>
          <p className="mt-[4px] text-[14px] text-[var(--text-secondary)]">Pay using the bank or UPI details in your offer letter, then enter the transaction reference here. The admissions office matches it with their bank statement.</p>
        </div>
      </div>
      {rejected && (
        <div className="mt-[16px] flex gap-[10px] rounded-[16px] border border-[color-mix(in_srgb,var(--red)_25%,transparent)] bg-[color-mix(in_srgb,var(--red)_7%,transparent)] p-[14px] text-[13px]">
          <AlertTriangle size={16} className="mt-[1px] shrink-0 text-[var(--red)]" />
          <p><span className="font-semibold text-[var(--red)]">Your last payment couldn&apos;t be verified.</span> {app.paymentDetails?.rejectionReason || 'Check the reference number and amount, then submit again.'}</p>
        </div>
      )}
      <form onSubmit={submit} className="mt-[18px] grid gap-[14px] sm:grid-cols-2">
        <label className="text-[13px] font-semibold">Amount paid (₹)
          <input required type="number" min={1} inputMode="numeric" value={amount} onChange={e => setAmount(e.target.value)} className={`${INPUT} mt-[6px] font-normal`} placeholder="e.g. 50000" />
        </label>
        <label className="text-[13px] font-semibold">Paid on
          <input required type="date" value={paidOn} max={new Date().toISOString().slice(0, 10)} onChange={e => setPaidOn(e.target.value)} className={`${INPUT} mt-[6px] font-normal`} />
        </label>
        <label className="text-[13px] font-semibold">Payment method
          <select value={mode} onChange={e => setMode(e.target.value)} className={`${INPUT} mt-[6px] font-normal`}>
            {['UPI', 'NEFT / RTGS / IMPS', 'Demand draft', 'Card', 'Cash at campus'].map(m => <option key={m}>{m}</option>)}
          </select>
        </label>
        <label className="text-[13px] font-semibold">Transaction / UTR reference
          <input required value={ref} onChange={e => setRef(e.target.value)} className={`${INPUT} mt-[6px] font-mono font-normal`} placeholder="e.g. 412345678901" />
        </label>
        <label className="sm:col-span-2 text-[13px] font-semibold">Paid by (name on the bank account / UPI) <span className="font-normal text-[var(--text-muted)]">— optional</span>
          <input value={payer} onChange={e => setPayer(e.target.value)} className={`${INPUT} mt-[6px] font-normal`} placeholder="e.g. Rakesh Sharma" />
        </label>
        {error && <p role="alert" className="sm:col-span-2 text-[13px] font-medium text-[var(--red)]">{error}</p>}
        <div className="sm:col-span-2">
          <button type="submit" disabled={busy} className={`${BTN} bg-[var(--accent)] text-white shadow-[var(--shadow-glow)]`}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Submit payment for verification
          </button>
        </div>
      </form>
    </section>
  )
}

/* ── exam / admit card ──────────────────────────────────────────────────── */
function ExamCard({ appId, exams, admitCard }: { appId: string; exams: ExamSchedule[]; admitCard?: GeneratedDoc }) {
  return (
    <section className={CARD}>
      <div className="mb-[14px] flex flex-wrap items-center justify-between gap-[10px]">
        <h2 className="font-display text-[18px] font-bold">Entrance test / interview</h2>
        {admitCard && <a href={letterHref(appId, admitCard)} target="_blank" rel="noopener noreferrer" className={`${BTN} h-[36px] bg-[var(--accent)] px-[16px] text-white`}><Download size={14} /> Admit card</a>}
      </div>
      {exams.length === 0 ? (
        <p className="text-[13.5px] text-[var(--text-secondary)]">Your admit card is ready. The schedule will appear here when the university publishes it.</p>
      ) : (
        <ul className="flex flex-col gap-[10px]">
          {exams.map(x => (
            <li key={x.id} className="flex gap-[14px] rounded-[18px] bg-[var(--bg-subtle)] p-[14px]">
              <span className="w-[4px] shrink-0 rounded-full bg-[var(--accent)]" />
              <div className="min-w-0 text-[13.5px]">
                <p className="flex flex-wrap items-center gap-x-[14px] gap-y-[4px] font-semibold">
                  <span className="inline-flex items-center gap-[6px]"><CalendarDays size={14} /> {x.date ? new Date(x.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) : 'Date to be announced'}{x.time ? `, ${x.time}` : ''}</span>
                  {x.center && <span className="inline-flex items-center gap-[6px]"><MapPin size={14} /> {x.center}</span>}
                </p>
                {x.instructions && <p className="mt-[6px] whitespace-pre-line text-[var(--text-secondary)]">{x.instructions}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

/* ── details the university sees ─────────────────────────────────────────── */
const DETAIL_LABELS: [string, string][] = [
  ['tenthScore', '10th %'], ['twelfthScore', '12th %'], ['twelfthBoard', '12th board'], ['stream', 'Stream'],
  ['jeeScore', 'JEE Main'], ['neetScore', 'NEET'], ['cuetScore', 'CUET'], ['bitsatScore', 'BITSAT'], ['nataScore', 'NATA'],
  ['clatScore', 'CLAT'], ['catPercentile', 'CAT'], ['gateScore', 'GATE'], ['category', 'Category'], ['domicileState', 'Domicile'],
]

function DetailsCard({ appId, snapshot, closed }: { appId: string; snapshot?: Record<string, string>; closed: boolean }) {
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const shown = DETAIL_LABELS.filter(([k]) => snapshot?.[k])

  const share = async () => {
    setBusy(true); setNote('')
    try {
      await shareDetailsWithApplication(appId)
      setNote('The university now has your latest details.')
    } catch { setNote('Couldn\u2019t send your details. Try again in a moment.') } finally { setBusy(false) }
  }

  return (
    <section className={CARD}>
      <div className="mb-[14px] flex flex-wrap items-center justify-between gap-[10px]">
        <div>
          <h2 className="font-display text-[18px] font-bold">Details the university sees</h2>
          <p className="text-[13px] text-[var(--text-muted)]">
            From your profile{snapshot?.sharedAt ? `, last sent ${new Date(snapshot.sharedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}. Original documents are checked at admission.
          </p>
        </div>
        {!closed && (
          <button onClick={share} disabled={busy} className={`${BTN} h-[36px] border border-[var(--border)] px-[14px]`}>
            <RefreshCw size={14} className={busy ? 'animate-spin' : ''} /> Send latest
          </button>
        )}
      </div>
      {shown.length === 0 ? (
        <div className="rounded-[18px] border-2 border-dashed border-[var(--border)] p-[20px] text-center text-[13.5px]">
          <p className="font-semibold">The university can&apos;t see your marks yet.</p>
          <p className="mt-[4px] text-[var(--text-muted)]">Add your Class 10/12 marks and exam scores to your profile, then press <span className="font-semibold">Send latest</span>.</p>
          <Link href="/student/profile" className={`${BTN} mt-[14px] bg-[var(--accent)] text-white`}>Fill in my details</Link>
        </div>
      ) : (
        <dl className="grid grid-cols-2 gap-[8px] sm:grid-cols-3">
          {shown.map(([k, label]) => (
            <div key={k} className="rounded-[14px] bg-[var(--bg-subtle)] p-[10px]">
              <dt className="text-[11.5px] text-[var(--text-muted)]">{label}</dt>
              <dd className="truncate text-[14px] font-semibold">{snapshot![k]}</dd>
            </div>
          ))}
        </dl>
      )}
      <p className="mt-[12px] text-[12px] text-[var(--text-muted)]">DigiLocker verification is coming soon — you won&apos;t need to upload marksheets.</p>
      {note && <p className="mt-[8px] text-[13px] text-[var(--text-secondary)]" role="status">{note}</p>}
    </section>
  )
}
