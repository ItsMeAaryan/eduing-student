'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase/config'
import { 
  doc, 
  onSnapshot, 
  collection, 
  query, 
  where, 
  getDocs,
  or
} from 'firebase/firestore'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  listenUniversity 
} from '@/lib/firebase/universities'
import { submitApplication } from '@/lib/firebase/applications'
import { University, Program } from '@/types/firebase'
import ProtectedRoute from '@/components/ProtectedRoute'
import { 
  MapPin, 
  Star, 
  Award, 
  ChevronLeft, 
  Clock, 
  CheckCircle2, 
  Building2,
  Users,
  Calendar,
  IndianRupee,
  BookOpen,
  ArrowRight,
  AlertCircle,
  X
} from 'lucide-react'

import { useAuth } from '@/hooks/useAuth'

export default function PremiumUniversityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [university, setUniversity] = useState<University | null>(null)
  const [programs, setPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const { user } = useAuth()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null)
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null)

  useEffect(() => {
    if (!id) return

    // Fetch university
    const unsubUni = onSnapshot(
      doc(db, 'universities', id),
      (snap) => {
        if (snap.exists()) {
          setUniversity({ id: snap.id, ...snap.data() } as University)
        }
        setLoading(false)
      }
    )

    return () => unsubUni()
  }, [id])

  useEffect(() => {
    if (!id) return

    // Fetch programs - real-time with multi-field support
    // We include university name as a fallback for data inconsistencies
    const conditions = [
      where('universityId', '==', id),
      where('uniId', '==', id)
    ]

    if (university?.name) {
      conditions.push(where('universityName', '==', university.name))
    }

    const q = query(
      collection(db, 'programs'),
      or(...conditions)
    )

    const unsubProgs = onSnapshot(q, (snap) => {
      const allProgs = snap.docs.map(d => ({
        id: d.id, ...d.data()
      } as Program))
      
      // Deduplicate by ID
      const uniqueProgs = allProgs.filter((p, index, self) =>
        index === self.findIndex((t) => t.id === p.id)
      )
      
      setPrograms(uniqueProgs)
    }, (error) => {
      console.error("Error fetching programs:", error)
    })

    return () => unsubProgs()
  }, [id, university?.name])

  const handleApply = async (program: Program) => {
    if (!user || !university) {
      router.push('/auth/login')
      return
    }

    // VERIFICATION CHECK
    if (!user.isVerified) {
      setToast({ 
        message: 'Complete your profile verification to apply. 📝', 
        type: 'warning' 
      })
      setTimeout(() => setToast(null), 5000)
      return
    }

    setApplying(true)
    try {
      await submitApplication(
        user.uid, 
        id, 
        university.name, 
        program.name
      )
      setToast({ message: 'Application submitted securely! ✅', type: 'success' })
      setSelectedProgram(null)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setToast({ message: 'Error submitting application. Try again.', type: 'error' })
    }
    setApplying(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
    </div>
  )

  if (!university) return (
    <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center text-white">
      <h2 className="text-2xl font-black mb-4">University not found</h2>
      <button onClick={() => router.back()} className="text-indigo-400 font-bold uppercase tracking-widest text-sm flex items-center gap-2">
        <ChevronLeft size={18} /> Go Back
      </button>
    </div>
  )

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-indigo-500/30 font-sans">
        
        {/* HERO BANNER SECTION */}
        <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
          <img 
            src={university.imageUrl || `https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop`} 
            className="w-full h-full object-cover" 
            alt={university.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F] via-[#0A0A0F]/40 to-transparent" />
          
          <div className="absolute inset-0 flex flex-col justify-end px-6 pb-20 max-w-7xl mx-auto w-full">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-4 mb-6">
              <div className="bg-white/10 backdrop-blur-xl border border-white/10 px-4 py-2 rounded-xl flex items-center gap-2">
                <Star size={16} className="fill-amber-400 text-amber-400" />
                <span className="text-sm font-black">{university.rating || '4.5'} Institutional Rating</span>
              </div>
              <div className="bg-indigo-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-600/30">
                NAAC {university.naacGrade || 'A++'} Accredited
              </div>
            </motion.div>
            
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-4xl md:text-7xl font-black mb-4 tracking-tight">
              {university.name}
            </motion.h1>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex items-center gap-4 text-white/60 text-lg md:text-xl font-medium">
              <MapPin size={24} className="text-indigo-400" />
              {university.location}
            </motion.div>
          </div>

          <button onClick={() => router.back()} className="absolute top-10 left-10 w-14 h-14 bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center hover:bg-black/60 transition-all z-20">
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* CONTENT GRID */}
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-16">
            
            {/* LEFT COLUMN: OVERVIEW & PROGRAMS */}
            <div className="space-y-20">
              
              <section className="space-y-8">
                <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Institutional Overview</h2>
                <p className="text-xl leading-relaxed text-white/70 font-medium">
                  {university.name} stands as a beacon of academic excellence in {university.location}, offering a diverse range of programs designed to foster innovation and leadership. As a NAAC {university.naacGrade || 'A++'} certified institution, we maintain the highest standards of education and infrastructure.
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                  {[
                    { label: 'Founded', value: '1984', icon: Calendar },
                    { label: 'Campus Size', value: '120 Acres', icon: Building2 },
                    { label: 'Students', value: '12,000+', icon: Users },
                    { label: 'Alumni', value: '45,000+', icon: Award },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/5 rounded-3xl p-6 text-center">
                      <stat.icon size={20} className="mx-auto mb-4 text-indigo-400" />
                      <div className="text-lg font-black">{stat.value}</div>
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mt-1">{stat.label}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="space-y-12">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black text-white/30 uppercase tracking-[0.3em]">Available Programs</h2>
                  <div className="text-sm font-bold text-white/40">{programs.length} Specializations</div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {programs.length === 0 ? (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center py-20 bg-white/5 rounded-[40px] border border-white/5 border-dashed"
                    >
                      <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <BookOpen size={32} className="text-indigo-400" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No programs added yet.</h3>
                      <p className="text-white/40 max-w-xs mx-auto">Check back soon as we are constantly updating our course catalog.</p>
                    </motion.div>
                  ) : (
                    programs.map((prog, i) => (
                      <motion.div 
                        key={prog.id || i} 
                        whileHover={{ x: 10 }}
                        className="group bg-[#111114] border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-white/10 transition-all cursor-pointer"
                        onClick={() => setSelectedProgram(prog)}
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400">
                            <BookOpen size={24} />
                          </div>
                          <div>
                            <h3 className="text-xl font-black mb-1 group-hover:text-indigo-400 transition-colors">{prog.name}</h3>
                            <div className="flex flex-wrap gap-4 text-white/30 text-[10px] font-bold uppercase tracking-widest">
                              <span className="flex items-center gap-2"><Clock size={12} /> {prog.duration}</span>
                              <span className="flex items-center gap-2"><Award size={12} /> {prog.level}</span>
                              {prog.totalSeats > 0 && <span className="flex items-center gap-2"><Users size={12} /> {prog.totalSeats} Seats</span>}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-8 w-full md:w-auto">
                          <div className="text-right">
                            <div className="text-white/30 text-[10px] font-black uppercase tracking-widest mb-1">Annual Fee</div>
                            <div className="text-xl font-black text-green-400 flex items-center gap-1">
                              <IndianRupee size={16} />
                              {(prog.annualFee || prog.fee || 0).toLocaleString()}
                            </div>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedProgram(prog)
                            }}
                            className="bg-white text-[#0A0A0F] py-3 px-8 rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-white/5"
                          >
                            Details
                          </button>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN: ADMISSION SUMMARY */}
            <aside className="space-y-12">
              <div className="sticky top-24 space-y-8">
                <div className="bg-[#111114] border border-white/10 rounded-[40px] p-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[60px]" />
                  
                  <h3 className="text-2xl font-black mb-8">Admission Dossier</h3>
                  
                  <div className="space-y-8 mb-12">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-black mb-1">Verified Institution</div>
                        <p className="text-white/40 text-xs leading-relaxed">Direct synchronization with the official University Management System.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <Clock size={24} className="text-indigo-400 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-black mb-1">Instant Review</div>
                        <p className="text-white/40 text-xs leading-relaxed">Applications submitted via EDUING are prioritized for immediate evaluation.</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 bg-white/5 rounded-3xl border border-white/5 mb-10">
                    <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-4">Application Window</div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold">Session 2024-25</div>
                      <div className="bg-green-500/10 text-green-500 text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">Open</div>
                    </div>
                  </div>

                  <button 
                    onClick={() => {
                      if (programs.length > 0) setSelectedProgram(programs[0])
                    }}
                    className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl ${
                      user?.isVerified 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-indigo-500/40 hover:scale-[1.02]' 
                        : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                    }`}
                  >
                    {user?.isVerified ? 'Start Application' : 'Verify to Apply'} <ArrowRight size={18} />
                  </button>
                  {!user?.isVerified && (
                    <p className="text-center text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-4 cursor-pointer hover:underline" onClick={() => router.push('/student/profile')}>
                      Verification Required →
                    </p>
                  )}
                </div>

                <div className="bg-white/5 border border-white/5 rounded-3xl p-8">
                   <h4 className="text-xs font-black text-white/30 uppercase tracking-widest mb-6 text-center">Assistance</h4>
                   <p className="text-center text-sm text-white/50 mb-8 leading-relaxed">Need help with eligibility or documentation?</p>
                   <button className="w-full py-4 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-white/5 transition-all">
                     Talk to Advisor
                   </button>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* PROGRAM DETAIL MODAL */}
        <AnimatePresence>
          {selectedProgram && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#0A0A0F]/90 backdrop-blur-2xl flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#111114] border border-white/10 rounded-[40px] p-10 max-w-2xl w-full relative shadow-[0_0_100px_rgba(99,102,241,0.2)]">
                <button onClick={() => setSelectedProgram(null)} className="absolute top-8 right-8 text-white/20 hover:text-white transition-all">
                  <X size={24} />
                </button>

                <div className="mb-10">
                  <div className="text-indigo-400 text-xs font-black uppercase tracking-widest mb-4">Program Specification</div>
                  <h3 className="text-4xl font-black mb-2">{selectedProgram.name}</h3>
                  <div className="text-white/40 font-medium text-lg">{university.name}</div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Duration</div>
                      <div className="text-lg font-black">{selectedProgram.duration}</div>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Annual Fee</div>
                      <div className="text-lg font-black text-green-400">₹{(selectedProgram.annualFee || selectedProgram.fee || 0).toLocaleString()}</div>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Total Seats</div>
                      <div className="text-lg font-black">{selectedProgram.totalSeats || 'TBD'}</div>
                   </div>
                   <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-2">Entrance Exam</div>
                      <div className="text-lg font-black">{selectedProgram.entranceExam || (selectedProgram.hasEntranceExam ? 'Required' : 'Direct Admission')}</div>
                   </div>
                </div>

                <div className="space-y-6 mb-12">
                  <h4 className="text-xs font-black text-white/30 uppercase tracking-widest">Core Eligibility</h4>
                  <div className="flex items-start gap-4 p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
                     <AlertCircle size={20} className="text-amber-500 flex-shrink-0 mt-1" />
                     <p className="text-sm font-medium text-amber-500/80 leading-relaxed">
                       {selectedProgram.eligibility || 'Candidates must have completed their previous qualifying examination with the required minimum percentage as per institutional guidelines.'}
                     </p>
                  </div>
                </div>

                <button 
                  disabled={applying}
                  onClick={() => handleApply(selectedProgram)}
                  className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl ${
                    user?.isVerified 
                      ? 'bg-white text-[#0A0A0F] shadow-white/10 hover:bg-indigo-50' 
                      : 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  }`}
                >
                  {applying ? 'Processing...' : (user?.isVerified ? 'Confirm & Submit Application' : 'Verify to Apply')}
                </button>
                {!user?.isVerified && (
                  <p className="text-center text-[10px] font-black uppercase tracking-widest text-white/40 mt-6 cursor-pointer hover:text-white transition-colors" onClick={() => router.push('/student/profile')}>
                    Go to Verification Center →
                  </p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOAST */}
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, bottom: 20, x: '-50%' }} animate={{ opacity: 1, bottom: 40, x: '-50%' }} exit={{ opacity: 0, bottom: 20, x: '-50%' }} className={`fixed left-1/2 px-10 py-5 rounded-full font-black text-sm uppercase tracking-widest shadow-2xl flex items-center gap-4 z-[100] ${toast.type === 'success' ? 'bg-green-500 text-white' : toast.type === 'warning' ? 'bg-indigo-600 text-white' : 'bg-red-500 text-white'}`}>
              {toast.type === 'warning' ? <AlertCircle size={24} /> : <CheckCircle2 size={24} />} 
              {toast.message}
              {!user?.isVerified && toast.type === 'warning' && (
                <button onClick={() => router.push('/student/profile')} className="ml-4 bg-white/20 px-4 py-2 rounded-lg text-[10px] hover:bg-white/30 transition-all">Verify Now</button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  )
}


