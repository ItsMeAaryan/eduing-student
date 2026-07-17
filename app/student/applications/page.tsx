'use client'
import React, { useState, useMemo } from 'react'
import {
  Search, Building2, X, FileText, Zap, Sparkles, ShieldCheck,
  AlertCircle, ChevronDown, MoreHorizontal, SlidersHorizontal,
  CheckCircle2, Clock, Calendar, LayoutGrid, List, Download
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'
import SegmentedTabs from '@/components/ui/SegmentedTabs'

/* ── Status helpers ──────────────────────────────────────── */
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

const STATUS_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  draft:        { label: 'Draft',        color: '#6B7280', bg: '#F3F4F6' },
  submitted:    { label: 'Submitted',    color: '#4F6BFF', bg: '#EEF2FF' },
  under_review: { label: 'Under Review', color: '#D97706', bg: '#FEF3C7' },
  interview:    { label: 'Interview',    color: '#7C3AED', bg: '#EDE9FE' },
  accepted:     { label: 'Accepted',     color: '#059669', bg: '#D1FAE5' },
  rejected:     { label: 'Rejected',     color: '#DC2626', bg: '#FEE2E2' },
}

const COLUMNS = [
  { id: 'draft',        label: 'Draft'        },
  { id: 'submitted',   label: 'Submitted'    },
  { id: 'under_review',label: 'Under Review' },
  { id: 'interview',   label: 'Interview'    },
  { id: 'accepted',    label: 'Accepted'     },
  { id: 'rejected',    label: 'Rejected'     },
]

/* ── Dot sparkline (reuse same pattern as dashboard) ─────── */
function MiniBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div className="w-full h-[5px] bg-[#F3F4F6] rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
    </div>
  )
}

