'use client'

// Saved universities — the bookmarks students make on a university page
// (users/{uid}.savedPrograms = [{ universityId, name, … }]), joined with the
// live university and program data so every card shows real details.
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Bookmark, MapPin, CalendarDays, GraduationCap, Trash2, ArrowRight, Search, Loader2 } from 'lucide-react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { useSavedUniversities } from '@/hooks/useSavedUniversities'

const CARD = 'rounded-[24px] border border-[var(--border)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]'

type Program = { id: string; universityId: string; name?: string; annualFee?: number; applicationDeadline?: any; isActive?: boolean; status?: string }

const toDate = (v: any): Date | null => {
  if (!v) return null
  const d = typeof v?.toDate === 'function' ? v.toDate() : typeof v?.seconds === 'number' ? new Date(v.seconds * 1000) : new Date(v)
  return isNaN(d.getTime()) ? null : d
}
const inr = (n: number) => (n >= 100000 ? `₹${(n / 100000).toFixed(n % 100000 ? 1 : 0)} lakh` : `₹${n.toLocaleString('en-IN')}`)

export default function SavedPage() {
  const { savedPrograms, universities, uniqueApps, loading } = useStudentData()
  const [search, setSearch] = useState('')
  const [programs, setPrograms] = useState<Program[] | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const { toggleSave } = useSavedUniversities()

  const saved = useMemo(() => (Array.isArray(savedPrograms) ? savedPrograms : []).filter((s: any) => s?.universityId), [savedPrograms])
  const ids = useMemo(() => Array.from(new Set(saved.map((s: any) => s.universityId as string))).slice(0, 30), [saved])

  // Programs of the saved universities (one query; Firestore allows up to 30 ids)
  useEffect(() => {
    if (!ids.length) { setPrograms([]); return }
    let cancelled = false
    const load = (attempt: number) => getDocs(query(collection(db, 'programs'), where('universityId', 'in', ids)))
      .then(s => { if (!cancelled) setPrograms(s.docs.map(d => ({ id: d.id, ...d.data() }) as Program).filter(p => p.isActive !== false && p.status !== 'inactive')) })
      // the first read right after a page load can fail while Firestore connects — retry once
      .catch(() => { if (cancelled) return; if (attempt === 0) setTimeout(() => load(1), 1500); else setPrograms([]) })
    load(0)
    return () => { cancelled = true }
  }, [ids])

  const now = Date.now()
  const cards = useMemo(() => saved.map((s: any) => {
    const uni: any = (universities ?? []).find((u: any) => u.id === s.universityId) ?? {}
    const progs = (programs ?? []).filter(p => p.universityId === s.universityId)
    const open = progs.filter(p => { const d = toDate(p.applicationDeadline); return !d || d.getTime() >= now })
    const deadlines = open.map(p => toDate(p.applicationDeadline)).filter((d): d is Date => !!d).sort((a, b) => a.getTime() - b.getTime())
    const fees = progs.map(p => Number(p.annualFee)).filter(n => n > 0).sort((a, b) => a - b)
    const applied = (uniqueApps ?? []).some((a: any) => a.universityId === s.universityId)
    return {
      entry: s,
      id: s.universityId as string,
      name: uni.name || s.name || 'University',
      place: [uni.city, uni.state].filter(Boolean).join(', ') || (typeof uni.location === 'string' ? uni.location : ''),
      type: [uni.type, uni.accreditation].filter(Boolean).join(' · '),
      openCount: open.length,
      nextDeadline: deadlines[0] ?? null,
      feeRange: fees.length ? (fees[0] === fees[fees.length - 1] ? inr(fees[0]) : `${inr(fees[0])} – ${inr(fees[fees.length - 1])}`) : null,
      applied,
    }
  }), [saved, universities, programs, uniqueApps, now])

  const shown = cards.filter(c => !search || `${c.name} ${c.place}`.toLowerCase().includes(search.toLowerCase()))
  const closingSoon = cards.filter(c => c.nextDeadline && c.nextDeadline.getTime() - now < 30 * 86400000).length

  // removes every bookmark for that university (same helper as the Save buttons)
  const remove = async (id: string, name: string) => {
    setRemoving(id)
    try { await toggleSave({ id, name }) } finally { setRemoving(null) }
  }


  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-[var(--accent)]" size={30} /></div>
  }

  return (
    <div className="page-in mx-auto flex w-full max-w-[1120px] flex-col gap-[20px] pb-[48px]">
      <header className="flex flex-wrap items-end justify-between gap-[16px]">
        <div>
          <h1 className="font-display text-[28px] font-bold tracking-[-0.02em]">Saved universities</h1>
          <p className="mt-[4px] text-[14px] text-[var(--text-muted)]">Universities you bookmarked. Open one to see its programs and apply.</p>
        </div>
        {cards.length > 0 && (
          <label className="flex h-[42px] w-full max-w-[300px] items-center gap-[8px] rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-[14px] shadow-[var(--shadow-card)]">
            <Search size={15} className="text-[var(--text-muted)]" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search saved" aria-label="Search saved universities" className="w-full bg-transparent text-[13.5px] outline-none" />
          </label>
        )}
      </header>

      {cards.length > 0 && (
        <div className="grid grid-cols-2 gap-[12px] md:grid-cols-4">
          {[
            ['Saved', cards.length],
            ['Taking applications', cards.filter(c => c.openCount > 0).length],
            ['Closing in 30 days', closingSoon],
            ['Already applied', cards.filter(c => c.applied).length],
          ].map(([label, value]) => (
            <div key={label as string} className={`${CARD} p-[16px]`}>
              <p className="text-[12.5px] text-[var(--text-muted)]">{label}</p>
              <p className="mt-[2px] font-display text-[26px] font-bold">{value}</p>
            </div>
          ))}
        </div>
      )}

      {shown.length === 0 ? (
        <div className={`${CARD} flex flex-col items-center gap-[10px] p-[40px] text-center`}>
          <span className="flex h-[48px] w-[48px] items-center justify-center rounded-full bg-[var(--accent-bg)] text-[var(--accent)]"><Bookmark size={20} /></span>
          <p className="font-semibold">{search ? `Nothing saved matches “${search}”` : 'You haven’t saved any universities yet'}</p>
          <p className="max-w-[360px] text-[13px] text-[var(--text-muted)]">Tap the bookmark on a university page to keep it here while you decide.</p>
          <Link href="/student/universities" className="mt-[6px] inline-flex h-[40px] items-center gap-[6px] rounded-full bg-[var(--accent)] px-[18px] text-[13px] font-semibold text-white">Explore universities</Link>
        </div>
      ) : (
        <div className="grid gap-[14px] md:grid-cols-2">
          {shown.map((c, i) => (
            <motion.article key={c.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className={`${CARD} flex flex-col gap-[14px] p-[20px]`}>
              <div className="flex items-start gap-[12px]">
                <span className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-[14px] bg-[var(--accent-bg)] font-display text-[17px] font-bold text-[var(--accent)]">{c.name.charAt(0)}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[16px] font-bold">{c.name}</h2>
                  <p className="flex flex-wrap items-center gap-x-[10px] text-[12.5px] text-[var(--text-muted)]">
                    {c.place && <span className="inline-flex items-center gap-[4px]"><MapPin size={12} /> {c.place}</span>}
                    {c.type && <span>{c.type}</span>}
                  </p>
                </div>
                {c.applied && <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--green)_12%,transparent)] px-[10px] py-[3px] text-[11px] font-semibold text-[var(--green)]">Applied</span>}
              </div>
              <dl className="grid grid-cols-3 gap-[8px] text-[12.5px]">
                <div className="rounded-[14px] bg-[var(--bg-subtle)] p-[10px]"><dt className="text-[var(--text-muted)]">Open programs</dt><dd className="mt-[2px] flex items-center gap-[4px] font-semibold"><GraduationCap size={13} /> {programs === null ? '…' : c.openCount}</dd></div>
                <div className="rounded-[14px] bg-[var(--bg-subtle)] p-[10px]"><dt className="text-[var(--text-muted)]">Next deadline</dt><dd className="mt-[2px] flex items-center gap-[4px] font-semibold"><CalendarDays size={13} /> {c.nextDeadline ? c.nextDeadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : '—'}</dd></div>
                <div className="rounded-[14px] bg-[var(--bg-subtle)] p-[10px]"><dt className="text-[var(--text-muted)]">Annual fee</dt><dd className="mt-[2px] truncate font-semibold">{c.feeRange ?? '—'}</dd></div>
              </dl>
              <div className="flex gap-[8px]">
                <Link href={`/student/universities/${c.id}`} className="inline-flex h-[40px] flex-1 items-center justify-center gap-[6px] rounded-full bg-[var(--accent)] text-[13px] font-semibold text-white">
                  {c.applied ? 'View university' : 'View programs & apply'} <ArrowRight size={14} />
                </Link>
                <button onClick={() => remove(c.id, c.name)} disabled={removing === c.id} aria-label={`Remove ${c.name} from saved`}
                  className="flex h-[40px] w-[40px] items-center justify-center rounded-full border border-[var(--border)] text-[var(--text-muted)] transition hover:border-[var(--red)] hover:text-[var(--red)] disabled:opacity-50">
                  {removing === c.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
              </div>
            </motion.article>
          ))}
        </div>
      )}
    </div>
  )
}
