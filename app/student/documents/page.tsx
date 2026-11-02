'use client'

// Documents — EDUING doesn't store document files. Students enter their marks and
// details in the profile (shared with every application), and documents will be
// verified through DigiLocker. This page shows what universities will check and
// what the student should keep ready.
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldCheck, CheckCircle2, Circle, ArrowRight, Landmark } from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useStudentData } from '@/components/providers/StudentDataProvider'

const CARD = 'rounded-[26px] border border-[var(--border)] bg-[var(--bg-card)] p-[20px] md:p-[24px] shadow-[var(--shadow-card)]'

type Item = { name: string; why: string; digilocker: boolean; ready: (p: Record<string, any>) => boolean; field?: string }

const ITEMS: Item[] = [
  { name: 'Class 10 marksheet', why: 'Date of birth and Class 10 marks', digilocker: true, ready: p => !!p.tenthScore, field: '10th percentage' },
  { name: 'Class 12 marksheet', why: 'Eligibility for UG programs', digilocker: true, ready: p => !!p.twelfthScore, field: '12th percentage' },
  { name: 'Entrance exam scorecard', why: 'JEE, NEET, CUET, NATA, CLAT … as the program needs', digilocker: false, ready: p => !!(p.jeeScore || p.neetScore || p.cuetScore || p.bitsatScore || p.nataScore || p.clatScore || p.catPercentile || p.gateScore), field: 'exam scores' },
  { name: 'Aadhaar', why: 'Identity check at admission', digilocker: true, ready: () => false },
  { name: 'Category certificate', why: 'Only for EWS / OBC-NCL / SC / ST / PwD seats', digilocker: true, ready: p => !!p.category, field: 'category' },
  { name: 'Domicile certificate', why: 'Only for state-quota seats', digilocker: true, ready: p => !!p.domicileState, field: 'domicile state' },
  { name: 'Passport-size photographs', why: 'Carry 4–6 recent copies to the campus', digilocker: false, ready: () => false },
]

export default function DocumentsPage() {
  const { profile } = useStudentData()
  const p = (profile ?? {}) as Record<string, any>
  const detailItems = ITEMS.filter(i => i.field)
  const done = detailItems.filter(i => i.ready(p)).length

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="page-in mx-auto flex w-full max-w-[960px] flex-col gap-[20px] pb-[48px]">
        <motion.section
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="relative overflow-hidden rounded-[28px] bg-[var(--night)] p-[24px] text-white md:p-[32px]"
        >
          <div aria-hidden className="pointer-events-none absolute -right-[80px] -top-[80px] h-[260px] w-[260px] rounded-full bg-[#4B2FC9] opacity-60 blur-[90px]" />
          <div className="relative max-w-[560px]">
            <span className="inline-flex items-center gap-[6px] rounded-full bg-[#F5B829] px-[12px] py-[5px] text-[12px] font-bold text-[#17142B]">
              <Landmark size={13} /> Coming soon
            </span>
            <h1 className="mt-[14px] font-display text-[28px] font-bold leading-tight md:text-[34px]">Verify your documents with DigiLocker</h1>
            <p className="mt-[10px] text-[14px] leading-relaxed text-white/70">
              You won&apos;t need to scan or upload anything. Connect DigiLocker once, and your marksheets, Aadhaar and certificates come
              straight from the board or government — already verified for every university you apply to.
            </p>
            <p className="mt-[10px] text-[13px] text-white/50">Until then, enter your marks in your profile. Universities see them on your application.</p>
            <Link href="/student/profile" className="mt-[18px] inline-flex h-[42px] items-center gap-[8px] rounded-full bg-white px-[20px] text-[13.5px] font-semibold text-[#17142B] transition hover:-translate-y-0.5">
              Fill in my details <ArrowRight size={15} />
            </Link>
          </div>
        </motion.section>

        <section className={CARD} aria-labelledby="share-heading">
          <div className="mb-[14px] flex flex-wrap items-end justify-between gap-[8px]">
            <div>
              <h2 id="share-heading" className="font-display text-[18px] font-bold">What universities see now</h2>
              <p className="text-[13px] text-[var(--text-muted)]">Details from your profile, shared with each application.</p>
            </div>
            <span className="rounded-full bg-[var(--accent-bg)] px-[12px] py-[5px] text-[12.5px] font-semibold text-[var(--accent)]">{done} of {detailItems.length} filled</span>
          </div>
          <ul className="grid gap-[8px] sm:grid-cols-2">
            {detailItems.map(i => {
              const ok = i.ready(p)
              return (
                <li key={i.name} className="flex items-center gap-[10px] rounded-[16px] bg-[var(--bg-subtle)] p-[12px]">
                  {ok ? <CheckCircle2 size={18} className="shrink-0 text-[var(--green)]" /> : <Circle size={18} className="shrink-0 text-[var(--text-faint)]" />}
                  <span className="min-w-0 flex-1 text-[13.5px]">
                    <span className="block font-semibold capitalize">{i.field}</span>
                    <span className="block text-[12px] text-[var(--text-muted)]">{ok ? 'Added' : 'Not added yet'}</span>
                  </span>
                  {!ok && <Link href="/student/profile" className="text-[12.5px] font-semibold text-[var(--accent)]">Add</Link>}
                </li>
              )
            })}
          </ul>
        </section>

        <section className={CARD} aria-labelledby="ready-heading">
          <h2 id="ready-heading" className="font-display text-[18px] font-bold">Keep these ready for admission day</h2>
          <p className="mb-[14px] text-[13px] text-[var(--text-muted)]">Universities check originals when you report to the campus.</p>
          <ul className="flex flex-col divide-y divide-[var(--border)]">
            {ITEMS.map(i => (
              <li key={i.name} className="flex items-center gap-[12px] py-[12px]">
                <span className="flex h-[36px] w-[36px] shrink-0 items-center justify-center rounded-[12px] bg-[var(--bg-subtle)] text-[var(--text-secondary)]"><ShieldCheck size={16} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold">{i.name}</span>
                  <span className="block text-[12.5px] text-[var(--text-muted)]">{i.why}</span>
                </span>
                {i.digilocker && <span className="shrink-0 rounded-full border border-[var(--accent-border)] px-[10px] py-[3px] text-[11px] font-semibold text-[var(--accent)]">In DigiLocker</span>}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </ProtectedRoute>
  )
}
