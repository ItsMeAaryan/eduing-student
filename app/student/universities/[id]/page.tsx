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
import { Card, Button, Badge, H2, H3, H4, Body, Small, Caption, MetricCard } from '@/components/ui/design-system'

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
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-[48px] h-[48px] border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!university) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center text-text-primary">
      <H2 className="mb-16">University not found</H2>
      <Button onClick={() => router.back()} variant="secondary" className="flex items-center gap-8">
        <ChevronLeft size={16} strokeWidth={1.8} /> Go Back
      </Button>
    </div>
  )

  const overallProb = probData?.overallProbability || 0
  const aiMatch = recData?.overallMatchScore || 75
  const scholarshipMatch = Math.min(100, Math.floor(overallProb * 1.1))
  const profileFit = profileScore || 65

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-background text-text-primary selection:bg-primary/30 pb-64">
        
        {/* SECTION 1: HERO */}
        <section className="relative w-full h-[60vh] min-h-[500px]">
          <Image 
            src={university.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'} 
            fill priority className="object-cover" alt={university.name} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          
          <button onClick={() => router.back()} className="absolute top-32 left-32 w-[48px] h-[48px] bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center hover:bg-black/60 transition-colors z-20 text-white">
            <ChevronLeft size={20} strokeWidth={1.8} />
          </button>

          <div className="absolute inset-0 flex flex-col justify-end px-32 pb-48 max-w-[1600px] mx-auto w-full z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-32">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-12 mb-24">
                  {university.isVerified && (
                    <div className="bg-primary px-16 py-8 rounded-full text-caption font-bold text-white flex items-center gap-8 shadow-sm">
                      <ShieldCheck size={14} strokeWidth={1.8} /> Verified Partner
                    </div>
                  )}
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 px-16 py-8 rounded-full flex items-center gap-8 text-white">
                    <Star size={14} strokeWidth={1.8} className="text-amber-400 fill-amber-400" />
                    <span className="text-caption font-bold">{university.rating || '4.5'} Rating</span>
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 px-16 py-8 rounded-full text-caption font-bold text-white">
                    NAAC {university.naacGrade || 'A++'}
                  </div>
                  <div className="bg-white/10 backdrop-blur-md border border-white/10 px-16 py-8 rounded-full text-caption font-bold text-white">
                    {university.type || 'Private'} Institution
                  </div>
                </div>
                
                <h1 className="text-[48px] md:text-[64px] font-medium mb-16 tracking-tight leading-tight text-white">
                  {university.name}
                </h1>
                
                <div className="flex items-center gap-12 text-body text-gray-300">
                  <MapPin size={20} strokeWidth={1.8} className="text-primary" /> {university.location}
                </div>
              </div>
              
              <div className="flex items-center gap-16 shrink-0">
                <button className="w-[48px] h-[48px] rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                  <Share size={18} strokeWidth={1.8} />
                </button>
                <button className="w-[48px] h-[48px] rounded-full bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                  <Bookmark size={18} strokeWidth={1.8} />
                </button>
                <Button 
                  onClick={() => {
                    const scrollTarget = document.getElementById('programs-section')
                    scrollTarget?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  variant="primary"
                >
                  View Programs
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-[1600px] mx-auto px-32 flex flex-col lg:flex-row gap-64 mt-64 relative">
          
          <div className="flex-1 flex flex-col gap-64">
            
            {/* SECTION 2: STUDENT MATCH */}
            <section>
              <H3 className="mb-32 flex items-center gap-12">
                <Sparkles className="text-primary" size={24} strokeWidth={1.8} /> Student Match Analysis
              </H3>
              <Card className="!p-48">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-48 mb-48">
                  <CircularMetric label="Admission Prob" value={overallProb} color="emerald" />
                  <CircularMetric label="AI Match" value={aiMatch} color="blue" />
                  <CircularMetric label="Scholarship Fit" value={scholarshipMatch} color="purple" />
                  <CircularMetric label="Profile Strength" value={profileFit} color="amber" />
                </div>
                
                <div className="bg-hover border border-border rounded-card p-32">
                  <div className="text-small font-bold text-primary mb-16 flex items-center gap-8">
                    <Zap size={16} strokeWidth={1.8} /> AI Summary: Why this university fits you
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                    {(recData?.matchReasons || ['Excellent academic alignment', 'Strong placement record for your course', 'High probability of securing a scholarship']).map((reason: string, i: number) => (
                      <div key={i} className="flex items-start gap-12 text-body text-text-secondary">
                        <CheckCircle2 size={20} strokeWidth={1.8} className="text-success shrink-0 mt-[2px]" />
                        <span>{reason}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </section>

            {/* SECTION 3: QUICK FACTS */}
            <section>
              <H3 className="mb-32">Quick Facts</H3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-24">
                <MetricCard label="Starting Fees" value={`₹${university.startingFees || '4.5L'}`} icon={IndianRupee} />
                <MetricCard label="Placement Rate" value="94%" icon={TrendingUp} />
                <MetricCard label="Campus Size" value="120 Acres" icon={Building2} />
                <MetricCard label="Students" value="15,000+" icon={Users} />
                <MetricCard label="Faculty" value="800+" icon={Users} />
                <MetricCard label="Hostel Capacity" value="4,000" icon={Building2} />
                <MetricCard label="Highest Package" value="₹52 LPA" icon={Award} />
                <MetricCard label="Average Package" value="₹8.5 LPA" icon={PieChart} />
              </div>
            </section>

            {/* SECTION 4: PROGRAMS */}
            <section id="programs-section">
              <div className="flex justify-between items-center mb-32">
                <H3>Available Programs</H3>
                <Body className="text-text-secondary">{programs.length} Specializations</Body>
              </div>
              
              <Card className="!p-0 overflow-hidden shadow-sm">
                {programs.length === 0 ? (
                  <div className="p-64 text-center">
                    <BookOpen size={48} strokeWidth={1.8} className="mx-auto text-text-secondary mb-24" />
                    <H4 className="mb-8">No programs listed</H4>
                    <Body className="text-text-secondary">Programs will be added soon.</Body>
                  </div>
                ) : (
                  <div className="overflow-x-auto no-scrollbar">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border text-caption uppercase text-text-secondary bg-hover">
                          <th className="py-24 px-32 font-bold">Degree Program</th>
                          <th className="py-24 px-32 font-bold">Duration</th>
                          <th className="py-24 px-32 font-bold">Seats</th>
                          <th className="py-24 px-32 font-bold">Annual Fees</th>
                          <th className="py-24 px-32 font-bold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {programs.map((prog, i) => (
                          <tr key={prog.id || i} className="border-b border-border hover:bg-hover transition-colors group cursor-pointer" onClick={() => setSelectedProgram(prog)}>
                            <td className="py-24 px-32">
                              <div className="text-body font-medium text-text-primary mb-4 group-hover:text-primary transition-colors">{prog.name}</div>
                              <div className="text-small text-text-secondary">{prog.level}</div>
                            </td>
                            <td className="py-24 px-32 text-small text-text-secondary">{prog.duration}</td>
                            <td className="py-24 px-32 text-small text-text-secondary">{prog.totalSeats || 'TBD'}</td>
                            <td className="py-24 px-32 text-small font-bold text-success">₹{(prog.annualFee || prog.fee || 0).toLocaleString()}</td>
                            <td className="py-24 px-32 text-right">
                              <Button 
                                onClick={(e) => { e.stopPropagation(); setSelectedProgram(prog); }}
                                variant="secondary"
                                size="sm"
                              >
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </section>

            {/* SECTION 5: ADMISSION JOURNEY */}
            <section>
              <H3 className="mb-48">Admission Journey</H3>
              <div className="relative pl-32 border-l border-border ml-16 flex flex-col gap-64">
                <JourneyStep title="Eligibility Check" desc="Review required scores and background." icon={CheckCircle2} />
                <JourneyStep title="Entrance Exam" desc="Clear the university specific or national entrance test." icon={FileTextIcon} />
                <JourneyStep title="Document Submission" desc="Upload transcripts, IDs, and certificates." icon={BookOpen} />
                <JourneyStep title="Application Review" desc="University reviews your comprehensive profile." icon={Clock} />
                <JourneyStep title="Final Admission" desc="Receive offer letter and pay initial fees." icon={Award} />
              </div>
            </section>

            {/* SECTION 6: SCHOLARSHIPS */}
            <section>
              <H3 className="mb-32">Scholarships</H3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-24">
                {[1, 2].map((i) => (
                  <Card key={i} className="flex flex-col hover:border-primary/50 transition-colors shadow-sm">
                    <div className="flex justify-between items-start mb-24">
                      <div className="w-[48px] h-[48px] rounded-card bg-primary/10 flex items-center justify-center text-primary">
                        <Award size={24} strokeWidth={1.8} />
                      </div>
                      <Badge variant="success">Up to 50% Tuition</Badge>
                    </div>
                    <H4 className="mb-8">Merit Excellence Scholarship {i}</H4>
                    <Small className="text-text-secondary mb-32">Awarded to students demonstrating exceptional academic performance in qualifying examinations.</Small>
                    <Button variant="secondary" className="mt-auto w-fit">
                      Check Eligibility
                    </Button>
                  </Card>
                ))}
              </div>
            </section>

            {/* SECTION 7: CAMPUS EXPERIENCE */}
            <section>
              <div className="flex justify-between items-center mb-32">
                <H3>Campus Experience</H3>
                <button className="text-small font-bold text-primary hover:text-primary/80 transition-colors">View Gallery →</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-24 mb-24">
                <div className="md:col-span-2 h-[320px] relative rounded-[32px] overflow-hidden bg-hover group cursor-pointer">
                   <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10 group-hover:bg-black/20 transition-colors">
                     <div className="w-[64px] h-[64px] bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                       <Video size={24} strokeWidth={1.8} className="ml-4" />
                     </div>
                   </div>
                   <Image src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop" fill className="object-cover" alt="Campus Video" />
                </div>
                <div className="h-[320px] relative rounded-[32px] overflow-hidden bg-hover">
                   <Image src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" fill className="object-cover" alt="Library" />
                </div>
              </div>
              <div className="flex flex-wrap gap-12">
                {['Modern Library', 'Sports Complex', 'Research Labs', 'Smart Classrooms', 'Auditorium', 'Cafeteria', 'Wi-Fi Campus'].map(f => (
                  <div key={f} className="px-16 py-8 bg-background border border-border rounded-full text-small text-text-secondary flex items-center gap-8 shadow-sm">
                    <Check size={14} strokeWidth={1.8} className="text-primary" /> {f}
                  </div>
                ))}
              </div>
            </section>

            {/* SECTION 8: PLACEMENT INSIGHTS */}
            <section>
              <H3 className="mb-32">Placement Insights</H3>
              <Card className="!p-48 flex flex-col md:flex-row gap-48 items-center shadow-sm">
                 <div className="w-[192px] h-[192px] rounded-full border-[16px] border-hover border-t-primary border-r-primary flex items-center justify-center relative shadow-sm">
                   <div className="text-center">
                     <div className="text-[36px] font-medium text-text-primary">94%</div>
                     <Caption className="text-text-secondary font-bold uppercase tracking-widest">Placed</Caption>
                   </div>
                 </div>
                 <div className="flex-1 grid grid-cols-2 gap-32 w-full">
                    <div>
                      <Caption className="text-text-secondary font-bold uppercase tracking-widest mb-4">Median Package</Caption>
                      <H2>₹8.5 LPA</H2>
                    </div>
                    <div>
                      <Caption className="text-text-secondary font-bold uppercase tracking-widest mb-4">Highest Package</Caption>
                      <H2 className="text-success">₹52 LPA</H2>
                    </div>
                    <div className="col-span-2">
                      <Caption className="text-text-secondary font-bold uppercase tracking-widest mb-12">Top Recruiters</Caption>
                      <div className="flex gap-16">
                        <div className="h-[40px] px-24 bg-hover border border-border rounded-full flex items-center justify-center text-small font-bold">Google</div>
                        <div className="h-[40px] px-24 bg-hover border border-border rounded-full flex items-center justify-center text-small font-bold">Microsoft</div>
                        <div className="h-[40px] px-24 bg-hover border border-border rounded-full flex items-center justify-center text-small font-bold">Amazon</div>
                      </div>
                    </div>
                 </div>
              </Card>
            </section>

            {/* SECTION 9: AI ADVISOR */}
            <section>
              <H3 className="mb-32 flex items-center gap-12">
                <Sparkles className="text-primary" size={24} strokeWidth={1.8} /> AI Advisor Verdict
              </H3>
              <Card className="!p-48 border-primary/20 shadow-sm">
                <H4 className="mb-32">Should you apply?</H4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-48">
                  <div>
                    <Body className="font-bold text-success mb-16 flex items-center gap-8"><CheckCircle2 size={16} strokeWidth={1.8}/> Strengths</Body>
                    <ul className="space-y-12">
                      {(probData?.strengths || ['Good academic record']).slice(0, 3).map((s: string, i: number) => (
                        <li key={i} className="text-small text-text-secondary pl-24 relative before:absolute before:left-0 before:top-[6px] before:w-[6px] before:h-[6px] before:bg-success before:rounded-full">{s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <Body className="font-bold text-warning mb-16 flex items-center gap-8"><AlertCircle size={16} strokeWidth={1.8}/> Needs Improvement</Body>
                    <ul className="space-y-12">
                      {(probData?.weaknesses.length ? probData.weaknesses : ['Entrance exam score pending']).slice(0, 3).map((s: string, i: number) => (
                        <li key={i} className="text-small text-text-secondary pl-24 relative before:absolute before:left-0 before:top-[6px] before:w-[6px] before:h-[6px] before:bg-warning before:rounded-full">{s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="mt-32 pt-32 border-t border-border flex flex-col md:flex-row items-center justify-between gap-24">
                  <div>
                    <Caption className="text-text-secondary font-bold uppercase tracking-widest mb-4">Recommended Action</Caption>
                    <Body className="font-bold text-text-primary">{probData?.improvementSuggestions[0] || 'Apply and secure an early interview slot.'}</Body>
                  </div>
                  <Button onClick={() => {document.getElementById('programs-section')?.scrollIntoView({behavior: 'smooth'})}} variant="primary">
                    Start Application
                  </Button>
                </div>
              </Card>
            </section>

          </div>

          {/* SECTION 11: STICKY RIGHT PANEL */}
          <aside className="hidden lg:block w-[400px] shrink-0">
            <div className="sticky top-[80px] flex flex-col gap-24">
              
              <Card className="!p-32 flex flex-col shadow-sm">
                <H4 className="mb-24">Action Center</H4>
                
                <div className="flex flex-col gap-16 mb-32">
                  <div className="flex justify-between items-center bg-hover border border-border p-16 rounded-[16px]">
                    <Small className="text-text-secondary font-bold">Probability</Small>
                    <Body className="font-bold text-success">{overallProb}%</Body>
                  </div>
                  <div className="flex justify-between items-center bg-hover border border-border p-16 rounded-[16px]">
                    <Small className="text-text-secondary font-bold">Scholarship Match</Small>
                    <Body className="font-bold text-primary">{scholarshipMatch}%</Body>
                  </div>
                  <div className="flex justify-between items-center bg-hover border border-border p-16 rounded-[16px]">
                    <Small className="text-text-secondary font-bold">Application Deadline</Small>
                    <Small className="font-bold text-text-primary">Rolling</Small>
                  </div>
                </div>

                <div className="flex flex-col gap-12">
                  <Button onClick={() => {document.getElementById('programs-section')?.scrollIntoView({behavior: 'smooth'})}} variant="primary" className="w-full">
                    Apply Now
                  </Button>
                  <div className="grid grid-cols-2 gap-12">
                    <Button variant="secondary">
                      Save
                    </Button>
                    <Button variant="secondary">
                      Compare
                    </Button>
                  </div>
                </div>
              </Card>

            </div>
          </aside>

        </div>

        {/* MODAL / TOAST LOGIC */}
        <AnimatePresence>
          {selectedProgram && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#141414]/40 backdrop-blur-sm flex items-center justify-center p-24">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-background border border-border rounded-card p-48 max-w-2xl w-full relative shadow-2xl">
                <button onClick={() => setSelectedProgram(null)} className="absolute top-32 right-32 w-[40px] h-[40px] bg-hover rounded-full flex items-center justify-center text-text-secondary hover:text-text-primary transition-colors">
                  <X size={20} strokeWidth={1.8} />
                </button>
                <div className="mb-32">
                  <Caption className="text-primary font-bold uppercase tracking-widest mb-12">Program Details</Caption>
                  <H3 className="mb-8 leading-tight">{selectedProgram.name}</H3>
                  <Body className="text-text-secondary">{university.name}</Body>
                </div>
                <div className="grid grid-cols-2 gap-16 mb-32">
                   <div className="p-24 bg-hover border border-border rounded-card">
                      <Caption className="text-text-secondary font-bold uppercase tracking-widest mb-4">Duration</Caption>
                      <H4>{selectedProgram.duration}</H4>
                   </div>
                   <div className="p-24 bg-hover border border-border rounded-card">
                      <Caption className="text-text-secondary font-bold uppercase tracking-widest mb-4">Annual Fee</Caption>
                      <H4 className="text-success">₹{(selectedProgram.annualFee || selectedProgram.fee || 0).toLocaleString()}</H4>
                   </div>
                </div>
                <div className="p-24 bg-hover border border-border rounded-card mb-48">
                   <Caption className="text-text-secondary font-bold uppercase tracking-widest mb-8">Eligibility</Caption>
                   <Small className="leading-relaxed text-text-secondary">
                     {selectedProgram.eligibility || 'Candidates must have completed their previous qualifying examination with the required minimum percentage as per institutional guidelines.'}
                   </Small>
                </div>
                <Button 
                  disabled={applying}
                  onClick={() => handleApply(selectedProgram)}
                  variant="primary"
                  className="w-full"
                >
                  {applying ? 'Processing...' : (user?.isVerified ? 'Confirm & Submit Application' : 'Verify to Apply')}
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className={`fixed bottom-32 left-1/2 -translate-x-1/2 px-32 py-16 rounded-full font-medium text-small shadow-sm flex items-center gap-12 z-[100] ${toast.type === 'success' ? 'bg-success text-white' : toast.type === 'warning' ? 'bg-primary text-white' : 'bg-danger text-white'}`}>
              {toast.type === 'warning' ? <AlertCircle size={18} strokeWidth={1.8} /> : <CheckCircle2 size={18} strokeWidth={1.8} />} 
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
    emerald: 'text-success stroke-success',
    blue: 'text-blue-500 stroke-blue-500',
    purple: 'text-primary stroke-primary',
    amber: 'text-warning stroke-warning'
  }
  const cls = colorMap[color]
  
  return (
    <div className="flex flex-col items-center text-center gap-16">
      <div className="relative w-[96px] h-[96px]">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="16" className="stroke-border" strokeWidth="2" fill="none" />
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
          <span className={`text-[20px] font-bold ${cls.split(' ')[0]}`}>{value}%</span>
        </div>
      </div>
      <Small className="text-text-secondary font-bold">{label}</Small>
    </div>
  )
}

function JourneyStep({ title, desc, icon: Icon }: { title: string, desc: string, icon: any }) {
  return (
    <div className="relative">
      <div className="absolute -left-[56px] top-0 w-[48px] h-[48px] rounded-full bg-hover border border-border flex items-center justify-center text-text-secondary">
        <Icon size={20} strokeWidth={1.8} />
      </div>
      <Body className="font-bold text-text-primary mb-4">{title}</Body>
      <Small className="text-text-secondary">{desc}</Small>
    </div>
  )
}

const FileTextIcon = (props: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
)
