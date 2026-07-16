'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  Search, 
  MapPin, 
  Star, 
  Award, 
  ChevronRight, 
  SlidersHorizontal,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  GraduationCap
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { recommendUniversities } from '@/lib/utils/recommendationEngine'
import { NaturalLanguageSearchService } from '@/lib/ai/gemini'
import { Sparkles, User, Compass } from 'lucide-react'
import { AIWorkspaceLayout } from '@/components/ai/AIWorkspaceLayout'
import { AIContextCard } from '@/components/ai/AIContextCard'
import { AILoadingState } from '@/components/ai/AILoadingState'
import { AIEmptyState } from '@/components/ai/AIEmptyState'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { useAIGeneration } from '@/hooks/useAIGeneration'
import { University } from '@/types/firebase'

const NAAC_GRADES = ['A++', 'A+', 'A', 'B++', 'B+', 'B']
const RATINGS = [4.5, 4.0, 3.5, 3.0]
const STATES = ['Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Rajasthan', 'Kerala', 'Punjab', 'Uttar Pradesh']

export default function PremiumDiscoverPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { profile, documents, uniqueApps, savedPrograms, profileScore, universities: allUniversities, loading: studentDataLoading, error } = useStudentData()
  
  const { isGenerating: aiLoading, generate: generateAiSearch, error: aiError } = useAIGeneration<any>();

  const handleAISearch = async () => {
    if (!searchQuery) return;
    setAiMode(true);
    await generateAiSearch(async () => {
      const intentRes = await NaturalLanguageSearchService.parseIntent(searchQuery);
      if (intentRes.success && intentRes.data) {
        const intent = intentRes.data;
        if (intent.location) setSelectedState(intent.location);
        // Map intent to filters...
        
        // Explain results
        const explanationRes = await NaturalLanguageSearchService.generateExplanation(searchQuery, filteredUniversities);
        if (explanationRes.success) {
          setAiExplanation(explanationRes.text || '');
        }
      }
      return { success: intentRes.success, text: intentRes.text, error: intentRes.error };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchQuery.toLowerCase().includes('near') || searchQuery.toLowerCase().includes('under') || searchQuery.toLowerCase().includes('best')) {
         handleAISearch();
      }
    }
  };

  // Search & Filter State
  const [viewMode, setViewMode] = useState<'Recommended' | 'All'>('Recommended')
  const [searchQuery, setSearchQuery] = useState('')
  const [aiMode, setAiMode] = useState(false)
  const [aiExplanation, setAiExplanation] = useState('')
  const [activeLevel, setActiveLevel] = useState<'All' | 'UG' | 'PG'>('All')
  const [selectedState, setSelectedState] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [selectedNAAC, setSelectedNAAC] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const filterDrawerRef = useFocusTrap<HTMLDivElement>(showFilters, () => setShowFilters(false))

  const universities = useMemo(() => {
    return allUniversities.filter((u: University) => {
      if (activeLevel !== 'All' && !u.programs.some((p: any) => p.level === activeLevel)) return false;
      if (selectedState && u.location !== selectedState) return false;
      if (minRating > 0 && (u.rating || 0) < minRating) return false;
      if (selectedNAAC && u.naacGrade !== selectedNAAC) return false;
      return true;
    });
  }, [allUniversities, activeLevel, selectedState, minRating, selectedNAAC]);

  // Recommendations
  const recommendations = useMemo(() => {
    return recommendUniversities(universities, {
      profile,
      documents,
      applications: uniqueApps,
      savedPrograms,
      profileScore
    });
  }, [universities, profile, documents, uniqueApps, savedPrograms, profileScore])

  // Client-side search for name/program (partial match)
  const filteredUniversities = useMemo(() => {
    let baseList = universities
    
    if (viewMode === 'Recommended') {
      baseList = recommendations.map(r => r.university)
    }

    if (!searchQuery) return baseList
    return baseList.filter((uni: University) => 
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.programs.some((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [universities, recommendations, viewMode, searchQuery])



  const handleApply = (uni: University) => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Free exploration - allow viewing university details
    router.push(`/student/universities/${uni.id}`)
  }

  if (studentDataLoading) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      gap: '16px',
    }}>
      <p style={{color:'#EF4444', fontSize:'16px'}}>
        Error: {error}
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 24px',
          cursor: 'pointer',
        }}
      >
        Retry Sync
      </button>
    </div>
  )

  if (universities.length === 0) return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      gap: '12px',
    }}>
      <p style={{
        color: 'rgba(255,255,255,0.4)',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        No institutions found
      </p>
      <p style={{
        color: 'rgba(255,255,255,0.2)',
        fontSize: '13px',
      }}>
        Check &apos;universities&apos; collection in Firebase.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          background: '#4F46E5',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          padding: '10px 24px',
          cursor: 'pointer',
          fontSize: '14px',
        }}
      >
        Retry Sync
      </button>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <AIWorkspaceLayout
        title="AI Program Discovery"
        icon={<Search size={16} />}
        leftPanel={
          <>
            <div className="p-4 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase tracking-widest text-white/40">Filters</h3>
              <button onClick={() => {
                setActiveLevel('All'); setSelectedState(''); setMinRating(0); setSelectedNAAC('');
              }} className="text-[10px] font-black uppercase text-indigo-400 hover:text-indigo-300 transition-all">Reset</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
              {/* Level Toggle */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-white/46 uppercase tracking-widest">Academic Level</span>
                <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl border border-white/5" role="group" aria-label="Academic Level">
                  {['All', 'UG', 'PG'].map(l => (
                    <button key={l} onClick={() => setActiveLevel(l as any)} className={`py-2 rounded-lg text-xs font-bold transition-all ${activeLevel === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white'}`}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location Dropdown */}
              <div className="space-y-4">
                <label htmlFor="state-region" className="text-[10px] font-black text-white/46 uppercase tracking-widest">State / Region</label>
                <select id="state-region" value={selectedState} onChange={e => setSelectedState(e.target.value)} className="w-full bg-[#111114] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                  <option value="">All Regions</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              {/* Rating Filter */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-white/46 uppercase tracking-widest">Minimum Rating</span>
                <div className="space-y-2" role="group" aria-label="Minimum Rating">
                  {RATINGS.map(r => (
                    <button key={r} onClick={() => setMinRating(minRating === r ? 0 : r)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${minRating === r ? 'bg-indigo-500/10 border-indigo-500/50 text-white' : 'bg-transparent border-white/5 text-white/40 hover:border-white/20'}`}>
                      <div className="flex items-center gap-2">
                        <Star size={14} className={minRating === r ? 'fill-indigo-500 text-indigo-500' : 'text-white/20'} />
                        <span className="text-sm font-bold">{r}+ Rating</span>
                      </div>
                      {minRating === r && <CheckCircle2 size={14} className="text-indigo-400" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* NAAC Grade */}
              <div className="space-y-4">
                <span className="text-[10px] font-black text-white/46 uppercase tracking-widest">NAAC Accreditation</span>
                <div className="flex flex-wrap gap-2" role="group" aria-label="NAAC Accreditation">
                  {NAAC_GRADES.map(g => (
                    <button key={g} onClick={() => setSelectedNAAC(selectedNAAC === g ? '' : g)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${selectedNAAC === g ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        }
        centerPanel={
          <>
            <div className="sticky top-0 z-20 bg-[#050505] pt-2 pb-6 flex flex-col gap-4">
              <div className="relative w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search naturally (e.g., 'Best engineering colleges under 8L near Delhi')"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-[#111114] border border-white/10 rounded-full pl-12 pr-32 py-4 text-sm placeholder:text-white/30 focus:border-indigo-500/50 outline-none transition-all shadow-xl text-white"
                />
                <button 
                  onClick={handleAISearch}
                  disabled={aiLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 rounded-full text-xs font-bold transition-all flex items-center gap-2"
                >
                  {aiLoading ? 'Thinking...' : <><Sparkles size={14} /> Search</>}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                  <button 
                    onClick={() => setViewMode('Recommended')} 
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'Recommended' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white'}`}
                  >
                    <Star size={16} /> Recommended
                  </button>
                  <button 
                    onClick={() => setViewMode('All')} 
                    className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${viewMode === 'All' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white'}`}
                  >
                    All Universities
                  </button>
                </div>
                
                <h2 className="text-[10px] font-black text-white/46 uppercase tracking-[0.2em]">
                  {studentDataLoading ? 'Searching Database...' : `${filteredUniversities.length} Found`}
                </h2>
              </div>
            </div>

            <div className="pb-24 space-y-6">
              {studentDataLoading ? (
                <AILoadingState title="Searching Database..." description="Fetching universities and applying filters." />
              ) : error ? (
                <AIEmptyState 
                  icon={AlertCircle} 
                  title="Sync Failure" 
                  description={error} 
                  actionButton={
                    <button 
                      onClick={() => window.location.reload()}
                      className="bg-indigo-600 px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 mt-4"
                    >
                      Force Sync (Retry)
                    </button>
                  } 
                />
              ) : filteredUniversities.length === 0 ? (
                <AIEmptyState 
                  icon={Search} 
                  title="No institutions found" 
                  description="Try adjusting your filters or search query." 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <AnimatePresence mode="popLayout">
                    {filteredUniversities.map((uni: University, idx: number) => (
                      <motion.div
                        layout
                        key={uni.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="group relative bg-[#111114] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all shadow-2xl flex flex-col"
                      >
                        {/* Card Image Wrapper */}
                        <div className="relative h-48 overflow-hidden shrink-0">
                          <Image 
                            src={uni.imageUrl || `https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066&auto=format&fit=crop`} 
                            alt={uni.name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent" />
                          
                          {/* Overlay Badges */}
                          <div className="absolute top-4 left-4 flex flex-col gap-2">
                            <div className="bg-black/50 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                              <Star size={12} className="fill-amber-400 text-amber-400" />
                              <span className="text-[10px] font-black">{uni.rating || '4.5'}</span>
                            </div>
                            {uni.isFeatured && (
                              <div className="bg-indigo-600 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30">
                                Featured
                              </div>
                            )}
                          </div>

                          <div className="absolute top-4 right-4">
                             <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                              <Award size={12} className="text-indigo-400" />
                              <span className="text-[9px] font-black uppercase tracking-widest">{uni.naacGrade || 'A++'} Grade</span>
                            </div>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-6 flex-1 flex flex-col">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-black mb-1 group-hover:text-indigo-400 transition-colors leading-tight line-clamp-2">{uni.name}</h3>
                              <div className="flex items-center gap-1.5 text-white/40 text-xs font-medium">
                                <MapPin size={12} />
                                {uni.location}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mb-6 overflow-hidden mt-auto pt-2">
                             {uni.programs?.slice(0, 2).map((p: any, i: number) => (
                               <span key={i} className="whitespace-nowrap bg-white/5 border border-white/5 px-2 py-1 rounded-md text-[9px] font-bold text-white/46 uppercase tracking-wider truncate max-w-[120px]">
                                 {p.name.split(' ')[0]}
                               </span>
                             ))}
                             {uni.programs?.length > 2 && <span className="text-[9px] font-bold text-white/40 self-center">+{uni.programs.length - 2}</span>}
                          </div>

                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handleApply(uni)}
                              className="flex-1 bg-white text-[#0A0A0F] py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                            >
                              Apply Now <ChevronRight size={14} />
                            </button>
                            <button 
                               onClick={() => router.push(`/student/universities/${uni.id}`)}
                               aria-label={`View ${uni.name} details`}
                               className="w-11 h-11 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl flex items-center justify-center transition-all shrink-0"
                            >
                              <Building2 size={16} className="text-white/40" />
                            </button>
                          </div>

                          {/* Reason for recommendation if applicable */}
                          {viewMode === 'Recommended' && (
                            <div className="mt-4 pt-4 border-t border-white/5">
                              {recommendations.find(r => r.university.id === uni.id)?.matchReasons.slice(0, 1).map((reason, rIdx) => (
                                <div key={rIdx} className="flex items-center gap-2 text-[10px] font-medium text-emerald-400">
                                  <CheckCircle2 size={10} className="shrink-0" /> <span className="truncate">{reason}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </>
        }
        rightPanel={
          <>
            <div className="p-4 border-b border-white/5 flex items-center gap-2">
              <Sparkles size={14} className="text-indigo-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-indigo-400">Context Panel</h2>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
              <AnimatePresence mode="popLayout">
                {aiMode && aiExplanation && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl">
                    <h3 className="text-xs font-black flex items-center gap-2 mb-2 text-indigo-400">AI Search Insights</h3>
                    <p className="text-xs text-white/80 leading-relaxed font-medium mb-3">
                      {aiExplanation}
                    </p>
                    <button onClick={() => { setAiMode(false); setAiExplanation(''); setSearchQuery(''); }} className="text-[10px] uppercase tracking-widest font-bold text-white/40 hover:text-white transition-colors">
                      Clear Insight
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Profile Context */}
              <AIContextCard
                title="Recommendation Engine"
                icon={User}
                value="Active"
                valueColor="text-emerald-400"
              >
                <div className="text-xs text-white/60 leading-relaxed">
                  Your recommendations are continuously optimized based on your deterministic profile score ({profileScore}%) and past interactions.
                </div>
              </AIContextCard>
            </div>
          </>
        }
      />
    </ProtectedRoute>
  )
}
