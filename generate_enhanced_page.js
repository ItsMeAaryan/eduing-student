const fs = require('fs');

const code = `
'use client'

import React, { useEffect, useState, useMemo } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { onSnapshot, doc, collection, query, where, or } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MapPin, Star, Award, ChevronLeft, Clock, CheckCircle2, 
  Building2, Users, IndianRupee, BookOpen, Share, Bookmark,
  TrendingUp, Video, Check, Sparkles, GraduationCap, Globe, Lightbulb
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useStudentData } from '@/components/providers/StudentDataProvider'
import { submitApplication } from '@/lib/firebase/applications'
import { calculateAdmissionProbability } from '@/lib/utils/probabilityEngine'
import { recommendUniversities } from '@/lib/utils/recommendationEngine'

// Typography
const D1 = ({ children, className = '' }: any) => <h1 className={\`text-[48px] md:text-[64px] font-bold leading-[1.0] tracking-[-2.125px] \${className}\`}>{children}</h1>
const H1 = ({ children, className = '' }: any) => <h2 className={\`text-[32px] md:text-[40px] font-bold leading-[1.1] tracking-[-1px] \${className}\`}>{children}</h2>
const H2 = ({ children, className = '' }: any) => <h3 className={\`text-[24px] md:text-[26px] font-bold leading-[1.23] tracking-[-0.625px] \${className}\`}>{children}</h3>
const H3 = ({ children, className = '' }: any) => <h4 className={\`text-[20px] md:text-[22px] font-bold leading-[1.27] tracking-[-0.25px] \${className}\`}>{children}</h4>
const Title = ({ children, className = '' }: any) => <div className={\`text-[18px] md:text-[20px] font-semibold leading-[1.4] tracking-[-0.125px] \${className}\`}>{children}</div>
const BodyMd = ({ children, className = '' }: any) => <p className={\`text-[16px] font-normal leading-[1.5] \${className}\`}>{children}</p>
const BodySm = ({ children, className = '' }: any) => <p className={\`text-[15px] font-normal leading-[1.33] \${className}\`}>{children}</p>
const Eyebrow = ({ children, className = '' }: any) => <span className={\`text-[12px] font-semibold leading-[1.33] tracking-[0.125px] uppercase \${className}\`}>{children}</span>

// Buttons
const PrimaryButton = ({ children, className = '', ...props }: any) => (
  <button className={\`bg-[#0075de] hover:bg-[#005bab] text-white text-[16px] font-medium leading-[1.5] px-[24px] py-[12px] rounded-[9999px] transition-transform active:scale-[0.98] shadow-sm flex items-center justify-center gap-[8px] \${className}\`} {...props}>
    {children}
  </button>
)

const UtilityButton = ({ children, className = '', ...props }: any) => (
  <button className={\`bg-[#ffffff] text-[#000000] border border-[#e6e6e6] text-[16px] font-medium leading-[1.5] px-[14px] py-[8px] rounded-[8px] transition-colors hover:bg-[#f6f5f4] flex items-center justify-center gap-[8px] \${className}\`} {...props}>
    {children}
  </button>
)

const NotionCard = ({ children, className = '', elevated = false }: any) => (
  <div className={\`bg-[#ffffff] border border-[#e6e6e6] rounded-[12px] \${elevated ? 'shadow-[0_4px_18px_rgba(0,0,0,0.04)]' : 'shadow-none'} \${className}\`}>
    {children}
  </div>
)

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
    if (!user.isVerified) return
    setApplying(true)
    try {
      await submitApplication(user.uid, id, university.name, program.name)
      setSelectedProgram(null)
    } catch (err) {}
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
    <div className="min-h-screen bg-[#f6f5f4] flex items-center justify-center">
      <div className="w-[48px] h-[48px] border-4 border-[#0075de] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!university) return (
    <div className="min-h-screen bg-[#f6f5f4] flex flex-col items-center justify-center text-[#000000]">
      <H2 className="mb-16">University not found</H2>
      <UtilityButton onClick={() => router.back()}>
        <ChevronLeft size={16} strokeWidth={1.8} /> Go Back
      </UtilityButton>
    </div>
  )

  const overallProb = probData?.overallProbability || 0
  const aiMatch = recData?.overallMatchScore || 75
  const scholarshipMatch = Math.min(100, Math.floor(overallProb * 1.1))

  return (
    <ProtectedRoute allowedRoles={['student']}>
      <div className="min-h-screen bg-[#f6f5f4] text-[#000000] selection:bg-[#0075de]/30 pb-[120px] font-sans">
        
        {/* NARRATIVE ACT 1: DISCOVERY & IMMERSION */}
        <section className="relative w-full bg-[#213183] pt-[100px] pb-[160px] md:pb-[240px] px-[24px] md:px-[64px] overflow-hidden">
          <div className="absolute top-1/4 right-[10%] w-[120px] h-[120px] bg-[#62aef0] rounded-full blur-[80px] opacity-40"></div>
          <div className="absolute bottom-1/4 left-[15%] w-[160px] h-[160px] bg-[#d6b6f6] rounded-full blur-[100px] opacity-30"></div>
          
          <button onClick={() => router.back()} className="absolute top-[32px] left-[24px] md:left-[64px] w-[48px] h-[48px] rounded-full flex items-center justify-center text-white/70 hover:text-white transition-colors z-20 hover:bg-white/10">
            <ChevronLeft size={24} strokeWidth={2} />
          </button>

          <div className="max-w-[1300px] mx-auto w-full relative z-10 flex flex-col items-start mt-[40px]">
            <div className="flex flex-wrap items-center gap-[12px] mb-[32px]">
              {university.isVerified && (
                <div className="bg-[#ffffff] px-[12px] py-[4px] rounded-[9999px] flex items-center gap-[6px]">
                  <CheckCircle2 size={14} className="text-[#1aae39]" strokeWidth={2} />
                  <Eyebrow className="text-[#0075de]">Verified Partner</Eyebrow>
                </div>
              )}
              <div className="bg-white/10 backdrop-blur-md px-[12px] py-[4px] rounded-[9999px] flex items-center gap-[6px] text-white">
                <Star size={14} strokeWidth={2} className="text-[#dd5b00] fill-[#dd5b00]" />
                <Eyebrow>{university.rating || '4.5'} Rating</Eyebrow>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-[12px] py-[4px] rounded-[9999px] text-white">
                <Eyebrow>NAAC {university.naacGrade || 'A++'}</Eyebrow>
              </div>
            </div>
            
            <D1 className="text-[#ffffff] max-w-[800px] mb-[24px]">
              {university.name}
            </D1>
            
            <div className="flex items-center gap-[12px] text-[18px] text-[#a39e98] mb-[48px]">
              <MapPin size={24} strokeWidth={2} className="text-[#62aef0]" /> {university.location}
            </div>

            <div className="flex items-center gap-[16px]">
              <button className="w-[48px] h-[48px] rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                <Share size={20} strokeWidth={1.8} />
              </button>
              <button className="w-[48px] h-[48px] rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors text-white">
                <Bookmark size={20} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </section>

        {/* NARRATIVE ACT 2: UNDERSTANDING (Main Content) */}
        <div className="max-w-[1300px] mx-auto px-[24px] md:px-[64px] flex flex-col lg:flex-row gap-[64px] -mt-[80px] relative z-20">
          
          <div className="flex-1 flex flex-col gap-[80px]">
            
            <div className="w-full h-[320px] md:h-[400px] rounded-[16px] overflow-hidden relative shadow-[0_4px_18px_rgba(0,0,0,0.08)] border border-[#e6e6e6]">
              <Image src={university.imageUrl || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop'} fill priority className="object-cover" alt={university.name} />
            </div>
            
            {/* AI COUNSELOR ANALYSIS */}
            <section className="scroll-mt-[100px]">
              <div className="flex items-center gap-[12px] mb-[40px]">
                <div className="w-[40px] h-[40px] rounded-[12px] bg-[#d6b6f6] text-white flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <H1>AI Admission Analysis</H1>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                <NotionCard className="p-[32px] md:p-[48px] bg-[#ffffff] border-[#e6e6e6]">
                  <Eyebrow className="text-[#615d59] mb-[8px]">Overall Recommendation</Eyebrow>
                  <H2 className="mb-[24px]">Strong Candidate</H2>
                  <BodyMd className="text-[#31302e] mb-[32px]">
                    {probData?.improvementSuggestions[0] || "Based on your academic history and extracurriculars, you align well with this university's core requirements. Your profile shows high promise for early admission."}
                  </BodyMd>
                  <div className="flex flex-col gap-[16px]">
                    <div className="flex justify-between items-center py-[12px] border-t border-[#e6e6e6]">
                      <BodySm className="text-[#31302e] font-medium">Admission Confidence</BodySm>
                      <span className="text-[16px] font-bold text-[#1aae39]">{overallProb}%</span>
                    </div>
                    <div className="flex justify-between items-center py-[12px] border-t border-[#e6e6e6]">
                      <BodySm className="text-[#31302e] font-medium">Academic Fit</BodySm>
                      <span className="text-[16px] font-bold text-[#0075de]">{aiMatch}%</span>
                    </div>
                    <div className="flex justify-between items-center py-[12px] border-t border-[#e6e6e6]">
                      <BodySm className="text-[#31302e] font-medium">Scholarship Potential</BodySm>
                      <span className="text-[16px] font-bold text-[#d6b6f6]">{scholarshipMatch}%</span>
                    </div>
                  </div>
                </NotionCard>

                <div className="flex flex-col gap-[24px]">
                  <NotionCard className="p-[32px] flex-1">
                    <Eyebrow className="text-[#615d59] mb-[16px]">Profile Strengths</Eyebrow>
                    <ul className="flex flex-col gap-[16px]">
                      {(probData?.strengths || ['Consistent academic performance', 'Strong alignment with chosen field']).map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-[12px]">
                          <div className="w-[20px] h-[20px] rounded-[4px] bg-[#1aae39]/10 text-[#1aae39] flex items-center justify-center shrink-0 mt-[2px]">
                            <Check size={14} strokeWidth={3} />
                          </div>
                          <BodySm className="text-[#31302e]">{s}</BodySm>
                        </li>
                      ))}
                    </ul>
                  </NotionCard>
                  
                  <NotionCard className="p-[32px] flex-1">
                    <Eyebrow className="text-[#615d59] mb-[16px]">Improvement Roadmap</Eyebrow>
                    <ul className="flex flex-col gap-[16px]">
                      {(probData?.weaknesses.length ? probData.weaknesses : ['Prepare thoroughly for the entrance exam', 'Submit a strong statement of purpose']).map((s: string, i: number) => (
                        <li key={i} className="flex items-start gap-[12px]">
                          <div className="w-[20px] h-[20px] rounded-[4px] bg-[#dd5b00]/10 text-[#dd5b00] flex items-center justify-center shrink-0 mt-[2px]">
                            <Lightbulb size={14} strokeWidth={3} />
                          </div>
                          <BodySm className="text-[#31302e]">{s}</BodySm>
                        </li>
                      ))}
                    </ul>
                  </NotionCard>
                </div>
              </div>
            </section>

            {/* QUICK FACTS REIMAGINED */}
            <section>
              <H1 className="mb-[40px]">At a Glance</H1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
                <NotionCard className="p-[32px] flex flex-col justify-between">
                  <div>
                    <div className="w-[48px] h-[48px] rounded-[12px] bg-[#ff64c8] text-white flex items-center justify-center mb-[24px]">
                      <IndianRupee size={24} />
                    </div>
                    <H3 className="mb-[8px]">₹{university.startingFees || '4.5L'}</H3>
                    <Eyebrow className="text-[#615d59]">Starting Fees</Eyebrow>
                  </div>
                </NotionCard>
                <NotionCard className="p-[32px] flex flex-col justify-between">
                  <div>
                    <div className="w-[48px] h-[48px] rounded-[12px] bg-[#2a9d99] text-white flex items-center justify-center mb-[24px]">
                      <TrendingUp size={24} />
                    </div>
                    <H3 className="mb-[8px]">94%</H3>
                    <Eyebrow className="text-[#615d59]">Placement Rate</Eyebrow>
                  </div>
                </NotionCard>
                <NotionCard className="p-[32px] flex flex-col justify-between">
                  <div>
                    <div className="w-[48px] h-[48px] rounded-[12px] bg-[#dd5b00] text-white flex items-center justify-center mb-[24px]">
                      <Building2 size={24} />
                    </div>
                    <H3 className="mb-[8px]">120 Acres</H3>
                    <Eyebrow className="text-[#615d59]">Campus Size</Eyebrow>
                  </div>
                </NotionCard>
              </div>
            </section>

            {/* PROGRAMS AS PREMIUM PRODUCTS */}
            <section id="programs-section" className="scroll-mt-[100px]">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-[40px] gap-[16px]">
                <H1>Programs & Degrees</H1>
                <div className="bg-[#ffffff] border border-[#e6e6e6] px-[16px] py-[8px] rounded-[9999px]">
                  <Eyebrow className="text-[#31302e]">{programs.length} Specializations</Eyebrow>
                </div>
              </div>
              
              <div className="flex flex-col gap-[16px]">
                {programs.length === 0 ? (
                  <NotionCard className="p-[64px] text-center">
                    <BookOpen size={48} className="mx-auto text-[#a39e98] mb-[24px]" />
                    <Title className="mb-[8px]">No programs listed</Title>
                    <BodyMd className="text-[#615d59]">Programs will be added soon.</BodyMd>
                  </NotionCard>
                ) : (
                  programs.map((prog, i) => (
                    <NotionCard key={prog.id || i} elevated={false} className="p-[32px] hover:border-[#0075de] transition-all cursor-pointer group" onClick={() => setSelectedProgram(prog)}>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-[24px]">
                        <div className="flex-1">
                          <div className="flex items-center gap-[12px] mb-[12px]">
                            <Eyebrow className="text-[#0075de] bg-[#0075de]/10 px-[12px] py-[4px] rounded-[9999px]">{prog.level}</Eyebrow>
                            {prog.popular && <Eyebrow className="text-[#dd5b00] bg-[#dd5b00]/10 px-[12px] py-[4px] rounded-[9999px]">Highly Competitive</Eyebrow>}
                          </div>
                          <H3 className="mb-[16px] text-[#000000] group-hover:text-[#0075de] transition-colors">{prog.name}</H3>
                          
                          <div className="flex flex-wrap items-center gap-[32px]">
                            <div className="flex flex-col gap-[4px]">
                              <Eyebrow className="text-[#a39e98]">Duration</Eyebrow>
                              <BodySm className="text-[#31302e] font-medium">{prog.duration}</BodySm>
                            </div>
                            <div className="flex flex-col gap-[4px]">
                              <Eyebrow className="text-[#a39e98]">Seats</Eyebrow>
                              <BodySm className="text-[#31302e] font-medium">{prog.totalSeats || 'TBD'}</BodySm>
                            </div>
                            <div className="flex flex-col gap-[4px]">
                              <Eyebrow className="text-[#a39e98]">Annual Fees</Eyebrow>
                              <BodySm className="text-[#1aae39] font-bold">₹{(prog.annualFee || prog.fee || 0).toLocaleString()}</BodySm>
                            </div>
                          </div>
                        </div>
                        <div className="shrink-0 flex md:flex-col items-center justify-end gap-[16px]">
                          <UtilityButton onClick={(e: any) => { e.stopPropagation(); setSelectedProgram(prog); }}>
                            View Details
                          </UtilityButton>
                        </div>
                      </div>
                    </NotionCard>
                  ))
                )}
              </div>
            </section>

            {/* STUDENT LIFE - EMOTIONAL CONNECTION */}
            <section>
              <H1 className="mb-[40px]">Student Life</H1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] mb-[24px]">
                <div className="h-[320px] rounded-[16px] overflow-hidden relative border border-[#e6e6e6]">
                  <Image src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" fill className="object-cover" alt="Campus Life" />
                </div>
                <div className="h-[320px] rounded-[16px] overflow-hidden relative border border-[#e6e6e6] bg-[#213183] flex items-center justify-center group cursor-pointer">
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10"></div>
                  <div className="w-[64px] h-[64px] bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white z-20">
                    <Video size={24} className="ml-1" />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-[12px]">
                {['Smart Classrooms', 'Innovation Labs', 'Sports Complex', '24/7 Library', 'Auditorium', 'Cafeterias', 'Global Exchange'].map((f, i) => (
                  <div key={i} className="px-[16px] py-[8px] bg-[#ffffff] border border-[#e6e6e6] rounded-[9999px] text-[14px] text-[#31302e] font-medium flex items-center gap-[8px]">
                    <Check size={16} className="text-[#0075de]" /> {f}
                  </div>
                ))}
              </div>
            </section>

            {/* PLACEMENTS AS A STORY */}
            <section>
              <H1 className="mb-[40px]">Career Outcomes</H1>
              <NotionCard className="p-[48px] md:p-[64px] bg-[#ffffff] border-[#e6e6e6]">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-[64px]">
                  <div className="flex flex-col gap-[32px]">
                    <div>
                      <Eyebrow className="text-[#615d59] mb-[8px]">Highest Package</Eyebrow>
                      <D1 className="text-[#1aae39]">₹52<span className="text-[32px] tracking-normal text-[#615d59]"> LPA</span></D1>
                    </div>
                    <div>
                      <Eyebrow className="text-[#615d59] mb-[8px]">Median Package</Eyebrow>
                      <D1 className="text-[#000000]">₹8.5<span className="text-[32px] tracking-normal text-[#615d59]"> LPA</span></D1>
                    </div>
                  </div>
                  <div>
                    <Eyebrow className="text-[#615d59] mb-[24px]">Top Recruiters</Eyebrow>
                    <div className="flex flex-wrap gap-[16px]">
                      {['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Deloitte', 'Cognizant', 'Wipro'].map((company, i) => (
                        <div key={i} className="px-[24px] py-[16px] border border-[#e6e6e6] rounded-[8px] bg-[#f6f5f4] text-[16px] font-semibold text-[#31302e]">
                          {company}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </NotionCard>
            </section>

            {/* ADMISSION JOURNEY TIMELINE */}
            <section>
              <H1 className="mb-[40px]">Admission Journey</H1>
              <div className="relative border-l border-[#e6e6e6] ml-[24px] flex flex-col gap-[48px] py-[24px]">
                <JourneyStep title="Explore & Eligibility" desc="Review required scores, background, and fit." icon={CheckCircle2} color="#62aef0" />
                <JourneyStep title="Application & Documents" desc="Submit transcripts, IDs, and certificates securely." icon={BookOpen} color="#d6b6f6" />
                <JourneyStep title="Entrance Exam / Interview" desc="Clear the university specific or national entrance test." icon={GraduationCap} color="#ff64c8" />
                <JourneyStep title="Profile Review" desc="The admission committee reviews your comprehensive profile." icon={Clock} color="#dd5b00" />
                <JourneyStep title="Offer & Enrollment" desc="Receive your offer letter and secure your seat." icon={Award} color="#1aae39" />
              </div>
            </section>
          </div>

          {/* ACTION CENTER - DECISION PANEL */}
          <aside className="hidden lg:block w-[360px] shrink-0">
            <div className="sticky top-[100px] flex flex-col gap-[24px]">
              
              <NotionCard className="p-[32px] flex flex-col shadow-[0_4px_18px_rgba(0,0,0,0.04)]">
                <H2 className="mb-[24px]">Application Decision</H2>
                
                <div className="flex flex-col gap-[16px] mb-[40px]">
                  <div className="flex justify-between items-center py-[12px] border-b border-[#e6e6e6]">
                    <BodySm className="text-[#615d59]">Eligibility</BodySm>
                    <div className="flex items-center gap-[8px]">
                      <div className="w-[8px] h-[8px] rounded-full bg-[#1aae39]"></div>
                      <BodySm className="font-bold text-[#000000]">Qualified</BodySm>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-[12px] border-b border-[#e6e6e6]">
                    <BodySm className="text-[#615d59]">Admission Chance</BodySm>
                    <div className="flex items-center gap-[8px]">
                      <div className="w-[8px] h-[8px] rounded-full bg-[#1aae39]"></div>
                      <BodySm className="font-bold text-[#000000]">{overallProb}%</BodySm>
                    </div>
                  </div>
                  <div className="flex justify-between items-center py-[12px]">
                    <BodySm className="text-[#615d59]">Deadline</BodySm>
                    <BodySm className="font-bold text-[#000000]">Rolling</BodySm>
                  </div>
                </div>

                <div className="flex flex-col gap-[16px]">
                  <PrimaryButton onClick={() => document.getElementById('programs-section')?.scrollIntoView({ behavior: 'smooth' })} className="w-full">
                    Explore Programs
                  </PrimaryButton>
                  <UtilityButton className="w-full">
                    Save University
                  </UtilityButton>
                </div>
              </NotionCard>

            </div>
          </aside>

        </div>

        {/* PROGRAM DETAILS MODAL */}
        <AnimatePresence>
          {selectedProgram && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-[#000000]/40 backdrop-blur-sm flex items-center justify-center p-[24px]">
              <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-[#ffffff] border border-[#e6e6e6] rounded-[16px] p-[48px] max-w-[600px] w-full relative shadow-[0_23px_52px_rgba(0,0,0,0.05)]">
                <button onClick={() => setSelectedProgram(null)} className="absolute top-[24px] right-[24px] w-[40px] h-[40px] rounded-full flex items-center justify-center text-[#615d59] hover:bg-[#f6f5f4] transition-colors">
                  <span className="text-[20px]">✕</span>
                </button>
                
                <Eyebrow className="text-[#0075de] mb-[12px]">{selectedProgram.level}</Eyebrow>
                <H2 className="mb-[8px] pr-[32px]">{selectedProgram.name}</H2>
                <BodyMd className="text-[#615d59] mb-[40px]">{university.name}</BodyMd>
                
                <div className="grid grid-cols-2 gap-[16px] mb-[32px]">
                   <div className="p-[24px] bg-[#f6f5f4] rounded-[12px]">
                      <Eyebrow className="text-[#615d59] mb-[8px]">Duration</Eyebrow>
                      <Title>{selectedProgram.duration}</Title>
                   </div>
                   <div className="p-[24px] bg-[#f6f5f4] rounded-[12px]">
                      <Eyebrow className="text-[#615d59] mb-[8px]">Annual Fee</Eyebrow>
                      <Title className="text-[#1aae39]">₹{(selectedProgram.annualFee || selectedProgram.fee || 0).toLocaleString()}</Title>
                   </div>
                </div>
                
                <div className="p-[24px] border border-[#e6e6e6] rounded-[12px] mb-[48px]">
                   <Eyebrow className="text-[#615d59] mb-[12px]">Eligibility</Eyebrow>
                   <BodySm className="text-[#31302e]">
                     {selectedProgram.eligibility || 'Candidates must have completed their previous qualifying examination with the required minimum percentage as per institutional guidelines.'}
                   </BodySm>
                </div>
                
                <PrimaryButton 
                  disabled={applying}
                  onClick={() => handleApply(selectedProgram)}
                  className="w-full"
                >
                  {applying ? 'Processing...' : (user?.isVerified ? 'Confirm & Apply' : 'Verify Profile to Apply')}
                </PrimaryButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </ProtectedRoute>
  )
}

function JourneyStep({ title, desc, icon: Icon, color }: any) {
  return (
    <div className="relative pl-[48px]">
      <div className="absolute left-[-20px] top-0 w-[40px] h-[40px] rounded-full flex items-center justify-center text-white" style={{ backgroundColor: color }}>
        <Icon size={20} strokeWidth={2} />
      </div>
      <Title className="mb-[4px] text-[#000000]">{title}</Title>
      <BodySm className="text-[#615d59]">{desc}</BodySm>
    </div>
  )
}
`

fs.writeFileSync('app/student/universities/[id]/page.tsx', code);
console.log('Successfully generated flagship page.tsx');
