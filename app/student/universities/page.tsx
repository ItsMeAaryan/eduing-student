'use client'
import React, { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Star, Sparkles, Heart, ArrowUpRight,
  SlidersHorizontal, ChevronDown, X, Mic, TrendingUp,
  BookOpen, Users, Award, Globe, Building2, Zap,
  BarChart3, Shield, Home, GraduationCap, Check
} from 'lucide-react'
import Image from 'next/image'
import ProtectedRoute from '@/components/ProtectedRoute'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { UNIVERSITIES, SORT_OPTIONS, University } from '@/lib/universityData'

const TABS = ['All', 'Engineering', 'Management', 'Sciences', 'Arts', 'Medical']

const CHIP_ICONS: Record<string, React.ReactNode> = {
  Scholarships: <Award size={10} />, Hostel: <Home size={10} />, Placements: <TrendingUp size={10} />,
  Research: <BookOpen size={10} />, Exchange: <Globe size={10} />, International: <Globe size={10} />,
  Incubation: <Zap size={10} />,
}

function AIBanner({ unis }: { unis: University[] }) {
  const avg = Math.round(unis.reduce((s, u) => s + u.aiMatch, 0) / (unis.length || 1))
  return (
    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] p-[1px]">
      <div className="relative rounded-[15px] bg-gradient-to-r from-[#0F172A] via-[#1a1740] to-[#1e1b4b] px-[28px] py-[20px] flex items-center justify-between gap-[24px] overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div key={i} className="absolute rounded-full bg-white/[0.03]"
              style={{ width: 60 + i * 40, height: 60 + i * 40, left: `${10 + i * 14}%`, top: '-20%' }}
              animate={{ y: [0, -10, 0] }} transition={{ duration: 3 + i, repeat: Infinity, delay: i * 0.4 }} />
          ))}
        </div>
        <div className="relative flex items-center gap-[16px]">
          <div className="w-[44px] h-[44px] rounded-[12px] bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shrink-0 shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-[8px] mb-[2px]">
              <span className="text-[11px] font-semibold text-[#A5B4FC] uppercase tracking-[0.1em]">EDUING AI · Personalized for You</span>
              <span className="w-[6px] h-[6px] rounded-full bg-[#34D399] animate-pulse" />
            </div>
            <p className="text-[14px] font-semibold text-white leading-snug max-w-[480px]">
              Based on your profile, these universities offer the highest admission probability and career ROI.
            </p>
          </div>
        </div>
        <div className="relative flex items-center gap-[20px] shrink-0">
          {[
            { label: 'AI Confidence', value: `${avg}%`, color: '#818CF8' },
            { label: 'Avg Prob.', value: `${Math.round(unis.reduce((s,u)=>s+u.admissionProb,0)/(unis.length||1))}%`, color: '#34D399' },
            { label: 'Career ROI', value: `${Math.round(unis.reduce((s,u)=>s+u.careerROI,0)/(unis.length||1))}%`, color: '#FBBF24' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className="text-[22px] font-bold leading-none mb-[2px]" style={{ color: m.color }}>{m.value}</div>
              <div className="text-[10px] text-white/50 whitespace-nowrap">{m.label}</div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] border border-[#F3F4F6] overflow-hidden animate-pulse">
      <div className="h-[160px] bg-[#F3F4F6]" />
      <div className="p-[16px] flex flex-col gap-[10px]">
        <div className="flex gap-[10px]"><div className="w-[40px] h-[40px] rounded-full bg-[#F3F4F6]" /><div className="flex-1"><div className="h-[14px] bg-[#F3F4F6] rounded mb-[6px] w-3/4" /><div className="h-[11px] bg-[#F3F4F6] rounded w-1/2" /></div></div>
        <div className="h-[10px] bg-[#F3F4F6] rounded w-full" /><div className="h-[10px] bg-[#F3F4F6] rounded w-2/3" />
        <div className="flex gap-[6px]">{[1,2,3].map(i=><div key={i} className="h-[22px] w-[70px] bg-[#F3F4F6] rounded-full" />)}</div>
      </div>
    </div>
  )
}

function ScoreBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="relative h-[3px] bg-[#F3F4F6] rounded-full overflow-hidden w-full">
      <motion.div className="absolute inset-y-0 left-0 rounded-full"
        style={{ backgroundColor: color }} initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 0.8, delay: 0.1 }} />
    </div>
  )
}

