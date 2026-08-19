// app/student/scholarships/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Search, Award, Building2, CheckCircle2, Sparkles, AlertCircle, Bookmark, X } from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'
import { listenScholarships } from '@/lib/firebase/scholarships'
import { calculateScholarshipEligibility, ScholarshipResult } from '@/lib/utils/scholarshipEngine'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { EmptyState } from '@/components/ui/EmptyState'

const TABS = ['All', 'Eligible', 'Applied', 'Saved']

const CARD: React.CSSProperties = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  overflow: 'hidden',
  boxShadow: '0 0.175px 1px rgba(0,0,0,0.015), 0 0.8px 2.9px rgba(0,0,0,0.022)',
}

function Dot({ color }: { color: string }) {
  return <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: color, marginRight: 6, flexShrink: 0 }} />
}

export default function ScholarshipsPage() {
  const { profile, documents, profileScore, applications, savedPrograms } = useStudentData()
  const [scholarships, setScholarships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedSch, setSelectedSch] = useState<ScholarshipResult | null>(null)

  useEffect(() => {
    const unsub = listenScholarships(
      (data) => { setScholarships(data); setLoading(false) },
      () => setLoading(false),
    )
    return () => unsub()
  }, [])

  const results = useMemo(() => {
    if (!profile) return []
    return calculateScholarshipEligibility({ profile, documents, profileScore }, scholarships)
      .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
  }, [profile, documents, profileScore, scholarships])

  const eligibleCount = results.filter(r => r.eligibilityScore >= 75).length
  const safeApps = useMemo(() => Array.isArray(applications) ? applications : [], [applications])
  const safeSaved = useMemo(() => Array.isArray(savedPrograms) ? savedPrograms : [], [savedPrograms])

  // Build stable Sets for Applied and Saved tabs
  const appliedScholarshipIds = useMemo(() => new Set(
    safeApps
      .filter((a: any) => a.type === 'scholarship' || a.scholarshipId)
      .map((a: any) => a.scholarshipId || a.universityId)
  ), [safeApps])
  const savedScholarshipIds = useMemo(() => new Set(
    safeSaved
      .filter((p: any) => p.scholarshipAvailable && p.scholarshipId)
      .map((p: any) => p.scholarshipId)
  ), [safeSaved])

  const appliedCount = appliedScholarshipIds.size
  const savedCount = savedScholarshipIds.size

  const filteredResults = useMemo(() => results.filter(r => {
    const matchSearch = !search ||
      r.scholarship.name?.toLowerCase().includes(search.toLowerCase()) ||
      r.scholarship.provider?.toLowerCase().includes(search.toLowerCase())
    let matchTab = true
    if (activeTab === 'Eligible') matchTab = r.eligibilityScore >= 75
    if (activeTab === 'Applied') {
      // Show scholarships that the student has applied to
      matchTab = appliedScholarshipIds.has(r.scholarship.id)
    }
    if (activeTab === 'Saved') {
      // Show scholarships that the student has saved
      matchTab = savedScholarshipIds.has(r.scholarship.id)
    }
    return matchSearch && matchTab
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [results, search, activeTab, appliedScholarshipIds, savedScholarshipIds])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── KPI ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {[
            { label: 'Total Found', value: results.length, sub: 'In database', color: 'var(--accent)', Icon: Award },
            { label: 'Eligible', value: eligibleCount, sub: 'Match ≥ 75%', color: 'var(--green)', Icon: CheckCircle2 },
            { label: 'Applied', value: appliedCount, sub: 'Applications sent', color: '#8B5CF6', Icon: Bookmark },
            { label: 'Saved', value: savedCount, sub: 'Bookmarked', color: 'var(--gold)', Icon: Bookmark },
          ].map(({ label, value, sub, color, Icon }) => (
            <div key={label} style={{
              ...CARD,
              padding: '16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8,
                background: `${color}12`, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={15} style={{ color }} strokeWidth={1.8} />
              </div>
              <div>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 2px' }}>{label}</p>
                <p style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-1px', color, margin: '0 0 1px', lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── TABS + SEARCH ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} strokeWidth={1.8} />
            <input
              type="text"
              placeholder="Search scholarships..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: 220, height: 30,
                paddingLeft: 28, paddingRight: 10,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 6, fontSize: 12,
                color: 'var(--text-primary)', outline: 'none',
                transition: 'border-color 0.15s',
              }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
            />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div style={CARD}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 18px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>All Scholarships</span>
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{filteredResults.length} results</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                {['Name', 'Provider', 'Amount', 'Deadline', 'Match', ''].map(h => (
                  <th key={h} style={{
                    padding: '10px 16px', textAlign: 'left',
                    fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.06em', color: 'var(--text-muted)',
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32 }}>
                    <EmptyState
                      icon={Award}
                      title={search ? `No scholarships matching "${search}"` : 'No scholarships available'}
                      description="Complete your profile to discover personalised scholarship matches."
                      primaryCtaLabel="Complete Profile"
                      primaryCtaHref="/student/profile"
                    />
                  </td>
                </tr>
              ) : filteredResults.map((r, i) => {
                const s = r.scholarship
                const isHighMatch = r.eligibilityScore >= 75
                const matchColor = isHighMatch ? 'var(--green)' : 'var(--accent)'

                return (
                  <tr
                    key={i}
                    onClick={() => setSelectedSch(r)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') setSelectedSch(r) }}
                    style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-card-hover)' }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%',
                          background: isHighMatch ? 'rgba(26,174,57,0.1)' : 'var(--accent-bg)',
                          border: `1px solid ${isHighMatch ? 'rgba(26,174,57,0.2)' : 'var(--accent-border)'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <Award size={13} style={{ color: isHighMatch ? 'var(--green)' : 'var(--accent)' }} strokeWidth={1.8} />
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Building2 size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} strokeWidth={1.8} />
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {s.provider || 'Provider'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                        {s.valueType === 'amount' && s.amount ? `₹${s.amount.toLocaleString()}` : s.valueType === 'percentage' && s.percentage ? `Up to ${s.percentage}%` : 'Variable'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                        {s.deadline ? new Date(s.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Rolling'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 48, height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${r.eligibilityScore}%`, background: matchColor, borderRadius: 2 }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: matchColor }}>{r.eligibilityScore}%</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={e => e.stopPropagation()}
                        aria-label="Save scholarship"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)' }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-faint)' }}
                      >
                        <Bookmark size={13} strokeWidth={1.8} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* ── DRAWER ── */}
        <AnimatePresence>
          {selectedSch && (
            <>
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedSch(null)}
                style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 50 }}
              />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                style={{
                  position: 'fixed', top: 0, right: 0, bottom: 0,
                  width: '100%', maxWidth: 480,
                  background: 'var(--bg-elevated)',
                  borderLeft: '1px solid var(--border)',
                  zIndex: 51, display: 'flex', flexDirection: 'column',
                  boxShadow: '0 4px 18px rgba(0,0,0,0.1)',
                  fontFamily: 'Inter, system-ui, sans-serif',
                }}
              >
                {/* Header */}
                <div style={{
                  position: 'sticky', top: 0, zIndex: 10,
                  background: 'var(--bg-elevated)',
                  borderBottom: '1px solid var(--border)',
                  padding: '16px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 38, height: 38, borderRadius: 10,
                      background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Award size={18} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0, maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {selectedSch.scholarship.name}
                      </p>
                      <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>
                        {selectedSch.scholarship.provider || 'Provider'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedSch(null)}
                    aria-label="Close"
                    style={{
                      width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: 'var(--bg)', border: '1px solid var(--border)',
                      borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)',
                    }}
                  >
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>

                {/* Body */}
                <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>

                  {/* Meta grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {[
                      { label: 'Amount', value: selectedSch.scholarship.valueType === 'amount' && selectedSch.scholarship.amount ? `₹${selectedSch.scholarship.amount.toLocaleString()}` : 'Variable' },
                      { label: 'Match', value: `${selectedSch.eligibilityScore}%` },
                      { label: 'Deadline', value: selectedSch.scholarship.deadline ? new Date(selectedSch.scholarship.deadline).toLocaleDateString('en-IN') : 'Rolling' },
                      { label: 'Level', value: selectedSch.scholarship.targetDegrees?.join(', ') || 'Any' },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
                        <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{label}</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Analysis */}
                  <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <Sparkles size={14} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Match Analysis</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedSch.matchReasons.map((reason: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <CheckCircle2 size={13} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 1 }} strokeWidth={2} />
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{reason}</span>
                        </div>
                      ))}
                      {selectedSch.missingRequirements.map((req: string, idx: number) => (
                        <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                          <AlertCircle size={13} style={{ color: 'var(--red)', flexShrink: 0, marginTop: 1 }} strokeWidth={2} />
                          <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedSch.scholarship.description && (
                    <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px' }}>Description</p>
                      <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                        {selectedSch.scholarship.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div style={{
                  position: 'sticky', bottom: 0,
                  background: 'var(--bg-elevated)',
                  borderTop: '1px solid var(--border)',
                  padding: '14px 20px',
                  display: 'flex', gap: 10,
                }}>
                  <button style={{
                    flex: 1, height: 34,
                    background: 'var(--accent)', color: '#fff',
                    border: 'none', borderRadius: 8,
                    fontSize: 13, fontWeight: 600, cursor: 'pointer',
                  }}>
                    Apply Now
                  </button>
                  <button style={{
                    height: 34, padding: '0 14px',
                    background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 13, fontWeight: 500,
                    color: 'var(--text-secondary)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Bookmark size={13} strokeWidth={1.8} /> Save
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}