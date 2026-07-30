'use client'

import React, { useState, useMemo, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, MapPin, Heart, ArrowUpRight, SlidersHorizontal, ChevronDown, X, Mic,
  BookOpen, Award, Globe, Building2, Zap, Home, Check, Scale
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import SegmentedTabs from '@/components/ui/SegmentedTabs'
import { useUniversities } from '@/hooks/useUniversities'
import { UniversityFirestore } from '@/lib/firebase/universities'

const TABS = ['All', 'Engineering', 'Management', 'Sciences', 'Arts', 'Medical']

const CHIP_ICONS: Record<string, React.ReactNode> = {
  Scholarships: <Award size={10} />, Hostel: <Home size={10} />, Placements: <Zap size={10} />,
  Research: <BookOpen size={10} />, Exchange: <Globe size={10} />, International: <Globe size={10} />,
}

/** Calibrated Compact Discovery Header */
function DiscoveryHeader({ count }: { count: number }) {
  return (
    <div className="bg-card border border-border rounded-[12px] p-[16px] md:p-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row md:items-center justify-between gap-[16px]">
      <div>
        <div className="flex items-center gap-[8px] mb-[2px]">
          <span className="text-[11px] font-bold text-primary uppercase tracking-wider">EDING Marketplace Discovery</span>
          <span className="w-[6px] h-[6px] rounded-full bg-success animate-pulse" />
        </div>
        <h1 className="text-[20px] font-bold text-foreground tracking-tight">Explore Universities & Campuses</h1>
        <p className="text-[12.5px] text-muted-foreground mt-[2px]">
          Discover top-tier institutions worldwide. Hover over any campus to reveal programs & quick details.
        </p>
      </div>

      <div className="flex items-center gap-[12px] shrink-0">
        <span className="text-[12px] font-semibold text-foreground bg-muted border border-border px-[12px] py-[6px] rounded-[8px]">
          <strong className="text-primary">{count}</strong> Institutions Available
        </span>
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
 * - Image is ALWAYS visible and hero of the card.
 * - Hover extends the bottom dark overlay smoothly (translateY + opacity).
 * - University name appears ONCE only over the image.
 * - 100% Grid Stability (Zero neighbor layout shifts).
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

  const programs = ['Engineering', 'Computer Science', 'Business', 'Medicine', '+ More Programs']
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
          {/* Compare Checkbox Button */}
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

          {/* Shortlist Heart Button */}
          <button
            onClick={(e) => { e.stopPropagation(); onShortlist(uni.id) }}
            className="w-[30px] h-[30px] rounded-full bg-black/40 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-xs transition-transform hover:scale-110"
            aria-label={shortlisted ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Heart size={14} className={shortlisted ? 'fill-destructive text-destructive' : 'text-white'} />
          </button>
        </div>

        {/* ── DEFAULT OVERLAY (Bottom Portion of Image) ── */}
        <div className={`absolute inset-0 transition-all duration-300 pointer-events-none ${
          hovered ? 'bg-gradient-to-t from-black/95 via-black/75 to-black/30' : 'bg-gradient-to-t from-black/85 via-black/25 to-transparent'
        }`} />

        {/* Default Card Bottom Info (Always visible, Name appears ONCE) */}
        <div className="absolute bottom-[16px] left-[16px] right-[16px] z-10">
          <div className="flex items-center gap-[4px] text-[11px] font-semibold text-[#62aef0] mb-[2px]">
            <MapPin size={11} />
            <span className="truncate">{locationStr}</span>
          </div>
          <h3 className="text-[17px] font-bold text-white leading-tight drop-shadow-md truncate">
            {uni.name}
          </h3>

          {/* Default subtitle when not hovered */}
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
              {/* Short University Introduction (2-3 lines) */}
              <p className="text-[11.5px] text-white/85 leading-relaxed line-clamp-2 drop-shadow-sm">
                {shortIntro}
              </p>

              {/* Program Categories Pills */}
              <div>
                <span className="text-[9.5px] font-bold uppercase tracking-wider text-white/50 block mb-[4px]">Programs Offered</span>
                <div className="flex flex-wrap gap-[4px]">
                  {programs.map(prog => (
                    <span key={prog} className="text-[9.5px] font-semibold px-[7px] py-[2px] rounded-full bg-card/15 backdrop-blur-md text-white border border-white/20">
                      {prog}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons (View Details & Compare ONLY) */}
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

/** Premium floating compare tray */
function CompareTray({ ids, unis, onRemove, onClear }: {
  ids: string[]; unis: UniversityFirestore[];
  onRemove: (id: string) => void; onClear: () => void
}) {
  const router = useRouter()
  const selected = ids.map(id => unis.find(u => u.id === id)).filter(Boolean) as UniversityFirestore[]
  return (
    <AnimatePresence>
      {ids.length > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          className="fixed bottom-[80px] lg:bottom-[24px] left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-[#0F1117] border border-white/10 rounded-2xl shadow-2xl shadow-black/40 px-4 py-3 flex items-center gap-4 min-w-[380px] max-w-[600px] backdrop-blur-xl">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selected.map(u => {
                const color = logoColorFromName(u.name)
                return (
                  <div key={u.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-card/[0.06] border border-white/10 group/pill">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-black shrink-0"
                      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)` }}>
                      {(u.shortName || u.name).charAt(0)}
                    </div>
                    <span className="text-[11px] font-semibold text-white/80 truncate max-w-[80px]">{u.shortName || u.name.split(' ')[0]}</span>
                    <button onClick={() => onRemove(u.id)} className="text-white/20 hover:text-white/80 transition-colors ml-0.5">
                      <X size={10} strokeWidth={2.5} />
                    </button>
                  </div>
                )
              })}
              {ids.length < 4 && (
                <span className="text-[11px] text-white/20 whitespace-nowrap">+ {4 - ids.length} more</span>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button onClick={onClear} className="text-[11px] text-white/30 hover:text-white/70 transition-colors font-medium">Clear</button>
              <button
                onClick={() => router.push(`/student/compare?ids=${ids.join(',')}`)}
                disabled={ids.length < 2}
                className="flex items-center gap-1.5 px-4 h-8 rounded-xl bg-primary hover:bg-primary/90 text-white text-[12px] font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
              >
                <Scale size={12} />
                Compare {ids.length}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const SORT_OPTIONS_LOCAL = ['NIRF Rank', 'Highest Placement', 'Lowest Fees', 'Highest Package', 'Name A–Z']

export default function UniversitiesPage() {
  const { universities: allUnis, loading, error } = useUniversities()
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('NIRF Rank')
  const [shortlisted, setShortlisted] = useState<Set<string>>(new Set())
  const [compareList, setCompareList] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)
  const [typeFilter, setTypeFilter] = useState('All Types')
  const searchRef = useRef<HTMLInputElement>(null)

  const toggleShortlist = (id: string) => setShortlisted(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  const toggleCompare = (id: string) => setCompareList(prev => {
    if (prev.includes(id)) return prev.filter(x => x !== id)
    if (prev.length >= 4) return prev
    return [...prev, id]
  })

  const filtered = useMemo(() => {
    let list = allUnis.filter(u => {
      const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) ||
        (u.location?.city || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.location?.state || '').toLowerCase().includes(search.toLowerCase())
      const matchType = typeFilter === 'All Types' || u.type === typeFilter
      return matchSearch && matchType
    })
    if (sortBy === 'NIRF Rank') list = [...list].sort((a, b) => (a.rankings?.nirfOverall || 9999) - (b.rankings?.nirfOverall || 9999))
    else if (sortBy === 'Highest Placement') list = [...list].sort((a, b) => (b.placementRate || 0) - (a.placementRate || 0))
    else if (sortBy === 'Lowest Fees') list = [...list].sort((a, b) => (a.feesPerYear || 0) - (b.feesPerYear || 0))
    else if (sortBy === 'Highest Package') list = [...list].sort((a, b) => (b.avgPackageLpa || 0) - (a.avgPackageLpa || 0))
    else if (sortBy === 'Name A–Z') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [allUnis, search, sortBy, typeFilter])

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  )

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-6xl">⚠️</div>
      <h3 className="text-xl font-bold text-foreground">Failed to load universities</h3>
      <p className="text-muted-foreground text-center max-w-md">{error}</p>
    </div>
  )

  if (allUnis.length === 0) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <div className="text-6xl">🏛️</div>
      <h3 className="text-xl font-bold text-foreground">No universities yet</h3>
      <p className="text-muted-foreground text-center max-w-md">
        Universities will appear here once they are approved by EDUING.
      </p>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="font-sans flex flex-col gap-[20px]">

        {/* Discovery Header */}
        <DiscoveryHeader count={filtered.length} />

        {/* Search + Filter Bar */}
        <div className="flex flex-col gap-[10px]">
          <div className="flex items-center gap-[10px]">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={15} className="absolute left-[14px] top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.8} />
              <input ref={searchRef} type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search universities, locations..."
                className="w-full h-[40px] pl-[40px] pr-[40px] bg-card border border-border rounded-[10px] text-[13.5px] placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all" />
              <button className="absolute right-[12px] top-1/2 -translate-y-1/2 text-muted-foreground hover:text-muted-foreground"><Mic size={14} /></button>
            </div>
            {/* Filter toggle */}
            <button onClick={() => setShowFilters(v => !v)}
              className={`flex items-center gap-[6px] px-[14px] h-[40px] rounded-[10px] border text-[13px] font-medium transition-colors ${showFilters ? 'bg-foreground text-white border-foreground' : 'bg-card text-foreground border-border hover:bg-muted'}`}>
              <SlidersHorizontal size={14} strokeWidth={1.8} />Filters{showFilters && <X size={12} />}
            </button>
            {/* Sort */}
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="appearance-none h-[40px] pl-[14px] pr-[32px] bg-card border border-border rounded-[10px] text-[13px] font-medium text-foreground focus:outline-none focus:border-primary cursor-pointer">
                {SORT_OPTIONS_LOCAL.map(s => <option key={s}>{s}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-[10px] top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Filter panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="bg-card border border-border rounded-[12px] p-[16px] flex flex-wrap gap-[12px] items-center">
                  {(['All Types','Public','Private','Deemed'] as const).map(t => (
                    <button key={t} onClick={() => setTypeFilter(t)}
                      className={`px-[12px] h-[30px] rounded-full text-[12px] font-medium transition-colors ${typeFilter === t ? 'bg-foreground text-white' : 'bg-secondary text-foreground hover:bg-secondary/80'}`}>{t}</button>
                  ))}
                  <div className="w-px h-[20px] bg-secondary/80" />
                  {['Scholarships','Hostel','Placements','Research','Exchange'].map(f => (
                    <button key={f} className="flex items-center gap-[4px] px-[12px] h-[30px] rounded-full text-[12px] font-medium bg-secondary text-foreground hover:bg-secondary/80 transition-colors">
                      {CHIP_ICONS[f]}{f}
                    </button>
                  ))}
                  <button onClick={() => { setTypeFilter('All Types'); setSearch('') }}
                    className="ml-auto text-[12px] font-medium text-primary hover:underline flex items-center gap-[4px]">
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
            <span className="text-[13px] text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> universities</span>
            {shortlisted.size > 0 && (
              <span className="flex items-center gap-[4px] px-[8px] h-[24px] rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
                <Heart size={10} className="fill-primary" />{shortlisted.size} shortlisted
              </span>
            )}
          </div>
        </div>

        {/* Cards Grid: Responsive 3 to 4 cards per row on desktop */}
        {filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-[60px] gap-[16px]">
            <div className="w-[64px] h-[64px] rounded-[20px] bg-primary/10 flex items-center justify-center">
              <Building2 size={28} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="text-[16px] font-semibold text-foreground mb-[4px]">No universities found</p>
              <p className="text-[13px] text-muted-foreground">Try adjusting your search or filters</p>
            </div>
            <button onClick={() => { setSearch(''); setActiveTab('All'); setTypeFilter('All Types') }}
              className="px-[16px] h-[36px] rounded-[8px] bg-primary text-white text-[13px] font-semibold hover:bg-primary/90 transition-colors">
              Clear Filters
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[24px]">
            {filtered.map((uni, i) => (
              <UniCard key={uni.id} uni={uni} index={i}
                onShortlist={toggleShortlist}
                shortlisted={shortlisted.has(uni.id)}
                onCompare={toggleCompare}
                isCompared={compareList.includes(uni.id)} />
            ))}
          </div>
        )}
      </div>

      {/* Compare tray */}
      <CompareTray
        ids={compareList}
        unis={allUnis}
        onRemove={(id) => setCompareList(prev => prev.filter(x => x !== id))}
        onClear={() => setCompareList([])}
      />
    </ProtectedRoute>
  )
}
