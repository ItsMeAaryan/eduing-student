'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import {
  Search, MapPin, Heart, ArrowUpRight, SlidersHorizontal, ChevronDown, X, Mic,
  BookOpen, Award, Globe, Building2, Zap, Home, Check, Scale, GraduationCap,
  Layers, Filter
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { useUniversities } from '@/hooks/useUniversities'
import { UniversityFirestore } from '@/lib/firebase/universities'
import { CompareWorkspace } from '@/components/compare/CompareWorkspace'

const STREAM_TABS = ['All', 'Engineering', 'Management', 'Sciences', 'Arts', 'Medical']
const DEGREE_LEVELS = ['All Levels', 'UG', 'PG', 'PhD', 'Diploma']

/**
 * Maps career path names (from /student/career) to program keyword sets
 * used to filter university program lists. Case-insensitive substring match.
 */
const CAREER_PROGRAM_MAP: Record<string, string[]> = {
  'software engineer':    ['cse', 'computer science', 'software engineering', 'information technology', 'it'],
  'data scientist':       ['data science', 'artificial intelligence', 'machine learning', 'statistics', 'ai', 'ml'],
  'cybersecurity':        ['cybersecurity', 'information security', 'cyber security', 'cse', 'network security'],
  'cybersecurity specialist': ['cybersecurity', 'information security', 'cse', 'network security'],
  'business analyst':     ['business administration', 'bba', 'mba', 'commerce', 'management', 'finance'],
  'product manager':      ['management', 'mba', 'business administration', 'product design'],
  'ui/ux designer':       ['design', 'human computer interaction', 'visual communication', 'fine arts'],
  'mechanical engineer':  ['mechanical engineering', 'production engineering', 'manufacturing'],
  'civil engineer':       ['civil engineering', 'structural engineering', 'construction'],
  'electrical engineer':  ['electrical engineering', 'electronics', 'eee'],
  'doctor':               ['mbbs', 'medicine', 'medical', 'bds', 'dentistry'],
  'lawyer':               ['law', 'llb', 'llm', 'legal studies'],
  'chartered accountant': ['commerce', 'accounting', 'finance', 'ca', 'bcom'],
}

/** Returns program keywords for a given career name, or [] if unrecognized. */
function getCareerKeywords(career: string): string[] {
  const lower = career.toLowerCase().trim()
  // Exact key match first
  if (CAREER_PROGRAM_MAP[lower]) return CAREER_PROGRAM_MAP[lower]
  // Partial key match
  const partialKey = Object.keys(CAREER_PROGRAM_MAP).find(k => lower.includes(k) || k.includes(lower))
  return partialKey ? CAREER_PROGRAM_MAP[partialKey] : []
}

const CHIP_ICONS: Record<string, React.ReactNode> = {
  Scholarships: <Award size={10} />, Hostel: <Home size={10} />, Placements: <Zap size={10} />,
  Research: <BookOpen size={10} />, Exchange: <Globe size={10} />, International: <Globe size={10} />,
}

