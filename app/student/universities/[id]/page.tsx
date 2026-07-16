'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { onSnapshot, doc, collection, query, where, or } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Star, Award, ChevronLeft, Clock, CheckCircle2, 
  Building2, Users, Calendar, IndianRupee, BookOpen, ArrowRight,
  AlertCircle, X, ShieldCheck, Zap, Sparkles, Share, Bookmark,
  TrendingUp, PieChart, Video, Check
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { submitApplication } from '@/lib/firebase/applications'
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine'
import { recommendUniversities } from '@/lib/utils/recommendationEngine'

export default function PremiumUniversityDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  
  const { user } = useAuth()
  const studentData = useStudentData()
  const { profile, documents, uniqueApps, savedPrograms, profileScore, universities } = studentData
  
  const [university, setUniversity] = useState<any | null>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [toast, setToast] = useState<any>(null)
  const [selectedProgram, setSelectedProgram] = useState<any | null>(null)

  useEffect(() => {
    if (!id) return
    const unsubUni = onSnapshot(doc(db, 'universities', id), (snap) => {
      if (snap.exists()) setUniversity({ id: snap.id, ...snap.data() })
      setLoading(false)
    })
    return () => unsubUni()
  }, [id])

  useEffect(() => {
    if (!id) return
    const conditions = [where('universityId', '==', id), where('uniId', '==', id)]
    if (university?.name) conditions.push(where('universityName', '==', university.name))
    
    const q = query(collection(db, 'programs'), or(...conditions))
    const unsubProgs = onSnapshot(q, (snap) => {
      const allProgs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      const uniqueProgs = allProgs.filter((p, index, self) => index === self.findIndex((t) => t.id === p.id))
      setPrograms(uniqueProgs)
    })
    return () => unsubProgs()
  }, [id, university?.name])

  const handleApply = async (program: any) => {
    if (!user || !university) return router.push('/auth/login')
    if (!user.isVerified) {
      setToast({ message: 'Complete your profile verification to apply.', type: 'warning' })
      setTimeout(() => setToast(null), 5000)
      return
    }
    setApplying(true)
    try {
      await submitApplication(user.uid, id, university.name, program.name)
      setToast({ message: 'Application submitted securely! ✅', type: 'success' })
      setSelectedProgram(null)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      setToast({ message: 'Error submitting application.', type: 'error' })
    }
    setApplying(false)
  }

  const probData = useMemo(() => {
    if (!university) return null
    return calculateAdmissionProbability({ profile, documents, applications: uniqueApps, savedPrograms, profileScore }, university)
  }, [university, profile, documents, uniqueApps, savedPrograms, profileScore])

  const recData = useMemo(() => {
    if (!universities || universities.length === 0 || !university) return null
    const recs = recommendUniversities(universities, { profile, documents, applications: uniqueApps, savedPrograms, profileScore })
    return recs.find(r => r.university.id === university.id)
  }, [universities, university, profile, documents, uniqueApps, savedPrograms, profileScore])

  if (loading) return (
    <div className="min-h-screen bg-[#09090B] flex items-center justify-center">
      <div className="w-12 h-12 border-2 border-[#6D5DF6]/30 border-t-[#6D5DF6] rounded-full animate-spin" />
    </div>
  )

  if (!university) return (
    <div className="min-h-screen bg-[#09090B] flex flex-col items-center justify-center text-white">
      <h2 className="text-[24px] font-medium mb-4">University not found</h2>
      <button onClick={() => router.back()} className="text-[#6D5DF6] font-medium flex items-center gap-2">
        <ChevronLeft size={16} /> Go Back
      </button>
    </div>
  )

  const overallProb = probData?.overallProbability || 0
  const aiMatch = recData?.overallMatchScore || 75
  const scholarshipMatch = Math.min(100, Math.floor(overallProb * 1.1))
  const profileFit = profileScore || 65

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#09090B] text-white selection:bg-[#6D5DF6]/30 font-sans pb-32">
        
        {/* SECTION 1: HERO */}
        <section className="relative w-full h-[60vh] min-h-[500px]">
          <Image 
            src={university.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'} 
            fill priority className="object-cover" alt={university.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090B] via-[#09090B]/60 to-transparent" />
          
          <button onClick={() => router.back()} className="absolute top-8 left-8 w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors z-20">
            <ChevronLeft size={20} />
          </button>

          <div className="absolute inset-0 flex flex-col justify-end px-8 pb-12 max-w-[1600px] mx-auto w-full z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {university.isVerified && (
                    <div className="bg-[#6D5DF6] px-4 py-2 rounded-full text-[12px] font-medium flex items-center gap-1.5 shadow-lg shadow-[#6D5DF6]/20">
                      <ShieldCheck size={14} /> Verified Partner
                    </div>
                  )}
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-1.5">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-[12px] font-medium">{university.rating || '4.5'} Rating</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[12px] font-medium">
                    NAAC {university.naacGrade || 'A++'}
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full text-[12px] font-medium">
                    {university.type || 'Private'} Institution
                  </div>
                </div>
                
                <h1 className="text-[48px] md:text-[64px] font-medium mb-4 tracking-tight leading-tight">
                  {university.name}
                </h1>
                
                <div className="flex items-center gap-3 text-[16px] text-gray-400">
                  <MapPin size={20} className="text-[#6D5DF6]" /> {university.location}
                </div>
              </div>
              
              <div className="flex items-center gap-4 shrink-0">
                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Share size={18} />
                </button>
                <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                  <Bookmark size={18} />
                </button>
                <button 
                  onClick={() => {
                    const scrollTarget = document.getElementById('programs-section')
                    scrollTarget?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-8 py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 rounded-full text-[14px] font-medium text-white transition-colors"
                >
                  View Programs
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-[1600px] mx-auto px-8 flex flex-col lg:flex-row gap-16 mt-16 relative">
          
          <div className="flex-1 flex flex-col gap-24">
            
            {/* SECTION 2: STUDENT MATCH */}
            <section>
              <h2 className="text-[28px] font-medium mb-8 flex items-center gap-3">
                <Sparkles className="text-[#6D5DF6]" /> Student Match Analysis
              </h2>
              <div className="bg-[#111113] border border-white/5 rounded-[32px] p-12">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-12">
                  <CircularMetric label="Admission Prob" value={overallProb} color="emerald" />
                  <CircularMetric label="AI Match" value={aiMatch} color="blue" />
                  <CircularMetric label="Scholarship Fit" value={scholarshipMatch} color="purple" />
                  <CircularMetric label="Profile Strength" value={profileFit} color="amber" />
                </div>
                
                <div className="bg-[#151519] border border-white/5 rounded-[24px] p-8">
                  <div className="text-[14px] font-medium text-[#6D5DF6] mb-4 flex items-center gap-2">
                    <Zap size={16} /> AI Summary: Why this university fits you
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(recData?.matchReasons || ['Excellent academic alignment', 'Strong placement record for your course', 'High probability of securing a scholarship']).map((reason: string, i: number) => (
                      <div key={i} className="flex items-start gap-3 text-[16px] text-gray-300">
                        <CheckCircle2 size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: QUICK FACTS */}
            <section>
              <h2 className="text-[28px] font-medium mb-8">Quick Facts</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <FactCard label="Starting Fees" value={`₹${university.startingFees || '4.5L'}`} icon={IndianRupee} />
                <FactCard label="Placement Rate" value="94%" icon={TrendingUp} />
                <FactCard label="Campus Size" value="120 Acres" icon={Building2} />
                <FactCard label="Students" value="15,000+" icon={Users} />
                <FactCard label="Faculty" value="800+" icon={Users} />
                <FactCard label="Hostel Capacity" value="4,000" icon={Building2} />
                <FactCard label="Highest Package" value="₹52 LPA" icon={Award} />
                <FactCard label="Average Package" value="₹8.5 LPA" icon={PieChart} />
              </div>
            </section>

            {/* SECTION 4: PROGRAMS */}
            <section id="programs-section">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[28px] font-medium">Available Programs</h2>
                <div className="text-[16px] text-gray-400">{programs.length} Specializations</div>
              </div>
              
              <div className="bg-[#111113] border border-white/5 rounded-[32px] overflow-hidden">
                {programs.length === 0 ? (
                  <div className="p-16 text-center">
                    <BookOpen size={48} className="mx-auto text-gray-600 mb-6" />
                    <h3 className="text-[20px] font-medium mb-2">No programs listed</h3>
                    <p className="text-[14px] text-gray-400">Programs will be added soon.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-white/5 text-[12px] uppercase text-gray-500 bg-[#151519]">
                          <th className="py-6 px-8 font-medium">Degree Program</th>
                          <th className="py-6 px-8 font-medium">Duration</th>
                          <th className="py-6 px-8 font-medium">Seats</th>
                          <th className="py-6 px-8 font-medium">Annual Fees</th>
                          <th className="py-6 px-8 font-medium text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programs.map((prog, i) => (
                          <tr key={prog.id || i} className="border-b border-white/5 hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => setSelectedProgram(prog)}>
                            <td className="py-6 px-8">
                              <div className="text-[16px] font-medium text-white mb-1 group-hover:text-[#6D5DF6] transition-colors">{prog.name}</div>
                              <div className="text-[12px] text-gray-500">{prog.level}</div>
                            </td>
                            <td className="py-6 px-8 text-[14px] text-gray-300">{prog.duration}</td>
                            <td className="py-6 px-8 text-[14px] text-gray-300">{prog.totalSeats || 'TBD'}</td>
                            <td className="py-6 px-8 text-[14px] font-medium text-green-400">₹{(prog.annualFee || prog.fee || 0).toLocaleString()}</td>
                            <td className="py-6 px-8 text-right">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedProgram(prog); }}
                                className="px-6 py-2 bg-white/10 hover:bg-[#6D5DF6] rounded-full text-[12px] font-medium text-white transition-colors"
                              >
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </section>

            {/* SECTION 5: ADMISSION JOURNEY */}
            <section>
              <h2 className="text-[28px] font-medium mb-12">Admission Journey</h2>
              <div className="relative pl-8 border-l border-white/10 ml-4 flex flex-col gap-16">
                <JourneyStep title="Eligibility Check" desc="Review required scores and background." icon={CheckCircle2} />
                <JourneyStep title="Entrance Exam" desc="Clear the university specific or national entrance test." icon={FileTextIcon} />
                <JourneyStep title="Document Submission" desc="Upload transcripts, IDs, and certificates." icon={BookOpen} />
                <JourneyStep title="Application Review" desc="University reviews your comprehensive profile." icon={Clock} />
                <JourneyStep title="Final Admission" desc="Receive offer letter and pay initial fees." icon={Award} />
              </div>
            </section>

            {/* SECTION 6: SCHOLARSHIPS */}
            <section>
              <h2 className="text-[28px] font-medium mb-8">Scholarships</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-[#111113] border border-white/5 rounded-[24px] p-8 flex flex-col hover:border-[#6D5DF6]/30 transition-colors">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-[16px] bg-[#6D5DF6]/10 flex items-center justify-center text-[#6D5DF6]">
                        <Award size={24} />
                      </div>
                      <div className="text-[12px] text-green-400 bg-green-400/10 px-3 py-1 rounded-full font-medium">Up to 50% Tuition</div>
                    </div>
                    <h3 className="text-[20px] font-medium mb-2">Merit Excellence Scholarship {i}</h3>
                    <p className="text-[14px] text-gray-400 mb-8">Awarded to students demonstrating exceptional academic performance in qualifying examinations.</p>
                    <button className="mt-auto px-6 py-3 bg-[#151519] border border-white/10 hover:border-white/20 rounded-full text-[14px] font-medium transition-colors w-fit">
                      Check Eligibility
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 7: CAMPUS EXPERIENCE */}
            <section>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[28px] font-medium">Campus Experience</h2>
                <button className="text-[14px] text-[#6D5DF6] hover:text-white transition-colors">View Gallery →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="md:col-span-2 h-80 relative rounded-[32px] overflow-hidden bg-[#111113] group cursor-pointer">
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 group-hover:bg-black/20 transition-colors">
                     <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                       <Video size={24} className="ml-1" />
                     </div>
                   </div>
                   <Image src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" fill className="object-cover" alt="Campus Video" />
                </div>
                <div className="h-80 relative rounded-[32px] overflow-hidden bg-[#111113]">
                   <Image src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" fill className="object-cover" alt="Library" />
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {['Modern Library', 'Sports Complex', 'Research Labs', 'Smart Classrooms', 'Auditorium', 'Cafeteria', 'Wi-Fi Campus'].map(f => (
                  <div key={f} className="px-4 py-2 bg-[#111113] border border-white/5 rounded-full text-[14px] text-gray-300 flex items-center gap-2">
                    <Check size={14} className="text-[#6D5DF6]" /> {f}
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 8: PLACEMENT INSIGHTS */}
            <section>
              <h2 className="text-[28px] font-medium mb-8">Placement Insights</h2>
              <div className="bg-[#111113] border border-white/5 rounded-[32px] p-12 flex flex-col md:flex-row gap-12 items-center">
                 <div className="w-48 h-48 rounded-full border-[16px] border-[#151519] border-t-[#6D5DF6] border-r-[#6D5DF6] flex items-center justify-center relative shadow-xl">
                   <div className="text-center">
                     <div className="text-[36px] font-medium text-white">94%</div>
                     <div className="text-[12px] text-gray-400">Placed</div>
                   </div>
                 </div>
                 <div className="flex-1 grid grid-cols-2 gap-8 w-full">
                    <div>
                      <div className="text-[14px] text-gray-400 mb-1">Median Package</div>
                      <div className="text-[28px] font-medium text-white">₹8.5 LPA</div>
                    </div>
                    <div>
                      <div className="text-[14px] text-gray-400 mb-1">Highest Package</div>
                      <div className="text-[28px] font-medium text-green-400">₹52 LPA</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-[14px] text-gray-400 mb-3">Top Recruiters</div>
                      <div className="flex gap-4">
                        <div className="h-10 px-6 bg-[#151519] border border-white/5 rounded-full flex items-center justify-center text-[12px] font-medium">Google</div>
                        <div className="h-10 px-6 bg-[#151519] border border-white/5 rounded-full flex items-center justify-center text-[12px] font-medium">Microsoft</div>
                        <div className="h-10 px-6 bg-[#151519] border border-white/5 rounded-full flex items-center justify-center text-[12px] font-medium">Amazon</div>
                      </div>
                    </div>
                 </div>
              </div>
            </section>

            {/* SECTION 9: AI ADVISOR */}
            <section>
              <h2 className="text-[28px] font-medium mb-8 flex items-center gap-3">
                <Sparkles className="text-[#6D5DF6]" /> AI Advisor Verdict
              </h2>
              <div className="bg-[#151519] border border-[#6D5DF6]/20 rounded-[32px] p-12 shadow-2xl">
                <h3 className="text-[24px] font-medium mb-8">Should you apply?</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                  <div>
                    <h4 className="text-[16px] font-medium text-emerald-400 mb-4 flex items-center gap-2"><CheckCircle2 size={16}/> Strengths</h4>
                    <ul className="space-y-3">
                      {(probData?.strengths || ['Good academic record']).slice(0, 3).map((s: string, i: number) => (
                        <li key={i} className="text-[14px] text-gray-300 pl-6 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-emerald-400 before:rounded-full">{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[16px] font-medium text-orange-400 mb-4 flex items-center gap-2"><AlertCircle size={16}/> Needs Improvement</h4>
                    <ul className="space-y-3">
                      {(probData?.weaknesses.length ? probData.weaknesses : ['Entrance exam score pending']).slice(0, 3).map((s: string, i: number) => (
                        <li key={i} className="text-[14px] text-gray-300 pl-6 relative before:absolute before:left-0 before:top-2 before:w-1.5 before:h-1.5 before:bg-orange-400 before:rounded-full">{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="text-[12px] text-gray-400 mb-1">Recommended Action</div>
                    <div className="text-[16px] font-medium text-white">{probData?.improvementSuggestions[0] || 'Apply and secure an early interview slot.'}</div>
                  </div>
                  <button onClick={() => {document.getElementById('programs-section')?.scrollIntoView({behavior: 'smooth'})}} className="px-8 py-4 bg-white text-black rounded-full text-[14px] font-medium hover:bg-gray-200 transition-colors">
                    Start Application
                  </button>
                </div>
              </div>
            </section>

          </div>

          {/* SECTION 11: STICKY RIGHT PANEL */}
          <aside className="hidden lg:block w-[400px] shrink-0">
            <div className="sticky top-12 flex flex-col gap-6">
              
              <div className="bg-[#111113] border border-white/5 rounded-[32px] p-8 flex flex-col shadow-2xl">
                <h3 className="text-[20px] font-medium mb-6">Action Center</h3>
                
                <div className="flex flex-col gap-4 mb-8">
                  <div className="flex justify-between items-center bg-[#151519] border border-white/5 p-4 rounded-[16px]">
                    <div className="text-[14px] text-gray-400">Probability</div>
                    <div className="text-[16px] font-medium text-emerald-400">{overallProb}%</div>
                  </div>
                  <div className="flex justify-between items-center bg-[#151519] border border-white/5 p-4 rounded-[16px]">
                    <div className="text-[14px] text-gray-400">Scholarship Match</div>
                    <div className="text-[16px] font-medium text-[#6D5DF6]">{scholarshipMatch}%</div>
                  </div>
                  <div className="flex justify-between items-center bg-[#151519] border border-white/5 p-4 rounded-[16px]">
                    <div className="text-[14px] text-gray-400">Application Deadline</div>
                    <div className="text-[14px] font-medium text-white">Rolling</div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button onClick={() => {document.getElementById('programs-section')?.scrollIntoView({behavior: 'smooth'})}} className="w-full py-4 bg-[#6D5DF6] hover:bg-[#6D5DF6]/90 rounded-[16px] text-[14px] font-medium text-white transition-colors">
                    Apply Now
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="py-4 bg-[#151519] hover:bg-white/5 border border-white/5 rounded-[16px] text-[14px] font-medium text-white transition-colors">
                      Save
                    </button>
                    <button className="py-4 bg-[#151519] hover:bg-white/5 border border-white/5 rounded-[16px] text-[14px] font-medium text-white transition-colors">
                      Compare
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </aside>

        </div>

        {/* MODAL / TOAST LOGIC REMAINS MINIMAL AT THE END */}
        <AnimatePresence>
          {selectedProgram && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#09090B]/90 backdrop-blur-2xl flex items-center justify-center p-6">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#111113] border border-white/10 rounded-[40px] p-12 max-w-2xl w-full relative shadow-2xl">
                <button onClick={() => setSelectedProgram(null)} className="absolute top-8 right-8 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white/40 hover:text-white transition-colors">
                  <X size={20} />
                </button>
                <div className="mb-8">
                  <div className="text-[#6D5DF6] text-[12px] font-medium mb-3">Program Details</div>
                  <h3 className="text-[36px] font-medium mb-2 leading-tight">{selectedProgram.name}</h3>
                  <div className="text-[16px] text-gray-400">{university.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                   <div className="p-6 bg-[#151519] border border-white/5 rounded-[24px]">
                      <div className="text-[12px] text-gray-400 mb-1">Duration</div>
                      <div className="text-[20px] font-medium">{selectedProgram.duration}</div>
                   </div>
                   <div className="p-6 bg-[#151519] border border-white/5 rounded-[24px]">
                      <div className="text-[12px] text-gray-400 mb-1">Annual Fee</div>
                      <div className="text-[20px] font-medium text-green-400">₹{(selectedProgram.annualFee || selectedProgram.fee || 0).toLocaleString()}</div>
                   </div>
                </div>
                <div className="p-6 bg-[#151519] border border-white/5 rounded-[24px] mb-12">
                   <div className="text-[12px] text-gray-400 mb-2">Eligibility</div>
                   <p className="text-[14px] leading-relaxed text-gray-300">
                     {selectedProgram.eligibility || 'Candidates must have completed their previous qualifying examination with the required minimum percentage as per institutional guidelines.'}
                   </p>
                </div>
                <button 
                  disabled={applying}
                  onClick={() => handleApply(selectedProgram)}
                  className={`w-full py-4 rounded-[20px] text-[14px] font-medium transition-colors ${
                    user?.isVerified ? 'bg-white text-black hover:bg-gray-200' : 'bg-[#151519] text-gray-400 border border-white/10'
                  }`}
                >
                  {applying ? 'Processing...' : (user?.isVerified ? 'Confirm & Submit Application' : 'Verify to Apply')}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full font-medium text-[14px] shadow-2xl flex items-center gap-3 z-[100] ${toast.type === 'success' ? 'bg-emerald-500 text-white' : toast.type === 'warning' ? 'bg-[#6D5DF6] text-white' : 'bg-red-500 text-white'}`}>
              {toast.type === 'warning' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />} 
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ProtectedRoute>
  )
}

function CircularMetric({ label, value, color }: { label: string, value: number, color: 'emerald' | 'blue' | 'purple' | 'amber' }) {
  const colorMap = {
    emerald: 'text-emerald-400 stroke-emerald-400',
    blue: 'text-blue-400 stroke-blue-400',
    purple: 'text-[#6D5DF6] stroke-[#6D5DF6]',
    amber: 'text-amber-400 stroke-amber-400'
  }
  const cls = colorMap[color]
  
  return (
    <div className="flex flex-col items-center text-center gap-4">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" className="stroke-white/5" strokeWidth="2" fill="none" />
          <motion.circle 
            cx="18" cy="18" r="16" 
            className={cls.split(' ')[1]} 
            strokeWidth="2" fill="none" strokeLinecap="round"
            initial={{ strokeDasharray: "100", strokeDashoffset: "100" }}
            animate={{ strokeDashoffset: 100 - value }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-[20px] font-medium ${cls.split(' ')[0]}`}>{value}%</span>
        </div>
      </div>
      <span className="text-[14px] text-gray-400">{label}</span>
    </div>
  )
}

function FactCard({ label, value, icon: Icon }: { label: string, value: string, icon: any }) {
  return (
    <div className="bg-[#111113] border border-white/5 rounded-[24px] p-6 flex flex-col gap-4 hover:border-white/10 transition-colors">
      <Icon size={20} className="text-[#6D5DF6]" />
      <div>
        <div className="text-[20px] font-medium text-white mb-1">{value}</div>
        <div className="text-[12px] text-gray-500">{label}</div>
      </div>
    </div>
  )
}

function JourneyStep({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <div className="relative">
      <div className="absolute -left-[45px] top-0 w-12 h-12 rounded-full bg-[#151519] border border-white/10 flex items-center justify-center text-gray-400">
        <Icon size={16} />
      </div>
      <h3 className="text-[16px] font-medium text-white mb-1">{title}</h3>
      <p className="text-[14px] text-gray-400">{desc}</p>
    </div>
  )
}

const FileTextIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
)
