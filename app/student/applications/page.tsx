// app/student/applications/page.tsx
'use client'

import React, { useState, useMemo } from 'react'
import {
  Search, Building2, X, FileText, Award,
  AlertCircle, ChevronDown, MoreHorizontal,
  CheckCircle2, Clock, Calendar, LayoutGrid, List,
  Sparkles, Zap, Mail, MessageSquare
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { EmptyState } from '@/components/ui/EmptyState'
import Link from 'next/link'

/* ── Status config ───────────────────────────────────────────────── */
function normalizeStatus(s: string) {
  if (!s) return 'draft'
  const v = s.toLowerCase()
  if (v === 'submitted') return 'submitted'
  if (v === 'review' || v === 'under_review') return 'under_review'
  if (v === 'interview') return 'interview'
  if (v === 'accepted' || v === 'selected') return 'accepted'
  if (v === 'reject' || v === 'rejected') return 'rejected'
  return 'draft'
}

type StatusKey = 'draft' | 'submitted' | 'under_review' | 'interview' | 'accepted' | 'rejected'

const STATUS_CONFIG: Record<StatusKey, { label: string; dotColor: string; textColor: string; bgColor: string }> = {
  draft: { label: 'Draft', dotColor: 'var(--text-muted)', textColor: 'var(--text-secondary)', bgColor: 'rgba(0,0,0,0.05)' },
  submitted: { label: 'Submitted', dotColor: 'var(--accent)', textColor: 'var(--accent)', bgColor: 'var(--accent-bg)' },
  under_review: { label: 'Under Review', dotColor: 'var(--gold)', textColor: 'var(--gold)', bgColor: 'rgba(217,119,6,0.08)' },
  interview: { label: 'Interview', dotColor: '#8B5CF6', textColor: '#8B5CF6', bgColor: 'rgba(139,92,246,0.08)' },
  accepted: { label: 'Accepted', dotColor: 'var(--green)', textColor: 'var(--green)', bgColor: 'rgba(26,174,57,0.08)' },
  rejected: { label: 'Rejected', dotColor: 'var(--red)', textColor: 'var(--red)', bgColor: 'rgba(220,38,38,0.07)' },
}

const BOARD_COLUMNS: { id: StatusKey; label: string }[] = [
  { id: 'draft', label: 'Draft' },
  { id: 'submitted', label: 'Submitted' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'interview', label: 'Interview' },
  { id: 'accepted', label: 'Accepted' },
  { id: 'rejected', label: 'Rejected' },
]

const TABS = ['All', 'Draft', 'Submitted', 'Under Review', 'Interview', 'Accepted']

/* ── Mini progress bar ───────────────────────────────────────────── */
function MiniBar({ pct }: { pct: number }) {
  return (
    <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 2 }} />
    </div>
  )
}