/** Calibrated Compact Discovery Header */
function DiscoveryHeader({ uniCount, progCount, viewMode, setViewMode }: {
  uniCount: number; progCount: number; viewMode: 'universities' | 'programs'; setViewMode: (v: 'universities' | 'programs') => void
}) {
  return (
    <div className="bg-card border border-border rounded-[12px] p-[16px] md:p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
      <div>
        <div className="flex items-center gap-[8px] mb-[2px]">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">EDUING Marketplace Discovery</span>
          <span className="w-[6px] h-[6px] rounded-full bg-success animate-pulse" />
        </div>
        <h1 className="text-[20px] font-bold text-foreground tracking-tight">Explore Universities & Programs</h1>
        <p className="text-[12.5px] text-muted-foreground mt-[2px]">
          Discover top-tier institutions and degree programs worldwide. Toggle between University & Program views seamlessly.
        </p>
      </div>

      <div className="flex items-center gap-[12px] shrink-0">
        {/* Toggle View Mode */}
        <div className="bg-muted border border-border p-[3px] rounded-[10px] flex items-center gap-[2px]">
          <button
            onClick={() => setViewMode('universities')}
            className={`flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] text-[12px] font-semibold transition-all ${
              viewMode === 'universities' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Building2 size={14} />
            Universities ({uniCount})
          </button>
          <button
            onClick={() => setViewMode('programs')}
            className={`flex items-center gap-[6px] px-[12px] py-[6px] rounded-[8px] text-[12px] font-semibold transition-all ${
              viewMode === 'programs' ? 'bg-card text-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <GraduationCap size={14} />
            Programs ({progCount})
          </button>
        </div>
      </div>
    </div>
  )
}

/** Deterministic color from name */
function logoColorFromName(name: string) {
  const palette = ['#0075de','#1aae39','#dd5b00','#8B5CF6','#2a9d99','#62aef0','#EC4899','#F97316']
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

/**
 * NETFLIX-STYLE PROGRESSIVE REVEAL HOVER CARD
 */
const UniCard = React.memo(function UniCard({ uni, onShortlist, shortlisted, onCompare, isCompared, index }: {
  uni: UniversityFirestore; onShortlist: (id: string) => void; shortlisted: boolean;
  onCompare: (id: string) => void; isCompared: boolean; index: number
}) {
  const router = useRouter()
  const [hovered, setHovered] = useState(false)
  const [imgErr, setImgErr] = useState(false)
  const logoColor = logoColorFromName(uni.name)
  const logoText = (uni.shortName || uni.name).charAt(0).toUpperCase()
  const locationStr = uni.location ? `${uni.location.city}, ${uni.location.state}` : 'Global Campus'

  const programs = (uni as any).programs?.length
    ? (uni as any).programs.map((p: any) => p.name || p).slice(0, 4)
    : ['Engineering', 'Computer Science', 'Business', 'Medicine', '+ More Programs']

  const shortIntro = uni.about || `${uni.name} is a leading global university known for academic excellence, state-of-the-art research labs, and exceptional career outcomes.`

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/student/universities/${uni.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/student/universities/${uni.id}`) }}
      aria-label={`View details for ${uni.name}`}
      className="relative flex flex-col h-[380px] w-full cursor-pointer outline-none group"
    >
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.25 }}
        className={`bg-[#0F172A] rounded-[14px] border overflow-hidden flex flex-col h-full w-full transition-all duration-300 relative ${
          isCompared ? 'border-primary ring-2 ring-primary/30' : 'border-border'
        }`}
        style={{
          boxShadow: hovered
            ? '0 16px 36px rgba(0,0,0,0.14), 0 2px 8px rgba(0,0,0,0.06)'
            : '0 1px 3px rgba(0,0,0,0.03)',
          transform: hovered ? 'scale(1.02) translateY(-3px)' : 'none'
        }}
      >
        {/* ── FULL-BLEED HERO CAMPUS IMAGE (ALWAYS VISIBLE) ── */}
        <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0F172A]">
          {uni.heroImageUrl && !imgErr ? (
            <Image
              src={uni.heroImageUrl}
              alt={uni.name}
              fill
              unoptimized
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 25vw"
              priority={index < 4}
              className="object-cover transition-transform duration-500 group-hover:scale-108"
              onError={() => setImgErr(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[#1E1B4B] to-[#0F172A]">
              <span className="text-[64px] font-black opacity-25 text-white" style={{ color: logoColor }}>
                {logoText}
              </span>
            </div>
          )}
        </div>

        {/* ── ALWAYS-VISIBLE TOP FLOATING BUTTONS ── */}
        <div className="absolute top-[12px] right-[12px] flex items-center gap-[6px] z-20">
          <button
            onClick={(e) => { e.stopPropagation(); onCompare(uni.id) }}
            className={`w-[30px] h-[30px] rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${
              isCompared
                ? 'bg-primary border-primary text-white scale-110'
                : 'bg-black/40 border-white/30 text-white/80 hover:bg-black/60 hover:text-white'
            }`}
            aria-label={isCompared ? 'Remove from compare' : 'Add to compare'}
            title={isCompared ? 'Remove from compare' : 'Add to compare'}
          >
            <Check size={13} strokeWidth={2.5} className="text-white" />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onShortlist(uni.id) }}
            className="w-[30px] h-[30px] rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xs transition-transform hover:scale-110"
            aria-label={shortlisted ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={14} className={shortlisted ? 'fill-destructive text-destructive' : 'text-white'} />
          </button>
        </div>

        {/* ── DEFAULT OVERLAY ── */}
        <div className={`absolute inset-0 transition-all duration-300 pointer-events-none ${
          hovered ? 'bg-gradient-to-t from-black/95 via-black/75 to-black/30' : 'bg-gradient-to-t from-black/85 via-black/25 to-transparent'
        }`} />

        <div className="absolute bottom-[16px] left-[16px] right-[16px] z-10">
          <div className="flex items-center gap-[4px] text-[11px] font-semibold text-[#62aef0] mb-[2px]">
            <MapPin size={11} />
            <span className="truncate">{locationStr}</span>
          </div>
          <h3 className="text-[17px] font-bold text-white leading-tight drop-shadow-md truncate">
            {uni.name}
          </h3>

          {!hovered && (
            <p className="text-[11px] text-white/70 mt-[2px] truncate">
              {uni.type || 'University'} • Hover to preview details
            </p>
          )}
        </div>

        {/* ── NETFLIX PROGRESSIVE REVEAL PANEL ON HOVER ── */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute inset-x-0 bottom-0 z-20 p-[16px] pt-[32px] bg-gradient-to-t from-black/95 via-black/90 to-transparent flex flex-col justify-end gap-[10px]"
            >
              <p className="text-[11.5px] text-white/85 leading-relaxed line-clamp-2 drop-shadow-sm">
                {shortIntro}
              </p>

              <div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-white/50 block mb-[4px]">Programs Offered</span>
                <div className="flex flex-wrap gap-[4px]">
                  {programs.map((prog: string) => (
                    <span key={prog} className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full bg-card/15 backdrop-blur-md text-white border border-white/20">
                      {prog}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-[8px] pt-[6px]">
                <Link
                  href={`/student/universities/${uni.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="bg-primary hover:bg-primary/90 text-white text-[12px] font-semibold h-[34px] flex-1 rounded-[8px] inline-flex items-center justify-center gap-[4px] transition-all active:scale-[0.98] shadow-md"
                >
                  View Details
                  <ArrowUpRight size={13} />
                </Link>

                <button
                  onClick={(e) => { e.stopPropagation(); onCompare(uni.id) }}
                  className={`h-[34px] px-[12px] rounded-[8px] border text-[12px] font-medium backdrop-blur-md transition-all ${
                    isCompared
                      ? 'bg-primary/30 border-primary text-white'
                      : 'bg-card/15 border-white/30 text-white hover:bg-card/25'
                  }`}
                >
                  {isCompared ? 'Compared' : 'Compare'}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
})

/** PROGRAM CARD for Program View Mode */
function ProgramCard({ item, index }: { item: { program: any; university: UniversityFirestore }; index: number }) {
  const router = useRouter()
  const { program, university } = item
  const locationStr = university.location ? `${university.location.city}, ${university.location.state}` : 'Global Campus'
  const logoColor = logoColorFromName(university.name)

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.25), duration: 0.25 }}
      onClick={() => router.push(`/student/universities/${university.id}`)}
      className="bg-card border border-border rounded-[14px] p-[18px] flex flex-col justify-between gap-[14px] hover:border-primary/50 hover:shadow-md transition-all cursor-pointer group"
    >
      <div>
        {/* Level badge + Stream */}
        <div className="flex items-center justify-between gap-[8px] mb-[8px]">
          <span className="text-[11px] font-bold px-[8px] py-[2px] rounded-full bg-primary/10 text-primary border border-primary/20">
            {program.level || 'UG / PG'}
          </span>
          <span className="text-[11.5px] font-medium text-muted-foreground">
            {program.duration || '3-4 Years'}
          </span>
        </div>

        {/* Program Name */}
        <h3 className="text-[16px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors mb-[6px]">
          {program.name}
        </h3>

        {/* University Name + Location */}
        <div className="flex items-center gap-[8px]">
          <div
            className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
            style={{ background: logoColor }}
          >
            {university.name.charAt(0)}
          </div>
          <span className="text-[12.5px] font-semibold text-foreground truncate">{university.name}</span>
        </div>

        <div className="flex items-center gap-[4px] text-[11.5px] text-muted-foreground mt-[4px]">
          <MapPin size={12} className="text-primary shrink-0" />
          <span className="truncate">{locationStr}</span>
        </div>
      </div>

      {/* Program Details Footer */}
      <div className="pt-[12px] border-t border-border flex items-center justify-between gap-[12px]">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Annual Fee</span>
          <span className="text-[13.5px] font-bold text-foreground">
            {program.annualFee ? `₹${(program.annualFee / 100000).toFixed(1)}L/yr` : program.fees || 'Check Details'}
          </span>
        </div>
        <button className="px-[12px] h-[32px] rounded-[8px] bg-secondary hover:bg-primary hover:text-white text-foreground text-[12px] font-semibold transition-all flex items-center gap-[4px]">
          Explore
          <ArrowUpRight size={13} />
        </button>
      </div>
    </motion.div>
  )
}

/** Premium floating compare tray */
function CompareTray({ ids, unis, onRemove, onClear, onOpenCompare }: {
  ids: string[]; unis: UniversityFirestore[];
  onRemove: (id: string) => void; onClear: () => void; onOpenCompare: () => void;
}) {
  const [showOverflow, setShowOverflow] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const selected = useMemo(
    () => ids.map(id => unis.find(u => u.id === id)).filter(Boolean) as UniversityFirestore[],
    [ids, unis]
  )
  const visibleChips  = useMemo(() => selected.slice(0, 2), [selected])
  const overflowChips = useMemo(() => selected.slice(2),    [selected])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowOverflow(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!showOverflow) return
    const onOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowOverflow(false)
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [showOverflow])

  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          key="compare-tray"
          initial={{ y: 100, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          className="fixed z-50 bottom-5 md:bottom-7 px-3 md:px-6"
          style={{ left: 0, right: 0 }}
          aria-label="University comparison tray"
        >
          <div className="lg:ml-[240px]" style={{ display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '260px 1fr 260px',
                alignItems: 'center',
                height: '72px',
                borderRadius: '36px',
                padding: '0 20px',
                gap: '0',
                width: 'min(840px, calc(100vw - 60px))',
                background: 'rgba(14,18,28,0.94)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 2px 10px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
              }}
            >
              {/* CHIPS */}
              <div className="flex items-center gap-2 overflow-hidden" style={{ width: '260px' }}>
                <AnimatePresence mode="popLayout">
                  {visibleChips.map(u => {
                    const color = logoColorFromName(u.name)
                    return (
                      <motion.div
                        key={u.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, x: -8 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.8, x: -8 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="group flex items-center gap-2 pl-1 pr-2.5 shrink-0"
                        style={{
                          height: '36px',
                          borderRadius: '18px',
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.09)',
                          cursor: 'default',
                        }}
                      >
                        <div
                          className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0"
                          style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                        >
                          {(u.shortName || u.name).charAt(0)}
                        </div>
                        <span className="text-[12px] font-semibold text-white/85 truncate max-w-[76px] select-none">
                          {u.shortName || u.name.split(' ')[0]}
                        </span>
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemove(u.id) }}
                          aria-label={`Remove ${u.name}`}
                          className="opacity-40 hover:opacity-100 transition-opacity ml-0.5 shrink-0"
                        >
                          <X size={12} strokeWidth={2.5} color="white" />
                        </button>
                      </motion.div>
                    )
                  })}
                </AnimatePresence>

                {overflowChips.length > 0 && (
                  <div className="relative shrink-0" ref={popoverRef}>
                    <motion.button
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      onClick={() => setShowOverflow(v => !v)}
                      className="flex items-center justify-center gap-1 px-3 h-[34px] rounded-full text-[12px] font-bold transition-colors whitespace-nowrap"
                      style={{
                        background: showOverflow ? 'rgba(59,130,246,0.25)' : 'rgba(59,130,246,0.12)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        color: 'rgba(147,197,253,1)',
                      }}
                    >
                      <span>+{overflowChips.length}</span>
                      <span className="hidden sm:inline">More</span>
                    </motion.button>

                    <AnimatePresence>
                      {showOverflow && (
                        <motion.div
                          key="overflow-popover"
                          initial={{ opacity: 0, y: 12, scale: 0.94 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 12, scale: 0.94 }}
                          transition={{ type: 'spring', stiffness: 520, damping: 28 }}
                          className="absolute bottom-full mb-3 left-0 min-w-[240px] max-h-[280px] overflow-y-auto hide-scrollbar z-50"
                          style={{
                            borderRadius: '20px',
                            background: 'rgba(18,22,30,0.97)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.3)',
                            backdropFilter: 'blur(24px)',
                            WebkitBackdropFilter: 'blur(24px)',
                            padding: '8px',
                          }}
                        >
                          <div className="px-3 py-1.5 mb-1">
                            <p className="text-[11px] font-bold uppercase tracking-widest text-white/30">
                              {overflowChips.length} more {overflowChips.length === 1 ? 'university' : 'universities'}
                            </p>
                          </div>
                          {overflowChips.map(u => {
                            const color = logoColorFromName(u.name)
                            return (
                              <div
                                key={u.id}
                                className="flex items-center justify-between p-2.5 rounded-[14px] hover:bg-white/10 transition-colors group cursor-default"
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div
                                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0"
                                    style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}
                                  >
                                    {(u.shortName || u.name).charAt(0)}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-[13px] font-semibold text-white/90 truncate max-w-[150px] leading-tight">{u.name}</p>
                                    {u.location && (
                                      <p className="text-[11px] text-white/40 truncate max-w-[150px] leading-tight">
                                        {typeof u.location === 'object' ? `${(u.location as any).city || ''}` : String(u.location)}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                <button
                                  onClick={() => { onRemove(u.id); if (overflowChips.length === 1) setShowOverflow(false) }}
                                  aria-label={`Remove ${u.name}`}
                                  className="ml-3 shrink-0 opacity-30 hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-white/10"
                                >
                                  <X size={14} color="white" />
                                </button>
                              </div>
                            )
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* CENTER LABEL */}
              <div className="hidden md:flex flex-col items-center justify-center text-center pointer-events-none select-none px-4">
                <span className="text-[15px] font-semibold text-white/90 tracking-tight leading-tight">
                  Compare Universities
                </span>
                <motion.span
                  key={ids.length}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-[12px] font-medium leading-tight mt-0.5"
                  style={{ color: 'rgba(255,255,255,0.38)' }}
                >
                  {ids.length} {ids.length === 1 ? 'university' : 'universities'} selected
                </motion.span>
              </div>

              {/* ACTIONS */}
              <div className="flex items-center justify-end gap-3" style={{ width: '260px' }}>
                <button
                  onClick={onClear}
                  aria-label="Clear all selections"
                  className="flex items-center justify-center gap-1.5 text-[13px] font-semibold transition-all whitespace-nowrap shrink-0"
                  style={{
                    height: '46px',
                    paddingInline: '16px',
                    borderRadius: '23px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: 'rgba(255,255,255,0.6)',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.9)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.6)' }}
                >
                  <X size={14} strokeWidth={2.5} />
                  Clear
                </button>

                <button
                  onClick={onOpenCompare}
                  disabled={ids.length < 2}
                  aria-label={`Compare ${ids.length} universities`}
                  className="group relative flex items-center justify-center gap-2 text-[14px] font-bold text-white transition-all shrink-0 whitespace-nowrap overflow-hidden disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    height: '46px',
                    minWidth: '155px',
                    paddingInline: '20px',
                    borderRadius: '23px',
                    background: 'linear-gradient(135deg, #2563eb, #4f46e5)',
                    boxShadow: ids.length >= 2 ? '0 4px 16px rgba(37,99,235,0.45)' : 'none',
                  }}
                  onMouseEnter={e => { if (ids.length >= 2) { (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(37,99,235,0.55)' } }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; (e.currentTarget as HTMLElement).style.boxShadow = ids.length >= 2 ? '0 4px 16px rgba(37,99,235,0.45)' : 'none' }}
                >
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" style={{ borderRadius: '23px' }} />
                  <Scale size={15} className="relative z-10 shrink-0" />
                  <span className="relative z-10">
                    Compare
                    <motion.span key={ids.length} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
                      {' '}({ids.length})
                    </motion.span>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SORT_OPTIONS_LOCAL = ['NIRF Rank', 'Highest Placement', 'Lowest Fees', 'Highest Package', 'Name A–Z']

export default function UniversitiesPage() {
  const searchParams = useSearchParams()
  const { universities: allUnis, loading, error } = useUniversities()
  const [viewMode, setViewMode] = useState<'universities' | 'programs'>('universities')
  const [activeTab, setActiveTab] = useState('All')
  const [degreeLevel, setDegreeLevel] = useState('All Levels')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('NIRF Rank')
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set())
  const [compareList, setCompareList] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [showCompareWorkspace, setShowCompareWorkspace] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  // Career filter from query param
  const [careerFilter, setCareerFilter] = useState<string | null>(
    () => searchParams.get('career')
  )
  // Sync if param changes (e.g. browser back/forward)
  useEffect(() => {
    setCareerFilter(searchParams.get('career'))
  }, [searchParams])

  const toggleShortlist = (id: string) => setShortlisted(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleCompare = (id: string) => setCompareList(prev => {
    if (prev.includes(id)) return prev.filter(x => x !== id)
    if (prev.length >= 4) return prev
    return [...prev, id]
  })

  // Extract all programs across universities for Program View Mode
  const allPrograms = useMemo(() => {
    const progs: { program: any; university: UniversityFirestore }[] = []
    allUnis.forEach(uni => {
      const uProgs = (uni as any).programs || []
      if (uProgs.length > 0) {
        uProgs.forEach((p: any) => {
          progs.push({
            program: typeof p === 'string' ? { name: p, level: 'UG / PG', duration: '3-4 Years' } : p,
            university: uni
          })
        })
      } else {
        // Fallback programs if uni has none specified
        ['B.Tech Computer Science', 'MBA Business Management', 'B.Sc Data Science'].forEach(pName => {
          progs.push({
            program: { name: pName, level: pName.startsWith('B') ? 'UG' : 'PG', duration: pName.startsWith('M') ? '2 Years' : '4 Years' },
            university: uni
          })
        })
      }
    })
    return progs
  }, [allUnis])

  // Filtered Universities
  const filteredUnis = useMemo(() => {
    const careerKeywords = careerFilter ? getCareerKeywords(careerFilter) : []

    let list = allUnis.filter(u => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.location?.city || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.location?.state || '').toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === 'All Types' || u.type === typeFilter
      const matchStream = activeTab === 'All' || (u as any).programs?.some((p: any) =>
        (typeof p === 'string' ? p : p.name).toLowerCase().includes(activeTab.toLowerCase())
      )
      // Career keyword filter — pass all unis when no known keywords
      const matchCareer = careerKeywords.length === 0 || (u as any).programs?.some((p: any) => {
        const pName = (typeof p === 'string' ? p : p.name).toLowerCase()
        return careerKeywords.some(kw => pName.includes(kw))
      })
      return matchSearch && matchType && matchStream && matchCareer
    })
    if (sortBy === 'NIRF Rank') list = [...list].sort((a, b) => (a.rankings?.nirfOverall || 9999) - (b.rankings?.nirfOverall || 9999))
    else if (sortBy === 'Highest Placement') list = [...list].sort((a, b) => (b.placementRate || 0) - (a.placementRate || 0))
    else if (sortBy === 'Lowest Fees') list = [...list].sort((a, b) => (a.feesPerYear || 0) - (b.feesPerYear || 0))
    else if (sortBy === 'Highest Package') list = [...list].sort((a, b) => (b.avgPackageLpa || 0) - (a.avgPackageLpa || 0))
    else if (sortBy === 'Name A–Z') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [allUnis, search, sortBy, typeFilter, activeTab, careerFilter])

  // Filtered Programs
  const filteredPrograms = useMemo(() => {
    return allPrograms.filter(({ program, university }) => {
      const matchSearch = !search ||
        program.name.toLowerCase().includes(search.toLowerCase()) ||
        university.name.toLowerCase().includes(search.toLowerCase()) ||
        (university.location?.city || '').toLowerCase().includes(search.toLowerCase())

      const matchStream = activeTab === 'All' ||
        program.name.toLowerCase().includes(activeTab.toLowerCase())

      const matchLevel = degreeLevel === 'All Levels' ||
        (program.level || '').toLowerCase().includes(degreeLevel.toLowerCase())

      const matchType = typeFilter === 'All Types' || university.type === typeFilter

      return matchSearch && matchStream && matchLevel && matchType
    })
  }, [allPrograms, search, activeTab, degreeLevel, typeFilter])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-6xl">⚠️</div>
      <h3 className="text-xl font-bold text-foreground">Failed to load discovery data</h3>
      <p className="text-muted-foreground text-center max-w-md">{error}</p>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[20px]">

        {/* Discovery Header */}
        <DiscoveryHeader
          uniCount={filteredUnis.length}
          progCount={filteredPrograms.length}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Career Filter Banner */}
        {careerFilter && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between gap-[12px] px-[16px] py-[10px] rounded-[10px] bg-amber-50 border border-amber-200"
          >
            <div className="flex items-center gap-[8px]">
              <span className="w-[7px] h-[7px] rounded-full bg-amber-400 animate-pulse shrink-0" />
              <p className="text-[13px] font-medium text-amber-800">
                Showing universities for <strong className="font-semibold">{careerFilter}</strong> path
              </p>
            </div>
            <button
              onClick={() => setCareerFilter(null)}
              className="flex items-center gap-[4px] text-[12px] font-semibold text-amber-700 hover:text-amber-900 transition-colors shrink-0"
            >
              Clear Filter <X size={13} />
            </button>
          </motion.div>
        )}

        {/* Search + Filter Bar */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-[10px]">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={viewMode === 'universities' ? "Search universities, locations..." : "Search programs, degrees, universities..."}
                className="w-full h-[40px] pl-[40px] pr-[40px] bg-card border border-border rounded-[10px] text-[13.5px] placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
              />
              <button className="absolute right-[12px] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground">
                <Mic size={14} />
              </button>
            </div>

            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-[6px] px-[14px] h-[40px] rounded-[10px] border text-[13px] font-medium transition-colors ${
                showFilters ? 'bg-foreground text-white border-foreground' : 'bg-card text-foreground border-border hover:bg-muted'
              }`}
            >
              <SlidersHorizontal size={14} strokeWidth={1.8} />
              Filters
              {showFilters && <X size={12} />}
            </button>

            {/* Sort (only for University View) */}
            {viewMode === 'universities' && (
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none h-[40px] pl-[14px] pr-[32px] bg-card border border-border rounded-[10px] text-[13px] font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer"
                >
                  {SORT_OPTIONS_LOCAL.map(s => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown size={13} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            )}
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-card border border-border rounded-[12px] p-[16px] flex flex-wrap gap-[12px] items-center">
                  <div className="flex items-center gap-[6px]">
                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Type:</span>
                    {(['All Types','Public','Private','Deemed'] as const).map(t => (
                      <button
                        key={t}
                        onClick={() => setTypeFilter(t)}
                        className={`px-[12px] h-[30px] rounded-full text-[12px] font-medium transition-colors ${
                          typeFilter === t ? 'bg-foreground text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>

                  {viewMode === 'programs' && (
                    <>
                      <div className="w-px h-[20px] bg-border" />
                      <div className="flex items-center gap-[6px]">
                        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Level:</span>
                        {DEGREE_LEVELS.map(lvl => (
                          <button
                            key={lvl}
                            onClick={() => setDegreeLevel(lvl)}
                            className={`px-[12px] h-[30px] rounded-full text-[12px] font-medium transition-colors ${
                              degreeLevel === lvl ? 'bg-primary text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <div className="w-px h-[20px] bg-border" />
                  {['Scholarships','Hostel','Placements','Research','Exchange'].map(f => (
                    <button
                      key={f}
                      className="flex items-center gap-[4px] px-[12px] h-[30px] rounded-full text-[12px] font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                    >
                      {CHIP_ICONS[f]}{f}
                    </button>
                  ))}

                  <button
                    onClick={() => { setTypeFilter('All Types'); setDegreeLevel('All Levels'); setSearch(''); setActiveTab('All'); setCareerFilter(null) }}
                    className="ml-auto text-[12px] font-medium text-primary hover:underline flex items-center gap-[4px]"
                  >
                    <X size={12} />
                    Reset Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Stream Tabs + Count */}
        <div className="flex items-center justify-between gap-[16px]">
          <SegmentedTabs tabs={STREAM_TABS} active={activeTab} onChange={setActiveTab} />
          <div className="flex items-center gap-[6px] shrink-0">
            <span className="text-[13px] text-muted-foreground">
              <strong className="text-foreground">{viewMode === 'universities' ? filteredUnis.length : filteredPrograms.length}</strong>{' '}
              {viewMode === 'universities' ? 'universities' : 'programs'}
            </span>
            {shortlisted.size > 0 && viewMode === 'universities' && (
              <span className="flex items-center gap-[4px] px-[8px] h-[24px] rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                <Heart size={10} className="fill-primary" />
                {shortlisted.size} shortlisted
              </span>
            )}
          </div>
        </div>

        {/* UNIVERSITY VIEW GRID */}
        {viewMode === 'universities' && (
          filteredUnis.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-[60px] gap-[16px]"
            >
              <div className="w-[64px] h-[64px] rounded-[20px] bg-primary/10 flex items-center justify-center">
                <Building2 size={28} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-semibold text-foreground mb-[4px]">No universities found</p>
                <p className="text-[13px] text-muted-foreground">Try adjusting your search or filters</p>
              </div>
              <button
                onClick={() => { setSearch(''); setActiveTab('All'); setTypeFilter('All Types') }}
                className="px-[16px] h-[36px] rounded-[8px] bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
              {filteredUnis.map((uni, i) => (
                <UniCard
                  key={uni.id}
                  uni={uni}
                  index={i}
                  onShortlist={toggleShortlist}
                  shortlisted={shortlisted.has(uni.id)}
                  onCompare={toggleCompare}
                  isCompared={compareList.includes(uni.id)}
                />
              ))}
            </div>
          )
        )}

        {/* PROGRAM VIEW GRID */}
        {viewMode === 'programs' && (
          filteredPrograms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-[60px] gap-[16px]"
            >
              <div className="w-[64px] h-[64px] rounded-[20px] bg-primary/10 flex items-center justify-center">
                <GraduationCap size={28} className="text-primary" />
              </div>
              <div className="text-center">
                <p className="text-[16px] font-semibold text-foreground mb-[4px]">No programs found</p>
                <p className="text-[13px] text-muted-foreground">Try selecting a different stream or level filter</p>
              </div>
              <button
                onClick={() => { setSearch(''); setActiveTab('All'); setDegreeLevel('All Levels'); setTypeFilter('All Types') }}
                className="px-[16px] h-[36px] rounded-[8px] bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors"
              >
                Clear Filters
              </button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[20px]">
              {filteredPrograms.map((item, i) => (
                <ProgramCard key={`${item.university.id}-${i}`} item={item} index={i} />
              ))}
            </div>
          )
        )}

      </div>

      {/* Compare tray */}
      {!showCompareWorkspace && (
        <CompareTray
          ids={compareList}
          unis={allUnis}
          onRemove={(id) => setCompareList(prev => prev.filter(x => x !== id))}
          onClear={() => setCompareList([])}
          onOpenCompare={() => setShowCompareWorkspace(true)}
        />
      )}

      {/* Compare Workspace Modal */}
      {showCompareWorkspace && (
        <CompareWorkspace
          selectedIds={compareList}
          onClose={() => setShowCompareWorkspace(false)}
          onRemove={(id) => setCompareList(prev => prev.filter(x => x !== id))}
          onAdd={() => setShowCompareWorkspace(false)}
        />
      )}
    </ProtectedRoute>
  )
}
