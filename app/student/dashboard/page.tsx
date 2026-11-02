// app/student/dashboard/page.tsx
// The student's admission HQ — same layout as the dashboard shown on eduing.in:
// greeting + stream cards, three progress rings, "Your applications",
// the best-fit university, the College Predictor, a calendar strip and the nearest deadline.
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  AlertCircle, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, Gauge, Plus, RefreshCw, Sparkles,
} from 'lucide-react'
import { collection, getDocs, limit, query } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { recommendUniversities } from '@/lib/utils/recommendationEngine'
import { generateDeadlineInsights } from '@/lib/utils/deadlineEngine'
import { normalizeStatus, OFFER_STATUSES, CLOSED, listenExamSchedules, type AdmissionStatus, type ExamSchedule } from '@/lib/firebase/admission'

const EASE = [0.16, 1, 0.3, 1] as const
const CARD = 'rounded-[26px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]'

/* ── streams ─────────────────────────────────────────────────────────────── */
type StreamKey = 'engineering' | 'medical' | 'management' | 'design' | 'law'
const STREAMS: { key: StreamKey; label: string; test: RegExp }[] = [
  { key: 'engineering', label: 'Engineering', test: /b\.?\s?tech|\bb\.?e\b|m\.?\s?tech|engineering|computer|electr|mechanic|civil/i },
  { key: 'medical', label: 'Medical', test: /mbbs|bds|nursing|pharm|medical|medicine|bams|bhms|physio|paramedic/i },
  { key: 'management', label: 'Management', test: /mba|bba|pgdm|management|business|commerce|b\.?com/i },
  { key: 'design', label: 'Design & Arch', test: /b\.?\s?des|b\.?\s?arch|design|architecture|fashion|planning/i },
  { key: 'law', label: 'Law', test: /llb|llm|\blaw\b|legal|b\.?a\.?\s?ll/i },
]
const STREAM_STORE = 'eduing.dashboard.stream'

function guessStream(profile: Record<string, any> | null): StreamKey {
  const hay = `${profile?.preferredPrograms ?? ''} ${profile?.preferredBranch ?? ''} ${profile?.stream ?? ''}`
  if (/pcb|bio|neet|mbbs|medic/i.test(hay) || profile?.neetScore) return 'medical'
  for (const s of STREAMS) if (s.test.test(hay)) return s.key
  return 'engineering'
}

/* ── playful tiles, same shapes as the landing page mockup ───────────────── */
function Shapes({ v }: { v: number }) {
  const sets = [
    <g key="a"><circle cx="34" cy="34" r="20" fill="#F5B829" /><rect x="52" y="20" width="34" height="34" rx="8" fill="#4B2FC9" transform="rotate(12 69 37)" /><circle cx="70" cy="62" r="7" fill="currentColor" /></g>,
    <g key="b"><path d="M14 64 L44 14 L74 64Z" fill="#7C66F6" /><circle cx="70" cy="34" r="16" fill="#F5B829" /><rect x="22" y="44" width="22" height="22" rx="6" fill="currentColor" /></g>,
    <g key="c"><rect x="16" y="16" width="40" height="40" rx="20" fill="#4B2FC9" /><rect x="46" y="34" width="34" height="26" rx="6" fill="#F5B829" /><circle cx="30" cy="66" r="6" fill="#F46846" /></g>,
    <g key="d"><path d="M20 60 Q 46 6 76 46" stroke="currentColor" strokeWidth="9" fill="none" strokeLinecap="round" /><circle cx="26" cy="28" r="12" fill="#F5B829" /><rect x="54" y="52" width="22" height="16" rx="5" fill="#7C66F6" /></g>,
  ]
  return <svg viewBox="0 0 90 80" aria-hidden className="h-[64px] w-[76px] transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110">{sets[v % 4]}</svg>
}

