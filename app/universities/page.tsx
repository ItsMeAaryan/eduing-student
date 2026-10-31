import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Universities',
  description: 'Browse and compare universities across India - admissions, programs, and eligibility, all in one place on EDUING.in.',
  openGraph: {
    title: 'Universities | EDUING.in',
    description: 'Browse and compare universities across India - admissions, programs, and eligibility, all in one place on EDUING.in.',
  },
}

export default function UniversitiesPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-6" style={{ background: 'var(--bg)' }}>
      <div aria-hidden className="bg-dots absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />
      <div aria-hidden className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-[100px]" style={{ background: 'var(--accent)' }} />
      <div className="relative max-w-[560px] text-center">
        <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[12px] font-semibold" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: 'var(--gold-bright)' }} />500+ universities
        </span>
        <h1 className="mt-5 text-[40px] font-bold leading-[1.05] tracking-[-0.035em] sm:text-[52px]" style={{ color: 'var(--text-primary)' }}>
          Explore <span className="text-gradient">universities</span> across India
        </h1>
        <p className="mx-auto mt-4 max-w-[46ch] text-[16px]" style={{ color: 'var(--text-muted)' }}>
          Compare programs, placements, fees and eligibility — then apply with one profile.
        </p>
        <Link href="/student/universities" className="mt-8 inline-flex h-12 items-center rounded-full px-7 text-[15px] font-semibold text-white transition-transform hover:-translate-y-0.5" style={{ background: 'var(--accent)', boxShadow: 'var(--shadow-glow)' }}>
          Browse universities
        </Link>
      </div>
    </main>
  )
}