function UniCard({ uni, onShortlist, shortlisted, index }: { uni: University; onShortlist: (id: string) => void; shortlisted: boolean; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const matchColor = uni.aiMatch >= 90 ? '#6366F1' : uni.aiMatch >= 80 ? '#10B981' : '#F59E0B'

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      className="bg-white rounded-[16px] border border-[#EAECF0] overflow-hidden flex flex-col group"
      style={{ boxShadow: hovered ? '0 12px 40px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.04)', transition: 'box-shadow 0.25s, transform 0.2s', transform: hovered ? 'translateY(-3px)' : 'none' }}>

      {/* Hero image */}
      <div className="relative h-[158px] overflow-hidden bg-[#EEF2FF]">
        {!imgErr ? (
          <Image src={uni.heroImage} alt={uni.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" onError={() => setImgErr(true)} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${uni.logoColor}22, ${uni.logoColor}44)` }}>
            <span className="text-[48px] font-black opacity-30" style={{ color: uni.logoColor }}>{uni.logoText}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        {/* AI Match badge */}
        <div className="absolute top-[10px] left-[10px]">
          <motion.div animate={{ scale: hovered ? 1.05 : 1 }}
            className="flex items-center gap-[4px] px-[8px] h-[24px] rounded-full text-white text-[11px] font-bold shadow-lg backdrop-blur-sm"
            style={{ background: `linear-gradient(135deg, ${matchColor}, ${matchColor}cc)` }}>
            <Sparkles size={10} />AI Match {uni.aiMatch}%
          </motion.div>
        </div>
        {/* Shortlist */}
        <button onClick={e => { e.stopPropagation(); onShortlist(uni.id) }}
          className="absolute top-[10px] right-[10px] w-[30px] h-[30px] rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-transform hover:scale-110">
          <Heart size={14} className={shortlisted ? 'fill-[#EF4444] text-[#EF4444]' : 'text-[#9CA3AF]'} />
        </button>
      </div>

      <div className="flex flex-col flex-1 p-[14px] gap-[10px]">
        {/* Logo + name */}
        <div className="flex items-start gap-[10px]">
          <div className="w-[38px] h-[38px] rounded-[10px] shrink-0 flex items-center justify-center text-white text-[14px] font-black shadow-sm"
            style={{ background: `linear-gradient(135deg, ${uni.logoColor}, ${uni.logoColor}99)` }}>
            {uni.logoText}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-semibold text-[#111827] leading-snug truncate max-w-[170px]">{uni.name}</p>
              <div className="flex items-center gap-[3px] shrink-0 ml-[4px]">
                <Star size={11} className="fill-[#F59E0B] text-[#F59E0B]" />
                <span className="text-[12px] font-semibold text-[#374151]">{uni.rating}</span>
              </div>
            </div>
            <div className="flex items-center gap-[4px] text-[11px] text-[#6B7280] mt-[1px]">
              <MapPin size={10} /><span className="truncate">{uni.location}</span>
            </div>
          </div>
        </div>

        {/* Rankings row */}
        <div className="flex items-center gap-[6px] flex-wrap">
          <span className="text-[10px] font-semibold px-[7px] py-[2px] rounded-full bg-[#EEF2FF] text-[#4F6BFF]">NIRF #{uni.nirf}</span>
          <span className="text-[10px] font-semibold px-[7px] py-[2px] rounded-full bg-[#F0FDF4] text-[#059669]">{uni.naac}</span>
          <span className="text-[10px] font-medium px-[7px] py-[2px] rounded-full bg-[#F9FAFB] text-[#6B7280] border border-[#F3F4F6]">{uni.type}</span>
          <span className="text-[10px] font-medium px-[7px] py-[2px] rounded-full bg-[#F9FAFB] text-[#6B7280] border border-[#F3F4F6]">Est. {uni.established}</span>
        </div>

        {/* Program */}
        <div className="flex items-center justify-between py-[8px] border-y border-[#F3F4F6]">
          <div>
            <div className="flex items-center gap-[5px] text-[11px] text-[#6B7280] mb-[1px]"><BookOpen size={10} />{uni.program}</div>
            <div className="text-[13px] font-bold text-[#111827]">{uni.tuition} <span className="text-[11px] font-normal text-[#9CA3AF]">/ year</span></div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#9CA3AF]">Deadline</div>
            <div className="text-[11px] font-semibold text-[#374151]">{uni.deadline}</div>
          </div>
        </div>

        {/* AI scores mini */}
        <div className="flex flex-col gap-[5px]">
          {[
            { label: 'Placement', value: uni.placementScore, color: '#4F6BFF' },
            { label: 'Career ROI', value: uni.careerROI, color: '#10B981' },
            { label: 'Research', value: uni.researchScore, color: '#8B5CF6' },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-[8px]">
              <span className="text-[10px] text-[#9CA3AF] w-[52px] shrink-0">{s.label}</span>
              <ScoreBar value={s.value} color={s.color} />
              <span className="text-[10px] font-semibold text-[#374151] w-[24px] text-right">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Chips */}
        <div className="flex flex-wrap gap-[4px]">
          {uni.chips.slice(0,4).map(c => (
            <span key={c} className="flex items-center gap-[3px] text-[10px] font-medium px-[7px] py-[2px] rounded-full bg-[#F3F4F6] text-[#374151]">
              {CHIP_ICONS[c]}{c}
            </span>
          ))}
        </div>

        {/* Students */}
        <div className="flex items-center gap-[6px]">
          <div className="flex">
            {['#818CF8','#34D399','#FBBF24'].map((c,i) => (
              <div key={i} className="w-[20px] h-[20px] rounded-full border-[1.5px] border-white flex items-center justify-center text-[7px] font-bold text-white" style={{ background: c, marginLeft: i>0?'-6px':0 }}>
                {String.fromCharCode(65+i)}
              </div>
            ))}
          </div>
          <span className="text-[11px] text-[#6B7280]"><span className="font-semibold text-[#374151]">{uni.studentCount}</span> Students · <span className="font-semibold text-[#374151]">{uni.reviews.toLocaleString()}</span> Reviews</span>
        </div>

        {/* Actions */}
        <div className="flex gap-[6px] pt-[2px]">
          <a href={`/student/universities/${uni.id}`}
            className="flex-1 h-[32px] bg-[#111827] text-white rounded-[8px] text-[12px] font-semibold flex items-center justify-center gap-[4px] hover:bg-[#1F2937] transition-colors">
            <ArrowUpRight size={13} />View Details
          </a>
          <button className="h-[32px] px-[10px] border border-[#EAECF0] rounded-[8px] text-[11px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors">Compare</button>
          <button className="h-[32px] px-[10px] bg-[#4F6BFF] text-white rounded-[8px] text-[11px] font-semibold hover:bg-[#3D56E0] transition-colors">Apply</button>
        </div>
      </div>
    </motion.div>
  )
}

export default function UniversitiesPage() {
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('AI Match')
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [loading] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  const toggleShortlist = (id: string) => setShortlisted(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })

  const filtered = useMemo(() => {
    let list = UNIVERSITIES.filter(u => {
      const matchTab = activeTab === 'All' || u.category === activeTab
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.location.toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === 'All Types' || u.type === typeFilter
      return matchTab && matchSearch && matchType
    })
    if (sortBy === 'AI Match') list = [...list].sort((a, b) => b.aiMatch - a.aiMatch)
    else if (sortBy === 'Highest Placement') list = [...list].sort((a, b) => b.placementScore - a.placementScore)
    else if (sortBy === 'Best ROI') list = [...list].sort((a, b) => b.careerROI - a.careerROI)
    else if (sortBy === 'Lowest Fees') list = [...list].sort((a, b) => parseInt(a.tuition.replace(/[^\d]/g,'')) - parseInt(b.tuition.replace(/[^\d]/g,'')))
    else if (sortBy === 'Highest Ranking') list = [...list].sort((a, b) => a.nirf - b.nirf)
    return list
  }, [activeTab, search, sortBy, typeFilter])

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[20px]">

        {/* AI Banner */}
        <AIBanner unis={filtered} />

        {/* Search + Filter Bar */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-[10px]">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-[#9CA3AF]" strokeWidth={1.8} />
              <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search universities, courses, locations..."
                className="w-full h-[40px] pl-[40px] pr-[40px] bg-white border border-[#EAECF0] rounded-[10px] text-[13.5px] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#4F6BFF] focus:ring-2 focus:ring-[#4F6BFF]/10 transition-all" />
              <button className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6B7280]"><Mic size={14} /></button>
            </div>
            {/* Filter toggle */}
            <button onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-[6px] px-[14px] h-[40px] rounded-[10px] border text-[13px] font-medium transition-colors ${showFilters ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#374151] border-[#EAECF0] hover:bg-[#F9FAFB]'}`}>
              <SlidersHorizontal size={14} strokeWidth={1.8} />Filters{showFilters && <X size={12} />}
            </button>
            {/* Sort */}
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="appearance-none h-[40px] pl-[14px] pr-[32px] bg-white border border-[#EAECF0] rounded-[10px] text-[13px] font-medium text-[#374151] focus:outline-none focus:border-[#4F6BFF] cursor-pointer">
                {SORT_OPTIONS.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-[#9CA3AF] pointer-events-none" />
            </div>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="bg-white border border-[#EAECF0] rounded-[12px] p-[16px] flex flex-wrap gap-[12px] items-center">
                  {(['All Types','Public','Private','Deemed'] as const).map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)}
                      className={`px-[12px] h-[30px] rounded-full text-[12px] font-medium transition-colors ${typeFilter === t ? 'bg-[#111827] text-white' : 'bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]'}`}>{t}</button>
                  ))}
                  <div className="w-px h-[20px] bg-[#E5E7EB]" />
                  {['Scholarships','Hostel','Placements','Research','Exchange'].map(f => (
                    <button key={f} className="flex items-center gap-[4px] px-[12px] h-[30px] rounded-full text-[12px] font-medium bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB] transition-colors">
                      {CHIP_ICONS[f]}{f}
                    </button>
                  ))}
                  <button onClick={() => { setTypeFilter('All Types'); setSearch('') }}
                    className="ml-auto text-[12px] font-medium text-[#4F6BFF] hover:underline flex items-center gap-[4px]">
                    <X size={12} />Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tabs + count */}
        <div className="flex items-center justify-between">
          <SegmentedTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />
          <div className="flex items-center gap-[6px]">
            <span className="text-[13px] text-[#6B7280]"><span className="font-semibold text-[#111827]">{filtered.length}</span> universities</span>
            {shortlisted.size > 0 && (
              <span className="flex items-center gap-[4px] px-[8px] h-[24px] rounded-full bg-[#EEF2FF] text-[#4F6BFF] text-[11px] font-semibold">
                <Heart size={10} className="fill-[#4F6BFF]" />{shortlisted.size} shortlisted
              </span>
            )}
          </div>
        </div>

        {/* Cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-[60px] gap-[16px]">
            <div className="w-[64px] h-[64px] rounded-[20px] bg-[#EEF2FF] flex items-center justify-center">
              <Building2 size={28} className="text-[#4F6BFF]" />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-semibold text-[#111827] mb-[4px]">No universities found</p>
              <p className="text-[13px] text-[#6B7280]">Try adjusting your search or filters</p>
            </div>
            <button onClick={() => { setSearch(''); setActiveTab('All'); setTypeFilter('All Types') }}
              className="px-[16px] h-[36px] rounded-[8px] bg-[#4F6BFF] text-white text-[13px] font-semibold hover:bg-[#3D56E0] transition-colors">
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[16px]">
            {filtered.map((uni, i) => (
              <UniCard key={uni.id} uni={uni} index={i}
                onShortlist={toggleShortlist}
                shortlisted={shortlisted.has(uni.id)} />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  )
}
