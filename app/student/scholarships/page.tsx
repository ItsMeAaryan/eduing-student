'use client'
import React, { useState, useEffect, useMemo } from 'react'
import {
  Search, Award, Building2,
  CheckCircle2, Sparkles, AlertCircle, Bookmark, X
} from 'lucide-react'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AnimatePresence, motion } from 'framer-motion'
import { listenScholarships } from '@/lib/firebase/scholarships'
import { calculateScholarshipEligibility, ScholarshipResult } from '@/lib/utils/scholarshipEngine'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { EmptyState } from '@/components/ui/EmptyState'


const TABS = ['All', 'Eligible', 'Applied', 'Saved']

export default function ScholarshipsPage() {
  const { profile, documents, profileScore } = useStudentData()
  const [scholarships, setScholarships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [selectedSch, setSelectedSch] = useState<ScholarshipResult | null>(null)

  useEffect(() => {
    const unsub = listenScholarships((data) => {
      setScholarships(data)
      setLoading(false)
    }, (err) => {
      console.error(err)
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const results = useMemo(() => {
    if (!profile) return []
    return calculateScholarshipEligibility({ profile, documents, profileScore }, scholarships)
      .sort((a, b) => b.eligibilityScore - a.eligibilityScore)
  }, [profile, documents, profileScore, scholarships])

  const eligibleCount = results.filter(r => r.eligibilityScore >= 75).length
  const appliedCount = 0 // Mock, could be fetched from DB
  const savedCount = 2   // Mock

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      const matchSearch = !search || 
        r.scholarship.name?.toLowerCase().includes(search.toLowerCase()) || 
        r.scholarship.provider?.toLowerCase().includes(search.toLowerCase())
      
      let matchTab = true
      if (activeTab === 'Eligible') matchTab = r.eligibilityScore >= 75
      if (activeTab === 'Applied') matchTab = false
      if (activeTab === 'Saved') matchTab = false

      return matchSearch && matchTab
    })
  }, [results, search, activeTab])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-[36px] h-[36px] border-4 border-[#E5E7EB] border-t-[#4F6BFF] rounded-full animate-spin" />
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[20px]">

        {/* ── STAT CARDS ── */}
        <div className="grid grid-cols-4 gap-[12px]">
          {[
            { label: 'Total Found', value: results.length, sub: 'In database',         color: '#4F6BFF', bg: '#EEF2FF', Icon: Award },
            { label: 'Eligible',    value: eligibleCount,  sub: 'Match ≥ 75%',          color: '#059669', bg: '#F0FDF4', Icon: CheckCircle2 },
            { label: 'Applied',     value: appliedCount,   sub: 'Applications sent',     color: '#6366F1', bg: '#EEF2FF', Icon: Bookmark },
            { label: 'Saved',       value: savedCount,     sub: 'Bookmarked for later',  color: '#D97706', bg: '#FFFBEB', Icon: Bookmark },
          ].map(({ label, value, sub, color, bg, Icon }, i) => (
            <div key={i} className="bg-white border border-[#EAECF0] rounded-[14px] p-[18px] flex items-start gap-[12px]" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
              <div className="w-[36px] h-[36px] rounded-[10px] flex items-center justify-center shrink-0" style={{ background: bg }}>
                <Icon size={16} style={{ color }} strokeWidth={1.8} />
              </div>
              <div>
                <div className="text-[10px] text-[#9CA3AF] mb-[1px]">{label}</div>
                <div className="text-[22px] font-black leading-none mb-[1px]" style={{ color }}>{value}</div>
                <div className="text-[10px] text-[#9CA3AF]">{sub}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── TABS + SEARCH ── */}
        <div className="flex items-center justify-between gap-[12px]">
          <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          <div className="relative">
            <Search size={13} className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.8} />
            <input type="text" placeholder="Search scholarships..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-[220px] h-[34px] pl-[30px] pr-[10px] bg-white border border-[#EAECF0] rounded-[8px] text-[13px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] transition-colors" />
          </div>
        </div>

        {/* ── TABLE ── */}
        <div className="bg-white border border-[#EAECF0] rounded-[14px] overflow-hidden" style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <div className="flex items-center justify-between px-[20px] py-[13px] border-b border-[#EAECF0]">
            <span className="text-[14px] font-semibold text-[#111827]">All Scholarships</span>
            <span className="text-[12px] text-[#9CA3AF]">{filteredResults.length} results</span>
          </div>

          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-[#EAECF0]">
                {['Name','Provider','Amount','Deadline','Match',''].map(h => (
                  <th key={h} className="px-[16px] py-[10px] text-[10px] font-bold text-[#6B7280] uppercase tracking-[0.06em] whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-[32px]">
                    <EmptyState
                      icon={Award}
                      title={search ? `No scholarships matching "${search}"` : "No scholarships available"}
                      description={search ? "Try clearing your search query or switching tabs." : "Complete your profile information to discover personalized scholarship matches."}
                      primaryCtaLabel="Complete Profile"
                      primaryCtaHref="/student/profile"
                    />
                  </td>
                </tr>
              ) : filteredResults.map((r: ScholarshipResult, i: number) => {
                const s = r.scholarship
                const isHighMatch = r.eligibilityScore >= 75
                return (
                  <tr key={i} onClick={() => setSelectedSch(r)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => { if (e.key === 'Enter') setSelectedSch(r) }}
                    className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] transition-colors group cursor-pointer">
                    <td className="px-[16px] py-[13px]">
                      <div className="flex items-center gap-[12px]">
                        <div className={`w-[32px] h-[32px] rounded-full flex items-center justify-center shrink-0 border border-[#E5E7EB] ${isHighMatch ? 'bg-[#D1FAE5]' : 'bg-[#EEF2FF]'}`}>
                          <Award size={14} className={isHighMatch ? 'text-[#059669]' : 'text-[#4F6BFF]'} strokeWidth={1.8} />
                        </div>
                        <span className="text-[14px] font-medium text-[#111827] truncate max-w-[220px]">{s.name}</span>
                      </div>
                    </td>
                    <td className="px-[16px] py-[14px]">
                      <div className="flex items-center gap-[6px] text-[13px] text-[#6B7280]">
                        <Building2 size={12} strokeWidth={1.8} className="shrink-0" />
                        <span className="truncate max-w-[150px]">{s.provider || 'Provider'}</span>
                      </div>
                    </td>
                    <td className="px-[16px] py-[14px]">
                      <span className="text-[13px] font-medium text-[#111827]">
                        {s.valueType === 'amount' && s.amount ? `₹${s.amount.toLocaleString()}` : s.valueType === 'percentage' && s.percentage ? `Up to ${s.percentage}%` : 'Variable'}
                      </span>
                    </td>
                    <td className="px-[16px] py-[14px]">
                      <span className="text-[13px] text-[#6B7280]">
                        {s.deadline ? new Date(s.deadline).toLocaleDateString() : 'Rolling'}
                      </span>
                    </td>
                    <td className="px-[16px] py-[14px]">
                      <div className="flex items-center gap-[6px]">
                        <div className="w-[40px] h-[4px] bg-[#F3F4F6] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.eligibilityScore}%`, backgroundColor: isHighMatch ? '#059669' : '#4F6BFF' }} />
                        </div>
                        <span className={`text-[12px] font-semibold ${isHighMatch ? 'text-[#059669]' : 'text-[#4F6BFF]'}`}>{r.eligibilityScore}%</span>
                      </div>
                    </td>
                    <td className="px-[16px] py-[13px] text-right">
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity text-[#9CA3AF] hover:text-[#D97706]" onClick={e => { e.stopPropagation() }}>
                        <Bookmark size={14} strokeWidth={1.8} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>


        {/* ── DRAWER ───────────────────────────────────── */}
        <AnimatePresence>
          {selectedSch && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setSelectedSch(null)} className="fixed inset-0 bg-black/30 z-50" />
              <motion.div
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 220 }}
                className="fixed top-0 right-0 bottom-0 w-full max-w-[520px] bg-white border-l border-[#E5E7EB] z-50 flex flex-col shadow-xl overflow-y-auto"
              >
                <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-[24px] py-[20px] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-[14px]">
                    <div className="w-[44px] h-[44px] rounded-[10px] bg-[#EEF2FF] flex items-center justify-center border border-[#E5E7EB] text-[#4F6BFF]">
                      <Award size={20} strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-[15px] font-semibold text-[#111827] max-w-[300px] truncate">{selectedSch.scholarship.name}</p>
                      <p className="text-[13px] text-[#9CA3AF]">{selectedSch.scholarship.provider || 'Provider'}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedSch(null)} className="w-[32px] h-[32px] flex items-center justify-center rounded-[8px] border border-[#E5E7EB] text-[#9CA3AF] hover:bg-[#F3F4F6] transition-colors">
                    <X size={16} strokeWidth={1.8} />
                  </button>
                </div>
                
                <div className="flex-1 p-[24px] flex flex-col gap-[20px]">
                  <div className="grid grid-cols-2 gap-[12px]">
                    {[
                      { label: 'Amount', value: selectedSch.scholarship.valueType === 'amount' && selectedSch.scholarship.amount ? `₹${selectedSch.scholarship.amount.toLocaleString()}` : 'Variable' },
                      { label: 'Match Score', value: `${selectedSch.eligibilityScore}%` },
                      { label: 'Deadline', value: selectedSch.scholarship.deadline ? new Date(selectedSch.scholarship.deadline).toLocaleDateString() : 'Rolling' },
                      { label: 'Level', value: selectedSch.scholarship.targetDegrees?.join(', ') || 'Any' },
                    ].map(({ label, value }) => (
                      <div key={label} className="bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] p-[14px]">
                        <p className="text-[11px] text-[#9CA3AF] uppercase tracking-[0.06em] mb-[4px]">{label}</p>
                        <p className="text-[14px] font-semibold text-[#111827]">{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px] flex flex-col gap-[12px]">
                    <div className="flex items-center gap-[8px] mb-[4px]">
                      <Sparkles size={16} strokeWidth={1.8} className="text-[#4F6BFF]" />
                      <span className="text-[14px] font-semibold text-[#111827]">AI Match Analysis</span>
                    </div>
                     <ul className="text-[13px] text-[#6B7280] flex flex-col gap-[10px]">
                      {selectedSch.matchReasons.map((c: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-[8px]">
                          <CheckCircle2 size={14} className="text-[#059669] shrink-0 mt-[2px]" strokeWidth={2} />
                          <span>{c}</span>
                        </li>
                      ))}
                      {selectedSch.missingRequirements.map((c: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-[8px]">
                          <AlertCircle size={14} className="text-[#EF4444] shrink-0 mt-[2px]" strokeWidth={2} />
                          <span>{c}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-white border border-[#E5E7EB] rounded-[12px] p-[20px]">
                    <p className="text-[14px] font-semibold text-[#111827] mb-[8px]">Description</p>
                    <p className="text-[13px] text-[#6B7280] leading-[1.6]">{selectedSch.scholarship.description || 'No detailed description available.'}</p>
                  </div>
                </div>
                
                <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] p-[20px] flex gap-[10px]">
                  <button className="flex-1 h-[38px] bg-[#4F6BFF] text-white rounded-[8px] text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors">
                    Apply Now
                  </button>
                  <button className="h-[38px] px-[16px] bg-[#F9FAFB] border border-[#E5E7EB] text-[#111827] rounded-[8px] text-[13px] font-medium hover:bg-[#F3F4F6] transition-colors flex items-center gap-[6px]">
                    <Bookmark size={14} strokeWidth={2} /> Save
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