/* ─────────────────────────────────────────────────────────── */
export default function ApplicationsPage() {
  const { uniqueApps, loading, deadlines } = useStudentData()
  const [search, setSearch]           = useState('')
  const [selectedApp, setSelectedApp] = useState<any | null>(null)
  const [viewMode, setViewMode]       = useState<'board' | 'list'>('list')
  const [activeTab, setActiveTab]     = useState('All')

  const apps = uniqueApps || []

  const filteredApps = useMemo(() => {
    return apps.filter((app: any) => {
      const matchSearch = !search ||
        app.universityName?.toLowerCase().includes(search.toLowerCase()) ||
        app.program?.toLowerCase().includes(search.toLowerCase())
      const matchTab = activeTab === 'All' || normalizeStatus(app.status) === activeTab.toLowerCase().replace(' ', '_')
      return matchSearch && matchTab
    })
  }, [apps, search, activeTab])

  const activeApps      = apps.filter((a: any) => !['accepted','rejected'].includes(normalizeStatus(a.status))).length
  const submittedApps   = apps.filter((a: any) => normalizeStatus(a.status) === 'submitted').length
  const offersReceived  = apps.filter((a: any) => normalizeStatus(a.status) === 'accepted').length
  const upcomingDdls    = deadlines?.length || 0

  const TABS = ['All', 'Draft', 'Submitted', 'Under Review', 'Interview', 'Accepted']

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-[36px] h-[36px] border-4 border-[#E5E7EB] border-t-[#4F6BFF] rounded-full animate-spin" />
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[16px]">

        {/* ── SUB-NAV ──────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          <div className="flex items-center gap-[8px] shrink-0 ml-[12px]">
            <button className="flex items-center gap-[6px] px-[14px] h-[34px] rounded-[8px] border border-[#E5E7EB] text-[13px] font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors">
              <SlidersHorizontal size={14} strokeWidth={1.8} />Filter
            </button>
            <button className="flex items-center gap-[6px] px-[16px] h-[34px] rounded-[8px] bg-[#4F6BFF] text-white text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors">
              <Download size={14} strokeWidth={2} />Export
            </button>
          </div>
        </div>

        {/* ── 4 KPI CARDS ──────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-[16px]">
          {[
            { label: 'Active',    value: activeApps,     color: '#4F6BFF', sub: 'In pipeline'    },
            { label: 'Submitted', value: submittedApps,  color: '#059669', sub: 'Awaiting review' },
            { label: 'Offers',    value: offersReceived, color: '#7C3AED', sub: 'Accepted'        },
            { label: 'Deadlines', value: upcomingDdls,   color: '#D97706', sub: 'Upcoming'        },
          ].map(c => (
            <div key={c.label} className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
              <div className="flex items-start justify-between mb-[10px]">
                <span className="text-[14px] text-[#6B7280]">{c.label}</span>
                <MoreHorizontal size={16} strokeWidth={1.5} className="text-[#D1D5DB]" />
              </div>
              <div className="text-[28px] font-bold text-[#111827] leading-none mb-[10px]">{c.value}</div>
              <span className="text-[12px] text-[#9CA3AF]">{c.sub}</span>
            </div>
          ))}
        </div>

        {/* ── TOOLBAR: search + view toggle ────────────────── */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-[15px] font-semibold text-[#111827]">Applications</span>
            <div className="flex items-center gap-[8px]">
              <div className="relative">
                <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.8} />
                <input type="text" placeholder="Search applications"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-[200px] h-[32px] pl-[28px] pr-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[13px] text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] transition-colors" />
              </div>
              <button className="flex items-center gap-[5px] px-[12px] h-[32px] rounded-[8px] border border-[#E5E7EB] text-[12px] font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors">
                <SlidersHorizontal size={12} strokeWidth={1.8} />Sort by<ChevronDown size={11} />
              </button>
              {/* View toggle */}
              <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[3px]">
                {([['list', List], ['board', LayoutGrid]] as const).map(([m, Icon]) => (
                  <button key={m} onClick={() => setViewMode(m as any)}
                    className={`w-[28px] h-[26px] flex items-center justify-center rounded-[6px] transition-colors ${viewMode === m ? 'bg-white shadow-sm text-[#111827]' : 'text-[#9CA3AF] hover:text-[#111827]'}`}>
                    <Icon size={13} strokeWidth={1.8} />
                  </button>
                ))}
              </div>
              <MoreHorizontal size={16} strokeWidth={1.5} className="text-[#D1D5DB]" />
            </div>
          </div>

          {/* ── EMPTY STATE ──────────────────────────────── */}
          {filteredApps.length === 0 && (
            <div className="flex flex-col items-center justify-center py-[64px]">
              <div className="w-[48px] h-[48px] bg-[#EEF2FF] rounded-[12px] flex items-center justify-center mb-[16px]">
                <Building2 size={22} className="text-[#4F6BFF]" strokeWidth={1.8} />
              </div>
              <p className="text-[15px] font-semibold text-[#111827] mb-[6px]">No applications yet</p>
              <p className="text-[13px] text-[#9CA3AF] mb-[20px]">Start by exploring universities and applying to programs.</p>
              <a href="/student/discover"
                className="px-[20px] h-[36px] flex items-center bg-[#4F6BFF] text-white text-[13px] font-semibold rounded-[8px] hover:bg-[#3D56E0] transition-colors">
                Explore Universities
              </a>
            </div>
          )}

          {/* ── LIST VIEW ────────────────────────────────── */}
          {filteredApps.length > 0 && viewMode === 'list' && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <th className="px-[20px] py-[12px] w-[40px]"><input type="checkbox" className="w-[14px] h-[14px] rounded-[3px]" /></th>
                  {['University','Program','Status','Progress','Deadline'].map(h => (
                    <th key={h} className="px-[16px] py-[12px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.05em] whitespace-nowrap">{h}</th>
                  ))}
                  <th className="w-[40px]" />
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app: any, i: number) => {
                  const st = normalizeStatus(app.status)
                  const badge = STATUS_BADGE[st] || STATUS_BADGE.draft
                  const progress = app.progress || 40
                  return (
                    <tr key={i} className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors group cursor-pointer" onClick={() => setSelectedApp(app)}>
                      <td className="px-[20px] py-[14px]" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="w-[14px] h-[14px] rounded-[3px]" />
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          <div className="w-[32px] h-[32px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 border border-[#E5E7EB]">
                            <Building2 size={14} className="text-[#4F6BFF]" strokeWidth={1.8} />
                          </div>
                          <span className="text-[14px] font-medium text-[#111827] truncate max-w-[160px]">{app.universityName || 'University'}</span>
                        </div>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <span className="text-[14px] text-[#6B7280] truncate max-w-[140px] block">{app.program || app.programName || 'Program'}</span>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <span className="text-[12px] font-semibold px-[10px] py-[3px] rounded-full" style={{ color: badge.color, backgroundColor: badge.bg }}>{badge.label}</span>
                      </td>
                      <td className="px-[16px] py-[14px] w-[160px]">
                        <div className="flex items-center gap-[8px]">
                          <div className="flex-1"><MiniBar pct={progress} color="#4F6BFF" /></div>
                          <span className="text-[12px] text-[#6B7280] shrink-0">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <span className="text-[13px] text-[#6B7280]">{app.deadline || 'Nov 15, 2026'}</span>
                      </td>
                      <td className="px-[16px] py-[14px] text-right">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D1D5DB] hover:text-[#6B7280]" onClick={e => { e.stopPropagation(); setSelectedApp(app) }}>
                          <MoreHorizontal size={16} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {/* ── BOARD VIEW ───────────────────────────────── */}
          {filteredApps.length > 0 && viewMode === 'board' && (
            <div className="flex gap-[16px] overflow-x-auto p-[20px] no-scrollbar items-start">
              {COLUMNS.map(col => {
                const colApps = filteredApps.filter((a: any) => normalizeStatus(a.status) === col.id)
                const badge = STATUS_BADGE[col.id]
                return (
                  <div key={col.id} className="min-w-[260px] max-w-[260px] shrink-0 bg-[#F9FAFB] rounded-[12px] p-[12px] border border-[#E5E7EB]">
                    <div className="flex items-center justify-between mb-[12px] px-[4px]">
                      <div className="flex items-center gap-[8px]">
                        <span className="w-[8px] h-[8px] rounded-full" style={{ backgroundColor: badge.color }} />
                        <span className="text-[13px] font-semibold text-[#111827]">{col.label}</span>
                      </div>
                      <span className="text-[12px] font-medium text-[#9CA3AF] bg-white border border-[#E5E7EB] px-[8px] py-[2px] rounded-full">{colApps.length}</span>
                    </div>
                    <div className="flex flex-col gap-[10px]">
                      {colApps.map((app: any, i: number) => (
                        <div key={i} onClick={() => setSelectedApp(app)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => { if (e.key === 'Enter') setSelectedApp(app) }}
                          className="bg-white border border-[#E5E7EB] rounded-[10px] p-[14px] cursor-pointer hover:border-[#4F6BFF]/40 transition-colors group">
                          <div className="flex items-start justify-between mb-[10px]">
                            <div className="w-[30px] h-[30px] rounded-full bg-[#EEF2FF] flex items-center justify-center text-[13px] font-bold text-[#4F6BFF]">
                              {(app.universityName || 'U').charAt(0)}
                            </div>
                            <MoreHorizontal size={14} strokeWidth={1.5} className="text-[#D1D5DB]" />
                          </div>
                          <p className="text-[13px] font-semibold text-[#111827] leading-tight mb-[4px] truncate">{app.universityName}</p>
                          <p className="text-[12px] text-[#9CA3AF] truncate mb-[10px]">{app.program || app.programName}</p>
                          <MiniBar pct={app.progress || 40} color={badge.color} />
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* ── DETAIL DRAWER ────────────────────────────────── */}
        <AnimatePresence>
          {selectedApp && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedApp(null)}
                className="fixed inset-0 bg-black/30 z-50" />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-[560px] bg-white border-l border-[#E5E7EB] z-50 flex flex-col shadow-xl overflow-y-auto"
              >
                {/* Drawer header */}
                <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-[24px] py-[20px] flex items-center justify-between shrink-0 z-10">
                  <div className="flex items-center gap-[14px]">
                    <div className="w-[40px] h-[40px] rounded-[10px] bg-[#EEF2FF] flex items-center justify-center text-[16px] font-bold text-[#4F6BFF]">
                      {(selectedApp.universityName || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#111827]">{selectedApp.universityName}</p>
                      <p className="text-[13px] text-[#9CA3AF]">{selectedApp.program || selectedApp.programName}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedApp(null)}
                    className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] border border-[#E5E7EB] text-[#9CA3AF] hover:bg-[#F3F4F6] transition-colors">
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>

                {/* Drawer body */}
                <div className="flex-1 p-[24px] flex flex-col gap-[20px]">

                  {/* Meta grid */}
                  <div className="grid grid-cols-2 gap-[12px]">
                    {[
                      { label: 'Status',   value: STATUS_BADGE[normalizeStatus(selectedApp.status)]?.label || 'Draft' },
                      { label: 'Progress', value: `${selectedApp.progress || 40}%` },
                      { label: 'Deadline', value: selectedApp.deadline || 'Nov 15, 2026' },
                      { label: 'Match',    value: '85%' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[14px]">
                        <p className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.06em] mb-[4px]">{label}</p>
                        <p className="text-[15px] font-semibold text-[#111827]">{value}</p>
                      </div>
                    ))}
                  </div>

                  {/* AI Analysis */}
                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
                    <div className="flex items-center gap-[8px] mb-[14px]">
                      <Sparkles size={16} strokeWidth={1.8} className="text-[#4F6BFF]" />
                      <span className="text-[14px] font-semibold text-[#111827]">AI Analysis</span>
                    </div>
                    <div className="flex flex-col gap-[12px]">
                      <div className="flex items-center gap-[10px] text-[13px] text-[#374151]">
                        <AlertCircle size={14} strokeWidth={1.8} className="text-[#D97706] shrink-0" />
                        Missing: Letter of Recommendation
                      </div>
                      <div className="h-px bg-[#F3F4F6]" />
                      <div className="flex items-center gap-[10px] text-[13px] text-[#374151]">
                        <Zap size={14} strokeWidth={1.8} className="text-[#4F6BFF] shrink-0" />
                        Next: Draft SOP using AI Builder
                      </div>
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
                    <p className="text-[14px] font-semibold text-[#111827] mb-[16px]">Timeline</p>
                    <div className="relative pl-[20px] border-l border-[#E5E7EB] ml-[6px] flex flex-col gap-[16px]">
                      {[
                        { title: 'Application Started',  date: 'Oct 12, 2025', done: true  },
                        { title: 'Documents Uploaded',   date: 'Oct 15, 2025', done: true  },
                        { title: 'Application Submitted',date: 'Oct 20, 2025', done: false, active: true },
                        { title: 'Under Review',         date: 'Pending',      done: false },
                        { title: 'Decision',             date: 'Pending',      done: false },
                      ].map(({ title, date, done, active }) => (
                        <div key={title} className="relative">
                          <div className={`absolute -left-[25px] top-[4px] w-[10px] h-[10px] rounded-full border-2 bg-white ${done ? 'border-[#059669]' : active ? 'border-[#4F6BFF]' : 'border-[#E5E7EB]'}`} />
                          <p className={`text-[13px] font-medium ${done || active ? 'text-[#111827]' : 'text-[#9CA3AF]'}`}>{title}</p>
                          <p className="text-[12px] text-[#9CA3AF]">{date}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Documents */}
                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
                    <p className="text-[14px] font-semibold text-[#111827] mb-[14px]">Required Documents</p>
                    <div className="flex flex-col gap-[10px]">
                      {['Transcripts','Statement of Purpose','Passport Copy'].map((doc, i) => (
                        <div key={doc} className="flex items-center justify-between py-[10px] border-b border-[#F3F4F6] last:border-b-0">
                          <div className="flex items-center gap-[10px]">
                            <FileText size={15} strokeWidth={1.8} className="text-[#9CA3AF]" />
                            <span className="text-[13px] text-[#374151]">{doc}</span>
                          </div>
                          {i === 0
                            ? <span className="text-[12px] font-semibold text-[#059669] flex items-center gap-[4px]"><CheckCircle2 size={13} strokeWidth={2} />Uploaded</span>
                            : <button className="text-[12px] font-medium text-[#4F6BFF] hover:underline">Upload</button>}
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Drawer footer */}
                <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-[20px] flex gap-[10px]">
                  <button className="flex-1 h-[38px] bg-[#4F6BFF] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors">Continue Application</button>
                  <button onClick={() => setSelectedApp(null)} className="h-[38px] px-[16px] border border-[#E5E7EB] rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors">Close</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}
