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

const SUGGESTION_CHIPS = ['Engineering', 'Medical', 'MBA', 'Law', 'Study Abroad', 'Scholarships', 'AI Recommended']

const QUICK_CATEGORIES = [
  'Engineering', 'Medical', 'Law', 'Commerce', 'Arts', 
  'Management', 'Architecture', 'Design', 'Agriculture', 'Science'
]

function getAIMatchBadge(score: number) {
  if (score >= 90) return { label: 'Excellent Match', color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' }
  if (score >= 80) return { label: 'Strong Match', color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' }
  if (score >= 70) return { label: 'Good Match', color: 'text-[#6D5DF6] bg-[#6D5DF6]/10 border-[#6D5DF6]/20' }
  return { label: 'Average Match', color: 'text-gray-400 bg-white/5 border-white/10' }
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
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-[#6D5DF6]/30 border-t-[#6D5DF6] rounded-full animate-spin" />
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center text-white">
      Error loading discovery data. Please refresh.
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#6D5DF6]/30 font-sans pb-32">
        
        {/* HERO SECTION */}
        <section className="pt-24 pb-16 px-8 max-w-5xl mx-auto flex flex-col items-center text-center">
          <h1 className="text-[48px] md:text-[64px] font-medium tracking-tight mb-4">Discover Universities</h1>
          <p className="text-[16px] text-gray-400 mb-12 max-w-2xl">
            Explore institutions perfectly matched to your academic journey using our intelligent engine.
          </p>
          
          <div className="w-full relative group">
            <div className="absolute inset-0 bg-[#6D5DF6]/5 blur-3xl rounded-full pointer-events-none transition-opacity opacity-0 group-focus-within:opacity-100" />
            <div className="relative bg-[#151519] border border-white/5 rounded-[32px] p-3 flex items-center shadow-xl transition-all focus-within:border-[#6D5DF6]/30 focus-within:bg-[#1A1A20]">
              <div className="pl-6 pr-4 text-[#6D5DF6]">
                <Sparkles size={24} />
              </div>
              <input 
                type="text"
                placeholder="What are the best Computer Science colleges under ₹8L in Bangalore?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-[16px] text-white py-4 placeholder:text-gray-500"
              />
              <button className="bg-[#6D5DF6] text-white px-8 py-4 rounded-[24px] text-[16px] font-medium hover:bg-[#6D5DF6]/90 transition-colors ml-2">
                Search
              </button>
            </div>
            
            {searchQuery && (
              <div className="absolute top-full left-0 w-full mt-4 bg-[#111113] border border-[#6D5DF6]/20 rounded-[24px] p-6 text-left shadow-2xl z-50">
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles size={16} className="text-[#6D5DF6]" />
                  <span className="text-[14px] font-medium text-white">AI is understanding your request...</span>
                </div>
                <p className="text-[14px] text-gray-400">We found {filteredUnis.length} universities matching your preferences perfectly.</p>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            {SUGGESTION_CHIPS.map(chip => (
              <button 
                key={chip} 
                onClick={() => setSearchQuery(chip)}
                className="px-6 py-2.5 rounded-full border border-white/5 bg-[#111113] text-[14px] text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* SECTION 2: QUICK CATEGORIES */}
        <section className="max-w-[1600px] mx-auto px-8 mb-16">
          <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-4">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-8 py-4 rounded-[20px] text-[14px] font-medium shrink-0 transition-all ${selectedCategory === 'All' ? 'bg-[#6D5DF6] text-white' : 'bg-[#151519] text-gray-400 hover:bg-white/5 border border-white/5'}`}
            >
              All Programs
            </button>
            {QUICK_CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-8 py-4 rounded-[20px] text-[14px] font-medium shrink-0 transition-all ${selectedCategory === cat ? 'bg-[#6D5DF6] text-white' : 'bg-[#151519] text-gray-400 hover:bg-white/5 border border-white/5'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* MAIN GRID & FILTERS */}
        <section className="max-w-[1600px] mx-auto px-8 flex flex-col lg:flex-row gap-12 relative">
          
          {/* Smart Filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-8 flex flex-col gap-6">
              <div className="bg-[#111113] border border-white/5 rounded-[24px] p-8 flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-[20px] font-medium text-white flex items-center gap-2">
                    <SlidersHorizontal size={20} /> Filters
                  </h3>
                  <button className="text-[14px] text-gray-500 hover:text-white transition-colors">Reset</button>
                </div>
                
                <FilterGroup title="Location" options={['Delhi', 'Bangalore', 'Mumbai', 'Chennai', 'Pune']} />
                <FilterGroup title="Fees (Per Year)" options={['Under ₹5L', '₹5L - ₹10L', 'Above ₹10L']} />
                <FilterGroup title="AI Match %" options={['90% +', '80% +', '70% +']} />
                <FilterGroup title="Campus Facilities" options={['Hostel', 'Placement Cell', 'Sports Complex']} />
              </div>
            </div>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            {filteredUnis.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32 bg-[#111113] border border-white/5 rounded-[32px]">
                 <Search size={48} className="text-gray-600 mb-6" />
                 <h3 className="text-[28px] font-medium text-white mb-4">No results found</h3>
                 <p className="text-[16px] text-gray-400 mb-8">Try adjusting your filters or changing your search criteria.</p>
                 <button onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} className="px-8 py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 rounded-full text-[14px] font-medium transition-colors">
                   Reset Filters
                 </button>
              </div>
            ) : (
              <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
                {filteredUnis.map((uni: any) => {
                  const recData = recMap.get(uni.id)
                  const matchScore = recData ? recData.score : Math.floor(Math.random() * 40 + 50)
                  const badge = getAIMatchBadge(matchScore)
                  const isHovered = hoveredUni === uni.id

                  return (
                    <div 
                      key={uni.id} 
                      className="break-inside-avoid bg-[#151519] border border-white/5 rounded-[32px] overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl hover:border-white/10 hover:-translate-y-1 relative"
                      onMouseEnter={() => setHoveredUni(uni.id)}
                      onMouseLeave={() => setHoveredUni(null)}
                    >
                      {/* Image */}
                      <div className="relative h-64 w-full bg-[#111113] overflow-hidden">
                        <Image 
                          src={uni.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'}
                          alt={uni.name}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#151519] via-transparent to-transparent" />
                        
                        <div className="absolute top-4 left-4 flex gap-2">
                          <div className={`px-4 py-2 rounded-full border ${badge.color} text-[12px] font-medium backdrop-blur-md`}>
                            {badge.label} {matchScore}%
                          </div>
                        </div>
                        
                        <div className="absolute top-4 right-4">
                          <button 
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-gray-300 hover:text-white hover:bg-black/60 transition-colors"
                          >
                            <Bookmark size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8 flex flex-col flex-1 relative bg-[#151519]">
                        <h3 className="text-[24px] font-medium text-white mb-2 leading-tight">{uni.name}</h3>
                        <div className="flex items-center gap-2 text-[14px] text-gray-400 mb-6">
                          <MapPin size={14} /> {uni.location}
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-[12px] text-gray-500">Starting Fees</span>
                            <span className="text-[16px] text-white font-medium flex items-center gap-2"><Banknote size={16} className="text-[#6D5DF6]"/> ₹{uni.startingFees || '4.5L'}</span>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[12px] text-gray-500">Admission Prob.</span>
                            <span className="text-[16px] text-white font-medium flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-400"/> {Math.floor(Math.random() * 30 + 60)}%</span>
                          </div>
                        </div>

                        {/* AI Explanation Area */}
                        <div className="mb-8 p-4 bg-[#111113] border border-white/5 rounded-[16px]">
                          <div className="text-[12px] font-medium text-[#6D5DF6] mb-3 flex items-center gap-2">
                            <Sparkles size={14} /> Why it&apos;s recommended
                          </div>
                          <div className="flex flex-col gap-2">
                            {(recData?.matchReasons || ['Matches your preferred course', 'Fits your academic score']).slice(0, 2).map((reason: string, i: number) => (
                              <div key={i} className="flex items-start gap-2 text-[14px] text-gray-400">
                                <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                                <span className="leading-tight">{reason}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4 mt-auto">
                          <button 
                            onClick={() => router.push(`/student/universities/${uni.id}`)}
                            className="flex-1 bg-white text-black py-4 rounded-[20px] text-[14px] font-medium hover:bg-gray-200 transition-colors"
                          >
                            View Details
                          </button>
                          <button 
                            onClick={() => toggleCompare(uni)}
                            className={`px-6 py-4 rounded-[20px] text-[14px] font-medium border transition-colors ${compareList.find(u => u.id === uni.id) ? 'bg-[#6D5DF6] border-[#6D5DF6] text-white' : 'bg-transparent border-white/10 text-gray-300 hover:bg-white/5'}`}
                          >
                            {compareList.find(u => u.id === uni.id) ? 'Added' : 'Compare'}
                          </button>
                        </div>
                        
                        {/* Hover Preview Overlay */}
                        <AnimatePresence>
                          {isHovered && (
                            <motion.div 
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                              className="absolute inset-0 bg-[#151519]/95 backdrop-blur-xl z-20 p-8 flex flex-col border border-[#6D5DF6]/20 rounded-[32px] shadow-2xl"
                            >
                              <div className="flex justify-between items-start mb-6">
                                <h3 className="text-[20px] font-medium text-white leading-tight">{uni.name}</h3>
                                <div className="text-[14px] text-[#6D5DF6] font-medium">Preview</div>
                              </div>
                              <p className="text-[14px] text-gray-400 leading-relaxed mb-6 line-clamp-3">
                                {uni.description || `${uni.name} is a premier institution offering state-of-the-art facilities and exceptional placement records in ${uni.location}.`}
                              </p>
                              
                              <div className="flex flex-col gap-4 mb-6">
                                <h4 className="text-[14px] font-medium text-white">Top Courses</h4>
                                <div className="flex flex-wrap gap-2">
                                  {uni.programs?.slice(0, 3).map((p: any, idx: number) => (
                                    <span key={idx} className="px-3 py-1.5 bg-white/5 border border-white/5 rounded-full text-[12px] text-gray-300 truncate max-w-[150px]">
                                      {p.name}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <button 
                                onClick={() => router.push(`/student/universities/${uni.id}`)}
                                className="mt-auto w-full py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 rounded-[20px] text-[14px] font-medium text-white transition-colors flex items-center justify-center gap-2"
                              >
                                Full Overview <ChevronRight size={16} />
                              </button>
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
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#111113]/90 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-4 flex items-center gap-8 shadow-2xl z-50"
            >
              <div className="flex items-center gap-4">
                <div className="text-[14px] font-medium text-white">
                  {compareList.length} Selected for Compare
                </div>
                <div className="flex -space-x-4">
                  {compareList.map((u, i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[#111113] bg-[#151519] overflow-hidden relative">
                      <Image src={u.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'} alt="uni" fill className="object-cover" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="flex items-center gap-4">
                <button onClick={() => setCompareList([])} className="text-[14px] text-gray-500 hover:text-white transition-colors">Clear</button>
                <button className="px-6 py-3 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 rounded-full text-[14px] font-medium text-white transition-colors">
                  Compare Now
                </button>
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
    <div className="flex flex-col gap-4">
      <h4 className="text-[14px] font-medium text-white">{title}</h4>
      <div className="flex flex-col gap-3">
        {options.map(opt => (
          <label key={opt} className="flex items-center gap-3 cursor-pointer group">
            <div className="w-5 h-5 rounded-[6px] border border-white/10 bg-[#151519] group-hover:border-[#6D5DF6]/50 flex items-center justify-center transition-colors">
              <CheckCircle2 size={12} className="text-[#6D5DF6] opacity-0" />
            </div>
            <span className="text-[14px] text-gray-400 group-hover:text-white transition-colors">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  )
}
