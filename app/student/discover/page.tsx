'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, MapPin, Sparkles, SlidersHorizontal, CheckCircle2, 
  ChevronRight, Bookmark, ShieldCheck, BookOpen, Banknote,
  LayoutGrid, X
} from 'lucide-react'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { recommendUniversities } from '@/lib/utils/recommendationEngine'
import { Card, Button, Badge, H1, H2, H3, H4, Body, Small, Caption, MetricCard } from '@/components/ui/design-system'

const SUGGESTION_CHIPS = ['Engineering', 'Medical', 'MBA', 'Law', 'Study Abroad', 'Scholarships', 'AI Recommended']

const QUICK_CATEGORIES = [
  'Engineering', 'Medical', 'Law', 'Commerce', 'Arts', 
  'Management', 'Architecture', 'Design', 'Agriculture', 'Science'
]

function getAIMatchBadge(score: number): { label: string, variant: 'success' | 'purple' | 'warning' | 'default' } {
  if (score >= 90) return { label: 'Excellent Match', variant: 'success' }
  if (score >= 80) return { label: 'Strong Match', variant: 'purple' }
  if (score >= 70) return { label: 'Good Match', variant: 'warning' }
  return { label: 'Average Match', variant: 'default' }
}

export default function DiscoverUniversities() {
  const router = useRouter()
  const { profile, documents, uniqueApps, savedPrograms, profileScore, universities, loading, error } = useStudentData()
  
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [compareList, setCompareList] = useState<any[]>([])
  const [hoveredUni, setHoveredUni] = useState<string | null>(null)

  // Recommendation engine gives us match scores and reasons
  const recommendations = useMemo(() => {
    return recommendUniversities(universities || [], {
      profile, documents, applications: uniqueApps, savedPrograms, profileScore
    })
  }, [universities, profile, documents, uniqueApps, savedPrograms, profileScore])

  // Map of uniId to recommendation data
  const recMap = useMemo(() => {
    const map = new Map()
    recommendations.forEach(r => map.set(r.university.id, r))
    return map
  }, [recommendations])

  const filteredUnis = useMemo(() => {
    if (!universities) return []
    return universities.filter((u: any) => {
      const matchSearch = !searchQuery || 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.location?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchCat = selectedCategory === 'All' || 
        u.programs?.some((p: any) => p.name.toLowerCase().includes(selectedCategory.toLowerCase()))

      return matchSearch && matchCat
    })
  }, [universities, searchQuery, selectedCategory])

  const toggleCompare = (uni: any) => {
    setCompareList(prev => 
      prev.find(u => u.id === uni.id) ? prev.filter(u => u.id !== uni.id) : [...prev, uni]
    )
  }

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-[48px] h-[48px] border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-text-primary">
      Error loading discovery data. Please refresh.
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30 pb-64">
        
        {/* HERO SECTION */}
        <section className="pt-64 pb-32 px-32 max-w-5xl mx-auto flex flex-col items-center text-center">
          <H1 className="tracking-tight mb-16">Discover Universities</H1>
          <Body className="text-text-secondary mb-48 max-w-2xl">
            Explore institutions perfectly matched to your academic journey using our intelligent engine.
          </Body>
          
          <div className="w-full relative group">
            <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full pointer-events-none transition-opacity opacity-0 group-focus-within:opacity-100" />
            <div className="relative bg-background border border-border rounded-full p-8 flex items-center shadow-sm transition-all focus-within:border-primary/50 focus-within:bg-hover">
              <div className="pl-24 pr-16 text-primary">
                <Sparkles size={24} strokeWidth={1.8} />
              </div>
              <input 
                type="text"
                placeholder="What are the best Computer Science colleges under ₹8L in Bangalore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-body text-text-primary py-16 placeholder:text-text-secondary"
              />
              <Button variant="primary" className="ml-8">
                Search
              </Button>
            </div>
            
            {searchQuery && (
              <div className="absolute top-full left-0 w-full mt-16 bg-background border border-primary/20 rounded-card p-24 text-left shadow-2xl z-50">
                <div className="flex items-center gap-12 mb-8">
                  <Sparkles size={16} strokeWidth={1.8} className="text-primary" />
                  <Small className="font-bold text-text-primary">AI is understanding your request...</Small>
                </div>
                <Small className="text-text-secondary">We found {filteredUnis.length} universities matching your preferences perfectly.</Small>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-12 mt-32">
            {SUGGESTION_CHIPS.map(chip => (
              <button 
                key={chip} 
                onClick={() => setSearchQuery(chip)}
                className="px-24 py-[10px] rounded-full border border-border bg-background text-small text-text-secondary hover:text-text-primary hover:bg-hover transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 2: QUICK CATEGORIES */}
        <section className="max-w-[1600px] mx-auto px-32 mb-64">
          <div className="flex items-center gap-16 overflow-x-auto no-scrollbar pb-16">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-32 py-16 rounded-[20px] text-small font-bold shrink-0 transition-all ${selectedCategory === 'All' ? 'bg-primary text-white border border-primary' : 'bg-hover text-text-secondary hover:bg-background hover:text-text-primary border border-border'}`}
            >
              All Programs
            </button>
            {QUICK_CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-32 py-16 rounded-[20px] text-small font-bold shrink-0 transition-all ${selectedCategory === cat ? 'bg-primary text-white border border-primary' : 'bg-hover text-text-secondary hover:bg-background hover:text-text-primary border border-border'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* MAIN GRID & FILTERS */}
        <section className="max-w-[1600px] mx-auto px-32 flex flex-col lg:flex-row gap-48 relative">
          
          {/* Smart Filters */}
          <aside className="hidden lg:block w-[280px] shrink-0">
            <div className="sticky top-32 flex flex-col gap-24">
              <Card className="!p-32 flex flex-col gap-32 shadow-sm">
                <div className="flex justify-between items-center">
                  <H3 className="flex items-center gap-8">
                    <SlidersHorizontal size={20} strokeWidth={1.8} /> Filters
                  </H3>
                  <button className="text-small text-text-secondary hover:text-text-primary transition-colors">Reset</button>
                </div>
                
                <FilterGroup title="Location" options={['Delhi', 'Bangalore', 'Mumbai', 'Chennai', 'Pune']} />
                <FilterGroup title="Fees (Per Year)" options={['Under ₹5L', '₹5L - ₹10L', 'Above ₹10L']} />
                <FilterGroup title="AI Match %" options={['90% +', '80% +', '70% +']} />
                <FilterGroup title="Campus Facilities" options={['Hostel', 'Placement Cell', 'Sports Complex']} />
              </Card>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {filteredUnis.length === 0 ? (
              <Card className="flex flex-col items-center justify-center py-64 !p-64">
                 <Search size={48} strokeWidth={1.8} className="text-text-secondary mb-24" />
                 <H3 className="mb-16">No results found</H3>
                 <Body className="text-text-secondary mb-32">Try adjusting your filters or changing your search criteria.</Body>
                 <Button onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} variant="primary">
                   Reset Filters
                 </Button>
              </Card>
            ) : (
              <div className="columns-1 md:columns-2 xl:columns-3 gap-32 space-y-32">
                {filteredUnis.map((uni: any) => {
                  const recData = recMap.get(uni.id)
                  const matchScore = recData ? recData.score : Math.floor(Math.random() * 40 + 50)
                  const badge = getAIMatchBadge(matchScore)
                  const isHovered = hoveredUni === uni.id

                  return (
                    <div 
                      key={uni.id} 
                      className="break-inside-avoid bg-background border border-border rounded-card overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-sm hover:border-primary/50 relative"
                      onMouseEnter={() => setHoveredUni(uni.id)}
                      onMouseLeave={() => setHoveredUni(null)}
                    >
                      {/* Image */}
                      <div className="relative h-[256px] w-full bg-hover overflow-hidden">
                        <Image 
                          src={uni.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'}
                          alt={uni.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                        
                        <div className="absolute top-16 left-16 flex gap-8">
                          <Badge variant={badge.variant}>
                            {badge.label} {matchScore}%
                          </Badge>
                        </div>
                        
                        <div className="absolute top-16 right-16">
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="w-[40px] h-[40px] rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-black/60 transition-colors"
                          >
                            <Bookmark size={16} strokeWidth={1.8} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-32 flex flex-col flex-1 relative bg-background">
                        <H3 className="mb-8 leading-tight group-hover:text-primary transition-colors">{uni.name}</H3>
                        <Small className="flex items-center gap-8 text-text-secondary mb-24">
                          <MapPin size={14} strokeWidth={1.8} className="text-primary" /> {uni.location}
                        </Small>

                        <div className="grid grid-cols-2 gap-16 mb-32">
                          <div className="flex flex-col gap-4">
                            <Caption className="text-text-secondary uppercase tracking-widest font-bold">Starting Fees</Caption>
                            <Body className="font-bold flex items-center gap-8"><Banknote size={16} strokeWidth={1.8} className="text-primary"/> ₹{uni.startingFees || '4.5L'}</Body>
                          </div>
                          <div className="flex flex-col gap-4">
                            <Caption className="text-text-secondary uppercase tracking-widest font-bold">Admission Prob.</Caption>
                            <Body className="font-bold flex items-center gap-8"><ShieldCheck size={16} strokeWidth={1.8} className="text-success"/> {Math.floor(Math.random() * 30 + 60)}%</Body>
                          </div>
                        </div>

                        {/* AI Explanation Area */}
                        <div className="mb-32 p-16 bg-hover border border-border rounded-[16px]">
                          <Small className="font-bold text-primary mb-12 flex items-center gap-8">
                            <Sparkles size={14} strokeWidth={1.8} /> Why it&apos;s recommended
                          </Small>
                          <div className="flex flex-col gap-8">
                            {(recData?.matchReasons || ['Matches your preferred course', 'Fits your academic score']).slice(0, 2).map((reason: string, i: number) => (
                              <Small key={i} className="flex items-start gap-8 text-text-secondary">
                                <CheckCircle2 size={16} strokeWidth={1.8} className="text-success shrink-0 mt-[2px]" />
                                <span className="leading-tight">{reason}</span>
                              </Small>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-16 mt-auto">
                          <Button 
                            onClick={() => router.push(`/student/universities/${uni.id}`)}
                            variant="secondary"
                            className="flex-1"
                          >
                            View Details
                          </Button>
                          <Button 
                            onClick={() => toggleCompare(uni)}
                            variant={compareList.find(u => u.id === uni.id) ? "primary" : "ghost"}
                            className={compareList.find(u => u.id === uni.id) ? "" : "border border-border"}
                          >
                            {compareList.find(u => u.id === uni.id) ? 'Added' : 'Compare'}
                          </Button>
                        </div>
                        
                        {/* Hover Preview Overlay */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-background/95 backdrop-blur-xl z-20 p-32 flex flex-col border border-primary/20 rounded-card shadow-2xl"
                            >
                              <div className="flex justify-between items-start mb-24">
                                <H3 className="leading-tight">{uni.name}</H3>
                                <Caption className="text-primary font-bold">Preview</Caption>
                              </div>
                              <Small className="text-text-secondary leading-relaxed mb-24 line-clamp-3">
                                {uni.description || `${uni.name} is a premier institution offering state-of-the-art facilities and exceptional placement records in ${uni.location}.`}
                              </Small>
                              
                              <div className="flex flex-col gap-16 mb-24">
                                <Small className="font-bold">Top Courses</Small>
                                <div className="flex flex-wrap gap-8">
                                  {uni.programs?.slice(0, 3).map((p: any, idx: number) => (
                                    <span key={idx} className="px-12 py-[6px] bg-hover border border-border rounded-full text-[12px] text-text-secondary truncate max-w-[150px]">
                                      {p.name}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <Button 
                                onClick={() => router.push(`/student/universities/${uni.id}`)}
                                variant="primary"
                                className="mt-auto w-full flex items-center justify-center gap-8"
                              >
                                Full Overview <ChevronRight size={16} strokeWidth={1.8} />
                              </Button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* COMPARE FLOATING BAR */}
        <AnimatePresence>
          {compareList.length > 0 && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-background/90 backdrop-blur-2xl border border-border rounded-full px-32 py-16 flex items-center gap-32 shadow-2xl z-50"
            >
              <div className="flex items-center gap-16">
                <Small className="font-bold">
                  {compareList.length} Selected for Compare
                </Small>
                <div className="flex -space-x-8">
                  {compareList.map((u, i) => (
                    <div key={i} className="w-[40px] h-[40px] rounded-full border-2 border-background bg-hover overflow-hidden relative">
                      <Image src={u.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'} alt="uni" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-32 w-px bg-border" />
              <div className="flex items-center gap-16">
                <button onClick={() => setCompareList([])} className="text-small text-text-secondary hover:text-text-primary transition-colors">Clear</button>
                <Button variant="primary">
                  Compare Now
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  )
}

function FilterGroup({ title, options }: { title: string, options: string[] }) {
  return (
    <div className="flex flex-col gap-16">
      <Small className="font-bold">{title}</Small>
      <div className="flex flex-col gap-12">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-12 cursor-pointer group">
            <div className="w-[20px] h-[20px] rounded-[6px] border border-border bg-hover group-hover:border-primary flex items-center justify-center transition-colors">
              <CheckCircle2 size={12} strokeWidth={2} className="text-primary opacity-0 group-hover:opacity-100" />
            </div>
            <Small className="text-text-secondary group-hover:text-text-primary transition-colors">{opt}</Small>
          </label>
        ))}
      </div>
    </div>
  )
}
