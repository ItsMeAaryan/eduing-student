// app/student/universities/[id]/page.tsx
'use client'

import React, { useEffect, useState, useMemo, useRef } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { onSnapshot, doc, collection, query, where, or } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import {
  MapPin, Building2, ArrowRight, TrendingUp,
  Sparkles, GraduationCap, ShieldCheck, ChevronLeft,
  CheckCircle2, Search, X, Bookmark, DollarSign, Award,
  AlertCircle, ArrowUpRight, Users, Globe, BookOpen,
  Zap, Star, Share2, Scale, Clock, ExternalLink,
  ChevronDown, Briefcase, Target, BarChart3, Trophy,
  Layers, FlaskConical, Wifi, Home, TreePine, Heart,
  Medal, BadgeCheck, CalendarDays, Phone
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { submitApplication } from '@/lib/firebase/applications'
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine'

/* ── Deterministic color from name ─────────────────────────────────── */
function logoColor(name = '') {
  const p = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6']
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + (h << 5) - h
  return p[Math.abs(h) % p.length]
}

/* ── Animated Count ─────────────────────────────────────────────────── */
function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const start = Date.now()
    const duration = 1200
    const raf = requestAnimationFrame(function step() {
      const elapsed = Date.now() - start
      const pct = Math.min(elapsed / duration, 1)
      const ease = 1 - Math.pow(1 - pct, 3)
      setDisplay(Math.round(value * ease))
      if (pct < 1) requestAnimationFrame(step)
    })
    return () => cancelAnimationFrame(raf)
  }, [value])
  return <>{display}{suffix}</>
}

/* ── Radial Progress ────────────────────────────────────────────────── */
function RadialProgress({ value, size = 80, stroke = 7, color = '#0075DE', label }: {
  value: number; size?: number; stroke?: number; color?: string; label?: string
}) {
  const r = (size - stroke * 2) / 2
  const circ = 2 * Math.PI * r
  return (
    <div className="relative flex flex-col items-center gap-1">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - (value / 100) * circ }}
          transition={{ duration: 1.4, ease: [0.34, 1.56, 0.64, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[15px] font-black" style={{ color: 'var(--text-primary)' }}>{value}%</span>
      </div>
      {label && <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</span>}
    </div>
  )
}

/* ── Section Anchor Wrapper ─────────────────────────────────────────── */
function Section({ id, children, className = '' }: { id: string; children: React.ReactNode; className?: string }) {
  return <section id={id} className={`scroll-mt-28 ${className}`}>{children}</section>
}

/* ── Mini Bar ───────────────────────────────────────────────────────── */
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="h-1 w-full rounded-full overflow-hidden mt-1.5" style={{ background: 'var(--border)' }}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: color }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, pct)}%` }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </div>
  )
}

/* ── Stat Chip ──────────────────────────────────────────────────────── */
function StatChip({ icon, label, value, sub, color = 'var(--accent)', trend, index = 0 }: {
  icon: React.ReactNode; label: string; value: string; sub?: string; color?: string; trend?: number; index?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 * index }}
      className="rounded-2xl p-5 flex flex-col gap-3 group hover:scale-[1.02] transition-transform duration-200"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}
    >
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
          <span style={{ color }}>{icon}</span>
        </div>
        {trend !== undefined && (
          <span className="text-[11px] font-bold flex items-center gap-0.5" style={{ color: trend >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {trend >= 0 ? '↑' : '↓'}{Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-[22px] font-black leading-none tracking-tight" style={{ color: 'var(--text-primary)' }}>{value}</p>
        {sub && <p className="text-[11.5px] mt-1.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
        {trend !== undefined && <MiniBar pct={trend + 50} color={color} />}
      </div>
    </motion.div>
  )
}

/* ── Timeline Step ──────────────────────────────────────────────────── */
function TimelineStep({ step, title, desc, done, active, last }: {
  step: number; title: string; desc: string; done: boolean; active: boolean; last: boolean
}) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: step * 0.08, type: 'spring' }}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-black shrink-0 z-10"
          style={{
            background: done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--bg-elevated)',
            color: done || active ? '#fff' : 'var(--text-muted)',
            border: `2px solid ${done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border)'}`,
          }}
        >
          {done ? <CheckCircle2 size={14} /> : step}
        </motion.div>
        {!last && <div className="w-px flex-1 mt-1" style={{ background: done ? 'var(--green)' : 'var(--border)' }} />}
      </div>
      <div className="pb-6 min-w-0">
        <p className="text-[13px] font-semibold mb-0.5" style={{ color: active ? 'var(--accent)' : 'var(--text-primary)' }}>{title}</p>
        <p className="text-[12px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{desc}</p>
      </div>
    </div>
  )
}

/* ── Recruiter Pill ─────────────────────────────────────────────────── */
function RecruiterPill({ name }: { name: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors hover:scale-105 cursor-default"
      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
      {name}
    </span>
  )
}

