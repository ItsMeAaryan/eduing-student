'use client'
import React, { useState, useMemo } from 'react'
import {
  Search, Calendar as CalendarIcon, Clock, CheckCircle2, AlertCircle,
  MoreHorizontal, SlidersHorizontal, Download, ChevronLeft, ChevronRight,
  List, CalendarRange, X, MapPin
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'
import { generateDeadlineInsights, DeadlineInsight } from '@/lib/utils/deadlineEngine'
import SegmentedTabs from '@/components/ui/SegmentedTabs'


const TABS = ['All', 'Critical', 'Upcoming', 'Completed']

export default function AdmissionPlannerPage() {
  const { deadlines, uniqueApps, documents, profileScore, loading } = useStudentData()

  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [selectedEvent, setSelectedEvent] = useState<DeadlineInsight | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  const { insights } = useMemo(() => {
    return generateDeadlineInsights({
      deadlines: deadlines || [],
      applications: uniqueApps || [],
      documents: documents || [],
      profileScore: profileScore || 0,
    })
  }, [deadlines, uniqueApps, documents, profileScore])

  const filteredInsights = useMemo(() => {
    return insights.filter((i) => {
      const matchSearch = !search ||
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        (i.universityName || '').toLowerCase().includes(search.toLowerCase())
      
      let matchTab = true
      if (activeTab === 'Critical') matchTab = i.priority === 'Critical'
      if (activeTab === 'Completed') matchTab = i.status === 'Completed'
      if (activeTab === 'Upcoming') matchTab = i.status !== 'Completed' && i.date.getTime() > Date.now()

      return matchSearch && matchTab
    }).sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [insights, search, activeTab])

  const stats = useMemo(() => {
    const critical = insights.filter(i => i.priority === 'Critical' && i.status !== 'Completed').length
    const upcoming = insights.filter(i => i.date.getTime() > Date.now() && i.status !== 'Completed').length
    const completed = insights.filter(i => i.status === 'Completed').length
    return { critical, upcoming, completed }
  }, [insights])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-[36px] h-[36px] border-4 border-[#E5E7EB] border-t-[#4F6BFF] rounded-full animate-spin" />
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[16px]">

        {/* ── SUB-NAV: priority filter tabs only ─────────── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── STAT CARDS ────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-[16px]">
          {[
            { label: 'Total Events', value: insights.length, sub: 'In planner' },
            { label: 'Critical Tasks', value: stats.critical, sub: 'Action required', color: stats.critical > 0 ? '#EF4444' : '#111827' },
            { label: 'Upcoming', value: stats.upcoming, sub: 'Next 30 days', color: '#4F6BFF' },
            { label: 'Completed', value: stats.completed, sub: 'All time', color: '#059669' },
          ].map((c, i) => (
            <div key={i} className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
              <div className="flex items-start justify-between mb-[10px]">
                <span className="text-[14px] text-[#6B7280]">{c.label}</span>
                <MoreHorizontal size={16} strokeWidth={1.5} className="text-[#D1D5DB]" />
              </div>
              <div className="text-[28px] font-bold text-[#111827] leading-none mb-[6px]" style={{ color: c.color || '#111827' }}>{c.value}</div>
              <span className="text-[12px] text-[#9CA3AF]">{c.sub}</span>
            </div>
          ))}
        </div>

        {/* ── LIST/CALENDAR CARD ────────────────────────── */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-[15px] font-semibold text-[#111827]">Planner</span>
            <div className="flex items-center gap-[8px]">
              <div className="relative">
                <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.8} />
                <input type="text" placeholder="Search events"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-[200px] h-[32px] pl-[28px] pr-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[13px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] transition-colors" />
              </div>
              
              <div className="flex items-center bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[3px]">
                {([['list', List], ['calendar', CalendarRange]] as const).map(([m, Icon]) => (
                  <button key={m} onClick={() => setViewMode(m as any)}
                    className={`w-[28px] h-[26px] flex items-center justify-center rounded-[6px] transition-colors ${viewMode === m ? 'bg-white shadow-sm text-[#111827]' : 'text-[#9CA3AF] hover:text-[#111827]'}`}>
                    <Icon size={13} strokeWidth={1.8} />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {viewMode === 'list' && (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                  <th className="px-[20px] py-[12px] w-[40px]"><input type="checkbox" className="w-[14px] h-[14px] rounded-[3px]" /></th>
                  {['Event','Date','Priority','Type','Status','Action'].map(h => (
                    <th key={h} className="px-[16px] py-[12px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.05em] whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredInsights.length === 0 ? (
                  <tr><td colSpan={7} className="py-[48px] text-center text-[14px] text-[#9CA3AF]">No events found.</td></tr>
                ) : filteredInsights.map((ev, i) => {
                  const isCompleted = ev.status === 'Completed'
                  return (
                    <tr key={i} onClick={() => setSelectedEvent(ev)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={e => { if (e.key === 'Enter') setSelectedEvent(ev) }}
                      className={`border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors group cursor-pointer ${isCompleted ? 'opacity-60' : ''}`}>
                      <td className="px-[20px] py-[14px]" onClick={e => e.stopPropagation()}>
                        <input type="checkbox" className="w-[14px] h-[14px] rounded-[3px]" />
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <div className="flex items-center gap-[12px]">
                          <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 border border-[#E5E7EB] ${isCompleted ? 'bg-[#F9FAFB]' : 'bg-[#EEF2FF]'}`}>
                            <CalendarIcon size={14} className={isCompleted ? 'text-[#9CA3AF]' : 'text-[#4F6BFF]'} strokeWidth={1.8} />
                          </div>
                          <div>
                            <p className="text-[14px] font-medium text-[#111827] truncate max-w-[200px]">{ev.title}</p>
                            {ev.universityName && <p className="text-[12px] text-[#6B7280] truncate max-w-[200px]">{ev.universityName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <span className="text-[13px] text-[#6B7280]">
                          {ev.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        {ev.priority === 'Critical' && <span className="text-[12px] font-semibold text-[#EF4444] bg-[#FEE2E2] px-[8px] py-[2px] rounded-full">Critical</span>}
                        {ev.priority === 'High' && <span className="text-[12px] font-medium text-[#D97706] bg-[#FEF3C7] px-[8px] py-[2px] rounded-full">High</span>}
                        {ev.priority === 'Medium' && <span className="text-[12px] font-medium text-[#4F6BFF] bg-[#EEF2FF] px-[8px] py-[2px] rounded-full">Medium</span>}
                      </td>
                      <td className="px-[16px] py-[14px]">
                        <span className="text-[13px] text-[#6B7280]">{ev.type}</span>
                      </td>
                      <td className="px-[16px] py-[14px]">
                        {isCompleted 
                          ? <span className="text-[13px] text-[#059669] flex items-center gap-[4px]"><CheckCircle2 size={14} strokeWidth={2}/>Done</span>
                          : <span className="text-[13px] text-[#D97706] flex items-center gap-[4px]"><Clock size={14} strokeWidth={2}/>Pending</span>}
                      </td>
                      <td className="px-[16px] py-[14px] text-right">
                        <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D1D5DB] hover:text-[#6B7280]">
                          <MoreHorizontal size={16} strokeWidth={1.5} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}

          {viewMode === 'calendar' && (
            <div className="p-[20px] text-center text-[14px] text-[#6B7280] h-[300px] flex items-center justify-center">
              Calendar grid view not implemented in this demo.
            </div>
          )}
        </div>

        {/* ── DRAWER ───────────────────────────────────── */}
        <AnimatePresence>
          {selectedEvent && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedEvent(null)} className="fixed inset-0 bg-black/30 z-50" />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-white border-l border-[#E5E7EB] z-50 flex flex-col shadow-xl overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-[24px] py-[20px] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-[14px]">
                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[#EEF2FF] flex items-center justify-center border border-[#E5E7EB] text-[#4F6BFF]">
                      <CalendarIcon size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#111827] max-w-[300px] truncate">{selectedEvent.title}</p>
                      {selectedEvent.universityName && <p className="text-[13px] text-[#9CA3AF]">{selectedEvent.universityName}</p>}
                    </div>
                  </div>
                  <button onClick={() => setSelectedEvent(null)} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] border border-[#E5E7EB] text-[#9CA3AF] hover:bg-[#F3F4F6] transition-colors">
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>
                
                <div className="flex-1 p-[24px] flex flex-col gap-[16px]">
                  <div className="grid grid-cols-2 gap-[12px]">
                    {[
                      { label: 'Date', value: selectedEvent.date.toLocaleDateString() },
                      { label: 'Priority', value: selectedEvent.priority },
                      { label: 'Type', value: selectedEvent.type },
                      { label: 'Status', value: selectedEvent.status },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[14px]">
                        <p className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.06em] mb-[4px]">{label}</p>
                        <p className="text-[14px] font-semibold text-[#111827]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px] flex flex-col gap-[12px]">
                    <p className="text-[14px] font-semibold text-[#111827] mb-[4px]">Task Details</p>
                    <p className="text-[13px] text-[#6B7280] leading-[1.6]">
                      {'Please review this deadline to ensure all requirements are met.'}
                    </p>
                  </div>
                </div>
                
                <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-[20px] flex gap-[10px]">
                  <button className="flex-1 h-[38px] bg-[#4F6BFF] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors">
                    Mark as Completed
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
