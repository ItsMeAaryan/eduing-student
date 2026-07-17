'use client'
import React, { useState, useMemo } from 'react'
import {
  Search, Building2, MapPin, GraduationCap, BookOpen,
  ChevronDown, MoreHorizontal, SlidersHorizontal, Download,
  Star, X, Globe, ArrowUpRight
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'
import SegmentedTabs from '@/components/ui/SegmentedTabs'


const TABS = ['All', 'Engineering', 'Management', 'Sciences', 'Arts', 'Medical']

export default function UniversitiesPage() {
  const { loading, uniqueApps } = useStudentData()
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [selectedUni, setSelectedUni] = useState<any | null>(null)

  const universities = useMemo(() => {
    const seen = new Set<string>()
    const list: any[] = []
    ;(uniqueApps || []).forEach((app: any) => {
      if (app.universityName && !seen.has(app.universityName)) {
        seen.add(app.universityName)
        list.push(app)
      }
    })
    if (list.length < 3) {
      const demos = ['IIT Delhi','IIT Bombay','BITS Pilani','Delhi University','IIM Ahmedabad','NIT Trichy']
      demos.forEach(name => {
        if (!seen.has(name)) { seen.add(name); list.push({ universityName: name, program: 'B.Tech', state: 'India', nirf: Math.floor(Math.random()*20)+1 }) }
      })
    }
    return list.filter((u: any) =>
      !search || u.universityName?.toLowerCase().includes(search.toLowerCase())
    )
  }, [uniqueApps, search])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-[36px] h-[36px] border-4 border-[#E5E7EB] border-t-[#4F6BFF] rounded-full animate-spin" />
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[16px]">

        {/* ── SUB-NAV: category filter tabs only ────────── */}
        <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

        {/* ── STAT CARDS ────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-[16px]">
          {[
            { label: 'Total Universities', value: universities.length, sub: 'In your list' },
            { label: 'Applied',            value: (uniqueApps||[]).length, sub: 'Applications sent' },
            { label: 'Shortlisted',        value: Math.ceil(universities.length * 0.4), sub: 'Top matches' },
          ].map(c => (
            <div key={c.label} className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
              <div className="flex items-start justify-between mb-[10px]">
                <span className="text-[14px] text-[#6B7280]">{c.label}</span>
                <MoreHorizontal size={16} strokeWidth={1.5} className="text-[#D1D5DB]" />
              </div>
              <div className="text-[28px] font-bold text-[#111827] leading-none mb-[6px]">{c.value}</div>
              <span className="text-[12px] text-[#9CA3AF]">{c.sub}</span>
            </div>
          ))}
        </div>

        {/* ── TABLE CARD ────────────────────────────────── */}
        <div className="bg-white border border-[#E5E7EB] rounded-[12px] overflow-hidden">
          <div className="flex items-center justify-between px-[20px] py-[14px] border-b border-[#E5E7EB]">
            <span className="text-[15px] font-semibold text-[#111827]">University List</span>
            <div className="flex items-center gap-[8px]">
              <div className="relative">
                <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.8} />
                <input type="text" placeholder="Search universities"
                  value={search} onChange={e => setSearch(e.target.value)}
                  className="w-[200px] h-[32px] pl-[28px] pr-[10px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] text-[13px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] transition-colors" />
              </div>
              <button className="flex items-center gap-[5px] px-[12px] h-[32px] rounded-[8px] border border-[#E5E7EB] text-[12px] font-medium text-[#374151] bg-white hover:bg-[#F3F4F6] transition-colors">
                <SlidersHorizontal size={12} strokeWidth={1.8} />Sort by<ChevronDown size={11} />
              </button>
              <MoreHorizontal size={16} strokeWidth={1.5} className="text-[#D1D5DB]" />
            </div>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <th className="px-[20px] py-[12px] w-[40px]"><input type="checkbox" className="w-[14px] h-[14px] rounded-[3px]" /></th>
                {['University','Location','Program','NIRF Rank','Match','Status'].map(h => (
                  <th key={h} className="px-[16px] py-[12px] text-[12px] font-semibold text-[#6B7280] uppercase tracking-[0.05em] whitespace-nowrap">{h}</th>
                ))}
                <th className="w-[40px]" />
              </tr>
            </thead>
            <tbody>
              {universities.length === 0 ? (
                <tr><td colSpan={8} className="py-[48px] text-center text-[14px] text-[#9CA3AF]">No universities found.</td></tr>
              ) : universities.map((uni: any, i: number) => (
                <tr key={i} onClick={() => setSelectedUni(uni)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={e => { if (e.key === 'Enter') setSelectedUni(uni) }}
                  className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors group cursor-pointer">
                  <td className="px-[20px] py-[14px]" onClick={e => e.stopPropagation()}>
                    <input type="checkbox" className="w-[14px] h-[14px] rounded-[3px]" />
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <div className="flex items-center gap-[12px]">
                      <div className="w-[32px] h-[32px] rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0 text-[13px] font-bold text-[#4F6BFF]">
                        {(uni.universityName || 'U').charAt(0)}
                      </div>
                      <span className="text-[14px] font-medium text-[#111827] truncate max-w-[180px]">{uni.universityName}</span>
                    </div>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <div className="flex items-center gap-[6px] text-[13px] text-[#6B7280]">
                      <MapPin size={12} strokeWidth={1.8} />{uni.state || 'India'}
                    </div>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <span className="text-[14px] text-[#6B7280] truncate max-w-[120px] block">{uni.program || uni.programName || 'B.Tech'}</span>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <span className="text-[13px] font-medium text-[#111827]">#{uni.nirf || i + 1}</span>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <div className="flex items-center gap-[4px]">
                      {[1,2,3,4,5].map(s => <Star key={s} size={12} strokeWidth={1.8} className={s <= 4 ? 'text-[#F59E0B] fill-[#F59E0B]' : 'text-[#E5E7EB]'} />)}
                    </div>
                  </td>
                  <td className="px-[16px] py-[14px]">
                    <div className="flex items-center gap-[6px]">
                      <span className="w-[8px] h-[8px] rounded-full bg-[#4F6BFF]" />
                      <span className="text-[13px] text-[#374151]">Shortlisted</span>
                    </div>
                  </td>
                  <td className="px-[16px] py-[14px] text-right">
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#D1D5DB] hover:text-[#6B7280]">
                      <MoreHorizontal size={16} strokeWidth={1.5} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── DRAWER ───────────────────────────────────── */}
        <AnimatePresence>
          {selectedUni && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedUni(null)} className="fixed inset-0 bg-black/30 z-50" />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-white border-l border-[#E5E7EB] z-50 flex flex-col shadow-xl overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-[24px] py-[20px] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-[14px]">
                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[#EEF2FF] flex items-center justify-center text-[18px] font-bold text-[#4F6BFF]">
                      {(selectedUni.universityName || 'U').charAt(0)}
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#111827]">{selectedUni.universityName}</p>
                      <p className="text-[13px] text-[#9CA3AF]">{selectedUni.state || 'India'}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedUni(null)} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] border border-[#E5E7EB] text-[#9CA3AF] hover:bg-[#F3F4F6] transition-colors">
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>
                <div className="flex-1 p-[24px] flex flex-col gap-[16px]">
                  <div className="grid grid-cols-2 gap-[12px]">
                    {[
                      { label: 'NIRF Rank', value: `#${selectedUni.nirf || 1}` },
                      { label: 'Match Score', value: '92%' },
                      { label: 'Avg Package', value: '₹12 LPA' },
                      { label: 'Seats', value: '120' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[14px]">
                        <p className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.06em] mb-[4px]">{label}</p>
                        <p className="text-[15px] font-semibold text-[#111827]">{value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
                    <p className="text-[14px] font-semibold text-[#111827] mb-[12px]">Programs Available</p>
                    {['B.Tech CSE','B.Tech ECE','M.Tech AI','MBA'].map((p, i) => (
                      <div key={p} className={`flex items-center justify-between py-[10px] ${i < 3 ? 'border-b border-[#F3F4F6]' : ''}`}>
                        <div className="flex items-center gap-[10px]">
                          <BookOpen size={14} strokeWidth={1.8} className="text-[#9CA3AF]" />
                          <span className="text-[13px] text-[#374151]">{p}</span>
                        </div>
                        <button className="text-[12px] font-medium text-[#4F6BFF] hover:underline">Apply</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-[20px] flex gap-[10px]">
                  <a href={`/student/universities/${selectedUni.id || '1'}`}
                    className="flex-1 h-[38px] bg-[#4F6BFF] text-white rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-[6px] hover:bg-[#3D56E0] transition-colors">
                    <ArrowUpRight size={15} strokeWidth={2} />View Full Profile
                  </a>
                  <button onClick={() => setSelectedUni(null)} className="h-[38px] px-[16px] border border-[#E5E7EB] rounded-[8px] text-[13px] font-medium text-[#374151] hover:bg-[#F3F4F6] transition-colors">Close</button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}