/* ────────────────────────────────────────────────────────────────────
   MAIN PAGE
──────────────────────────────────────────────────────────────────── */
export default function UniversityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const heroRef = useRef<HTMLDivElement>(null)

  const { user } = useAuth()
  const { profile, documents, uniqueApps, savedPrograms, profileScore } = useStudentData()

  const [university, setUniversity] = useState<any | null>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applicationSubmitted, setApplicationSubmitted] = useState(false)
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [programSearch, setProgramSearch] = useState('')
  const [customScore, setCustomScore] = useState('')
  const [estimatedWaiver, setEstimatedWaiver] = useState<number | null>(null)
  const [activeSection, setActiveSection] = useState('overview')
  const [selectedProgramDetail, setSelectedProgramDetail] = useState<any | null>(null)
  const [programLevelFilter, setProgramLevelFilter] = useState('All')

  const { scrollY } = useScroll()
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0.3])
  const heroScale = useTransform(scrollY, [0, 300], [1, 1.06])

  /* ── Firestore listeners ─── */
  useEffect(() => {
    if (!id) return
    const unsubUni = onSnapshot(doc(db, 'universities', id), (snap) => {
      if (snap.exists()) setUniversity({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
    return () => unsubUni()
  }, [id])

  useEffect(() => {
    if (!id || !university) return
    const conditions: any[] = [where('universityId', '==', id)]
    if (university.name) conditions.push(where('universityName', '==', university.name))
    const q = query(collection(db, 'programs'), or(...conditions))
    const unsubProgs = onSnapshot(q, (snap) => {
      const seen = new Set<string>()
      const unique: any[] = []
      snap.docs.forEach(d => {
        if (!seen.has(d.id)) { seen.add(d.id); unique.push({ id: d.id, ...d.data() }) }
      })
      setPrograms(unique)
    })
    return () => unsubProgs()
  }, [id, university])

  /* ── Probability engine ─── */
  const probData = useMemo(() => {
    if (!university) return null
    return calculateAdmissionProbability(
      { profile, documents, applications: uniqueApps || [], savedPrograms: savedPrograms || [], profileScore },
      university as any
    )
  }, [university, profile, documents, profileScore, uniqueApps, savedPrograms])

  const overallProb = probData?.overallProbability ?? 75
  const missingDocs = probData?.missingRequirements ?? []

  const filteredPrograms = useMemo(() => {
    let list = programs
    if (programSearch.trim()) {
      const q = programSearch.toLowerCase()
      list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.department || '').toLowerCase().includes(q))
    }
    if (programLevelFilter !== 'All') {
      list = list.filter(p => (p.level || '').toLowerCase().includes(programLevelFilter.toLowerCase()))
    }
    return list
  }, [programs, programSearch, programLevelFilter])

  const handleApply = async (program: any) => {
    if (!user) { router.push('/auth/login'); return }
    if (university?.approvalStatus && university.approvalStatus !== 'approved') return
    setApplying(true)
    try {
      await submitApplication(id, university.name, program?.name || 'General Admission')
      setApplicationSubmitted(true)
      setTimeout(() => { setApplying(false); setSelectedProgram(null) }, 1400)
    } catch { setApplying(false) }
  }

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const calculateScholarship = () => {
    const val = parseFloat(customScore)
    if (!val || isNaN(val)) return
    if (val >= 95) setEstimatedWaiver(75)
    else if (val >= 88) setEstimatedWaiver(50)
    else if (val >= 80) setEstimatedWaiver(25)
    else setEstimatedWaiver(10)
  }

  const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'admissions', label: 'Admissions' },
    { id: 'financials', label: 'Financials' },
    { id: 'placements', label: 'Placements' },
    { id: 'programs', label: 'Programs' },
    { id: 'campus', label: 'Campus' },
  ]

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setActiveSection(id)
  }

  // Derived values
  const uniColor = logoColor(university?.name || '')
  const locationStr = (() => {
    if (!university?.location) return university?.city ? `${university.city}, ${university.state || 'India'}` : 'India'
    if (typeof university.location === 'object') return `${university.location.city || ''}, ${university.location.state || 'India'}`
    return String(university.location)
  })()

  const recruiters = university?.placementDetails?.topRecruiters ||
    university?.topRecruiters ||
    ['Google', 'Microsoft', 'Amazon', 'Deloitte', 'TCS Digital', 'Infosys', 'Accenture', 'Goldman Sachs']

  const highestPkg = university?.placementDetails?.highestPackageLpa || university?.highestPackageLpa || university?.highestPackage
  const avgPkg = university?.placementDetails?.avgPackageLpa || university?.avgPackageLpa || university?.avgPackage
  const placementRate = university?.placementDetails?.placementRate || university?.placementRate || university?.placementPercentage

  /* ── Loading ─── */
  if (loading) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        className="w-9 h-9 rounded-full border-[3px]"
        style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }}
      />
    </div>
  )

  if (!university) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <Building2 size={40} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
      <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>University not found</h2>
      <button onClick={() => router.back()} className="flex items-center gap-2 px-4 h-9 rounded-lg text-[13px] font-medium transition-colors"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)', cursor: 'pointer' }}>
        <ChevronLeft size={15} /> Go Back
      </button>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans" style={{ color: 'var(--text-primary)' }}>

        {/* ══════════════════════════════════════════════════════
            HERO — Immersive Campus Identity
        ══════════════════════════════════════════════════════ */}
        <div ref={heroRef} className="relative overflow-hidden" style={{ height: 'clamp(480px, 52vh, 600px)', marginLeft: '-24px', marginRight: '-24px' }}>
          {/* Campus image with parallax */}
          <motion.div className="absolute inset-0 w-full h-full" style={{ scale: heroScale, opacity: heroOpacity }}>
            {university.heroImageUrl || university.bannerUrl ? (
              <Image
                src={university.heroImageUrl || university.bannerUrl}
                alt={university.name}
                fill
                priority
                unoptimized
                className="object-cover object-center"
              />
            ) : (
              <div className="w-full h-full" style={{ background: `linear-gradient(135deg, ${uniColor}55 0%, #0f172a 100%)` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="font-black opacity-10 select-none" style={{ fontSize: 'clamp(120px, 20vw, 240px)', color: uniColor }}>
                    {university.name?.charAt(0)}
                  </span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Multi-layered dark gradient */}
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.4) 40%, rgba(0,0,0,0.82) 100%)'
          }} />
          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'linear-gradient(to right, rgba(0,0,0,0.6) 0%, transparent 60%)'
          }} />

          {/* ── Back + Actions bar (top) ── */}
          <div className="absolute top-0 left-0 right-0 px-6 pt-4 flex items-center justify-between z-20">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-[13px] font-semibold h-9 px-3.5 rounded-xl transition-all backdrop-blur-md"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.9)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.55)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.35)' }}
            >
              <ChevronLeft size={15} /> Back
            </button>

            <div className="flex items-center gap-2">
              {[
                { icon: isBookmarked ? <Bookmark size={15} fill="white" /> : <Bookmark size={15} />, onClick: () => setIsBookmarked(v => !v), label: 'Bookmark', active: isBookmarked },
                { icon: copiedLink ? <CheckCircle2 size={15} /> : <Share2 size={15} />, onClick: handleShare, label: 'Share', active: copiedLink },
                { icon: <Scale size={15} />, onClick: () => {}, label: 'Compare', active: false },
              ].map(({ icon, onClick, label, active }) => (
                <button
                  key={label}
                  onClick={onClick}
                  aria-label={label}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all backdrop-blur-md"
                  style={{
                    background: active ? 'rgba(0,117,222,0.7)' : 'rgba(0,0,0,0.35)',
                    border: `1px solid ${active ? 'rgba(0,117,222,0.5)' : 'rgba(255,255,255,0.18)'}`,
                    color: 'rgba(255,255,255,0.9)',
                    cursor: 'pointer',
                  }}
                >
                  {icon}
                </button>
              ))}

              <button
                onClick={() => handleApply({ name: 'General Admission' })}
                disabled={applying}
                className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-bold transition-all backdrop-blur-md"
                style={{
                  background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                  color: '#fff',
                  border: 'none',
                  cursor: applying ? 'not-allowed' : 'pointer',
                  opacity: applying ? 0.7 : 1,
                  boxShadow: '0 4px 14px rgba(37,99,235,0.5)',
                }}
              >
                Apply Now <ArrowRight size={14} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* ── University Identity (bottom-left of hero) ── */}
          <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 z-20">
            <div className="flex items-end justify-between gap-4">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="flex-1 min-w-0"
              >
                {/* Badges row */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {university.naacGrade && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{ background: 'rgba(26,174,57,0.3)', border: '1px solid rgba(26,174,57,0.45)', color: '#4ade80' }}>
                      <BadgeCheck size={11} /> NAAC {university.naacGrade}
                    </span>
                  )}
                  {(university.nirfRanking || university.rankings?.nirfOverall) && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{ background: 'rgba(0,117,222,0.3)', border: '1px solid rgba(0,117,222,0.45)', color: '#93c5fd' }}>
                      <Award size={11} /> NIRF #{university.nirfRanking || university.rankings?.nirfOverall}
                    </span>
                  )}
                  {university.approvalStatus === 'approved' && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.85)' }}>
                      <ShieldCheck size={11} /> Verified
                    </span>
                  )}
                  {university.type && (
                    <span className="inline-flex items-center gap-1 text-[10.5px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md"
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.7)' }}>
                      {university.type}
                    </span>
                  )}
                </div>

                {/* University name */}
                <h1 className="font-black leading-tight mb-2"
                  style={{ fontSize: 'clamp(22px, 3.5vw, 38px)', color: '#fff', letterSpacing: '-0.03em', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}>
                  {university.name}
                </h1>

                {/* Location + year + size */}
                <div className="flex flex-wrap items-center gap-3 text-[12.5px]" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  <span className="flex items-center gap-1.5"><MapPin size={13} className="shrink-0" />{locationStr}</span>
                  {university.establishedYear && <span className="flex items-center gap-1.5"><CalendarDays size={12} />Est. {university.establishedYear}</span>}
                  {university.campusSize && <span className="flex items-center gap-1.5"><TreePine size={12} />{university.campusSize} Acres</span>}
                  {university.totalStudents && <span className="flex items-center gap-1.5"><Users size={12} />{university.totalStudents} Students</span>}
                </div>
              </motion.div>

              {/* ── Match Score Card (bottom-right of hero) ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="shrink-0 p-4 rounded-2xl"
                style={{
                  background: 'rgba(0,0,0,0.55)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  minWidth: 180,
                }}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Your Fit Score
                </p>
                <div className="flex items-center gap-3 mb-3">
                  <RadialProgress
                    value={overallProb}
                    size={60}
                    stroke={6}
                    color={overallProb >= 70 ? '#4ade80' : overallProb >= 50 ? '#fbbf24' : '#f87171'}
                  />
                  <div>
                    <p className="font-black text-[28px] leading-none" style={{ color: '#fff' }}>{overallProb}%</p>
                    <p className="text-[11px] mt-0.5 font-medium" style={{ color: overallProb >= 70 ? '#4ade80' : overallProb >= 50 ? '#fbbf24' : '#f87171' }}>
                      {overallProb >= 70 ? 'Strong Match' : overallProb >= 50 ? 'Good Match' : 'Reach School'}
                    </p>
                  </div>
                </div>
                {[
                  { label: 'Academic Fit', val: Math.min(100, overallProb + 8) },
                  { label: 'Financial Fit', val: Math.max(30, overallProb - 12) },
                  { label: 'Admission Prob.', val: overallProb },
                ].map(({ label, val }) => (
                  <div key={label} className="mb-1.5">
                    <div className="flex justify-between text-[10.5px] mb-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                      <span>{label}</span><span>{val}%</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.12)' }}>
                      <motion.div className="h-full rounded-full"
                        style={{ background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${val}%` }}
                        transition={{ duration: 1.2, delay: 0.5 }}
                      />
                    </div>
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            STICKY SECTION NAV
        ══════════════════════════════════════════════════════ */}
        <div className="sticky top-[56px] z-30 flex items-center gap-1 overflow-x-auto hide-scrollbar border-b"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border)', height: 44, paddingInline: 4 }}>
          {SECTIONS.map(s => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className="text-[12.5px] font-semibold whitespace-nowrap px-3 h-8 rounded-lg transition-all relative"
              style={{
                color: activeSection === s.id ? 'var(--accent)' : 'var(--text-muted)',
                background: activeSection === s.id ? 'var(--accent-bg)' : 'transparent',
              }}
            >
              {s.label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={() => handleApply({ name: 'General Admission' })}
            disabled={applying || applicationSubmitted}
            className="shrink-0 flex items-center gap-1.5 h-8 px-4 rounded-lg text-[12.5px] font-bold mr-1 transition-all"
            style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: applying ? 'not-allowed' : 'pointer' }}
          >
            {applicationSubmitted ? <><CheckCircle2 size={13} /> Applied!</> : <>Apply Now <ArrowRight size={13} strokeWidth={2.5} /></>}
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════
            DECISION RIBBON
        ══════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="my-5 rounded-2xl overflow-hidden"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="flex flex-wrap items-center gap-0 divide-x" style={{}}>
            {[
              { icon: <Star size={13} fill="currentColor" />, color: '#f59e0b', text: 'Highly Recommended', sub: 'AI Verdict' },
              { icon: <TrendingUp size={13} />, color: 'var(--green)', text: 'Strong Placements', sub: `${placementRate || '94%'} rate` },
              { icon: <Target size={13} />, color: 'var(--accent)', text: `${overallProb}% Match`, sub: 'Profile fit' },
              { icon: <Award size={13} />, color: '#8b5cf6', text: 'Scholarship Eligible', sub: 'Merit waivers available' },
              { icon: <ShieldCheck size={13} />, color: 'var(--green)', text: 'NAAC Accredited', sub: university.naacGrade || 'A+ Grade' },
            ].map(({ icon, color, text, sub }, i) => (
              <div key={i} className="flex-1 min-w-[140px] flex items-center gap-2.5 px-4 py-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}18`, color }}>
                  {icon}
                </div>
                <div>
                  <p className="text-[12.5px] font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{text}</p>
                  <p className="text-[10.5px]" style={{ color: 'var(--text-muted)' }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════
            TWO-COLUMN LAYOUT: Main Content + Sticky Sidebar
        ══════════════════════════════════════════════════════ */}
        <div className="flex gap-6 items-start">

          {/* ── MAIN CONTENT ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-8">

            {/* ── OVERVIEW: KPI Grid + Editorial Layout ── */}
            <Section id="overview">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>At a Glance</p>
              <h2 className="text-[22px] font-black tracking-tight mb-5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Why {university.shortName || 'this university'}?
              </h2>

              {/* KPI Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
                {[
                  {
                    icon: <Trophy size={16} />, color: '#f59e0b',
                    label: 'Highest Package', value: highestPkg ? (typeof highestPkg === 'number' ? `₹${highestPkg}L` : String(highestPkg)) : '₹44.5L',
                    sub: 'Placement 2024', trend: 12, index: 0
                  },
                  {
                    icon: <BarChart3 size={16} />, color: 'var(--green)',
                    label: 'Placement Rate', value: placementRate ? `${typeof placementRate === 'number' ? placementRate : placementRate}%` : '94%',
                    sub: 'Industry average 78%', trend: 4, index: 1
                  },
                  {
                    icon: <Users size={16} />, color: 'var(--accent)',
                    label: 'Faculty Ratio', value: university.facultyRatio || '14:1',
                    sub: 'Student-to-faculty', index: 2
                  },
                  {
                    icon: <Globe size={16} />, color: '#8b5cf6',
                    label: 'Int\'l Partners', value: university.internationalPartners || '120+',
                    sub: 'Across 40+ countries', index: 3
                  },
                ].map(props => <StatChip key={props.label} {...props} />)}
              </div>

              {/* Editorial two-column */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* Left: Story */}
                <div className="lg:col-span-3 rounded-2xl p-7" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Our Story</p>
                  <p className="text-[16px] font-black mb-4 leading-snug" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                    Shaping careers for {university.establishedYear ? `over ${new Date().getFullYear() - university.establishedYear} years` : 'decades'}
                  </p>
                  <p className="text-[14px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {university.about ||
                      `${university.name} is a premier institution renowned for academic excellence, cutting-edge research, and outstanding placement records. Thousands of students choose us every year for our world-class faculty, industry-integrated curriculum, and vibrant campus life.`}
                  </p>
                  {university.vision && (
                    <p className="text-[13px] leading-relaxed mt-3 italic" style={{ color: 'var(--text-muted)', borderLeft: '3px solid var(--accent)', paddingLeft: 12 }}>
                       &ldquo;{university.vision}&rdquo;
                     </p>
                  )}
                </div>

                {/* Right: Highlights */}
                <div className="lg:col-span-2 rounded-2xl p-5 flex flex-col gap-4" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Key Highlights</p>
                  {[
                    { icon: <BadgeCheck size={14} />, text: `NAAC Grade ${university.naacGrade || 'A+'}`, color: 'var(--green)' },
                    { icon: <Award size={14} />, text: `NIRF Ranked #${university.nirfRanking || university.rankings?.nirfOverall || 'Top 100'}`, color: 'var(--accent)' },
                    { icon: <GraduationCap size={14} />, text: `${programs.length || '50+'} Academic Programs`, color: '#8b5cf6' },
                    { icon: <Globe size={14} />, text: `${university.internationalPartners || '120+'} Global University Partners`, color: '#f59e0b' },
                    { icon: <FlaskConical size={14} />, text: '40+ Research Laboratories', color: '#ec4899' },
                    { icon: <Heart size={14} />, text: 'Active Student Council & 100+ Clubs', color: 'var(--red)' },
                  ].map(({ icon, text, color }, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
                        {icon}
                      </div>
                      <span className="text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ── ADMISSION INTELLIGENCE ── */}
            <Section id="admissions">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Chapter I</p>
              <h2 className="text-[22px] font-black tracking-tight mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Can I get in?
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Probability Big Card */}
                <div className="lg:col-span-1 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center"
                  style={{
                    background: overallProb >= 70
                      ? 'linear-gradient(135deg, rgba(26,174,57,0.08) 0%, rgba(26,174,57,0.03) 100%)'
                      : overallProb >= 50
                      ? 'linear-gradient(135deg, rgba(217,119,6,0.08) 0%, rgba(217,119,6,0.03) 100%)'
                      : 'linear-gradient(135deg, rgba(220,38,38,0.08) 0%, rgba(220,38,38,0.03) 100%)',
                    border: `1px solid ${overallProb >= 70 ? 'rgba(26,174,57,0.2)' : overallProb >= 50 ? 'rgba(217,119,6,0.2)' : 'rgba(220,38,38,0.2)'}`,
                  }}>
                  <RadialProgress
                    value={overallProb}
                    size={96}
                    stroke={9}
                    color={overallProb >= 70 ? 'var(--green)' : overallProb >= 50 ? 'var(--gold)' : 'var(--red)'}
                    label="Admission Probability"
                  />
                  <div>
                    <p className="text-[22px] font-black" style={{ color: 'var(--text-primary)' }}>{overallProb}%</p>
                    <p className="text-[13px] font-semibold mt-0.5" style={{
                      color: overallProb >= 70 ? 'var(--green)' : overallProb >= 50 ? 'var(--gold)' : 'var(--red)'
                    }}>
                      {overallProb >= 70 ? 'Strong Contender' : overallProb >= 50 ? 'Possible Match' : 'Reach School'}
                    </p>
                    <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>Based on your profile</p>
                  </div>
                </div>

                {/* Strengths + Gaps */}
                <div className="lg:col-span-2 flex flex-col gap-4">
                  {/* Strengths */}
                  <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--green)' }}>
                      <CheckCircle2 size={12} className="inline mr-1" />Verified Strengths
                    </p>
                    <div className="flex flex-col gap-2">
                      {['High academic score matches requirements', 'Identity documents verified', 'Class XII transcript uploaded'].map((s, i) => (
                        <div key={i} className="flex items-center gap-2.5">
                          <CheckCircle2 size={14} style={{ color: 'var(--green)', flexShrink: 0 }} strokeWidth={2.5} />
                          <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing docs */}
                  {missingDocs.length > 0 && (
                    <div className="rounded-2xl p-5" style={{ background: 'rgba(217,119,6,0.06)', border: '1px solid rgba(217,119,6,0.2)' }}>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--gold)' }}>
                        <AlertCircle size={12} className="inline mr-1" />Action Required
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {missingDocs.map((d: string, i: number) => (
                          <span key={i} className="text-[12px] font-medium px-3 py-1 rounded-full"
                            style={{ background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.25)', color: 'var(--gold)' }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Eligibility criteria */}
                  <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Eligibility Criteria</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'Min. Class XII', value: '60%+' },
                        { label: 'Entrance Exam', value: university.entranceExam || 'JEE / University Exam' },
                        { label: 'Admission Mode', value: university.admissionMode || 'Merit + Entrance' },
                        { label: 'Deadline', value: university.applicationDeadline || 'June 2025' },
                      ].map(({ label, value }) => (
                        <div key={label} className="p-3 rounded-xl" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
                          <p className="text-[10.5px] font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                          <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* ── FINANCIALS ── */}
            <Section id="financials">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Chapter II</p>
              <h2 className="text-[22px] font-black tracking-tight mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Can I afford it?
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Cost breakdown */}
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="px-5 py-4" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Annual Cost Breakdown</p>
                  </div>
                  {[
                    { label: 'Tuition Fee (per annum)', value: university.tuitionRange || university.feesPerYear ? `₹${(university.feesPerYear / 100000).toFixed(1)}L` : '₹2.4L', icon: <GraduationCap size={14} />, color: 'var(--accent)' },
                    { label: 'Hostel & Dining (optional)', value: university.hostelFees || '₹95,000', icon: <Home size={14} />, color: '#8b5cf6' },
                    { label: 'Books & Materials', value: '₹25,000', icon: <BookOpen size={14} />, color: '#f59e0b' },
                    { label: 'One-time Caution Deposit', value: '₹15,000', icon: <ShieldCheck size={14} />, color: 'var(--green)' },
                  ].map(({ label, value, icon, color }, i) => (
                    <div key={i} className="flex items-center justify-between px-5 py-3.5"
                      style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-elevated)' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}15`, color }}>
                          {icon}
                        </div>
                        <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                      </div>
                      <span className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between px-5 py-4" style={{ background: 'var(--bg-elevated)' }}>
                    <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>Estimated Total (Year 1)</span>
                    <span className="text-[17px] font-black" style={{ color: 'var(--accent)' }}>~₹3.75L</span>
                  </div>
                </div>

                {/* Scholarship calculator */}
                <div className="rounded-2xl p-6" style={{ background: 'var(--accent-bg)', border: '1px solid var(--accent-border)' }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                    <p className="text-[14px] font-bold" style={{ color: 'var(--accent)' }}>Merit Waiver Estimator</p>
                  </div>
                  <p className="text-[12.5px] mb-5" style={{ color: 'var(--text-secondary)' }}>
                    Enter your Class XII percentage to instantly estimate your scholarship waiver.
                  </p>
                  <div className="flex gap-2 mb-4">
                    <input
                      type="number"
                      placeholder="e.g. 92.5"
                      value={customScore}
                      onChange={(e) => setCustomScore(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && calculateScholarship()}
                      className="flex-1 h-11 px-4 rounded-xl text-[14px] outline-none transition-all"
                      style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    />
                    <button
                      onClick={calculateScholarship}
                      className="h-11 px-5 rounded-xl text-[13px] font-bold transition-all flex-shrink-0"
                      style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                      Calculate
                    </button>
                  </div>
                  {/* Scholarship tiers */}
                  <div className="flex flex-col gap-2 mb-4">
                    {[
                      { range: '95%+', waiver: '75% Waiver', color: 'var(--green)' },
                      { range: '88–94%', waiver: '50% Waiver', color: 'var(--accent)' },
                      { range: '80–87%', waiver: '25% Waiver', color: '#8b5cf6' },
                      { range: 'Below 80%', waiver: '10% Waiver', color: 'var(--text-muted)' },
                    ].map(({ range, waiver, color }) => (
                      <div key={range} className="flex items-center justify-between text-[12px]">
                        <span style={{ color: 'var(--text-secondary)' }}>{range}</span>
                        <span className="font-semibold" style={{ color }}>{waiver}</span>
                      </div>
                    ))}
                  </div>
                  <AnimatePresence>
                    {estimatedWaiver !== null && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8 }}
                        className="p-4 rounded-xl text-center"
                        style={{ background: 'rgba(26,174,57,0.1)', border: '1px solid rgba(26,174,57,0.25)' }}
                      >
                        <p className="text-[28px] font-black" style={{ color: 'var(--green)' }}>{estimatedWaiver}% Waiver</p>
                        <p className="text-[12px] mt-1" style={{ color: 'var(--text-secondary)' }}>
                          You could save ₹{Math.round(2.4 * estimatedWaiver / 100 * 10) / 10}L per year
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ROI Preview */}
              <div className="mt-4 rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Estimated Return on Investment</p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total 4-Year Cost', value: '~₹15L', color: 'var(--text-primary)' },
                    { label: 'Avg Starting Salary', value: avgPkg ? (typeof avgPkg === 'number' ? `₹${avgPkg}L/yr` : String(avgPkg)) : '₹8.6L/yr', color: 'var(--green)' },
                    { label: 'Investment Recovery', value: '~2 Years', color: 'var(--accent)' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="text-center p-3 rounded-xl" style={{ background: 'var(--bg-elevated)' }}>
                      <p className="text-[10.5px] uppercase tracking-wider font-semibold mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      <p className="text-[18px] font-black" style={{ color }}>{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ── PLACEMENTS ── */}
            <Section id="placements">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Chapter III</p>
              <h2 className="text-[22px] font-black tracking-tight mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Will I succeed?
              </h2>

              {/* Placement KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: <Trophy size={18} />, label: 'Highest Package', value: highestPkg ? (typeof highestPkg === 'number' ? `₹${highestPkg}L` : String(highestPkg)) : '₹44.5L', sub: 'Annual CTC 2024', color: '#f59e0b' },
                  { icon: <BarChart3 size={18} />, label: 'Average Package', value: avgPkg ? (typeof avgPkg === 'number' ? `₹${avgPkg}L` : String(avgPkg)) : '₹8.6L', sub: 'Median ₹7.2L', color: 'var(--green)' },
                  { icon: <Zap size={18} />, label: 'Placement Rate', value: placementRate ? `${placementRate}%` : '94.2%', sub: 'National avg 78%', color: 'var(--accent)' },
                ].map((s, i) => <StatChip key={s.label} {...s} index={i} />)}
              </div>

              {/* Top Recruiters */}
              <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>Top Recruiters</p>
                  <span className="text-[11.5px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
                    {recruiters.length}+ companies
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recruiters.map((c: string, i: number) => (
                    <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                      <RecruiterPill name={c} />
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Salary distribution visualization */}
              <div className="mt-4 rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                <p className="text-[13px] font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Salary Distribution</p>
                <div className="flex flex-col gap-3">
                  {[
                    { range: '₹20L+', pct: 8, label: 'Top offers', color: '#f59e0b' },
                    { range: '₹12–20L', pct: 22, label: 'Senior roles', color: 'var(--accent)' },
                    { range: '₹8–12L', pct: 42, label: 'Most placed', color: 'var(--green)' },
                    { range: '₹5–8L', pct: 28, label: 'Entry level', color: '#8b5cf6' },
                  ].map(({ range, pct, label, color }) => (
                    <div key={range}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>{range}</span>
                        <span className="text-[12px] font-bold" style={{ color }}>{pct}% · {label}</span>
                      </div>
                      <MiniBar pct={pct * (100 / 45)} color={color} />
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            {/* ── PROGRAMS ── */}
            <Section id="programs">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Chapter IV</p>
              <h2 className="text-[22px] font-black tracking-tight mb-5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Find your program
              </h2>

              <div className="flex flex-col lg:flex-row gap-4">
                {/* Program Explorer */}
                <div className="flex-1 rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  {/* Search & Filter Header */}
                  <div className="p-4 flex items-center gap-3" style={{ background: 'var(--bg-elevated)', borderBottom: '1px solid var(--border)' }}>
                    <div className="relative flex-1">
                      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        placeholder="Search programs..."
                        value={programSearch}
                        onChange={(e) => setProgramSearch(e.target.value)}
                        className="w-full h-9 pl-9 pr-3 rounded-xl text-[13px] outline-none"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                      />
                    </div>
                    <select
                      value={programLevelFilter}
                      onChange={e => setProgramLevelFilter(e.target.value)}
                      className="h-9 px-3 rounded-xl text-[12.5px] font-medium outline-none cursor-pointer"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                    >
                      {['All', 'UG', 'PG', 'PhD', 'Diploma'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>

                  {/* Program list */}
                  <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
                    {filteredPrograms.length === 0 ? (
                      <div className="py-12 text-center" style={{ color: 'var(--text-muted)' }}>
                        <GraduationCap size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-[13px]">{programs.length === 0 ? 'No programs listed yet.' : `No programs match "${programSearch}".`}</p>
                      </div>
                    ) : (
                      filteredPrograms.map((prog, i) => (
                        <button
                          key={prog.id}
                          onClick={() => setSelectedProgramDetail(prog)}
                          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSelectedProgramDetail(prog) }}
                          className="w-full flex items-center justify-between gap-3 px-5 py-4 cursor-pointer transition-colors text-left"
                          style={{
                            borderBottom: '1px solid var(--border)',
                            background: selectedProgramDetail?.id === prog.id ? 'var(--accent-bg)' : i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-elevated)',
                            border: 'none',
                          }}
                          onMouseEnter={e => { if (selectedProgramDetail?.id !== prog.id) (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = selectedProgramDetail?.id === prog.id ? 'var(--accent-bg)' : i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-elevated)' }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                                style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                                {prog.level || 'UG'}
                              </span>
                              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{prog.duration || '4 Years'}</span>
                            </div>
                            <p className="text-[13.5px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{prog.name}</p>
                            {prog.department && <p className="text-[11.5px]" style={{ color: 'var(--text-muted)' }}>{prog.department}</p>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <span className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>
                              {prog.annualFee ? `₹${(prog.annualFee / 100000).toFixed(1)}L/yr` : prog.fees || '—'}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedProgram(prog) }}
                              className="h-8 px-3 rounded-lg text-[12px] font-semibold transition-all"
                              style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                            >
                              Apply
                            </button>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Program Detail Panel */}
                <AnimatePresence mode="wait">
                  {selectedProgramDetail ? (
                    <motion.div
                      key={selectedProgramDetail.id}
                      initial={{ opacity: 0, x: 16 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      className="lg:w-72 rounded-2xl p-5 flex flex-col gap-4"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--accent-border)' }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                            style={{ background: 'var(--accent-bg)', color: 'var(--accent)' }}>
                            {selectedProgramDetail.level || 'UG'}
                          </span>
                          <h3 className="text-[16px] font-black mt-2 leading-tight" style={{ color: 'var(--text-primary)' }}>
                            {selectedProgramDetail.name}
                          </h3>
                        </div>
                        <button onClick={() => setSelectedProgramDetail(null)} className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)' }}>
                          <X size={13} />
                        </button>
                      </div>

                      <div className="flex flex-col gap-2.5">
                        {[
                          { label: 'Duration', value: selectedProgramDetail.duration || '4 Years' },
                          { label: 'Annual Fee', value: selectedProgramDetail.annualFee ? `₹${(selectedProgramDetail.annualFee / 100000).toFixed(1)}L` : selectedProgramDetail.fees || '₹2.2L' },
                          { label: 'Eligibility', value: selectedProgramDetail.eligibility || 'Class XII 60%+' },
                          { label: 'Seats', value: selectedProgramDetail.totalSeats ? `${selectedProgramDetail.totalSeats} seats` : 'Limited' },
                        ].map(({ label, value }) => (
                          <div key={label} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid var(--border)' }}>
                            <span className="text-[12px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
                            <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</span>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setSelectedProgram(selectedProgramDetail)}
                        className="w-full h-10 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 transition-all"
                        style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer' }}
                      >
                        Apply for this Program <ArrowRight size={14} strokeWidth={2.5} />
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="lg:w-72 rounded-2xl flex flex-col items-center justify-center gap-3 p-8 text-center"
                      style={{ background: 'var(--bg-elevated)', border: '1px dashed var(--border)' }}
                    >
                      <Layers size={28} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
                      <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>
                        Click any program to see details
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Section>

            {/* ── CAMPUS LIFE ── */}
            <Section id="campus">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Chapter V</p>
              <h2 className="text-[22px] font-black tracking-tight mb-5" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                Campus & Life
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
                {[
                  { icon: <Home size={16} />, label: 'Hostel', value: university.hostelAvailable !== false ? 'Available' : 'Off-campus', color: '#8b5cf6' },
                  { icon: <Wifi size={16} />, label: 'Wi-Fi Campus', value: 'High Speed', color: 'var(--accent)' },
                  { icon: <FlaskConical size={16} />, label: 'Research Labs', value: '40+ Labs', color: '#ec4899' },
                  { icon: <BookOpen size={16} />, label: 'Library', value: '5L+ Books', color: '#f59e0b' },
                  { icon: <TreePine size={16} />, label: 'Campus Area', value: university.campusSize ? `${university.campusSize} Acres` : '220+ Acres', color: 'var(--green)' },
                  { icon: <Globe size={16} />, label: 'Student Clubs', value: '100+ Clubs', color: 'var(--red)' },
                ].map(({ icon, label, value, color }) => (
                  <div key={label} className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${color}15`, color }}>
                      {icon}
                    </div>
                    <div>
                      <p className="text-[10.5px] uppercase tracking-wider font-semibold mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      <p className="text-[13px] font-bold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Facilities tags */}
              {university.facilities?.length > 0 && (
                <div className="rounded-2xl p-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Facilities & Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {university.facilities.map((f: string, i: number) => (
                      <span key={i} className="text-[12.5px] font-medium px-3 py-1.5 rounded-full"
                        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {/* ── APPLICATION TIMELINE ── */}
            <div className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--accent)' }}>Your Journey</p>
              <h3 className="text-[18px] font-black mb-6" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                Application Timeline
              </h3>
              <div>
                {[
                  { title: 'Check Eligibility', desc: 'Verify you meet minimum Class XII and entrance exam requirements.', done: true },
                  { title: 'Complete Documents', desc: 'Upload transcripts, ID, and supporting documents to your EDUING profile.', done: missingDocs.length === 0 },
                  { title: 'Profile Verification', desc: 'EDUING verifies your documents — usually within 48 hours.', done: false },
                  { title: 'Submit Application', desc: 'Apply to this university directly through EDUING in one click.', done: applicationSubmitted },
                  { title: 'Track Admission', desc: 'Monitor your application status in real time on your dashboard.', done: false },
                  { title: 'Enrollment', desc: 'Receive your offer letter and complete enrollment formalities.', done: false },
                ].map((step, i, arr) => (
                  <TimelineStep key={step.title} step={i + 1} title={step.title} desc={step.desc} done={step.done} active={!step.done && arr.slice(0, i).every(s => s.done)} last={i === arr.length - 1} />
                ))}
              </div>
            </div>

            {/* ── FINAL CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl p-8 text-center relative overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e1b4b 60%, #312e81 100%)' }}
            >
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(ellipse at 70% 30%, #6366f1 0%, transparent 60%)' }} />
              <div className="relative z-10">
                <p className="text-[12px] font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(167,139,250,0.8)' }}>Ready to begin?</p>
                <h3 className="font-black text-[24px] mb-3 text-white" style={{ letterSpacing: '-0.03em' }}>
                  Start your journey at {university.shortName || university.name}
                </h3>
                <p className="text-[14px] mb-6 max-w-md mx-auto" style={{ color: 'rgba(255,255,255,0.65)' }}>
                  Submit your application through EDUING and track every stage in real time — from eligibility to enrollment.
                </p>
                <div className="flex items-center justify-center gap-3 flex-wrap">
                  <button
                    onClick={() => handleApply({ name: 'General Admission' })}
                    disabled={applying || applicationSubmitted}
                    className="flex items-center gap-2 h-12 px-8 rounded-xl text-[14px] font-bold transition-all"
                    style={{
                      background: applicationSubmitted ? 'rgba(26,174,57,0.8)' : '#fff',
                      color: applicationSubmitted ? '#fff' : '#1e3a8a',
                      border: 'none',
                      cursor: applying || applicationSubmitted ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}
                  >
                    {applicationSubmitted ? (
                      <><CheckCircle2 size={17} /> Application Submitted!</>
                    ) : applying ? 'Submitting…' : (
                      <>Apply Now <ArrowRight size={16} strokeWidth={2.5} /></>
                    )}
                  </button>
                  <button
                    onClick={() => setIsBookmarked(v => !v)}
                    className="flex items-center gap-2 h-12 px-6 rounded-xl text-[14px] font-semibold transition-all"
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer' }}
                  >
                    <Bookmark size={16} style={{ fill: isBookmarked ? '#fff' : 'none' }} /> {isBookmarked ? 'Saved' : 'Save'}
                  </button>
                </div>
              </div>
            </motion.div>

            <div className="h-6" />
          </div>

          {/* ── STICKY SIDEBAR (desktop only) ── */}
          <div className="hidden xl:block w-[220px] shrink-0">
            <div
              className="sticky flex flex-col gap-3"
              style={{ top: 'calc(56px + 44px + 16px)' }}
            >
              {/* Match Score Mini */}
              <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', boxShadow: 'var(--shadow-card)' }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Your Fit</p>
                <div className="flex items-center gap-3 mb-2">
                  <RadialProgress value={overallProb} size={52} stroke={6} color={overallProb >= 70 ? 'var(--green)' : overallProb >= 50 ? 'var(--gold)' : 'var(--red)'} />
                  <div>
                    <p className="text-[21px] font-black leading-none" style={{ color: 'var(--text-primary)' }}>{overallProb}%</p>
                    <p className="text-[11px] font-medium" style={{ color: overallProb >= 70 ? 'var(--green)' : overallProb >= 50 ? 'var(--gold)' : 'var(--red)' }}>
                      {overallProb >= 70 ? 'Strong' : overallProb >= 50 ? 'Good' : 'Reach'}
                    </p>
                  </div>
                </div>
                {missingDocs.length > 0 && (
                  <p className="text-[11px] flex items-center gap-1" style={{ color: 'var(--gold)' }}>
                    <AlertCircle size={11} />{missingDocs.length} gap{missingDocs.length > 1 ? 's' : ''} to close
                  </p>
                )}
              </div>

              {/* Quick info */}
              <div className="rounded-2xl p-4 flex flex-col gap-2.5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                {[
                  { icon: <CalendarDays size={13} />, label: 'Deadline', value: university.applicationDeadline || 'June 2025' },
                  { icon: <DollarSign size={13} />, label: 'Fees', value: university.feesPerYear ? `₹${(university.feesPerYear / 100000).toFixed(1)}L/yr` : '₹2.4L/yr' },
                  { icon: <Award size={13} />, label: 'Scholarship', value: 'Up to 75%' },
                ].map(({ icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span style={{ color: 'var(--accent)' }}>{icon}</span>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{label}</p>
                      <p className="text-[12.5px] font-semibold" style={{ color: 'var(--text-primary)' }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sidebar CTAs */}
              <button
                onClick={() => handleApply({ name: 'General Admission' })}
                disabled={applying || applicationSubmitted}
                className="w-full h-10 rounded-xl text-[13px] font-bold flex items-center justify-center gap-1.5 transition-all"
                style={{ background: 'var(--accent)', color: '#fff', border: 'none', cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,117,222,0.4)' }}
              >
                {applicationSubmitted ? <><CheckCircle2 size={14} /> Applied!</> : <>Apply Now <ArrowRight size={13} strokeWidth={2.5} /></>}
              </button>
              <button
                onClick={() => setIsBookmarked(v => !v)}
                className="w-full h-9 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                style={{
                  background: isBookmarked ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                  color: isBookmarked ? 'var(--accent)' : 'var(--text-secondary)',
                  border: `1px solid ${isBookmarked ? 'var(--accent-border)' : 'var(--border)'}`,
                  cursor: 'pointer',
                }}
              >
                <Bookmark size={13} style={{ fill: isBookmarked ? 'var(--accent)' : 'none' }} />
                {isBookmarked ? 'Saved' : 'Save'}
              </button>
              <button
                onClick={handleShare}
                className="w-full h-9 rounded-xl text-[12.5px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border)', cursor: 'pointer' }}
              >
                {copiedLink ? <><CheckCircle2 size={13} /> Copied!</> : <><Share2 size={13} /> Share</>}
              </button>
            </div>
          </div>

        </div>{/* end two-col */}

        {/* ══════════════════════════════════════════════════════
            APPLY MODAL
        ══════════════════════════════════════════════════════ */}
        <AnimatePresence>
          {selectedProgram && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProgram(null)}
                className="absolute inset-0"
                style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
              />
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 16 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 16 }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="relative w-full max-w-md rounded-2xl p-7"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', boxShadow: '0 24px 64px rgba(0,0,0,0.25)' }}
                role="dialog" aria-modal="true"
              >
                <button
                  onClick={() => setSelectedProgram(null)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={14} />
                </button>

                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 inline-block"
                  style={{ background: 'var(--accent-bg)', color: 'var(--accent)', border: '1px solid var(--accent-border)' }}>
                  {selectedProgram.level || 'Program Application'}
                </span>
                <h3 className="text-[20px] font-black mb-1" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
                  {selectedProgram.name}
                </h3>
                <p className="text-[13px] mb-6" style={{ color: 'var(--text-muted)' }}>{university.name}</p>

                <div className="rounded-xl overflow-hidden mb-5" style={{ border: '1px solid var(--border)' }}>
                  {[
                    { label: 'Duration', value: selectedProgram.duration || '4 Years' },
                    { label: 'Annual Fee', value: selectedProgram.annualFee ? `₹${(selectedProgram.annualFee / 100000).toFixed(1)}L / yr` : selectedProgram.fees || '₹2.2L / yr' },
                    { label: 'Eligibility', value: selectedProgram.eligibility || 'Class XII 60%+' },
                  ].map((row, i, arr) => (
                    <div key={row.label} className="flex justify-between items-center px-4 py-3"
                      style={{ borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-elevated)' }}>
                      <span className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => handleApply(selectedProgram)}
                  disabled={applying || applicationSubmitted}
                  className="w-full h-12 rounded-xl text-[14px] font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: applicationSubmitted ? 'var(--green)' : 'var(--accent)',
                    color: '#fff', border: 'none',
                    cursor: applying || applicationSubmitted ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 16px rgba(0,117,222,0.4)',
                  }}
                >
                  {applicationSubmitted ? <><CheckCircle2 size={17} /> Application Submitted!</> : applying ? 'Submitting…' : <><span>Apply for {selectedProgram.name}</span><ArrowRight size={15} strokeWidth={2.5} /></>}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  )
}