/* ── Status badge ────────────────────────────────────────────────── */
function StatusBadge({ status }: { status: StatusKey }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.draft
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, fontWeight: 600,
      padding: '2px 8px', borderRadius: 999,
      background: cfg.bgColor, color: cfg.textColor,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.dotColor, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

/* ── Detail drawer ───────────────────────────────────────────────── */
function DetailDrawer({ app, onClose }: { app: any; onClose: () => void }) {
  const st = normalizeStatus(app.status) as StatusKey
  const cfg = STATUS_CONFIG[st]

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 50 }}
      />
      <motion.div
        role="dialog" aria-modal="true" aria-label={`Application details — ${app.universityName}`}
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '100%', maxWidth: 520,
          background: 'var(--bg-elevated)',
          borderLeft: '1px solid var(--border)',
          zIndex: 51, display: 'flex', flexDirection: 'column',
          boxShadow: '0 4px 18px rgba(0,0,0,0.12)',
        }}
      >
        {/* Drawer header */}
        <div style={{
          position: 'sticky', top: 0,
          background: 'var(--bg-elevated)',
          borderBottom: '1px solid var(--border)',
          padding: '16px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700, color: 'var(--accent)',
            }}>
              {(app.universityName || 'U').charAt(0)}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{app.universityName}</p>
              <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{app.program || app.programName || 'Program'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close panel"
            style={{
              width: 30, height: 30,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg)', border: '1px solid var(--border)',
              borderRadius: 6, cursor: 'pointer', color: 'var(--text-muted)',
            }}
          >
            <X size={14} strokeWidth={2} />
          </button>
        </div>

        {/* Drawer body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Meta grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Status', value: cfg.label },
              { label: 'Progress', value: `${app.progress || 40}%` },
              { label: 'Deadline', value: app.deadline ? new Date(app.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Not set' },
              { label: 'Match', value: '85%' },
            ].map(({ label, value }) => (
              <div key={label} style={{
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '12px 14px',
              }}>
                <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', margin: '0 0 4px' }}>{label}</p>
                <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* AI Analysis */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Sparkles size={14} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>AI Analysis</span>
            </div>
            {[
              { icon: AlertCircle, color: 'var(--gold)', text: 'Missing: Letter of Recommendation' },
              { icon: Zap, color: 'var(--accent)', text: 'Next: Draft SOP using AI Builder' },
            ].map(({ icon: Icon, color, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: i === 0 ? '0 0 10px' : '10px 0 0', borderTop: i > 0 ? '1px solid var(--border)' : 'none' }}>
                <Icon size={13} style={{ color, flexShrink: 0 }} strokeWidth={1.8} />
                <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Timeline */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 14px' }}>Timeline</p>
            <div style={{ position: 'relative', paddingLeft: 18, borderLeft: '1px solid var(--border)', marginLeft: 5, display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { title: 'Application Started', date: 'Oct 12, 2025', done: true },
                { title: 'Documents Uploaded', date: 'Oct 15, 2025', done: true },
                { title: 'Application Submitted', date: 'Oct 20, 2025', done: false, active: true },
                { title: 'Under Review', date: 'Pending', done: false },
                { title: 'Decision', date: 'Pending', done: false },
              ].map(({ title, date, done, active }, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: -23, top: 3,
                    width: 10, height: 10, borderRadius: '50%',
                    border: `2px solid ${done ? 'var(--green)' : active ? 'var(--accent)' : 'var(--border)'}`,
                    background: 'var(--bg-elevated)',
                  }} />
                  <p style={{ fontSize: 13, fontWeight: done || active ? 600 : 400, color: done || active ? 'var(--text-primary)' : 'var(--text-muted)', margin: 0 }}>{title}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{date}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Documents */}
          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 12px' }}>Required Documents</p>
            {['Transcripts', 'Statement of Purpose', 'Passport Copy'].map((docName, i) => (
              <div key={docName} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={13} style={{ color: 'var(--text-muted)' }} strokeWidth={1.8} />
                  <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{docName}</span>
                </div>
                {i === 0 ? (
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                    fontSize: 11, fontWeight: 600,
                    padding: '2px 8px', borderRadius: 999,
                    background: 'rgba(26,174,57,0.08)', color: 'var(--green)',
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)' }} />
                    Uploaded
                  </span>
                ) : (
                  <button style={{
                    fontSize: 12, fontWeight: 500, color: 'var(--accent)',
                    background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2,
                  }}>Upload</button>
                )}
              </div>
            ))}
          </div>
        </div>

          {/* Drawer footer */}
          <div style={{
            position: 'sticky', bottom: 0,
            background: 'var(--bg-elevated)',
            borderTop: '1px solid var(--border)',
            padding: '14px 20px',
            display: 'flex', gap: 10,
            flexWrap: 'wrap',
          }}>
            <button style={{
              flex: 1, height: 34,
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: 8,
              fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>
              Continue Application
            </button>
            {st === 'interview' && (
              <Link
                href={`/student/interview?university=${encodeURIComponent(app.universityName || '')}&program=${encodeURIComponent(app.program || app.programName || '')}`}
                id="prepare-interview-drawer-btn"
                title="Open Interview Prep for this application"
                style={{
                  height: 34, padding: '0 12px',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)',
                  borderRadius: 8, fontSize: 13, fontWeight: 600,
                  color: '#8B5CF6', cursor: 'pointer',
                  textDecoration: 'none',
                  transition: 'background 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(139,92,246,0.18)'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = '#8B5CF6'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(139,92,246,0.1)'
                  ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(139,92,246,0.3)'
                }}
              >
                <MessageSquare size={13} strokeWidth={1.8} />
                Prepare for Interview
              </Link>
            )}
            <Link
              href={`/student/email?university=${encodeURIComponent(app.universityName || '')}&program=${encodeURIComponent(app.program || app.programName || '')}`}
              id="draft-email-drawer-btn"
              title="Open Email Writer for this application"
              style={{
                height: 34, padding: '0 14px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 13, fontWeight: 500,
                color: 'var(--text-secondary)', cursor: 'pointer',
                textDecoration: 'none',
                transition: 'border-color 0.15s, color 0.15s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--accent)'
                ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--accent)'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.borderColor = 'var(--border)'
                ;(e.currentTarget as HTMLAnchorElement).style.color = 'var(--text-secondary)'
              }}
            >
              <Mail size={13} strokeWidth={1.8} />
              Draft an Email
            </Link>
            <button onClick={onClose} style={{
              height: 34, padding: '0 14px',
              background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 8, fontSize: 13, fontWeight: 500,
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}>
              Close
            </button>
          </div>
      </motion.div>
    </>
  )
}

/* ── Main page ───────────────────────────────────────────────────── */
export default function ApplicationsPage() {
  const { uniqueApps, loading, deadlines } = useStudentData()
  const [search, setSearch] = useState('')
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list')
  const [activeTab, setActiveTab] = useState('All')

  const apps = useMemo(() => uniqueApps || [], [uniqueApps])

  const filteredApps = useMemo(() => apps.filter((app: any) => {
    const matchSearch = !search ||
      app.universityName?.toLowerCase().includes(search.toLowerCase()) ||
      app.program?.toLowerCase().includes(search.toLowerCase())
    const tabKey = activeTab.toLowerCase().replace(' ', '_')
    const matchTab = activeTab === 'All' || normalizeStatus(app.status) === tabKey
    return matchSearch && matchTab
  }), [apps, search, activeTab])

  const kpis = [
    { label: 'Active', value: apps.filter((a: any) => !['accepted', 'rejected'].includes(normalizeStatus(a.status))).length, sub: 'In pipeline', color: 'var(--accent)', Icon: FileText },
    { label: 'Submitted', value: apps.filter((a: any) => normalizeStatus(a.status) === 'submitted').length, sub: 'Awaiting review', color: 'var(--green)', Icon: CheckCircle2 },
    { label: 'Offers', value: apps.filter((a: any) => normalizeStatus(a.status) === 'accepted').length, sub: 'Accepted', color: '#8B5CF6', Icon: Award },
    { label: 'Deadlines', value: deadlines?.length || 0, sub: 'Upcoming', color: 'var(--gold)', Icon: Clock },
  ]

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, fontFamily: 'Inter, system-ui, sans-serif' }}>

        {/* ── TABS ── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── KPI ROW ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {kpis.map(({ label, value, sub, color, Icon }) => (
            <div key={label} style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: 10, padding: '16px',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              boxShadow: '0 0.175px 1px rgba(0,0,0,0.015), 0 0.8px 2.9px rgba(0,0,0,0.022)',
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

        {/* ── TABLE CARD ── */}
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: '0 0.175px 1px rgba(0,0,0,0.015), 0 0.8px 2.9px rgba(0,0,0,0.022)',
        }}>
          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '12px 16px', borderBottom: '1px solid var(--border)',
          }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Applications</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <Search size={13} style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} strokeWidth={1.8} />
                <input
                  type="text"
                  placeholder="Search applications"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    width: 200, height: 30, paddingLeft: 28, paddingRight: 10,
                    background: 'var(--bg)', border: '1px solid var(--border)',
                    borderRadius: 6, fontSize: 12,
                    color: 'var(--text-primary)', outline: 'none',
                    transition: 'border-color 0.15s',
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'var(--accent)' }}
                  onBlur={(e) => { e.target.style.borderColor = 'var(--border)' }}
                />
              </div>

              {/* View toggle */}
              <div style={{
                display: 'flex', alignItems: 'center',
                background: 'var(--bg)', border: '1px solid var(--border)',
                borderRadius: 6, padding: 2,
              }}>
                {(['list', 'board'] as const).map(m => (
                  <button key={m} onClick={() => setViewMode(m)}
                    aria-label={`${m} view`}
                    style={{
                      width: 26, height: 24,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 4, border: 'none', cursor: 'pointer',
                      background: viewMode === m ? 'var(--bg-elevated)' : 'transparent',
                      color: viewMode === m ? 'var(--text-primary)' : 'var(--text-muted)',
                      boxShadow: viewMode === m ? '0 1px 2px rgba(0,0,0,0.08)' : 'none',
                    }}>
                    {m === 'list' ? <List size={13} strokeWidth={1.8} /> : <LayoutGrid size={13} strokeWidth={1.8} />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Empty state */}
          {filteredApps.length === 0 && (
            <div style={{ padding: 20 }}>
              <EmptyState
                icon={FileText}
                title={search ? `No applications matching "${search}"` : 'No applications yet'}
                description="Explore top universities and submit your first application to begin tracking your admissions journey."
                primaryCtaLabel="Discover Universities"
                primaryCtaHref="/student/universities"
              />
            </div>
          )}

          {/* ── LIST VIEW ── */}
          {filteredApps.length > 0 && viewMode === 'list' && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  <th style={{ width: 40, padding: '10px 16px' }}>
                    <input type="checkbox" style={{ width: 13, height: 13 }} />
                  </th>
                  {['University', 'Program', 'Status', 'Progress', 'Deadline'].map(h => (
                    <th key={h} style={{
                      padding: '10px 14px', textAlign: 'left',
                      fontSize: 11, fontWeight: 600, textTransform: 'uppercase',
                      letterSpacing: '0.06em', color: 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                  <th style={{ width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app: any, i: number) => {
                  const st = normalizeStatus(app.status) as StatusKey
                  const pct = app.progress || 40
                  return (
                    <tr
                      key={i}
                      onClick={() => setSelectedApp(app)}
                      style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.1s' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-card-hover)' }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLTableRowElement).style.background = 'transparent' }}
                    >
                      <td style={{ padding: '11px 16px' }} onClick={e => e.stopPropagation()}>
                        <input type="checkbox" style={{ width: 13, height: 13 }} />
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 30, height: 30, borderRadius: '50%',
                            background: 'var(--accent-bg)', border: '1px solid var(--accent-border)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          }}>
                            <Building2 size={13} style={{ color: 'var(--accent)' }} strokeWidth={1.8} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {app.universityName || 'University'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 140, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {app.program || app.programName || 'Program'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <StatusBadge status={st} />
                      </td>
                      <td style={{ padding: '11px 14px', width: 160 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1 }}><MiniBar pct={pct} /></div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)', flexShrink: 0 }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                          {app.deadline ? new Date(app.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', textAlign: 'right' }}>
                        <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-faint)' }}>
                          <MoreHorizontal size={15} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {/* ── BOARD VIEW ── */}
          {filteredApps.length > 0 && viewMode === 'board' && (
            <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: '16px', alignItems: 'flex-start' }} className="no-scrollbar">
              {BOARD_COLUMNS.map(col => {
                const colApps = filteredApps.filter((a: any) => normalizeStatus(a.status) === col.id)
                const cfg = STATUS_CONFIG[col.id]
                return (
                  <div key={col.id} style={{
                    minWidth: 240, maxWidth: 240, flexShrink: 0,
                    background: 'var(--bg)',
                    border: '1px solid var(--border)',
                    borderRadius: 10, padding: '10px',
                  }}>
                    {/* Column header */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '2px 4px', marginBottom: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.dotColor }} />
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{col.label}</span>
                      </div>
                      <span style={{
                        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)',
                        background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                        padding: '1px 7px', borderRadius: 999,
                      }}>{colApps.length}</span>
                    </div>

                    {/* Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {colApps.map((app: any, i: number) => (
                        <div
                          key={i}
                          onClick={() => setSelectedApp(app)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={e => { if (e.key === 'Enter') setSelectedApp(app) }}
                          style={{
                            background: 'var(--bg-elevated)',
                            border: '1px solid var(--border)',
                            borderRadius: 8, padding: '12px',
                            cursor: 'pointer', transition: 'border-color 0.15s',
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: 6,
                              background: 'var(--accent-bg)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 12, fontWeight: 700, color: 'var(--accent)',
                            }}>
                              {(app.universityName || 'U').charAt(0)}
                            </div>
                            <MoreHorizontal size={13} style={{ color: 'var(--text-faint)' }} strokeWidth={1.5} />
                          </div>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.universityName}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '0 0 10px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{app.program || app.programName}</p>
                          <MiniBar pct={app.progress || 40} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── DETAIL DRAWER ── */}
        <AnimatePresence>
          {selectedApp && (
            <DetailDrawer app={selectedApp} onClose={() => setSelectedApp(null)} />
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}