/* ── journey progress per status (matches the application detail stepper) ─ */
const STAGE: Record<AdmissionStatus, number> = {
  submitted: 1, under_review: 2, waitlisted: 2, docs_verified: 3, selected: 4, allotted: 4,
  seat_accepted: 5, fee_paid: 5, payment_verified: 6, enrolled: 7, rejected: 0, offer_declined: 0, withdrawn: 0,
}
const STAGE_LABEL: Record<AdmissionStatus, string> = {
  submitted: 'Submitted', under_review: 'Under review', waitlisted: 'Waitlisted', docs_verified: 'Docs verified',
  selected: 'Offer 🎉', allotted: 'Seat allotted 🎉', seat_accepted: 'Pay fee', fee_paid: 'Fee in review',
  payment_verified: 'Fee verified', enrolled: 'Enrolled', rejected: 'Not selected', offer_declined: 'Declined', withdrawn: 'Withdrawn',
}
const ACTION: Partial<Record<AdmissionStatus, string>> = {
  selected: 'Accept offer', allotted: 'Accept seat', seat_accepted: 'Pay admission fee',
}
const urgency = (s: AdmissionStatus) => (OFFER_STATUSES.includes(s) ? 0 : s === 'seat_accepted' ? 1 : CLOSED.includes(s) ? 9 : 5)

