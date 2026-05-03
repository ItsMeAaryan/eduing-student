'use client'

import React, { useEffect, useState, useMemo } from 'react'
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
import { 
  listenUniversitiesFiltered 
} from '@/lib/firebase/universities'
import { useAuth } from '@/hooks/useAuth'
import { University } from '@/types/firebase'

const NAAC_GRADES = ['A++', 'A+', 'A', 'B++', 'B+', 'B']
const RATINGS = [4.5, 4.0, 3.5, 3.0]
const STATES = ['Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu', 'Rajasthan', 'Kerala', 'Punjab', 'Uttar Pradesh']

export default function PremiumDiscoverPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [activeLevel, setActiveLevel] = useState<'All' | 'UG' | 'PG'>('All')
  const [selectedState, setSelectedState] = useState('')
  const [minRating, setMinRating] = useState(0)
  const [selectedNAAC, setSelectedNAAC] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setLoading(true)
    const unsub = listenUniversitiesFiltered(
      {
        level: activeLevel === 'All' ? undefined : activeLevel,
        location: selectedState || undefined,
        minRating: minRating || undefined,
        naacGrade: selectedNAAC || undefined,
      },
      (unis) => {
        console.log("UNIVERSITIES:", unis.length)
        setUniversities(unis)
        setLoading(false)
        setError(null)
      },
      (err) => {
        console.error("FIRESTORE ERROR:", err)
        setError(err.message)
        setLoading(false)
      }
    )

    return () => unsub()
  }, [activeLevel, selectedState, minRating, selectedNAAC])


  // Client-side search for name/program (partial match)
  const filteredUniversities = useMemo(() => {
    if (!searchQuery) return universities
    return universities.filter(uni => 
      uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uni.programs.some(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [universities, searchQuery])


  const handleApply = (uni: University) => {
    if (!user) {
      router.push('/auth/login')
      return
    }

    // Free exploration - allow viewing university details
    router.push(`/student/universities/${uni.id}`)
  }

  if (loading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '400px',
      flexDirection: 'column',
      gap: '16px',
    }}>
      <div style={{
        width: '40px', height: '40px',
        border: '3px solid rgba(79,70,229,0.3)',
        borderTop: '3px solid #4F46E5',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}/>
      <p style={{color:'rgba(255,255,255,0.4)'}}>
        Loading universities...
      </p>
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg) } 
        }
      `}</style>
    </div>
  )

  if (error) return (
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
        Check 'universities' collection in Firebase.
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
      <div className="min-h-screen bg-[#08080A] text-white font-sans selection:bg-indigo-500/30 relative z-10">
        
        {/* COMPACT HEADER */}
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-[28px] font-extrabold text-[#FAFAFA] mb-1 tracking-tight">
                Discover Universities
              </h1>
              <p className="text-white/40 text-sm">
                {universities.length} institutions found in database
              </p>
            </div>

            {/* Compact Search & Filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-80 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input 
                  type="text" 
                  placeholder="Search institutions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/5 rounded-2xl pl-12 pr-4 py-3 text-sm placeholder:text-white/10 focus:border-indigo-500/30 focus:bg-white/[0.05] outline-none transition-all"
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center justify-center w-12 h-12 bg-white/[0.03] border border-white/5 rounded-2xl text-white/40 hover:text-white transition-all">
                <SlidersHorizontal size={20} />
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-12">
            
            {/* FILTER SIDEBAR (Desktop) */}
            <aside className="hidden lg:block space-y-10">
              <div className="sticky top-24">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black">Refine Results</h3>
                  <button onClick={() => {
                    setActiveLevel('All'); setSelectedState(''); setMinRating(0); setSelectedNAAC('');
                  }} className="text-[10px] font-black uppercase text-white/30 hover:text-white transition-all">Reset All</button>
                </div>

                <div className="space-y-8">
                  {/* Level Toggle */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Academic Level</label>
                    <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                      {['All', 'UG', 'PG'].map(l => (
                        <button key={l} onClick={() => setActiveLevel(l as any)} className={`py-2 rounded-lg text-xs font-bold transition-all ${activeLevel === l ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-white/40 hover:text-white'}`}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Location Dropdown */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">State / Region</label>
                    <select value={selectedState} onChange={e => setSelectedState(e.target.value)} className="w-full bg-[#111114] border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500/50 transition-all appearance-none cursor-pointer">
                      <option value="">All Regions</option>
                      {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* Rating Filter */}
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">Minimum Rating</label>
                    <div className="space-y-2">
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
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-widest">NAAC Accreditation</label>
                    <div className="flex flex-wrap gap-2">
                      {NAAC_GRADES.map(g => (
                        <button key={g} onClick={() => setSelectedNAAC(selectedNAAC === g ? '' : g)} className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${selectedNAAC === g ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/20' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </aside>

            {/* MAIN CONTENT GRID */}
            <main className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-white/30 uppercase tracking-[0.2em]">
                  {loading ? 'Searching Database...' : `${filteredUniversities.length} Institutions Found`}
                </h2>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[1,2,3,4].map(i => (
                    <div key={i} className="h-[400px] bg-white/5 animate-pulse rounded-[40px] border border-white/5" />
                  ))}
                </div>
              ) : error ? (
                <div className="py-32 text-center bg-[#111114] border border-white/5 rounded-[40px] px-8">
                  <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <AlertCircle size={32} className="text-red-500" />
                  </div>
                  <h3 className="text-2xl font-black mb-4">Sync Failure</h3>
                  <p className="text-white/40 mb-10 max-w-md mx-auto">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="bg-indigo-600 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20"
                  >
                    Force Sync (Retry)
                  </button>
                </div>
              ) : filteredUniversities.length === 0 ? (
                <div className="py-32 text-center bg-[#111114] border border-white/5 rounded-[40px]">
                  <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5">
                    <Search size={40} className="text-white/10" />
                  </div>
                  <h3 className="text-2xl font-black mb-2">No institutions found</h3>
                  <p className="text-white/30">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                  <AnimatePresence mode="popLayout">
                    {filteredUniversities.map((uni, idx) => (
                      <motion.div
                        layout
                        key={uni.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        className="group relative bg-[#111114] border border-white/5 rounded-3xl overflow-hidden hover:border-white/10 transition-all shadow-2xl"
                      >
                        {/* Card Image Wrapper */}
                        <div className="relative h-60 overflow-hidden">
                          <img 
                            src={uni.imageUrl || `https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2066&auto=format&fit=crop`} 
                            alt={uni.name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#111114] via-transparent to-transparent" />
                          
                          {/* Overlay Badges */}
                          <div className="absolute top-6 left-6 flex flex-col gap-2">
                            <div className="bg-black/50 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                              <Star size={14} className="fill-amber-400 text-amber-400" />
                              <span className="text-xs font-black">{uni.rating || '4.5'}</span>
                            </div>
                            {uni.isFeatured && (
                              <div className="bg-indigo-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30">
                                Featured
                              </div>
                            )}
                          </div>

                          <div className="absolute top-6 right-6">
                             <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                              <Award size={14} className="text-indigo-400" />
                              <span className="text-[10px] font-black uppercase tracking-widest">{uni.naacGrade || 'A++'} Grade</span>
                            </div>
                          </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-8">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-2xl font-black mb-1 group-hover:text-indigo-400 transition-colors">{uni.name}</h3>
                              <div className="flex items-center gap-2 text-white/40 text-sm font-medium">
                                <MapPin size={14} />
                                {uni.location}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 mb-8 overflow-hidden">
                             {uni.programs?.slice(0, 3).map((p, i) => (
                               <span key={i} className="whitespace-nowrap bg-white/5 border border-white/5 px-3 py-1 rounded-lg text-[10px] font-bold text-white/30 uppercase tracking-wider">
                                 {p.name.split(' ')[0]}
                               </span>
                             ))}
                             {uni.programs?.length > 3 && <span className="text-[10px] font-bold text-white/20">+{uni.programs.length - 3}</span>}
                          </div>

                          <div className="flex items-center gap-4">
                            <button 
                              onClick={() => handleApply(uni)}
                              className="flex-1 bg-white text-[#0A0A0F] py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                            >
                              Apply Now <ChevronRight size={18} />
                            </button>
                            <button 
                               onClick={() => router.push(`/student/universities/${uni.id}`)}
                               className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl flex items-center justify-center transition-all"
                            >
                              <Building2 size={20} className="text-white/40" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </main>

          </div>
        </div>

        {/* MOBILE FILTERS MODAL */}
        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 lg:hidden bg-black/90 backdrop-blur-2xl flex flex-col p-8">
               <div className="flex items-center justify-between mb-12">
                 <h2 className="text-3xl font-black">Filters</h2>
                 <button onClick={() => setShowFilters(false)} className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                   <X size={24} />
                 </button>
               </div>

               <div className="flex-1 overflow-y-auto space-y-12">
                  {/* MOBILE FILTER REPLICATION */}
                  <div className="space-y-4">
                    <label className="text-xs font-black text-white/30 uppercase tracking-widest">Academic Level</label>
                    <div className="grid grid-cols-3 gap-2">
                       {['All', 'UG', 'PG'].map(l => (
                         <button key={l} onClick={() => { setActiveLevel(l as any); setShowFilters(false); }} className={`py-4 rounded-2xl text-sm font-black transition-all ${activeLevel === l ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/30'}`}>
                           {l}
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-black text-white/30 uppercase tracking-widest">Select Region</label>
                    <div className="grid grid-cols-2 gap-2">
                       {STATES.map(s => (
                         <button key={s} onClick={() => { setSelectedState(s); setShowFilters(false); }} className={`py-4 rounded-2xl text-xs font-black transition-all ${selectedState === s ? 'bg-indigo-600 text-white' : 'bg-white/5 text-white/30'}`}>
                           {s}
                         </button>
                       ))}
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  )
}
