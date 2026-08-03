// app/student/universities/[id]/page.tsx
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { onSnapshot, doc, collection, query, where, or } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MapPin, Clock, Building2, Users, ArrowRight, TrendingUp,
  Sparkles, GraduationCap, ShieldCheck, ChevronLeft,
  CheckCircle2, Search, X, Bookmark, DollarSign, Award,
  AlertCircle, Compass, ArrowUpRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { submitApplication } from '@/lib/firebase/applications'
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine'

/* ── Stat pill ─────────────────────────────────────────────────────── */
function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '14px 20px',
        flex: 1,
        minWidth: 120,
      }}
    >
      <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </p>
      <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px', margin: 0 }}>
        {value}
      </p>
    </div>
  )
}

/* ── Program row ────────────────────────────────────────────────────── */
function ProgramRow({ prog, onApply }: { prog: any; onApply: (p: any) => void }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        padding: '14px 20px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card)',
        transition: 'background 0.1s',
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card-hover)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-card)' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
            padding: '1px 8px', borderRadius: 999, background: 'var(--accent-bg)',
            border: '1px solid var(--accent-border)', color: 'var(--accent)',
          }}>
            {prog.level || 'Degree'}
          </span>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
            {prog.duration || '4 Years'}
          </span>
        </div>
        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
          {prog.name}
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
          {prog.department || 'School of Engineering'}
        </p>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          {prog.fees || '₹2.2L/yr'}
        </span>
        <button
          onClick={() => onApply(prog)}
          style={{
            height: 34,
            padding: '0 14px',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            borderRadius: 8,
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'opacity 0.15s',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.88' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
        >
          Apply <ArrowRight size={13} strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}

export default function UniversityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

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
        if (!seen.has(d.id)) {
          seen.add(d.id)
          unique.push({ id: d.id, ...d.data() })
        }
      })
      setPrograms(unique)
    })
    return () => unsubProgs()
  }, [id, university])

  /* ── Probability engine ─── */
  const probData = useMemo(() => {
    if (!university) return null
    return calculateAdmissionProbability(university, { profile, documents, profileScore })
  }, [university, profile, documents, profileScore])

  const overallProb = probData?.overallProbability ?? 75
  const missingDocs = probData?.missingRequirements ?? []

  const filteredPrograms = useMemo(() => {
    if (!programSearch.trim()) return programs
    const q = programSearch.toLowerCase()
    return programs.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.department || '').toLowerCase().includes(q)
    )
  }, [programs, programSearch])

  const handleApply = async (program: any) => {
    if (!user || !university) { router.push('/auth/login'); return }
    setApplying(true)
    try {
      await submitApplication(user.uid, id, university.name, program?.name || 'General Admission')
      setApplicationSubmitted(true)
      setTimeout(() => { setApplying(false); setSelectedProgram(null) }, 1400)
    } catch {
      setApplying(false)
    }
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

  /* ── Loading ─── */
  if (loading) return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        style={{
          width: 36, height: 36,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
        }}
      />
    </div>
  )

  /* ── Not found ─── */
  if (!university) return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
      <Building2 size={40} style={{ color: 'var(--text-muted)' }} strokeWidth={1.5} />
      <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>University not found</h2>
      <button
        onClick={() => router.back()}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 34, padding: '0 14px',
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          color: 'var(--text-primary)', fontSize: 13, fontWeight: 500,
          borderRadius: 8, cursor: 'pointer',
        }}
      >
        <ChevronLeft size={15} /> Go Back
      </button>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'var(--text-primary)' }}>

        {/* ── TOP BAR ─────────────────────────────────────────────── */}
        <div style={{
          position: 'sticky', top: 72, zIndex: 20,
          background: 'var(--bg)/90',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '6px 10px', borderRadius: 6,
              transition: 'color 0.1s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)' }}
          >
            <ChevronLeft size={16} />
            Back to Universities
          </button>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setIsBookmarked(v => !v)}
              aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark university'}
              style={{
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: isBookmarked ? 'var(--accent-bg)' : 'var(--bg-elevated)',
                border: `1px solid ${isBookmarked ? 'var(--accent-border)' : 'var(--border)'}`,
                borderRadius: 8, cursor: 'pointer',
                color: isBookmarked ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              <Bookmark size={15} strokeWidth={1.8} style={{ fill: isBookmarked ? 'var(--accent)' : 'none' }} />
            </button>

            <button
              onClick={handleShare}
              style={{
                position: 'relative',
                width: 34, height: 34,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 8, cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
              aria-label="Copy share link"
            >
              <ArrowUpRight size={15} strokeWidth={1.8} />
              {copiedLink && (
                <span style={{
                  position: 'absolute', bottom: -28, right: 0,
                  background: 'var(--text-primary)', color: 'var(--bg)',
                  fontSize: 11, fontWeight: 600, padding: '2px 8px',
                  borderRadius: 4, whiteSpace: 'nowrap',
                }}>
                  Copied!
                </span>
              )}
            </button>

            <button
              onClick={() => handleApply({ name: 'General Admission' })}
              disabled={applying}
              style={{
                height: 34, padding: '0 16px',
                background: 'var(--accent)', color: '#fff',
                fontSize: 13, fontWeight: 600,
                borderRadius: 8, border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
                opacity: applying ? 0.6 : 1,
              }}
            >
              Apply Now <ArrowRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* ── HERO ───────────────────────────────────────────────── */}
        <div style={{ padding: '40px 0 0', maxWidth: 900, margin: '0 auto' }}>

          {/* Banner */}
          {university.bannerUrl && (
            <div style={{ height: 220, borderRadius: 12, overflow: 'hidden', marginBottom: 28, position: 'relative' }}>
              <Image src={university.bannerUrl} alt={university.name} fill style={{ objectFit: 'cover' }} priority />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(to top, rgba(247,246,243,0.8) 0%, transparent 60%)',
              }} />
            </div>
          )}

          {/* Identity row */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 24 }}>
            {/* Logo */}
            {university.logoUrl ? (
              <div style={{
                width: 64, height: 64, borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--bg-elevated)',
                overflow: 'hidden', position: 'relative', flexShrink: 0,
              }}>
                <Image src={university.logoUrl} alt={university.name} fill style={{ objectFit: 'contain', padding: 8 }} />
              </div>
            ) : (
              <div style={{
                width: 64, height: 64, borderRadius: 12,
                border: '1px solid var(--border)',
                background: 'var(--accent-bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: 'var(--accent)' }}>
                  {(university.name || 'U').charAt(0)}
                </span>
              </div>
            )}

            {/* Name + meta */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {university.nirfRanking && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                    textTransform: 'uppercase', padding: '2px 8px',
                    borderRadius: 999, background: 'var(--accent-bg)',
                    border: '1px solid var(--accent-border)', color: 'var(--accent)',
                  }}>
                    NIRF #{university.nirfRanking}
                  </span>
                )}
                {university.naacGrade && (
                  <span style={{
                    fontSize: 10, fontWeight: 600, letterSpacing: '0.06em',
                    textTransform: 'uppercase', padding: '2px 8px',
                    borderRadius: 999, background: 'rgba(26,174,57,0.08)',
                    border: '1px solid rgba(26,174,57,0.2)', color: '#1AAE39',
                  }}>
                    NAAC {university.naacGrade}
                  </span>
                )}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.5px', margin: '0 0 6px', color: 'var(--text-primary)' }}>
                {university.name}
              </h1>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={13} strokeWidth={1.8} style={{ color: 'var(--accent)', flexShrink: 0 }} />
                {university.city || ''}{university.city && university.state ? ', ' : ''}{university.state || 'India'}
                {university.establishedYear ? ` · Est. ${university.establishedYear}` : ''}
              </p>
            </div>

            {/* Probability badge */}
            <div style={{
              flexShrink: 0,
              padding: '12px 18px',
              border: '1px solid var(--border)',
              borderRadius: 10,
              background: 'var(--bg-card)',
              boxShadow: 'var(--shadow-card)',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>
                Your Fit
              </p>
              <p style={{
                fontSize: 22, fontWeight: 800, margin: 0, letterSpacing: '-0.5px',
                color: overallProb >= 70 ? '#1AAE39' : overallProb >= 50 ? 'var(--gold)' : '#DC2626',
              }}>
                {overallProb}%
              </p>
            </div>
          </div>

          {/* Quick stats */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
            {[
              { label: 'Campus', value: university.campusSize || '220+ Acres' },
              { label: 'Students', value: university.totalStudents || '14,500+' },
              { label: 'Faculty Ratio', value: university.facultyRatio || '14:1' },
              { label: 'Highest Pkg', value: university.highestPackage || '₹44.5 LPA' },
            ].map(s => <StatPill key={s.label} label={s.label} value={s.value} />)}
          </div>

          {/* ── SECTIONS ───────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Admission Fit */}
            <section style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '24px 28px',
              boxShadow: 'var(--shadow-card)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
                Chapter I — Admission Fit
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.25px', margin: '0 0 16px', color: 'var(--text-primary)' }}>
                Can I get in?
              </h2>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                {/* Probability ring */}
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '16px 24px', border: '1px solid var(--border)',
                  borderRadius: 10, background: 'var(--bg)',
                }}>
                  <div style={{ position: 'relative', width: 72, height: 72 }}>
                    <svg width={72} height={72} style={{ transform: 'rotate(-90deg)' }}>
                      <circle cx={36} cy={36} r={28} fill="none" stroke="var(--border)" strokeWidth={6} />
                      <motion.circle
                        cx={36} cy={36} r={28} fill="none"
                        stroke={overallProb >= 70 ? '#1AAE39' : overallProb >= 50 ? 'var(--gold)' : '#DC2626'}
                        strokeWidth={6} strokeLinecap="round"
                        strokeDasharray={175.9}
                        initial={{ strokeDashoffset: 175.9 }}
                        animate={{ strokeDashoffset: 175.9 - (overallProb / 100) * 175.9 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div style={{
                      position: 'absolute', inset: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {overallProb}%
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Probability
                  </span>
                </div>

                {/* Strengths & gaps */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                    Verified Strengths
                  </p>
                  {['High Class XII percentile', 'Academic transcript verified', 'Identity proof verified'].map((s, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <CheckCircle2 size={13} style={{ color: '#1AAE39', flexShrink: 0 }} strokeWidth={2} />
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{s}</span>
                    </div>
                  ))}

                  {missingDocs.length > 0 && (
                    <>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '14px 0 8px' }}>
                        Action Required
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {missingDocs.map((d: string, i: number) => (
                          <span key={i} style={{
                            fontSize: 11, padding: '2px 8px', borderRadius: 6,
                            background: 'rgba(217,119,6,0.08)', border: '1px solid rgba(217,119,6,0.2)',
                            color: 'var(--gold)',
                          }}>
                            {d}
                          </span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Financials */}
            <section style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '24px 28px',
              boxShadow: 'var(--shadow-card)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
                Chapter II — Financials
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.25px', margin: '0 0 20px', color: 'var(--text-primary)' }}>
                Can I afford it?
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {/* Cost breakdown */}
                <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  {[
                    { label: 'Tuition Fee (Per Annum)', value: university.tuitionRange || '₹2,40,000' },
                    { label: 'Hostel & Dining (Optional)', value: university.hostelFees || '₹95,000' },
                    { label: 'One-time Caution Deposit', value: '₹15,000' },
                  ].map((row, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '12px 16px',
                      borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                      background: i % 2 === 0 ? 'var(--bg-card)' : 'var(--bg)',
                    }}>
                      <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.label}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Scholarship calculator */}
                <div style={{ border: '1px solid var(--accent-border)', borderRadius: 10, padding: '16px', background: 'var(--accent-bg)' }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent)', margin: '0 0 8px' }}>
                    Merit Waiver Calculator
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.4 }}>
                    Enter your Class XII % to estimate your tuition waiver.
                  </p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="number"
                      placeholder="e.g. 92"
                      value={customScore}
                      onChange={(e) => setCustomScore(e.target.value)}
                      style={{
                        flex: 1, height: 36, padding: '0 12px',
                        background: 'var(--bg-elevated)',
                        border: '1px solid var(--border)',
                        borderRadius: 8, fontSize: 13,
                        color: 'var(--text-primary)',
                        outline: 'none',
                      }}
                    />
                    <button
                      onClick={calculateScholarship}
                      style={{
                        height: 36, padding: '0 14px',
                        background: 'var(--accent)', color: '#fff',
                        fontSize: 12, fontWeight: 600,
                        borderRadius: 8, border: 'none', cursor: 'pointer',
                        flexShrink: 0,
                      }}
                    >
                      Calculate
                    </button>
                  </div>
                  {estimatedWaiver !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        marginTop: 12, padding: '10px 14px',
                        background: 'rgba(26,174,57,0.1)',
                        border: '1px solid rgba(26,174,57,0.2)',
                        borderRadius: 8, textAlign: 'center',
                      }}
                    >
                      <span style={{ fontSize: 20, fontWeight: 800, color: '#1AAE39' }}>
                        {estimatedWaiver}% Waiver
                      </span>
                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '4px 0 0' }}>
                        Based on academic score input
                      </p>
                    </motion.div>
                  )}
                </div>
              </div>
            </section>

            {/* Placements */}
            <section style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '24px 28px',
              boxShadow: 'var(--shadow-card)',
            }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>
                Chapter III — Career Outcomes
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.25px', margin: '0 0 20px', color: 'var(--text-primary)' }}>
                Will I succeed?
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Highest Package', value: university.highestPackage || '₹44.5 LPA', color: '#1AAE39' },
                  { label: 'Average Package', value: university.avgPackage || '₹8.6 LPA', color: 'var(--text-primary)' },
                  { label: 'Placement Rate', value: university.placementPercentage || '94.2%', color: 'var(--accent)' },
                ].map(s => (
                  <div key={s.label} style={{
                    padding: '14px 16px',
                    border: '1px solid var(--border)',
                    borderRadius: 10,
                    background: 'var(--bg)',
                  }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 6px' }}>
                      {s.label}
                    </p>
                    <p style={{ fontSize: 22, fontWeight: 800, color: s.color, margin: 0, letterSpacing: '-0.5px' }}>
                      {s.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Recruiters */}
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
                Top Recruiters
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {['Google', 'Microsoft', 'Amazon', 'Deloitte', 'TCS Digital', 'Infosys', 'Accenture', 'Goldman Sachs'].map((c, i) => (
                  <span key={i} style={{
                    fontSize: 12, fontWeight: 500,
                    padding: '4px 12px', borderRadius: 6,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-secondary)',
                  }}>
                    {c}
                  </span>
                ))}
              </div>
            </section>

            {/* Programs */}
            <section style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: 'var(--shadow-card)',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '20px 24px', borderBottom: '1px solid var(--border)',
              }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 2px' }}>
                    Chapter V
                  </p>
                  <h2 style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.25px', margin: 0, color: 'var(--text-primary)' }}>
                    Academic Programs
                  </h2>
                </div>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} strokeWidth={1.8} />
                  <input
                    type="text"
                    placeholder="Search programs..."
                    value={programSearch}
                    onChange={(e) => setProgramSearch(e.target.value)}
                    style={{
                      width: 200, height: 34, paddingLeft: 30, paddingRight: 12,
                      background: 'var(--bg)',
                      border: '1px solid var(--border)',
                      borderRadius: 8, fontSize: 13,
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {filteredPrograms.length === 0 ? (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
                  {programs.length === 0 ? 'No programs listed for this university yet.' : `No programs match "${programSearch}".`}
                </div>
              ) : (
                filteredPrograms.map(prog => (
                  <ProgramRow key={prog.id} prog={prog} onApply={setSelectedProgram} />
                ))
              )}
            </section>

            {/* CTA */}
            <div style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: 'var(--shadow-card)',
            }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px', color: 'var(--text-primary)', marginBottom: 10 }}>
                Ready to apply to {university.name}?
              </h2>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
                Submit your direct application through EDUING and track every stage in real time.
              </p>
              <button
                onClick={() => handleApply({ name: 'General Admission' })}
                disabled={applying || applicationSubmitted}
                style={{
                  height: 42, padding: '0 28px',
                  background: 'var(--accent)', color: '#fff',
                  fontSize: 14, fontWeight: 600,
                  borderRadius: 10, border: 'none', cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  opacity: applying ? 0.6 : 1,
                }}
              >
                {applicationSubmitted ? (
                  <><CheckCircle2 size={16} /> Submitted!</>
                ) : applying ? (
                  'Submitting…'
                ) : (
                  <><span>Submit Application</span> <ArrowRight size={15} strokeWidth={2} /></>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* ── PROGRAM MODAL ─────────────────────────────────────── */}
        <AnimatePresence>
          {selectedProgram && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProgram(null)}
                style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
              />
              <motion.div
                initial={{ scale: 0.96, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.96, opacity: 0 }}
                style={{
                  position: 'relative',
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border)',
                  borderRadius: 14,
                  padding: '28px 28px 24px',
                  width: '100%',
                  maxWidth: 440,
                  boxShadow: 'var(--shadow-card-hover)',
                }}
                role="dialog"
                aria-modal="true"
                aria-label={`Apply for ${selectedProgram.name}`}
              >
                <button
                  onClick={() => setSelectedProgram(null)}
                  aria-label="Close modal"
                  style={{
                    position: 'absolute', top: 16, right: 16,
                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)',
                  }}
                >
                  <X size={14} strokeWidth={2} />
                </button>

                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase',
                  color: 'var(--accent)', marginBottom: 8, display: 'block',
                }}>
                  {selectedProgram.level || 'Program'}
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.25px', margin: '0 0 4px', color: 'var(--text-primary)' }}>
                  {selectedProgram.name}
                </h3>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '0 0 20px' }}>
                  {university.name}
                </p>

                {[
                  { label: 'Duration', value: selectedProgram.duration || '4 Years' },
                  { label: 'Tuition Fee', value: selectedProgram.fees || '₹2.2L / yr' },
                  { label: 'Eligibility', value: 'Class XII 60%+' },
                ].map((row, i, arr) => (
                  <div key={row.label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    padding: '10px 0',
                    borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{row.value}</span>
                  </div>
                ))}

                <button
                  onClick={() => handleApply(selectedProgram)}
                  disabled={applying || applicationSubmitted}
                  style={{
                    width: '100%', height: 40, marginTop: 20,
                    background: 'var(--accent)', color: '#fff',
                    fontSize: 13, fontWeight: 600,
                    borderRadius: 8, border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    opacity: applying ? 0.6 : 1,
                  }}
                >
                  {applicationSubmitted ? (
                    <><CheckCircle2 size={15} /> Application Submitted!</>
                  ) : applying ? (
                    'Submitting…'
                  ) : (
                    <><span>Apply for {selectedProgram.name}</span> <ArrowRight size={14} strokeWidth={2} /></>
                  )}
                </button>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  )
}