function toDate(v: any): Date | null {
  if (!v) return null
  const d = typeof v?.toDate === 'function' ? v.toDate() : typeof v?.seconds === 'number' ? new Date(v.seconds * 1000) : new Date(v)
  return isNaN(d.getTime()) ? null : d
}
function ago(d: Date | null) {
  if (!d) return ''
  const s = Math.floor((Date.now() - d.getTime()) / 1000)
  if (s < 3600) return `${Math.max(1, Math.floor(s / 60))}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

/* ── progress ring ───────────────────────────────────────────────────────── */
function Ring({ pct, label, sub, next, color, href, delay }: { pct: number; label: string; sub: string; next: string; color: string; href: string; delay: number }) {
  const c = 2 * Math.PI * 22
  return (
    <Link href={href} className={`${CARD} group flex items-center gap-[14px] p-[14px] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]`}>
      <span className="relative shrink-0">
        <svg viewBox="0 0 56 56" className="h-[58px] w-[58px] -rotate-90" aria-hidden>
          <circle cx="28" cy="28" r="22" fill="none" strokeWidth="6" style={{ stroke: 'var(--border)' }} />
          <motion.circle cx="28" cy="28" r="22" fill="none" strokeWidth="6" strokeLinecap="round" style={{ stroke: color }}
            strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - Math.min(100, pct) / 100) }}
            transition={{ duration: 1.5, delay, ease: EASE }} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[12px] font-bold">{pct}%</span>
      </span>
      <span className="min-w-0">
        <span className="block text-[11px] font-semibold text-[var(--text-faint)]">{sub}</span>
        <span className="block text-[15px] font-bold leading-tight">{label}</span>
        <span className="block truncate text-[12px] text-[var(--text-muted)]">{next}</span>
      </span>
    </Link>
  )
}

/* ── page ────────────────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const {
    loading, error, profile, uniqueApps, profileScore, profileStrength, universities,
    deadlines, documents, savedPrograms,
  } = useStudentData()

  const [stream, setStream] = useState<StreamKey | null>(null)
  const [programs, setPrograms] = useState<any[] | null>(null)
  const [exams, setExams] = useState<Record<string, ExamSchedule[]>>({})
  const [weekOffset, setWeekOffset] = useState(0)

  // stream: remembered choice, else guessed from the profile
  useEffect(() => {
    if (stream || loading) return
    let saved: string | null = null
    try { saved = localStorage.getItem(STREAM_STORE) } catch { /* private mode */ }
    setStream((STREAMS.find(s => s.key === saved)?.key) ?? guessStream(profile))
  }, [loading, profile, stream])
  const pickStream = (k: StreamKey) => { setStream(k); try { localStorage.setItem(STREAM_STORE, k) } catch { /* ignore */ } }

  // programs power the stream cards, the best-fit university and program deadlines
  useEffect(() => {
    getDocs(query(collection(db, 'programs'), limit(400)))
      .then(s => setPrograms(s.docs.map(d => ({ id: d.id, ...d.data() })).filter((p: any) => p.isActive !== false && p.status !== 'inactive')))
      .catch(() => setPrograms([]))
  }, [])

  const apps = useMemo(() => (uniqueApps ?? []).map((a: any) => ({ ...a, s: normalizeStatus(a.status) as AdmissionStatus }) as Record<string, any> & { s: AdmissionStatus }), [uniqueApps])
  const active = apps.filter(a => !CLOSED.includes(a.s))

  // exam schedules for universities the student is still in the running for
  const activeUniIds = useMemo(() => Array.from(new Set(active.map(a => a.universityId).filter(Boolean))).sort().join(','), [active])
  useEffect(() => {
    if (!activeUniIds) return
    const unsubs = activeUniIds.split(',').map(id => listenExamSchedules(id, undefined, list => setExams(prev => ({ ...prev, [id]: list }))))
    return () => unsubs.forEach(u => u())
  }, [activeUniIds])

  const streamDef = STREAMS.find(s => s.key === stream) ?? STREAMS[0]
  const uniById = useMemo(() => new Map((universities ?? []).map((u: any) => [u.id, u])), [universities])
  const streamPrograms = useMemo(() => (programs ?? []).filter(p => streamDef.test.test(`${p.name ?? ''} ${p.level ?? ''} ${p.department ?? ''}`)), [programs, streamDef])

  const streamUnis = useMemo(() => {
    const ids = new Set(streamPrograms.map(p => p.universityId))
    return (universities ?? [])
      .filter((u: any) => ids.size === 0 || ids.has(u.id))
      .sort((a: any, b: any) => Number(!!b.isFeatured) - Number(!!a.isFeatured) || parseFloat(b.rating ?? 0) - parseFloat(a.rating ?? 0))
      .slice(0, 4)
  }, [universities, streamPrograms])

  const predictorSummary = (profile as any)?.predictorSummary as { likelySeat?: string; anySeat?: number | null } | undefined

  const match = useMemo(() => {
    const appliedUnis = new Set(active.map(a => a.universityId))
    const pool = (universities ?? []).filter((u: any) => !appliedUnis.has(u.id) && (streamPrograms.length === 0 || streamPrograms.some(p => p.universityId === u.id)))
    return recommendUniversities(pool, { profile, documents: documents ?? [], savedPrograms: savedPrograms ?? [], applications: apps, profileScore: profileScore ?? 0 })[0] ?? null
  }, [universities, streamPrograms, profile, documents, savedPrograms, apps, active, profileScore])

  // calendar events: published exams + personal deadlines + open program deadlines in this stream
  const events = useMemo(() => {
    const out: { date: Date; title: string; sub: string; tone: string; href: string }[] = []
    const today = new Date(); today.setHours(0, 0, 0, 0)
    for (const a of active) {
      for (const x of exams[a.universityId] ?? []) {
        if (x.programId && a.programId && x.programId !== a.programId) continue
        const d = toDate(x.date)
        if (d && d >= today) out.push({ date: d, title: `${a.universityName ?? 'University'} test`, sub: [x.time, x.center].filter(Boolean).join(' · ') || 'Entrance test / interview', tone: 'var(--accent)', href: `/student/applications/${a.id}` })
      }
    }
    const { insights } = generateDeadlineInsights({ deadlines: deadlines ?? [], applications: apps, documents: documents ?? [], profileScore: profileScore ?? 0 })
    for (const i of insights) if (i.priority !== 'Completed' && i.daysRemaining >= 0) out.push({ date: i.date, title: i.title, sub: i.universityName ?? 'Deadline', tone: 'var(--gold-bright)', href: i.appId ? `/student/applications/${i.appId}` : '/student/calendar' })
    const appliedPrograms = new Set(apps.map(a => a.programId).filter(Boolean))
    for (const p of streamPrograms) {
      const d = toDate(p.applicationDeadline)
      if (!d || d < today || appliedPrograms.has(p.id)) continue
      const u: any = uniById.get(p.universityId)
      out.push({ date: d, title: `${u?.shortName || u?.name || 'University'} · ${p.name}`, sub: 'Applications close', tone: '#F46846', href: `/student/universities/${p.universityId}` })
    }
    return out.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [active, exams, deadlines, apps, documents, profileScore, streamPrograms, uniById])

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-[36px] w-[36px] animate-spin rounded-full border-[3px] border-[var(--border)] border-t-[var(--accent)]" />
      </div>
    )
  }

  /* derived numbers */
  const first = (profile?.fullName || 'there').split(' ')[0]
  // What universities see on an application (no uploads — DigiLocker verification comes later)
  const pr = (profile ?? {}) as Record<string, any>
  const details: [string, boolean][] = [
    ['10th marks', !!pr.tenthScore], ['12th marks', !!pr.twelfthScore],
    ['exam score', !!(pr.jeeScore || pr.neetScore || pr.cuetScore || pr.bitsatScore || pr.nataScore || pr.clatScore || pr.catPercentile || pr.gateScore)],
    ['category', !!pr.category], ['domicile state', !!pr.domicileState],
  ]
  const missingDetails = details.filter(([, ok]) => !ok).map(([k]) => k)
  const docsPct = Math.round(((details.length - missingDetails.length) / details.length) * 100)
  const furthest = active.reduce((m, a) => Math.max(m, STAGE[a.s] ?? 0), 0)
  const appsPct = Math.round((furthest / 7) * 100)
  const featured = [...apps].sort((a, b) => urgency(a.s) - urgency(b.s) || (toDate(b.updatedAt ?? b.createdAt)?.getTime() ?? 0) - (toDate(a.updatedAt ?? a.createdAt)?.getTime() ?? 0)).slice(0, 2)
  const needsYou = apps.filter(a => urgency(a.s) <= 1).length
  const nextMissing = profileStrength?.missingFields?.[0]?.label
  const subtitle = needsYou > 0
    ? `${needsYou} application${needsYou > 1 ? 's need' : ' needs'} your response.`
    : active.length > 0
      ? `Your profile is ${profileScore}% complete and ${active.length} application${active.length > 1 ? 's are' : ' is'} in progress.`
      : `Your profile is ${profileScore}% complete. Pick a stream and apply to your first university.`

  // week strip
  const weekStart = new Date(); weekStart.setHours(0, 0, 0, 0)
  weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7) + weekOffset * 7)
  const week = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(d.getDate() + i); return d })
  const eventDays = new Set(events.map(e => dayKey(e.date)))
  const todayKey = dayKey(new Date())
  const weekEnd = new Date(week[6]); weekEnd.setHours(23, 59, 59)
  const weekEvents = events.filter(e => e.date >= week[0] && e.date <= weekEnd)
  const shownEvents = (weekEvents.length ? weekEvents : events).slice(0, 3)
  const alert = events[0]
  const daysLeft = alert ? Math.max(0, Math.ceil((alert.date.getTime() - new Date().setHours(0, 0, 0, 0)) / 86400000)) : 0

  return (
    <div className="flex flex-col gap-[20px] pb-[40px]">
      {error && (
        <div role="alert" className="flex items-center justify-between gap-[12px] rounded-[20px] border border-[color-mix(in_srgb,var(--red)_25%,transparent)] bg-[color-mix(in_srgb,var(--red)_8%,transparent)] p-[14px] text-[13px] text-[var(--red)]">
          <span className="flex items-center gap-[8px]"><AlertCircle size={17} /> {error}. Some numbers may be out of date.</span>
          <button onClick={() => window.location.reload()} className="inline-flex items-center gap-[6px] rounded-full bg-[var(--red)] px-[12px] py-[6px] font-semibold text-white"><RefreshCw size={13} /> Reload</button>
        </div>
      )}

      {/* ── hero: greeting + stream cards ─────────────────────────────── */}
      <section aria-label="Welcome" className="grid grid-cols-1 gap-[20px] xl:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] xl:items-stretch">
        <div className="flex min-w-0 flex-col justify-center">
          <motion.h1 initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE }}
            className="font-display text-[32px] font-bold leading-[1.04] tracking-[-0.035em] md:text-[42px]">
            Hi, {first}! 👋<br />Where do you want to <span className="text-[var(--gold-bright)]">study</span> next?
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-[12px] max-w-[44ch] text-[14px] text-[var(--text-muted)]">{subtitle}</motion.p>
          <div role="tablist" aria-label="Stream" className="mt-[18px] flex w-fit max-w-full gap-[4px] overflow-x-auto rounded-full border border-[var(--border)] bg-[var(--bg-card)] p-[4px] shadow-[var(--shadow-card)] no-scrollbar">
            {STREAMS.map(s => {
              const on = s.key === streamDef.key
              return (
                <button key={s.key} role="tab" aria-selected={on} onClick={() => pickStream(s.key)}
                  className={`relative shrink-0 rounded-full px-[14px] py-[7px] text-[12.5px] font-semibold transition-colors ${on ? 'text-[var(--bg)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                  {on && <motion.span layoutId="stream-pill" className="absolute inset-0 rounded-full bg-[var(--text-primary)]" transition={{ type: 'spring', stiffness: 460, damping: 34 }} />}
                  <span className="relative">{s.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex min-w-0 gap-[12px] overflow-x-auto pb-[4px] no-scrollbar">
          <Link href={`/student/universities?q=${encodeURIComponent(streamDef.label)}`} aria-label={`Browse all ${streamDef.label} universities`}
            className="flex w-[56px] shrink-0 items-center justify-center rounded-[24px] border-2 border-dashed border-[var(--border-hover)] text-[var(--text-faint)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]">
            <Plus size={20} />
          </Link>
          {(streamUnis.length || programs !== null ? streamUnis : [null, null, null, null]).map((u: any, i: number, arr: any[]) => {
            const dark = i === arr.length - 1
            const inner = (
              <>
                <span className={dark ? 'text-white' : 'text-[#17142B] dark:text-white'}><Shapes v={i} /></span>
                <span className="mt-[10px] line-clamp-2 text-[13.5px] font-bold leading-tight">{u ? (u.shortName || u.name) : ' '}</span>
                <span className={`mt-[2px] text-[11.5px] ${dark ? 'text-white/55' : 'text-[var(--text-muted)]'}`}>{u ? [u.city, u.type].filter(Boolean).join(' · ') : streamDef.label}</span>
              </>
            )
            const cls = `group flex h-full min-h-[168px] flex-col items-center justify-end rounded-[24px] p-[14px] text-center transition-all duration-300 hover:-translate-y-1 ${dark ? 'bg-[var(--night)] text-white shadow-[var(--shadow-card-hover)] dark:ring-1 dark:ring-white/10' : 'border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]'}`
            return (
              <motion.div key={u?.id ?? i} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 + i * 0.07, duration: 0.6, ease: EASE }} className="min-w-[128px] flex-1">
                {u ? <Link href={`/student/universities/${u.id}`} className={cls}>{inner}</Link>
                  : <div className={`${cls} animate-pulse`} aria-hidden>{inner}</div>}
              </motion.div>
            )
          })}
        </div>
      </section>

      {/* ── body ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-[20px] xl:grid-cols-[minmax(0,1fr)_330px]">
        <div className="flex min-w-0 flex-col gap-[20px]">
          <div className="grid gap-[12px] sm:grid-cols-3">
            <Ring pct={profileScore ?? 0} sub="Step 1" label="Profile" next={nextMissing ? `Next: ${nextMissing}` : 'All details added'} color="var(--accent)" href="/student/profile" delay={0.1} />
            <Ring pct={docsPct} sub="Step 2" label="Academic details" next={missingDetails.length ? `Add ${missingDetails[0]}` : 'Ready for universities'} color="var(--gold-bright)" href="/student/documents" delay={0.2} />
            <Ring pct={appsPct} sub="Step 3" label="Applications" next={active.length ? `Furthest: ${STAGE_LABEL[(Object.keys(STAGE) as AdmissionStatus[]).find(k => STAGE[k] === furthest) ?? 'submitted']}` : 'None yet'} color="var(--green)" href="/student/applications" delay={0.3} />
          </div>

          <section className={`${CARD} p-[18px] md:p-[22px]`} aria-labelledby="apps-heading">
            <div className="mb-[14px] flex items-center justify-between">
              <h2 id="apps-heading" className="font-display text-[18px] font-bold">Your applications</h2>
              <Link href="/student/applications" className="inline-flex items-center gap-[8px] text-[12.5px] font-semibold text-[var(--text-muted)] hover:text-[var(--accent)]">
                {apps.length > 2 && <span className="flex -space-x-[6px]">{['var(--accent)', 'var(--gold-bright)', 'var(--green)'].map(c => <span key={c} className="h-[20px] w-[20px] rounded-full border-2 border-[var(--bg-card)]" style={{ background: c }} />)}</span>}
                View all{apps.length > 2 ? ` ${apps.length}` : ''}
              </Link>
            </div>

            {featured.length === 0 ? (
              <div className="rounded-[20px] border-2 border-dashed border-[var(--border)] p-[24px] text-center">
                <p className="font-semibold">You haven&apos;t applied anywhere yet.</p>
                <p className="mt-[4px] text-[13px] text-[var(--text-muted)]">Your profile and documents go with every application — no forms to refill.</p>
                <Link href="/student/universities" className="mt-[14px] inline-flex h-[40px] items-center gap-[6px] rounded-full bg-[var(--accent)] px-[18px] text-[13px] font-semibold text-white shadow-[var(--shadow-glow)]"><Plus size={15} /> Start an application</Link>
              </div>
            ) : (
              <div className="grid gap-[12px] md:grid-cols-2">
                {featured.map((a, i) => {
                  const dark = i === 0 && urgency(a.s) <= 1
                  const pct = Math.round(((STAGE[a.s] ?? 0) / 7) * 100)
                  const closed = CLOSED.includes(a.s)
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.08, duration: 0.6, ease: EASE }}>
                      <Link href={`/student/applications/${a.id}`}
                        className={`block h-full rounded-[20px] p-[16px] transition hover:-translate-y-0.5 ${dark ? 'bg-[var(--night)] text-white shadow-[0_24px_50px_-24px_rgba(22,19,38,0.9)] dark:ring-1 dark:ring-[var(--accent-border)]' : 'bg-[var(--accent-bg)]'}`}>
                        <div className="mb-[14px] flex items-start justify-between gap-[10px]">
                          <div className="min-w-0">
                            <p className="truncate text-[15px] font-bold leading-snug">{a.universityName || 'University'}</p>
                            <p className={`truncate text-[12px] ${dark ? 'text-white/55' : 'text-[var(--text-muted)]'}`}>{a.programName || a.program || 'Program'}</p>
                          </div>
                          <span className={`shrink-0 rounded-full px-[9px] py-[3px] text-[11px] font-bold ${dark ? 'bg-[var(--gold-bright)] text-[#17142B]' : closed ? 'bg-[var(--bg-card)] text-[var(--text-muted)]' : 'bg-[var(--bg-card)] text-[var(--accent)]'}`}>{STAGE_LABEL[a.s]}</span>
                        </div>
                        <div className={`mb-[8px] h-[6px] overflow-hidden rounded-full ${dark ? 'bg-white/15' : 'bg-[color-mix(in_srgb,var(--text-primary)_10%,transparent)]'}`}>
                          <motion.div initial={{ width: 0 }} animate={{ width: `${closed ? 100 : pct}%` }} transition={{ duration: 1.2, delay: 0.3, ease: EASE }}
                            className={`h-full rounded-full ${dark ? 'bg-[var(--gold-bright)]' : closed ? 'bg-[var(--border-hover)]' : 'bg-[var(--accent)]'}`} />
                        </div>
                        <div className={`flex justify-between text-[11.5px] ${dark ? 'text-white/55' : 'text-[var(--text-muted)]'}`}>
                          <span>Updated {ago(toDate(a.updatedAt ?? a.createdAt)) || 'recently'}</span>
                          <span className={`font-semibold ${dark ? 'text-white' : 'text-[var(--accent)]'}`}>{ACTION[a.s] ? <>{ACTION[a.s]} <ArrowRight size={11} className="inline" /></> : closed ? 'Closed' : `${pct}%`}</span>
                        </div>
                      </Link>
                    </motion.div>
                  )
                })}
              </div>
            )}

            <Link href="/student/predictor" className="mt-[12px] flex items-center gap-[12px] rounded-[18px] border border-[var(--border)] p-[12px] text-[13px] transition hover:border-[var(--border-hover)]">
              <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[12px] bg-[var(--accent-bg)] text-[var(--accent)]"><Gauge size={16} /></span>
              <p className="min-w-0 flex-1 truncate">
                {predictorSummary?.likelySeat ? (
                  <><strong>Most likely JoSAA seat:</strong> <span className="text-[var(--text-muted)]">{predictorSummary.likelySeat}{predictorSummary.anySeat != null ? ` · ${predictorSummary.anySeat}% chance of a seat` : ''}</span></>
                ) : (
                  <><strong>College Predictor</strong><span className="text-[var(--text-muted)]"> · your chances at every IIT, NIT and IIIT program, from real cutoffs</span></>
                )}
              </p>
              <ArrowRight size={15} className="shrink-0 text-[var(--text-muted)]" />
            </Link>

            {match && (
              <div className="mt-[12px] flex items-center gap-[12px] rounded-[18px] border border-[var(--border)] p-[12px] text-[13px]">
                <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[12px] bg-[var(--gold-bg)] text-[var(--gold)]"><Sparkles size={16} /></span>
                <p className="min-w-0 flex-1 truncate">
                  <strong>{match.university.shortName || match.university.name}</strong>
                  <span className="text-[var(--text-muted)]"> · {match.overallMatchScore}% profile fit{match.matchReasons[0] ? ` · ${match.matchReasons[0].toLowerCase()}` : ''}</span>
                </p>
                <Link href={`/student/universities/${match.university.id}`} className="shrink-0 rounded-full bg-[var(--text-primary)] px-[14px] py-[6px] text-[12px] font-semibold text-[var(--bg)] transition hover:opacity-85">Apply</Link>
              </div>
            )}
          </section>
        </div>

        {/* right column */}
        <div className="flex flex-col gap-[20px] sm:flex-row xl:flex-col">
          <section className={`${CARD} flex-1 p-[18px]`} aria-labelledby="cal-heading">
            <div className="mb-[12px] flex items-center justify-between">
              <h2 id="cal-heading" className="font-display text-[16px] font-bold">{week[3].toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</h2>
              <span className="flex gap-[2px] text-[var(--text-muted)]">
                <button onClick={() => setWeekOffset(w => w - 1)} aria-label="Previous week" className="rounded-full p-[4px] hover:bg-[var(--bg-subtle)]"><ChevronLeft size={16} /></button>
                <button onClick={() => setWeekOffset(w => w + 1)} aria-label="Next week" className="rounded-full p-[4px] hover:bg-[var(--bg-subtle)]"><ChevronRight size={16} /></button>
              </span>
            </div>
            <div className="grid grid-cols-7 gap-[4px] text-center text-[11px] text-[var(--text-faint)]">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <span key={i}>{d}</span>)}
              {week.map(d => {
                const k = dayKey(d)
                const isToday = k === todayKey
                const has = eventDays.has(k)
                return (
                  <span key={k} className={`mx-auto flex h-[32px] w-[32px] items-center justify-center rounded-full text-[12.5px] font-semibold ${isToday ? 'bg-[var(--gold-bright)] text-[#17142B]' : has ? 'bg-[var(--accent)] text-white' : 'text-[var(--text-secondary)]'}`}>{d.getDate()}</span>
                )
              })}
            </div>
            <div className="mt-[14px] flex flex-col gap-[8px]">
              {shownEvents.length === 0 ? (
                <p className="rounded-[14px] bg-[var(--bg-subtle)] p-[12px] text-[12.5px] text-[var(--text-muted)]">Nothing scheduled. Exam dates and deadlines appear here as universities publish them.</p>
              ) : shownEvents.map((e, i) => (
                <Link key={i} href={e.href} className="flex items-center gap-[10px] rounded-[14px] bg-[var(--bg-subtle)] p-[10px] transition hover:bg-[var(--bg-card-hover)]">
                  <span className="h-[34px] w-[4px] shrink-0 rounded-full" style={{ background: e.tone }} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-semibold">{e.title}</span>
                    <span className="block truncate text-[11.5px] text-[var(--text-muted)]">{e.date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {e.sub}</span>
                  </span>
                </Link>
              ))}
            </div>
            <Link href="/student/calendar" className="mt-[12px] inline-flex items-center gap-[6px] text-[12.5px] font-semibold text-[var(--accent)]"><CalendarDays size={14} /> Open calendar</Link>
          </section>

          <section className={`${CARD} flex-1 p-[18px]`} aria-labelledby="deadline-heading">
            <h2 id="deadline-heading" className="mb-[10px] font-display text-[16px] font-bold">Deadline alert</h2>
            {alert ? (
              <>
                <div className="rounded-[14px] bg-[color-mix(in_srgb,#F46846_11%,transparent)] p-[12px] text-[12.5px]">
                  <p className="flex items-center gap-[6px] font-semibold text-[#E0553A]"><Clock size={13} /> {daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}</p>
                  <p className="mt-[4px] text-[var(--text-secondary)]">{alert.title} — {alert.sub.toLowerCase()} {alert.date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="mt-[12px] flex gap-[8px] text-[12px] font-semibold">
                  <Link href="/student/calendar" className="flex-1 rounded-full border border-[var(--border-hover)] py-[8px] text-center text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]">See all dates</Link>
                  <Link href={alert.href} className="flex-1 rounded-full bg-[var(--accent)] py-[8px] text-center text-white shadow-[var(--shadow-glow)]">Finish now</Link>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-[var(--text-muted)]">No deadlines coming up for {streamDef.label.toLowerCase()} right now.</p>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
